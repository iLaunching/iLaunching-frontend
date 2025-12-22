import { Outlet, useOutletContext, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as regularIcons from '@fortawesome/free-regular-svg-icons';
import * as solidIcons from '@fortawesome/free-solid-svg-icons';

interface SmartHubContextType {
  theme: {
    menu: string;
    menu_bg_opacity?: string;
    background: string;
    text: string;
    title_menu_color_light: string;
    danger_button_solid_color?: string;
    danger_button_hover?: string;
    danger_tone_bk?: string;
    danger_tone_border?: string;
    danger_tone_text?: string;
    danger_bk_light_color?: string;
    danger_bk_solid_color?: string;
    danger_bk_solid_text_color?: string;
    [key: string]: any;
  };
  profile: {
    first_name: string;
    surname: string;
    [key: string]: any;
  };
  smart_hub: {
    id: string;
    name: string;
    description?: string;
    avatar?: string;
    hub_color?: string;
    [key: string]: any;
  };
}

export default function Settings() {
  const context = useOutletContext<SmartHubContextType>();
  const theme = context?.theme;
  const profile = context?.profile;
  const smart_hub = context?.smart_hub;
  const navigate = useNavigate();
  const location = useLocation();

  if (!theme || !profile) {
    return null;
  }

  const menuItems = [
    { label: 'Settings', icon: solidIcons.faGear, path: '/smart-hub/settings/general' },
    { label: 'Upgrade', icon: solidIcons.faArrowUp, path: '/smart-hub/settings/upgrade/journey' },
    { label: 'Members', icon: regularIcons.faUser, path: '/smart-hub/settings/members' },
    { label: 'Teams', icon: solidIcons.faUsers, path: '/smart-hub/settings/teams' },
    { label: 'Matrix', icon: solidIcons.faTableCells, path: '/smart-hub/settings/matrix/active' },
    { label: 'Security & Permissions', icon: solidIcons.faShield, path: '/smart-hub/settings/security' },
    { label: 'Trash', icon: regularIcons.faTrashCan, path: '/smart-hub/settings/trash' }
  ];

  const userMenuItems = [
    { label: 'My settings', icon: solidIcons.faGear, path: '/smart-hub/settings/my-settings' },
    { label: 'Membership', icon: solidIcons.faCreditCard, path: '/smart-hub/settings/membership' },
    { label: 'Notifications', icon: solidIcons.faBell, path: '/smart-hub/settings/notifications' }
  ];

  return (
    <div 
      style={{
        position: 'fixed',
        top: '60px', // Below header
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        height: 'calc(100vh - 60px)',
        overflow: 'hidden',
      
      }}
    >
      {/* Settings Side Menu */}
      <div
        style={{
          width: '15%',
          height: '100%',
          backgroundColor: theme.menu_bg_opacity || theme.menu,
          overflowY: 'auto',
          padding: '60px 8px 16px 8px',
          flexShrink: 0
        }}
      >
        {/* Smart Hub Title */}
        <h2 style={{
          color: theme.title_menu_color_light,
          fontSize: '15px',
          fontWeight: 400,
          fontFamily: 'Work Sans, sans-serif',
          marginBottom: '10px',
          paddingLeft: '3px',
          userSelect: 'none',
          marginTop: 0
        }}>
          Smart Hub
        </h2>

        {menuItems.map((item, index) => {
          const isActive = location.pathname === item.path || 
            (item.label === 'Upgrade' && location.pathname.startsWith('/smart-hub/settings/upgrade')) ||
            (item.label === 'Matrix' && location.pathname.startsWith('/smart-hub/settings/matrix'));
          return (
            <button
              key={index}
              className="flex items-center gap-3 w-full transition-colors"
              style={{
                backgroundColor: isActive ? (theme.tone_button_bk_color || 'transparent') : 'transparent',
                border: 'none',
                color: isActive ? (theme.tone_button_text_color || theme.text) : theme.text,
                fontFamily: 'Work Sans, sans-serif',
                height: '33px',
                borderRadius: '8px',
                padding: '0 5px',
                fontSize: '14px',
                cursor: 'pointer',
                userSelect: 'none',
                marginBottom: '4px',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = theme.global_button_hover || 'rgba(0,0,0,0.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
              onClick={() => navigate(item.path)}
            >
              <FontAwesomeIcon icon={item.icon} style={{ fontSize: '14px' }} />
              <span>{item.label}</span>
            </button>
          );
        })}

        {/* User Name Title */}
        <h3 style={{
          color: theme.title_menu_color_light,
          fontSize: '15px',
          fontWeight: 400,
          fontFamily: 'Work Sans, sans-serif',
          marginTop: '32px',
          paddingLeft: '3px',
          marginBottom: '10px',
          userSelect: 'none'
        }}>
          {profile.first_name} {profile.surname}
        </h3>

        {/* User Menu Items */}
        {userMenuItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={index}
              className="flex items-center gap-3 w-full transition-colors"
              style={{
                backgroundColor: isActive ? (theme.tone_button_bk_color || 'transparent') : 'transparent',
                border: 'none',
                color: isActive ? (theme.tone_button_text_color || theme.text) : theme.text,
                fontFamily: 'Work Sans, sans-serif',
                height: '33px',
                borderRadius: '8px',
                padding: '0 5px',
                fontSize: '14px',
                cursor: 'pointer',
                userSelect: 'none',
                marginBottom: '4px',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = theme.global_button_hover || 'rgba(0,0,0,0.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
              onClick={() => navigate(item.path)}
            >
              <FontAwesomeIcon icon={item.icon} style={{ fontSize: '14px' }} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Settings Content Area */}
      <div
        style={{
          flex: 1,
          width: '70%',
          overflowY: 'auto'
        }}
      >
        <Outlet context={{ theme, profile, smart_hub }} />
      </div>
    </div>
  );
}
