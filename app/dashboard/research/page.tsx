'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'

const PERFORMANCE = [
  { value: 5, label: 'EXCELLENT' },
  { value: 4, label: 'GOOD' },
  { value: 3, label: 'AVERAGE' },
  { value: 2, label: 'BELOW AVERAGE' },
  { value: 1, label: 'POOR' },
]

const STRESS = [
  { value: 5, label: 'EXTREMELY STRESSED' },
  { value: 4, label: 'VERY STRESSED' },
  { value: 3, label: 'MODERATELY STRESSED' },
  { value: 2, label: 'SLIGHTLY STRESSED' },
  { value: 1, label: 'NOT STRESSED' },
]

const YES_NO = [
  { value: 'yes',      label: 'YES' },
  { value: 'no',       label: 'NO' },
  { value: 'planning', label: 'PLANNING TO' },
]

const IMPACT = [
  { value: 'yes',      label: 'YES' },
  { value: 'no',       label: 'NO' },
  { value: 'somewhat', label: 'SOMEWHAT' },
]

function OptionRow({ label, value, selected, onClick }: {
  label: string; value?: string; selected: boolean; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        width: '100%', padding: '11px 14px', textAlign: 'left',
        background: selected ? 'var(--bg-invert)' : 'var(--bg)',
        color: selected ? 'var(--ink-invert)' : 'var(--ink)',
        border: 'none', borderBottom: '1px solid var(--border-2)',
        fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12,
        letterSpacing: '0.06em', cursor: 'pointer',
        transition: 'background 80ms, color 80ms',
      }}
      onMouseEnter={e => { if (!selected) (e.currentTarget as HTMLElement).style.background = 'var(--bg-card)' }}
      onMouseLeave={e => { if (!selected) (e.currentTarget as HTMLElement).style.background = 'var(--bg)' }}
    >
      <span>{label}</span>
      {value && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, opacity: 0.45 }}>{value}</span>}
    </button>
  )
}

