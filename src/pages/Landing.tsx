import { useState, useEffect } from 'react';
import AIBackground from '@/components/layout/AIBackground';
import Header from '@/components/layout/Header';
import ChatPrompt from '@/components/ChatPrompt';
import TiptapTypewriter from '@/components/TiptapTypewriter';
import { 
  getRandomWelcomeMessage, 
  getRandomWelcomeBackMessage, 
  getRandomAcknowledgeMessage,
  getRandomCheckingEmailMessage,
  getRandomWrongEmailMessage,
  APP_CONFIG 
} from '@/constants';
import { authApi } from '@/api/auth';

export default function Landing() {
  // Check if user has visited during this session
  const [aiMessage, setAiMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Check sessionStorage to see if user has been here before in this session
    const hasVisitedThisSession = sessionStorage.getItem('hasVisitedLanding');
    
    if (hasVisitedThisSession) {
      // Returning user - show welcome back message
      setAiMessage(getRandomWelcomeBackMessage());
    } else {
      // First time visitor this session - show welcome message
      setAiMessage(getRandomWelcomeMessage());
      // Mark that they've visited
      sessionStorage.setItem('hasVisitedLanding', 'true');
    }
  }, []);

  // Email validation regex
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  const handleMessage = async (message: string) => {
    console.log('User message:', message);
    
    // Prevent multiple submissions
    if (isProcessing) return;
    setIsProcessing(true);
    
    try {
      // Step 1: Show acknowledge message immediately
      setAiMessage(getRandomAcknowledgeMessage());
      
      // Step 2: Wait a bit (simulate checking) then validate email
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (!isValidEmail(message)) {
        // Invalid email format
        setAiMessage(getRandomWrongEmailMessage());
        setIsProcessing(false);
        return;
      }
      
      // Step 3: Valid email - show checking message
      setAiMessage(getRandomCheckingEmailMessage(message));
      
      // Step 4: Check if email exists in database
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const result = await authApi.checkEmail(message);
      
      // Step 5: Show result
      if (result.exists) {
        // User exists - prompt for password
        setAiMessage(`Welcome back! I found your account. Please enter your password to continue.`);
        // TODO: Change input to password mode
      } else {
        // New user - proceed to signup
        setAiMessage(`Great! I don't see an account with ${message} yet. Let's create one! What should I call you? (Your name)`);
        // TODO: Store email and move to name input
      }
      
    } catch (error: any) {
      console.error('Email check error:', error);
      
      // Handle error gracefully
      const errorMessage = error.response?.data?.detail || 'Something went wrong. Please try again.';
      setAiMessage(`Oops! ${errorMessage}`);
    } finally {
      setIsProcessing(false);
    }
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
              text={aiMessage}
              speed={APP_CONFIG.typewriterSpeed}
              className="text-gray-900"
              style={{ 
                fontFamily: APP_CONFIG.fonts.primary,
                fontSize: '26px',
                color: APP_CONFIG.colors.text,
            }}
            />
            
            {/* Chat Prompt - Stays below typewriter */}
            <ChatPrompt 
              onSubmit={handleMessage}
              placeholder={APP_CONFIG.placeholders.email}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
