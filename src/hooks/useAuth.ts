import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import type { LoginRequest, SignupRequest } from '@/types';

// ========================
// USEAUTH HOOK
// React Query mutations for authentication
// ========================

export const useAuth = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setAuth, logout: clearAuth, refreshToken } = useAuthStore();

  // Signup mutation
  const signupMutation = useMutation({
    mutationFn: (data: SignupRequest) => authApi.signup(data),
    onSuccess: (data) => {
      setAuth(data.user, data.access_token, data.refresh_token);
      queryClient.invalidateQueries({ queryKey: ['user'] });
      
      // Check if onboarding is needed
      if (data.user.onboarding_completed === false) {
        navigate('/onboarding');
      } else {
        navigate('/smart-hub');
      }
    },
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (data) => {
      setAuth(data.user, data.access_token, data.refresh_token);
      queryClient.invalidateQueries({ queryKey: ['user'] });
      
      // Check if onboarding is needed
      if (data.user.onboarding_completed === false) {
        navigate('/onboarding');
      } else {
        navigate('/smart-hub');
      }
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: () => {
      if (!refreshToken) {
        throw new Error('No refresh token found');
      }
      return authApi.logout({ refresh_token: refreshToken });
    },
    onSuccess: () => {
      clearAuth();
      queryClient.clear();
      navigate('/login');
    },
    onError: () => {
      // Even if logout fails on backend, clear local state
      clearAuth();
      queryClient.clear();
      navigate('/login');
    },
  });

  return {
    signup: signupMutation.mutate,
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    isSignupLoading: signupMutation.isPending,
    isLoginLoading: loginMutation.isPending,
    isLogoutLoading: logoutMutation.isPending,
    signupError: signupMutation.error,
    loginError: loginMutation.error,
  };
};
