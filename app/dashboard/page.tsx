'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const MOOD_LABELS = ['TERRIBLE', 'BAD', 'OKAY', 'GOOD', 'GREAT']

const CARDS = [
  { num: '01', label: 'TALK TO KOKORO', desc: 'Your AI companion. No judgment.',            href: '/dashboard/kokoro' },
  { num: '02', label: 'MOOD TRACKER',   desc: 'How are you actually feeling?',              href: '/dashboard/mood' },
  { num: '03', label: 'JOURNAL',        desc: 'Write it down. No one reads this but you.',  href: '/dashboard/journal' },
  { num: '04', label: 'POMODORO',       desc: '25 minutes. Work, then breathe.',            href: '/dashboard/pomodoro' },
  { num: '05', label: 'BREATHING',      desc: 'Your nervous system needs this.',            href: '/dashboard/breathing' },
  { num: '06', label: 'MOOD GRAPH',     desc: 'Your patterns, visualised.',                 href: '/dashboard/graph' },
  { num: '07', label: 'ACADEMIC STRESS',desc: 'Acknowledge it. Track it. Manage it.',      href: '/dashboard/research' },
  { num: '08', label: 'GET HELP',       desc: 'Helplines. Real humans. 24/7.',             href: '/dashboard/helpline' },
]

const TICKER_ITEMS = 'MOOD TRACKER  ·  JOURNAL  ·  BREATHING  ·  POMODORO  ·  GET HELP  ·  KOKORO  ·  GRAPH  ·  STRESS  ·  '

function getGreeting() {
  const h = new Date().getHours()
  if (h < 5)  return 'GOOD NIGHT,'
  if (h < 12) return 'GOOD MORNING,'
  if (h < 17) return 'GOOD AFTERNOON,'
  if (h < 21) return 'GOOD EVENING,'
  return 'GOOD NIGHT,'
}

function useLiveClock() {
  const [time, setTime] = useState('')
  useEffect(() => {
    const update = () => setTime(
      new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })
    )
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])
  return time
}

function useScramble(finalText: string) {
  const [display, setDisplay] = useState(finalText)
  const rafRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const CHARS = '|/\\-_+<>[]{}あいうえおさとり'

  const scramble = useCallback(() => {
    if (rafRef.current) clearInterval(rafRef.current)
    let iteration = 0
    rafRef.current = setInterval(() => {
      setDisplay(
        finalText.split('').map((_, i) =>
          i < iteration ? finalText[i] : CHARS[Math.floor(Math.random() * CHARS.length)]
        ).join('')
      )
      if (iteration >= finalText.length) {
        clearInterval(rafRef.current!)
        setDisplay(finalText)
      }
      iteration += 1 / 3
    }, 30)
  }, [finalText])

  useEffect(() => () => { if (rafRef.current) clearInterval(rafRef.current) }, [])
  return { display, scramble }
}

