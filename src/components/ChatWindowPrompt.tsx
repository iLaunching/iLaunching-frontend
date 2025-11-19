import RichTextInput from '@/components/RichTextInput';

interface ChatWindowPromptProps {
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
  /** Custom styling for the container */
  className?: string;
  /** Background type for custom prompt styling */
  backgroundType?: 'ai' | 'connected' | 'deepSea' | 'deepPurple' | 'deepPink';
  /** Show Get Started button */
  showGetStarted?: boolean;
  /** Callback when Get Started button is clicked */
  onGetStartedClick?: () => void;
}

export default function ChatWindowPrompt({
  placeholder = "Type your message...",
  disabled = false,
  onSubmit,
  onVoiceClick,
  onPlusClick,
  className = "",
  backgroundType = 'connected',
  showGetStarted = false,
  onGetStartedClick
}: ChatWindowPromptProps) {
  
  const handleSubmit = (userMessage: string) => {
    if (onSubmit && !disabled) {
      onSubmit(userMessage);
    }
  };

  // Custom styles for each background type
  const getBackgroundStyle = () => {
    switch (backgroundType) {
      case 'deepSea':
        return {
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.4) 0%, rgba(2, 132, 199, 0.6) 100%)',
          borderTop: '1px solid rgba(6, 182, 212, 0.5)',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 -4px 16px rgba(6, 182, 212, 0.4), 0 -2px 8px rgba(6, 182, 212, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(6, 182, 212, 0.15)'
        };
      case 'deepPurple':
        return {
          background: 'linear-gradient(135deg, rgba(192, 38, 211, 0.4) 0%, rgba(147, 51, 234, 0.6) 100%)',
          borderTop: '1px solid rgba(192, 38, 211, 0.5)',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 -4px 16px rgba(192, 38, 211, 0.4), 0 -2px 8px rgba(192, 38, 211, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(192, 38, 211, 0.15)'
        };
      case 'deepPink':
        return {
          background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.4) 0%, rgba(219, 39, 119, 0.6) 100%)',
          borderTop: '1px solid rgba(236, 72, 153, 0.5)',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 -4px 16px rgba(236, 72, 153, 0.4), 0 -2px 8px rgba(236, 72, 153, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(236, 72, 153, 0.15)'
        };
      case 'connected':
      case 'ai':
      default:
        return {
          background: 'white',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 -4px 16px rgba(100, 116, 139, 0.12), 0 -2px 8px rgba(100, 116, 139, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
        };
    }
  };

  return (
    <div 
      className={`chat-window-prompt-container ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '120px',
        margin: '0',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'flex-end',
        boxSizing: 'border-box',
        overflow: 'hidden',
        zIndex: 100,
        transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
        ...getBackgroundStyle()
      }}
    >
      <RichTextInput
        onSubmit={handleSubmit}
        onVoiceClick={onVoiceClick}
        onPlusClick={onPlusClick}
        placeholder={placeholder}
        disabled={disabled}
        maxHeight={600}
        backgroundType={backgroundType}
        showGetStarted={showGetStarted}
        onGetStartedClick={onGetStartedClick}
      />

      {/* Custom styles matching ChatWindow */}
      <style>{`

      /*
        .chat-window-prompt-container {
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        /* Responsive design */
        @media (max-width: 768px) {
          .chat-window-prompt-container {
            padding: 12px 16px 16px 16px !important;
          }
        }

        /* Glass morphism enhancement */
        .chat-window-prompt-container {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }*/
      `}</style>
    </div>
  );
}
