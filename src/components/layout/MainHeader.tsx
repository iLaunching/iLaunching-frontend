import UserMenuButton from '@/components/UserMenuButton';
import SmartHubButton from '@/components/SmartHubButton';

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
  profileIconId?: number;
  profileIconName?: string;
  profileIconPrefix?: 'fas' | 'far' | 'fab';
  avatarDisplayMode?: number;
  onProfileIconChange?: (iconId: number) => void;
  onClearIcon?: () => void;
  toneButtonBkColor?: string;
  toneButtonTextColor?: string;
  toneButtonBorderColor?: string;
  feedbackIndicatorBk?: string;
  appearanceTextColor?: string;
  ithemeButtonBkColor?: string;
  ithemeButtonTextColor?: string;
  ithemeButtonHoverColor?: string;
  smartHubName?: string;
  smartHubColor?: string;
  journey?: string;
  currentSmartHubId?: string;
  smartHubs?: Array<{
    id: string;
    name: string;
    hub_color_id: number;
    color?: string;
  }>;
  currentAppearanceId?: number;
  currentIthemeId?: number;
  onAppearanceChange?: (appearanceId: number) => void;
  onIthemeChange?: (ithemeId: number) => void;
  ithemeBgOpacity?: string;
  smartHubColorId?: number;
  onSmartHubColorChange?: (colorId: number) => void;
  smartHubIconId?: number;
  smartHubIconName?: string;
  smartHubIconPrefix?: 'fas' | 'far' | 'fab';
  smartHubAvatarDisplayMode?: number;
  onSmartHubIconChange?: (iconId: number) => void;
  onClearSmartHubIcon?: () => void;
  solidColor?: string;
  buttonBkColor?: string;
  buttonTextColor?: string;
  buttonHoverColor?: string;
  chatBk1?: string;
  promptBk?: string;
  promptTextColor?: string;
  aiAcknowledgeTextColor?: string;
  showGrid?: boolean;
  gridStyle?: string;
  snapToGrid?: boolean;
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
  onAvatarColorChange = () => {},
  profileIconId,
  profileIconName,
  profileIconPrefix,
  avatarDisplayMode = 24,
  onProfileIconChange = () => {},
  onClearIcon = () => {},
  toneButtonBkColor,
  toneButtonTextColor,
  toneButtonBorderColor,
  feedbackIndicatorBk,
  appearanceTextColor,
  ithemeButtonBkColor,
  ithemeButtonTextColor,
  ithemeButtonHoverColor,
  smartHubName = 'Smart Hub',
  smartHubColor = '#7F77F1',
  journey = 'Validate Journey',
  currentSmartHubId,
  smartHubs = [],
  currentAppearanceId,
  currentIthemeId,
  onAppearanceChange,
  onIthemeChange,
  ithemeBgOpacity,
  smartHubColorId = 1,
  onSmartHubColorChange = () => {},
  smartHubIconId,
  smartHubIconName,
  smartHubIconPrefix,
  smartHubAvatarDisplayMode = 24,
  onSmartHubIconChange = () => {},
  onClearSmartHubIcon = () => {},
  solidColor,
  buttonBkColor,
  buttonTextColor,
  buttonHoverColor,
  chatBk1,
  promptBk,
  promptTextColor,
  aiAcknowledgeTextColor,
  showGrid,
  gridStyle,
  snapToGrid
}: MainHeaderProps) {
  console.log('🔍 MainHeader solidColor:', solidColor);
  
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
          profileIconId={profileIconId}
          profileIconName={profileIconName}
          profileIconPrefix={profileIconPrefix}
          avatarDisplayMode={avatarDisplayMode}
          onProfileIconChange={onProfileIconChange}
          onClearIcon={onClearIcon}
          toneButtonBkColor={toneButtonBkColor}
          toneButtonTextColor={toneButtonTextColor}
          toneButtonBorderColor={toneButtonBorderColor}
          headerBackgroundColor={headerBackgroundColor}
          feedbackIndicatorBk={feedbackIndicatorBk}
          appearanceTextColor={appearanceTextColor}
          ithemeButtonBkColor={ithemeButtonBkColor}
          ithemeButtonTextColor={ithemeButtonTextColor}
          ithemeButtonHoverColor={ithemeButtonHoverColor}
          currentAppearanceId={currentAppearanceId}
          currentIthemeId={currentIthemeId}
          onAppearanceChange={onAppearanceChange}
          onIthemeChange={onIthemeChange}
          ithemeBgOpacity={ithemeBgOpacity}
        />
      </div>
      <div 
        className="min-h-[50px] w-full flex items-center "
        style={{ backgroundColor, paddingRight:'8px', paddingLeft:'5px'}}
      >
        <SmartHubButton
          smartHubName={smartHubName}
          hubColor={smartHubColor}
          globalHoverColor={globalButtonHover}
          menuColor={menuColor}
          borderLineColor={borderLineColor}
          textColor={textColor}
          titleMenuColorLight={titleColor}
          journey={journey}
          currentSmartHubId={currentSmartHubId}
          smartHubs={smartHubs}
          currentColorId={smartHubColorId}
          onColorChange={onSmartHubColorChange}
          currentIconId={smartHubIconId}
          currentIconName={smartHubIconName}
          currentIconPrefix={smartHubIconPrefix}
          avatarDisplayMode={smartHubAvatarDisplayMode}
          onIconChange={onSmartHubIconChange}
          onClearIcon={onClearSmartHubIcon}
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
          chatBk1={chatBk1}
          promptBk={promptBk}
          promptTextColor={promptTextColor}
          aiAcknowledgeTextColor={aiAcknowledgeTextColor}
          showGrid={showGrid}
          gridStyle={gridStyle}
          snapToGrid={snapToGrid}
        />
      </div>
    </header>
  );
}
