'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import { TrendingUp, Calendar, Flame, Award, Smile, BookOpen } from 'lucide-react'

const MOOD_EMOJIS = ['', '😔', '😕', '😐', '🙂', '😊']
const MOOD_COLORS = ['', '#EF4444', '#F97316', '#EAB308', '#34D399', '#2DD4BF']

export default function MoodGraphPage() {
  const [moods, setMoods]     = useState<any[]>([])
  const [range, setRange]     = useState<'7' | '30' | '90'>('30')
  const [loading, setLoading] = useState(true)
  const [stats, setStats]     = useState({ average: 0, highest: 0, lowest: 5, total: 0, streak: 0, weeklyAvg: 0 })

  useEffect(() => { fetchMoods() }, [range])

  const fetchMoods = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const from = new Date()
    from.setDate(from.getDate() - parseInt(range))

    const { data } = await supabase
      .from('moods').select('*').eq('user_id', user.id)
      .gte('created_at', from.toISOString())
      .order('created_at', { ascending: true })

    if (data && data.length > 0) {
      const scores = data.map(m => m.mood_score ?? 3)

      const today = new Date()
      let streak = 0
      for (let i = 0; i < 90; i++) {
        const d = new Date(today); d.setDate(d.getDate() - i)
        const ds = d.toISOString().split('T')[0]
        if (data.some(m => m.created_at.startsWith(ds))) streak++
        else break
      }

      const oneWkAgo = new Date(); oneWkAgo.setDate(oneWkAgo.getDate() - 7)
      const wkData   = data.filter(m => new Date(m.created_at) >= oneWkAgo)
      const weeklyAvg = wkData.length
        ? wkData.reduce((s, m) => s + (m.mood_score ?? 3), 0) / wkData.length : 0

      setStats({
        average:   parseFloat((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)),
        highest:   Math.max(...scores),
        lowest:    Math.min(...scores),
        total:     data.length,
        streak,
        weeklyAvg: parseFloat(weeklyAvg.toFixed(1)),
      })
      setMoods(data)
    } else {
      setMoods([])
      setStats({ average: 0, highest: 0, lowest: 5, total: 0, streak: 0, weeklyAvg: 0 })
    }
    setLoading(false)
  }

  const GH = 200

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(129,140,248,0.12)' }}>
          <TrendingUp className="w-5 h-5" style={{ color: '#818CF8' }} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-instrument), Georgia, serif', color: '#F1F5F9' }}>
            Mood Graph
          </h1>
          <p className="text-xs" style={{ color: '#475569' }}>Visualize your emotional journey</p>
        </div>
      </motion.div>

      {/* Range tabs */}
      <div className="flex gap-1 p-1 rounded-2xl" style={{ background: '#13161F', border: '1px solid rgba(255,255,255,0.06)' }}>
        {(['7', '30', '90'] as const).map(r => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
            style={{
              background: range === r ? 'rgba(129,140,248,0.15)' : 'transparent',
              border: range === r ? '1px solid rgba(129,140,248,0.3)' : '1px solid transparent',
              color: range === r ? '#818CF8' : '#475569',
            }}
          >
            {r === '7' ? '7 days' : r === '30' ? '30 days' : '3 months'}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { icon: Flame,    label: 'Streak',        value: `${stats.streak}d`,               color: '#F97316' },
          { icon: Award,    label: 'Weekly avg',    value: stats.weeklyAvg || '—',            color: '#2DD4BF' },
          { icon: Calendar, label: 'Total entries', value: stats.total,                       color: '#818CF8' },
          { icon: Smile,    label: 'Best mood',     value: MOOD_EMOJIS[stats.highest] || '—', color: '#4ADE80' },
        ].map(({ icon: Icon, label, value, color }) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl p-3 text-center"
            style={{ background: '#13161F', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="w-7 h-7 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ background: `${color}15` }}>
              <Icon className="w-3.5 h-3.5" style={{ color }} />
            </div>
            <p
              className="text-xl font-bold"
              style={{ color: '#F1F5F9', fontFamily: typeof value === 'number' ? 'var(--font-jetbrains), monospace' : undefined }}
            >
              {value}
            </p>
            <p className="text-[9px] mt-0.5" style={{ color: '#475569' }}>{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Graph card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl p-5"
        style={{ background: '#13161F', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <h2 className="text-sm font-semibold mb-4" style={{ color: '#F1F5F9' }}>Mood timeline</h2>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-6 h-6 rounded-full border-2 border-t-transparent"
              style={{ borderColor: '#818CF8', borderTopColor: 'transparent' }}
            />
          </div>
        ) : moods.length === 0 ? (
          <div className="text-center py-16">
            <TrendingUp className="w-10 h-10 mx-auto mb-3" style={{ color: '#1C2030' }} />
            <p className="text-sm" style={{ color: '#94A3B8' }}>No mood data for this period.</p>
            <p className="text-xs mt-1" style={{ color: '#475569' }}>Start logging to see your trends!</p>
          </div>
        ) : (
          <div className="relative" style={{ height: GH + 40 }}>
            {/* Y labels */}
            <div className="absolute left-0 top-0 bottom-10 w-8 flex flex-col justify-between text-right">
              {[5, 4, 3, 2, 1].map(n => (
                <span key={n} className="text-[9px] leading-none" style={{ color: '#475569' }}>
                  {MOOD_EMOJIS[n]}
                </span>
              ))}
            </div>

            {/* Chart area */}
            <div className="absolute left-10 right-0 top-0 bottom-10">
              {/* Grid lines */}
              {[0, 1, 2, 3, 4].map(i => (
                <div
                  key={i}
                  className="absolute left-0 right-0"
                  style={{ top: `${(i / 4) * 100}%`, borderTop: '1px solid rgba(255,255,255,0.04)' }}
                />
              ))}

              <svg className="absolute inset-0 w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="mg-dark" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#818CF8" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#818CF8" stopOpacity="0.01" />
                  </linearGradient>
                </defs>

                {moods.length > 1 && (() => {
                  const pts = moods.map((m, i) => {
                    const x = (i / (moods.length - 1)) * 100
                    const y = GH - (((m.mood_score ?? 3) - 1) / 4) * GH
                    return `${x}% ${y}`
                  })
                  const first = pts[0], last = pts[pts.length - 1]
                  return (
                    <>
                      <path
                        d={`M ${first} ${pts.map(p => `L ${p}`).join(' ')} L ${last.split(' ')[0]}% ${GH} L 0% ${GH} Z`}
                        fill="url(#mg-dark)"
                      />
                      <path
                        d={`M ${first} ${pts.map(p => `L ${p}`).join(' ')}`}
                        fill="none" stroke="#818CF8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                      />
                    </>
                  )
                })()}

                {moods.map((m, i) => {
                  const x = moods.length === 1 ? 50 : (i / (moods.length - 1)) * 100
                  const y = GH - (((m.mood_score ?? 3) - 1) / 4) * GH
                  const c = MOOD_COLORS[m.mood_score ?? 3]
                  return (
                    <g key={m.id ?? i}>
                      <circle cx={`${x}%`} cy={y} r="5" fill="#13161F" stroke={c} strokeWidth="2.5" />
                    </g>
                  )
                })}
              </svg>

              {/* X dates */}
              <div className="absolute -bottom-8 left-0 right-0 flex justify-between text-[10px]" style={{ color: '#475569' }}>
                {moods.length > 0 && (
                  <>
                    <span>{new Date(moods[0].created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    {moods.length > 2 && (
                      <span>{new Date(moods[Math.floor(moods.length / 2)].created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    )}
                    {moods.length > 1 && (
                      <span>{new Date(moods[moods.length - 1].created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Insights */}
      {moods.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl p-5 space-y-2.5"
          style={{ background: '#13161F', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <p className="text-sm font-semibold mb-1" style={{ color: '#F1F5F9' }}>Insights</p>

          {stats.streak >= 7 && (
            <p className="flex items-center gap-2 text-sm" style={{ color: '#94A3B8' }}>
              <Flame className="w-4 h-4 shrink-0" style={{ color: '#F97316' }} />
              {stats.streak}-day logging streak — keep it up!
            </p>
          )}
          {stats.average >= 4 && (
            <p className="flex items-center gap-2 text-sm" style={{ color: '#94A3B8' }}>
              <Smile className="w-4 h-4 shrink-0" style={{ color: '#2DD4BF' }} />
              Average mood {stats.average}/5 — you&apos;re doing great!
            </p>
          )}
          {stats.weeklyAvg < stats.average && stats.total > 7 && (
            <p className="flex items-center gap-2 text-sm" style={{ color: '#94A3B8' }}>
              <TrendingUp className="w-4 h-4 shrink-0" style={{ color: '#F97316' }} />
              Mood has been lower this week. Consider journaling or talking to Kokoro.
            </p>
          )}
          {stats.average < 3 && (
            <p className="flex items-center gap-2 text-sm" style={{ color: '#94A3B8' }}>
              <BookOpen className="w-4 h-4 shrink-0" style={{ color: '#818CF8' }} />
              Tough stretch — try a breathing exercise or chat with Kokoro.
            </p>
          )}
        </motion.div>
      )}
    </div>
  )
}
