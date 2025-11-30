import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// All supported languages with their metadata
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English (United States)', nativeName: 'English' },
  { code: 'af-ZA', name: 'Afrikaans', nativeName: 'Afrikaans' },
  { code: 'sq-AL', name: 'Albanian', nativeName: 'Shqip' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'ar-EG', name: 'Arabic (Egypt)', nativeName: 'العربية (مصر)' },
  { code: 'ar-SA', name: 'Arabic (Saudi Arabia)', nativeName: 'العربية (السعودية)' },
  { code: 'ar-AE', name: 'Arabic (United Arab Emirates)', nativeName: 'العربية (الإمارات)' },
  { code: 'hy-AM', name: 'Armenian', nativeName: 'Հայերեն' },
  { code: 'as-IN', name: 'Assamese', nativeName: 'অসমীয়া' },
  { code: 'az-AZ', name: 'Azerbaijani', nativeName: 'Azərbaycan' },
  { code: 'eu-ES', name: 'Basque', nativeName: 'Euskara' },
  { code: 'bn-BD', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'nb-NO', name: 'Bokmål Norwegian', nativeName: 'Norsk bokmål' },
  { code: 'bg-BG', name: 'Bulgarian', nativeName: 'Български' },
  { code: 'my-MM', name: 'Burmese', nativeName: 'မြန်မာ' },
  { code: 'ca-ES', name: 'Catalan', nativeName: 'Català' },
  { code: 'ceb-PH', name: 'Cebuano', nativeName: 'Cebuano' },
  { code: 'hr-HR', name: 'Croatian', nativeName: 'Hrvatski' },
  { code: 'cs-CZ', name: 'Czech', nativeName: 'Čeština' },
  { code: 'da-DK', name: 'Danish', nativeName: 'Dansk' },
  { code: 'nl-BE', name: 'Dutch (Belgium)', nativeName: 'Nederlands (België)' },
  { code: 'nl-NL', name: 'Dutch (Netherlands)', nativeName: 'Nederlands' },
  { code: 'en-AU', name: 'English (Australia)', nativeName: 'English (Australia)' },
  { code: 'en-IN', name: 'English (India)', nativeName: 'English (India)' },
  { code: 'en-PH', name: 'English (Philippines)', nativeName: 'English (Philippines)' },
  { code: 'en-GB', name: 'English (United Kingdom)', nativeName: 'English (UK)' },
  { code: 'et-EE', name: 'Estonian', nativeName: 'Eesti' },
  { code: 'fa-IR', name: 'Farsi', nativeName: 'فارسی' },
  { code: 'fi-FI', name: 'Finnish', nativeName: 'Suomi' },
  { code: 'fr-BE', name: 'French (Belgium)', nativeName: 'Français (Belgique)' },
  { code: 'fr-CA', name: 'French (Canada)', nativeName: 'Français (Canada)' },
  { code: 'fr-FR', name: 'French (France)', nativeName: 'Français' },
  { code: 'ff-SN', name: 'Fula', nativeName: 'Fulfulde' },
  { code: 'gl-ES', name: 'Galician', nativeName: 'Galego' },
  { code: 'ka-GE', name: 'Georgian', nativeName: 'ქართული' },
  { code: 'de-DE', name: 'German', nativeName: 'Deutsch' },
  { code: 'el-GR', name: 'Greek', nativeName: 'Ελληνικά' },
  { code: 'gu-IN', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'ha-NG', name: 'Hausa', nativeName: 'Hausa' },
  { code: 'he-IL', name: 'Hebrew', nativeName: 'עברית' },
  { code: 'hi-IN', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'hu-HU', name: 'Hungarian', nativeName: 'Magyar' },
  { code: 'ig-NG', name: 'Igbo', nativeName: 'Igbo' },
  { code: 'id-ID', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
  { code: 'it-IT', name: 'Italian', nativeName: 'Italiano' },
  { code: 'ja-JP', name: 'Japanese', nativeName: '日本語' },
  { code: 'jv-ID', name: 'Javanese', nativeName: 'Basa Jawa' },
  { code: 'kn-IN', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'kk-KZ', name: 'Kazakh', nativeName: 'Қазақ' },
  { code: 'km-KH', name: 'Khmer', nativeName: 'ខ្មែរ' },
  { code: 'ko-KR', name: 'Korean', nativeName: '한국어' },
  { code: 'ku-TR', name: 'Kurdish (Turkey)', nativeName: 'Kurdî' },
  { code: 'ky-KG', name: 'Kyrgyz', nativeName: 'Кыргызча' },
  { code: 'lv-LV', name: 'Latvian', nativeName: 'Latviešu' },
  { code: 'lt-LT', name: 'Lithuanian', nativeName: 'Lietuvių' },
  { code: 'mk-MK', name: 'Macedonian', nativeName: 'Македонски' },
  { code: 'ma-IN', name: 'Maithili', nativeName: 'मैथिली' },
  { code: 'mg-MG', name: 'Malagasy', nativeName: 'Malagasy' },
  { code: 'ml-IN', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'ms-MY', name: 'Malaysian', nativeName: 'Bahasa Melayu' },
  { code: 'mr-IN', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'mn-MN', name: 'Mongolian', nativeName: 'Монгол' },
  { code: 'ne-NP', name: 'Nepali', nativeName: 'नेपाली' },
  { code: 'om-ET', name: 'Oromo', nativeName: 'Oromoo' },
  { code: 'pl-PL', name: 'Polish', nativeName: 'Polski' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)', nativeName: 'Português (Brasil)' },
  { code: 'pt-PT', name: 'Portuguese (Portugal)', nativeName: 'Português' },
  { code: 'pa-IN', name: 'Punjabi (India)', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'pa-PK', name: 'Punjabi (Pakistan)', nativeName: 'پنجابی' },
  { code: 'ro-RO', name: 'Romanian', nativeName: 'Română' },
  { code: 'ru-RU', name: 'Russian', nativeName: 'Русский' },
  { code: 'sr-RS', name: 'Serbian', nativeName: 'Српски' },
  { code: 'sn-ZW', name: 'Shona', nativeName: 'Shona' },
  { code: 'zh-CN', name: 'Simplified Chinese', nativeName: '简体中文' },
  { code: 'sd-IN', name: 'Sindhi', nativeName: 'سنڌي' },
  { code: 'si-LK', name: 'Sinhala', nativeName: 'සිංහල' },
  { code: 'sk-SK', name: 'Slovak', nativeName: 'Slovenčina' },
  { code: 'sl-SI', name: 'Slovenian', nativeName: 'Slovenščina' },
  { code: 'so-SO', name: 'Somali', nativeName: 'Soomaali' },
  { code: 'es-AR', name: 'Spanish (Argentina)', nativeName: 'Español (Argentina)' },
  { code: 'es-CO', name: 'Spanish (Colombia)', nativeName: 'Español (Colombia)' },
  { code: 'es-419', name: 'Spanish (Latin America)', nativeName: 'Español (Latinoamérica)' },
  { code: 'es-MX', name: 'Spanish (Mexico)', nativeName: 'Español (México)' },
  { code: 'es-ES', name: 'Spanish (Spain)', nativeName: 'Español' },
  { code: 'su-ID', name: 'Sundanese', nativeName: 'Basa Sunda' },
  { code: 'sw-KE', name: 'Swahili', nativeName: 'Kiswahili' },
  { code: 'sv-SE', name: 'Swedish', nativeName: 'Svenska' },
  { code: 'tl-PH', name: 'Tagalog', nativeName: 'Tagalog' },
  { code: 'ta-IN', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te-IN', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'th-TH', name: 'Thai', nativeName: 'ไทย' },
  { code: 'zh-HK', name: 'Traditional Chinese (Hong Kong)', nativeName: '繁體中文 (香港)' },
  { code: 'zh-TW', name: 'Traditional Chinese (Taiwan)', nativeName: '繁體中文 (台灣)' },
  { code: 'tr-TR', name: 'Turkish', nativeName: 'Türkçe' },
  { code: 'uk-UA', name: 'Ukrainian', nativeName: 'Українська' },
  { code: 'ur-PK', name: 'Urdu', nativeName: 'اردو' },
  { code: 'uz-UZ', name: 'Uzbek', nativeName: 'Oʻzbek' },
  { code: 'vi-VN', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
  { code: 'cy-GB', name: 'Welsh', nativeName: 'Cymraeg' },
  { code: 'wo-SN', name: 'Wolof', nativeName: 'Wolof' },
  { code: 'xh-ZA', name: 'Xhosa', nativeName: 'isiXhosa' },
  { code: 'yo-NG', name: 'Yoruba', nativeName: 'Yorùbá' },
  { code: 'zu-ZA', name: 'Zulu', nativeName: 'isiZulu' },
] as const;

// RTL (Right-to-Left) languages
export const RTL_LANGUAGES = ['ar', 'ar-EG', 'ar-SA', 'ar-AE', 'he-IL', 'fa-IR', 'ur-PK'];

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: false,
    
    // Language detection options - Enhanced for geographic and browser detection
    detection: {
      // Priority order: Manual selection > Navigator/Browser > HTML tag > Query string
      order: ['localStorage', 'navigator', 'htmlTag', 'querystring', 'cookie'],
      caches: ['localStorage', 'cookie'],
      lookupLocalStorage: 'i18nextLng',
      lookupCookie: 'i18next',
      lookupQuerystring: 'lng',
      cookieMinutes: 10080, // 7 days
      cookieDomain: window.location.hostname,
      
      // Convert browser language codes to our supported codes
      convertDetectedLanguage: (lng: string) => {
        // Normalize language code
        const normalized = lng.toLowerCase();
        
        // Map common browser language codes to our supported languages
        const languageMap: Record<string, string> = {
          'en-us': 'en',
          'en-gb': 'en-GB',
          'en-au': 'en-AU',
          'en-in': 'en-IN',
          'es-es': 'es-ES',
          'es-mx': 'es-MX',
          'es-ar': 'es-AR',
          'pt-br': 'pt-BR',
          'pt-pt': 'pt-PT',
          'zh-cn': 'zh-CN',
          'zh-tw': 'zh-TW',
          'zh-hk': 'zh-HK',
          'fr-fr': 'fr-FR',
          'fr-ca': 'fr-CA',
          'fr-be': 'fr-BE',
          'de-de': 'de-DE',
          'ar-sa': 'ar-SA',
          'ar-eg': 'ar-EG',
          'ar-ae': 'ar-AE',
        };
        
        // Check exact match
        if (languageMap[normalized]) {
          return languageMap[normalized];
        }
        
        // Try base language
        const baseLang = normalized.split('-')[0];
        const baseVariants: Record<string, string> = {
          'en': 'en',
          'es': 'es-ES',
          'pt': 'pt-BR',
          'fr': 'fr-FR',
          'de': 'de-DE',
          'zh': 'zh-CN',
          'ar': 'ar',
          'ja': 'ja-JP',
          'ko': 'ko-KR',
          'it': 'it-IT',
          'ru': 'ru-RU',
          'nl': 'nl-NL',
          'pl': 'pl-PL',
          'tr': 'tr-TR',
          'vi': 'vi-VN',
          'th': 'th-TH',
          'id': 'id-ID',
          'hi': 'hi-IN',
          'bn': 'bn-BD',
          'uk': 'uk-UA',
          'sv': 'sv-SE',
          'no': 'nb-NO',
          'da': 'da-DK',
          'fi': 'fi-FI',
          'cs': 'cs-CZ',
          'hu': 'hu-HU',
          'ro': 'ro-RO',
          'el': 'el-GR',
          'he': 'he-IL',
          'fa': 'fa-IR',
          'ur': 'ur-PK',
        };
        
        return baseVariants[baseLang] || lng;
      },
    },
    
    // Backend options for loading translation files
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    
    // Namespaces (separate translation files)
    ns: ['common', 'auth', 'messages', 'landing', 'onboarding', 'smartHub'],
    defaultNS: 'common',
    
    interpolation: {
      escapeValue: false, // React already escapes
    },
    
    react: {
      useSuspense: true,
    },
  });

export default i18n;
