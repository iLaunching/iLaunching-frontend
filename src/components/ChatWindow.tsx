import TiptapTypewriter from '@/components/TiptapTypewriter';
import RichTextInput from '@/components/RichTextInput';
import { APP_CONFIG } from '@/constants';

interface ChatWindowProps {
  /** The message to display in the typewriter */
  message: string;
  /** Placeholder text for the chat input */
  placeholder?: string;
  /** Whether the chat input is disabled */
  disabled?: boolean;
  /** Callback when user submits a message */
  onSubmit?: (message: string) => void;
  /** Callback when voice button is clicked */
  onVoiceClick?: () => void;
  /** Callback when plus button is clicked */
  onPlusClick?: () => void;
  /** Callback when typewriter animation completes */
  onTypewriterComplete?: () => void;
  /** Custom styling for the container */
  className?: string;
  /** Whether to show the chat prompt */
  showChatPrompt?: boolean;
}

export default function ChatWindow({
  message,
  placeholder = "Type your message...",
  disabled = false,
  onSubmit,
  onVoiceClick,
  onPlusClick,
  onTypewriterComplete,
  className = "",
  showChatPrompt = true
}: ChatWindowProps) {
  const handleSubmit = (userMessage: string) => {
    if (onSubmit && !disabled) {
      onSubmit(userMessage);
    }
  };

  const handleTypewriterComplete = () => {
    if (onTypewriterComplete) {
      onTypewriterComplete();
    }
  };

  return (
    <div 
      className={`chat-window-container ${className}`}
      style={{
        maxWidth: '45vw', // 45% of viewport width
        minWidth: '400px', // Minimum width for usability
        width: '100%',
        height: '100%', // Fill parent container completely
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        margin: '0',
        padding: '0',
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        backdropFilter: 'blur(10px)',
        borderRadius: '0 0 16px 16px', // Only round bottom corners
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderTop: 'none', // Remove top border so it extends to screen edge
        borderBottom: 'none', // Remove bottom border
      }}
    >
      {/* Message Display Area - Full height minus prompt */}
      <div 
        className="message-area"
        style={{
          flex: 1,
          height: 'calc(100% - 120px)', // Full height minus rich text input area
          padding: '20px',
          paddingTop: '120px', // Add top padding to account for header
          paddingBottom: '20px',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '0', // No border radius for message area so it extends to top
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderTop: 'none', // Remove top border 
          borderBottom: 'none',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
        }}
      >
        <div 
          style={{ 
            width: '100%',
            alignSelf: 'flex-start',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
          }}
        >
          <TiptapTypewriter
            key={message} // Force remount when message changes
            text={message}
            speed={APP_CONFIG.typewriterSpeed}
            onComplete={handleTypewriterComplete}
            scrollContainer={true} // Scroll within ChatWindow container, not the page
            className="text-gray-900"
            style={{
              fontFamily: APP_CONFIG.fonts.primary,
              fontSize: '18px',
              color: APP_CONFIG.colors.text,
              lineHeight: '1.6',
              width: '100%',
            }}
          />
        </div>
      </div>

      {/* Chat Input Area - Absolutely positioned at bottom */}
      {showChatPrompt && (
          <div 
          className="chat-input-area"
          style={{
            position: 'absolute',
            bottom: '0',
            left: '0',
            right: '0',
            minHeight: '120px',
            margin: '0',
            padding: '16px 20px 20px 20px',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            borderRadius: '0 0 16px 16px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'flex-end',
            boxSizing: 'border-box',
            overflow: 'visible',
            zIndex: 100,
          }}
        >
          <RichTextInput
            onSubmit={handleSubmit}
            onVoiceClick={onVoiceClick}
            onPlusClick={onPlusClick}
            placeholder={placeholder}
            disabled={disabled}
            maxHeight={600}
          />
        </div>
      )}

      {/* Custom scrollbar styles */}
      <style>{`
        .chat-window-container .message-area::-webkit-scrollbar {
          width: 6px;
        }
        
        .chat-window-container .message-area::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        
        .chat-window-container .message-area::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.3);
          border-radius: 3px;
          transition: all 0.3s ease;
        }
        
        .chat-window-container .message-area::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.5);
        }

        /* Responsive design */
        @media (max-width: 1024px) {
          .chat-window-container {
            max-width: 60vw;
            min-width: 350px;
          }
        }
        
        @media (max-width: 768px) {
          .chat-window-container {
            max-width: calc(100vw - 40px) !important;
            min-width: 300px !important;
            margin: 0 20px !important;
          }
          
          .chat-window-container .message-area {
            padding: 16px !important;
            min-height: 150px !important;
          }
        }

        /* Glass morphism enhancement */
        .chat-window-container {
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        /* Smooth animations */
        .chat-window-container {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

       /* .chat-window-container:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
        }*/
      `}</style>
    </div>
  );
}