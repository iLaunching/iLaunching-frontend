/**
 * Authentication Types and Interfaces
 */

export type AuthStage = 
  | 'email_input'           // Initial state - asking for email
  | 'email_checking'        // Validating and checking email
  | 'new_user'              // New user - showing signup/login options
  | 'password_input'        // Existing user - asking for password
  | 'name_input'            // New user - asking for name
  | 'introduction'          // New user - showing personalized introduction
  | 'password_create'       // New user - creating password
  | 'authenticating'        // Processing login/signup
  | 'authenticated';        // Successfully logged in

export interface AuthState {
  stage: AuthStage;
  email: string;
  name: string;
  message: string;
  user: User | null;
  isProcessing: boolean;
  error: string | null;
}

export interface User {
  email: string;
  name: string;
  created_at?: string;
}

export interface AuthResponse {
  user: User;
  message: string;
  access_token?: string;
  refresh_token?: string;
}
