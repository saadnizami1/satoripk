'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/database.types'
import { notifyCheckin } from '@/lib/dates'
import {
  CHEATING, CITIES, GRADES, GRADE_TO_PERFORMANCE, HOBBIES, PRIOR_RESEARCH, RELIGIONS,
  SCHOOL_TYPES, STRESS_IS_ACADEMIC, STRESS_LEVELS, SUBJECTS, TRAITS, TUTORING,
} from '@/lib/profile-options'
import { PageHeader } from '@/components/app/PageHeader'
import { ChipGroup, OptionRows, ScalePicker } from '@/components/ui/controls'
import { Pill, Skeleton } from '@/components/ui/kit'

/*
 * The study questionnaire that used to be part of sign-up. Everything is
 * optional and saved chapter by chapter, into the same profile columns
 * (and the same stored values) the research views export.
 */

interface Answers {
  city: string; religion: string; school_type: string; school_name: string
  hobbies: string[]; personality_traits: string[]
  favorite_subject: string; favorite_subject_why: string; worst_subject: string; worst_subject_why: string
  report_card_average: string; has_tutoring: string
  academic_stress: number | null; stress_is_academic: string; has_cheated: string; previous_research: string
}

const EMPTY: Answers = {
  city: '', religion: '', school_type: '', school_name: '', hobbies: [], personality_traits: [],
  favorite_subject: '', favorite_subject_why: '', worst_subject: '', worst_subject_why: '',
  report_card_average: '', has_tutoring: '', academic_stress: null, stress_is_academic: '', has_cheated: '', previous_research: '',
}

const CHAPTERS = [
  { id: 'school', title: 'You and your school', keys: ['city', 'religion', 'school_type', 'school_name'] },
  { id: 'life', title: 'Outside the classroom', keys: ['hobbies', 'personality_traits'] },
  { id: 'subjects', title: 'Subjects and grades', keys: ['favorite_subject', 'favorite_subject_why', 'worst_subject', 'worst_subject_why', 'report_card_average', 'has_tutoring'] },
  { id: 'pressure', title: 'Pressure', keys: ['academic_stress', 'stress_is_academic', 'has_cheated', 'previous_research'] },
] as const

