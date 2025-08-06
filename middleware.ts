import createIntlMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { locales } from '@/lib/i18n';

const intlMiddleware = createIntlMiddleware({
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
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Handle internationalization first
  const response = intlMiddleware(request);

  // Extract locale from pathname for auth checks
  const localePattern = new RegExp(`^/(${locales.join('|')})`);
  const match = pathname.match(localePattern);
  const locale = match ? match[1] : 'pt-br';
  const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/';

  // Handle admin authentication for dashboard routes
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

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next|_vercel|.*\\..*).*)'
  ]
};
