import React, { useEffect, useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Lock, Trash2, Camera, X } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/api/auth';
import GeneralMenu from '@/components/GeneralMenu';
import AppearanceSelector from '@/components/AppearanceSelector';
import IThemeSelector from '@/components/iThemeSelector';
import LoginPermissionsSelector from '@/components/LoginPermissionsSelector';
import AvatarImageUploader from '@/components/AvatarImageUploader';
import IconPicker from '@/components/IconPicker';
import { ADD_PASSWORD_MESSAGES, DELETE_ACCOUNT_MESSAGE } from '@/constants/messages';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faHeart,
  faStar,
  faHome,
  faBriefcase,
  faGraduationCap,
  faCamera,
  faMusic,
  faGamepad,
  faCoffee,
  faPizzaSlice,
  faBicycle,
  faCar,
  faPlane,
  faRocket,
  faPalette,
  faCode,
  faLaptop,
  faMobileAlt,
  faHeadphones,
  faBook,
  faPencilAlt,
  faLightbulb,
  faTrophy,
  faMedal,
  faCrown,
  faGem,
  faFire,
  faBolt,
  faMagic,
  faTree,
  faDog,
  faCat,
  faFish,
  faBug,
} from '@fortawesome/free-solid-svg-icons';

interface SmartHubContextType {
  theme: {
    text: string;
    background: string;
    background_opacity: string;
    menu_bg_opacity?: string;
    border?: string;
    danger_color?: string;
    global_button_hover?: string;
    danger_button_bk_color?: string;
    dander_button_hover_color?: string;
    danger_button_text_color?: string;
    danger_button_border_color?: string;
    danger_button_hover_border_color?: string;
    danger_button_bk_hover_color?: string;
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
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const [isPasswordMenuOpen, setIsPasswordMenuOpen] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');
  const [isDeleteAccountMenuOpen, setIsDeleteAccountMenuOpen] = useState(false);
  const [isAvatarUploaderOpen, setIsAvatarUploaderOpen] = useState(false);
  const [isAvatarHovered, setIsAvatarHovered] = useState(false);
  const [avatarColors, setAvatarColors] = useState<Array<{ option_value_id: number; value_name: string; display_name: string; metadata: { color: string } }>>([]);
  const [loadingColors, setLoadingColors] = useState(true);
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
  const queryClient = useQueryClient();

  // Popular icons for profile avatar (same as IconPickerMini)
  const popularIcons: { icon?: any; name: string; id: number | null; isClear?: boolean }[] = [
    { name: 'clear', id: null, isClear: true },
    { icon: faUser, name: 'user', id: 1174 },
    { icon: faHeart, name: 'heart', id: 484 },
    { icon: faStar, name: 'star', id: 1491 },
    { icon: faHome, name: 'home', id: 1111 },
    { icon: faBriefcase, name: 'briefcase', id: 1843 },
    { icon: faGraduationCap, name: 'graduation-cap', id: 1497 },
    { icon: faCamera, name: 'camera', id: 341 },
    { icon: faMusic, name: 'music', id: 1665 },
    { icon: faGamepad, name: 'gamepad', id: 1931 },
    { icon: faCoffee, name: 'coffee', id: 1503 },
    { icon: faPizzaSlice, name: 'pizza-slice', id: 1361 },
    { icon: faBicycle, name: 'bicycle', id: 944 },
    { icon: faCar, name: 'car', id: 132 },
    { icon: faPlane, name: 'plane', id: 1309 },
    { icon: faRocket, name: 'rocket', id: 473 },
    { icon: faPalette, name: 'palette', id: 303 },
    { icon: faCode, name: 'code', id: 802 },
    { icon: faLaptop, name: 'laptop', id: 653 },
    { icon: faMobileAlt, name: 'mobile-alt', id: 1088 },
    { icon: faHeadphones, name: 'headphones', id: 1383 },
    { icon: faBook, name: 'book', id: 452 },
    { icon: faPencilAlt, name: 'pencil-alt', id: 779 },
    { icon: faLightbulb, name: 'lightbulb', id: 796 },
    { icon: faTrophy, name: 'trophy', id: 191 },
    { icon: faMedal, name: 'medal', id: 136 },
    { icon: faCrown, name: 'crown', id: 723 },
    { icon: faGem, name: 'gem', id: 1038 },
    { icon: faFire, name: 'fire', id: 540 },
    { icon: faBolt, name: 'bolt', id: 1738 },
    { icon: faMagic, name: 'magic', id: 1156 },
    { icon: faTree, name: 'tree', id: 314 },
    { icon: faDog, name: 'dog', id: 82 },
    { icon: faCat, name: 'cat', id: 1981 },
    { icon: faFish, name: 'fish', id: 1370 },
    { icon: faBug, name: 'bug', id: 1545 },
  ];

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

  // Fetch avatar colors from API (using smarthub-colors endpoint)
  useEffect(() => {
    const fetchAvatarColors = async () => {
      try {
        const response = await api.get('/smarthub-colors');
        console.log('Avatar colors fetched from smarthub-colors:', response.data);
        setAvatarColors(response.data.colors || []);
      } catch (error) {
        console.error('Failed to fetch avatar colors:', error);
      } finally {
        setLoadingColors(false);
      }
    };

    fetchAvatarColors();
  }, []);

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
      
      // Also invalidate Smart Matrix query to update canvas colors
      await queryClient.invalidateQueries({ queryKey: ['current-smart-matrix'] });
      console.log('🎨 Invalidated both current-smart-hub and current-smart-matrix queries');
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

  // Mutation to update iTheme
  const updateIthemeMutation = useMutation({
    mutationFn: async (ithemeId: number) => {
      console.log('Calling API to update itheme:', ithemeId);
      const response = await api.patch(`/profile/itheme?itheme_id=${ithemeId}`);
      console.log('API response:', response.data);
      return { ithemeId, data: response.data };
    },
    onSuccess: async ({ ithemeId, data }) => {
      console.log('iTheme updated successfully:', data);
      
      // Optimistically update the cache with the new itheme
      queryClient.setQueryData(['current-smart-hub'], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          profile: {
            ...oldData.profile,
            itheme: {
              ...oldData.profile.itheme,
              id: ithemeId
            }
          }
        };
      });
      
      // Refetch the smart hub data to get updated theme
      await queryClient.invalidateQueries({ queryKey: ['current-smart-hub'] });
    },
    onError: (error: any) => {
      console.error('Failed to update itheme:', error);
      console.error('Error response:', error.response?.data);
    }
  });

  const handleIthemeChange = (ithemeId: number) => {
    console.log('Changing itheme to:', ithemeId);
    updateIthemeMutation.mutate(ithemeId);
  };

  // Mutation to update login permissions
  const updateLoginPermissionsMutation = useMutation({
    mutationFn: async (permissionId: number) => {
      console.log('Calling API to update login permissions:', permissionId);
      const response = await api.patch(`/profile/login-permissions?permission_id=${permissionId}`);
      console.log('API response:', response.data);
      return { permissionId, data: response.data };
    },
    onSuccess: async ({ permissionId, data }) => {
      console.log('Login permissions updated successfully:', data);
      
      // Optimistically update the cache with the new login permission
      queryClient.setQueryData(['current-smart-hub'], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          profile: {
            ...oldData.profile,
            login_permissions_option_value_id: permissionId
          }
        };
      });
      
      // Refetch the smart hub data
      await queryClient.invalidateQueries({ queryKey: ['current-smart-hub'] });
    },
    onError: (error: any) => {
      console.error('Failed to update login permissions:', error);
      console.error('Error response:', error.response?.data);
    }
  });

  const handleLoginPermissionsChange = (permissionId: number) => {
    console.log('Changing login permissions to:', permissionId);
    updateLoginPermissionsMutation.mutate(permissionId);
  };

  // Mutation to update avatar color
  const updateAvatarColorMutation = useMutation({
    mutationFn: async (colorId: number) => {
      console.log('Calling API to update avatar color:', colorId);
      const response = await api.patch(`/profile/avatar-color?avatar_color_id=${colorId}`);
      console.log('API response:', response.data);
      return response.data;
    },
    onSuccess: () => {
      console.log('Avatar color updated successfully');
      queryClient.invalidateQueries({ queryKey: ['current-smart-hub'] });
      console.log('✅ Avatar color updated and refetching');
    },
    onError: (error: any) => {
      console.error('Failed to update avatar color:', error);
      console.error('Error response:', error.response?.data);
    },
  });

  const handleAvatarColorSelect = (colorId: number) => {
    console.log('Avatar color selected:', colorId);
    updateAvatarColorMutation.mutate(colorId);
  };

  // Mutation to update profile icon
  const updateProfileIconMutation = useMutation({
    mutationFn: async (iconId: number) => {
      console.log('Calling API to update profile icon:', iconId);
      const response = await api.patch(`/profile/icon?profile_icon_id=${iconId}`);
      console.log('API response:', response.data);
      return response.data;
    },
    onSuccess: () => {
      console.log('Profile icon updated successfully');
      queryClient.invalidateQueries({ queryKey: ['current-smart-hub'] });
      console.log('✅ Profile icon updated and refetching');
    },
    onError: (error: any) => {
      console.error('Failed to update profile icon:', error);
      console.error('Error response:', error.response?.data);
    },
  });

  const handleIconSelect = (iconId: number) => {
    console.log('Icon selected:', iconId);
    updateProfileIconMutation.mutate(iconId);
  };

  // Mutation to clear profile icon
  const clearProfileIconMutation = useMutation({
    mutationFn: async () => {
      console.log('Calling API to clear profile icon');
      const response = await api.delete(`/profile/icon`);
      console.log('API response:', response.data);
      return response.data;
    },
    onSuccess: () => {
      console.log('Profile icon cleared successfully');
      queryClient.invalidateQueries({ queryKey: ['current-smart-hub'] });
      console.log('✅ Profile icon cleared and refetching');
    },
    onError: (error: any) => {
      console.error('Failed to clear profile icon:', error);
      console.error('Error response:', error.response?.data);
    },
  });

  const handleClearIcon = () => {
    console.log('Clear profile icon clicked');
    clearProfileIconMutation.mutate();
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
        fontFamily: 'Work Sans, sans-serif',
        userSelect: 'none'
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
          userSelect: 'none'
          
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
          marginBottom: '10px',
          userSelect: 'none'
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
                userSelect: 'none'
              }}
            >
              Avatar
            </label>
            <div 
              style={{
                position: 'relative',
                cursor: 'pointer'
              }}
              onMouseEnter={() => setIsAvatarHovered(true)}
              onMouseLeave={() => setIsAvatarHovered(false)}
              onClick={() => setIsAvatarUploaderOpen(true)}
            >
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: avatarColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'opacity 0.2s ease'
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
              {/* Camera Icon Overlay */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: isAvatarHovered ? 1 : 0,
                transition: 'opacity 0.2s ease',
                pointerEvents: 'none'
              }}>
                <Camera style={{
                  width: '28px',
                  height: '28px',
                  color: '#ffffff'
                }} />
              </div>
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
                  userSelect: 'none'
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
                  userSelect: 'none'  
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
                  userSelect: 'none',
                  
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
                  userSelect: 'none'
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
                  userSelect: 'none'
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
                    lineHeight: '1.4',
                    userSelect: 'none'
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
                    width: 'fit-content',
                    userSelect: 'none'
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
                    userSelect: 'none',
                    msUserSelect: 'none',
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
                    userSelect: 'none'
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Avatar Color Section */}
        <div style={{
          marginTop: '32px',
          paddingTop: '32px',
          borderTop: `1px solid ${theme.border}`
        }}>
          <h2 style={{
            fontSize: '16px',
            fontWeight: 400,
            marginBottom: '5px',
            color: theme.text,
            fontFamily: 'Work Sans, sans-serif',
            userSelect: 'none'
          }}>
            Avatar Color
          </h2>
          <p style={{
            fontSize: '14px',
            fontWeight: 300,
            color: theme.text,
            fontFamily: 'Work Sans, sans-serif',
            opacity: 0.7,
            lineHeight: '1.5',
            marginBottom: '20px',
            userSelect: 'none'
          }}>
            Choose a color for your avatar background.
          </p>

          {/* Color Picker */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
            width: '100%'
          }}>
            {loadingColors ? (
              <div style={{ color: theme.text, fontSize: '14px', opacity: 0.7 }}>Loading colors...</div>
            ) : avatarColors.length === 0 ? (
              <div style={{ color: theme.text, fontSize: '14px', opacity: 0.7 }}>No colors available</div>
            ) : (
              avatarColors.map((color) => {
                const isSelected = profile?.avatar_color?.color === color.metadata?.color;
                return (
                  <button
                    key={color.option_value_id}
                    onClick={() => handleAvatarColorSelect(color.option_value_id)}
                    style={{
                      width: '25px',
                      height: '25px',
                      borderRadius: '50%',
                      backgroundColor: color.metadata?.color || '#7F77F1',
                      cursor: 'pointer',
                      border: isSelected 
                        ? '2px solid #ffffff' 
                        : '1px solid rgba(255, 255, 255, 0.2)',
                      boxShadow: isSelected 
                        ? `0 0 0 2px ${color.metadata?.color || '#7F77F1'}80` 
                        : 'none',
                      transition: 'all 0.2s ease',
                      padding: 0,
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.boxShadow = `0 0 0 2px ${color.metadata?.color || '#7F77F1'}40`;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.boxShadow = 'none';
                      }
                    }}
                    title={color.display_name}
                    aria-label={`Select ${color.display_name} color`}
                  />
                );
              })
            )}
          </div>
        </div>

        {/* Avatar Icon Section */}
        <div style={{
          marginTop: '32px',
          paddingTop: '32px',
          borderTop: `1px solid ${theme.border}`
        }}>
          <h2 style={{
            fontSize: '16px',
            fontWeight: 400,
            marginBottom: '5px',
            color: theme.text,
            fontFamily: 'Work Sans, sans-serif',
            userSelect: 'none'
          }}>
            Avatar Icon
          </h2>
          <p style={{
            fontSize: '14px',
            fontWeight: 300,
            color: theme.text,
            fontFamily: 'Work Sans, sans-serif',
            opacity: 0.7,
            lineHeight: '1.5',
            marginBottom: '20px',
            userSelect: 'none'
          }}>
            Choose an icon to display on your avatar.
          </p>

          {/* Icon Selector */}
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '16px',
            width: '100%'
          }}>
            {popularIcons.map((item) => {
              const isSelected = profile?.profile_icon?.id === item.id;

              // Special handling for clear button
              if (item.isClear) {
                return (
                  <button
                    key="clear"
                    onClick={handleClearIcon}
                    style={{
                      width: '28px',
                      height: '28px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      outline: 'none',
                      color: theme.text,
                      cursor: 'pointer',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'background-color 0.2s ease',
                    }}
                    title="Clear Icon"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = theme.global_button_hover || '#000';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <X size={16} />
                  </button>
                );
              }

              // Regular icon button
              return (
                <button
                  key={item.id}
                  onClick={() => item.id && handleIconSelect(item.id)}
                  style={{
                    width: '28px',
                    height: '28px',
                    backgroundColor: isSelected ? (theme.tone_button_bk_color || theme.global_button_hover) : 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: isSelected ? (theme.tone_button_text_color || theme.text) : theme.text,
                    cursor: 'pointer',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                  }}
                  title={item.name}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = theme.global_button_hover || '#000';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  {item.icon && <FontAwesomeIcon icon={item.icon} size="sm" />}
                </button>
              );
            })}
          </div>

          {/* More Icons Button */}
          <button
            onClick={() => setIsIconPickerOpen(true)}
            style={{
              width: '20%',
              height: '35px',
              backgroundColor: 'transparent',
              color: theme.text,
              fontFamily: 'Work Sans, sans-serif',
              border: `1px solid ${theme.text}40`,
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'background-color 0.2s ease',
              marginTop: '15px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.global_button_hover || '#000';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            More Icons
          </button>
        </div>
      </div>


      {/* Appearance Section */}
      <div style={{ 
        marginBottom: '30px',
        borderBottom: `1px solid ${theme.border}`,
        paddingBottom: '40px',
        
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


      {/* itheme  Section */}
      <div
        style={{
        marginBottom: '30px',
        borderBottom: `1px solid ${theme.border}`,
        paddingBottom: '40px',
        }}
        > 
        <h2 style={{ 
          fontSize: '16px', 
          fontWeight: 400, 
          marginBottom: '5px',
          color: theme.text,
          fontFamily: 'Work Sans, sans-serif'
        }}>
          iTheme
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
          Personalise your iLaunching experience by selecting your preferred iTheme
        </p>

        {/* IThemeSelector Component */}
        <IThemeSelector
          currentIthemeId={profile?.itheme?.id ?? null}
          onIthemeChange={handleIthemeChange}
          textColor={theme.text}
          borderLineColor={theme.border || 'rgba(255, 255, 255, 0.1)'}
          globalHoverColor={theme.global_button_hover || 'rgba(127, 119, 241, 0.1)'}
        />
      </div>

      <div
        style={{ 
        marginBottom: '30px',
        borderBottom: `1px solid ${theme.border}`,
        paddingBottom: '40px',
        
        }}
        > 
        <h2 style={{ 
          fontSize: '16px', 
          fontWeight: 400, 
          marginBottom: '5px',
          color: theme.text,
          fontFamily: 'Work Sans, sans-serif'
        }}>
          Launguage & Region
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
          Customize your language and region.
        </p>

        {/* Future security settings can be added here */}

      </div>


      {/*Time & Date format Section */}
      <div
        style={{ 
        marginBottom: '30px',
        borderBottom: `1px solid ${theme.border}`,
        paddingBottom: '40px',
        
        }}
        > 
        <h2 style={{ 
          fontSize: '16px', 
          fontWeight: 400, 
          marginBottom: '5px',
          color: theme.text,
          fontFamily: 'Work Sans, sans-serif'
        }}>
          Time & Date format
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
          Select the way times & dates are displayed.
        </p>

        {/* time zone content  */}
    
      </div>

      {/*preferences Section */}
      <div
        style={{ 
        marginBottom: '30px',
        borderBottom: `1px solid ${theme.border}`,
        paddingBottom: '40px',
        
        }}
        > 
        <h2 style={{ 
          fontSize: '16px', 
          fontWeight: 400, 
          marginBottom: '5px',
          color: theme.text,
          fontFamily: 'Work Sans, sans-serif'
        }}>
          Preferences
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
          Manage your in-app preferences.
        </p>

        {/* future preference content can be added here */}

      </div>

     {/*login permissions Section */}
      <div
        style={{ 
        marginBottom: '30px',
        borderBottom: `1px solid ${theme.border}`,
        paddingBottom: '40px',
        
        }}
        > 
        <h2 style={{ 
          fontSize: '16px', 
          fontWeight: 400, 
          marginBottom: '5px',
          color: theme.text,
          fontFamily: 'Work Sans, sans-serif'
        }}>
          Login Permissions for iluanching Support
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
          If login permissions are granted, our trained Support Specialists can access your account to troubleshoot specific issues you raise in a support ticket. Read more about our{' '}
          <a
            href="/legal/security-policy"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: theme.solid_color || '#7F77F1',
              textDecoration: 'none',
              fontWeight: 400,
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.textDecoration = 'underline';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.textDecoration = 'none';
            }}
          >
            Security Policy here
          </a>.
        </p>

        {/* LoginPermissionsSelector Component */}
        <LoginPermissionsSelector
          currentPermissionId={profile?.login_permissions_option_value_id ?? null}
          onPermissionChange={handleLoginPermissionsChange}
          textColor={theme.text}
          borderLineColor={theme.border || 'rgba(255, 255, 255, 0.1)'}
          solidColor={theme.solid_color || '#7F77F1'}
        />
      </div>
      

      {/* Danger Section */}
      <div
        style={{ 
        marginBottom: '30px',
        borderBottom: `1px solid ${theme.border}`,
        paddingBottom: '40px',
        
        }}
        > 
        <h2 style={{ 
          fontSize: '18px', 
          fontWeight: 500, 
          marginBottom: '5px',
          color: theme.danger_tone_text,
          fontFamily: 'Work Sans, sans-serif'
        }}>
          Danger
        </h2>
        <p
        style={{
          fontSize: '14px',
          fontWeight: 300,
          color: theme.danger_tone_text,
          fontFamily: 'Work Sans, sans-serif',
          opacity: 0.7,
          lineHeight: '1.5',
          marginBottom: '20px'
        }}
        
        >
         Proceed with caution.
        </p>

      <h2
        style={{ 
          fontSize: '16px', 
          fontWeight: 400, 
          marginBottom: '5px',
          color: theme.danger_tone_text,
          fontFamily: 'Work Sans, sans-serif'
        }}
      >
        Log out all sessions including any session on mobile, iPad, and other browsers
      </h2>

      <button
        onClick={async () => {
          try {
            // Call logout API to revoke refresh token
            await authApi.logout();
            
            // Clear auth store
            logout();
            
            // Redirect to login
            navigate('/login');
          } catch (error) {
            console.error('Failed to logout:', error);
            // Even if API fails, clear local state and redirect
            logout();
            navigate('/login');
          }
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 16px',
          marginTop: '12px',
          backgroundColor: theme.danger_tone_bk || 'rgba(198, 42, 47, 0.15)',
          border: `1px solid ${theme.danger_tone_border || 'rgba(198, 42, 47, 0.38)'}`,
          borderRadius: '8px',
          color: theme.danger_tone_text,
          fontSize: '14px',
          fontWeight: 400,
          fontFamily: 'Work Sans, sans-serif',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = theme.danger_bk_solid_color;
          e.currentTarget.style.color = theme.danger_bk_solid_text_color;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = theme.danger_tone_bk || 'rgba(198, 42, 47, 0.15)';
          e.currentTarget.style.color = theme.danger_tone_text;
        }}
      >
        <Lock size={16} />
        Log out of all sessions
      </button>

    <h2
        style={{ 
          fontSize: '16px', 
          fontWeight: 400, 
          marginTop: '50px',
          marginBottom: '5px',
          color: theme.danger_tone_text,
          fontFamily: 'Work Sans, sans-serif'
        }}
      >
        Delete my account and all associated data

    </h2>

      <button
        onClick={() => {
          setIsDeleteAccountMenuOpen(true);
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 16px',
          marginTop: '12px',
          backgroundColor: theme.danger_bk_solid_color,
          border: `1px solid ${theme.danger_tone_border || 'rgba(198, 42, 47, 0.38)'}`,
          borderRadius: '8px',
          color: theme.danger_bk_solid_text_color,
          fontSize: '14px',
          fontWeight: 400,
          fontFamily: 'Work Sans, sans-serif',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = theme.danger_button_hover || 'rgba(198, 42, 47, 0.25)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = theme.danger_bk_solid_color;
        }}
      >
        <Trash2 size={16} />
        Delete account
      </button>

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
        dangerButtonColor={theme.danger_tone_bk || theme.background}
        dangerButtonTextColor={theme.danger_tone_text || theme.text}
        dangerButtonHoverColor={theme.danger_button_hover || theme.global_button_hover}
        dangerButtonSolidColor={theme.danger_button_solid_color || theme.header_background}
        dangerToneBk={theme.danger_tone_bk || theme.background}
        dangerToneBorder={theme.danger_tone_border || theme.border}
        dangerToneText={theme.danger_tone_text || theme.text}
        dangerBkLightColor={theme.danger_bk_light_color || theme.background}
        dangerBkSolidColor={theme.danger_bk_solid_color || theme.header_background}
        dangerBkSolidTextColor={theme.danger_bk_solid_text_color || theme.text}
        context="password"
        customMessage={passwordMessage}
        confirmButtonText="Add Password"
        cancelButtonText="Cancel"
      />

      {/* GeneralMenu for Delete Account */}
      <GeneralMenu
        isOpen={isDeleteAccountMenuOpen}
        onClose={() => setIsDeleteAccountMenuOpen(false)}
        onConfirm={async (inputValue?: string) => {
          if (inputValue?.toLowerCase() !== 'delete account') {
            alert('Please type "delete account" to confirm.');
            return;
          }
          
          try {
            console.log('Deleting account...');
            // TODO: Call delete account API endpoint
            // await authApi.deleteAccount();
            
            // For now, just close the menu
            setIsDeleteAccountMenuOpen(false);
            alert('Account deletion feature coming soon!');
          } catch (error: any) {
            console.error('Failed to delete account:', error);
            alert(error.response?.data?.detail || 'Failed to delete account. Please try again.');
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
        dangerButtonColor={theme.danger_tone_bk || theme.background}
        dangerButtonTextColor={theme.danger_tone_text || theme.text}
        dangerButtonHoverColor={theme.danger_button_hover || theme.global_button_hover}
        dangerButtonSolidColor={theme.danger_button_solid_color || theme.header_background}
        dangerToneBk={theme.danger_tone_bk || theme.background}
        dangerToneBorder={theme.danger_tone_border || theme.border}
        dangerToneText={theme.danger_tone_text || theme.text}
        dangerBkLightColor={theme.danger_bk_light_color || theme.background}
        dangerBkSolidColor={theme.danger_bk_solid_color || theme.header_background}
        dangerBkSolidTextColor={theme.danger_bk_solid_text_color || theme.text}
        context="delete_account"
        customMessage={DELETE_ACCOUNT_MESSAGE}
        confirmButtonText="Delete Account"
        cancelButtonText="Cancel"
      />

      {/* AvatarImageUploader for User Profile */}
      <AvatarImageUploader
        isOpen={isAvatarUploaderOpen}
        onClose={() => setIsAvatarUploaderOpen(false)}
        context="user-profile"
        smart_hub_id={null}
        textColor={theme.text}
        menuColor={theme.background}
        titleColor={theme.text}
        globalButtonHover={theme.global_button_hover || 'rgba(127, 119, 241, 0.1)'}
        toneButtonBkColor={theme.background}
        toneButtonTextColor={theme.text}
        toneButtonBorderColor={theme.border || 'rgba(255, 255, 255, 0.1)'}
        backgroundColor={theme.background}
        solidColor={theme.header_background}
        feedbackIndicatorBk={theme.feedback_indicator_bk || theme.background}
        appearanceTextColor={theme.text}
        buttonBkColor={theme.button_bk_color || theme.header_background}
        buttonTextColor={theme.button_text_color || theme.text}
        buttonHoverColor={theme.button_hover_color || theme.global_button_hover}
      />

      {/* IconPicker for User Profile */}
      <IconPicker
        isOpen={isIconPickerOpen}
        onClose={() => setIsIconPickerOpen(false)}
        currentIconId={profile?.profile_icon?.id}
        onIconSelect={handleIconSelect}
        textColor={theme.text}
        menuColor={theme.background}
        titleColor={theme.text}
        globalButtonHover={theme.global_button_hover || 'rgba(127, 119, 241, 0.1)'}
        context="user-profile"
        toneButtonBkColor={theme.tone_button_bk_color}
        toneButtonTextColor={theme.tone_button_text_color}
      />
    </div>
  );
};

export default MySettings;
