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
import { authSync } from './auth-sync';

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

// Auth API client (for authentication endpoints)
const authApiClient = axios.create({
  baseURL: import.meta.env.VITE_AUTH_API_URL || import.meta.env.VITE_API_URL || 'http://localhost:8000',
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
    // Only add auth headers for our API endpoints
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    // Helper to remove trailing slash for comparison
    const cleanUrl = (url?: string) => url?.replace(/\/$/, '');

    const isApiRequest =
      cleanUrl(config.baseURL) === cleanUrl(apiBaseUrl) ||
      config.url?.startsWith('/api/') ||
      // Also include our known service modules
      config.url?.startsWith('/node/') ||
      config.url?.startsWith('/connection/') ||
      config.url?.startsWith('/context/') ||
      config.url?.startsWith('/manifest/') ||
      config.url?.startsWith('/templates/');

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

    // Handle 403 errors (account deleted/forbidden)
    if (error.response?.status === 403) {
      // Open Essential Information page in new tab to show deletion notice
      window.open('/essential-information#delete-membership', '_blank');

      // Clear auth state
      localStorage.removeItem('auth-storage');

      // Broadcast logout to all tabs
      authSync.broadcast({ type: 'LOGOUT' });

      // Redirect current tab to login
      window.location.href = '/login';

      return Promise.reject(error);
    }

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
      const response = await authApiClient.post<RefreshTokenResponse>(
        '/auth/refresh',
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

      // Broadcast token refresh to all tabs
      authSync.broadcast({ type: 'TOKEN_REFRESH', token: newAccessToken });

      processQueue(null, newAccessToken);
      isRefreshing = false;

      // Retry original request
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError as AxiosError, null);
      isRefreshing = false;

      // Clear auth state and redirect to login
      localStorage.removeItem('auth-storage');

      // Broadcast logout to all tabs
      authSync.broadcast({ type: 'LOGOUT' });

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
    const response = await authApiClient.post<AuthResponse>('/auth/signup', data);
    return response.data;
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await authApiClient.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  refresh: async (data: RefreshTokenRequest): Promise<RefreshTokenResponse> => {
    const response = await authApiClient.post<RefreshTokenResponse>('/auth/refresh', data);
    return response.data;
  },

  logout: async (data: LogoutRequest): Promise<LogoutResponse> => {
    const response = await authApiClient.post<LogoutResponse>('/auth/logout', data);
    return response.data;
  },

  /**
   * Send verification code for account deletion
   */
  sendDeletionCode: async (): Promise<{ success: boolean; message: string; expires_in_minutes: number }> => {
    const response = await api.post('/account/send-deletion-code');
    return response.data;
  },

  /**
   * Verify deletion code
   */
  verifyDeletionCode: async (code: string): Promise<{ verified: boolean; message: string }> => {
    const response = await api.post('/account/verify-deletion-code', { code });
    return response.data;
  },

  /**
   * Delete account
   */
  deleteAccount: async (): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete('/account/delete');
    return response.data;
  },
};

// ========================
// PROTOCOL API
// ========================

export const protocolApi = {
  /**
   * Get all matrix protocols
   */
  getProtocols: async (): Promise<{
    protocols: Array<{
      protocol_id: string;
      protocol_key: string;
      initial_instructions: string;
      context_framework: any;
      success_criteria: any;
      is_active: boolean;
      background_color?: string;
      border_color?: string;
      display_name?: string;
      display_description?: string;
      created_at: string;
      updated_at: string;
    }>;
    total: number;
  }> => {
    const response = await api.get('/protocols');
    return response.data;
  },

  /**
   * Get protocol by ID
   */
  getProtocolById: async (protocolId: string) => {
    const response = await api.get(`/protocols/${protocolId}`);
    return response.data;
  },

  /**
   * Get protocol by key (GENESIS, CAMPAIGN, VALIDATION)
   */
  getProtocolByKey: async (protocolKey: string) => {
    const response = await api.get(`/protocols/key/${protocolKey}`);
    return response.data;
  },

  getCategories: async (): Promise<Array<{
    id: number;
    name: string;
    description?: string;
    color?: string;
    icon_name?: string;
    icon_prefix?: string;
    sort_order: number;
    is_active: boolean;
  }>> => {
    const response = await api.get('/protocols/categories');
    return response.data;
  },
};

// ========================
// NODE API
// ========================

export const nodeApi = {
  /**
   * Update a node's protocol (which updates its context)
   */
  updateProtocol: async (nodeId: string, protocolId: string, protocolKey: string) => {
    const response = await api.patch(`/node/${nodeId}/protocol`, {
      protocol_id: protocolId,
      context_type: protocolKey
    });
    return response.data;
  },

  /**
   * Get chat history for a node (pre-fetch)
   */
  getChatHistory: async (nodeId: string) => {
    // Note: This endpoint needs to be implemented on the backend in the next step
    // For now, we'll just check if it exists or return empty
    // The prefetch hook handles errors gracefully
    const response = await api.get(`/chat/node/${nodeId}`);
    return response.data;
  },

  /**
   * Save chat history for a node (persistence)
   */
  saveChatHistory: async (nodeId: string, content: any) => {
    const response = await api.post(`/chat/node/${nodeId}/save`, {
      document_json: content
    });
    return response.data;
  },
};

// ========================
// CONTEXT API
// ========================

export const contextApi = {
  /**
   * Update a context by ID
   */
  updateContext: async (contextId: string, data: {
    context_name?: string;
    context_type?: string;
    current_protocol_id?: string;
    local_variables?: any;
    is_active?: boolean;
    master_dna_payload?: any;
    setup?: boolean;
  }) => {
    const response = await api.patch(`/context/${contextId}`, data);
    return response.data;
  },

  /**
   * Toggle the setup flag on a context.
   * When setup=true → panel shows SetupContext (locked/protocol mode).
   * When setup=false → panel shows normal node-specific context.
   */
  updateContextSetup: async (contextId: string, setup: boolean) => {
    const response = await api.patch(`/context/${contextId}`, { setup });
    return response.data;
  },
};


export default api;
