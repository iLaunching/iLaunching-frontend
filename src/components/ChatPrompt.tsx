import { useState } from 'react';
import { Send } from 'lucide-react';

interface ChatPromptProps {
  onSubmit: (message: string) => void;
  placeholder?: string;
  type?: 'text' | 'password' | 'email';
  className?: string;
  containerStyle?: React.CSSProperties;
  inputClassName?: string;
  buttonClassName?: string;
  overlayColor?: string;
}

export default function ChatPrompt({ 
  onSubmit, 
  placeholder = "Type your email here...",
  type = "text",
  className = "",
  containerStyle = {borderColor: '#2563EB', borderWidth: '1px', borderRadius: '12px', backgroundColor: '#FFFFFF', marginBottom: '250px'},
  inputClassName = "",
  buttonClassName = "",
  overlayColor = "rgba(59, 130, 246, 0.05)"
}: ChatPromptProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSubmit(message.trim());
      setMessage('');
    }
  };

  return (
    <div className="w-full max-w-[800px] mx-auto px-4">
      <form onSubmit={handleSubmit}>
        <div 
          className={`relative bg-white rounded-2xl border border-gey-300 shadow-sm overflow-hidden ${className}`}
          style={containerStyle}
        >
          {/* Colored Overlay - sits behind input but shows through transparent areas */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{ backgroundColor: overlayColor }}
          />
          
          <div className="relative flex items-center gap-3 p-4">
            {/* Input Field */}
            <input
              type={type}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={placeholder}
              className={`flex-1 outline-none text-gray-900 placeholder-gray-400 text-base ${inputClassName}`}
              style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '18px', backgroundColor: 'transparent' }}
            />
            
            {/* Send Button */}
            <button
              type="submit"
              disabled={!message.trim()}
              className={`flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600
                       text-white flex items-center justify-center transition-all duration-200
                       hover:shadow-lg hover:scale-105 active:scale-95
                       disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 ${buttonClassName}`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
