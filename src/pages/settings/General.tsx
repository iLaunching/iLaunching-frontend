import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera } from '@fortawesome/free-solid-svg-icons';
import * as solidIcons from '@fortawesome/free-solid-svg-icons';
import { Ban } from 'lucide-react';
import api from '@/lib/api';
import AvatarImageUploader from '@/components/AvatarImageUploader';
import IconPicker from '@/components/IconPicker';
import DeleteMenu from '@/components/DeleteMenu';
import { getRandomDeleteMessage } from '@/constants/messages';
import {
  faUser,
  faHeart,
  faStar,
  faHome,
  faBriefcase,
  faGraduationCap,
  faMusic,
  faGamepad,
  faCoffee,
  faPizzaSlice,
  faBicycle,
  faCar,
  faPlane,
  faRocket,
  faPalette,
  faCode,
  faLaptop,
  faMobileAlt,
  faHeadphones,
  faBook,
  faPencilAlt,
  faLightbulb,
  faTrophy,
  faMedal,
  faCrown,
  faGem,
  faFire,
  faBolt,
  faMagic,
  faTree,
  faDog,
  faCat,
  faFish,
  faBug,
} from '@fortawesome/free-solid-svg-icons';

// Add custom tooltip positioning for avatar
const avatarTooltipStyles = `
  .avatar-tooltip-trigger::before {
    right: auto !important;
    left: 50% !important;
    top: auto !important;
    bottom: calc(100% + 8px) !important;
    transform: translateX(-50%) !important;
  }
  .avatar-tooltip-trigger::after {
    right: auto !important;
    left: 50% !important;
    top: auto !important;
    bottom: calc(100% + 3px) !important;
    transform: translateX(-50%) !important;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2), 0px 14px 0 -2.5px #111827 !important;
  }
`;

interface SmartHubContextType {
  theme: {
    text: string;
    background: string;
    border: string;
    border_line_color_light: string;
    global_button_hover: string;
    button_hover_color?: string;
    danger_tone_border?: string;
    danger_button_hover?: string;
    danger_bk_light_color?: string;
    danger_bk_solid_color?: string;
    danger_bk_solid_text_color?: string;
    danger_button_solid_color?: string;
    danger_tone_bk?: string;
    danger_tone_text?: string;
    [key: string]: any;
  };
  profile: {
    first_name: string;
    surname: string;
    smart_hubs?: Array<{
      id: string;
      name: string;
      hub_color_id: number;
      color?: string;
      journey?: string;
    }>;
    [key: string]: any;
  };
  smart_hub: {
    id: string;
    name: string;
    description?: string;
    avatar?: string;
    hub_color?: string;
    is_default?: boolean;
    [key: string]: any;
  };
}

interface ColorOption {
  option_value_id: number;
  value_name: string;
  display_name: string;
  metadata: {
    color: string;
  };
}

// Popular icons for icon picker
const popularIcons: { icon?: any; name: string; id: number | null; isClear?: boolean }[] = [
  { name: 'clear', id: null, isClear: true },
  { icon: faUser, name: 'user', id: 1174 },
  { icon: faHeart, name: 'heart', id: 484 },
  { icon: faStar, name: 'star', id: 1491 },
  { icon: faHome, name: 'home', id: 1111 },
  { icon: faBriefcase, name: 'briefcase', id: 1843 },
  { icon: faGraduationCap, name: 'graduation-cap', id: 1497 },
  { icon: faCamera, name: 'camera', id: 341 },
  { icon: faMusic, name: 'music', id: 1665 },
  { icon: faGamepad, name: 'gamepad', id: 1931 },
  { icon: faCoffee, name: 'coffee', id: 1503 },
  { icon: faPizzaSlice, name: 'pizza-slice', id: 1361 },
  { icon: faBicycle, name: 'bicycle', id: 944 },
  { icon: faCar, name: 'car', id: 132 },
  { icon: faPlane, name: 'plane', id: 1309 },
  { icon: faRocket, name: 'rocket', id: 473 },
  { icon: faPalette, name: 'palette', id: 303 },
  { icon: faCode, name: 'code', id: 802 },
  { icon: faLaptop, name: 'laptop', id: 653 },
  { icon: faMobileAlt, name: 'mobile-alt', id: 1088 },
  { icon: faHeadphones, name: 'headphones', id: 1383 },
  { icon: faBook, name: 'book', id: 452 },
  { icon: faPencilAlt, name: 'pencil-alt', id: 779 },
  { icon: faLightbulb, name: 'lightbulb', id: 796 },
  { icon: faTrophy, name: 'trophy', id: 191 },
  { icon: faMedal, name: 'medal', id: 136 },
  { icon: faCrown, name: 'crown', id: 723 },
  { icon: faGem, name: 'gem', id: 1038 },
  { icon: faFire, name: 'fire', id: 540 },
  { icon: faBolt, name: 'bolt', id: 1738 },
  { icon: faMagic, name: 'magic', id: 1156 },
  { icon: faTree, name: 'tree', id: 314 },
  { icon: faDog, name: 'dog', id: 82 },
  { icon: faCat, name: 'cat', id: 1981 },
  { icon: faFish, name: 'fish', id: 1370 },
  { icon: faBug, name: 'bug', id: 1545 },
];

