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
import { TaskItem } from '@tiptap/extension-task-item';
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
      TaskItem.configure({
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
        class: 'prose-container',
      },
    },
    // Performance optimizations
    enableInputRules: false,  // Disable input rules for better performance
    enablePasteRules: false,  // Disable paste rules for better performance
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
          background: transparent;
        }
        
        .streaming-editor-wrapper .tiptap {
          outline: none;
        }
        
        .streaming-editor-wrapper .ProseMirror {
          outline: none;
          color: #000;
          font-size: 16px;
          font-family: 'helvetica', sans-serif;
          /* Performance optimizations */
          contain: layout style;
          will-change: contents;
        }
        
        /* Remove selection borders on all nodes */
        .streaming-editor-wrapper .ProseMirror .ProseMirror-selectednode {
          outline: none !important;
          border: none !important;
        }
        
        .streaming-editor-wrapper .ProseMirror *::selection {
          background: #b4d5fe;
        }
        
        .streaming-editor-wrapper .ProseMirror img.ProseMirror-selectednode,
        .streaming-editor-wrapper .ProseMirror iframe.ProseMirror-selectednode {
          outline: none !important;
          border: none !important;
          box-shadow: none !important;
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
        
        .streaming-editor-wrapper .ProseMirror u {
          text-decoration: underline;
        }
        
        .streaming-editor-wrapper .ProseMirror s {
          text-decoration: line-through;
        }
        
        .streaming-editor-wrapper .ProseMirror mark {
          background-color: #fef08a;
          padding: 2px 4px;
          border-radius: 2px;
        }
        
        .streaming-editor-wrapper .ProseMirror sub {
          vertical-align: sub;
          font-size: 0.75em;
        }
        
        .streaming-editor-wrapper .ProseMirror sup {
          vertical-align: super;
          font-size: 0.75em;
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
          cursor: pointer;
        }
        
        .streaming-editor-wrapper .ProseMirror a:hover {
          color: #1d4ed8;
        }
        
        /* Images */
        .streaming-editor-wrapper .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 4px;
          margin: 8px 0;
        }
        
        /* YouTube embeds */
        .streaming-editor-wrapper .ProseMirror iframe {
          max-width: 100%;
          border-radius: 8px;
          margin: 12px 0;
        }
        
        /* Mentions */
        .streaming-editor-wrapper .ProseMirror .mention {
          background-color: #dbeafe;
          color: #1e40af;
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 500;
        }
        
        /* Focus highlighting - disabled to remove borders */
        .streaming-editor-wrapper .ProseMirror .has-focus {
          /* Removed focus styling */
        }
        
        /* Task lists */
        .streaming-editor-wrapper .ProseMirror ul[data-type="taskList"] {
          list-style: none;
          padding-left: 0;
          margin: 12px 0;
        }
        
        .streaming-editor-wrapper .ProseMirror ul[data-type="taskList"] li {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 6px 0;
        }

        .streaming-editor-wrapper .ProseMirror ul[data-type="taskList"] li label {
          display: flex;
          align-items: center;
          gap: 6px;
          margin: 0;
          padding: 0;
          flex-shrink: 0;
        }

        .streaming-editor-wrapper .ProseMirror ul[data-type="taskList"] li > div {
          flex: 1;
          display: flex;
          align-items: center;
        }
        
        .streaming-editor-wrapper .ProseMirror ul[data-type="taskList"] li input[type="checkbox"] {
          width: 22px;
          height: 22px;
          border-radius: 6px;
          border: 2px solid #7c3aed;
          accent-color: #7c3aed;
          cursor: pointer;
          margin: 0;
          flex-shrink: 0;
          display: grid;
          place-items: center;
        }
        
        /* Blockquote */
        .streaming-editor-wrapper .ProseMirror blockquote {
          border-left: 4px solid #d1d5db;
          padding-left: 16px;
          margin: 16px 0;
          color: #6b7280;
          font-style: italic;
        }
        
        /* Horizontal Rule */
        .streaming-editor-wrapper .ProseMirror hr {
          border: none;
          border-top: 2px solid #e5e7eb;
          margin: 24px 0;
        }
        
        /* Mathematics */
        .streaming-editor-wrapper .ProseMirror .math-node {
          background-color: #f3f4f6;
          padding: 4px 8px;
          border-radius: 4px;
          font-family: 'KaTeX_Main', 'Times New Roman', serif;
        }
        
        .streaming-editor-wrapper .ProseMirror .math-node.ProseMirror-selectednode {
          outline: 2px solid #3b82f6;
        }
        
        /* Text alignment */
        .streaming-editor-wrapper .ProseMirror [style*="text-align: center"] {
          text-align: center;
        }
        
        .streaming-editor-wrapper .ProseMirror [style*="text-align: right"] {
          text-align: right;
        }
        
        .streaming-editor-wrapper .ProseMirror [style*="text-align: justify"] {
          text-align: justify;
        }
        
        /* Placeholder */
        .streaming-editor-wrapper .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #9ca3af;
          pointer-events: none;
          height: 0;
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
