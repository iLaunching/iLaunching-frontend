import { useState } from 'react';
import { Send, Mic } from 'lucide-react';

interface OnboardingPromptProps {
  onSubmit: (message: string) => void;
  placeholder?: string;
  type?: 'text' | 'password' | 'email';
  className?: string;
  containerStyle?: React.CSSProperties;
  inputClassName?: string;
  buttonClassName?: string;
  overlayColor?: string;
  showSignupButton?: boolean;
  onSignupClick?: () => void;
  showSalesDemoButton?: boolean;
  onSalesDemoClick?: () => void;
  showLaunchIdeaButton?: boolean;
  onLaunchIdeaClick?: () => void;
  showMakeMoneyButton?: boolean;
  onMakeMoneyClick?: () => void;
  showGoogleButton?: boolean;
  onGoogleClick?: () => void;
  showFacebookButton?: boolean;
  onFacebookClick?: () => void;
}

export default function OnboardingPrompt({ 
  onSubmit, 
  placeholder = "Type your email here...",
  type = "text",
  className = "",
  containerStyle,
  inputClassName = "",
  buttonClassName = "",
  showSignupButton = false,
  onSignupClick,
  showSalesDemoButton = false,
  onSalesDemoClick,
  showLaunchIdeaButton = false,
  onLaunchIdeaClick,
  showMakeMoneyButton = false,
  onMakeMoneyClick,
  showGoogleButton = false,
  onGoogleClick,
  showFacebookButton = false,
  onFacebookClick
}: OnboardingPromptProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSubmit(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="w-full max-w-[800px] mx-auto px-4">
      <form onSubmit={handleSubmit}>
        <div 
          className={`relative bg-white rounded-2xl overflow-hidden ${className}`}
          style={{
            borderLeft: '1px solid #9333EA',
            borderRight: '1px solid #2563EB',
            borderTop: '1px solid #9333EA',
            borderBottom: '1px solid #2563EB',
            boxShadow: '0 2px 8px rgba(147, 51, 234, 0.15), 0 1px 4px rgba(37, 99, 235, 0.15)',
            ...containerStyle
          }}
        >
          {/* Input Area */}
          <div className="relative p-4">
            <input
              type={type}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className={`w-full outline-none text-gray-900 placeholder-gray-400 text-base bg-transparent ${inputClassName}`}
              style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '18px' }}
            />
          </div>

          {/* Button Area */}
          <div className="relative flex items-center gap-2 px-4" style={{ paddingTop: '10px', paddingBottom: '20px' }}>
            {/* Sales Demo Button - Show when showSalesDemoButton is true */}
            {showSalesDemoButton && onSalesDemoClick && (
              <button
                type="button"
                onClick={onSalesDemoClick}
                className="flex items-center justify-center h-8 px-5 rounded-full border border-gray-200 bg-white text-purple-500 text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-purple-500 hover:text-white hover:border-purple-500 shadow-sm whitespace-nowrap"
              >
                See what you can do for me
              </button>
            )}

            {/* Launch Idea Button - Show when showLaunchIdeaButton is true */}
            {showLaunchIdeaButton && onLaunchIdeaClick && (
              <button
                type="button"
                onClick={onLaunchIdeaClick}
                className="flex items-center justify-center h-8 px-5 rounded-full border border-gray-200 bg-white text-blue-500 text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-blue-500 hover:text-white hover:border-blue-500 shadow-sm whitespace-nowrap"
              >
                Launch my idea
              </button>
            )}

            {/* Make Money Button - Show when showMakeMoneyButton is true */}
            {showMakeMoneyButton && onMakeMoneyClick && (
              <button
                type="button"
                onClick={onMakeMoneyClick}
                className="flex items-center justify-center h-8 px-5 rounded-full border border-gray-200 bg-white text-green-500 text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-green-500 hover:text-white hover:border-green-500 shadow-sm whitespace-nowrap"
              >
                Will this make money
              </button>
            )}

            {/* Spacer */}
            <div className="flex-1" />

            {/* Voice Button */}
            <button
              type="button"
              className="flex-shrink-0 w-9 h-9 rounded-full bg-white border border-gray-200 hover:border-gray-300 flex items-center justify-center transition-all duration-200 hover:shadow-md tooltip-trigger"
              data-tooltip="Chat using voice"
            >
              <Mic className="w-4 h-4 text-gray-600" />
            </button>

            {/* Send Button */}
            <button
              type="submit"
              disabled={!message.trim()}
              className={`flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600
                       text-white flex items-center justify-center transition-all duration-200
                       hover:shadow-lg hover:scale-105 active:scale-95
                       disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 tooltip-trigger ${buttonClassName}`}
              data-tooltip="Submit"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>

          {/* Additional Button Section with Gradient Overlay Background */}
          <div className="chat-prompt-additional-section">
            <div className="chat-prompt-additional-buttons">
              {/* Continue with Google Button */}
              {showGoogleButton && onGoogleClick && (
                <button
                  type="button"
                  onClick={onGoogleClick}
                  className="flex items-center justify-center gap-2 h-8 px-5 rounded-full border border-gray-300 bg-white text-gray-700 text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-gray-100 shadow-sm whitespace-nowrap"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>
              )}

              {/* Continue with Facebook Button */}
              {showFacebookButton && onFacebookClick && (
                <button
                  type="button"
                  onClick={onFacebookClick}
                  className="flex items-center justify-center gap-2 h-8 px-5 rounded-full border border-gray-300 bg-white text-gray-700 text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-gray-100 shadow-sm whitespace-nowrap"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Continue with Facebook
                </button>
              )}
              
              {/* Signup Button - Show when showSignupButton is true */}
              {showSignupButton && onSignupClick && (
                <button
                  type="button"
                  onClick={onSignupClick}
                  className="flex items-center justify-center h-8 px-5 rounded-full border border-gray-200 bg-white text-blue-500 text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-blue-500 hover:text-white hover:border-blue-500 shadow-sm whitespace-nowrap"
                >
                  Sign Up
                </button>
              )}
            </div>
          </div>
        </div>
      </form>
      
      {/* Tooltip Styles */}
      <style>{`
        .tooltip-trigger {
          position: relative;
        }

        .tooltip-trigger::before {
          content: attr(data-tooltip);
          position: absolute;
          bottom: calc(100% + 18px);
          left: 50%;
          transform: translateX(-50%) translateY(0);
          background: linear-gradient(135deg, #111827 0%, #1f2937 100%);
          color: #f9fafb;
          padding: 6px 10px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.025em;
          white-space: nowrap;
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
          z-index: 99999;
          box-shadow: 
            0 4px 12px rgba(0, 0, 0, 0.15),
            0 2px 6px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .tooltip-trigger::after {
          content: '';
          position: absolute;
          bottom: calc(100% + 13px);
          left: 50%;
          transform: translateX(-50%) translateY(0);
          width: 12px;
          height: 12px;
          background: linear-gradient(135deg, #111827 0%, #1f2937 100%);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          box-shadow: 
            0 2px 6px rgba(0, 0, 0, 0.2),
            0px 14px 0 -2.5px #111827;
          z-index: 99997;
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
        }

        .tooltip-trigger:hover::before,
        .tooltip-trigger:hover::after {
          opacity: 1;
          visibility: visible;
        }

        .tooltip-trigger:disabled:hover::before,
        .tooltip-trigger:disabled:hover::after {
          opacity: 0;
          visibility: hidden;
        }

        /* Submit button tooltip always shows, even when disabled */
        .tooltip-trigger[type="submit"]:disabled:hover::before,
        .tooltip-trigger[type="submit"]:disabled:hover::after {
          opacity: 1 !important;
          visibility: visible !important;
        }

        /* Additional Button Section with Gradient Overlay */
        .chat-prompt-additional-section {
          background: linear-gradient(to right, rgba(243, 232, 255, 0.9), rgba(219, 234, 254, 1));
          border-radius: 0 0 16px 16px;
          padding: 10px 16px;
        }

        .chat-prompt-additional-buttons {
          display: flex;
          gap: 8px;
          align-items: center;
          justify-content: flex-start;
        }
      `}</style>
    </div>
  );
}
