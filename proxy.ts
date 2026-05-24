import { type NextRequest, NextResponse } from 'next/server'

const protectedRoutes = ['/dashboard', '/portfolio', '/history', '/transactions', '/stocks']

export default function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  const isProtected = protectedRoutes.some(route => pathname.startsWith(route))

  if (isProtected) {
    const token = request.cookies.get('auth_token')?.value

    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
