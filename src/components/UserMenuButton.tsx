import { ChevronDown } from 'lucide-react';

interface UserMenuButtonProps {
  firstName: string;
  surname: string;
  buttonColor: string;
  buttonHoverColor: string;
  iconColor: string;
}

export default function UserMenuButton({
  firstName,
  surname,
  buttonColor,
  buttonHoverColor,
  iconColor
}: UserMenuButtonProps) {
  const getInitials = () => {
    const firstInitial = firstName?.charAt(0)?.toUpperCase() || '';
    const lastInitial = surname?.charAt(0)?.toUpperCase() || '';
    return `${firstInitial}${lastInitial}`;
  };

  return (
    <button
      className="flex items-center gap-2 px-3 transition-colors duration-200"
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
    >
      {/* User Avatar */}
      <div
        className="flex items-center justify-center"
        style={{
          width: '30px',
          height: '30px',
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
        size={16}
        style={{ color: iconColor }}
      />
    </button>
  );
}
