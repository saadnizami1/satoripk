'use client'

import { useState, useEffect, useRef, type ReactNode, type CSSProperties } from 'react'
import { motion, useInView, useReducedMotion, useScroll, useMotionValueEvent } from 'framer-motion'
import Link from 'next/link'

/* ────────────────────────────────────────────────────────────────
   Satori — landing page
   Concept: a research dossier, typeset like a printed document.
   Swiss grid, masked type reveals, index rows instead of cards.
──────────────────────────────────────────────────────────────── */

const EASE = [0.25, 0, 0, 1] as const

/* ── Masked line reveal — text slides up from behind a crop ── */
function Reveal({
  children,
  delay = 0,
  once = true,
}: {
  children: ReactNode
  delay?: number
  once?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once, margin: '-10% 0px' })
  const reduce = useReducedMotion()
  return (
    <div ref={ref} style={{ overflow: 'hidden' }}>
      <motion.div
        initial={{ y: reduce ? 0 : '110%' }}
        animate={inView ? { y: 0 } : { y: reduce ? 0 : '110%' }}
        transition={{ duration: 0.9, delay, ease: EASE }}
      >
        {children}
      </motion.div>
    </div>
  )
}

/* ── Fade-in for secondary content ── */
function Fade({
  children,
  delay = 0,
  style,
}: {
  children: ReactNode
  delay?: number
  style?: CSSProperties
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-8% 0px' })
  const reduce = useReducedMotion()
  return (
    <motion.div
      ref={ref}
      style={style}
      initial={{ opacity: 0, y: reduce ? 0 : 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}

/* ── Horizontal rule that draws itself in ── */
function Rule({ delay = 0, color = 'var(--border)' }: { delay?: number; color?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-5% 0px' })
  const reduce = useReducedMotion()
  return (
    <div ref={ref}>
      <motion.div
        initial={{ scaleX: reduce ? 1 : 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 1.1, delay, ease: EASE }}
        style={{ height: 1.5, background: color, transformOrigin: 'left' }}
      />
    </div>
  )
}

/* ── Count-up numeral ── */
function Counter({ end, suffix = '' }: { end: number; suffix?: string }) {
  const [n, setN] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-15% 0px' })
  useEffect(() => {
    if (!inView) return
    const t0 = performance.now()
    const dur = 1600
    let raf = 0
    const tick = (t: number) => {
      const p = Math.min((t - t0) / dur, 1)
      setN(Math.round((1 - Math.pow(1 - p, 3)) * end))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, end])
  return <span ref={ref}>{n}{suffix}</span>
}

/* ── Live Lahore clock — renders after mount to avoid hydration drift ── */
function LahoreClock() {
  const [time, setTime] = useState<string | null>(null)
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Karachi',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false,
    })
    const tick = () => setTime(fmt.format(new Date()))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])
  return (
    <span style={{ fontVariantNumeric: 'tabular-nums' }}>
      LHE {time ?? '--:--:--'}
    </span>
  )
}

/* ── Section folio label ── */
function Folio({ n, title }: { n: string; title: string }) {
  return (
    <Fade>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 10,
          letterSpacing: '0.2em', color: 'var(--ink)',
        }}>
          §{n}
        </span>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 10,
          letterSpacing: '0.2em', color: 'var(--ink-3)',
        }}>
          {title}
        </span>
      </div>
    </Fade>
  )
}

/* ── Data ─────────────────────────────────────────────────────── */