export default function DashboardHome() {
  const [profile, setProfile]       = useState<any>(null)
  const [todayMood, setTodayMood]   = useState<any>(null)
  const [hasMoodToday, setHasMood]  = useState(false)
  const [hasStressToday, setStress] = useState(false)
  const [loading, setLoading]       = useState(true)
  const time = useLiveClock()
  const name = profile?.name?.toUpperCase() || 'WELCOME'
  const { display: scrambledName, scramble } = useScramble(name)

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
      const [{ data: prof }, { data: moods }, { data: stress }] = await Promise.all([
        supabase.from('profiles').select('name').eq('id', session.user.id).single(),
        supabase.from('moods').select('mood_score').eq('user_id', session.user.id)
          .gte('created_at', todayStart.toISOString()).order('created_at', { ascending: false }).limit(1),
        supabase.from('academic_stress').select('id').eq('user_id', session.user.id)
          .gte('created_at', todayStart.toISOString()).limit(1),
      ])
      setProfile(prof)
      setTodayMood(moods?.[0] ?? null)
      setHasMood(Boolean(moods?.length))
      setStress(Boolean(stress?.length))
      setLoading(false)
    }
    load()
  }, [])

  const dateStr = new Date().toLocaleDateString('en-GB', {
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
  }).toUpperCase()

  const moodLabel = todayMood ? MOOD_LABELS[todayMood.mood_score - 1] : null

  return (
    <div style={{ maxWidth: 840 }}>

      {/* ── Masthead ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1.5px solid var(--border)', paddingBottom: 10, marginBottom: 48,
      }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-3)', letterSpacing: '0.06em' }}>
          {dateStr}  ·  {time}  ·  LAHORE, PK
        </span>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12, letterSpacing: '0.1em', color: 'var(--ink)' }}>
          SATORI DAILY
        </span>
      </div>

      {/* ── Hero ── */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink-3)', letterSpacing: '0.1em', marginBottom: 4 }}>
          {getGreeting()}
        </div>
        <div
          className="t-hero"
          style={{
            borderBottom: '3px solid var(--border)',
            paddingBottom: 8,
            marginBottom: 20,
            display: 'inline-block',
            cursor: 'default',
            fontFamily: 'var(--font-display)',
          }}
          onMouseEnter={scramble}
        >
          {loading ? '—' : scrambledName}
        </div>

        {/* Streak callout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 32, marginTop: 12 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, color: 'var(--ink)', lineHeight: 1 }}>
              {hasMoodToday ? '1+' : '0'} DAYS
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.1em', marginTop: 2 }}>
              LOGGED
            </div>
          </div>
          {!hasMoodToday && (
            <Link
              href="/dashboard/mood"
              style={{
                fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12,
                color: 'var(--accent)', letterSpacing: '0.06em', textDecoration: 'none',
              }}
            >
              ↗ START YOUR STREAK TODAY
            </Link>
          )}
        </div>
      </div>

      {/* ── Status strip ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderTop: '1.5px solid var(--border)', marginBottom: 48 }}>
        {[
          {
            label: 'MOOD',
            value: moodLabel || 'NOT LOGGED',
            cta: !hasMoodToday ? 'LOG NOW →' : null,
            ctaHref: '/dashboard/mood',
          },
          {
            label: 'STREAK',
            value: hasMoodToday ? '1 DAY' : '0 DAYS',
            cta: null,
            ctaHref: null,
          },
          {
            label: 'FOCUS',
            value: '0 MIN TODAY',
            cta: 'START SESSION →',
            ctaHref: '/dashboard/pomodoro',
          },
        ].map((col, i) => (
          <div
            key={col.label}
            style={{
              padding: '16px',
              borderRight: i < 2 ? '1.5px solid var(--border)' : 'none',
              borderBottom: '1.5px solid var(--border)',
            }}
          >
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.12em', marginBottom: 8 }}>
              {col.label}
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(18px, 3vw, 28px)', color: 'var(--ink)', lineHeight: 1.1, marginBottom: 8 }}>
              {loading ? '—' : col.value}
            </div>
            {col.cta && col.ctaHref && (
              <Link
                href={col.ctaHref}
                style={{
                  fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11,
                  color: 'var(--accent)', letterSpacing: '0.04em', textDecoration: 'none',
                  display: 'block', marginTop: 4,
                }}
              >
                {col.cta}
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* ── Feature grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderTop: '1.5px solid var(--border)', borderLeft: '1.5px solid var(--border)', marginBottom: 0 }}>
        {CARDS.map((card) => (
          <Link
            key={card.num}
            href={card.href}
            className="br-lift"
            style={{
              display: 'block',
              padding: 20,
              borderRight: '1.5px solid var(--border)',
              borderBottom: '1.5px solid var(--border)',
              textDecoration: 'none',
              background: 'var(--bg)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)' }}>{card.num}</span>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: 'var(--ink)', letterSpacing: '0.02em', textAlign: 'right', maxWidth: '70%' }}>
                {card.label}
              </span>
            </div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.5, marginBottom: 12 }}>
              {card.desc}
            </p>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11, color: 'var(--ink)', letterSpacing: '0.04em' }}>
              OPEN →
            </span>
          </Link>
        ))}
      </div>

      {/* ── Ticker tape ── */}
      <div
        className="ticker-wrap"
        style={{
          overflow: 'hidden', background: 'var(--bg-invert)',
          borderTop: '1.5px solid var(--border)', marginTop: 48,
        }}
      >
        <div className="ticker-inner" style={{ padding: '12px 0' }}>
          {[TICKER_ITEMS, TICKER_ITEMS].map((txt, i) => (
            <span
              key={i}
              style={{
                fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12,
                color: 'var(--ink-invert)', letterSpacing: '0.1em', padding: '0 24px',
              }}
            >
              {txt}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
