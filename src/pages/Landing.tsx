import { useEffect, useState, useCallback } from 'react';
import AIBackground from '@/components/layout/AIBackground';
import ConnectedMindsBackground from '@/components/layout/ConnectedMindsBackground';
import Header from '@/components/layout/Header';
import ChatPrompt from '@/components/ChatPrompt';
import TiptapTypewriter from '@/components/TiptapTypewriter';
import { StreamingChatInterface } from '@/components/StreamingChatInterface';
import { UserPlus, LogIn } from 'lucide-react';
import { 
  getRandomWelcomeMessage, 
  getRandomWelcomeBackMessage, 
  APP_CONFIG 
} from '@/constants';
import { useLandingAuth } from '@/hooks/useLandingAuth';
import { salesApi } from '@/api/sales';

export default function Landing() {
  // Use the auth hook for state management
  const {
    authState,
    handleEmailSubmit,
    handleSignupChoice,
    handleLoginChoice,
    handleNameSubmit,
    handlePasswordCreate,
    handlePasswordLogin,
    enterSalesMode,
  } = useLandingAuth();
  
  // State to control button visibility after typewriter completes
  const [showButtons, setShowButtons] = useState(false);
  // State to control when to show name input prompt after message completes
  const [showNameInput, setShowNameInput] = useState(false);
  // State to show "Yes Please" button after introduction completes
  const [showYesPleaseButton, setShowYesPleaseButton] = useState(false);
  // State for background transition
  const [backgroundType, setBackgroundType] = useState<'ai' | 'connected'>('ai');
  const [isTransitioning, setIsTransitioning] = useState(false);
  // State for chat window
  const [showChatWindow, setShowChatWindow] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  
  // State for sales conversation
  const [salesSessionId, setSalesSessionId] = useState<string | null>(null);
  const [isStreamingResponse, setIsStreamingResponse] = useState(false);
  
  // Initialize with welcome message on first load
  useEffect(() => {
    const hasVisitedThisSession = sessionStorage.getItem('hasVisitedLanding');
    
    if (!hasVisitedThisSession) {
      sessionStorage.setItem('hasVisitedLanding', 'true');
    }
  }, []);
  
  // Reset button visibility when stage changes to new_user or email_checking
  useEffect(() => {
    if (authState.stage === 'new_user' || authState.stage === 'email_checking') {
      setShowButtons(false);
    }
  }, [authState.stage]);
  
  // Reset name input visibility when stage changes to name_input
  useEffect(() => {
    if (authState.stage === 'name_input') {
      setShowNameInput(false);
    }
  }, [authState.stage]);
  
  // Handle user input based on current stage
  const handleMessage = async (message: string) => {
    if (authState.isProcessing) return;
    
    switch (authState.stage) {
      case 'email_input':
        await handleEmailSubmit(message);
        break;
      case 'name_input':
        handleNameSubmit(message);
        break;
      case 'password_create':
        await handlePasswordCreate(message);
        break;
      case 'password_input':
        await handlePasswordLogin(message);
        break;
      default:
        break;
    }
  };
  
  // Get placeholder based on current stage
  const getPlaceholder = () => {
    switch (authState.stage) {
      case 'email_input':
        return APP_CONFIG.placeholders.email;
      case 'name_input':
        return 'Enter your name...';
      case 'password_create':
        return 'Create a password...';
      case 'password_input':
        return 'Enter your password...';
      default:
        return APP_CONFIG.placeholders.email;
    }
  };
  
  // Get input type based on current stage
  const getInputType = () => {
    return (authState.stage === 'password_create' || authState.stage === 'password_input') 
      ? 'password' 
      : 'text';
  };

  // Initialize sales conversation and start streaming
  const initializeSalesConversation = async () => {
    try {
      // Generate session ID
      const sessionId = salesApi.generateSessionId();
      setSalesSessionId(sessionId);

      // Get user information from authState
      const userName = authState.user?.name || authState.name || 'there';

      // Clear message initially
      setChatMessage('');
      setIsStreamingResponse(true);

      // Send initial message to the sales API to get the real AI response
      const initialUserMessage = `Hi! I just clicked "Let's do this" to learn more about iLaunching. I'm ${userName} and I'm interested in exploring how you can help my business.`;

      // Send to sales API for real AI response
      salesApi.createMessageStream(
        {
          session_id: sessionId,
          message: initialUserMessage,
          email: authState.user?.email || authState.email,
          name: userName
        },
        (response) => {
          // Update chat message as it streams from the API
          setChatMessage(response.message);
        },
        (error) => {
          console.error('Sales API initialization error:', error);
          setChatMessage("Connection error. Please refresh and try again.");
          setIsStreamingResponse(false);
        },
        () => {
          // Streaming complete
          setIsStreamingResponse(false);
        }
      );

    } catch (error) {
      console.error('Failed to initialize sales conversation:', error);
      setChatMessage("Unable to connect to sales service. Please try again.");
      setIsStreamingResponse(false);
    }
  };

  // Handle sales conversation messages
  const handleSalesMessage = async (message: string) => {
    if (!salesSessionId || isStreamingResponse) return;

    try {
      setIsStreamingResponse(true);
      setChatMessage('');

      // Send message to sales API with streaming
      salesApi.createMessageStream(
        {
          session_id: salesSessionId,
          message: message,
          email: authState.user?.email || authState.email,
          name: authState.user?.name || authState.name
        },
        (response) => {
          // Update chat message as it streams
          setChatMessage(response.message);
        },
        (error) => {
          console.error('Sales API error:', error);
          setChatMessage("I apologize, but I'm having trouble connecting right now. Could you please try again?");
          setIsStreamingResponse(false);
        },
        () => {
          // Streaming complete
          setIsStreamingResponse(false);
        }
      );

    } catch (error) {
      console.error('Failed to send sales message:', error);
      setChatMessage("I'm here to help! Could you tell me more about your business needs?");
      setIsStreamingResponse(false);
    }
  };
  
  // Determine if chat should be visible
  const shouldShowChat = authState.stage !== 'authenticated' && 
                         authState.stage !== 'new_user' &&
                         authState.stage !== 'introduction';
  
  // Should show chat container during name_input but with opacity control
  const isNameInputStage = authState.stage === 'name_input';
  
  // Determine if we should show the button container (visible during new_user)
  const shouldShowButtonContainer = authState.stage === 'new_user';
  
  // Handle typewriter completion - memoized to prevent re-renders
  const handleTypewriterComplete = useCallback(() => {
    if (authState.stage === 'new_user') {
      // When the "not registered" message completes, fade in buttons
      setTimeout(() => {
        setShowButtons(true);
      }, 100);
    } else if (authState.stage === 'name_input') {
      // When the "ask name" message completes, fade in the name input
      setTimeout(() => {
        setShowNameInput(true);
      }, 100);
    } else if (authState.stage === 'introduction') {
      // When the introduction message completes, show "Yes Please" button
      setTimeout(() => {
        setShowYesPleaseButton(true);
      }, 100);
    }
  }, [authState.stage]);
  
  // Get current display message
  const getCurrentMessage = () => {
    // If we have a message in state, use it (includes error messages formatted nicely)
    if (authState.message) {
      return authState.message;
    }
    
    // Show raw error as fallback
    if (authState.error) {
      return authState.error;
    }
    
    // Show appropriate message based on stage
    const hasVisited = sessionStorage.getItem('hasVisitedLanding');
    if (authState.stage === 'email_input') {
      return hasVisited ? getRandomWelcomeBackMessage() : getRandomWelcomeMessage();
    }
    
    // Default fallback
    return '';
  };

  return (
    <div className="relative min-h-screen">
      {/* Background with smooth transition */}
      <div className={`background-transition ${isTransitioning ? 'transitioning' : ''}`}>
        <div className={`background-layer ${backgroundType === 'ai' ? 'active' : 'inactive'}`}>
          <AIBackground />
        </div>
        <div className={`background-layer ${backgroundType === 'connected' ? 'active' : 'inactive'}`}>
          <ConnectedMindsBackground />
        </div>
      </div>
      
      {/* Sticky Chat Interface - Show in sales stage */}
      {(showChatWindow || authState.stage === 'sales') && (
        <div className="chat-window-sticky">
          <StreamingChatInterface
            testMode={true}
            topOffset={0}
            placeholder="Tell me about your business challenge..."
            className="h-full"
            maxWidth="full"
            style={{ width: '45vw', minWidth: '420px', maxWidth: '800px' }}
          />
        </div>
      )}
      
      {/* Content overlay */}
      <div className="relative flex flex-col min-h-screen">
        <Header 
          aiActive={authState.stage === 'sales'} 
          className={authState.stage === 'introduction' || authState.stage === 'sales' ? 'opacity-0' : 'opacity-100'}
        />
        
        {/* Center the chat interface - Add top padding for sticky header */}
        <div 
          className={`flex-1 flex items-center justify-center p-8 transition-opacity duration-1000 ${
            authState.stage === 'sales' ? 'opacity-0' : 'opacity-100'
          }`} 
          style={{ paddingTop: '140px' }}
        >
          <div className="w-full max-w-[800px] flex flex-col" style={{ gap: '10px' }}>
            {/* Tiptap Typewriter - Hide when in sales stage */}
            {authState.stage !== 'sales' && (
              <TiptapTypewriter 
                key={authState.message} // Force remount when message changes
                text={getCurrentMessage()}
                speed={APP_CONFIG.typewriterSpeed}
                onComplete={handleTypewriterComplete}
                className="text-gray-900"
                style={{ 
                  fontFamily: APP_CONFIG.fonts.primary,
                  fontSize: '26px',
                  color: APP_CONFIG.colors.text,
              }}
              />
            )}
            
            {/* Chat Prompt - Hide when in sales stage */}
            {shouldShowChat && authState.stage !== 'sales' && (
              <div className={`transition-opacity duration-500 ${
                isNameInputStage && !showNameInput ? 'opacity-0' : 'opacity-100'
              }`}>
                <ChatPrompt 
                  onSubmit={handleMessage}
                  placeholder={getPlaceholder()}
                  type={getInputType()}
                />
              </div>
            )}
            
            {/* New User Buttons - Hide when in sales stage */}
            {shouldShowButtonContainer && authState.stage !== 'sales' && (
              <div 
                className="flex gap-8 justify-center mt-6"
                style={{ marginBottom: '200px', minHeight: '60px' }}
              >
               
                <button
                  onClick={handleLoginChoice}
                  className={`flex items-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 hover:scale-105 transition-all duration-500 shadow-md ${
                    showButtons ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={{ maxHeight: '45px' }}
                >
                  <LogIn className="w-5 h-5" />
                  Log Me In
                </button>
              


                <button
                  onClick={handleSignupChoice}
                  className={`flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all duration-500 ${
                    showButtons ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={{ maxHeight: '45px',minWidth: '300px',maxWidth: '350px', justifyContent: 'center'    }}
                >
                  <UserPlus className="w-5 h-5" />
                  Yes Please
                </button>
                </div>


            )}
            
            {/* Introduction "Continue" Button - Hide when in sales stage */}
            {authState.stage === 'introduction' && (
              <div 
                className="flex justify-center mt-6"
                style={{ marginBottom: '200px', minHeight: '60px' }}
              >
                <button
                  onClick={async () => {
                    // Transition to sales mode - this will clear all content
                    enterSalesMode();
                    
                    // Start background transition
                    setIsTransitioning(true);
                    
                    // Change background immediately
                    setTimeout(() => {
                      setBackgroundType('connected');
                    }, 50);
                    
                    // Complete background transition
                    setTimeout(() => {
                      setIsTransitioning(false);
                    }, 800);
                    
                    // Show chat window after background is settled
                    setTimeout(async () => {
                      setShowChatWindow(true);
                      // Initialize the sales conversation with API
                      await initializeSalesConversation();
                    }, 900);
                  }}
                  className={`flex items-center gap-2 px-8 py-3 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all duration-500 ${
                    showYesPleaseButton ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={{ maxHeight: '45px', minWidth: '200px', justifyContent: 'center' }}
                >
                  Let's Do This! 
                </button>
              </div>
            )}

            {/* Show user info when authenticated */}
            {authState.stage === 'authenticated' && authState.user && (
              <div className="mt-4 p-4 bg-white/10 backdrop-blur-sm rounded-lg">
                <p className="text-white text-lg">
                  Welcome, {authState.user.name}! 🎉
                </p>
                <p className="text-white/70 text-sm">
                  {authState.user.email}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Background transition styles */}
      <style>{`
        .background-transition {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: -1;
        }
        
        .background-layer {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          transition: opacity 1s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .background-layer.active {
          opacity: 1;
        }
        
        .background-layer.inactive {
          opacity: 0;
        }
        
        .background-transition.transitioning .background-layer {
          transition: opacity 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        
        /* Chat Window Styles - Scrollable */
        .chat-window-sticky {
          position: absolute;
          left: 20px;
          top: 0;
          z-index: 1000;
          width: 45vw; /* 45% of viewport width */
          min-width: 420px; /* Minimum width for usability */
          max-width: 800px; /* Maximum width for very large screens */
          min-height: 100vh;
          padding: 0;
          margin: 0;
          animation: slideInLeft 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        @keyframes slideInLeft {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }
        
        /* Responsive chat window */
        @media (max-width: 1400px) {
          .chat-window-sticky {
            left: 10px;
            width: 50vw; /* 50% of viewport on medium-large screens */
            max-width: 700px;
          }
        }
        
        @media (max-width: 1200px) {
          .chat-window-sticky {
            left: 10px;
            width: 55vw; /* 55% of viewport on medium screens */
            max-width: 600px;
          }
        }
        
        @media (max-width: 1024px) {
          .chat-window-sticky {
            left: 10px;
            width: 60vw; /* 60% of viewport on smaller screens */
            max-width: 500px;
          }
        }
        
        @media (max-width: 768px) {
          .chat-window-sticky {
            position: fixed;
            left: 10px;
            right: 10px;
            top: auto;
            bottom: 20px;
            transform: none;
            width: auto;
            max-height: 60vh;
            animation: slideInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          }
        }
        
        @keyframes slideInUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
