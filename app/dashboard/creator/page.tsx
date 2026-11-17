import { ArrowUpRight } from 'lucide-react'
import { PageHeader } from '@/components/app/PageHeader'
import { TornPaper } from '@/components/ui/kit'
import { Sticker } from '@/components/ui/stickers'

const LINKS = [
  { label: 'Email',     value: 'saadnizami@icloud.com',  url: 'mailto:saadnizami@icloud.com' },
  { label: 'GitHub',    value: 'github.com/saadnizami1', url: 'https://github.com/saadnizami1' },
  { label: 'Instagram', value: '@saadnizami__',          url: 'https://www.instagram.com/saadnizami__/' },
  { label: 'LinkedIn',  value: 'Saad Nizami',            url: 'https://www.linkedin.com/in/saad-nizami-250ab0374/' },
  { label: 'X',         value: '@nizamisaad1',           url: 'https://x.com/nizamisaad1' },
]

const STATS = [
  { n: '200+', l: 'students', c: 'var(--marigold)' },
  { n: '7', l: 'schools', c: 'var(--rose)' },
  { n: '4', l: 'cities', c: 'var(--mint)' },
]

export default function CreatorPage() {
  return (
    <div>
      <PageHeader lines={['why satori', 'exists']} accent="exists" art="dawn" sticker="kite" />

      <div className="ab-grid">
        <article className="stack-lg">
          <section className="sheet sheet--pad stack-sm" aria-labelledby="ab-story">
            <h2 id="ab-story" className="section-title" style={{ margin: 0 }}>The short version</h2>
            <p className="t-lead">
              Satori was built by Saad Nizami, a high school student in Lahore, to understand how academic pressure
              shapes the way students here feel, and to give them somewhere calm to put it down.
            </p>
            <p className="t-body muted">
              It started as a question: what does a week of exams actually do to a student&apos;s mood? Answering it
              meant building something students would want to open every day, so Satori became both a tool and a study.
            </p>
          </section>

          <section className="sheet sheet--pad stack-sm" aria-labelledby="ab-study">
            <h2 id="ab-study" className="section-title" style={{ margin: 0 }}>The study</h2>
            <p className="t-body">
              The research runs at Lahore Garrison University under the supervision of Dr. Prof. Huvaida Munir.
              Students who choose to take part share their mood and stress check-ins, which helps show how school
              pressure rises and falls across a term.
            </p>
            <ul className="ab-stats" aria-label="Satori so far">
              {STATS.map((s, i) => (
                <li key={s.l}>
                  <TornPaper color={s.c} tilt={[-2, 1.5, -1][i]} seed={i * 5 + 3}><p className="t-num">{s.n}</p><p className="t-small">{s.l}</p></TornPaper>
                </li>
              ))}
            </ul>
          </section>
        </article>

        <aside className="sheet sheet--pad" aria-labelledby="ab-contact">
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h2 id="ab-contact" className="section-title">Get in touch</h2>
            <Sticker name="envelope" size={70} tilt={8} />
          </div>
          <p className="t-body muted" style={{ marginBottom: 12 }}>Questions, ideas, or want Satori at your school? Saad reads everything.</p>
          <ul className="list">
            {LINKS.map(s => (
              <li key={s.label}>
                <a href={s.url} target={s.url.startsWith('mailto') ? undefined : '_blank'} rel="noopener noreferrer" className="ab-link">
                  <span>
                    <span className="t-small faint" style={{ display: 'block' }}>{s.label}</span>
                    <span style={{ fontWeight: 600, overflowWrap: 'anywhere' }}>{s.value}</span>
                  </span>
                  <ArrowUpRight size={18} aria-hidden="true" />
                  {!s.url.startsWith('mailto') && <span className="sr-only"> (opens in a new tab)</span>}
                </a>
              </li>
            ))}
          </ul>
        </aside>
      </div>

      <style>{`
        .ab-grid { display: grid; grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr); gap: 20px; align-items: start; }
        .ab-stats { list-style: none; margin: 18px 0 0; padding: 0; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
        .ab-link { display: flex; align-items: center; justify-content: space-between; gap: 12px; width: 100%; text-decoration: none; color: var(--ink); min-height: 44px; }
        .ab-link:hover span span:last-child { text-decoration: underline; }
        @media (max-width: 900px) { .ab-grid { grid-template-columns: 1fr; } }
        @media (max-width: 480px) { .ab-stats { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  )
}
