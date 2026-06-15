'use client'

import Link from 'next/link'

const FEATURES = [
  { num: '01', label: 'AI COMPANION',     desc: 'An AI that listens. Trained on what students face.',          href: '/auth' },
  { num: '02', label: 'MOOD TRACKER',     desc: 'Log your mood. See your patterns over time.',                 href: '/auth' },
  { num: '03', label: 'PRIVATE JOURNAL',  desc: "Write privately. No cloud sync unless you allow it.",        href: '/auth' },
  { num: '04', label: 'FOCUS TIMER',      desc: '25 minutes. Work, then breathe.',                             href: '/auth' },
  { num: '05', label: 'BREATHING GUIDES', desc: 'Four techniques. Takes less than five minutes.',              href: '/auth' },
  { num: '06', label: 'MOOD INSIGHTS',    desc: 'Your patterns, visualised over time.',                       href: '/auth' },
  { num: '07', label: 'ACADEMIC STRESS',  desc: 'Acknowledge it. Track it. Manage it.',                       href: '/auth' },
  { num: '08', label: 'CRISIS HELPLINES', desc: 'Real humans. 24/7. Pakistan-specific numbers.',              href: '/auth' },
]

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--ink)' }}>

      {/* ── Nav ── */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 40px', borderBottom: '1.5px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: 'var(--ink)', letterSpacing: '-0.01em' }}>
            SATORI.
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.08em' }}>
            MENTAL WELLNESS
          </span>
        </div>
        <Link
          href="/auth"
          style={{
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12,
            color: 'var(--ink)', textDecoration: 'none', letterSpacing: '0.06em',
            border: '1.5px solid var(--border)', padding: '8px 16px',
          }}
        >
          SIGN IN
        </Link>
      </header>

      {/* ── Hero ── */}
      <section style={{ padding: '80px 40px 60px', maxWidth: 920, margin: '0 auto' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.12em', marginBottom: 24 }}>
          FREE  ·  PRIVATE  ·  NO ADS  ·  BUILT FOR PK STUDENTS
        </div>

        <h1 className="t-hero" style={{ fontFamily: 'var(--font-display)', marginBottom: 0, color: 'var(--ink)' }}>
          FIND YOUR
        </h1>
        <h1
          className="t-hero"
          style={{
            fontFamily: 'var(--font-display)', color: 'var(--ink)',
            borderBottom: '4px solid var(--border)', display: 'inline-block',
            paddingBottom: 4, marginBottom: 40,
          }}
        >
          CALM.
        </h1>

        <p style={{ fontFamily: 'var(--font-body)', fontSize: 18, color: 'var(--ink-2)', maxWidth: 480, lineHeight: 1.5, marginBottom: 40 }}>
          A wellness platform for students navigating academic pressure.
        </p>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link
            href="/auth"
            className="br-btn br-btn-inv"
            style={{ padding: '16px 32px', fontSize: 14, letterSpacing: '0.06em', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement
              el.style.boxShadow = 'var(--shadow-md)'
              el.style.transform = 'translate(-2px,-2px)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement
              el.style.boxShadow = 'none'
              el.style.transform = 'none'
            }}
          >
            START FOR FREE →
          </Link>
          <Link
            href="/auth"
            className="br-btn"
            style={{ padding: '16px 24px', fontSize: 14, letterSpacing: '0.06em', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
          >
            SIGN IN
          </Link>
        </div>

        {/* Stats strip */}
        <div style={{ borderTop: '1.5px solid var(--border)', marginTop: 48, paddingTop: 16 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-3)', letterSpacing: '0.08em' }}>
            8 TOOLS  ·  BUILT FOR PK STUDENTS  ·  AI CHAT  ·  OPEN SOURCE
          </span>
        </div>
      </section>

      {/* ── Features section ── */}
      <section style={{ padding: '0 40px 80px', maxWidth: 920, margin: '0 auto' }}>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(24px, 4vw, 40px)', color: 'var(--ink)', letterSpacing: '-0.02em', marginBottom: 0 }}>
            EVERYTHING YOU NEED.
          </h2>
          <div style={{ borderTop: '1.5px solid var(--border)', marginTop: 8 }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', borderTop: '1.5px solid var(--border)', borderLeft: '1.5px solid var(--border)' }}>
          {FEATURES.map((f) => (
            <Link
              key={f.num}
              href={f.href}
              className="br-lift"
              style={{
                display: 'block', padding: '20px',
                borderRight: '1.5px solid var(--border)', borderBottom: '1.5px solid var(--border)',
                textDecoration: 'none', background: 'var(--bg)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)' }}>{f.num}</span>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12, color: 'var(--ink)', letterSpacing: '0.02em', textAlign: 'right' }}>
                  {f.label}
                </span>
              </div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.5 }}>
                {f.desc}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── CTA Bottom ── */}
      <section style={{ padding: '0 40px 80px', maxWidth: 920, margin: '0 auto' }}>
        <div style={{ border: '1.5px solid var(--border)', padding: '48px 40px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(36px, 6vw, 56px)', color: 'var(--ink)', letterSpacing: '-0.03em', lineHeight: 1, marginBottom: 32 }}>
            READY TO BEGIN?
          </h2>
          <Link
            href="/auth"
            className="br-btn br-btn-inv"
            style={{
              display: 'block', width: '100%', padding: '18px',
              textAlign: 'center', textDecoration: 'none',
              fontSize: 14, letterSpacing: '0.06em',
              transition: 'box-shadow 80ms, transform 80ms',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement
              el.style.boxShadow = 'var(--shadow-md)'
              el.style.transform = 'translate(-2px,-2px)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement
              el.style.boxShadow = 'none'
              el.style.transform = 'none'
            }}
          >
            CREATE YOUR FREE ACCOUNT →
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{
        borderTop: '1.5px solid var(--border)', padding: '16px 40px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.06em' }}>
          SATORI  ·  2026
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.06em' }}>
          BUILT FOR STUDENT MENTAL HEALTH IN PAKISTAN
        </span>
      </footer>
    </div>
  )
}
