'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Menu, X, Settings } from 'lucide-react'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { CHECKIN_EVENT, startOfToday } from '@/lib/dates'
import { Logo } from '@/components/ui/kit'

type NavItem = { label: string; href: string; badge?: true }

// Every dashboard page appears here. Core ones also sit in the top bar
// (desktop) and the bottom tabs (phones).
const NAV_GROUPS: { title: string; items: NavItem[] }[] = [
  { title: 'Every day', items: [
    { label: 'Home', href: '/dashboard' },
    { label: 'Record today', href: '/dashboard/today', badge: true },
    { label: 'Talk to Kokoro', href: '/dashboard/kokoro' },
    { label: 'Journal', href: '/dashboard/journal' },
  ] },
  { title: 'Tools', items: [
    { label: 'Mood check-in', href: '/dashboard/mood' },
    { label: 'Focus timer', href: '/dashboard/pomodoro' },
    { label: 'Breathing', href: '/dashboard/breathing' },
    { label: 'Academic stress', href: '/dashboard/research' },
  ] },
  { title: 'Look back', items: [
    { label: 'Mood graph', href: '/dashboard/graph' },
    { label: 'Stress insights', href: '/dashboard/research/insights' },
    { label: 'History', href: '/dashboard/history' },
  ] },
  { title: 'You', items: [
    { label: 'Get help', href: '/dashboard/helpline' },
    { label: 'Profile', href: '/dashboard/profile' },
    { label: 'Settings', href: '/dashboard/settings' },
    { label: 'Study survey', href: '/dashboard/survey' },
    { label: 'For researchers', href: '/dashboard/research-data' },
    { label: 'About Satori', href: '/dashboard/creator' },
  ] },
]

const TOP_NAV: NavItem[] = [
  { label: 'Home', href: '/dashboard' },
  { label: 'Today', href: '/dashboard/today', badge: true },
  { label: 'Kokoro', href: '/dashboard/kokoro' },
  { label: 'Journal', href: '/dashboard/journal' },
  { label: 'Insights', href: '/dashboard/graph' },
  { label: 'Help', href: '/dashboard/helpline' },
]

const MOBILE_TABS: NavItem[] = [
  { label: 'Home', href: '/dashboard' },
  { label: 'Today', href: '/dashboard/today', badge: true },
  { label: 'Kokoro', href: '/dashboard/kokoro' },
  { label: 'Journal', href: '/dashboard/journal' },
]

