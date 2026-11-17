'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import type { AuthChangeEvent } from '@supabase/supabase-js'
import { ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { notifyCheckin } from '@/lib/dates'
import { PENDING_MOOD_KEY, firstName, moodFor } from '@/lib/moods'
import { Logo, Pill, Scene, TapeHeading } from '@/components/ui/kit'
import { Sticker, type StickerName } from '@/components/ui/stickers'
import { MoodPicker, OptionRows } from '@/components/ui/controls'
import { BOARDS } from '@/lib/profile-options'

/*
 * Onboarding: five short questions, then a welcome. Everything is skippable
 * except the privacy step, which needs an explicit choice. The longer
 * research questionnaire lives at /dashboard/survey and can be done later.
 * Answers write to the same profile columns the research views read.
 */

const STEPS = ['welcome', 'name', 'age', 'study', 'mood', 'privacy', 'ready'] as const
type Step = typeof STEPS[number]
const QUESTION_COUNT = 5

const SIDE: Record<Step, { line: string; sticker: StickerName; art: string }> = {
  welcome: { line: 'a minute for you, before anything else.', sticker: 'chai', art: '/art/dawn.webp' },
  name:    { line: 'names matter. use whatever feels like you.', sticker: 'notebook', art: '/art/dawn.webp' },
  age:     { line: 'it helps Kokoro talk to you like a person, not a form.', sticker: 'calendar', art: '/art/day.webp' },
  study:   { line: 'matric, a-levels, uni: every stage has its own pressure.', sticker: 'bag', art: '/art/day.webp' },
  mood:    { line: "there's no wrong answer here.", sticker: 'kite', art: '/art/dusk.webp' },
  privacy: { line: 'your words stay yours.', sticker: 'padlock', art: '/art/dusk.webp' },
  ready:   { line: 'welcome in.', sticker: 'moon', art: '/art/night.webp' },
}

const STORE = 'satori:onboarding'

interface Answers {
  name: string
  age: string
  board: string
  level: string
  mood: number | null
  agreedToPolicies: boolean
  research: '' | 'yes' | 'no'
}

const EMPTY: Answers = { name: '', age: '', board: '', level: '', mood: null, agreedToPolicies: false, research: '' }

export default function OnboardingPage() {
  const router = useRouter()
  const reduce = useReducedMotion()
  const [step, setStep] = useState<Step>('welcome')
  const [a, setA] = useState<Answers>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const headingRef = useRef<HTMLDivElement>(null)
  const firstRender = useRef(true)

  // Resume where the student left off (this tab only), and pick up a mood
  // chosen on the landing page before signing up.
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORE)
      if (saved) {
        const { step: s, answers } = JSON.parse(saved)
        // Restoring from sessionStorage must wait until after hydration.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (STEPS.includes(s) && s !== 'ready') setStep(s)
        setA({ ...EMPTY, ...answers })
      } else {
        const pending = Number(sessionStorage.getItem(PENDING_MOOD_KEY))
        if (moodFor(pending)) setA(prev => ({ ...prev, mood: pending }))
      }
    } catch { /* storage unavailable: start fresh */ }
  }, [])

  useEffect(() => {
    try { if (step !== 'ready') sessionStorage.setItem(STORE, JSON.stringify({ step, answers: a })) } catch { /* ignore */ }
  }, [step, a])

  // The proxy only lets signed-in users reach this page; this just handles
  // a sign-out that happens while it is open.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent) => {
      if (event === 'SIGNED_OUT') router.push('/auth')
    })
    return () => subscription.unsubscribe()
  }, [router])

  // Move focus to the new question so screen readers announce it.
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return }
    const h = headingRef.current?.querySelector<HTMLElement>('h1')
    h?.setAttribute('tabindex', '-1')
    h?.focus()
  }, [step])

  const index = STEPS.indexOf(step)
  const go = (s: Step) => { setError(''); setStep(s) }
  const next = () => go(STEPS[Math.min(index + 1, STEPS.length - 1)])
  const back = () => go(STEPS[Math.max(index - 1, 0)])
  const set = <K extends keyof Answers>(k: K, v: Answers[K]) => setA(prev => ({ ...prev, [k]: v }))
  const name = firstName(a.name)

  const finish = async () => {
    setSaving(true)
    setError('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user
      if (!user) throw new Error('Your session ended. Log in again to finish.')
      const age = parseInt(a.age)

      const { error: upErr } = await supabase.from('profiles').upsert({
        id: user.id,
        name: a.name.trim() || null,
        age: age >= 3 && age <= 99 ? age : null,
        education_board: a.board || null,
        education_level: a.level || null,
        recent_mood: a.mood ?? null,
        research_consent: a.research === 'yes',
        onboarding_completed: true,
        language: 'en',
        updated_at: new Date().toISOString(),
      })
      if (upErr) throw upErr

      // Seed today's mood so the dashboard is never empty, and refresh the
      // session so the new token carries onboarding_completed (set by a DB
      // trigger); the proxy reads it from there.
      await Promise.all([
        a.mood && supabase.from('moods').insert({ user_id: user.id, mood_score: a.mood, note: 'Onboarding baseline' }),
        supabase.auth.refreshSession(),
      ])
      try { sessionStorage.removeItem(STORE); sessionStorage.removeItem(PENDING_MOOD_KEY) } catch { /* ignore */ }
      if (a.mood) notifyCheckin()
      go('ready')
    } catch (err: any) {
      console.error('Error saving profile:', err)
      setError(err?.message ? `We couldn't save that: ${err.message}` : "We couldn't save that. Check your connection and try again.")
    } finally {
      setSaving(false)
    }
  }

  const side = SIDE[step]
  const qNum = index >= 1 && index <= QUESTION_COUNT ? index : null
  const canFinish = a.agreedToPolicies && a.research !== ''
  const board = BOARDS.find(b => b.id === a.board)
  const moodNow = moodFor(a.mood)

  return (
    <div className="ob">
      <div className="texture" aria-hidden="true" style={{ position: 'fixed' }} />

      {/* ── Art panel ── */}
      <Scene src={side.art} priority position="center 75%" className="on-dark ob__art" sizes="(max-width: 860px) 100vw, 45vw"
        scrim="linear-gradient(180deg, rgba(15,30,46,0.45), rgba(15,30,46,0) 40%)">
        <div className="ob__art-top">
          <Link href="/" aria-label="Satori home" style={{ textDecoration: 'none' }}><Logo tone="paper" /></Link>
        </div>
        <div className="ob__caption glass glass--paper">
          <Sticker name={side.sticker} size={64} tilt={-8} />
          <p className="t-h4" aria-live="polite">{side.line}</p>
        </div>
      </Scene>

      {/* ── Question panel ── */}
      <main className="ob__panel">
        <div className="ob__bar">
          {index > 0 && step !== 'ready' ? (
            <button type="button" className="text-btn" onClick={back}><ArrowLeft size={18} aria-hidden="true" /> Back</button>
          ) : <span />}
          {qNum && (
            <div className="ob__progress" role="progressbar" aria-valuemin={1} aria-valuemax={QUESTION_COUNT} aria-valuenow={qNum}
              aria-label={`Question ${qNum} of ${QUESTION_COUNT}`}>
              <span className="t-small muted" style={{ marginRight: 10 }}>{qNum} of {QUESTION_COUNT}</span>
              {Array.from({ length: QUESTION_COUNT }, (_, i) => (
                <span key={i} className="ob__pol" data-done={i < qNum} data-now={i === qNum - 1} style={{ ['--tilt' as string]: `${[-6, 4, -3, 5, -4][i]}deg` }} />
              ))}
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            ref={headingRef}
            className="ob__body"
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: [0.2, 0.7, 0.2, 1] }}
          >
            {step === 'welcome' && (
              <div className="stack-lg">
                <TapeHeading as="h1" lines={["let's make this", 'space yours']} accent="yours" size="t-h1" />
                <p className="t-lead muted">Five quick questions, about a minute. You can skip anything and change it all later.</p>
                <div><Pill variant="tape" size="lg" knob onClick={next}>Let&apos;s begin</Pill></div>
              </div>
            )}

            {step === 'name' && (
              <form className="stack-lg" onSubmit={e => { e.preventDefault(); next() }}>
                <TapeHeading as="h1" lines={['what should', 'we call you?']} accent="you?" size="t-h1" />
                <div className="field">
                  <label htmlFor="ob-name" className="field__label">Your name</label>
                  <input id="ob-name" className="input" autoComplete="given-name" placeholder="e.g. Ayesha" maxLength={80}
                    value={a.name} onChange={e => set('name', e.target.value)} />
                </div>
                <StepActions onNext={next} skip={!a.name.trim()} />
              </form>
            )}

            {step === 'age' && (
              <form className="stack-lg" onSubmit={e => { e.preventDefault(); next() }}>
                <TapeHeading as="h1" lines={['how old', 'are you?']} accent="old" size="t-h1" />
                <div className="field" style={{ maxWidth: 220 }}>
                  <label htmlFor="ob-age" className="field__label">Age</label>
                  <input id="ob-age" className="input" type="number" inputMode="numeric" min={3} max={99} placeholder="e.g. 16"
                    value={a.age} onChange={e => set('age', e.target.value)} aria-describedby="ob-age-h" />
                  <span id="ob-age-h" className="field__hint">Only used to talk to you at the right level.</span>
                </div>
                <StepActions onNext={next} skip={!a.age} />
              </form>
            )}

            {step === 'study' && (
              <div className="stack-lg">
                <TapeHeading as="h1" lines={['where are you', 'studying?']} accent="studying?" size="t-h1" />
                <div className="stack-sm">
                  <p id="ob-board" className="field__label">Your stage</p>
                  <OptionRows labelledBy="ob-board"
                    options={BOARDS.map(b => ({ value: b.id, label: b.name }))}
                    value={a.board} onChange={v => { set('board', v); set('level', '') }} />
                </div>
                {board && (
                  <div className="stack-sm">
                    <p id="ob-level" className="field__label">Which year?</p>
                    <div role="radiogroup" aria-labelledby="ob-level" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {board.levels.map(l => (
                        <button key={l} type="button" role="radio" aria-checked={a.level === l} className="chip" onClick={() => set('level', l)}>{l}</button>
                      ))}
                    </div>
                  </div>
                )}
                <StepActions onNext={next} skip={!a.board} />
              </div>
            )}

            {step === 'mood' && (
              <div className="stack-lg">
                <TapeHeading as="h1" lines={['how are you', `arriving today, ${name}?`]} accent={name} size="t-h1" />
                <MoodPicker value={a.mood} onChange={v => set('mood', v)} label="How are you arriving today?" />
                <p className="t-body muted" aria-live="polite" style={{ minHeight: 26 }}>
                  {moodNow ? moodNow.reply : 'Tap one. There is no wrong answer.'}
                </p>
                <StepActions onNext={next} skip={!a.mood} />
              </div>
            )}

            {step === 'privacy' && (
              <div className="stack-lg">
                <TapeHeading as="h1" lines={['one last thing:', 'your privacy']} accent="privacy" size="t-h1" />
                <div className="sheet sheet--pad stack">
                  <div className="row" style={{ alignItems: 'flex-start', gap: 14, flexWrap: 'nowrap' }}>
                    <span className="disc" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg></span>
                    <div>
                      <p className="t-label" style={{ fontSize: 16 }}>Your journal and Kokoro chats are always private</p>
                      <p className="t-small muted" style={{ marginTop: 4 }}>Only you can read them. They are never shared with anyone, including the research team.</p>
                    </div>
                  </div>
                  <hr style={{ border: 0, borderTop: '1px solid var(--line)', margin: '20px 0' }} />
                  <div className="stack-sm">
                    <p id="ob-research" className="t-label" style={{ fontSize: 16 }}>Will you help the study?</p>
                    <p className="t-small muted">
                      Satori is part of a Lahore Garrison University study on academic stress. If you say yes, your mood
                      and stress check-ins (with any notes on them) and your profile answers, including your name and
                      email, are shared with the study team. You can change your mind any time in Settings.
                    </p>
                    <OptionRows labelledBy="ob-research" value={a.research} onChange={v => set('research', v)}
                      options={[
                        { value: 'yes', label: 'Yes, include my check-ins', hint: 'helps the study' },
                        { value: 'no', label: 'No thanks', hint: 'you still get everything' },
                      ]} />
                  </div>
                </div>

                <details className="ob__terms">
                  <summary className="t-label">Read the privacy terms</summary>
                  <ul className="t-small muted stack-sm" style={{ margin: '12px 0 0', paddingLeft: 18 }}>
                    <li>Satori stores your name, age, school details, check-ins and journal so the app can work for you.</li>
                    <li>Data is encrypted at rest. Your journal and chats are visible only to you. Kokoro&apos;s replies are written by an AI service that processes each message you send it.</li>
                    <li>You can download your data or delete your account and everything in it from Settings at any time.</li>
                    <li>If you are under 18, we suggest letting a parent or guardian know you use Satori.</li>
                    <li>Satori is support, not treatment. In an emergency, call Rescue 1122 or a helpline.</li>
                  </ul>
                </details>

                <label className="row" style={{ alignItems: 'flex-start', gap: 12, flexWrap: 'nowrap', cursor: 'pointer' }}>
                  <input type="checkbox" checked={a.agreedToPolicies} onChange={e => set('agreedToPolicies', e.target.checked)}
                    style={{ width: 22, height: 22, marginTop: 1, accentColor: 'var(--ink)', flexShrink: 0 }} />
                  <span className="t-body">I&apos;ve read the privacy terms and agree to them.</span>
                </label>

                {error && <div className="notice notice--error" role="alert">{error}</div>}
                <div className="row">
                  <Pill variant="tape" size="lg" onClick={finish} disabled={!canFinish || saving} aria-describedby={!canFinish ? 'ob-need' : undefined}>
                    {saving ? 'Saving…' : 'Finish setup'}
                  </Pill>
                  {!canFinish && <span id="ob-need" className="t-small muted">Choose yes or no above and tick the box to finish.</span>}
                </div>
              </div>
            )}

            {step === 'ready' && (
              <div className="stack-lg">
                <TapeHeading as="h1" lines={['your space', `is ready, ${name}`]} accent={name} size="t-h1" />
                <p className="t-lead muted" style={{ maxWidth: 520 }}>
                  {moodNow && moodNow.score <= 2
                    ? "We'll start gently. Your home screen leads with a short breathing break and Kokoro, whenever you want them."
                    : "We'll start simple: one check-in a day, and the tools are there whenever you need them."}
                </p>
                <div className="row">
                  <Pill href="/dashboard" variant="tape" size="lg" knob>Go to my space</Pill>
                </div>
                <div className="sheet sheet--pad row" style={{ gap: 18, alignItems: 'center', flexWrap: 'nowrap', maxWidth: 560 }}>
                  <Sticker name="papers" size={70} tilt={-6} />
                  <p className="t-body">
                    Got five more minutes? <Link href="/dashboard/survey" className="link" style={{ fontWeight: 600 }}>Answer the study questions</Link>{' '}
                    about school and subjects. It&apos;s optional, and you can do it later from your home screen.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {step !== 'ready' && (
          <p className="t-small muted ob__help">
            Need someone right now? Call <a className="link" href="tel:1122">Rescue 1122</a> or{' '}
            <a className="link" href="tel:03174288665">Umang 0317-4288665</a>.
          </p>
        )}
      </main>

      <style>{`
        .ob { min-height: 100svh; display: grid; grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr); gap: 16px; padding: 16px; background: var(--sky-2); }
        .ob__art { border-radius: var(--r-lg); position: sticky; top: 16px; height: calc(100svh - 32px); background: var(--dusk); }
        .ob__art-top { position: absolute; top: 28px; left: 28px; }
        .ob__caption { position: absolute; left: 20px; right: 20px; bottom: 20px; display: flex; align-items: center; gap: 16px; padding: 16px 20px; }
        .ob__panel { display: flex; flex-direction: column; padding: 12px clamp(8px, 4vw, 56px) 24px; min-height: calc(100svh - 32px); }
        .ob__bar { display: flex; align-items: center; justify-content: space-between; min-height: 48px; }
        .ob__progress { display: flex; align-items: center; gap: 6px; }
        .ob__pol { width: 22px; height: 26px; background: var(--paper); border-radius: 2px; padding: 3px 3px 7px; box-shadow: 0 4px 8px -4px rgba(0,0,0,0.5); transform: rotate(var(--tilt)); position: relative; }
        .ob__pol::after { content: ''; position: absolute; inset: 3px 3px 7px; background: #C4CFC8; border-radius: 1px; transition: background 240ms; }
        .ob__pol[data-done="true"]::after { background: var(--dusk); }
        .ob__pol[data-now="true"]::after { background: var(--marigold); }
        .ob__body { flex: 1; display: flex; flex-direction: column; justify-content: center; width: 100%; max-width: 580px; padding: 40px 0; }
        .ob__body h1:focus { outline: none; }
        .ob__terms summary { cursor: pointer; min-height: 44px; display: flex; align-items: center; }
        .ob__help { max-width: 580px; }
        @media (max-width: 860px) {
          .ob { grid-template-columns: 1fr; padding: 10px; }
          .ob__art { position: relative; top: 0; height: 200px; }
          .ob__caption { display: none; }
          .ob__panel { min-height: 0; padding: 4px 6px 24px; }
          .ob__body { padding: 24px 0; }
        }
      `}</style>
    </div>
  )
}

function StepActions({ onNext, skip }: { onNext: () => void; skip: boolean }) {
  return (
    <div className="row">
      <Pill type="submit" variant="tape" size="lg" onClick={e => { if ((e.currentTarget as HTMLButtonElement).form) return; onNext() }}>
        Continue
      </Pill>
      {skip && <button type="button" className="text-btn" onClick={onNext}>Skip for now</button>}
    </div>
  )
}
