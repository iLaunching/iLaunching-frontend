import { useState } from 'react';
import { Send, Mic } from 'lucide-react';

interface ChatPromptProps {
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
}

export default function ChatPrompt({ 
  onSubmit, 
  placeholder = "Type your email here...",
  type = "text",
  className = "",
  containerStyle,
  inputClassName = "",
  buttonClassName = "",
  overlayColor,
  showSignupButton = false,
  onSignupClick,
  showSalesDemoButton = false,
  onSalesDemoClick
}: ChatPromptProps) {
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
    <div className="w-full max-w-[800px] mx-auto px-4 mb-[200px]">
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
          <div className="relative p-4 border-b border-gray-200">
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
          <div className="relative flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-50/50 to-blue-50/50">
            {/* Signup Button - Show when showSignupButton is true */}
            {showSignupButton && onSignupClick && (
              <button
                type="button"
                onClick={onSignupClick}
                className="flex items-center justify-center h-10 px-5 rounded-full border border-gray-200 bg-white text-blue-500 text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-blue-500 hover:text-white hover:border-blue-500 hover:-translate-y-0.5 shadow-sm hover:shadow-md whitespace-nowrap"
              >
                Sign Up
              </button>
            )}

            {/* Sales Demo Button - Show when showSalesDemoButton is true */}
            {showSalesDemoButton && onSalesDemoClick && (
              <button
                type="button"
                onClick={onSalesDemoClick}
                className="flex items-center justify-center h-10 px-5 rounded-full border border-gray-200 bg-white text-purple-500 text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-purple-500 hover:text-white hover:border-purple-500 hover:-translate-y-0.5 shadow-sm hover:shadow-md whitespace-nowrap"
              >
                See what you can do for me
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
              className={`flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600
                       text-white flex items-center justify-center transition-all duration-200
                       hover:shadow-lg hover:scale-105 active:scale-95
                       disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 tooltip-trigger ${buttonClassName}`}
              data-tooltip="Submit"
            >
              <Send className="w-4 h-4" />
            </button>
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
      `}</style>
    </div>
  );
}
