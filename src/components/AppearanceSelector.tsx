import React, { useState, useEffect } from 'react';

interface AppearanceOption {
  id: number;
  value_name: string;
  display_name: string;
  sort_order: number;
  theme_config: {
    text_color: string;
    background_color: string;
    menu_color: string;
    border_line_color: string;
  };
}

interface AppearanceSelectorProps {
  currentAppearanceId: number | null;
  onAppearanceChange?: (appearanceId: number) => void;
  textColor: string;
  borderLineColor: string;
  globalHoverColor: string;
}

const AppearanceSelector: React.FC<AppearanceSelectorProps> = ({
  currentAppearanceId,
  onAppearanceChange,
  textColor,
  borderLineColor,
  globalHoverColor,
}) => {
  const [appearances, setAppearances] = useState<AppearanceOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppearanceId, setSelectedAppearanceId] = useState<number | null>(currentAppearanceId);

  useEffect(() => {
    fetchAppearances();
  }, []);

  useEffect(() => {
    setSelectedAppearanceId(currentAppearanceId);
  }, [currentAppearanceId]);

  const fetchAppearances = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        'https://ilaunching-servers-production.up.railway.app/api/v1/option-values?option_set_name=appearance',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch appearances');
      }

      const data = await response.json();
      setAppearances(data.sort((a: AppearanceOption, b: AppearanceOption) => a.sort_order - b.sort_order));
    } catch (error) {
      console.error('Error fetching appearances:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAppearanceSelect = (appearanceId: number) => {
    console.log('🎨 AppearanceSelector: Selected appearance:', appearanceId);
    setSelectedAppearanceId(appearanceId);
    
    if (onAppearanceChange) {
      console.log('🎨 AppearanceSelector: Calling onAppearanceChange with:', appearanceId);
      onAppearanceChange(appearanceId);
    } else {
      console.log('⚠️ AppearanceSelector: onAppearanceChange is not defined!');
    }
  };

  const AppearancePreview: React.FC<{ appearance: AppearanceOption }> = ({ appearance }) => {
    const { background_color, menu_color, text_color, border_line_color } = appearance.theme_config;

    return (
      <div
        className="w-full h-24 rounded-lg overflow-hidden flex flex-col"
        style={{ backgroundColor: background_color }}
      >
        {/* Header */}
        <div
          className="h-6 px-2 flex items-center gap-1.5"
          style={{ backgroundColor: menu_color }}
        >
          <div
            className="w-1 h-1 rounded-full"
            style={{ backgroundColor: text_color, opacity: 0.6 }}
          />
          <div
            className="w-8 h-1 rounded"
            style={{ backgroundColor: text_color, opacity: 0.4 }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 p-2 flex flex-col gap-1.5">
          <div
            className="w-5 h-5 rounded"
            style={{ backgroundColor: text_color, opacity: 0.8 }}
          />
          <div className="flex gap-1">
            <div
              className="w-2.5 h-2.5 rounded"
              style={{ backgroundColor: menu_color }}
            />
            <div className="flex-1 space-y-0.5">
              <div
                className="h-1 rounded"
                style={{ backgroundColor: text_color, opacity: 0.3 }}
              />
              <div
                className="h-1 w-2/3 rounded"
                style={{ backgroundColor: text_color, opacity: 0.2 }}
              />
            </div>
          </div>
        </div>
      </div>
    );
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
        Loading appearances...
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
        gap: '12px',
      }}
    >
      {appearances.map((appearance) => (
        <button
          key={appearance.id}
          onClick={() => handleAppearanceSelect(appearance.id)}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            padding: '12px',
            borderRadius: '12px',
            border: `2px solid ${selectedAppearanceId === appearance.id ? '#7F77F1' : borderLineColor}`,
            backgroundColor:
              selectedAppearanceId === appearance.id
                ? 'rgba(127, 119, 241, 0.1)'
                : 'transparent',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            if (selectedAppearanceId !== appearance.id) {
              e.currentTarget.style.backgroundColor = globalHoverColor;
            }
          }}
          onMouseLeave={(e) => {
            if (selectedAppearanceId !== appearance.id) {
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
        >
          <div style={{ width: '100%' }}>
            <AppearancePreview appearance={appearance} />
          </div>
          <span
            style={{
              fontFamily: 'Work Sans, sans-serif',
              fontSize: '14px',
              fontWeight: 500,
              color: textColor,
              userSelect: 'none',
            }}
          >
            {appearance.display_name}
          </span>
        </button>
      ))}
    </div>
  );
};

export default AppearanceSelector;
