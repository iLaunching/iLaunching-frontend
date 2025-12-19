import { useEffect } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useNavigate, Outlet } from 'react-router-dom';
import MainHeader from '@/components/layout/MainHeader';
import { authSync } from '@/lib/auth-sync';
import api from '@/lib/api';

interface SmartHubData {
  smart_hub: {
    id: string;
    name: string;
    description?: string;
    avatar?: string;
    hub_color?: string;  // Color value extracted from hub_color relationship
    hub_color_id?: number;  // FK to option_values (smarthub_color_scheme)
    smartHub_icon_id?: number;  // FK to option_values for hub icon
    avatar_display_option_value_id?: number;  // Avatar display mode
    smartHub_icon?: {
      id: number;
      value_name: string;
      display_name: string;
      icon_name: string;
      icon_prefix: string;
    } | null;
    journey: string;  // Per-hub journey tier
    owner_id: string;
    your_role: string;
    team_members: any[];
    created_at: string;
    modified_at: string;
  } | null;
  theme: {
    header_overlay: string;
    header_background: string;  // From itheme solid_color
    background: string;
    text: string;
    menu: string;
    menu_bg_opacity?: string;  // From itheme
    border: string;
    user_button_color: string;
    user_button_hover: string;
    user_button_icon: string;
    title_menu_color_light: string;
    border_line_color_light: string;
    global_button_hover: string;
    tone_button_bk_color?: string;
    tone_button_text_color?: string;
    tone_button_border_color?: string;
    feedback_indicator_bk?: string;
    button_bk_color?: string;
    button_text_color?: string;
    button_hover_color?: string;
    chat_bk_1?: string;  // Chat background gradient from appearance theme
    prompt_bk?: string;  // Prompt background color from appearance theme
    prompt_text_color?: string;  // Prompt text color from appearance theme
    ai_acknowledge_text_color?: string;  // AI acknowledgment text color from appearance theme
  } | null;
  profile: {
    id: string;
    user_id: string;
    first_name: string;
    surname: string;
    timezone: string;
    language: string;
    onboarding_completed: boolean;
    smart_hubs?: Array<{
      id: string;
      name: string;
      hub_color_id: number;
      color?: string;
      journey?: string;
    }>;
    appearance: {
      id: number;
      value_name: string;
      display_name: string;
    } | null;
    itheme: {
      id: number;
      value_name: string;
      display_name: string;
    } | null;
    avatar_color: {
      id: number;
      value_name: string;
      display_name: string;
      color: string;
    } | null;
    avatar_display_option_value_id: number | null;
    profile_icon: {
      id: number;
      value_name: string;
      display_name: string;
      icon_name: string;
      icon_prefix: string;
    } | null;
  };
}

