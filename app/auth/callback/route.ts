import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Only allow same-site relative paths, never "//evil.com" or absolute URLs.
function safeNext(next: string | null) {
  return next && next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard'
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const errorDescription = requestUrl.searchParams.get('error_description')

  if (errorDescription) {
    return NextResponse.redirect(
      new URL(`/auth?error=${encodeURIComponent(errorDescription)}`, request.url)
    )
  }

  if (!code) {
    return NextResponse.redirect(new URL('/auth', request.url))
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)
  if (error || !data.user) {
    return NextResponse.redirect(new URL('/auth?error=oauth', request.url))
  }

  // The profile row is created by the on_auth_user_created DB trigger.
  const { data: profile } = await supabase
    .from('profiles').select('onboarding_completed').eq('id', data.user.id).maybeSingle()

  const destination = profile?.onboarding_completed
    ? safeNext(requestUrl.searchParams.get('next'))
    : '/onboarding'
  return NextResponse.redirect(new URL(destination, request.url))
}
