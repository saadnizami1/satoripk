'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send,
  Sparkles,
  Heart,
  Loader2,
  Trash2,
  User,
  Info,
  ArrowLeft,
  MoreVertical,
  X
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface UserContext {
  name: string
  age: number
  gender: string
  education_level: string
  location: string
  religion: string
  family_status: string
  recentMoodAverage?: number
  recentStressLevel?: number
  totalMoods: number
  totalStressLogs: number
}

export default function KokoroPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [userContext, setUserContext] = useState<UserContext | null>(null)
  const [showContext, setShowContext] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    loadUserContext()
    loadOrCreateSession()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadUserContext = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (!profile) return

      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      
      const { data: moods, count: moodCount } = await supabase
        .from('moods')
        .select('mood_level', { count: 'exact' })
        .eq('user_id', user.id)
        .gte('created_at', sevenDaysAgo)

      const { data: stress, count: stressCount } = await supabase
        .from('academic_stress')
        .select('stress_level', { count: 'exact' })
        .eq('user_id', user.id)
        .gte('created_at', sevenDaysAgo)

      const recentMoodAverage = moods && moods.length > 0
        ? moods.reduce((sum, m) => sum + m.mood_level, 0) / moods.length
        : undefined

      const recentStressLevel = stress && stress.length > 0
        ? stress.reduce((sum, s) => sum + s.stress_level, 0) / stress.length
        : undefined

      setUserContext({
        name: profile.name || 'Friend',
        age: profile.age || 0,
        gender: profile.gender || 'not specified',
        education_level: profile.education_level || 'not specified',
        location: profile.location || 'not specified',
        religion: profile.religion || 'not specified',
        family_status: profile.family_status || 'not specified',
        recentMoodAverage,
        recentStressLevel,
        totalMoods: moodCount || 0,
        totalStressLogs: stressCount || 0
      })
    } catch (error) {
      console.error('Error loading user context:', error)
    }
  }

  const loadOrCreateSession = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: sessions } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1)

      if (sessions && sessions.length > 0) {
        const session = sessions[0]
        setSessionId(session.id)
        
        const loadedMessages = (session.messages as any[]).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
        setMessages(loadedMessages)

        if (loadedMessages.length === 0) {
          setTimeout(() => showWelcomeMessage(), 500)
        }
      } else {
        const { data: newSession } = await supabase
          .from('chat_sessions')
          .insert({ user_id: user.id, messages: [] })
          .select()
          .single()

        if (newSession) {
          setSessionId(newSession.id)
          setTimeout(() => showWelcomeMessage(), 500)
        }
      }
    } catch (error) {
      console.error('Error loading session:', error)
    }
  }

  const showWelcomeMessage = () => {
    const greeting = userContext 
      ? `Hello ${userContext.name}! I'm Kokoro, your mental wellness companion. 🌸`
      : "Hello! I'm Kokoro, your mental wellness companion. 🌸"

    const welcomeMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `${greeting}\n\nI'm here to listen, support, and help you navigate your thoughts and feelings. Whether you want to talk about stress, academic pressure, relationships, or just need someone to listen - I'm here for you.\n\nHow are you feeling today?`,
      timestamp: new Date()
    }
    setMessages([welcomeMessage])
  }

  const saveMessages = async (updatedMessages: Message[]) => {
    if (!sessionId) return
    try {
      await supabase
        .from('chat_sessions')
        .update({ 
          messages: updatedMessages,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId)
    } catch (error) {
      console.error('Error saving messages:', error)
    }
  }

  const buildContextPrompt = () => {
    if (!userContext) return ''

    let context = `User Info: ${userContext.name}, ${userContext.age}yo, ${userContext.education_level.replace(/-/g, ' ')} student in ${userContext.location}.`
    
    if (userContext.totalMoods > 0) {
      if (userContext.recentMoodAverage !== undefined) {
        context += ` Recent mood: ${userContext.recentMoodAverage.toFixed(1)}/5.`
      }
      if (userContext.recentStressLevel !== undefined) {
        context += ` Recent stress: ${userContext.recentStressLevel.toFixed(1)}/5.`
      }
    }

    return context
  }

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setIsLoading(true)

    try {
      const contextPrompt = buildContextPrompt()
      
      const systemMessage = {
        role: 'system',
        content: `You are Kokoro (心), a warm and empathetic mental health companion for students in Pakistan.

PERSONALITY:
- Caring, non-judgmental, supportive like a friend
- Culturally sensitive to Pakistani context
- Understanding of academic stress and family pressures
- Natural, conversational tone

KEY GUIDELINES:
- Listen actively and validate feelings
- Provide emotional support and practical coping strategies
- Reference app features: mood tracking, journaling, breathing exercises
- For serious issues (self-harm, suicide, severe depression): show empathy, encourage professional help, provide resources (Emergency 1122, Umang 0311-778-6264)
- Respect religious beliefs and family obligations
- Keep responses concise (2-4 sentences max)

${contextPrompt}

Respond with warmth, empathy, and practical support.`
      }

      const conversationMessages = [
        systemMessage,
        ...messages.slice(-4).map(m => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.content
        })),
        {
          role: 'user',
          content: userMessage.content
        }
      ]

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: conversationMessages
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('API Error:', errorData)
        throw new Error(`API Error ${response.status}`)
      }

      const data = await response.json()

      if (data.choices?.[0]?.message?.content) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.choices[0].message.content.trim(),
          timestamp: new Date()
        }

        const finalMessages = [...updatedMessages, assistantMessage]
        setMessages(finalMessages)
        await saveMessages(finalMessages)
      } else {
        throw new Error('Invalid response structure')
      }
    } catch (error: any) {
      console.error('Error:', error)

      let errorText = "I'm having trouble connecting right now. "
      
      if (error.message.includes('API key') || error.message.includes('401')) {
        errorText = "⚠️ API Error: Please check your Groq API key in .env.local"
      } else if (error.message.includes('429')) {
        errorText += "Rate limit reached. Please wait a moment."
      } else {
        errorText += "Please try again."
      }

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: errorText,
        timestamp: new Date()
      }

      setMessages([...updatedMessages, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearChat = async () => {
    if (!confirm('Are you sure you want to clear this conversation?')) return
    setMessages([])
    setTimeout(() => showWelcomeMessage(), 100)
    if (sessionId) {
      await supabase.from('chat_sessions').update({ messages: [] }).eq('id', sessionId)
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  const getMoodEmoji = (avg?: number) => {
    if (!avg) return '😊'
    if (avg >= 4) return '😊'
    if (avg >= 3) return '😐'
    return '😔'
  }

  const getStressEmoji = (avg?: number) => {
    if (!avg) return '😌'
    if (avg >= 4) return '😰'
    if (avg >= 3) return '😓'
    return '😌'
  }

  // ========== MOBILE GLASSMORPHIC UI (REPLACING WHATSAPP UI) ==========
  if (isMobile) {
    return (
      <div className="fixed inset-0 flex flex-col font-sans">
        {/* Glass Background Layer (sits on top of the MeshGradient from Layout) */}
        <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px] z-0" />

        {/* Header - Glassmorphic */}
        <div className="relative z-20 pt-safe-top">
          <div className="backdrop-blur-xl bg-white/60 border-b border-white/50 px-4 py-3 flex items-center gap-3 shadow-sm">
            <button 
              onClick={() => router.back()} 
              className="p-2 -ml-2 text-[#5F5F5F] hover:bg-white/40 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4A6C6F] to-[#5A7C7F] flex items-center justify-center flex-shrink-0 shadow-md">
              <Heart className="w-5 h-5 text-white" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h1 className="font-serif font-semibold text-lg text-[#2C2C2C]">Kokoro</h1>
              <p className="text-xs text-[#5F5F5F]">Always here for you</p>
            </div>
            
            <button 
              onClick={() => setShowContext(!showContext)}
              className={`p-2 rounded-full transition-all ${
                showContext ? 'bg-white/80 text-[#4A6C6F]' : 'text-[#5F5F5F] hover:bg-white/40'
              }`}
            >
              <Info className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Context Panel - Glass Overlay */}
        <AnimatePresence>
          {showContext && userContext && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="relative z-10 overflow-hidden bg-white/60 backdrop-blur-xl border-b border-white/50"
            >
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-[#4A6C6F]" />
                    <h3 className="font-semibold text-sm text-[#2C2C2C]">Your Context</h3>
                  </div>
                  <button 
                    onClick={() => setShowContext(false)}
                    className="p-1 text-[#5F5F5F]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-white/50 rounded-xl p-2.5 border border-white/50">
                    <p className="text-[#5F5F5F] mb-0.5">Name</p>
                    <p className="font-medium text-[#2C2C2C]">{userContext.name}</p>
                  </div>
                  <div className="bg-white/50 rounded-xl p-2.5 border border-white/50">
                    <p className="text-[#5F5F5F] mb-0.5">Education</p>
                    <p className="font-medium text-[#2C2C2C] capitalize truncate">{userContext.education_level.replace(/-/g, ' ')}</p>
                  </div>
                </div>

                {(userContext.recentMoodAverage !== undefined || userContext.recentStressLevel !== undefined) && (
                  <div className="flex gap-3">
                    {userContext.recentMoodAverage !== undefined && (
                      <div className="flex-1 bg-white/50 rounded-xl p-2.5 border border-white/50 flex items-center gap-2">
                        <span className="text-xl">{getMoodEmoji(userContext.recentMoodAverage)}</span>
                        <div>
                          <p className="text-[10px] text-[#5F5F5F]">Mood</p>
                          <p className="text-xs font-semibold text-[#2C2C2C]">{userContext.recentMoodAverage.toFixed(1)}/5</p>
                        </div>
                      </div>
                    )}
                    {userContext.recentStressLevel !== undefined && (
                      <div className="flex-1 bg-white/50 rounded-xl p-2.5 border border-white/50 flex items-center gap-2">
                        <span className="text-xl">{getStressEmoji(userContext.recentStressLevel)}</span>
                        <div>
                          <p className="text-[10px] text-[#5F5F5F]">Stress</p>
                          <p className="text-xs font-semibold text-[#2C2C2C]">{userContext.recentStressLevel.toFixed(1)}/5</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Messages Area */}
        <div className="relative z-10 flex-1 overflow-y-auto px-4 py-4 space-y-4">
          <AnimatePresence mode="popLayout">
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-[#4A6C6F] to-[#5A7C7F] text-white rounded-tr-sm'
                      : 'bg-white/70 backdrop-blur-md border border-white/60 text-[#2C2C2C] rounded-tl-sm'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex items-center gap-1.5 mb-1.5 opacity-80">
                      <Sparkles className="w-3 h-3 text-[#4A6C6F]" />
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#4A6C6F]">Kokoro</span>
                    </div>
                  )}
                  
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  
                  <p className={`text-[10px] mt-1.5 text-right ${
                    message.role === 'user' ? 'text-white/70' : 'text-[#5F5F5F]'
                  }`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="bg-white/70 backdrop-blur-md border border-white/60 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                <div className="flex items-center gap-1.5 mb-1.5 opacity-80">
                  <Sparkles className="w-3 h-3 text-[#4A6C6F]" />
                  <span className="text-[10px] font-semibold text-[#4A6C6F]">Kokoro</span>
                </div>
                <div className="flex items-center gap-1 h-4">
                  {[0, 0.2, 0.4].map((delay) => (
                    <motion.div
                      key={delay}
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay }}
                      className="w-1.5 h-1.5 rounded-full bg-[#4A6C6F]/60"
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area - Floating Glass */}
        <div className="relative z-20 px-4 py-3 pb-safe bg-gradient-to-t from-white/90 via-white/50 to-transparent">
          <div className="flex items-end gap-2 backdrop-blur-xl bg-white/60 border border-white/60 rounded-3xl p-1.5 shadow-lg">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type a message..."
              disabled={isLoading}
              rows={1}
              className="flex-1 px-4 py-2.5 rounded-2xl bg-transparent text-[#2C2C2C] placeholder-[#5F5F5F]/70 focus:outline-none resize-none disabled:opacity-50 max-h-24 text-sm"
              style={{ minHeight: '40px' }}
            />
            
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className="w-10 h-10 rounded-full bg-gradient-to-r from-[#4A6C6F] to-[#5A7C7F] text-white flex items-center justify-center shadow-md disabled:opacity-50 disabled:shadow-none mb-[1px]"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4 ml-0.5" />}
            </motion.button>
          </div>

          <p className="text-[10px] text-[#5F5F5F] text-center mt-2 opacity-70">
            Emergency: <strong className="text-[#D2691E]">1122</strong> or Umang <strong className="text-[#D2691E]">0311-778-6264</strong>
          </p>
        </div>
      </div>
    )
  }

  // ========== DESKTOP GLASSMORPHIC UI (ORIGINAL) ==========
  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#4A6C6F]/20 to-[#4A6C6F]/10 backdrop-blur-xl flex items-center justify-center">
            <Heart className="w-6 h-6 text-[#4A6C6F]" />
          </div>
          <div>
            <h1 className="text-4xl font-serif font-medium text-[#2C2C2C]">Kokoro</h1>
            <p className="text-[#5F5F5F]">Your mental wellness companion</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {userContext && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowContext(!showContext)}
              className="p-3 rounded-xl backdrop-blur-xl bg-white/60 border border-white/60 text-[#4A6C6F] hover:bg-white/80 transition-all"
            >
              <Info className="w-5 h-5" />
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={clearChat}
            className="p-3 rounded-xl backdrop-blur-xl bg-white/60 border border-white/60 text-[#D2691E] hover:bg-white/80 transition-all"
          >
            <Trash2 className="w-5 h-5" />
          </motion.button>
        </div>
      </motion.div>

      <AnimatePresence>
        {showContext && userContext && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 backdrop-blur-[40px] bg-white/40 border border-white/60 rounded-2xl p-6 shadow-xl overflow-hidden"
          >
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-[#4A6C6F]" />
              <h3 className="font-semibold text-[#2C2C2C]">What Kokoro Knows About You</h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-[#5F5F5F] mb-1">Name</p>
                <p className="text-sm font-medium text-[#2C2C2C]">{userContext.name}</p>
              </div>
              <div>
                <p className="text-xs text-[#5F5F5F] mb-1">Age</p>
                <p className="text-sm font-medium text-[#2C2C2C]">{userContext.age} years</p>
              </div>
              <div>
                <p className="text-xs text-[#5F5F5F] mb-1">Education</p>
                <p className="text-sm font-medium text-[#2C2C2C] capitalize">{userContext.education_level.replace(/-/g, ' ')}</p>
              </div>
              <div>
                <p className="text-xs text-[#5F5F5F] mb-1">Location</p>
                <p className="text-sm font-medium text-[#2C2C2C]">{userContext.location}</p>
              </div>
            </div>

            {(userContext.recentMoodAverage !== undefined || userContext.recentStressLevel !== undefined) && (
              <div className="mt-4 pt-4 border-t border-white/40">
                <p className="text-xs text-[#5F5F5F] mb-3">Recent Wellbeing (Last 7 Days)</p>
                <div className="flex gap-6">
                  {userContext.recentMoodAverage !== undefined && (
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getMoodEmoji(userContext.recentMoodAverage)}</span>
                      <div>
                        <p className="text-xs text-[#5F5F5F]">Avg Mood</p>
                        <p className="text-sm font-semibold text-[#2C2C2C]">{userContext.recentMoodAverage.toFixed(1)}/5</p>
                      </div>
                    </div>
                  )}
                  {userContext.recentStressLevel !== undefined && (
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getStressEmoji(userContext.recentStressLevel)}</span>
                      <div>
                        <p className="text-xs text-[#5F5F5F]">Avg Stress</p>
                        <p className="text-sm font-semibold text-[#2C2C2C]">{userContext.recentStressLevel.toFixed(1)}/5</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex-1 backdrop-blur-[40px] bg-white/40 border border-white/60 rounded-[2rem] shadow-2xl flex flex-col overflow-hidden"
      >
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <AnimatePresence mode="popLayout">
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-[#4A6C6F] to-[#6B6B6B] text-white'
                      : 'bg-white/60 border border-white/60 text-[#2C2C2C]'
                  } rounded-2xl px-6 py-4 shadow-lg`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-[#4A6C6F]" />
                      <span className="text-xs font-semibold text-[#4A6C6F]">Kokoro</span>
                    </div>
                  )}
                  
                  <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  
                  <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-white/70' : 'text-[#5F5F5F]'}`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="bg-white/60 border border-white/60 rounded-2xl px-6 py-4 shadow-lg">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#4A6C6F]" />
                  <span className="text-xs font-semibold text-[#4A6C6F]">Kokoro</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  {[0, 0.2, 0.4].map((delay) => (
                    <motion.div
                      key={delay}
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay }}
                      className="w-2 h-2 rounded-full bg-[#4A6C6F]"
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="p-6 border-t border-white/40">
          <div className="flex gap-3">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Share what's on your mind..."
              disabled={isLoading}
              rows={1}
              className="flex-1 px-4 py-3 rounded-2xl bg-white/60 border border-white/60 text-[#2C2C2C] placeholder-[#5F5F5F] focus:outline-none focus:ring-2 focus:ring-[#4A6C6F]/50 transition-all resize-none disabled:opacity-50 max-h-32"
            />
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#4A6C6F] to-[#4A6C6F]/80 text-white font-semibold shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </motion.button>
          </div>

          <p className="text-xs text-[#5F5F5F] mt-3 text-center">
            Kokoro provides support but is not a replacement for professional therapy. 
            For emergencies, call <strong className="text-[#D2691E]">1122</strong> or Umang <strong className="text-[#D2691E]">0311-778-6264</strong>
          </p>
        </div>
      </motion.div>
    </div>
  )
}