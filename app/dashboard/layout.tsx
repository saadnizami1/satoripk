'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { MeshGradient } from '@/components/MeshGradient'
import Image from 'next/image'
import Link from 'next/link'
import {
  Home, MessageCircle, Heart, BookOpen, Timer, Wind,
  TrendingUp, User, Phone, LogOut, Menu, X,
  BarChart3, Settings, Database, Brain
} from 'lucide-react'

const NAV_ITEMS = [
  { icon: Home,          label: 'Home',             href: '/dashboard' },
  { icon: MessageCircle, label: 'Talk to Kokoro',   href: '/dashboard/kokoro' },
  { icon: Heart,         label: 'Mood Tracker',     href: '/dashboard/mood' },
  { icon: BookOpen,      label: 'Journal',          href: '/dashboard/journal' },
  { icon: Timer,         label: 'Pomodoro Timer',   href: '/dashboard/pomodoro' },
  { icon: Wind,          label: 'Breathing',        href: '/dashboard/breathing' },
  { icon: TrendingUp,    label: 'Mood Graph',       href: '/dashboard/graph' },
  { icon: Brain,         label: 'Academic Stress',  href: '/dashboard/research' },
  { icon: Phone,         label: 'Get Help',         href: '/dashboard/helpline' },
  { icon: User,          label: 'Profile',          href: '/dashboard/profile' },
  { icon: BarChart3,     label: 'Creator Overview', href: '/dashboard/creator' },
  { icon: Settings,      label: 'Settings',         href: '/dashboard/settings' },
  { icon: Database,      label: 'Research Data',    href: '/dashboard/research-data' },
] as const

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [profile, setProfile] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  const [authReady, setAuthReady] = useState(false)
  const resizeRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Auth: use onAuthStateChange so we don't race with cookie→localStorage sync ──
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (!session) {
            router.replace('/auth')
            return
          }
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

  // ── Responsive sidebar ──
  useEffect(() => {
    const check = () => {
      if (resizeRef.current) clearTimeout(resizeRef.current)
      resizeRef.current = setTimeout(() => {
        setIsDesktop(window.innerWidth >= 1024)
      }, 80)
    }
    setIsDesktop(window.innerWidth >= 1024)
    window.addEventListener('resize', check, { passive: true })
    return () => {
      window.removeEventListener('resize', check)
      if (resizeRef.current) clearTimeout(resizeRef.current)
    }
  }, [])

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut()
    router.replace('/')
  }, [router])

  const closeSidebar = useCallback(() => setSidebarOpen(false), [])

  const showSidebar = isDesktop || sidebarOpen

  // Show nothing until auth is confirmed (middleware already handles redirect)
  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F4F0]">
        <MeshGradient />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-9 h-9 border-[3px] border-[#4A6C6F]/30 border-t-[#4A6C6F] rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen relative font-sans overflow-hidden bg-[#F7F4F0]">
      <MeshGradient />

      {/* ── Mobile hamburger ── */}
      <AnimatePresence>
        {!sidebarOpen && !isDesktop && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setSidebarOpen(true)}
            className="fixed top-4 left-4 z-50 p-2.5 rounded-xl glass shadow-lg text-[#2C2C2C]"
          >
            <Menu className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Sidebar ── */}
      <AnimatePresence>
        {showSidebar && (
          <motion.aside
            key="sidebar"
            initial={isDesktop ? false : { x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={isDesktop ? undefined : { x: -320, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="fixed left-0 top-0 h-full w-72 z-40 p-3 lg:p-4"
          >
            <div className="h-full glass-strong rounded-3xl shadow-2xl flex flex-col overflow-hidden">
              {/* Header */}
              <div className="p-6 pb-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <Image src="/logo.png" alt="Satori" width={36} height={36} className="object-contain drop-shadow" />
                  <h1 className="text-2xl font-serif font-semibold text-[#2C2C2C]">Satori</h1>
                </div>
                {!isDesktop && (
                  <button
                    onClick={closeSidebar}
                    className="p-1.5 rounded-lg hover:bg-black/5 text-[#5F5F5F] transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* User greeting */}
              {profile?.name && (
                <div className="px-6 pb-4 shrink-0">
                  <p className="text-xs text-[#9F9F9F] uppercase tracking-widest">Welcome back</p>
                  <p className="text-sm font-medium text-[#2C2C2C] mt-0.5 truncate">{profile.name}</p>
                </div>
              )}

              <div className="mx-4 h-px bg-black/6 shrink-0" />

              {/* Nav */}
              <nav className="flex-1 overflow-y-auto scrollbar-hide px-3 py-4 space-y-0.5">
                {NAV_ITEMS.map((item, i) => {
                  const isActive = pathname === item.href
                  return (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03, type: 'spring', stiffness: 300 }}
                    >
                      <Link
                        href={item.href}
                        onClick={closeSidebar}
                        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? 'bg-[#4A6C6F] text-white shadow-md shadow-[#4A6C6F]/25'
                            : 'text-[#5F5F5F] hover:bg-black/5 hover:text-[#2C2C2C]'
                        }`}
                      >
                        <item.icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : ''}`} />
                        <span className="truncate">{item.label}</span>
                        {isActive && (
                          <motion.div
                            layoutId="nav-indicator"
                            className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60"
                          />
                        )}
                      </Link>
                    </motion.div>
                  )
                })}
              </nav>

              <div className="mx-4 h-px bg-black/6 shrink-0" />

              {/* Logout */}
              <div className="p-4 shrink-0">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-medium text-red-500 hover:bg-red-50/60 transition-all duration-200"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  Sign out
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── Mobile overlay ── */}
      <AnimatePresence>
        {sidebarOpen && !isDesktop && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSidebar}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30"
          />
        )}
      </AnimatePresence>

      {/* ── Main content ── */}
      <main className="relative z-10 lg:ml-76 min-h-screen pt-16 pb-8 px-4 sm:px-6 lg:pt-8 lg:px-8">
        {children}
      </main>
    </div>
  )
}
