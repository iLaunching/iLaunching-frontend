import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import { TextAlign } from '@tiptap/extension-text-align';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import { FontFamily } from '@tiptap/extension-font-family';
import { Image } from '@tiptap/extension-image';
import { Youtube } from '@tiptap/extension-youtube';
import { Typography } from '@tiptap/extension-typography';
import { CharacterCount } from '@tiptap/extension-character-count';
import { Focus } from '@tiptap/extension-focus';
import { TaskList } from '@tiptap/extension-task-list';
import { StreamingTaskItem } from '../tiptap/extensions/StreamingTaskItem';
import { Mathematics } from '@tiptap/extension-mathematics';
import { Placeholder } from '@tiptap/extension-placeholder';
import { StreamContent } from '../tiptap/extensions/StreamContent';
import CodeBlockWithHighlight from '../tiptap/extensions/CodeBlockWithHighlight';
import CodeBlockStream from '../tiptap/extensions/CodeBlockStream';
import '../tiptap/extensions/StreamAnimation.css'; // Import CSS-only animations
import { StreamingWebSocketExtension } from '../tiptap/extensions/StreamingWebSocketExtension';
import { AiIndicator } from '../tiptap/AiIndicator';
import { Query } from '../tiptap/Query';
import { AITurn } from '../tiptap/extensions/AITurn';
import { DataTurn } from '../tiptap/extensions/DataTurn';
import { Response } from '../tiptap/extensions/Response';

interface InAppEditorProps {
  className?: string;
  style?: React.CSSProperties;
  onEditorReady?: (editor: any) => void;
  placeholder?: string;
}

/**
 * Independent Editor for In-App Chat
 */
