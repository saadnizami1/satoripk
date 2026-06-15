'use client'

import { useState, useEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'

// ── Reusable animation primitives ────────────────────────────────

function FadeUp({
  children,
  delay = 0,
  style,
}: {
  children: ReactNode
  delay?: number
  style?: CSSProperties
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div
      ref={ref}
      style={style}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 36 }}
      transition={{ duration: 0.72, delay, ease: [0.25, 0, 0, 1] }}
    >
      {children}
    </motion.div>
  )
}

function DrawLine({ color = 'var(--border)', delay = 0 }: { color?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })
  return (
    <motion.div
      ref={ref}
      initial={{ scaleX: 0 }}
      animate={inView ? { scaleX: 1 } : { scaleX: 0 }}
      transition={{ duration: 0.9, delay, ease: [0.25, 0, 0, 1] }}
      style={{ height: 1.5, background: color, transformOrigin: 'left', width: '100%' }}
    />
  )
}

function Counter({ end, suffix = '' }: { end: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  useEffect(() => {
    if (!inView) return
    const dur = 1800
    const t0 = Date.now()
    const tick = () => {
      const elapsed = Date.now() - t0
      const p = Math.min(elapsed / dur, 1)
      setCount(Math.round((1 - Math.pow(1 - p, 3)) * end))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [inView, end])
  return <span ref={ref}>{count}{suffix}</span>
}

// ── Data ─────────────────────────────────────────────────────────

const TOOLS = [
  { n: '01', label: 'AI COMPANION',     desc: 'An AI that listens without judgment. Trained on what students in Pakistan actually face.' },
  { n: '02', label: 'MOOD TRACKING',    desc: 'Log how you feel each day. Patterns emerge when you look back.' },
  { n: '03', label: 'PRIVATE JOURNAL',  desc: 'Write freely. Entries stay on your device unless you decide otherwise.' },
  { n: '04', label: 'FOCUS TIMER',      desc: '25 minutes of work. 5 minutes to breathe. Deceptively effective.' },
  { n: '05', label: 'BREATHING GUIDES', desc: 'Four science-backed techniques. Under five minutes. Anywhere.' },
  { n: '06', label: 'STRESS TRACKER',   desc: 'Academic pressure acknowledged, not ignored. Track it to manage it.' },
  { n: '07', label: 'MOOD INSIGHTS',    desc: 'Visualise your emotional patterns across weeks and months.' },
  { n: '08', label: 'CRISIS HELPLINES', desc: 'Real humans. 24/7 availability. Pakistan-specific contact numbers.' },
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

// ── Page ─────────────────────────────────────────────────────────

export default function LandingPage() {
  const [mounted, setMounted]       = useState(false)
  const [headerSolid, setHeader]    = useState(false)
  const [scrollPct, setScrollPct]   = useState(0)

  // Tools grid stagger
  const gridRef   = useRef<HTMLDivElement>(null)
  const gridInView = useInView(gridRef, { once: true, margin: '-80px' })

  useEffect(() => {
    setMounted(true)
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      setScrollPct(max > 0 ? window.scrollY / max : 0)
      setHeader(window.scrollY > 72)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const PX = 'clamp(20px,5vw,72px)'

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--ink)', overflowX: 'hidden' }}>

      {/* Injected CSS */}
      <style>{`
        @keyframes marq-fwd {
          from { transform: translateX(0) }
          to   { transform: translateX(-50%) }
        }
        @keyframes marq-rev {
          from { transform: translateX(-50%) }
          to   { transform: translateX(0) }
        }
        .marq-fwd { animation: marq-fwd 40s linear infinite; }
        .marq-rev { animation: marq-rev 40s linear infinite; }
        @keyframes pulse-down {
          0%,100% { opacity: 1; transform: translateY(0) }
          55%     { opacity: 0.3; transform: translateY(10px) }
        }
        .pulse-down { animation: pulse-down 2.2s ease-in-out infinite; }
        @keyframes blink { 0%,100% { opacity: 1 } 50% { opacity: 0 } }
        .blink { animation: blink 1.1s step-end infinite; }
      `}</style>

      {/* ── Scroll progress bar ── */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 2, zIndex: 300,
      }}>
        <div style={{
          height: '100%', background: 'var(--ink)',
          width: `${scrollPct * 100}%`, transition: 'width 40ms linear',
        }} />
      </div>

      {/* ── Sticky header ── */}
      <header style={{
        position: 'fixed', top: 2, left: 0, right: 0, zIndex: 200,
        padding: `14px ${PX}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: headerSolid ? 'rgba(244,242,238,0.94)' : 'transparent',
        backdropFilter: headerSolid ? 'blur(18px)' : 'none',
        WebkitBackdropFilter: headerSolid ? 'blur(18px)' : 'none',
        borderBottom: headerSolid ? '1.5px solid var(--border)' : '1.5px solid transparent',
        transition: 'background 300ms ease, border-color 300ms ease, backdrop-filter 300ms ease',
      }}>
        <span style={{
          fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: 16, letterSpacing: '-0.02em', color: 'var(--ink)',
        }}>
          SATORI.
        </span>
        {/* intentionally empty — sign-in is scroll-gated to the bottom */}
      </header>

      {/* ══════════════════════════════════════════════
          SECTION 1 — HERO
      ══════════════════════════════════════════════ */}
      <section style={{
        minHeight: '100dvh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: `clamp(100px,18vh,180px) ${PX} clamp(80px,12vh,120px)`,
        textAlign: 'center', position: 'relative',
      }}>

        {/* Badge */}
        {mounted && (
          <motion.div
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{ marginBottom: 40 }}
          >
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 10,
              letterSpacing: '0.18em', color: 'var(--ink-3)',
              border: '1px solid var(--border-2)', padding: '7px 18px',
              display: 'inline-block',
            }}>
              MENTAL WELLNESS RESEARCH · PAKISTAN · 2026
            </span>
          </motion.div>
        )}

        {/* Wordmark — letter-by-letter */}
        {mounted && (
          <motion.h1
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.072, delayChildren: 0.35 } },
            }}
            style={{
              fontFamily: 'var(--font-display)', fontWeight: 800,
              fontSize: 'clamp(76px,15vw,176px)', lineHeight: 0.88,
              letterSpacing: '-0.04em', color: 'var(--ink)',
              margin: 0, perspective: 800,
            }}
          >
            {'SATORI.'.split('').map((ch, i) => (
              <motion.span
                key={i}
                style={{ display: 'inline-block' }}
                variants={{
                  hidden: { opacity: 0, y: 64, rotateX: -55 },
                  visible: {
                    opacity: 1, y: 0, rotateX: 0,
                    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
                  },
                }}
              >
                {ch}
              </motion.span>
            ))}
          </motion.h1>
        )}

        {/* Full-width ruled line draws in */}
        {mounted && (
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 1.05, ease: [0.25, 0, 0, 1] }}
            style={{
              width: '100%', maxWidth: 680, height: 1.5,
              background: 'var(--border)', margin: '28px auto 32px',
              transformOrigin: 'left',
            }}
          />
        )}

        {/* Subtitle */}
        {mounted && (
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.3 }}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'clamp(16px,2.2vw,22px)',
              color: 'var(--ink-2)', lineHeight: 1.55,
              maxWidth: 460, margin: '0 auto',
            }}
          >
            A wellness platform for students navigating academic pressure in Pakistan.
          </motion.p>
        )}

        {/* Scroll cue */}
        {mounted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.2, duration: 0.8 }}
            style={{
              position: 'absolute', bottom: 36, left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
            }}
          >
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 9,
              letterSpacing: '0.22em', color: 'var(--ink-3)',
            }}>
              SCROLL
            </span>
            <svg
              className="pulse-down"
              width="14" height="22" viewBox="0 0 14 22"
              fill="none" style={{ color: 'var(--ink-3)' }}
            >
              <line x1="7" y1="1" x2="7" y2="21" stroke="currentColor" strokeWidth="1.5"/>
              <polyline points="2,16 7,21 12,16" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            </svg>
          </motion.div>
        )}
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 2 — MANIFESTO
      ══════════════════════════════════════════════ */}
      <section style={{
        borderTop: '1.5px solid var(--border)',
        padding: `clamp(64px,11vh,128px) ${PX}`,
      }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          {[
            { text: 'Academic pressure is real.', muted: false, delay: 0 },
            { text: 'We built tools to help you navigate it —', muted: false, delay: 0.1 },
            { text: 'not a replacement for care, a daily practice.', muted: true, delay: 0.2 },
          ].map(({ text, muted, delay }, i) => (
            <FadeUp key={i} delay={delay}>
              <p style={{
                fontFamily: 'var(--font-display)', fontWeight: 800,
                fontSize: 'clamp(24px,4.5vw,58px)',
                lineHeight: 1.12, letterSpacing: '-0.025em',
                color: muted ? 'var(--ink-3)' : 'var(--ink)',
                marginBottom: 6,
              }}>
                {text}
              </p>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 3 — TOOLS GRID
      ══════════════════════════════════════════════ */}
      <section style={{
        borderTop: '1.5px solid var(--border)',
        padding: `clamp(56px,10vh,100px) ${PX}`,
      }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>

          <FadeUp style={{ marginBottom: 48 }}>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 10,
              letterSpacing: '0.2em', color: 'var(--ink-3)', display: 'block', marginBottom: 16,
            }}>
              WHAT WE BUILD
            </span>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontWeight: 800,
              fontSize: 'clamp(30px,5vw,60px)', letterSpacing: '-0.03em',
              lineHeight: 1, color: 'var(--ink)', margin: 0,
            }}>
              EVERYTHING IN ONE PLACE.
            </h2>
          </FadeUp>

          <motion.div
            ref={gridRef}
            initial="hidden"
            animate={gridInView ? 'visible' : 'hidden'}
            variants={{ visible: { transition: { staggerChildren: 0.055 } } }}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(220px,28vw,290px), 1fr))',
              borderTop: '1.5px solid var(--border)',
              borderLeft: '1.5px solid var(--border)',
            }}
          >
            {TOOLS.map(t => (
              <motion.div
                key={t.n}
                variants={{
                  hidden: { opacity: 0, y: 28 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0, 0, 1] } },
                }}
                style={{
                  padding: 'clamp(18px,3vw,30px)',
                  borderRight: '1.5px solid var(--border)',
                  borderBottom: '1.5px solid var(--border)',
                  cursor: 'default',
                  transition: 'background 140ms ease',
                }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'var(--bg-card)')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
              >
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'baseline', marginBottom: 14,
                }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)' }}>
                    {t.n}
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-display)', fontWeight: 800,
                    fontSize: 11, letterSpacing: '0.09em', color: 'var(--ink)',
                  }}>
                    {t.label}
                  </span>
                </div>
                <p style={{
                  fontFamily: 'var(--font-body)', fontSize: 13,
                  color: 'var(--ink-2)', lineHeight: 1.65,
                }}>
                  {t.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 4 — RESEARCH  (inverted)
      ══════════════════════════════════════════════ */}
      <section style={{
        background: 'var(--bg-invert)', color: 'var(--ink-invert)',
        borderTop: '1.5px solid var(--border)',
        padding: `clamp(64px,11vh,128px) ${PX}`,
      }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 'clamp(48px,7vw,96px)',
            alignItems: 'start',
          }}>

            {/* Left — copy */}
            <FadeUp>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 10,
                letterSpacing: '0.2em', color: 'rgba(244,242,238,0.45)',
                display: 'block', marginBottom: 24,
              }}>
                THE RESEARCH
              </span>
              <h2 style={{
                fontFamily: 'var(--font-display)', fontWeight: 800,
                fontSize: 'clamp(32px,5vw,64px)', lineHeight: 1.05,
                letterSpacing: '-0.03em', color: 'var(--ink-invert)',
                marginBottom: 28,
              }}>
                THIS IS MORE<br />THAN AN APP.
              </h2>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'clamp(14px,1.8vw,17px)',
                color: 'rgba(244,242,238,0.65)', lineHeight: 1.75,
                maxWidth: 460, marginBottom: 36,
              }}>
                Every session contributes to an active psychological study on student mental health across Pakistan. The goal is research that shapes policy, not just fills a database.
              </p>

              <div style={{
                borderTop: '1px solid rgba(244,242,238,0.15)',
                paddingTop: 28,
                display: 'flex', flexDirection: 'column', gap: 10,
              }}>
                <div style={{
                  fontFamily: 'var(--font-display)', fontWeight: 800,
                  fontSize: 13, letterSpacing: '0.08em',
                  color: 'rgba(244,242,238,0.9)',
                }}>
                  LAHORE GARRISON UNIVERSITY
                </div>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: 11,
                  letterSpacing: '0.1em', color: 'rgba(244,242,238,0.45)',
                }}>
                  Principal Investigator: Saad Nizami
                </div>
              </div>
            </FadeUp>

            {/* Right — stats */}
            <FadeUp delay={0.18}>
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr',
                gap: 1, background: 'rgba(244,242,238,0.12)',
              }}>
                {([
                  { end: 30,  suffix: '+', label: 'SCHOOLS PILOTED' },
                  { end: 150, suffix: '+', label: 'STUDENT PARTICIPANTS' },
                  { end: 7,   suffix: '',  label: 'CITIES ACROSS PAKISTAN' },
                  { end: 1,   suffix: '',  label: 'UNIVERSITY PARTNER' },
                ] as const).map((s, i) => (
                  <div
                    key={i}
                    style={{
                      background: 'var(--bg-invert)',
                      padding: 'clamp(24px,4vw,40px) clamp(20px,3vw,32px)',
                    }}
                  >
                    <div style={{
                      fontFamily: 'var(--font-display)', fontWeight: 800,
                      fontSize: 'clamp(40px,6vw,72px)', lineHeight: 1,
                      letterSpacing: '-0.04em', color: 'var(--ink-invert)',
                      marginBottom: 10,
                    }}>
                      <Counter end={s.end} suffix={s.suffix} />
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-mono)', fontSize: 10,
                      letterSpacing: '0.14em', color: 'rgba(244,242,238,0.4)',
                    }}>
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 5 — SCHOOLS MARQUEE
      ══════════════════════════════════════════════ */}
      <section style={{
        borderTop: '1.5px solid var(--border)',
        padding: `clamp(56px,9vh,96px) 0`,
        overflow: 'hidden',
      }}>
        <FadeUp style={{ textAlign: 'center', marginBottom: 36, padding: `0 ${PX}` }}>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 10,
            letterSpacing: '0.2em', color: 'var(--ink-3)',
          }}>
            PARTICIPATING SCHOOLS — 30+ ACROSS PAKISTAN
          </span>
        </FadeUp>

        {/* Row 1 */}
        <div style={{
          borderTop: '1.5px solid var(--border)',
          borderBottom: '1px solid var(--border-2)',
          padding: '15px 0', overflow: 'hidden',
        }}>
          <div className="marq-fwd" style={{ display: 'flex', width: 'max-content', whiteSpace: 'nowrap' }}>
            {[...SCHOOLS, ...SCHOOLS].map((s, i) => (
              <span key={i} style={{
                fontFamily: 'var(--font-display)', fontWeight: 700,
                fontSize: 12, letterSpacing: '0.1em', color: 'var(--ink)',
                padding: '0 48px',
              }}>
                {s}
                <span style={{ marginLeft: 48, color: 'var(--border-2)' }}>·</span>
              </span>
            ))}
          </div>
        </div>

        {/* Row 2 (reverse) */}
        <div style={{
          borderBottom: '1.5px solid var(--border)',
          padding: '15px 0', overflow: 'hidden',
        }}>
          <div className="marq-rev" style={{ display: 'flex', width: 'max-content', whiteSpace: 'nowrap' }}>
            {[...[...SCHOOLS].reverse(), ...[...SCHOOLS].reverse()].map((s, i) => (
              <span key={i} style={{
                fontFamily: 'var(--font-mono)', fontSize: 11,
                letterSpacing: '0.08em', color: 'var(--ink-3)',
                padding: '0 48px',
              }}>
                {s}
                <span style={{ marginLeft: 48, color: 'var(--border-2)' }}>·</span>
              </span>
            ))}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20, padding: `0 ${PX}` }}>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 9,
            letterSpacing: '0.16em', color: 'var(--ink-3)',
          }}>
            + 23 MORE SCHOOLS PARTICIPATING
          </span>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 6 — FOR ADMINISTRATORS
      ══════════════════════════════════════════════ */}
      <section style={{
        borderTop: '1.5px solid var(--border)',
        padding: `clamp(64px,11vh,120px) ${PX}`,
      }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 'clamp(40px,6vw,80px)',
            alignItems: 'end',
          }}>

            <FadeUp>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 10,
                letterSpacing: '0.2em', color: 'var(--ink-3)',
                display: 'block', marginBottom: 20,
              }}>
                FOR ADMINISTRATORS
              </span>
              <h2 style={{
                fontFamily: 'var(--font-display)', fontWeight: 800,
                fontSize: 'clamp(30px,4.5vw,56px)', lineHeight: 1.08,
                letterSpacing: '-0.025em', color: 'var(--ink)', marginBottom: 20,
              }}>
                RUNNING A SCHOOL?
              </h2>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'clamp(14px,1.8vw,17px)',
                color: 'var(--ink-2)', lineHeight: 1.72, maxWidth: 400,
              }}>
                If you&apos;re a school administrator and would like your institution to participate in our research, or explore Satori for your students, we&apos;d love to connect.
              </p>
            </FadeUp>

            <FadeUp delay={0.14}>
              <div style={{
                border: '1.5px solid var(--border)',
                padding: 'clamp(28px,4vw,44px)',
              }}>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 10,
                  letterSpacing: '0.16em', color: 'var(--ink-3)',
                  display: 'block', marginBottom: 20,
                }}>
                  RESEARCH COLLABORATION
                </span>
                <p style={{
                  fontFamily: 'var(--font-body)', fontSize: 14,
                  color: 'var(--ink-2)', lineHeight: 1.7, marginBottom: 28,
                }}>
                  We are actively expanding to more schools as part of our ongoing psychological study at Lahore Garrison University, conducted by Saad Nizami.
                </p>
                <a
                  href="mailto:saadnizami@icloud.com"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 10,
                    fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 12,
                    letterSpacing: '0.08em', color: 'var(--ink-invert)',
                    background: 'var(--bg-invert)', border: '1.5px solid var(--border)',
                    padding: '14px 24px', textDecoration: 'none',
                    transition: 'box-shadow 100ms, transform 100ms',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLAnchorElement
                    el.style.boxShadow = 'var(--shadow-sm)'
                    el.style.transform = 'translate(-2px,-2px)'
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLAnchorElement
                    el.style.boxShadow = 'none'
                    el.style.transform = 'none'
                  }}
                >
                  CONTACT US →
                </a>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 7 — FINAL CTA  (only sign-up on the page)
      ══════════════════════════════════════════════ */}
      <section style={{
        borderTop: '1.5px solid var(--border)',
        padding: `clamp(64px,11vh,120px) ${PX}`,
      }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <FadeUp>
            <div style={{
              border: '1.5px solid var(--border)',
              padding: 'clamp(40px,7vw,88px) clamp(28px,5vw,72px)',
            }}>

              <DrawLine delay={0.2} />
              <div style={{ height: 40 }} />

              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 10,
                letterSpacing: '0.2em', color: 'var(--ink-3)',
                display: 'block', marginBottom: 28,
              }}>
                GET STARTED — FREE
              </span>

              <h2 style={{
                fontFamily: 'var(--font-display)', fontWeight: 800,
                fontSize: 'clamp(42px,8vw,112px)', lineHeight: 0.92,
                letterSpacing: '-0.04em', color: 'var(--ink)',
                marginBottom: 36,
              }}>
                BEGIN YOUR<br />PRACTICE.
              </h2>

              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'clamp(14px,1.8vw,17px)',
                color: 'var(--ink-2)', lineHeight: 1.7,
                maxWidth: 400, marginBottom: 44,
              }}>
                Join over 150 students already part of the journey. Free to use. Private. No ads. No data sold.
              </p>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                <Link
                  href="/auth"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 10,
                    fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 13,
                    letterSpacing: '0.06em', color: 'var(--ink-invert)',
                    background: 'var(--bg-invert)', border: '1.5px solid var(--border)',
                    padding: '17px 32px', textDecoration: 'none',
                    transition: 'box-shadow 100ms, transform 100ms',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLAnchorElement
                    el.style.boxShadow = 'var(--shadow-md)'
                    el.style.transform = 'translate(-4px,-4px)'
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLAnchorElement
                    el.style.boxShadow = 'none'
                    el.style.transform = 'none'
                  }}
                >
                  CREATE FREE ACCOUNT →
                </Link>
                <Link
                  href="/auth"
                  style={{
                    display: 'inline-flex', alignItems: 'center',
                    fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13,
                    letterSpacing: '0.06em', color: 'var(--ink-2)',
                    border: '1.5px solid var(--border-2)',
                    padding: '17px 24px', textDecoration: 'none',
                    transition: 'border-color 120ms, color 120ms',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLAnchorElement
                    el.style.borderColor = 'var(--border)'
                    el.style.color = 'var(--ink)'
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLAnchorElement
                    el.style.borderColor = 'var(--border-2)'
                    el.style.color = 'var(--ink-2)'
                  }}
                >
                  SIGN IN
                </Link>
              </div>

              <div style={{ height: 40 }} />
              <DrawLine delay={0.1} />
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{
        borderTop: '1.5px solid var(--border)',
        padding: `clamp(16px,3vw,24px) ${PX}`,
        display: 'flex', flexWrap: 'wrap', gap: 16,
        justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{
            fontFamily: 'var(--font-display)', fontWeight: 800,
            fontSize: 14, letterSpacing: '-0.01em', color: 'var(--ink)',
          }}>
            SATORI.
          </span>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 10,
            color: 'var(--ink-3)', letterSpacing: '0.08em',
          }}>
            2026 · LAHORE GARRISON UNIVERSITY RESEARCH
          </span>
        </div>
        <div style={{ display: 'flex', gap: 28, alignItems: 'center', flexWrap: 'wrap' }}>
          <a
            href="mailto:saadnizami@icloud.com"
            style={{
              fontFamily: 'var(--font-mono)', fontSize: 10,
              color: 'var(--ink-3)', letterSpacing: '0.1em',
              textDecoration: 'none',
              transition: 'color 120ms',
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--ink)')}
            onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--ink-3)')}
          >
            CONTACT
          </a>
          <Link
            href="/auth"
            style={{
              fontFamily: 'var(--font-mono)', fontSize: 10,
              color: 'var(--ink-3)', letterSpacing: '0.1em',
              textDecoration: 'none',
              transition: 'color 120ms',
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--ink)')}
            onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--ink-3)')}
          >
            SIGN IN
          </Link>
        </div>
      </footer>
    </div>
  )
}
