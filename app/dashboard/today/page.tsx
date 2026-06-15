'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'

const MOODS = [
  { value: 1, label: 'TERRIBLE' },
  { value: 2, label: 'BAD' },
  { value: 3, label: 'OKAY' },
  { value: 4, label: 'GOOD' },
  { value: 5, label: 'GREAT' },
]

const PERFORMANCE = [
  { value: 5, label: 'EXCELLENT' },
  { value: 4, label: 'GOOD' },
  { value: 3, label: 'AVERAGE' },
  { value: 2, label: 'BELOW AVG' },
  { value: 1, label: 'POOR' },
]

const STRESS_LEVELS = [
  { value: 5, label: 'EXTREME' },
  { value: 4, label: 'VERY HIGH' },
  { value: 3, label: 'MODERATE' },
  { value: 2, label: 'SLIGHT' },
  { value: 1, label: 'NONE' },
]

function OptionGrid({ options, value, onChange }: {
  options: { value: number; label: string }[]
  value: number | null
  onChange: (v: number) => void
}) {
  return (
    <div style={{ display: 'flex', border: '1.5px solid var(--border)' }}>
      {options.map((opt, i) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          style={{
            flex: 1,
            padding: 'clamp(10px,2.5vw,16px) clamp(3px,1vw,6px)',
            textAlign: 'center',
            background: value === opt.value ? 'var(--bg-invert)' : 'var(--bg)',
            color: value === opt.value ? 'var(--ink-invert)' : 'var(--ink-2)',
            border: 'none',
            borderRight: i < options.length - 1 ? '1.5px solid var(--border)' : 'none',
            fontFamily: 'var(--font-display)', fontWeight: 700,
            fontSize: 'clamp(8px,1.8vw,12px)',
            letterSpacing: '0.02em', cursor: 'pointer',
            transition: 'background 80ms, color 80ms',
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function SectionHeader({ num, label, done }: { num: string; label: string; done: boolean }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '10px 14px', borderBottom: '1.5px solid var(--border)',
      background: 'var(--bg-card)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.14em' }}>{num}</span>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12, color: 'var(--ink)', letterSpacing: '0.06em' }}>{label}</span>
      </div>
      {done && (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink)', letterSpacing: '0.1em' }}>
          ✓ LOGGED
        </span>
      )}
    </div>
  )
}

