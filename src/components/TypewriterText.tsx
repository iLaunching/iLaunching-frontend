import { useEffect, useState, useRef } from 'react';

interface TypewriterTextProps {
  text: string;
  speed?: number; // milliseconds per character
  className?: string;
  style?: React.CSSProperties;
  onComplete?: () => void;
}

export default function TypewriterText({ 
  text, 
  speed = 30,
  className = "",
  style = {},
  onComplete 
}: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const previousTextRef = useRef('');

  useEffect(() => {
    // Clear and restart when new text is detected
    if (text !== previousTextRef.current) {
      setDisplayedText('');
      setIsTyping(true);
      previousTextRef.current = text;

      let currentIndex = 0;
      
      const typeInterval = setInterval(() => {
        if (currentIndex < text.length) {
          setDisplayedText(text.slice(0, currentIndex + 1));
          currentIndex++;
        } else {
          clearInterval(typeInterval);
          setIsTyping(false);
          if (onComplete) {
            onComplete();
          }
        }
      }, speed);

      return () => clearInterval(typeInterval);
    }
  }, [text, speed, onComplete]);

  return (
    <div 
      className={`min-h-[50px] w-full px-4 py-3 ${className}`}
      style={{
        ...style,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        lineHeight: '1.6',
      }}
    >
      <div className="relative">
        {displayedText}
        {isTyping && (
          <span className="inline-block w-0.5 h-5 bg-gray-900 ml-0.5 animate-pulse" />
        )}
      </div>
    </div>
  );
}
