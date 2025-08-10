import createMiddleware from 'next-intl/middleware';
import { locales } from './i18n/request';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: 'pt-br',
  localePrefix: 'always'
});

export default function middleware(request: NextRequest) {
  // Allow Builder.io to access all pages
  const builderIOHeader = request.headers.get('X-Builder-IO');
  if (builderIOHeader) {
    const response = intlMiddleware(request);
    if (response) {
      response.headers.set('X-Frame-Options', 'ALLOWALL');
      response.headers.set('X-Builder-Discoverable', 'true');
      return response;
    }
  }

  // Special handling for .well-known files
  if (request.nextUrl.pathname.startsWith('/.well-known/')) {
    return NextResponse.next();
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)', '/.well-known/builder-pages.json']
};
