/**
 * Central export for all constants
 * Import from here instead of individual files
 * 
 * Example usage:
 * import { ROUTES, getRandomWelcomeMessage, APP_CONFIG } from '@/constants';
 */

// Messages
export {
  WELCOME_MESSAGES,
  WELCOM_BACK_MESSAGE,
  ACKNOWLEDGE_MESSAGE,
  CHECKING_EMAIL_MESSAGES,
  WRONG_EMAIL_FORMAT,
  USER_NOT_REGISTERED_MESSAGES,
  EMAIL_PROMPTS,
  PASSWORD_PROMPTS,
  TOUR_MESSAGES,
  getRandomMessage,
  getRandomWelcomeMessage,
  getRandomWelcomeBackMessage,
  getRandomAcknowledgeMessage,
  getRandomCheckingEmailMessage,
  getRandomWrongEmailMessage,
  getRandomEmailPrompt,
  getRandomPasswordPrompt,
  getRandomTourMessage,
} from './messages';

// App Constants
export {
  ROUTES,
  USER_STAGES,
  API_ENDPOINTS,
  USER_ROLES,
  BUSINESS_STAGES,
  type Route,
  type UserStage,
  type ApiEndpoint,
  type UserRole,
  type BusinessStage,
} from './app';

// Configuration
export {
  APP_CONFIG,
  colors,
  fonts,
  features,
  links,
  isFeatureEnabled,
} from './config';
