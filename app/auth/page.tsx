'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Eye, EyeOff } from 'lucide-react'
import { Logo, Scene, TapeHeading } from '@/components/ui/kit'
import { Sticker } from '@/components/ui/stickers'

const AUTH_ERRORS: Record<string, string> = {
  oauth: 'Google sign-in didn’t finish. Try again, or use your email instead.',
}

// Only allow same-site relative paths as post-login destinations.
function safeNext(next: string | null) {
  return next && next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard'
}

function AuthPageContent() {
  const searchParams = useSearchParams()
  const urlError     = searchParams.get('error')
  const [isLogin, setIsLogin]           = useState(searchParams.get('mode') !== 'signup')
  const [email, setEmail]               = useState('')
  const [password, setPassword]         = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState(urlError ? (AUTH_ERRORS[urlError] ?? urlError) : '')
  const [notice, setNotice]             = useState('')
  const router = useRouter()
  const next   = safeNext(searchParams.get('next'))

  const getRedirectUrl = () =>
    typeof window !== 'undefined'
      ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
      : ''

  // Signed-in visitors never reach this page — the proxy redirects them.
  // After signing in, navigate to `next`; the proxy sends anyone who hasn't
  // finished onboarding to /onboarding instead.
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setNotice('')
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.replace(next)
      } else {
        const { data, error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: getRedirectUrl() },
        })
        if (error) throw error
        if (data.session) {
          router.replace('/onboarding')
        } else if (data.user && data.user.identities?.length === 0) {
          setError('An account with this email already exists. Log in instead.')
        } else {
          setNotice('Check your email for a confirmation link to finish signing up.')
        }
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
          queryParams: { prompt: 'select_account' },
        },
      })
      if (error) throw error
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed.')
      setLoading(false)
    }
  }

  const switchMode = (login: boolean) => { setIsLogin(login); setError(''); setNotice('') }

  return (
    <div className="auth">
      <Scene src="/art/dusk.webp" priority position="center 70%" className="on-dark auth__art"
        scrim="linear-gradient(180deg, rgba(15,30,46,0.6), rgba(15,30,46,0) 55%)" sizes="(max-width: 860px) 100vw, 50vw">
        <div className="auth__art-inner">
          <Link href="/" aria-label="Satori home" style={{ textDecoration: 'none' }}><Logo tone="paper" /></Link>
          <p className="t-h3 auth__quote">a quiet place for the loudest years</p>
        </div>
      </Scene>

      <main className="auth__panel">
        <div className="auth__form">
          <Sticker name="kite" size={74} tilt={14} className="auth__sticker" />
          <TapeHeading as="h1" lines={isLogin ? ['welcome', 'back'] : ['make your', 'space']}
            accent={isLogin ? 'back' : 'space'} size="t-h1" />
          <p className="t-lead muted" style={{ marginTop: 16 }}>
            {isLogin ? 'Log in to pick up where you left off.' : 'Free, private, and about a minute to set up.'}
          </p>

          <button type="button" onClick={handleGoogleSignIn} disabled={loading} className="pill pill--ghost pill--block" style={{ marginTop: 28, background: 'var(--paper)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" style={{ flexShrink: 0 }}>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div className="auth__or" aria-hidden="true"><span>or with email</span></div>

          <form onSubmit={handleEmailAuth} className="stack" noValidate={false}>
            <div className="field">
              <label htmlFor="email" className="field__label">Email</label>
              <input id="email" type="email" autoComplete="email" placeholder="e.g. ayesha@gmail.com"
                value={email} onChange={e => setEmail(e.target.value)} required className="input" />
            </div>
            <div className="field">
              <label htmlFor="password" className="field__label">Password</label>
              <div style={{ position: 'relative' }}>
                <input id="password" type={showPassword ? 'text' : 'password'}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  minLength={8} aria-describedby={isLogin ? undefined : 'pw-hint'}
                  value={password} onChange={e => setPassword(e.target.value)} required
                  className="input" style={{ paddingRight: 56 }} />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword}
                  className="text-btn" style={{ position: 'absolute', right: 4, top: 5, width: 44, justifyContent: 'center', padding: 0 }}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {!isLogin && <div id="pw-hint" className="field__hint">At least 8 characters.</div>}
            </div>

            {error && <div className="notice notice--error" role="alert">{error}</div>}
            {notice && <div className="notice notice--ok" role="status">{notice}</div>}

            <button type="submit" disabled={loading} className="pill pill--tape pill--lg pill--block">
              {loading ? 'One moment…' : isLogin ? 'Log in' : 'Create my account'}
            </button>
          </form>

          <p className="t-body muted" style={{ marginTop: 22, textAlign: 'center' }}>
            {isLogin ? 'New here?' : 'Already have an account?'}{' '}
            <button type="button" className="link" onClick={() => switchMode(!isLogin)}
              style={{ background: 'none', border: 0, padding: '12px 4px', minHeight: 44, cursor: 'pointer', font: 'inherit', fontWeight: 600, color: 'var(--ink)' }}>
              {isLogin ? 'Make your space' : 'Log in'}
            </button>
          </p>
          <p className="t-small faint" style={{ marginTop: 28, textAlign: 'center' }}>
            Your journal is private to you. <Link href="/#privacy" className="link">How Satori uses data</Link>
          </p>
        </div>
      </main>

      <style>{`
        .auth { min-height: 100svh; display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 16px; padding: 16px; background: var(--fog); }
        .auth__art { border-radius: var(--r-lg); min-height: calc(100svh - 32px); position: sticky; top: 16px; background: var(--night); }
        .auth__art-inner { position: absolute; inset: 0; padding: 32px; display: flex; flex-direction: column; justify-content: space-between; }
        .auth__quote { color: var(--paper); max-width: 14ch; text-shadow: 0 2px 20px rgba(0,0,0,0.5); }
        .auth__panel { display: grid; place-items: center; padding: 48px 16px; }
        .auth__form { position: relative; width: 100%; max-width: 440px; }
        .auth__sticker { position: absolute; right: 0; top: -16px; }
        .auth__or { display: flex; align-items: center; gap: 12px; margin: 22px 0; color: var(--ink-3); font-size: 14px; }
        .auth__or::before, .auth__or::after { content: ''; flex: 1; height: 1px; background: var(--line); }
        @media (max-width: 860px) {
          .auth { grid-template-columns: 1fr; }
          .auth__art { min-height: 220px; position: relative; top: 0; }
          .auth__quote { display: none; }
          .auth__panel { padding: 24px 4px 48px; }
        }
      `}</style>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: 'var(--fog)' }} />}>
      <AuthPageContent />
    </Suspense>
  )
}
