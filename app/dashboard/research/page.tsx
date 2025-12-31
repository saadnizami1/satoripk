'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Brain, Clock, Heart, Users, Calendar, Sparkles, TrendingUp, CircleAlert } from 'lucide-react'
import { useRouter } from 'next/navigation'

const performanceLevels = [
  { value: 5, label: 'Excellent', color: '#4A6C6F' },
  { value: 4, label: 'Good', color: '#6B6B6B' },
  { value: 3, label: 'Average', color: '#A8A8A8' },
  { value: 2, label: 'Below Average', color: '#D2691E' },
  { value: 1, label: 'Poor', color: '#1F1F1F' },
]

const stressLevels = [
  { value: 5, label: 'Extremely Stressed', color: '#1F1F1F' },
  { value: 4, label: 'Very Stressed', color: '#D2691E' },
  { value: 3, label: 'Moderately Stressed', color: '#A8A8A8' },
  { value: 2, label: 'Slightly Stressed', color: '#6B6B6B' },
  { value: 1, label: 'Not Stressed', color: '#4A6C6F' },
]

const yesNoOptions = [
  { value: 'yes', label: 'Yes', color: '#4A6C6F' },
  { value: 'no', label: 'No', color: '#D2691E' },
  { value: 'planning', label: 'Planning to', color: '#6B6B6B' },
]

const impactOptions = [
  { value: 'yes', label: 'Yes', color: '#D2691E' },
  { value: 'no', label: 'No', color: '#4A6C6F' },
  { value: 'somewhat', label: 'Somewhat', color: '#A8A8A8' },
]

