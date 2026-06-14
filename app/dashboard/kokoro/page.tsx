'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Sparkles, Trash2, ArrowLeft, Phone } from 'lucide-react'
import Link from 'next/link'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function KokoroPage() {
  const [messages, setMessages]   = useState<Message[]>([])
  const [input, setInput]         = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [userCtx, setUserCtx]     = useState<string>('')
  const endRef    = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  // Load user context + session
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString()
      const [{ data: profile }, { data: moods }, { data: stress }] = await Promise.all([
        supabase.from('profiles').select('name, age, education_level, location').eq('id', user.id).single(),
        supabase.from('moods').select('mood_score').eq('user_id', user.id).gte('created_at', sevenDaysAgo),
        supabase.from('academic_stress').select('stress_level').eq('user_id', user.id).gte('created_at', sevenDaysAgo),
      ])

      let ctx = ''
      if (profile) {
        ctx = `User: ${profile.name || 'Student'}, ${profile.age || ''}yo, ${profile.education_level || ''} student in ${profile.location || 'Pakistan'}.`
        if (moods?.length) ctx += ` Avg mood last 7d: ${(moods.reduce((s, m) => s + (m.mood_score || 0), 0) / moods.length).toFixed(1)}/5.`
        if (stress?.length) ctx += ` Avg stress last 7d: ${(stress.reduce((s, m) => s + (m.stress_level || 0), 0) / stress.length).toFixed(1)}/5.`
      }
      setUserCtx(ctx)

      // Load or create chat session
      const { data: sessions } = await supabase
        .from('chat_sessions').select('*').eq('user_id', user.id)
        .order('updated_at', { ascending: false }).limit(1)

      if (sessions?.length) {
        setSessionId(sessions[0].id)
        const loaded = (sessions[0].messages as any[]).map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }))
        setMessages(loaded)
        if (!loaded.length) greet(profile?.name)
      } else {
        const { data: newSess } = await supabase.from('chat_sessions')
          .insert({ user_id: user.id, messages: [] }).select().single()
        if (newSess) { setSessionId(newSess.id); greet(profile?.name) }
      }
    }
    init()
  }, [])

  const greet = (name?: string) => {
    const msg: Message = {
      id: Date.now().toString(), role: 'assistant', timestamp: new Date(),
      content: `Hello${name ? ` ${name}` : ''}! I'm Kokoro 🌸, your mental wellness companion.\n\nI'm here to listen and support you — whether it's academic stress, relationships, or just needing to talk. How are you feeling today?`,
    }
    setMessages([msg])
  }

  const save = useCallback(async (msgs: Message[]) => {
    if (!sessionId) return
    await supabase.from('chat_sessions')
      .update({ messages: msgs, updated_at: new Date().toISOString() })
      .eq('id', sessionId)
  }, [sessionId])

  const send = async () => {
    if (!input.trim() || isLoading) return
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input.trim(), timestamp: new Date() }
    const updated = [...messages, userMsg]
    setMessages(updated)
    setInput('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: `You are Kokoro (心), a warm, empathetic mental wellness companion for students in Pakistan.
Be caring, non-judgmental, culturally sensitive. Keep responses concise (2-4 sentences).
For serious concerns (self-harm, suicidal thoughts): show empathy, strongly encourage professional help, mention: Emergency 1122, Umang helpline 0311-778-6264.
${userCtx}`
            },
            ...updated.slice(-6).map(m => ({ role: m.role, content: m.content })),
          ]
        }),
      })
      const { message } = await res.json()
      const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: message, timestamp: new Date() }
      const final = [...updated, aiMsg]
      setMessages(final)
      await save(final)
    } catch {
      const errMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: "I'm having trouble connecting right now. Please try again in a moment. 💙", timestamp: new Date() }
      setMessages(prev => [...prev, errMsg])
    } finally {
      setIsLoading(false)
    }
  }

  const clearChat = async () => {
    setMessages([])
    if (sessionId) await supabase.from('chat_sessions').update({ messages: [] }).eq('id', sessionId)
    greet()
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-7rem)]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl px-4 py-3 mb-3 flex items-center gap-3 shrink-0"
      >
        <Link href="/dashboard" className="p-1.5 rounded-lg hover:bg-black/5 text-[#5F5F5F] transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="w-8 h-8 rounded-xl bg-[#4A6C6F]/15 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-[#4A6C6F]" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-[#2C2C2C]">Kokoro</p>
          <p className="text-[10px] text-[#9F9F9F]">Mental wellness companion</p>
        </div>
        <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          Online
        </span>
        <button onClick={clearChat} className="p-1.5 rounded-lg hover:bg-black/5 text-[#9F9F9F] hover:text-red-400 transition-colors" title="Clear chat">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </motion.div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-thin space-y-3 px-1 py-2">
        <AnimatePresence initial={false}>
          {messages.map(msg => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring' as const, stiffness: 320, damping: 28 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-6 h-6 rounded-lg bg-[#4A6C6F]/15 flex items-center justify-center mr-2 mt-1 shrink-0">
                  <Sparkles className="w-3 h-3 text-[#4A6C6F]" />
                </div>
              )}
              <div
                className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-[#4A6C6F] text-white rounded-tr-sm'
                    : 'glass rounded-tl-sm text-[#2C2C2C]'
                }`}
              >
                {msg.content}
                <p className={`text-[9px] mt-1 ${msg.role === 'user' ? 'text-white/50' : 'text-[#C0BAB2]'}`}>
                  {msg.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-end gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#4A6C6F]/15 flex items-center justify-center shrink-0">
              <Sparkles className="w-3 h-3 text-[#4A6C6F]" />
            </div>
            <div className="glass px-4 py-3 rounded-2xl rounded-tl-sm">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-[#4A6C6F]/50"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ delay: i * 0.15, repeat: Infinity, duration: 0.8 }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
        <div ref={endRef} />
      </div>

      {/* Helpline strip */}
      <div className="flex items-center gap-2 px-3 py-2 mb-2 rounded-xl bg-red-50/50 border border-red-100/60 shrink-0">
        <Phone className="w-3 h-3 text-red-400 shrink-0" />
        <p className="text-[10px] text-red-400">Emergency: <strong>1122</strong> · Umang helpline: <strong>0311-778-6264</strong></p>
      </div>

      {/* Input */}
      <div className="glass rounded-2xl p-3 flex gap-2 items-end shrink-0">
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Talk to Kokoro…"
          rows={1}
          className="flex-1 bg-transparent text-sm text-[#2C2C2C] placeholder-[#C0BAB2] focus:outline-none resize-none max-h-28 leading-relaxed"
          style={{ scrollbarWidth: 'none' }}
        />
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={send}
          disabled={!input.trim() || isLoading}
          className="w-8 h-8 rounded-xl bg-[#4A6C6F] text-white flex items-center justify-center shrink-0 disabled:opacity-40 transition-opacity"
        >
          <Send className="w-3.5 h-3.5" />
        </motion.button>
      </div>
    </div>
  )
}
