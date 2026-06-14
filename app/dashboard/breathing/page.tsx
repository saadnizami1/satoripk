'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wind, Play, Pause, RotateCcw, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const TECHNIQUES = [
  {
    id: 'box',
    name: 'Box Breathing',
    desc: 'Calm & focus',
    color: '#4A6C6F',
    steps: [
      { label: 'Inhale',   duration: 4 },
      { label: 'Hold',     duration: 4 },
      { label: 'Exhale',   duration: 4 },
      { label: 'Hold',     duration: 4 },
    ],
  },
  {
    id: '478',
    name: '4-7-8',
    desc: 'Deep relaxation',
    color: '#7A6C9F',
    steps: [
      { label: 'Inhale',   duration: 4 },
      { label: 'Hold',     duration: 7 },
      { label: 'Exhale',   duration: 8 },
    ],
  },
  {
    id: 'calm',
    name: 'Calm Breath',
    desc: 'Gentle & easy',
    color: '#5A8C6F',
    steps: [
      { label: 'Inhale',   duration: 4 },
      { label: 'Exhale',   duration: 6 },
    ],
  },
  {
    id: 'deep',
    name: 'Deep Breathing',
    desc: 'Ground yourself',
    color: '#8B6555',
    steps: [
      { label: 'Inhale',   duration: 5 },
      { label: 'Hold',     duration: 5 },
      { label: 'Exhale',   duration: 5 },
    ],
  },
]

export default function BreathingPage() {
  const [selected, setSelected]     = useState(TECHNIQUES[0])
  const [running, setRunning]       = useState(false)
  const [stepIdx, setStepIdx]       = useState(0)
  const [elapsed, setElapsed]       = useState(0)
  const [cycles, setCycles]         = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const currentStep = selected.steps[stepIdx]
  const progress = elapsed / currentStep.duration

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

  const ringSize = 180
  const circumference = 2 * Math.PI * 70

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-[#5F5F5F] hover:text-[#2C2C2C] mb-4 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#4A6C6F]/12 flex items-center justify-center">
            <Wind className="w-5 h-5 text-[#4A6C6F]" />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-semibold text-[#2C2C2C]">Breathing Exercises</h1>
            <p className="text-xs text-[#9F9F9F]">Breathe and find your calm</p>
          </div>
        </div>
      </motion.div>

      {/* Technique selector */}
      <div className="grid grid-cols-2 gap-2">
        {TECHNIQUES.map(t => (
          <button
            key={t.id}
            onClick={() => switchTechnique(t)}
            className={`text-left p-3 rounded-2xl border transition-all duration-200 ${
              selected.id === t.id
                ? 'bg-white shadow-lg border-transparent'
                : 'glass border-transparent hover:bg-white/50'
            }`}
          >
            <div
              className="w-2 h-2 rounded-full mb-2"
              style={{ backgroundColor: t.color }}
            />
            <p className="text-sm font-semibold text-[#2C2C2C]">{t.name}</p>
            <p className="text-[10px] text-[#9F9F9F]">{t.desc}</p>
          </button>
        ))}
      </div>

      {/* Breathing circle */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass rounded-3xl p-8 flex flex-col items-center"
      >
        <div className="relative" style={{ width: ringSize, height: ringSize }}>
          {/* Background ring */}
          <svg className="absolute inset-0 -rotate-90" width={ringSize} height={ringSize}>
            <circle
              cx={ringSize / 2} cy={ringSize / 2} r={70}
              fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="6"
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
            style={{ backgroundColor: `${selected.color}18` }}
            animate={running ? {
              scale: currentStep.label === 'Inhale' ? [1, 1.08] :
                     currentStep.label === 'Exhale' ? [1.08, 1] : 1,
            } : { scale: 1 }}
            transition={{ duration: currentStep.duration, ease: 'easeInOut' }}
          >
            <p className="text-lg font-serif font-semibold" style={{ color: selected.color }}>
              {currentStep.label}
            </p>
            <p className="text-3xl font-bold text-[#2C2C2C]">
              {currentStep.duration - elapsed}
            </p>
            <p className="text-[10px] text-[#9F9F9F]">seconds</p>
          </motion.div>
        </div>

        {/* Steps */}
        <div className="flex gap-2 mt-6">
          {selected.steps.map((step, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === stepIdx ? 'w-6' : 'w-3'
              }`}
              style={{ backgroundColor: i === stepIdx ? selected.color : `${selected.color}30` }}
            />
          ))}
        </div>

        <p className="text-xs text-[#9F9F9F] mt-2">Cycles: {cycles}</p>

        {/* Controls */}
        <div className="flex gap-3 mt-5">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={reset}
            className="w-10 h-10 rounded-xl glass flex items-center justify-center text-[#5F5F5F]"
          >
            <RotateCcw className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.92 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => setRunning(r => !r)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm text-white shadow-lg"
            style={{ backgroundColor: selected.color }}
          >
            {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {running ? 'Pause' : 'Start'}
          </motion.button>
        </div>
      </motion.div>

      {/* Steps legend */}
      <div className="glass rounded-2xl p-4">
        <p className="text-xs font-semibold text-[#5F5F5F] mb-3">{selected.name} pattern</p>
        <div className="flex gap-2">
          {selected.steps.map((step, i) => (
            <div key={i} className="flex-1 text-center">
              <div
                className="h-1 rounded-full mb-1.5"
                style={{ backgroundColor: `${selected.color}40` }}
              />
              <p className="text-[10px] font-medium text-[#2C2C2C]">{step.label}</p>
              <p className="text-[10px] text-[#9F9F9F]">{step.duration}s</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
