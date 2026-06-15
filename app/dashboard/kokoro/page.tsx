'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const QUICK_CHIPS = ['I NEED TO VENT', 'EXAM STRESS', 'BREATHING HELP']

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', gap: 6, padding: '10px 14px', background: 'var(--bg-card)', border: '1.5px solid var(--border)' }}>
      {['_', '_', '_'].map((ch, i) => (
        <motion.span
          key={i}
          style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--ink-2)' }}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 0.9, delay: i * 0.3, repeat: Infinity }}
        >
          {ch}
        </motion.span>
      ))}
    </div>
  )
}

export default function KokoroPage() {
  const [messages, setMessages]   = useState<Message[]>([])
  const [input, setInput]         = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [userCtx, setUserCtx]     = useState('')
  const [helpOpen, setHelpOpen]   = useState(false)
  const endRef   = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString()
      const [{ data: profile }, { data: moods }, { data: stress }] = await Promise.all([
        supabase.from('profiles').select('name, age, education_level, location').eq('id', session.user.id).single(),
        supabase.from('moods').select('mood_score').eq('user_id', session.user.id).gte('created_at', sevenDaysAgo),
        supabase.from('academic_stress').select('stress_level').eq('user_id', session.user.id).gte('created_at', sevenDaysAgo),
      ])

      let ctx = ''
      if (profile) {
        ctx = `User: ${profile.name || 'Student'}, ${profile.age || ''}yo, ${profile.education_level || ''} student in ${profile.location || 'Pakistan'}.`
        if (moods?.length) ctx += ` Avg mood 7d: ${(moods.reduce((s, m) => s + (m.mood_score || 0), 0) / moods.length).toFixed(1)}/5.`
        if (stress?.length) ctx += ` Avg stress 7d: ${(stress.reduce((s, m) => s + (m.stress_level || 0), 0) / stress.length).toFixed(1)}/5.`
      }
      setUserCtx(ctx)

      const { data: sessions } = await supabase
        .from('chat_sessions').select('*').eq('user_id', session.user.id)
        .order('updated_at', { ascending: false }).limit(1)

      if (sessions?.length) {
        setSessionId(sessions[0].id)
        const loaded = (sessions[0].messages as any[]).map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }))
        setMessages(loaded)
        if (!loaded.length) greet(profile?.name)
      } else {
        const { data: newSess } = await supabase.from('chat_sessions')
          .insert({ user_id: session.user.id, messages: [] }).select().single()
        if (newSess) { setSessionId(newSess.id); greet(profile?.name) }
      }
    }
    init()
  }, [])

  const greet = (name?: string) => {
    setMessages([{
      id: Date.now().toString(), role: 'assistant', timestamp: new Date(),
      content: `Hey${name ? ` ${name}` : ''}. I'm Kokoro.\n\nTell me what's on your mind. I'm listening.`,
    }])
  }

  const save = useCallback(async (msgs: Message[]) => {
    if (!sessionId) return
    await supabase.from('chat_sessions').update({ messages: msgs, updated_at: new Date().toISOString() }).eq('id', sessionId)
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
              content: `You are Kokoro (心), a direct but warm mental wellness companion for students in Pakistan. Be honest, concise, non-judgmental. Keep responses to 2-4 sentences. For serious concerns (self-harm, suicidal thoughts): show empathy, encourage professional help, mention: Emergency 1122, Umang 0311-778-6264. ${userCtx}`,
            },
            ...updated.slice(-6).map(m => ({ role: m.role, content: m.content })),
          ],
        }),
      })
      const { message } = await res.json()
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(), role: 'assistant',
        content: message || "Connection issue. Try again.",
        timestamp: new Date(),
      }
      const final = [...updated, aiMsg]
      setMessages(final)
      await save(final)
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(), role: 'assistant',
        content: "Connection issue. Try again.",
        timestamp: new Date(),
      }])
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
    <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', flexDirection: 'column', height: 'calc(100dvh - 6rem)' }}>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16, padding: '12px 16px',
        borderBottom: '1.5px solid var(--border)', flexShrink: 0, marginBottom: 0,
        background: 'var(--bg)',
      }}>
        <Link href="/dashboard" style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)', textDecoration: 'none', letterSpacing: '0.06em' }}>
          ← BACK
        </Link>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: 'var(--ink)', flex: 1, textAlign: 'center', letterSpacing: '-0.01em' }}>
          KOKORO
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-2)', letterSpacing: '0.06em' }}>
          ● ONLINE
        </span>
        <button
          onClick={clearChat}
          style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.06em' }}
        >
          DELETE
        </button>
      </div>

      {/* Messages */}
      <div className="scrollbar-thin flex-1 overflow-y-auto" style={{ padding: '16px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>

        {isEmpty && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '40px 24px', textAlign: 'center' }}>
            <div style={{ border: '1.5px solid var(--border)', padding: '32px 40px', marginBottom: 24 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 40, color: 'var(--ink)', marginBottom: 16, letterSpacing: '-0.02em' }}>
                KOKORO.
              </div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.65, maxWidth: 320 }}>
                An AI that listens.<br />
                Trained to help students navigate stress, anxiety, and academic pressure.
              </p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)', marginTop: 16, letterSpacing: '0.06em' }}>
                TYPE TO BEGIN.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', maxWidth: 320 }}>
              {QUICK_CHIPS.map(chip => (
                <button
                  key={chip}
                  onClick={() => send(chip)}
                  className="br-btn"
                  style={{ padding: '10px 16px', width: '100%', textAlign: 'left' }}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map(msg => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.12, ease: [0.25, 0, 0, 1] }}
              style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                padding: '0 4px',
              }}
            >
              <div style={{ maxWidth: '78%' }}>
                <div
                  style={
                    msg.role === 'user'
                      ? {
                          background: 'var(--bg-invert)', color: 'var(--ink-invert)',
                          border: '1.5px solid var(--border)', padding: '12px 16px',
                          fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: 1.6,
                          whiteSpace: 'pre-wrap',
                        }
                      : {
                          background: 'var(--bg-card)', color: 'var(--ink)',
                          border: '1.5px solid var(--border)', padding: '12px 16px',
                          fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: 1.6,
                          whiteSpace: 'pre-wrap',
                        }
                  }
                >
                  {msg.content}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)',
                    marginTop: 4, textAlign: msg.role === 'user' ? 'right' : 'left',
                    opacity: 0, transition: 'opacity 160ms',
                  }}
                  className="msg-time"
                >
                  {msg.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <div style={{ padding: '0 4px' }}>
            <TypingIndicator />
          </div>
        )}

        {/* Quick chips when chatting */}
        {messages.length > 0 && !isLoading && (
          <div style={{ display: 'flex', gap: 8, padding: '4px 4px 0', flexWrap: 'wrap' }}>
            {QUICK_CHIPS.map(chip => (
              <button
                key={chip}
                onClick={() => send(chip)}
                style={{
                  fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11,
                  color: 'var(--ink-2)', background: 'var(--bg)', border: '1.5px solid var(--border)',
                  padding: '6px 12px', cursor: 'pointer', letterSpacing: '0.04em',
                  transition: `background ${80}ms`,
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-card)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg)' }}
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* Emergency strip */}
      <div style={{ flexShrink: 0 }}>
        <button
          onClick={() => setHelpOpen(h => !h)}
          style={{
            width: '100%', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 8,
            border: '1.5px solid var(--border)', borderBottom: helpOpen ? '1px solid var(--border-2)' : '1.5px solid var(--border)',
            background: 'var(--bg-card)', cursor: 'pointer', textAlign: 'left',
          }}
        >
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-2)', letterSpacing: '0.06em', flex: 1 }}>
            EMERGENCY: 1122  ·  UMANG HELPLINE: 0311-778-6264
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)' }}>
            {helpOpen ? '▲' : '▼'}
          </span>
        </button>
        <AnimatePresence>
          {helpOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ padding: '10px 14px', border: '1.5px solid var(--border)', borderTop: 'none', background: 'var(--bg-card)' }}>
                {[
                  ['Rescue / Emergency', '1122'],
                  ['Umang Helpline', '0317-4288665'],
                  ['Rozan Counselling', '051-2890505'],
                  ['Edhi Foundation', '115'],
                ].map(([label, num]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)' }}>{label}</span>
                    <strong style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink)' }}>{num}</strong>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input */}
      <div style={{
        display: 'flex', flexShrink: 0,
        border: '1.5px solid var(--border)', borderTop: helpOpen ? '1px solid var(--border-2)' : '1.5px solid var(--border)',
      }}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="WRITE ANYTHING..."
          rows={1}
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            padding: '14px 16px', resize: 'none', maxHeight: 120,
            fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink)',
          }}
        />
        <button
          onClick={() => send()}
          disabled={!input.trim() || isLoading}
          style={{
            padding: '0 20px', background: 'var(--bg-invert)', color: 'var(--ink-invert)',
            border: 'none', borderLeft: '1.5px solid var(--border)',
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13,
            letterSpacing: '0.06em', cursor: 'pointer', opacity: (!input.trim() || isLoading) ? 0.4 : 1,
            transition: 'opacity 80ms',
          }}
        >
          SEND
        </button>
      </div>
    </div>
  )
}