export default function TodayPage() {
  const [userId, setUserId]       = useState('')
  const [loading, setLoading]     = useState(true)

  // Mood
  const [moodDone, setMoodDone]       = useState(false)
  const [todayMood, setTodayMood]     = useState<any>(null)
  const [selMood, setSelMood]         = useState<number | null>(null)
  const [moodNote, setMoodNote]       = useState('')
  const [savingMood, setSavingMood]   = useState(false)

  // Stress
  const [stressDone, setStressDone]     = useState(false)
  const [todayStress, setTodayStress]   = useState<any>(null)
  const [selPerf, setSelPerf]           = useState<number | null>(null)
  const [selStress, setSelStress]       = useState<number | null>(null)
  const [savingStress, setSavingStress] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      setUserId(session.user.id)
      const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
      const todayStr = todayStart.toISOString()
      const [{ data: md }, { data: sd }] = await Promise.all([
        supabase.from('moods').select('*').eq('user_id', session.user.id)
          .gte('created_at', todayStr).order('created_at', { ascending: false }).limit(1),
        supabase.from('academic_stress').select('*').eq('user_id', session.user.id)
          .gte('created_at', todayStr).order('created_at', { ascending: false }).limit(1),
      ])
      if (md?.length)  { setMoodDone(true);   setTodayMood(md[0]) }
      if (sd?.length)  { setStressDone(true);  setTodayStress(sd[0]) }
      setLoading(false)
    }
    load()
  }, [])

  const saveMood = async () => {
    if (selMood === null || !userId) return
    setSavingMood(true)
    const { error } = await supabase.from('moods').insert({
      user_id: userId, mood_score: selMood,
      note: moodNote.trim() || null,
    })
    if (!error) {
      const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
      const { data } = await supabase.from('moods').select('*')
        .eq('user_id', userId).gte('created_at', todayStart.toISOString()).limit(1)
      setTodayMood(data?.[0] ?? null)
      setMoodDone(true)
    }
    setSavingMood(false)
  }

  const saveStress = async () => {
    if (selPerf === null || selStress === null || !userId) return
    setSavingStress(true)
    const { error } = await supabase.from('academic_stress').insert({
      user_id: userId,
      performance_rating: selPerf,
      stress_level: selStress,
    })
    if (!error) {
      const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
      const { data } = await supabase.from('academic_stress').select('*')
        .eq('user_id', userId).gte('created_at', todayStart.toISOString()).limit(1)
      setTodayStress(data?.[0] ?? null)
      setStressDone(true)
    }
    setSavingStress(false)
  }

  const dateStr = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
  }).toUpperCase()

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', justifyContent: 'center' }}>
        {[120, 80, 48].map((w, i) => <div key={i} className="skeleton" style={{ width: w, height: 14 }} />)}
      </div>
    )
  }

  const allDone = moodDone && stressDone

  return (
    <div style={{ maxWidth: 720 }}>

      {/* Header */}
      <div style={{ marginBottom: 8 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(36px,5vw,56px)', color: 'var(--ink)', letterSpacing: '-0.03em', lineHeight: 1 }}>
          RECORD TODAY.
        </h1>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.1em', marginTop: 6 }}>
          {dateStr}
        </div>
        <div style={{ borderTop: '1.5px solid var(--border)', marginTop: 10, marginBottom: 24 }} />
      </div>

      {/* All done strip */}
      <AnimatePresence>
        {allDone && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{
              fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em',
              color: 'var(--ink-invert)', background: 'var(--bg-invert)',
              padding: '12px 16px', marginBottom: 24,
            }}
          >
            ALL DONE FOR TODAY. SEE YOU TOMORROW.
          </motion.div>
        )}
      </AnimatePresence>

      {/* Two sections side by side on tablet+, stacked on mobile */}
      <div className="grid-2col" style={{ gap: 24 }}>

        {/* ── MOOD SECTION ── */}
        <div style={{ border: '1.5px solid var(--border)' }}>
          <SectionHeader num="01" label="MOOD" done={moodDone} />

          {moodDone && todayMood ? (
            <div style={{ padding: '20px 14px' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 36, color: 'var(--ink)', letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 8 }}>
                {MOODS.find(m => m.value === todayMood.mood_score)?.label}
              </div>
              {todayMood.note && (
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-3)', fontStyle: 'italic', marginBottom: 12 }}>
                  &ldquo;{todayMood.note}&rdquo;
                </p>
              )}
              <button
                onClick={() => setMoodDone(false)}
                style={{
                  fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11,
                  color: 'var(--ink-3)', background: 'none',
                  border: '1.5px solid var(--border-2)', padding: '5px 12px',
                  cursor: 'pointer', letterSpacing: '0.06em',
                }}
              >
                LOG AGAIN
              </button>
            </div>
          ) : (
            <div style={{ padding: '14px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.12em', marginBottom: 8 }}>
                HOW ARE YOU FEELING?
              </div>
              <OptionGrid options={MOODS} value={selMood} onChange={setSelMood} />

              <AnimatePresence>
                {selMood !== null && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}
                  >
                    <textarea
                      value={moodNote}
                      onChange={e => setMoodNote(e.target.value)}
                      rows={2}
                      placeholder="Optional note..."
                      className="br-input"
                      style={{ width: '100%', padding: '10px', resize: 'none', fontFamily: 'var(--font-body)', fontSize: 13, boxSizing: 'border-box', marginTop: 12 }}
                    />
                    <button
                      onClick={saveMood}
                      disabled={savingMood}
                      className="br-btn br-btn-inv"
                      style={{ width: '100%', padding: '12px', fontSize: 12, letterSpacing: '0.06em', marginTop: 10, opacity: savingMood ? 0.6 : 1 }}
                    >
                      {savingMood ? 'SAVING...' : `LOG AS ${MOODS.find(m => m.value === selMood)?.label} →`}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* ── STRESS SECTION ── */}
        <div style={{ border: '1.5px solid var(--border)' }}>
          <SectionHeader num="02" label="ACADEMIC STRESS" done={stressDone} />

          {stressDone && todayStress ? (
            <div style={{ padding: '20px 14px' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 36, color: 'var(--ink)', letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 8 }}>
                {todayStress.stress_level}/5
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.08em' }}>
                STRESS  ·  PERFORMANCE {todayStress.performance_rating}/5
              </div>
            </div>
          ) : (
            <div style={{ padding: '14px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.12em', marginBottom: 8 }}>
                ACADEMIC PERFORMANCE TODAY
              </div>
              <OptionGrid options={PERFORMANCE} value={selPerf} onChange={setSelPerf} />

              <AnimatePresence>
                {selPerf !== null && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}
                  >
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.12em', marginTop: 16, marginBottom: 8 }}>
                      STRESS LEVEL TODAY
                    </div>
                    <OptionGrid options={STRESS_LEVELS} value={selStress} onChange={setSelStress} />
                    <AnimatePresence>
                      {selStress !== null && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
                          <button
                            onClick={saveStress}
                            disabled={savingStress}
                            className="br-btn br-btn-inv"
                            style={{ width: '100%', padding: '12px', fontSize: 12, letterSpacing: '0.06em', marginTop: 12, opacity: savingStress ? 0.6 : 1 }}
                          >
                            {savingStress ? 'SAVING...' : 'LOG STRESS →'}
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Footer note */}
      {!allDone && (
        <div style={{ marginTop: 20, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.08em', lineHeight: 1.6 }}>
          BOTH ENTRIES HELP THE RESEARCH.  TAKES UNDER 30 SECONDS.
        </div>
      )}
    </div>
  )
}
