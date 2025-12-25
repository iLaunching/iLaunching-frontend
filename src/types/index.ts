// ========================
// USER & AUTHENTICATION TYPES
// ========================

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  subscription_tier: string;
  membership?: string; // Individual or Enterprise
  use_password?: boolean; // True for password auth, False for OAuth-only
  oauth_provider?: string | null; // e.g., 'google', 'facebook', 'microsoft'
  email_verified: boolean;
  created_at: string;
  last_login?: string;
  updated_at?: string;
  onboarding_completed?: boolean;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  access_token: string;
}

export interface LogoutRequest {
  refresh_token: string;
}

export interface LogoutResponse {
  message: string;
}

// ========================
// API ERROR TYPES
// ========================

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

// ========================
// FORM VALIDATION TYPES
// ========================

export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

// ========================
// AUTH STORE TYPES
// ========================

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setAccessToken: (token: string) => void;
  logout: () => void;
}
