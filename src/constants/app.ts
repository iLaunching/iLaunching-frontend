/**
 * Application Routes
 * All navigation paths in the application
 */
export const ROUTES = {
  LANDING: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  DASHBOARD: '/dashboard',
  IDEAS: '/ideas',
  MARKET_RESEARCH: '/market-research',
  BUSINESS_PLAN: '/business-plan',
  SETTINGS: '/settings',
  PROFILE: '/profile',
} as const;

/**
 * User Conversation Stages
 * Tracks where the user is in the conversational flow
 */
export const USER_STAGES = {
  WELCOME: 'welcome',
  EMAIL_PROMPT: 'email_prompt',
  PASSWORD_PROMPT: 'password_prompt',
  TOUR: 'tour',
  SIGNUP_QUESTIONS: 'signup_questions',
  ONBOARDING: 'onboarding',
} as const;

/**
 * API Endpoints
 * All backend API routes
 */
export const API_ENDPOINTS = {
  // Authentication
  SIGNUP: '/api/auth/signup',
  LOGIN: '/api/auth/login',
  LOGOUT: '/api/auth/logout',
  REFRESH: '/api/auth/refresh',
  CHECK_USER: '/api/auth/check-user',
  
  // User
  ME: '/api/me',
  UPDATE_PROFILE: '/api/profile/update',
  
  // Business Ideas
  CREATE_IDEA: '/api/ideas/create',
  GET_IDEAS: '/api/ideas',
  UPDATE_IDEA: '/api/ideas/update',
  DELETE_IDEA: '/api/ideas/delete',
} as const;

/**
 * User Types/Roles
 */
export const USER_ROLES = {
  FREE: 'free',
  PRO: 'pro',
  ENTERPRISE: 'enterprise',
  ADMIN: 'admin',
} as const;

/**
 * Business Stages
 */
export const BUSINESS_STAGES = {
  IDEA: 'idea',
  RESEARCH: 'research',
  PLANNING: 'planning',
  LAUNCH: 'launch',
  GROWTH: 'growth',
} as const;

// Type exports for TypeScript
export type Route = typeof ROUTES[keyof typeof ROUTES];
export type UserStage = typeof USER_STAGES[keyof typeof USER_STAGES];
export type ApiEndpoint = typeof API_ENDPOINTS[keyof typeof API_ENDPOINTS];
export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];
export type BusinessStage = typeof BUSINESS_STAGES[keyof typeof BUSINESS_STAGES];
