'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Eye, EyeOff } from 'lucide-react'

function AuthPageContent() {
  const [isLogin, setIsLogin]           = useState(true)
  const [email, setEmail]               = useState('')
  const [password, setPassword]         = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState('')
  const router       = useRouter()
  const searchParams = useSearchParams()

  const getRedirectUrl = () =>
    typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : ''

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const { data: profile } = await supabase
        .from('profiles').select('onboarding_completed').eq('id', session.user.id).single()
      const next = searchParams.get('next') || '/dashboard'
      router.replace(profile?.onboarding_completed ? next : '/onboarding')
    }
    checkSession()
  }, [router, searchParams])

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        const { data: profile } = await supabase
          .from('profiles').select('onboarding_completed').eq('id', data.user.id).single()
        const next = searchParams.get('next') || '/dashboard'
        router.replace(profile?.onboarding_completed ? next : '/onboarding')
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        if (data.user) router.replace('/onboarding')
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError('')
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: getRedirectUrl(),
          queryParams: { access_type: 'offline', prompt: 'consent' },
        },
      })
      if (error) throw error
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed.')
      setLoading(false)
    }
  }

  const LABEL: React.CSSProperties = {
    display: 'block',
    fontFamily: 'var(--font-mono)',
    fontSize: 10,
    letterSpacing: '0.12em',
    color: 'var(--ink-3)',
    marginBottom: 6,
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'clamp(24px,6vw,48px) 16px',
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>

        {/* Brand */}
        <div style={{ marginBottom: 40 }}>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontWeight: 800,
            fontSize: 'clamp(40px,8vw,56px)', color: 'var(--ink)',
            letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 6,
          }}>
            SATORI.
          </h1>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.14em' }}>
            MENTAL WELLNESS PLATFORM
          </p>
        </div>

        {/* Card */}
        <div style={{ border: '1.5px solid var(--border)' }}>

          {/* Tab toggle */}
          <div style={{ display: 'flex', borderBottom: '1.5px solid var(--border)' }}>
            {(['SIGN IN', 'SIGN UP'] as const).map((label, i) => (
              <button
                key={label}
                onClick={() => { setIsLogin(i === 0); setError('') }}
                style={{
                  flex: 1,
                  padding: '14px 0',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: 12,
                  letterSpacing: '0.06em',
                  background: isLogin === (i === 0) ? 'var(--bg-invert)' : 'var(--bg)',
                  color: isLogin === (i === 0) ? 'var(--ink-invert)' : 'var(--ink-3)',
                  border: 'none',
                  borderRight: i === 0 ? '1.5px solid var(--border)' : 'none',
                  cursor: 'pointer',
                  transition: 'background 80ms, color 80ms',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <div style={{ padding: 'clamp(20px,4vw,32px)' }}>

            {/* Google */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                padding: '13px',
                background: '#fff',
                border: '1.5px solid var(--border)',
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 12,
                letterSpacing: '0.06em',
                color: 'var(--ink)',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                marginBottom: 20,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              CONTINUE WITH GOOGLE
            </button>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border-2)' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.1em' }}>OR</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border-2)' }} />
            </div>

            {/* Form */}
            <form onSubmit={handleEmailAuth}>
              {/* Email */}
              <div style={{ marginBottom: 14 }}>
                <label style={LABEL}>EMAIL</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="br-input"
                  style={{ width: '100%', padding: '12px 14px', fontSize: 14, boxSizing: 'border-box' }}
                />
              </div>

              {/* Password */}
              <div style={{ marginBottom: 16, position: 'relative' }}>
                <label style={LABEL}>PASSWORD</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="br-input"
                  style={{ width: '100%', padding: '12px 44px 12px 14px', fontSize: 14, boxSizing: 'border-box' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  style={{
                    position: 'absolute', right: 12, bottom: 12,
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--ink-3)', display: 'flex',
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Error */}
              {error && (
                <div style={{
                  marginBottom: 14,
                  padding: '10px 14px',
                  border: '1.5px solid var(--accent)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  color: 'var(--accent)',
                  letterSpacing: '0.06em',
                }}>
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="br-btn br-btn-inv"
                style={{
                  width: '100%',
                  padding: '14px',
                  fontSize: 13,
                  letterSpacing: '0.06em',
                  opacity: loading ? 0.6 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? 'PLEASE WAIT...' : isLogin ? 'SIGN IN →' : 'CREATE ACCOUNT →'}
              </button>
            </form>

            {/* Note */}
            <p style={{
              marginTop: 16,
              textAlign: 'center',
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: 'var(--ink-3)',
              letterSpacing: '0.08em',
              lineHeight: 1.6,
            }}>
              YOUR DATA IS PRIVATE AND SECURE.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.14em' }}>
          LOADING...
        </span>
      </div>
    }>
      <AuthPageContent />
    </Suspense>
  )
}
