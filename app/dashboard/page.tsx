'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import { DraggableCard } from '@/components/DraggableCard'
import { 
  MessageCircle, Heart, BookOpen, Timer, Wind, TrendingUp, 
  Phone, Calendar, Sparkles, BarChart3, Brain, CheckCircle2
} from 'lucide-react'

export default function DashboardHome() {
  const [profile, setProfile] = useState<any>(null)
  const [todayMood, setTodayMood] = useState<any>(null)
  const [greeting, setGreeting] = useState('')
  const [hasMoodToday, setHasMoodToday] = useState(false)
  const [hasStressToday, setHasStressToday] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        setProfile(profileData)

        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const todayStr = today.toISOString()

        const { data: moodData } = await supabase
          .from('moods')
          .select('*')
          .eq('user_id', user.id)
          .gte('created_at', todayStr)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()
        
        setTodayMood(moodData)
        setHasMoodToday(Boolean(moodData))

        const { data: stressData } = await supabase
          .from('academic_stress')
          .select('id')
          .eq('user_id', user.id)
          .gte('created_at', todayStr)
          .limit(1)

        setHasStressToday(Boolean(stressData && stressData.length > 0))
      }
      setIsLoading(false)
    }

    fetchData()

    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good Morning')
    else if (hour < 18) setGreeting('Good Afternoon')
    else setGreeting('Good Evening')
  }, [])

  const getPromptMessage = () => {
    if (hasMoodToday && hasStressToday) {
      return {
        icon: CheckCircle2,
        text: "Great work! You've logged your data for today. Keep it up!",
        color: "text-[A4B05B]"
      }
    } else if (hasMoodToday && !hasStressToday) {
      return {
        icon: Heart,
        text: "Mood logged! Now please enter your academic stress data.",
        color: "text-[#282C29]"
      }
    } else if (!hasMoodToday && hasStressToday) {
      return {
        icon: Brain,
        text: "Stress logged! Now please enter your mood tracker data.",
        color: "text-[#4A6C6F]"
      }
    } else {
      return {
        icon: Sparkles,
        text: "Please enter your mood and academic stress data for today.",
        color: "text-[#282C29]"
      }
    }
  }

  const shouldCardGlow = (cardId: string) => {
    if (isLoading) return false
    if (cardId === 'mood' && !hasMoodToday) return true
    if (cardId === 'stress' && !hasStressToday) return true
    return false
  }

  // CHANGE 3: X coordinates shifted left by ~30px (0.75cm)
  const cards = [
    {
      id: 'kokoro',
      icon: MessageCircle,
      title: 'Talk to Kokoro',
      description: 'Your AI companion is here to listen',
      href: '/dashboard/kokoro',
      color: '#6B6B6B',
      size: 'large' as const,
      initialPosition: { x: 65, y: 200 } // Was 100
    },
    {
      id: 'mood',
      icon: Heart,
      title: 'Mood Tracker',
      description: 'Emotional Check-In',
      href: '/dashboard/mood',
      color: '#D2691E',
      size: 'medium' as const,
      initialPosition: { x: 490, y: 150 } // Was 520
    },
    {
      id: 'journal',
      icon: BookOpen,
      title: 'Journal',
      description: 'Write down your thoughts',
      href: '/dashboard/journal',
      color: '#4A6C6F',
      size: 'medium' as const,
      initialPosition: { x: 870, y: 180 } // Was 900
    },
    {
      id: 'pomodoro',
      icon: Timer,
      title: 'Pomodoro Timer',
      description: 'Stay productive with Pomodoro',
      href: '/dashboard/pomodoro',
      color: '#A8A8A8',
      size: 'small' as const,
      initialPosition: { x: 120, y: 500 } // Was 150
    },
    {
      id: 'breathing',
      icon: Wind,
      title: 'Breathing',
      description: 'Calm your mind',
      href: '/dashboard/breathing',
      color: '#1F1F1F',
      size: 'medium' as const,
      initialPosition: { x: 450, y: 480 } // Was 480
    },
    {
      id: 'mood-graph',
      icon: TrendingUp,
      title: 'Mood Graph',
      description: 'Visualize your journey',
      href: '/dashboard/graph',
      color: '#6B6B6B',
      size: 'large' as const,
      initialPosition: { x: 799, y: 475 } // Was 850
    },
    {
      id: 'stress',
      icon: Brain,
      title: 'Academic Stress',
      description: 'Track your performance',
      href: '/dashboard/research',
      color: '#6B6B6B',
      size: 'medium' as const,
      initialPosition: { x: 170, y: 800 } // Was 200
    },
    {
      id: 'stress-stats',
      icon: BarChart3,
      title: 'Stress Stats',
      description: 'Academic stress insights',
      href: '/dashboard/research/insights',
      color: '#D2691E',
      size: 'medium' as const,
      initialPosition: { x: 520, y: 850 } // Was 550
    },
    {
      id: 'help',
      icon: Phone,
      title: 'Get Help',
      description: 'Emergency support services',
      href: '/dashboard/helpline',
      color: '#4A6C6F',
      size: 'small' as const,
      initialPosition: { x: 870, y: 800 } // Was 900
    },
  ]

  const promptMessage = getPromptMessage()
  const PromptIcon = promptMessage.icon

  return (
    <div className="min-h-screen pb-12 sm:pb-20">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="mb-6 sm:mb-8 md:mb-12 relative"
      >
        <div className="backdrop-blur-[40px] bg-white/40 border border-white/60 rounded-xl sm:rounded-2xl md:rounded-[2rem] p-4 sm:p-6 md:p-8 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="inline-flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3"
              >
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-[#D2691E]" />
                <span className="text-xs sm:text-sm font-medium text-[#5F5F5F]">悟り</span>
              </motion.div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-medium text-[#2C2C2C] mb-1.5 sm:mb-2 leading-tight">
                {greeting},<br/>{profile?.name || 'Friend'}
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-[#5F5F5F]">
                Hey, how's your mind holding up?
              </p>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 text-[#5F5F5F] backdrop-blur-xl bg-white/30 px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg sm:rounded-xl shrink-0">
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
              <span className="text-xs sm:text-sm font-medium whitespace-nowrap">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>

          {todayMood && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-3 sm:mt-4 md:mt-6 p-3 sm:p-4 md:p-5 bg-gradient-to-r from-white/50 to-white/30 rounded-lg sm:rounded-xl md:rounded-2xl border border-white/60 backdrop-blur-xl"
            >
              <p className="text-xs sm:text-sm text-[#5F5F5F] mb-1 font-medium">Today's Mood</p>
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-[#D2691E] shrink-0" />
                <span className="text-sm sm:text-base md:text-lg text-[#2C2C2C] font-semibold">
                  {todayMood.mood_level}/5
                </span>
                {todayMood.note && (
                  <>
                    <span className="text-[#5F5F5F] hidden sm:inline">·</span>
                    <span className="text-xs sm:text-sm md:text-base text-[#5F5F5F] truncate flex-1 min-w-0">{todayMood.note}</span>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mb-6 sm:mb-8 text-center"
      >
        <div className={`inline-flex items-center gap-1.5 sm:gap-2 backdrop-blur-xl ${
          hasMoodToday && hasStressToday ? 'bg-green-50/50 border-green-300/60' : 'bg-white/30 border-white/50'
        } px-3 py-2 sm:px-4 sm:py-2.5 md:px-6 md:py-3 rounded-full border shadow-xl max-w-full`}>
          <PromptIcon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 ${promptMessage.color} shrink-0`} />
          <p className={`text-xs sm:text-sm font-medium ${promptMessage.color} text-left sm:text-center`}>
            {promptMessage.text}
          </p>
        </div>
      </motion.div>

      {/* Mobile Grid View */}
      <div className="md:hidden grid grid-cols-2 gap-3 pb-20">
        {cards.map((card, index) => (
          <DraggableCard
            key={`mobile-${card.title}`}
            {...card}
            shouldGlow={shouldCardGlow(card.id)}
            isMobile={true}
          />
        ))}
      </div>

      {/* Desktop Draggable View */}
      <div className="hidden md:block relative" style={{ height: '1200px' }}>
        {cards.map((card, index) => (
          <motion.div
            key={`desktop-${card.title}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 * index, type: 'spring' }}
          >
            <DraggableCard
              {...card}
              shouldGlow={shouldCardGlow(card.id)}
              isMobile={false}
            />
          </motion.div>
        ))}
      </div>
    </div>
  )
}