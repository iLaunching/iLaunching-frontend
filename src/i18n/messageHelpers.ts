import i18n from '@/i18n/config';

/**
 * Helper function to get random message from i18n translations
 */
export const getRandomMessage = (variations: readonly string[] | string[]): string => {
  if (!Array.isArray(variations) || variations.length === 0) {
    return '';
  }
  const randomIndex = Math.floor(Math.random() * variations.length);
  return variations[randomIndex];
};

/**
 * Get random email signup message
 */
export const getRandomEmailSignupMessage = (): string => {
  const variations = i18n.t('messages:emailSignup.variations', { returnObjects: true }) as string[];
  return getRandomMessage(variations);
};

/**
 * Get random Google signup message
 */
export const getRandomGoogleSignupMessage = (): string => {
  const variations = i18n.t('messages:googleSignup.variations', { returnObjects: true }) as string[];
  return getRandomMessage(variations);
};

/**
 * Get random Facebook signup message
 */
export const getRandomFacebookSignupMessage = (): string => {
  const variations = i18n.t('messages:facebookSignup.variations', { returnObjects: true }) as string[];
  return getRandomMessage(variations);
};

/**
 * Get random Microsoft signup message
 */
export const getRandomMicrosoftSignupMessage = (): string => {
  const variations = i18n.t('messages:microsoftSignup.variations', { returnObjects: true }) as string[];
  return getRandomMessage(variations);
};
