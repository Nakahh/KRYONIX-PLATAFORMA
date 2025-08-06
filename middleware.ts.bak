import { NextRequest, NextResponse } from 'next/server';
import { match } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';

const locales = ['pt-br', 'en', 'es', 'de', 'fr'];
const defaultLocale = 'pt-br';

function getLocale(request: NextRequest): string {
  // Verificar se há locale no cookie
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
  if (cookieLocale && locales.includes(cookieLocale)) {
    return cookieLocale;
  }

  // Detectar idioma do navegador
  const acceptLang = request.headers.get('accept-language');
  if (!acceptLang) return defaultLocale;

  const languages = new Negotiator({ 
    headers: { 'accept-language': acceptLang } 
  }).languages();

  return match(languages, locales, defaultLocale);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Verificar se o pathname já tem um locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) return;

  // Redirecionar para o locale apropriado
  const locale = getLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname}`;
  
  const response = NextResponse.redirect(url);
  
  // Salvar locale no cookie
  response.cookies.set('NEXT_LOCALE', locale, {
    maxAge: 365 * 24 * 60 * 60, // 1 ano
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });

  return response;
}

export const config = {
  matcher: [
    '/((?!_next|api|favicon.ico|logo-kryonix.svg|.*\\.).*)',
  ],
};
