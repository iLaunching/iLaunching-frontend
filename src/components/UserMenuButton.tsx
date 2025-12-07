import { ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface UserMenuButtonProps {
  firstName: string;
  surname: string;
  buttonColor: string;
  buttonHoverColor: string;
  iconColor: string;
  menuColor: string;
  titleColor: string;
  borderLineColor: string;
}

export default function UserMenuButton({
  firstName,
  surname,
  buttonColor,
  buttonHoverColor,
  iconColor,
  menuColor,
  titleColor,
  borderLineColor
}: UserMenuButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const getInitials = () => {
    const firstInitial = firstName?.charAt(0)?.toUpperCase() || '';
    const lastInitial = surname?.charAt(0)?.toUpperCase() || '';
    return `${firstInitial}${lastInitial}`;
  };

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
          className="flex items-center justify-center"
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '360px',
            backgroundColor: '#ffffff',
            fontFamily: 'Work Sans, sans-serif',
            fontSize: '12px',
            fontWeight: 600,
            color: '#000000'
          }}
        >
          {getInitials()}
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
            zIndex: 1000,
            overflow: 'hidden'
          }}
        >
          {/* Section 1: User Details */}
          <div
            style={{
              minHeight: '100px',
              height: 'fit-content',
              padding: '16px',
              borderBottom: `1px solid ${borderLineColor}`
            }}
          >
            {/* User details content will go here */}
          </div>

          {/* Section 2: Config */}
          <div
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
  );
}
