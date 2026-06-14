'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wind, Play, Pause, RotateCcw } from 'lucide-react'

const TECHNIQUES = [
  {
    id: 'box',
    name: 'Box Breathing',
    desc: 'Calm & focus',
    color: '#2DD4BF',
    steps: [
      { label: 'Inhale', duration: 4 },
      { label: 'Hold',   duration: 4 },
      { label: 'Exhale', duration: 4 },
      { label: 'Hold',   duration: 4 },
    ],
  },
  {
    id: '478',
    name: '4-7-8',
    desc: 'Deep relaxation',
    color: '#818CF8',
    steps: [
      { label: 'Inhale', duration: 4 },
      { label: 'Hold',   duration: 7 },
      { label: 'Exhale', duration: 8 },
    ],
  },
  {
    id: 'calm',
    name: 'Calm Breath',
    desc: 'Gentle & easy',
    color: '#4ADE80',
    steps: [
      { label: 'Inhale', duration: 4 },
      { label: 'Exhale', duration: 6 },
    ],
  },
  {
    id: 'deep',
    name: 'Deep Breathing',
    desc: 'Ground yourself',
    color: '#F97316',
    steps: [
      { label: 'Inhale', duration: 5 },
      { label: 'Hold',   duration: 5 },
      { label: 'Exhale', duration: 5 },
    ],
  },
]

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
    setRunning(false)
    setStepIdx(0)
    setElapsed(0)
    setCycles(0)
  }

  const switchTechnique = (t: typeof TECHNIQUES[0]) => {
    reset()
    setSelected(t)
  }

  const ringSize    = 180
  const circumference = 2 * Math.PI * 70

  return (
    <div className="max-w-lg mx-auto space-y-5">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(45,212,191,0.12)' }}>
          <Wind className="w-5 h-5" style={{ color: '#2DD4BF' }} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-instrument), Georgia, serif', color: '#F1F5F9' }}>
            Breathing Exercises
          </h1>
          <p className="text-xs" style={{ color: '#475569' }}>Breathe and find your calm</p>
        </div>
      </motion.div>

      {/* Technique selector */}
      <div className="grid grid-cols-2 gap-2">
        {TECHNIQUES.map(t => (
          <button
            key={t.id}
            onClick={() => switchTechnique(t)}
            className="text-left p-3.5 rounded-2xl transition-all duration-200"
            style={{
              background: selected.id === t.id ? `${t.color}12` : '#13161F',
              border: selected.id === t.id ? `1px solid ${t.color}40` : '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div className="w-2 h-2 rounded-full mb-2" style={{ background: t.color }} />
            <p className="text-sm font-semibold" style={{ color: '#F1F5F9' }}>{t.name}</p>
            <p className="text-[10px]" style={{ color: '#475569' }}>{t.desc}</p>
          </button>
        ))}
      </div>

      {/* Breathing circle */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-3xl p-8 flex flex-col items-center"
        style={{ background: '#13161F', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="relative" style={{ width: ringSize, height: ringSize }}>
          <svg className="absolute inset-0 -rotate-90" width={ringSize} height={ringSize}>
            <circle
              cx={ringSize / 2} cy={ringSize / 2} r={70}
              fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6"
            />
            <circle
              cx={ringSize / 2} cy={ringSize / 2} r={70}
              fill="none"
              stroke={selected.color}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
              className="transition-all duration-1000 ease-linear"
            />
          </svg>

          {/* Pulsing inner circle */}
          <motion.div
            className="absolute inset-4 rounded-full flex flex-col items-center justify-center"
            style={{ background: `${selected.color}12` }}
            animate={running ? {
              scale: currentStep.label === 'Inhale' ? [1, 1.08] :
                     currentStep.label === 'Exhale' ? [1.08, 1] : 1,
            } : { scale: 1 }}
            transition={{ duration: currentStep.duration, ease: 'easeInOut' }}
          >
            <p
              className="text-base font-semibold"
              style={{ fontFamily: 'var(--font-instrument), Georgia, serif', color: selected.color }}
            >
              {currentStep.label}
            </p>
            <p
              className="text-4xl font-bold leading-none"
              style={{ color: '#F1F5F9', fontFamily: 'var(--font-jetbrains), monospace' }}
            >
              {currentStep.duration - elapsed}
            </p>
            <p className="text-[10px]" style={{ color: '#475569' }}>seconds</p>
          </motion.div>
        </div>

        {/* Step dots */}
        <div className="flex gap-2 mt-5">
          {selected.steps.map((step, i) => (
            <div
              key={i}
              className="h-1 rounded-full transition-all duration-300"
              style={{
                width: i === stepIdx ? 24 : 12,
                background: i === stepIdx ? selected.color : `${selected.color}30`,
              }}
            />
          ))}
        </div>

        <p className="text-xs mt-2" style={{ color: '#475569' }}>Cycles: {cycles}</p>

        {/* Controls */}
        <div className="flex gap-3 mt-5">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={reset}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:opacity-80"
            style={{ background: '#1C2030', border: '1px solid rgba(255,255,255,0.06)', color: '#94A3B8' }}
          >
            <RotateCcw className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.92 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => setRunning(r => !r)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm text-white shadow-lg transition-all"
            style={{ background: selected.color }}
          >
            {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {running ? 'Pause' : 'Start'}
          </motion.button>
        </div>
      </motion.div>

      {/* Steps legend */}
      <div className="rounded-2xl p-4" style={{ background: '#13161F', border: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="text-xs font-semibold mb-3" style={{ color: '#94A3B8' }}>{selected.name} pattern</p>
        <div className="flex gap-2">
          {selected.steps.map((step, i) => (
            <div key={i} className="flex-1 text-center">
              <div className="h-1 rounded-full mb-1.5" style={{ background: `${selected.color}30` }} />
              <p className="text-[10px] font-medium" style={{ color: '#F1F5F9' }}>{step.label}</p>
              <p className="text-[10px]" style={{ color: '#475569' }}>{step.duration}s</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
