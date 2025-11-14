import { Extension } from '@tiptap/core';

/**
 * StreamContent Extension - Simplified for API Integration
 * 
 * Receives pre-processed chunks from sales-api-minimal.
 * API handles: HTML sanitization, chunking, markdown conversion
 * Extension handles: Inserting chunks into editor
 */

// Extension options interface
export interface StreamContentOptions {
  delay: number; // Delay between chunks (ms) - now optional, API controls timing
}

// Stream state interface
interface StreamState {
  isStreaming: boolean;
  buffer: string[];
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    streamContent: {
      /**
       * Start streaming content word-by-word or character-by-character
       * @param content - The content to stream
       * @param options - Streaming options (speed, delay, mode)
       */
      startStream: (content: string, options?: Partial<StreamContentOptions>) => ReturnType;
      
      /**
       * Write content to the stream buffer
       * @param content - Content to add to stream
       */
      writeToStream: (content: string) => ReturnType;
      
      /**
       * Finish the current stream and flush remaining content
       */
      finishStream: () => ReturnType;
      
      /**
       * Pause the current stream
       */
      pauseStream: () => ReturnType;
      
      /**
       * Resume a paused stream
       */
      resumeStream: () => ReturnType;
      
      /**
       * Stop and clear the current stream
       */
      stopStream: () => ReturnType;
      
      /**
       * Get current stream state (for debugging)
       */
      getStreamState: () => ReturnType;
      
      /**
       * Check if currently streaming
       */
      isStreaming: () => ReturnType;
    };
  }
}

