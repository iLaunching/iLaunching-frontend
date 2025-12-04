import { useEffect, useRef } from 'react';

interface SimpleTypewriterProps {
  text: string;
  speed?: number;
  className?: string;
  style?: React.CSSProperties;
  onComplete?: () => void;
}

export default function SimpleTypewriter({ 
  text, 
  speed = 30,
  className = "",
  style = {},
  onComplete
}: SimpleTypewriterProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hasTypedRef = useRef(false);

  useEffect(() => {
    console.log('SimpleTypewriter mounted with text:', text);
    
    // Prevent re-typing if already completed
    if (hasTypedRef.current) {
      console.log('Already typed, skipping');
      return;
    }

    if (!containerRef.current || !text) {
      console.log('Missing container or text');
      return;
    }

    hasTypedRef.current = true;
    const container = containerRef.current;
    container.innerHTML = ''; // Clear any existing content
    
    // Split text into words while preserving spaces
    const parts = text.split(/(\s+)/);
    let wordCount = 0;
    
    // Add all words at once with staggered animation delays
    parts.forEach((part) => {
      if (/^\s+$/.test(part)) {
        // This is whitespace - add directly without animation
        container.appendChild(document.createTextNode(part));
      } else if (part.trim().length > 0) {
        // This is an actual word - add with wave animation
        const wordSpan = document.createElement('span');
        wordSpan.className = 'wave-word';
        wordSpan.style.animationDelay = `${wordCount * 0.03}s`;
        wordSpan.textContent = part;
        container.appendChild(wordSpan);
        wordCount++;
      }
    });
    
    console.log('Added', wordCount, 'words with wave animation');
    
    // Calculate total animation time and call onComplete
    const totalAnimationTime = (wordCount * 0.03 + 0.25) * 1000; // 0.03s delay per word + 0.25s animation duration
    const completeTimeout = setTimeout(() => {
      console.log('Typing complete');
      if (onComplete) {
        onComplete();
      }
    }, totalAnimationTime);

    return () => {
      console.log('SimpleTypewriter unmounting');
      clearTimeout(completeTimeout);
      // Reset for next mount
      hasTypedRef.current = false;
    };
  }, [text, speed, onComplete]);

  return (
    <>
      <div 
        ref={containerRef}
        className={`simple-typewriter ${className}`}
        style={style}
      />
      <style>{`
        .simple-typewriter {
          text-align: center;
        }
        
        .simple-typewriter .wave-word {
          display: inline-block;
          animation: fadeInUp 0.25s ease-out forwards;
          opacity: 0;
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
