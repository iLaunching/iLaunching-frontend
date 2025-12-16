import { ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as solidIcons from '@fortawesome/free-solid-svg-icons';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import SmartHubCreator from './SmartHubCreator';
import api from '@/lib/api';

interface SmartHub {
  id: string;
  name: string;
  hub_color_id: number;
  color?: string;
  journey?: string;
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
  onClick
}: SmartHubButtonProps) {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

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

  // Truncate smart hub name to first character
  const avatarText = smartHubName.charAt(0).toUpperCase();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
          ['--hover-bg' as any]: globalHoverColor
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = globalHoverColor;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        {/* Avatar */}
        <div
          className="flex items-center justify-center w-6 h-6 rounded-md text-white text-sm font-semibold"
          style={{ backgroundColor: hubColor }}
        >
          {avatarText}
        </div>

        {/* Smart Hub Name */}
        <span className="text-sm font-medium truncate">
          {smartHubName}
        </span>

        {/* Arrow */}
        <ChevronDown className="w-4 h-4 ml-auto flex-shrink-0" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          ref={menuRef}
          style={{
            position: 'absolute',
            top: 'calc(100% + 15px)',
            left: 0,
            width: '330px',
            minHeight: '300px',
            height: 'fit-content',
            backgroundColor: menuColor,
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
                className="flex items-center justify-center rounded-md text-white font-semibold"
                style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: hubColor,
                  fontFamily: 'Work Sans, sans-serif',
                  fontSize: '15px'
                }}
              >
                {avatarText}
              </div>

              {/* Smart Hub Name */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div
                  style={{
                    fontFamily: 'Work Sans, sans-serif',
                    fontSize: '17px',
                    fontWeight: 400,
                    color: textColor,
                    lineHeight: 1
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
                      lineHeight: 1
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
                      // TODO: Handle upgrade action
                      console.log('Upgrade clicked');
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                     
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
                  flex: 1
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = globalHoverColor;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                onClick={() => {
                  console.log('Settings clicked');
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
                cursor: 'pointer'
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
