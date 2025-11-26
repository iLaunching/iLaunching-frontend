import React, { memo, useState, useRef } from 'react';
import { NodeViewWrapper, NodeViewContent } from '@tiptap/react';

interface ResponseComponentProps {
  node: {
    attrs: {
      responseId: string;
      isStreaming: boolean;
      isComplete: boolean;
      turnId?: string;
      timestamp?: string;
    };
  };
  updateAttributes: (attributes: any) => void;
  deleteNode: () => void;
}

const ResponseComponent: React.FC<ResponseComponentProps> = memo(({ node }) => {
  const { attrs } = node;
  const [copied, setCopied] = useState(false);
  const textAreaRef = useRef<HTMLDivElement>(null);

  const handleCopy = async () => {
    if (textAreaRef.current) {
      const textContent = textAreaRef.current.innerText;
      try {
        await navigator.clipboard.writeText(textContent);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  return (
    <NodeViewWrapper className="response-node">
      <div 
        className={`response-container ${attrs.isStreaming ? 'response-streaming' : ''}`}
        style={{
          position: 'relative',
          marginTop: '50px',
          paddingTop: '35px',
          transition: 'all 0.3s ease'
        }}
      >
        {/* Top border with gap for label */}
        <div style={{
          position: 'absolute',
          top: '0',
          left: '0',
          right: '0',
          height: '1px',
          display: 'flex',
          alignItems: 'center'
        }}>
          {/* Border line before label */}
          <div style={{
            flex: '0 0 0px',
            height: '1px',
            backgroundColor: '#3b82f660'
          }} />
          {/* Gap for label */}
          <div style={{
            flex: '0 0 85px',
            height: '1px',
            backgroundColor: 'transparent'
          }} />
          {/* Border line after label */}
          <div style={{
            flex: '1',
            height: '1px',
            backgroundColor: '#3b82f660'
          }} />
        </div>
        
        {/* iLaunching label positioned on top */}
        <div style={{
          position: 'absolute',
          top: '-12px',
          left: '0px',
          padding: '0 8px',
          fontSize: '12px',
          fontWeight: '600',
          color: '#3b82f660',
          letterSpacing: '0.5px',
          userSelect: 'none',
          cursor: 'default',
          zIndex: 1
        }}>
          iLaunching
        </div>
        
        <div className="response-content-wrapper" ref={textAreaRef}>
          <NodeViewContent className="response-text-area" />
          <button 
            onClick={handleCopy}
            className="response-copy-button"
            data-tooltip={copied ? "Copied!" : "Copy response"}
          >
            {copied ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            )}
          </button>
        </div>
      </div>
    </NodeViewWrapper>
  );
}, (prevProps, nextProps) => {
  const prevAttrs = prevProps.node.attrs;
  const nextAttrs = nextProps.node.attrs;
  
  return (
    prevAttrs.responseId === nextAttrs.responseId &&
    prevAttrs.isStreaming === nextAttrs.isStreaming &&
    prevAttrs.isComplete === nextAttrs.isComplete &&
    prevAttrs.turnId === nextAttrs.turnId &&
    prevAttrs.timestamp === nextAttrs.timestamp
  );
});

export default ResponseComponent;
