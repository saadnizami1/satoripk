'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Brain, Clock, Heart, Users, Calendar, Sparkles, TrendingUp, CircleAlert } from 'lucide-react'
import { useRouter } from 'next/navigation'

const performanceLevels = [
  { value: 5, label: 'Excellent',     color: '#2DD4BF' },
  { value: 4, label: 'Good',          color: '#4ADE80' },
  { value: 3, label: 'Average',       color: '#EAB308' },
  { value: 2, label: 'Below Average', color: '#F97316' },
  { value: 1, label: 'Poor',          color: '#EF4444' },
]

const stressLevels = [
  { value: 5, label: 'Extremely Stressed', color: '#EF4444' },
  { value: 4, label: 'Very Stressed',      color: '#F97316' },
  { value: 3, label: 'Moderately Stressed',color: '#EAB308' },
  { value: 2, label: 'Slightly Stressed',  color: '#4ADE80' },
  { value: 1, label: 'Not Stressed',       color: '#2DD4BF' },
]

const yesNoOptions = [
  { value: 'yes',      label: 'Yes',           color: '#4ADE80' },
  { value: 'no',       label: 'No',            color: '#EF4444' },
  { value: 'planning', label: 'Planning to',   color: '#F97316' },
]

const impactOptions = [
  { value: 'yes',      label: 'Yes',           color: '#F97316' },
  { value: 'no',       label: 'No',            color: '#4ADE80' },
  { value: 'somewhat', label: 'Somewhat',      color: '#EAB308' },
]

function OptionButton({ value, label, color, selected, onClick }: {
  value: string; label: string; color: string; selected: boolean; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="w-full p-3.5 rounded-xl text-left flex items-center justify-between transition-all"
      style={{
        background: selected ? `${color}10` : '#1C2030',
        border: selected ? `1px solid ${color}40` : '1px solid rgba(255,255,255,0.04)',
        color: selected ? color : '#94A3B8',
      }}
    >
      <div className="flex items-center gap-3">
        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color, opacity: selected ? 1 : 0.35 }} />
        <span className="text-sm font-medium">{label}</span>
      </div>
      {value.match(/^\d+$/) && <span className="text-xs" style={{ color: selected ? color : '#475569' }}>{value}/5</span>}
    </button>
  )
}

