import { type NextRequest, NextResponse } from 'next/server'
import { verifyJWT } from '@/lib/auth'

const protectedRoutes = ['/dashboard', '/portfolio', '/history']

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Check if route is protected
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route))

  if (isProtected) {
    const token = request.cookies.get('auth_token')?.value

    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Verify token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key')
    try {
      await verifyJWT(token)
    } catch {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
