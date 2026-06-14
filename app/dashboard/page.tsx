'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  MessageCircle, Heart, BookOpen, Timer, Wind, TrendingUp,
  Phone, BarChart3, Brain, ArrowRight, Sparkles, CheckCircle2
} from 'lucide-react'

const MOODS       = ['😔', '😕', '😐', '🙂', '😊']
const MOOD_LABELS = ['Terrible', 'Bad', 'Okay', 'Good', 'Great']
const MOOD_COLORS = ['#EF4444', '#F97316', '#EAB308', '#34D399', '#2DD4BF']

function getGreeting() {
  const h = new Date().getHours()
  if (h < 5)  return 'Good night'
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  if (h < 21) return 'Good evening'
  return 'Good night'
}

const CARDS = [
  {
    id: 'kokoro',
    icon: MessageCircle,
    label: 'Talk to Kokoro',
    desc: 'Your AI wellness companion',
    href: '/dashboard/kokoro',
    accent: '#2DD4BF',
    badge: 'AI',
  },
  {
    id: 'mood',
    icon: Heart,
    label: 'Mood Tracker',
    desc: 'Log how you feel today',
    href: '/dashboard/mood',
    accent: '#F97316',
  },
  {
    id: 'journal',
    icon: BookOpen,
    label: 'Journal',
    desc: 'Write freely',
    href: '/dashboard/journal',
    accent: '#818CF8',
  },
  {
    id: 'pomodoro',
    icon: Timer,
    label: 'Pomodoro',
    desc: 'Stay focused',
    href: '/dashboard/pomodoro',
    accent: '#F97316',
  },
  {
    id: 'breathing',
    icon: Wind,
    label: 'Breathing',
    desc: 'Calm your mind',
    href: '/dashboard/breathing',
    accent: '#818CF8',
  },
  {
    id: 'graph',
    icon: TrendingUp,
    label: 'Mood Graph',
    desc: 'See your patterns',
    href: '/dashboard/graph',
    accent: '#2DD4BF',
  },
  {
    id: 'stress',
    icon: Brain,
    label: 'Academic Stress',
    desc: 'Track & manage',
    href: '/dashboard/research',
    accent: '#EF4444',
  },
  {
    id: 'helpline',
    icon: Phone,
    label: 'Get Help',
    desc: 'Helplines & resources',
    href: '/dashboard/helpline',
    accent: '#4ADE80',
  },
  {
    id: 'creator',
    icon: BarChart3,
    label: 'Creator',
    desc: 'About the research',
    href: '/dashboard/creator',
    accent: '#94A3B8',
  },
] as const

const card = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.04, type: 'spring' as const, stiffness: 320, damping: 28 },
  }),
}

