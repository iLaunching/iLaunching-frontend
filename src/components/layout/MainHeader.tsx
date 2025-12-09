import UserMenuButton from '@/components/UserMenuButton';

interface MainHeaderProps {
  borderColor?: string;
  backgroundColor?: string;
  headerBackgroundColor?: string;
  headerOverlayColor?: string;
  userButtonColor?: string;
  userButtonHover?: string;
  iconColor?: string;
  firstName?: string;
  surname?: string;
  menuColor?: string;
  titleColor?: string;
  borderLineColor?: string;
  globalButtonHover?: string;
  avatarColor?: string;
  textColor?: string;
  avatarColorId?: number;
  onAvatarColorChange?: (colorId: number) => void;
}

export default function MainHeader({ 
  borderColor = '#e5e7eb', 
  backgroundColor = '#ffffff',
  headerBackgroundColor = '#7F77F1',
  headerOverlayColor = '#00000080',
  userButtonColor = '#ffffff59',
  userButtonHover = '#ffffff66',
  iconColor = '#7F77F1',
  firstName = '',
  surname = '',
  menuColor = '#f3f4f6',
  titleColor = '#d6d6d6',
  borderLineColor = '#d6d6d680',
  globalButtonHover = '#d6d6d64d',
  avatarColor = '#4169E1',
  textColor = '#000000',
  avatarColorId = 1,
  onAvatarColorChange = () => {}
}: MainHeaderProps) {
  return (
    <header 
      className="sticky top-0 z-50 flex flex-col w-full"
      style={{ 
        boxShadow: '0 0 4px 0 #00000033',
        borderBottom: `1px solid ${borderColor}`,
        backgroundColor: headerBackgroundColor
      }}
    >
      <div 
        className="min-h-[50px] w-full flex items-center justify-between"
        style={{ backgroundColor: headerOverlayColor, paddingLeft: '8px', paddingRight: '8px' }}
      >
        <span style={{ 
          fontFamily: 'Baloo 2, sans-serif',
          fontSize: '18px',
          fontWeight: 600,
          color: '#ffffff'
        }}>
          iLaunching
        </span>
        
        <UserMenuButton
          firstName={firstName}
          surname={surname}
          buttonColor={userButtonColor}
          buttonHoverColor={userButtonHover}
          iconColor={iconColor}
          menuColor={menuColor}
          titleColor={titleColor}
          borderLineColor={borderLineColor}
          globalButtonHover={globalButtonHover}
          avatarColor={avatarColor}
          textColor={textColor}
          avatarColorId={avatarColorId}
          onAvatarColorChange={onAvatarColorChange}
        />
      </div>
      <div 
        className="min-h-[50px] w-full flex items-center"
        style={{ backgroundColor }}
      >
        {/* Second div - height fits content, minimum 50px */}
      </div>
    </header>
  );
}
