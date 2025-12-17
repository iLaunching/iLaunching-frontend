import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import AppearanceSelector from './AppearanceSelector';
import IThemeSelector from './iThemeSelector';

interface ThemePickerProps {
  isOpen: boolean;
  onClose: () => void;
  menuColor: string;
  textColor: string;
  borderLineColor: string;
  globalHoverColor: string;
  currentAppearanceId?: number;
  currentIthemeId?: number;
  onAppearanceChange?: (appearanceId: number) => void;
  onIthemeChange?: (ithemeId: number) => void;
  ithemeButtonBkColor?: string;
  ithemeButtonTextColor?: string;
  ithemeBgOpacity?: string;
}

interface ThemeOption {
  id: number;
  value_name: string;
  display_name: string;
  preview?: string;
}

export default function ThemePicker({
  isOpen,
  onClose,
  menuColor,
  textColor,
  borderLineColor,
  globalHoverColor,
  currentAppearanceId,
  currentIthemeId,
  onAppearanceChange,
  onIthemeChange,
  ithemeButtonBkColor,
  ithemeButtonTextColor,
  ithemeBgOpacity
}: ThemePickerProps) {
  console.log('🎨 ThemePicker: onAppearanceChange =', onAppearanceChange);
  const [activeTab, setActiveTab] = useState<'appearance' | 'itheme'>('appearance');

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
            
            @keyframes fadeIn {
              from {
                opacity: 0;
              }
              to {
                opacity: 1;
              }
            }
          `}
        </style>
        {/* Header */}
        <div
          style={{
            flexDirection: 'column',
            padding: '24px',
            borderBottom: `1px solid ${borderLineColor}`
          }}
        >
          {/* Title Row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0px'
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
              Theme
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

          {/* Subtext */}
          <p
            style={{
              fontFamily: 'Work Sans, sans-serif',
              fontSize: '14px',
              fontWeight: 400,
              color: textColor,
              opacity: 0.7,
              margin: 0,
              marginBottom: '20px',
              userSelect: 'none'
            }}
          >
            Personalise your iLaunching experience by selecting your preferred appearance and iTheme.
          </p>

          {/* Navigation Tabs */}
          <div
            style={{
              display: 'flex',
              gap: '8px',
              marginBottom: '0px',
              backgroundColor: ithemeBgOpacity || borderLineColor,
              padding: '4px',
              borderRadius: '18px' 
            }}
          >
            <button
              onClick={() => setActiveTab('appearance')}
              style={{
                flex: 1,
                padding: '5px 5px',
                borderRadius: '15px',
                border: `1px solid ${borderLineColor}`,
                backgroundColor: activeTab === 'appearance' ? (ithemeButtonBkColor || textColor) : 'transparent',
                color: activeTab === 'appearance' ? (ithemeButtonTextColor || menuColor) : textColor,
                fontFamily: 'Work Sans, sans-serif',
                fontSize: '14px',
                fontWeight: 400,
                cursor: 'pointer',
                userSelect: 'none',
                transition: 'all 0.2s',
                height: '33px',
                
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'appearance') {
                  e.currentTarget.style.backgroundColor = globalHoverColor;
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'appearance') {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              Appearance
            </button>
            <button
              onClick={() => setActiveTab('itheme')}
              style={{
                flex: 1,
                padding: '5px 5px',
                borderRadius: '15px',
                border: `1px solid ${borderLineColor}`,
                backgroundColor: activeTab === 'itheme' ? (ithemeButtonBkColor || textColor) : 'transparent',
                color: activeTab === 'itheme' ? (ithemeButtonTextColor || menuColor) : textColor,
                fontFamily: 'Work Sans, sans-serif',
                fontSize: '14px',
                fontWeight: 400,
                cursor: 'pointer',
                transition: 'all 0.2s',
                height: '33px',
                userSelect: 'none'

              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'itheme') {
                  e.currentTarget.style.backgroundColor = globalHoverColor;
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'itheme') {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              iTheme
            </button>
          </div>
        </div>

        {/* Content */}
        <div
          style={{
            padding: '24px',
            flex: 1,
            overflowY: 'auto'
          }}
        >
          {/* Appearance Section */}
          {activeTab === 'appearance' && (
            <AppearanceSelector
              currentAppearanceId={currentAppearanceId ?? null}
              onAppearanceChange={onAppearanceChange}
              textColor={textColor}
              borderLineColor={borderLineColor}
              globalHoverColor={globalHoverColor}
            />
          )}

          {/* iTheme Section */}
          {activeTab === 'itheme' && (
            <IThemeSelector
              currentIthemeId={currentIthemeId ?? null}
              onIthemeChange={onIthemeChange}
              textColor={textColor}
              borderLineColor={borderLineColor}
              globalHoverColor={globalHoverColor}
            />
          )}
        </div>
      </div>
    </>
  );
}