const TOOLS = [
  { n: '01', name: 'AI COMPANION',    desc: 'Listens without judgment. Trained on what students here actually face.' },
  { n: '02', name: 'MOOD TRACKING',   desc: 'Log the day in seconds. Patterns emerge when you look back.' },
  { n: '03', name: 'PRIVATE JOURNAL', desc: 'Write freely. Entries stay yours unless you decide otherwise.' },
  { n: '04', name: 'FOCUS TIMER',     desc: 'Twenty-five minutes of work, five to breathe. Deceptively effective.' },
  { n: '05', name: 'BREATHING GUIDES',desc: 'Four science-backed techniques. Under five minutes, anywhere.' },
  { n: '06', name: 'STRESS TRACKER',  desc: 'Academic pressure, acknowledged — tracked so it can be managed.' },
  { n: '07', name: 'MOOD INSIGHTS',   desc: 'Your emotional patterns, visualised across weeks and months.' },
  { n: '08', name: 'CRISIS HELPLINES',desc: 'Real humans, 24/7. Pakistan-specific numbers, one tap away.' },
]

const SCHOOLS = [
  'INTERNATIONAL SCHOOL LAHORE',
  'WAHADAT GOVERNMENT SCHOOL',
  'LAHORE GRAMMAR SCHOOL ISLAMABAD',
  'QUETTA GRAMMAR SCHOOL',
  'AL-HUDA MODEL SCHOOL PESHAWAR',
  "ST. PATRICK'S HIGH SCHOOL KARACHI",
  'KABUL INTERNATIONAL MODEL SCHOOL',
]

const TICKER = TOOLS.map(t => t.name)

/* ── Page ─────────────────────────────────────────────────────── */

