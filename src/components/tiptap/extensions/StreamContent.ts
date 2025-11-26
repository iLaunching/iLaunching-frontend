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
      isStreaming: () => ReturnType;
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
      insertStreamChunk: (chunk: string, parseAsHTML: boolean = true, responseId?: string) => ({ commands, state }) => {
        try {
          const { doc } = state;
          
          // Find Response node by responseId or fall back to AI Indicator
          let responsePos = -1;
          let responseNodeSize = 0;
          
          if (responseId) {
            // First priority: Find Response node with matching responseId
            doc.descendants((node, pos) => {
              if (node.type.name === 'response' && node.attrs.responseId === responseId) {
                responsePos = pos;
                responseNodeSize = node.nodeSize;
                return false;
              }
            });
          }
          
          // Fallback: Find AI Indicator if Response not found
          if (responsePos < 0) {
            doc.descendants((node, pos) => {
              if (node.type.name === 'aiIndicator') {
                responsePos = pos;
                return false;
              }
            });
          }
          
          // If we still haven't found a position, use end of document
          if (responsePos < 0) {
            console.warn('⚠️ No Response or AI Indicator found, appending to end');
            responsePos = doc.content.size - 1;
          }
          
          // Calculate insert position
          // IMPORTANT: Get fresh position each time by searching the document
          let insertPos: number;
          
          if (responseNodeSize > 0) {
            // For Response node, we need to find the LAST paragraph position inside it
            // and insert AFTER it, or if empty, insert at the start of content
            const responseNode = doc.nodeAt(responsePos);
            if (responseNode && responseNode.content.size > 0) {
              // Insert after last child (before closing tag)
              insertPos = responsePos + responseNodeSize - 1;
            } else {
              // Empty response, insert at content start (after opening tag)
              insertPos = responsePos + 1;
            }
          } else {
            // AI Indicator or fallback position
            insertPos = responsePos;
          }
          
          console.log('🎯 Inserting chunk at position:', insertPos, 'responseId:', responseId);
          
          // Use a transaction to ensure atomic operation
          return commands.insertContentAt(insertPos, chunk, {
            updateSelection: false, // Don't move cursor
            parseOptions: { 
              preserveWhitespace: 'full',
            },
          });
        } catch (error) {
          console.error('StreamContent: Error inserting chunk:', error);
          return false;
        }
      },

      /**
       * Clear the stream buffer
       */
      clearStreamBuffer: () => () => {
        return true;
      },

      /**
       * Check if currently streaming
       */
      isStreaming: () => () => {
        return true;
      },
    };
  },
});

export default StreamContent;
