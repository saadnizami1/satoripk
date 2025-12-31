'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { MeshGradient } from '@/components/MeshGradient'
import Image from 'next/image'
import { 
  Home,
  MessageCircle,
  Heart,
  BookOpen,
  Timer,
  Wind,
  TrendingUp,
  User,
  Phone,
  LogOut,
  Menu,
  X,
  BarChart3,
  Settings,
  Database,
  Brain
} from 'lucide-react'
import Link from 'next/link'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        // If no session, wait a bit and try again (for OAuth redirects)
        await new Promise(resolve => setTimeout(resolve, 500))
        const { data: { session: retrySession } } = await supabase.auth.getSession()

        if (!retrySession) {
          router.push('/auth')
          return
        } else {
          setUser(retrySession.user)

          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', retrySession.user.id)
            .single()

          setProfile(profileData)
        }
      } else {
        setUser(session.user)

        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        setProfile(profileData)
      }
    }
    checkUser()

    // Also listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session) {
        router.push('/auth')
      } else {
        setUser(session.user)

        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        setProfile(profileData)
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  useEffect(() => {
    // Handle responsive sidebar
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 1024)
    }
    
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const navItems = [
    { icon: Home, label: 'Home', href: '/dashboard' },
    { icon: MessageCircle, label: 'Talk to Kokoro', href: '/dashboard/kokoro' },
    { icon: Heart, label: 'Mood Tracker', href: '/dashboard/mood' },
    { icon: BookOpen, label: 'Journal', href: '/dashboard/journal' },
    { icon: Timer, label: 'Pomodoro Timer', href: '/dashboard/pomodoro' },
    { icon: Wind, label: 'Breathing Exercise', href: '/dashboard/breathing' },
    { icon: TrendingUp, label: 'Mood Graph', href: '/dashboard/graph' },
    { icon: Brain, label: 'Academic Stress', href: '/dashboard/research' },
    { icon: Phone, label: 'Get Help', href: '/dashboard/helpline' },
    { icon: User, label: 'Profile', href: '/dashboard/profile' },
    { icon: BarChart3, label: 'Creator Overview', href: '/dashboard/creator' },
    { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
    { label: 'Research Data', href: '/dashboard/research-data', icon: Database },
  ]

  const showSidebar = isDesktop || sidebarOpen

  return (
    <div className="min-h-screen relative font-sans selection:bg-[#C4661F] selection:text-white overflow-hidden">
      
      {/* Animated Mesh Background */}
      <MeshGradient />

      {/* Mobile Menu Button */}
      {!sidebarOpen && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setSidebarOpen(true)}
          className="fixed top-4 left-4 z-50 lg:hidden p-2.5 sm:p-3 rounded-xl sm:rounded-2xl backdrop-blur-[40px] bg-white/40 border border-white/60 shadow-xl text-[#2C2C2C]"
        >
          <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
        </motion.button>
      )}

      {/* Sidebar */}
      <AnimatePresence>
        {showSidebar && (
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 h-full w-full sm:w-80 max-w-sm z-40 p-4 sm:p-6"
          >
            <div className="h-full rounded-2xl sm:rounded-[2.5rem] backdrop-blur-[40px] bg-white/30 border border-white/50 shadow-2xl p-6 sm:p-8 overflow-y-auto relative">
  
              {/* Mobile Close Button - Inside Sidebar */}
              {!isDesktop && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSidebarOpen(false)}
                  className="absolute top-6 right-6 p-2 rounded-xl bg-white/60 border border-white/60 shadow-lg text-[#2C2C2C] lg:hidden"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              )}

              {/* Logo */}
              <div className="mb-6 sm:mb-10">
                <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                  <Image
                    src="/logo.png"
                    alt="Satori Logo"
                    width={40}
                    height={40}
                    className="object-contain drop-shadow-lg sm:w-12 sm:h-12"
                  />
                  <h1 className="text-3xl sm:text-4xl font-serif font-medium text-[#2C2C2C]">Satori</h1>
                </div>
                {profile && (
                  <p className="text-xs sm:text-sm text-[#5F5F5F] ml-1 truncate">Welcome back, {profile.name}</p>
                )}
              </div>

              {/* Navigation */}
              <nav className="space-y-1.5 sm:space-y-2 mb-6 sm:mb-8">
                {navItems.map((item, index) => {
                  const isActive = pathname === item.href
                  return (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-2.5 sm:gap-3 px-3 py-3 sm:px-5 sm:py-4 rounded-xl sm:rounded-2xl transition-all duration-300 ${
                          isActive
                            ? 'bg-white/60 shadow-lg text-[#2C2C2C] border border-white/80'
                            : 'text-[#5F5F5F] hover:bg-white/40 hover:text-[#2C2C2C]'
                        }`}
                      >
                        <item.icon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                        <span className="text-xs sm:text-sm font-medium truncate">{item.label}</span>
                      </Link>
                    </motion.div>
                  )
                })}
              </nav>

              {/* Logout Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 sm:gap-3 px-3 py-3 sm:px-5 sm:py-4 rounded-xl sm:rounded-2xl text-red-600 hover:bg-red-50/60 transition-all duration-300"
              >
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                <span className="text-xs sm:text-sm font-medium">Logout</span>
              </motion.button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="relative z-10 lg:ml-80 min-h-screen pt-20 pb-6 px-4 sm:px-6 lg:pt-10 lg:px-10">
        {children}
      </main>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && !isDesktop && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          />
        )}
      </AnimatePresence>
    </div>
  )
}