function PendingDot({ label = 'not recorded yet' }: { label?: string }) {
  return (
    <span className="pending-dot" role="img" aria-label={label} />
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter()
  const pathname = usePathname()
  const reduce   = useReducedMotion()
  const [menuOpen, setMenuOpen]         = useState(false)
  const [todayPending, setTodayPending] = useState(false)
  const [initial, setInitial]           = useState('')

  const refreshTodayStatus = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const todayStr = startOfToday()
    const [{ data: md }, { data: sd }] = await Promise.all([
      supabase.from('moods').select('id').eq('user_id', session.user.id)
        .gte('created_at', todayStr).limit(1),
      supabase.from('academic_stress').select('id').eq('user_id', session.user.id)
        .gte('created_at', todayStr).limit(1),
    ])
    setTodayPending(!((md?.length ?? 0) > 0 && (sd?.length ?? 0) > 0))
  }, [])

  // Auth and onboarding are enforced by the proxy before this renders, so
  // the layout never blocks on a profile query. It only reacts to a
  // sign-out (e.g. from another tab).
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        if (event === 'SIGNED_OUT' || (event === 'INITIAL_SESSION' && !session)) {
          router.replace('/auth')
        }
        if (session?.user?.email) setInitial(session.user.email[0].toUpperCase())
      }
    )
    return () => subscription.unsubscribe()
  }, [router])

  // Re-check the badge on mount and whenever a page records a check-in.
  useEffect(() => {
    refreshTodayStatus()
    window.addEventListener(CHECKIN_EVENT, refreshTodayStatus)
    return () => window.removeEventListener(CHECKIN_EVENT, refreshTodayStatus)
  }, [refreshTodayStatus])

  useEffect(() => { setMenuOpen(false) }, [pathname])

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false)
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [menuOpen])

  const isHome = pathname === '/dashboard'
  const isActive = (href: string) => href === '/dashboard' ? pathname === href : pathname === href || pathname.startsWith(href + '/')

  return (
    <div className={`app ${isHome ? 'app--night on-dark' : ''}`}>
      <a href="#app-main" className="skip-link">Skip to content</a>

      {/* ── Top bar ── */}
      <header className="app-bar">
        <div className="app-bar__inner">
          <Link href="/dashboard" aria-label="Satori home" style={{ textDecoration: 'none' }}>
            <Logo tone={isHome ? 'paper' : 'ink'} size={24} />
          </Link>
          <nav aria-label="Main" className="app-nav">
            {TOP_NAV.map(item => (
              <Link key={item.href} href={item.href} className="app-nav__link" aria-current={isActive(item.href) ? 'page' : undefined}>
                {item.label}
                {item.badge && todayPending && <PendingDot />}
              </Link>
            ))}
          </nav>
          <div className="row" style={{ gap: 6, flexWrap: 'nowrap' }}>
            <Link href="/dashboard/settings" className="icon-btn app-hide-sm" aria-label="Settings"><Settings size={20} strokeWidth={1.6} /></Link>
            <Link href="/dashboard/profile" className="avatar-btn" aria-label="Your profile">{initial || 'S'}</Link>
            <button type="button" className="icon-btn" aria-label="Open menu" aria-expanded={menuOpen} aria-controls="app-menu" onClick={() => setMenuOpen(true)}>
              <Menu size={22} strokeWidth={1.8} />
            </button>
          </div>
        </div>
      </header>

      <main id="app-main" className="app-main">{children}</main>

      {/* ── Menu sheet ── */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div key="scrim" className="menu-scrim" onClick={() => setMenuOpen(false)}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} />
            <motion.div
              key="sheet" id="app-menu" role="dialog" aria-modal="true" aria-label="Menu" className="menu-sheet"
              initial={reduce ? { opacity: 0 } : { x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
              exit={reduce ? { opacity: 0 } : { x: 40, opacity: 0 }} transition={{ duration: 0.24, ease: [0.2, 0.7, 0.2, 1] }}
            >
              <div className="menu-sheet__head">
                <Logo size={22} />
                <button type="button" className="icon-btn" aria-label="Close menu" onClick={() => setMenuOpen(false)} autoFocus>
                  <X size={22} />
                </button>
              </div>
              <nav aria-label="All pages" className="menu-sheet__nav">
                {NAV_GROUPS.map(g => (
                  <div key={g.title}>
                    <p className="menu-sheet__group">{g.title}</p>
                    {g.items.map(item => (
                      <Link key={item.href} href={item.href} className="menu-link" aria-current={isActive(item.href) ? 'page' : undefined}>
                        {item.label}
                        {item.badge && todayPending && <PendingDot />}
                      </Link>
                    ))}
                  </div>
                ))}
              </nav>
              <button type="button" className="menu-link menu-link--danger"
                onClick={async () => { await supabase.auth.signOut(); window.location.href = '/' }}>
                Sign out
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Phone tab bar ── */}
      <nav aria-label="Quick" className="tabbar">
        {MOBILE_TABS.map(tab => (
          <Link key={tab.href} href={tab.href} className="tabbar__tab" aria-current={isActive(tab.href) ? 'page' : undefined}>
            {tab.label}
            {tab.badge && todayPending && <PendingDot />}
          </Link>
        ))}
        <button type="button" className="tabbar__tab" onClick={() => setMenuOpen(true)} aria-expanded={menuOpen} aria-controls="app-menu">
          Menu
        </button>
      </nav>

      <style>{`
        .app { min-height: 100svh; background: var(--fog); color: var(--ink); }
        .app--night { background: var(--night); color: var(--on-dark); }
        .app-bar { position: sticky; top: 0; z-index: 40; padding: 12px var(--gutter) 0; }
        .app-bar__inner {
          max-width: var(--container); margin: 0 auto; display: flex; align-items: center; justify-content: space-between; gap: 12px;
          padding: 8px 8px 8px 20px; border-radius: var(--r-pill);
          background: rgba(255,253,247,0.86); border: 1px solid rgba(17,17,17,0.06);
          backdrop-filter: blur(14px) saturate(1.2); -webkit-backdrop-filter: blur(14px) saturate(1.2);
          box-shadow: 0 10px 30px -20px rgba(15,30,46,0.5);
        }
        .app--night .app-bar__inner { background: rgba(15,30,46,0.7); border-color: var(--line-dark); }
        .app-nav { display: flex; gap: 2px; }
        .app-nav__link {
          position: relative; display: inline-flex; align-items: center; gap: 6px; min-height: 44px; padding: 0 16px;
          border-radius: var(--r-pill); text-decoration: none; font-weight: 500; font-size: 15px; color: var(--ink-2);
          transition: background 180ms, color 180ms;
        }
        .app-nav__link:hover { background: rgba(17,17,17,0.06); color: var(--ink); }
        .app-nav__link[aria-current="page"] { background: var(--tape); color: var(--paper); }
        .app--night .app-nav__link { color: var(--on-dark-2); }
        .app--night .app-nav__link:hover { background: rgba(255,253,247,0.1); color: var(--on-dark); }
        .app--night .app-nav__link[aria-current="page"] { background: var(--paper); color: var(--ink); }
        .icon-btn { display: inline-grid; place-items: center; width: 44px; height: 44px; border-radius: 50%; border: 0; background: transparent; cursor: pointer; color: inherit; text-decoration: none; }
        .icon-btn:hover { background: rgba(17,17,17,0.06); }
        .app--night .icon-btn:hover { background: rgba(255,253,247,0.1); }
        .avatar-btn { display: inline-grid; place-items: center; width: 40px; height: 40px; border-radius: 50%; background: var(--marigold); color: var(--ink); font: 400 19px/1 var(--font-display); text-decoration: none; }
        .pending-dot { display: inline-block; width: 9px; height: 9px; border-radius: 50%; background: var(--marigold); box-shadow: 0 0 0 2px var(--ink); flex-shrink: 0; }
        .app--night .pending-dot { box-shadow: 0 0 0 2px var(--paper); }
        .app-main { max-width: var(--container); margin: 0 auto; padding: 28px var(--gutter) 64px; }

        .menu-scrim { position: fixed; inset: 0; z-index: 60; background: rgba(15,30,46,0.45); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); }
        .menu-sheet {
          position: fixed; top: 12px; right: 12px; bottom: 12px; z-index: 70; width: min(360px, calc(100vw - 24px));
          display: flex; flex-direction: column; background: var(--paper); color: var(--ink); border-radius: 24px;
          box-shadow: 0 30px 60px -20px rgba(0,0,0,0.5); overflow: hidden;
        }
        .menu-sheet__head { display: flex; align-items: center; justify-content: space-between; padding: 14px 14px 10px 22px; border-bottom: 1px solid var(--line); }
        .menu-sheet__nav { flex: 1; overflow-y: auto; padding: 8px 12px 12px; }
        .menu-sheet__group { font-size: 13px; font-weight: 600; color: var(--ink-3); padding: 14px 12px 4px; }
        .menu-link {
          display: flex; align-items: center; justify-content: space-between; width: 100%; min-height: 44px; padding: 0 12px;
          border-radius: 12px; border: 0; background: none; cursor: pointer; text-align: left; text-decoration: none;
          font: 500 16px/1.2 var(--font-body); color: var(--ink);
        }
        .menu-link:hover { background: var(--fog); }
        .menu-link[aria-current="page"] { background: var(--tape); color: var(--paper); }
        .menu-link[aria-current="page"] .pending-dot { box-shadow: 0 0 0 2px var(--paper); }
        .menu-link--danger { color: var(--danger); margin: 0 12px 12px; width: calc(100% - 24px); border-top: 1px solid var(--line); border-radius: 0 0 12px 12px; padding-top: 4px; }
        .menu-link--danger:hover { background: var(--danger-bg); }

        .tabbar { display: none; }
        @media (max-width: 899px) {
          .app-nav { display: none; }
        }
        @media (max-width: 760px) {
          .app-hide-sm { display: none !important; }
          .app-bar { padding: 8px 10px 0; }
          .app-main { padding: 20px 16px calc(96px + env(safe-area-inset-bottom, 0px)); }
          .tabbar {
            position: fixed; left: 10px; right: 10px; bottom: calc(10px + env(safe-area-inset-bottom, 0px)); z-index: 40;
            display: grid; grid-template-columns: repeat(5, 1fr); padding: 6px; border-radius: var(--r-pill);
            background: var(--tape); box-shadow: 0 16px 30px -12px rgba(0,0,0,0.5);
          }
          .tabbar__tab {
            position: relative; display: inline-flex; align-items: center; justify-content: center; gap: 5px; min-height: 48px;
            border-radius: var(--r-pill); border: 0; background: none; cursor: pointer; text-decoration: none;
            font: 600 13px/1 var(--font-body); color: var(--on-dark-2);
          }
          .tabbar__tab[aria-current="page"] { background: var(--paper); color: var(--ink); }
          .tabbar .pending-dot { box-shadow: 0 0 0 2px var(--tape); width: 7px; height: 7px; position: absolute; top: 9px; right: 18%; }
        }
      `}</style>
    </div>
  )
}
