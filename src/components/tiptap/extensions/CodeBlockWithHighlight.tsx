import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { NodeViewContent, NodeViewWrapper } from '@tiptap/react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css'; // Dark theme for code
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-markdown';
import { useEffect, useRef, useState } from 'react';

interface CodeBlockComponentProps {
  node: {
    attrs: {
      language: string;
    };
  };
  updateAttributes: (attrs: any) => void;
  extension: any;
}

function CodeBlockComponent({ node, updateAttributes, extension }: CodeBlockComponentProps) {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLElement>(null);
  const language = node.attrs.language || 'javascript';
  const highlightTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!codeRef.current) return;

    const highlightCode = () => {
      if (codeRef.current) {
        Prism.highlightElement(codeRef.current);
      }
    };

    // Initial highlight
    highlightCode();

    // Watch for text content changes only (ignore Prism's span modifications)
    const observer = new MutationObserver((mutations) => {
      // Only react to text changes in text nodes, not span elements added by Prism
      const hasTextChange = mutations.some(m => {
        if (m.type === 'characterData') return true;
        if (m.type === 'childList') {
          // Check if added nodes are text nodes (not spans from Prism)
          return Array.from(m.addedNodes).some(node => node.nodeType === Node.TEXT_NODE);
        }
        return false;
      });
      
      if (hasTextChange) {
        // Debounce highlighting to avoid too many calls
        if (highlightTimeoutRef.current) {
          clearTimeout(highlightTimeoutRef.current);
        }
        highlightTimeoutRef.current = setTimeout(highlightCode, 100);
      }
    });

    observer.observe(codeRef.current, {
      characterData: true,
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
      }
    };
  }, [language]);

  const handleCopy = async () => {
    if (codeRef.current) {
      const code = codeRef.current.textContent || '';
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const languageOptions = [
    'javascript',
    'typescript',
    'python',
    'jsx',
    'tsx',
    'css',
    'html',
    'json',
    'bash',
    'markdown',
  ];

  return (
    <NodeViewWrapper className="code-block-wrapper">
      <div className="code-block-container">
        <div className="code-block-header">
          <select
            value={language}
            onChange={(e) => updateAttributes({ language: e.target.value })}
            className="language-selector"
            contentEditable={false}
          >
            {languageOptions.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
          <button
            onClick={handleCopy}
            className="copy-button"
            contentEditable={false}
            type="button"
          >
            {copied ? (
              <span className="copy-feedback">✓ Copied!</span>
            ) : (
              <span className="copy-text">Copy</span>
            )}
          </button>
        </div>
        <pre className="code-block-content">
          <code ref={codeRef} className={`language-${language}`}>
            <NodeViewContent as="span" />
          </code>
        </pre>
      </div>
      <style>{`
        .code-block-wrapper {
          margin: 1.5rem 0;
          position: relative;
        }

        .code-block-container {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .code-block-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1.25rem;
          background: rgba(0, 0, 0, 0.2);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(10px);
        }

        .language-selector {
          background: rgba(255, 255, 255, 0.05);
          color: #a8b2d1;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          padding: 0.4rem 0.75rem;
          font-size: 0.813rem;
          font-weight: 500;
          cursor: pointer;
          outline: none;
          transition: all 0.2s ease;
          font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
        }

        .language-selector:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: #64ffda;
          color: #64ffda;
        }

        .language-selector:focus {
          border-color: #64ffda;
          box-shadow: 0 0 0 3px rgba(100, 255, 218, 0.1);
        }

        .copy-button {
          background: rgba(100, 255, 218, 0.1);
          color: #64ffda;
          border: 1px solid rgba(100, 255, 218, 0.2);
          border-radius: 6px;
          padding: 0.4rem 1rem;
          font-size: 0.813rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          outline: none;
          font-family: system-ui, -apple-system, sans-serif;
        }

        .copy-button:hover {
          background: rgba(100, 255, 218, 0.2);
          border-color: #64ffda;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(100, 255, 218, 0.2);
        }

        .copy-button:active {
          transform: translateY(0);
        }

        .copy-feedback {
          color: #64ffda;
          display: flex;
          align-items: center;
          gap: 0.375rem;
          font-weight: 600;
        }

        .code-block-content {
          margin: 0;
          padding: 1.5rem;
          overflow-x: auto;
          background: transparent;
        }

        .code-block-content code {
          font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', 'Courier New', monospace;
          font-size: 0.875rem;
          line-height: 1.7;
          color: #ccd6f6;
          background: transparent !important;
          font-weight: 400;
        }
        
        /* Remove all background highlights from Prism tokens */
        .code-block-content code *,
        .code-block-content .token {
          background: transparent !important;
        }

        /* Scrollbar styling */
        .code-block-content::-webkit-scrollbar {
          height: 10px;
        }

        .code-block-content::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 5px;
        }

        .code-block-content::-webkit-scrollbar-thumb {
          background: rgba(100, 255, 218, 0.2);
          border-radius: 5px;
        }

        .code-block-content::-webkit-scrollbar-thumb:hover {
          background: rgba(100, 255, 218, 0.3);
        }

        /* Modern syntax colors - VS Code Dark+ inspired */
        .code-block-content .token.comment,
        .code-block-content .token.prolog,
        .code-block-content .token.doctype,
        .code-block-content .token.cdata {
          color: #6a9955;
          font-style: italic;
        }

        .code-block-content .token.string {
          color: #ce9178;
        }

        .code-block-content .token.keyword {
          color: #c586c0;
          font-weight: 500;
        }

        .code-block-content .token.function {
          color: #dcdcaa;
        }

        .code-block-content .token.number {
          color: #b5cea8;
        }

        .code-block-content .token.operator {
          color: #d4d4d4;
        }

        .code-block-content .token.punctuation {
          color: #d4d4d4;
        }

        .code-block-content .token.class-name {
          color: #4ec9b0;
        }

        .code-block-content .token.boolean {
          color: #569cd6;
        }

        .code-block-content .token.property {
          color: #9cdcfe;
        }

        .code-block-content .token.tag {
          color: #569cd6;
        }

        .code-block-content .token.attr-name {
          color: #9cdcfe;
        }

        .code-block-content .token.attr-value {
          color: #ce9178;
        }

        .code-block-content .token.decorator,
        .code-block-content .token.annotation {
          color: #ffd700;
        }
      `}</style>
    </NodeViewWrapper>
  );
}

export const CodeBlockWithHighlight = Node.create({
  name: 'codeBlockHighlight',
  group: 'block',
  content: 'text*',
  marks: '',
  code: true,
  defining: true,

  addAttributes() {
    return {
      language: {
        default: 'javascript',
        parseHTML: (element) => element.getAttribute('data-language') || 'javascript',
        renderHTML: (attributes) => {
          return {
            'data-language': attributes.language,
            class: `language-${attributes.language}`,
          };
        },
      },
      blockId: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-block-id'),
        renderHTML: (attributes) => {
          if (!attributes.blockId) return {};
          return {
            'data-block-id': attributes.blockId,
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
          const codeElement = (node as HTMLElement).querySelector('code');
          const classMatch = codeElement?.className.match(/language-(\w+)/);
          return {
            language: classMatch ? classMatch[1] : 'javascript',
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'pre',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      ['code', {}, 0],
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockComponent);
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Alt-c': () => this.editor.commands.toggleCodeBlock(),
      // Exit code block with Mod-Enter
      'Mod-Enter': () => {
        const { state, view } = this.editor;
        const { selection } = state;
        const { $from } = selection;

        if ($from.parent.type === this.type) {
          const pos = $from.after();
          const tr = state.tr.insert(pos, state.schema.nodes.paragraph.create());
          view.dispatch(tr);
          return true;
        }

        return false;
      },
    };
  },
});

export default CodeBlockWithHighlight;
