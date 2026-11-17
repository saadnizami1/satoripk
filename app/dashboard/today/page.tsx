'use client'

import { useEffect, useState } from 'react'
import { Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { notifyCheckin, startOfToday } from '@/lib/dates'
import { moodFor } from '@/lib/moods'
import { PageHeader } from '@/components/app/PageHeader'
import { MoodPicker, ScalePicker } from '@/components/ui/controls'
import { MoodGlyph } from '@/components/ui/MoodGlyph'
import { Pill, Skeleton } from '@/components/ui/kit'

const PERFORMANCE = [
  { value: 1, label: 'Poor' },
  { value: 2, label: 'Below avg' },
  { value: 3, label: 'Average' },
  { value: 4, label: 'Good' },
  { value: 5, label: 'Excellent' },
]

const STRESS_LEVELS = [
  { value: 1, label: 'None' },
  { value: 2, label: 'Slight' },
  { value: 3, label: 'Moderate' },
  { value: 4, label: 'Very high' },
  { value: 5, label: 'Extreme' },
]

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
  const [error, setError]               = useState('')

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      setUserId(session.user.id)
      const todayStr = startOfToday()
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
    setSavingMood(true); setError('')
    const { data, error } = await supabase.from('moods').insert({
      user_id: userId, mood_score: selMood,
      note: moodNote.trim() || null,
    }).select().single()
    if (!error) {
      setTodayMood(data)
      setMoodDone(true)
      setSelMood(null); setMoodNote('')
      notifyCheckin()
    } else setError("Your mood didn't save. Check your connection and try again.")
    setSavingMood(false)
  }

  const saveStress = async () => {
    if (selPerf === null || selStress === null || !userId) return
    setSavingStress(true); setError('')
    const { data, error } = await supabase.from('academic_stress').insert({
      user_id: userId,
      performance_rating: selPerf,
      stress_level: selStress,
    }).select().single()
    if (!error) {
      setTodayStress(data)
      setStressDone(true)
      notifyCheckin()
    } else setError("Your stress check-in didn't save. Check your connection and try again.")
    setSavingStress(false)
  }

  const allDone = moodDone && stressDone
  const mood = moodFor(todayMood?.mood_score)

  return (
    <div>
      <PageHeader lines={['record', 'today']} accent="today" art="dawn" sticker="phone"
        lead="Two quick check-ins: how you feel, and how school feels. Under 30 seconds." />

      {loading ? <Skeleton /> : (
        <div className="stack">
          {allDone && (
            <div className="notice notice--ok" role="status">
              <strong>All done for today.</strong> See you tomorrow.
            </div>
          )}
          {error && <div className="notice notice--error" role="alert">{error}</div>}

          <div className="grid-2" style={{ alignItems: 'start' }}>
            {/* ── Mood ── */}
            <section aria-labelledby="t-mood" className="sheet sheet--pad stack">
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <h2 id="t-mood" className="section-title" style={{ margin: 0 }}>1. Mood</h2>
                {moodDone && <span className="row t-small" style={{ gap: 6 }}><Check size={16} aria-hidden="true" /> Recorded</span>}
              </div>

              {moodDone && mood ? (
                <div className="stack-sm">
                  <div className="row" style={{ gap: 14 }}>
                    <MoodGlyph score={mood.score} size={56} />
                    <p className="t-h3">{mood.label}</p>
                  </div>
                  {todayMood.note && <p className="t-body muted">&ldquo;{todayMood.note}&rdquo;</p>}
                  <div><button type="button" className="pill pill--ghost pill--sm" onClick={() => setMoodDone(false)}>Log again</button></div>
                </div>
              ) : (
                <>
                  <p id="t-mood-q" className="field__label">How are you feeling?</p>
                  <MoodPicker value={selMood} onChange={setSelMood} compact labelledBy="t-mood-q" />
                  {selMood !== null && (
                    <>
                      <div className="field">
                        <label htmlFor="t-note" className="field__label">Add a note <span className="faint" style={{ fontWeight: 400 }}>(optional)</span></label>
                        <textarea id="t-note" className="input" rows={2} maxLength={2000} value={moodNote} onChange={e => setMoodNote(e.target.value)}
                          placeholder="What's behind it?" style={{ minHeight: 80 }} />
                      </div>
                      <Pill variant="tape" block onClick={saveMood} disabled={savingMood}>
                        {savingMood ? 'Saving…' : `Save as ${moodFor(selMood)?.label.toLowerCase()}`}
                      </Pill>
                    </>
                  )}
                </>
              )}
            </section>

            {/* ── Stress ── */}
            <section aria-labelledby="t-stress" className="sheet sheet--pad stack">
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <h2 id="t-stress" className="section-title" style={{ margin: 0 }}>2. Academic stress</h2>
                {stressDone && <span className="row t-small" style={{ gap: 6 }}><Check size={16} aria-hidden="true" /> Recorded</span>}
              </div>

              {stressDone && todayStress ? (
                <div className="row" style={{ gap: 28 }}>
                  <div><p className="t-num">{todayStress.stress_level}<span className="t-h4 faint">/5</span></p><p className="t-small muted">stress</p></div>
                  <div><p className="t-num">{todayStress.performance_rating}<span className="t-h4 faint">/5</span></p><p className="t-small muted">how school went</p></div>
                </div>
              ) : (
                <>
                  <p id="t-perf-q" className="field__label">How did school go today?</p>
                  <ScalePicker options={PERFORMANCE} value={selPerf} onChange={setSelPerf} labelledBy="t-perf-q" />
                  <p id="t-stress-q" className="field__label">How stressed do you feel about it?</p>
                  <ScalePicker options={STRESS_LEVELS} value={selStress} onChange={setSelStress} labelledBy="t-stress-q" />
                  <Pill variant="tape" block onClick={saveStress} disabled={savingStress || selPerf === null || selStress === null}>
                    {savingStress ? 'Saving…' : 'Save stress check-in'}
                  </Pill>
                </>
              )}
            </section>
          </div>

          {!allDone && (
            <p className="t-small muted">If you said yes to research, both check-ins help the study. Either way, they build your mood graph.</p>
          )}
        </div>
      )}
    </div>
  )
}