function TripleButton({ options, value, onChange }: {
  options: typeof YES_NO; value: string | null; onChange: (v: string) => void
}) {
  return (
    <div style={{ display: 'flex', border: '1.5px solid var(--border)', overflow: 'hidden' }}>
      {options.map(({ value: v, label }, i) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          style={{
            flex: 1, padding: '11px 8px',
            background: value === v ? 'var(--bg-invert)' : 'var(--bg)',
            color: value === v ? 'var(--ink-invert)' : 'var(--ink)',
            border: 'none', borderRight: i < options.length - 1 ? '1px solid var(--border-2)' : 'none',
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11,
            letterSpacing: '0.06em', cursor: 'pointer',
            transition: 'background 80ms, color 80ms',
          }}
        >
          {label}
        </button>
      ))}
    </div>
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
  const [todayEntry, setTodayEntry]       = useState<any>(null)

  useEffect(() => { checkTodayEntry(); fetchRecentEntries() }, [])

  const checkTodayEntry = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const today = new Date().toISOString().split('T')[0]
    const { data } = await supabase
      .from('academic_stress').select('*').eq('user_id', user.id)
      .gte('created_at', today).order('created_at', { ascending: false }).limit(1).single()
    if (data) { setAlreadyLogged(true); setTodayEntry(data) }
  }

  const fetchRecentEntries = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('academic_stress').select('*').eq('user_id', user.id)
      .order('created_at', { ascending: false }).limit(7)
    setRecentEntries(data || [])
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
        setTimeout(() => setSuccess(false), 4000)
      }
    }
    setLoading(false)
  }

  return (
    <div>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 8, paddingRight: 64 }}>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: 'clamp(36px,5vw,56px)', color: 'var(--ink)',
          letterSpacing: '-0.03em', lineHeight: 1,
        }}>
          ACADEMIC STRESS
        </h1>
        <button
          onClick={() => router.push('/dashboard/research/insights')}
          className="br-btn"
          style={{ padding: '8px 16px', fontSize: 11, letterSpacing: '0.06em', marginBottom: 4, cursor: 'pointer' }}
        >
          INSIGHTS →
        </button>
      </div>
      <div style={{ borderTop: '1.5px solid var(--border)', marginBottom: 24 }} />

      {/* Success strip */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            style={{
              fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em',
              color: 'var(--ink-invert)', background: 'var(--bg-invert)',
              padding: '10px 14px', marginBottom: 16,
            }}
          >
            LOGGED. ENTRY SAVED  ·  {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Already logged */}
      {alreadyLogged && todayEntry && (
        <div style={{
          border: '1.5px solid var(--border)', padding: '10px 14px', marginBottom: 24,
          background: 'var(--bg-card)',
          fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-2)', letterSpacing: '0.06em',
        }}>
          ALREADY LOGGED TODAY  ·  PERFORMANCE: {todayEntry.performance_rating}/5  ·  STRESS: {todayEntry.stress_level}/5  ·  COME BACK TOMORROW
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,2fr) minmax(0,1fr)', gap: 24 }}>

        {/* Form */}
        <div style={{ opacity: alreadyLogged ? 0.4 : 1, pointerEvents: alreadyLogged ? 'none' : 'auto' }}>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.12em', marginBottom: 8 }}>
              01  HOW WAS YOUR ACADEMIC PERFORMANCE TODAY?
            </div>
            <div style={{ border: '1.5px solid var(--border)', overflow: 'hidden' }}>
              {PERFORMANCE.map(({ value, label }) => (
                <OptionRow key={value} label={label} value={`${value}/5`} selected={performance === value} onClick={() => setPerformance(value)} />
              ))}
            </div>
          </div>

          <AnimatePresence>
            {performance !== null && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ marginBottom: 20, overflow: 'hidden' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.12em', marginBottom: 8 }}>
                  02  HOW STRESSED WERE YOU TODAY?
                </div>
                <div style={{ border: '1.5px solid var(--border)', overflow: 'hidden' }}>
                  {STRESS.map(({ value, label }) => (
                    <OptionRow key={value} label={label} value={`${value}/5`} selected={stressLevel === value} onClick={() => setStressLevel(value)} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {stressLevel !== null && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ marginBottom: 20, overflow: 'hidden' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.12em', marginBottom: 8 }}>
                  03  DID YOU SELF-STUDY AT HOME TODAY?
                </div>
                <TripleButton options={YES_NO} value={selfStudy} onChange={setSelfStudy} />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {selfStudy !== null && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ marginBottom: 20, overflow: 'hidden' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.12em', marginBottom: 8 }}>
                  04  DID ACADEMIC PERFORMANCE IMPACT YOUR MOOD?
                </div>
                <TripleButton options={IMPACT} value={moodImpact} onChange={setMoodImpact} />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {moodImpact !== null && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ marginBottom: 20, overflow: 'hidden' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.12em', marginBottom: 8 }}>
                  05  DID IT IMPACT YOUR DAY-TO-DAY LIFE?
                </div>
                <TripleButton options={IMPACT} value={lifeImpact} onChange={setLifeImpact} />
                {lifeImpact === 'yes' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ marginTop: 8 }}>
                    <input
                      type="text"
                      value={lifeImpactExample}
                      onChange={e => setLifeImpactExample(e.target.value)}
                      placeholder="WHAT DID YOU MISS OUT ON?"
                      style={{
                        width: '100%', padding: '11px 14px', boxSizing: 'border-box',
                        fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.06em',
                        color: 'var(--ink)', background: 'var(--bg)',
                        border: '1.5px solid var(--border)', outline: 'none',
                      }}
                    />
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {lifeImpact !== null && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <button
                  onClick={handleSubmit}
                  disabled={!performance || !stressLevel || loading || alreadyLogged}
                  className="br-btn br-btn-inv"
                  style={{
                    width: '100%', padding: '13px', fontSize: 12, letterSpacing: '0.08em',
                    opacity: alreadyLogged || loading ? 0.45 : 1,
                    cursor: alreadyLogged || loading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {alreadyLogged ? 'ALREADY LOGGED TODAY' : loading ? 'SAVING…' : 'LOG ENTRY →'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Recent entries */}
        <div>
          <div style={{ border: '1.5px solid var(--border)', position: 'sticky', top: 24 }}>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.12em',
              padding: '9px 12px', borderBottom: '1.5px solid var(--border)',
            }}>
              RECENT ENTRIES
            </div>
            {recentEntries.length === 0 ? (
              <div style={{ padding: '20px 12px', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.06em' }}>
                NO ENTRIES YET.
              </div>
            ) : (
              recentEntries.map((entry, i) => (
                <div
                  key={entry.id}
                  style={{ padding: '9px 12px', borderBottom: i < recentEntries.length - 1 ? '1px solid var(--border-2)' : 'none' }}
                >
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.08em', marginBottom: 4 }}>
                    {new Date(entry.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }).toUpperCase()}
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12, color: 'var(--ink)', letterSpacing: '0.04em' }}>
                    P: {entry.performance_rating}/5  ·  S: {entry.stress_level}/5
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
