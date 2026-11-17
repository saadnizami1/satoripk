'use client'

import { useEffect, useMemo, useState, type FormEvent } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Reorder } from 'framer-motion'
import { ArrowDown, ArrowUp, Send, GripVertical } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { localDateKey, notifyCheckin } from '@/lib/dates'
import { firstName, greetingFor, moodFor } from '@/lib/moods'
import { readFocusToday } from '@/lib/focus'
import { HELPLINES } from '@/lib/helplines'
import { Pill, Polaroid, Scene, TapeHeading, TornPaper } from '@/components/ui/kit'
import { Sticker, type StickerName } from '@/components/ui/stickers'
import { MoodPicker } from '@/components/ui/controls'
import { MoodGlyph } from '@/components/ui/MoodGlyph'
import { Washi, HandNote } from '@/components/ui/doodles'

interface Tool { id: string; title: string; line: string; href: string; sticker: StickerName; bg: string }

const TOOLS: Tool[] = [
  { id: 'kokoro',    title: 'Talk to Kokoro',  line: "Talk through whatever's on your mind.",       href: '/dashboard/kokoro',    sticker: 'moon',       bg: 'var(--night)' },
  { id: 'mood',      title: 'Mood check-in',   line: 'One tap for how today feels.',         href: '/dashboard/mood',      sticker: 'kite',       bg: 'var(--sky)' },
  { id: 'journal',   title: 'Journal',         line: 'Private pages, just for you.',  href: '/dashboard/journal',   sticker: 'notebook',   bg: 'var(--marigold-2)' },
  { id: 'focus',     title: 'Focus timer',     line: 'Twenty-five minutes on, five off.',       href: '/dashboard/pomodoro',  sticker: 'clock',      bg: 'var(--mint)' },
  { id: 'breathing', title: 'Breathing',       line: 'Slow your breathing in two minutes.',  href: '/dashboard/breathing', sticker: 'leaf',       bg: 'var(--sky-2)' },
  { id: 'graph',     title: 'Mood graph',      line: 'See how your weeks have gone.',          href: '/dashboard/graph',     sticker: 'chart',      bg: 'var(--fog)' },
  { id: 'stress',    title: 'Academic stress', line: 'Track how school is weighing on you.',         href: '/dashboard/research',  sticker: 'pencil',     bg: 'var(--dusk)' },
  { id: 'help',      title: 'Get help',        line: 'Free helplines, answered by people.',     href: '/dashboard/helpline',  sticker: 'phoneHeart', bg: 'var(--marigold)' },
]
const ORDER_KEY = 'satori:tool-order'
const TILTS = [-2.2, 1.6, -1.2, 2.4, -1.8, 1.2, -2.6, 1.8]

const PROMPTS = [
  'What went better than you expected today?',
  "What's taking up the most space in your head right now?",
  'What would you tell a friend who had your day?',
  'Three small things that were okay today.',
  'What do you need more of this week?',
  'What are you proud of, even a little?',
  'What can wait until tomorrow?',
]

const STARTERS = ["I can't focus", 'Exam tomorrow', 'I just want to vent']

type MoodRow = { mood_score: number; created_at: string }

