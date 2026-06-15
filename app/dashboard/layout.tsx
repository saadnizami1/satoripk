'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'

const NAV_ITEMS: ({ label: string; href: string } | null)[] = [
  { label: 'HOME',      href: '/dashboard' },
  { label: 'KOKORO',    href: '/dashboard/kokoro' },
  { label: 'MOOD',      href: '/dashboard/mood' },
  { label: 'JOURNAL',   href: '/dashboard/journal' },
  null,
  { label: 'POMODORO',  href: '/dashboard/pomodoro' },
  { label: 'BREATHING', href: '/dashboard/breathing' },
  { label: 'GRAPH',     href: '/dashboard/graph' },
  { label: 'STRESS',    href: '/dashboard/research' },
  null,
  { label: 'HELP',      href: '/dashboard/helpline' },
  { label: 'RESEARCH',  href: '/dashboard/research-data' },
]

const BOTTOM_NAV = [
  { label: 'PROFILE',  href: '/dashboard/profile' },
  { label: 'SETTINGS', href: '/dashboard/settings' },
]

const MOBILE_TABS = [
  { label: 'HOME',    href: '/dashboard' },
  { label: 'MOOD',    href: '/dashboard/mood' },
  { label: 'CHAT',    href: '/dashboard/kokoro' },
  { label: 'JOURNAL', href: '/dashboard/journal' },
  { label: 'MORE',    href: '#more' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter()
  const pathname = usePathname()
  const [profile, setProfile]       = useState<any>(null)
  const [authReady, setAuthReady]   = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (!session) { router.replace('/auth'); return }
          setAuthReady(true)
          const { data } = await supabase
            .from('profiles')
            .select('name, email')
            .eq('id', session.user.id)
            .single()
          setProfile(data)
        } else if (event === 'SIGNED_OUT') {
          router.replace('/auth')
        }
      }
    )
    return () => subscription.unsubscribe()
  }, [router])

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut()
    router.replace('/')
  }, [router])

  if (!authReady) {
    return (
      <div
        className="min-h-screen flex flex-col gap-3 items-center justify-center"
        style={{ background: 'var(--bg)' }}
      >
        {[120, 80, 48].map((w, i) => (
          <div key={i} className="skeleton" style={{ width: w, height: 14 }} />
        ))}
      </div>
    )
  }

  const initials = profile?.name
    ? profile.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'
  const firstName = profile?.name?.split(' ')[0] || 'USER'

  function NavItem({ label, href, onClick }: { label: string; href: string; onClick?: () => void }) {
    const isActive = pathname === href
    return (
      <Link
        href={href}
        onClick={onClick}
        style={{
          display: 'block',
          padding: '7px 16px',
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: 13,
          letterSpacing: '0.06em',
          color: isActive ? 'var(--ink-invert)' : 'var(--ink-2)',
          background: isActive ? 'var(--bg-invert)' : 'transparent',
          transition: `background ${80}ms, color ${80}ms`,
          cursor: 'pointer',
          textDecoration: 'none',
          width: '100%',
        }}
        onMouseEnter={e => {
          if (!isActive) (e.currentTarget as HTMLElement).style.background = 'var(--border-2)'
        }}
        onMouseLeave={e => {
          if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'
        }}
      >
        {label}
      </Link>
    )
  }

  function SidebarContent({ onClose }: { onClose?: () => void }) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Logo */}
        <div style={{ padding: '20px 16px 16px', borderBottom: '1.5px solid var(--border)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
            SATORI
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)', marginTop: 2, letterSpacing: '0.04em' }}>
            さとり
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }} className="scrollbar-hide">
          {NAV_ITEMS.map((item, i) =>
            item === null ? (
              <div key={`divider-${i}`} style={{ borderTop: '1px solid var(--border-2)', margin: '4px 0' }} />
            ) : (
              <NavItem key={item.href} label={item.label} href={item.href} onClick={onClose} />
            )
          )}
        </nav>

        {/* Bottom */}
        <div style={{ borderTop: '1.5px solid var(--border)', padding: '8px 0 0' }}>
          {BOTTOM_NAV.map(item => (
            <NavItem key={item.href} label={item.label} href={item.href} onClick={onClose} />
          ))}

          {/* Profile row */}
          <div style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 10, borderTop: '1px solid var(--border-2)', marginTop: 4 }}>
            <div style={{
              width: 28, height: 28, background: 'var(--bg-invert)', color: 'var(--ink-invert)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 11, flexShrink: 0,
            }}>
              {initials}
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.04em' }}>
              {firstName}
            </span>
          </div>

          <button
            onClick={handleLogout}
            style={{
              display: 'block', width: '100%', padding: '7px 16px', textAlign: 'left',
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13,
              letterSpacing: '0.06em', color: 'var(--accent)', background: 'transparent',
              border: 'none', cursor: 'pointer', marginBottom: 8,
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--accent-bg)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
          >
            SIGN OUT
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex"
        style={{
          position: 'fixed', top: 0, left: 0, bottom: 0, width: 200,
          flexDirection: 'column', borderRight: '1.5px solid var(--border)',
          background: 'var(--bg)', zIndex: 40,
        }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile drawer overlay */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(12,12,12,0.5)', zIndex: 40 }}
            />
            <motion.aside
              key="drawer"
              initial={{ x: -200 }} animate={{ x: 0 }} exit={{ x: -200 }}
              transition={{ duration: 0.12, ease: [0.25, 0, 0, 1] }}
              style={{
                position: 'fixed', top: 0, left: 0, bottom: 0, width: 200,
                borderRight: '1.5px solid var(--border)', background: 'var(--bg)', zIndex: 50,
              }}
              className="lg:hidden"
            >
              <SidebarContent onClose={() => setDrawerOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main
        className="lg:ml-[200px]"
        style={{ minHeight: '100vh', paddingBottom: 80 }}
      >
        <div style={{ maxWidth: 920, padding: '48px 40px' }} className="px-4 sm:px-10">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav
        className="lg:hidden pb-safe"
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: 'var(--bg)', borderTop: '1.5px solid var(--border)', zIndex: 40,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'stretch' }}>
          {MOBILE_TABS.map(tab => {
            if (tab.href === '#more') {
              return (
                <button
                  key="more"
                  onClick={() => setDrawerOpen(true)}
                  style={{
                    flex: 1, padding: '10px 0',
                    fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 10,
                    letterSpacing: '0.06em', color: 'var(--ink-3)',
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    borderLeft: '1px solid var(--border-2)',
                  }}
                >
                  MORE
                </button>
              )
            }
            const isActive = pathname === tab.href
            return (
              <Link
                key={tab.href}
                href={tab.href}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '10px 0',
                  fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 10,
                  letterSpacing: '0.06em',
                  color: isActive ? 'var(--ink-invert)' : 'var(--ink-3)',
                  background: isActive ? 'var(--bg-invert)' : 'transparent',
                  borderLeft: '1px solid var(--border-2)',
                  textDecoration: 'none', transition: 'background 80ms',
                }}
              >
                {tab.label}
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
