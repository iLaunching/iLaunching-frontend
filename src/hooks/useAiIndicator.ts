/**
 * Hook for managing AI indicators in Tiptap editor
 * Provides functions to insert and update AI messages with indicators
 */

import { useCallback } from 'react';
import { Editor } from '@tiptap/react';

export const useAiIndicator = (editor: Editor | null) => {
  /**
   * Insert an AI message with indicator
   * @param {Object} options - Configuration for the AI indicator
   * @param {string} options.aiName - Name of the AI (e.g., "iLaunching AI", "Sales Assistant")
   * @param {string} options.aiAcknowledge - Optional acknowledgment text
   * @param {string} options.text - The AI response text (HTML supported)
   * @param {boolean} options.append - Whether to append to existing content or replace
   */
  const insertAiMessage = useCallback(
    ({ aiName = 'AI Assistant', aiAcknowledge = '', text = '', append = true }) => {
      if (!editor) return;

      const content = {
        type: 'aiIndicator',
        attrs: {
          aiName,
          aiAcknowledge,
          text,
        },
      };

      if (append) {
        // Add to the end of the document
        editor.commands.focus('end');
        editor.commands.insertContent(content);
      } else {
        // Replace all content
        editor.commands.setContent([content]);
      }
    },
    [editor]
  );

  /**
   * Insert a streaming AI message that can be updated
   * Returns an update function for streaming responses
   * @param {Object} options - Initial configuration
   * @returns {Function} Update function for streaming
   */
  const insertStreamingAiMessage = useCallback(
    ({ aiName = 'AI Assistant', aiAcknowledge = '', initialText = '' }) => {
      if (!editor) return () => {};

      // Insert initial empty AI indicator
      insertAiMessage({
        aiName,
        aiAcknowledge,
        text: initialText,
        append: true,
      });

      // Return update function for streaming
      return (newText: string) => {
        // Find the last AI indicator node and update it
        const { state } = editor;
        let lastAiNodePos = -1;

        state.doc.descendants((node, pos) => {
          if (node.type.name === 'aiIndicator') {
            lastAiNodePos = pos;
          }
        });

        if (lastAiNodePos >= 0) {
          editor
            .chain()
            .focus()
            .command(({ tr }) => {
              tr.setNodeMarkup(lastAiNodePos, null, {
                aiName,
                aiAcknowledge,
                text: newText,
              });
              return true;
            })
            .run();
        }
      };
    },
    [editor, insertAiMessage]
  );

  /**
   * Insert a sales AI message with branded styling
   * @param {string} text - The sales message
   * @param {string} userName - User's name for personalization
   */
  const insertSalesMessage = useCallback(
    (text: string, userName: string = '') => {
      const acknowledge = userName ? `Speaking with ${userName}` : 'Sales Consultation';
      
      insertAiMessage({
        aiName: 'iLaunching AI',
        aiAcknowledge: acknowledge,
        text,
        append: true,
      });
    },
    [insertAiMessage]
  );

  /**
   * Clear all content in the editor
   */
  const clearContent = useCallback(() => {
    if (!editor) return;
    editor.commands.clearContent();
  }, [editor]);

  /**
   * Check if editor has any AI indicators
   */
  const hasAiIndicators = useCallback(() => {
    if (!editor) return false;
    
    let hasAi = false;
    editor.state.doc.descendants((node) => {
      if (node.type.name === 'aiIndicator') {
        hasAi = true;
        return false; // Stop iteration
      }
    });
    
    return hasAi;
  }, [editor]);

  return {
    insertAiMessage,
    insertStreamingAiMessage,
    insertSalesMessage,
    clearContent,
    hasAiIndicators,
  };
};

export default useAiIndicator;