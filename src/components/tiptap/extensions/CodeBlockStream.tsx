import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewContent, NodeViewWrapper } from '@tiptap/react';
import React, { useEffect, useRef } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-markdown';

interface CodeBlockStreamProps {
  node: {
    attrs: {
      language?: string;
    };
  };
  updateAttributes: (attrs: any) => void;
  extension: any;
}

const CodeBlockStreamComponent: React.FC<CodeBlockStreamProps> = ({ node }) => {
  const codeRef = useRef<HTMLElement>(null);
  const highlightTimeoutRef = useRef<number | null>(null);
  const language = node.attrs.language || 'plaintext';

  useEffect(() => {
    const highlightCode = () => {
      if (codeRef.current) {
        Prism.highlightElement(codeRef.current);
      }
    };

    highlightCode(); // Initial highlight

    // MutationObserver to auto-highlight as code streams in
    const observer = new MutationObserver((mutations) => {
      const hasTextChange = mutations.some(m => {
        if (m.type === 'characterData') return true;
        if (m.type === 'childList') {
          return Array.from(m.addedNodes).some(node => node.nodeType === 3); // TEXT_NODE
        }
        return false;
      });

      if (hasTextChange) {
        if (highlightTimeoutRef.current) {
          clearTimeout(highlightTimeoutRef.current);
        }
        highlightTimeoutRef.current = setTimeout(highlightCode, 100) as any;
      }
    });

    if (codeRef.current) {
      observer.observe(codeRef.current, {
        characterData: true,
        childList: true,
        subtree: true,
      });
    }

    return () => {
      observer.disconnect();
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
      }
    };
  }, [language]);

  const languageClass = language ? `language-${language}` : 'language-plaintext';

  return (
    <NodeViewWrapper className="code-block-stream">
      <pre className="code-block-stream-pre">
        <code ref={codeRef} className={languageClass}>
          <NodeViewContent as="div" />
        </code>
      </pre>
      <style>{`
        .code-block-stream {
          margin: 16px 0;
          position: relative;
        }

        .code-block-stream-pre {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          border: 1px solid rgba(100, 255, 218, 0.2);
          border-radius: 8px;
          padding: 16px;
          overflow-x: auto;
          font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', 'Roboto Mono', monospace;
          font-size: 14px;
          line-height: 1.6;
          margin: 0;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
        }

        .code-block-stream-pre code {
          background: transparent !important;
          color: #e0e0e0;
          font-family: inherit;
          font-size: inherit;
          padding: 0;
          display: block;
          white-space: pre;
          word-wrap: normal;
        }

        /* Prism.js Syntax Highlighting - Modern Theme */
        .code-block-stream-pre .token.comment,
        .code-block-stream-pre .token.prolog,
        .code-block-stream-pre .token.doctype,
        .code-block-stream-pre .token.cdata {
          color: #6a9955;
          background: transparent !important;
        }

        .code-block-stream-pre .token.punctuation {
          color: #d4d4d4;
          background: transparent !important;
        }

        .code-block-stream-pre .token.property,
        .code-block-stream-pre .token.tag,
        .code-block-stream-pre .token.boolean,
        .code-block-stream-pre .token.number,
        .code-block-stream-pre .token.constant,
        .code-block-stream-pre .token.symbol,
        .code-block-stream-pre .token.deleted {
          color: #b5cea8;
          background: transparent !important;
        }

        .code-block-stream-pre .token.selector,
        .code-block-stream-pre .token.attr-name,
        .code-block-stream-pre .token.string,
        .code-block-stream-pre .token.char,
        .code-block-stream-pre .token.builtin,
        .code-block-stream-pre .token.inserted {
          color: #ce9178;
          background: transparent !important;
        }

        .code-block-stream-pre .token.operator,
        .code-block-stream-pre .token.entity,
        .code-block-stream-pre .token.url,
        .code-block-stream-pre .language-css .token.string,
        .code-block-stream-pre .style .token.string {
          color: #d4d4d4;
          background: transparent !important;
        }

        .code-block-stream-pre .token.atrule,
        .code-block-stream-pre .token.attr-value,
        .code-block-stream-pre .token.keyword {
          color: #c586c0;
          background: transparent !important;
        }

        .code-block-stream-pre .token.function,
        .code-block-stream-pre .token.class-name {
          color: #dcdcaa;
          background: transparent !important;
        }

        .code-block-stream-pre .token.regex,
        .code-block-stream-pre .token.important,
        .code-block-stream-pre .token.variable {
          color: #64ffda;
          background: transparent !important;
        }

        .code-block-stream-pre .token.decorator {
          color: #64ffda;
          background: transparent !important;
        }

        .code-block-stream-pre .token.important,
        .code-block-stream-pre .token.bold {
          font-weight: bold;
          background: transparent !important;
        }

        .code-block-stream-pre .token.italic {
          font-style: italic;
          background: transparent !important;
        }

        /* Scrollbar styling */
        .code-block-stream-pre::-webkit-scrollbar {
          height: 8px;
        }

        .code-block-stream-pre::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }

        .code-block-stream-pre::-webkit-scrollbar-thumb {
          background: rgba(100, 255, 218, 0.2);
          border-radius: 4px;
        }

        .code-block-stream-pre::-webkit-scrollbar-thumb:hover {
          background: rgba(100, 255, 218, 0.3);
        }

        /* Read-only styling - disable text selection */
        .code-block-stream .ProseMirror {
          user-select: none;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
        }
      `}</style>
    </NodeViewWrapper>
  );
};

