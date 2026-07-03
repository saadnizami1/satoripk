import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED_ROUTES = ['/dashboard', '/onboarding']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isProtected = PROTECTED_ROUTES.some(r => pathname.startsWith(r))
  const isAuthPage = pathname === '/auth'

  // Public routes (landing page, API, static) never need a Supabase
  // round-trip — skip it so they render even if Supabase is unreachable.
  if (!isProtected && !isAuthPage) {
    return NextResponse.next({ request: { headers: request.headers } })
  }

  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({ request: { headers: request.headers } })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session — keeps auth cookies up to date. If Supabase is
  // unreachable, treat the visitor as signed out instead of hanging
  // the request until the middleware invocation times out.
  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch {
    user = null
  }

  // Unauthenticated user trying to reach a protected route → /auth
  if (!user && isProtected) {
    const url = new URL('/auth', request.url)
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  // Already authenticated user on /auth → /dashboard
  if (user && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
