'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Sparkles, Trash2, Phone, ChevronDown, ChevronUp } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const QUICK_CHIPS = [
  "I'm stressed about exams",
  "Just need to vent",
  "Teach me a breathing technique",
]

export default function KokoroPage() {
  const [messages, setMessages]       = useState<Message[]>([])
  const [input, setInput]             = useState('')
  const [isLoading, setIsLoading]     = useState(false)
  const [sessionId, setSessionId]     = useState<string | null>(null)
  const [userCtx, setUserCtx]         = useState<string>('')
  const [helpExpanded, setHelp]       = useState(false)
  const endRef   = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

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
        if (moods?.length) ctx += ` Avg mood 7d: ${(moods.reduce((s, m) => s + (m.mood_score || 0), 0) / moods.length).toFixed(1)}/5.`
        if (stress?.length) ctx += ` Avg stress 7d: ${(stress.reduce((s, m) => s + (m.stress_level || 0), 0) / stress.length).toFixed(1)}/5.`
      }
      setUserCtx(ctx)

      const { data: sessions } = await supabase
        .from('chat_sessions').select('*').eq('user_id', user.id)
        .order('updated_at', { ascending: false }).limit(1)

      if (sessions?.length) {
        setSessionId(sessions[0].id)
        const loaded = (sessions[0].messages as any[]).map((m: any) => ({
          ...m, timestamp: new Date(m.timestamp),
        }))
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
      content: `Hello${name ? ` ${name}` : ''}! I'm Kokoro, your mental wellness companion.\n\nI'm here to listen — whether it's academic stress, something personal, or just needing to talk. How are you feeling today?`,
    }
    setMessages([msg])
  }

  const save = useCallback(async (msgs: Message[]) => {
    if (!sessionId) return
    await supabase.from('chat_sessions')
      .update({ messages: msgs, updated_at: new Date().toISOString() })
      .eq('id', sessionId)
  }, [sessionId])

  const send = async (text?: string) => {
    const content = (text ?? input).trim()
    if (!content || isLoading) return
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content, timestamp: new Date() }
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
              content: `You are Kokoro (心), a warm, empathetic mental wellness companion for students in Pakistan. Be caring, non-judgmental, culturally sensitive. Keep responses concise (2-4 sentences). For serious concerns (self-harm, suicidal thoughts): show empathy, strongly encourage professional help, mention: Emergency 1122, Umang helpline 0311-778-6264. ${userCtx}`,
            },
            ...updated.slice(-6).map(m => ({ role: m.role, content: m.content })),
          ],
        }),
      })
      const { message } = await res.json()
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(), role: 'assistant',
        content: message || "I'm having trouble connecting right now. Please try again.",
        timestamp: new Date(),
      }
      const final = [...updated, aiMsg]
      setMessages(final)
      await save(final)
    } catch {
      const errMsg: Message = {
        id: (Date.now() + 1).toString(), role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
      }
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

  const isEmpty = messages.length === 0

  return (
    <div className="max-w-2xl mx-auto flex flex-col" style={{ height: 'calc(100dvh - 5rem)' }}>

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="shrink-0 flex items-center gap-3 px-4 py-3 mb-3 rounded-2xl"
        style={{ background: '#13161F', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        {/* Avatar */}
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'rgba(45,212,191,0.15)' }}
        >
          <Sparkles className="w-4 h-4" style={{ color: '#2DD4BF' }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold" style={{ color: '#F1F5F9' }}>Kokoro</p>
          <p className="text-[10px]" style={{ color: '#475569' }}>Mental wellness companion</p>
        </div>
        <span className="flex items-center gap-1.5 text-[10px] font-medium" style={{ color: '#4ADE80' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] online-pulse" />
          Online
        </span>
        <button
          onClick={clearChat}
          className="p-1.5 rounded-lg transition-colors hover:bg-[rgba(239,68,68,0.1)]"
          style={{ color: '#475569' }}
          title="Clear chat"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </motion.div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto scrollbar-thin space-y-3 px-1 py-2">

        {/* Empty state */}
        {isEmpty && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full text-center px-4"
          >
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: 'rgba(45,212,191,0.1)' }}
            >
              <Sparkles className="w-10 h-10" style={{ color: '#2DD4BF' }} />
            </div>
            <h2
              className="text-2xl mb-2"
              style={{ fontFamily: 'var(--font-instrument), Georgia, serif', color: '#F1F5F9' }}
            >
              I'm Kokoro
            </h2>
            <p className="text-sm mb-6" style={{ color: '#475569' }}>
              Your mental wellness companion. Tell me anything — I won't judge.
            </p>
            <div className="flex flex-col gap-2 w-full max-w-xs">
              {QUICK_CHIPS.map(chip => (
                <button
                  key={chip}
                  onClick={() => send(chip)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm font-medium text-left transition-all hover:opacity-80"
                  style={{ background: '#1C2030', border: '1px solid rgba(255,255,255,0.06)', color: '#94A3B8' }}
                >
                  {chip}
                </button>
              ))}
            </div>
          </motion.div>
        )}

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
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center mr-2 mt-1 shrink-0"
                  style={{ background: 'rgba(45,212,191,0.15)' }}
                >
                  <Sparkles className="w-3 h-3" style={{ color: '#2DD4BF' }} />
                </div>
              )}
              <div
                className="max-w-[78%] px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap"
                style={
                  msg.role === 'user'
                    ? { background: '#14B8A6', color: '#fff', borderRadius: '18px 18px 4px 18px' }
                    : { background: '#1C2030', color: '#F1F5F9', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '18px 18px 18px 4px' }
                }
              >
                {msg.content}
                <p className="text-[9px] mt-1 select-none" style={{ color: msg.role === 'user' ? 'rgba(255,255,255,0.5)' : '#475569' }}>
                  {msg.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-end gap-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(45,212,191,0.15)' }}>
              <Sparkles className="w-3 h-3" style={{ color: '#2DD4BF' }} />
            </div>
            <div className="px-4 py-3 rounded-2xl rounded-tl-sm" style={{ background: '#1C2030', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: '#2DD4BF' }}
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

      {/* ── Emergency helpline banner ── */}
      <div className="shrink-0 mb-2">
        <button
          onClick={() => setHelp(h => !h)}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl transition-all"
          style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}
        >
          <Phone className="w-3 h-3 shrink-0" style={{ color: '#EF4444' }} />
          <p className="text-[10px] font-medium flex-1 text-left" style={{ color: '#EF4444' }}>
            Emergency: <strong>1122</strong> · Umang: <strong>0311-778-6264</strong>
          </p>
          {helpExpanded ? (
            <ChevronUp className="w-3 h-3 shrink-0" style={{ color: '#EF4444' }} />
          ) : (
            <ChevronDown className="w-3 h-3 shrink-0" style={{ color: '#EF4444' }} />
          )}
        </button>
        <AnimatePresence>
          {helpExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-3 pt-2 pb-3 text-[10px] space-y-1" style={{ color: '#94A3B8' }}>
                <p>Rescue / Emergency: <strong style={{ color: '#F1F5F9' }}>1122</strong></p>
                <p>Umang Helpline: <strong style={{ color: '#F1F5F9' }}>0317-4288665</strong></p>
                <p>Rozan Counselling: <strong style={{ color: '#F1F5F9' }}>051-2890505</strong></p>
                <p>Edhi Foundation: <strong style={{ color: '#F1F5F9' }}>115</strong></p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Quick chips (when messages exist) ── */}
      {messages.length > 0 && !isLoading && (
        <div className="shrink-0 flex gap-2 overflow-x-auto scrollbar-hide pb-1 mb-2">
          {QUICK_CHIPS.map(chip => (
            <button
              key={chip}
              onClick={() => send(chip)}
              className="shrink-0 px-3 py-1.5 rounded-full text-[11px] font-medium transition-all whitespace-nowrap hover:opacity-80"
              style={{ background: '#1C2030', border: '1px solid rgba(255,255,255,0.06)', color: '#94A3B8' }}
            >
              {chip}
            </button>
          ))}
        </div>
      )}

      {/* ── Input ── */}
      <div
        className="shrink-0 flex gap-2 items-end rounded-2xl px-3 py-3"
        style={{ background: '#13161F', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Talk to Kokoro…"
          rows={1}
          className="flex-1 bg-transparent text-sm focus:outline-none resize-none max-h-28 leading-relaxed"
          style={{ color: '#F1F5F9' }}
        />
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => send()}
          disabled={!input.trim() || isLoading}
          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-opacity disabled:opacity-30"
          style={{ background: '#14B8A6' }}
        >
          <Send className="w-3.5 h-3.5 text-white" />
        </motion.button>
      </div>
    </div>
  )
}
