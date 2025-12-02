import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES, RTL_LANGUAGES } from '@/i18n/config';
import { Globe, MapPin } from 'lucide-react';

interface LanguageSwitcherProps {
  className?: string;
  textColor?: string;
}

export default function LanguageSwitcher({ className = '', textColor = 'text-gray-700' }: LanguageSwitcherProps) {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAutoDetected, setIsAutoDetected] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage = SUPPORTED_LANGUAGES.find(lang => lang.code === i18n.language) || SUPPORTED_LANGUAGES[0];

  // Check if language was auto-detected (not manually set)
  useEffect(() => {
    const manualSelection = localStorage.getItem('i18nextLng_manual');
    setIsAutoDetected(!manualSelection);
  }, [i18n.language]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    
    // Save as manual selection
    localStorage.setItem('i18nextLng', languageCode);
    localStorage.setItem('i18nextLng_manual', 'true');
    setIsAutoDetected(false);
    
    // Handle RTL languages
    if (RTL_LANGUAGES.includes(languageCode)) {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }
    
    setIsOpen(false);
    setSearchQuery('');
  };

  // Filter languages based on search
  const filteredLanguages = SUPPORTED_LANGUAGES.filter(lang =>
    lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lang.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Language Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${textColor}`}
        aria-label="Select language"
        title={isAutoDetected ? 'Auto-detected language (click to change)' : 'Click to change language'}
      >
        <Globe className="w-5 h-5" />
        <span className="hidden sm:inline font-medium">{currentLanguage.nativeName}</span>
        <span className="text-xs opacity-70">({currentLanguage.code})</span>
        {isAutoDetected && (
          <span title="Auto-detected from your location/browser">
            <MapPin className="w-3 h-3 text-blue-500" />
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 max-h-[500px] flex flex-col">
          {/* Header with auto-detect info */}
          {isAutoDetected && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-800">
              <div className="flex items-center gap-2 text-xs text-blue-700 dark:text-blue-300">
                <MapPin className="w-4 h-4" />
                <span>Auto-detected from your location/browser settings</span>
              </div>
            </div>
          )}
          
          {/* Search Input */}
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <input
              type="text"
              placeholder="Search languages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>

          {/* Language List */}
          <div className="overflow-y-auto flex-1">
            {filteredLanguages.length > 0 ? (
              filteredLanguages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-between ${
                    currentLanguage.code === lang.code ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {lang.nativeName}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {lang.name}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {lang.code}
                  </span>
                  {currentLanguage.code === lang.code && (
                    <span className="ml-2 text-blue-600 dark:text-blue-400">✓</span>
                  )}
                </button>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                No languages found
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 text-center">
            {filteredLanguages.length} language{filteredLanguages.length !== 1 ? 's' : ''} available
          </div>
        </div>
      )}
    </div>
  );
}
