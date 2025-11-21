import { useState, useEffect } from 'react';
import ChatWindow from '@/components/ChatWindow';

interface HeaderProps {
  aiActive?: boolean; // Whether AI is active in sales mode
  className?: string; // Optional className for visibility control
}

export default function Header({ aiActive = false, className = '' }: HeaderProps) {
  const [showChatWindow, setShowChatWindow] = useState(false);
  
  // Preload the signup popup image
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = '/signup_poup1.png';
    document.head.appendChild(link);
    
    return () => {
      document.head.removeChild(link);
    };
  }, []);
  
  return (
    <header 
      className={`w-full fixed top-0 left-0 right-0 transition-opacity duration-500 ${className}`}
      style={{
        paddingLeft: '50px',
        paddingRight: '50px',
        paddingTop: '30px',
        paddingBottom: '20px',
        backgroundColor: 'transparent',
      
        zIndex: 10000,
      }}
    >
       
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-4">
        {/* AI Tool Logo - 50x50px diamond with animated "i" */}
        <div className="ai-icon-container">
          <div className={`ai-icon ${aiActive ? 'ai-active' : ''}`}>
            <span className={`ai-letter ${aiActive ? 'ai-active' : ''}`}>i</span>
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
        
        {/* Right side - Test buttons */}
        <div className="flex items-center gap-3">
          <a
            href="/streaming-test"
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            style={{
              fontFamily: "'Baloo 2', sans-serif",
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            Streaming Test
          </a>
          
          <button
            onClick={() => setShowChatWindow(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            style={{
              fontFamily: "'Baloo 2', sans-serif",
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            Test Chat
          </button>
          
          {showChatWindow && (
            <button
              onClick={() => {
                console.log('Append API Response button clicked!');
                
                // Get the current chat window editor instance and append new content
                const chatElements = document.querySelectorAll('.chat-window-editor-v2, .tiptap-typewriter');
                console.log('Found chat elements:', chatElements.length);
                
                const chatElement = chatElements[chatElements.length - 1]; // Get the last one (chat window)
                console.log('Selected chat element:', chatElement);
                
                // Send complete HTML chunks that can be parsed properly
                const contentChunks = [
                  `<p><strong>Great questions!</strong> Based on what you've shared, I think our platform could really help with:</p>`,
                  `<p><strong>Lead Generation:</strong> Our AI-powered tools can help identify potential customers in your industry</p>`,
                  `<p><strong>Process Automation:</strong> We can streamline your current workflows to save time and reduce costs</p>`,
                  `<p><strong>Market Analysis:</strong> Get insights into your competition and market opportunities</p>`,
                  `<p>Would you like me to show you a <strong>personalized demo</strong> focusing on any of these areas?</p>`
                ];
                
                console.log('Starting streaming simulation with', contentChunks.length, 'chunks');
                
                // Send each chunk with a delay to simulate streaming
                contentChunks.forEach((chunk, index) => {
                  setTimeout(() => {
                    console.log(`Sending chunk ${index + 1}:`, chunk);
                    
                    const event = new CustomEvent('appendTestContent', {
                      detail: {
                        content: chunk
                      }
                    });
                    window.dispatchEvent(event);
                  }, index * 800); // 800ms between chunks
                });
                
                console.log('All streaming chunks scheduled');
              }}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              style={{
                fontFamily: "'Baloo 2', sans-serif",
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              Append API Response
            </button>
          )}
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

        .ai-icon::before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: linear-gradient(45deg, 
            #3b82f6,
            #8b5cf6,
            #ec4899,
            #f59e0b,
            #3b82f6
          );
          background-size: 400% 400%;
          border-radius: 10px;
          z-index: -1;
          opacity: 0;
          animation: iconBorderFlow 3s ease-in-out infinite;
          filter: blur(0.5px);
        }

        .ai-icon::after {
          content: '';
          position: absolute;
          top: -4px;
          left: -4px;
          right: -4px;
          bottom: -4px;
          background: linear-gradient(45deg, 
            rgba(59, 130, 246, 0.4),
            rgba(147, 51, 234, 0.4),
            rgba(236, 72, 153, 0.4),
            rgba(251, 146, 60, 0.4),
            rgba(59, 130, 246, 0.4)
          );
          background-size: 400% 400%;
          border-radius: 12px;
          z-index: -2;
          opacity: 0;
          animation: iconBorderFlow 3s ease-in-out infinite 0.5s;
          filter: blur(2px);
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

        /* Animations */
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

        @keyframes iconBorderFlow {
          0% {
            background-position: 0% 0%;
            opacity: 0;
            transform: scale(1);
          }
          33% {
            background-position: 100% 100%;
            opacity: 0.6;
            transform: scale(1.02);
          }
          66% {
            background-position: 0% 100%;
            opacity: 0.3;
            transform: scale(1);
          }
          100% {
            background-position: 0% 0%;
            opacity: 0;
            transform: scale(1);
          }
        }

        /* AI Active State - stops animations and shows settled appearance */
        .ai-icon.ai-active::before,
        .ai-icon.ai-active::after {
          animation: none !important;
          opacity: 0.2 !important;
          background: linear-gradient(45deg, 
            rgba(59, 130, 246, 0.2),
            rgba(147, 51, 234, 0.2),
            rgba(236, 72, 153, 0.2),
            rgba(251, 146, 60, 0.2)
          ) !important;
        }

        .ai-icon.ai-active .ai-letter {
          animation: none !important;
          background: rgba(59, 130, 246, 0.6) !important;
          background-clip: text !important;
          -webkit-background-clip: text !important;
          -webkit-text-fill-color: transparent !important;
          filter: drop-shadow(0 0 4px rgba(59, 130, 246, 0.2)) !important;
        }

        .ai-icon.ai-active {
          background: linear-gradient(135deg, 
            rgba(59, 130, 246, 0.04) 0%, 
            rgba(147, 51, 234, 0.04) 50%,
            rgba(236, 72, 153, 0.04) 100%
          ) !important;
          border: 1px solid rgba(59, 130, 246, 0.08) !important;
          box-shadow: 
            0 0 8px rgba(59, 130, 246, 0.05),
            inset 0 1px 1px rgba(255, 255, 255, 0.3) !important;
        }

        /* Hover effects */
        .ai-icon:hover::before,
        .ai-icon:hover::after {
          opacity: 0.8 !important;
        }

        .ai-icon:hover {
          transform: rotate(45deg) scale(1.05);
          box-shadow: 
            0 0 30px rgba(59, 130, 246, 0.3),
            inset 0 1px 1px rgba(255, 255, 255, 0.8);
        }

        /* Don't scale on hover when AI is active */
        .ai-icon.ai-active:hover {
          transform: rotate(45deg) scale(1) !important;
        }
      `}</style>
      
      {/* Test Chat Window */}
      {showChatWindow && (
        <div 
          className="fixed left-0 top-0 z-[10001] bg-white shadow-2xl border-r border-gray-200"
          style={{ width: '45%', height: '100vh' }}
        >
          {/* Close button */}
          <button
            onClick={() => setShowChatWindow(false)}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full z-[10002]"
            style={{ fontSize: '16px' }}
          >
            ×
          </button>
          
          <ChatWindow
            message="<h3><strong>To get started:</strong></h3>Could you share a bit more about your business? <strong>Specifically, I'm curious about your industry and any key challenges you're currently facing?</strong>"
            onSubmit={(message) => {
              console.log('Chat message submitted:', message);
              // Handle message submission here
            }}
            onTypewriterComplete={() => {
              console.log('Typewriter animation completed');
            }}
            useAiIndicator={true}
            aiName="AI Assistant"
            aiAcknowledge="Let me help you with your business needs"
            className="w-full h-full"
          />
        </div>
      )}
    </header>
  );
}
