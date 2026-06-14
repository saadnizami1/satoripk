'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import {
  TrendingUp, ArrowLeft, Brain, CircleAlert, BookOpen,
  Heart, Users, Calendar, Award, Flame, Target,
  CheckCircle, XCircle, HelpCircle
} from 'lucide-react'
import { useRouter } from 'next/navigation'

const performanceColors: Record<number, string> = { 5: '#2DD4BF', 4: '#4ADE80', 3: '#EAB308', 2: '#F97316', 1: '#EF4444' }
const stressColors: Record<number, string>      = { 5: '#EF4444', 4: '#F97316', 3: '#EAB308', 2: '#4ADE80', 1: '#2DD4BF' }

const getPerformanceLabel = (v: number) =>
  ({ 5: 'Excellent', 4: 'Good', 3: 'Average', 2: 'Below Average', 1: 'Poor' } as Record<number,string>)[v] || 'N/A'

const getStressLabel = (v: number) =>
  ({ 5: 'Extremely Stressed', 4: 'Very Stressed', 3: 'Moderately Stressed', 2: 'Slightly Stressed', 1: 'Not Stressed' } as Record<number,string>)[v] || 'N/A'

const getSelfStudyLabel = (v: string) =>
  ({ yes: 'Yes', no: 'No', planning: 'Planning to' } as Record<string,string>)[v] || 'N/A'

const getImpactLabel = (v: string) =>
  ({ yes: 'Yes', no: 'No', somewhat: 'Somewhat' } as Record<string,string>)[v] || 'N/A'

const getImpactIcon = (v: string) => v === 'yes' ? CheckCircle : v === 'no' ? XCircle : HelpCircle
const getImpactColor = (v: string) => v === 'yes' ? '#F97316' : v === 'no' ? '#4ADE80' : '#EAB308'

