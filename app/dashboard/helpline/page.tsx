'use client'

import Link from 'next/link'

const HELPLINES = [
  { name: 'RESCUE / AMBULANCE',  number: '1122',         note: '24/7 emergency services' },
  { name: 'UMANG MENTAL HEALTH', number: '0317-4288665', note: 'Free counselling helpline' },
  { name: 'UMANG WHATSAPP',      number: '0311-7786264', note: 'Mental health on WhatsApp' },
  { name: 'ROZAN COUNSELLING',   number: '051-2890505',  note: 'Islamabad counselling' },
  { name: 'EDHI FOUNDATION',     number: '115',          note: 'Social welfare & crisis support' },
]

const REMINDERS = [
  {
    q: 'YOU ARE NOT ALONE.',
    a: 'Mental health struggles are common, especially among students. Reaching out is a sign of strength, not weakness.',
  },
  {
    q: "IT'S OKAY TO ASK FOR HELP.",
    a: "If you're feeling overwhelmed, anxious, or depressed — talk to someone. A professional, a friend, or Kokoro right here in the app.",
  },
  {
    q: 'FREE SUPPORT EXISTS.',
    a: 'Umang Pakistan and Rozan offer free, confidential mental health support via call and WhatsApp.',
  },
]

export default function HelplinePage() {
  return (
    <div style={{ maxWidth: 680 }}>

      {/* Header */}
      <div style={{ marginBottom: 8 }}>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: 'clamp(36px,5vw,56px)', color: 'var(--ink)',
          letterSpacing: '-0.03em', lineHeight: 1,
        }}>
          GET HELP.
        </h1>
        <div style={{ borderTop: '1.5px solid var(--border)', marginTop: 8 }} />
      </div>

      {/* Crisis banner */}
      <div style={{
        border: '2px solid var(--accent)', padding: '14px 18px', marginBottom: 32,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{
          fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 13,
          letterSpacing: '0.04em', color: 'var(--accent)',
        }}>
          IN IMMEDIATE DANGER? CALL 1122 NOW.
        </span>
        <a
          href="tel:1122"
          style={{
            fontFamily: 'var(--font-mono)', fontSize: 20,
            color: 'var(--accent)', textDecoration: 'none',
          }}
        >
          →
        </a>
      </div>

      {/* Helplines */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.12em', marginBottom: 6 }}>
          PAKISTAN HELPLINES
        </div>
        <div style={{ borderTop: '1.5px solid var(--border)' }}>
          {HELPLINES.map((h, i) => (
            <div
              key={h.name}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 0',
                borderBottom: '1px solid var(--border-2)',
              }}
            >
              <div>
                <div style={{
                  fontFamily: 'var(--font-display)', fontWeight: 700,
                  fontSize: 13, color: 'var(--ink)', letterSpacing: '0.02em', marginBottom: 2,
                }}>
                  {h.name}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.04em' }}>
                  {h.note}
                </div>
              </div>
              <a
                href={`tel:${h.number}`}
                className="br-btn"
                style={{
                  fontFamily: 'var(--font-mono)', fontSize: 12, padding: '6px 14px',
                  letterSpacing: '0.04em', textDecoration: 'none', color: 'var(--ink)',
                  whiteSpace: 'nowrap', display: 'inline-block',
                }}
              >
                {h.number}
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Reminders */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.12em', marginBottom: 6 }}>
          REMEMBER
        </div>
        <div style={{ borderTop: '1.5px solid var(--border)' }}>
          {REMINDERS.map((item, i) => (
            <div
              key={i}
              style={{ padding: '16px 0', borderBottom: i < REMINDERS.length - 1 ? '1px solid var(--border-2)' : 'none' }}
            >
              <div style={{
                fontFamily: 'var(--font-display)', fontWeight: 800,
                fontSize: 14, color: 'var(--ink)', letterSpacing: '0.02em', marginBottom: 6,
              }}>
                {item.q}
              </div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.65 }}>
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1.5px solid var(--border)', paddingTop: 16 }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.06em' }}>
          YOU CAN ALSO TALK TO{' '}
          <Link href="/dashboard/kokoro" style={{ color: 'var(--ink)', textDecoration: 'underline', letterSpacing: '0.06em' }}>
            KOKORO
          </Link>{' '}
          ANYTIME IN THE APP
        </p>
      </div>
    </div>
  )
}
