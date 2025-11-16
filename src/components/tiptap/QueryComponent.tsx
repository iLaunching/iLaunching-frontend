import React, { memo, useEffect, useRef, useState } from 'react';
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
  const contentWrapperRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

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

  useEffect(() => {
    const checkOverflow = () => {
      if (contentWrapperRef.current) {
        const textAreaElement = contentWrapperRef.current.querySelector('.msg-text-area');
        if (textAreaElement) {
          const isOverflowing = textAreaElement.scrollHeight > 600;
          console.log('Checking overflow:', { scrollHeight: textAreaElement.scrollHeight, isOverflowing });
          if (isOverflowing) {
            contentWrapperRef.current.classList.add('has-overflow');
          } else {
            contentWrapperRef.current.classList.remove('has-overflow');
          }
        }
      }
    };

    // Check on mount and after a short delay to let content render
    checkOverflow();
    setTimeout(checkOverflow, 100);
    
    const observer = new MutationObserver(checkOverflow);
    if (contentWrapperRef.current) {
      observer.observe(contentWrapperRef.current, { childList: true, subtree: true, characterData: true });
    }

    return () => observer.disconnect();
  }, []);

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
    <NodeViewWrapper className="user-message-node">
      <div className="msg-container">
        <div className="msg-avatar">
          {renderAvatar()}
        </div>
        <div className="msg-content-wrapper" ref={contentWrapperRef} data-expanded={isExpanded}>
          <div ref={textAreaRef}>
            <NodeViewContent className="msg-text-area" />
          </div>
          <div className="query-controls-container">
            <button 
              onClick={toggleExpanded}
              className="query-expand-button"
              style={{ 
                background: 'transparent',
                border: 'none',
                color: 'white',
                fontSize: '12px',
                cursor: 'pointer',
                padding: '4px 8px'
              }}
            >
              {isExpanded ? 'Show Less' : 'Show More'}
            </button>
          </div>
          <button 
            onClick={handleCopy}
            className="query-copy-button"
            data-tooltip={copied ? "Copied!" : "Copy your message"}
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