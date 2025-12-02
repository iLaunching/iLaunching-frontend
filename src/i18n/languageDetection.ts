/**
 * Language Detection Utilities
 * Detects user's preferred language based on:
 * 1. Manual selection (stored in localStorage)
 * 2. Geographic location (via IP geolocation)
 * 3. Browser/system language settings
 */

// Language to country/region mapping for geographic detection
export const COUNTRY_TO_LANGUAGE: Record<string, string> = {
  // English-speaking countries
  US: 'en', GB: 'en-GB', AU: 'en-AU', NZ: 'en-AU', IE: 'en-GB',
  ZA: 'af-ZA',
  
  // Spanish-speaking countries
  ES: 'es-ES', MX: 'es-MX', AR: 'es-AR', CO: 'es-CO', CL: 'es-419',
  PE: 'es-419', VE: 'es-419', EC: 'es-419', GT: 'es-419', CU: 'es-419',
  BO: 'es-419', DO: 'es-419', HN: 'es-419', PY: 'es-419', SV: 'es-419',
  NI: 'es-419', CR: 'es-419', PA: 'es-419', UY: 'es-419',
  
  // French/multilingual countries (CA=French Canada, CH=German, BE=French Belgium)
  FR: 'fr-FR', CA: 'fr-CA', BE: 'fr-BE', CH: 'de-DE', LU: 'fr-FR',
  MC: 'fr-FR', SN: 'ff-SN', CI: 'fr-FR', CM: 'fr-FR', MG: 'mg-MG',
  
  // Portuguese-speaking countries
  BR: 'pt-BR', PT: 'pt-PT', AO: 'pt-PT', MZ: 'pt-PT',
  
  // German-speaking countries
  DE: 'de-DE', AT: 'de-DE',
  
  // Arabic-speaking countries
  SA: 'ar-SA', AE: 'ar-AE', EG: 'ar-EG', IQ: 'ar', JO: 'ar',
  KW: 'ar-SA', LB: 'ar', LY: 'ar', MA: 'ar', OM: 'ar-SA',
  QA: 'ar-SA', SY: 'ar', TN: 'ar', YE: 'ar', BH: 'ar-SA',
  
  // Asian languages (PH=Tagalog, IN=Hindi)
  CN: 'zh-CN', TW: 'zh-TW', HK: 'zh-HK', JP: 'ja-JP', KR: 'ko-KR',
  TH: 'th-TH', VN: 'vi-VN', ID: 'id-ID', MY: 'ms-MY', PH: 'tl-PH',
  SG: 'zh-CN', KH: 'km-KH', MM: 'my-MM', LA: 'th-TH',
  
  // Indian subcontinent
  IN: 'hi-IN', PK: 'ur-PK', BD: 'bn-BD', NP: 'ne-NP', LK: 'si-LK',
  
  // European languages
  IT: 'it-IT', NL: 'nl-NL', PL: 'pl-PL', SE: 'sv-SE', NO: 'nb-NO',
  DK: 'da-DK', FI: 'fi-FI', RU: 'ru-RU', UA: 'uk-UA', CZ: 'cs-CZ',
  RO: 'ro-RO', GR: 'el-GR', BG: 'bg-BG', HR: 'hr-HR', RS: 'sr-RS',
  HU: 'hu-HU', SK: 'sk-SK', SI: 'sl-SI', LT: 'lt-LT', LV: 'lv-LV',
  EE: 'et-EE', MK: 'mk-MK', AL: 'sq-AL', TR: 'tr-TR',
  
  // Middle Eastern
  IL: 'he-IL', IR: 'fa-IR', AM: 'hy-AM', AZ: 'az-AZ', GE: 'ka-GE',
  KZ: 'kk-KZ', UZ: 'uz-UZ', KG: 'ky-KG',
  
  // African languages
  NG: 'ha-NG', ET: 'om-ET', KE: 'sw-KE', ZW: 'sn-ZW', SO: 'so-SO',
};

/**
 * Detect language based on geographic location using IP geolocation
 */
export async function detectLanguageByGeolocation(): Promise<string | null> {
  try {
    // Try multiple geolocation services for reliability
    const services = [
      'https://ipapi.co/json/',
      'https://ip-api.com/json/',
      'https://geolocation-db.com/json/',
    ];

    for (const service of services) {
      try {
        const response = await fetch(service, {
          headers: { 'Accept': 'application/json' },
        });
        
        if (!response.ok) continue;
        
        const data = await response.json();
        const countryCode = data.country_code || data.countryCode || data.country;
        
        if (countryCode && COUNTRY_TO_LANGUAGE[countryCode]) {
          console.log(`🌍 Detected location: ${countryCode}, Language: ${COUNTRY_TO_LANGUAGE[countryCode]}`);
          return COUNTRY_TO_LANGUAGE[countryCode];
        }
      } catch (err) {
        // Try next service
        continue;
      }
    }
    
    return null;
  } catch (error) {
    console.warn('Geolocation detection failed:', error);
    return null;
  }
}

/**
 * Detect language from browser/system settings
 */
