import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { User, Mail, Lock } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

interface SmartHubContextType {
  theme: {
    text: string;
    background: string;
    background_opacity: string;
    menu_bg_opacity?: string;
    border?: string;
    [key: string]: any;
  };
  profile: {
    first_name: string;
    surname: string;
    avatar_color?: {
      color: string;
    };
    [key: string]: any;
  };
}

const MySettings: React.FC = () => {
  const { theme, profile } = useOutletContext<SmartHubContextType>();
  const user = useAuthStore((state) => state.user);

  const avatarColor = profile?.avatar_color?.color || '#7F77F1';
  const avatarText = `${profile?.first_name?.charAt(0) || ''}${profile?.surname?.charAt(0) || ''}`.toUpperCase();

  return (
    <div className="flex flex-col" style={{ 
        width: '80%',
        padding: '40px',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Work Sans, sans-serif',
        justifySelf: 'center',
        paddingTop: '60px'
      }}>
      <h1 style={{ 
        fontSize: '20px', 
        fontWeight: 500, 
        marginBottom: '32px',
        color: theme.text,
        fontFamily: 'Work Sans, sans-serif'
      }}>
        My Settings
      </h1>
      
      <div style={{ 
        marginBottom: '40px',
        borderBottom: `1px solid ${theme.border}`,
        paddingBottom: '16px'
        
        }}>

        <h2 style={{ 
          fontSize: '16px', 
          fontWeight: 400, 
          marginBottom: '5px',
          color: theme.text,
          fontFamily: 'Work Sans, sans-serif',
          
        }}>
          Member profile
        </h2>
        <p
        style={{
          fontSize: '14px',
          fontWeight: 300,
          color: theme.text,
          fontFamily: 'Work Sans, sans-serif',
          opacity: 0.7,
          lineHeight: '1.5',
          marginBottom: '10px'
        }}>
          Your personal information and account security settings.
        </p>
        
        {/*member profile content */ }
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '32px',
            alignItems: 'flex-start',
            marginTop: '24px'
          }}
          >

          {/* User Avatar Section */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px'
          }}>
            <label
              style={{
                fontSize: '13px',
                fontWeight: 500,
                color: theme.text,
                fontFamily: 'Work Sans, sans-serif',
              }}
            >
              Avatar
            </label>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: avatarColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <span style={{
                fontSize: '28px',
                fontWeight: 600,
                color: '#ffffff',
                fontFamily: 'Work Sans, sans-serif',
                userSelect: 'none'
              }}>
                {avatarText}
              </span>
            </div>
          </div>

          {/* Form Column */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            flex: 1,
            maxWidth: '500px'
          }}>
            {/* First Name Input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label
                style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  color: theme.text,
                  fontFamily: 'Work Sans, sans-serif',
                  userSelect: 'none'
                }}
              >
                First Name
              </label>
              <input
                type="text"
                placeholder="First Name"
                defaultValue={profile?.first_name || ''}
                onBlur={(e) => {
                  e.target.style.border = `1px solid ${theme.border}`;
                }}
                onFocus={(e) => {
                  e.target.style.border = `1px solid ${theme.tone_button_bk_color || theme.border}`;
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
              />
            </div>

            {/* Surname Input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label
                style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  color: theme.text,
                  fontFamily: 'Work Sans, sans-serif',
                  userSelect: 'none'
                }}
              >
                Surname
              </label>
              <input
                type="text"
                placeholder="Surname"
                defaultValue={profile?.surname || ''}
                onBlur={(e) => {
                  e.target.style.border = `1px solid ${theme.border}`;
                }}
                onFocus={(e) => {
                  e.target.style.border = `1px solid ${theme.tone_button_bk_color || theme.border}`;
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
              />
            </div>

            {/* Email Input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label
                style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  color: theme.text,
                  fontFamily: 'Work Sans, sans-serif',
                  userSelect: 'none'
                }}
              >
                Email
              </label>
              <input
                type="email"
                placeholder="Email"
                defaultValue={user?.email || ''}
                onBlur={(e) => {
                  e.target.style.border = `1px solid ${theme.border}`;
                }}
                onFocus={(e) => {
                  e.target.style.border = `1px solid ${theme.tone_button_bk_color || theme.border}`;
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
              />
            </div>

            {/* Auth Provider Display */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label
                style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  color: theme.text,
                  fontFamily: 'Work Sans, sans-serif',
                  userSelect: 'none'
                }}
              >
                Authentication Provider
              </label>
              <div
                style={{
                  padding: '10px 12px',
                  fontSize: '14px',
                  fontFamily: 'Work Sans, sans-serif',
                  border: `1px solid ${theme.border}`,
                  borderRadius: '6px',
                  backgroundColor: theme.background,
                  color: theme.text,
                  opacity: 0.7,
                }}
              >
                {user?.oauth_provider ? 
                  `${user.oauth_provider.charAt(0).toUpperCase()}${user.oauth_provider.slice(1)}` : 
                  'iLaunching'
                }
              </div>
            </div>

            {/* Password Input - Only show if user has password authentication */}
            {user?.use_password && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label
                  style={{
                    fontSize: '13px',
                    fontWeight: 500,
                    color: theme.text,
                    fontFamily: 'Work Sans, sans-serif',
                    userSelect: 'none'
                  }}
                >
                  Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  onBlur={(e) => {
                    e.target.style.border = `1px solid ${theme.border}`;
                  }}
                  onFocus={(e) => {
                    e.target.style.border = `1px solid ${theme.tone_button_bk_color || theme.border}`;
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
                />
              </div>
            )}
          </div>
        </div>




      </div>

      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ 
          fontSize: '20px', 
          fontWeight: 600, 
          marginBottom: '16px',
          color: theme.text,
          fontFamily: 'Work Sans, sans-serif'
        }}>
          Account Settings
        </h2>
      </div>
    </div>
  );
};

export default MySettings;
