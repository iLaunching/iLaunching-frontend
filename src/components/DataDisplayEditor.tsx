import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from 'tiptap-markdown';

interface DataDisplayEditorProps {
  value?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * DataDisplayEditor Component
 * A read-only Markdown display component that renders Markdown content
 */
export const DataDisplayEditor: React.FC<DataDisplayEditorProps> = ({
  value = '',
  className = '',
  style = {},
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Markdown.configure({
        html: true,
        transformPastedText: true,
        transformCopiedText: false,
      }),
    ],
    content: '',
    editable: false, // Read-only
    editorProps: {
      attributes: {
        class: 'data-display-content',
      },
    },
  });

  // Update editor content when value prop changes
  useEffect(() => {
    if (editor && value) {
      // Convert escaped newlines from database to actual newlines
      const cleanedMarkdown = value.replace(/\\n/g, '\n');
      // Use the Markdown extension to parse the Markdown string into nodes
      editor.commands.setContent(cleanedMarkdown);
    }
  }, [value, editor]);

  if (!editor) {
    return <div>Loading...</div>;
  }

  return (
    <div className={`data-display-wrapper ${className}`} style={style}>
      <EditorContent editor={editor} />

      <style>{`
        .data-display-wrapper {
          font-family: 'Work Sans', sans-serif;
        }
        
        .data-display-wrapper .data-display-content {
          outline: none;
        }
        
        .data-display-wrapper .ProseMirror {
          outline: none;
          color: #000;
          font-size: 14px;
          font-family: 'Work Sans', sans-serif;
          line-height: 1.6;
        }
        
        .data-display-wrapper .ProseMirror p {
          margin: 6px 0;
        }
        
        .data-display-wrapper .ProseMirror h1 {
          font-size: 1.75em;
          font-weight: 600;
          margin: 12px 0 6px 0;
        }
        
        .data-display-wrapper .ProseMirror h2 {
          font-size: 1.4em;
          font-weight: 600;
          margin: 10px 0 5px 0;
        }
        
        .data-display-wrapper .ProseMirror h3 {
          font-size: 1.15em;
          font-weight: 600;
          margin: 8px 0 4px 0;
        }
        
        .data-display-wrapper .ProseMirror strong {
          font-weight: 600;
        }
        
        .data-display-wrapper .ProseMirror em {
          font-style: italic;
        }
        
        .data-display-wrapper .ProseMirror s {
          text-decoration: line-through;
        }
        
        .data-display-wrapper .ProseMirror ul,
        .data-display-wrapper .ProseMirror ol {
          padding-left: 24px;
          margin: 8px 0;
        }
        
        .data-display-wrapper .ProseMirror li {
          margin: 4px 0;
        }
        
        .data-display-wrapper .ProseMirror code {
          background-color: #f3f4f6;
          padding: 2px 6px;
          border-radius: 3px;
          font-family: 'Courier New', monospace;
          font-size: 0.9em;
          color: #e11d48;
        }
        
        .data-display-wrapper .ProseMirror pre {
          background-color: #1f2937;
          color: #f3f4f6;
          padding: 12px;
          border-radius: 6px;
          overflow-x: auto;
          margin: 12px 0;
        }
        
        .data-display-wrapper .ProseMirror pre code {
          background: none;
          color: inherit;
          padding: 0;
        }
        
        .data-display-wrapper .ProseMirror blockquote {
          border-left: 4px solid #3b82f6;
          padding-left: 16px;
          margin: 12px 0;
          color: #6b7280;
          font-style: italic;
        }
        
        .data-display-wrapper .ProseMirror hr {
          border: none;
          border-top: 2px solid #e5e7eb;
          margin: 16px 0;
        }
      `}</style>
    </div>
  );
};

export default DataDisplayEditor;
