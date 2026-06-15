'use client'

const SOCIAL = [
  { label: 'EMAIL',     value: 'saadnizami114@gmail.com', url: 'mailto:saadnizami114@gmail.com' },
  { label: 'INSTAGRAM', value: '@saadnizami__',           url: 'https://www.instagram.com/saadnizami__/' },
  { label: 'LINKEDIN',  value: 'Saad Nizami',             url: 'https://www.linkedin.com/in/saad-nizami-250ab0374/' },
  { label: 'X',         value: '@nizamisaad1',            url: 'https://x.com/nizamisaad1' },
  { label: 'GITHUB',    value: 'saadnizami1',             url: 'https://github.com/saadnizami1' },
]

export default function CreatorPage() {
  return (
    <div style={{ maxWidth: 680 }}>

      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(48px, 8vw, 64px)', color: 'var(--ink)', letterSpacing: '-0.03em', lineHeight: 1, marginBottom: 0 }}>
          CREATOR.
        </h1>
        <div style={{ borderTop: '1.5px solid var(--border)', marginTop: 16 }} />
      </div>

      {/* Profile block */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32, padding: '24px 0', borderBottom: '1.5px solid var(--border)' }}>
        {/* Initials block */}
        <div style={{
          width: 64, height: 64, background: 'var(--bg-invert)', color: 'var(--ink-invert)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, flexShrink: 0,
        }}>
          SN
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: 'var(--ink)', letterSpacing: '-0.01em', marginBottom: 4 }}>
            SAAD NIZAMI
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink-2)', marginBottom: 4 }}>
            A high school student from Lahore.
          </div>
          <a
            href="mailto:saadnizami114@gmail.com"
            style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.04em', textDecoration: 'none' }}
          >
            saadnizami114@gmail.com
          </a>
        </div>
      </div>

      {/* The Vision */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.12em', marginBottom: 16 }}>
          THE VISION BEHIND SATORI.
        </div>
        <div style={{ borderTop: '1.5px solid var(--border)', marginBottom: 24 }} />
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.75 }}>
          <p style={{ marginBottom: 16 }}>
            As a psychology student, conducting meaningful research has always been more than an academic pursuit — it has been a calling. The intersection of mental health and technology presents an unprecedented opportunity to understand and support students navigating academic life.
          </p>
          <p style={{ marginBottom: 16 }}>
            <em>Satori</em> represents the culmination of this vision: a comprehensive platform designed not only to provide mental wellness support to students but also to gather invaluable insights into patterns of academic stress, emotional wellbeing, and resilience in Pakistan&apos;s student population.
          </p>
          <p style={{ marginBottom: 16 }}>
            This research aims to bridge the gap between theoretical psychology and practical application. By combining evidence-based techniques with modern technology, Satori aspires to be both a support system for students in need and a robust research tool that contributes to the broader understanding of student mental health.
          </p>
          <p>
            Every feature, every interaction, and every data point collected serves the dual purpose of immediate support and long-term understanding.
          </p>
        </div>
      </div>

      {/* Quote block */}
      <div style={{ border: '1.5px solid var(--border)', padding: '24px 28px', marginBottom: 40, background: 'var(--bg-card)' }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--ink)', lineHeight: 1.7, fontStyle: 'italic', marginBottom: 12 }}>
          &ldquo;The goal is not merely to create an application, but to foster a community of understanding, support, and empirical insight that can transform how we approach student mental health in our educational landscape.&rdquo;
        </p>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.1em' }}>— SAAD NIZAMI</div>
      </div>

      {/* Connect */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.12em', marginBottom: 6 }}>
          CONNECT.
        </div>
        <div style={{ borderTop: '1.5px solid var(--border)', marginBottom: 0 }} />
        <div style={{ border: '1.5px solid var(--border)', borderTop: 'none' }}>
          {SOCIAL.map((s, i) => (
            <a
              key={s.label}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 16px', textDecoration: 'none',
                borderBottom: i < SOCIAL.length - 1 ? '1px solid var(--border-2)' : 'none',
                background: 'var(--bg)', transition: 'background 80ms',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-card)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg)' }}
            >
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12, color: 'var(--ink)', letterSpacing: '0.06em' }}>
                {s.label}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)' }}>{s.value}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Footer note */}
      <div style={{ borderTop: '1.5px solid var(--border)', paddingTop: 20 }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.06em' }}>
          BUILT FROM LAHORE, PAKISTAN  ·  2026
        </p>
      </div>
    </div>
  )
}
