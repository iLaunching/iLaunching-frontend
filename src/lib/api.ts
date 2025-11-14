import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { 
  AuthResponse, 
  LoginRequest, 
  SignupRequest, 
  RefreshTokenRequest,
  RefreshTokenResponse,
  LogoutRequest,
  LogoutResponse
} from '@/types';

// ========================
// AXIOS INSTANCE
// ========================

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// ========================
// REQUEST INTERCEPTOR
// Add JWT token to all requests
// ========================

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Only add auth headers for our API endpoints
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const isApiRequest = config.baseURL === apiBaseUrl || config.url?.startsWith('/api/');
    
    if (isApiRequest) {
      // Get token from localStorage (Zustand persist middleware stores it there)
      const authState = localStorage.getItem('auth-storage');
      
      if (authState) {
        try {
          const { state } = JSON.parse(authState);
          const token = state?.accessToken;
          
          if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (error) {
          console.error('Error parsing auth state:', error);
        }
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ========================
// RESPONSE INTERCEPTOR
// Handle 401 errors with token refresh
// ========================

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If error is not 401 or request already retried, reject immediately
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // If already refreshing, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return api(originalRequest);
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    // Try to refresh the token
    try {
      const authState = localStorage.getItem('auth-storage');
      
      if (!authState) {
        throw new Error('No auth state found');
      }

      const { state } = JSON.parse(authState);
      const refreshToken = state?.refreshToken;

      if (!refreshToken) {
        throw new Error('No refresh token found');
      }

      // Call refresh endpoint
      const response = await axios.post<RefreshTokenResponse>(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/auth/refresh`,
        { refresh_token: refreshToken }
      );

      const newAccessToken = response.data.access_token;

      // Update token in localStorage
      const updatedState = {
        ...JSON.parse(authState),
        state: {
          ...state,
          accessToken: newAccessToken,
        },
      };
      localStorage.setItem('auth-storage', JSON.stringify(updatedState));

      // Update authorization header
      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      }

      processQueue(null, newAccessToken);
      isRefreshing = false;

      // Retry original request
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError as AxiosError, null);
      isRefreshing = false;

      // Clear auth state and redirect to login
      localStorage.removeItem('auth-storage');
      window.location.href = '/login';

      return Promise.reject(refreshError);
    }
  }
);

// ========================
// API FUNCTIONS
// ========================

export const authApi = {
  signup: async (data: SignupRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/signup', data);
    return response.data;
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  refresh: async (data: RefreshTokenRequest): Promise<RefreshTokenResponse> => {
    const response = await api.post<RefreshTokenResponse>('/auth/refresh', data);
    return response.data;
  },

  logout: async (data: LogoutRequest): Promise<LogoutResponse> => {
    const response = await api.post<LogoutResponse>('/auth/logout', data);
    return response.data;
  },
};

export default api;
