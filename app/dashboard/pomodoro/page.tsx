'use client'

import { useEffect, useRef, useState, useCallback, useSyncExternalStore } from 'react'
import { Maximize2, Minus, Plus, RotateCcw } from 'lucide-react'
import { recordFocus, readFocusToday } from '@/lib/focus'
import { PageHeader } from '@/components/app/PageHeader'
import { Pill } from '@/components/ui/kit'

type Phase = 'work' | 'short' | 'long'

const subscribeStorage = (cb: () => void) => { window.addEventListener('storage', cb); return () => window.removeEventListener('storage', cb) }

const PHASE_LABELS: Record<Phase, string> = { work: 'Focus', short: 'Short break', long: 'Long break' }
const PRESETS = [
  { label: '25 / 5', work: 25, short: 5, long: 15 },
  { label: '50 / 10', work: 50, short: 10, long: 20 },
]

function Ring({ progress, children, size = 300 }: { progress: number; children: React.ReactNode; size?: number }) {
  const r = 46, c = 2 * Math.PI * r
  return (
    <div className="pm-ring" style={{ width: size, maxWidth: '100%' }}>
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--line)" strokeWidth="3" />
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--ink)" strokeWidth="3" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - progress)} transform="rotate(-90 50 50)" style={{ transition: 'stroke-dashoffset 1s linear' }} />
      </svg>
      <div className="pm-ring__inner">{children}</div>
    </div>
  )
}

