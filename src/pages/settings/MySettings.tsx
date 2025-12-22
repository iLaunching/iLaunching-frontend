import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { User, Mail, Lock } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/api/auth';
import GeneralMenu from '@/components/GeneralMenu';
import AppearanceSelector from '@/components/AppearanceSelector';
import { ADD_PASSWORD_MESSAGES } from '@/constants/messages';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

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
  const setAuth = useAuthStore((state) => state.setAuth);
  const [isPasswordMenuOpen, setIsPasswordMenuOpen] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');
  const queryClient = useQueryClient();

  // Fetch fresh user data on component mount to ensure we have latest fields
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await authApi.getMe();
        if (response.user) {
          const accessToken = useAuthStore.getState().accessToken;
          const refreshToken = useAuthStore.getState().refreshToken;
          if (accessToken && refreshToken) {
            setAuth(response.user as any, accessToken, refreshToken);
          }
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };
    fetchUserData();
  }, [setAuth]);

  console.log('MySettings - user object:', user);
  console.log('MySettings - use_password value:', user?.use_password);
  console.log('MySettings - oauth_provider value:', user?.oauth_provider);
  console.log('MySettings - profile object:', profile);
  console.log('MySettings - appearance:', profile?.appearance);
  console.log('MySettings - theme object:', theme);

  const avatarColor = profile?.avatar_color?.color || '#7F77F1';
  const avatarText = `${profile?.first_name?.charAt(0) || ''}${profile?.surname?.charAt(0) || ''}`.toUpperCase();

  // Mutation to update appearance
  const updateAppearanceMutation = useMutation({
    mutationFn: async (appearanceId: number) => {
      console.log('Calling API to update appearance:', appearanceId);
      const response = await api.patch(`/profile/appearance?appearance_id=${appearanceId}`);
      console.log('API response:', response.data);
      return { appearanceId, data: response.data };
    },
    onSuccess: async ({ appearanceId, data }) => {
      console.log('Appearance updated successfully:', data);
      
      // Optimistically update the cache with the new appearance
      queryClient.setQueryData(['current-smart-hub'], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          profile: {
            ...oldData.profile,
            appearance: {
              ...oldData.profile.appearance,
              id: appearanceId
            }
          }
        };
      });
      
      // Refetch the smart hub data to get updated theme and full profile
      await queryClient.invalidateQueries({ queryKey: ['current-smart-hub'] });
    },
    onError: (error: any) => {
      console.error('Failed to update appearance:', error);
      console.error('Error response:', error.response?.data);
    }
  });

  const handleAppearanceChange = (appearanceId: number) => {
    console.log('Changing appearance to:', appearanceId);
    updateAppearanceMutation.mutate(appearanceId);
  };

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
        marginBottom: '20px',
        borderBottom: `1px solid ${theme.border}`,
        paddingBottom: '40px'
        
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

              {/* Add Password Login Button - Only show for OAuth users without password */}
              {user?.use_password === false && (

                <div style={{ 
                  marginTop: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                 }}>

                <p
                  style={{
                    fontSize: '12px',
                    fontWeight: 300,
                    color: theme.text,
                    fontStyle: 'italic',
                    fontFamily: 'Work Sans, sans-serif',
                    opacity: 0.7,
                    lineHeight: '1.4'
                  }}
                
                >
                  Want a backup? Add a password so you can sign in either way
                </p>

                <button
                  onClick={() => {
                    // Pick a random password message
                    const randomIndex = Math.floor(Math.random() * ADD_PASSWORD_MESSAGES.length);
                    const message = ADD_PASSWORD_MESSAGES[randomIndex].replace(/{username}/g, profile?.first_name || 'there');
                    setPasswordMessage(message);
                    setIsPasswordMenuOpen(true);
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.global_button_hover_color || 'rgba(0, 0, 0, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    paddingLeft: '16px',
                    paddingRight: '16px',
                    fontSize: '13px',
                    fontWeight: 500,
                    fontFamily: 'Work Sans, sans-serif',
                    backgroundColor: 'transparent',
                    border: `1px solid ${theme.border}`,
                    color: theme.text,
                    cursor: 'pointer',
                    borderRadius: '6px',
                    transition: 'background-color 0.2s ease',
                    marginTop: '4px',
                    height: '33px',
                    width: 'fit-content'
                  }}
                >
                  <Lock className="w-4 h-4" />
                  <span>Add password login</span>
                </button>
                </div>
              )}
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


      {/* Appearance Section */}
      <div style={{ 
        marginBottom: '40px',
        borderBottom: `1px solid ${theme.border}`,
        paddingBottom: '16px',
        
        }}
        >
        <h2 style={{ 
          fontSize: '16px', 
          fontWeight: 400, 
          marginBottom: '5px',
          color: theme.text,
          fontFamily: 'Work Sans, sans-serif'
        }}>
          Appearance
        </h2>
        <p
        style={{
          fontSize: '14px',
          fontWeight: 300,
          color: theme.text,
          fontFamily: 'Work Sans, sans-serif',
          opacity: 0.7,
          lineHeight: '1.5',
          marginBottom: '20px'
        }}
        
        >
          Personalise your iLaunching experience by selecting your preferred appearance
          
        </p>

        {/* AppearanceSelector Component */}
        <AppearanceSelector
          currentAppearanceId={profile?.appearance?.id ?? null}
          onAppearanceChange={handleAppearanceChange}
          textColor={theme.text}
          borderLineColor={theme.border || 'rgba(255, 255, 255, 0.1)'}
          globalHoverColor={theme.global_button_hover || 'rgba(127, 119, 241, 0.1)'}
        />
      </div>

      {/* GeneralMenu for Adding Password */}
      <GeneralMenu
        isOpen={isPasswordMenuOpen}
        onClose={() => setIsPasswordMenuOpen(false)}
        onConfirm={async (password?: string) => {
          if (!password) return;
          
          try {
            console.log('Adding password to account...');
            await authApi.addPassword(password);
            console.log('Password added successfully');
            
            // Fetch fresh user data to update use_password field
            const response = await authApi.getMe();
            if (response.user) {
              const accessToken = useAuthStore.getState().accessToken;
              const refreshToken = useAuthStore.getState().refreshToken;
              if (accessToken && refreshToken) {
                setAuth(response.user as any, accessToken, refreshToken);
              }
            }
            
            setIsPasswordMenuOpen(false);
          } catch (error: any) {
            console.error('Failed to add password:', error);
            alert(error.response?.data?.detail || 'Failed to add password. Please try again.');
          }
        }}
        menuColor={theme.background}
        textColor={theme.text}
        borderLineColor={theme.border || 'rgba(255, 255, 255, 0.1)'}
        globalHoverColor={theme.global_button_hover || 'rgba(127, 119, 241, 0.1)'}
        chatBk1={theme.chat_bk_1}
        solidColor={theme.header_background}
        buttonHoverColor={theme.button_hover_color}
        aiAcknowledgeTextColor={theme.text}
        dangerButtonColor={theme.tone_button_bk_color || theme.background}
        dangerButtonTextColor={theme.text}
        dangerButtonHoverColor={theme.button_hover_color || theme.global_button_hover}
        dangerButtonSolidColor={theme.header_background}
        dangerToneBk={theme.background}
        dangerToneBorder={theme.border}
        dangerToneText={theme.text}
        dangerBkLightColor={theme.background}
        dangerBkSolidColor={theme.header_background}
        dangerBkSolidTextColor={theme.text}
        context="password"
        customMessage={passwordMessage}
        confirmButtonText="Add Password"
        cancelButtonText="Cancel"
      />
    </div>
  );
};

export default MySettings;