export default function SmartHub() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Listen for auth events from other tabs
  useEffect(() => {
    const unsubscribe = authSync.subscribe((event) => {
      console.log('SmartHub received auth event:', event.type);
      
      if (event.type === 'LOGOUT') {
        // User logged out in another tab - redirect this tab too
        console.log('🚪 Logging out due to action in another tab');
        queryClient.clear(); // Clear all cached data
        navigate('/login?redirect=/smart-hub&reason=logged_out');
      } else if (event.type === 'LOGIN' || event.type === 'TOKEN_REFRESH') {
        // User logged in or token refreshed in another tab - refetch data
        console.log('🔄 Refreshing data due to auth change in another tab');
        queryClient.invalidateQueries({ queryKey: ['current-smart-hub'] });
      }
    });
    
    // Return cleanup function
    return () => {
      unsubscribe();
    };
  }, [navigate, queryClient]);
  
  // Fetch current smart hub data from API server
  const { data: hubData, isLoading, error } = useQuery<SmartHubData>({
    queryKey: ['current-smart-hub'],
    queryFn: async () => {
      // Call API server endpoint - includes JWT token automatically
      const response = await api.get('/users/me/current-smart-hub');
      console.log('📊 Smart Hub data loaded:', response.data);
      console.log('🎨 Smart Hub Icon Data:', JSON.stringify({
        smartHub_icon_id: response.data?.smart_hub?.smartHub_icon_id,
        smartHub_icon: response.data?.smart_hub?.smartHub_icon,
        avatar_display_option_value_id: response.data?.smart_hub?.avatar_display_option_value_id
      }, null, 2));
      return response.data;
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Mutation to update avatar color
  const updateAvatarColorMutation = useMutation({
    mutationFn: async (colorId: number) => {
      console.log('Calling API to update avatar color:', colorId);
      const response = await api.patch(`/profile/avatar-color?avatar_color_id=${colorId}`);
      console.log('API response:', response.data);
      return response.data;
    },
    onSuccess: (data) => {
      console.log('Avatar color updated successfully:', data);
      // Refetch the smart hub data to get updated color
      queryClient.invalidateQueries({ queryKey: ['current-smart-hub'] });
    },
    onError: (error: any) => {
      console.error('Failed to update avatar color:', error);
      console.error('Error response:', error.response?.data);
    }
  });

  const handleAvatarColorChange = (colorId: number) => {
    console.log('Changing avatar color to:', colorId);
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
    onSuccess: (data) => {
      console.log('Profile icon updated successfully:', data);
      // Refetch the smart hub data to get updated icon
      queryClient.invalidateQueries({ queryKey: ['current-smart-hub'] });
    },
    onError: (error: any) => {
      console.error('Failed to update profile icon:', error);
      console.error('Error response:', error.response?.data);
    }
  });

  const handleProfileIconChange = (iconId: number) => {
    console.log('=== SmartHub handleProfileIconChange CALLED ===');
    console.log('Changing profile icon to:', iconId);
    console.log('Calling updateProfileIconMutation.mutate with iconId:', iconId);
    updateProfileIconMutation.mutate(iconId);
    console.log('=== SmartHub handleProfileIconChange COMPLETED ===');
  };

  // Mutation to clear profile icon
  const clearProfileIconMutation = useMutation({
    mutationFn: async () => {
      console.log('Calling API to clear profile icon');
      const response = await api.delete(`/profile/icon`);
      console.log('API response:', response.data);
      return response.data;
    },
    onSuccess: (data) => {
      console.log('Profile icon cleared successfully:', data);
      // Refetch the smart hub data
      queryClient.invalidateQueries({ queryKey: ['current-smart-hub'] });
    },
    onError: (error: any) => {
      console.error('Failed to clear profile icon:', error);
      console.error('Error response:', error.response?.data);
    }
  });

  const handleClearIcon = () => {
    console.log('Clearing profile icon');
    clearProfileIconMutation.mutate();
  };

  // Mutation to update appearance
  const updateAppearanceMutation = useMutation({
    mutationFn: async (appearanceId: number) => {
      console.log('Calling API to update appearance:', appearanceId);
      const response = await api.patch(`/profile/appearance?appearance_id=${appearanceId}`);
      console.log('API response:', response.data);
      return response.data;
    },
    onSuccess: (data) => {
      console.log('Appearance updated successfully:', data);
      // Refetch the smart hub data to get updated theme - this should trigger a re-render with new theme
      queryClient.invalidateQueries({ queryKey: ['current-smart-hub'] });
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

  // Mutation to update itheme
  const updateIthemeMutation = useMutation({
    mutationFn: async (ithemeId: number) => {
      console.log('Calling API to update itheme:', ithemeId);
      const response = await api.patch(`/profile/itheme?itheme_id=${ithemeId}`);
      console.log('API response:', response.data);
      return response.data;
    },
    onSuccess: (data) => {
      console.log('iTheme updated successfully:', data);
      // Refetch the smart hub data to get updated theme
      queryClient.invalidateQueries({ queryKey: ['current-smart-hub'] });
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

  // Mutation to update smart hub color
  const updateSmartHubColorMutation = useMutation({
    mutationFn: async ({ colorId, smartHubId }: { colorId: number; smartHubId: string }) => {
      console.log('Calling API to update smart hub color:', { colorId, smartHubId });
      const response = await api.patch(`/smart-hub/color?smart_hub_id=${smartHubId}&hub_color_id=${colorId}`);
      console.log('API response:', response.data);
      return response.data;
    },
    onSuccess: (data) => {
      console.log('Smart hub color updated successfully:', data);
      // Refetch the smart hub data to get updated color
      queryClient.invalidateQueries({ queryKey: ['current-smart-hub'] });
    },
    onError: (error: any) => {
      console.error('Failed to update smart hub color:', error);
      console.error('Error response:', error.response?.data);
    }
  });

  const handleSmartHubColorChange = (colorId: number) => {
    console.log('=== SmartHub: handleSmartHubColorChange CALLED ===');
    console.log('Color ID:', colorId);
    console.log('Smart Hub ID:', hubData?.smart_hub?.id);
    
    if (!hubData?.smart_hub?.id) {
      console.error('No smart hub ID available');
      return;
    }
    
    console.log('Changing smart hub color to:', colorId);
    updateSmartHubColorMutation.mutate({ 
      colorId, 
      smartHubId: hubData.smart_hub.id 
    });
  };

  // Mutation to update smart hub icon
  const updateSmartHubIconMutation = useMutation({
    mutationFn: async ({ iconId, smartHubId }: { iconId: number; smartHubId: string }) => {
      console.log('Calling API to update smart hub icon:', { iconId, smartHubId });
      const response = await api.patch(`/smart-hub/icon?smart_hub_id=${smartHubId}&smartHub_icon_id=${iconId}`);
      console.log('API response:', response.data);
      return response.data;
    },
    onSuccess: (data) => {
      console.log('Smart hub icon updated successfully:', data);
      // Refetch the smart hub data to get updated icon
      queryClient.invalidateQueries({ queryKey: ['current-smart-hub'] });
    },
    onError: (error: any) => {
      console.error('Failed to update smart hub icon:', error);
      console.error('Error response:', error.response?.data);
    }
  });

  const handleSmartHubIconChange = (iconId: number) => {
    console.log('=== SmartHub: handleSmartHubIconChange CALLED ===');
    console.log('Icon ID:', iconId);
    console.log('Smart Hub ID:', hubData?.smart_hub?.id);
    
    if (!hubData?.smart_hub?.id) {
      console.error('No smart hub ID available');
      return;
    }
    
    console.log('Changing smart hub icon to:', iconId);
    updateSmartHubIconMutation.mutate({ 
      iconId, 
      smartHubId: hubData.smart_hub.id 
    });
  };

  // Mutation to clear smart hub icon
  const clearSmartHubIconMutation = useMutation({
    mutationFn: async (smartHubId: string) => {
      console.log('Calling API to clear smart hub icon for hub:', smartHubId);
      const response = await api.delete(`/smart-hub/icon?smart_hub_id=${smartHubId}`);
      console.log('API response:', response.data);
      return response.data;
    },
    onSuccess: (data) => {
      console.log('Smart hub icon cleared successfully:', data);
      // Refetch the smart hub data
      queryClient.invalidateQueries({ queryKey: ['current-smart-hub'] });
    },
    onError: (error: any) => {
      console.error('Failed to clear smart hub icon:', error);
      console.error('Error response:', error.response?.data);
    }
  });

  const handleClearSmartHubIcon = () => {
    console.log('=== SmartHub: handleClearSmartHubIcon CALLED ===');
    console.log('Smart Hub ID:', hubData?.smart_hub?.id);
    
    if (!hubData?.smart_hub?.id) {
      console.error('No smart hub ID available');
      return;
    }
    
    console.log('Clearing smart hub icon');
    clearSmartHubIconMutation.mutate(hubData.smart_hub.id);
  };
  
  // Handle authentication errors
  useEffect(() => {
    if (error && (error as any).response?.status === 401) {
      // Token expired or invalid - clear and redirect
      console.error('🔒 Authentication failed, redirecting to login');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      authSync.broadcast({ type: 'LOGOUT' });
      navigate('/login?redirect=/smart-hub&reason=session_expired');
    }
  }, [error, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Smart Hub...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load Smart Hub</p>
          <button 
            onClick={() => queryClient.invalidateQueries({ queryKey: ['current-smart-hub'] })}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!hubData?.smart_hub) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No active Smart Hub</p>
          <p className="text-sm text-gray-500">Please create or select a Smart Hub to continue</p>
        </div>
      </div>
    );
  }

  const themeDefaults = {
    header_overlay: '#00000080',
    header_background: '#7F77F1',
    background: '#ffffff',
    text: '#000000',
    menu: '#f3f4f6',
    border: '#e5e7eb',
    user_button_color: '#ffffff59',
    user_button_hover: '#ffffff66',
    user_button_icon: '#000000',
    title_menu_color_light: '#d6d6d6',
    border_line_color_light: '#d6d6d680',
    global_button_hover: '#d6d6d64d',
    solid_color: '#7F77F1',
    button_bk_color: '#7F77F1',
    button_text_color: '#ffffff',
    button_hover_color: '#6B69D6',
    feedback_indicator_bk: '#7F77F1',
    appearance_text_color: '#000000',
    bg_opacity: '1'
  };
  
  // Merge API theme with defaults to ensure all properties exist
  const theme = { ...themeDefaults, ...hubData?.theme };
  
  console.log('🎨 SmartHub theme.solid_color:', theme.solid_color);
  console.log('🎨 SmartHub hubData?.theme:', hubData?.theme);
  
  console.log('SmartHub - avatar display mode:', hubData?.profile?.avatar_display_option_value_id, 'icon:', hubData?.profile?.profile_icon);
  console.log('SmartHub - SMART HUB avatar data:', JSON.stringify({
    smartHub_icon_id: hubData?.smart_hub?.smartHub_icon_id,
    icon_name: hubData?.smart_hub?.smartHub_icon?.icon_name,
    icon_prefix: hubData?.smart_hub?.smartHub_icon?.icon_prefix,
    avatar_display_mode: hubData?.smart_hub?.avatar_display_option_value_id
  }, null, 2));
  
  return (
    <div 
      className="min-h-screen"
      style={{ 
        backgroundColor: theme.background,
        color: theme.text
      }}
    >
      <MainHeader 
        borderColor={theme.border} 
        backgroundColor={theme.background}
        headerBackgroundColor={theme.header_background}
        headerOverlayColor={theme.header_overlay}
        userButtonColor={theme.user_button_color}
        userButtonHover={theme.user_button_hover}
        iconColor={theme.user_button_icon}
        firstName={hubData.profile.first_name}
        surname={hubData.profile.surname}
        menuColor={theme.menu}
        titleColor={theme.title_menu_color_light}
        borderLineColor={theme.border_line_color_light}
        globalButtonHover={theme.global_button_hover}
        avatarColor={hubData.profile.avatar_color?.color || '#4361EE'}
        textColor={theme.text}
        avatarColorId={hubData.profile.avatar_color?.id || 1}
        onAvatarColorChange={handleAvatarColorChange}
        profileIconId={hubData.profile.profile_icon?.id}
        profileIconName={hubData.profile.profile_icon?.icon_name}
        profileIconPrefix={hubData.profile.profile_icon?.icon_prefix as 'fas' | 'far' | 'fab' | undefined}
        avatarDisplayMode={hubData.profile.avatar_display_option_value_id || 24}
        onProfileIconChange={handleProfileIconChange}
        onClearIcon={handleClearIcon}
        toneButtonBkColor={theme.tone_button_bk_color}
        toneButtonTextColor={theme.tone_button_text_color}
        toneButtonBorderColor={theme.tone_button_border_color}
        feedbackIndicatorBk={theme.feedback_indicator_bk}
        appearanceTextColor={theme.text}
        ithemeButtonBkColor={theme.button_bk_color}
        ithemeButtonTextColor={theme.button_text_color}
        ithemeButtonHoverColor={theme.button_hover_color}
        smartHubName={hubData.smart_hub.name}
        smartHubColor={hubData.smart_hub.hub_color || '#7F77F1'}
        journey={hubData.smart_hub.journey}
        currentSmartHubId={hubData.smart_hub.id}
        smartHubs={hubData.profile.smart_hubs || []}
        currentAppearanceId={hubData.profile.appearance?.id}
        currentIthemeId={hubData.profile.itheme?.id}
        onAppearanceChange={handleAppearanceChange}
        onIthemeChange={handleIthemeChange}
        ithemeBgOpacity={theme.bg_opacity}
        smartHubColorId={hubData.smart_hub.hub_color_id}
        onSmartHubColorChange={handleSmartHubColorChange}
        smartHubIconId={hubData.smart_hub.smartHub_icon_id}
        smartHubIconName={hubData.smart_hub.smartHub_icon?.icon_name}
        smartHubIconPrefix={hubData.smart_hub.smartHub_icon?.icon_prefix as 'fas' | 'far' | 'fab' | undefined}
        smartHubAvatarDisplayMode={hubData.smart_hub.avatar_display_option_value_id || 24}
        onSmartHubIconChange={handleSmartHubIconChange}
        onClearSmartHubIcon={handleClearSmartHubIcon}
        solidColor={theme.solid_color}
        buttonBkColor={theme.button_bk_color}
        buttonTextColor={theme.button_text_color}
        buttonHoverColor={theme.button_hover_color}
        chatBk1={theme.chat_bk_1}
        promptBk={theme.prompt_bk}
        promptTextColor={theme.prompt_text_color}
        aiAcknowledgeTextColor={theme.ai_acknowledge_text_color}
      />
      <Outlet context={{ theme }} />
    </div>
  );
}


