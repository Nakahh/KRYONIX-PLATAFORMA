import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Skip processing for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') // arquivos estáticos
  ) {
    return NextResponse.next()
  }

  // Handle admin authentication for dashboard routes only
  if (pathname.startsWith('/dashboard')) {
    const token = request.cookies.get('admin_session')?.value

    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Handle login redirect if already authenticated
  if (pathname === '/login') {
    const token = request.cookies.get('admin_session')?.value
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

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
