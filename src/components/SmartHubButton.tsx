import { ChevronDown, Edit } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as solidIcons from '@fortawesome/free-solid-svg-icons';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import SmartHubCreator from './SmartHubCreator';
import SmartHubAvatarMenu from './SmartHubAvatarMenu';
import api from '@/lib/api';

interface SmartHub {
  id: string;
  name: string;
  hub_color_id: number;
  color?: string;
  journey?: string;
  order_number?: number;
}

interface SmartHubButtonProps {
  smartHubName: string;
  hubColor: string;
  globalHoverColor: string;
  menuColor: string;
  borderLineColor: string;
  textColor: string;
  titleMenuColorLight: string;
  journey?: string;
  smartHubs?: SmartHub[];
  currentSmartHubId?: string;
  onClick?: () => void;
  currentColorId?: number;
  onColorChange?: (colorId: number) => void;
  currentIconId?: number;
  currentIconName?: string;
  currentIconPrefix?: 'fas' | 'far' | 'fab';
  avatarDisplayMode?: number;
  onIconChange?: (iconId: number) => void;
  onClearIcon?: () => void;
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
  chatBk1?: string;
  promptBk?: string;
  promptTextColor?: string;
  aiAcknowledgeTextColor?: string;
}

export default function SmartHubButton({
  smartHubName,
  hubColor,
  globalHoverColor,
  menuColor,
  borderLineColor,
  textColor,
  titleMenuColorLight,
  journey = 'Validate Journey',
  smartHubs = [],
  currentSmartHubId,
  onClick,
  currentColorId = 1,
  onColorChange = () => {},
  currentIconId,
  currentIconName,
  currentIconPrefix,
  avatarDisplayMode = 24,
  onIconChange = () => {},
  onClearIcon = () => {},
  toneButtonBkColor,
  toneButtonTextColor,
  toneButtonBorderColor,
  backgroundColor,
  solidColor,
  feedbackIndicatorBk,
  appearanceTextColor,
  buttonBkColor,
  buttonTextColor,
  buttonHoverColor,
  chatBk1,
  promptBk,
  promptTextColor,
  aiAcknowledgeTextColor
}: SmartHubButtonProps) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [isAvatarHovered, setIsAvatarHovered] = useState(false);
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);
  const avatarMenuRef = useRef<HTMLDivElement>(null);

  console.log('SmartHubButton props:', JSON.stringify({
    currentIconId,
    currentIconName,
    currentIconPrefix,
    avatarDisplayMode,
    smartHubName
  }, null, 2));
  console.log('SmartHubButton solidColor:', solidColor);

  // Get initials from smart hub name
  const getInitials = () => {
    return smartHubName.charAt(0).toUpperCase();
  };

  // Get icon definition from icon name and prefix
  const getIconDefinition = (): any => {
    if (!currentIconName || !currentIconPrefix) return null;
    
    // For now, only support solid icons since we only have that package installed
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

      return solidIcons[iconKey as keyof typeof solidIcons];
    } catch (error) {
      console.warn(`Icon not found: ${currentIconName}`);
    }
    return null;
  };

  // Mutation to switch smart hub
  const switchHubMutation = useMutation({
    mutationFn: async (hubId: string) => {
      console.log('🔄 Switching to hub:', hubId);
      const response = await api.post(`/smart-hubs/${hubId}/switch`);
      return response.data;
    },
    onSuccess: (data, hubId) => {
      console.log('✅ Hub switched successfully:', data);
      // Invalidate cache to refetch current hub data
      queryClient.invalidateQueries({ queryKey: ['current-smart-hub'] });
      setIsOpen(false); // Close the dropdown
    },
    onError: (error: any) => {
      console.error('❌ Failed to switch hub:', error);
      console.error('Error response:', error.response?.data);
    }
  });

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const clickedInsideButton = buttonRef.current?.contains(event.target as Node);
      const clickedInsideMenu = menuRef.current?.contains(event.target as Node);
      const clickedInsideAvatarMenu = avatarMenuRef.current?.contains(event.target as Node);

      // If clicked outside all menus
      if (!clickedInsideButton && !clickedInsideMenu && !clickedInsideAvatarMenu) {
        // If avatar menu is open, close only the avatar menu (keep smart hub menu open)
        if (isAvatarMenuOpen) {
          setIsAvatarMenuOpen(false);
        } 
        // If avatar menu is not open, close the smart hub menu
        else if (isOpen) {
          setIsOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isAvatarMenuOpen, isOpen]);

  return (
    <div style={{ position: 'relative' }}>
      <button
        ref={buttonRef}
        onClick={() => {
          setIsOpen(!isOpen);
          onClick?.();
        }}
        className="flex items-center gap-2 h-[30px] px-1 bg-transparent transition-colors duration-200 rounded-lg"
        style={{
          fontFamily: 'Work Sans, sans-serif',
          ['--hover-bg' as any]: globalHoverColor,
          backgroundColor: isOpen ? globalHoverColor : 'transparent'
        }}
        onMouseEnter={(e) => {
          if (!isOpen) {
            e.currentTarget.style.backgroundColor = globalHoverColor;
          }
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.backgroundColor = 'transparent';
          }
        }}
      >
        {/* Avatar */}
        <div
          className="flex items-center justify-center w-6 h-6 rounded-md text-white text-sm font-semibold"
          style={{ backgroundColor: hubColor }}
        >
          {avatarDisplayMode === 26 && getIconDefinition() ? (
            <FontAwesomeIcon icon={getIconDefinition()} size="xs" />
          ) : (
            getInitials()
          )}
        </div>

        {/* Smart Hub Name */}
        <span className="text-sm font-medium truncate">
          {smartHubName}
        </span>

        {/* Arrow */}
        <ChevronDown 
          className="w-4 h-4 ml-auto flex-shrink-0" 
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease'
          }}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          ref={menuRef}
          onClick={(e) => {
            // Close avatar menu when clicking anywhere in the dropdown (except avatar and avatar menu)
            const clickedOnAvatar = avatarRef.current?.contains(e.target as Node);
            const clickedInAvatarMenu = avatarMenuRef.current?.contains(e.target as Node);
            
            if (!clickedOnAvatar && !clickedInAvatarMenu && isAvatarMenuOpen) {
              setIsAvatarMenuOpen(false);
            }
          }}
          style={{
            position: 'absolute',
            top: 'calc(100% + 15px)',
            left: 0,
            width: '330px',
            minHeight: '300px',
            height: 'fit-content',
            backgroundColor: backgroundColor || menuColor,
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: 9999,
            overflow: 'visible',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Section 1: Smart Hub Details */}
          <div
            className="flex flex-col"
            style={{
              minHeight: '100px',
              height: 'fit-content',
              padding: '10px',
              borderBottom: `1px solid ${borderLineColor}`
            }}
          >
            <div className="flex items-center gap-3 pr-2 pt-2 pb-2">
              {/* Smart Hub Avatar */}
              <div
                ref={avatarRef}
                className="flex items-center justify-center text-white font-semibold"
                style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: hubColor,
                  fontFamily: 'Work Sans, sans-serif',
                  fontSize: '15px',
                  position: 'relative',
                  cursor: 'pointer',
                  borderRadius: '8px',
                }}
                onMouseEnter={() => setIsAvatarHovered(true)}
                onMouseLeave={() => setIsAvatarHovered(false)}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAvatarMenuOpen(!isAvatarMenuOpen);
                }}
              >
                {avatarDisplayMode === 26 && getIconDefinition() ? (
                  <FontAwesomeIcon icon={getIconDefinition()} size="lg" />
                ) : (
                  getInitials()
                )}
                
                {/* Overlay with Edit Icon */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: isAvatarHovered ? 1 : 0,
                    transition: 'opacity 0.2s ease',
                    pointerEvents: 'none'
                  }}
                >
                  <Edit size={18} color="#ffffff" />
                </div>
              </div>
              
              
              {/* SmartHub Avatar Menu */}
              {isAvatarMenuOpen && (
                <div ref={avatarMenuRef} style={{ position: 'absolute', top: '10px', left: '50px', zIndex: 10001 }}>
                  <SmartHubAvatarMenu
                    menuColor={menuColor}
                    titleColor={titleMenuColorLight}
                    currentColorId={currentColorId}
                    onColorChange={(colorId) => {
                      console.log('=== SmartHubButton: Color clicked ===', colorId);
                      console.log('onColorChange function:', onColorChange);
                      onColorChange(colorId);
                      setIsAvatarMenuOpen(false);
                    }}
                    globalButtonHover={globalHoverColor}
                    textColor={textColor}
                    currentIconId={currentIconId}
                    onIconChange={(iconId) => {
                      onIconChange(iconId);
                      setIsAvatarMenuOpen(false);
                    }}
                    onClearIcon={() => {
                      onClearIcon();
                      setIsAvatarMenuOpen(false);
                    }}
                    borderLineColor={borderLineColor}
                    smartHubId={currentSmartHubId ? Number(currentSmartHubId) : null}
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
              )}


              {/* Smart Hub Name */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div
                  style={{
                    fontFamily: 'Work Sans, sans-serif',
                    fontSize: '17px',
                    fontWeight: 400,
                    color: textColor,
                    lineHeight: 1,
                      userSelect: 'none'
                  }}
                >
                  {smartHubName}
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'Work Sans, sans-serif',
                      fontSize: '13px',
                      fontWeight: 300,
                      color: textColor,
                      opacity: 0.7,
                      lineHeight: 1,
                      userSelect: 'none'
                    }}
                  >
                    {journey}
                  </div>
                  <div
                    style={{
                      width: '4px',
                      height: '4px',
                      borderRadius: '50%',
                      backgroundColor: textColor,
                      opacity: 0.5
                    }}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsOpen(false);
                      navigate('/smart-hub/settings/upgrade/journey');
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                  userSelect: 'none',
                     
                      fontFamily: 'Work Sans, sans-serif',
                      fontSize: '14px',
                      fontWeight: 400,
                      borderRadius: '4px',
                      transition: 'background 0.2s ease',
                      height: 'fit-content'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(59, 130, 246, 0.08)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'none';
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'Work Sans, sans-serif',
                        fontSize: '13px',
                        paddingLeft: '4px',
                        paddingRight: '4px',
                        fontWeight: 400,
                        background: 'linear-gradient(45deg, #3b82f6 0%, #8b5cf6 25%, #ec4899 50%, #f59e0b 75%, #3b82f6 100%)',
                        backgroundSize: '400% 400%',
                        height: 'fit-content',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        animation: 'upgradeColorFlow 3s ease-in-out infinite',
                        filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.3))'
                      }}
                    >
                      Upgrade
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Buttons Row */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                gap: '8px',
                paddingTop: '10px'
              }}
            >
              {/* Settings Button */}
              <button
                className="flex items-center justify-center gap-2 transition-colors"
                style={{
                  backgroundColor: 'transparent',
                  border: `1px solid ${borderLineColor}`,
                  color: textColor,
                  fontFamily: 'Work Sans, sans-serif',
                  height: '30px',
                  borderRadius: '8px',
                  padding: '0 8px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  userSelect: 'none',
                  flex: 1
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = globalHoverColor;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                onClick={() => {
                  navigate('/smart-hub/settings/general');
                  setIsOpen(false);
                }}
              >
                <FontAwesomeIcon icon={solidIcons.faGear} style={{ fontSize: '14px' }} />
                <span>Settings</span>
              </button>

              {/* People Button */}
              <button
                className="flex items-center justify-center gap-2 transition-colors"
                style={{
                  backgroundColor: 'transparent',
                  border: `1px solid ${borderLineColor}`,
                  color: textColor,
                  fontFamily: 'Work Sans, sans-serif',
                  height: '30px',
                  borderRadius: '8px',
                  padding: '0 8px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  userSelect: 'none',
                  flex: 1
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = globalHoverColor;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                onClick={() => {
                  console.log('People clicked');
                }}
              >
                <FontAwesomeIcon icon={solidIcons.faUsers} style={{ fontSize: '14px' }} />
                <span>People</span>
              </button>
            </div>
          </div>

          {/* Section 2: Manage */}
          <div
            style={{
              padding: '5px',
              borderBottom: `1px solid ${borderLineColor}`
            }}
          >
            <div
              style={{
                fontFamily: 'Work Sans, sans-serif',
                fontSize: '13px',
                fontWeight: 400,
                color: titleMenuColorLight,
                marginBottom: '8px',
                marginLeft: '8px'
              }}
            >
              Manage
            </div>

            {/* Templates Button */}
            <button
              className="flex items-center gap-2 w-full transition-colors"
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: textColor,
                fontFamily: 'Work Sans, sans-serif',
                height: '30px',
                borderRadius: '8px',
                padding: '0 6px',
                fontSize: '14px',
                cursor: 'pointer',
                  userSelect: 'none',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = globalHoverColor;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              onClick={() => {
                console.log('Templates clicked');
              }}
            >
              <FontAwesomeIcon icon={solidIcons.faFileAlt} style={{ fontSize: '14px' }} />
              <span>Templates</span>
            </button>

            {/* Place holder 1 Button */}
            <button
              className="flex items-center gap-2 w-full transition-colors"
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: textColor,
                fontFamily: 'Work Sans, sans-serif',
                height: '30px',
                borderRadius: '8px',
                padding: '0 6px',
                marginTop: '4px',
                fontSize: '14px',
                cursor: 'pointer',
                  userSelect: 'none',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = globalHoverColor;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              onClick={() => {
                console.log('Place holder 1 clicked');
              }}
            >
              <FontAwesomeIcon icon={solidIcons.faCircle} style={{ fontSize: '14px' }} />
              <span>Place holder 1</span>
            </button>

            {/* Place holder 2 Button */}
            <button
              className="flex items-center gap-2 w-full transition-colors"
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: textColor,
                fontFamily: 'Work Sans, sans-serif',
                height: '30px',
                borderRadius: '8px',
                padding: '0 6px',
                marginTop: '4px',
                fontSize: '14px',
                cursor: 'pointer',
                  userSelect: 'none',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = globalHoverColor;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              onClick={() => {
                console.log('Place holder 2 clicked');
              }}
            >
              <FontAwesomeIcon icon={solidIcons.faCircle} style={{ fontSize: '14px' }} />
              <span>Place holder 2</span>
            </button>

            {/* Place holder 3 Button */}
            <button
              className="flex items-center gap-2 w-full transition-colors"
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: textColor,
                fontFamily: 'Work Sans, sans-serif',
                height: '30px',
                borderRadius: '8px',
                padding: '0 6px',
                marginTop: '4px',
                fontSize: '14px',
                cursor: 'pointer',
                  userSelect: 'none',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = globalHoverColor;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              onClick={() => {
                console.log('Place holder 3 clicked');
              }}
            >
              <FontAwesomeIcon icon={solidIcons.faCircle} style={{ fontSize: '14px' }} />
              <span>Place holder 3</span>
            </button>
          </div>

          {/* Section 3: Switch Smart Hub - Only show if there are other hubs */}
          {smartHubs.filter(hub => hub.id !== currentSmartHubId).length > 0 && (
            <div style={{ padding: '10px', flex: 1 }}>
              <div
                style={{
                  fontFamily: 'Work Sans, sans-serif',
                  fontSize: '13px',
                  fontWeight: 400,
                  color: titleMenuColorLight,
                  marginBottom: '8px',
                  marginLeft: '6px'
                }}
              >
                Switch Smart Hub
              </div>
              
              {/* Smart Hubs List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {smartHubs
                  .filter(hub => hub.id !== currentSmartHubId)
                  .sort((a, b) => {
                    // Sort by order_number (ascending), with fallback to 0 if undefined
                    const orderA = a.order_number ?? 999999;
                    const orderB = b.order_number ?? 999999;
                    return orderA - orderB;
                  })
                  .map((hub) => {
                const avatarText = hub.name.charAt(0).toUpperCase();
                const hubColor = hub.color || '#4169E1';
                
                return (
                  <button
                    key={hub.id}
                    className="flex items-center gap-2 w-full transition-colors tooltip-trigger tooltip-top"
                    data-tooltip={hub.journey || 'Validate Journey'}
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: textColor,
                      fontFamily: 'Work Sans, sans-serif',
                      height: 'fit-content',
                      borderRadius: '8px',
                      padding: '5px 6px',
                      fontSize: '14px',
                      cursor: 'pointer',
                  userSelect: 'none',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = globalHoverColor;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                    onClick={() => {
                      console.log('Switch to hub:', hub.id, hub.name);
                      switchHubMutation.mutate(hub.id);
                    }}
                    disabled={switchHubMutation.isPending}
                  >
                    {/* Hub Avatar */}
                    <div
                      style={{
                        width: '25px',
                        height: '25px',
                        borderRadius: '6px',
                        backgroundColor: hubColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        fontFamily: 'Work Sans, sans-serif',
                        fontSize: '13px',
                        fontWeight: 600,
                        flexShrink: 0
                      }}
                    >
                      {avatarText}
                    </div>
                    
                    {/* Hub Name */}
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {hub.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          )}

          {/* Section 4: Create Smart Hub Footer */}
          <div style={{ padding: '10px'}}>
            <button
              className="flex items-center justify-center gap-2 w-full transition-colors"
              style={{
                backgroundColor: 'transparent',
                border: `1px solid ${borderLineColor}`,
                color: textColor,
                fontFamily: 'Work Sans, sans-serif',
                height: '30px',
                borderRadius: '8px',
                padding: '0 8px',
                fontSize: '14px',
                cursor: 'pointer',
                  userSelect: 'none',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = globalHoverColor;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              onClick={() => {
                setIsOpen(false);  // Hide dropdown
                setIsCreatorOpen(true);  // Show popup
              }}
            >
              <FontAwesomeIcon icon={solidIcons.faPlus} style={{ fontSize: '14px' }} />
              <span>Create Smart Hub</span>
            </button>
          </div>
        </div>
      )}
      
      {/* Smart Hub Creator Popup */}
      <SmartHubCreator
        isOpen={isCreatorOpen}
        onClose={() => setIsCreatorOpen(false)}
        menuColor={menuColor}
        textColor={textColor}
        borderLineColor={borderLineColor}
        globalHoverColor={globalHoverColor}
        chatBk1={chatBk1}
        solidColor={solidColor}
        buttonHoverColor={buttonHoverColor}
        promptBk={promptBk}
        promptTextColor={promptTextColor}
        aiAcknowledgeTextColor={aiAcknowledgeTextColor}
      />
      
      <style>{`
        @keyframes upgradeColorFlow {
          0% {
            background-position: 0% 0%;
            transform: scale(1);
          }
          33% {
            background-position: 100% 100%;
            transform: scale(1.05);
          }
          66% {
            background-position: 0% 100%;
            transform: scale(1);
          }
          100% {
            background-position: 0% 0%;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
