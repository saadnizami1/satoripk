'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  MessageCircle, Heart, BookOpen, Timer, Wind, TrendingUp,
  Phone, BarChart3, Brain, CheckCircle2, Sparkles, ArrowRight
} from 'lucide-react'

const CARDS = [
  { id: 'kokoro',    icon: MessageCircle, label: 'Talk to Kokoro',   desc: 'AI companion',       href: '/dashboard/kokoro',    color: '#4A6C6F', bg: '#4A6C6F12' },
  { id: 'mood',      icon: Heart,         label: 'Mood Tracker',     desc: 'Log your feelings',  href: '/dashboard/mood',      color: '#C4661F', bg: '#C4661F12' },
  { id: 'journal',   icon: BookOpen,      label: 'Journal',          desc: 'Write freely',       href: '/dashboard/journal',   color: '#5F7F82', bg: '#5F7F8212' },
  { id: 'pomodoro',  icon: Timer,         label: 'Pomodoro Timer',   desc: 'Stay focused',       href: '/dashboard/pomodoro',  color: '#8B6555', bg: '#8B655512' },
  { id: 'breathing', icon: Wind,          label: 'Breathing',        desc: 'Calm your mind',     href: '/dashboard/breathing', color: '#6A8C6F', bg: '#6A8C6F12' },
  { id: 'graph',     icon: TrendingUp,    label: 'Mood Graph',       desc: 'See your patterns',  href: '/dashboard/graph',     color: '#7A6C9F', bg: '#7A6C9F12' },
  { id: 'stress',    icon: Brain,         label: 'Academic Stress',  desc: 'Track & manage',     href: '/dashboard/research',  color: '#9F6C5F', bg: '#9F6C5F12' },
  { id: 'helpline',  icon: Phone,         label: 'Get Help',         desc: 'Resources & lines',  href: '/dashboard/helpline',  color: '#4A7C6F', bg: '#4A7C6F12' },
  { id: 'creator',   icon: BarChart3,     label: 'Creator Overview', desc: 'Research project',   href: '/dashboard/creator',   color: '#7A8C5F', bg: '#7A8C5F12' },
] as const

const MOODS       = ['😔', '😕', '😐', '🙂', '😊']
const MOOD_LABELS = ['Terrible', 'Bad', 'Okay', 'Good', 'Great']

function getGreeting() {
  const h = new Date().getHours()
  if (h < 5)  return 'Good Night'
  if (h < 12) return 'Good Morning'
  if (h < 17) return 'Good Afternoon'
  if (h < 21) return 'Good Evening'
  return 'Good Night'
}

export default function DashboardHome() {
  const [profile, setProfile]               = useState<any>(null)
  const [todayMood, setTodayMood]           = useState<any>(null)
  const [hasMoodToday, setHasMoodToday]     = useState(false)
  const [hasStressToday, setHasStressToday] = useState(false)
  const [loading, setLoading]               = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)

      const [{ data: prof }, { data: moods }, { data: stress }] = await Promise.all([
        supabase.from('profiles').select('name').eq('id', user.id).single(),
        supabase.from('moods').select('mood_score, note').eq('user_id', user.id)
          .gte('created_at', todayStart.toISOString()).order('created_at', { ascending: false }).limit(1),
        supabase.from('academic_stress').select('id').eq('user_id', user.id)
          .gte('created_at', todayStart.toISOString()).limit(1),
      ])

      setProfile(prof)
      setTodayMood(moods?.[0] ?? null)
      setHasMoodToday(Boolean(moods?.length))
      setHasStressToday(Boolean(stress?.length))
      setLoading(false)
    }
    load()
  }, [])

  const shouldGlow = useCallback((id: string) => {
    if (id === 'mood')   return !hasMoodToday
    if (id === 'stress') return !hasStressToday
    return false
  }, [hasMoodToday, hasStressToday])

  const statusBanner = useMemo(() => {
    if (hasMoodToday && hasStressToday)
      return { icon: CheckCircle2, text: "All done for today — great job!", accent: 'text-emerald-600', bg: 'bg-emerald-50/60 border-emerald-200/60' }
    if (!hasMoodToday && !hasStressToday)
      return { icon: Sparkles,     text: 'Log your mood and academic stress to start tracking.', accent: 'text-[#4A6C6F]', bg: 'bg-white/40 border-white/60' }
    if (!hasMoodToday)
      return { icon: Heart,        text: 'Stress logged! Now log your mood for today.',          accent: 'text-[#C4661F]', bg: 'bg-[#C4661F]/5 border-[#C4661F]/20' }
    return   { icon: Brain,        text: 'Mood logged! Now add your academic stress data.',       accent: 'text-[#4A6C6F]', bg: 'bg-[#4A6C6F]/5 border-[#4A6C6F]/20' }
  }, [hasMoodToday, hasStressToday])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-[3px] border-[#4A6C6F]/20 border-t-[#4A6C6F] rounded-full"
        />
      </div>
    )
  }

  const StatusIcon = statusBanner.icon

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <p className="text-sm text-[#9F9F9F] font-medium">{getGreeting()}</p>
        <h1 className="text-3xl sm:text-4xl font-serif font-semibold text-[#2C2C2C] mt-0.5">
          {profile?.name || 'Welcome back'}
        </h1>
        <p className="text-[#5F5F5F] text-sm mt-1">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </motion.div>

      {/* Today's mood pill */}
      {todayMood && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-4 flex items-center gap-4"
        >
          <div className="text-3xl">{MOODS[(todayMood.mood_score ?? 3) - 1]}</div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-[#9F9F9F] uppercase tracking-widest">Today's mood</p>
            <p className="font-semibold text-[#2C2C2C] text-sm">{MOOD_LABELS[(todayMood.mood_score ?? 3) - 1]}</p>
          </div>
          <Link href="/dashboard/mood" className="p-2 rounded-xl hover:bg-black/5 text-[#5F5F5F] transition-colors">
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      )}

      {/* Status banner */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl border ${statusBanner.bg}`}
      >
        <StatusIcon className={`w-4 h-4 shrink-0 ${statusBanner.accent}`} />
        <p className={`text-sm font-medium ${statusBanner.accent}`}>{statusBanner.text}</p>
      </motion.div>

      {/* Cards grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {CARDS.map(({ id, icon: Icon, label, desc, href, color, bg }, i) => (
          <motion.div
            key={id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i, type: 'spring' as const, stiffness: 300, damping: 24 }}
          >
            <Link
              href={href}
              className={`group block glass rounded-2xl p-4 hover:bg-white/55 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 ${
                shouldGlow(id) ? 'glow-pulse ring-1 ring-[#C4661F]/20' : ''
              }`}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: bg }}>
                <Icon className="w-[18px] h-[18px]" style={{ color }} />
              </div>
              <p className="text-sm font-semibold text-[#2C2C2C] truncate">{label}</p>
              <p className="text-[11px] text-[#9F9F9F] mt-0.5">{desc}</p>
              {shouldGlow(id) && (
                <span className="inline-block mt-2 text-[10px] font-medium text-[#C4661F] bg-[#C4661F]/10 px-2 py-0.5 rounded-full">
                  Log today
                </span>
              )}
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
