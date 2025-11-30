# 🌍 Internationalization (i18n) System

## Overview
The application now supports **100+ languages** using `react-i18next`. Language detection is automatic, and translations are loaded on-demand.

## Supported Languages
All 100+ languages are configured in `/src/i18n/config.ts` including:
- **English** (en, en-AU, en-IN, en-PH, en-GB)
- **Spanish** (es-ES, es-MX, es-AR, es-CO, es-419)
- **French** (fr-FR, fr-CA, fr-BE)
- **German** (de-DE)
- **Chinese** (zh-CN, zh-HK, zh-TW)
- **Arabic** (ar, ar-EG, ar-SA, ar-AE) - RTL supported
- **Portuguese** (pt-BR, pt-PT)
- **Hindi** (hi-IN)
- **Japanese** (ja-JP)
- **Korean** (ko-KR)
- ...and 90+ more!

## File Structure
```
/public/locales/
  /en/              # English translations (base)
    common.json     # Common UI elements
    auth.json       # Authentication pages
    messages.json   # Signup/welcome messages
  /es-ES/           # Spanish
  /fr-FR/           # French
  /de-DE/           # German
  ... (add more as needed)

/src/i18n/
  config.ts         # i18n configuration & language list
  messageHelpers.ts # Helper functions for random messages
```

## Usage in Components

### Basic Translation
```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation('common');
  
  return <button>{t('buttons.continue')}</button>;
}
```

### Multiple Namespaces
```tsx
const { t } = useTranslation(['common', 'auth']);

<h1>{t('auth:signup.title')}</h1>
<button>{t('common:buttons.submit')}</button>
```

### With Variables
```tsx
t('welcome', { name: 'John' })
// Translation file: "welcome": "Welcome, {{name}}!"
```

## Language Switcher
The `<LanguageSwitcher />` component is automatically added to the Header. Features:
- ✅ Search functionality
- ✅ Shows native language names
- ✅ Displays language codes
- ✅ Persists selection in localStorage
- ✅ Auto-detects browser language
- ✅ RTL support for Arabic, Hebrew, Farsi, Urdu

## Adding New Languages

### 1. Language Already in Config
If the language is already in `SUPPORTED_LANGUAGES`, just create translation files:

```bash
mkdir public/locales/de-DE
cp -r public/locales/en/* public/locales/de-DE/
# Then translate the JSON files
```

### 2. New Language Not in Config
1. Add to `SUPPORTED_LANGUAGES` in `/src/i18n/config.ts`
2. If RTL, add to `RTL_LANGUAGES` array
3. Create translation files in `/public/locales/[lang-code]/`

## Translation Files Format

### common.json
```json
{
  "header": {
    "language": "Language"
  },
  "buttons": {
    "getStarted": "Get Started",
    "continue": "Continue",
    "submit": "Submit"
  }
}
```

### messages.json
```json
{
  "emailSignup": {
    "variations": [
      "<h1>Welcome! 🎉</h1><p>Your account is ready.</p>",
      "<h1>Great! ✨</h1><p>Everything is set up.</p>"
    ]
  }
}
```

## Random Message System
For dynamic signup messages with variations:

```tsx
import { getRandomEmailSignupMessage } from '@/i18n/messageHelpers';

const message = getRandomEmailSignupMessage();
// Returns random variation from current language
```

## RTL (Right-to-Left) Support
Automatically handled for:
- Arabic (all variants)
- Hebrew
- Farsi
- Urdu

The document direction (`dir="rtl"`) is set automatically when these languages are selected.

## Language Detection Priority
1. **localStorage** - User's previously selected language
2. **Browser** - Navigator language settings
3. **Fallback** - English (en)

## Best Practices

### ✅ DO
- Keep translations in JSON files
- Use namespaces to organize translations
- Provide fallback text
- Test with long text (German, Finnish)
- Test RTL languages (Arabic, Hebrew)

### ❌ DON'T
- Hardcode strings in components
- Mix languages in same file
- Use HTML entities in translations (use actual characters)
- Forget to test pluralization

## Testing Different Languages

### In Browser
1. Click the globe icon (🌐) in header
2. Search or scroll to desired language
3. Click to activate

### Programmatically
```tsx
import { useTranslation } from 'react-i18next';

const { i18n } = useTranslation();
i18n.changeLanguage('fr-FR');
```

### Via localStorage
```javascript
localStorage.setItem('i18nextLng', 'es-ES');
window.location.reload();
```

## Translation Workflow
1. **Add English** - Create feature in English first
2. **Extract Strings** - Move hardcoded text to translation files
3. **Generate Keys** - Use descriptive keys (e.g., `auth.login.title`)
4. **Professional Translation** - Use translation services for other languages
5. **Community Review** - Native speakers verify translations
6. **Iterate** - Update as needed

## Professional Translation Services
When ready to translate at scale:
- **Lokalise** (recommended) - Developer-friendly
- **Crowdin** - Good for open source
- **Google Translate API** - For initial drafts only
- **Professional agencies** - For legal/medical content

## Current Status
- ✅ Infrastructure complete
- ✅ 100+ languages configured
- ✅ English translations complete
- ✅ Spanish & French started
- ⏳ Other languages need translation
- ✅ Language switcher in header
- ✅ RTL support implemented

## Next Steps
1. Translate remaining languages (hire translators)
2. Add language-specific date/number formatting
3. Implement pluralization rules
4. Add currency formatting per locale
5. Test all 100+ languages thoroughly

## Resources
- [react-i18next Documentation](https://react.i18next.com/)
- [i18next Documentation](https://www.i18next.com/)
- [Language Codes (ISO 639-1)](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes)
