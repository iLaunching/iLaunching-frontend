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

export default function Landing() {
  // Check if user has visited during this session
  const [aiMessage, setAiMessage] = useState('');

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
    
    // Step 1: Show acknowledge message immediately
    setAiMessage(getRandomAcknowledgeMessage());
    
    // Step 2: Wait a bit (simulate checking) then validate email
    setTimeout(() => {
      if (!isValidEmail(message)) {
        // Invalid email format
        setAiMessage(getRandomWrongEmailMessage());
      } else {
        // Valid email - show checking message with actual email
        setAiMessage(getRandomCheckingEmailMessage(message));
        // TODO: Call API to check if user exists
      }
    }, 1500); // 1.5 second delay for natural feel
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