export function detectLanguageFromBrowser(): string | null {
  try {
    // Get browser languages in order of preference
    const browserLanguages = navigator.languages || [navigator.language];
    
    for (const lang of browserLanguages) {
      // Normalize language code (e.g., "en-US" -> "en")
      const normalizedLang = lang.toLowerCase();
      
      // Try exact match first (e.g., "en-US")
      if (isSupportedLanguage(normalizedLang)) {
        console.log(`🌐 Browser language detected: ${normalizedLang}`);
        return normalizedLang;
      }
      
      // Try base language (e.g., "en")
      const baseLang = normalizedLang.split('-')[0];
      if (isSupportedLanguage(baseLang)) {
        console.log(`🌐 Browser base language detected: ${baseLang}`);
        return baseLang;
      }
      
      // Try to find a variant match (e.g., "en" -> "en-US")
      const variantMatch = findLanguageVariant(baseLang);
      if (variantMatch) {
        console.log(`🌐 Browser language variant detected: ${variantMatch}`);
        return variantMatch;
      }
    }
    
    return null;
  } catch (error) {
    console.warn('Browser language detection failed:', error);
    return null;
  }
}

/**
 * Check if a language code is supported
 */
function isSupportedLanguage(langCode: string): boolean {
  const supportedCodes = [
    'en', 'af-ZA', 'sq-AL', 'ar', 'ar-EG', 'ar-SA', 'ar-AE', 'hy-AM',
    'bn-BD', 'nb-NO', 'bg-BG', 'ca-ES', 'hr-HR', 'cs-CZ', 'da-DK',
    'nl-BE', 'nl-NL', 'en-AU', 'en-IN', 'en-PH', 'en-GB', 'et-EE',
    'fa-IR', 'fi-FI', 'fr-BE', 'fr-CA', 'fr-FR', 'ka-GE', 'de-DE',
    'el-GR', 'he-IL', 'hi-IN', 'hu-HU', 'id-ID', 'it-IT', 'ja-JP',
    'ko-KR', 'lv-LV', 'lt-LT', 'mk-MK', 'ms-MY', 'pl-PL', 'pt-BR',
    'pt-PT', 'ro-RO', 'ru-RU', 'sr-RS', 'zh-CN', 'sk-SK', 'sl-SI',
    'es-AR', 'es-CO', 'es-419', 'es-MX', 'es-ES', 'sv-SE', 'th-TH',
    'zh-HK', 'zh-TW', 'tr-TR', 'uk-UA', 'ur-PK', 'vi-VN',
  ];
  
  return supportedCodes.includes(langCode);
}

/**
 * Find a supported language variant for a base language
 */
function findLanguageVariant(baseLang: string): string | null {
  const variantMap: Record<string, string> = {
    en: 'en',
    es: 'es-ES',
    fr: 'fr-FR',
    pt: 'pt-BR',
    zh: 'zh-CN',
    ar: 'ar',
    nl: 'nl-NL',
  };
  
  return variantMap[baseLang] || null;
}

/**
 * Get the best language for the user based on all available detection methods
 * Priority: Manual selection > Geographic location > Browser settings > Default (en)
 */
export async function detectBestLanguage(): Promise<string> {
  // 1. Check manual selection (localStorage)
  const manualSelection = localStorage.getItem('i18nextLng');
  const isManuallySet = localStorage.getItem('i18nextLng_manual') === 'true';
  
  if (manualSelection && isManuallySet && isSupportedLanguage(manualSelection)) {
    console.log(`👤 Using manual selection: ${manualSelection}`);
    return manualSelection;
  }
  
  // 2. Try geographic location detection
  const geoLanguage = await detectLanguageByGeolocation();
  if (geoLanguage && isSupportedLanguage(geoLanguage)) {
    console.log(`🌍 Using geographic location: ${geoLanguage}`);
    return geoLanguage;
  }
  
  // 3. Try browser/system settings
  const browserLanguage = detectLanguageFromBrowser();
  if (browserLanguage) {
    console.log(`🌐 Using browser language: ${browserLanguage}`);
    return browserLanguage;
  }
  
  // 4. Default to English
  console.log(`🔤 Using default language: en`);
  return 'en';
}

/**
 * Initialize language detection and set the detected language
 */
export async function initializeLanguageDetection(
  setLanguage: (lang: string) => void
): Promise<void> {
  try {
    const detectedLanguage = await detectBestLanguage();
    
    // Only set if different from current and not manually set
    const currentLanguage = localStorage.getItem('i18nextLng');
    const isManuallySet = localStorage.getItem('i18nextLng_manual') === 'true';
    
    if (detectedLanguage !== currentLanguage && !isManuallySet) {
      setLanguage(detectedLanguage);
      localStorage.setItem('i18nextLng', detectedLanguage);
      // Don't set manual flag - this is auto-detection
      localStorage.removeItem('i18nextLng_manual');
    }
  } catch (error) {
    console.error('Language detection initialization failed:', error);
    // Fall back to English
    setLanguage('en');
  }
}
