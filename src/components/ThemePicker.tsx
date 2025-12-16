import { X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ThemePickerProps {
  isOpen: boolean;
  onClose: () => void;
  menuColor: string;
  textColor: string;
  borderLineColor: string;
  globalHoverColor: string;
  currentAppearanceId?: number;
  currentIthemeId?: number;
  onThemeChange?: (appearanceId: number, ithemeId: number) => void;
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
  onThemeChange
}: ThemePickerProps) {
  const [selectedAppearance, setSelectedAppearance] = useState<number | undefined>(currentAppearanceId);
  const [selectedItheme, setSelectedItheme] = useState<number | undefined>(currentIthemeId);
  const [activeTab, setActiveTab] = useState<'appearance' | 'itheme'>('appearance');
  const [appearances, setAppearances] = useState<ThemeOption[]>([]);
  const [ithemes, setIthemes] = useState<ThemeOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Reset state when popup opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedAppearance(currentAppearanceId);
      setSelectedItheme(currentIthemeId);
      // TODO: Fetch available themes from API
      loadThemes();
    }
  }, [isOpen, currentAppearanceId, currentIthemeId]);

  const loadThemes = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API calls
      // Mock data for now
      setAppearances([
        { id: 6, value_name: 'light', display_name: 'Light Mode' },
        { id: 7, value_name: 'dark', display_name: 'Dark Mode' }
      ]);
      setIthemes([
        { id: 10, value_name: 'ipurple', display_name: 'iPurple' },
        { id: 11, value_name: 'iblue', display_name: 'iBlue' },
        { id: 12, value_name: 'igreen', display_name: 'iGreen' }
      ]);
    } catch (error) {
      console.error('Failed to load themes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (selectedAppearance && selectedItheme && onThemeChange) {
      onThemeChange(selectedAppearance, selectedItheme);
    }
    onClose();
  };

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
              marginBottom: '8px'
            }}
          >
            <h2
              style={{
                fontFamily: 'Work Sans, sans-serif',
                fontSize: '20px',
                fontWeight: 600,
                color: textColor,
                margin: 0
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
              marginBottom: '20px'
            }}
          >
            Personalise your look
          </p>

          {/* Navigation Tabs */}
          <div
            style={{
              display: 'flex',
              gap: '8px',
              marginBottom: '20px'
            }}
          >
            <button
              onClick={() => setActiveTab('appearance')}
              style={{
                flex: 1,
                padding: '10px 16px',
                borderRadius: '8px',
                border: `1px solid ${borderLineColor}`,
                backgroundColor: activeTab === 'appearance' ? textColor : 'transparent',
                color: activeTab === 'appearance' ? menuColor : textColor,
                fontFamily: 'Work Sans, sans-serif',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s'
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
                padding: '10px 16px',
                borderRadius: '8px',
                border: `1px solid ${borderLineColor}`,
                backgroundColor: activeTab === 'itheme' ? textColor : 'transparent',
                color: activeTab === 'itheme' ? menuColor : textColor,
                fontFamily: 'Work Sans, sans-serif',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s'
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
              {appearances.map((appearance) => (
                <button
                  key={appearance.id}
                  onClick={() => setSelectedAppearance(appearance.id)}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    border: `2px solid ${selectedAppearance === appearance.id ? '#7F77F1' : borderLineColor}`,
                    backgroundColor: selectedAppearance === appearance.id ? 'rgba(127, 119, 241, 0.1)' : 'transparent',
                    color: textColor,
                    fontFamily: 'Work Sans, sans-serif',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'center'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedAppearance !== appearance.id) {
                      e.currentTarget.style.backgroundColor = globalHoverColor;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedAppearance !== appearance.id) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  {appearance.display_name}
                </button>
              ))}
            </div>
          )}

          {/* iTheme Section */}
          {activeTab === 'itheme' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
              {ithemes.map((itheme) => (
                <button
                  key={itheme.id}
                  onClick={() => setSelectedItheme(itheme.id)}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    border: `2px solid ${selectedItheme === itheme.id ? '#7F77F1' : borderLineColor}`,
                    backgroundColor: selectedItheme === itheme.id ? 'rgba(127, 119, 241, 0.1)' : 'transparent',
                    color: textColor,
                    fontFamily: 'Work Sans, sans-serif',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'center'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedItheme !== itheme.id) {
                      e.currentTarget.style.backgroundColor = globalHoverColor;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedItheme !== itheme.id) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  {itheme.display_name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '20px 24px',
            borderTop: `1px solid ${borderLineColor}`,
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end'
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: `1px solid ${borderLineColor}`,
              backgroundColor: 'transparent',
              color: textColor,
              fontFamily: 'Work Sans, sans-serif',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = globalHoverColor;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={!selectedAppearance || !selectedItheme}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: selectedAppearance && selectedItheme ? '#7F77F1' : '#cccccc',
              color: '#ffffff',
              fontFamily: 'Work Sans, sans-serif',
              fontSize: '14px',
              fontWeight: 500,
              cursor: selectedAppearance && selectedItheme ? 'pointer' : 'not-allowed',
              transition: 'background-color 0.2s',
              opacity: selectedAppearance && selectedItheme ? 1 : 0.6
            }}
            onMouseEnter={(e) => {
              if (selectedAppearance && selectedItheme) {
                e.currentTarget.style.backgroundColor = '#6B63DD';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedAppearance && selectedItheme) {
                e.currentTarget.style.backgroundColor = '#7F77F1';
              }
            }}
          >
            Apply Theme
          </button>
        </div>
      </div>
    </>
  );
}
