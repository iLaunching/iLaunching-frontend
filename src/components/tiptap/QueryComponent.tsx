import React, { memo } from 'react';
import { NodeViewWrapper, NodeViewContent } from '@tiptap/react';

interface QueryComponentProps {
  node: {
    attrs: {
      user_avatar_type: string;
      user_avatar_image_link: string;
      user_avatar_svg: string;
      user_avatar_text: string;
      user_first_name: string;
      user_surname: string;
      user_id: string;
      text: string;
      query_id: string;
    };
  };
  updateAttributes: (attributes: any) => void;
  deleteNode: () => void;
}

const QueryComponent: React.FC<QueryComponentProps> = memo(({ node }) => {
  const { attrs } = node;

  // Simple avatar rendering without useMemo (memo handles it)
  const renderAvatar = () => {
    const { user_avatar_type, user_avatar_image_link, user_avatar_svg, user_avatar_text } = attrs;
    
    if (user_avatar_type === 'image' && user_avatar_image_link) {
      return (
        <img 
          src={user_avatar_image_link} 
          alt="User Avatar" 
          className="query-avatar-image"
        />
      );
    }
    
    if (user_avatar_type === 'svg' && user_avatar_svg) {
      return (
        <div 
          className="query-avatar-svg"
          dangerouslySetInnerHTML={{ __html: user_avatar_svg }}
        />
      );
    }
    
    // Default to text avatar
    return (
      <span className="query-avatar-text">
        {user_avatar_text || 'UN'}
      </span>
    );
  };

  return (
    <NodeViewWrapper className="ce-query">
      <div className="query-container">
        <div className="query-avatar-container">
          {renderAvatar()}
        </div>
        <NodeViewContent className="query-content" />
      </div>
    </NodeViewWrapper>
  );
}, (prevProps, nextProps) => {
  // Custom comparison - only re-render if attrs actually changed
  const prevAttrs = prevProps.node.attrs;
  const nextAttrs = nextProps.node.attrs;
  
  return (
    prevAttrs.user_avatar_type === nextAttrs.user_avatar_type &&
    prevAttrs.user_avatar_image_link === nextAttrs.user_avatar_image_link &&
    prevAttrs.user_avatar_svg === nextAttrs.user_avatar_svg &&
    prevAttrs.user_avatar_text === nextAttrs.user_avatar_text &&
    prevAttrs.query_id === nextAttrs.query_id
  );
});

export default QueryComponent;