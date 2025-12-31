'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  ArrowLeft, 
  Brain, 
  CircleAlert, 
  BookOpen, 
  Heart, 
  Users,
  Calendar,
  Award,
  Flame,
  Target,
  CheckCircle,
  XCircle,
  HelpCircle
} from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function StressInsightsPage() {
  const router = useRouter()
  const [entries, setEntries] = useState<any[]>([])
  const [timeRange, setTimeRange] = useState<'30' | '90'>('30')
  const [stats, setStats] = useState({
    avgPerformance: 0,
    avgStress: 0,
    totalEntries: 0,
    streak: 0,
    selfStudyCount: 0,
    moodImpactCount: 0,
    lifeImpactCount: 0,
    highStressDays: 0,
    lowPerformanceDays: 0
  })

  useEffect(() => {
    fetchEntries()
  }, [timeRange])

  const fetchEntries = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const daysAgo = new Date()
      daysAgo.setDate(daysAgo.getDate() - parseInt(timeRange))

      const { data } = await supabase
        .from('academic_stress')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', daysAgo.toISOString())
        .order('created_at', { ascending: false })
      
      if (data && data.length > 0) {
        setEntries(data)
        calculateStats(data)
      } else {
        setEntries([])
        setStats({
          avgPerformance: 0,
          avgStress: 0,
          totalEntries: 0,
          streak: 0,
          selfStudyCount: 0,
          moodImpactCount: 0,
          lifeImpactCount: 0,
          highStressDays: 0,
          lowPerformanceDays: 0
        })
      }
    }
  }

  const calculateStats = (data: any[]) => {
    const performanceValues = data.map(e => e.performance_rating)
    const stressValues = data.map(e => e.stress_level)
    
    // Parse notes JSON
    let selfStudyCount = 0
    let moodImpactCount = 0
    let lifeImpactCount = 0
    
    data.forEach(entry => {
      try {
        const notes = JSON.parse(entry.notes)
        if (notes.selfStudy === 'yes') selfStudyCount++
        if (notes.moodImpact === 'yes') moodImpactCount++
        if (notes.lifeImpact === 'yes') lifeImpactCount++
      } catch (e) {}
    })

    // Calculate streak
    const today = new Date()
    let streak = 0
    for (let i = 0; i < 90; i++) {
      const checkDate = new Date(today)
      checkDate.setDate(checkDate.getDate() - i)
      const dateStr = checkDate.toISOString().split('T')[0]
      
      const hasEntry = data.some(e => e.created_at.startsWith(dateStr))
      if (hasEntry) {
        streak++
      } else {
        break
      }
    }

    setStats({
      avgPerformance: parseFloat((performanceValues.reduce((a, b) => a + b, 0) / performanceValues.length).toFixed(1)),
      avgStress: parseFloat((stressValues.reduce((a, b) => a + b, 0) / stressValues.length).toFixed(1)),
      totalEntries: data.length,
      streak,
      selfStudyCount,
      moodImpactCount,
      lifeImpactCount,
      highStressDays: stressValues.filter(s => s >= 4).length,
      lowPerformanceDays: performanceValues.filter(p => p <= 2).length
    })
  }

  const getPerformanceLabel = (value: number) => {
    const labels = { 5: 'Excellent', 4: 'Good', 3: 'Average', 2: 'Below Average', 1: 'Poor' }
    return labels[value as keyof typeof labels] || 'N/A'
  }

  const getPerformanceColor = (value: number) => {
    if (value >= 4) return '#4A6C6F'
    if (value === 3) return '#A8A8A8'
    return '#D2691E'
  }

  const getStressLabel = (value: number) => {
    const labels = { 5: 'Extremely Stressed', 4: 'Very Stressed', 3: 'Moderately Stressed', 2: 'Slightly Stressed', 1: 'Not Stressed' }
    return labels[value as keyof typeof labels] || 'N/A'
  }

  const getStressColor = (value: number) => {
    if (value >= 4) return '#1F1F1F'
    if (value === 3) return '#A8A8A8'
    return '#4A6C6F'
  }

  const getSelfStudyLabel = (value: string) => {
    const labels = { yes: 'Yes', no: 'No', planning: 'Planning to' }
    return labels[value as keyof typeof labels] || 'N/A'
  }

  const getImpactLabel = (value: string) => {
    const labels = { yes: 'Yes', no: 'No', somewhat: 'Somewhat' }
    return labels[value as keyof typeof labels] || 'N/A'
  }

  const getImpactIcon = (value: string) => {
    if (value === 'yes') return CheckCircle
    if (value === 'no') return XCircle
    return HelpCircle
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <button
          onClick={() => router.push('/dashboard/research')}
          className="flex items-center gap-2 text-[#5F5F5F] hover:text-[#2C2C2C] mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Academic Stress Tracker</span>
        </button>
        
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D2691E]/20 to-[#D2691E]/10 backdrop-blur-xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-[#D2691E]" />
          </div>
          <div>
            <h1 className="text-4xl font-serif font-medium text-[#2C2C2C]">
              Stress Statistics
            </h1>
            <p className="text-[#5F5F5F]">Academic performance and stress insights</p>
          </div>
        </div>
      </motion.div>

      {/* Time Range Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6 flex gap-3"
      >
        {[
          { value: '30', label: '30 days' },
          { value: '90', label: '3 months' }
        ].map((range) => (
          <button
            key={range.value}
            onClick={() => setTimeRange(range.value as any)}
            className={`px-6 py-3 rounded-2xl font-medium transition-all duration-300 ${
              timeRange === range.value
                ? 'bg-white/80 border-2 border-[#D2691E] text-[#2C2C2C] shadow-xl'
                : 'backdrop-blur-xl bg-white/40 border-2 border-white/60 text-[#5F5F5F] hover:bg-white/60'
            }`}
          >
            {range.label}
          </button>
        ))}
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8"
      >
        {[
          { label: 'Avg Performance', value: stats.avgPerformance.toFixed(1), icon: Brain, color: '#4A6C6F', subtext: 'out of 5' },
          { label: 'Avg Stress', value: stats.avgStress.toFixed(1), icon: CircleAlert, color: '#D2691E', subtext: 'out of 5' },
          { label: 'Current Streak', value: `${stats.streak}`, icon: Flame, color: '#D2691E', subtext: 'days' },
          { label: 'Total Entries', value: stats.totalEntries, icon: Calendar, color: '#6B6B6B', subtext: 'logged' },
          { label: 'Self Study Days', value: `${stats.selfStudyCount}`, icon: BookOpen, color: '#A8A8A8', subtext: `of ${stats.totalEntries}` },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + index * 0.05 }}
            className="backdrop-blur-[40px] bg-white/40 border border-white/60 rounded-2xl p-5 shadow-xl"
          >
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
              style={{ backgroundColor: `${stat.color}20` }}
            >
              <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
            </div>
            <p className="text-3xl font-bold text-[#2C2C2C] mb-1">{stat.value}</p>
            <p className="text-xs text-[#5F5F5F] mb-1">{stat.label}</p>
            <p className="text-xs text-[#5F5F5F] opacity-70">{stat.subtext}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Impact Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
      >
        {[
          { 
            label: 'Mood Impact', 
            count: stats.moodImpactCount, 
            total: stats.totalEntries,
            icon: Heart, 
            color: '#D2691E',
            description: 'Days when academics affected mood'
          },
          { 
            label: 'Life Impact', 
            count: stats.lifeImpactCount, 
            total: stats.totalEntries,
            icon: Users, 
            color: '#4A6C6F',
            description: 'Days when academics affected daily activities'
          },
          { 
            label: 'High Stress Days', 
            count: stats.highStressDays, 
            total: stats.totalEntries,
            icon: Target, 
            color: '#1F1F1F',
            description: 'Days with stress level 4 or 5'
          },
        ].map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            className="backdrop-blur-[40px] bg-white/40 border border-white/60 rounded-2xl p-6 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-3">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${item.color}20` }}
              >
                <item.icon className="w-6 h-6" style={{ color: item.color }} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-[#2C2C2C]">{item.label}</h3>
                <p className="text-2xl font-bold text-[#2C2C2C]">
                  {item.count}/{item.total}
                  <span className="text-sm font-normal text-[#5F5F5F] ml-2">
                    ({item.total > 0 ? Math.round((item.count / item.total) * 100) : 0}%)
                  </span>
                </p>
              </div>
            </div>
            <p className="text-sm text-[#5F5F5F]">{item.description}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Log History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-serif font-semibold text-[#2C2C2C] mb-6 flex items-center gap-2">
          <Calendar className="w-6 h-6" />
          Log History
        </h2>

        {entries.length === 0 ? (
          <div className="backdrop-blur-[40px] bg-white/40 border border-white/60 rounded-[2rem] p-20 shadow-2xl text-center">
            <TrendingUp className="w-16 h-16 text-[#5F5F5F] mx-auto mb-4 opacity-50" />
            <p className="text-[#5F5F5F]">No data for this period</p>
            <p className="text-sm text-[#5F5F5F]">Start logging to see your history!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry, index) => {
              let responses = { selfStudy: null, moodImpact: null, lifeImpact: null, lifeImpactExample: null }
              try {
                responses = JSON.parse(entry.notes)
              } catch (e) {}

              const MoodImpactIcon = getImpactIcon(responses.moodImpact || '')
              const LifeImpactIcon = getImpactIcon(responses.lifeImpact || '')

              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.05 }}
                  className="backdrop-blur-[40px] bg-white/40 border border-white/60 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300"
                >
                  {/* Date Header */}
                  <div className="flex items-center gap-3 mb-5 pb-4 border-b border-white/40">
                    <div className="w-12 h-12 rounded-xl bg-[#D2691E]/20 flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-[#D2691E]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-[#2C2C2C]">
                        {new Date(entry.created_at).toLocaleDateString('en-US', { 
                          weekday: 'long',
                          month: 'long', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </h3>
                      <p className="text-sm text-[#5F5F5F]">
                        {new Date(entry.created_at).toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Responses Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Academic Performance */}
                    <div className="p-4 rounded-xl bg-white/50 border border-white/40">
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="w-5 h-5 text-[#4A6C6F]" />
                        <span className="text-sm font-medium text-[#5F5F5F]">Academic Performance</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: getPerformanceColor(entry.performance_rating) }}
                        />
                        <p className="text-lg font-semibold text-[#2C2C2C]">
                          {getPerformanceLabel(entry.performance_rating)}
                        </p>
                        <span className="text-sm text-[#5F5F5F]">({entry.performance_rating}/5)</span>
                      </div>
                    </div>

                    {/* Stress Level */}
                    <div className="p-4 rounded-xl bg-white/50 border border-white/40">
                      <div className="flex items-center gap-2 mb-2">
                        <CircleAlert className="w-5 h-5 text-[#D2691E]" />
                        <span className="text-sm font-medium text-[#5F5F5F]">Stress Level</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: getStressColor(entry.stress_level) }}
                        />
                        <p className="text-lg font-semibold text-[#2C2C2C]">
                          {getStressLabel(entry.stress_level)}
                        </p>
                        <span className="text-sm text-[#5F5F5F]">({entry.stress_level}/5)</span>
                      </div>
                    </div>

                    {/* Self Study */}
                    <div className="p-4 rounded-xl bg-white/50 border border-white/40">
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="w-5 h-5 text-[#6B6B6B]" />
                        <span className="text-sm font-medium text-[#5F5F5F]">Self Study at Home</span>
                      </div>
                      <p className="text-lg font-semibold text-[#2C2C2C]">
                        {getSelfStudyLabel(responses.selfStudy || '')}
                      </p>
                    </div>

                    {/* Mood Impact */}
                    <div className="p-4 rounded-xl bg-white/50 border border-white/40">
                      <div className="flex items-center gap-2 mb-2">
                        <Heart className="w-5 h-5 text-[#D2691E]" />
                        <span className="text-sm font-medium text-[#5F5F5F]">Impact on Mood</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MoodImpactIcon className="w-5 h-5 text-[#2C2C2C]" />
                        <p className="text-lg font-semibold text-[#2C2C2C]">
                          {getImpactLabel(responses.moodImpact || '')}
                        </p>
                      </div>
                    </div>

                    {/* Life Impact */}
                    <div className="p-4 rounded-xl bg-white/50 border border-white/40 lg:col-span-2">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-5 h-5 text-[#4A6C6F]" />
                        <span className="text-sm font-medium text-[#5F5F5F]">Impact on Day-to-Day Life</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <LifeImpactIcon className="w-5 h-5 text-[#2C2C2C]" />
                        <p className="text-lg font-semibold text-[#2C2C2C]">
                          {getImpactLabel(responses.lifeImpact || '')}
                        </p>
                      </div>
                      {responses.lifeImpactExample && (
                        <p className="mt-2 text-sm text-[#5F5F5F] italic pl-7">
                          "{responses.lifeImpactExample}"
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </motion.div>

      {/* Insights */}
      {entries.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="backdrop-blur-[40px] bg-white/40 border border-white/60 rounded-[2rem] p-8 shadow-2xl"
        >
          <h2 className="text-2xl font-serif font-semibold text-[#2C2C2C] mb-4 flex items-center gap-2">
            <Award className="w-6 h-6 text-[#D2691E]" />
            Key Insights
          </h2>
          
          <div className="space-y-3 text-[#2C2C2C]">
            {stats.streak >= 7 && (
              <p className="flex items-start gap-2">
                <Flame className="w-5 h-5 text-[#D2691E] mt-0.5 flex-shrink-0" />
                <span>Excellent! You have a {stats.streak}-day tracking streak. Consistency is key to understanding your patterns!</span>
              </p>
            )}
            
            {stats.avgPerformance >= 4 && (
              <p className="flex items-start gap-2">
                <Brain className="w-5 h-5 text-[#4A6C6F] mt-0.5 flex-shrink-0" />
                <span>Your average academic performance is {stats.avgPerformance}/5 - You're performing well!</span>
              </p>
            )}
            
            {stats.avgStress >= 4 && (
              <p className="flex items-start gap-2">
                <CircleAlert className="w-5 h-5 text-[#D2691E] mt-0.5 flex-shrink-0" />
                <span>Your average stress level is {stats.avgStress}/5. Consider using breathing exercises or talking to Kokoro for support.</span>
              </p>
            )}

            {stats.moodImpactCount > stats.totalEntries / 2 && (
              <p className="flex items-start gap-2">
                <Heart className="w-5 h-5 text-[#D2691E] mt-0.5 flex-shrink-0" />
                <span>Academic stress is affecting your mood {Math.round((stats.moodImpactCount / stats.totalEntries) * 100)}% of the time. Remember to practice self-care!</span>
              </p>
            )}

            {stats.lifeImpactCount > stats.totalEntries / 3 && (
              <p className="flex items-start gap-2">
                <Users className="w-5 h-5 text-[#4A6C6F] mt-0.5 flex-shrink-0" />
                <span>Academics are impacting your daily activities frequently. Try to maintain a healthy balance between studies and personal time.</span>
              </p>
            )}

            {stats.selfStudyCount < stats.totalEntries / 2 && stats.totalEntries > 5 && (
              <p className="flex items-start gap-2">
                <BookOpen className="w-5 h-5 text-[#6B6B6B] mt-0.5 flex-shrink-0" />
                <span>You're self-studying on {Math.round((stats.selfStudyCount / stats.totalEntries) * 100)}% of days. Consider establishing a consistent study routine!</span>
              </p>
            )}
          </div>
        </motion.div>
      )}
    </div>
  )
}