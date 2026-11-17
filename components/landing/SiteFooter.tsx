import Link from 'next/link'
import { Logo } from '@/components/ui/kit'
import { HELPLINES } from '@/lib/helplines'

/** Footer for public pages. `home` makes section links local anchors. */
export function SiteFooter({ home = true }: { home?: boolean }) {
  const a = (hash: string) => (home ? hash : `/${hash}`)
  return (
    <footer className="on-dark site-foot">
      <div className="container site-foot__grid">
        <div>
          <Logo tone="paper" />
          <p className="t-body" style={{ marginTop: 12, color: 'var(--on-dark-2)', maxWidth: 380 }}>
            Made for teenagers in Pakistan, with teenagers. Satori supports you; it doesn&apos;t replace a counsellor or doctor.
          </p>
        </div>
        <nav aria-label="Footer">
          <a href={a('#how')} className="text-btn">how it works</a>
          <a href={a('#privacy')} className="text-btn">privacy</a>
          <a href={a('#faq')} className="text-btn">faq</a>
          <Link href="/about" className="text-btn">the research</Link>
          <Link href="/auth" className="text-btn">log in</Link>
        </nav>
        <div>
          <p className="t-label" style={{ color: 'var(--paper)' }}>need help now?</p>
          <ul style={{ listStyle: 'none', margin: '8px 0 0', padding: 0, display: 'grid', gap: 6 }}>
            {HELPLINES.slice(0, 2).map(h => (
              <li key={h.name}><a href={h.href} className="link">{h.name}: {h.number}</a></li>
            ))}
          </ul>
        </div>
        <p className="t-small site-foot__legal">© 2026 Satori, a research project supervised at Lahore Garrison University.</p>
      </div>
      <style>{`
        .site-foot { background: #060B12; color: var(--on-dark); }
        .site-foot__grid { display: grid; grid-template-columns: 1.4fr 1fr 1fr; gap: 32px; padding-top: 64px; padding-bottom: 36px; }
        .site-foot nav { display: grid; justify-items: start; }
        .site-foot__legal { grid-column: 1 / -1; color: var(--on-dark-2); border-top: 1px solid var(--line-dark); padding-top: 20px; }
        @media (max-width: 760px) { .site-foot__grid { grid-template-columns: 1fr; } }
      `}</style>
    </footer>
  )
}
