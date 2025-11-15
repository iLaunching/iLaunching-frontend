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
       * Insert a pre-processed chunk from API
       * Chunks arrive already sanitized and ready to insert
       */
      insertStreamChunk: (chunk: string, parseAsHTML?: boolean) => ReturnType;
      
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
       * Insert a chunk from the API
       * The API has already processed and sanitized the content
       */
      insertStreamChunk: (chunk: string, parseAsHTML: boolean = true) => ({ editor, commands }) => {
        try {
          const state = this.storage as StreamState;
          
          // Mark as streaming
          if (!state.isStreaming) {
            state.isStreaming = true;
          }
          
          // Add to buffer
          state.buffer.push(chunk);
          
          // Find the AI Indicator position
          const { doc } = editor.state;
          let aiIndicatorPos = -1;
          
          doc.descendants((node, pos) => {
            if (node.type.name === 'aiIndicator') {
              aiIndicatorPos = pos;
              return false;
            }
          });
          
          // Insert before AI Indicator (it will naturally push down)
          const insertPos = aiIndicatorPos >= 0 ? aiIndicatorPos : doc.content.size;
          
          // Use insertContentAt to insert at specific position
          editor.chain()
            .insertContentAt(insertPos, chunk, {
              parseOptions: { 
                preserveWhitespace: 'full',
              },
            })
            .run();
          
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
