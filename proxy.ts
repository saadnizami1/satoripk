import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED_ROUTES = ['/dashboard', '/onboarding']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isProtected = PROTECTED_ROUTES.some(r => pathname === r || pathname.startsWith(`${r}/`))
  const isAuthPage = pathname === '/auth'

  // Public routes (landing page, API, static) never need a Supabase
  // round-trip — skip it so they render even if Supabase is unreachable.
  if (!isProtected && !isAuthPage) {
    return NextResponse.next()
  }

  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // getClaims() verifies the JWT locally against the project's signing keys
  // (no network hop) and refreshes an expired session when needed. If
  // Supabase is unreachable, treat the visitor as signed out instead of
  // hanging the request until the invocation times out.
  let claims: Record<string, any> | null = null
  try {
    const { data } = await supabase.auth.getClaims()
    claims = data?.claims ?? null
  } catch {
    claims = null
  }

  const redirect = (to: string, next?: string) => {
    const url = new URL(to, request.url)
    if (next) url.searchParams.set('next', next)
    const res = NextResponse.redirect(url)
    // Carry over any refreshed auth cookies.
    response.cookies.getAll().forEach(c => res.cookies.set(c))
    return res
  }

  if (!claims) {
    return isProtected ? redirect('/auth', pathname) : response
  }

  // Onboarding status lives in app_metadata (synced from profiles by a DB
  // trigger) so onboarded users are routed without a database query. Only
  // `true` is trusted: a token minted before onboarding finished may still
  // say false (or lack the flag), so confirm those against the database.
  let onboarded = claims.app_metadata?.onboarding_completed === true
  if (!onboarded) {
    const { data: profile } = await supabase
      .from('profiles').select('onboarding_completed').eq('id', claims.sub).maybeSingle()
    onboarded = Boolean(profile?.onboarding_completed)
  }

  if (isAuthPage) return redirect(onboarded ? '/dashboard' : '/onboarding')
  if (!onboarded && pathname.startsWith('/dashboard')) return redirect('/onboarding')
  if (onboarded && pathname.startsWith('/onboarding')) return redirect('/dashboard')

  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/onboarding/:path*', '/auth'],
}
