'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'

const NAV_ITEMS: ({ label: string; href: string; badge?: true } | null)[] = [
  { label: 'HOME',          href: '/dashboard' },
  { label: 'KOKORO',        href: '/dashboard/kokoro' },
  { label: 'MOOD',          href: '/dashboard/mood' },
  { label: 'JOURNAL',       href: '/dashboard/journal' },
  null,
  { label: 'RECORD TODAY',  href: '/dashboard/today', badge: true },
  { label: 'HISTORY',       href: '/dashboard/history' },
  null,
  { label: 'POMODORO',      href: '/dashboard/pomodoro' },
  { label: 'BREATHING',     href: '/dashboard/breathing' },
  { label: 'MOOD GRAPH',    href: '/dashboard/graph' },
  { label: 'STRESS',        href: '/dashboard/research' },
  null,
  { label: 'HELP',          href: '/dashboard/helpline' },
  { label: 'RESEARCH DATA', href: '/dashboard/research-data' },
  { label: 'PROFILE',       href: '/dashboard/profile' },
  { label: 'SETTINGS',      href: '/dashboard/settings' },
  { label: 'ABOUT',         href: '/dashboard/creator' },
]

const MOBILE_TABS = [
  { label: 'HOME',    href: '/dashboard' },
  { label: 'TODAY',   href: '/dashboard/today', badge: true as true },
  { label: 'CHAT',    href: '/dashboard/kokoro' },
  { label: 'JOURNAL', href: '/dashboard/journal' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter()
  const pathname = usePathname()
  const [authReady, setAuthReady]     = useState(false)
  const [menuOpen, setMenuOpen]       = useState(false)
  const [todayPending, setTodayPending] = useState(false)

  const refreshTodayStatus = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
    const todayStr = todayStart.toISOString()
    const [{ data: md }, { data: sd }] = await Promise.all([
      supabase.from('moods').select('id').eq('user_id', session.user.id)
        .gte('created_at', todayStr).limit(1),
      supabase.from('academic_stress').select('id').eq('user_id', session.user.id)
        .gte('created_at', todayStr).limit(1),
    ])
    setTodayPending(!((md?.length ?? 0) > 0 && (sd?.length ?? 0) > 0))
  }, [])

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
          if (!session) { router.replace('/auth'); return }
          const { data: profile } = await supabase.from('profiles')
            .select('onboarding_completed').eq('id', session.user.id).single()
          if (!profile?.onboarding_completed) { router.replace('/onboarding'); return }
          setAuthReady(true)
          refreshTodayStatus()
        } else if (event === 'TOKEN_REFRESHED') {
          if (!session) { router.replace('/auth'); return }
          setAuthReady(true)
          refreshTodayStatus()
        } else if (event === 'SIGNED_OUT') {
          router.replace('/auth')
        }
      }
    )
    return () => subscription.unsubscribe()
  }, [router, refreshTodayStatus])

  useEffect(() => { setMenuOpen(false) }, [pathname])
  useEffect(() => { refreshTodayStatus() }, [pathname, refreshTodayStatus])

  if (!authReady) {
    return (
      <div className="min-h-screen flex flex-col gap-3 items-center justify-center" style={{ background: 'var(--bg)' }}>
        {[120, 80, 48].map((w, i) => (
          <div key={i} className="skeleton" style={{ width: w, height: 14 }} />
        ))}
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ── Main content ── */}
      <main style={{ minHeight: '100vh' }}>
        <div className="px-4 pt-6 pb-28 sm:px-10 sm:pt-12 lg:pb-12">
          {children}
        </div>
      </main>

      {/* ── Floating glassmorphic menu button ── */}
      <button
        onClick={() => setMenuOpen(true)}
        aria-label="Open menu"
        style={{
          position: 'fixed', top: 20, right: 20, zIndex: 50,
          width: 44, height: 44,
          background: 'rgba(244,242,238,0.72)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1.5px solid rgba(12,12,12,0.18)',
          boxShadow: '2px 2px 0px rgba(12,12,12,0.12)',
          cursor: 'pointer',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 5,
        }}
      >
        <span style={{ display: 'block', width: 16, height: 1.5, background: 'var(--ink)' }} />
        <span style={{ display: 'block', width: 16, height: 1.5, background: 'var(--ink)' }} />
        <span style={{ display: 'block', width: 16, height: 1.5, background: 'var(--ink)' }} />
        {todayPending && (
          <span style={{
            position: 'absolute', top: 7, right: 7,
            width: 7, height: 7, borderRadius: '50%',
            background: 'var(--accent)',
            border: '1.5px solid rgba(244,242,238,0.9)',
          }} />
        )}
      </button>

      {/* ── Menu overlay ── */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => setMenuOpen(false)}
              style={{
                position: 'fixed', inset: 0, zIndex: 60,
                background: 'rgba(12,12,12,0.35)',
                backdropFilter: 'blur(6px)',
                WebkitBackdropFilter: 'blur(6px)',
              }}
            />

            <motion.div
              key="panel"
              initial={{ opacity: 0, y: -12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.96 }}
              transition={{ duration: 0.18, ease: [0.25, 0, 0, 1] }}
              style={{
                position: 'fixed', top: 14, right: 14, zIndex: 70,
                width: 220,
                background: 'rgba(244,242,238,0.88)',
                backdropFilter: 'blur(28px)',
                WebkitBackdropFilter: 'blur(28px)',
                border: '1.5px solid rgba(12,12,12,0.14)',
                boxShadow: '6px 6px 0px rgba(12,12,12,0.12)',
              }}
            >
              {/* Panel header */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 18px',
                borderBottom: '1px solid rgba(12,12,12,0.1)',
              }}>
                <span style={{
                  fontFamily: 'var(--font-display)', fontWeight: 800,
                  fontSize: 15, color: 'var(--ink)', letterSpacing: '-0.01em',
                }}>
                  SATORI
                </span>
                <button
                  onClick={() => setMenuOpen(false)}
                  style={{
                    width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    fontFamily: 'var(--font-mono)', fontSize: 18, color: 'var(--ink-2)', lineHeight: 1,
                  }}
                >
                  ×
                </button>
              </div>

              {/* Nav */}
              <nav style={{ padding: '6px 0' }}>
                {NAV_ITEMS.map((item, i) =>
                  item === null ? (
                    <div key={`d-${i}`} style={{ borderTop: '1px solid rgba(12,12,12,0.07)', margin: '3px 0' }} />
                  ) : (
                    <Link
                      key={item.href}
                      href={item.href}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '7px 18px',
                        fontFamily: 'var(--font-display)',
                        fontWeight: 700,
                        fontSize: 12,
                        letterSpacing: '0.06em',
                        color: pathname === item.href ? 'var(--ink-invert)' : 'var(--ink)',
                        background: pathname === item.href ? 'var(--bg-invert)' : 'transparent',
                        textDecoration: 'none',
                        transition: 'background 80ms, color 80ms',
                      }}
                      onMouseEnter={e => {
                        if (pathname !== item.href)
                          (e.currentTarget as HTMLElement).style.background = 'rgba(12,12,12,0.07)'
                      }}
                      onMouseLeave={e => {
                        if (pathname !== item.href)
                          (e.currentTarget as HTMLElement).style.background = 'transparent'
                      }}
                    >
                      {item.label}
                      {item.badge && todayPending && (
                        <span style={{
                          width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                          background: pathname === item.href ? 'var(--ink-invert)' : 'var(--accent)',
                        }} />
                      )}
                    </Link>
                  )
                )}
              </nav>

              {/* Sign out */}
              <div style={{ borderTop: '1px solid rgba(12,12,12,0.1)', padding: '4px 0 4px' }}>
                <button
                  onClick={async () => { await supabase.auth.signOut(); router.replace('/') }}
                  style={{
                    display: 'block', width: '100%', padding: '8px 18px', textAlign: 'left',
                    fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12,
                    letterSpacing: '0.06em', color: 'var(--accent)',
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    transition: 'background 80ms',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--accent-bg)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                >
                  SIGN OUT
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Mobile bottom nav ── */}
      <nav
        className="lg:hidden"
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40,
          background: 'rgba(244,242,238,0.92)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          borderTop: '1.5px solid var(--border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'stretch' }}>
          {MOBILE_TABS.map(tab => {
            const isActive = pathname === tab.href
            return (
              <Link
                key={tab.href}
                href={tab.href}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '12px 0',
                  fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 9,
                  letterSpacing: '0.06em',
                  color: isActive ? 'var(--ink-invert)' : 'var(--ink-3)',
                  background: isActive ? 'var(--bg-invert)' : 'transparent',
                  borderRight: '1px solid var(--border-2)',
                  textDecoration: 'none', transition: 'background 80ms',
                  position: 'relative',
                }}
              >
                {tab.label}
                {tab.badge && todayPending && !isActive && (
                  <span style={{
                    position: 'absolute', top: 6, right: '25%',
                    width: 6, height: 6, borderRadius: '50%',
                    background: 'var(--accent)',
                    border: '1.5px solid rgba(244,242,238,0.92)',
                  }} />
                )}
              </Link>
            )
          })}
          <button
            onClick={() => setMenuOpen(true)}
            style={{
              flex: 1, padding: '12px 0',
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 9,
              letterSpacing: '0.06em', color: 'var(--ink-3)',
              background: 'transparent', border: 'none', cursor: 'pointer',
              position: 'relative',
            }}
          >
            MENU
            {todayPending && (
              <span style={{
                position: 'absolute', top: 6, right: '25%',
                width: 6, height: 6, borderRadius: '50%',
                background: 'var(--accent)',
                border: '1.5px solid rgba(244,242,238,0.92)',
              }} />
            )}
          </button>
        </div>
      </nav>
    </div>
  )
}