export default function DashboardHome() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [name, setName] = useState<string | null>(null)
  const [surveyDone, setSurveyDone] = useState(true)
  const [moods, setMoods] = useState<MoodRow[] | null>(null)
  const [focusMin, setFocusMin] = useState(0)
  const [changing, setChanging] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [order, setOrder] = useState<string[]>(TOOLS.map(t => t.id))
  const [reordering, setReordering] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    setMounted(true)
    setFocusMin(readFocusToday())
    try {
      const saved = JSON.parse(localStorage.getItem(ORDER_KEY) || 'null')
      if (Array.isArray(saved) && saved.length === TOOLS.length && TOOLS.every(t => saved.includes(t.id))) setOrder(saved)
    } catch { /* keep default order */ }

    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      setUserId(session.user.id)
      const since = new Date(); since.setDate(since.getDate() - 90); since.setHours(0, 0, 0, 0)
      const [{ data: prof }, { data: rows }] = await Promise.all([
        supabase.from('profiles').select('name, city, school_name').eq('id', session.user.id).single(),
        supabase.from('moods').select('mood_score, created_at').eq('user_id', session.user.id)
          .gte('created_at', since.toISOString()).order('created_at', { ascending: false }),
      ])
      setName(prof?.name ?? '')
      setSurveyDone(!!(prof?.city && prof?.school_name))
      setMoods(rows ?? [])
    }
    load()
  }, [])

  // Latest mood per local day.
  const byDay = useMemo(() => {
    const m = new Map<string, number>()
    for (const r of moods ?? []) { const k = localDateKey(r.created_at); if (!m.has(k)) m.set(k, r.mood_score) }
    return m
  }, [moods])

  const todayKey = mounted ? localDateKey(new Date()) : ''
  const today = moodFor(byDay.get(todayKey))
  const greet = mounted ? greetingFor() : null

  const streak = useMemo(() => {
    if (!mounted) return { n: 0, line: '' }
    const day = (offset: number) => { const d = new Date(); d.setDate(d.getDate() - offset); return localDateKey(d) }
    const run = (from: number) => { let n = 0; while (byDay.has(day(from + n))) n++; return n }
    if (byDay.has(day(0))) {
      const n = run(0)
      return { n, line: n === 1 ? 'Day 1 of your streak. Nice start.' : `${n} days in a row.` }
    }
    if (byDay.has(day(1))) { const n = run(1); return { n, line: `${n} ${n === 1 ? 'day' : 'days'} in a row. Check in to keep it going.` } }
    if (byDay.size) return { n: 0, line: 'Welcome back. Today counts.' }
    return { n: 0, line: 'Your first check-in starts your streak.' }
  }, [byDay, mounted])

  const week = useMemo(() => {
    if (!mounted) return []
    const now = new Date()
    const monday = new Date(now); monday.setHours(0, 0, 0, 0); monday.setDate(now.getDate() - ((now.getDay() + 6) % 7))
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday); d.setDate(monday.getDate() + i)
      const key = localDateKey(d)
      return { key, label: d.toLocaleDateString('en-GB', { weekday: 'short' }), score: byDay.get(key), isToday: key === todayKey, future: key > todayKey }
    })
  }, [byDay, mounted, todayKey])

  const checkIn = async (score: number) => {
    if (!userId || saving) return
    setSaving(true); setSaveError('')
    const { data, error } = await supabase.from('moods').insert({ user_id: userId, mood_score: score }).select('mood_score, created_at').single()
    setSaving(false)
    if (error || !data) { setSaveError("That didn't save. Check your connection and tap again."); return }
    setMoods(prev => [data, ...(prev ?? [])])
    setChanging(false)
    notifyCheckin()
  }

  const saveOrder = (next: string[]) => {
    setOrder(next)
    try { localStorage.setItem(ORDER_KEY, JSON.stringify(next)) } catch { /* order just won't persist */ }
  }
  const move = (i: number, d: -1 | 1) => {
    const j = i + d
    if (j < 0 || j >= order.length) return
    const next = [...order]; [next[i], next[j]] = [next[j], next[i]]; saveOrder(next)
  }
  const tools = order.map(id => TOOLS.find(t => t.id === id)!)

  const ask = (e: FormEvent) => {
    e.preventDefault()
    router.push(`/dashboard/kokoro${message.trim() ? `?q=${encodeURIComponent(message.trim())}` : ''}`)
  }

  const prompt = mounted ? PROMPTS[new Date().getDate() % PROMPTS.length] : PROMPTS[0]
  const displayName = name === null ? '' : firstName(name)

  return (
    <div className="home">
      {/* ── Row 1: today + Kokoro ── */}
      <div className="home__row home__row--top">
        <Scene src={`/art/${greet?.scene ?? 'dusk'}.webp`} priority position="center 78%" className="home__greet"
          scrim="linear-gradient(180deg, rgba(15,30,46,0.55) 0%, rgba(15,30,46,0.1) 50%, rgba(15,30,46,0.65) 100%)" sizes="(max-width: 900px) 100vw, 66vw">
          <div className="home__greet-inner">
            <p className="t-body" style={{ color: 'var(--on-dark)', opacity: 0.9 }} suppressHydrationWarning>
              {mounted ? new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }) : ' '}
            </p>
            <h1 className="t-h1 home__hello">
              {greet ? `${greet.line}, ` : ' '}{displayName && <span className="home__name">{displayName}</span>}
            </h1>
            <p className="t-lead" style={{ color: 'var(--on-dark)', minHeight: '1.55em' }}>{moods ? streak.line : ''}</p>

            <div className="glass glass--dark home__checkin" aria-live="polite">
              {today && !changing ? (
                <div className="home__checked">
                  <div className="row" style={{ gap: 12, flexWrap: 'nowrap' }}>
                    <MoodGlyph score={today.score} size={44} />
                    <p className="t-h4">Today: {today.label.toLowerCase()}</p>
                    <button type="button" className="text-btn" onClick={() => setChanging(true)}>Change</button>
                  </div>
                  <Pill href={today.next.href} variant="white" size="sm" knob>{today.next.label}</Pill>
                </div>
              ) : (
                <>
                  <p id="checkin-q" className="t-label" style={{ fontSize: 16, marginBottom: 12 }}>
                    {changing ? 'Changed your mind? Pick again.' : 'How are you arriving today?'}
                  </p>
                  <MoodPicker value={null} onChange={checkIn} variant="glass" compact labelledBy="checkin-q" />
                  {saving && <p className="t-small" style={{ marginTop: 10 }}>Saving…</p>}
                  {saveError && <p className="t-small" role="alert" style={{ marginTop: 10, color: 'var(--marigold)' }}>{saveError}</p>}
                </>
              )}
            </div>
          </div>
        </Scene>

        <Scene src="/art/night.webp" position="center 80%" className="home__kokoro"
          scrim="linear-gradient(180deg, rgba(7,14,24,0.2), rgba(7,14,24,0.75))" sizes="(max-width: 900px) 100vw, 34vw">
          <div className="home__kokoro-inner">
            <h2 className="t-h2" style={{ color: 'var(--paper)' }}>
              what&apos;s on your mind {greet?.scene === 'night' || greet?.scene === 'dusk' ? 'tonight' : 'today'}?
            </h2>
            <p className="t-body" style={{ color: 'var(--on-dark-2)' }}>Kokoro is listening.</p>
            <div className="row" style={{ gap: 8 }}>
              {STARTERS.map(s => (
                <Link key={s} href={`/dashboard/kokoro?q=${encodeURIComponent(s)}`} className="chip chip--glass">{s}</Link>
              ))}
            </div>
            <form onSubmit={ask} className="home__ask">
              <label htmlFor="ask-kokoro" className="sr-only">Message Kokoro</label>
              <input id="ask-kokoro" className="input" placeholder="Type to Kokoro…" value={message} onChange={e => setMessage(e.target.value)} />
              <button type="submit" className="pill pill--marigold" aria-label="Send to Kokoro" style={{ width: 54, padding: 0 }}><Send size={18} /></button>
            </form>
          </div>
        </Scene>
      </div>

      {/* ── Row 2: numbers on torn paper ── */}
      <section aria-label="Your numbers" className="home__row home__notes">
        <TornPaper color="var(--paper)" tilt={-1.4} seed={4} style={{ position: 'relative' }}>
          <Washi at="tc" tone="sky" />
          <h2 className="t-h4">this week</h2>
          <ol className="home__week" aria-label="Moods this week">
            {week.map(d => {
              const m = moodFor(d.score)
              return (
                <li key={d.key} aria-label={`${d.label}: ${m ? m.label : d.future ? 'still ahead' : 'no check-in'}`} data-today={d.isToday}>
                  {m ? <MoodGlyph score={m.score} size={34} /> : <span className={`home__dot ${d.future ? 'home__dot--future' : ''}`} />}
                  <span aria-hidden="true">{d.label.slice(0, 2)}</span>
                </li>
              )
            })}
          </ol>
        </TornPaper>
        <TornPaper color="var(--marigold)" tilt={1.2} seed={8} style={{ position: 'relative' }}>
          <Washi at="tr" tone="rose" />
          <h2 className="t-h4">streak</h2>
          <p className="t-num" style={{ marginTop: 6 }}>{moods ? streak.n : '–'}</p>
          <p className="t-small">{streak.n === 1 ? 'day in a row' : 'days in a row'}</p>
          {streak.n >= 3 && <HandNote style={{ marginTop: 6, transform: 'rotate(-3deg)' }}>look at you go</HandNote>}
        </TornPaper>
        <TornPaper color="var(--mint)" tilt={-0.8} seed={12}>
          <h2 className="t-h4">focus today</h2>
          {focusMin > 0 ? (
            <><p className="t-num" style={{ marginTop: 6 }}>{focusMin}</p><p className="t-small">minutes focused</p></>
          ) : (
            <p className="t-body" style={{ marginTop: 8 }}>Ready when you are.</p>
          )}
          <div style={{ marginTop: 12 }}><Pill href="/dashboard/pomodoro" variant="tape" size="sm">Start 25 min</Pill></div>
        </TornPaper>
      </section>

      {/* ── Row 3: tools ── */}
      <section aria-labelledby="tools-h" className="home__tools">
        <div className="home__tools-head">
          <TapeHeading id="tools-h" lines={['your tools']} accent="tools" tone="paper" />
          <button type="button" className="pill pill--glass pill--sm" aria-pressed={reordering} onClick={() => setReordering(r => !r)}>
            {reordering ? 'Done' : 'Reorder'}
          </button>
        </div>

        {reordering ? (
          <Reorder.Group axis="y" values={order} onReorder={saveOrder} className="home__reorder" as="ol">
            {tools.map((t, i) => (
              <Reorder.Item key={t.id} value={t.id} className="home__reorder-item" as="li">
                <GripVertical size={18} aria-hidden="true" style={{ opacity: 0.6, cursor: 'grab' }} />
                <span style={{ flex: 1 }}>{t.title}</span>
                <button type="button" className="icon-btn" aria-label={`Move ${t.title} up`} disabled={i === 0} onClick={() => move(i, -1)}><ArrowUp size={18} /></button>
                <button type="button" className="icon-btn" aria-label={`Move ${t.title} down`} disabled={i === tools.length - 1} onClick={() => move(i, 1)}><ArrowDown size={18} /></button>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        ) : (
          <ul className="home__grid">
            {tools.map((t, i) => (
              <li key={t.id} className={t.id === 'kokoro' ? 'home__grid-wide' : ''} style={{ position: 'relative' }}>
                <Washi at={i % 3 === 0 ? 'tl' : i % 3 === 1 ? 'tc' : 'tr'} tone={(['rose', 'mint', 'sky', undefined] as const)[i % 4]} />
                <Polaroid href={t.href} tilt={TILTS[i]} frameStyle={{ background: t.bg, aspectRatio: t.id === 'kokoro' ? '2.1 / 1' : '4 / 3', display: 'grid', placeItems: 'center' }}
                  caption={<><h3 className="t-h4">{t.title}</h3><p className="t-small faint" style={{ marginTop: 2 }}>{t.line}</p></>}>
                  <Sticker name={t.sticker} size={t.id === 'kokoro' ? 120 : 96} tilt={TILTS[(i + 3) % TILTS.length] * 3} />
                </Polaroid>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ── Row 4: reflect + help ── */}
      <div className="home__row home__row--bottom">
        <Scene src="/art/dawn.webp" position="center 70%" className="home__journal" scrim="linear-gradient(90deg, rgba(255,253,247,0.92) 0%, rgba(255,253,247,0.75) 55%, rgba(255,253,247,0) 100%)" sizes="(max-width: 900px) 100vw, 66vw">
          <div className="home__journal-inner">
            <h2 className="t-h4" style={{ color: 'var(--ink-2)' }}>tonight&apos;s journal prompt</h2>
            <p className="t-h2" style={{ maxWidth: 520 }}>{prompt}</p>
            <div><Pill href={`/dashboard/journal?new=1&prompt=${encodeURIComponent(prompt)}`} variant="tape" knob>Write</Pill></div>
          </div>
        </Scene>
        <section aria-labelledby="help-h" className="home__help">
          <Sticker name="phoneHeart" size={84} tilt={-6} />
          <h2 id="help-h" className="t-h3">talk to a real person</h2>
          <ul className="stack-xs" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {HELPLINES.slice(0, 2).map(h => (
              <li key={h.name}><a href={h.href} className="link" style={{ fontWeight: 600 }}>{h.name}: {h.number}</a></li>
            ))}
          </ul>
          <Link href="/dashboard/helpline" className="link t-small">All helplines</Link>
        </section>
      </div>

      {!surveyDone && (
        <section aria-labelledby="survey-h" className="home__survey">
          <Sticker name="papers" size={80} tilt={-8} />
          <div style={{ flex: 1 }}>
            <h2 id="survey-h" className="t-h4">help the study, in about five minutes</h2>
            <p className="t-small" style={{ color: 'var(--on-dark-2)', marginTop: 4 }}>A few questions about your school and subjects. Optional, and you can stop any time.</p>
          </div>
          <Pill href="/dashboard/survey" variant="white" size="sm">Answer the questions</Pill>
        </section>
      )}

      <section aria-labelledby="people-h" className="home__people">
        <div className="home__faces" aria-hidden="true">
          <Image src="/team/saad-nizami.jpg" alt="" width={64} height={64} />
          <Image src="/team/havaida-munir.jpg" alt="" width={64} height={64} />
        </div>
        <div style={{ flex: 1, minWidth: 220 }}>
          <h2 id="people-h" className="t-h4">the people behind satori</h2>
          <p className="t-small" style={{ color: 'var(--on-dark-2)', marginTop: 4 }}>
            Who runs the study, what it looks at, and the research paper it has produced so far.
          </p>
        </div>
        <Pill href="/about" variant="glass" size="sm" knob>Read about the research</Pill>
      </section>

      <p className="t-small home__foot">
        Your journal is private. Mood and stress check-ins go to the research study only if you said yes.{' '}
        <Link href="/dashboard/settings" className="link">Change this in Settings</Link>.
      </p>

      <style>{`
        .home { display: grid; gap: 20px; }
        .home ul, .home ol { list-style: none; margin: 0; padding: 0; }
        .home__row--top { display: grid; grid-template-columns: minmax(0, 2fr) minmax(0, 1fr); gap: 20px; }
        .home__greet { border-radius: var(--r-lg); min-height: 520px; background: var(--dusk); }
        .home__greet-inner { position: relative; height: 100%; min-height: 520px; display: flex; flex-direction: column; gap: 10px; padding: clamp(22px, 3vw, 36px); }
        .home__hello { color: var(--paper); text-shadow: 0 2px 0 rgba(0,0,0,0.2), 0 6px 30px rgba(0,0,0,0.35); }
        .home__name { background: var(--marigold); color: var(--ink); padding: 0 0.2em; box-decoration-break: clone; -webkit-box-decoration-break: clone; display: inline-block; transform: rotate(-1.5deg); text-shadow: none; }
        .home__checkin { margin-top: auto; padding: 18px; max-width: 640px; }
        .home__checked { display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap; }
        .home__kokoro { border-radius: var(--r-lg); background: var(--night); }
        .home__kokoro-inner { position: relative; height: 100%; min-height: 520px; display: flex; flex-direction: column; justify-content: flex-end; gap: 14px; padding: clamp(22px, 3vw, 30px); }
        .home__ask { display: flex; gap: 8px; }
        .home__ask .input { min-height: 50px; border-radius: var(--r-pill); background: rgba(255,253,247,0.95); }
        .home__notes { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; padding: 12px 6px; }
        .home__notes .torn__sheet { min-height: 170px; }
        .home__week { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; margin-top: 14px !important; text-align: center; font-size: 13px; }
        .home__week li { display: grid; justify-items: center; gap: 4px; padding: 4px 0; border-radius: 10px; }
        .home__week li[data-today="true"] { box-shadow: inset 0 0 0 1.5px var(--ink); }
        .home__dot { width: 24px; height: 24px; margin: 5px; border-radius: 50%; border: 1.5px solid #8A958F; }
        .home__dot--future { border-style: dashed; }
        .home__tools { padding-top: 30px; }
        .home__tools-head { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 30px; }
        .home__grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 30px 28px; grid-auto-flow: dense; }
        .home__grid-wide { grid-column: span 2; }
        .home__reorder { display: grid; gap: 8px; max-width: 560px; }
        .home__reorder-item { display: flex; align-items: center; gap: 10px; padding: 6px 6px 6px 16px; border-radius: 16px; background: var(--paper); color: var(--ink); font-weight: 600; }
        .home__reorder-item .icon-btn:disabled { opacity: 0.3; cursor: not-allowed; }
        .home__reorder-item .icon-btn:hover { background: var(--fog); }
        .home__row--bottom { display: grid; grid-template-columns: minmax(0, 2fr) minmax(0, 1fr); gap: 20px; padding-top: 20px; }
        .home__journal { border-radius: var(--r-lg); color: var(--ink); background: var(--paper); }
        .home__journal-inner { position: relative; display: grid; gap: 16px; padding: clamp(24px, 3vw, 36px); min-height: 300px; align-content: center; }
        .home__help { display: grid; gap: 10px; align-content: start; padding: 26px; border-radius: var(--r-lg); background: var(--marigold-2); color: var(--ink); }
        .home__help .link { color: var(--ink); }
        .home__survey { display: flex; align-items: center; gap: 18px; flex-wrap: wrap; padding: 18px 22px; border-radius: var(--r-md); border: 1px dashed var(--line-dark); }
        .home__foot { color: var(--on-dark-2); padding-top: 8px; }
        .home__people { display: flex; align-items: center; gap: 18px; flex-wrap: wrap; padding: 18px 22px; border-radius: var(--r-md); background: rgba(255,253,247,0.06); border: 1px solid var(--line-dark); }
        .home__faces { display: flex; }
        .home__faces img { width: 56px; height: 56px; border-radius: 50%; object-fit: cover; box-shadow: 0 0 0 3px var(--night); }
        .home__faces img + img { margin-left: -14px; }
        @media (max-width: 900px) {
          .home__row--top, .home__row--bottom { grid-template-columns: 1fr; }
          .home__kokoro-inner { min-height: 360px; }
          .home__notes { grid-template-columns: 1fr; gap: 14px; }
          .home__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 22px 16px; }
        }
        @media (max-width: 560px) {
          .home__greet, .home__greet-inner { min-height: 480px; }
          .home__grid-wide { grid-column: span 2; }
          .home .mood--compact { min-height: 70px; font-size: 13px; }
          .home .mood--compact svg { width: 28px; height: 28px; }
          .home .mood-grid { gap: 5px; }
        }
      `}</style>
    </div>
  )
}
