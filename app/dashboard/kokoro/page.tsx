'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { Send } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { HELPLINES } from '@/lib/helplines'
import { Scene } from '@/components/ui/kit'

/*
 * Kokoro chat. Deliberately calm: no stickers, no tilt, no decorative
 * motion. A way to reach a real person is always on screen.
 */

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const STARTERS = ["I can't focus", 'Exam tomorrow', 'I just want to vent', 'Help me breathe']
const MAX_STORED_MESSAGES = 200

function Thinking() {
  return (
    <div className="kk-msg kk-msg--in" role="status" aria-label="Kokoro is thinking">
      <div className="bubble bubble--in kk-dots" aria-hidden="true"><span /><span /><span /></div>
    </div>
  )
}

export default function KokoroPage() {
  const [messages, setMessages]   = useState<Message[]>([])
  const [input, setInput]         = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const listRef  = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const el = listRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [messages, isLoading])

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      // A starter tapped on the dashboard arrives as ?q=. Pre-fill it; the
      // student still chooses to send it.
      const q = new URLSearchParams(window.location.search).get('q')
      if (q) { setInput(q.slice(0, 2000)); window.history.replaceState(null, '', '/dashboard/kokoro'); inputRef.current?.focus() }

      // The mood / stress context for the model is built server-side in /api/chat.
      const [{ data: profile }, { data: sessions }] = await Promise.all([
        supabase.from('profiles').select('name').eq('id', session.user.id).single(),
        supabase.from('chat_sessions').select('*').eq('user_id', session.user.id)
          .order('updated_at', { ascending: false }).limit(1),
      ])

      if (sessions?.length) {
        setSessionId(sessions[0].id)
        const loaded = (sessions[0].messages as any[]).map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }))
        setMessages(loaded)
        if (!loaded.length) greet(profile?.name ?? undefined)
      } else {
        const { data: newSess } = await supabase.from('chat_sessions')
          .insert({ user_id: session.user.id, messages: [] }).select().single()
        if (newSess) { setSessionId(newSess.id); greet(profile?.name ?? undefined) }
      }
    }
    init()
  }, [])

  const greet = (name?: string) => {
    const first = name?.trim().split(/\s+/)[0]
    setMessages([{
      id: Date.now().toString(), role: 'assistant', timestamp: new Date(),
      content: `Hi${first ? ` ${first}` : ''}, I'm Kokoro. What's on your mind? There's no right way to start.`,
    }])
  }

  const save = useCallback(async (msgs: Message[]) => {
    if (!sessionId) return
    // Keep the stored transcript bounded — it is rewritten on every reply.
    await supabase.from('chat_sessions')
      .update({
        messages: msgs.slice(-MAX_STORED_MESSAGES).map(m => ({ ...m, timestamp: m.timestamp.toISOString() })),
        updated_at: new Date().toISOString(),
      })
      .eq('id', sessionId)
  }, [sessionId])

  const send = async (text?: string) => {
    const content = (text ?? input).trim()
    if (!content || isLoading) return
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content, timestamp: new Date() }
    const updated = [...messages, userMsg]
    const aiId = (Date.now() + 1).toString()
    setMessages(updated)
    setInput('')
    setIsLoading(true)

    const showReply = (reply: string) =>
      setMessages([...updated, { id: aiId, role: 'assistant', content: reply, timestamp: new Date() }])

    const fallback = "I couldn't get a reply through just now. Please try sending that again."
    let reply = ''
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updated.slice(-6).map(m => ({ role: m.role, content: m.content })),
        }),
      })
      if (!res.ok || !res.body) {
        const { error } = await res.json().catch(() => ({ error: '' }))
        reply = error || fallback
        showReply(reply)
        return
      }
      // Render tokens as they stream in.
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      setIsLoading(false)
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        reply += decoder.decode(value, { stream: true })
        showReply(reply)
      }
      if (!reply) { reply = fallback; showReply(reply) }
      else await save([...updated, { id: aiId, role: 'assistant', content: reply, timestamp: new Date() }])
    } catch {
      showReply(reply || fallback)
    } finally {
      setIsLoading(false)
    }
  }

  const clearChat = async () => {
    if (!confirm('Clear this conversation? Kokoro will start fresh and the old messages are deleted.')) return
    setMessages([])
    if (sessionId) await supabase.from('chat_sessions').update({ messages: [] }).eq('id', sessionId)
    greet()
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <div className="kk">
      <Scene src="/art/night.webp" position="center 85%" className="on-dark kk__side" sizes="30vw"
        scrim="linear-gradient(180deg, rgba(7,14,24,0.65), rgba(7,14,24,0.15) 55%, rgba(7,14,24,0.7))">
        <div className="kk__side-inner">
          <div>
            <h1 className="t-h1">talk it through</h1>
            <p className="t-body" style={{ marginTop: 12, color: 'var(--on-dark-2)' }}>
              Kokoro is an AI companion. It can listen and help you think, but it isn&apos;t a therapist.
            </p>
          </div>
          <div className="kk__people">
            <p className="t-label" style={{ fontSize: 15 }}>Talk to a real person</p>
            <ul style={{ listStyle: 'none', margin: '8px 0 0', padding: 0, display: 'grid', gap: 4 }}>
              {HELPLINES.slice(0, 3).map(h => (
                <li key={h.name}><a className="link" href={h.href}>{h.name}: {h.number}</a></li>
              ))}
            </ul>
            <Link href="/dashboard/helpline" className="link t-small" style={{ display: 'inline-block', marginTop: 8 }}>All helplines</Link>
          </div>
        </div>
      </Scene>

      <section className="kk__chat" aria-label="Conversation with Kokoro">
        <div className="kk__bar">
          <div className="row" style={{ gap: 10, flexWrap: 'nowrap' }}>
            <span aria-hidden="true" className="kk__avatar">
              <svg width="18" height="18" viewBox="0 0 20 20"><path d="M13 3a7.5 7.5 0 1 0 4 10.5A6 6 0 1 1 13 3z" fill="#F4ECD6" /></svg>
            </span>
            <div>
              <h2 className="t-h4">Kokoro</h2>
              <p className="t-small faint">Replies in a few seconds</p>
            </div>
          </div>
          <button type="button" className="text-btn" onClick={clearChat}>Clear chat</button>
        </div>

        <div ref={listRef} className="kk__list" aria-live="polite" aria-relevant="additions">
          {messages.map(msg => (
            <div key={msg.id} className={`kk-msg kk-msg--${msg.role === 'user' ? 'out' : 'in'}`}>
              <div className={`bubble bubble--${msg.role === 'user' ? 'out' : 'in'}`} style={{ whiteSpace: 'pre-wrap' }}>
                <span className="sr-only">{msg.role === 'user' ? 'You said: ' : 'Kokoro said: '}</span>
                {msg.content}
              </div>
              <time className="kk-time" dateTime={msg.timestamp.toISOString()}>
                {msg.timestamp.toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit' })}
              </time>
            </div>
          ))}
          {isLoading && <Thinking />}
          {messages.length <= 1 && !isLoading && (
            <div className="row kk-starters" style={{ gap: 8 }}>
              {STARTERS.map(s => <button key={s} type="button" className="chip" onClick={() => send(s)}>{s}</button>)}
            </div>
          )}
        </div>

        <p className="kk__sos t-small">
          In danger or thinking about hurting yourself? Call <a className="link" href="tel:1122"><strong>1122</strong></a> or Umang on{' '}
          <a className="link" href="tel:03174288665"><strong>0317-4288665</strong></a>.
        </p>

        <form className="kk__input" onSubmit={e => { e.preventDefault(); send() }}>
          <label htmlFor="kk-text" className="sr-only">Message Kokoro</label>
          <textarea id="kk-text" ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
            placeholder="Write anything…" rows={1} maxLength={2000} />
          <button type="submit" className="pill pill--tape" disabled={!input.trim() || isLoading} aria-label="Send message" style={{ width: 52, padding: 0 }}>
            <Send size={18} />
          </button>
        </form>
      </section>

      <style>{`
        .kk { display: grid; grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.6fr); gap: 20px; height: calc(100svh - 120px); min-height: 520px; }
        .kk__side { border-radius: var(--r-lg); background: var(--night); color: var(--on-dark); }
        .kk__side-inner { position: relative; height: 100%; display: flex; flex-direction: column; justify-content: space-between; padding: 30px; }
        .kk__people { padding: 18px; border-radius: 18px; background: rgba(255,253,247,0.1); border: 1px solid var(--line-dark); }
        .kk__chat { display: flex; flex-direction: column; min-height: 0; background: var(--paper); border: 1px solid var(--line); border-radius: var(--r-lg); overflow: hidden; }
        .kk__bar { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 14px 12px 18px; border-bottom: 1px solid var(--line); }
        .kk__avatar { width: 38px; height: 38px; border-radius: 50%; background: var(--night); display: grid; place-items: center; flex-shrink: 0; }
        .kk__list { flex: 1; overflow-y: auto; padding: 20px 18px; display: flex; flex-direction: column; gap: 14px; background: var(--fog); }
        .kk-msg { display: flex; flex-direction: column; gap: 4px; max-width: 80%; }
        .kk-msg--in { align-self: flex-start; align-items: flex-start; }
        .kk-msg--out { align-self: flex-end; align-items: flex-end; }
        .kk-msg .bubble { max-width: 100%; font-size: 16px; line-height: 1.55; padding: 12px 16px; }
        .kk-msg .bubble--in { border: 1px solid var(--line); }
        .kk-time { font-size: 13px; color: var(--ink-3); }
        .kk-dots { display: flex; gap: 5px; padding: 16px 18px; }
        .kk-dots span { width: 7px; height: 7px; border-radius: 50%; background: var(--ink-3); animation: kk-pulse 1.2s ease-in-out infinite; }
        .kk-dots span:nth-child(2) { animation-delay: 0.2s; }
        .kk-dots span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes kk-pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }
        .kk-starters { padding-top: 6px; }
        .kk__sos { padding: 10px 18px; background: var(--marigold-2); color: var(--ink); }
        .kk__input { display: flex; align-items: flex-end; gap: 10px; padding: 12px; border-top: 1px solid var(--line); }
        .kk__input textarea { flex: 1; min-height: 52px; max-height: 160px; padding: 14px 18px; border-radius: 26px; border: 1.5px solid #C4CFC8; background: var(--paper); font: 400 16px/1.4 var(--font-body); color: var(--ink); resize: none; outline: none; }
        .kk__input textarea:focus { border-color: var(--ink); }
        @media (max-width: 900px) {
          .kk { grid-template-columns: 1fr; height: calc(100svh - 190px); }
          .kk__side { display: none; }
          .kk-msg { max-width: 90%; }
        }
      `}</style>
    </div>
  )
}
