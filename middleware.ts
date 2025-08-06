import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Permitir acesso público às rotas básicas
  if (
    pathname === '/' ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') || // arquivos estáticos
    pathname.startsWith('/login') ||
    pathname.startsWith('/fila-de-espera') ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/progresso') ||
    pathname.startsWith('/parcerias-empresariais-contato') ||
    pathname.startsWith('/partnership-proposal-confidential-v2024')
  ) {
    // Verificar se é rota de admin
    if (pathname.startsWith('/dashboard')) {
      const token = request.cookies.get('admin_session')?.value

      // Se está tentando acessar dashboard sem login, redirecionar para login
      if (!token && pathname !== '/login') {
        return NextResponse.redirect(new URL('/login', request.url))
      }
    }

    // Se está tentando acessar login e já está logado, redirecionar para dashboard
    if (pathname === '/login') {
      const token = request.cookies.get('admin_session')?.value
      if (token) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }

    return NextResponse.next()
  }

  // Para outras rotas, continuar com o fluxo normal
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|logo-kryonix.svg).*)',
  ],
}
