import { useEffect } from 'react';
import AIBackground from '@/components/layout/AIBackground';
import Header from '@/components/layout/Header';
import ChatPrompt from '@/components/ChatPrompt';
import TiptapTypewriter from '@/components/TiptapTypewriter';
import { 
  getRandomWelcomeMessage, 
  getRandomWelcomeBackMessage, 
  APP_CONFIG 
} from '@/constants';
import { useLandingAuth } from '@/hooks/useLandingAuth';

export default function Landing() {
  // Use the auth hook for state management
  const {
    authState,
    handleEmailSubmit,
    handleNameSubmit,
    handlePasswordCreate,
    handlePasswordLogin,
  } = useLandingAuth();
  
  // Initialize with welcome message on first load
  useEffect(() => {
    const hasVisitedThisSession = sessionStorage.getItem('hasVisitedLanding');
    
    if (!hasVisitedThisSession) {
      sessionStorage.setItem('hasVisitedLanding', 'true');
    }
  }, []);
  
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
  
  // Determine if chat should be visible
  const shouldShowChat = authState.stage !== 'authenticated';
  
  // Get current display message
  const getCurrentMessage = () => {
    // Show error if exists
    if (authState.error) {
      return authState.error;
    }
    
    // Show appropriate message based on stage
    const hasVisited = sessionStorage.getItem('hasVisitedLanding');
    if (authState.stage === 'email_input' && authState.message === '') {
      return hasVisited ? getRandomWelcomeBackMessage() : getRandomWelcomeMessage();
    }
    
    return authState.message;
  };

  return (
    <div className="relative min-h-screen">
      <AIBackground />
      
      {/* Content overlay */}
      <div className="absolute inset-0 flex flex-col">
        <Header />
        
        {/* Center the chat interface */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-[800px] flex flex-col" style={{ gap: '10px' }}>
            {/* Tiptap Typewriter - Fixed container that scrolls */}
            <TiptapTypewriter 
              text={getCurrentMessage()}
              speed={APP_CONFIG.typewriterSpeed}
              className="text-gray-900"
              style={{ 
                fontFamily: APP_CONFIG.fonts.primary,
                fontSize: '26px',
                color: APP_CONFIG.colors.text,
            }}
            />
            
            {/* Chat Prompt - Only show when not authenticated */}
            {shouldShowChat && (
              <ChatPrompt 
                onSubmit={handleMessage}
                placeholder={getPlaceholder()}
                type={getInputType()}
              />
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
    </div>
  );
}
