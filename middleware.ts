import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { locales } from './lib/i18n';

// Create the next-intl middleware
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: 'pt-br',
  localePrefix: 'always'
});

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip processing for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') // arquivos estáticos
  ) {
    return NextResponse.next();
  }

  // Handle admin authentication for dashboard routes
  const locale = pathname.split('/')[1];
  const pathWithoutLocale = pathname.substring(locale.length + 1);

  if (pathWithoutLocale.startsWith('/dashboard')) {
    const token = request.cookies.get('admin_session')?.value;

    if (!token) {
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    }
  }

  // Handle login redirect if already authenticated
  if (pathWithoutLocale === '/login') {
    const token = request.cookies.get('admin_session')?.value;
    if (token) {
      return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
    }
  }

  // Apply next-intl middleware
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    // Enable a redirect to a matching locale at the root
    '/',

    // Set a cookie to remember the previous locale for
    // all requests that have a locale prefix
    '/(pt-br|en|es|de|fr)/:path*',

    // Enable redirects that add missing locales
    // (e.g. `/pathnames` -> `/en/pathnames`)
    '/((?!_next|_vercel|.*\\..*).*)'
  ]
};
