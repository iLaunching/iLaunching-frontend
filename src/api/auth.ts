/**
 * Authentication API Client
 * Handles all authentication-related API calls to the backend
 */

import axios, { type AxiosInstance, type AxiosError } from 'axios';

// Get API base URL from environment or use default
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest: any = error.config;

    // If 401 and we haven't retried yet, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });

          const { access_token } = response.data;
          localStorage.setItem('access_token', access_token);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ============================================
// API Response Types
// ============================================

export interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
  subscription_tier: string;
  email_verified: boolean;
  created_at: string;
  last_login?: string;
}

export interface CheckEmailResponse {
  exists: boolean;
  message: string;
}

export interface CheckEmailSignupResponse {
  action: 'login' | 'signup';
  message: string;
  logged_in: boolean;
  access_token?: string;
  refresh_token?: string;
  user?: User;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface ApiError {
  detail: string | { message: string; errors: string[] };
}

// ============================================
// Authentication API Functions
// ============================================

export const authApi = {
  /**
   * Check if an email exists in the database
   */
  async checkEmail(email: string): Promise<CheckEmailResponse> {
    try {
      const response = await apiClient.post('/auth/check-email', { email });
      return response.data;
    } catch (error) {
      console.error('Email check failed:', error);
      throw error;
    }
  },

  /**
   * Check email during signup flow - logs in if user exists with matching password,
   * or returns action to proceed with signup if new user
   */
  async checkEmailSignup(email: string, password: string): Promise<CheckEmailSignupResponse> {
    try {
      const response = await apiClient.post('/auth/check-email-signup', { email, password });
      const data: CheckEmailSignupResponse = response.data;
      
      // If logged in, store tokens
      if (data.logged_in && data.access_token && data.refresh_token && data.user) {
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      
      return data;
    } catch (error) {
      console.error('Email signup check failed:', error);
      throw error;
    }
  },

  /**
   * Sign up a new user
   */
  async signup(email: string, password: string, name?: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.post('/auth/signup', {
        email,
        password,
        name,
      });
      
      const data: AuthResponse = response.data;
      
      // Store tokens and user in localStorage
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      return data;
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    }
  },

  /**
   * Login existing user
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.post('/auth/login', {
        email,
        password,
      });
      
      const data: AuthResponse = response.data;
      
      // Store tokens and user in localStorage
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      return data;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<{ access_token: string }> {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await apiClient.post('/auth/refresh', {
        refresh_token: refreshToken,
      });
      
      const { access_token } = response.data;
      localStorage.setItem('access_token', access_token);
      
      return { access_token };
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Clear tokens on refresh failure
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      throw error;
    }
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await apiClient.post('/auth/logout', {
          refresh_token: refreshToken,
        });
      }
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      // Always clear local storage
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  },

  /**
   * Get current user info
   */
  async getMe(): Promise<{ user: User }> {
    try {
      const response = await apiClient.get('/auth/me');
      return response.data;
    } catch (error) {
      console.error('Get current user failed:', error);
      throw error;
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem('access_token');
    return !!token;
  },

  /**
   * Get current user from localStorage
   */
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr) as User;
      } catch {
        return null;
      }
    }
    return null;
  },

  /**
   * Handle OAuth callback - extract tokens from URL and store them
   * Call this on your callback/redirect page after OAuth flow
   */
  handleOAuthCallback(): { success: boolean; action?: string; error?: string } {
    const params = new URLSearchParams(window.location.search);
    
    // Check for errors
    const error = params.get('auth_error');
    if (error) {
      return { success: false, error };
    }
    
    // Check for successful authentication
    const authSuccess = params.get('auth_success');
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    const action = params.get('action');
    
    if (authSuccess === 'true' && accessToken && refreshToken) {
      // Store tokens
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
      
      // Clean up URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
      
      return { success: true, action: action || 'login' };
    }
    
    return { success: false };
  },

  /**
   * Check OAuth provider status
   */
  async getOAuthStatus(): Promise<{ google_enabled: boolean; facebook_enabled: boolean; microsoft_enabled: boolean }> {
    try {
      const response = await apiClient.get('/auth/oauth/status');
      return response.data;
    } catch (error) {
      console.error('Failed to get OAuth status:', error);
      return { google_enabled: false, facebook_enabled: false, microsoft_enabled: false };
    }
  },

  /**
   * Send verification code to email
   */
  async sendVerificationCode(email: string): Promise<{ success: boolean; message: string; expires_in_minutes: number }> {
    try {
      const response = await apiClient.post('/auth/send-verification-code', { email });
      return response.data;
    } catch (error) {
      console.error('Failed to send verification code:', error);
      throw error;
    }
  },

  /**
   * Verify email code
   */
  async verifyCode(email: string, code: string): Promise<{ verified: boolean; message: string }> {
    try {
      const response = await apiClient.post('/auth/verify-code', { email, code });
      return response.data;
    } catch (error) {
      console.error('Failed to verify code:', error);
      throw error;
    }
  },
};

export default apiClient;
