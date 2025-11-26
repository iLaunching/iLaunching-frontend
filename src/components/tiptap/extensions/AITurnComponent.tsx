import React, { memo } from 'react';
import { NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import type { ReactNodeViewProps } from '@tiptap/react';

const AITurnComponent: React.FC<ReactNodeViewProps> = memo(({ node }) => {
  const { attrs } = node;

  return (
    <NodeViewWrapper className="ai-turn-node">
      <div 
        className="ai-turn-container" 
        data-turn-id={attrs.turnId}
        style={{
         /* border: '2px solid #3b82f6',*/
         /* borderRadius: '8px',*/
         /* padding: '12px',*/
          marginBottom: '0px',
         
        }}
      >
        <NodeViewContent className="ai-turn-content" />
      </div>
    </NodeViewWrapper>
  );
}, (prevProps, nextProps) => {
  const prevAttrs = prevProps.node.attrs;
  const nextAttrs = nextProps.node.attrs;
  
  return (
    prevAttrs.turnId === nextAttrs.turnId &&
    prevAttrs.timestamp === nextAttrs.timestamp &&
    prevAttrs.summary === nextAttrs.summary &&
    JSON.stringify(prevAttrs.cites) === JSON.stringify(nextAttrs.cites)
  );
});

export default AITurnComponent;