export default function StressInsightsPage() {
  const router = useRouter()
  const [entries, setEntries]   = useState<any[]>([])
  const [timeRange, setTimeRange] = useState<'30' | '90'>('30')
  const [stats, setStats] = useState({
    avgPerformance: 0, avgStress: 0, totalEntries: 0, streak: 0,
    selfStudyCount: 0, moodImpactCount: 0, lifeImpactCount: 0,
    highStressDays: 0, lowPerformanceDays: 0,
  })

  useEffect(() => { fetchEntries() }, [timeRange])

  const fetchEntries = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const daysAgo = new Date()
      daysAgo.setDate(daysAgo.getDate() - parseInt(timeRange))

      const { data } = await supabase
        .from('academic_stress').select('*').eq('user_id', user.id)
        .gte('created_at', daysAgo.toISOString()).order('created_at', { ascending: false })

      if (data && data.length > 0) { setEntries(data); calculateStats(data) }
      else {
        setEntries([])
        setStats({ avgPerformance: 0, avgStress: 0, totalEntries: 0, streak: 0, selfStudyCount: 0, moodImpactCount: 0, lifeImpactCount: 0, highStressDays: 0, lowPerformanceDays: 0 })
      }
    }
  }

  const calculateStats = (data: any[]) => {
    const perf   = data.map(e => e.performance_rating)
    const stress = data.map(e => e.stress_level)

    let selfStudyCount = 0, moodImpactCount = 0, lifeImpactCount = 0
    data.forEach(entry => {
      try {
        const notes = JSON.parse(entry.notes)
        if (notes.selfStudy === 'yes') selfStudyCount++
        if (notes.moodImpact === 'yes') moodImpactCount++
        if (notes.lifeImpact === 'yes') lifeImpactCount++
      } catch {}
    })

    const today = new Date()
    let streak = 0
    for (let i = 0; i < 90; i++) {
      const d = new Date(today); d.setDate(d.getDate() - i)
      if (data.some(e => e.created_at.startsWith(d.toISOString().split('T')[0]))) streak++
      else break
    }

    setStats({
      avgPerformance:    parseFloat((perf.reduce((a, b) => a + b, 0) / perf.length).toFixed(1)),
      avgStress:         parseFloat((stress.reduce((a, b) => a + b, 0) / stress.length).toFixed(1)),
      totalEntries:      data.length,
      streak,
      selfStudyCount,
      moodImpactCount,
      lifeImpactCount,
      highStressDays:    stress.filter(s => s >= 4).length,
      lowPerformanceDays: perf.filter(p => p <= 2).length,
    })
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <button
          onClick={() => router.push('/dashboard/research')}
          className="flex items-center gap-1.5 text-sm mb-4 transition-opacity hover:opacity-70"
          style={{ color: '#475569' }}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Academic Stress Tracker
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(249,115,22,0.12)' }}>
            <TrendingUp className="w-5 h-5" style={{ color: '#F97316' }} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-instrument), Georgia, serif', color: '#F1F5F9' }}>
              Stress Statistics
            </h1>
            <p className="text-xs" style={{ color: '#475569' }}>Academic performance and stress insights</p>
          </div>
        </div>
      </motion.div>

      {/* Range tabs */}
      <div className="flex gap-2">
        {(['30', '90'] as const).map(r => (
          <button
            key={r}
            onClick={() => setTimeRange(r)}
            className="px-5 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: timeRange === r ? 'rgba(249,115,22,0.12)' : '#13161F',
              border: timeRange === r ? '1px solid rgba(249,115,22,0.3)' : '1px solid rgba(255,255,255,0.06)',
              color: timeRange === r ? '#F97316' : '#475569',
            }}
          >
            {r === '30' ? '30 days' : '3 months'}
          </button>
        ))}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: 'Avg Performance', value: stats.avgPerformance.toFixed(1), icon: Brain,     color: '#2DD4BF', sub: 'out of 5' },
          { label: 'Avg Stress',      value: stats.avgStress.toFixed(1),      icon: CircleAlert,color: '#F97316', sub: 'out of 5' },
          { label: 'Streak',          value: `${stats.streak}d`,              icon: Flame,      color: '#EF4444', sub: 'days' },
          { label: 'Total Entries',   value: stats.totalEntries,              icon: Calendar,   color: '#818CF8', sub: 'logged' },
          { label: 'Self Study Days', value: `${stats.selfStudyCount}`,       icon: BookOpen,   color: '#4ADE80', sub: `of ${stats.totalEntries}` },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + i * 0.04 }}
            className="rounded-2xl p-4"
            style={{ background: '#13161F', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2" style={{ background: `${s.color}15` }}>
              <s.icon className="w-4 h-4" style={{ color: s.color }} />
            </div>
            <p className="text-2xl font-bold" style={{ color: '#F1F5F9', fontFamily: 'var(--font-jetbrains), monospace' }}>{s.value}</p>
            <p className="text-[10px] mt-0.5" style={{ color: '#94A3B8' }}>{s.label}</p>
            <p className="text-[10px]" style={{ color: '#475569' }}>{s.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Impact stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: 'Mood Impact',     count: stats.moodImpactCount,  icon: Heart,      color: '#F97316', desc: 'Days when academics affected mood' },
          { label: 'Life Impact',     count: stats.lifeImpactCount,  icon: Users,      color: '#2DD4BF', desc: 'Days when academics affected daily activities' },
          { label: 'High Stress Days',count: stats.highStressDays,   icon: Target,     color: '#EF4444', desc: 'Days with stress level 4 or 5' },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25 + i * 0.07 }}
            className="rounded-2xl p-4"
            style={{ background: '#13161F', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${item.color}15` }}>
                <item.icon className="w-4 h-4" style={{ color: item.color }} />
              </div>
              <div>
                <p className="text-xs font-medium" style={{ color: '#94A3B8' }}>{item.label}</p>
                <p className="text-xl font-bold" style={{ color: '#F1F5F9', fontFamily: 'var(--font-jetbrains), monospace' }}>
                  {item.count}
                  <span className="text-sm font-normal ml-1" style={{ color: '#475569' }}>/{stats.totalEntries}</span>
                </p>
              </div>
            </div>
            <p className="text-xs" style={{ color: '#475569' }}>{item.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Log history */}
      <div>
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: '#94A3B8' }}>
          <Calendar className="w-4 h-4" style={{ color: '#2DD4BF' }} />
          Log History
        </h2>

        {entries.length === 0 ? (
          <div className="rounded-2xl p-16 text-center" style={{ background: '#13161F', border: '1px solid rgba(255,255,255,0.06)' }}>
            <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-20" style={{ color: '#F1F5F9' }} />
            <p className="text-sm" style={{ color: '#475569' }}>No data for this period. Start logging to see your history!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry, i) => {
              let resp = { selfStudy: '', moodImpact: '', lifeImpact: '', lifeImpactExample: '' }
              try { resp = JSON.parse(entry.notes) } catch {}

              const MoodIcon = getImpactIcon(resp.moodImpact)
              const LifeIcon = getImpactIcon(resp.lifeImpact)
              const perfColor  = performanceColors[entry.performance_rating] || '#94A3B8'
              const stressColor = stressColors[entry.stress_level] || '#94A3B8'

              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className="rounded-2xl p-5"
                  style={{ background: '#13161F', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  {/* Date header */}
                  <div className="flex items-center gap-3 mb-4 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(249,115,22,0.12)' }}>
                      <Calendar className="w-4 h-4" style={{ color: '#F97316' }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: '#F1F5F9' }}>
                        {new Date(entry.created_at).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                      <p className="text-xs" style={{ color: '#475569' }}>
                        {new Date(entry.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  {/* Response grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Performance */}
                    <div className="p-3.5 rounded-xl" style={{ background: '#1C2030', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Brain className="w-3.5 h-3.5 shrink-0" style={{ color: '#2DD4BF' }} />
                        <span className="text-xs" style={{ color: '#475569' }}>Academic Performance</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: perfColor }} />
                        <p className="text-sm font-semibold" style={{ color: '#F1F5F9' }}>
                          {getPerformanceLabel(entry.performance_rating)}
                          <span className="text-xs font-normal ml-1" style={{ color: '#475569' }}>({entry.performance_rating}/5)</span>
                        </p>
                      </div>
                    </div>

                    {/* Stress */}
                    <div className="p-3.5 rounded-xl" style={{ background: '#1C2030', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <CircleAlert className="w-3.5 h-3.5 shrink-0" style={{ color: '#F97316' }} />
                        <span className="text-xs" style={{ color: '#475569' }}>Stress Level</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: stressColor }} />
                        <p className="text-sm font-semibold" style={{ color: '#F1F5F9' }}>
                          {getStressLabel(entry.stress_level)}
                          <span className="text-xs font-normal ml-1" style={{ color: '#475569' }}>({entry.stress_level}/5)</span>
                        </p>
                      </div>
                    </div>

                    {/* Self study */}
                    <div className="p-3.5 rounded-xl" style={{ background: '#1C2030', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <BookOpen className="w-3.5 h-3.5 shrink-0" style={{ color: '#818CF8' }} />
                        <span className="text-xs" style={{ color: '#475569' }}>Self Study at Home</span>
                      </div>
                      <p className="text-sm font-semibold" style={{ color: '#F1F5F9' }}>{getSelfStudyLabel(resp.selfStudy)}</p>
                    </div>

                    {/* Mood impact */}
                    <div className="p-3.5 rounded-xl" style={{ background: '#1C2030', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Heart className="w-3.5 h-3.5 shrink-0" style={{ color: '#F97316' }} />
                        <span className="text-xs" style={{ color: '#475569' }}>Impact on Mood</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MoodIcon className="w-4 h-4 shrink-0" style={{ color: getImpactColor(resp.moodImpact) }} />
                        <p className="text-sm font-semibold" style={{ color: '#F1F5F9' }}>{getImpactLabel(resp.moodImpact)}</p>
                      </div>
                    </div>

                    {/* Life impact */}
                    <div className="p-3.5 rounded-xl sm:col-span-2" style={{ background: '#1C2030', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Users className="w-3.5 h-3.5 shrink-0" style={{ color: '#4ADE80' }} />
                        <span className="text-xs" style={{ color: '#475569' }}>Impact on Day-to-Day Life</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <LifeIcon className="w-4 h-4 shrink-0" style={{ color: getImpactColor(resp.lifeImpact) }} />
                        <p className="text-sm font-semibold" style={{ color: '#F1F5F9' }}>{getImpactLabel(resp.lifeImpact)}</p>
                      </div>
                      {resp.lifeImpactExample && (
                        <p className="mt-1.5 text-xs italic pl-6" style={{ color: '#475569' }}>
                          &ldquo;{resp.lifeImpactExample}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Key insights */}
      {entries.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl p-5"
          style={{ background: '#13161F', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: '#F1F5F9' }}>
            <Award className="w-4 h-4" style={{ color: '#F97316' }} />
            Key Insights
          </h2>
          <div className="space-y-2.5 text-sm" style={{ color: '#94A3B8' }}>
            {stats.streak >= 7 && (
              <p className="flex items-start gap-2">
                <Flame className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#F97316' }} />
                Excellent! You have a {stats.streak}-day tracking streak. Consistency is key to understanding your patterns!
              </p>
            )}
            {stats.avgPerformance >= 4 && (
              <p className="flex items-start gap-2">
                <Brain className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#2DD4BF' }} />
                Your average academic performance is {stats.avgPerformance}/5 — you&apos;re performing well!
              </p>
            )}
            {stats.avgStress >= 4 && (
              <p className="flex items-start gap-2">
                <CircleAlert className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#EF4444' }} />
                Your average stress level is {stats.avgStress}/5. Consider using breathing exercises or talking to Kokoro for support.
              </p>
            )}
            {stats.moodImpactCount > stats.totalEntries / 2 && (
              <p className="flex items-start gap-2">
                <Heart className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#F97316' }} />
                Academic stress is affecting your mood {Math.round((stats.moodImpactCount / stats.totalEntries) * 100)}% of the time. Remember to practice self-care!
              </p>
            )}
            {stats.lifeImpactCount > stats.totalEntries / 3 && (
              <p className="flex items-start gap-2">
                <Users className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#4ADE80' }} />
                Academics are impacting your daily activities frequently. Try to maintain a healthy balance between studies and personal time.
              </p>
            )}
            {stats.selfStudyCount < stats.totalEntries / 2 && stats.totalEntries > 5 && (
              <p className="flex items-start gap-2">
                <BookOpen className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#818CF8' }} />
                You&apos;re self-studying on {Math.round((stats.selfStudyCount / stats.totalEntries) * 100)}% of days. Consider establishing a consistent study routine!
              </p>
            )}
          </div>
        </motion.div>
      )}
    </div>
  )
}
