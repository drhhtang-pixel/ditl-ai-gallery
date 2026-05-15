import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { nextUrl, auth: session } = req
  const isLoggedIn = !!session
  const isAdmin = session?.isAdmin === true

  const isPublic =
    nextUrl.pathname === '/login' ||
    nextUrl.pathname === '/403' ||
    nextUrl.pathname.startsWith('/api/auth')
  if (isPublic) return NextResponse.next()

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (nextUrl.pathname.startsWith('/admin') && !isAdmin) {
    return NextResponse.redirect(new URL('/403', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
