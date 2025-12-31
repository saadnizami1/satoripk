'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, TrendingUp, Calendar, Sparkles, Frown, Meh, Smile, Laugh, CircleAlert, Clock } from 'lucide-react'
import { useRouter } from 'next/navigation'

const moodLevels = [
  { value: 5, label: 'Amazing', icon: Laugh, color: '#4A6C6F' },
  { value: 4, label: 'Good', icon: Smile, color: '#6B6B6B' },
  { value: 3, label: 'Okay', icon: Meh, color: '#A8A8A8' },
  { value: 2, label: 'Not Great', icon: Frown, color: '#D2691E' },
  { value: 1, label: 'Terrible', icon: CircleAlert, color: '#1F1F1F' },
]

const stressOptions = [
  { value: 'yes', label: 'Yes', color: '#D2691E' },
  { value: 'no', label: 'No', color: '#4A6C6F' },
  { value: 'partially', label: 'Partially', color: '#6B6B6B' },
  { value: 'idk', label: "I don't know", color: '#A8A8A8' },
]

export default function MoodTrackerPage() {
  const router = useRouter()
  const [selectedMood, setSelectedMood] = useState<number | null>(null)
  const [academicStress, setAcademicStress] = useState<string | null>(null)
  const [recentMoods, setRecentMoods] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [alreadyLogged, setAlreadyLogged] = useState(false)
  const [todayMood, setTodayMood] = useState<any>(null)

  useEffect(() => {
    checkTodayMood()
    fetchRecentMoods()
  }, [])

  const checkTodayMood = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const today = new Date().toISOString().split('T')[0]
      const { data } = await supabase
        .from('moods')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', today)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      
      if (data) {
        setAlreadyLogged(true)
        setTodayMood(data)
      }
    }
  }

  const fetchRecentMoods = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const { data } = await supabase
        .from('moods')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(7)
      
      setRecentMoods(data || [])
    }
  }

  const handleSubmit = async () => {
    if (!selectedMood || alreadyLogged) return

    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const { error } = await supabase
        .from('moods')
        .insert({
          user_id: user.id,
          mood_level: selectedMood,
          note: academicStress || null,
        })

      if (!error) {
        setSuccess(true)
        setAlreadyLogged(true)
        setSelectedMood(null)
        setAcademicStress(null)
        checkTodayMood()
        fetchRecentMoods()
        
        setTimeout(() => setSuccess(false), 3000)
      }
    }
    
    setLoading(false)
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D2691E]/20 to-[#D2691E]/10 backdrop-blur-xl flex items-center justify-center">
            <Heart className="w-6 h-6 text-[#D2691E]" />
          </div>
          <div>
            <h1 className="text-4xl font-serif font-medium text-[#2C2C2C]">
              Mood Tracker
            </h1>
            <p className="text-[#5F5F5F]">How are you feeling today?</p>
          </div>
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
            <span className="text-[#2C2C2C] font-medium">Mood logged successfully! 🎉</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Already Logged Message */}
      {alreadyLogged && todayMood && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-6 backdrop-blur-[40px] bg-white/60 border border-white/60 rounded-2xl"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#4A6C6F]/20 flex items-center justify-center flex-shrink-0">
              <Clock className="w-6 h-6 text-[#4A6C6F]" />
            </div>
            <div>
              <h3 className="font-semibold text-[#2C2C2C] mb-1">You've already logged your mood today!</h3>
              <p className="text-sm text-[#5F5F5F] mb-3">
                You logged a <span className="font-medium">{moodLevels.find(m => m.value === todayMood.mood_level)?.label}</span> mood at {new Date(todayMood.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="text-xs text-[#5F5F5F]">Come back tomorrow to track your mood again!</p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Log Mood Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className={`backdrop-blur-[40px] bg-white/40 border border-white/60 rounded-[2rem] p-8 shadow-2xl ${alreadyLogged ? 'opacity-50 pointer-events-none' : ''}`}>
            <h2 className="text-2xl font-serif font-semibold text-[#2C2C2C] mb-6">
              Log Your Mood
            </h2>

            {/* Mood Selection */}
            <div className="space-y-3 mb-6">
              {moodLevels.map((mood) => {
                const Icon = mood.icon
                return (
                  <motion.button
                    key={mood.value}
                    whileHover={{ scale: alreadyLogged ? 1 : 1.02 }}
                    whileTap={{ scale: alreadyLogged ? 1 : 0.98 }}
                    onClick={() => !alreadyLogged && setSelectedMood(mood.value)}
                    disabled={alreadyLogged}
                    className={`w-full p-5 rounded-2xl transition-all duration-300 flex items-center gap-4 ${
                      selectedMood === mood.value
                        ? 'bg-white/80 border-2 shadow-xl'
                        : 'bg-white/20 border-2 border-transparent hover:bg-white/40'
                    }`}
                    style={{
                      borderColor: selectedMood === mood.value ? mood.color : 'transparent'
                    }}
                  >
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{
                        backgroundColor: selectedMood === mood.value ? `${mood.color}20` : 'transparent'
                      }}
                    >
                      <Icon 
                        className="w-6 h-6" 
                        style={{ color: selectedMood === mood.value ? mood.color : '#5F5F5F' }}
                      />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-[#2C2C2C]">{mood.label}</p>
                      <p className="text-sm text-[#5F5F5F]">Level {mood.value}/5</p>
                    </div>
                    {selectedMood === mood.value && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: mood.color }}
                      >
                        <span className="text-white text-sm">✓</span>
                      </motion.div>
                    )}
                  </motion.button>
                )
              })}
            </div>

            {/* Academic Stress Question */}
            <AnimatePresence>
              {selectedMood !== null && !alreadyLogged && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6"
                >
                  <label className="block text-sm font-medium text-[#2C2C2C] mb-3">
                    Is it because of academic stress?
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {stressOptions.map((option) => (
                      <motion.button
                        key={option.value}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setAcademicStress(option.value)}
                        className={`p-4 rounded-2xl transition-all duration-300 font-medium ${
                          academicStress === option.value
                            ? 'bg-white/80 border-2 shadow-lg text-[#2C2C2C]'
                            : 'bg-white/30 border-2 border-transparent text-[#5F5F5F] hover:bg-white/50'
                        }`}
                        style={{
                          borderColor: academicStress === option.value ? option.color : 'transparent'
                        }}
                      >
                        {option.label}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: alreadyLogged ? 1 : 1.02 }}
              whileTap={{ scale: alreadyLogged ? 1 : 0.98 }}
              onClick={handleSubmit}
              disabled={!selectedMood || loading || alreadyLogged}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#D2691E] to-[#D2691E]/80 text-white font-semibold shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {alreadyLogged ? 'Already Logged Today' : loading ? 'Logging...' : 'Log Mood'}
            </motion.button>

            {/* View Graph Link */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/dashboard/graph')}
              className="w-full mt-3 py-4 rounded-2xl backdrop-blur-xl bg-white/40 border border-white/60 text-[#2C2C2C] font-semibold flex items-center justify-center gap-2 hover:bg-white/60 transition-all duration-300"
            >
              <TrendingUp className="w-5 h-5" />
              View Mood Graph
            </motion.button>
          </div>
        </motion.div>

        {/* Recent Moods Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="backdrop-blur-[40px] bg-white/40 border border-white/60 rounded-[2rem] p-8 shadow-2xl">
            <h2 className="text-2xl font-serif font-semibold text-[#2C2C2C] mb-6 flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              Recent Moods
            </h2>

            {recentMoods.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="w-16 h-16 text-[#5F5F5F] mx-auto mb-4 opacity-50" />
                <p className="text-[#5F5F5F]">No moods logged yet</p>
                <p className="text-sm text-[#5F5F5F]">Start tracking your emotional wellness!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentMoods.map((mood, index) => {
                  const moodData = moodLevels.find(m => m.value === mood.mood_level)
                  const MoodIcon = moodData?.icon || Meh
                  const stressLabel = stressOptions.find(s => s.value === mood.note)?.label
                  
                  return (
                    <motion.div
                      key={mood.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-5 rounded-2xl bg-white/50 backdrop-blur-xl border border-white/60"
                    >
                      <div className="flex items-start gap-4">
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${moodData?.color}20` }}
                        >
                          <MoodIcon className="w-6 h-6" style={{ color: moodData?.color }} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-[#2C2C2C]">{moodData?.label}</p>
                            <span className="text-xs text-[#5F5F5F]">
                              {new Date(mood.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          {stressLabel && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-[#5F5F5F]">Academic stress:</span>
                              <span className="text-xs font-medium text-[#2C2C2C] bg-white/60 px-2 py-1 rounded-lg">
                                {stressLabel}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}