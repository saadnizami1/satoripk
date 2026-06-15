'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const TECHNIQUES = [
  {
    id: 'box',
    name: 'BOX BREATHING',
    desc: 'Calm & focus',
    steps: [
      { label: 'INHALE', duration: 4 },
      { label: 'HOLD',   duration: 4 },
      { label: 'EXHALE', duration: 4 },
      { label: 'HOLD',   duration: 4 },
    ],
  },
  {
    id: '478',
    name: '4-7-8',
    desc: 'Deep relaxation',
    steps: [
      { label: 'INHALE', duration: 4 },
      { label: 'HOLD',   duration: 7 },
      { label: 'EXHALE', duration: 8 },
    ],
  },
  {
    id: 'calm',
    name: 'CALM BREATH',
    desc: 'Gentle & easy',
    steps: [
      { label: 'INHALE', duration: 4 },
      { label: 'EXHALE', duration: 6 },
    ],
  },
  {
    id: 'deep',
    name: 'DEEP BREATHING',
    desc: 'Ground yourself',
    steps: [
      { label: 'INHALE', duration: 5 },
      { label: 'HOLD',   duration: 5 },
      { label: 'EXHALE', duration: 5 },
    ],
  },
]

const PHASE_BG: Record<string, string> = {
  INHALE: '#F4F2EE',
  HOLD:   '#E8E6E0',
  EXHALE: '#F4F2EE',
}

export default function BreathingPage() {
  const [selected, setSelected] = useState(TECHNIQUES[0])
  const [running, setRunning]   = useState(false)
  const [stepIdx, setStepIdx]   = useState(0)
  const [elapsed, setElapsed]   = useState(0)
  const [cycles, setCycles]     = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const currentStep = selected.steps[stepIdx]
  const progress    = elapsed / currentStep.duration

  const tick = useCallback(() => {
    setElapsed(prev => {
      if (prev + 1 >= currentStep.duration) {
        setStepIdx(si => {
          const next = (si + 1) % selected.steps.length
          if (next === 0) setCycles(c => c + 1)
          return next
        })
        return 0
      }
      return prev + 1
    })
  }, [currentStep.duration, selected.steps.length])

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(tick, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running, tick])

  const reset = () => {
    setRunning(false); setStepIdx(0); setElapsed(0); setCycles(0)
  }

  const switchTechnique = (t: typeof TECHNIQUES[0]) => {
    reset(); setSelected(t)
  }

  const patternInfo = selected.steps.map(s => `${s.label} ${s.duration}s`).join('  ·  ')
  const phaseBg = running ? (PHASE_BG[currentStep.label] ?? 'var(--bg)') : 'var(--bg)'

  return (
    <div style={{ maxWidth: 560 }}>

      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(36px, 5vw, 56px)', color: 'var(--ink)', letterSpacing: '-0.03em', lineHeight: 1 }}>
          BREATHING
        </h1>
        <div style={{ borderTop: '1.5px solid var(--border)', marginTop: 12 }} />
      </div>

      {/* Technique selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 32, flexWrap: 'wrap' }}>
        {TECHNIQUES.map(t => (
          <button
            key={t.id}
            onClick={() => switchTechnique(t)}
            style={{
              padding: '8px 16px',
              background: selected.id === t.id ? 'var(--bg-invert)' : 'var(--bg)',
              color: selected.id === t.id ? 'var(--ink-invert)' : 'var(--ink-2)',
              border: '1.5px solid var(--border)',
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12,
              letterSpacing: '0.04em', cursor: 'pointer',
              transition: 'background 80ms, color 80ms',
            }}
          >
            {t.name}
          </button>
        ))}
      </div>

      {/* Main breathing block */}
      <div
        style={{
          border: '1.5px solid var(--border)',
          padding: '48px 40px',
          marginBottom: 24,
          background: phaseBg,
          transition: `background 800ms ease`,
        }}
      >
        {/* Phase word */}
        <AnimatePresence mode="wait">
          <motion.div
            key={running ? currentStep.label : 'idle'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(40px, 8vw, 64px)', color: 'var(--ink)', letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 12 }}>
              {running ? currentStep.label : 'READY'}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Progress line */}
        <div className="phase-line-track" style={{ marginBottom: 24 }}>
          <div
            className="phase-line-fill"
            style={{
              width: running ? `${progress * 100}%` : '0%',
              transitionDuration: running ? `${currentStep.duration}s` : '0s',
            }}
          />
        </div>

        {/* Countdown */}
        <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: 'clamp(80px, 16vw, 112px)', color: 'var(--ink)', lineHeight: 1, letterSpacing: '-0.02em', marginBottom: 20 }}>
          {running ? currentStep.duration - elapsed : selected.steps[0].duration}
        </div>

        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.1em', marginBottom: 28 }}>
          CYCLE {String(cycles + 1).padStart(2, '0')} OF 04
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
            {running ? '■ STOP' : '▶ BEGIN'}
          </button>
        </div>
      </div>

      {/* Pattern info */}
      <div style={{ border: '1.5px solid var(--border)', padding: '14px 16px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-2)', letterSpacing: '0.08em' }}>
          {selected.name}  ·  {patternInfo}
        </div>
      </div>

      {/* Steps reference */}
      <div style={{ display: 'flex', border: '1.5px solid var(--border)', borderTop: 'none', marginBottom: 0 }}>
        {selected.steps.map((step, i) => (
          <div
            key={i}
            style={{
              flex: 1, padding: '16px 12px', textAlign: 'center',
              borderRight: i < selected.steps.length - 1 ? '1px solid var(--border-2)' : 'none',
              background: running && i === stepIdx ? 'var(--bg-card)' : 'var(--bg)',
              transition: 'background 300ms',
            }}
          >
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12, color: running && i === stepIdx ? 'var(--ink)' : 'var(--ink-3)', letterSpacing: '0.04em', marginBottom: 4 }}>
              {step.label}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 20, color: running && i === stepIdx ? 'var(--ink)' : 'var(--ink-3)' }}>
              {step.duration}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.08em', marginTop: 2 }}>SEC</div>
          </div>
        ))}
      </div>
    </div>
  )
}
