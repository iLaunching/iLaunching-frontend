import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import MainHeader from '@/components/layout/MainHeader';
import { authSync } from '@/lib/auth-sync';
import api from '@/lib/api';

interface SmartHubData {
  smart_hub: {
    id: string;
    name: string;
    description?: string;
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
    border: string;
    user_button_color: string;
    user_button_hover: string;
  } | null;
  profile: {
    id: string;
    user_id: string;
    first_name: string;
    surname: string;
    timezone: string;
    language: string;
    onboarding_completed: boolean;
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
      return response.data;
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
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

  const theme = hubData.theme || {
    header_overlay: '#00000080',
    header_background: '#7F77F1', // Default to ipurple
    background: '#ffffff',
    text: '#000000',
    menu: '#f3f4f6',
    border: '#e5e7eb',
    user_button_color: '#ffffff59',
    user_button_hover: '#ffffff66'
  };
  
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
        iconColor={theme.header_background}
        firstName={hubData.profile.first_name}
        surname={hubData.profile.surname}
      />
    </div>
  );
}