export default function PomodoroPage() {
  const [workMins, setWorkMins]   = useState(25)
  const [shortMins, setShortMins] = useState(5)
  const [longMins, setLongMins]   = useState(15)
  const [phase, setPhase]         = useState<Phase>('work')
  const [seconds, setSeconds]     = useState(25 * 60)
  const [running, setRunning]     = useState(false)
  const [cycles, setCycles]       = useState(0)
  const [task, setTask]           = useState('')
  const [fullscreen, setFullscreen] = useState(false)

  const lengthOf = useCallback((p: Phase) => (p === 'work' ? workMins : p === 'short' ? shortMins : longMins) * 60, [workMins, shortMins, longMins])
  const totalSecs = lengthOf(phase)
  const progress  = 1 - seconds / totalSecs

  // The interval reads the latest timer through a ref, so a block can end
  // (log focus, move to the next phase) inside the tick, not in an effect.
  const live = useRef({ phase, seconds, cycles, workMins, lengthOf })
  useEffect(() => { live.current = { phase, seconds, cycles, workMins, lengthOf } })

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => {
      const t = live.current
      if (t.seconds > 1) { setSeconds(t.seconds - 1); return }
      setRunning(false)
      if (t.phase === 'work') {
        recordFocus(t.workMins)
        const next = t.cycles + 1
        const p: Phase = next % 4 === 0 ? 'long' : 'short'
        setCycles(next); setPhase(p); setSeconds(t.lengthOf(p))
      } else {
        setPhase('work'); setSeconds(t.lengthOf('work'))
      }
    }, 1000)
    return () => clearInterval(id)
  }, [running])

  // Focus minutes live in localStorage: 0 on the server, the real value once hydrated.
  const focusToday = useSyncExternalStore(subscribeStorage, readFocusToday, () => 0)

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  useEffect(() => {
    const base = 'Focus timer · Satori'
    document.title = running ? `${fmt(seconds)} ${PHASE_LABELS[phase].toLowerCase()} · Satori` : base
    return () => { document.title = 'Satori' }
  }, [seconds, running, phase])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement)?.tagName === 'INPUT'
      if (!typing && (e.key === 'f' || e.key === 'F')) setFullscreen(fs => !fs)
      if (e.key === 'Escape') setFullscreen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const reset = () => { setRunning(false); setSeconds(totalSecs) }
  const switchPhase = (p: Phase) => { setRunning(false); setPhase(p); setSeconds(lengthOf(p)) }
  const applyPreset = (pr: typeof PRESETS[number]) => {
    setRunning(false); setWorkMins(pr.work); setShortMins(pr.short); setLongMins(pr.long)
    setSeconds((phase === 'work' ? pr.work : phase === 'short' ? pr.short : pr.long) * 60)
  }
  const setLength = (p: Phase, v: number) => {
    if (p === 'work') setWorkMins(v); else if (p === 'short') setShortMins(v); else setLongMins(v)
    if (phase === p) { setRunning(false); setSeconds(v * 60) }
  }

  if (fullscreen) {
    return (
      <div className="pm-full on-dark" role="dialog" aria-modal="true" aria-label="Focus mode">
        <p className="t-lead" style={{ color: 'var(--on-dark-2)' }}>{task || PHASE_LABELS[phase]}</p>
        <p className="pm-full__time" aria-live="off">{fmt(seconds)}</p>
        <div className="row" style={{ justifyContent: 'center' }}>
          <Pill variant="white" size="lg" onClick={() => setRunning(r => !r)}>{running ? 'Pause' : 'Start'}</Pill>
          <Pill variant="glass" size="lg" onClick={() => setFullscreen(false)} autoFocus>Exit focus mode</Pill>
        </div>
        <p className="t-small" style={{ color: 'var(--on-dark-2)', marginTop: 24 }}>Press Esc to exit.</p>
        <style>{PM_CSS}</style>
      </div>
    )
  }

  return (
    <div>
      <PageHeader lines={['one focused', 'block']} accent="focused" art="day" sticker="clock"
        lead={focusToday > 0 ? `${focusToday} minutes of focus today so far.` : 'Pick one thing and give it your full attention until the timer runs out.'} />

      <div className="pm-grid">
        <section aria-label="Timer" className="sheet sheet--pad pm-timer">
          <div role="radiogroup" aria-label="Timer phase" className="row" style={{ justifyContent: 'center', gap: 6 }}>
            {(['work', 'short', 'long'] as Phase[]).map(p => (
              <button key={p} type="button" role="radio" aria-checked={phase === p} className="chip" onClick={() => switchPhase(p)}>{PHASE_LABELS[p]}</button>
            ))}
          </div>

          <Ring progress={progress}>
            <p className="pm-time" role="timer" aria-live="off">{fmt(seconds)}</p>
            <p className="t-small muted">{running ? (phase === 'work' ? 'Stay with it' : 'Rest your eyes') : 'Ready when you are'}</p>
          </Ring>

          <div className="field" style={{ width: '100%', maxWidth: 380 }}>
            <label htmlFor="pm-task" className="field__label">What are you working on?</label>
            <input id="pm-task" className="input" value={task} onChange={e => setTask(e.target.value)} placeholder="e.g. Chemistry past paper, Q1 to Q5" maxLength={120} />
          </div>

          <div className="row" style={{ justifyContent: 'center' }}>
            <button type="button" className="icon-btn" onClick={reset} aria-label="Reset timer" style={{ border: '1.5px solid var(--line)' }}><RotateCcw size={18} /></button>
            <Pill variant="tape" size="lg" onClick={() => setRunning(r => !r)} style={{ minWidth: 180 }}>{running ? 'Pause' : 'Start'}</Pill>
            <button type="button" className="icon-btn" onClick={() => setFullscreen(true)} aria-label="Focus mode, full screen (F)" style={{ border: '1.5px solid var(--line)' }}><Maximize2 size={18} /></button>
          </div>
        </section>

        <aside className="stack">
          <section aria-labelledby="pm-round" className="sheet sheet--pad">
            <h2 id="pm-round" className="section-title">This round</h2>
            <div className="row" style={{ gap: 10 }} aria-label={`${cycles % 4} of 4 focus blocks done in this round`}>
              {Array.from({ length: 4 }).map((_, i) => (
                <span key={i} aria-hidden="true" className="pm-pip" data-done={i < cycles % 4} data-now={i === cycles % 4 && running && phase === 'work'} />
              ))}
            </div>
            <p className="t-small muted" style={{ marginTop: 12 }}>A long break comes after every four focus blocks. {cycles} done this session.</p>
          </section>

          <section aria-labelledby="pm-len" className="sheet sheet--pad stack-sm">
            <h2 id="pm-len" className="section-title" style={{ margin: 0 }}>Lengths</h2>
            <div role="group" aria-label="Presets" className="row" style={{ gap: 6 }}>
              {PRESETS.map(pr => (
                <button key={pr.label} type="button" className="chip" aria-pressed={workMins === pr.work && shortMins === pr.short} onClick={() => applyPreset(pr)}>{pr.label}</button>
              ))}
            </div>
            <ul className="list">
              {(['work', 'short', 'long'] as Phase[]).map(p => {
                const val = lengthOf(p) / 60
                return (
                  <li key={p} style={{ justifyContent: 'space-between' }}>
                    <span className="t-body">{PHASE_LABELS[p]}</span>
                    <span className="row" style={{ gap: 6, flexWrap: 'nowrap' }}>
                      <button type="button" className="icon-btn" aria-label={`Shorter ${PHASE_LABELS[p].toLowerCase()}`} onClick={() => setLength(p, Math.max(1, val - 1))}><Minus size={16} /></button>
                      <span className="t-label" style={{ minWidth: 52, textAlign: 'center', fontSize: 16 }} aria-live="polite">{val} min</span>
                      <button type="button" className="icon-btn" aria-label={`Longer ${PHASE_LABELS[p].toLowerCase()}`} onClick={() => setLength(p, Math.min(90, val + 1))}><Plus size={16} /></button>
                    </span>
                  </li>
                )
              })}
            </ul>
          </section>
        </aside>
      </div>
      <style>{PM_CSS}</style>
    </div>
  )
}

const PM_CSS = `
.pm-grid { display: grid; grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr); gap: 20px; align-items: start; }
.pm-timer { display: flex; flex-direction: column; align-items: center; gap: 24px; padding-block: 32px; }
.pm-ring { position: relative; aspect-ratio: 1; }
.pm-ring svg { width: 100%; height: 100%; display: block; }
.pm-ring__inner { position: absolute; inset: 0; display: grid; place-content: center; text-align: center; gap: 4px; }
.pm-time { font: 400 clamp(56px, 9vw, 76px)/1 var(--font-display); letter-spacing: -0.02em; font-variant-numeric: tabular-nums; }
.pm-pip { width: 28px; height: 28px; border-radius: 50%; border: 2px solid var(--ink); }
.pm-pip[data-done="true"] { background: var(--ink); }
.pm-pip[data-now="true"] { background: var(--marigold); }
.pm-full { position: fixed; inset: 0; z-index: 100; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 24px; text-align: center; background: var(--night); color: var(--on-dark); }
.pm-full__time { font: 400 clamp(96px, 22vw, 220px)/1 var(--font-display); letter-spacing: -0.03em; font-variant-numeric: tabular-nums; margin-bottom: 24px; }
@media (max-width: 900px) { .pm-grid { grid-template-columns: 1fr; } }
`
