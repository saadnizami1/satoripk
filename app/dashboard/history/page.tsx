'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const MOOD_LABELS: Record<number, string> = {
  1: 'TERRIBLE',
  2: 'BAD',
  3: 'OKAY',
  4: 'GOOD',
  5: 'GREAT',
}

const STRESS_LABELS: Record<number, string> = {
  1: 'NOT STRESSED',
  2: 'SLIGHTLY',
  3: 'MODERATELY',
  4: 'VERY STRESSED',
  5: 'EXTREMELY',
}

interface MoodEntry {
  id: string
  created_at: string
  mood_score: number
  note?: string
}

interface StressEntry {
  id: string
  created_at: string
  stress_level: number
  performance_rating: number
}

interface DayRecord {
  dateKey: string
  displayDate: string
  mood: MoodEntry | null
  stress: StressEntry | null
}

function toDateKey(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function formatDisplayDate(key: string): string {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', {
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
  }).toUpperCase()
}

export default function HistoryPage() {
  const [days, setDays]       = useState<DayRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [totalMoods, setTotalMoods]   = useState(0)
  const [totalStress, setTotalStress] = useState(0)

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const [{ data: moodData }, { data: stressData }] = await Promise.all([
        supabase.from('moods').select('id, created_at, mood_score, note')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false }),
        supabase.from('academic_stress').select('id, created_at, stress_level, performance_rating')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false }),
      ])

      const moods: MoodEntry[] = moodData ?? []
      const stresses: StressEntry[] = stressData ?? []

      setTotalMoods(moods.length)
      setTotalStress(stresses.length)

      // Build a map keyed by date, keeping latest entry per day
      const dayMap: Record<string, DayRecord> = {}

      for (const m of moods) {
        const key = toDateKey(m.created_at)
        if (!dayMap[key]) dayMap[key] = { dateKey: key, displayDate: formatDisplayDate(key), mood: null, stress: null }
        if (!dayMap[key].mood) dayMap[key].mood = m
      }

      for (const s of stresses) {
        const key = toDateKey(s.created_at)
        if (!dayMap[key]) dayMap[key] = { dateKey: key, displayDate: formatDisplayDate(key), mood: null, stress: null }
        if (!dayMap[key].stress) dayMap[key].stress = s
      }

      const sorted = Object.values(dayMap).sort((a, b) => b.dateKey.localeCompare(a.dateKey))
      setDays(sorted)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', justifyContent: 'center' }}>
        {[120, 80, 48].map((w, i) => <div key={i} className="skeleton" style={{ width: w, height: 14 }} />)}
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 680 }}>

      {/* Header */}
      <div style={{ marginBottom: 8 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(36px,5vw,56px)', color: 'var(--ink)', letterSpacing: '-0.03em', lineHeight: 1 }}>
          HISTORY.
        </h1>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.1em', marginTop: 6 }}>
          {totalMoods} MOOD LOGS  ·  {totalStress} STRESS LOGS
        </div>
        <div style={{ borderTop: '1.5px solid var(--border)', marginTop: 10, marginBottom: 24 }} />
      </div>

      {days.length === 0 ? (
        <div style={{ border: '1.5px solid var(--border)', padding: '32px 20px', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--ink)', letterSpacing: '0.04em', marginBottom: 8 }}>
            NO DATA YET.
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.08em' }}>
            START BY RECORDING TODAY&apos;S MOOD AND STRESS.
          </div>
        </div>
      ) : (
        <>
          {/* Column headers */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0,1.4fr) minmax(0,1fr) minmax(0,1fr)',
            padding: '6px 16px',
            borderBottom: '1px solid var(--border-2)',
          }}>
            {['DATE', 'MOOD', 'STRESS'].map(h => (
              <span key={h} style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.14em' }}>{h}</span>
            ))}
          </div>

          {/* Entries */}
          <div style={{ border: '1.5px solid var(--border)', borderTop: 'none' }}>
            {days.map((day, i) => (
              <div
                key={day.dateKey}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0,1.4fr) minmax(0,1fr) minmax(0,1fr)',
                  padding: '12px 16px',
                  borderBottom: i < days.length - 1 ? '1px solid var(--border-2)' : 'none',
                  alignItems: 'start',
                }}
              >
                {/* Date */}
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.06em', paddingRight: 8 }}>
                  {day.displayDate}
                </div>

                {/* Mood */}
                <div style={{ paddingRight: 8 }}>
                  {day.mood ? (
                    <>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 13, color: 'var(--ink)', letterSpacing: '0.02em' }}>
                        {MOOD_LABELS[day.mood.mood_score]}
                      </div>
                      {day.mood.note && (
                        <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--ink-3)', fontStyle: 'italic', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {day.mood.note}
                        </div>
                      )}
                    </>
                  ) : (
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--border-2)', letterSpacing: '0.08em' }}>—</span>
                  )}
                </div>

                {/* Stress */}
                <div>
                  {day.stress ? (
                    <>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 13, color: 'var(--ink)', letterSpacing: '0.02em' }}>
                        {STRESS_LABELS[day.stress.stress_level]}
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.06em', marginTop: 2 }}>
                        PERF {day.stress.performance_rating}/5
                      </div>
                    </>
                  ) : (
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--border-2)', letterSpacing: '0.08em' }}>—</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.1em', marginTop: 16 }}>
            SHOWING {days.length} {days.length === 1 ? 'DAY' : 'DAYS'} OF DATA  ·  ONE ENTRY PER DAY SHOWN
          </div>
        </>
      )}
    </div>
  )
}
