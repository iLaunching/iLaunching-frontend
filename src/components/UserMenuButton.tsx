import { ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import UserProfileButton from './UserProfileButton';
import UserAvatarMenu from './UserAvatarMenu';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import * as solidIcons from '@fortawesome/free-solid-svg-icons';

interface UserMenuButtonProps {
  firstName: string;
  surname: string;
  buttonColor: string;
  buttonHoverColor: string;
  iconColor: string;
  menuColor: string;
  titleColor: string;
  borderLineColor: string;
  globalButtonHover: string;
  avatarColor: string;
  textColor: string;
  avatarColorId: number;
  onAvatarColorChange: (colorId: number) => void;
  profileIconId?: number;
  profileIconName?: string;
  profileIconPrefix?: 'fas' | 'far' | 'fab';
  onProfileIconChange: (iconId: number) => void;
}

export default function UserMenuButton({
  firstName,
  surname,
  buttonColor,
  buttonHoverColor,
  iconColor,
  menuColor,
  titleColor,
  borderLineColor,
  globalButtonHover,
  avatarColor,
  textColor,
  avatarColorId,
  onAvatarColorChange,
  profileIconId,
  profileIconName,
  profileIconPrefix,
  onProfileIconChange
}: UserMenuButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const avatarMenuRef = useRef<HTMLDivElement>(null);

  const getInitials = () => {
    const firstInitial = firstName?.charAt(0)?.toUpperCase() || '';
    const lastInitial = surname?.charAt(0)?.toUpperCase() || '';
    return `${firstInitial}${lastInitial}`;
  };

  const getIconDefinition = (): IconDefinition | null => {
    if (!profileIconName || !profileIconPrefix) return null;
    
    // For now, only support solid icons since we only have that package installed
    if (profileIconPrefix !== 'fas') {
      console.warn(`Only solid icons are currently supported. Prefix: ${profileIconPrefix}`);
      return null;
    }
    
    try {
      // Convert kebab-case to camelCase and add 'fa' prefix
      const camelCase = profileIconName
        .split('-')
        .map((word, index) => index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1))
        .join('');
      const iconKey = `fa${camelCase.charAt(0).toUpperCase()}${camelCase.slice(1)}`;

      return solidIcons[iconKey as keyof typeof solidIcons] as IconDefinition;
    } catch (error) {
      console.warn(`Icon not found: ${profileIconName}`);
    }
    return null;
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        buttonRef.current &&
        avatarMenuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node) &&
        !avatarMenuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setIsAvatarMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
    <div style={{ position: 'relative' }}>
      <button
        ref={buttonRef}
        className="flex items-center gap-0 px-1 transition-colors duration-200"
        style={{
          width: 'fit-content',
          height: '35px',
          borderRadius: '50px',
          backgroundColor: buttonColor
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = buttonHoverColor;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = buttonColor;
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {/* User Avatar */}
        <div
          className="flex items-center justify-center tooltip-trigger"
          data-tooltip={`${firstName} ${surname}`}
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '360px',
            backgroundColor: avatarColor,
            fontFamily: 'Work Sans, sans-serif',
            fontSize: '12px',
            fontWeight: 600,
            color: '#ffffff'
          }}
        >
          {getIconDefinition() ? (
            <FontAwesomeIcon icon={getIconDefinition()!} size="sm" />
          ) : (
            getInitials()
          )}
        </div>

        {/* Arrow Icon */}
        <ChevronDown
          size={14}
          style={{ color: iconColor }}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          ref={menuRef}
          style={{
            position: 'absolute',
            top: 'calc(100% + 10px)',
            right: 0,
            width: '300px',
            minHeight: '400px',
            height: 'fit-content',
            backgroundColor: menuColor,
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: 9999,
            overflow: 'visible'
          }}
        >
          {/* Section 1: User Details */}
          <div
            className="flex flex-col"
            style={{
              minHeight: '100px',
              height: 'fit-content',
              padding: '10px',
              borderBottom: `1px solid ${borderLineColor}`
            }}
          >
            <UserProfileButton
              globalButtonHover={globalButtonHover}
              section1Content={
                <div
                  className="flex items-center justify-center tooltip-trigger tooltip-top"
                  data-tooltip={`${firstName} ${surname}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsAvatarMenuOpen(!isAvatarMenuOpen);
                  }}
                  style={{
                    width: '35px',
                    height: '35px',
                    borderRadius: '360px',
                    backgroundColor: avatarColor,
                    fontFamily: 'Work Sans, sans-serif',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#ffffff',
                    cursor: 'pointer'
                  }}
                >
                  {getIconDefinition() ? (
                    <FontAwesomeIcon icon={getIconDefinition()!} />
                  ) : (
                    getInitials()
                  )}
                </div>
              }
              section2Content={
                <div style={{ paddingLeft: '12px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
                  <div
                    style={{
                      fontFamily: 'Work Sans, sans-serif',
                      fontSize: '14px',
                      fontWeight: 400,
                      lineHeight: 1,
                      margin: 0,
                      padding: 0
                    }}
                  >
                    {firstName} {surname}
                  </div>
                  <div
                    style={{
                      fontFamily: 'Work Sans, sans-serif',
                      fontSize: '12px',
                      fontWeight: 300,
                      color: textColor,
                      opacity: 0.7,
                      margin: 0,
                      padding: 0,
                      lineHeight: 1
                    }}
                  >
                    placeholder
                  </div>
                </div>
              }
              section3Content={
                <div
                  className="transition-colors duration-200"
                  style={{
                    fontFamily: 'Work Sans, sans-serif',
                    fontSize: '13px',
                    fontWeight: 400,
                    color: textColor,
                    backgroundColor: globalButtonHover,
                    paddingLeft:'8px',
                    paddingRight:'8px',
                    paddingTop: '2px',
                    paddingBottom: '2px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    marginRight:'5px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = globalButtonHover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = globalButtonHover;
                  }}
                >
                  Profile
                </div>
              }
            />
          </div>

          {/* Section 2: Config */}
          <div
            className="flex flex-col"
            style={{
              minHeight: '100px',
              height: 'fit-content',
              padding: '16px',
              borderBottom: `1px solid ${borderLineColor}`
            }}
          >
            {/* Config content will go here */}
          </div>

          {/* Section 3: Personal Tools */}
          <div
            className="flex flex-col"
            style={{
              minHeight: '100px',
              height: 'fit-content',
              padding: '16px',
              borderBottom: `1px solid ${borderLineColor}`
            }}
          >
            <h3
              style={{
                fontFamily: 'Work Sans, sans-serif',
                fontSize: '12px',
                fontWeight: 600,
                marginBottom: '12px',
                color: titleColor
              }}
            >
              Personal tools
            </h3>
            {/* Personal tools content will go here */}
          </div>

          {/* Section 4: Account */}
          <div
            className="flex flex-col"
            style={{
              minHeight: '100px',
              height: 'fit-content',
              padding: '16px'
            }}
          >
            {/* Account content will go here */}
          </div>
        </div>
      )}
    </div>

    {/* User Avatar Menu - positioned globally outside all containers */}
    {isOpen && isAvatarMenuOpen && (
      <div
        ref={avatarMenuRef}
        style={{
          position: 'fixed',
          top: '130px',
          right: '450px',
          zIndex: 10001
        }}
      >
        <UserAvatarMenu 
          menuColor={menuColor} 
          titleColor={titleColor}
          currentColorId={avatarColorId}
          onColorChange={onAvatarColorChange}
          globalButtonHover={globalButtonHover}
          textColor={textColor}
          currentIconId={profileIconId}
          onIconChange={onProfileIconChange}
          borderLineColor={borderLineColor}
        />
      </div>
    )}
    </>
  );
}
