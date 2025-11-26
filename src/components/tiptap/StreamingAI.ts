import { Extension } from '@tiptap/core';

// Define the range type locally since it's not exported
type Range = { from: number; to: number };

// 1. Declare the new command for TypeScript to recognize it
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    streamingAI: {
      /**
       * Stream a response from an LLM into the editor with wave animations.
       * @param content The content to stream (for now, we'll simulate streaming)
       * @param rangeOrPosition The position (number) or range ({ from, to }) where content should be inserted
       */
      streamAIResponse: (
        content: string,
        rangeOrPosition?: number | Range
      ) => ReturnType;
    };
  }
}

// 2. Define the Extension
export const StreamingAI = Extension.create({
  name: 'streamingAI',

  addCommands() {
    return {
      // The custom command implementation
        streamAIResponse: (content, rangeOrPosition) =>
        ({ editor }) => {
          console.log('StreamingAI: Command called with:', {
            contentLength: content?.length || 0,
            contentPreview: content?.substring(0, 100) + '...',
            rangeOrPosition,
            hasStreamContent: false // Will be true when we implement StreamContent extension
          });
          
          // Asynchronous logic wrapped in IIFE
          (async () => {
            try {
              // Determine insertion position
              let insertPos: number;
              
              if (typeof rangeOrPosition === 'number') {
                insertPos = rangeOrPosition;
              } else if (rangeOrPosition && 'from' in rangeOrPosition) {
                insertPos = rangeOrPosition.from;
              } else {
                // Default: insert before AI indicator or at end
                insertPos = editor.state.doc.content.size;
                editor.state.doc.descendants((node, pos) => {
                  if (node.type.name === 'aiIndicator') {
                    insertPos = pos;
                    return false;
                  }
                });
              }
              
              console.log('StreamingAI: Insertion position determined:', insertPos);



              // Since streamContent is not available, use append-only approach
              console.log('StreamingAI: Using append-only progressive streaming');
              
              // Split content into words and stream them progressively
              const words = content.split(/\b/);
              let wordCount = 0;
              
              console.log('StreamingAI: Will stream', words.length, 'word tokens');
              
              for (let i = 0; i < words.length; i++) {
                const word = words[i];
                let wordToInsert = word;
                
                // Add wave animation to actual words
                if (/\w+/.test(word)) {
                  wordToInsert = `<span class="wave-word" style="animation-delay: ${wordCount * 0.08}s">${word}</span>`;
                  wordCount++;
                  console.log('StreamingAI: Streaming animated word:', word);
                }
                
                // Find current insertion position
                let currentInsertPos = editor.state.doc.content.size;
                editor.state.doc.descendants((node, pos) => {
                  if (node.type.name === 'aiIndicator') {
                    currentInsertPos = pos;
                    return false;
                  }
                });
                
                // Insert this word/token (append-only)
                const success = editor.commands.insertContentAt(currentInsertPos, wordToInsert);
                
                if (!success) {
                  console.warn('StreamingAI: insertContentAt failed, trying insertContent');
                  editor.chain().focus().insertContent(wordToInsert).run();
                }
                
                // Delay for typewriter effect
                const delay = /\w+/.test(word) ? 150 : 30;
                await new Promise(resolve => setTimeout(resolve, delay));
              }
              
              console.log('StreamingAI: Append-only streaming completed');
              
            } catch (error) {
              console.error('StreamingAI: Error during streaming:', error);
              // Fallback: insert content normally at current position
              let fallbackPos = editor.state.doc.content.size;
              editor.state.doc.descendants((node, pos) => {
                if (node.type.name === 'aiIndicator') {
                  fallbackPos = pos;
                  return false;
                }
              });
              editor.commands.insertContentAt(fallbackPos, content);
            }
          })();

          // Return true immediately as the command execution has begun
          return true;
        },
    };
  },
});