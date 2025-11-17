import { useState } from 'react';
import { StreamingEditor } from '../components/streaming/StreamingEditor';
import { useStreaming } from '../hooks/useStreaming.websocket';
import ChatWindowPrompt from '../components/ChatWindowPrompt';
import { getRandomSubmitAcknowledgeMessage } from '../constants';

export default function WebSocketTestPage() {
  const [editor, setEditor] = useState<any>(null);

  // Initialize streaming with WebSocket
  const streaming = useStreaming(editor, {
    apiUrl: import.meta.env.VITE_SALES_WS_URL || 'wss://sales-api-production-3088.up.railway.app',
    testMode: true, // Enable test mode for comprehensive response testing
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
    },
    onStreamComplete: (message) => {
      console.log('✅ Stream completed:', message.total_chunks);
    },
    onError: (error) => {
      console.error('❌ Error:', error);
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
    
    // Update AI Indicator with random acknowledge message and scroll to top
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
    
    // Scroll AI Indicator to top BEFORE starting stream
    if (editor) {
      setTimeout(() => {
        try {
          const { doc } = editor.state;
          
          // Check if editor has content (more than just the new query)
          // Count all nodes to determine if there's previous content
          let nodeCount = 0;
          doc.descendants(() => {
            nodeCount++;
          });
          
          // If there are only a few nodes (just the new AITurn with Query), don't scroll
          // More than ~5 nodes means there's previous content
          const hasPreiousContent = nodeCount > 5;
          
          if (!hasPreiousContent) {
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
          
          let lastQueryPos = -1;
          
          // Find the LAST Query node (the one we just created)
          doc.descendants((node: any, pos: any) => {
            if (node.type.name === 'query') {
              lastQueryPos = pos; // Keep updating to get the last one
            }
          });
          
          if (lastQueryPos >= 0) {
            const editorElement = editor.view.dom;
            
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
              
              // Get actual header height from the fixed header element
              const headerElement = document.querySelector('.fixed.top-0');
              const headerHeight = headerElement ? headerElement.getBoundingClientRect().height : 80;
              
              // Scroll to put query right below the header
              const targetScroll = queryAbsoluteTop - headerHeight;
              
              console.log('   queryRect.top:', queryRect.top);
              console.log('   query absolute top:', queryAbsoluteTop);
              console.log('   header height:', headerHeight);
              console.log('   target scroll position:', targetScroll);
              
              // Scroll window to position that puts Query right below header border
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
              
              console.log('📜 Scrolling window to align Query below header border');
              
              // Wait for scroll to complete, then start streaming
              setTimeout(() => {
                streaming.addToQueue(queryText, {
                  content_type: 'markdown',
                  speed: 'normal',
                  responseId: responseId,
                  turnId: turnId,
                  timestamp: timestamp
                });
              }, 150); // Reduced from 400ms for faster response
              
              return; // Exit early since we're starting stream in setTimeout
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
        } catch (scrollError) {
          console.warn('⚠️ Error scrolling to AI Indicator:', scrollError);
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
    <div className="min-h-screen bg-white">
      {/* Header - Fixed, not moving with page */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="py-4" style={{ paddingLeft: '50px' }}>
          <div className="flex items-center gap-4">
            {/* AI Tool Logo - 50x50px diamond with animated "i" */}
            <div className="ai-icon-container">
              <div className="ai-icon">
                <span className="ai-letter">i</span>
              </div>
            </div>
            
            {/* Text */}
            <h1 
              className="text-black"
              style={{
                fontFamily: "'Baloo 2', sans-serif",
                fontSize: '40px',
                fontWeight: '600',
                lineHeight: '1',
              }}
            >
              iLaunching
            </h1>
          </div>
        </div>
      </div>

      <style>{`
        .ai-icon-container {
          flex-shrink: 0;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ai-icon {
          width: 40px;
          height: 40px;
          transform: rotate(45deg);
          background: linear-gradient(135deg, 
            rgba(59, 130, 246, 0.08) 0%, 
            rgba(147, 51, 234, 0.08) 50%,
            rgba(236, 72, 153, 0.08) 100%
          );
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(59, 130, 246, 0.8);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid rgba(59, 130, 246, 0.15);
          border-radius: 8px;
          position: relative;
          overflow: visible;
          box-shadow: 
            0 0 20px rgba(59, 130, 246, 0.1),
            inset 0 1px 1px rgba(255, 255, 255, 0.6);
        }

        .ai-icon .ai-letter {
          transform: rotate(-45deg);
          font-family: 'Fredoka', sans-serif;
          font-size: 38px;
          font-weight: 700;
          font-style: normal;
          background: linear-gradient(
            45deg,
            #3b82f6 0%,
            #8b5cf6 25%,
            #ec4899 50%,
            #f59e0b 75%,
            #3b82f6 100%
          );
          background-size: 400% 400%;
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: aiColorFlow 3s ease-in-out infinite;
          filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.3));
        }

        @keyframes aiColorFlow {
          0% {
            background-position: 0% 0%;
            transform: rotate(-45deg) scale(1);
          }
          33% {
            background-position: 100% 100%;
            transform: rotate(-45deg) scale(1.05);
          }
          66% {
            background-position: 0% 100%;
            transform: rotate(-45deg) scale(1);
          }
          100% {
            background-position: 0% 0%;
            transform: rotate(-45deg) scale(1);
          }
        }
      `}</style>

      {/* Spacer for fixed header */}
      <div className="h-16"></div>

      {/* Editor Container - No overflow, browser scrolls */}
      {/* pb-[100vh] adds viewport height padding at bottom so content can scroll all the way up */}
      <div className="container mx-auto px-4 pb-[100vh]">
        <div className="max-w-4xl mx-auto py-4">
          <StreamingEditor
            onEditorReady={setEditor}
            className="h-auto"
          />
        </div>
      </div>
      
      {/* Chat Input - Fixed at Bottom */}
      <div className="fixed bottom-0 left-0 right-0  z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="max-w-4xl mx-auto">
            <ChatWindowPrompt
              onSubmit={handleQuerySubmit}
              placeholder="Type your message..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
