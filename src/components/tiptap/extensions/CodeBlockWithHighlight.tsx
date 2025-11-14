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

  useEffect(() => {
    if (codeRef.current) {
      // Highlight the code
      Prism.highlightElement(codeRef.current);
    }
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
          background: #1e1e1e;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .code-block-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 1rem;
          background: #2d2d2d;
          border-bottom: 1px solid #3e3e3e;
        }

        .language-selector {
          background: #3e3e3e;
          color: #d4d4d4;
          border: 1px solid #4e4e4e;
          border-radius: 4px;
          padding: 0.25rem 0.5rem;
          font-size: 0.875rem;
          cursor: pointer;
          outline: none;
          transition: border-color 0.2s;
        }

        .language-selector:hover {
          border-color: #3b82f6;
        }

        .language-selector:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        }

        .copy-button {
          background: transparent;
          color: #9ca3af;
          border: 1px solid #4e4e4e;
          border-radius: 4px;
          padding: 0.25rem 0.75rem;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
          outline: none;
        }

        .copy-button:hover {
          background: #3e3e3e;
          color: #d4d4d4;
          border-color: #3b82f6;
        }

        .copy-button:active {
          transform: scale(0.95);
        }

        .copy-feedback {
          color: #10b981;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .code-block-content {
          margin: 0;
          padding: 1rem;
          overflow-x: auto;
          background: #1e1e1e;
        }

        .code-block-content code {
          font-family: 'Courier New', Courier, monospace;
          font-size: 0.875rem;
          line-height: 1.6;
          color: #d4d4d4;
        }

        /* Scrollbar styling */
        .code-block-content::-webkit-scrollbar {
          height: 8px;
        }

        .code-block-content::-webkit-scrollbar-track {
          background: #2d2d2d;
        }

        .code-block-content::-webkit-scrollbar-thumb {
          background: #4e4e4e;
          border-radius: 4px;
        }

        .code-block-content::-webkit-scrollbar-thumb:hover {
          background: #5e5e5e;
        }

        /* Prism theme overrides for better visibility */
        .code-block-content .token.comment {
          color: #6a9955;
        }

        .code-block-content .token.string {
          color: #ce9178;
        }

        .code-block-content .token.keyword {
          color: #569cd6;
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
      `}</style>
    </NodeViewWrapper>
  );
}

export const CodeBlockWithHighlight = Node.create({
  name: 'codeBlock',
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
