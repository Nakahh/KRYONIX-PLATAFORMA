'use client';

import { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { translatePage, getTranslation, getCurrentLocale, setCurrentLocale } from '@/lib/utils/translation-system';

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
  const [currentLocale, setCurrentLocaleState] = useState('pt-br');
  const [isOpen, setIsOpen] = useState(false);

  // Carregar idioma salvo ao inicializar
  useEffect(() => {
    const savedLocale = getCurrentLocale();
    setCurrentLocaleState(savedLocale);
  }, []);

  const handleLocaleChange = (newLocale: string) => {
    setCurrentLocaleState(newLocale);
    setIsOpen(false);

    // Salvar preferência
    setCurrentLocale(newLocale);

    // Aplicar traduções na página
    translatePage(newLocale);

    // Notificar mudança (only on client side)
    if (typeof window !== 'undefined') {
      const message = getTranslation('language.changed', newLocale);
      alert(message);
    }
  };

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
        className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        aria-label="Alterar idioma"
      >
        <span className="text-lg">
          {locales.find(l => l.code === currentLocale)?.flag || '🌍'}
        </span>
      </button>
      
      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 top-12 z-20 w-44 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg py-1">
            {locales.map((locale) => (
              <button
                key={locale.code}
                onClick={() => handleLocaleChange(locale.code)}
                className={`flex items-center w-full px-3 py-2 text-sm transition-colors ${
                  currentLocale === locale.code
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <span className="mr-3">{locale.flag}</span>
                <span className="flex-1 text-left">{locale.name}</span>
                {currentLocale === locale.code && (
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
