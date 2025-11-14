import React, { useState, useRef, useEffect } from 'react';
import { NodeViewWrapper } from '@tiptap/react';

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
      backgroundColor: string;
      text: string;
      query_id: string;
    };
  };
  updateAttributes: (attributes: any) => void;
  deleteNode: () => void;
}

const QueryComponent: React.FC<QueryComponentProps> = ({ node, updateAttributes, deleteNode }) => {
  const { attrs } = node;
  const [showBackgroundSelector, setShowBackgroundSelector] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);

  // Available background colors (Query-style)
  const backgroundColors = {
    none: {
      name: 'None',
      className: 'query-none',
      color: 'transparent'
    },
    default: {
      name: 'Default',
      className: 'query-default',
      color: '#f7f6f3'
    },
    gray: {
      name: 'Gray',
      className: 'query-gray',
      color: '#f1f1ef'
    },
    brown: {
      name: 'Brown',
      className: 'query-brown',
      color: '#f4f1ee'
    },
    orange: {
      name: 'Orange',
      className: 'query-orange',
      color: '#fdf2e9'
    },
    yellow: {
      name: 'Yellow',
      className: 'query-yellow',
      color: '#fefdf0'
    },
    green: {
      name: 'Green',
      className: 'query-green',
      color: '#f0f9f0'
    },
    blue: {
      name: 'Blue',
      className: 'query-blue',
      color: '#f0f7ff'
    },
    purple: {
      name: 'Purple',
      className: 'query-purple',
      color: '#f8f0ff'
    },
    pink: {
      name: 'Pink',
      className: 'query-pink',
      color: '#fdf2f8'
    },
    red: {
      name: 'Red',
      className: 'query-red',
      color: '#ffeef0'
    }
  };

  const handleTextChange = (e: React.FormEvent<HTMLDivElement>) => {
    const text = e.currentTarget.innerHTML;
    updateAttributes({ text });
  };

  const handleBackgroundChange = (backgroundColor: string) => {
    updateAttributes({ backgroundColor });
    setShowBackgroundSelector(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && textRef.current?.textContent === '') {
      e.preventDefault();
      deleteNode();
    }
  };

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
    } else if (user_avatar_type === 'svg' && user_avatar_svg) {
      return (
        <div 
          className="query-avatar-svg"
          dangerouslySetInnerHTML={{ __html: user_avatar_svg }}
        />
      );
    } else {
      // Default to text avatar
      return (
        <span className="query-avatar-text">
          {user_avatar_text || 'UN'}
        </span>
      );
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showBackgroundSelector && !event.target?.closest?.('.query-background-selector')) {
        setShowBackgroundSelector(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showBackgroundSelector]);

  return (
    <NodeViewWrapper className="ce-query">
      <div className={`query-container ${backgroundColors[attrs.backgroundColor].className}`}>
        {/* Avatar Display */}
        <div className="query-avatar-container">
          {renderAvatar()}
        </div>
        
        {/* Text Content */}
        <div 
          ref={textRef}
          className="query-text"
          contentEditable
          suppressContentEditableWarning
          onInput={handleTextChange}
          onKeyDown={handleKeyDown}
          data-placeholder={attrs.text ? '' : 'Type your query here...'}
          dangerouslySetInnerHTML={{ __html: attrs.text }}
        />
        
        {/* Background Color Button */}
        <button
          className="query-background-button"
          onClick={() => setShowBackgroundSelector(!showBackgroundSelector)}
          title="Change background color"
        >
          ⋮⋮⋮
        </button>
        
        {/* Background Color Selector */}
        {showBackgroundSelector && (
          <div className="query-background-selector">
            {Object.entries(backgroundColors).map(([key, config]) => (
              <div
                key={key}
                className={`background-option ${key === attrs.backgroundColor ? 'active' : ''}`}
                onClick={() => handleBackgroundChange(key)}
              >
                <div 
                  className="color-preview" 
                  style={{ backgroundColor: config.color }}
                />
                <span className="color-name">{config.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
};

export default QueryComponent;