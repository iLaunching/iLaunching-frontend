import { type ReactNode, useState } from 'react';

interface UserProfileButtonProps {
  section1Content?: ReactNode;
  section2Content?: ReactNode;
  section3Content?: ReactNode;
  globalButtonHover: string;
  onClick?: () => void;
}

export default function UserProfileButton({
  section1Content,
  section2Content,
  section3Content,
  globalButtonHover,
  onClick
}: UserProfileButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      className="flex flex-row items-center transition-colors duration-200"
      style={{
        minHeight: '20px',
        height: 'fit-content',
        width: '100%',
        padding:'5px',
        borderRadius:'15px'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = globalButtonHover;
        setIsHovered(true);
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
        setIsHovered(false);
      }}
      onClick={onClick}
    >
      {/* Section 1: width fit-content */}
      <div
        style={{
          width: 'fit-content',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        {section1Content}
      </div>

      {/* Section 2: width 100% */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        {section2Content}
      </div>

      {/* Section 3: width fit-content */}
      <div
        style={{
          width: 'fit-content',
          display: 'flex',
          alignItems: 'center',
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 200ms'
        }}
      >
        {section3Content}
      </div>
    </button>
  );
}
