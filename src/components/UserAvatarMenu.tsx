import { useEffect, useState } from 'react';
import { Upload } from 'lucide-react';
import api from '@/lib/api';
import IconPickerMini from './IconPickerMini';
import IconPicker from './IconPicker';

interface ColorOption {
  option_value_id: number;
  value_name: string;
  display_name: string;
  metadata: {
    color: string;
  };
}

interface UserAvatarMenuProps {
  menuColor: string;
  titleColor: string;
  currentColorId: number;
  onColorChange: (colorId: number) => void;
  globalButtonHover: string;
  textColor: string;
  currentIconId?: number;
  onIconChange: (iconId: number) => void;
}

export default function UserAvatarMenu({ menuColor, titleColor, currentColorId, onColorChange, globalButtonHover, textColor, currentIconId, onIconChange }: UserAvatarMenuProps) {
  const [colors, setColors] = useState<ColorOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);

  useEffect(() => {
    console.log('UserAvatarMenu mounted');
    const fetchColors = async () => {
      try {
        console.log('Fetching colors from API...');
        const response = await api.get('/smarthub-colors');
        console.log('Fetched colors response:', response.data);
        console.log('Number of colors:', response.data.colors?.length);
        setColors(response.data.colors);
      } catch (error) {
        console.error('Failed to fetch colors:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchColors();
  }, []);

  console.log('Rendering UserAvatarMenu, colors:', colors.length, 'loading:', loading);

  return (
    <div
      style={{
        position: 'absolute',
        width: '180px',
        height: 'fit-content',
        minHeight: '200px',
        backgroundColor: menuColor,
        fontFamily: 'Work Sans, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        padding: '10px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        zIndex: 10000
      }}
    >
      {/* Section 1 */}
      <div
        style={{
          height: 'fit-content',
          minHeight: '100px'
        }}
      >
        <div
          style={{
            fontFamily: 'Work Sans, sans-serif',
            color: titleColor,
            fontSize: '14px',
            marginBottom: '10px',
            marginLeft:'5px',
            fontWeight: 600
          }}
        >
          Avatar Color
        </div>
        
        {/* Color circles grid */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            padding: '5px',
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: '4px',
            minHeight: '50px'
          }}
        >
          {loading ? (
            <div style={{ color: titleColor, fontSize: '10px' }}>Loading colors...</div>
          ) : colors.length === 0 ? (
            <div style={{ color: titleColor, fontSize: '10px' }}>No colors found</div>
          ) : (
            colors.map((color) => (
              <div
                key={color.option_value_id}
                onClick={() => onColorChange(color.option_value_id)}
                style={{
                  width: '23px',
                  height: '23px',
                  borderRadius: '50%',
                  backgroundColor: color.metadata?.color || '#4361EE',
                  cursor: 'pointer',
                  border: currentColorId === color.option_value_id ? '2px solid #ffffff' : '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: currentColorId === color.option_value_id ? '0 0 0 2px rgba(67, 97, 238, 0.5)' : 'none',
                  transition: 'all 0.2s ease'
                }}
                title={color.display_name}
              />
            ))
          )}
        </div>
      </div>

      {/* Section 2 */}
      <div
        style={{
          height: 'fit-content',
          minHeight: '100px',
          marginTop: '10px'
        }}
      >
        <div
          style={{
            fontFamily: 'Work Sans, sans-serif',
            color: titleColor,
            fontSize: '14px',
            marginBottom: '10px',
            marginLeft: '5px',
            fontWeight: 600
          }}
        >
          Avatar Icon
        </div>
        
        <div style={{ padding: '5px' }}>
          <IconPickerMini
            currentIconId={currentIconId}
            onIconSelect={onIconChange}
            onMoreClick={() => setIsIconPickerOpen(true)}
            textColor={textColor}
            globalButtonHover={globalButtonHover}
          />
        </div>
      </div>

      {/* Section 3 */}
      <div
        style={{
          height: 'fit-content',
          justifyContent: 'center',
          alignItems: 'center',
          display: 'flex'
          
        }}
      >
        <button
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = globalButtonHover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          style={{
            height: '35px',
            fontFamily: 'Work Sans, sans-serif',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            borderRadius: '4px',
            transition: 'background-color 0.2s ease',
            padding: '0 10px',
            color: textColor,
            width: '100%'
          }}
        >
          <Upload size={18} style={{ color: textColor }} />
          <span style={{ fontSize: '14px' }}>Upload avatar</span>
        </button>
      </div>
      
      {/* Icon Picker Modal */}
      <IconPicker
        isOpen={isIconPickerOpen}
        onClose={() => setIsIconPickerOpen(false)}
        currentIconId={currentIconId}
        onIconSelect={onIconChange}
        textColor={textColor}
        menuColor={menuColor}
        titleColor={titleColor}
        globalButtonHover={globalButtonHover}
      />
    </div>
  );
}
