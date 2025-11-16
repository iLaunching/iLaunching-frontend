import React, { memo } from 'react';
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

  return (
    <NodeViewWrapper className="response-node">
      <div 
        className={`response-container ${attrs.isStreaming ? 'response-streaming' : ''}`}
        style={{
          border: '2px solid #10b981',
          borderRadius: '6px',
          padding: '12px',
          marginTop: '8px',
          backgroundColor: '#ecfdf5',
          transition: 'all 0.3s ease'
        }}
      >
        <div style={{ 
          fontSize: '10px', 
          color: '#10b981', 
          fontWeight: 'bold',
          marginBottom: '8px',
          fontFamily: 'monospace'
        }}>
          Response: {attrs.responseId} {attrs.isStreaming ? '(streaming...)' : ''}
        </div>
        <div className="response-content-wrapper">
          <NodeViewContent className="response-text-area" />
        </div>
        
        {/* Timestamp and ID metadata at the end of response */}
        {attrs.turnId && attrs.timestamp && (
          <div className="response-metadata" style={{ 
            fontSize: '11px', 
            color: '#9ca3af', 
            marginTop: '12px',
            paddingTop: '8px',
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>{new Date(attrs.timestamp).toLocaleString()}</span>
            <span style={{ fontFamily: 'monospace', fontSize: '10px' }}>ID: {attrs.turnId}</span>
          </div>
        )}
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
