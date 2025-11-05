import { useEffect, useState, useCallback } from 'react';
import AIBackground from '@/components/layout/AIBackground';
import Header from '@/components/layout/Header';
import ChatPrompt from '@/components/ChatPrompt';
import TiptapTypewriter from '@/components/TiptapTypewriter';
import { UserPlus, LogIn } from 'lucide-react';
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
    handleSignupChoice,
    handleLoginChoice,
    handleNameSubmit,
    handlePasswordCreate,
    handlePasswordLogin,
  } = useLandingAuth();
  
  // State to control button visibility after typewriter completes
  const [showButtons, setShowButtons] = useState(false);
  
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
  const shouldShowChat = authState.stage !== 'authenticated' && 
                         authState.stage !== 'new_user';
  
  // Determine if we should show the button container (visible during new_user)
  const shouldShowButtonContainer = authState.stage === 'new_user';
  
  // Handle typewriter completion - memoized to prevent re-renders
  const handleTypewriterComplete = useCallback(() => {
    if (authState.stage === 'new_user') {
      // When the "not registered" message completes, fade in buttons
      setTimeout(() => {
        setShowButtons(true);
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
      <AIBackground />
      
      {/* Content overlay */}
      <div className="absolute inset-0 flex flex-col">
        <Header />
        
        {/* Center the chat interface */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-[800px] flex flex-col" style={{ gap: '10px' }}>
            {/* Tiptap Typewriter - Fixed container that scrolls */}
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
            
            {/* Chat Prompt - Only show when not authenticated and not showing buttons */}
            {shouldShowChat && (
              <ChatPrompt 
                onSubmit={handleMessage}
                placeholder={getPlaceholder()}
                type={getInputType()}
              />
            )}
            
            {/* New User Buttons - Show container when user not found or new user */}
            {shouldShowButtonContainer && (
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
