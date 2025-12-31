'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Coffee, 
  Zap,
  Target,
  Trophy,
  Flame,
  Volume2,
  VolumeX,
  Settings,
  CheckCircle2,
  Clock,
  Plus,
  Minus,
  Music,
  Upload,
  X
} from 'lucide-react'

type TimerState = 'idle' | 'work' | 'shortBreak' | 'longBreak'
type TimerStatus = 'running' | 'paused' | 'idle'

export default function PomodoroTimer() {
  const [workTime, setWorkTime] = useState(25)
  const [shortBreakTime, setShortBreakTime] = useState(5)
  const [longBreakTime, setLongBreakTime] = useState(15)
  
  const [timerState, setTimerState] = useState<TimerState>('idle')
  const [timerStatus, setTimerStatus] = useState<TimerStatus>('idle')
  const [timeLeft, setTimeLeft] = useState(workTime * 60)
  const [totalTime, setTotalTime] = useState(workTime * 60)
  const [completedPomodoros, setCompletedPomodoros] = useState(0)
  const [todayPomodoros, setTodayPomodoros] = useState(0)
  const [totalPomodoros, setTotalPomodoros] = useState(0)
  const [currentTask, setCurrentTask] = useState('')
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [musicEnabled, setMusicEnabled] = useState(false)
  const [musicFileName, setMusicFileName] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const musicRef = useRef<HTMLAudioElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    // Load completion sound
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3')
    
    // Initialize music player
    musicRef.current = new Audio()
    musicRef.current.loop = true
    musicRef.current.volume = 0.5
    
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    // Load stats and music from localStorage
    loadStats()
    loadMusic()
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (musicRef.current) {
        musicRef.current.pause()
        musicRef.current.src = ''
      }
    }
  }, [])

  useEffect(() => {
    if (timerStatus === 'running') {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
      
      // Play music when timer starts
      if (musicEnabled && musicRef.current && musicRef.current.src) {
        musicRef.current.play().catch(() => {})
      }
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      
      // Pause music when timer pauses
      if (musicRef.current) {
        musicRef.current.pause()
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [timerStatus, musicEnabled])

  // Update page title with timer
  useEffect(() => {
    if (timerStatus === 'running') {
      const minutes = Math.floor(timeLeft / 60)
      const seconds = timeLeft % 60
      document.title = `${minutes}:${seconds.toString().padStart(2, '0')} - ${timerState === 'work' ? '🍅 Focus' : '☕ Break'}`
    } else {
      document.title = 'Satori - Pomodoro Timer'
    }
  }, [timeLeft, timerStatus, timerState])

  const loadStats = () => {
    const today = new Date().toDateString()
    const savedDate = localStorage.getItem('pomodoro_date')
    const savedTodayCount = localStorage.getItem('pomodoro_today')
    const savedTotalCount = localStorage.getItem('pomodoro_total')

    // Reset daily count if it's a new day
    if (savedDate !== today) {
      localStorage.setItem('pomodoro_date', today)
      localStorage.setItem('pomodoro_today', '0')
      setTodayPomodoros(0)
    } else {
      setTodayPomodoros(parseInt(savedTodayCount || '0'))
    }

    setTotalPomodoros(parseInt(savedTotalCount || '0'))
  }

  const loadMusic = () => {
    const savedMusicUrl = localStorage.getItem('pomodoro_music_url')
    const savedMusicName = localStorage.getItem('pomodoro_music_name')
    
    if (savedMusicUrl && musicRef.current) {
      musicRef.current.src = savedMusicUrl
      setMusicFileName(savedMusicName || 'Background Music')
    }
  }

  const handleMusicUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Check if it's an audio file
    if (!file.type.startsWith('audio/')) {
      alert('Please upload an audio file (MP3, WAV, etc.)')
      return
    }

    const reader = new FileReader()
    
    reader.onload = (e) => {
      const audioUrl = e.target?.result as string
      
      if (musicRef.current) {
        musicRef.current.src = audioUrl
        setMusicFileName(file.name)
        
        // Save to localStorage
        localStorage.setItem('pomodoro_music_url', audioUrl)
        localStorage.setItem('pomodoro_music_name', file.name)
      }
    }
    
    reader.readAsDataURL(file)
  }

  const removeMusic = () => {
    if (musicRef.current) {
      musicRef.current.pause()
      musicRef.current.src = ''
    }
    setMusicFileName('')
    setMusicEnabled(false)
    localStorage.removeItem('pomodoro_music_url')
    localStorage.removeItem('pomodoro_music_name')
  }

  const toggleMusic = () => {
    if (!musicRef.current?.src) {
      // No music uploaded, open file picker
      fileInputRef.current?.click()
      return
    }

    const newState = !musicEnabled
    setMusicEnabled(newState)
    
    if (newState && timerStatus === 'running') {
      musicRef.current?.play().catch(() => {})
    } else {
      musicRef.current?.pause()
    }
  }

  const saveStats = () => {
    const newTodayCount = todayPomodoros + 1
    const newTotalCount = totalPomodoros + 1
    
    localStorage.setItem('pomodoro_today', newTodayCount.toString())
    localStorage.setItem('pomodoro_total', newTotalCount.toString())
    
    setTodayPomodoros(newTodayCount)
    setTotalPomodoros(newTotalCount)
  }

  const handleTimerComplete = () => {
    setTimerStatus('idle')
    
    // Pause background music
    if (musicRef.current) {
      musicRef.current.pause()
    }
    
    // Play completion sound
    if (soundEnabled && audioRef.current) {
      audioRef.current.play().catch(() => {})
    }

    // Show notification
    if ('Notification' in window && Notification.permission === 'granted') {
      const title = timerState === 'work' ? '🎉 Focus Session Complete!' : '☕ Break Over!'
      const body = timerState === 'work' 
        ? 'Great work! Time for a break.' 
        : 'Break time is over. Ready to focus?'
      new Notification(title, { body, icon: '/favicon.ico' })
    }

    if (timerState === 'work') {
      // Completed a work session
      const newCount = completedPomodoros + 1
      setCompletedPomodoros(newCount)
      setShowCelebration(true)
      setTimeout(() => setShowCelebration(false), 3000)

      // Save stats
      saveStats()

      // Determine next break type
      if (newCount % 4 === 0) {
        setTimerState('longBreak')
        setTimeLeft(longBreakTime * 60)
        setTotalTime(longBreakTime * 60)
      } else {
        setTimerState('shortBreak')
        setTimeLeft(shortBreakTime * 60)
        setTotalTime(shortBreakTime * 60)
      }
    } else {
      // Break completed, back to work
      setTimerState('work')
      setTimeLeft(workTime * 60)
      setTotalTime(workTime * 60)
    }
  }

  const startTimer = () => {
    if (timerState === 'idle') {
      setTimerState('work')
      setTimeLeft(workTime * 60)
      setTotalTime(workTime * 60)
    }
    setTimerStatus('running')
  }

  const pauseTimer = () => {
    setTimerStatus('paused')
  }

  const resetTimer = () => {
    setTimerStatus('idle')
    setTimerState('idle')
    setTimeLeft(workTime * 60)
    setTotalTime(workTime * 60)
    if (musicRef.current) {
      musicRef.current.pause()
      musicRef.current.currentTime = 0
    }
  }

  const skipToBreak = () => {
    setTimerStatus('idle')
    setTimerState('shortBreak')
    setTimeLeft(shortBreakTime * 60)
    setTotalTime(shortBreakTime * 60)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const progress = ((totalTime - timeLeft) / totalTime) * 100

  const getStateColor = () => {
    switch (timerState) {
      case 'work': return '#D2691E'
      case 'shortBreak': return '#4A6C6F'
      case 'longBreak': return '#6B6B6B'
      default: return '#A8A8A8'
    }
  }

  const getStateGradient = () => {
    switch (timerState) {
      case 'work': return 'from-[#D2691E]/20 to-[#D2691E]/5'
      case 'shortBreak': return 'from-[#4A6C6F]/20 to-[#4A6C6F]/5'
      case 'longBreak': return 'from-[#6B6B6B]/20 to-[#6B6B6B]/5'
      default: return 'from-[#A8A8A8]/20 to-[#A8A8A8]/5'
    }
  }

  const getStateLabel = () => {
    switch (timerState) {
      case 'work': return 'Focus Time'
      case 'shortBreak': return 'Short Break'
      case 'longBreak': return 'Long Break'
      default: return 'Ready to Focus'
    }
  }

  const getStateIcon = () => {
    switch (timerState) {
      case 'work': return Zap
      case 'shortBreak': return Coffee
      case 'longBreak': return Coffee
      default: return Target
    }
  }

  const StateIcon = getStateIcon()

  return (
    <div className="max-w-6xl mx-auto min-h-screen flex items-center justify-center">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        onChange={handleMusicUpload}
        className="hidden"
      />

      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            background: timerStatus === 'running' 
              ? `radial-gradient(circle at 50% 50%, ${getStateColor()}15 0%, transparent 70%)`
              : 'radial-gradient(circle at 50% 50%, transparent 0%, transparent 70%)'
          }}
          transition={{ duration: 2 }}
          className="absolute inset-0"
        />
        
        {/* Floating Particles */}
        {timerStatus === 'running' && (
          <>
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full opacity-20"
                style={{ 
                  backgroundColor: getStateColor(),
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -100, 0],
                  opacity: [0, 0.5, 0],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </>
        )}
      </div>

      {/* Celebration Effect */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none px-4"
          >
            <div className="text-center">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 1 }}
              >
                <Trophy className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 text-[#D2691E] mx-auto mb-3 sm:mb-4" />
              </motion.div>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#2C2C2C] mb-2">Amazing!</h2>
              <p className="text-lg sm:text-xl text-[#5F5F5F]">Pomodoro Complete! 🎉</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="backdrop-blur-[40px] bg-white/90 border border-white/60 rounded-xl sm:rounded-2xl md:rounded-[2rem] p-6 sm:p-8 shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-[#2C2C2C] mb-4 sm:mb-6">Timer Settings</h2>
              
              {/* Work Time */}
              <div className="mb-5 sm:mb-6">
                <label className="block text-xs sm:text-sm font-medium text-[#5F5F5F] mb-2">
                  Focus Time (minutes)
                </label>
                <div className="flex items-center gap-3 sm:gap-4">
                  <button
                    onClick={() => setWorkTime(Math.max(1, workTime - 5))}
                    className="p-2 rounded-lg sm:rounded-xl bg-white/60 border border-white/60 hover:bg-white/80 transition-colors"
                  >
                    <Minus className="w-4 h-4 sm:w-5 sm:h-5 text-[#2C2C2C]" />
                  </button>
                  <span className="text-2xl sm:text-3xl font-bold text-[#2C2C2C] w-16 sm:w-20 text-center">{workTime}</span>
                  <button
                    onClick={() => setWorkTime(Math.min(60, workTime + 5))}
                    className="p-2 rounded-lg sm:rounded-xl bg-white/60 border border-white/60 hover:bg-white/80 transition-colors"
                  >
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-[#2C2C2C]" />
                  </button>
                </div>
              </div>

              {/* Short Break */}
              <div className="mb-5 sm:mb-6">
                <label className="block text-xs sm:text-sm font-medium text-[#5F5F5F] mb-2">
                  Short Break (minutes)
                </label>
                <div className="flex items-center gap-3 sm:gap-4">
                  <button
                    onClick={() => setShortBreakTime(Math.max(1, shortBreakTime - 1))}
                    className="p-2 rounded-lg sm:rounded-xl bg-white/60 border border-white/60 hover:bg-white/80 transition-colors"
                  >
                    <Minus className="w-4 h-4 sm:w-5 sm:h-5 text-[#2C2C2C]" />
                  </button>
                  <span className="text-2xl sm:text-3xl font-bold text-[#2C2C2C] w-16 sm:w-20 text-center">{shortBreakTime}</span>
                  <button
                    onClick={() => setShortBreakTime(Math.min(30, shortBreakTime + 1))}
                    className="p-2 rounded-lg sm:rounded-xl bg-white/60 border border-white/60 hover:bg-white/80 transition-colors"
                  >
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-[#2C2C2C]" />
                  </button>
                </div>
              </div>

              {/* Long Break */}
              <div className="mb-5 sm:mb-6">
                <label className="block text-xs sm:text-sm font-medium text-[#5F5F5F] mb-2">
                  Long Break (minutes)
                </label>
                <div className="flex items-center gap-3 sm:gap-4">
                  <button
                    onClick={() => setLongBreakTime(Math.max(5, longBreakTime - 5))}
                    className="p-2 rounded-lg sm:rounded-xl bg-white/60 border border-white/60 hover:bg-white/80 transition-colors"
                  >
                    <Minus className="w-4 h-4 sm:w-5 sm:h-5 text-[#2C2C2C]" />
                  </button>
                  <span className="text-2xl sm:text-3xl font-bold text-[#2C2C2C] w-16 sm:w-20 text-center">{longBreakTime}</span>
                  <button
                    onClick={() => setLongBreakTime(Math.min(60, longBreakTime + 5))}
                    className="p-2 rounded-lg sm:rounded-xl bg-white/60 border border-white/60 hover:bg-white/80 transition-colors"
                  >
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-[#2C2C2C]" />
                  </button>
                </div>
              </div>

              {/* Background Music */}
              <div className="mb-5 sm:mb-6 pb-5 sm:pb-6 border-b border-white/40">
                <label className="block text-xs sm:text-sm font-medium text-[#5F5F5F] mb-3">
                  Background Music
                </label>

                {musicFileName ? (
                  <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-white/60 border border-white/60">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 flex-1 mr-2">
                        <Music className="w-3 h-3 sm:w-4 sm:h-4 text-[#4A6C6F]" />
                        <span className="text-xs sm:text-sm text-[#2C2C2C] truncate">{musicFileName}</span>
                      </div>
                      <button
                        onClick={removeMusic}
                        className="p-1 rounded-lg hover:bg-white/60 transition-colors"
                      >
                        <X className="w-3 h-3 sm:w-4 sm:h-4 text-[#D2691E]" />
                      </button>
                    </div>
                    <p className="text-xs text-[#5F5F5F]">Will loop during focus sessions</p>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 border-dashed border-white/60 hover:border-[#4A6C6F] hover:bg-white/40 transition-all flex items-center justify-center gap-2 text-[#5F5F5F] hover:text-[#4A6C6F]"
                  >
                    <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-sm sm:text-base font-medium">Upload MP3 or Audio File</span>
                  </button>
                )}
              </div>

              <button
                onClick={() => setShowSettings(false)}
                className="w-full py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#D2691E] to-[#D2691E]/80 text-white text-sm sm:text-base font-semibold shadow-xl"
              >
                Done
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="w-full px-4 sm:px-6">
        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8 flex justify-center gap-3 sm:gap-4 overflow-x-auto pb-2"
        >
          {[
            { icon: Trophy, label: 'Today', value: todayPomodoros, color: '#D2691E' },
            { icon: Target, label: 'Session', value: completedPomodoros, color: '#4A6C6F' },
            { icon: Flame, label: 'Total', value: totalPomodoros, color: '#6B6B6B' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="backdrop-blur-[40px] bg-white/40 border border-white/60 rounded-xl sm:rounded-2xl px-4 py-3 sm:px-5 sm:py-3.5 md:px-6 md:py-4 flex items-center gap-2 sm:gap-3 shadow-xl shrink-0"
            >
              <div
                className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg sm:rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${stat.color}20` }}
              >
                <stat.icon className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5" style={{ color: stat.color }} />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-[#2C2C2C]">{stat.value}</p>
                <p className="text-[10px] sm:text-xs text-[#5F5F5F]">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Timer Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="backdrop-blur-[40px] bg-white/40 border border-white/60 rounded-2xl sm:rounded-[2.5rem] md:rounded-[3rem] p-6 sm:p-8 md:p-10 lg:p-12 shadow-2xl max-w-2xl mx-auto"
        >
          {/* State Label */}
          <motion.div
            className={`inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3 rounded-full backdrop-blur-xl bg-gradient-to-r ${getStateGradient()} border border-white/40 mb-6 sm:mb-8`}
            animate={{ scale: timerStatus === 'running' ? [1, 1.05, 1] : 1 }}
            transition={{ duration: 2, repeat: timerStatus === 'running' ? Infinity : 0 }}
          >
            <StateIcon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: getStateColor() }} />
            <span className="text-sm sm:text-base font-semibold text-[#2C2C2C]">{getStateLabel()}</span>
            {musicEnabled && musicFileName && timerStatus === 'running' && (
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Music className="w-3 h-3 sm:w-4 sm:h-4 text-[#4A6C6F]" />
              </motion.div>
            )}
          </motion.div>

          {/* Circular Progress Timer */}
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 mx-auto mb-6 sm:mb-8">
            {/* Background Circle */}
            <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 200 200">
              <circle
                cx="100"
                cy="100"
                r="85"
                fill="none"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="8"
                className="sm:stroke-[9] md:stroke-[10]"
              />
              {/* Progress Circle */}
              <motion.circle
                cx="100"
                cy="100"
                r="85"
                fill="none"
                stroke={getStateColor()}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 85}
                strokeDashoffset={2 * Math.PI * 85 * (1 - progress / 100)}
                className="sm:stroke-[9] md:stroke-[10]"
                animate={{
                  strokeDashoffset: 2 * Math.PI * 85 * (1 - progress / 100)
                }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </svg>

            {/* Timer Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.div
                key={timeLeft}
                initial={{ scale: 1 }}
                animate={{ scale: timerStatus === 'running' ? [1, 1.02, 1] : 1 }}
                transition={{ duration: 1, repeat: timerStatus === 'running' ? Infinity : 0 }}
              >
                <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-[#2C2C2C] mb-2 font-mono">
                  {formatTime(timeLeft)}
                </h1>
              </motion.div>
              <p className="text-sm sm:text-base md:text-lg text-[#5F5F5F] px-4 text-center">
                {timerStatus === 'running' ? 'Stay focused!' : timerStatus === 'paused' ? 'Paused' : 'Ready when you are'}
              </p>
            </div>

            {/* Pulse Effect - Hidden on mobile */}
            {timerStatus === 'running' && (
              <motion.div
                className="absolute inset-0 rounded-full hidden sm:block"
                style={{
                  boxShadow: `0 0 60px ${getStateColor()}40`,
                }}
                animate={{
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              />
            )}
          </div>

          {/* Task Input */}
          {timerState === 'idle' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 sm:mb-8"
            >
              <input
                type="text"
                value={currentTask}
                onChange={(e) => setCurrentTask(e.target.value)}
                placeholder="What are you working on?"
                className="w-full px-4 py-3 sm:px-5 sm:py-3.5 md:px-6 md:py-4 rounded-xl sm:rounded-2xl bg-white/50 border border-white/60 backdrop-blur-xl text-[#2C2C2C] text-sm sm:text-base text-center placeholder-[#5F5F5F] focus:outline-none focus:ring-2 focus:ring-[#D2691E]/50 transition-all font-medium"
              />
            </motion.div>
          )}

          {/* Current Task Display */}
          {timerState !== 'idle' && currentTask && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6 sm:mb-8 text-center"
            >
              <p className="text-xs sm:text-sm text-[#5F5F5F] mb-1">Working on:</p>
              <p className="text-base sm:text-lg font-semibold text-[#2C2C2C]">{currentTask}</p>
            </motion.div>
          )}

          {/* Control Buttons */}
          <div className="flex items-center justify-center gap-3 sm:gap-4">
            {timerStatus === 'idle' ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startTimer}
                className="px-8 py-3 sm:px-10 sm:py-4 md:px-12 md:py-5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#D2691E] to-[#D2691E]/80 text-white font-bold text-base sm:text-lg shadow-2xl flex items-center gap-2 sm:gap-3 hover:shadow-3xl transition-all"
                style={{ boxShadow: `0 10px 40px ${getStateColor()}40` }}
              >
                <Play className="w-5 h-5 sm:w-6 sm:h-6" fill="white" />
                <span className="hidden sm:inline">Start Focus</span>
                <span className="sm:hidden">Start</span>
              </motion.button>
            ) : (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={timerStatus === 'running' ? pauseTimer : startTimer}
                  className="px-6 py-3 sm:px-8 sm:py-4 md:px-10 md:py-5 rounded-xl sm:rounded-2xl backdrop-blur-xl bg-white/60 border-2 border-white/80 text-[#2C2C2C] font-bold text-sm sm:text-base shadow-xl flex items-center gap-2 sm:gap-3"
                >
                  {timerStatus === 'running' ? (
                    <>
                      <Pause className="w-4 h-4 sm:w-5 sm:h-5" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" />
                      Resume
                    </>
                  )}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resetTimer}
                  className="px-5 py-3 sm:px-6 sm:py-4 md:px-8 md:py-5 rounded-xl sm:rounded-2xl backdrop-blur-xl bg-white/60 border-2 border-white/80 text-[#2C2C2C] font-bold text-sm sm:text-base shadow-xl flex items-center gap-2 sm:gap-3"
                >
                  <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
                  Reset
                </motion.button>

                {timerState === 'work' && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={skipToBreak}
                    className="px-5 py-3 sm:px-6 sm:py-4 md:px-8 md:py-5 rounded-xl sm:rounded-2xl backdrop-blur-xl bg-white/60 border-2 border-white/80 text-[#2C2C2C] font-bold text-sm sm:text-base shadow-xl flex items-center gap-2 sm:gap-3"
                  >
                    <Coffee className="w-4 h-4 sm:w-5 sm:h-5" />
                    Skip
                  </motion.button>
                )}
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
              title="Completion Sound"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" /> : <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" />}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleMusic}
              className={`p-2.5 sm:p-3 rounded-lg sm:rounded-xl backdrop-blur-xl border transition-colors ${
                musicEnabled
                  ? 'bg-[#4A6C6F]/20 border-[#4A6C6F] text-[#4A6C6F]'
                  : 'bg-white/40 border-white/60 text-[#5F5F5F] hover:text-[#2C2C2C]'
              }`}
              title={musicFileName ? 'Toggle Background Music' : 'Upload Background Music'}
            >
              <Music className="w-4 h-4 sm:w-5 sm:h-5" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSettings(!showSettings)}
              className="p-2.5 sm:p-3 rounded-lg sm:rounded-xl backdrop-blur-xl bg-white/40 border border-white/60 text-[#5F5F5F] hover:text-[#2C2C2C] transition-colors"
            >
              <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
            </motion.button>
          </div>
        </motion.div>

        {/* Completed Pomodoros Display */}
        {completedPomodoros > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-6 sm:mt-8 flex justify-center gap-2"
          >
            {[...Array(completedPomodoros)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 + i * 0.1, type: 'spring' }}
              >
                <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-[#D2691E]" fill="#D2691E" />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}