import { X } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

interface MemberMenuProps {
  isOpen: boolean;
  onClose: () => void;
  menuColor: string;
  textColor: string;
  borderLineColor: string;
  globalHoverColor: string;
  firstName: string;
  surname: string;
  avatarColor: string;
  avatarDisplayMode?: number;
  profileIconId?: number;
  getIconDefinition?: () => IconDefinition | null;
  getInitials: () => string;
}

export default function MemberMenu({
  isOpen,
  onClose,
  menuColor,
  textColor,
  borderLineColor,
  globalHoverColor,
  firstName,
  surname,
  avatarColor,
  avatarDisplayMode = 24,
  profileIconId,
  getIconDefinition,
  getInitials
}: MemberMenuProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 9998,
        }}
        onClick={onClose}
      />
      
      {/* Slide-out Panel */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          maxWidth: '500px',
          backgroundColor: menuColor,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.15)',
          zIndex: 9999,
          animation: 'slideInFromRight 0.2s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <style>
          {`
            @keyframes slideInFromRight {
              from {
                transform: translateX(100%);
              }
              to {
                transform: translateX(0);
              }
            }
          `}
        </style>

        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '24px',
            borderBottom: `1px solid ${borderLineColor}`
          }}
        >
          <h2
            style={{
              fontFamily: 'Work Sans, sans-serif',
              fontSize: '20px',
              fontWeight: 500,
              color: textColor,
              margin: 0,
              userSelect: 'none'
            }}
          >
            Member Menu
          </h2>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1.5 rounded-full transition-all group"
            style={{
              backgroundColor: `${textColor}10`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = `${textColor}20`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = `${textColor}10`;
            }}
          >
            <X 
              className="group-hover:rotate-90 transition-transform duration-300"
              size={20}
              style={{ color: textColor }}
              strokeWidth={2}
            />
          </button>
        </div>

        {/* Content */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px'
          }}
        >
          {/* User Info Section */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '16px',
              backgroundColor: globalHoverColor,
              borderRadius: '12px',
              marginBottom: '24px'
            }}
          >
            {/* Avatar */}
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '360px',
                backgroundColor: avatarColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'Work Sans, sans-serif',
                fontSize: '24px',
                fontWeight: 600,
                color: '#ffffff',
                userSelect: 'none'
              }}
            >
              {avatarDisplayMode === 26 && getIconDefinition && getIconDefinition() ? (
                <FontAwesomeIcon icon={getIconDefinition()!} style={{ fontSize: '24px' }} />
              ) : (
                getInitials()
              )}
            </div>

            {/* Name */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div
                style={{
                  fontFamily: 'Work Sans, sans-serif',
                  fontSize: '18px',
                  fontWeight: 600,
                  color: textColor,
                  userSelect: 'none'
                }}
              >
                {firstName} {surname}
              </div>
              <div
                style={{
                  fontFamily: 'Work Sans, sans-serif',
                  fontSize: '14px',
                  fontWeight: 400,
                  color: textColor,
                  opacity: 0.7,
                  userSelect: 'none'
                }}
              >
                Member
              </div>
            </div>
          </div>

          {/* Placeholder for additional content */}
          <div
            style={{
              fontFamily: 'Work Sans, sans-serif',
              fontSize: '14px',
              color: textColor,
              opacity: 0.6,
              textAlign: 'center',
              padding: '40px 20px'
            }}
          >
            Member menu content coming soon...
          </div>
        </div>
      </div>
    </>
  );
}
