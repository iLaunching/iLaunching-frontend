import { useState, useRef, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CodeBlock from '@tiptap/extension-code-block';
import { Send, Mic, Plus, X, UploadCloud, LayoutDashboard, Monitor } from 'lucide-react';
import DropdownMenu, { type MenuOption } from './DropdownMenu';

interface RichTextInputProps {
  onSubmit: (content: any) => void; // Changed to accept JSON content
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  maxHeight?: number;
  onVoiceClick?: () => void;
  onPlusClick?: () => void;
}

export default function RichTextInput({
  onSubmit,
  placeholder = "Type your message...",
  disabled = false,
  className = "",
  maxHeight = 200,
  onVoiceClick,
  onPlusClick
}: RichTextInputProps) {
  const [isEmpty, setIsEmpty] = useState(true);
  const [currentMenu, setCurrentMenu] = useState<'main' | 'import'>('main');
  const editorRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false, // Disable headings for chat
        codeBlock: false, // We'll use custom CodeBlock extension
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      CodeBlock.configure({
        HTMLAttributes: {
          class: 'code-block-input',
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Type your message...',
        emptyEditorClass: 'is-editor-empty',
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'rich-text-input-editor',
        'data-placeholder': placeholder,
      },
      handlePaste: (view, event) => {
        const text = event.clipboardData?.getData('text/plain');
        if (!text) return false;

        const lines = text.split('\n');
        
        // First, check for numbered lists (lines starting with "1. ", "2. ", etc.)
        const numberedListPattern = /^\d+\.\s+/;
        const numberedListLines = lines.filter(line => numberedListPattern.test(line.trim()));
        const isNumberedList = numberedListLines.length >= 2 && numberedListLines.length / lines.filter(l => l.trim()).length > 0.5;

        if (isNumberedList) {
          event.preventDefault();
          const items = lines
            .filter(line => line.trim() && numberedListPattern.test(line.trim()))
            .map(line => line.replace(numberedListPattern, '').trim());
          
          editor?.commands.insertContent({
            type: 'orderedList',
            content: items.map(item => ({
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: item }] }],
            })),
          });
          return true;
        }

        // Check for bullet lists (lines starting with "- " or "* " but NOT markdown headers)
        const bulletListPattern = /^[-*]\s+/;
        const bulletListLines = lines.filter(line => {
          const trimmed = line.trim();
          return bulletListPattern.test(trimmed) && !trimmed.startsWith('---') && !trimmed.startsWith('***');
        });
        const isBulletList = bulletListLines.length >= 2 && bulletListLines.length / lines.filter(l => l.trim()).length > 0.5;

        if (isBulletList) {
          event.preventDefault();
          const items = bulletListLines.map(line => line.replace(bulletListPattern, '').trim());
          
          editor?.commands.insertContent({
            type: 'bulletList',
            content: items.map(item => ({
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: item }] }],
            })),
          });
          return true;
        }

        // Check if content is wrapped in markdown code fence
        const codeBlockPattern = /^```[\w]*\n([\s\S]*?)\n```$/;
        const codeBlockMatch = text.match(codeBlockPattern);
        
        if (codeBlockMatch) {
          event.preventDefault();
          editor?.commands.insertContent({
            type: 'codeBlock',
            content: [{ type: 'text', text: codeBlockMatch[1] }],
          });
          return true;
        }

        // Detect PURE code blocks (no mixed prose)
        // Count code-like lines vs prose-like lines
        let codeLines = 0;
        let proseLines = 0;
        
        lines.forEach(line => {
          const trimmed = line.trim();
          if (!trimmed) return;
          
          // Code indicators
          const isCodeLine = 
            /^(function|const|let|var|class|interface|type|enum|def|import|export|from|async|await)\s+/.test(trimmed) ||
            /^(if|else|for|while|return|yield|try|catch)\s*[({]/.test(trimmed) ||
            /[{}\[\]();]$/.test(trimmed) ||
            /^\s{4,}/.test(line) || // Indented
            /=>/.test(trimmed) ||
            /^\/\/|^\/\*|^\*/.test(trimmed); // Comments
          
          // Prose indicators (sentences with many words, no code symbols)
          const words = trimmed.split(/\s+/).length;
          const hasCodeSymbols = /[{}\[\]();=]/.test(trimmed);
          const isProseLine = words >= 8 && !hasCodeSymbols;
          
          if (isCodeLine && !isProseLine) {
            codeLines++;
          } else if (isProseLine) {
            proseLines++;
          }
        });

        const totalSignificantLines = codeLines + proseLines;
        const isPredomintantlyCode = totalSignificantLines > 0 && (codeLines / totalSignificantLines) > 0.7;

        // Only treat as code if >70% of significant lines are code-like AND has few prose lines
        if (isPredomintantlyCode && proseLines < 3) {
          event.preventDefault();
          const cleanCode = text.trim();
          editor?.commands.insertContent({
            type: 'codeBlock',
            content: [{ type: 'text', text: cleanCode }],
          });
          return true;
        }

        return false; // Let Tiptap handle normal paste (mixed content or prose)
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

    const content = editor.getJSON(); // Get JSON instead of HTML for better structure
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

  const handlePlusClick = () => {
    if (onPlusClick) {
      onPlusClick();
    }
  };

  // Define menu options for the plus button
  const plusMenuOptions: MenuOption[] = [
    {
      id: 'upload-file',
      label: 'Upload',
      icon: <UploadCloud size={22} />,
      onClick: () => {
        console.log('Upload file clicked');
        // Add your file upload logic here
      },
    },
    {
      id: 'import-dashboard',
      label: 'Import', 
      icon: <LayoutDashboard size={22} />,
      className: 'import-menu-item',
      keepMenuOpen: true,
      onClick: () => {
        setCurrentMenu('import');
        console.log('Navigated to import menu');
      },
    },
    {
      id: 'take-screenshot',
      label: 'Take Screenshot',
      icon: <Monitor size={22} />,
      onClick: () => {
        console.log('Take screenshot clicked');
        // Add your screenshot capture logic here
      },
    },
  ];

  const importMenuOptions: MenuOption[] = [
    {
      id: 'back-to-main',
      label: 'Import',
      icon: <></>,
      keepMenuOpen: true,
      onClick: () => {
        setCurrentMenu('main');
        console.log('Back to main menu');
      },
    },
    {
      id: 'google-drive',
      label: 'Google Drive',
      icon: (
        <img 
          src="/google-drive-logo.svg" 
          alt="Google Drive" 
          style={{ width: '22px', height: '22px', objectFit: 'contain' }}
        />
      ),
      onClick: () => {
        console.log('Google Drive clicked');
        // Add your Google Drive integration logic here
      },
    },
    {
      id: 'dropbox',
      label: 'Dropbox',
      icon: (
        <img 
          src="/dropbox-logo.svg" 
          alt="Dropbox" 
          style={{ width: '22px', height: '22px', objectFit: 'contain' }}
        />
      ),
      onClick: () => {
        console.log('Dropbox clicked');
        // Add your Dropbox integration logic here
      },
    },
    {
      id: 'onedrive',
      label: 'OneDrive',
      icon: (
        <img 
          src="/onedrive-logo.svg" 
          alt="OneDrive" 
          style={{ width: '22px', height: '22px', objectFit: 'contain' }}
        />
      ),
      onClick: () => {
        console.log('OneDrive clicked');
        // Add your OneDrive integration logic here
      },
    },
  ];

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
            {/* Plus Button with Dropdown Menu - Left side */}
            <DropdownMenu
              trigger={(isOpen) => (
                <div className="rich-text-plus-btn-content">
                  <div className={`icon-container ${isOpen ? 'icon-open' : ''}`}>
                    {isOpen ? (
                      <X className="w-5 h-5" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                  </div>
                </div>
              )}
              options={currentMenu === 'main' ? plusMenuOptions : importMenuOptions}
              position="top"
              triggerClassName="rich-text-plus-btn-dropdown tooltip-trigger tooltip-right"
              className={currentMenu === 'main' ? "plus-button-menu" : "import-button-menu"}
              disabled={disabled}
              tooltip="Insert files for reference"
            />
            
            {/* Spacer to push voice and send buttons to the right */}
            <div className="rich-text-spacer" />
            
            {/* Voice Button */}
            <button
              type="button"
              onClick={handleVoiceClick}
              disabled={disabled}
              className="rich-text-voice-btn tooltip-trigger"
              data-tooltip="Chat using voice"
            >
              <Mic className="w-4 h-4" />
            </button>
            
            {/* Send Button */}
            <button
              type="submit"
              disabled={isEmpty || disabled}
              className="rich-text-submit-btn tooltip-trigger"
              data-tooltip="Submit"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          {/* Additional Button Section with Gradient Overlay Background */}
          <div className="rich-text-additional-section">
            <div className="rich-text-additional-buttons">
              {/* Add your buttons here */}
            </div>
          </div>
        </div>
      </form>

      <style>{`
        .rich-text-input-container {
          width: 100%;
          position: relative;
          z-index: 10;
          overflow: visible;
        }

        .rich-text-input-wrapper {
          background: white;
          border-left: 1px solid #9333EA;
          border-right: 1px solid #2563EB;
          border-top: 1px solid #9333EA;
          border-bottom: 1px solid #2563EB;
          border-radius: 12px;
          overflow: visible;
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
          width: 100%;
          min-height: 60px;
          resize: none;
        }

        /* Placeholder styles for empty editor */
        .rich-text-editor-content .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
          font-style: italic;
          float: left;
          height: 0;
        }        .rich-text-input-editor p {
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
          padding-left: 24px;
        }

        .rich-text-input-editor ul {
          list-style-type: disc;
        }

        .rich-text-input-editor ol {
          list-style-type: decimal;
        }

        .rich-text-input-editor li {
          margin: 2px 0;
          padding-left: 4px;
        }

        .rich-text-input-editor li p {
          margin: 0;
        }

        /* Code block styling - lightweight like Claude */
        .rich-text-input-editor pre {
          background: #f3f4f6;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          padding: 12px;
          margin: 8px 0;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 14px;
          line-height: 1.5;
          overflow-x: auto;
          color: #1f2937;
        }

        .rich-text-input-editor pre code {
          background: none;
          border: none;
          padding: 0;
          font-size: inherit;
          color: inherit;
        }

        .rich-text-input-editor code {
          background: #f3f4f6;
          border: 1px solid #e5e7eb;
          border-radius: 3px;
          padding: 2px 6px;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 14px;
          color: #ef4444;
        }

        .rich-text-submit-area {
          padding: 12px 16px;
          border-top: 1px solid #f3f4f6;
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          position: relative;
          overflow: visible;
        }

        .rich-text-spacer {
          flex: 1;
        }

        .rich-text-plus-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 1px solid #e5e7eb;
          background: white;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        .rich-text-plus-btn-dropdown {
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          width: 40px !important;
          height: 40px !important;
          border-radius: 50% !important;
          border: 1px solid #e5e7eb !important;
          background: white !important;
          color: #6b7280 !important;
          cursor: pointer !important;
          transition: all 0.2s ease !important;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important;
          padding: 0 !important;
        }

        .rich-text-plus-btn-content {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
        }

        .icon-container {
          transition: transform 0.3s ease-in-out;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .icon-container.icon-open {
          transform: rotate(180deg) scale(1.1);
        }

        .rich-text-plus-btn:hover:not(:disabled) {
          background: #f9fafb;
          color: #374151;
          border-color: #d1d5db;
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .rich-text-plus-btn-dropdown:hover:not(:disabled),
        .rich-text-plus-btn-dropdown.active:not(:disabled) {
          background: #f9fafb !important;
          color: #374151 !important;
          border-color: #d1d5db !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
        }

        .rich-text-plus-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          transform: none;
        }

        .rich-text-voice-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
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
          width: 40px;
          height: 40px;
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

        /* Modern Dark Tooltips with Speech Bubble Design */
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

        /* Hide tooltips when dropdown is active */
        .tooltip-trigger.active:hover::before,
        .tooltip-trigger.active:hover::after {
          opacity: 0;
          visibility: hidden;
        }

        /* Right-positioned tooltip for plus button */
        .tooltip-right::before {
          bottom: auto;
          left: calc(100% + 18px);
          top: 50%;
          transform: translateY(-50%);
        }

        .tooltip-right::after {
          bottom: auto;
          left: calc(100% + 13px);
          top: 50%;
          transform: translateY(-50%);
          box-shadow: 
            0 2px 6px rgba(0, 0, 0, 0.2),
            -14px 0px 0 -2.5px #111827;
        }

        /* Submit button tooltip always shows, even when disabled */
        .rich-text-submit-btn.tooltip-trigger:disabled:hover::before,
        .rich-text-submit-btn.tooltip-trigger:disabled:hover::after {
          opacity: 1 !important;
          visibility: visible !important;
        }

        /* Plus button specific positioning - center right */
        .rich-text-plus-btn.tooltip-trigger::before {
          bottom: 50% !important;
          left: calc(100% + 18px) !important;
          transform: translateY(50%) translateX(0) !important;
        }

        .rich-text-plus-btn.tooltip-trigger::after {
          bottom: 50% !important;
          left: calc(100% + 13px) !important;
          transform: translateY(50%) translateX(0) !important;
          box-shadow: 
            0 2px 6px rgba(0, 0, 0, 0.2),
            -14px 0px 0 -2.5px #111827 !important;
        }

        /* Voice button specific positioning - center left */
        .rich-text-voice-btn.tooltip-trigger::before {
          bottom: 50% !important;
          right: calc(100% + 18px) !important;
          left: auto !important;
          transform: translateY(50%) translateX(0) !important;
        }

        .rich-text-voice-btn.tooltip-trigger::after {
          bottom: 50% !important;
          right: calc(100% + 13px) !important;
          left: auto !important;
          transform: translateY(50%) translateX(0) !important;
          box-shadow: 
            0 2px 6px rgba(0, 0, 0, 0.2),
            14px 0px 0 -2.5px #111827 !important;
        }

        /* Additional Button Section with White Background and Gradient Overlay */
        .rich-text-additional-section {
          background: white;
          background: linear-gradient(90deg, rgba(147, 51, 234, 0.1) 30%, rgba(37, 99, 235, 0.1) 76%);
          border-radius: 0 0 8px 8px;
        }

        .rich-text-additional-buttons {
          display: flex;
          gap: 8px;
          align-items: center;
          justify-content: center;
          min-height: 5px;
        }

        /* Plus Button Menu Specific Styling */
        .plus-button-menu .dropdown-menu {
          background: #ffffff !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
          border-radius: 12px !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08) !important;
          backdrop-filter: blur(10px) !important;
          min-width: 300px !important;
          max-width: 320px !important;
          width: 100% !important;
        }

        .plus-button-menu .dropdown-option {
          color: #000000 !important;
          border-radius: 0px !important;
          margin: 0px !important;
          padding: 10px 16px !important;
          font-weight: 400 !important;
          font-size: 15px !important;
        }

        .plus-button-menu .dropdown-option:hover:not(.disabled) {
          background: #d6d6d630 !important;
          /* transform: translateX(2px) !important; */
          /* transition: all 0.2s ease !important; */
        }

        .plus-button-menu .option-icon {
          filter: brightness(1.2) !important;
        }

        .plus-button-menu .import-menu-item::after {
          content: '›' !important;
          position: absolute !important;
          right: 16px !important;
          font-size: 18px !important;
          color: #666666 !important;
          font-weight: bold !important;
        }

        .plus-button-menu .import-menu-item {
          position: relative !important;
        }

        /* Import Button Menu Specific Styling */
        .import-button-menu .dropdown-menu {
          background: #ffffff !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
          border-radius: 12px !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08) !important;
          backdrop-filter: blur(10px) !important;
          min-width: 300px !important;
          max-width: 320px !important;
          width: 100% !important;
        }

        .import-button-menu .dropdown-option {
          color: #000000 !important;
          border-radius: 0px !important;
          margin: 0px !important;
          padding: 8px 16px !important;
          font-weight: 400 !important;
          font-size: 15px !important;
        }

        .import-button-menu .dropdown-option:hover:not(.disabled) {
          background: #d6d6d630 !important;
          /* transform: translateX(2px) !important; */
          /* transition: all 0.2s ease !important; */
        }

        .import-button-menu .option-icon {
          filter: brightness(1.2) !important;
        }


      `}</style>
    </div>
  );
}