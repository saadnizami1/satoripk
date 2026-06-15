'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'

const MOODS = [
  { score: 1, label: 'TERRIBLE' },
  { score: 2, label: 'BAD' },
  { score: 3, label: 'OKAY' },
  { score: 4, label: 'GOOD' },
  { score: 5, label: 'GREAT' },
]

const STRESS_OPTIONS = [
  { value: 'yes_heavy', label: 'YES, HEAVILY' },
  { value: 'yes_some',  label: 'YES, SOMEWHAT' },
  { value: 'no',        label: 'NOT REALLY' },
  { value: 'unsure',    label: 'NOT SURE' },
]

export default function MoodPage() {
  const [selected, setSelected]    = useState<number | null>(null)
  const [stressAnswer, setStress]  = useState('')
  const [note, setNote]            = useState('')
  const [alreadyLogged, setLogged] = useState(false)
  const [todayMood, setTodayMood]  = useState<any>(null)
  const [history, setHistory]      = useState<any[]>([])
  const [saving, setSaving]        = useState(false)
  const [confirmation, setConfirm] = useState('')
  const [userId, setUserId]        = useState('')

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      setUserId(session.user.id)

      const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
      const [{ data: today }, { data: hist }] = await Promise.all([
        supabase.from('moods').select('*').eq('user_id', session.user.id)
          .gte('created_at', todayStart.toISOString()).order('created_at', { ascending: false }).limit(1),
        supabase.from('moods').select('*').eq('user_id', session.user.id)
          .order('created_at', { ascending: false }).limit(7),
      ])
      if (today?.length) { setLogged(true); setTodayMood(today[0]) }
      setHistory(hist ?? [])
    }
    load()
  }, [])

  const handleSave = async () => {
    if (selected === null || !userId) return
    setSaving(true)
    const { error } = await supabase.from('moods').insert({
      user_id: userId, mood_score: selected,
      note: note || (stressAnswer ? `Academic stress: ${stressAnswer}` : null),
    })
    if (!error) {
      const label = MOODS.find(m => m.score === selected)!.label
      const now = new Date()
      const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()
      const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      setConfirm(`LOGGED. ${label} · ${dateStr} · ${timeStr}`)
      setTimeout(() => setConfirm(''), 4000)
      setLogged(true)
      const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
      const { data } = await supabase.from('moods').select('*').eq('user_id', userId)
        .gte('created_at', todayStart.toISOString()).limit(1)
      setTodayMood(data?.[0])
    }
    setSaving(false)
  }

  const selectedMood = MOODS.find(m => m.score === selected)

  return (
    <div style={{ maxWidth: 560 }}>

      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(36px, 5vw, 56px)', color: 'var(--ink)', letterSpacing: '-0.03em', lineHeight: 1 }}>
          MOOD TRACKER
        </h1>
        <div style={{ borderTop: '1.5px solid var(--border)', marginTop: 12 }} />
      </div>

      {/* Confirmation strip */}
      <AnimatePresence>
        {confirmation && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{
              fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-invert)',
              background: 'var(--bg-invert)', padding: '10px 16px', marginBottom: 24,
              letterSpacing: '0.08em', border: '1.5px solid var(--border)',
            }}
          >
            {confirmation}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Already logged */}
      {alreadyLogged && todayMood ? (
        <div style={{ border: '1.5px solid var(--border)', padding: '24px', marginBottom: 32 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.12em', marginBottom: 12 }}>
            TODAY&apos;S MOOD
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 40, color: 'var(--ink)', letterSpacing: '-0.02em', marginBottom: 8 }}>
            {MOODS.find(m => m.score === todayMood.mood_score)?.label}
          </div>
          {todayMood.note && (
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink-2)', fontStyle: 'italic' }}>
              &ldquo;{todayMood.note}&rdquo;
            </p>
          )}
          <button
            onClick={() => setLogged(false)}
            style={{
              marginTop: 16, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12,
              color: 'var(--ink-2)', background: 'none', border: '1.5px solid var(--border-2)',
              padding: '6px 14px', cursor: 'pointer', letterSpacing: '0.06em',
            }}
          >
            LOG AGAIN
          </button>
        </div>
      ) : (
        <div>
          {/* Mood selector */}
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.12em', marginBottom: 8 }}>
            HOW ARE YOU FEELING?
          </div>
          <div style={{ display: 'flex', border: '1.5px solid var(--border)', marginBottom: 24 }}>
            {MOODS.map((mood, i) => (
              <button
                key={mood.score}
                onClick={() => setSelected(mood.score)}
                style={{
                  flex: 1, padding: 'clamp(12px,3vw,20px) clamp(3px,1vw,8px)', textAlign: 'center',
                  background: selected === mood.score ? 'var(--bg-invert)' : 'var(--bg)',
                  color: selected === mood.score ? 'var(--ink-invert)' : 'var(--ink-2)',
                  border: 'none', borderRight: i < 4 ? '1.5px solid var(--border)' : 'none',
                  fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(8px, 1.8vw, 13px)',
                  letterSpacing: '0.02em', cursor: 'pointer',
                  transition: `background ${80}ms, color ${80}ms`,
                }}
              >
                {mood.label}
              </button>
            ))}
          </div>

          <AnimatePresence>
            {selected !== null && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ overflow: 'hidden' }}
              >
                {/* Stress question */}
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.12em', marginBottom: 8 }}>
                    IS THIS RELATED TO ACADEMIC STRESS?
                  </div>
                  <div style={{ display: 'flex', border: '1.5px solid var(--border)' }}>
                    {STRESS_OPTIONS.map((opt, i) => (
                      <button
                        key={opt.value}
                        onClick={() => setStress(stressAnswer === opt.value ? '' : opt.value)}
                        style={{
                          flex: 1, padding: 'clamp(10px,2.5vw,14px) clamp(3px,1vw,6px)', textAlign: 'center',
                          background: stressAnswer === opt.value ? 'var(--bg-invert)' : 'var(--bg)',
                          color: stressAnswer === opt.value ? 'var(--ink-invert)' : 'var(--ink-2)',
                          border: 'none', borderRight: i < 3 ? '1.5px solid var(--border)' : 'none',
                          fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(8px,1.8vw,11px)',
                          letterSpacing: '0.02em', cursor: 'pointer',
                          transition: `background ${80}ms, color ${80}ms`,
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Note */}
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.12em', marginBottom: 8 }}>
                    ADD A NOTE (OPTIONAL)
                  </div>
                  <textarea
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    rows={3}
                    placeholder="What's on your mind..."
                    className="br-input"
                    style={{ width: '100%', padding: '12px', resize: 'none', fontFamily: 'var(--font-body)', fontSize: 14, boxSizing: 'border-box' }}
                  />
                </div>

                {/* Submit */}
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="br-btn br-btn-inv"
                  style={{
                    width: '100%', padding: '16px',
                    fontSize: 14, letterSpacing: '0.06em',
                    opacity: saving ? 0.6 : 1,
                  }}
                >
                  {saving ? 'SAVING...' : `LOG AS ${selectedMood?.label} →`}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div style={{ marginTop: 48 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.12em', marginBottom: 12 }}>
            RECENT MOODS
          </div>
          <div style={{ border: '1.5px solid var(--border)' }}>
            {history.map((entry, i) => {
              const mood = MOODS.find(m => m.score === entry.mood_score)
              const date = new Date(entry.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }).toUpperCase()
              return (
                <div
                  key={entry.id ?? i}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderBottom: i < history.length - 1 ? '1px solid var(--border-2)' : 'none',
                  }}
                >
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 14, color: 'var(--ink)' }}>
                    {mood?.label}
                  </span>
                  {entry.note && (
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--ink-3)', flex: 1, padding: '0 16px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {entry.note}
                    </span>
                  )}
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)' }}>
                    {date}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
