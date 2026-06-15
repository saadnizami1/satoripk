'use client'

import { useEffect, useState, useRef, useCallback } from 'react'

type Phase = 'work' | 'short' | 'long'

const PHASE_LABELS: Record<Phase, string> = {
  work:  'FOCUS',
  short: 'SHORT BREAK',
  long:  'LONG BREAK',
}

export default function PomodoroPage() {
  const [workMins, setWorkMins]   = useState(25)
  const [shortMins, setShortMins] = useState(5)
  const [longMins, setLongMins]   = useState(15)
  const [phase, setPhase]         = useState<Phase>('work')
  const [seconds, setSeconds]     = useState(workMins * 60)
  const [running, setRunning]     = useState(false)
  const [cycles, setCycles]       = useState(0)
  const [fullscreen, setFullscreen] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const totalSecs = phase === 'work' ? workMins * 60 : phase === 'short' ? shortMins * 60 : longMins * 60
  const progress  = 1 - seconds / totalSecs

  const advance = useCallback(() => {
    setRunning(false)
    if (phase === 'work') {
      const next = cycles + 1
      setCycles(next)
      if (next % 4 === 0) { setPhase('long');  setSeconds(longMins * 60) }
      else                  { setPhase('short'); setSeconds(shortMins * 60) }
    } else {
      setPhase('work')
      setSeconds(workMins * 60)
    }
  }, [phase, cycles, workMins, shortMins, longMins])

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => { if (s <= 1) { advance(); return 0 } return s - 1 })
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running, advance])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'f' || e.key === 'F') setFullscreen(fs => !fs)
      if (e.key === 'Escape') setFullscreen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const reset = () => {
    setRunning(false)
    setSeconds(phase === 'work' ? workMins * 60 : phase === 'short' ? shortMins * 60 : longMins * 60)
  }

  const switchPhase = (p: Phase) => {
    setRunning(false); setPhase(p)
    setSeconds(p === 'work' ? workMins * 60 : p === 'short' ? shortMins * 60 : longMins * 60)
  }

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  if (fullscreen) {
    return (
      <div
        onClick={() => setFullscreen(false)}
        style={{
          position: 'fixed', inset: 0, background: 'var(--bg-invert)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          zIndex: 100, cursor: 'pointer',
        }}
      >
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'rgba(244,242,238,0.4)', letterSpacing: '0.12em', marginBottom: 16 }}>
          {PHASE_LABELS[phase]}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: 140, color: 'var(--ink-invert)', lineHeight: 1, letterSpacing: '-0.04em' }}>
          {fmt(seconds)}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(244,242,238,0.3)', marginTop: 24, letterSpacing: '0.1em' }}>
          CLICK ANYWHERE OR PRESS ESC TO EXIT
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 520 }}>

      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(36px, 5vw, 56px)', color: 'var(--ink)', letterSpacing: '-0.03em', lineHeight: 1 }}>
          POMODORO
        </h1>
        <div style={{ borderTop: '1.5px solid var(--border)', marginTop: 12 }} />
      </div>

      {/* Phase selector */}
      <div style={{ display: 'flex', border: '1.5px solid var(--border)', marginBottom: 32 }}>
        {(['work', 'short', 'long'] as Phase[]).map((p, i) => (
          <button
            key={p}
            onClick={() => switchPhase(p)}
            style={{
              flex: 1, padding: '14px 8px', textAlign: 'center',
              background: phase === p ? 'var(--bg-invert)' : 'var(--bg)',
              color: phase === p ? 'var(--ink-invert)' : 'var(--ink-2)',
              border: 'none', borderRight: i < 2 ? '1.5px solid var(--border)' : 'none',
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12,
              letterSpacing: '0.04em', cursor: 'pointer',
              transition: 'background 80ms, color 80ms',
            }}
          >
            {PHASE_LABELS[p]}
          </button>
        ))}
      </div>

      {/* Timer block */}
      <div style={{ border: '1.5px solid var(--border)', padding: '40px 32px', marginBottom: 24 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.12em', marginBottom: 12 }}>
          {PHASE_LABELS[phase]}
        </div>

        <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: 'clamp(72px, 14vw, 96px)', color: 'var(--ink)', lineHeight: 1, letterSpacing: '-0.02em', marginBottom: 16 }}>
          {fmt(seconds)}
        </div>

        {/* Progress bar */}
        <div className="br-progress-track" style={{ marginBottom: 20 }}>
          <div className="br-progress-fill" style={{ width: `${progress * 100}%` }} />
        </div>

        <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-3)', marginBottom: 24 }}>
          {running ? 'STAY FOCUSED' : 'READY TO START'}  ·  SESSION {cycles + 1}
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={reset} className="br-btn" style={{ padding: '12px 20px' }}>
            RESET
          </button>
          <button
            onClick={() => setRunning(r => !r)}
            className="br-btn br-btn-inv"
            style={{ padding: '12px 32px', flex: 1 }}
          >
            {running ? '■ STOP' : '▶ START'}
          </button>
          <button
            onClick={() => setFullscreen(true)}
            className="br-btn"
            style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: 12 }}
            title="Fullscreen (F)"
          >
            GO DEEP
          </button>
        </div>
      </div>

      {/* Session dots */}
      <div style={{ border: '1.5px solid var(--border)', padding: '16px 20px', marginBottom: 24 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.12em', marginBottom: 10 }}>
          SESSION PROGRESS
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <span
              key={i}
              style={{
                fontFamily: 'var(--font-mono)', fontSize: 20,
                color: i < cycles % 4
                  ? 'var(--ink)'
                  : i === cycles % 4 && running
                    ? 'var(--ink-2)'
                    : 'var(--border-2)',
              }}
            >
              ■
            </span>
          ))}
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)', marginLeft: 8, letterSpacing: '0.06em' }}>
            {cycles} TOTAL COMPLETED
          </span>
        </div>
      </div>

      {/* Settings */}
      <div style={{ border: '1.5px solid var(--border)', padding: '16px 20px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.12em', marginBottom: 14 }}>
          TIMER SETTINGS (MINUTES)
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { label: 'FOCUS',       val: workMins,  set: (v: number) => { setWorkMins(v);  if (phase === 'work')  { setRunning(false); setSeconds(v * 60) } } },
            { label: 'SHORT BREAK', val: shortMins, set: (v: number) => { setShortMins(v); if (phase === 'short') { setRunning(false); setSeconds(v * 60) } } },
            { label: 'LONG BREAK',  val: longMins,  set: (v: number) => { setLongMins(v);  if (phase === 'long')  { setRunning(false); setSeconds(v * 60) } } },
          ].map(({ label, val, set }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12, color: 'var(--ink-2)', letterSpacing: '0.04em' }}>{label}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  onClick={() => set(Math.max(1, val - 1))}
                  style={{ width: 28, height: 28, background: 'var(--bg-card)', border: '1.5px solid var(--border)', fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--ink)', cursor: 'pointer' }}
                >
                  -
                </button>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 14, color: 'var(--ink)', width: 24, textAlign: 'center' }}>
                  {val}
                </span>
                <button
                  onClick={() => set(Math.min(60, val + 1))}
                  style={{ width: 28, height: 28, background: 'var(--bg-card)', border: '1.5px solid var(--border)', fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--ink)', cursor: 'pointer' }}
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