export default function AcademicStressPage() {
  const router = useRouter()
  const [performance, setPerformance] = useState<number | null>(null)
  const [stressLevel, setStressLevel] = useState<number | null>(null)
  const [selfStudy, setSelfStudy] = useState<string | null>(null)
  const [moodImpact, setMoodImpact] = useState<string | null>(null)
  const [lifeImpact, setLifeImpact] = useState<string | null>(null)
  const [lifeImpactExample, setLifeImpactExample] = useState('')
  const [recentEntries, setRecentEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [alreadyLogged, setAlreadyLogged] = useState(false)
  const [todayEntry, setTodayEntry] = useState<any>(null)

  useEffect(() => {
    checkTodayEntry()
    fetchRecentEntries()
  }, [])

  const checkTodayEntry = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const today = new Date().toISOString().split('T')[0]
      const { data } = await supabase
        .from('academic_stress')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', today)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      
      if (data) {
        setAlreadyLogged(true)
        setTodayEntry(data)
      }
    }
  }

  const fetchRecentEntries = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const { data } = await supabase
        .from('academic_stress')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(7)
      
      setRecentEntries(data || [])
    }
  }

  const handleSubmit = async () => {
    if (!performance || !stressLevel || alreadyLogged) return

    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      // Store all responses in notes as JSON
      const responses = {
        selfStudy,
        moodImpact,
        lifeImpact,
        lifeImpactExample: lifeImpact === 'yes' ? lifeImpactExample : null
      }

      const { error } = await supabase
        .from('academic_stress')
        .insert({
          user_id: user.id,
          performance_rating: performance,
          stress_level: stressLevel,
          notes: JSON.stringify(responses),
        })

      if (!error) {
        setSuccess(true)
        setAlreadyLogged(true)
        // Reset form
        setPerformance(null)
        setStressLevel(null)
        setSelfStudy(null)
        setMoodImpact(null)
        setLifeImpact(null)
        setLifeImpactExample('')
        
        checkTodayEntry()
        fetchRecentEntries()
        
        setTimeout(() => setSuccess(false), 3000)
      }
    }
    
    setLoading(false)
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#6B6B6B]/20 to-[#6B6B6B]/10 backdrop-blur-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-[#6B6B6B]" />
            </div>
            <div>
              <h1 className="text-4xl font-serif font-medium text-[#2C2C2C]">
                Academic Stress Tracker
              </h1>
              <p className="text-[#5F5F5F]">Track your daily academic performance and stress levels</p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/dashboard/research/insights')}
            className="px-6 py-3 rounded-2xl backdrop-blur-xl bg-white/40 border border-white/60 text-[#2C2C2C] font-medium flex items-center gap-2 hover:bg-white/60 transition-all duration-300"
          >
            <TrendingUp className="w-5 h-5" />
            View Insights
          </motion.button>
        </div>
      </motion.div>

      {/* Success Message */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 p-4 backdrop-blur-[40px] bg-[#4A6C6F]/20 border border-[#4A6C6F]/40 rounded-2xl flex items-center gap-3"
          >
            <Sparkles className="w-5 h-5 text-[#4A6C6F]" />
            <span className="text-[#2C2C2C] font-medium">Entry logged successfully! 📚</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Already Logged Message */}
      {alreadyLogged && todayEntry && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-6 backdrop-blur-[40px] bg-white/60 border border-white/60 rounded-2xl"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#6B6B6B]/20 flex items-center justify-center flex-shrink-0">
              <Clock className="w-6 h-6 text-[#6B6B6B]" />
            </div>
            <div>
              <h3 className="font-semibold text-[#2C2C2C] mb-1">You've already logged your academic stress today!</h3>
              <p className="text-sm text-[#5F5F5F] mb-3">
                Performance: <span className="font-medium">{todayEntry.performance_rating}/5</span> • 
                Stress: <span className="font-medium">{todayEntry.stress_level}/5</span>
              </p>
              <p className="text-xs text-[#5F5F5F]">Come back tomorrow to track again!</p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <div className={`backdrop-blur-[40px] bg-white/40 border border-white/60 rounded-[2rem] p-8 shadow-2xl ${alreadyLogged ? 'opacity-50 pointer-events-none' : ''}`}>
            
            {/* Question 1: Academic Performance */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#4A6C6F]/20 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-[#4A6C6F]" />
                </div>
                <h2 className="text-xl font-serif font-semibold text-[#2C2C2C]">
                  How was your academic performance today?
                </h2>
              </div>
              
              <div className="space-y-3">
                {performanceLevels.map((level) => (
                  <motion.button
                    key={level.value}
                    whileHover={{ scale: alreadyLogged ? 1 : 1.01 }}
                    whileTap={{ scale: alreadyLogged ? 1 : 0.99 }}
                    onClick={() => !alreadyLogged && setPerformance(level.value)}
                    disabled={alreadyLogged}
                    className={`w-full p-4 rounded-xl transition-all duration-300 flex items-center justify-between ${
                      performance === level.value
                        ? 'bg-white/80 border-2 shadow-lg'
                        : 'bg-white/30 border-2 border-transparent hover:bg-white/50'
                    }`}
                    style={{
                      borderColor: performance === level.value ? level.color : 'transparent'
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: level.color }}
                      />
                      <span className="font-medium text-[#2C2C2C]">{level.label}</span>
                    </div>
                    <span className="text-sm text-[#5F5F5F]">{level.value}/5</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Question 2: Stress Level */}
            <AnimatePresence>
              {performance !== null && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-8"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#D2691E]/20 flex items-center justify-center">
                      <CircleAlert className="w-5 h-5 text-[#D2691E]" />
                    </div>
                    <h2 className="text-xl font-serif font-semibold text-[#2C2C2C]">
                      How stressed were you today?
                    </h2>
                  </div>
                  
                  <div className="space-y-3">
                    {stressLevels.map((level) => (
                      <motion.button
                        key={level.value}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => setStressLevel(level.value)}
                        className={`w-full p-4 rounded-xl transition-all duration-300 flex items-center justify-between ${
                          stressLevel === level.value
                            ? 'bg-white/80 border-2 shadow-lg'
                            : 'bg-white/30 border-2 border-transparent hover:bg-white/50'
                        }`}
                        style={{
                          borderColor: stressLevel === level.value ? level.color : 'transparent'
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: level.color }}
                          />
                          <span className="font-medium text-[#2C2C2C]">{level.label}</span>
                        </div>
                        <span className="text-sm text-[#5F5F5F]">{level.value}/5</span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Question 3: Self Study */}
            <AnimatePresence>
              {stressLevel !== null && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-8"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#6B6B6B]/20 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-[#6B6B6B]" />
                    </div>
                    <h2 className="text-xl font-serif font-semibold text-[#2C2C2C]">
                      Did you self-study at home today?
                    </h2>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    {yesNoOptions.map((option) => (
                      <motion.button
                        key={option.value}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelfStudy(option.value)}
                        className={`p-4 rounded-xl transition-all duration-300 font-medium ${
                          selfStudy === option.value
                            ? 'bg-white/80 border-2 shadow-lg text-[#2C2C2C]'
                            : 'bg-white/30 border-2 border-transparent text-[#5F5F5F] hover:bg-white/50'
                        }`}
                        style={{
                          borderColor: selfStudy === option.value ? option.color : 'transparent'
                        }}
                      >
                        {option.label}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Question 4: Mood Impact */}
            <AnimatePresence>
              {selfStudy !== null && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-8"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#D2691E]/20 flex items-center justify-center">
                      <Heart className="w-5 h-5 text-[#D2691E]" />
                    </div>
                    <h2 className="text-xl font-serif font-semibold text-[#2C2C2C]">
                      Did academic performance impact your mood?
                    </h2>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    {impactOptions.map((option) => (
                      <motion.button
                        key={option.value}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setMoodImpact(option.value)}
                        className={`p-4 rounded-xl transition-all duration-300 font-medium ${
                          moodImpact === option.value
                            ? 'bg-white/80 border-2 shadow-lg text-[#2C2C2C]'
                            : 'bg-white/30 border-2 border-transparent text-[#5F5F5F] hover:bg-white/50'
                        }`}
                        style={{
                          borderColor: moodImpact === option.value ? option.color : 'transparent'
                        }}
                      >
                        {option.label}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Question 5: Life Impact */}
            <AnimatePresence>
              {moodImpact !== null && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-8"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#4A6C6F]/20 flex items-center justify-center">
                      <Users className="w-5 h-5 text-[#4A6C6F]" />
                    </div>
                    <h2 className="text-xl font-serif font-semibold text-[#2C2C2C]">
                      Did it impact your day-to-day life?
                    </h2>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {impactOptions.map((option) => (
                      <motion.button
                        key={option.value}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setLifeImpact(option.value)}
                        className={`p-4 rounded-xl transition-all duration-300 font-medium ${
                          lifeImpact === option.value
                            ? 'bg-white/80 border-2 shadow-lg text-[#2C2C2C]'
                            : 'bg-white/30 border-2 border-transparent text-[#5F5F5F] hover:bg-white/50'
                        }`}
                        style={{
                          borderColor: lifeImpact === option.value ? option.color : 'transparent'
                        }}
                      >
                        {option.label}
                      </motion.button>
                    ))}
                  </div>

                  {/* Example Input */}
                  {lifeImpact === 'yes' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                    >
                      <label className="block text-sm font-medium text-[#5F5F5F] mb-2">
                        Example (e.g., "Couldn't play football because of studying")
                      </label>
                      <input
                        type="text"
                        value={lifeImpactExample}
                        onChange={(e) => setLifeImpactExample(e.target.value)}
                        placeholder="What did you miss out on?"
                        className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white/60 backdrop-blur-xl text-[#2C2C2C] placeholder-[#5F5F5F] focus:outline-none focus:ring-2 focus:ring-[#6B6B6B]/50 transition-all"
                      />
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <AnimatePresence>
              {lifeImpact !== null && (
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: alreadyLogged ? 1 : 1.02 }}
                  whileTap={{ scale: alreadyLogged ? 1 : 0.98 }}
                  onClick={handleSubmit}
                  disabled={!performance || !stressLevel || loading || alreadyLogged}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#6B6B6B] to-[#6B6B6B]/80 text-white font-semibold shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  {alreadyLogged ? 'Already Logged Today' : loading ? 'Submitting...' : 'Submit Entry'}
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Recent Entries Sidebar */}
        <div>
          <div className="backdrop-blur-[40px] bg-white/40 border border-white/60 rounded-[2rem] p-6 shadow-2xl sticky top-6">
            <h2 className="text-xl font-serif font-semibold text-[#2C2C2C] mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Recent Entries
            </h2>

            {recentEntries.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-[#5F5F5F] mx-auto mb-3 opacity-50" />
                <p className="text-sm text-[#5F5F5F]">No entries yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentEntries.map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 rounded-xl bg-white/50 backdrop-blur-xl border border-white/60"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-[#5F5F5F]">
                        {new Date(entry.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-[#5F5F5F]">Performance:</span>
                        <span className="font-medium text-[#2C2C2C]">{entry.performance_rating}/5</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#5F5F5F]">Stress:</span>
                        <span className="font-medium text-[#2C2C2C]">{entry.stress_level}/5</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}