import React, { useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Query from './tiptap/Query';
import AiIndicator from './tiptap/AiIndicator';

interface ChatWindowEditorV2Props {
  text: string;
  speed?: number;
  className?: string;
  style?: React.CSSProperties;
  onComplete?: () => void;
  onEditorReady?: (editor: any) => void;
  scrollContainer?: boolean;
  aiIndicator?: {
    aiName?: string;
    aiAcknowledge?: string;
    show: boolean;
  };
}

export const ChatWindowEditorV2: React.FC<ChatWindowEditorV2Props> = ({
  text,
  className = '',
  style = {},
  onComplete,
  onEditorReady,
  aiIndicator
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const aiIndicatorNodeRef = useRef<any>(null);

  // Create editor instance
  const editor = useEditor({
    extensions: [
      StarterKit,
      TaskList.configure({
        HTMLAttributes: {
          class: 'task-list',
        },
      }),
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: 'task-item',
        },
      }),
      Query,
      AiIndicator,
    ],
    content: '',
    editable: false,
  });

  // Expose editor when ready
  useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor);
    }
  }, [editor, onEditorReady]);

  // Main text processing effect
  useEffect(() => {
    if (!editor || !text) return;

    console.log('ChatWindowEditorV2: Processing text:', text.substring(0, 100) + '...');
    
    // Step 1: Initialize with AI indicator if needed
    if (aiIndicator && aiIndicator.show) {
      console.log('ChatWindowEditorV2: Initializing with AI indicator');
      
      // Create AI indicator node
      if (!aiIndicatorNodeRef.current) {
        aiIndicatorNodeRef.current = {
          type: 'aiIndicator',
          attrs: {
            aiName: aiIndicator.aiName || 'AI Assistant',
            aiAcknowledge: aiIndicator.aiAcknowledge || '',
            text: '',
            id: 'main-ai-indicator'
          }
        };
      }

      // Set initial content with just AI indicator
      editor.commands.setContent({
        type: 'doc',
        content: [aiIndicatorNodeRef.current]
      });
    } else {
      // No AI indicator - start empty
      editor.commands.setContent('');
    }

    // Step 2: For now, just set the text directly (we'll add animation later)
    console.log('ChatWindowEditorV2: Setting text content');
    
    if (aiIndicator && aiIndicator.show) {
      // Build content with AI indicator at the end
      const fullContent = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: text }]
          },
          aiIndicatorNodeRef.current
        ]
      };
      editor.commands.setContent(fullContent);
    } else {
      // Just set the text
      editor.commands.setContent(text);
    }

    // Call onComplete when done
    if (onComplete) {
      setTimeout(onComplete, 100);
    }

  }, [text, editor, aiIndicator, onComplete]);

  if (!editor) {
    return <div>Loading editor...</div>;
  }

  return (
    <div 
      ref={containerRef}
      className={`chat-window-editor-v2 ${className}`}
      style={style}
    >
      <EditorContent editor={editor} />
      
      {/* Basic styles */}
      <style>{`
        .chat-window-editor-v2 {
          width: 100%;
          height: 100%;
        }
        
        .chat-window-editor-v2 .ProseMirror {
          outline: none;
          padding: 12px;
          font-family: inherit;
          font-size: 14px;
          line-height: 1.6;
          color: inherit;
        }
        
        .chat-window-editor-v2 .ProseMirror p {
          margin: 0.5em 0;
        }
        
        .chat-window-editor-v2 .ProseMirror p:first-child {
          margin-top: 0;
        }
        
        .chat-window-editor-v2 .ProseMirror p:last-child {
          margin-bottom: 0;
        }
      `}</style>
    </div>
  );
};

export default ChatWindowEditorV2;