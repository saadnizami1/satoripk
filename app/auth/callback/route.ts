import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error_description = requestUrl.searchParams.get('error_description')

  if (error_description) {
    return NextResponse.redirect(
      new URL(`/auth?error=${encodeURIComponent(error_description)}`, request.url)
    )
  }

  if (code) {
    const supabase = await createClient()

    // Exchange code for session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      return NextResponse.redirect(new URL('/auth?error=oauth', request.url))
    }

    // Get the user
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      // Check if profile exists
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', user.id)
        .single()

      // If no profile exists (new OAuth user), create one
      if (profileError || !profile) {
        await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            onboarding_completed: false,
            language: 'en',
            updated_at: new Date().toISOString()
          })

        // Redirect to onboarding for new users
        return NextResponse.redirect(new URL('/onboarding', request.url))
      }

      // If profile exists, check onboarding status
      if (profile.onboarding_completed) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      } else {
        return NextResponse.redirect(new URL('/onboarding', request.url))
      }
    }
  }

  // If something went wrong, redirect to auth page
  return NextResponse.redirect(new URL('/auth', request.url))
}