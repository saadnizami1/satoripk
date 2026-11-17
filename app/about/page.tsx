import type { Metadata } from 'next'
import Image from 'next/image'
import { ArrowUpRight, FileText } from 'lucide-react'
import { LandingHeader } from '@/components/landing/LandingHeader'
import { SiteFooter } from '@/components/landing/SiteFooter'
import { Pill, Scene, TapeHeading, TornPaper, ZigzagDivider, FilmStrip } from '@/components/ui/kit'
import { Sticker } from '@/components/ui/stickers'
import { CurlyArrow, HandNote, Sparkles, Washi, Scribble } from '@/components/ui/doodles'
import { DeskAtNight, SchoolVan, StreetCricket, ExamHall } from '@/components/ui/school-scenes'

export const metadata: Metadata = {
  title: 'The research',
  description: 'The people behind Satori and the study on academic stress among teenagers in Pakistan.',
}

const PAPER_URL = 'https://papers.ssrn.com/sol3/papers.cfm?abstract_id=7616918'

const PEOPLE = [
  {
    name: 'Saad Nizami',
    role: 'Founder and principal investigator',
    photo: '/team/saad-nizami.jpg',
    note: 'built satori',
    tilt: -2.5,
    tape: 'rose' as const,
    bio: 'A student researcher from Lahore. Saad built Satori to understand how academic pressure shapes the way teenagers feel, and to give them somewhere calm to put it down.',
    links: [
      { label: 'LinkedIn', href: 'https://www.linkedin.com/in/saad-nizami-250ab0374/' },
      { label: 'ORCID', href: 'https://orcid.org/0009-0002-4548-3715' },
      { label: 'Email', href: 'mailto:saadnizami@icloud.com' },
    ],
  },
  {
    name: 'Dr. Havaida Munir',
    role: 'Research supervisor, Lahore Garrison University',
    photo: '/team/havaida-munir.jpg',
    note: 'supervisor',
    tilt: 2,
    tape: 'mint' as const,
    bio: 'Dr. Munir supervises the Satori study at Lahore Garrison University, guiding how it is designed, how consent works and how the findings are reported.',
    links: [
      { label: 'LinkedIn', href: 'https://www.linkedin.com/in/havaida-munir-787a7a255/' },
      { label: 'ResearchGate', href: 'https://www.researchgate.net/profile/Havaida-Munir-2' },
    ],
  },
]

const CARE = [
  { title: 'Taking part is a choice', body: 'Every student is asked a plain yes-or-no question when they join. Saying no changes nothing about what they can use, and they can change their answer any time in Settings.' },
  { title: 'What the study sees', body: 'For students who say yes: their mood and stress check-ins, any notes on those check-ins, and their profile answers, including name and email. Only the study team can download it.' },
  { title: 'What it never sees', body: "Journals and Kokoro chats are never part of the research data. They belong to the student and nobody else." },
  { title: 'Teenagers come first', body: 'Most people using Satori are under 18, so we suggest they let a parent or guardian know, and every page keeps free helplines one tap away.' },
]

