import { useState } from 'react';
import AIBackground from '@/components/layout/AIBackground';
import Header from '@/components/layout/Header';
import ChatPrompt from '@/components/ChatPrompt';
import TiptapTypewriter from '@/components/TiptapTypewriter';
import { getRandomWelcomeMessage, APP_CONFIG } from '@/constants';

export default function Landing() {
  // Get random welcome message on load
  const [aiMessage, setAiMessage] = useState(getRandomWelcomeMessage());

  const handleMessage = (message: string) => {
    console.log('User message:', message);
    // Handle the message here
    setAiMessage(`You entered: ${message}`);
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
