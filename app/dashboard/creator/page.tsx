'use client'

const CITIES = [
  'LAHORE', 'KARACHI', 'ISLAMABAD', 'RAWALPINDI',
  'FAISALABAD', 'MULTAN', 'PESHAWAR', 'SIALKOT',
  'GUJRANWALA', 'BAHAWALPUR',
]

const SOCIAL = [
  { label: 'EMAIL',     value: 'saadnizami@icloud.com',  url: 'mailto:saadnizami@icloud.com' },
  { label: 'GITHUB',    value: 'github.com/saadnizami1', url: 'https://github.com/saadnizami1' },
  { label: 'INSTAGRAM', value: '@saadnizami__',          url: 'https://www.instagram.com/saadnizami__/' },
  { label: 'LINKEDIN',  value: 'Saad Nizami',            url: 'https://www.linkedin.com/in/saad-nizami-250ab0374/' },
  { label: 'X',         value: '@nizamisaad1',           url: 'https://x.com/nizamisaad1' },
]

export default function CreatorPage() {
  return (
    <div style={{
      margin: '-48px -40px',
      padding: '56px 40px 80px',
      minHeight: '100vh',
      background: 'var(--bg-invert)',
      color: 'var(--ink-invert)',
    }}>

      {/* Label */}
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 10,
        color: 'var(--accent)', letterSpacing: '0.16em', marginBottom: 20,
      }}>
        THE DEVELOPER
      </div>

      {/* Name */}
      <h1 style={{
        fontFamily: 'var(--font-display)', fontWeight: 800,
        fontSize: 'clamp(64px,14vw,128px)',
        lineHeight: 0.88, letterSpacing: '-0.04em',
        color: 'var(--ink-invert)', marginBottom: 0,
      }}>
        SAAD<br />NIZAMI
      </h1>

      <div style={{ borderTop: '1px solid rgba(244,242,238,0.14)', margin: '28px 0' }} />

      {/* About — short */}
      <div style={{ maxWidth: 520 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(244,242,238,0.38)', letterSpacing: '0.14em', marginBottom: 14 }}>
          ABOUT
        </div>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'rgba(244,242,238,0.7)', lineHeight: 1.72 }}>
          Built Satori to bridge the gap between student mental health and technology.
          A high school student from Lahore — using code to understand how academic pressure
          shapes our wellbeing. If you want to connect or collaborate, reach out.
        </p>
      </div>

      <div style={{ borderTop: '1px solid rgba(244,242,238,0.14)', margin: '28px 0' }} />

      {/* Research */}
      <div style={{ maxWidth: 640 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(244,242,238,0.38)', letterSpacing: '0.14em', marginBottom: 16 }}>
          RESEARCH
        </div>
        <div style={{ marginBottom: 20 }}>
          <div style={{
            fontFamily: 'var(--font-display)', fontWeight: 800,
            fontSize: 'clamp(18px,3vw,24px)', color: 'var(--ink-invert)',
            letterSpacing: '-0.01em', marginBottom: 4,
          }}>
            LAHORE GARRISON UNIVERSITY
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'rgba(244,242,238,0.55)' }}>
            Under the supervision of Dr. Prof. Huvaida Munir
          </div>
        </div>

        {/* 30 schools */}
        <div>
          <div style={{
            fontFamily: 'var(--font-display)', fontWeight: 800,
            fontSize: 'clamp(40px,8vw,72px)',
            color: 'var(--accent)', lineHeight: 1,
            letterSpacing: '-0.03em', marginBottom: 2,
          }}>
            30
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: 'var(--ink-invert)', letterSpacing: '-0.01em', marginBottom: 2 }}>
            SCHOOLS PILOTED
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(244,242,238,0.4)', letterSpacing: '0.1em', marginBottom: 20 }}>
            ACROSS PAKISTAN
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {CITIES.map(city => (
              <span
                key={city}
                style={{
                  fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 10,
                  letterSpacing: '0.08em', padding: '4px 10px',
                  border: '1px solid rgba(244,242,238,0.18)',
                  color: 'rgba(244,242,238,0.65)',
                }}
              >
                {city}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div style={{ borderTop: '1px solid rgba(244,242,238,0.14)', margin: '36px 0 0' }} />

      {/* Social rows */}
      {SOCIAL.map((s, i) => (
        <a
          key={s.label}
          href={s.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '18px 0', textDecoration: 'none',
            borderBottom: '1px solid rgba(244,242,238,0.08)',
            transition: 'opacity 100ms',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.55' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
        >
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(244,242,238,0.36)', letterSpacing: '0.14em', marginBottom: 5 }}>
              {s.label}
            </div>
            <div style={{
              fontFamily: 'var(--font-display)', fontWeight: 700,
              fontSize: 'clamp(14px,2.5vw,20px)', color: 'var(--ink-invert)',
              letterSpacing: '-0.01em',
            }}>
              {s.value}
            </div>
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(244,242,238,0.36)', letterSpacing: '0.08em' }}>
            OPEN →
          </span>
        </a>
      ))}

      <div style={{ paddingTop: 24 }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(244,242,238,0.3)', letterSpacing: '0.08em' }}>
          BUILT FROM LAHORE, PAKISTAN  ·  2026
        </p>
      </div>
    </div>
  )
}
