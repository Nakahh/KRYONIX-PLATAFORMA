import createMiddleware from 'next-intl/middleware';
import { locales } from './i18n/request';

export default createMiddleware({
  locales,
  defaultLocale: 'pt-br',
  localePrefix: 'always',
  // Configuração para Builder.io
  alternateLinks: false
});

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)', '/.well-known/builder-pages.json']
};
