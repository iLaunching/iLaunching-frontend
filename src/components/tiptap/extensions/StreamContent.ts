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
          
          console.log('📝 Inserting chunk:', chunk, 'parseAsHTML:', parseAsHTML);
          
          // Mark as streaming
          if (!state.isStreaming) {
            state.isStreaming = true;
          }
          
          // Add to buffer
          state.buffer.push(chunk);
          
          // Move cursor to end before inserting
          const { doc } = editor.state;
          const endPos = doc.content.size;
          editor.commands.setTextSelection(endPos);
          
          // For HTML content, accumulate until we can parse safely
          if (parseAsHTML && (chunk.includes('<') || chunk.includes('>'))) {
            // Try to insert as HTML, but wrap in a temporary container
            // to handle partial tags gracefully
            try {
              commands.insertContent(chunk, { 
                parseOptions: { preserveWhitespace: 'full' } 
              });
            } catch (error) {
              // If HTML parsing fails, insert as text
              console.warn('Failed to parse HTML chunk, inserting as text:', chunk);
              commands.insertContent({ type: 'text', text: chunk });
            }
          } else {
            // Plain text - insert directly
            commands.insertContent(chunk);
          }
          
          console.log('✅ Chunk inserted successfully');
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
