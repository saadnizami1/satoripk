'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import {
  TrendingUp, Calendar, ArrowLeft, Flame, Award, BookOpen, Smile
} from 'lucide-react'
import Link from 'next/link'

const MOOD_LABELS = ['', 'Terrible', 'Bad', 'Okay', 'Good', 'Great']
const MOOD_EMOJIS = ['', '😔', '😕', '😐', '🙂', '😊']

export default function MoodGraphPage() {
  const [moods, setMoods]     = useState<any[]>([])
  const [range, setRange]     = useState<'7' | '30' | '90'>('30')
  const [loading, setLoading] = useState(true)
  const [stats, setStats]     = useState({
    average: 0, highest: 0, lowest: 5, total: 0, streak: 0, weeklyAvg: 0
  })

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
        ? wkData.reduce((s, m) => s + (m.mood_score ?? 3), 0) / wkData.length
        : 0

      setStats({
        average:    parseFloat((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)),
        highest:    Math.max(...scores),
        lowest:     Math.min(...scores),
        total:      data.length,
        streak,
        weeklyAvg:  parseFloat(weeklyAvg.toFixed(1)),
      })
      setMoods(data)
    } else {
      setMoods([])
      setStats({ average: 0, highest: 0, lowest: 5, total: 0, streak: 0, weeklyAvg: 0 })
    }
    setLoading(false)
  }

  const GH = 220
  const moodColor = (s: number) => ['', '#C75B5B', '#C4661F', '#9F8F5F', '#5A8C6F', '#4A6C6F'][s] || '#9F9F9F'

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-[#5F5F5F] hover:text-[#2C2C2C] mb-4 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#7A6C9F]/12 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-[#7A6C9F]" />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-semibold text-[#2C2C2C]">Mood Graph</h1>
            <p className="text-xs text-[#9F9F9F]">Visualize your emotional journey</p>
          </div>
        </div>
      </motion.div>

      {/* Range tabs */}
      <div className="flex gap-2">
        {(['7', '30', '90'] as const).map(r => (
          <button key={r} onClick={() => setRange(r)}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${range === r ? 'bg-white shadow text-[#2C2C2C]' : 'glass text-[#5F5F5F]'}`}>
            {r === '7' ? '7 days' : r === '30' ? '30 days' : '3 months'}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { icon: Flame,    label: 'Streak',       value: `${stats.streak}d`,          color: '#C4661F' },
          { icon: Award,    label: 'Weekly avg',   value: stats.weeklyAvg || '—',       color: '#4A6C6F' },
          { icon: Calendar, label: 'Total entries', value: stats.total,                 color: '#7A6C9F' },
          { icon: Smile,    label: 'Best mood',    value: MOOD_EMOJIS[stats.highest] || '—', color: '#5A8C6F' },
        ].map(({ icon: Icon, label, value, color }) => (
          <motion.div key={label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-2xl p-3 text-center">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center mx-auto mb-2"
              style={{ backgroundColor: `${color}15` }}>
              <Icon className="w-3.5 h-3.5" style={{ color }} />
            </div>
            <p className="text-xl font-bold text-[#2C2C2C]">{value}</p>
            <p className="text-[9px] text-[#9F9F9F] mt-0.5">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Graph */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="glass rounded-3xl p-6">
        <h2 className="text-sm font-semibold text-[#2C2C2C] mb-4">Mood timeline</h2>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-6 h-6 border-2 border-[#7A6C9F]/20 border-t-[#7A6C9F] rounded-full" />
          </div>
        ) : moods.length === 0 ? (
          <div className="text-center py-16">
            <TrendingUp className="w-10 h-10 text-[#C0BAB2] mx-auto mb-3" />
            <p className="text-sm text-[#9F9F9F]">No mood data for this period.</p>
            <p className="text-xs text-[#C0BAB2] mt-1">Start logging to see your trends!</p>
          </div>
        ) : (
          <div className="relative" style={{ height: GH + 40 }}>
            {/* Y labels */}
            <div className="absolute left-0 top-0 bottom-10 w-8 flex flex-col justify-between text-right">
              {[5,4,3,2,1].map(n => (
                <span key={n} className="text-[9px] text-[#C0BAB2] leading-none">{MOOD_EMOJIS[n]}</span>
              ))}
            </div>

            {/* Chart area */}
            <div className="absolute left-10 right-0 top-0 bottom-10">
              {/* Grid */}
              {[0,1,2,3,4].map(i => (
                <div key={i} className="absolute left-0 right-0 border-t border-black/4"
                  style={{ top: `${(i/4)*100}%` }} />
              ))}

              <svg className="absolute inset-0 w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="mg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7A6C9F" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#7A6C9F" stopOpacity="0.02" />
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
                      <path d={`M ${first} ${pts.map(p => `L ${p}`).join(' ')} L ${last.split(' ')[0]}% ${GH} L 0% ${GH} Z`}
                        fill="url(#mg)" />
                      <path d={`M ${first} ${pts.map(p => `L ${p}`).join(' ')}`}
                        fill="none" stroke="#7A6C9F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </>
                  )
                })()}

                {moods.map((m, i) => {
                  const x = moods.length === 1 ? 50 : (i / (moods.length - 1)) * 100
                  const y = GH - (((m.mood_score ?? 3) - 1) / 4) * GH
                  return (
                    <g key={m.id ?? i}>
                      <circle cx={`${x}%`} cy={y} r="5" fill="white"
                        stroke={moodColor(m.mood_score ?? 3)} strokeWidth="2.5" />
                    </g>
                  )
                })}
              </svg>

              {/* X dates */}
              <div className="absolute -bottom-8 left-0 right-0 flex justify-between text-[10px] text-[#C0BAB2]">
                {moods.length > 0 && (
                  <>
                    <span>{new Date(moods[0].created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    {moods.length > 2 && <span>{new Date(moods[Math.floor(moods.length / 2)].created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>}
                    {moods.length > 1 && <span>{new Date(moods[moods.length - 1].created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Insights */}
      {moods.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-5 space-y-2.5">
          <p className="text-sm font-semibold text-[#2C2C2C] mb-1">Insights</p>

          {stats.streak >= 7 && (
            <p className="flex items-center gap-2 text-sm text-[#2C2C2C]">
              <Flame className="w-4 h-4 text-[#C4661F] shrink-0" />
              {stats.streak}-day logging streak — keep it up!
            </p>
          )}
          {stats.average >= 4 && (
            <p className="flex items-center gap-2 text-sm text-[#2C2C2C]">
              <Smile className="w-4 h-4 text-[#4A6C6F] shrink-0" />
              Average mood {stats.average}/5 — you're doing great!
            </p>
          )}
          {stats.weeklyAvg < stats.average && stats.total > 7 && (
            <p className="flex items-center gap-2 text-sm text-[#2C2C2C]">
              <TrendingUp className="w-4 h-4 text-[#C4661F] shrink-0" />
              Mood has been lower this week. Consider journaling or talking to Kokoro.
            </p>
          )}
          {stats.average < 3 && (
            <p className="flex items-center gap-2 text-sm text-[#2C2C2C]">
              <BookOpen className="w-4 h-4 text-[#7A6C9F] shrink-0" />
              Tough stretch — try a breathing exercise or chat with Kokoro.
            </p>
          )}
        </motion.div>
      )}
    </div>
  )
}
