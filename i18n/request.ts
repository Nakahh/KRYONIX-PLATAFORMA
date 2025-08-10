import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

export const locales = ['pt-br', 'en', 'es', 'de', 'fr'] as const;
export type Locale = typeof locales[number];

export const localeNames: Record<Locale, string> = {
  'pt-br': 'Português (BR)',
  'en': 'English',
  'es': 'Español',
  'de': 'Deutsch',
  'fr': 'Français'
};

export const localeFlags: Record<Locale, string> = {
  'pt-br': '🇧🇷',
  'en': '🇺🇸',
  'es': '🇪🇸',
  'de': '🇩🇪',
  'fr': '🇫🇷'
};

export default getRequestConfig(async ({ locale }) => {
  // Verificação segura para modo estático
  if (!locales.includes(locale as Locale)) {
    console.warn(`Locale ${locale} not supported, falling back to pt-br`);
    locale = 'pt-br';
  }

  try {
    return {
      locale,
      messages: (await import(`../locales/${locale}.json`)).default
    };
  } catch (error) {
    console.warn(`Failed to load messages for ${locale}, using fallback`);
    return {
      locale: 'pt-br',
      messages: (await import(`../locales/pt-br.json`)).default
    };
  }
});
