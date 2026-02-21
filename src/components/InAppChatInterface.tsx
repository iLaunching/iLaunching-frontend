import { useState, useCallback, useEffect, useRef } from 'react';
import { useStreaming } from '../hooks/useStreaming.websocket';
import { InAppEditor } from './streaming/InAppEditor';
import InAppChatWindowPrompt from './InAppChatWindowPrompt';
import SignupPopup from './SignupPopup';
import { getRandomSubmitAcknowledgeMessage } from '../constants';
import { SYSTEM_MESSAGE_TYPES, type SystemMessageType } from '../constants/systemMessages';

interface InAppChatInterfaceProps {
  apiUrl?: string;
  testMode?: boolean;
  onStreamStart?: (message: any) => void;
  onStreamComplete?: (message: any) => void;
  onError?: (error: any) => void;
  placeholder?: string;
  className?: string;
  maxWidth?: string;
  topOffset?: number; // Offset from top if there's a fixed header
  style?: React.CSSProperties; // Inline styles for width control
  backgroundType?: 'ai' | 'connected' | 'deepSea' | 'deepPurple' | 'deepPink'; // Background type for custom prompt styling
  showGetStarted?: boolean; // Show Get Started button in sales stage
  onGetStartedClick?: () => void; // Callback for Get Started button
  userName?: string; // User's name for personalization
  initialContent?: any; // Initial JSON content for the editor
  onSaveChat?: (content: any) => void; // Callback to save chat history
}

