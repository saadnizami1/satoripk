'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { X, Settings } from 'lucide-react'
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
    { label: 'About the research', href: '/about' },
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

// Each top tab is a different sheet of paper, hung at a slightly different angle.
const TAB_PAPER = ['#FFFDF7', '#F5C542', '#A9C4BE', '#9ED9C3', '#F4C6D7', '#FBE6A6']
const TAB_TILT = [-1.2, 0.8, -0.6, 1.1, -0.9, 0.7]

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

      {/* ── Top: binder tabs hanging from the top edge of the page ── */}
      <header className="app-top">
        <Link href="/dashboard" aria-label="Satori home" className="app-top__logo">
          <Logo tone={isHome ? 'paper' : 'ink'} size={24} />
        </Link>
        <nav aria-label="Main" className="tabs">
          {TOP_NAV.map((item, i) => (
            <Link key={item.href} href={item.href} className="tab" aria-current={isActive(item.href) ? 'page' : undefined}
              style={{ ['--tab' as string]: TAB_PAPER[i % TAB_PAPER.length], ['--tilt' as string]: `${TAB_TILT[i % TAB_TILT.length]}deg` }}>
              {item.label.toLowerCase()}
              {item.badge && todayPending && <PendingDot />}
            </Link>
          ))}
          <button type="button" className="tab tab--more" aria-label="All pages" aria-expanded={menuOpen} aria-controls="app-menu" onClick={() => setMenuOpen(true)}
            style={{ ['--tab' as string]: 'var(--tape)', ['--tilt' as string]: '1.4deg' }}>
            more
          </button>
        </nav>
        <div className="app-top__me">
          <Link href="/dashboard/settings" className="icon-btn app-hide-sm" aria-label="Settings"><Settings size={20} strokeWidth={1.6} /></Link>
          <Link href="/dashboard/profile" className="avatar-btn" aria-label="Your profile">{initial || 'S'}</Link>
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
        {MOBILE_TABS.map((tab, i) => (
          <Link key={tab.href} href={tab.href} className="tabbar__tab" aria-current={isActive(tab.href) ? 'page' : undefined}
            style={{ ['--tab' as string]: ['#FFFDF7', '#F5C542', '#A9C4BE', '#9ED9C3'][i], ['--tilt' as string]: `${[-1, 0.8, -0.6, 1][i]}deg` }}>
            {tab.label.toLowerCase()}
            {tab.badge && todayPending && <PendingDot />}
          </Link>
        ))}
        <button type="button" className="tabbar__tab" onClick={() => setMenuOpen(true)} aria-expanded={menuOpen} aria-controls="app-menu"
          style={{ ['--tab' as string]: 'var(--tape)', color: 'var(--paper)', ['--tilt' as string]: '1.2deg' }}>
          more
        </button>
      </nav>

      <style>{`
        .app { min-height: 100svh; background: var(--fog); color: var(--ink); }
        .app--night { background: var(--night); color: var(--on-dark); }
        .app-top { max-width: calc(var(--container) + 2 * var(--gutter)); margin: 0 auto; padding: 0 var(--gutter); display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; }
        .app-top__logo { padding-top: 20px; text-decoration: none; flex-shrink: 0; }
        .app-top__me { display: flex; align-items: center; gap: 6px; padding-top: 16px; flex-shrink: 0; }
        .tabs { display: flex; align-items: flex-start; gap: 6px; }
        .tab {
          position: relative; display: inline-flex; align-items: flex-end; gap: 7px; min-height: 64px; padding: 0 18px 12px;
          background: var(--tab); color: var(--ink); border: 0; cursor: pointer; text-decoration: none;
          font: 400 19px/1 var(--font-display); letter-spacing: -0.01em;
          border-radius: 0 0 12px 12px; transform-origin: top center;
          transform: translateY(-16px) rotate(var(--tilt));
          box-shadow: inset 0 12px 10px -10px rgba(0,0,0,0.35), 0 10px 14px -10px rgba(0,0,0,0.5);
          transition: transform 240ms var(--ease-pop);
        }
        .tab::after { content: ''; position: absolute; inset: 0; border-radius: inherit; pointer-events: none; opacity: 0.35; mix-blend-mode: multiply;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2'/%3E%3CfeColorMatrix values='0 0 0 0 .4 0 0 0 0 .35 0 0 0 0 .3 0 0 0 .22 0'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)'/%3E%3C/svg%3E"); }
        .tab:hover { transform: translateY(-8px) rotate(var(--tilt)); }
        .tab[aria-current="page"] { transform: translateY(0) rotate(0deg); min-height: 76px; padding-bottom: 14px; }
        .tab--more { color: var(--paper); }
        .tab .pending-dot, .tabbar__tab .pending-dot { background: var(--ink); box-shadow: 0 0 0 2px var(--tab, var(--paper)); }
        .tab:focus-visible { outline-offset: 2px; }
        .app--night .tab:focus-visible { outline-color: var(--marigold); }
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
        @media (max-width: 1020px) { .tab { padding: 0 13px 12px; font-size: 17px; } .tabs { gap: 4px; } }
        @media (max-width: 899px) { .tabs { display: none; } }
        @media (max-width: 760px) {
          .app-hide-sm { display: none !important; }
          .app-top { padding: 0 14px; }
          .app-top__logo { padding-top: 16px; }
          .app-top__me { padding-top: 12px; }
          .app-main { padding: 20px 16px calc(96px + env(safe-area-inset-bottom, 0px)); }
          .tabbar {
            position: fixed; left: 0; right: 0; bottom: 0; z-index: 40;
            display: grid; grid-template-columns: repeat(5, 1fr); align-items: end; gap: 4px;
            padding: 0 6px; pointer-events: none;
          }
          .tabbar__tab {
            pointer-events: auto; position: relative; display: inline-flex; align-items: flex-start; justify-content: center; gap: 4px;
            min-height: calc(54px + env(safe-area-inset-bottom, 0px)); padding-top: 12px;
            border: 0; cursor: pointer; text-decoration: none; border-radius: 12px 12px 0 0;
            background: var(--tab, var(--paper)); color: var(--ink); font: 400 17px/1 var(--font-display);
            transform: translateY(8px) rotate(var(--tilt, 0deg)); transform-origin: bottom center;
            box-shadow: inset 0 -12px 10px -10px rgba(0,0,0,0.3), 0 -6px 14px -8px rgba(0,0,0,0.45);
            transition: transform 220ms var(--ease-pop);
          }
          .tabbar__tab[aria-current="page"] { transform: translateY(0) rotate(0deg); min-height: calc(64px + env(safe-area-inset-bottom, 0px)); }
          .tabbar .pending-dot { width: 7px; height: 7px; position: absolute; top: 8px; right: 14%; }
        }
      `}</style>
    </div>
  )
}
