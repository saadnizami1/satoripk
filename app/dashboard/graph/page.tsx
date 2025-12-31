'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import { TrendingUp, Calendar, ArrowLeft, Flame, Award, BookOpen, Smile, Frown, Meh, Laugh, CircleAlert } from 'lucide-react'
import { useRouter } from 'next/navigation'

const moodIcons = {
  5: Laugh,
  4: Smile,
  3: Meh,
  2: Frown,
  1: CircleAlert,
}

export default function MoodGraphPage() {
  const router = useRouter()
  const [moods, setMoods] = useState<any[]>([])
  const [timeRange, setTimeRange] = useState<'7' | '30' | '90'>('30')
  const [stats, setStats] = useState({
    average: 0,
    highest: 0,
    lowest: 0,
    total: 0,
    streak: 0,
    weeklyAverage: 0,
    academicStressCount: 0
  })

  useEffect(() => {
    fetchMoods()
  }, [timeRange])

  const fetchMoods = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const daysAgo = new Date()
      daysAgo.setDate(daysAgo.getDate() - parseInt(timeRange))

      const { data } = await supabase
        .from('moods')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', daysAgo.toISOString())
        .order('created_at', { ascending: true })
      
      if (data && data.length > 0) {
        setMoods(data)
        
        const moodValues = data.map(m => m.mood_level)
        const academicStressCount = data.filter(m => m.note === 'yes' || m.note === 'partially').length
        
        // Calculate streak
        const today = new Date()
        let streak = 0
        for (let i = 0; i < 90; i++) {
          const checkDate = new Date(today)
          checkDate.setDate(checkDate.getDate() - i)
          const dateStr = checkDate.toISOString().split('T')[0]
          
          const hasMood = data.some(m => m.created_at.startsWith(dateStr))
          if (hasMood) {
            streak++
          } else {
            break
          }
        }

        // Calculate weekly average
        const oneWeekAgo = new Date()
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
        const weekMoods = data.filter(m => new Date(m.created_at) >= oneWeekAgo)
        const weeklyAvg = weekMoods.length > 0 
          ? weekMoods.reduce((a, b) => a + b.mood_level, 0) / weekMoods.length 
          : 0

        setStats({
          average: parseFloat((moodValues.reduce((a, b) => a + b, 0) / moodValues.length).toFixed(1)),
          highest: Math.max(...moodValues),
          lowest: Math.min(...moodValues),
          total: data.length,
          streak,
          weeklyAverage: parseFloat(weeklyAvg.toFixed(1)),
          academicStressCount
        })
      } else {
        setMoods([])
        setStats({ average: 0, highest: 0, lowest: 0, total: 0, streak: 0, weeklyAverage: 0, academicStressCount: 0 })
      }
    }
  }

  const getMoodColor = (level: number) => {
    const colors = {
      5: '#4A6C6F',
      4: '#6B6B6B',
      3: '#A8A8A8',
      2: '#D2691E',
      1: '#1F1F1F'
    }
    return colors[level as keyof typeof colors] || '#A8A8A8'
  }

  const graphHeight = 300

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <button
          onClick={() => router.push('/dashboard/mood')}
          className="flex items-center gap-2 text-[#5F5F5F] hover:text-[#2C2C2C] mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Mood Tracker</span>
        </button>
        
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#4A6C6F]/20 to-[#4A6C6F]/10 backdrop-blur-xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-[#4A6C6F]" />
          </div>
          <div>
            <h1 className="text-4xl font-serif font-medium text-[#2C2C2C]">
              Mood Graph
            </h1>
            <p className="text-[#5F5F5F]">Visualize your emotional journey</p>
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
          { value: '7', label: '7 days' },
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
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
      >
        {[
          { label: 'Current Streak', value: `${stats.streak} days`, icon: Flame, color: '#D2691E' },
          { label: 'Weekly Average', value: stats.weeklyAverage.toFixed(1), icon: Award, color: '#4A6C6F' },
          { label: 'Total Entries', value: stats.total, icon: Calendar, color: '#6B6B6B' },
          { label: 'Academic Stress', value: `${stats.academicStressCount}/${stats.total}`, icon: BookOpen, color: '#A8A8A8' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + index * 0.05 }}
            className="backdrop-blur-[40px] bg-white/40 border border-white/60 rounded-2xl p-6 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-2">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${stat.color}20` }}
              >
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
            </div>
            <p className="text-3xl font-bold text-[#2C2C2C] mb-1">{stat.value}</p>
            <p className="text-sm text-[#5F5F5F]">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Graph */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="backdrop-blur-[40px] bg-white/40 border border-white/60 rounded-[2rem] p-8 shadow-2xl mb-6"
      >
        <h2 className="text-2xl font-serif font-semibold text-[#2C2C2C] mb-6">
          Mood Timeline
        </h2>

        {moods.length === 0 ? (
          <div className="text-center py-20">
            <TrendingUp className="w-16 h-16 text-[#5F5F5F] mx-auto mb-4 opacity-50" />
            <p className="text-[#5F5F5F]">No mood data for this period</p>
            <p className="text-sm text-[#5F5F5F]">Start logging your moods to see trends!</p>
          </div>
        ) : (
          <div className="relative" style={{ height: `${graphHeight + 60}px` }}>
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 bottom-12 w-16 flex flex-col justify-between">
              {[5, 4, 3, 2, 1].map(level => {
                const Icon = moodIcons[level as keyof typeof moodIcons]
                return (
                  <div key={level} className="flex items-center justify-end pr-3">
                    <Icon className="w-5 h-5 text-[#5F5F5F]" />
                  </div>
                )
              })}
            </div>

            {/* Graph area */}
            <div className="absolute left-16 right-0 top-0 bottom-12">
              {/* Grid lines */}
              {[0, 1, 2, 3, 4].map(i => (
                <div
                  key={i}
                  className="absolute left-0 right-0 border-t border-white/40"
                  style={{ top: `${(i / 4) * 100}%` }}
                />
              ))}

              {/* Line and points */}
              <svg className="absolute inset-0 w-full h-full overflow-visible">
                {/* Area fill */}
                <defs>
                  <linearGradient id="moodGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#D2691E" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#D2691E" stopOpacity="0.05" />
                  </linearGradient>
                </defs>

                {moods.length > 1 && (
                  <>
                    {/* Area */}
                    <path
                      d={`
                        M ${0} ${graphHeight - ((moods[0].mood_level - 1) / 4) * graphHeight}
                        ${moods.map((mood, i) => {
                          const x = (i / (moods.length - 1)) * 100
                          const y = graphHeight - ((mood.mood_level - 1) / 4) * graphHeight
                          return `L ${x}% ${y}`
                        }).join(' ')}
                        L ${100}% ${graphHeight}
                        L ${0} ${graphHeight}
                        Z
                      `}
                      fill="url(#moodGradient)"
                    />

                    {/* Line */}
                    <path
                      d={`
                        M ${0} ${graphHeight - ((moods[0].mood_level - 1) / 4) * graphHeight}
                        ${moods.map((mood, i) => {
                          const x = (i / (moods.length - 1)) * 100
                          const y = graphHeight - ((mood.mood_level - 1) / 4) * graphHeight
                          return `L ${x}% ${y}`
                        }).join(' ')}
                      `}
                      fill="none"
                      stroke="#D2691E"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </>
                )}

                {/* Points */}
                {moods.map((mood, i) => {
                  const x = moods.length === 1 ? 50 : (i / (moods.length - 1)) * 100
                  const y = graphHeight - ((mood.mood_level - 1) / 4) * graphHeight
                  const color = getMoodColor(mood.mood_level)
                  const Icon = moodIcons[mood.mood_level as keyof typeof moodIcons]
                  
                  return (
                    <g key={mood.id}>
                      <circle
                        cx={`${x}%`}
                        cy={y}
                        r="10"
                        fill="white"
                        stroke={color}
                        strokeWidth="3"
                        className="transition-all duration-300"
                      />
                    </g>
                  )
                })}
              </svg>

              {/* X-axis dates */}
              <div className="absolute -bottom-10 left-0 right-0 flex justify-between text-xs text-[#5F5F5F]">
                {moods.length > 0 && (
                  <>
                    <span>
                      {new Date(moods[0].created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    {moods.length > 2 && (
                      <span>
                        {new Date(moods[Math.floor(moods.length / 2)].created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                    {moods.length > 1 && (
                      <span>
                        {new Date(moods[moods.length - 1].created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="backdrop-blur-[40px] bg-white/40 border border-white/60 rounded-[2rem] p-8 shadow-2xl"
      >
        <h2 className="text-2xl font-serif font-semibold text-[#2C2C2C] mb-4">
          Insights
        </h2>
        
        <div className="space-y-3 text-[#2C2C2C]">
          {stats.streak >= 7 && (
            <p className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-[#D2691E]" />
              <span>Amazing! You have a {stats.streak}-day logging streak! Keep it up!</span>
            </p>
          )}
          
          {stats.average >= 4 && (
            <p className="flex items-center gap-2">
              <Smile className="w-5 h-5 text-[#4A6C6F]" />
              <span>Your average mood is {stats.average}/5 - You're doing great!</span>
            </p>
          )}
          
          {stats.academicStressCount > stats.total / 2 && (
            <p className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#D2691E]" />
              <span>Academic stress is affecting {Math.round((stats.academicStressCount / stats.total) * 100)}% of your moods. Consider using our breathing exercises or talking to Kokoro.</span>
            </p>
          )}

          {stats.weeklyAverage < stats.average && stats.total > 7 && (
            <p className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#D2691E]" />
              <span>Your mood has been trending down this week. Consider journaling or seeking support.</span>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  )
}