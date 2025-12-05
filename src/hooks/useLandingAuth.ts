/**
 * Custom Hook for Landing Page Conversational Auth Flow
 * Manages state and logic for the step-by-step auth experience
 */

import { useState } from 'react';
import { authApi } from '@/api/auth';
import type { AuthState } from '@/types/auth';
import {
  getRandomCheckingEmailMessage,
  getRandomWrongFormatMessage,
  getRandomUserNotRegisteredMessage,
  getRandomAskNameMessage,
  getRandomLoginMessage,
  getRandomPasswordPrompt,
  getPasswordCreateMessage,
  getPasswordTooShortMessage,
  getNameRequiredMessage,
  getErrorMessage,
} from '@/i18n/landingHelpers';

export function useLandingAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    stage: 'email_input',
    email: '',
    name: '',
    message: '',
    user: null,
    isProcessing: false,
    error: null,
    oauth_provider: null,
  });

  /**
   * Reset to initial state
   */
  const reset = () => {
    setAuthState({
      stage: 'email_input',
      email: '',
      name: '',
      message: '',
      user: null,
      isProcessing: false,
      error: null,
      oauth_provider: null,
    });
  };

  /**
   * Validate email format
   */
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  /**
   * Handle email submission
   */
  const handleEmailSubmit = async (email: string): Promise<void> => {
    // Validate format
    if (!isValidEmail(email)) {
      setAuthState((prev: AuthState) => ({ 
        ...prev, 
          message: getRandomWrongFormatMessage(),
        error: null,
      }));
      return;
    }

    // Update state to checking with random checking message
    setAuthState((prev: AuthState) => ({
      ...prev,
      email,
      stage: 'email_checking',
      message: getRandomCheckingEmailMessage(email),
      isProcessing: true,
      error: null,
    }));

    try {
      // Wait for checking message to type out (add minimum delay for UX)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Check if email exists
      const result = await authApi.checkEmail(email);
      
      // Debug logging - detailed response inspection
      console.log('📧 Email check result:', {
        exists: result.exists,
        oauth_provider: result.oauth_provider,
        oauth_provider_type: typeof result.oauth_provider,
        has_oauth: !!result.oauth_provider,
        message: result.message,
        full_response: result
      });

      // CHECKPOINT 1: Does the email exist?
      if (!result.exists) {
        // New user - clear message and change stage to show button container
        setAuthState((prev: AuthState) => ({
          ...prev,
          stage: 'new_user',
          message: '', // Clear message first
          isProcessing: false,
        }));
        
        // Add conversational delay before typing the "not registered" message
        setTimeout(() => {
          setAuthState((prev: AuthState) => ({
            ...prev,
            message: getRandomUserNotRegisteredMessage(),
          }));
        }, 800); // 800ms delay for natural conversational flow
        return;
      }

      // CHECKPOINT 2: Is this an OAuth user (external auth)?
      // Check for any truthy value in oauth_provider (not null, undefined, or empty string)
      const hasOAuthProvider = result.oauth_provider && 
                               typeof result.oauth_provider === 'string' && 
                               result.oauth_provider.trim() !== '';
      
      if (hasOAuthProvider) {
        console.log('🔒 OAuth user detected, showing account picker. Provider:', result.oauth_provider);
        // OAuth user - show account picker instead of password input
        setAuthState((prev: AuthState) => ({
          ...prev,
          stage: 'oauth_login',
          message: result.message,  // Backend message explains OAuth requirement
          isProcessing: false,
          error: null,
          oauth_provider: result.oauth_provider || null,
        }));
        return;
      }

      console.log('✅ Password user, proceeding to password input');
      // Email exists AND has password (not OAuth) - proceed to password input
      setAuthState((prev: AuthState) => ({
        ...prev,
        stage: 'password_input',
        message: getRandomPasswordPrompt(),
        isProcessing: false,
      }));

    } catch (error: any) {
      console.error('Email check error:', error);
      setAuthState((prev: AuthState) => ({
        ...prev,
        stage: 'email_input',
        message: `${getErrorMessage('generic')} ${error.response?.data?.detail || ''}`,
        isProcessing: false,
        error: error.message || getErrorMessage('emailCheck'),
      }));
    }
  };



  /**
   * Handle "Yes Please" button - start signup flow with name
   */
  const handleSignupChoice = (): void => {
    // Clear message first, then set stage to name_input
    setAuthState((prev: AuthState) => ({
      ...prev,
      stage: 'name_input',
      message: '', // Clear message first
    }));
    
    // Add delay before showing the ask name message
    setTimeout(() => {
      setAuthState((prev: AuthState) => ({
        ...prev,
        message: getRandomAskNameMessage(),
      }));
    }, 500); // 500ms delay before showing name prompt message
  };

  /**
   * Handle "Log Me In" button - reset to email input with login message
   */
  const handleLoginChoice = (): void => {
    setAuthState((prev: AuthState) => ({
      ...prev,
      stage: 'email_input',
      email: '', // Clear the email so they can enter it again
      message: getRandomLoginMessage(),
    }));
  };

  /**
   * Handle name submission (new user) - Store name and go to sales stage
   */
  const handleNameSubmit = (name: string): void => {
    // Handle continue action after name (go to password creation)
    if (name === 'continue-to-password') {
      setAuthState((prev: AuthState) => ({
        ...prev,
        stage: 'password_create',
        message: getPasswordCreateMessage(),
      }));
      return;
    }

    if (!name.trim()) {
      setAuthState((prev: AuthState) => ({
        ...prev,
        message: getNameRequiredMessage(),
      }));
      return;
    }

    // Store name and move to sales stage (streaming chat with signup button)
    setAuthState((prev: AuthState) => ({
      ...prev,
      name: name.trim(),
      stage: 'sales',
      message: '',
      isProcessing: false,
      error: null,
    }));
  };

  /**
   * Handle password creation (new user signup)
   */
  const handlePasswordCreate = async (password: string): Promise<void> => {
    if (password.length < 8) {
      setAuthState((prev: AuthState) => ({
        ...prev,
        message: getPasswordTooShortMessage(),
      }));
      return;
    }

    setAuthState((prev: AuthState) => ({
      ...prev,
      stage: 'authenticating',
      message: "Creating your account...",
      isProcessing: true,
    }));

    try {
      // Split name into first and last name
      const nameParts = authState.name.trim().split(/\s+/);
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const result = await authApi.signup(authState.email, password, firstName, lastName, 'personal');
      
      setAuthState((prev: AuthState) => ({
        ...prev,
        stage: 'authenticated',
        user: result.user,
        message: `🎉 Welcome to iLaunching, ${result.user.name}! Your account is all set. Let's get started!`,
        isProcessing: false,
        error: null,
      }));

      // Check if onboarding is needed and redirect
      if (result.user.onboarding_completed === false) {
        window.location.href = '/onboarding';
      } else {
        // Redirect to smart hub
        window.location.href = '/smart-hub';
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      setAuthState((prev: AuthState) => ({
        ...prev,
        stage: 'password_create',
        message: `Oops! ${error.response?.data?.detail || 'Failed to create account. Please try again.'}`,
        isProcessing: false,
        error: error.message,
      }));
    }
  };

  /**
   * Handle password submission (existing user login)
   */
  const handlePasswordLogin = async (password: string): Promise<void> => {
    if (!password) {
      setAuthState((prev: AuthState) => ({
        ...prev,
        message: "Please enter your password to continue.",
      }));
      return;
    }

    setAuthState((prev: AuthState) => ({
      ...prev,
      stage: 'authenticating',
      message: "Logging you in...",
      isProcessing: true,
    }));

    try {
      const result = await authApi.login(authState.email, password);
      
      setAuthState((prev: AuthState) => ({
        ...prev,
        stage: 'authenticated',
        user: result.user,
        message: `Welcome back, ${result.user.name}! Great to see you again. Let's pick up where we left off!`,
        isProcessing: false,
        error: null,
      }));

      // Check if onboarding is needed and redirect
      if (result.user.onboarding_completed === false) {
        window.location.href = '/onboarding';
      } else {
        // Redirect to smart hub
        window.location.href = '/smart-hub';
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Check if this is an OAuth user trying to login with password
      if (error.response?.status === 400 && error.response?.data?.detail?.includes('OAuth')) {
        // OAuth user - show specific message and return to email input
        setAuthState((prev: AuthState) => ({
          ...prev,
          stage: 'email_input',
          message: error.response.data.detail,
          isProcessing: false,
          error: null,
        }));
      } else {
        // Regular password error
        setAuthState((prev: AuthState) => ({
          ...prev,
          stage: 'password_input',
          message: `Hmm, that password doesn't match. Want to try again?`,
          isProcessing: false,
          error: error.message,
        }));
      }
    }
  };

  /**
   * Skip email verification and go directly to name input (demo mode)
   * @param customMessage - Optional custom message to display instead of default
   */
  const skipToNameInput = (customMessage?: string): void => {
    setAuthState((prev: AuthState) => ({
      ...prev,
      email: 'demo@ilaunching.app',
      stage: 'name_input',
      message: customMessage || getRandomAskNameMessage(),
      isProcessing: false,
      error: null,
    }));
  };

  /**
   * Transition to sales consultation mode
   */
  const enterSalesMode = () => {
    setAuthState(prev => ({
      ...prev,
      stage: 'sales',
      message: '',
      isProcessing: false,
      error: null,
    }));
  };

  /**
   * Show Google Account Picker - check localStorage for saved accounts
   */
  const showGoogleAccountPicker = () => {
    setAuthState((prev: AuthState) => ({
      ...prev,
      stage: 'oauth_login',
      oauth_provider: 'google',
      message: 'Welcome back! Select your Google account to continue.',
      isProcessing: false,
      error: null,
    }));
  };

  /**
   * Show Facebook Account Picker - check localStorage for saved accounts
   */
  const showFacebookAccountPicker = () => {
    setAuthState((prev: AuthState) => ({
      ...prev,
      stage: 'oauth_login',
      oauth_provider: 'facebook',
      message: 'Welcome back! Select your Facebook account to continue.',
      isProcessing: false,
      error: null,
    }));
  };

  /**
   * Logout user
   */
  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    reset();
  };

  return {
    authState,
    isAuthenticated: authState.stage === 'authenticated',
    handleEmailSubmit,
    handleSignupChoice,
    handleLoginChoice,
    handleNameSubmit,
    handlePasswordCreate,
    handlePasswordLogin,
    skipToNameInput,
    enterSalesMode,
    showGoogleAccountPicker,
    showFacebookAccountPicker,
    logout,
    reset,
  };
}