export default function AboutPage() {
  return (
    <div className="lp ab">
      <a href="#main" className="skip-link">Skip to content</a>
      <div className="texture" aria-hidden="true" />
      <LandingHeader home={false} />

      <main id="main">
        {/* ── Hero ── */}
        <Scene src="/art/dawn.webp" priority position="center 70%" className="on-dark ab-hero"
          scrim="linear-gradient(180deg, rgba(15,30,46,0.7) 0%, rgba(15,30,46,0.25) 55%, rgba(15,30,46,0.55) 100%)">
          <div className="container ab-hero__inner">
            <TapeHeading as="h1" lines={['the people', 'behind satori']} accent="satori" size="t-hero" tone="paper" />
            <p className="t-lead ab-hero__lead">
              Satori is a free app for teenagers in Pakistan, and a research study on how school pressure shapes the way they feel.
              Here is who runs it, what we&apos;re studying, and how we look after the students who take part.
            </p>
          </div>
        </Scene>

        {/* ── The study ── */}
        <section aria-labelledby="study-h" className="ab-study">
          <div className="container ab-study__grid">
            <div className="stack">
              <TapeHeading id="study-h" lines={["what we're", 'studying']} accent="studying" size="t-h1" />
              <p className="t-lead">
                The study looks at academic stress in adolescence: how exams, results, tuition and expectations at home
                show up in how teenagers feel, from one week to the next.
              </p>
              <p className="t-body muted">
                Instead of a one-off questionnaire, Satori lets students tell us how they&apos;re doing a little at a time,
                in their own words, across a whole term. Students from Matric and O-Levels to FSc, A-Levels and their first
                years of university use it, in schools across Pakistan.
              </p>
              <ul className="ab-stats" aria-label="Satori so far">
                {[['200+', 'students', 'var(--marigold)'], ['7', 'schools', 'var(--rose)'], ['4', 'cities', 'var(--mint)']].map(([n, l, c], i) => (
                  <li key={l}><TornPaper color={c} tilt={[-2, 1.5, -1][i]} seed={i * 4 + 3}><p className="t-num">{n}</p><p className="t-small">{l}</p></TornPaper></li>
                ))}
              </ul>
            </div>

            <div className="ab-paper">
              <Washi at="tc" tone="sky" />
              <div className="sheet ab-paper__sheet stack-sm">
                <Sticker name="papers" size={96} tilt={-8} />
                <h3 className="t-h3">read the paper</h3>
                <p className="t-body muted">The study&apos;s working paper is published on SSRN, with its full abstract and authors.</p>
                <div className="row" style={{ marginTop: 8 }}>
                  <Pill href={PAPER_URL} variant="tape" knob>
                    <FileText size={18} aria-hidden="true" /> Open on SSRN
                  </Pill>
                </div>
                <p className="t-small faint">Opens papers.ssrn.com</p>
              </div>
              <HandNote className="ab-paper__note" color="var(--rose-ink)">our work, in writing!</HandNote>
              <CurlyArrow width={90} className="ab-paper__arrow" style={{ color: 'var(--rose-ink)' }} flip />
            </div>
          </div>
        </section>

        <ZigzagDivider top="var(--fog)" bottom="var(--sky-2)" />

        {/* ── The people ── */}
        <section aria-labelledby="people-h" className="ab-people">
          <div className="container">
            <div className="ab-people__head">
              <TapeHeading id="people-h" lines={['who runs it']} accent="runs" size="t-h1" />
              <Sparkles width={64} style={{ color: 'var(--ink)' }} />
            </div>
            <ul className="ab-people__grid">
              {PEOPLE.map(p => (
                <li key={p.name} className="ab-person">
                  <div className="ab-person__photo" style={{ ['--tilt' as string]: `${p.tilt}deg` }}>
                    <Washi at={p.tilt < 0 ? 'tl' : 'tr'} tone={p.tape} />
                    <div className="polaroid" style={{ ['--tilt' as string]: '0deg' }}>
                      <div className="polaroid__frame" style={{ aspectRatio: '4 / 5' }}>
                        <Image src={p.photo} alt={`Portrait of ${p.name}`} fill sizes="(max-width: 760px) 70vw, 300px" style={{ objectFit: 'cover' }} />
                      </div>
                      <p className="t-hand" style={{ padding: '10px 4px 0', textAlign: 'center' }}>{p.note}</p>
                    </div>
                  </div>
                  <div className="ab-person__text stack-sm">
                    <h3 className="t-h2">{p.name}</h3>
                    <p className="t-label" style={{ fontSize: 16, color: 'var(--ink-2)' }}>{p.role}</p>
                    <p className="t-body">{p.bio}</p>
                    <ul className="row" style={{ listStyle: 'none', padding: 0, margin: '6px 0 0', gap: 8 }}>
                      {p.links.map(l => (
                        <li key={l.label}>
                          <a href={l.href} className="pill pill--ghost pill--sm" style={{ background: 'var(--paper)' }}
                            {...(l.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                            {l.label} <ArrowUpRight size={16} aria-hidden="true" />
                            {l.href.startsWith('http') && <span className="sr-only"> (opens in a new tab)</span>}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <ZigzagDivider top="var(--sky-2)" bottom="var(--night)" />

        {/* ── A teenager's week ── */}
        <section aria-labelledby="week-h" className="on-dark ab-week">
          <div className="container">
            <TapeHeading id="week-h" lines={['the week we', 'want to understand']} accent="understand" tone="paper" size="t-h1" />
            <p className="t-lead" style={{ color: 'var(--on-dark-2)', maxWidth: 620, marginTop: 18 }}>
              The van at 6:45, mocks, tuition till eight, a late night with past papers, and cricket in the street when
              it&apos;s finally over. Stress lives in the gaps between all of it.
            </p>
            <div style={{ marginTop: 40 }}>
              <FilmStrip label="A school week">
                {[
                  { Art: SchoolVan, cap: '6:45, the van' },
                  { Art: ExamHall, cap: 'mocks week' },
                  { Art: DeskAtNight, cap: 'one more past paper' },
                  { Art: StreetCricket, cap: 'finally, outside' },
                ].map(({ Art, cap }) => (
                  <figure key={cap} role="listitem" className="film__frame" style={{ margin: 0, position: 'relative' }}>
                    <Art />
                    <figcaption className="t-hand ab-week__cap">{cap}</figcaption>
                  </figure>
                ))}
              </FilmStrip>
            </div>
          </div>
        </section>

        {/* ── Care ── */}
        <section aria-labelledby="care-h" className="ab-care">
          <div className="container">
            <div className="ab-care__head">
              <TapeHeading id="care-h" lines={['how we look after', 'the students']} accent="look after" size="t-h1" />
              <Sticker name="padlock" size={120} tilt={8} />
            </div>
            <ul className="grid-2 ab-care__grid">
              {CARE.map((c, i) => (
                <li key={c.title} className="sheet sheet--pad stack-sm" style={{ position: 'relative' }}>
                  {i === 0 && <Washi at="tr" />}
                  <h3 className="t-h3">{c.title}</h3>
                  <p className="t-body muted">{c.body}</p>
                </li>
              ))}
            </ul>
            <div className="ab-contact">
              <div>
                <h2 className="t-h2">questions about the study?</h2>
                <Scribble width={220} style={{ color: 'var(--marigold)', marginTop: 4 }} />
                <p className="t-body muted" style={{ marginTop: 10, maxWidth: 520 }}>
                  Students, parents, teachers and counsellors are all welcome to get in touch.
                </p>
              </div>
              <Pill href="mailto:saadnizami@icloud.com?subject=About%20the%20Satori%20study" variant="tape" size="lg" knob>Email the team</Pill>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter home={false} />

      <style>{`
        .lp ul, .lp ol { list-style: none; margin: 0; padding: 0; }
        .ab-hero { min-height: 640px; padding: 180px 0 90px; background: var(--dusk); color: var(--on-dark); }
        .ab-hero__inner { display: grid; gap: 26px; }
        .ab-hero__lead { max-width: 640px; color: var(--paper); text-shadow: 0 1px 14px rgba(0,0,0,0.5); }
        .ab-study { background: var(--fog); padding: 100px 0 110px; }
        .ab-study__grid { display: grid; grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr); gap: clamp(32px, 6vw, 80px); align-items: center; }
        .ab-stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; margin-top: 18px !important; max-width: 520px; }
        .ab-paper { position: relative; padding-top: 20px; }
        .ab-paper__sheet { padding: 32px; transform: rotate(1.5deg); box-shadow: var(--pinned); border: 0; }
        .ab-paper__note { position: absolute; left: -10px; bottom: -56px; transform: rotate(-4deg); }
        .ab-paper__arrow { position: absolute; left: 150px; bottom: -40px; transform: rotate(160deg) scaleX(-1); }
        .ab-people { background: var(--sky-2); padding: 100px 0 120px; }
        .ab-people__head { display: flex; align-items: flex-start; gap: 16px; }
        .ab-people__grid { display: grid; gap: 72px; margin-top: 56px !important; }
        .ab-person { display: grid; grid-template-columns: 300px minmax(0, 1fr); gap: clamp(28px, 5vw, 64px); align-items: center; }
        .ab-person:nth-child(even) { grid-template-columns: minmax(0, 1fr) 300px; }
        .ab-person:nth-child(even) .ab-person__photo { order: 2; }
        .ab-person__photo { position: relative; transform: rotate(var(--tilt)); }
        .ab-person__text { max-width: 560px; }
        .ab-week { background: var(--night); color: var(--on-dark); padding: 100px 0 110px; }
        .ab-week__cap { position: absolute; left: 10px; bottom: 6px; color: var(--paper); text-shadow: 0 1px 6px rgba(0,0,0,0.7); font-size: 22px; }
        .ab-care { background: var(--fog); padding: 100px 0 110px; }
        .ab-care__head { display: flex; align-items: center; justify-content: space-between; gap: 20px; }
        .ab-care__grid { margin-top: 48px !important; }
        .ab-contact { margin-top: 64px; display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; flex-wrap: wrap; padding: 32px; border-radius: var(--r-lg); background: var(--marigold-2); }
        @media (max-width: 900px) {
          .ab-study__grid { grid-template-columns: 1fr; }
          .ab-paper__note, .ab-paper__arrow { display: none; }
        }
        @media (max-width: 760px) {
          .ab-hero { padding: 150px 0 70px; min-height: 0; }
          .ab-person, .ab-person:nth-child(even) { grid-template-columns: 1fr; }
          .ab-person:nth-child(even) .ab-person__photo { order: 0; }
          .ab-person__photo { max-width: 260px; }
          .ab-care__head .sticker, .ab-care__head > span { display: none; }
        }
      `}</style>
    </div>
  )
}