export default function LandingPage() {
  const [mounted, setMounted] = useState(false)
  const [headerSolid, setHeaderSolid] = useState(false)
  // Scroll progress is a motion value bound straight to the DOM, so
  // scrolling never re-renders the page; the header only re-renders when
  // it crosses the threshold.
  const { scrollY, scrollYProgress } = useScroll()
  useMotionValueEvent(scrollY, 'change', y => setHeaderSolid(y > 60))

  useEffect(() => {
    setMounted(true)
    setHeaderSolid(window.scrollY > 60)
  }, [])

  const PX = 'clamp(20px, 5vw, 80px)'

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--ink)', overflowX: 'clip' }}>

      <style>{`
        @keyframes tk { from { transform: translateX(0) } to { transform: translateX(-50%) } }
        .tk-row { animation: tk 36s linear infinite; }
        .tk-wrap:hover .tk-row { animation-play-state: paused; }

        @keyframes hero-rise { from { transform: translateY(105%) } to { transform: translateY(0) } }
        @keyframes hero-fade { from { opacity: 0 } to { opacity: 1 } }
        .hero-rise { animation: hero-rise 1.1s cubic-bezier(0.25,0,0,1) 0.15s both; }
        .hero-fade { animation: hero-fade 0.7s ease both; }
        @media (prefers-reduced-motion: reduce) {
          .hero-rise, .hero-fade { animation: none; }
        }

        @keyframes dot-pulse { 0%,100% { opacity: 1 } 50% { opacity: 0.25 } }
        .dot-pulse { animation: dot-pulse 1.8s ease-in-out infinite; }

        /* Index rows — full invert on hover */
        .idx-row {
          display: grid;
          grid-template-columns: clamp(40px,6vw,80px) 1fr minmax(0, 42%);
          align-items: baseline;
          gap: clamp(12px, 2.5vw, 32px);
          padding: clamp(18px, 3vw, 28px) clamp(20px, 5vw, 80px);
          border-bottom: 1.5px solid var(--border);
          background: transparent;
          transition: background 160ms cubic-bezier(0.25,0,0,1);
          position: relative;
        }
        .idx-row:hover { background: var(--ink); }
        .idx-num  { transition: color 160ms; }
        .idx-name { transition: color 160ms, transform 240ms cubic-bezier(0.25,0,0,1); }
        .idx-desc { transition: color 160ms; }
        .idx-row:hover .idx-num  { color: var(--bg) !important; opacity: 0.5; }
        .idx-row:hover .idx-name { color: var(--bg) !important; transform: translateX(10px); }
        .idx-row:hover .idx-desc { color: var(--bg) !important; opacity: 0.75; }
        @media (max-width: 720px) {
          .idx-row { grid-template-columns: clamp(40px,6vw,80px) 1fr; }
          .idx-desc { grid-column: 2; }
          .idx-row:hover .idx-name { transform: none; }
        }

        /* Ledger rows */
        .ledger-row {
          display: flex; align-items: baseline; gap: 20px;
          padding: 16px clamp(20px, 5vw, 80px);
          border-bottom: 1px solid var(--border-2);
          transition: background 140ms;
        }
        .ledger-row:hover { background: var(--bg-card); }

        /* CTA buttons */
        .cta-main {
          display: inline-flex; align-items: center; gap: 12px;
          font-family: var(--font-display); font-weight: 800; font-size: 13px;
          letter-spacing: 0.06em; text-decoration: none;
          color: var(--ink-invert); background: var(--bg-invert);
          border: 1.5px solid var(--border); padding: 18px 34px;
          transition: box-shadow 120ms cubic-bezier(0.25,0,0,1), transform 120ms cubic-bezier(0.25,0,0,1);
          cursor: pointer;
        }
        .cta-main:hover { box-shadow: 5px 5px 0 var(--border); transform: translate(-3px,-3px); }
        .cta-ghost {
          display: inline-flex; align-items: center;
          font-family: var(--font-display); font-weight: 700; font-size: 13px;
          letter-spacing: 0.06em; text-decoration: none;
          color: var(--ink-2); border: 1.5px solid var(--border-2);
          padding: 18px 26px;
          transition: border-color 140ms, color 140ms;
          cursor: pointer;
        }
        .cta-ghost:hover { border-color: var(--border); color: var(--ink); }

        .quiet-link {
          font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.12em;
          color: var(--ink-3); text-decoration: none; transition: color 140ms;
        }
        .quiet-link:hover { color: var(--ink); }

        /* Footer watermark — outlined, cropped at the page edge */
        .watermark {
          font-family: var(--font-display); font-weight: 800;
          font-size: clamp(110px, 21vw, 340px);
          line-height: 0.76; letter-spacing: -0.04em;
          color: transparent;
          -webkit-text-stroke: 1.5px var(--ink);
          user-select: none;
          transform: translateY(0.14em);
        }

        /* Hero vertical hairlines — Swiss column guides */
        .hair-v { position: absolute; top: 0; bottom: 0; width: 1px; background: var(--border-2); opacity: 0.45; }
        @media (max-width: 720px) { .hair-v { display: none } }

        /* Abstract — sticky folio beside copy, stacked on phones */
        .abs-grid {
          display: grid;
          grid-template-columns: minmax(140px, 1fr) minmax(0, 3fr);
          gap: clamp(24px, 4vw, 64px);
          align-items: start;
        }
        @media (max-width: 720px) {
          .abs-grid { grid-template-columns: 1fr; }
          .abs-grid .abs-folio { position: static !important; }
        }
      `}</style>

      {/* ── Scroll progress ── */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 2, zIndex: 300 }}>
        <motion.div style={{
          height: '100%', background: 'var(--ink)',
          scaleX: scrollYProgress, transformOrigin: 'left',
        }} />
      </div>

      {/* ── Header ── */}
      <header style={{
        position: 'fixed', top: 2, left: 0, right: 0, zIndex: 200,
        padding: `16px ${PX}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: headerSolid ? 'rgba(244,242,238,0.92)' : 'transparent',
        backdropFilter: headerSolid ? 'blur(16px)' : 'none',
        WebkitBackdropFilter: headerSolid ? 'blur(16px)' : 'none',
        borderBottom: `1.5px solid ${headerSolid ? 'var(--border)' : 'transparent'}`,
        transition: 'background 300ms ease, border-color 300ms ease',
      }}>
        <span style={{
          fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: 15, letterSpacing: '-0.02em',
        }}>
          SATORI.
        </span>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 10,
          letterSpacing: '0.14em', color: 'var(--ink-3)',
        }}>
          <LahoreClock />
        </span>
      </header>

      {/* ══════════════════════════════════════════════
          HERO — masthead
      ══════════════════════════════════════════════ */}
      <section style={{
        minHeight: '100dvh',
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        position: 'relative',
        padding: `clamp(96px,14vh,160px) 0 0`,
      }}>
        {/* Column guides */}
        <div className="hair-v" style={{ left: '33.33%' }} />
        <div className="hair-v" style={{ left: '66.66%' }} />

        {/* Top-right dateline */}
        {mounted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.8 }}
            style={{
              position: 'absolute', top: 'clamp(84px,12vh,140px)', right: PX,
              textAlign: 'right',
              fontFamily: 'var(--font-mono)', fontSize: 10, lineHeight: 2,
              letterSpacing: '0.14em', color: 'var(--ink-3)',
            }}
          >
            FIELD STUDY · VOL. 01<br />
            31.5204° N, 74.3587° E
          </motion.div>
        )}

        {/* Wordmark — one masked reveal, cropped tight to the rule */}
        <div style={{ padding: `0 ${PX}`, position: 'relative', zIndex: 1 }}>
          <div style={{ overflow: 'hidden' }}>
            {/* CSS animation, not JS: the wordmark is the LCP element and
                must paint before hydration. */}
            <h1
              className="hero-rise"
              style={{
                fontFamily: 'var(--font-display)', fontWeight: 800,
                fontSize: 'clamp(72px, 16.5vw, 250px)',
                lineHeight: 0.94, letterSpacing: '-0.045em',
                margin: 0, whiteSpace: 'nowrap',
              }}
            >
              SATORI<span style={{ color: 'var(--accent)' }}>.</span>
            </h1>
          </div>
        </div>

        {/* Masthead rule */}
        <div style={{ margin: `clamp(20px,3vh,36px) 0 0` }}>
          <Rule delay={0.9} />
        </div>

        {/* Metadata strip — three mono columns */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          borderBottom: '1.5px solid var(--border)',
        }}>
          {[
            {
              k: 'THE STUDY',
              v: 'Mood, stress and focus infrastructure for students navigating academic pressure in Pakistan.',
              delay: 1.15,
            },
            {
              k: 'INSTITUTION',
              v: 'Lahore Garrison University. Principal investigator: Saad Nizami.',
              delay: 1.3,
            },
            {
              k: 'STATUS',
              v: 'Recruiting participants — free for students.',
              delay: 1.45,
              live: true,
            },
          ].map(({ k, v, delay, live }, i) => (
            <div
              key={k}
              className="hero-fade"
              style={{
                animationDelay: `${delay}s`,
                padding: `clamp(20px,3vh,30px) clamp(20px,3vw,36px)`,
                borderLeft: i > 0 ? '1px solid var(--border-2)' : 'none',
              }}
            >
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 9,
                letterSpacing: '0.2em', color: 'var(--ink-3)',
                marginBottom: 12,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                {live && (
                  <span className="dot-pulse" style={{
                    width: 6, height: 6, background: 'var(--accent)',
                    display: 'inline-block', flexShrink: 0,
                  }} />
                )}
                {k}
              </div>
              <div style={{
                fontFamily: 'var(--font-body)', fontSize: 13.5,
                lineHeight: 1.6, color: 'var(--ink-2)', maxWidth: 340,
              }}>
                {v}
              </div>
            </div>
          ))}
        </div>

        {/* Ticker — the eight instruments, single pass */}
        <div className="tk-wrap" style={{
          overflow: 'hidden',
          borderBottom: '1.5px solid var(--border)',
          padding: '13px 0',
        }}>
          <div className="tk-row" style={{ display: 'flex', width: 'max-content', whiteSpace: 'nowrap' }}>
            {[...TICKER, ...TICKER].map((t, i) => (
              <span key={i} style={{
                fontFamily: 'var(--font-mono)', fontSize: 11,
                letterSpacing: '0.16em', color: 'var(--ink-3)',
                padding: '0 34px',
              }}>
                {t}
                <span style={{ marginLeft: 34, color: 'var(--border-2)' }}>/</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          §01 — ABSTRACT
      ══════════════════════════════════════════════ */}
      <section style={{ padding: `clamp(72px,12vh,140px) ${PX}` }}>
        <div className="abs-grid">
          <div className="abs-folio" style={{ position: 'sticky', top: 90 }}>
            <Folio n="01" title="ABSTRACT" />
          </div>

          <div>
            {[
              { t: 'Academic pressure is real.', mute: false },
              { t: 'Satori is a daily practice for the students living it —', mute: false },
              { t: 'not a replacement for care.', mute: true },
            ].map(({ t, mute }, i) => (
              <Reveal key={i} delay={i * 0.12}>
                <p style={{
                  fontFamily: 'var(--font-display)', fontWeight: 800,
                  fontSize: 'clamp(26px, 4.6vw, 62px)',
                  lineHeight: 1.08, letterSpacing: '-0.03em',
                  color: mute ? 'var(--ink-3)' : 'var(--ink)',
                  margin: '0 0 8px',
                }}>
                  {t}
                </p>
              </Reveal>
            ))}

            <Fade delay={0.4} style={{ marginTop: 36 }}>
              <p style={{
                fontFamily: 'var(--font-body)', fontSize: 'clamp(14px,1.7vw,17px)',
                lineHeight: 1.75, color: 'var(--ink-2)', maxWidth: 520,
              }}>
                Eight instruments in one place — built alongside more than 150 students
                in seven cities, and studied with the rigour of a university research
                programme. Free to use. Private by default. No ads, no data sold.
              </p>
            </Fade>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          §02 — THE TOOLKIT (index rows)
      ══════════════════════════════════════════════ */}
      <section style={{ paddingBottom: 'clamp(72px,12vh,140px)' }}>
        <div style={{ padding: `0 ${PX}`, marginBottom: 'clamp(32px,5vh,56px)' }}>
          <Folio n="02" title="THE TOOLKIT" />
          <div style={{ height: 20 }} />
          <Reveal>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontWeight: 800,
              fontSize: 'clamp(34px,6vw,80px)', letterSpacing: '-0.035em',
              lineHeight: 0.98, margin: 0,
            }}>
              EIGHT INSTRUMENTS.
            </h2>
          </Reveal>
        </div>

        <Rule />
        <div>
          {TOOLS.map((t, i) => (
            <Fade key={t.n} delay={Math.min(i * 0.04, 0.24)}>
              <div className="idx-row">
                <span className="idx-num" style={{
                  fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)',
                }}>
                  {t.n}
                </span>
                <span className="idx-name" style={{
                  fontFamily: 'var(--font-display)', fontWeight: 800,
                  fontSize: 'clamp(18px, 3vw, 38px)', letterSpacing: '-0.02em',
                  color: 'var(--ink)', display: 'inline-block',
                }}>
                  {t.name}
                </span>
                <span className="idx-desc" style={{
                  fontFamily: 'var(--font-body)', fontSize: 13.5,
                  lineHeight: 1.6, color: 'var(--ink-2)',
                }}>
                  {t.desc}
                </span>
              </div>
            </Fade>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          §03 — THE RESEARCH (inverted)
      ══════════════════════════════════════════════ */}
      <section style={{
        background: 'var(--bg-invert)', color: 'var(--ink-invert)',
        padding: `clamp(72px,12vh,140px) ${PX}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 'clamp(36px,6vh,64px)' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.2em' }}>§03</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.2em', color: 'rgba(244,242,238,0.4)' }}>
            THE RESEARCH
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 'clamp(48px,7vw,110px)',
          alignItems: 'start',
        }}>
          <div>
            <Reveal>
              <h2 style={{
                fontFamily: 'var(--font-display)', fontWeight: 800,
                fontSize: 'clamp(34px,5.2vw,72px)', lineHeight: 1.02,
                letterSpacing: '-0.03em', margin: '0 0 28px',
              }}>
                MORE THAN<br />AN APP.
              </h2>
            </Reveal>
            <Fade delay={0.15}>
              <p style={{
                fontFamily: 'var(--font-body)', fontSize: 'clamp(14px,1.7vw,17px)',
                color: 'rgba(244,242,238,0.65)', lineHeight: 1.75,
                maxWidth: 440, margin: 0,
              }}>
                Every session contributes to an active psychological study on student
                mental health across Pakistan. The goal is research that shapes
                policy — not research that fills a database.
              </p>
            </Fade>
          </div>

          {/* Stats — hairline table */}
          <Fade delay={0.2}>
            <div style={{ borderTop: '1px solid rgba(244,242,238,0.25)' }}>
              {([
                { end: 30,  suffix: '+', label: 'SCHOOLS PILOTED' },
                { end: 150, suffix: '+', label: 'STUDENT PARTICIPANTS' },
                { end: 7,   suffix: '',  label: 'CITIES' },
                { end: 1,   suffix: '',  label: 'UNIVERSITY PARTNER' },
              ] as const).map((s, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
                  gap: 24, padding: 'clamp(18px,2.6vh,26px) 0',
                  borderBottom: '1px solid rgba(244,242,238,0.25)',
                }}>
                  <span style={{
                    fontFamily: 'var(--font-display)', fontWeight: 800,
                    fontSize: 'clamp(40px,5.5vw,68px)', lineHeight: 1,
                    letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums',
                  }}>
                    <Counter end={s.end} suffix={s.suffix} />
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 10,
                    letterSpacing: '0.16em', color: 'rgba(244,242,238,0.45)',
                    textAlign: 'right',
                  }}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </Fade>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          §04 — PARTICIPATING SCHOOLS (ledger)
      ══════════════════════════════════════════════ */}
      <section style={{ padding: `clamp(72px,12vh,140px) 0 0` }}>
        <div style={{ padding: `0 ${PX}`, marginBottom: 'clamp(28px,4vh,44px)' }}>
          <Folio n="04" title="PARTICIPATING SCHOOLS" />
        </div>

        <Rule />
        {SCHOOLS.map((s, i) => (
          <Fade key={s} delay={Math.min(i * 0.03, 0.18)}>
            <div className="ledger-row">
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 10,
                color: 'var(--ink-3)', width: 28, flexShrink: 0,
              }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <span style={{
                fontFamily: 'var(--font-display)', fontWeight: 700,
                fontSize: 'clamp(13px,1.8vw,17px)', letterSpacing: '0.04em',
                flex: 1, minWidth: 0,
              }}>
                {s}
              </span>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 9,
                letterSpacing: '0.18em', color: 'var(--ink-3)', flexShrink: 0,
              }}>
                ACTIVE
              </span>
            </div>
          </Fade>
        ))}
        <div style={{
          padding: `16px ${PX}`,
          borderBottom: '1.5px solid var(--border)',
        }}>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 10,
            letterSpacing: '0.16em', color: 'var(--ink-3)',
          }}>
            + 23 MORE ACROSS PAKISTAN
          </span>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          §05 — FOR ADMINISTRATORS
      ══════════════════════════════════════════════ */}
      <section style={{ padding: `clamp(72px,12vh,140px) ${PX}` }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 'clamp(40px,6vw,90px)',
          alignItems: 'end',
        }}>
          <div>
            <Folio n="05" title="FOR ADMINISTRATORS" />
            <div style={{ height: 20 }} />
            <Reveal>
              <h2 style={{
                fontFamily: 'var(--font-display)', fontWeight: 800,
                fontSize: 'clamp(30px,4.6vw,60px)', lineHeight: 1.04,
                letterSpacing: '-0.028em', margin: '0 0 22px',
              }}>
                RUNNING A SCHOOL?
              </h2>
            </Reveal>
            <Fade delay={0.15}>
              <p style={{
                fontFamily: 'var(--font-body)', fontSize: 'clamp(14px,1.7vw,17px)',
                color: 'var(--ink-2)', lineHeight: 1.72, maxWidth: 420, margin: 0,
              }}>
                If you&apos;d like your institution to take part in the research — or
                simply want Satori for your students — we&apos;d like to hear from you.
              </p>
            </Fade>
          </div>

          <Fade delay={0.2}>
            <div style={{ border: '1.5px solid var(--border)', padding: 'clamp(28px,4vw,44px)' }}>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 10,
                letterSpacing: '0.16em', color: 'var(--ink-3)',
                display: 'block', marginBottom: 18,
              }}>
                RESEARCH COLLABORATION
              </span>
              <p style={{
                fontFamily: 'var(--font-body)', fontSize: 14,
                color: 'var(--ink-2)', lineHeight: 1.7, margin: '0 0 28px',
              }}>
                We are actively expanding to more schools as part of the ongoing
                study at Lahore Garrison University.
              </p>
              <a href="mailto:saadnizami@icloud.com" className="cta-main">
                CONTACT US <span aria-hidden>→</span>
              </a>
            </div>
          </Fade>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          §06 — BEGIN (the only sign-up on the page)
      ══════════════════════════════════════════════ */}
      <section style={{ borderTop: '1.5px solid var(--border)', padding: `clamp(80px,14vh,160px) ${PX}` }}>
        <Folio n="06" title="GET STARTED — FREE" />
        <div style={{ height: 'clamp(28px,4vh,44px)' }} />

        <Reveal>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontWeight: 800,
            fontSize: 'clamp(64px,13vw,190px)', lineHeight: 0.9,
            letterSpacing: '-0.045em', margin: '0 0 40px',
          }}>
            BEGIN<span style={{ color: 'var(--accent)' }}>.</span>
          </h2>
        </Reveal>

        <Fade delay={0.15}>
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: 'clamp(14px,1.7vw,17px)',
            color: 'var(--ink-2)', lineHeight: 1.7,
            maxWidth: 420, margin: '0 0 44px',
          }}>
            Join more than 150 students already part of the study.
            Free to use. Private. No ads. No data sold.
          </p>
        </Fade>

        <Fade delay={0.25}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <Link href="/auth" className="cta-main">
              CREATE FREE ACCOUNT <span aria-hidden>→</span>
            </Link>
            <Link href="/auth" className="cta-ghost">
              SIGN IN
            </Link>
          </div>
        </Fade>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: '1.5px solid var(--border)' }}>
        <div style={{
          padding: `clamp(20px,3vw,28px) ${PX}`,
          display: 'flex', flexWrap: 'wrap', gap: 18,
          justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 10,
            letterSpacing: '0.1em', color: 'var(--ink-3)',
          }}>
            © 2026 · LAHORE GARRISON UNIVERSITY RESEARCH
          </span>
          <div style={{ display: 'flex', gap: 28, alignItems: 'center', flexWrap: 'wrap' }}>
            <a href="mailto:saadnizami@icloud.com" className="quiet-link" style={{ fontSize: 10 }}>
              CONTACT
            </a>
            <Link href="/auth" className="quiet-link" style={{ fontSize: 10 }}>
              SIGN IN
            </Link>
          </div>
        </div>

        {/* Cropped outline watermark */}
        <div style={{ overflow: 'hidden', padding: `0 ${PX}` }} aria-hidden>
          <div className="watermark">SATORI</div>
        </div>
      </footer>
    </div>
  )
}