export default function SurveyPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [a, setA] = useState<Answers>(EMPTY)
  const [loading, setLoading] = useState(true)
  const [chapter, setChapter] = useState(0)
  const [saved, setSaved] = useState<boolean[]>([false, false, false, false])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const headRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      setUserId(session.user.id)
      const { data } = await supabase.from('profiles').select(
        'city, religion, school_type, school_name, hobbies, personality_traits, favorite_subject, favorite_subject_why, worst_subject, worst_subject_why, report_card_average, has_tutoring, academic_stress, stress_is_academic, has_cheated, previous_research',
      ).eq('id', session.user.id).single()
      if (data) {
        const filled = Object.fromEntries(Object.entries(data).map(([k, v]) => [k, v ?? (EMPTY as any)[k]]))
        setA({ ...EMPTY, ...filled } as Answers)
        setSaved(CHAPTERS.map(c => c.keys.some(k => { const v = (data as any)[k]; return Array.isArray(v) ? v.length > 0 : v != null && v !== '' })))
      }
      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => { if (!loading) headRef.current?.focus() }, [chapter, done, loading])

  const set = <K extends keyof Answers>(k: K) => (v: Answers[K]) => setA(prev => ({ ...prev, [k]: v }))

  const saveChapter = async (next: number | 'done') => {
    if (!userId) return
    setSaving(true); setError('')
    const c = CHAPTERS[chapter]
    const patch: Record<string, any> = {}
    for (const k of c.keys) {
      const v = a[k as keyof Answers]
      patch[k] = Array.isArray(v) ? v : v === '' ? null : v
    }
    if (c.id === 'school') patch.location = a.city || null
    patch.updated_at = new Date().toISOString()
    const { error: upErr } = await supabase.from('profiles').update(patch as Database['public']['Tables']['profiles']['Update']).eq('id', userId)
    if (upErr) { setSaving(false); setError("That chapter didn't save. Check your connection and try again."); return }

    // A first academic-stress baseline, as sign-up used to record.
    if (c.id === 'pressure' && a.academic_stress) {
      const { count } = await supabase.from('academic_stress').select('id', { count: 'exact', head: true }).eq('user_id', userId)
      if (!count) {
        await supabase.from('academic_stress').insert({
          user_id: userId, stress_level: a.academic_stress,
          performance_rating: GRADE_TO_PERFORMANCE[a.report_card_average] ?? 3,
        })
        notifyCheckin()
      }
    }
    setSaved(s => s.map((x, i) => (i === chapter ? true : x)))
    setSaving(false)
    if (next === 'done') setDone(true)
    else setChapter(next)
  }

  const c = CHAPTERS[chapter]
  const last = chapter === CHAPTERS.length - 1

  return (
    <div>
      <PageHeader lines={['help the', 'study']} accent="study" art="day" sticker="papers"
        lead="Four short chapters about school, subjects and pressure. Every question is optional, and you can stop after any chapter." />

      {loading ? <Skeleton /> : done ? (
        <section className="sheet sheet--pad stack page-narrow" aria-labelledby="sv-done">
          <h2 id="sv-done" ref={headRef} tabIndex={-1} className="t-h2">Thank you. That really helps.</h2>
          <p className="t-body muted">
            Your answers are saved to your profile. They&apos;re only shared with the study team if you said yes to
            research, which you can check or change in Settings.
          </p>
          <div className="row"><Pill href="/dashboard" variant="tape" knob>Back to my space</Pill><Link href="/dashboard/settings" className="text-btn">Settings</Link></div>
        </section>
      ) : (
        <div className="sv-grid">
          <nav aria-label="Survey chapters" className="sv-nav">
            <ol>
              {CHAPTERS.map((ch, i) => (
                <li key={ch.id}>
                  <button type="button" className="sv-step" aria-current={i === chapter ? 'step' : undefined} onClick={() => setChapter(i)}>
                    <span className="sv-step__n" aria-hidden="true">{saved[i] ? <Check size={16} /> : i + 1}</span>
                    <span>{ch.title}{saved[i] && <span className="sr-only"> (saved)</span>}</span>
                  </button>
                </li>
              ))}
            </ol>
          </nav>

          <section className="sheet sheet--pad stack-lg" aria-labelledby="sv-h">
            <div>
              <p className="t-small faint">Chapter {chapter + 1} of {CHAPTERS.length}</p>
              <h2 id="sv-h" ref={headRef} tabIndex={-1} className="t-h2" style={{ outline: 'none' }}>{c.title}</h2>
            </div>

            {c.id === 'school' && (
              <>
                <div className="field">
                  <label htmlFor="sv-city" className="field__label">Which city do you live in?</label>
                  <select id="sv-city" className="input" value={a.city} onChange={e => set('city')(e.target.value)}>
                    <option value="">Choose a city</option>
                    {CITIES.map(x => <option key={x} value={x}>{x}</option>)}
                  </select>
                </div>
                <div className="stack-sm">
                  <p id="sv-type" className="field__label">What kind of school do you go to?</p>
                  <OptionRows labelledBy="sv-type" value={a.school_type} onChange={set('school_type')} options={SCHOOL_TYPES} />
                </div>
                <div className="field">
                  <label htmlFor="sv-school" className="field__label">What&apos;s it called?</label>
                  <input id="sv-school" className="input" value={a.school_name} onChange={e => set('school_name')(e.target.value)} placeholder="e.g. Lahore Grammar School" maxLength={160} />
                </div>
                <div className="field">
                  <label htmlFor="sv-rel" className="field__label">Religion</label>
                  <select id="sv-rel" className="input" value={a.religion} onChange={e => set('religion')(e.target.value)} aria-describedby="sv-rel-h">
                    <option value="">Choose one</option>
                    {RELIGIONS.map(x => <option key={x} value={x}>{x}</option>)}
                  </select>
                  <p id="sv-rel-h" className="field__hint">Helps the study understand different students&apos; experiences. &ldquo;Prefer not to say&rdquo; is fine.</p>
                </div>
              </>
            )}

            {c.id === 'life' && (
              <>
                <div className="stack-sm">
                  <p id="sv-hob" className="field__label">What do you enjoy doing? <span className="faint" style={{ fontWeight: 400 }}>Pick as many as you like.</span></p>
                  <ChipGroup labelledBy="sv-hob" options={HOBBIES} value={a.hobbies} onChange={set('hobbies')} />
                </div>
                <div className="stack-sm">
                  <p id="sv-tr" className="field__label">Which words sound like you?</p>
                  <ChipGroup labelledBy="sv-tr" options={TRAITS} value={a.personality_traits} onChange={set('personality_traits')} />
                </div>
              </>
            )}

            {c.id === 'subjects' && (
              <>
                <div className="sv-two">
                  <div className="field">
                    <label htmlFor="sv-fav" className="field__label">Favourite subject</label>
                    <select id="sv-fav" className="input" value={a.favorite_subject} onChange={e => set('favorite_subject')(e.target.value)}>
                      <option value="">Choose one</option>
                      {SUBJECTS.map(x => <option key={x} value={x}>{x}</option>)}
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="sv-worst" className="field__label">Hardest subject</label>
                    <select id="sv-worst" className="input" value={a.worst_subject} onChange={e => set('worst_subject')(e.target.value)}>
                      <option value="">Choose one</option>
                      {[...SUBJECTS, 'None — I like all'].map(x => <option key={x} value={x}>{x}</option>)}
                    </select>
                  </div>
                </div>
                {a.favorite_subject && (
                  <div className="field">
                    <label htmlFor="sv-favw" className="field__label">What do you like about {a.favorite_subject}?</label>
                    <textarea id="sv-favw" className="input" rows={3} value={a.favorite_subject_why} onChange={e => set('favorite_subject_why')(e.target.value)} maxLength={1000} />
                  </div>
                )}
                {a.worst_subject && a.worst_subject !== 'None — I like all' && (
                  <div className="field">
                    <label htmlFor="sv-worstw" className="field__label">What makes {a.worst_subject} hard for you?</label>
                    <textarea id="sv-worstw" className="input" rows={3} value={a.worst_subject_why} onChange={e => set('worst_subject_why')(e.target.value)} maxLength={1000} />
                  </div>
                )}
                <div className="stack-sm">
                  <p id="sv-grade" className="field__label">On average, how are your grades?</p>
                  <OptionRows labelledBy="sv-grade" value={a.report_card_average} onChange={set('report_card_average')} options={GRADES} />
                </div>
                <div className="stack-sm">
                  <p id="sv-tut" className="field__label">Do you take tuition or extra classes?</p>
                  <OptionRows labelledBy="sv-tut" value={a.has_tutoring} onChange={set('has_tutoring')} options={TUTORING} />
                </div>
              </>
            )}

            {c.id === 'pressure' && (
              <>
                <div className="stack-sm">
                  <p id="sv-stress" className="field__label">How stressed do you usually feel about your studies?</p>
                  <ScalePicker labelledBy="sv-stress" value={a.academic_stress} onChange={set('academic_stress')} options={STRESS_LEVELS} />
                </div>
                <div className="stack-sm">
                  <p id="sv-isac" className="field__label">When you feel low, is school usually part of the reason?</p>
                  <OptionRows labelledBy="sv-isac" value={a.stress_is_academic} onChange={set('stress_is_academic')} options={STRESS_IS_ACADEMIC} />
                </div>
                <div className="stack-sm">
                  <p id="sv-cheat" className="field__label">Have you ever copied or cheated on a test or assignment?</p>
                  <p className="field__hint">An honest answer helps the study understand how much pressure students are under. Nobody at your school will see it.</p>
                  <OptionRows labelledBy="sv-cheat" value={a.has_cheated} onChange={set('has_cheated')} options={CHEATING} />
                </div>
                <div className="stack-sm">
                  <p id="sv-prior" className="field__label">Have you taken part in a research study before?</p>
                  <OptionRows labelledBy="sv-prior" value={a.previous_research} onChange={set('previous_research')} options={PRIOR_RESEARCH} />
                </div>
              </>
            )}

            {error && <div className="notice notice--error" role="alert">{error}</div>}
            <div className="row">
              <Pill variant="tape" size="lg" onClick={() => saveChapter(last ? 'done' : chapter + 1)} disabled={saving}>
                {saving ? 'Saving…' : last ? 'Save and finish' : 'Save and continue'}
              </Pill>
              <Link href="/dashboard" className="text-btn">Finish later</Link>
            </div>
          </section>
        </div>
      )}

      <style>{`
        .sv-grid { display: grid; grid-template-columns: 260px minmax(0, 1fr); gap: 20px; align-items: start; }
        .sv-nav { position: sticky; top: 100px; }
        .sv-nav ol { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; }
        .sv-step { display: flex; align-items: center; gap: 12px; width: 100%; min-height: 52px; padding: 8px 14px; border-radius: 14px; border: 0; background: transparent; cursor: pointer; text-align: left; font: 500 15px/1.3 var(--font-body); color: var(--ink-2); }
        .sv-step:hover { background: rgba(17,17,17,0.05); }
        .sv-step[aria-current="step"] { background: var(--paper); color: var(--ink); box-shadow: inset 0 0 0 1.5px var(--ink); }
        .sv-step__n { flex-shrink: 0; width: 30px; height: 30px; border-radius: 50%; display: grid; place-items: center; background: var(--paper); border: 1.5px solid var(--line); font-weight: 700; font-size: 14px; }
        .sv-two { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        @media (max-width: 900px) {
          .sv-grid { grid-template-columns: 1fr; }
          .sv-nav { position: static; }
          .sv-nav ol { grid-template-columns: repeat(4, minmax(0, 1fr)); }
          .sv-step { flex-direction: column; justify-content: center; text-align: center; gap: 4px; font-size: 13px; padding: 8px 4px; }
        }
        @media (max-width: 520px) { .sv-two { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  )
}
