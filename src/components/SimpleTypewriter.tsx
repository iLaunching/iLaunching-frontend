import { useEffect, useRef } from 'react';

interface SimpleTypewriterProps {
  text: string;
  speed?: number;
  className?: string;
  style?: React.CSSProperties;
  onComplete?: () => void;
  highlightColor?: string;
  customColor?: string;
}

export default function SimpleTypewriter({ 
  text, 
  speed = 30,
  className = "",
  style = {},
  onComplete,
  highlightColor,
  customColor
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
    
    // Parse markdown syntax before processing
    interface TextSegment {
      text: string;
      bold?: boolean;
      italic?: boolean;
      code?: boolean;
      strikethrough?: boolean;
      underline?: boolean;
      highlight?: boolean;
      colored?: boolean;
    }
    
    const parseMarkdown = (text: string): TextSegment[] => {
      const segments: TextSegment[] = [];
      
      // Combined regex to match all markdown patterns
      // Order matters: more specific patterns first
      // ==text== for highlight, {{text}} for color, **text** for bold, *text* for italic, etc.
      const markdownRegex = /(==(.+?)==)|(\{\{(.+?)\}\})|(\*\*\*(.+?)\*\*\*)|(\*\*(.+?)\*\*)|(\*(.+?)\*)|(~~(.+?)~~)|(__(.+?)__)|(_(.+?)_)|(`(.+?)`)/g;
      
      let lastIndex = 0;
      let match;
      
      while ((match = markdownRegex.exec(text)) !== null) {
        // Add text before the markdown part
        if (match.index > lastIndex) {
          segments.push({ text: text.slice(lastIndex, match.index) });
        }
        
        // Determine which markdown pattern matched and add the styled segment
        if (match[1]) {
          // ==text== - highlight
          segments.push({ text: match[2], highlight: true });
        } else if (match[3]) {
          // {{text}} - custom color
          segments.push({ text: match[4], colored: true });
        } else if (match[5]) {
          // ***text*** - bold and italic
          segments.push({ text: match[6], bold: true, italic: true });
        } else if (match[7]) {
          // **text** - bold
          segments.push({ text: match[8], bold: true });
        } else if (match[9]) {
          // *text* - italic
          segments.push({ text: match[10], italic: true });
        } else if (match[11]) {
          // ~~text~~ - strikethrough
          segments.push({ text: match[12], strikethrough: true });
        } else if (match[13]) {
          // __text__ - underline
          segments.push({ text: match[14], underline: true });
        } else if (match[15]) {
          // _text_ - italic (alternative)
          segments.push({ text: match[16], italic: true });
        } else if (match[17]) {
          // `code` - inline code
          segments.push({ text: match[18], code: true });
        }
        
        lastIndex = markdownRegex.lastIndex;
      }
      
      // Add remaining text after last markdown part
      if (lastIndex < text.length) {
        segments.push({ text: text.slice(lastIndex) });
      }
      
      return segments.length > 0 ? segments : [{ text }];
    };
    
    const segments = parseMarkdown(text);
    let wordCount = 0;
    
    // Process each segment
    segments.forEach((segment) => {
      // Special handling for highlighted segments - keep them as one unit
      if (segment.highlight && highlightColor) {
        // For highlighted text, keep the whole segment together
        const highlightSpan = document.createElement('span');
        highlightSpan.className = 'wave-word';
        highlightSpan.style.animationDelay = `${wordCount * 0.03}s`;
        highlightSpan.textContent = segment.text;
        highlightSpan.style.backgroundColor = highlightColor;
        highlightSpan.style.padding = '2px 6px';
        highlightSpan.style.borderRadius = '4px';
        
        // Apply other styling if needed
        if (segment.bold) {
          highlightSpan.style.fontWeight = 'bold';
        }
        if (segment.italic) {
          highlightSpan.style.fontStyle = 'italic';
        }
        
        container.appendChild(highlightSpan);
        wordCount++;
        return; // Skip the rest of the processing for this segment
      }
      
      // Split segment into words while preserving spaces and newlines
      const parts = segment.text.split(/(\s+)/);
      
      // Add all words at once with staggered animation delays
      parts.forEach((part) => {
        if (/^\s+$/.test(part)) {
          // Check if this whitespace contains newlines
          if (part.includes('\n')) {
            // Replace newlines with <br> elements
            const lines = part.split('\n');
            lines.forEach((line, index) => {
              if (index > 0) {
                container.appendChild(document.createElement('br'));
              }
              if (line) {
                container.appendChild(document.createTextNode(line));
              }
            });
          } else {
            // Regular whitespace - add directly without animation
            container.appendChild(document.createTextNode(part));
          }
        } else if (part.trim().length > 0) {
          // This is an actual word - add with wave animation
          const wordSpan = document.createElement('span');
          wordSpan.className = 'wave-word';
          wordSpan.style.animationDelay = `${wordCount * 0.03}s`;
          wordSpan.textContent = part;
          
          // Apply styling based on segment properties
          if (segment.bold) {
            wordSpan.style.fontWeight = 'bold';
          }
          if (segment.italic) {
            wordSpan.style.fontStyle = 'italic';
          }
          if (segment.code) {
            wordSpan.style.fontFamily = 'monospace';
            wordSpan.style.backgroundColor = 'rgba(150, 150, 150, 0.1)';
            wordSpan.style.padding = '2px 4px';
            wordSpan.style.borderRadius = '3px';
            wordSpan.style.fontSize = '0.9em';
          }
          if (segment.strikethrough) {
            wordSpan.style.textDecoration = 'line-through';
          }
          if (segment.underline) {
            wordSpan.style.textDecoration = 'underline';
          }
          if (segment.colored && customColor) {
            wordSpan.style.color = customColor;
          }
          
          container.appendChild(wordSpan);
          wordCount++;
        }
      });
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
          text-align: left;
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