export default function AcademicStressPage() {
  const router = useRouter()
  const [performance, setPerformance] = useState<number | null>(null)
  const [stressLevel, setStressLevel] = useState<number | null>(null)
  const [selfStudy, setSelfStudy]     = useState<string | null>(null)
  const [moodImpact, setMoodImpact]   = useState<string | null>(null)
  const [lifeImpact, setLifeImpact]   = useState<string | null>(null)
  const [lifeImpactExample, setLifeImpactExample] = useState('')
  const [recentEntries, setRecentEntries] = useState<any[]>([])
  const [loading, setLoading]   = useState(false)
  const [success, setSuccess]   = useState(false)
  const [alreadyLogged, setAlreadyLogged] = useState(false)
  const [todayEntry, setTodayEntry] = useState<any>(null)

  useEffect(() => {
    checkTodayEntry()
    fetchRecentEntries()
  }, [])

  const checkTodayEntry = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const today = new Date().toISOString().split('T')[0]
      const { data } = await supabase
        .from('academic_stress').select('*').eq('user_id', user.id)
        .gte('created_at', today).order('created_at', { ascending: false }).limit(1).single()
      if (data) { setAlreadyLogged(true); setTodayEntry(data) }
    }
  }

  const fetchRecentEntries = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase
        .from('academic_stress').select('*').eq('user_id', user.id)
        .order('created_at', { ascending: false }).limit(7)
      setRecentEntries(data || [])
    }
  }

  const handleSubmit = async () => {
    if (!performance || !stressLevel || alreadyLogged) return
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const responses = { selfStudy, moodImpact, lifeImpact, lifeImpactExample: lifeImpact === 'yes' ? lifeImpactExample : null }
      const { error } = await supabase.from('academic_stress').insert({
        user_id: user.id,
        performance_rating: performance,
        stress_level: stressLevel,
        notes: JSON.stringify(responses),
      })
      if (!error) {
        setSuccess(true)
        setAlreadyLogged(true)
        setPerformance(null); setStressLevel(null); setSelfStudy(null)
        setMoodImpact(null); setLifeImpact(null); setLifeImpactExample('')
        checkTodayEntry(); fetchRecentEntries()
        setTimeout(() => setSuccess(false), 3000)
      }
    }
    setLoading(false)
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.12)' }}>
            <BookOpen className="w-5 h-5" style={{ color: '#EF4444' }} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-instrument), Georgia, serif', color: '#F1F5F9' }}>
              Academic Stress Tracker
            </h1>
            <p className="text-xs" style={{ color: '#475569' }}>Track your daily academic performance and stress</p>
          </div>
        </div>
        <button
          onClick={() => router.push('/dashboard/research/insights')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-80"
          style={{ background: '#13161F', border: '1px solid rgba(255,255,255,0.06)', color: '#94A3B8' }}
        >
          <TrendingUp className="w-4 h-4" />
          <span className="hidden sm:inline">View Insights</span>
        </button>
      </motion.div>

      {/* Success banner */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="mb-4 p-3.5 rounded-2xl flex items-center gap-3"
            style={{ background: 'rgba(45,212,191,0.08)', border: '1px solid rgba(45,212,191,0.2)' }}
          >
            <Sparkles className="w-4 h-4 shrink-0" style={{ color: '#2DD4BF' }} />
            <span className="text-sm font-medium" style={{ color: '#F1F5F9' }}>Entry logged successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Already logged today */}
      {alreadyLogged && todayEntry && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 rounded-2xl flex items-start gap-3"
          style={{ background: '#13161F', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(94,234,212,0.12)' }}>
            <Clock className="w-4 h-4" style={{ color: '#2DD4BF' }} />
          </div>
          <div>
            <p className="text-sm font-semibold mb-0.5" style={{ color: '#F1F5F9' }}>You&apos;ve already logged your academic stress today!</p>
            <p className="text-xs" style={{ color: '#94A3B8' }}>
              Performance: <strong style={{ color: '#F1F5F9' }}>{todayEntry.performance_rating}/5</strong>{' '}
              · Stress: <strong style={{ color: '#F1F5F9' }}>{todayEntry.stress_level}/5</strong>
            </p>
            <p className="text-xs mt-1" style={{ color: '#475569' }}>Come back tomorrow to track again!</p>
          </div>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Main form */}
        <div className={`lg:col-span-2 ${alreadyLogged ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="rounded-2xl p-5 space-y-6" style={{ background: '#13161F', border: '1px solid rgba(255,255,255,0.06)' }}>

            {/* Q1: Performance */}
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(45,212,191,0.12)' }}>
                  <Brain className="w-4 h-4" style={{ color: '#2DD4BF' }} />
                </div>
                <h2 className="text-base font-semibold" style={{ fontFamily: 'var(--font-instrument), Georgia, serif', color: '#F1F5F9' }}>
                  How was your academic performance today?
                </h2>
              </div>
              <div className="space-y-2">
                {performanceLevels.map(level => (
                  <OptionButton
                    key={level.value}
                    value={String(level.value)}
                    label={level.label}
                    color={level.color}
                    selected={performance === level.value}
                    onClick={() => !alreadyLogged && setPerformance(level.value)}
                  />
                ))}
              </div>
            </div>

            {/* Q2: Stress */}
            <AnimatePresence>
              {performance !== null && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.12)' }}>
                      <CircleAlert className="w-4 h-4" style={{ color: '#EF4444' }} />
                    </div>
                    <h2 className="text-base font-semibold" style={{ fontFamily: 'var(--font-instrument), Georgia, serif', color: '#F1F5F9' }}>
                      How stressed were you today?
                    </h2>
                  </div>
                  <div className="space-y-2">
                    {stressLevels.map(level => (
                      <OptionButton
                        key={level.value}
                        value={String(level.value)}
                        label={level.label}
                        color={level.color}
                        selected={stressLevel === level.value}
                        onClick={() => setStressLevel(level.value)}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Q3: Self study */}
            <AnimatePresence>
              {stressLevel !== null && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(129,140,248,0.12)' }}>
                      <BookOpen className="w-4 h-4" style={{ color: '#818CF8' }} />
                    </div>
                    <h2 className="text-base font-semibold" style={{ fontFamily: 'var(--font-instrument), Georgia, serif', color: '#F1F5F9' }}>
                      Did you self-study at home today?
                    </h2>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {yesNoOptions.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setSelfStudy(opt.value)}
                        className="py-2.5 rounded-xl text-sm font-semibold transition-all"
                        style={{
                          background: selfStudy === opt.value ? `${opt.color}15` : '#1C2030',
                          border: selfStudy === opt.value ? `1px solid ${opt.color}40` : '1px solid rgba(255,255,255,0.04)',
                          color: selfStudy === opt.value ? opt.color : '#94A3B8',
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Q4: Mood impact */}
            <AnimatePresence>
              {selfStudy !== null && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(249,115,22,0.12)' }}>
                      <Heart className="w-4 h-4" style={{ color: '#F97316' }} />
                    </div>
                    <h2 className="text-base font-semibold" style={{ fontFamily: 'var(--font-instrument), Georgia, serif', color: '#F1F5F9' }}>
                      Did academic performance impact your mood?
                    </h2>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {impactOptions.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setMoodImpact(opt.value)}
                        className="py-2.5 rounded-xl text-sm font-semibold transition-all"
                        style={{
                          background: moodImpact === opt.value ? `${opt.color}15` : '#1C2030',
                          border: moodImpact === opt.value ? `1px solid ${opt.color}40` : '1px solid rgba(255,255,255,0.04)',
                          color: moodImpact === opt.value ? opt.color : '#94A3B8',
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Q5: Life impact */}
            <AnimatePresence>
              {moodImpact !== null && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(74,222,128,0.12)' }}>
                      <Users className="w-4 h-4" style={{ color: '#4ADE80' }} />
                    </div>
                    <h2 className="text-base font-semibold" style={{ fontFamily: 'var(--font-instrument), Georgia, serif', color: '#F1F5F9' }}>
                      Did it impact your day-to-day life?
                    </h2>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {impactOptions.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setLifeImpact(opt.value)}
                        className="py-2.5 rounded-xl text-sm font-semibold transition-all"
                        style={{
                          background: lifeImpact === opt.value ? `${opt.color}15` : '#1C2030',
                          border: lifeImpact === opt.value ? `1px solid ${opt.color}40` : '1px solid rgba(255,255,255,0.04)',
                          color: lifeImpact === opt.value ? opt.color : '#94A3B8',
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  {lifeImpact === 'yes' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                      <label className="block text-xs font-medium mb-2" style={{ color: '#94A3B8' }}>
                        Example (e.g., &ldquo;Couldn&apos;t play football because of studying&rdquo;)
                      </label>
                      <input
                        type="text"
                        value={lifeImpactExample}
                        onChange={e => setLifeImpactExample(e.target.value)}
                        placeholder="What did you miss out on?"
                        className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none"
                        style={{ background: '#222638', border: '1px solid rgba(255,255,255,0.08)', color: '#F1F5F9' }}
                      />
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <AnimatePresence>
              {lifeImpact !== null && (
                <motion.button
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: alreadyLogged ? 1 : 1.02 }}
                  whileTap={{ scale: alreadyLogged ? 1 : 0.98 }}
                  onClick={handleSubmit}
                  disabled={!performance || !stressLevel || loading || alreadyLogged}
                  className="w-full py-3.5 rounded-xl text-white font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: loading || alreadyLogged ? '#1C2030' : '#14B8A6', color: loading || alreadyLogged ? '#475569' : '#fff' }}
                >
                  {alreadyLogged ? 'Already Logged Today' : loading ? 'Submitting…' : 'Submit Entry'}
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Recent entries sidebar */}
        <div>
          <div className="rounded-2xl p-4 sticky top-6" style={{ background: '#13161F', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h2 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: '#F1F5F9' }}>
              <Calendar className="w-4 h-4" style={{ color: '#2DD4BF' }} />
              Recent Entries
            </h2>

            {recentEntries.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-20" style={{ color: '#F1F5F9' }} />
                <p className="text-sm" style={{ color: '#475569' }}>No entries yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentEntries.map((entry, i) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-3 rounded-xl"
                    style={{ background: '#1C2030', border: '1px solid rgba(255,255,255,0.04)' }}
                  >
                    <p className="text-[10px] mb-1.5" style={{ color: '#475569' }}>
                      {new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      <div>
                        <span style={{ color: '#475569' }}>Performance </span>
                        <span style={{ color: '#F1F5F9', fontFamily: 'var(--font-jetbrains), monospace' }}>{entry.performance_rating}/5</span>
                      </div>
                      <div>
                        <span style={{ color: '#475569' }}>Stress </span>
                        <span style={{ color: '#F1F5F9', fontFamily: 'var(--font-jetbrains), monospace' }}>{entry.stress_level}/5</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
