import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error_description = requestUrl.searchParams.get('error_description')

  console.log('=== OAuth Callback Debug ===')
  console.log('Has code:', !!code)
  console.log('Error description:', error_description)
  console.log('Full URL:', requestUrl.href)

  if (error_description) {
    console.error('OAuth error from provider:', error_description)
    return NextResponse.redirect(new URL(`/auth?error=${encodeURIComponent(error_description)}`, request.url))
  }

  if (code) {
    const supabase = await createClient()

    // Exchange code for session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Error exchanging code:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      return NextResponse.redirect(new URL('/auth?error=oauth', request.url))
    }

    console.log('✅ OAuth session created successfully!')
    console.log('User email:', data.session?.user?.email)
    console.log('User ID:', data.session?.user?.id)
    console.log('Session expires at:', data.session?.expires_at)

    // Get the user
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      console.log('User found, checking profile...')

      // Check if profile exists
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', user.id)
        .single()

      console.log('Profile check - Error:', profileError)
      console.log('Profile check - Data:', profile)

      // If no profile exists (new OAuth user), create one
      if (profileError || !profile) {
        console.log('Creating new profile for OAuth user...')
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            onboarding_completed: false,
            language: 'en',
            updated_at: new Date().toISOString()
          })

        if (insertError) {
          console.error('Error creating profile:', insertError)
        } else {
          console.log('✅ Profile created successfully')
        }

        // Redirect to onboarding for new users
        console.log('➡️  Redirecting to /onboarding (new user)')
        return NextResponse.redirect(new URL('/onboarding', request.url))
      }

      // If profile exists, check onboarding status
      if (profile.onboarding_completed) {
        console.log('➡️  Redirecting to /dashboard/(onboarding completed)')
        return NextResponse.redirect(new URL('/dashboard/', request.url))
      } else {
        console.log('➡️  Redirecting to /onboarding (incomplete)')
        return NextResponse.redirect(new URL('/onboarding', request.url))
      }
    }
  }

  // If something went wrong, redirect to auth page
  console.log('❌ No code or user found, redirecting to /auth')
  return NextResponse.redirect(new URL('/auth', request.url))
}