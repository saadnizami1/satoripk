'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Wind,
  Play,
  Pause,
  RotateCcw,
  Info,
  Volume2,
  VolumeX,
  CheckCircle2,
  Heart,
  Brain,
  Sparkles,
  Moon,
  Zap,
  Target
} from 'lucide-react'

interface BreathingTechnique {
  id: string
  name: string
  description: string
  icon: any
  color: string
  steps: BreathStep[]
  benefits: string[]
  duration: number // in seconds for one full cycle
}

interface BreathStep {
  phase: 'inhale' | 'hold' | 'exhale' | 'holdEmpty'
  duration: number // in seconds
  instruction: string
}

const techniques: BreathingTechnique[] = [
  {
    id: 'box',
    name: 'Box Breathing',
    description: 'Equal breathing for calm and focus',
    icon: Target,
    color: '#4A6C6F',
    steps: [
      { phase: 'inhale', duration: 4, instruction: 'Breathe in slowly' },
      { phase: 'hold', duration: 4, instruction: 'Hold your breath' },
      { phase: 'exhale', duration: 4, instruction: 'Breathe out slowly' },
      { phase: 'holdEmpty', duration: 4, instruction: 'Hold empty lungs' },
    ],
    benefits: ['Reduces stress', 'Improves focus', 'Calms nervous system'],
    duration: 16
  },
  {
    id: '478',
    name: '4-7-8 Breathing',
    description: 'Dr. Weil\'s relaxation technique',
    icon: Moon,
    color: '#6B6B6B',
    steps: [
      { phase: 'inhale', duration: 4, instruction: 'Breathe in through nose' },
      { phase: 'hold', duration: 7, instruction: 'Hold your breath' },
      { phase: 'exhale', duration: 8, instruction: 'Exhale completely through mouth' },
    ],
    benefits: ['Reduces anxiety', 'Helps sleep', 'Lowers blood pressure'],
    duration: 19
  },
  {
    id: 'calm',
    name: 'Calm Breathing',
    description: 'Simple relaxation technique',
    icon: Heart,
    color: '#D2691E',
    steps: [
      { phase: 'inhale', duration: 4, instruction: 'Breathe in deeply' },
      { phase: 'exhale', duration: 6, instruction: 'Breathe out slowly' },
    ],
    benefits: ['Quick relaxation', 'Easy to learn', 'Reduces tension'],
    duration: 10
  },
  {
    id: 'energize',
    name: 'Energizing Breath',
    description: 'Quick breathing for energy',
    icon: Zap,
    color: '#D2691E',
    steps: [
      { phase: 'inhale', duration: 2, instruction: 'Quick breath in' },
      { phase: 'exhale', duration: 2, instruction: 'Quick breath out' },
    ],
    benefits: ['Increases alertness', 'Boosts energy', 'Improves circulation'],
    duration: 4
  },
  {
    id: 'deep',
    name: 'Deep Breathing',
    description: 'Full diaphragmatic breathing',
    icon: Brain,
    color: '#4A6C6F',
    steps: [
      { phase: 'inhale', duration: 5, instruction: 'Breathe deeply into belly' },
      { phase: 'hold', duration: 5, instruction: 'Hold gently' },
      { phase: 'exhale', duration: 5, instruction: 'Release completely' },
    ],
    benefits: ['Increases oxygen', 'Reduces stress', 'Improves lung capacity'],
    duration: 15
  },
  {
    id: 'resonant',
    name: 'Resonant Breathing',
    description: 'Coherent breathing at 6 breaths/min',
    icon: Sparkles,
    color: '#6B6B6B',
    steps: [
      { phase: 'inhale', duration: 5, instruction: 'Breathe in smoothly' },
      { phase: 'exhale', duration: 5, instruction: 'Breathe out smoothly' },
    ],
    benefits: ['Heart coherence', 'Emotional balance', 'Reduces anxiety'],
    duration: 10
  },
]

