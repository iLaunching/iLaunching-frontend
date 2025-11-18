import { useState } from 'react';
import { StreamingEditor } from './streaming/StreamingEditor';
import { useStreaming } from '../hooks/useStreaming.websocket';
import ChatWindowPrompt from './ChatWindowPrompt';
import { getRandomSubmitAcknowledgeMessage } from '../constants';

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
  style
}: StreamingChatInterfaceProps) {
  const [editor, setEditor] = useState<any>(null);
  const [needsScrollPadding, setNeedsScrollPadding] = useState(false);

  // Initialize streaming with WebSocket
  const streaming = useStreaming(editor, {
    apiUrl,
    testMode,
    onStreamStart: (message) => {
      console.log('✅ Stream started:', message.metadata);
      
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
      // Reset padding to half viewport height after streaming completes
      setNeedsScrollPadding(false);
      
      // Call custom callback if provided
      onStreamComplete?.(message);
    },
    onError: (error) => {
      console.error('❌ Error:', error);
      
      // Call custom callback if provided
      onError?.(error);
    }
  });

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
    
    doc.descendants((node, pos) => {
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
          
          // Check if editor has content (more than just the new query)
          let nodeCount = 0;
          doc.descendants(() => {
            nodeCount++;
          });
          
          // More than ~5 nodes means there's previous content
          const hasPreviousContent = nodeCount > 5;
          
          if (!hasPreviousContent) {
            // No previous content, no padding needed
            setNeedsScrollPadding(false);
            console.log('📜 Skipping scroll - editor is empty or first query');
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
                console.log('   node count:', nodeCount);
                
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
                let scrollEndTimer: NodeJS.Timeout;
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
    <div className={`relative ${className}`} style={style}>
      {/* Editor Container with dynamic padding */}
      <div className={`container mx-auto px-4 ${needsScrollPadding ? 'pb-[100vh]' : 'pb-[50vh]'}`}>
        <div className={`max-w-${maxWidth} mx-auto py-4`}>
          <StreamingEditor
            onEditorReady={setEditor}
            className="h-auto"
          />
        </div>
      </div>
      
      {/* Chat Input - Fixed at Bottom of parent container */}
      <div className="fixed bottom-0 z-50" style={{ left: style?.width ? '18px' : undefined, width: style?.width }}>
        <div className="px-4 py-4">
          <ChatWindowPrompt
            onSubmit={handleQuerySubmit}
            placeholder={placeholder}
          />
        </div>
      </div>
    </div>
  );
}
