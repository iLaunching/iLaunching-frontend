import i18n from './config';

/**
 * Helper function to get a random message from an array
 */
const getRandomMessage = (variations: string[]): string => {
  const randomIndex = Math.floor(Math.random() * variations.length);
  return variations[randomIndex];
};

/**
 * Get a random welcome message in the current language
 */
export const getRandomWelcomeMessage = (): string => {
  const variations = i18n.t('landing:welcome.variations', { returnObjects: true }) as string[];
  return getRandomMessage(variations);
};

/**
 * Get a random welcome back message in the current language
 */
export const getRandomWelcomeBackMessage = (): string => {
  const variations = i18n.t('landing:welcomeBack.variations', { returnObjects: true }) as string[];
  return getRandomMessage(variations);
};

/**
 * Get a random acknowledge message in the current language
 */
export const getRandomAcknowledgeMessage = (): string => {
  const variations = i18n.t('landing:acknowledge.variations', { returnObjects: true }) as string[];
  return getRandomMessage(variations);
};

/**
 * Get a random checking email message in the current language
 * @param email - The email to check
 */
export const getRandomCheckingEmailMessage = (email: string): string => {
  const variations = i18n.t('landing:checking.variations', { returnObjects: true }) as string[];
  const message = getRandomMessage(variations);
  return message.replace('{email}', email);
};

/**
 * Get a random wrong format message in the current language
 */
export const getRandomWrongFormatMessage = (): string => {
  const variations = i18n.t('landing:wrongFormat.variations', { returnObjects: true }) as string[];
  return getRandomMessage(variations);
};

/**
 * Get a random user not registered message in the current language
 */
export const getRandomUserNotRegisteredMessage = (): string => {
  const variations = i18n.t('landing:userNotRegistered.variations', { returnObjects: true }) as string[];
  return getRandomMessage(variations);
};

/**
 * Get a random ask name message in the current language
 */
export const getRandomAskNameMessage = (): string => {
  const variations = i18n.t('landing:askName.variations', { returnObjects: true }) as string[];
  return getRandomMessage(variations);
};

/**
 * Get a random login prompt message in the current language
 */
export const getRandomLoginMessage = (): string => {
  const variations = i18n.t('landing:loginPrompt.variations', { returnObjects: true }) as string[];
  return getRandomMessage(variations);
};

/**
 * Get a random password prompt message in the current language
 */
export const getRandomPasswordPrompt = (): string => {
  const variations = i18n.t('landing:passwordPrompt.variations', { returnObjects: true }) as string[];
  return getRandomMessage(variations);
};

/**
 * Get password create message in the current language
 */
export const getPasswordCreateMessage = (): string => {
  return i18n.t('landing:passwordCreate.message');
};

/**
 * Get password too short message in the current language
 */
export const getPasswordTooShortMessage = (): string => {
  return i18n.t('landing:passwordTooShort.message');
};

/**
 * Get name required message in the current language
 */
export const getNameRequiredMessage = (): string => {
  return i18n.t('landing:nameRequired.message');
};

/**
 * Get error message in the current language
 * @param type - The type of error (generic, emailCheck, loginFailed, signupFailed)
 */
export const getErrorMessage = (type: 'generic' | 'emailCheck' | 'loginFailed' | 'signupFailed' = 'generic'): string => {
  return i18n.t(`landing:errors.${type}`);
};

/**
 * Get email placeholder in the current language
 */
export const getEmailPlaceholder = (): string => {
  return i18n.t('landing:placeholders.email');
};

/**
 * Get name placeholder in the current language
 */
export const getNamePlaceholder = (): string => {
  return i18n.t('landing:placeholders.name');
};

/**
 * Get password create placeholder in the current language
 */
export const getPasswordCreatePlaceholder = (): string => {
  return i18n.t('landing:placeholders.password_create');
};

/**
 * Get password input placeholder in the current language
 */
export const getPasswordInputPlaceholder = (): string => {
  return i18n.t('landing:placeholders.password_input');
};

/**
 * Get "Yes Please" button text in the current language
 */
export const getYesPleaseButtonText = (): string => {
  return i18n.t('landing:buttons.yesPlease');
};

/**
 * Get "Log Me In" button text in the current language
 */
export const getLogMeInButtonText = (): string => {
  return i18n.t('landing:buttons.logMeIn');
};

/**
 * Get "Continue without signing up" button text in the current language
 */
export const getContinueWithoutSignupText = (): string => {
  return i18n.t('landing:buttons.continueWithoutSignup');
};