export default function BreathingPage() {
  const [selectedTechnique, setSelectedTechnique] = useState<BreathingTechnique | null>(null)
  const [isActive, setIsActive] = useState(false)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [timeInStep, setTimeInStep] = useState(0)
  const [completedCycles, setCompletedCycles] = useState(0)
  const [totalCycles, setTotalCycles] = useState(0)
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isActive && selectedTechnique) {
      intervalRef.current = setInterval(() => {
        setTimeInStep((prev) => {
          const currentStep = selectedTechnique.steps[currentStepIndex]
          
          if (prev >= currentStep.duration) {
            // Move to next step
            const nextIndex = (currentStepIndex + 1) % selectedTechnique.steps.length
            
            // Completed a full cycle
            if (nextIndex === 0) {
              setCompletedCycles((c) => c + 1)
              setTotalCycles((t) => t + 1)
              saveCycleToStorage()
            }
            
            setCurrentStepIndex(nextIndex)
            return 0
          }
          
          return prev + 0.1
        })
      }, 100)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isActive, selectedTechnique, currentStepIndex])

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = () => {
    const saved = localStorage.getItem('breathing_total_cycles')
    if (saved) {
      setTotalCycles(parseInt(saved))
    }
  }

  const saveCycleToStorage = () => {
    const current = parseInt(localStorage.getItem('breathing_total_cycles') || '0')
    localStorage.setItem('breathing_total_cycles', (current + 1).toString())
  }

  const startBreathing = (technique: BreathingTechnique) => {
    setSelectedTechnique(technique)
    setCurrentStepIndex(0)
    setTimeInStep(0)
    setCompletedCycles(0)
    setIsActive(true)
  }

  const pauseBreathing = () => {
    setIsActive(false)
  }

  const resumeBreathing = () => {
    setIsActive(true)
  }

  const resetBreathing = () => {
    setIsActive(false)
    setCurrentStepIndex(0)
    setTimeInStep(0)
    setCompletedCycles(0)
  }

  const goBack = () => {
    setSelectedTechnique(null)
    setIsActive(false)
    setCurrentStepIndex(0)
    setTimeInStep(0)
    setCompletedCycles(0)
  }

  const getCircleScale = () => {
    if (!selectedTechnique) return 1
    
    const currentStep = selectedTechnique.steps[currentStepIndex]
    const progress = timeInStep / currentStep.duration

    switch (currentStep.phase) {
      case 'inhale':
        return 0.6 + (progress * 0.4) // Scale from 0.6 to 1.0
      case 'hold':
        return 1.0 // Stay at max
      case 'exhale':
        return 1.0 - (progress * 0.4) // Scale from 1.0 to 0.6
      case 'holdEmpty':
        return 0.6 // Stay at min
      default:
        return 0.8
    }
  }

  const getCircleColor = () => {
    if (!selectedTechnique) return '#4A6C6F'
    
    const currentStep = selectedTechnique.steps[currentStepIndex]
    
    switch (currentStep.phase) {
      case 'inhale':
        return selectedTechnique.color
      case 'hold':
        return '#6B6B6B'
      case 'exhale':
        return '#A8A8A8'
      case 'holdEmpty':
        return '#D2691E'
      default:
        return selectedTechnique.color
    }
  }

  const getCurrentInstruction = () => {
    if (!selectedTechnique) return ''
    const currentStep = selectedTechnique.steps[currentStepIndex]
    return currentStep.instruction
  }

  const getTimeRemaining = () => {
    if (!selectedTechnique) return 0
    const currentStep = selectedTechnique.steps[currentStepIndex]
    return Math.ceil(currentStep.duration - timeInStep)
  }

  if (selectedTechnique) {
    const currentStep = selectedTechnique.steps[currentStepIndex]
    
    return (
      <div className="max-w-6xl mx-auto min-h-screen flex items-center justify-center">
        {/* Animated Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              background: isActive
                ? `radial-gradient(circle at 50% 50%, ${getCircleColor()}15 0%, transparent 70%)`
                : 'radial-gradient(circle at 50% 50%, transparent 0%, transparent 70%)'
            }}
            transition={{ duration: 1 }}
            className="absolute inset-0"
          />
        </div>

        <div className="w-full px-4 sm:px-6 relative z-10">
          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={goBack}
            className="mb-6 sm:mb-8 px-4 py-2 rounded-xl backdrop-blur-xl bg-white/40 border border-white/60 text-[#2C2C2C] text-sm sm:text-base font-medium flex items-center gap-2 hover:bg-white/60 transition-all"
          >
            <Wind className="w-4 h-4" />
            Back to Techniques
          </motion.button>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 sm:mb-8 flex justify-center gap-3 sm:gap-4 overflow-x-auto pb-2"
          >
            <div className="backdrop-blur-[40px] bg-white/40 border border-white/60 rounded-xl sm:rounded-2xl px-4 py-2.5 sm:px-5 sm:py-3 md:px-6 md:py-4 flex items-center gap-2 sm:gap-3 shadow-xl flex-shrink-0">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: selectedTechnique.color }} />
              <div>
                <p className="text-lg sm:text-xl font-bold text-[#2C2C2C]">{completedCycles}</p>
                <p className="text-[10px] sm:text-xs text-[#5F5F5F]">Cycles Today</p>
              </div>
            </div>

            <div className="backdrop-blur-[40px] bg-white/40 border border-white/60 rounded-xl sm:rounded-2xl px-4 py-2.5 sm:px-5 sm:py-3 md:px-6 md:py-4 flex items-center gap-2 sm:gap-3 shadow-xl flex-shrink-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#D2691E]" />
              <div>
                <p className="text-lg sm:text-xl font-bold text-[#2C2C2C]">{totalCycles}</p>
                <p className="text-[10px] sm:text-xs text-[#5F5F5F]">Total Cycles</p>
              </div>
            </div>
          </motion.div>

          {/* Main Breathing Circle */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="backdrop-blur-[40px] bg-white/40 border border-white/60 rounded-2xl sm:rounded-[2.5rem] md:rounded-[3rem] p-6 sm:p-8 md:p-10 lg:p-12 shadow-2xl max-w-2xl mx-auto"
          >
            {/* Technique Name */}
            <div className="text-center mb-6 sm:mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3 rounded-full backdrop-blur-xl bg-white/60 border border-white/60 mb-3 sm:mb-4">
                <selectedTechnique.icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: selectedTechnique.color }} />
                <span className="text-sm sm:text-base font-semibold text-[#2C2C2C]">{selectedTechnique.name}</span>
              </div>
            </div>

            {/* Breathing Circle */}
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 mx-auto mb-6 sm:mb-8">
              {/* Outer glow rings */}
              {isActive && (
                <>
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0.3, 0, 0.3],
                    }}
                    transition={{
                      duration: currentStep.duration,
                      repeat: 0,
                      ease: "easeInOut"
                    }}
                    style={{
                      border: `2px solid ${getCircleColor()}`,
                    }}
                  />
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.2, 0, 0.2],
                    }}
                    transition={{
                      duration: currentStep.duration,
                      repeat: 0,
                      ease: "easeInOut",
                      delay: 0.2
                    }}
                    style={{
                      border: `2px solid ${getCircleColor()}`,
                    }}
                  />
                </>
              )}

              {/* Main Circle */}
              <motion.div
                className="absolute inset-0 rounded-full flex items-center justify-center"
                animate={{
                  scale: getCircleScale(),
                  backgroundColor: `${getCircleColor()}30`,
                  borderColor: getCircleColor(),
                }}
                transition={{
                  duration: 0.3,
                  ease: "easeInOut"
                }}
                style={{
                  border: '4px solid',
                  boxShadow: `0 0 60px ${getCircleColor()}40`,
                }}
              >
                {/* Center Content */}
                <div className="text-center">
                  <motion.div
                    key={currentStepIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-3 sm:mb-4"
                  >
                    <p className="text-5xl sm:text-6xl font-bold text-[#2C2C2C] font-mono">
                      {getTimeRemaining()}
                    </p>
                  </motion.div>

                  <motion.p
                    key={currentStep.instruction}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-lg sm:text-xl font-semibold text-[#2C2C2C] px-6 sm:px-8"
                  >
                    {getCurrentInstruction()}
                  </motion.p>

                  <motion.p
                    className="text-xs sm:text-sm text-[#5F5F5F] mt-2 uppercase tracking-wider"
                    animate={{
                      opacity: isActive ? [0.5, 1, 0.5] : 1
                    }}
                    transition={{
                      duration: 2,
                      repeat: isActive ? Infinity : 0
                    }}
                  >
                    {currentStep.phase === 'inhale' ? 'Inhale' :
                     currentStep.phase === 'exhale' ? 'Exhale' :
                     currentStep.phase === 'hold' ? 'Hold' :
                     'Hold Empty'}
                  </motion.p>
                </div>
              </motion.div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-center gap-3 sm:gap-4">
              {!isActive ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resumeBreathing}
                  className="px-8 py-3 sm:px-10 sm:py-4 md:px-12 md:py-5 rounded-xl sm:rounded-2xl bg-gradient-to-r text-white font-bold text-base sm:text-lg shadow-2xl flex items-center gap-2 sm:gap-3"
                  style={{
                    backgroundImage: `linear-gradient(to right, ${selectedTechnique.color}, ${selectedTechnique.color}DD)`,
                    boxShadow: `0 10px 40px ${selectedTechnique.color}40`
                  }}
                >
                  <Play className="w-5 h-5 sm:w-6 sm:h-6" fill="white" />
                  {completedCycles === 0 ? 'Start' : 'Resume'}
                </motion.button>
              ) : (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={pauseBreathing}
                    className="px-6 py-3 sm:px-8 sm:py-4 md:px-10 md:py-5 rounded-xl sm:rounded-2xl backdrop-blur-xl bg-white/60 border-2 border-white/80 text-[#2C2C2C] font-bold text-sm sm:text-base shadow-xl flex items-center gap-2 sm:gap-3"
                  >
                    <Pause className="w-4 h-4 sm:w-5 sm:h-5" />
                    Pause
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={resetBreathing}
                    className="px-5 py-3 sm:px-6 sm:py-4 md:px-8 md:py-5 rounded-xl sm:rounded-2xl backdrop-blur-xl bg-white/60 border-2 border-white/80 text-[#2C2C2C] font-bold text-sm sm:text-base shadow-xl flex items-center gap-2 sm:gap-3"
                  >
                    <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
                    Reset
                  </motion.button>
                </>
              )}
            </div>

            {/* Bottom Controls */}
            <div className="mt-6 sm:mt-8 flex items-center justify-center gap-3 sm:gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-2.5 sm:p-3 rounded-lg sm:rounded-xl backdrop-blur-xl bg-white/40 border border-white/60 text-[#5F5F5F] hover:text-[#2C2C2C] transition-colors"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" /> : <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" />}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowInfo(!showInfo)}
                className="p-2.5 sm:p-3 rounded-lg sm:rounded-xl backdrop-blur-xl bg-white/40 border border-white/60 text-[#5F5F5F] hover:text-[#2C2C2C] transition-colors"
              >
                <Info className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.button>
            </div>

            {/* Benefits Info */}
            <AnimatePresence>
              {showInfo && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 sm:mt-6 p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl bg-white/60 border border-white/60"
                >
                  <h3 className="text-sm sm:text-base font-semibold text-[#2C2C2C] mb-2 sm:mb-3">Benefits:</h3>
                  <ul className="space-y-2">
                    {selectedTechnique.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-center gap-2 text-xs sm:text-sm text-[#5F5F5F]">
                        <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4" style={{ color: selectedTechnique.color }} />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    )
  }

  // Technique Selection Screen
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 sm:mb-8"
      >
        <div className="flex items-center gap-2 sm:gap-3 mb-2">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#4A6C6F]/20 to-[#4A6C6F]/10 backdrop-blur-xl flex items-center justify-center">
            <Wind className="w-5 h-5 sm:w-6 sm:h-6 text-[#4A6C6F]" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-serif font-medium text-[#2C2C2C]">
              Breathing Exercises
            </h1>
            <p className="text-sm sm:text-base text-[#5F5F5F]">Choose a technique to start your practice</p>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6 sm:mb-8 backdrop-blur-[40px] bg-white/40 border border-white/60 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-xl"
      >
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-[#4A6C6F]/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-[#4A6C6F]" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-[#2C2C2C]">{totalCycles}</p>
              <p className="text-xs sm:text-sm text-[#5F5F5F]">Total Breathing Cycles</p>
            </div>
          </div>

          <div className="flex-1 text-center">
            <p className="text-xs sm:text-sm text-[#5F5F5F]">
              Regular breathing exercises can reduce stress, improve focus, and promote overall wellbeing
            </p>
          </div>
        </div>
      </motion.div>

      {/* Techniques Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
        {techniques.map((technique, index) => (
          <motion.div
            key={technique.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => startBreathing(technique)}
            className="backdrop-blur-[40px] bg-white/40 border border-white/60 rounded-xl sm:rounded-2xl p-5 sm:p-6 shadow-xl hover:shadow-2xl transition-all cursor-pointer group"
          >
            {/* Icon */}
            <div
              className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform"
              style={{ backgroundColor: `${technique.color}20` }}
            >
              <technique.icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" style={{ color: technique.color }} />
            </div>

            {/* Name */}
            <h3 className="text-lg sm:text-xl font-semibold text-[#2C2C2C] mb-2 group-hover:text-[#4A6C6F] transition-colors">
              {technique.name}
            </h3>

            {/* Description */}
            <p className="text-xs sm:text-sm text-[#5F5F5F] mb-3 sm:mb-4">
              {technique.description}
            </p>

            {/* Duration */}
            <div className="flex items-center gap-2 text-xs text-[#5F5F5F] mb-3 sm:mb-4">
              <Wind className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>{technique.duration}s per cycle</span>
            </div>

            {/* Benefits */}
            <div className="space-y-1 mb-3 sm:mb-4">
              {technique.benefits.slice(0, 2).map((benefit, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-[#5F5F5F]">
                  <CheckCircle2 className="w-3 h-3" style={{ color: technique.color }} />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>

            {/* Start Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-white text-sm sm:text-base font-semibold shadow-lg flex items-center justify-center gap-2 group-hover:shadow-xl transition-all"
              style={{
                backgroundColor: technique.color,
                boxShadow: `0 4px 20px ${technique.color}40`
              }}
            >
              <Play className="w-3 h-3 sm:w-4 sm:h-4" fill="white" />
              Start Practice
            </motion.button>
          </motion.div>
        ))}
      </div>
    </div>
  )
}