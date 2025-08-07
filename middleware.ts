import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { locales } from './lib/i18n';

// Create the internationalization middleware
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
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Handle root path redirect to default locale
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/pt-br', request.url));
  }

  // Handle admin authentication for dashboard routes only
  if (pathname.startsWith('/dashboard')) {
    const token = request.cookies.get('admin_session')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Handle login redirect if already authenticated
  if (pathname === '/login') {
    const token = request.cookies.get('admin_session')?.value;
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Handle legacy Portuguese routes - redirect to localized versions
  if (pathname === '/fila-de-espera') {
    return NextResponse.redirect(new URL('/pt-br/waitlist', request.url));
  }

  if (pathname === '/progresso') {
    return NextResponse.redirect(new URL('/pt-br/progress', request.url));
  }

  if (pathname === '/parcerias-empresariais-contato') {
    return NextResponse.redirect(new URL('/pt-br/partnerships-contact', request.url));
  }

  // For non-dashboard routes, apply internationalization
  if (!pathname.startsWith('/dashboard') && !pathname.startsWith('/login')) {
    return intlMiddleware(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next|static|api|favicon.ico|logo-kryonix.png|site.webmanifest).*)',
  ],
};
