'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import {
  Home, MessageCircle, Heart, BookOpen, Timer, Wind,
  TrendingUp, Phone, LogOut, Menu, X,
  BarChart3, Settings, Database, Brain, User
} from 'lucide-react'

const NAV_GROUPS = [
  {
    label: 'Main',
    items: [
      { icon: Home,          label: 'Home',            href: '/dashboard' },
      { icon: MessageCircle, label: 'Talk to Kokoro',  href: '/dashboard/kokoro', badge: 'AI' },
      { icon: Heart,         label: 'Mood Tracker',    href: '/dashboard/mood' },
      { icon: BookOpen,      label: 'Journal',         href: '/dashboard/journal' },
    ],
  },
  {
    label: 'Tools',
    items: [
      { icon: Timer,      label: 'Pomodoro Timer',  href: '/dashboard/pomodoro' },
      { icon: Wind,       label: 'Breathing',       href: '/dashboard/breathing' },
      { icon: TrendingUp, label: 'Mood Graph',      href: '/dashboard/graph' },
      { icon: Brain,      label: 'Academic Stress', href: '/dashboard/research' },
    ],
  },
  {
    label: 'Info',
    items: [
      { icon: Phone,    label: 'Get Help',       href: '/dashboard/helpline' },
      { icon: BarChart3,label: 'Creator',        href: '/dashboard/creator' },
      { icon: Database, label: 'Research Data',  href: '/dashboard/research-data' },
    ],
  },
]

const BOTTOM_NAV = [
  { icon: User,     label: 'Profile',  href: '/dashboard/profile' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
]

const MOBILE_TABS = [
  { icon: Home,          label: 'Home',    href: '/dashboard' },
  { icon: MessageCircle, label: 'Kokoro',  href: '/dashboard/kokoro' },
  { icon: Heart,         label: 'Mood',    href: '/dashboard/mood' },
  { icon: BookOpen,      label: 'Journal', href: '/dashboard/journal' },
  { icon: Menu,          label: 'More',    href: '#more' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter()
  const pathname = usePathname()
  const [profile, setProfile]     = useState<any>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [authReady, setAuthReady]   = useState(false)
  const resizeRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (
          event === 'INITIAL_SESSION' ||
          event === 'SIGNED_IN' ||
          event === 'TOKEN_REFRESHED'
        ) {
          if (!session) { router.replace('/auth'); return }
          setAuthReady(true)
          const { data } = await supabase
            .from('profiles')
            .select('name, email, avatar_url')
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

  const closeDrawer = useCallback(() => setDrawerOpen(false), [])

  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0B0D14' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 rounded-full border-2"
          style={{ borderColor: 'rgba(45,212,191,0.2)', borderTopColor: '#2DD4BF' }}
        />
      </div>
    )
  }

  const initials = profile?.name
    ? profile.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  function NavItem({ item, onClick }: { item: { icon: any; label: string; href: string; badge?: string }, onClick?: () => void }) {
    const isActive = pathname === item.href
    return (
      <Link
        href={item.href}
        onClick={onClick}
        className={`relative flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm font-medium transition-all duration-150 ${
          isActive
            ? 'bg-[rgba(45,212,191,0.08)] text-[#2DD4BF]'
            : 'text-[#94A3B8] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#F1F5F9]'
        }`}
      >
        {isActive && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-[#2DD4BF]" />
        )}
        <item.icon className="w-[15px] h-[15px] shrink-0" />
        <span className="flex-1 truncate">{item.label}</span>
        {item.badge && (
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[rgba(45,212,191,0.15)] text-[#2DD4BF]">
            {item.badge}
          </span>
        )}
      </Link>
    )
  }

  function SidebarContent({ onClose }: { onClose?: () => void }) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 shrink-0">
          <div className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="Satori" width={28} height={28} className="object-contain" />
            <span className="text-[18px] font-serif" style={{ color: '#F1F5F9', fontFamily: 'var(--font-instrument), Georgia, serif' }}>Satori</span>
          </div>
          {onClose && (
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[rgba(255,255,255,0.06)] transition-colors" style={{ color: '#475569' }}>
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Nav groups */}
        <nav className="flex-1 overflow-y-auto scrollbar-hide px-3 space-y-5 pb-2">
          {NAV_GROUPS.map(group => (
            <div key={group.label}>
              <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-[0.08em]" style={{ color: '#475569' }}>
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map(item => (
                  <NavItem key={item.href} item={item} onClick={onClose} />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom section */}
        <div className="shrink-0 px-3 pt-2 pb-3 border-t space-y-0.5" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          {BOTTOM_NAV.map(item => (
            <NavItem key={item.href} item={item} onClick={onClose} />
          ))}

          {/* Profile row */}
          <div className="flex items-center gap-2.5 px-3 py-2 mt-1">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
              style={{ background: 'rgba(45,212,191,0.15)', color: '#2DD4BF' }}
            >
              {initials}
            </div>
            <p className="text-xs font-medium truncate" style={{ color: '#94A3B8' }}>{profile?.name || 'User'}</p>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm font-medium transition-all duration-150 hover:bg-[rgba(239,68,68,0.08)]"
            style={{ color: '#EF4444' }}
          >
            <LogOut className="w-[15px] h-[15px] shrink-0" />
            Sign out
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: '#0B0D14' }}>

      {/* ── Desktop sidebar (always visible lg+) ── */}
      <aside
        className="hidden lg:flex fixed inset-y-0 left-0 w-60 z-40 flex-col border-r"
        style={{ background: '#13161F', borderColor: 'rgba(255,255,255,0.06)' }}
      >
        <SidebarContent />
      </aside>

      {/* ── Mobile: hamburger ── */}
      <button
        onClick={() => setDrawerOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 rounded-xl transition-all"
        style={{ background: '#13161F', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <Menu className="w-4 h-4" style={{ color: '#94A3B8' }} />
      </button>

      {/* ── Mobile drawer ── */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeDrawer}
              className="lg:hidden fixed inset-0 z-40"
              style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
            />
            <motion.aside
              key="drawer"
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="lg:hidden fixed inset-y-0 left-0 w-60 z-50 flex flex-col border-r"
              style={{ background: '#13161F', borderColor: 'rgba(255,255,255,0.06)' }}
            >
              <SidebarContent onClose={closeDrawer} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main content ── */}
      <main className="lg:ml-60 min-h-screen pb-24 lg:pb-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 lg:pt-8">
          {children}
        </div>
      </main>

      {/* ── Mobile bottom tab bar ── */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t pb-safe"
        style={{ background: '#13161F', borderColor: 'rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center justify-around px-2 py-2">
          {MOBILE_TABS.map(tab => {
            if (tab.href === '#more') {
              return (
                <button
                  key="more"
                  onClick={() => setDrawerOpen(true)}
                  className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all"
                  style={{ color: '#475569' }}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="text-[9px] font-medium">More</span>
                </button>
              )
            }
            const isActive = pathname === tab.href
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all"
                style={{ color: isActive ? '#2DD4BF' : '#475569' }}
              >
                <tab.icon className="w-5 h-5" />
                <span className="text-[9px] font-medium">{tab.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
