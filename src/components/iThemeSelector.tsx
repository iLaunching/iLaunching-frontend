import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';

interface IThemeOption {
  id: number;
  value_name: string;
  display_name: string;
  sort_order: number;
  itheme_config: {
    name: string;
    bg_opacity: string;
    bg_gradient: string;
    hover_color: string;
    menu_bg_opacity: string;
    solid_color: string;
    menu_opacity_color: string;
  };
}

interface IThemeSelectorProps {
  currentIthemeId: number | null;
  onIthemeChange?: (ithemeId: number) => void;
  textColor: string;
  borderLineColor: string;
  globalHoverColor: string;
}

const IThemeSelector: React.FC<IThemeSelectorProps> = ({
  currentIthemeId,
  onIthemeChange,
  textColor,
  borderLineColor,
  globalHoverColor,
}) => {
  const [ithemes, setIthemes] = useState<IThemeOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIthemeId, setSelectedIthemeId] = useState<number | null>(currentIthemeId);

  useEffect(() => {
    fetchIthemes();
  }, []);

  useEffect(() => {
    setSelectedIthemeId(currentIthemeId);
  }, [currentIthemeId]);

  const fetchIthemes = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        'https://ilaunching-servers-production.up.railway.app/api/v1/option-values?option_set_name=itheme',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch ithemes');
      }

      const data = await response.json();
      setIthemes(data.sort((a: IThemeOption, b: IThemeOption) => a.sort_order - b.sort_order));
    } catch (error) {
      console.error('Error fetching ithemes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleIthemeSelect = (ithemeId: number) => {
    console.log('🎨 iThemeSelector: Selected itheme:', ithemeId);
    setSelectedIthemeId(ithemeId);
    
    if (onIthemeChange) {
      console.log('🎨 iThemeSelector: Calling onIthemeChange with:', ithemeId);
      onIthemeChange(ithemeId);
    } else {
      console.log('⚠️ iThemeSelector: onIthemeChange is not defined!');
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '40px',
          color: textColor,
          fontFamily: 'Work Sans, sans-serif',
          userSelect: 'none',
        }}
      >
        Loading themes...
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: '12px',
      }}
    >
      {ithemes.map((itheme) => (
        <button
          key={itheme.id}
          onClick={() => handleIthemeSelect(itheme.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '8px',
            borderRadius: '12px',
            border: `1px solid ${selectedIthemeId === itheme.id ? itheme.itheme_config.solid_color : borderLineColor}`,
            backgroundColor:
              selectedIthemeId === itheme.id
                ? `${itheme.itheme_config.solid_color}1A`
                : 'transparent',
            cursor: 'pointer',
            transition: 'all 0.2s',
            height:'fit-content',
          }}
          onMouseEnter={(e) => {
            if (selectedIthemeId !== itheme.id) {
              e.currentTarget.style.backgroundColor = globalHoverColor;
            }
          }}
          onMouseLeave={(e) => {
            if (selectedIthemeId !== itheme.id) {
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
        >
          {/* Color preview box with tick icon */}
          <div
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '6px',
              backgroundColor: itheme.itheme_config.solid_color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {selectedIthemeId === itheme.id && (
              <FontAwesomeIcon 
                icon={faCheck} 
                style={{ 
                  color: '#ffffff',
                  fontSize: '14px',
                }} 
              />
            )}
          </div>
          
          {/* Theme name */}
          <span
            style={{
              fontFamily: 'Work Sans, sans-serif',
              fontSize: '14px',
              fontWeight: 400,
              color: textColor,
              textAlign: 'left',
              flex: 1,
              userSelect: 'none',
            }}
          >
            {itheme.display_name}
          </span>
        </button>
      ))}
    </div>
  );
};

export default IThemeSelector;
