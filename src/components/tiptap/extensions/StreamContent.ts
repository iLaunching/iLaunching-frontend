import { Extension } from '@tiptap/core';

/**
 * StreamContent Extension - Simplified for API Integration
 * 
 * Phase 2.4: Refactored to work with sales-api-minimal
 * API handles: HTML sanitization, chunking, markdown conversion, speed control
 * Extension handles: Inserting pre-processed chunks into editor
 * 
 * Usage:
 * editor.commands.insertStreamChunk(chunk) - Insert a single chunk from API
 * editor.commands.clearStreamBuffer() - Clear accumulated buffer
 */

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    streamContent: {
      /**
       * Create Response node inside AITurn when stream starts
       */
      createResponseInTurn: (turnId: string) => ReturnType;
      
      /**
       * Insert a pre-processed chunk from API
       * Chunks arrive already sanitized and ready to insert
       */
      insertStreamChunk: (chunk: string, parseAsHTML?: boolean, responseId?: string) => ReturnType;
      
      /**
       * Clear the stream buffer
       */
      clearStreamBuffer: () => ReturnType;
      
      /**
       * Check if currently streaming
       */
      isStreaming: () => boolean;
    }
  }
}

// Minimal stream state
interface StreamState {
  isStreaming: boolean;
  buffer: string[];
}

export const StreamContent = Extension.create({
  name: 'streamContent',

  addStorage() {
    return {
      isStreaming: false,
      buffer: [],
    } as StreamState;
  },

  addCommands() {
    return {
      /**
       * Create Response node inside AITurn with matching turnId
       * Called when stream starts
       */
      createResponseInTurn: (turnId: string) => ({ editor, commands }) => {
        try {
          const { doc } = editor.state;
          let aiTurnPos = -1;
          let aiTurnNode = null;
          
          // Find the AITurn with matching turnId
          doc.descendants((node, pos) => {
            if (node.type.name === 'aiTurn' && node.attrs.turnId === turnId) {
              aiTurnPos = pos;
              aiTurnNode = node;
              return false; // Stop searching
            }
          });
          
          if (aiTurnPos === -1 || !aiTurnNode) {
            console.error('❌ AITurn not found with turnId:', turnId);
            return false;
          }
          
          console.log('✅ Found AITurn at position:', aiTurnPos, 'turnId:', turnId);
          console.log('📏 AITurn nodeSize:', aiTurnNode.nodeSize);
          
          // Insert Response at the end of AITurn content (after Query, before closing)
          const insertPos = aiTurnPos + aiTurnNode.nodeSize - 1;
          
          console.log('📍 Inserting Response at position:', insertPos);
          
          // Use insertContentAt to add Response node
          return commands.insertContentAt(insertPos, {
            type: 'response',
            attrs: {
              responseId: turnId, // Use turnId as responseId
              isStreaming: true,
              turnId: turnId,
              timestamp: Date.now().toString(),
            },
            content: [
              {
                type: 'paragraph',
                content: [],
              },
            ],
          });
        } catch (error) {
          console.error('❌ Error creating Response in AITurn:', error);
          return false;
        }
      },
      
      /**
       * Insert a chunk from the API
       * The API has already processed and sanitized the content
       */
      insertStreamChunk: (chunk: string, parseAsHTML: boolean = true, responseId?: string) => ({ editor }) => {
        try {
          const state = this.storage as StreamState;
          
          // Mark as streaming
          if (!state.isStreaming) {
            state.isStreaming = true;
          }
          
          // Add to buffer
          state.buffer.push(chunk);
          
          // Find the target Response node
          const { doc } = editor.state;
          let responsePos = -1;
          let responseNodeSize = 0;
          
          // If responseId provided, search for specific Response by ID
          if (responseId) {
            doc.descendants((node, pos) => {
              if (node.type.name === 'response' && node.attrs.responseId === responseId) {
                responsePos = pos;
                responseNodeSize = node.nodeSize;
                return false; // Found the target, stop search
              }
            });
          }
          
          // If no responseId or not found, fall back to searching for streaming Response
          if (responsePos === -1) {
            doc.descendants((node, pos) => {
              if (node.type.name === 'response' && node.attrs.isStreaming === true) {
                responsePos = pos;
                responseNodeSize = node.nodeSize;
                return false; // Found the target, stop search
              }
            });
          }
          
          // If still no Response found, fall back to AI Indicator position
          if (responsePos === -1) {
            doc.descendants((node, pos) => {
              if (node.type.name === 'aiIndicator') {
                responsePos = pos;
                return false;
              }
            });
          }
          
          // Calculate insert position
          // For Response nodes: append at the end of content (before closing tag)
          // For AI Indicator: insert before it
          let insertPos: number;
          
          if (responseNodeSize > 0) {
            // For Response node, append to the end of its content
            // Position should be just before the closing boundary
            insertPos = responsePos + responseNodeSize - 1;
          } else if (responsePos >= 0) {
            // AI Indicator position
            insertPos = responsePos;
          } else {
            // Fallback to end of document
            insertPos = doc.content.size;
          }
          
          console.log('🎯 Inserting chunk at position:', insertPos, 'responseId:', responseId);
          
          // Insert the content - use insertContentAt to append without replacing
          try {
            if (parseAsHTML) {
              // For HTML content, parse and append at specific position
              editor.commands.insertContentAt(insertPos, chunk, {
                parseOptions: { 
                  preserveWhitespace: 'full',
                },
              });
            } else {
              // For plain text, insert as text node
              editor.commands.insertContentAt(insertPos, { type: 'text', text: chunk });
            }
          } catch (insertError) {
            console.error('❌ Insert failed:', insertError);
            // Fallback: try with chain
            try {
              editor.chain()
                .setTextSelection(insertPos)
                .insertContent(chunk)
                .run();
            } catch (fallbackError) {
              console.error('❌ Fallback insert also failed:', fallbackError);
            }
          }
          
          return true;
        } catch (error) {
          console.error('StreamContent: Error inserting chunk:', error);
          return false;
        }
      },

      /**
       * Clear the stream buffer
       */
      clearStreamBuffer: () => () => {
        try {
          const state = this.storage as StreamState;
          state.buffer = [];
          state.isStreaming = false;
          return true;
        } catch (error) {
          console.error('StreamContent: Error clearing buffer:', error);
          return false;
        }
      },

      /**
       * Check if currently streaming
       */
      isStreaming: () => () => {
        const state = this.storage as StreamState;
        return state.isStreaming;
      },
    };
  },
});

export default StreamContent;