export default function DashboardHome() {
  const [profile, setProfile]         = useState<any>(null)
  const [todayMood, setTodayMood]     = useState<any>(null)
  const [hasMoodToday, setHasMood]    = useState(false)
  const [hasStressToday, setHasStress] = useState(false)
  const [loading, setLoading]          = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)

      const [{ data: prof }, { data: moods }, { data: stress }] = await Promise.all([
        supabase.from('profiles').select('name').eq('id', user.id).single(),
        supabase.from('moods').select('mood_score, note').eq('user_id', user.id)
          .gte('created_at', todayStart.toISOString()).order('created_at', { ascending: false }).limit(1),
        supabase.from('academic_stress').select('id').eq('user_id', user.id)
          .gte('created_at', todayStart.toISOString()).limit(1),
      ])

      setProfile(prof)
      setTodayMood(moods?.[0] ?? null)
      setHasMood(Boolean(moods?.length))
      setHasStress(Boolean(stress?.length))
      setLoading(false)
    }
    load()
  }, [])

  const needsGlow = useCallback((id: string) => {
    if (id === 'mood')   return !hasMoodToday
    if (id === 'stress') return !hasStressToday
    return false
  }, [hasMoodToday, hasStressToday])

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 rounded-full border-2"
          style={{ borderColor: 'rgba(45,212,191,0.2)', borderTopColor: '#2DD4BF' }}
        />
      </div>
    )
  }

  const moodScore   = todayMood?.mood_score ?? null
  const moodEmoji   = moodScore ? MOODS[moodScore - 1] : null
  const moodLabel   = moodScore ? MOOD_LABELS[moodScore - 1] : null
  const moodColor   = moodScore ? MOOD_COLORS[moodScore - 1] : null

  return (
    <div className="space-y-6">

      {/* ── Greeting ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <p className="text-sm font-medium" style={{ color: '#475569' }}>{getGreeting()}</p>
        <h1
          className="text-4xl sm:text-5xl mt-0.5 leading-tight"
          style={{
            fontFamily: 'var(--font-instrument), Georgia, serif',
            background: 'linear-gradient(135deg, #F1F5F9 30%, #2DD4BF 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {profile?.name || 'Welcome back'}
        </h1>
        <p className="text-sm mt-1" style={{ color: '#475569' }}>{today}</p>
      </motion.div>

      {/* ── Today's mood pill (if logged) ── */}
      {todayMood && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Link
            href="/dashboard/mood"
            className="flex items-center gap-4 rounded-2xl px-5 py-4 transition-all hover:opacity-90"
            style={{ background: '#13161F', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <span className="text-3xl">{moodEmoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#475569' }}>Today's mood</p>
              <p className="font-semibold text-sm mt-0.5" style={{ color: moodColor ?? '#F1F5F9' }}>{moodLabel}</p>
            </div>
            <ArrowRight className="w-4 h-4 shrink-0" style={{ color: '#475569' }} />
          </Link>
        </motion.div>
      )}

      {/* ── Status banner ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex items-center gap-3 px-4 py-3 rounded-2xl"
        style={{
          background: hasMoodToday && hasStressToday
            ? 'rgba(74,222,128,0.06)'
            : 'rgba(45,212,191,0.06)',
          border: hasMoodToday && hasStressToday
            ? '1px solid rgba(74,222,128,0.2)'
            : '1px solid rgba(45,212,191,0.15)',
        }}
      >
        {hasMoodToday && hasStressToday ? (
          <>
            <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: '#4ADE80' }} />
            <p className="text-sm font-medium" style={{ color: '#4ADE80' }}>All done for today — great job!</p>
          </>
        ) : !hasMoodToday && !hasStressToday ? (
          <>
            <Sparkles className="w-4 h-4 shrink-0" style={{ color: '#2DD4BF' }} />
            <p className="text-sm font-medium" style={{ color: '#2DD4BF' }}>Log your mood and stress to start tracking.</p>
          </>
        ) : !hasMoodToday ? (
          <>
            <Heart className="w-4 h-4 shrink-0" style={{ color: '#F97316' }} />
            <p className="text-sm font-medium" style={{ color: '#F97316' }}>Stress logged — now add your mood for today.</p>
          </>
        ) : (
          <>
            <Brain className="w-4 h-4 shrink-0" style={{ color: '#2DD4BF' }} />
            <p className="text-sm font-medium" style={{ color: '#2DD4BF' }}>Mood logged — now add your academic stress data.</p>
          </>
        )}
      </motion.div>

      {/* ── Feature cards grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {CARDS.map(({ id, icon: Icon, label, desc, href, accent, ...rest }, i) => {
          const badge = 'badge' in rest ? (rest as any).badge : undefined
          const glow = needsGlow(id)
          return (
            <motion.div
              key={id}
              custom={i}
              variants={card}
              initial="hidden"
              animate="show"
            >
              <Link
                href={href}
                className="group block rounded-2xl p-4 transition-all duration-200 hover:scale-[1.02] hover:shadow-xl"
                style={{
                  background: '#13161F',
                  border: glow ? `1px solid ${accent}40` : '1px solid rgba(255,255,255,0.06)',
                  boxShadow: glow ? `0 0 16px ${accent}18` : undefined,
                }}
              >
                {/* Icon */}
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: `${accent}15` }}
                >
                  <Icon className="w-[18px] h-[18px]" style={{ color: accent }} />
                </div>

                {/* Labels */}
                <div className="flex items-start justify-between gap-1">
                  <p className="text-sm font-semibold leading-snug" style={{ color: '#F1F5F9' }}>{label}</p>
                  {badge && (
                    <span className="shrink-0 text-[8px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: `${accent}20`, color: accent }}>
                      {badge}
                    </span>
                  )}
                </div>
                <p className="text-[11px] mt-0.5" style={{ color: '#475569' }}>{desc}</p>

                {glow && (
                  <span className="inline-block mt-2 text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: `${accent}18`, color: accent }}>
                    Log today
                  </span>
                )}
              </Link>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
