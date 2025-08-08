import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // Builder.io compatibility headers
  response.headers.set('X-Frame-Options', 'ALLOWALL')
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Content-Security-Policy', "frame-ancestors 'self' *.builder.io *.vercel.app")
  
  return response
}

export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico).*)',
}