export default function General() {
  const { theme, smart_hub, profile } = useOutletContext<SmartHubContextType>();
  const queryClient = useQueryClient();
  
  const [hubName, setHubName] = useState(smart_hub?.name || '');
  const [hubDescription, setHubDescription] = useState(smart_hub?.description || '');
  const [isAvatarUploaderOpen, setIsAvatarUploaderOpen] = useState(false);
  const [isAvatarHovered, setIsAvatarHovered] = useState(false);
  const [colors, setColors] = useState<ColorOption[]>([]);
  const [loadingColors, setLoadingColors] = useState(true);
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
  const [isDeleteMenuOpen, setIsDeleteMenuOpen] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState('');

  // Update local state when smart_hub changes
  useEffect(() => {
    setHubName(smart_hub?.name || '');
    setHubDescription(smart_hub?.description || '');
  }, [smart_hub?.name, smart_hub?.description]);

  // Fetch colors from API
  useEffect(() => {
    const fetchColors = async () => {
      try {
        const response = await api.get('/smarthub-colors');
        setColors(response.data.colors);
      } catch (error) {
        console.error('Failed to fetch colors:', error);
      } finally {
        setLoadingColors(false);
      }
    };

    fetchColors();
  }, []);

  // Mutation to update smart hub details
  const updateDetailsMutation = useMutation({
    mutationFn: async ({ name, description }: { name?: string; description?: string }) => {
      const response = await api.patch('/smart-hub/details', {
        smart_hub_id: smart_hub.id,
        name,
        description,
      });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch smart hub data with correct query key
      queryClient.invalidateQueries({ queryKey: ['current-smart-hub'] });
      console.log('✅ Smart hub data invalidated and refetching');
    },
    onError: (error: any) => {
      console.error('Failed to update smart hub details:', error);
    },
  });

  const handleNameBlur = () => {
    console.log('Name blur triggered', { hubName, originalName: smart_hub?.name, changed: hubName !== smart_hub?.name });
    if (hubName !== smart_hub?.name && hubName.trim() !== '') {
      console.log('Updating name to:', hubName);
      updateDetailsMutation.mutate({ name: hubName });
    }
  };

  const handleDescriptionBlur = () => {
    console.log('Description blur triggered', { hubDescription, originalDescription: smart_hub?.description, changed: hubDescription !== smart_hub?.description });
    if (hubDescription !== smart_hub?.description) {
      console.log('Updating description to:', hubDescription);
      updateDetailsMutation.mutate({ description: hubDescription });
    }
  };

  // Mutation to update smart hub color
  const updateColorMutation = useMutation({
    mutationFn: async (colorId: number) => {
      console.log('Calling API to update smart hub color:', { colorId, smartHubId: smart_hub.id });
      const response = await api.patch(`/smart-hub/color?smart_hub_id=${smart_hub.id}&hub_color_id=${colorId}`);
      console.log('API response:', response.data);
      return response.data;
    },
    onSuccess: () => {
      console.log('Smart hub color updated successfully');
      queryClient.invalidateQueries({ queryKey: ['current-smart-hub'] });
      console.log('✅ Smart hub color updated and refetching');
    },
    onError: (error: any) => {
      console.error('Failed to update smart hub color:', error);
      console.error('Error response:', error.response?.data);
    },
  });

  const handleColorSelect = (colorId: number) => {
    console.log('Color selected:', colorId);
    updateColorMutation.mutate(colorId);
  };

  // Mutation to update smart hub icon
  const updateIconMutation = useMutation({
    mutationFn: async (iconId: number) => {
      console.log('Calling API to update smart hub icon:', { iconId, smartHubId: smart_hub.id });
      const response = await api.patch(`/smart-hub/icon?smart_hub_id=${smart_hub.id}&smartHub_icon_id=${iconId}`);
      console.log('API response:', response.data);
      return response.data;
    },
    onSuccess: () => {
      console.log('Smart hub icon updated successfully');
      queryClient.invalidateQueries({ queryKey: ['current-smart-hub'] });
      console.log('✅ Smart hub icon updated and refetching');
    },
    onError: (error: any) => {
      console.error('Failed to update smart hub icon:', error);
      console.error('Error response:', error.response?.data);
    },
  });

  const handleIconSelect = (iconId: number) => {
    console.log('Icon selected:', iconId);
    updateIconMutation.mutate(iconId);
  };

  // Mutation to clear smart hub icon
  const clearIconMutation = useMutation({
    mutationFn: async () => {
      console.log('Calling API to clear smart hub icon for hub:', smart_hub.id);
      const response = await api.delete(`/smart-hub/icon?smart_hub_id=${smart_hub.id}`);
      console.log('API response:', response.data);
      return response.data;
    },
    onSuccess: () => {
      console.log('Smart hub icon cleared successfully');
      queryClient.invalidateQueries({ queryKey: ['current-smart-hub'] });
      console.log('✅ Smart hub icon cleared and refetching');
    },
    onError: (error: any) => {
      console.error('Failed to clear smart hub icon:', error);
      console.error('Error response:', error.response?.data);
    },
  });

  const handleClearIcon = () => {
    console.log('Clear icon clicked');
    clearIconMutation.mutate();
  };

  // Function to get icon definition from smart hub icon data
  const getIconDefinition = () => {
    console.log('getIconDefinition called, smart_hub:', smart_hub);
    console.log('avatar_display_option_value_id:', smart_hub?.avatar_display_option_value_id);
    console.log('smartHub_icon:', smart_hub?.smartHub_icon);
    
    if (!smart_hub?.smartHub_icon?.icon_prefix || !smart_hub?.smartHub_icon?.icon_name) {
      console.log('No icon data available');
      return null;
    }

    const currentIconPrefix = smart_hub.smartHub_icon.icon_prefix;
    const currentIconName = smart_hub.smartHub_icon.icon_name;

    console.log('Icon prefix:', currentIconPrefix, 'Icon name:', currentIconName);

    // Only solid icons are currently supported
    if (currentIconPrefix !== 'fas') {
      console.warn(`Only solid icons are currently supported. Prefix: ${currentIconPrefix}`);
      return null;
    }
    
    try {
      // Remove 'fa-' prefix if present, then convert kebab-case to camelCase and add 'fa' prefix
      const cleanName = currentIconName.startsWith('fa-') ? currentIconName.slice(3) : currentIconName;
      const camelCase = cleanName
        .split('-')
        .map((word, index) => index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1))
        .join('');
      const iconKey = `fa${camelCase.charAt(0).toUpperCase()}${camelCase.slice(1)}`;

      console.log('Looking for icon key:', iconKey);
      const icon = solidIcons[iconKey as keyof typeof solidIcons];
      console.log('Found icon:', icon);
      return icon;
    } catch (error) {
      console.warn(`Icon not found: ${currentIconName}`, error);
    }
    return null;
  };

  // Handle delete smart hub
  const handleDeleteSmartHub = () => {
    console.log('📋 GENERAL: handleDeleteSmartHub called');
    console.log('📋 GENERAL: Invalidating current-smart-hub query cache');
    // Invalidate cache to refetch current hub data (including the new current hub after switch)
    queryClient.invalidateQueries({ queryKey: ['current-smart-hub'] });
    console.log('📋 GENERAL: Query invalidated, closing delete menu');
    setIsDeleteMenuOpen(false);
    console.log('📋 GENERAL: Delete menu closed, UI should refresh automatically');
  };

  return (
    <div 
      style={{
        width: '80%',
        padding: '40px',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Work Sans, sans-serif',
        justifySelf: 'center',
        paddingTop: '60px'
        
      }}
    >
      <style>{avatarTooltipStyles}</style>
      {/* Title */}
      <h1 
        style={{
          fontSize: '18px',
          fontWeight: 500,
          marginBottom: '32px',
          fontFamily: 'Work Sans, sans-serif'
        }}
      >
        Smart Hub Settings
      </h1>

      {/* General Section */}
      <div 
        style={{
          marginBottom: '32px',
          fontFamily: 'Work Sans, sans-serif',
          border: `1px solid ${theme.border}`,
          borderRadius: '10px',
        }}
      >
        <div
          style={{
            fontFamily: 'Work Sans, sans-serif',
            borderBottom: `1px solid ${theme.border}`,
            padding:'10px',
            height:'fit-content',
            backgroundColor: theme.global_button_hover,
            borderTopLeftRadius: '9px',
            borderTopRightRadius: '9px',
          
          }}
          >
        <h2 
          style={{
            fontSize: '15px',
            fontWeight: 500,
            fontFamily: 'Work Sans, sans-serif',
            userSelect: 'none',
          }}
        >
          General
        </h2>
        </div>

       <h2
       style={{
        fontSize: '13px',
        fontWeight: 400,
        marginBottom: '16px',
        fontFamily: 'Work Sans, sans-serif',
        marginLeft: '16px',
        marginTop: '16px',
        color: theme.text,
       }}
       >
        Avatar and details
        </h2>
        
      {/* smart hub details Sections Content */}
        <div 
          style={{
            padding: '16px',
            fontFamily: 'Work Sans, sans-serif',
            minHeight: '100px',
            borderBottom: `1px solid ${theme.border}`,
            display: 'flex',
            flexDirection: 'row',
            gap: '24px',
            alignItems: 'flex-start',
          }}
        >
          {/* Smart Hub Avatar */}
          <div
            className="tooltip-trigger avatar-tooltip-trigger"
            data-tooltip="Upload an image"
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '15px',
              backgroundColor: smart_hub?.hub_color || theme.border,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              fontWeight: 600,
              color: '#ffffff',
              flexShrink: 0,
              position: 'relative',
              cursor: 'pointer',
            }}
            onMouseEnter={() => setIsAvatarHovered(true)}
            onMouseLeave={() => setIsAvatarHovered(false)}
            onClick={() => setIsAvatarUploaderOpen(true)}
          >
            {smart_hub?.avatar_display_option_value_id === 26 && getIconDefinition() ? (
              <FontAwesomeIcon icon={getIconDefinition()} style={{ fontSize: '40px' }} />
            ) : (
              smart_hub?.avatar || smart_hub?.name?.charAt(0)?.toUpperCase() || 'S'
            )}
            
            {/* Hover Overlay */}
            {isAvatarHovered && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: '15px',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.2s ease',
                }}
              >
                <FontAwesomeIcon 
                  icon={faCamera} 
                  style={{ 
                    fontSize: '24px', 
                    color: '#ffffff' 
                  }} 
                />
              </div>
            )}
          </div>

          {/* Smart Hub Details Column */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              flex: 1,
            }}
          >
            {/* Smart Hub Name Input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label
                style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  color: theme.text,
                  fontFamily: 'Work Sans, sans-serif',
                }}
              >
                Smart Hub Name
              </label>
              <input
                type="text"
                value={hubName}
                onChange={(e) => setHubName(e.target.value)}
                onBlur={(e) => {
                  e.target.style.border = `1px solid ${theme.border}`;
                  handleNameBlur();
                }}
                style={{
                  padding: '10px 12px',
                  fontSize: '14px',
                  fontFamily: 'Work Sans, sans-serif',
                  border: `1px solid ${theme.border}`,
                  borderRadius: '6px',
                  backgroundColor: theme.background,
                  color: theme.text,
                  outline: 'none',
                }}
                onFocus={(e) => {
                  e.target.style.border = `1px solid ${theme.tone_button_bk_color || theme.border}`;
                }}
              />
            </div>

            {/* Smart Hub Description Input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label
                style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  color: theme.text,
                  fontFamily: 'Work Sans, sans-serif',
                }}
              >
                Description
              </label>
              <textarea
                value={hubDescription}
                onChange={(e) => setHubDescription(e.target.value)}
                onBlur={(e) => {
                  e.target.style.border = `1px solid ${theme.border}`;
                  handleDescriptionBlur();
                }}
                rows={4}
                style={{
                  padding: '10px 12px',
                  fontSize: '14px',
                  fontFamily: 'Work Sans, sans-serif',
                  border: `1px solid ${theme.border}`,
                  borderRadius: '6px',
                  backgroundColor: theme.background,
                  color: theme.text,
                  outline: 'none',
                  resize: 'vertical',
                }}
                onFocus={(e) => {
                  e.target.style.border = `1px solid ${theme.tone_button_bk_color || theme.border}`;
                }}
              />
            </div>
          </div>
        </div>


      <h2
      style={{
        fontSize: '13px',
        fontWeight: 400,
        marginBottom: '16px',
        fontFamily: 'Work Sans, sans-serif',
        marginLeft: '16px',
        marginTop: '16px',
        color: theme.text,
      }}
      >
        Avatar color
        </h2>
       
       {/* Avatar Color Sections Content */}
        <div 
          style={{
            padding: '16px',
            fontFamily: 'Work Sans, sans-serif',
            minHeight: '100px',
            borderBottom: `1px solid ${theme.border}`,
          }}
        >
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '16px',
            width: '100%'
          }}>
            {loadingColors ? (
              <div style={{ color: theme.text, fontSize: '14px' }}>Loading colors...</div>
            ) : colors.length === 0 ? (
              <div style={{ color: theme.text, fontSize: '14px' }}>No colors found</div>
            ) : (
              colors.map((color) => (
                <button
                  key={color.option_value_id}
                  onClick={() => handleColorSelect(color.option_value_id)}
                  style={{
                    width: '25px',
                    height: '25px',
                    borderRadius: '50%',
                    backgroundColor: color.metadata?.color || '#4361EE',
                    cursor: 'pointer',
                    border: smart_hub?.hub_color_id === color.option_value_id 
                      ? '2px solid #ffffff' 
                      : '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: smart_hub?.hub_color_id === color.option_value_id 
                      ? `0 0 0 2px ${color.metadata?.color || '#4361EE'}80` 
                      : 'none',
                    transition: 'all 0.2s ease',
                    padding: 0,
                  }}
                  onMouseEnter={(e) => {
                    if (smart_hub?.hub_color_id !== color.option_value_id) {
                      e.currentTarget.style.boxShadow = `0 0 0 2px ${color.metadata?.color || '#4361EE'}40`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (smart_hub?.hub_color_id !== color.option_value_id) {
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                  title={color.display_name}
                  aria-label={`Select ${color.display_name} color`}
                />
              ))
            )}
          </div>
        </div>


      <h2
      style={{
        fontSize: '13px',
        fontWeight: 400,
        marginBottom: '16px',
        fontFamily: 'Work Sans, sans-serif',
        marginLeft: '16px',
        marginTop: '16px',
        color: theme.text,
      }}
      >
        Avatar Icon
        </h2>

        {/* Avatar icon Sections Content */}
        <div 
          style={{
            padding: '16px',
            fontFamily: 'Work Sans, sans-serif',
            minHeight: '100px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '16px',
            width: '100%'
          }}>
            {popularIcons.map((item) => {
              const isSelected = smart_hub?.smartHub_icon_id === item.id;

              // Special handling for clear button
              if (item.isClear) {
                return (
                  <button
                    key="clear"
                    onClick={handleClearIcon}
                    style={{
                      width: '28px',
                      height: '28px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      outline: 'none',
                      color: theme.text,
                      cursor: 'pointer',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'background-color 0.2s ease',
                    }}
                    title="Clear Icon"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = theme.global_button_hover;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <Ban size={16} />
                  </button>
                );
              }

              // Regular icon button
              return (
                <button
                  key={item.id}
                  onClick={() => item.id && handleIconSelect(item.id)}
                  style={{
                    width: '28px',
                    height: '28px',
                    backgroundColor: isSelected ? (theme.tone_button_bk_color || theme.global_button_hover) : 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: isSelected ? (theme.tone_button_text_color || theme.text) : theme.text,
                    cursor: 'pointer',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                  }}
                  title={item.name}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = theme.global_button_hover;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  {item.icon && <FontAwesomeIcon icon={item.icon} size="sm" />}
                </button>
              );
            })}
          </div>

          {/* More Icons Button */}
          <button
            onClick={() => setIsIconPickerOpen(true)}
            style={{
              width: '20%',
              height: '35px',
              backgroundColor: 'transparent',
              color: theme.text,
              fontFamily: 'Work Sans, sans-serif',
              border: `1px solid ${theme.text}40`,
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'background-color 0.2s ease',
              marginTop: '15px',
            
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.global_button_hover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            More Icons
          </button>
        </div>






      </div>

      {/* Custom Section */}
      <div 
        style={{
          marginBottom: '32px',
          fontFamily: 'Work Sans, sans-serif',
          border: `1px solid ${theme.border}`,
          borderRadius: '10px',
        }}
      >
        <div
          style={{
            fontFamily: 'Work Sans, sans-serif',
            borderBottom: `1px solid ${theme.border}`,
            padding:'10px',
            height:'fit-content',
            backgroundColor: theme.global_button_hover,
            borderTopLeftRadius: '9px',
            borderTopRightRadius: '9px', 
          
          }}
          >
        <h2 
          style={{
            fontSize: '15px',
            fontWeight: 500,
            fontFamily: 'Work Sans, sans-serif',
            userSelect: 'none'
          }}
        >
          Custom
        </h2>
        </div>

        <div 
          style={{
            padding: '16px',
            fontFamily: 'Work Sans, sans-serif',
            minHeight: '100px'
          }}
        >
          {/* Custom section content will go here */}
        </div>
      </div>

      {/* Danger Section */}
      <div 
        style={{
          marginBottom: '32px',
          fontFamily: 'Work Sans, sans-serif',
          border: `1px solid ${theme.danger_tone_border}`,
          borderRadius: '10px',

        }}
      >
        <div
        style={{
          fontFamily:'work sans, sans-derif',
          borderBottom: `1px solid ${theme.danger_tone_border}`,
          backgroundColor: theme.danger_tone_bk,
          height: 'fit-content',
          padding:'10px',
          borderTopLeftRadius: '9px',
          borderTopRightRadius: '9px',

        }}
        >
        <h2 
          style={{
            fontSize: '15px',
            fontWeight: 500,
            marginBottom: '16px',
            fontFamily: 'Work Sans, sans-serif',
            color: theme.danger_tone_text,  
          }}
        >
          Danger
        </h2>
        </div>
        

        {/* Transfer ownership section */}
        <div 
          style={{
            padding: '10px',
            fontFamily: 'Work Sans, sans-serif',
            minHeight:'30px',
            borderBottom:`1px solid ${theme.danger_tone_border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{
            fontSize: '14px',
            fontFamily: 'Work Sans, sans-serif',
            color: theme.text,
          }}>
            Transfer full ownership to another member
          </span>
          
          <button
            style={{
              paddingLeft: '16px',
              paddingRight: '16px',
              backgroundColor: theme.danger_bk_light_color,
              color: theme.danger_bk_solid_color,
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 400,
              fontFamily: 'Work Sans, sans-serif',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              height: '33px',
              userSelect:'none',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.danger_bk_solid_color;
              e.currentTarget.style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.danger_bk_light_color;
              e.currentTarget.style.color = theme.danger_bk_solid_color;
            }}
          >
            Select new owner
          </button>
        </div>



          {/* Delete smart hub section - Only show if user has more than one smart hub */}
          {profile?.smart_hubs && profile.smart_hubs.length > 1 && (
            <div 
              style={{
                padding: '10px',
                fontFamily: 'Work Sans, sans-serif',
                minHeight:'50px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span style={{
                fontSize: '14px',
                fontFamily: 'Work Sans, sans-serif',
                color: theme.text,
              }}>
                Delete this Smart Hub forever
              </span>
              
              <button
                style={{
                  paddingLeft: '16px',
                  paddingRight: '16px',
                  backgroundColor: 'transparent',
                  color: theme.danger_tone_text,
                  border: `1px solid ${theme.danger_tone_border}`,
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 500,
                  fontFamily: 'Work Sans, sans-serif',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  height: '33px',
                  userSelect:'none',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.danger_bk_solid_color;
                  e.currentTarget.style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = theme.danger_tone_text;
                  e.currentTarget.style.border = `1px solid ${theme.danger_tone_border}`;
                }}
                onClick={() => {
                  // Pick a random message when opening the delete menu
                  const userName = profile?.first_name || 'User';
                  setDeleteMessage(getRandomDeleteMessage(smart_hub?.name || 'this Smart Hub', userName));
                  setIsDeleteMenuOpen(true);
                }}
              >
                Delete Smart Hub
              </button>
            </div>
          )}

      </div>
      {/* Icon Picker Modal */}
      <IconPicker
        isOpen={isIconPickerOpen}
        onClose={() => setIsIconPickerOpen(false)}
        currentIconId={smart_hub?.smartHub_icon_id}
        onIconSelect={handleIconSelect}
        textColor={theme.text}
        menuColor={theme.background}
        titleColor={theme.text}
        globalButtonHover={theme.global_button_hover}
        context="hub-settings"
        toneButtonBkColor={theme.tone_button_bk_color}
        toneButtonTextColor={theme.tone_button_text_color}
      />
      {/* Avatar Image Uploader */}
      <AvatarImageUploader
        isOpen={isAvatarUploaderOpen}
        onClose={() => setIsAvatarUploaderOpen(false)}
        context="hub-settings"
        smart_hub_id={smart_hub?.id ? Number(smart_hub.id) : null}
        textColor={theme.text}
        menuColor={theme.menu}
        titleColor={theme.title_menu_color_light || theme.text}
        globalButtonHover={theme.global_button_hover || theme.border}
        toneButtonBkColor={theme.tone_button_bk_color}
        toneButtonTextColor={theme.tone_button_text_color}
        toneButtonBorderColor={theme.tone_button_border_color}
        backgroundColor={theme.background}
        solidColor={theme.header_background}
        feedbackIndicatorBk={theme.feedback_indicator_bk}
        appearanceTextColor={theme.text}
        buttonBkColor={theme.button_bk_color}
        buttonTextColor={theme.button_text_color}
        buttonHoverColor={theme.button_hover_color}
      />
      {/* DeleteMenu Modal */}
      <DeleteMenu
        isOpen={isDeleteMenuOpen}
        onClose={() => setIsDeleteMenuOpen(false)}
        onConfirm={handleDeleteSmartHub}
        menuColor={theme.background}
        textColor={theme.text}
        borderLineColor={theme.border}
        globalHoverColor={theme.global_button_hover}
        chatBk1={theme.chat_bk_1}
        solidColor={theme.header_background}
        buttonHoverColor={theme.button_hover_color}
        aiAcknowledgeTextColor={theme.text}
        dangerButtonColor={theme.danger_bk_light_color}
        dangerButtonTextColor={theme.danger_bk_solid_text_color}
        dangerButtonHoverColor={theme.button_hover_color}
        dangerButtonSolidColor={theme.danger_button_solid_color}
        dangerToneBk={theme.danger_tone_bk}
        dangerToneBorder={theme.danger_tone_border}
        dangerToneText={theme.danger_tone_text}
        dangerBkLightColor={theme.danger_bk_light_color}
        dangerBkSolidColor={theme.danger_bk_solid_color}
        dangerBkSolidTextColor={theme.danger_bk_solid_text_color}
        context="smart-hub"
        itemName={smart_hub?.name}
        customMessage={deleteMessage}
        smartHubsCount={profile?.smart_hubs?.length || 1}
        isDefaultSmartHub={smart_hub?.is_default || false}
        smartHubId={smart_hub?.id}
        smartHubs={profile?.smart_hubs || []}
      />
    </div>
  );
}
