'use client';

import { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

const locales = [
  { code: 'pt-br', name: 'Português (BR)', flag: '🇧🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' }
];

interface SimpleLanguageSwitcherProps {
  className?: string;
  variant?: 'dropdown' | 'buttons';
}

export default function SimpleLanguageSwitcher({
  className = '',
  variant = 'dropdown'
}: SimpleLanguageSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [currentLocale, setCurrentLocaleState] = useState('pt-br');
  const [isOpen, setIsOpen] = useState(false);

  // Get current locale from pathname
  useEffect(() => {
    const pathSegments = pathname.split('/');
    const localeFromPath = pathSegments[1];
    if (locales.some(l => l.code === localeFromPath)) {
      setCurrentLocaleState(localeFromPath);
    }
  }, [pathname]);

  const handleLocaleChange = (newLocale: string) => {
    setCurrentLocaleState(newLocale);
    setIsOpen(false);

    // Navigate to new locale path
    const pathSegments = pathname.split('/');
    pathSegments[1] = newLocale;
    const newPath = pathSegments.join('/');
    router.push(newPath);
  };

  const currentLocaleData = locales.find(l => l.code === currentLocale) || locales[0];

  if (variant === 'buttons') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Globe className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        <div className="flex gap-1">
          {locales.map((locale) => (
            <button
              key={locale.code}
              onClick={() => handleLocaleChange(locale.code)}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                currentLocale === locale.code
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {locale.flag}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <Globe className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        <span className="text-gray-700 dark:text-gray-300">
          {currentLocaleData.flag} {currentLocaleData.code.toUpperCase()}
        </span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 z-20 w-48 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg py-1">
            {locales.map((locale) => (
              <button
                key={locale.code}
                onClick={() => handleLocaleChange(locale.code)}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 ${
                  currentLocale === locale.code
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                <span className="text-lg">{locale.flag}</span>
                <span>{locale.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
