/**
 * Custom Hook for Landing Page Conversational Auth Flow
 * Manages state and logic for the step-by-step auth experience
 */

import { useState } from 'react';
import { authApi } from '@/api/auth';
import type { AuthState } from '@/types/auth';
import {
  getRandomWrongEmailMessage,
  getRandomCheckingEmailMessage,
  getRandomMessage,
  getRandomPasswordPrompt,
  getRandomLoginMessage,
  getRandomAskNameMessage,
  USER_NOT_REGISTERED_MESSAGES,
} from '../constants';

export function useLandingAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    stage: 'email_input',
    email: '',
    name: '',
    message: '',
    user: null,
    isProcessing: false,
    error: null,
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
        message: getRandomWrongEmailMessage(),
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

      if (result.exists) {
        // Existing user - move to password input
        setAuthState((prev: AuthState) => ({
          ...prev,
          stage: 'password_input',
          message: getRandomPasswordPrompt(),
          isProcessing: false,
        }));
      } else {
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
            message: getRandomMessage(USER_NOT_REGISTERED_MESSAGES),
          }));
        }, 800); // 800ms delay for natural conversational flow
      }
    } catch (error: any) {
      console.error('Email check error:', error);
      setAuthState((prev: AuthState) => ({
        ...prev,
        stage: 'email_input',
        message: `Oops! ${error.response?.data?.detail || 'Something went wrong. Please try again.'}`,
        isProcessing: false,
        error: error.message || 'Failed to check email',
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
   * Handle name submission (new user)
   */
  const handleNameSubmit = (name: string): void => {
    if (!name.trim()) {
      setAuthState((prev: AuthState) => ({
        ...prev,
        message: "I'll need your name to continue. What should I call you?",
      }));
      return;
    }

    setAuthState((prev: AuthState) => ({
      ...prev,
      name: name.trim(),
      stage: 'password_create',
      message: `Great to meet you, ${name.trim()}! Now let's secure your account. Please create a password (at least 8 characters).`,
    }));
  };

  /**
   * Handle password creation (new user signup)
   */
  const handlePasswordCreate = async (password: string): Promise<void> => {
    if (password.length < 8) {
      setAuthState((prev: AuthState) => ({
        ...prev,
        message: "Your password needs to be at least 8 characters long. Try again?",
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
      const result = await authApi.signup(authState.email, password, authState.name);
      
      setAuthState((prev: AuthState) => ({
        ...prev,
        stage: 'authenticated',
        user: result.user,
        message: `🎉 Welcome to iLaunching, ${result.user.name}! Your account is all set. Let's get started!`,
        isProcessing: false,
        error: null,
      }));
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
    } catch (error: any) {
      console.error('Login error:', error);
      setAuthState((prev: AuthState) => ({
        ...prev,
        stage: 'password_input',
        message: `Hmm, that password doesn't match. Want to try again?`,
        isProcessing: false,
        error: error.message,
      }));
    }
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
    logout,
    reset,
  };
}
