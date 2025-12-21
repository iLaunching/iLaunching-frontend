import { useEffect, useState } from 'react';
import { Upload } from 'lucide-react';
import api from '@/lib/api';
import IconPickerMini from './IconPickerMini';
import IconPicker from './IconPicker';
import AvatarImageUploader from './AvatarImageUploader';

interface ColorOption {
  option_value_id: number;
  value_name: string;
  display_name: string;
  metadata: {
    color: string;
  };
}

interface SmartHubAvatarMenuProps {
  menuColor: string;
  titleColor: string;
  currentColorId: number;
  onColorChange: (colorId: number) => void;
  globalButtonHover: string;
  textColor: string;
  currentIconId?: number;
  onIconChange: (iconId: number) => void;
  onClearIcon: () => void;
  borderLineColor: string;
  smartHubId: number | null;
  toneButtonBkColor?: string;
  toneButtonTextColor?: string;
  toneButtonBorderColor?: string;
  backgroundColor?: string;
  solidColor?: string;
  feedbackIndicatorBk?: string;
  appearanceTextColor?: string;
  buttonBkColor?: string;
  buttonTextColor?: string;
  buttonHoverColor?: string;
}

export default function SmartHubAvatarMenu({ menuColor, titleColor, currentColorId, onColorChange, globalButtonHover, textColor, currentIconId, onIconChange, onClearIcon, borderLineColor, smartHubId, toneButtonBkColor, toneButtonTextColor, toneButtonBorderColor, backgroundColor, solidColor, feedbackIndicatorBk, appearanceTextColor, buttonBkColor, buttonTextColor, buttonHoverColor }: SmartHubAvatarMenuProps) {
  const [colors, setColors] = useState<ColorOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
  const [isAvatarUploaderOpen, setIsAvatarUploaderOpen] = useState(false);

  // Debug: Log props received
  console.log('🔍 SmartHubAvatarMenu received props:', {
    solidColor,
    feedbackIndicatorBk,
    appearanceTextColor,
    toneButtonBkColor
  });

  // Wrapper to log icon changes
  const handleIconChange = (iconId: number) => {
    console.log('=== SmartHubAvatarMenu handleIconChange CALLED ===');
    console.log('Icon ID received:', iconId);
    console.log('Calling parent onIconChange callback');
    onIconChange(iconId);
    console.log('=== SmartHubAvatarMenu handleIconChange COMPLETED ===');
  };

  useEffect(() => {
    console.log('SmartHubAvatarMenu mounted');
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

  console.log('Rendering SmartHubAvatarMenu, colors:', colors.length, 'loading:', loading);

  return (
    <div
      style={{
        position: 'absolute',
        left: '30px',
        top: 'calc(100% + 15px)',
        width: '185px',
        height: 'fit-content',
        minHeight: '200px',
        backgroundColor: menuColor,
        fontFamily: 'Work Sans, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        padding: '10px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        zIndex: 10000,
        userSelect: 'none'
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
            fontSize: '13px',
            marginBottom: '',
            marginLeft:'5px',
            fontWeight: 400
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
                onClick={() => {
                  console.log('=== SmartHubAvatarMenu: Color circle clicked ===', color.option_value_id, color.display_name);
                  onColorChange(color.option_value_id);
                }}
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
            fontSize: '13px',
            marginLeft: '5px',
            fontWeight: 400,
            userSelect: 'none'
          }}
        >
          Avatar Icon
        </div>
        
        <div style={{ padding: '5px' }}>
          <IconPickerMini
            currentIconId={currentIconId}
            onIconSelect={handleIconChange}
            onMoreClick={() => setIsIconPickerOpen(true)}
            onClearIcon={onClearIcon}
            textColor={textColor}
            globalButtonHover={globalButtonHover}
            toneButtonBkColor={toneButtonBkColor}
            toneButtonTextColor={toneButtonTextColor}
          />
        </div>
      </div>

      {/* Separator Line */}
      <div
        style={{
          width: '100%',
          height: '1px',
          backgroundColor: borderLineColor,
          marginTop: '10px',
          marginBottom: '10px'
        }}
      />

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
          onClick={() => setIsAvatarUploaderOpen(true)}
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
        onIconSelect={handleIconChange}
        textColor={textColor}
        menuColor={menuColor}
        titleColor={titleColor}
        globalButtonHover={globalButtonHover}
        context="hub-settings"
        toneButtonBkColor={toneButtonBkColor}
        toneButtonTextColor={toneButtonTextColor}
      />
      
      {/* Avatar Image Uploader Modal */}
      <AvatarImageUploader
        isOpen={isAvatarUploaderOpen}
        onClose={() => setIsAvatarUploaderOpen(false)}
        context="hub-settings"
        smart_hub_id={smartHubId}
        textColor={textColor}
        menuColor={menuColor}
        titleColor={titleColor}
        globalButtonHover={globalButtonHover}
        toneButtonBkColor={toneButtonBkColor}
        toneButtonTextColor={toneButtonTextColor}
        toneButtonBorderColor={toneButtonBorderColor}
        backgroundColor={backgroundColor}
        solidColor={solidColor}
        feedbackIndicatorBk={feedbackIndicatorBk}
        appearanceTextColor={appearanceTextColor}
        buttonBkColor={buttonBkColor}
        buttonTextColor={buttonTextColor}
        buttonHoverColor={buttonHoverColor}
      />
    </div>
  );
}
