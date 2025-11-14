import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { StreamContent } from '../tiptap/extensions/StreamContent';
import CodeBlockWithHighlight from '../tiptap/extensions/CodeBlockWithHighlight';

interface StreamingEditorProps {
  className?: string;
  style?: React.CSSProperties;
  onEditorReady?: (editor: any) => void;
  placeholder?: string;
}

/**
 * Phase 1.1: Clean Tiptap Setup
 * Phase 1.2: StreamContent Extension Integration
 */
export const StreamingEditor: React.FC<StreamingEditorProps> = ({
  className = '',
  style = {},
  onEditorReady,
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // Disable default code block
      }),
      CodeBlockWithHighlight,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      TextStyle,
      Color,
      StreamContent.configure({
        speed: 10,     // 10 words per second
        delay: 100,    // 100ms between words
        mode: 'word',  // Stream word-by-word (smoother)
      }),
    ],
    content: '',
    editable: true,
  });

  useEffect(() => {
    if (editor && onEditorReady) {
      console.log('StreamingEditor: Editor ready with extensions:', 
        editor.extensionManager.extensions.map((e: any) => e.name)
      );
      onEditorReady(editor);
    }
  }, [editor, onEditorReady]);

  if (!editor) {
    return <div>Loading editor...</div>;
  }

  return (
    <div className={`streaming-editor-wrapper ${className}`} style={style}>
      <EditorContent editor={editor} />
      <style>{`
        .streaming-editor-wrapper {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background: white;
          padding: 16px;
          min-height: 200px;
        }
        
        .streaming-editor-wrapper .ProseMirror {
          outline: none;
          min-height: 180px;
          color: #000;
          font-size: 16px;
        }
        
        .streaming-editor-wrapper .ProseMirror p {
          margin: 8px 0;
        }
        
        .streaming-editor-wrapper .ProseMirror h1 {
          font-size: 2em;
          font-weight: bold;
          margin: 16px 0 8px 0;
        }
        
        .streaming-editor-wrapper .ProseMirror h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 12px 0 6px 0;
        }
        
        .streaming-editor-wrapper .ProseMirror h3 {
          font-size: 1.25em;
          font-weight: bold;
          margin: 10px 0 4px 0;
        }
        
        .streaming-editor-wrapper .ProseMirror ul,
        .streaming-editor-wrapper .ProseMirror ol {
          padding-left: 24px;
          margin: 8px 0;
        }
        
        .streaming-editor-wrapper .ProseMirror li {
          margin: 4px 0;
        }
        
        .streaming-editor-wrapper .ProseMirror strong {
          font-weight: bold;
        }
        
        .streaming-editor-wrapper .ProseMirror em {
          font-style: italic;
        }
        
        .streaming-editor-wrapper .ProseMirror code {
          background-color: #f3f4f6;
          padding: 2px 6px;
          border-radius: 3px;
          font-family: 'Courier New', monospace;
          font-size: 0.9em;
        }
        
        .streaming-editor-wrapper .ProseMirror blockquote {
          border-left: 3px solid #d1d5db;
          padding-left: 12px;
          margin: 12px 0;
          color: #6b7280;
        }
        
        .streaming-editor-wrapper .ProseMirror a {
          color: #2563eb;
          text-decoration: underline;
        }
        
        /* Table styles */
        .streaming-editor-wrapper .ProseMirror table {
          border-collapse: collapse;
          margin: 12px 0;
          width: 100%;
        }
        
        .streaming-editor-wrapper .ProseMirror table td,
        .streaming-editor-wrapper .ProseMirror table th {
          border: 1px solid #d1d5db;
          padding: 8px;
          text-align: left;
          vertical-align: top;
        }
        
        .streaming-editor-wrapper .ProseMirror table th {
          background-color: #f3f4f6;
          font-weight: bold;
        }
        
        .streaming-editor-wrapper .ProseMirror table tr:nth-child(even) {
          background-color: #f9fafb;
        }
      `}</style>
    </div>
  );
};

export default StreamingEditor;
