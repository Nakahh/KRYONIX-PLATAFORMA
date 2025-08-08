import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

// Edge runtime declaration for Next.js 14.2.31
export const config = {
  runtime: 'experimental-edge',
  matcher: [
    // Match all pathnames except for:
    // - api routes
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico, sitemap.xml, robots.txt (metadata files)
    // - files with extensions
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\..*).*)',
  ],
};

// Consistent locales order with i18n config
const locales = ['pt-br', 'en', 'es', 'de', 'fr'];

// Edge-optimized internationalization middleware
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: 'pt-br',
  localePrefix: 'always',
  alternateLinks: false, // Disable for edge performance
  localeDetection: true
});

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip processing for static files, API routes, and assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/logo-') ||
    pathname.startsWith('/site.webmanifest')
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
  const legacyRoutes = {
    '/fila-de-espera': '/pt-br/waitlist',
    '/progresso': '/pt-br/progress',
    '/parcerias-empresariais-contato': '/pt-br/partnerships-contact'
  };

  if (legacyRoutes[pathname]) {
    return NextResponse.redirect(new URL(legacyRoutes[pathname], request.url));
  }

  // For non-dashboard routes, apply internationalization
  if (!pathname.startsWith('/dashboard') && !pathname.startsWith('/login')) {
    return intlMiddleware(request);
  }

  return NextResponse.next();
}