export const StreamContent = Extension.create<StreamContentOptions>({
  name: 'streamContent',

  // Default options
  addOptions() {
    return {
      speed: 10, // 10 words per second
      delay: 100, // 100ms between chunks
      mode: 'word' as const, // Stream word-by-word by default
      chunkSize: 1, // Stream 1 word at a time by default
    };
  },

  // Extension storage for stream state
  addStorage() {
    return {
      isStreaming: false,
      currentPosition: 0,
      buffer: '',
      chunks: [],
      intervalId: undefined,
    } as StreamState;
  },

  // Add streaming commands
  addCommands() {
    return {
      // Start streaming content
      startStream: (content: string, options?: Partial<StreamContentOptions>) => ({ editor, commands }) => {
        try {
          console.log('StreamContent: startStream called', { content, options });
          
          const state = this.storage as StreamState;
          
          // Validation
          if (!content || content.trim().length === 0) {
            console.error('StreamContent: Cannot stream empty content');
            return false;
          }
          
          if (!editor.isEditable) {
            console.error('StreamContent: Editor is not editable');
            return false;
          }
          
          // Stop any existing stream
          if (state.isStreaming) {
            console.warn('StreamContent: Stopping existing stream before starting new one');
            commands.stopStream();
          }
          
          // Phase 2.3: Sanitize HTML content for safe streaming
          const sanitizedContent = sanitizeHTMLForStreaming(content);
          
          // Phase 2.3: Validate HTML structure
          const unclosedTags = validateHTMLStructure(sanitizedContent);
          if (unclosedTags.length > 0) {
            console.warn('StreamContent: HTML has unclosed tags:', unclosedTags);
            // Continue anyway, but log warning
          }
          
          // Phase 2.3: Analyze content and get recommended strategy
          const strategy = getStreamingStrategy(sanitizedContent);
          console.log('StreamContent: Streaming strategy', strategy);
          
          // Initialize stream
          state.buffer = sanitizedContent;
          state.currentPosition = 0;
          state.isStreaming = true;
          state.hasHTML = strategy.hasHTML; // Store for use in interval callback
          
          const delay = options?.delay || this.options.delay;
          const mode = options?.mode || (strategy.hasHTML ? 'word' : this.options.mode);
          const chunkSize = options?.chunkSize || this.options.chunkSize;
          
          // Phase 2.3: Split content into chunks using HTML-aware parsing
          if (mode === 'word') {
            // Use HTML-aware word splitting
            state.chunks = splitHTMLIntoWords(sanitizedContent);
          } else {
            // Use HTML-aware character splitting  
            state.chunks = splitHTMLIntoCharacters(sanitizedContent);
          }
          
          console.log(`StreamContent: Streaming ${state.chunks.length} ${mode}s at ${delay}ms delay, ${chunkSize} per chunk`);
          console.log(`StreamContent: HTML detected: ${strategy.hasHTML}, Complexity: ${strategy.complexity}`);
          
          // Start streaming interval
          state.intervalId = window.setInterval(() => {
            try {
              if (state.currentPosition < state.chunks.length) {
                // Get next chunk(s) based on chunkSize
                const endPosition = Math.min(state.currentPosition + chunkSize, state.chunks.length);
                const chunksToInsert = state.chunks.slice(state.currentPosition, endPosition);
                const textToInsert = chunksToInsert.join('');
                
                // Insert chunk(s) at cursor position
                // If content contains HTML tags, parse it; otherwise insert as plain text
                if (state.hasHTML && (textToInsert.includes('<') || textToInsert.includes('>'))) {
                  editor.commands.insertContent(textToInsert, { parseOptions: { preserveWhitespace: 'full' } });
                } else {
                  editor.commands.insertContent(textToInsert);
                }
                
                state.currentPosition = endPosition;
              } else {
                // Stream complete
                commands.finishStream();
              }
            } catch (error) {
              console.error('StreamContent: Error during streaming:', error);
              commands.stopStream();
            }
          }, delay);
          
          return true;
        } catch (error) {
          console.error('StreamContent: Error starting stream:', error);
          return false;
        }
      },

      // Write content to stream buffer
      writeToStream: (content: string) => () => {
        console.log('StreamContent: writeToStream called', { content });
        
        const state = this.storage as StreamState;
        state.buffer += content;
        
        return true;
      },

      // Finish stream
      finishStream: () => () => {
        console.log('StreamContent: finishStream called');
        
        const state = this.storage as StreamState;
        
        if (state.intervalId) {
          clearInterval(state.intervalId);
          state.intervalId = undefined;
        }
        
        state.isStreaming = false;
        state.currentPosition = 0;
        state.buffer = '';
        state.chunks = [];
        
        return true;
      },

      // Pause stream
      pauseStream: () => () => {
        console.log('StreamContent: pauseStream called');
        
        const state = this.storage as StreamState;
        
        if (state.intervalId) {
          clearInterval(state.intervalId);
          state.intervalId = undefined;
        }
        
        return true;
      },

      // Resume stream
      resumeStream: () => ({ editor }) => {
        console.log('StreamContent: resumeStream called');
        
        const state = this.storage as StreamState;
        
        if (!state.isStreaming || state.intervalId) {
          return false;
        }
        
        const delay = this.options.delay;
        
        // Resume streaming interval
        state.intervalId = window.setInterval(() => {
          if (state.currentPosition < state.chunks.length) {
            const chunk = state.chunks[state.currentPosition];
            editor.commands.insertContent(chunk);
            state.currentPosition++;
          } else {
            editor.commands.finishStream();
          }
        }, delay);
        
        return true;
      },

      // Stop stream
      stopStream: () => ({ commands }) => {
        console.log('StreamContent: stopStream called');
        commands.finishStream();
        return true;
      },
      
      // Get current stream state (debugging)
      getStreamState: () => () => {
        const state = this.storage as StreamState;
        const stateInfo = {
          isStreaming: state.isStreaming,
          currentPosition: state.currentPosition,
          totalChunks: state.chunks.length,
          bufferLength: state.buffer.length,
          progress: state.chunks.length > 0 
            ? Math.round((state.currentPosition / state.chunks.length) * 100) 
            : 0,
        };
        console.log('StreamContent: Current state', stateInfo);
        return true;
      },
      
      // Check if currently streaming
      isStreaming: () => () => {
        const state = this.storage as StreamState;
        console.log('StreamContent: isStreaming =', state.isStreaming);
        return state.isStreaming;
      },
    };
  },
});

export default StreamContent;
