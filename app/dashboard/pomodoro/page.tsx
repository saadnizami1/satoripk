'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Timer, Play, Pause, RotateCcw, Settings2, X, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

type Phase = 'work' | 'short' | 'long'

const PHASE_CONFIG: Record<Phase, { label: string; color: string }> = {
  work:  { label: 'Focus',       color: '#C4661F' },
  short: { label: 'Short Break', color: '#4A6C6F' },
  long:  { label: 'Long Break',  color: '#7A6C9F' },
}

export default function PomodoroPage() {
  const [workMins, setWorkMins]   = useState(25)
  const [shortMins, setShortMins] = useState(5)
  const [longMins, setLongMins]   = useState(15)
  const [phase, setPhase]         = useState<Phase>('work')
  const [seconds, setSeconds]     = useState(workMins * 60)
  const [running, setRunning]     = useState(false)
  const [cycles, setCycles]       = useState(0)
  const [showSettings, setShowSettings] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const totalSecs = phase === 'work' ? workMins * 60 : phase === 'short' ? shortMins * 60 : longMins * 60
  const progress  = 1 - seconds / totalSecs

  const advance = useCallback(() => {
    setRunning(false)
    if (phase === 'work') {
      const next = cycles + 1
      setCycles(next)
      if (next % 4 === 0) { setPhase('long');  setSeconds(longMins * 60) }
      else                 { setPhase('short'); setSeconds(shortMins * 60) }
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

  const reset = () => {
    setRunning(false)
    setSeconds(phase === 'work' ? workMins * 60 : phase === 'short' ? shortMins * 60 : longMins * 60)
  }

  const switchPhase = (p: Phase) => {
    setRunning(false)
    setPhase(p)
    setSeconds(p === 'work' ? workMins * 60 : p === 'short' ? shortMins * 60 : longMins * 60)
  }

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
  const cfg = PHASE_CONFIG[phase]
  const SIZE = 240, R = 100, CIRC = 2 * Math.PI * R

  return (
    <div className="max-w-md mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-[#5F5F5F] hover:text-[#2C2C2C] mb-4 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#C4661F]/12 flex items-center justify-center">
              <Timer className="w-5 h-5 text-[#C4661F]" />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-semibold text-[#2C2C2C]">Pomodoro</h1>
              <p className="text-xs text-[#9F9F9F]">Stay focused, one session at a time</p>
            </div>
          </div>
          <button onClick={() => setShowSettings(s => !s)}
            className="p-2 rounded-xl glass text-[#5F5F5F] hover:text-[#2C2C2C] transition-colors">
            {showSettings ? <X className="w-4 h-4" /> : <Settings2 className="w-4 h-4" />}
          </button>
        </div>
      </motion.div>

      {/* Settings */}
      <AnimatePresence>
        {showSettings && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="glass rounded-2xl p-4 space-y-4">
              <p className="text-xs font-semibold text-[#5F5F5F]">Timer settings (minutes)</p>
              {[
                { label: 'Focus',       val: workMins,  set: (v: number) => { setWorkMins(v);  if (phase === 'work')  { setRunning(false); setSeconds(v * 60) } } },
                { label: 'Short break', val: shortMins, set: (v: number) => { setShortMins(v); if (phase === 'short') { setRunning(false); setSeconds(v * 60) } } },
                { label: 'Long break',  val: longMins,  set: (v: number) => { setLongMins(v);  if (phase === 'long')  { setRunning(false); setSeconds(v * 60) } } },
              ].map(({ label, val, set }) => (
                <div key={label} className="flex items-center justify-between">
                  <p className="text-sm text-[#2C2C2C]">{label}</p>
                  <div className="flex items-center gap-2">
                    <button onClick={() => set(Math.max(1, val - 1))} className="w-7 h-7 rounded-lg glass text-[#5F5F5F] text-sm font-bold">-</button>
                    <span className="text-sm font-semibold text-[#2C2C2C] w-6 text-center">{val}</span>
                    <button onClick={() => set(Math.min(60, val + 1))} className="w-7 h-7 rounded-lg glass text-[#5F5F5F] text-sm font-bold">+</button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase tabs */}
      <div className="flex gap-2">
        {(['work', 'short', 'long'] as Phase[]).map(p => (
          <button key={p} onClick={() => switchPhase(p)}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${phase === p ? 'bg-white shadow text-[#2C2C2C]' : 'glass text-[#5F5F5F]'}`}>
            {PHASE_CONFIG[p].label}
          </button>
        ))}
      </div>

      {/* Timer */}
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="glass rounded-3xl p-8 flex flex-col items-center">
        <div className="relative" style={{ width: SIZE, height: SIZE }}>
          <svg className="absolute inset-0 -rotate-90" width={SIZE} height={SIZE}>
            <circle cx={SIZE/2} cy={SIZE/2} r={R} fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="8" />
            <circle cx={SIZE/2} cy={SIZE/2} r={R} fill="none" stroke={cfg.color} strokeWidth="8"
              strokeLinecap="round" strokeDasharray={CIRC} strokeDashoffset={CIRC * (1 - progress)}
              className="transition-all duration-1000 ease-linear" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#9F9F9F] mb-1">{cfg.label}</p>
            <p className="text-5xl font-bold text-[#2C2C2C] tabular-nums">{fmt(seconds)}</p>
            <p className="text-xs text-[#C0BAB2] mt-1">
              {running ? 'Stay focused' : 'Ready'} · Session {cycles + 1}
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <motion.button whileTap={{ scale: 0.92 }} onClick={reset}
            className="w-11 h-11 rounded-2xl glass flex items-center justify-center text-[#5F5F5F]">
            <RotateCcw className="w-4 h-4" />
          </motion.button>
          <motion.button whileTap={{ scale: 0.92 }} whileHover={{ scale: 1.05 }}
            onClick={() => setRunning(r => !r)}
            className="flex items-center gap-2 px-8 py-3 rounded-2xl font-semibold text-sm text-white shadow-lg"
            style={{ backgroundColor: cfg.color }}>
            {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {running ? 'Pause' : 'Start'}
          </motion.button>
        </div>
      </motion.div>

      {/* Session dots */}
      <div className="glass rounded-2xl p-4">
        <p className="text-xs font-semibold text-[#5F5F5F] mb-3">Session progress</p>
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex-1 h-2 rounded-full transition-all duration-300"
              style={{ backgroundColor: i < cycles % 4 ? '#C4661F' : 'rgba(0,0,0,0.07)' }} />
          ))}
        </div>
        <p className="text-[10px] text-[#C0BAB2] mt-2">Every 4 sessions = long break · Total: {cycles} completed</p>
      </div>
    </div>
  )
}
