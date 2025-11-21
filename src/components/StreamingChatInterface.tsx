import { useState, useCallback, useEffect, useRef } from 'react';
import { StreamingEditor } from './streaming/StreamingEditor';
import { useStreaming } from '../hooks/useStreaming.websocket';
import ChatWindowPrompt from './ChatWindowPrompt';
import SignupPopup from './SignupPopup';
import { getRandomSubmitAcknowledgeMessage } from '../constants';
import { SYSTEM_MESSAGE_TYPES, type SystemMessageType } from '../constants/systemMessages';

interface StreamingChatInterfaceProps {
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
}

export function StreamingChatInterface({
  apiUrl = import.meta.env.VITE_SALES_WS_URL || 'wss://sales-api-production-3088.up.railway.app',
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
  onGetStartedClick
}: StreamingChatInterfaceProps) {
  const [editor, setEditor] = useState<any>(null);
  const [needsScrollPadding, setNeedsScrollPadding] = useState(false);
  const [isStreamingActive, setIsStreamingActive] = useState(false);
  const hasShownWelcomeRef = useRef(false);

  // Reset welcome flag when component mounts (entering sales stage)
  useEffect(() => {
    console.log('🎬 StreamingChatInterface mounted - resetting welcome flag');
    hasShownWelcomeRef.current = false;
  }, []); // Empty deps - only run on mount

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
        let aiTurnCount = 0;
        
        doc.descendants((node: any) => {
          if (node.type.name === 'aiTurn') {
            aiTurnCount++;
          }
        });
        
        // Only add padding if there are actual completed conversations
        if (aiTurnCount > 0) return 'pb-[45vh]';
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
      // Don't set needsScrollPadding to false here - let getPaddingClass handle it
      
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
   * Message will be streamed back like an LLM response
   */
  const sendSystemMessage = useCallback(async (messageType: SystemMessageType) => {
    if (!streaming?.addToQueue) {
      console.warn('⚠️ Streaming not ready, cannot send system message');
      return;
    }

    try {
      console.log('📤 Sending system message:', messageType);
      
      // Send through streaming queue - it will go to backend API
      // The message type itself is the content (it's a special flag the backend recognizes)
      streaming.addToQueue(messageType, {
        content_type: 'markdown',
        speed: 'normal',
      });
      
      console.log('✅ System message queued:', messageType);
    } catch (error) {
      console.error('❌ Error sending system message:', error);
    }
  }, [streaming]);

  /**
   * Send welcome message when editor initializes and WebSocket is connected
   */
  useEffect(() => {
    console.log('🔍 Welcome effect triggered:', { 
      hasEditor: !!editor, 
      hasStreaming: !!streaming, 
      hasShownWelcome: hasShownWelcomeRef.current,
      streamingReady: !!streaming?.addToQueue,
      isConnected: streaming?.isConnected
    });
    
    // Wait for editor, streaming, connection, and ensure we haven't shown welcome yet
    if (editor && streaming?.addToQueue && streaming?.isConnected && !hasShownWelcomeRef.current) {
      // Check if editor is truly empty (no aiTurn nodes)
      const { doc } = editor.state;
      let aiTurnCount = 0;
      
      doc.descendants((node: any) => {
        if (node.type.name === 'aiTurn') {
          aiTurnCount++;
        }
      });
      
      console.log('📊 Editor state:', { aiTurnCount });
      
      // Only send welcome if editor is empty
      if (aiTurnCount === 0) {
        console.log('✅ All conditions met, setting up welcome message timer...');
        // Set flag BEFORE timer to prevent re-runs
        hasShownWelcomeRef.current = true;
        
        // Small delay to ensure WebSocket is fully ready
        const timer = setTimeout(() => {
          console.log('🎉 Sending welcome message now!');
          sendSystemMessage(SYSTEM_MESSAGE_TYPES.SALES_WELCOME);
        }, 1500);

        return () => {
          console.log('🧹 Cleaning up welcome timer');
          clearTimeout(timer);
        };
      } else {
        console.log('⏭️ Editor not empty, skipping welcome message');
      }
    } else {
      console.log('⏸️ Waiting for conditions:', {
        needsEditor: !editor,
        needsStreaming: !streaming,
        needsConnection: !streaming?.isConnected,
        alreadyShown: hasShownWelcomeRef.current
      });
    }
  }, [editor, streaming?.isConnected, sendSystemMessage]);

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
          let aiTurnCount = 0;
          let aiIndicatorCount = 0;
          
          doc.descendants((node: any) => {
            if (node.type.name === 'aiTurn') {
              aiTurnCount++;
            } else if (node.type.name === 'aiIndicator') {
              aiIndicatorCount++;
            }
          });
          
          // If we only have 1 aiTurn (the one we just created) and an aiIndicator, no previous content
          const hasOnlyCurrentQuery = aiTurnCount <= 1 && aiIndicatorCount <= 1;
          
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
            
              if (queryParent) {
                const beforeScrollTop = window.scrollY || document.documentElement.scrollTop;
                const beforeScrollHeight = document.documentElement.scrollHeight;
                const beforeClientHeight = window.innerHeight;
                
                console.log('📏 Before scroll:');
                console.log('   window.scrollY:', beforeScrollTop);
                console.log('   document height:', beforeScrollHeight);
                console.log('   window height:', beforeClientHeight);
                console.log('   query position in doc:', lastQueryPos);
                console.log('   aiTurn count:', aiTurnCount);
                
                // Get the query's absolute position on the page
                const queryRect = queryParent.getBoundingClientRect();
                const queryAbsoluteTop = queryRect.top + beforeScrollTop;
                
                // Calculate target scroll with custom top offset
                const targetScroll = queryAbsoluteTop - topOffset;
                
                console.log('   queryRect.top:', queryRect.top);
                console.log('   query absolute top:', queryAbsoluteTop);
                console.log('   top offset:', topOffset);
                console.log('   target scroll position:', targetScroll);
                
                // Scroll window to position
                window.scrollTo({
                  top: targetScroll,
                  behavior: 'smooth'
                });
                
                setTimeout(() => {
                  const afterScrollTop = window.scrollY || document.documentElement.scrollTop;
                  const scrollDelta = afterScrollTop - beforeScrollTop;
                  
                  console.log('📏 After scroll:');
                  console.log('   window.scrollY:', afterScrollTop);
                  console.log('   scroll delta:', scrollDelta, scrollDelta > 0 ? '(scrolled DOWN)' : scrollDelta < 0 ? '(scrolled UP)' : '(no change)');
                  console.log('   distance from bottom:', document.documentElement.scrollHeight - (afterScrollTop + beforeClientHeight));
                }, 500);
                
                console.log('📜 Scrolling window to align Query');
                
                // Listen for scroll end instead of using timer
                let scrollEndTimer: number;
                const handleScrollEnd = () => {
                  clearTimeout(scrollEndTimer);
                  scrollEndTimer = setTimeout(() => {
                    // Scroll has stopped, remove listener and start streaming
                    window.removeEventListener('scroll', handleScrollEnd);
                    
                    console.log('✅ Scroll completed, starting stream');
                    streaming.addToQueue(queryText, {
                      content_type: 'markdown',
                      speed: 'normal',
                      responseId: responseId,
                      turnId: turnId,
                      timestamp: timestamp
                    });
                  }, 50); // 50ms debounce to detect scroll stop
                };
                
                // Add scroll listener
                window.addEventListener('scroll', handleScrollEnd);
                // Trigger once immediately in case scroll is instant
                handleScrollEnd();
                
                return;
              }
            }
          
            // Fallback: start streaming immediately if scroll fails
            streaming.addToQueue(queryText, {
              content_type: 'markdown',
              speed: 'normal',
              responseId: responseId,
              turnId: turnId,
              timestamp: timestamp
            });
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
      
      <div className={`relative ${className}`} style={style}>
        {/* Editor Container with dynamic padding */}
        <div className={`container mx-auto px-4 ${getPaddingClass()}`}>
        <div className={`max-w-${maxWidth} mx-auto py-4`}>
          <StreamingEditor
            onEditorReady={setEditor}
            className="h-auto"
          />
        </div>
      </div>
      
      {/* Chat Input - Fixed at Bottom of parent container */}
      {!showSignupPopup && (
        <div className="fixed bottom-0 z-50" style={{ left: style?.width ? '18px' : undefined, width: style?.width }}>
          <div className={backgroundType === 'connected' || backgroundType === 'ai' ? 'px-4 py-4' : 'p-4'}>
            <ChatWindowPrompt
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
