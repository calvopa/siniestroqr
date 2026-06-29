import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    if (path.startsWith('/aseguradora') && token?.role !== 'ASEGURADORA') {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    if ((path.startsWith('/dashboard') || path.startsWith('/broker')) && token?.role === 'ASEGURADORA') {
      return NextResponse.redirect(new URL('/aseguradora', req.url))
    }
    return NextResponse.next()
  },
  {
    callbacks: { authorized: ({ token }) => !!token },
    pages: { signIn: '/login' },
  }
)

export const config = {
  matcher: ['/dashboard/:path*', '/broker/:path*', '/aseguradora/:path*'],
}
