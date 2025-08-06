'use client';

import { useState } from 'react';
import { Globe } from 'lucide-react';

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
  const [currentLocale, setCurrentLocale] = useState('pt-br');
  const [isOpen, setIsOpen] = useState(false);

  const handleLocaleChange = (newLocale: string) => {
    setCurrentLocale(newLocale);
    setIsOpen(false);

    // Salvar preferência no localStorage
    localStorage.setItem('preferred-locale', newLocale);

    // Simular mudança de idioma na interface
    const elementsToTranslate = document.querySelectorAll('[data-translate]');
    elementsToTranslate.forEach(element => {
      const key = element.getAttribute('data-translate');
      if (key) {
        // Aqui você pode implementar um sistema de tradução mais robusto
        element.textContent = getTranslation(key, newLocale);
      }
    });

    // Notificar mudança
    alert(`Idioma alterado para: ${locales.find(l => l.code === newLocale)?.name}\n\nEm breve teremos tradução completa do site!`);
  };

  // Função auxiliar para traduções básicas
  const getTranslation = (key: string, locale: string) => {
    const translations: Record<string, Record<string, string>> = {
      'home.title': {
        'pt-br': 'KRYONIX - Plataforma SaaS 100% Autônoma por IA',
        'en': 'KRYONIX - 100% AI-Autonomous SaaS Platform',
        'es': 'KRYONIX - Plataforma SaaS 100% Autónoma por IA',
        'de': 'KRYONIX - 100% KI-autonome SaaS-Plattform',
        'fr': 'KRYONIX - Plateforme SaaS 100% Autonome par IA'
      },
      'partnerships': {
        'pt-br': 'Parcerias',
        'en': 'Partnerships',
        'es': 'Alianzas',
        'de': 'Partnerschaften',
        'fr': 'Partenariats'
      }
    };

    return translations[key]?.[locale] || key;
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
        className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        {locales.find(l => l.code === currentLocale)?.flag} {locales.find(l => l.code === currentLocale)?.name}
      </button>
      
      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg py-1">
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
