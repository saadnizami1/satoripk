'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { notifyCheckin, startOfToday } from '@/lib/dates'
import { PageHeader } from '@/components/app/PageHeader'
import { ScalePicker } from '@/components/ui/controls'
import { Pill } from '@/components/ui/kit'

const PERFORMANCE = [
  { value: 1, label: 'Poor' },
  { value: 2, label: 'Below avg' },
  { value: 3, label: 'Average' },
  { value: 4, label: 'Good' },
  { value: 5, label: 'Excellent' },
]

const STRESS = [
  { value: 1, label: 'Not at all' },
  { value: 2, label: 'Slightly' },
  { value: 3, label: 'Moderately' },
  { value: 4, label: 'Very' },
  { value: 5, label: 'Extremely' },
]

// Stored inside academic_stress.notes as JSON; keep the values stable.
const YES_NO = [
  { value: 'yes',      label: 'Yes' },
  { value: 'no',       label: 'No' },
  { value: 'planning', label: 'Planning to' },
]

const IMPACT = [
  { value: 'yes',      label: 'Yes' },
  { value: 'no',       label: 'No' },
  { value: 'somewhat', label: 'Somewhat' },
]

function Choice({ id, label, options, value, onChange }: {
  id: string; label: string; options: { value: string; label: string }[]; value: string | null; onChange: (v: string) => void
}) {
  return (
    <div className="stack-sm">
      <p id={id} className="field__label">{label}</p>
      <div role="radiogroup" aria-labelledby={id} className="row" style={{ gap: 8 }}>
        {options.map(o => (
          <button key={o.value} type="button" role="radio" aria-checked={value === o.value} className="chip" onClick={() => onChange(o.value)}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function AcademicStressPage() {
  const [performance, setPerformance] = useState<number | null>(null)
  const [stressLevel, setStressLevel] = useState<number | null>(null)
  const [selfStudy, setSelfStudy]     = useState<string | null>(null)
  const [moodImpact, setMoodImpact]   = useState<string | null>(null)
  const [lifeImpact, setLifeImpact]   = useState<string | null>(null)
  const [lifeImpactExample, setLifeImpactExample] = useState('')
  const [recentEntries, setRecentEntries] = useState<any[]>([])
  const [loading, setLoading]   = useState(false)
  const [success, setSuccess]   = useState(false)
  const [error, setError]       = useState('')
  const [alreadyLogged, setAlreadyLogged] = useState(false)
  const [todayEntry, setTodayEntry]       = useState<any>(null)

  useEffect(() => { loadEntries() }, [])

  // One query covers both "already logged today?" and the recent list.
  const loadEntries = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const { data } = await supabase
      .from('academic_stress').select('*').eq('user_id', session.user.id)
      .order('created_at', { ascending: false }).limit(7)
    const entries = data || []
    setRecentEntries(entries)
    const latest = entries[0]
    if (latest && new Date(latest.created_at) >= new Date(startOfToday())) { setAlreadyLogged(true); setTodayEntry(latest) }
  }

  const handleSubmit = async () => {
    if (!performance || !stressLevel || alreadyLogged) return
    setLoading(true); setError('')
    const { data: { session } } = await supabase.auth.getSession()
    const user = session?.user
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
        loadEntries()
        notifyCheckin()
        setTimeout(() => setSuccess(false), 5000)
      } else setError("That didn't save. Check your connection and try again.")
    }
    setLoading(false)
  }

  const ready = !!performance && !!stressLevel && selfStudy !== null && moodImpact !== null && lifeImpact !== null

  return (
    <div>
      <PageHeader lines={["what's heavy", 'right now']} accent="heavy" art="dusk" sticker="pencil"
        lead="Name it, track it, and watch it change over the term.">
        <Pill href="/dashboard/research/insights" variant="ghost" size="sm" style={{ background: 'var(--paper)' } as React.CSSProperties}>See your stress insights</Pill>
      </PageHeader>

      <div className="stress-grid">
        <section aria-labelledby="s-form" className="sheet sheet--pad stack-lg">
          <h2 id="s-form" className="section-title" style={{ margin: 0 }}>Today&apos;s check-in</h2>
          <div aria-live="polite">
            {success && <div className="notice notice--ok">Saved. Thanks for checking in.</div>}
            {error && <div className="notice notice--error" role="alert">{error}</div>}
          </div>

          {alreadyLogged && todayEntry ? (
            <div className="stack-sm">
              <p className="t-body">You&apos;ve already checked in today. Come back tomorrow.</p>
              <div className="row" style={{ gap: 28 }}>
                <div><p className="t-num">{todayEntry.stress_level}<span className="t-h4 faint">/5</span></p><p className="t-small muted">stress</p></div>
                <div><p className="t-num">{todayEntry.performance_rating}<span className="t-h4 faint">/5</span></p><p className="t-small muted">how school went</p></div>
              </div>
            </div>
          ) : (
            <>
              <div className="stack-sm">
                <p id="s-perf" className="field__label">How did school go today?</p>
                <ScalePicker options={PERFORMANCE} value={performance} onChange={setPerformance} labelledBy="s-perf" />
              </div>
              {performance !== null && (
                <div className="stack-sm">
                  <p id="s-level" className="field__label">How stressed were you?</p>
                  <ScalePicker options={STRESS} value={stressLevel} onChange={setStressLevel} labelledBy="s-level" />
                </div>
              )}
              {stressLevel !== null && <Choice id="s-self" label="Did you self-study at home today?" options={YES_NO} value={selfStudy} onChange={setSelfStudy} />}
              {selfStudy !== null && <Choice id="s-mood" label="Did school affect your mood?" options={IMPACT} value={moodImpact} onChange={setMoodImpact} />}
              {moodImpact !== null && (
                <div className="stack-sm">
                  <Choice id="s-life" label="Did it affect the rest of your day?" options={IMPACT} value={lifeImpact} onChange={setLifeImpact} />
                  {lifeImpact === 'yes' && (
                    <div className="field">
                      <label htmlFor="s-example" className="field__label">What did you miss out on? <span className="faint" style={{ fontWeight: 400 }}>(optional)</span></label>
                      <input id="s-example" className="input" value={lifeImpactExample} onChange={e => setLifeImpactExample(e.target.value)} placeholder="e.g. skipped cricket with friends" />
                    </div>
                  )}
                </div>
              )}
              {lifeImpact !== null && (
                <Pill variant="tape" size="lg" block onClick={handleSubmit} disabled={!ready || loading}>
                  {loading ? 'Saving…' : 'Save check-in'}
                </Pill>
              )}
            </>
          )}
        </section>

        <aside aria-labelledby="s-recent">
          <div className="sheet sheet--pad">
            <h2 id="s-recent" className="section-title">Recent entries</h2>
            {recentEntries.length === 0 ? (
              <p className="t-body muted">Nothing yet. Your first check-in will show up here.</p>
            ) : (
              <ul className="list">
                {recentEntries.map(entry => (
                  <li key={entry.id} style={{ justifyContent: 'space-between' }}>
                    <span className="t-small muted">{new Date(entry.created_at).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                    <span className="t-small"><strong>Stress {entry.stress_level}/5</strong> · school {entry.performance_rating}/5</span>
                  </li>
                ))}
              </ul>
            )}
            <p className="t-small" style={{ marginTop: 12 }}><Link href="/dashboard/research/insights" className="link">Open insights</Link></p>
          </div>
        </aside>
      </div>

      <style>{`
        .stress-grid { display: grid; grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr); gap: 20px; align-items: start; }
        .stress-grid aside { position: sticky; top: 100px; }
        @media (max-width: 900px) { .stress-grid { grid-template-columns: 1fr; } .stress-grid aside { position: static; } }
      `}</style>
    </div>
  )
}
