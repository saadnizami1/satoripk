'use client'

import { useRef, useState, type KeyboardEvent } from 'react'
import Link from 'next/link'
import { MOODS, PENDING_MOOD_KEY, type Mood } from '@/lib/moods'
import { MoodGlyph } from '@/components/ui/MoodGlyph'
import { PhoneMockup, ChatBubble } from '@/components/ui/kit'

/**
 * The hero's first interaction: a check-in inside a phone, before any
 * sign-up. The picked mood is kept for this tab and pre-fills onboarding.
 */
export function HeroPhone() {
  const [picked, setPicked] = useState<Mood | null>(null)
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  const pick = (m: Mood) => {
    setPicked(m)
    try { sessionStorage.setItem(PENDING_MOOD_KEY, String(m.score)) } catch { /* storage may be blocked */ }
  }
  const onKey = (e: KeyboardEvent, i: number) => {
    const d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0
    if (!d) return
    e.preventDefault()
    const n = (i + d + MOODS.length) % MOODS.length
    refs.current[n]?.focus()
    pick(MOODS[n])
  }

  return (
    <PhoneMockup className="bob">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '50px 16px 12px', borderBottom: '1px solid rgba(17,17,17,0.08)' }}>
        <span aria-hidden="true" style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--night)', display: 'grid', placeItems: 'center' }}>
          <svg width="20" height="20" viewBox="0 0 20 20"><path d="M13 3a7.5 7.5 0 1 0 4 10.5A6 6 0 1 1 13 3z" fill="#F4ECD6" /></svg>
        </span>
        <span style={{ lineHeight: 1.2 }}>
          <span style={{ display: 'block', font: '400 19px/1 var(--font-display)' }}>kokoro</span>
          <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>here whenever you are</span>
        </span>
      </div>

      <div aria-hidden="true" style={{ margin: '12px 14px 0', padding: '10px 12px', borderRadius: 16, background: 'rgba(255,253,247,0.8)', border: '1px solid rgba(17,17,17,0.06)' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 6 }}>your week so far</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', fontSize: 13, color: 'var(--ink-3)' }}>
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
            <div key={i} style={{ display: 'grid', justifyItems: 'center', gap: 2 }}>
              {i < 4 ? <MoodGlyph score={[2, 3, 1, 4][i]} size={26} />
                : i === 4 && picked ? <MoodGlyph score={picked.score} size={26} />
                : <span style={{ width: 20, height: 20, margin: 3, borderRadius: '50%', border: `1.5px ${i === 4 ? 'solid var(--ink)' : 'dashed #9AA59F'}` }} />}
              {d}
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, padding: 14, overflow: 'hidden' }} aria-live="polite">
        <ChatBubble>salaam! before anything else, how are you arriving today?</ChatBubble>
        {picked && <ChatBubble dir="out">{picked.label.toLowerCase()}, I think</ChatBubble>}
        {picked && <ChatBubble>{picked.reply}</ChatBubble>}
      </div>

      <div style={{ padding: '0 12px 16px' }}>
        {picked ? (
          <div style={{ display: 'grid', gap: 6 }}>
            <Link href="/auth?mode=signup" className="pill pill--tape pill--block" style={{ minHeight: 50 }}>
              Save this check-in
            </Link>
            <button type="button" className="text-btn" style={{ justifyContent: 'center', fontSize: 14 }} onClick={() => setPicked(null)}>
              Pick again
            </button>
          </div>
        ) : (
          <div role="radiogroup" aria-label="How are you arriving today?" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
            {MOODS.map((m, i) => (
              <button
                key={m.score}
                ref={el => { refs.current[i] = el }}
                type="button" role="radio" aria-checked={false} tabIndex={i === 0 ? 0 : -1}
                onClick={() => pick(m)} onKeyDown={e => onKey(e, i)}
                className="chip"
                style={{ minHeight: 44, padding: '0 12px 0 6px', gap: 4, fontSize: 14 }}
              >
                <MoodGlyph score={m.score} size={30} />
                {m.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </PhoneMockup>
  )
}
