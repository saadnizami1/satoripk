'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { notifyCheckin, startOfToday } from '@/lib/dates'
import { moodFor } from '@/lib/moods'
import { PageHeader } from '@/components/app/PageHeader'
import { MoodPicker } from '@/components/ui/controls'
import { MoodGlyph } from '@/components/ui/MoodGlyph'
import { Pill } from '@/components/ui/kit'

const STRESS_OPTIONS = [
  { value: 'yes_heavy', label: 'Yes, a lot' },
  { value: 'yes_some',  label: 'Yes, somewhat' },
  { value: 'no',        label: 'Not really' },
  { value: 'unsure',    label: 'Not sure' },
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
  const [error, setError]          = useState('')
  const [userId, setUserId]        = useState('')

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      setUserId(session.user.id)

      const [{ data: today }, { data: hist }] = await Promise.all([
        supabase.from('moods').select('*').eq('user_id', session.user.id)
          .gte('created_at', startOfToday()).order('created_at', { ascending: false }).limit(1),
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
    setSaving(true); setError('')
    const { data: inserted, error } = await supabase.from('moods').insert({
      user_id: userId, mood_score: selected,
      note: note || (stressAnswer ? `Academic stress: ${stressAnswer}` : null),
    }).select().single()
    if (!error) {
      notifyCheckin()
      const time = new Date().toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit' })
      setConfirm(`Saved: ${moodFor(selected)!.label.toLowerCase()} at ${time}.`)
      setTimeout(() => setConfirm(''), 5000)
      setLogged(true)
      setTodayMood(inserted)
      setHistory(h => [inserted, ...h].slice(0, 7))
      setSelected(null); setNote(''); setStress('')
    } else setError("That didn't save. Check your connection and try again.")
    setSaving(false)
  }

  const today = moodFor(todayMood?.mood_score)
  const selectedMood = moodFor(selected)

  return (
    <div>
      <PageHeader lines={['how are you,', 'really?']} accent="really?" art="day" sticker="kite"
        lead="One tap. Add a note if you want to remember why." />

      <div className="page-narrow stack-lg">
        <div aria-live="polite">
          {confirmation && <div className="notice notice--ok">{confirmation}</div>}
          {error && <div className="notice notice--error" role="alert">{error}</div>}
        </div>

        {alreadyLogged && today ? (
          <section className="sheet sheet--pad stack-sm" aria-labelledby="m-today">
            <h2 id="m-today" className="t-small muted" style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}>Today&apos;s mood</h2>
            <div className="row" style={{ gap: 16 }}>
              <MoodGlyph score={today.score} size={64} />
              <div>
                <p className="t-h2">{today.label}</p>
                {todayMood.note && <p className="t-body muted" style={{ marginTop: 4 }}>&ldquo;{todayMood.note}&rdquo;</p>}
              </div>
            </div>
            <div className="row" style={{ marginTop: 8 }}>
              <button type="button" className="pill pill--ghost pill--sm" onClick={() => setLogged(false)}>Log again</button>
              <Link href={today.next.href} className="pill pill--tape pill--sm">{today.next.label}</Link>
            </div>
          </section>
        ) : (
          <section className="sheet sheet--pad stack" aria-labelledby="m-q">
            <h2 id="m-q" className="section-title" style={{ margin: 0 }}>How are you feeling?</h2>
            <MoodPicker value={selected} onChange={setSelected} labelledBy="m-q" />
            {selectedMood && <p className="t-body muted">{selectedMood.reply}</p>}

            {selected !== null && (
              <>
                <div className="stack-sm">
                  <p id="m-stress" className="field__label">Is this about school stress?</p>
                  <div role="radiogroup" aria-labelledby="m-stress" className="row" style={{ gap: 8 }}>
                    {STRESS_OPTIONS.map(opt => (
                      <button key={opt.value} type="button" role="radio" aria-checked={stressAnswer === opt.value} className="chip"
                        onClick={() => setStress(stressAnswer === opt.value ? '' : opt.value)}>{opt.label}</button>
                    ))}
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="m-note" className="field__label">Add a note <span className="faint" style={{ fontWeight: 400 }}>(optional)</span></label>
                  <textarea id="m-note" className="input" rows={3} maxLength={2000} value={note} onChange={e => setNote(e.target.value)} placeholder="What's on your mind?" />
                </div>
                <Pill variant="tape" size="lg" block onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving…' : `Save as ${selectedMood?.label.toLowerCase()}`}
                </Pill>
              </>
            )}
          </section>
        )}

        {history.length > 0 && (
          <section aria-labelledby="m-recent">
            <h2 id="m-recent" className="section-title">Recent moods</h2>
            <ul className="list sheet" style={{ padding: '4px 20px' }}>
              {history.map((entry, i) => {
                const m = moodFor(entry.mood_score)
                return (
                  <li key={entry.id ?? i}>
                    <MoodGlyph score={entry.mood_score} size={36} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p className="t-label" style={{ fontSize: 16 }}>{m?.label}</p>
                      {entry.note && <p className="t-small muted" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.note}</p>}
                    </div>
                    <span className="t-small faint">{new Date(entry.created_at).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                  </li>
                )
              })}
            </ul>
            <p className="t-small" style={{ marginTop: 12 }}><Link href="/dashboard/graph" className="link">See your mood graph</Link></p>
          </section>
        )}
      </div>
    </div>
  )
}
