import { useState, useRef, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Send, Mic } from 'lucide-react';

interface RichTextInputProps {
  onSubmit: (content: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  maxHeight?: number;
  onVoiceClick?: () => void;
}

export default function RichTextInput({
  onSubmit,
  placeholder = "Type your message...",
  disabled = false,
  className = "",
  maxHeight = 200,
  onVoiceClick
}: RichTextInputProps) {
  const [isEmpty, setIsEmpty] = useState(true);
  const editorRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Configure which features to include
        heading: false, // Disable headings for chat
        codeBlock: false, // Disable code blocks for simplicity
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'rich-text-input-editor',
        'data-placeholder': placeholder,
      },
    },
    onUpdate: ({ editor }) => {
      const content = editor.getText();
      setIsEmpty(content.trim().length === 0);
    },
    onCreate: () => {
      setIsEmpty(true);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editor || isEmpty || disabled) return;

    const content = editor.getHTML();
    const textContent = editor.getText().trim();
    
    if (textContent) {
      onSubmit(content);
      editor.commands.clearContent();
      setIsEmpty(true);
    }
  };

  const handleVoiceClick = () => {
    if (onVoiceClick) {
      onVoiceClick();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  useEffect(() => {
    // Focus the editor on mount
    if (editor) {
      editor.commands.focus();
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className={`rich-text-input-container ${className}`}>
      <form onSubmit={handleSubmit}>
        <div className="rich-text-input-wrapper">
          {/* Editor Area */}
          <div className="rich-text-editor-wrapper" onKeyDown={handleKeyDown}>
            <EditorContent 
              editor={editor} 
              className="rich-text-editor-content"
              ref={editorRef}
            />
          </div>
          
          {/* Submit Area - Below the input */}
          <div className="rich-text-submit-area">
            {/* Voice Button */}
            <button
              type="button"
              onClick={handleVoiceClick}
              disabled={disabled}
              className="rich-text-voice-btn"
              title="Voice message"
            >
              <Mic className="w-4 h-4" />
            </button>
            
            {/* Send Button */}
            <button
              type="submit"
              disabled={isEmpty || disabled}
              className="rich-text-submit-btn"
              title="Send message (Enter)"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>

      <style>{`
        .rich-text-input-container {
          width: 100%;
        }

        .rich-text-input-wrapper {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .rich-text-editor-wrapper {
          position: relative;
          min-height: 60px;
          max-height: ${maxHeight}px;
        }

        .rich-text-editor-content {
          width: 100%;
          padding: 16px;
          max-height: ${maxHeight}px;
          overflow-y: auto;
        }

        .rich-text-input-editor {
          outline: none;
          border: none;
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 16px;
          line-height: 1.5;
          color: #374151;
        }

        .rich-text-input-editor p {
          margin: 0;
          line-height: 1.5;
        }

        .rich-text-input-editor p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #9ca3af;
          pointer-events: none;
          height: 0;
        }

        .rich-text-input-editor strong {
          font-weight: 600;
        }

        .rich-text-input-editor em {
          font-style: italic;
        }

        .rich-text-input-editor ul,
        .rich-text-input-editor ol {
          margin: 8px 0;
          padding-left: 20px;
        }

        .rich-text-input-editor li {
          margin: 4px 0;
        }

        .rich-text-submit-area {
          padding: 12px 16px;
          border-top: 1px solid #f3f4f6;
          background: #f9fafb;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 8px;
        }

        .rich-text-voice-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 1px solid #e5e7eb;
          background: white;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        .rich-text-voice-btn:hover:not(:disabled) {
          background: #f9fafb;
          color: #374151;
          border-color: #d1d5db;
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .rich-text-voice-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          transform: none;
        }

        .rich-text-submit-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: none;
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          color: white;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
        }

        .rich-text-submit-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
        }

        .rich-text-submit-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          transform: none;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }

        /* Custom scrollbar for editor */
        .rich-text-editor-content::-webkit-scrollbar {
          width: 4px;
        }

        .rich-text-editor-content::-webkit-scrollbar-track {
          background: #f1f5f9;
        }

        .rich-text-editor-content::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 2px;
        }

        .rich-text-editor-content::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}