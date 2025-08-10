import createMiddleware from 'next-intl/middleware';
import { locales } from './i18n/request';

export default createMiddleware({
  locales,
  defaultLocale: 'pt-br',
  localePrefix: 'always'
});

export const config = {
  matcher: [
    // Incluir todas as rotas exceto API, static files, etc
    '/((?!api|_next|_vercel|.*\\..*).*)'
  ]
};
