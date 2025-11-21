import React, { memo } from 'react';
import { NodeViewWrapper, NodeViewContent } from '@tiptap/react';

interface DataTurnComponentProps {
  node: {
    attrs: {
      turnId: string;
      timestamp: string;
      messageType: string;
    };
  };
  updateAttributes: (attributes: any) => void;
  deleteNode: () => void;
}

const DataTurnComponent: React.FC<DataTurnComponentProps> = memo(({ node }) => {
  const { attrs } = node;

  return (
    <NodeViewWrapper className="data-turn-node">
      <div 
        className="data-turn-container" 
        data-turn-id={attrs.turnId}
        data-message-type={attrs.messageType}
        style={{
          marginBottom: '16px',
        }}
      >
        <NodeViewContent className="data-turn-content" />
      </div>
    </NodeViewWrapper>
  );
}, (prevProps, nextProps) => {
  const prevAttrs = prevProps.node.attrs;
  const nextAttrs = nextProps.node.attrs;
  
  return (
    prevAttrs.turnId === nextAttrs.turnId &&
    prevAttrs.timestamp === nextAttrs.timestamp &&
    prevAttrs.messageType === nextAttrs.messageType
  );
});

export default DataTurnComponent;