export function InAppChatInterface({
  apiUrl = import.meta.env.VITE_MAIN_AI_WS_URL ?? 'wss://ilaunchingmainai-production.up.railway.app',
  testMode = false,
  onStreamStart,
  onStreamComplete,
  onError,
  placeholder = 'Type your message...',
  className = '',
  maxWidth = '4xl',
  topOffset = 0,
  style,
  backgroundType = 'connected',
  showGetStarted = false,
  onGetStartedClick,
  userName = '',
  initialContent,
  onSaveChat
}: InAppChatInterfaceProps) {
  const [editor, setEditor] = useState<any>(null);
  const [needsScrollPadding, setNeedsScrollPadding] = useState(false);
  const [isStreamingActive, setIsStreamingActive] = useState(false);


  // Effect to load initial content
  useEffect(() => {
    if (editor && initialContent) {
      console.log('📝 Setting initial content for editor', initialContent);
      // Ensure we don't break the editor by setting invalid content
      try {
        editor.commands.setContent(initialContent);

        // Verify AI Indicator exists, restore if missing
        // This ensures the chat is always ready for new input even if history lacked the indicator
        const { doc } = editor.state;
        let hasIndicator = false;
        doc.descendants((node: any) => {
          if (node.type.name === 'aiIndicator') {
            hasIndicator = true;
            return false; // Stop early
          }
        });

        if (!hasIndicator) {
          console.log('🔌 Restoring AI Indicator after content load');
          // Insert at the absolute end of the document
          editor.commands.insertContentAt(doc.content.size, {
            type: 'aiIndicator',
            attrs: {
              aiName: 'iLaunching',
              aiAcknowledge: ''
            }
          });
        }

      } catch (e) {
        console.error('Failed to set initial content:', e);
      }
    }
  }, [editor, initialContent]);


  // Function to determine the correct padding class
  const getPaddingClass = () => {
    // During scrolling for multiple queries, use 100vh
    if (needsScrollPadding) return 'pb-[100vh]';

    // If editor is not initialized yet, no padding
    if (!editor) return '';

    try {
      // When not streaming and editor has actual conversations, use 45vh
      if (!isStreamingActive) {
        const { doc } = editor.state;
        let conversationCount = 0;

        doc.descendants((node: any) => {
          if (node.type.name === 'aiTurn' || node.type.name === 'dataTurn') {
            conversationCount++;
          }
        });

        // Only add padding if there are actual completed conversations
        if (conversationCount > 0) return 'pb-[45vh]';
      }
    } catch (error) {
      console.warn('Error accessing editor state:', error);
    }

    // Default: no padding when editor is empty or only has AI indicator
    return '';
  };
  const [showSignupPopup, setShowSignupPopup] = useState(false);

  // Initialize streaming with WebSocket
  const streaming = useStreaming(editor, {
    apiUrl,
    testMode,
    onStreamStart: (message) => {
      console.log('✅ Stream started:', message.metadata);
      setIsStreamingActive(true);

      // Clear acknowledge message when streaming starts
      if (editor) {
        console.log('🧹 Attempting to clear acknowledge message...');
        const { doc } = editor.state;
        let foundIndicator = false;

        doc.descendants((node: any, pos: any) => {
          if (node.type.name === 'aiIndicator') {
            foundIndicator = true;
            console.log('📍 Found AI Indicator at pos:', pos);
            console.log('   Current attrs:', node.attrs);

            // Update the acknowledge attribute to empty string
            editor.chain()
              .setNodeSelection(pos)
              .updateAttributes('aiIndicator', {
                aiAcknowledge: ''
              })
              .run();

            console.log('✅ AI Indicator acknowledge cleared');
            return false; // Stop early
          }
        });

        if (!foundIndicator) {
          console.warn('⚠️ No AI Indicator found in document');
        }
      }

      // Call custom callback if provided
      onStreamStart?.(message);
    },
    onStreamComplete: (message) => {
      console.log('✅ Stream completed:', message.total_chunks);
      setIsStreamingActive(false);
      // Reset scroll padding so layout returns to post-stream state (45vh)
      setNeedsScrollPadding(false);

      // Save chat history
      if (onSaveChat && editor) {
        console.log('💾 Saving chat history...');
        try {
          const content = editor.getJSON();
          onSaveChat(content);
        } catch (e) {
          console.error('❌ Failed to save chat history:', e);
        }
      }

      // Call custom callback if provided
      onStreamComplete?.(message);
    },
    onError: (error) => {
      console.error('❌ Error:', error);

      // Call custom callback if provided
      onError?.(error);
    }
  });

  /**
   * Send system message through API
   * Creates a DataTurn node and streams the message into it
   */
  const sendSystemMessage = useCallback(async (messageType: SystemMessageType) => {
    if (!streaming?.addToQueue || !editor) {
      console.warn('⚠️ Streaming or editor not ready, cannot send system message');
      return;
    }

    try {
      console.log('📤 Sending system message:', messageType);

      // Find aiIndicator position
      const { doc } = editor.state;
      let aiIndicatorPos = -1;

      doc.descendants((node: any, pos: any) => {
        if (node.type.name === 'aiIndicator') {
          aiIndicatorPos = pos;
          return false; // Stop early
        }
      });

      const insertPos = aiIndicatorPos >= 0 ? aiIndicatorPos : doc.content.size;

      // Generate unique IDs for this data turn
      const turnId = 'data_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);

      // Insert DataTurn node above AI indicator
      editor.commands.insertContentAt(insertPos, {
        type: 'dataTurn',
        attrs: {
          turnId: turnId,
          timestamp: new Date().toISOString(),
          messageType: messageType,
        },
        content: [
          {
            type: 'response',
            attrs: {
              responseId: turnId,
              isStreaming: true,
              isComplete: false,
              turnId: turnId,
              timestamp: new Date().toISOString(),
            },
            content: [
              {
                type: 'paragraph',
                content: [],
              },
            ],
          },
        ],
      });

      console.log('✅ DataTurn created with turnId:', turnId);

      // Small delay to ensure node is inserted
      setTimeout(() => {
        // Create message with user name for personalization
        const messagePayload = userName
          ? `${messageType}|USER:${userName}`
          : messageType;

        // Send the message type through streaming queue
        streaming.addToQueue(messagePayload, {
          content_type: 'markdown',
          speed: 'normal',
        });

        console.log('✅ System message queued:', messagePayload);
      }, 100);

    } catch (error) {
      console.error('❌ Error sending system message:', error);
    }
  }, [streaming, editor, userName]);



  const handleQuerySubmit = (content: any) => {
    if (!editor) return;

    // Extract the content nodes from the editor JSON
    let contentNodes = content?.content || [];

    // Filter out empty paragraphs (paragraphs with no content or only empty text)
    contentNodes = contentNodes.filter((node: any) => {
      // Keep non-paragraph nodes
      if (node.type !== 'paragraph') return true;

      // Filter out empty paragraphs
      if (!node.content || node.content.length === 0) return false;

      // Filter out paragraphs with only whitespace
      const hasContent = node.content.some((child: any) => {
        if (child.type === 'text') {
          return child.text && child.text.trim().length > 0;
        }
        return true; // Keep non-text nodes (like hard breaks, etc.)
      });

      return hasContent;
    });

    // Don't submit if no content after filtering
    if (contentNodes.length === 0) return;

    // Extract plain text from content nodes for API
    const queryText = contentNodes.map((node: any) => {
      if (node.type === 'paragraph' && node.content) {
        return node.content.map((child: any) => child.text || '').join('');
      }
      return '';
    }).join('\n');

    // Find AI Indicator position
    const { doc } = editor.state;
    let aiIndicatorPos = -1;

    doc.descendants((node: any, pos: any) => {
      if (node.type.name === 'aiIndicator') {
        aiIndicatorPos = pos;
        return false; // Stop early
      }
    });

    const insertPos = aiIndicatorPos >= 0 ? aiIndicatorPos : doc.content.size;

    // Generate unique IDs for this conversation turn
    const turnId = 'turn_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
    const queryId = 'q_' + Date.now();
    const responseId = turnId; // Use same ID as turnId for simplicity
    const timestamp = new Date().toISOString();

    // Insert AITurn node with only Query child (no Response yet)
    editor.commands.insertContentAt(insertPos, {
      type: 'aiTurn',
      attrs: {
        turnId: turnId,
        timestamp: timestamp,
        summary: '', // Will be filled by LLM after response
        cites: [] // Will be filled if response includes citations
      },
      content: [
        {
          type: 'query',
          attrs: {
            user_avatar_type: 'text',
            user_avatar_text: 'U',
            user_first_name: 'User',
            user_surname: '',
            user_id: 'user_' + Date.now(),
            query_id: queryId
          },
          content: contentNodes // User's rich content
        }
      ]
    });

    console.log('💬 AITurn created with Query only:', { turnId, queryId });

    // Update AI Indicator with random acknowledge message
    if (editor) {
      const { doc } = editor.state;
      doc.descendants((node: any, pos: any) => {
        if (node.type.name === 'aiIndicator') {
          const randomMessage = getRandomSubmitAcknowledgeMessage();
          editor.commands.setNodeSelection(pos);
          editor.commands.updateAttributes('aiIndicator', {
            aiAcknowledge: randomMessage
          });
          console.log('💬 Updated AI Indicator with acknowledge:', randomMessage);
          return false; // Stop early
        }
      });
    }

    // Scroll and start streaming
    if (editor) {
      setTimeout(() => {
        try {
          const { doc } = editor.state;

          // Check if editor has meaningful content (not just AI indicator and the current query)
          let conversationCount = 0;
          let aiIndicatorCount = 0;

          doc.descendants((node: any) => {
            if (node.type.name === 'aiTurn' || node.type.name === 'dataTurn') {
              conversationCount++;
            } else if (node.type.name === 'aiIndicator') {
              aiIndicatorCount++;
            }
          });

          // If we only have 1 conversation turn (the one we just created) and an aiIndicator, no previous content
          const hasOnlyCurrentQuery = conversationCount <= 1 && aiIndicatorCount <= 1;

          if (hasOnlyCurrentQuery) {
            // No previous content, no padding needed
            setNeedsScrollPadding(false);
            console.log('📜 Skipping scroll - editor only has AI node and current query');
            // Start streaming immediately without scrolling
            streaming.addToQueue(queryText, {
              content_type: 'markdown',
              speed: 'normal',
              responseId: responseId,
              turnId: turnId,
              timestamp: timestamp
            });
            return;
          }

          // Enable padding BEFORE finding positions for scrolling
          setNeedsScrollPadding(true);

          // Small delay to let padding apply and DOM update
          setTimeout(() => {
            try {
              let lastQueryPos = -1;

              // Find the LAST Query node (the one we just created)
              doc.descendants((node: any, pos: any) => {
                if (node.type.name === 'query') {
                  lastQueryPos = pos;
                }
              });

              if (lastQueryPos >= 0) {
                // Get the Query DOM element
                const queryElement = editor.view.domAtPos(lastQueryPos).node as HTMLElement;
                const queryParent = (queryElement?.closest('[data-node-type="query"]') || queryElement) as HTMLElement;

                // Scroll the query into view
                if (queryParent) {
                  console.log('📜 Scrolling query into view');
                  queryParent.scrollIntoView({ behavior: 'smooth', block: 'start' });

                  // Wait for scroll to likely finish before streaming
                  setTimeout(() => {
                    console.log('✅ Scroll triggered, starting stream');
                    streaming.addToQueue(queryText, {
                      content_type: 'markdown',
                      speed: 'normal',
                      responseId: responseId,
                      turnId: turnId,
                      timestamp: timestamp
                    });
                  }, 300);
                  return;
                }
              }

              // Fallback: start streaming immediately if query not found
              streaming.addToQueue(queryText, {
                content_type: 'markdown',
                speed: 'normal',
                responseId: responseId,
                turnId: turnId,
                timestamp: timestamp
              });
            } catch (innerError) {
              console.warn('⚠️ Error finding query position:', innerError);
              streaming.addToQueue(queryText, {
                content_type: 'markdown',
                speed: 'normal',
                responseId: responseId,
                turnId: turnId,
                timestamp: timestamp
              });
            }

          }, 50); // Small delay to let padding apply
        } catch (scrollError) {
          console.warn('⚠️ Error scrolling:', scrollError);
          // Start streaming anyway on error
          streaming.addToQueue(queryText, {
            content_type: 'markdown',
            speed: 'normal',
            responseId: responseId,
            turnId: turnId,
            timestamp: timestamp
          });
        }
      }, 100); // Small delay to ensure DOM is updated
    } else {
      // No editor, start streaming immediately
      streaming.addToQueue(queryText, {
        content_type: 'markdown',
        speed: 'normal',
        responseId: responseId,
        turnId: turnId,
        timestamp: timestamp
      });
    }

    return { turnId, queryId, responseId };
  };

  return (
    <>
      {/* Signup Popup */}
      <SignupPopup
        isOpen={showSignupPopup}
        onClose={() => setShowSignupPopup(false)}
      />

      <div className={`relative ${className} in-app-chat-container flex flex-col`} style={style}>
        {/* Editor Container with dynamic padding */}
        <div className={`container mx-auto px-4 flex-grow ${getPaddingClass()}`}>
          <div className={`max-w-${maxWidth} mx-auto py-4`}>
            <InAppEditor
              onEditorReady={setEditor}
              className="h-auto"
            />
          </div>
        </div>

        {/* Chat Input - Fixed at Bottom of parent container */}
        {!showSignupPopup && (
          <div className="sticky bottom-0 z-50 w-full">
            <div className={backgroundType === 'connected' || backgroundType === 'ai' ? 'px-4 py-4' : 'p-4'}>
              <InAppChatWindowPrompt
                onSubmit={handleQuerySubmit}
                placeholder={placeholder}
                backgroundType={backgroundType}
                showGetStarted={showGetStarted}
                onGetStartedClick={() => {
                  setShowSignupPopup(true);
                  onGetStartedClick?.();
                }}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
