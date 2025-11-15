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
}

export default function ChatWindowPrompt({
  placeholder = "Type your message...",
  disabled = false,
  onSubmit,
  onVoiceClick,
  onPlusClick,
  className = ""
}: ChatWindowPromptProps) {
  
  const handleSubmit = (userMessage: string) => {
    if (onSubmit && !disabled) {
      onSubmit(userMessage);
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

      {/* Custom styles matching ChatWindow */}
      <style>{`
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
        }
      `}</style>
    </div>
  );
}
