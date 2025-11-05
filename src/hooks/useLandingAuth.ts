/**
 * Custom Hook for Landing Page Conversational Auth Flow
 * Manages state and logic for the step-by-step auth experience
 */

import { useState } from 'react';
import { authApi } from '@/api/auth';
import type { AuthStage, AuthState, User } from '@/types/auth';
import {
  getRandomCheckingEmailMessage,
  getRandomWrongEmailMessage,
  getRandomMessage,
  USER_NOT_REGISTERED_MESSAGES,
} from '@/constants';

export function useLandingAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    stage: 'email_input',
    email: '',
    name: '',
    isProcessing: false,
    error: null,
  });

  const [user, setUser] = useState<User | null>(null);

  /**
   * Reset to initial state
   */
  const reset = () => {
    setAuthState({
      stage: 'email_input',
      email: '',
      name: '',
      isProcessing: false,
      error: null,
    });
    setUser(null);
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
   * Returns the AI message to display
   */
  const handleEmailSubmit = async (email: string): Promise<string> => {
    // Validate format
    if (!isValidEmail(email)) {
      setAuthState(prev => ({ ...prev, error: 'Invalid email format' }));
      return getRandomWrongEmailMessage();
    }

    // Update state to checking
    setAuthState(prev => ({
      ...prev,
      email,
      stage: 'email_checking',
      isProcessing: true,
      error: null,
    }));

    try {
      // Check if email exists
      const result = await authApi.checkEmail(email);

      if (result.exists) {
        // Existing user - move to password input
        setAuthState(prev => ({
          ...prev,
          stage: 'password_input',
          isProcessing: false,
        }));
        return "Welcome back! I found your account. Please enter your password to continue.";
      } else {
        // New user - move to name input
        setAuthState(prev => ({
          ...prev,
          stage: 'name_input',
          isProcessing: false,
        }));
        return getRandomMessage(USER_NOT_REGISTERED_MESSAGES);
      }
    } catch (error: any) {
      console.error('Email check error:', error);
      setAuthState(prev => ({
        ...prev,
        stage: 'email_input',
        isProcessing: false,
        error: error.message || 'Failed to check email',
      }));
      return `Oops! ${error.response?.data?.detail || 'Something went wrong. Please try again.'}`;
    }
  };

  /**
   * Handle name submission (new user)
   */
  const handleNameSubmit = (name: string): string => {
    if (!name.trim()) {
      return "I'll need your name to continue. What should I call you?";
    }

    setAuthState(prev => ({
      ...prev,
      name: name.trim(),
      stage: 'password_create',
    }));

    return `Great to meet you, ${name.trim()}! Now let's secure your account. Please create a password (at least 8 characters).`;
  };

  /**
   * Handle password creation (new user signup)
   */
  const handlePasswordCreate = async (password: string): Promise<string> => {
    if (password.length < 8) {
      return "Your password needs to be at least 8 characters long. Try again?";
    }

    setAuthState(prev => ({
      ...prev,
      stage: 'authenticating',
      isProcessing: true,
    }));

    try {
      const result = await authApi.signup(authState.email, password, authState.name);
      
      setUser(result.user);
      setAuthState(prev => ({
        ...prev,
        stage: 'authenticated',
        isProcessing: false,
      }));

      return `🎉 Welcome to iLaunching, ${result.user.name}! Your account is all set. Let's get started!`;
    } catch (error: any) {
      console.error('Signup error:', error);
      setAuthState(prev => ({
        ...prev,
        stage: 'password_create',
        isProcessing: false,
        error: error.message,
      }));
      return `Oops! ${error.response?.data?.detail || 'Failed to create account. Please try again.'}`;
    }
  };

  /**
   * Handle password submission (existing user login)
   */
  const handlePasswordLogin = async (password: string): Promise<string> => {
    if (!password) {
      return "Please enter your password to continue.";
    }

    setAuthState(prev => ({
      ...prev,
      stage: 'authenticating',
      isProcessing: true,
    }));

    try {
      const result = await authApi.login(authState.email, password);
      
      setUser(result.user);
      setAuthState(prev => ({
        ...prev,
        stage: 'authenticated',
        isProcessing: false,
      }));

      return `Welcome back, ${result.user.name}! Great to see you again. Let's pick up where we left off!`;
    } catch (error: any) {
      console.error('Login error:', error);
      setAuthState(prev => ({
        ...prev,
        stage: 'password_input',
        isProcessing: false,
        error: error.message,
      }));
      return `Hmm, that password doesn't match. Want to try again?`;
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
    user,
    isAuthenticated: authState.stage === 'authenticated',
    handleEmailSubmit,
    handleNameSubmit,
    handlePasswordCreate,
    handlePasswordLogin,
    logout,
    reset,
  };
}
