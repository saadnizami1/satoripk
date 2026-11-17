import Link from 'next/link'
import { Phone, MessageCircle } from 'lucide-react'
import { HELPLINES } from '@/lib/helplines'
import { PageHeader } from '@/components/app/PageHeader'

/* A calm page: no stickers, no tilt, no animation. Crisis line first. */

export default function HelplinePage() {
  const [crisis, ...others] = HELPLINES
  return (
    <div className="page-narrow">
      <PageHeader calm lines={["You don't have to do this alone"]}
        lead="Every number here is free and answered by a trained person in Pakistan. You don't need a better reason to call than wanting to talk to someone." />

      <section aria-labelledby="hl-now" className="hl-crisis">
        <h2 id="hl-now" className="t-h3">If you are in danger right now</h2>
        <p className="t-body" style={{ marginTop: 6 }}>
          If you might hurt yourself, or someone else is in danger, call {crisis.name} on {crisis.number}. It&apos;s free and answers 24/7.
        </p>
        <a href={crisis.href} className="pill pill--danger pill--lg" style={{ marginTop: 16 }}>
          <Phone size={18} aria-hidden="true" /> Call {crisis.number}
        </a>
      </section>

      <section aria-labelledby="hl-talk" style={{ marginTop: 32 }}>
        <h2 id="hl-talk" className="section-title">To talk something through</h2>
        <ul className="list sheet" style={{ padding: '4px 20px' }}>
          {others.map(h => {
            const whatsapp = h.href.startsWith('https://wa.me')
            return (
              <li key={h.name} style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
                <div>
                  <p className="t-label" style={{ fontSize: 16 }}>{h.name}</p>
                  <p className="t-small muted">{h.note}</p>
                </div>
                <a href={h.href} className="pill pill--ghost pill--sm" aria-label={`${whatsapp ? 'Message' : 'Call'} ${h.name} on ${h.number}`}>
                  {whatsapp ? <MessageCircle size={16} aria-hidden="true" /> : <Phone size={16} aria-hidden="true" />}
                  {h.number}
                </a>
              </li>
            )
          })}
        </ul>
      </section>

      <section aria-labelledby="hl-know" style={{ marginTop: 32 }} className="sheet sheet--pad stack-sm">
        <h2 id="hl-know" className="section-title" style={{ margin: 0 }}>Worth remembering</h2>
        <p className="t-body">Most students feel overwhelmed at some point, especially around exams. You are not the only one.</p>
        <p className="t-body">If calling feels like too much, start with someone you trust: a friend, an older sibling, a teacher or your school counsellor.</p>
        <p className="t-body">
          You can also <Link href="/dashboard/kokoro" className="link">talk to Kokoro</Link> any time. It&apos;s an AI, so for anything serious, please reach a person too.
        </p>
      </section>

      <style>{`
        .hl-crisis { padding: clamp(22px, 3vw, 30px); border-radius: var(--r-lg); background: var(--marigold-2); border: 1.5px solid #E9CF7E; }
      `}</style>
    </div>
  )
}