// Auto-detect language from code content
const detectLanguage = (code: string): string => {
  if (!code || code.trim().length === 0) return 'plaintext';
  
  // React/JSX patterns
  if (/import\s+.*from\s+['"]react['"]/.test(code) || /<[A-Z]\w+/.test(code) || /className=/.test(code)) {
    return /\.tsx?/.test(code) ? 'tsx' : 'jsx';
  }
  
  // TypeScript patterns
  if (/interface\s+\w+/.test(code) || /type\s+\w+\s*=/.test(code) || /:\s*(string|number|boolean)/.test(code)) {
    return 'typescript';
  }
  
  // Python patterns
  if (/def\s+\w+\(/.test(code) || /import\s+\w+/.test(code) || /from\s+\w+\s+import/.test(code) || /print\(/.test(code)) {
    return 'python';
  }
  
  // JavaScript patterns
  if (/function\s+\w+\(/.test(code) || /const\s+\w+\s*=/.test(code) || /let\s+\w+\s*=/.test(code) || /var\s+\w+\s*=/.test(code)) {
    return 'javascript';
  }
  
  // JSON pattern
  if (/^\s*[{[]/.test(code.trim()) && /[}\]]\s*$/.test(code.trim())) {
    try {
      JSON.parse(code);
      return 'json';
    } catch (e) {
      // Not valid JSON
    }
  }
  
  // CSS patterns
  if (/[.#]\w+\s*\{/.test(code) || /@media/.test(code) || /:\s*[\w-]+;/.test(code)) {
    return 'css';
  }
  
  // Bash/shell patterns
  if (/^#!/.test(code) || /\$\(/.test(code) || /\|\s*grep/.test(code)) {
    return 'bash';
  }
  
  return 'plaintext';
};

/**
 * CodeBlockStream - Enhanced default codeBlock with streaming support
 * - Replaces StarterKit's codeBlock
 * - Syntax highlighting with Prism.js
 * - Auto-detects language from code content
 * - Typewriter effect support for streaming
 * - Read-only (no copy button or language selector)
 * - Used automatically by streaming API
 */
export const CodeBlockStream = Node.create({
  name: 'codeBlock', // Same name as StarterKit's codeBlock to replace it

  group: 'block',

  content: 'text*',

  marks: '',

  code: true,

  defining: true,

  addAttributes() {
    return {
      language: {
        default: 'plaintext',
        parseHTML: element => {
          const classAttr = element.querySelector('code')?.getAttribute('class');
          const match = classAttr?.match(/language-(\w+)/);
          return match ? match[1] : 'plaintext';
        },
        renderHTML: attributes => {
          if (!attributes.language) {
            return {};
          }
          return {
            class: `language-${attributes.language}`,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'pre',
        preserveWhitespace: 'full',
        getAttrs: (node) => {
          if (typeof node === 'string') return null;
          const codeElement = node.querySelector('code');
          if (!codeElement) return null;
          
          const classAttr = codeElement.getAttribute('class');
          const match = classAttr?.match(/language-(\w+)/);
          
          return {
            language: match ? match[1] : 'plaintext',
          };
        },
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'pre',
      mergeAttributes(HTMLAttributes, {
        class: 'code-block-stream-pre',
      }),
      [
        'code',
        {
          class: node.attrs.language ? `language-${node.attrs.language}` : 'language-plaintext',
        },
        0,
      ],
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockStreamComponent);
  },

  addCommands() {
    return {
      setCodeBlock: attributes => ({ commands }) => {
        // Auto-detect language if not provided
        if (!attributes?.language && this.editor) {
          const { from, to } = this.editor.state.selection;
          const code = this.editor.state.doc.textBetween(from, to);
          attributes = { ...attributes, language: detectLanguage(code) };
        }
        return commands.setNode(this.name, attributes);
      },
      toggleCodeBlock: attributes => ({ commands }) => {
        // Auto-detect language if not provided
        if (!attributes?.language && this.editor) {
          const { from, to } = this.editor.state.selection;
          const code = this.editor.state.doc.textBetween(from, to);
          attributes = { ...attributes, language: detectLanguage(code) };
        }
        return commands.toggleNode(this.name, 'paragraph', attributes);
      },
    };
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Alt-c': () => this.editor.commands.toggleCodeBlock(),
      Backspace: () => {
        const { empty, $anchor } = this.editor.state.selection;
        const isAtStart = $anchor.pos === 1;

        if (!empty || $anchor.parent.type.name !== this.name) {
          return false;
        }

        if (isAtStart || !$anchor.parent.textContent.length) {
          return this.editor.commands.clearNodes();
        }

        return false;
      },
      'Mod-Enter': () => {
        const { $from } = this.editor.state.selection;

        if ($from.parent.type !== this.type) {
          return false;
        }

        return this.editor.commands.exitCode();
      },
    };
  },
});

export default CodeBlockStream;
