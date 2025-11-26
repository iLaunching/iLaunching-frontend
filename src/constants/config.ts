/**
 * Application Configuration
 * Central place for all app-wide settings
 */

export const APP_CONFIG = {
  // Application Info
  name: 'iLaunching',
  description: 'Your AI-Powered Business Companion',
  version: '1.0.0',
  
  // Timing & Animation
  typewriterSpeed: 30, // milliseconds per word
  messageDelay: 800, // delay before AI responds (ms)
  
  // UI Settings
  maxPromptWidth: 800, // max width for chat prompt (px)
  headerHeight: 70, // header height (px)
  
  // Chat Settings
  maxMessageLength: 500,
  placeholders: {
    email: 'Type your email here...',
    password: 'Enter your password...',
    message: 'Type your message...',
  },
  
  // Colors (can override in components)
  colors: {
    primary: '#2563EB',
    secondary: '#6366F1',
    accent: '#9333EA',
    text: '#000000',
    textLight: '#6B7280',
    background: '#FFFFFF',
    overlayLight: 'rgba(59, 130, 246, 0.05)',
  },
  
  // Font Settings
  fonts: {
    primary: 'Inter, system-ui, sans-serif',
    heading: 'Baloo 2, cursive',
    logo: 'Fredoka, sans-serif',
  },
  
  // Feature Flags (enable/disable features)
  features: {
    enableSignup: true,
    enableGoogleAuth: false,
    enableTour: true,
    enableAnalytics: false,
  },
  
  // External Links
  links: {
    support: 'mailto:support@ilaunching.com',
    privacy: '/privacy',
    terms: '/terms',
    twitter: 'https://twitter.com/ilaunching',
    linkedin: 'https://linkedin.com/company/ilaunching',
  },
} as const;

// Export individual sections for convenience
export const { colors, fonts, features, links } = APP_CONFIG;

// Helper to check if feature is enabled
export function isFeatureEnabled(feature: keyof typeof APP_CONFIG.features): boolean {
  return APP_CONFIG.features[feature];
}
