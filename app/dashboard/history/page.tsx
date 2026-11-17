'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { localDateKey } from '@/lib/dates'
import { MOODS, moodFor } from '@/lib/moods'
import { PageHeader } from '@/components/app/PageHeader'
import { Skeleton } from '@/components/ui/kit'
import { MoodGlyph } from '@/components/ui/MoodGlyph'

const STRESS_LABELS: Record<number, string> = { 1: 'Not stressed', 2: 'Slightly stressed', 3: 'Moderately stressed', 4: 'Very stressed', 5: 'Extremely stressed' }

interface MoodEntry { id: string; created_at: string; mood_score: number; note: string | null }
interface StressEntry { id: string; created_at: string; stress_level: number; performance_rating: number }
interface DayRecord { dateKey: string; mood: MoodEntry | null; stress: StressEntry | null }

const dateOf = (key: string) => { const [y, m, d] = key.split('-').map(Number); return new Date(y, m - 1, d) }

export default function HistoryPage() {
  const [days, setDays]       = useState<DayRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [totals, setTotals]   = useState({ moods: 0, stress: 0 })
  const [filter, setFilter]   = useState<number | null>(null)

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const [{ data: moodData }, { data: stressData }] = await Promise.all([
        supabase.from('moods').select('id, created_at, mood_score, note')
          .eq('user_id', session.user.id).order('created_at', { ascending: false }),
        supabase.from('academic_stress').select('id, created_at, stress_level, performance_rating')
          .eq('user_id', session.user.id).order('created_at', { ascending: false }),
      ])
      const moods: MoodEntry[] = moodData ?? []
      const stresses: StressEntry[] = stressData ?? []
      setTotals({ moods: moods.length, stress: stresses.length })

      // One row per local day, keeping the latest entry of each kind.
      const dayMap: Record<string, DayRecord> = {}
      for (const m of moods) {
        const key = localDateKey(m.created_at)
        dayMap[key] ??= { dateKey: key, mood: null, stress: null }
        dayMap[key].mood ??= m
      }
      for (const s of stresses) {
        const key = localDateKey(s.created_at)
        dayMap[key] ??= { dateKey: key, mood: null, stress: null }
        dayMap[key].stress ??= s
      }
      setDays(Object.values(dayMap).sort((a, b) => b.dateKey.localeCompare(a.dateKey)))
      setLoading(false)
    }
    load()
  }, [])

  const shown = filter ? days.filter(d => d.mood?.mood_score === filter) : days
  const months = useMemo(() => {
    const groups: { label: string; days: DayRecord[] }[] = []
    for (const d of shown) {
      const label = dateOf(d.dateKey).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
      if (groups.at(-1)?.label !== label) groups.push({ label, days: [] })
      groups.at(-1)!.days.push(d)
    }
    return groups
  }, [shown])

  return (
    <div>
      <PageHeader lines={['your', 'days']} accent="days" art="dawn" sticker="calendar"
        lead={loading ? undefined : `${totals.moods} mood check-ins and ${totals.stress} stress check-ins so far.`}>
        <Link href="/dashboard/today" className="pill pill--tape pill--sm">Record today</Link>
      </PageHeader>

      {loading ? <Skeleton /> : days.length === 0 ? (
        <div className="sheet sheet--pad stack-sm">
          <h2 className="section-title" style={{ margin: 0 }}>Nothing recorded yet</h2>
          <p className="t-body muted">Record today&apos;s mood and stress, and each day will collect here.</p>
        </div>
      ) : (
        <div className="stack-lg page-narrow">
          <div role="radiogroup" aria-label="Show days by mood" className="row" style={{ gap: 8 }}>
            <button type="button" role="radio" aria-checked={filter === null} className="chip" onClick={() => setFilter(null)}>All days</button>
            {MOODS.map(m => (
              <button key={m.score} type="button" role="radio" aria-checked={filter === m.score} className="chip" onClick={() => setFilter(m.score)}
                style={{ paddingLeft: 8 }}>
                <MoodGlyph score={m.score} size={26} />{m.label}
              </button>
            ))}
          </div>

          {shown.length === 0 && <p className="t-body muted">No {moodFor(filter)?.label.toLowerCase()} days yet.</p>}

          {months.map(g => (
            <section key={g.label} aria-label={g.label}>
              <h2 className="section-title">{g.label}</h2>
              <ul className="list sheet" style={{ padding: '4px 20px' }}>
                {g.days.map(day => {
                  const m = moodFor(day.mood?.mood_score)
                  const d = dateOf(day.dateKey)
                  return (
                    <li key={day.dateKey} style={{ alignItems: 'flex-start' }}>
                      <div style={{ width: 52, textAlign: 'center', flexShrink: 0 }}>
                        <p className="t-h3">{d.getDate()}</p>
                        <p className="t-small faint">{d.toLocaleDateString('en-GB', { weekday: 'short' })}</p>
                      </div>
                      <div style={{ flex: 1, minWidth: 0, display: 'grid', gap: 4 }}>
                        {m ? (
                          <p className="row t-label" style={{ fontSize: 16, gap: 8, flexWrap: 'nowrap' }}><MoodGlyph score={m.score} size={30} />{m.label}</p>
                        ) : <p className="t-small faint">No mood check-in</p>}
                        {day.mood?.note && <p className="t-small muted">&ldquo;{day.mood.note}&rdquo;</p>}
                        {day.stress && (
                          <p className="t-small">{STRESS_LABELS[day.stress.stress_level]}, school went {day.stress.performance_rating}/5</p>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
