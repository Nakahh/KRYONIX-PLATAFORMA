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
  if (!locales.includes(locale as Locale)) notFound();

  return {
    locale,
    messages: (await import(`../locales/${locale}.json`)).default
  };
});
