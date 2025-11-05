import { useEffect, useState, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

interface TiptapTypewriterProps {
  text: string;
  speed?: number;
  className?: string;
  style?: React.CSSProperties;
  onComplete?: () => void;
}

export default function TiptapTypewriter({ 
  text, 
  speed = 30,
  className = "",
  style = {},
  onComplete 
}: TiptapTypewriterProps) {
  const [typedText, setTypedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [StarterKit],
    content: typedText,
    editable: false,
    editorProps: {
      attributes: {
        class: 'prose prose-sm focus:outline-none min-h-[50px] w-full',
      },
    },
  });

  useEffect(() => {
    if (!editor || !text) return;

    // Clear and restart typing when text changes
    setTypedText('');
    setIsTyping(true);
    editor.commands.setContent('');

    let currentIndex = 0;
    
    // Split text into words for smoother flow
    const words = text.split(' ');
    let currentText = '';
    
    const typeInterval = setInterval(() => {
      if (currentIndex < words.length) {
        currentText += (currentIndex > 0 ? ' ' : '') + words[currentIndex];
        setTypedText(currentText);
        editor.commands.setContent(currentText);
        currentIndex++;
        
        // Auto-scroll to bottom as text appears
        if (containerRef.current) {
          containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
      } else {
        clearInterval(typeInterval);
        setIsTyping(false);
        if (onComplete) {
          onComplete();
        }
      }
    }, speed * 2); // Slower, word-by-word for smoother flow

    return () => clearInterval(typeInterval);
  }, [text, speed, editor, onComplete]);

  return (
    <div 
      ref={containerRef}
      className={`tiptap-typewriter ${className}`}
      style={{
        ...style,
        minHeight: '200px',
        maxHeight: '300px',
        overflowY: 'auto',
        overflowX: 'hidden',
        display: 'flex',
        flexDirection: 'column-reverse',
       
        
      }}
    >
      <div className="relative">
        <EditorContent editor={editor} />
      </div>
      
      <style>{`
        .tiptap-typewriter {
          scrollbar-width: thin;
          scrollbar-color: rgba(156, 163, 175, 0.3) transparent;
        }
        
        .tiptap-typewriter::-webkit-scrollbar {
          width: 6px;
        }
        
        .tiptap-typewriter::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .tiptap-typewriter::-webkit-scrollbar-thumb {
          background-color: rgba(156, 163, 175, 0.3);
          border-radius: 3px;
        }
        
        .tiptap-typewriter::-webkit-scrollbar-thumb:hover {
          background-color: rgba(156, 163, 175, 0.5);
        }
        
        .tiptap-typewriter .ProseMirror {
          padding: 0.75rem 1rem;
          line-height: 1.6;
          transition: all 0.3s ease-in-out;
          word-wrap: break-word;
          white-space: pre-wrap;
        }
        .tiptap-typewriter .ProseMirror p {
          margin: 0;
          animation: fadeInSmooth 0.4s ease-in-out;
        }
        @keyframes fadeInSmooth {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
