import { useEffect, useState } from 'react';

interface ColorOption {
  option_value_id: number;
  value_name: string;
  display_name: string;
  sort_order: number;
  metadata: {
    color: string;
  };
}

interface SmartHubAvatarColorPickerProps {
  userName: string;
  hubName?: string;
  selectedColorId?: number;
  onColorSelect: (colorId: number, color: string) => void;
  textColor?: string;
}

export default function SmartHubAvatarColorPicker({
  userName,
  hubName,
  selectedColorId,
  onColorSelect,
  textColor = '#000000',
}: SmartHubAvatarColorPickerProps) {
  const [colors, setColors] = useState<ColorOption[]>([]);
  const [selectedColor, setSelectedColor] = useState<string>('#80b918'); // Default to highlight green
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Immediately show fallback colors for instant UI, then fetch from API
    const mockColors = getMockColors();
    setColors(mockColors);
    
    // Fetch smart hub colors from API in background
    const fetchColors = async () => {
      try {
        // Use main API server for option sets, not auth server
        const apiUrl = `https://ilaunching-servers-production.up.railway.app/api/v1/smarthub-colors`;
        
        // Set a timeout to detect Railway cold start
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
        
        const response = await fetch(apiUrl, { signal: controller.signal });
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const data = await response.json();
          
          // Only update if we got real data from API
          if (data.colors && data.colors.length > 0) {
            setColors(data.colors);
            setError(''); // Clear any errors
            
            // Set initial selected color
            if (selectedColorId) {
              const selected = data.colors.find((c: ColorOption) => c.option_value_id === selectedColorId);
              if (selected) {
                setSelectedColor(selected.metadata.color);
              }
            }
          }
        } else {
          console.warn('API returned error:', response.status);
          setError(`Using cached colors (API: ${response.status})`);
        }
      } catch (error: any) {
        if (error.name === 'AbortError') {
          console.warn('API request timed out - Railway cold start?');
          setError('Using cached colors (slow server response)');
        } else {
          console.warn('Failed to fetch from API:', error);
          setError('Using cached colors');
        }
      }
    };

    fetchColors();
  }, [selectedColorId]);

  // Fallback mock data matching the production API (IDs 27-53)
  const getMockColors = (): ColorOption[] => [
    { option_value_id: 27, value_name: 'highlight_green', display_name: 'Highlight Green', sort_order: 1, metadata: { color: '#80b918' } },
    { option_value_id: 28, value_name: 'mid_green', display_name: 'Mid Green', sort_order: 2, metadata: { color: '#245501' } },
    { option_value_id: 29, value_name: 'persian_green', display_name: 'Persian Green', sort_order: 3, metadata: { color: '#2a9d8f' } },
    { option_value_id: 30, value_name: 'charcoal', display_name: 'Charcoal', sort_order: 4, metadata: { color: '#264653' } },
    { option_value_id: 31, value_name: 'highlight_pink', display_name: 'Highlight Pink', sort_order: 5, metadata: { color: '#FF4D6D' } },
    { option_value_id: 32, value_name: 'dark_red', display_name: 'Dark Red', sort_order: 6, metadata: { color: '#A4133C' } },
    { option_value_id: 33, value_name: 'blush', display_name: 'Blush', sort_order: 7, metadata: { color: '#DA627D' } },
    { option_value_id: 34, value_name: 'cinnabar', display_name: 'Cinnabar', sort_order: 8, metadata: { color: '#D8572A' } },
    { option_value_id: 35, value_name: 'atomic_tangerine', display_name: 'Atomic Tangerine', sort_order: 9, metadata: { color: '#E39774' } },
    { option_value_id: 36, value_name: 'saffron', display_name: 'Saffron', sort_order: 10, metadata: { color: '#F7B538' } },
    { option_value_id: 37, value_name: 'royal_blue', display_name: 'Royal Blue', sort_order: 11, metadata: { color: '#4361EE' } },
    { option_value_id: 38, value_name: 'yinmn_blue', display_name: 'YInMn Blue', sort_order: 12, metadata: { color: '#274c77' } },
    { option_value_id: 39, value_name: 'uranian_blue', display_name: 'Uranian Blue', sort_order: 13, metadata: { color: '#A3CEF1' } },
    { option_value_id: 40, value_name: 'mauve', display_name: 'Mauve', sort_order: 14, metadata: { color: '#CAA8F5' } },
    { option_value_id: 41, value_name: 'dark_purple', display_name: 'Dark Purple', sort_order: 15, metadata: { color: '#230C33' } },
    { option_value_id: 42, value_name: 'tea_rose', display_name: 'Tea Rose', sort_order: 16, metadata: { color: '#DBA8AC' } },
    { option_value_id: 43, value_name: 'pastal_green', display_name: 'Pastal Green', sort_order: 17, metadata: { color: '#797D62' } },
    { option_value_id: 44, value_name: 'forest_green', display_name: 'Forest Green', sort_order: 18, metadata: { color: '#548c2f' } },
    { option_value_id: 45, value_name: 'olive', display_name: 'Olive', sort_order: 19, metadata: { color: '#6f732f' } },
    { option_value_id: 46, value_name: 'taupe', display_name: 'Taupe', sort_order: 20, metadata: { color: '#997B66' } },
    { option_value_id: 47, value_name: 'chestnut', display_name: 'Chestnut', sort_order: 21, metadata: { color: '#5E3023' } },
    { option_value_id: 48, value_name: 'beaver', display_name: 'Beaver', sort_order: 22, metadata: { color: '#a9927d' } },
    { option_value_id: 49, value_name: 'goldenrod', display_name: 'Goldenrod', sort_order: 23, metadata: { color: '#C9A227' } },
    { option_value_id: 50, value_name: 'old_gold', display_name: 'Old Gold', sort_order: 24, metadata: { color: '#C9A227' } },
    { option_value_id: 51, value_name: 'charcoal_dark', display_name: 'Charcoal Dark', sort_order: 25, metadata: { color: '#2A2828' } },
    { option_value_id: 52, value_name: 'french_grey', display_name: 'French Grey', sort_order: 26, metadata: { color: '#CED4DA' } },
    { option_value_id: 53, value_name: 'lapis_lazuli', display_name: 'Lapis Lazuli', sort_order: 27, metadata: { color: '#3152BB' } },
  ];

  const handleColorClick = (option: ColorOption) => {
    setSelectedColor(option.metadata.color);
    onColorSelect(option.option_value_id, option.metadata.color);
  };

  // Get first letter of hub name if provided, otherwise use user name
  const avatarLetter = (hubName || userName).charAt(0).toUpperCase();

  return (
    <div className="flex flex-row gap-8 items-start justify-center w-full max-w-5xl mx-auto px-6">
      {/* Left: Avatar Preview */}
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-32 h-32 flex items-center justify-center text-5xl font-bold text-white transition-all duration-300 shadow-lg"
          style={{ backgroundColor: selectedColor, fontFamily: 'Work Sans, sans-serif', borderRadius: '20px' }}
        >
          {avatarLetter}
        </div>
        <p className="text-sm" style={{ fontFamily: 'Work Sans, sans-serif', color: textColor }}>Preview</p>
      </div>

      {/* Right: Color Grid */}
      <div className="flex-1 max-w-2xl">
        <h3 className="text-lg font-medium mb-4" style={{ fontFamily: 'Work Sans, sans-serif', color: textColor }}>Select Hub Color</h3>
        
        {error && (
          <div className="mb-3 px-2 py-1.5 bg-gray-700/50 border border-gray-600 rounded text-gray-300 text-xs">
            ℹ️ {error}
          </div>
        )}
        
        <div className="grid grid-cols-9 gap-4 mt-[10px]">
          {colors.map((option) => (
            <button
              key={option.option_value_id}
              onClick={() => handleColorClick(option)}
              className={`
                w-[25px] h-[25px] rounded-full transition-all duration-200 
                relative
                ${
                  selectedColor === option.metadata.color
                    ? 'ring-2 ring-white scale-125'
                    : ''
                }
              `}
              style={{ 
                backgroundColor: option.metadata.color,
                boxShadow: selectedColor === option.metadata.color 
                  ? `0 0 0 1px ${option.metadata.color}` 
                  : 'none'
              }}
              onMouseEnter={(e) => {
                if (selectedColor !== option.metadata.color) {
                  e.currentTarget.style.boxShadow = `0 0 0 1px ${option.metadata.color}`;
                }
              }}
              onMouseLeave={(e) => {
                if (selectedColor !== option.metadata.color) {
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
              title={option.display_name}
              aria-label={`Select ${option.display_name} color`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
