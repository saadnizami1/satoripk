'use client'

import { useEffect, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { PageHeader } from '@/components/app/PageHeader'
import { OptionRows } from '@/components/ui/controls'
import { Pill } from '@/components/ui/kit'

/* A calm page: no stickers, no tilt. The only motion is the breath itself. */

type Step = { label: 'Breathe in' | 'Hold' | 'Breathe out'; duration: number }
const TECHNIQUES: { id: string; name: string; hint: string; steps: Step[] }[] = [
  { id: 'box', name: 'Box breathing', hint: 'steadies you before an exam', steps: [
    { label: 'Breathe in', duration: 4 }, { label: 'Hold', duration: 4 }, { label: 'Breathe out', duration: 4 }, { label: 'Hold', duration: 4 }] },
  { id: '478', name: '4-7-8', hint: 'helps you fall asleep', steps: [
    { label: 'Breathe in', duration: 4 }, { label: 'Hold', duration: 7 }, { label: 'Breathe out', duration: 8 }] },
  { id: 'calm', name: 'Long out-breath', hint: 'the gentlest one', steps: [
    { label: 'Breathe in', duration: 4 }, { label: 'Breathe out', duration: 6 }] },
  { id: 'deep', name: 'Even breathing', hint: 'grounds you when you feel scattered', steps: [
    { label: 'Breathe in', duration: 5 }, { label: 'Hold', duration: 5 }, { label: 'Breathe out', duration: 5 }] },
]
const ROUNDS = 4

export default function BreathingPage() {
  const reduce = useReducedMotion()
  const [techId, setTechId]   = useState('box')
  const [running, setRunning] = useState(false)
  const [t, setT]             = useState(0)   // seconds into the session

  // Everything else is derived from t: the round, the step and its countdown.
  const selected = TECHNIQUES.find(x => x.id === techId)!
  const cycle = selected.steps.reduce((a, s) => a + s.duration, 0)
  const total = cycle * ROUNDS
  const finished = t >= total
  const rounds = Math.min(Math.floor(t / cycle), ROUNDS)
  let into = finished ? 0 : t % cycle, stepIdx = 0
  while (!finished && into >= selected.steps[stepIdx].duration) { into -= selected.steps[stepIdx].duration; stepIdx++ }
  const step = selected.steps[stepIdx]
  const elapsed = into
  const active = running && !finished

  useEffect(() => {
    if (!active) return
    const id = setInterval(() => setT(x => Math.min(x + 1, total)), 1000)
    return () => clearInterval(id)
  }, [active, total])

  const reset = () => { setRunning(false); setT(0) }
  const begin = () => { if (finished) { setT(0); setRunning(true) } else setRunning(r => !r) }

  // The circle's size: full on the in-breath, small on the out-breath, held otherwise.
  const prevBig = (() => {
    for (let i = stepIdx - 1 + selected.steps.length; i >= 0; i--) {
      const s = selected.steps[i % selected.steps.length]
      if (s.label !== 'Hold') return s.label === 'Breathe in'
    }
    return false
  })()
  const big = !active ? false : step.label === 'Breathe in' ? true : step.label === 'Breathe out' ? false : prevBig
  const label = finished ? 'Well done' : active ? step.label : 'Ready'

  return (
    <div>
      <PageHeader calm lines={['Breathe with it']}
        lead="A few slow rounds tell your body it's safe to settle. Sit comfortably, drop your shoulders, and follow the circle." />

      <div className="br-grid">
        <section aria-label="Breathing guide" className="sheet br-stage">
          <div className="br-circle-wrap" aria-hidden="true">
            <div className="br-circle" data-big={big}
              style={{ transitionDuration: reduce ? '0s' : `${active ? step.duration : 0.6}s` }} />
          </div>
          <div className="br-text">
            <p className="t-h1" aria-live="assertive">{label}</p>
            <p className="t-lead muted" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {finished ? `${ROUNDS} rounds done. Notice how you feel now.` : active ? `${step.duration - elapsed}` : `${ROUNDS} rounds, about ${Math.round((selected.steps.reduce((a, s) => a + s.duration, 0) * ROUNDS) / 60 * 10) / 10} minutes`}
            </p>
          </div>
          <div className="row" style={{ justifyContent: 'center', position: 'relative' }}>
            <Pill variant="tape" size="lg" onClick={begin} style={{ minWidth: 170 }}>{active ? 'Pause' : finished ? 'Go again' : t > 0 ? 'Resume' : 'Begin'}</Pill>
            {t > 0 && !finished && <button type="button" className="text-btn" onClick={reset}>Start over</button>}
          </div>
          {active && <p className="t-small muted" style={{ position: 'relative' }}>Round {rounds + 1} of {ROUNDS}</p>}
        </section>

        <aside className="sheet sheet--pad stack-sm">
          <h2 id="br-pick" className="section-title" style={{ margin: 0 }}>Choose a pattern</h2>
          <OptionRows labelledBy="br-pick" value={techId} onChange={v => { reset(); setTechId(v) }}
            options={TECHNIQUES.map(t => ({ value: t.id, label: t.name, hint: t.steps.map(s => s.duration).join('-') }))} />
          <p className="t-small muted">{selected.name}: {selected.hint}.</p>
        </aside>
      </div>

      <style>{`
        .br-grid { display: grid; grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr); gap: 20px; align-items: start; }
        .br-stage { position: relative; overflow: hidden; display: flex; flex-direction: column; align-items: center; gap: 22px; padding: 48px 24px 36px; text-align: center; min-height: 520px; justify-content: center; }
        .br-circle-wrap { position: absolute; inset: 0; display: grid; place-items: center; pointer-events: none; }
        .br-circle { width: min(78%, 420px); aspect-ratio: 1; border-radius: 50%; background: radial-gradient(circle, var(--sky-2) 0%, rgba(169,196,190,0.35) 60%, rgba(169,196,190,0) 72%); transform: scale(0.45); transition-property: transform; transition-timing-function: ease-in-out; }
        .br-circle[data-big="true"] { transform: scale(1); }
        .br-text { position: relative; display: grid; gap: 8px; }
        @media (max-width: 900px) { .br-grid { grid-template-columns: 1fr; } .br-stage { min-height: 420px; } }
      `}</style>
    </div>
  )
}