export const InAppEditor: React.FC<InAppEditorProps> = ({
  className = '',
  style = {},
  onEditorReady,
}) => {
  const editor = useEditor({
    extensions: [
      // Core editing - StarterKit includes: bold, italic, strike, code, paragraph, text, doc, etc.
      StarterKit.configure({
        codeBlock: false, // Using custom CodeBlockStream instead
      }),

      CodeBlockStream, // Enhanced codeBlock with streaming, syntax highlighting, auto-detect
      CodeBlockWithHighlight, // Custom codeBlockHighlight for manual use
      AiIndicator, // AI response indicator with animated icon
      AITurn, // Parent node wrapping Query + Response for conversation turns
      DataTurn, // Parent node for system messages (welcome, transitions, etc.)
      Query, // User query node with avatar and background colors
      Response, // AI response node with streaming support (animations via CSS)

      // Text formatting
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true, // Support multiple highlight colors
        HTMLAttributes: {
          class: 'highlight',
        },
      }),

      // Text alignment
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
      }),

      // Special formatting
      Subscript,
      Superscript,
      FontFamily,
      Typography, // Smart quotes, em dashes, ellipsis

      // Rich content
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Youtube.configure({
        width: 640,
        height: 480,
      }),

      // Tables
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,

      // Task lists
      TaskList,
      StreamingTaskItem.configure({
        nested: true,
      }),

      // Mathematics
      Mathematics.configure({
        katexOptions: {
          throwOnError: false,
        },
      }),

      // Advanced features
      CharacterCount,
      Focus.configure({
        className: 'has-focus',
        mode: 'all',
      }),
      Placeholder.configure({
        placeholder: 'Start typing or ask for streaming content...',
      }),

      // Streaming
      StreamContent.configure({
        speed: 10,     // 10 words per second
        delay: 100,    // 100ms between words
        mode: 'word',  // Stream word-by-word (smoother)
      }),

      // WebSocket-based Tiptap JSON streaming (Phase 1-3)
      StreamingWebSocketExtension.configure({
        animationDelay: 200, // 200ms between nodes
        maxQueueSize: 1000,
      }),
    ],
    content: {
      type: 'doc',
      content: [
        {
          type: 'aiIndicator',
          attrs: {
            aiName: 'iLaunching',
            aiAcknowledge: '',
            text: ''
          }
        }
      ]
    },
    editable: false,
    editorProps: {
      attributes: {
        class: 'in-app-editor-content',
      },
    },
    // Performance optimizations
    enableInputRules: false,  // Disable input rules for better performance
    enablePasteRules: false,  // Disable paste rules for better performance
  });

  useEffect(() => {
    if (editor && onEditorReady) {
      console.log('InAppEditor: Editor ready');
      onEditorReady(editor);
    }
  }, [editor, onEditorReady]);

  if (!editor) {
    return <div>Loading editor...</div>;
  }

  return (
    <div className={`in-app-editor-wrapper ${className}`} style={style}>
      <EditorContent editor={editor} />
      <style>{`
        .in-app-editor-wrapper {
          background: transparent;
        }
        
        .in-app-editor-wrapper .tiptap {
          outline: none;
        }
        
        .in-app-editor-wrapper .ProseMirror {
          outline: none;
          color: #1f2937; /* Darker gray for better readability */
          font-size: 14px !important; /* Smaller default for in-app chat */
          font-family: 'Work Sans', sans-serif !important;
          line-height: 1.4 !important;
          /* Performance optimizations */
          contain: layout style;
          will-change: contents;
        }

        /* Enforce font size on all child elements too */
        .in-app-editor-wrapper .ProseMirror p,
        .in-app-editor-wrapper .ProseMirror li,
        .in-app-editor-wrapper .ProseMirror span,
        .in-app-editor-wrapper .ProseMirror div {
           font-size: inherit !important;
        }
        
        /* Remove selection borders on all nodes */
        .in-app-editor-wrapper .ProseMirror .ProseMirror-selectednode {
          outline: none !important;
          border: none !important;
        }
        
        .in-app-editor-wrapper .ProseMirror *::selection {
          background: #e0e7ff; /* Indigo-100 */
        }
        
        .in-app-editor-wrapper .ProseMirror img.ProseMirror-selectednode,
        .in-app-editor-wrapper .ProseMirror iframe.ProseMirror-selectednode {
          outline: none !important;
          border: none !important;
          box-shadow: none !important;
        }
        
        .in-app-editor-wrapper .ProseMirror p {
          margin: 6px 0;
        }
        
        .in-app-editor-wrapper .ProseMirror h1 {
          font-size: 1.5em;
          font-weight: 600;
          margin: 12px 0 6px 0;
        }
        
        .in-app-editor-wrapper .ProseMirror h2 {
          font-size: 1.25em;
          font-weight: 600;
          margin: 10px 0 5px 0;
        }
        
        .in-app-editor-wrapper .ProseMirror h3 {
          font-size: 1.1em;
          font-weight: 600;
          margin: 8px 0 4px 0;
        }
        
        .in-app-editor-wrapper .ProseMirror ul,
        .in-app-editor-wrapper .ProseMirror ol {
          padding-left: 20px;
          margin: 6px 0;
        }
        
        .in-app-editor-wrapper .ProseMirror li {
          margin: 2px 0;
        }
        
        /* ... OTHER STYLES ... */
        /* Replacing generic selector prefix */
        .in-app-editor-wrapper .ProseMirror strong {
          font-weight: 600;
        }
        
        .in-app-editor-wrapper .ProseMirror em {
          font-style: italic;
        }
        
        .in-app-editor-wrapper .ProseMirror u {
          text-decoration: underline;
        }
        
        .in-app-editor-wrapper .ProseMirror s {
          text-decoration: line-through;
        }
        
        .in-app-editor-wrapper .ProseMirror mark {
          background-color: #fef08a;
          padding: 1px 3px;
          border-radius: 2px;
        }
        
        .in-app-editor-wrapper .ProseMirror sub {
          vertical-align: sub;
          font-size: 0.75em;
        }
        
        .in-app-editor-wrapper .ProseMirror sup {
          vertical-align: super;
          font-size: 0.75em;
        }
        
        .in-app-editor-wrapper .ProseMirror code {
          background-color: #f3f4f6;
          padding: 2px 4px;
          border-radius: 3px;
          font-family: 'Courier New', monospace;
          font-size: 0.9em;
        }
        
        .in-app-editor-wrapper .ProseMirror blockquote {
          border-left: 3px solid #d1d5db;
          padding-left: 10px;
          margin: 10px 0;
          color: #6b7280;
        }
        
        .in-app-editor-wrapper .ProseMirror a {
          color: #2563eb;
          text-decoration: underline;
          cursor: pointer;
        }
        
        .in-app-editor-wrapper .ProseMirror a:hover {
          color: #1d4ed8;
        }
        
        /* Images */
        .in-app-editor-wrapper .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 4px;
          margin: 6px 0;
        }
        
        /* YouTube embeds */
        .in-app-editor-wrapper .ProseMirror iframe {
          max-width: 100%;
          border-radius: 8px;
          margin: 8px 0;
        }
        
        /* Mentions */
        .in-app-editor-wrapper .ProseMirror .mention {
          background-color: #dbeafe;
          color: #1e40af;
          padding: 1px 4px;
          border-radius: 4px;
          font-weight: 500;
        }
        
        /* Task lists */
        .in-app-editor-wrapper .ProseMirror ul[data-type="taskList"] {
          list-style: none;
          padding-left: 0;
          margin: 8px 0;
          
        }
        
        .in-app-editor-wrapper .ProseMirror ul[data-type="taskList"] li[data-type="taskItem"] {
          display: flex;
          align-items: flex-start;
          justify-content: flex-start;
          gap: 8px;
          padding: 4px 0;
          width: 100%;
          list-style: none;
         
        }

        .in-app-editor-wrapper .task-item-checkbox-wrapper {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin: 0;
          padding: 0;
          flex: 0 0 20px;
          width: 20px;
          min-width: 20px;
          
        }

        .in-app-editor-wrapper .task-item-inline-content {
          flex: 1 1 auto;
          min-width: 0;
          display: inline-flex;
          flex-direction: column;
          gap: 2px;
         
         
          margin-left: 10px;
          padding:0px;
        }

        .in-app-editor-wrapper .task-item-inline-content > * {
          margin: 0;
          
        }

        .in-app-editor-wrapper .task-item-checkbox-visual {
          display: none;
        }
        .in-app-editor-wrapper li[data-type="taskItem"][data-checked="true"] .task-item-inline-content {
          color: #6b7280;
          text-decoration: line-through;
        }
        
        .in-app-editor-wrapper li[data-type="taskItem"][data-checked="true"] .task-item-inline-content * {
          color: inherit;
          text-decoration: inherit;
        }
        
        .in-app-editor-wrapper .task-item-checkbox-wrapper input[type="checkbox"] {
          width: 16px;
          height: 16px;
          border-radius: 4px;
          border: 1.5px solid #7c3aed;
          accent-color: #7c3aed;
          cursor: pointer;
          margin-right: 0px;
          

          flex-shrink: 0;
          display: grid;
          place-items: center;
        }
        
        /* Blockquote */
        .in-app-editor-wrapper .ProseMirror blockquote {
          border-left: 3px solid #d1d5db;
          padding-left: 12px;
          margin: 12px 0;
          color: #6b7280;
          font-style: italic;
        }
        
        /* Horizontal Rule */
        .in-app-editor-wrapper .ProseMirror hr {
          border: none;
          border-top: 1px solid #e5e7eb;
          margin: 16px 0;
        }
        
        /* Mathematics */
        .in-app-editor-wrapper .ProseMirror .math-node {
          background-color: #f3f4f6;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: 'KaTeX_Main', 'Times New Roman', serif;
        }
        
        .in-app-editor-wrapper .ProseMirror .math-node.ProseMirror-selectednode {
          outline: 2px solid #3b82f6;
        }
        
        /* Text alignment */
        .in-app-editor-wrapper .ProseMirror [style*="text-align: center"] {
          text-align: center;
        }
        
        .in-app-editor-wrapper .ProseMirror [style*="text-align: right"] {
          text-align: right;
        }
        
        .in-app-editor-wrapper .ProseMirror [style*="text-align: justify"] {
          text-align: justify;
        }
        
        /* Placeholder */
        .in-app-editor-wrapper .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #9ca3af;
          pointer-events: none;
          height: 0;
        }
        
        /* Table styles */
        .in-app-editor-wrapper .ProseMirror table {
          border-collapse: collapse;
          margin: 8px 0;
          width: 100%;
        }
        
        .in-app-editor-wrapper .ProseMirror table td,
        .in-app-editor-wrapper .ProseMirror table th {
          border: 1px solid #d1d5db;
          padding: 6px;
          text-align: left;
          vertical-align: top;
        }
        
        .in-app-editor-wrapper .ProseMirror table th {
          background-color: #f3f4f6;
          font-weight: 600;
        }
        
        .in-app-editor-wrapper .ProseMirror table tr:nth-child(even) {
          background-color: #f9fafb;
        }
      `}</style>
    </div>
  );
};

export default InAppEditor;
