import Link from 'next/link'
import Image from 'next/image'
import { LandingHeader } from '@/components/landing/LandingHeader'
import { HeroPhone } from '@/components/landing/HeroPhone'
import { TapeHeading, Pill, Scene, ZigzagDivider, NumberBadge, TornPaper, FilmStrip, Logo } from '@/components/ui/kit'
import { Sticker, type StickerName } from '@/components/ui/stickers'
import { Accordion } from '@/components/ui/controls'
import { MoodGlyph } from '@/components/ui/MoodGlyph'
import { Classroom, ExamHall, Rooftop, SchoolVan, DeskAtNight, StreetCricket } from '@/components/ui/school-scenes'
import { CurlyArrow, SwoopArrow, HandNote, Sparkles, Washi, Scribble, Heart } from '@/components/ui/doodles'
import { SiteFooter } from '@/components/landing/SiteFooter'
import { HELPLINES } from '@/lib/helplines'

/*
 * Landing page: a scrapbook kept on a Lahore rooftop. One painted dusk
 * scene, label-tape headings, cut-out stickers and torn paper. Everything
 * here is server-rendered; only the header and the hero phone hydrate.
 */

const STEPS: { title: string; body: string; sticker: StickerName; tilt: number; note: string }[] = [
  { title: 'check in', body: 'One tap tells Satori how today feels. No essays and no wrong answers.', sticker: 'phone', tilt: -8, note: 'takes about three seconds' },
  { title: 'do one small thing', body: 'Breathe for two minutes, write three lines, or start a focus block. Satori suggests one that fits the day.', sticker: 'chai', tilt: 6, note: 'chai optional' },
  { title: 'see your weeks', body: 'After a few weeks your patterns show up: what drains you, and what helps.', sticker: 'calendar', tilt: -5, note: 'no grades here' },
  { title: 'talk it out', body: 'Kokoro is there at 2am, between classes, and the night before results. Say it however it comes out.', sticker: 'polaroid', tilt: 7, note: 'even at 2am' },
]

const STATS = [
  { n: '200+', label: 'students using Satori', color: 'var(--marigold)', tilt: -4, seed: 3 },
  { n: '7', label: 'schools', color: 'var(--rose)', tilt: 3, seed: 7 },
  { n: '4', label: 'cities across Pakistan', color: 'var(--mint)', tilt: -2, seed: 11 },
]

const KOKORO = [
  { title: 'built with researchers', body: 'Made as part of a study on academic stress among teenagers in Pakistan, with Matric, O-Level, FSc and A-Level pressure in mind.', sticker: 'papers' as const },
  { title: 'remembers your week', body: "Kokoro sees your recent check-ins, so you don't have to explain everything from the start each time.", sticker: 'notebook' as const },
  { title: 'there at 2am', body: "Exam tomorrow, can't sleep, need to vent. Kokoro answers any time, and points you to real people in an emergency.", sticker: 'moon' as const },
]

const FAQ = [
  {
    q: 'Who is Satori for?',
    a: (
      <div className="stack-sm">
        <p>
          Teenagers in Pakistan: students from middle school, Matric and O-Levels through FSc, A-Levels and the first years
          of university. It was shaped by the students who use it.
        </p>
        <p>If you&apos;re under 18, we suggest letting a parent or guardian know you use it.</p>
      </div>
    ),
  },
  {
    q: 'How does Satori use my data?',
    a: (
      <div className="stack-sm">
        <p>Your journal and your Kokoro chats are yours. They are never part of the research data.</p>
        <p>
          Satori is also a research study on academic stress. If you say yes to research, your mood and stress
          check-ins (with any notes you add to them) and your profile answers, including your name and email, are
          shared with the study team at Lahore Garrison University. Nobody else gets them.
        </p>
        <p>Research is optional. You can say no and still use everything, or change your mind any time in Settings.</p>
      </div>
    ),
  },
  {
    q: 'Is Kokoro a therapist?',
    a: (
      <p>
        No. Kokoro is an AI companion. It can listen and suggest small next steps, but it can&apos;t diagnose or treat
        anything. Its replies are written by an AI model, and your chats are saved to your account so you can come
        back to them. If things feel serious, please talk to a real person: the numbers are below.
      </p>
    ),
  },
  { q: 'Is it really free?', a: <p>Yes. No trials, no ads and no paid tier. Satori is a research project, not a business.</p> },
  {
    q: 'Can my school or parents read my journal?',
    a: <p>No. Only you can open your journal. Schools and parents never get access to anyone&apos;s account.</p>,
  },
  {
    q: 'What if I need help right now?',
    a: (
      <div className="stack-sm">
        <p>Please reach out to a real person. These lines are free:</p>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {HELPLINES.slice(0, 3).map(h => (
            <li key={h.name}><a className="link" href={h.href}>{h.name}: {h.number}</a> <span className="faint-dark">{h.note.toLowerCase()}</span></li>
          ))}
        </ul>
      </div>
    ),
  },
]

export default function LandingPage() {
  return (
    <div className="lp">
      <a href="#main" className="skip-link">Skip to content</a>
      <div className="texture" aria-hidden="true" />
      <LandingHeader />

      <main id="main">
        {/* ── Hero ───────────────────────────────────────────────── */}
        <Scene src="/art/dusk.webp" priority position="center 72%" className="on-dark lp-hero"
          scrim="linear-gradient(180deg, rgba(15,30,46,0.55) 0%, rgba(15,30,46,0.1) 45%, rgba(15,30,46,0) 60%, rgba(15,30,46,0.55) 100%)">
          <div className="container lp-hero__inner">
            <p className="lp-hero__tag"><span className="t-hand">made for teenagers in Pakistan</span></p>
            <h1 className="t-hero lp-hero__title">a quiet place for the loudest years</h1>
            <p className="t-lead lp-hero__lead">
              A free, private space for teenagers to check in, breathe, focus and talk things through, especially
              when exams feel bigger than everything else.
            </p>
            <div className="row" style={{ justifyContent: 'center', gap: 10 }}>
              <Pill href="/auth?mode=signup" variant="white" size="lg" knob>Start free</Pill>
              <Pill href="#how" variant="glass" size="lg">See how it works</Pill>
              <span className="lp-research">
                <Pill href="/about" variant="glass" size="lg">The research behind it</Pill>
                <span className="lp-research__note" aria-hidden="true">
                  <svg className="lp-research__arrow" viewBox="0 0 74 44" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M70 6 C 50 0, 26 8, 10 30" />
                    <path d="M6 17 L9 32 L23 28" />
                  </svg>
                  <HandNote color="var(--marigold)">for investors &amp; school admins</HandNote>
                </span>
              </span>
            </div>
          </div>
          <div className="lp-hero__phone">
            <Sticker name="chai" size={128} tilt={-10} className="lp-hero__sticker lp-hero__sticker--l" />
            <HeroPhone />
            <span className="lp-hero__sticker lp-hero__sticker--r sway" aria-hidden="true">
              <Image src="/brand/kite.png" alt="" width={150} height={150} className="brand-kite" />
            </span>
            <div className="lp-hero__note" aria-hidden="true">
              <HandNote color="var(--paper)" size="lg">try it, tap one</HandNote>
              <CurlyArrow width={96} style={{ color: 'var(--paper)', marginTop: -4 }} />
            </div>
          </div>
        </Scene>

        {/* ── How it works ───────────────────────────────────────── */}
        <section id="how" aria-labelledby="how-h" className="lp-how">
          <div className="container">
            <TapeHeading id="how-h" lines={['how it', 'works']} accent="works" size="t-h1" />
            <p className="t-lead" style={{ maxWidth: 520, marginTop: 18 }}>
              A two-minute habit, not another thing to keep up with.
            </p>
            <Scribble width={240} style={{ color: 'var(--marigold)', marginTop: 2 }} />
            <ol className="lp-steps">
              {STEPS.map((s, i) => (
                <li key={s.title} className="lp-step" data-side={i % 2 ? 'right' : 'left'}>
                  <div className="lp-step__art">
                    <Sticker name={s.sticker} size={190} tilt={s.tilt} />
                    <span className="lp-step__note" aria-hidden="true">
                      <SwoopArrow width={54} flip={i % 2 === 1} style={{ color: 'var(--rose-ink)' }} />
                      <HandNote color="var(--rose-ink)">{s.note}</HandNote>
                    </span>
                  </div>
                  <div className="lp-step__text">
                    <NumberBadge n={i + 1} color={['var(--marigold)', 'var(--mint)', 'var(--paper)', 'var(--rose)'][i]} />
                    <h3 className="t-h2">{s.title}</h3>
                    <p className="t-lead">{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <ZigzagDivider top="var(--sky-2)" bottom="var(--night)" />

        {/* ── Real students ──────────────────────────────────────── */}
        <section aria-labelledby="real-h" className="on-dark lp-night">
          <div className="container">
            <div className="lp-split">
              <TapeHeading id="real-h" lines={['real students,', 'real weeks']} accent="real" tone="paper" size="t-h1" />
              <div className="stack-sm" style={{ maxWidth: 460 }}>
                <p className="t-lead" style={{ color: 'var(--on-dark-2)' }}>
                  Made for teenagers, with teenagers. Satori began as a research study on academic stress and grew with
                  the students who use it, from Matric and O-Levels to FSc and A-Levels.
                </p>
                <div style={{ marginTop: 6 }}>
                  <Pill href="/about" variant="marigold" knob>Meet the researchers</Pill>
                </div>
              </div>
            </div>
            <div className="lp-film">
              <FilmStrip label="A week in a Pakistani teenager's life">
                {[
                  { Art: SchoolVan, cap: '6:45, the van' },
                  { Art: Classroom, cap: 'period four' },
                  { Art: ExamHall, cap: 'mocks week' },
                  { Art: DeskAtNight, cap: 'one more past paper' },
                  { Art: StreetCricket, cap: 'finally, outside' },
                  { Art: Rooftop, cap: 'kites at dusk' },
                ].map(({ Art, cap }) => (
                  <figure key={cap} role="listitem" className="film__frame" style={{ margin: 0, position: 'relative' }}>
                    <Art />
                    <figcaption className="t-hand lp-film__cap">{cap}</figcaption>
                  </figure>
                ))}
              </FilmStrip>
              <ul className="lp-stats" aria-label="Satori in numbers">
                {STATS.map(s => (
                  <li key={s.label}>
                    <TornPaper color={s.color} tilt={s.tilt} seed={s.seed} style={{ position: 'relative' }}>
                      <Washi at={s.tilt < 0 ? 'tl' : 'tr'} tone={s.color === 'var(--mint)' ? 'sky' : undefined} />
                      <span className="t-num" style={{ display: 'block' }}>{s.n}</span>
                      <span className="t-label" style={{ fontSize: 15 }}>{s.label}</span>
                    </TornPaper>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── Kokoro ─────────────────────────────────────────────── */}
        <section id="kokoro" aria-labelledby="kokoro-h" className="on-dark lp-kokoro">
          <div className="container">
            <div className="row" style={{ alignItems: 'flex-start', gap: 14 }}>
              <TapeHeading id="kokoro-h" lines={['meet kokoro,', 'your pocket companion']} accent="kokoro" tone="marigold" size="t-h1" />
              <Sparkles width={70} style={{ color: 'var(--marigold)' }} />
            </div>
            <ul className="grid-3 lp-kokoro__cols">
              {KOKORO.map((k, i) => (
                <li key={k.title}>
                  <Sticker name={k.sticker} size={150} tilt={[-6, 5, -3][i]} />
                  <h3 className="t-h3" style={{ marginTop: 18 }}>{k.title}</h3>
                  <p className="t-body" style={{ color: 'var(--on-dark-2)', marginTop: 10 }}>{k.body}</p>
                </li>
              ))}
            </ul>
            <p className="t-small" style={{ color: 'var(--on-dark-2)', marginTop: 40 }}>
              Kokoro is an AI, not a therapist. For anything serious, talk to a person too.
            </p>
          </div>
        </section>

        {/* ── Doomscrolling comparison ───────────────────────────── */}
        <Scene src="/art/blur-dusk.webp" className="on-dark lp-compare" scrim="rgba(15,30,46,0.35)">
          <section aria-labelledby="cmp-h" className="container">
            <h2 id="cmp-h" className="tape-stack tape-stack--center t-h1" style={{ alignItems: 'center' }}>
              <span className="tape" style={{ ['--tilt' as string]: '-1.5deg' }}>tired of doomscrolling?</span>
              <span className="tape tape--rose" style={{ ['--tilt' as string]: '1.2deg', marginLeft: '8%' }}>try one calm minute</span>
            </h2>
            <div className="lp-compare__grid">
              <div className="glass lp-compare__calm">
                <Logo tone="paper" size={20} />
                <p className="t-h3" style={{ marginTop: 18 }}>how are you arriving today?</p>
                <div className="row" style={{ gap: 6, marginTop: 18 }} aria-hidden="true">
                  {[1, 2, 3, 4, 5].map(n => <MoodGlyph key={n} score={n} size={40} />)}
                </div>
                <p className="t-body" style={{ marginTop: 18, color: 'var(--on-dark-2)' }}>
                  Open it, tap one, close it. No feed, no likes, nothing to keep up with.
                </p>
              </div>
              <TornPaper color="#D9DDD9" tilt={2.5} seed={5} className="lp-compare__feed" innerStyle={{ padding: '28px 28px 34px' }}>
                <p className="t-label faint">your feed, all day</p>
                <ul className="lp-feed">
                  {['results leaked??', 'who topped the mocks', '12 new reels', 'group chat (148)', 'everyone is studying except you'].map((t, i) => (
                    <li key={t}>
                      <span>{t}</span>
                      <span className="lp-feed__badge">{['99+', '41', '12', '148', '!'][i]}</span>
                    </li>
                  ))}
                </ul>
                <svg viewBox="0 0 300 40" className="lp-scribble" aria-hidden="true"><path d="M4 30 C40 4 60 38 96 14 S150 36 180 10 S240 34 296 8" fill="none" stroke="#111" strokeWidth="3" strokeLinecap="round" /></svg>
              </TornPaper>
            </div>
          </section>
        </Scene>

        <ZigzagDivider top="var(--dusk)" bottom="var(--fog)" />

        {/* ── Privacy ────────────────────────────────────────────── */}
        <section id="privacy" aria-labelledby="privacy-h" className="lp-privacy">
          <div className="container">
            <div className="row" style={{ alignItems: 'flex-end', gap: 18 }}>
              <TapeHeading id="privacy-h" lines={['private. safe.', 'yours.']} accent="yours." size="t-h1" />
              <span className="lp-priv-note" aria-hidden="true"><Heart width={40} style={{ color: 'var(--rose-ink)' }} /><HandNote color="var(--rose-ink)">we mean it</HandNote></span>
            </div>
            <ul className="grid-3 lp-privacy__cols">
              <li>
                <Sticker name="padlock" size={130} tilt={-6} />
                <h3 className="t-h3">your journal stays yours</h3>
                <p className="t-body muted">Only you can read your journal and your Kokoro chats. Not your school, not your parents, not the researchers.</p>
              </li>
              <li>
                <Sticker name="coin" size={130} tilt={5} />
                <h3 className="t-h3">no ads, nothing sold</h3>
                <p className="t-body muted">Satori is free and has no ads, and your data is never sold.</p>
              </li>
              <li>
                <Sticker name="phoneHeart" size={130} tilt={-3} />
                <h3 className="t-h3">real people, when you need them</h3>
                <ul className="lp-lines">
                  {HELPLINES.slice(0, 2).map(h => (
                    <li key={h.name}><a href={h.href} className="link">{h.name}: <strong>{h.number}</strong></a></li>
                  ))}
                </ul>
              </li>
            </ul>
            <div className="sheet sheet--pad lp-consent">
              <Sticker name="papers" size={88} tilt={-8} />
              <div>
                <h3 className="t-h4">research is your choice</h3>
                <p className="t-body muted" style={{ marginTop: 6 }}>
                  If you say yes, your check-ins and profile answers, including your name and email, go to the study
                  team at Lahore Garrison University and nobody else. Say no and you still get everything.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ────────────────────────────────────────────────── */}
        <Scene src="/art/blur-night.webp" className="on-dark lp-faq" scrim="rgba(15,30,46,0.25)">
          <section id="faq" aria-labelledby="faq-h" className="container lp-faq__inner">
            <TapeHeading id="faq-h" lines={['questions,', 'answered']} accent="answered" tone="paper" size="t-h1" />
            <div className="glass glass--dark lp-faq__panel">
              <Accordion items={FAQ} />
            </div>
          </section>
        </Scene>

        {/* ── Schools ────────────────────────────────────────────── */}
        <section id="schools" aria-labelledby="schools-h" className="lp-schools">
          <div className="container lp-schools__inner">
            <div>
              <TapeHeading id="schools-h" lines={['bring satori', 'to your school']} accent="school" tone="marigold" size="t-h1" />
              <p className="t-lead" style={{ marginTop: 22, maxWidth: 480 }}>
                Satori is free for every school. If you&apos;re a counsellor or teacher and want it for your students,
                we&apos;d love to hear from you.
              </p>
              <div style={{ marginTop: 26 }}>
                <Pill href="mailto:saadnizami@icloud.com?subject=Satori%20for%20our%20school" variant="tape" size="lg" knob>Talk to the team</Pill>
              </div>
            </div>
            <div className="lp-schools__art" aria-hidden="true">
              <Sticker name="bag" size={170} tilt={-8} />
              <Sticker name="pencil" size={130} tilt={10} style={{ marginLeft: -30, marginTop: 70 }} />
              <Sticker name="envelope" size={120} tilt={-4} style={{ marginLeft: -10 }} />
            </div>
          </div>
        </section>

        {/* ── Final call ─────────────────────────────────────────── */}
        <Scene src="/art/night.webp" position="center 85%" className="on-dark lp-end"
          scrim="linear-gradient(180deg, var(--night) 0%, rgba(15,30,46,0.2) 30%, rgba(15,30,46,0) 60%)">
          <div className="container" style={{ textAlign: 'center' }}>
            <h2 className="t-hero" style={{ textShadow: '0 2px 0 rgba(0,0,0,0.25)' }}>start with one check-in</h2>
            <div className="row" style={{ justifyContent: 'center', marginTop: 30 }}>
              <Pill href="/auth?mode=signup" variant="white" size="lg" knob>Make your space</Pill>
            </div>
          </div>
        </Scene>
      </main>

      <SiteFooter />

      <style>{LANDING_CSS}</style>
    </div>
  )
}

const LANDING_CSS = `
.lp { overflow-x: clip; }
.lp ul, .lp ol { list-style: none; margin: 0; padding: 0; }
.faint-dark { color: var(--on-dark-2); }

/* Hero */
.lp-hero__tag { margin: 0; }
.lp-hero__tag .t-hand { display: inline-block; padding: 4px 14px 6px; background: var(--marigold); color: var(--ink); transform: rotate(-2deg); box-shadow: 0 8px 14px -10px rgba(0,0,0,0.6); }
.lp-hero__note { position: absolute; left: -210px; top: 210px; transform: rotate(-6deg); display: grid; justify-items: end; z-index: 2; }
.lp-research { position: relative; display: inline-flex; }
.lp-research__note { position: absolute; left: calc(100% + 4px); top: -30px; display: flex; align-items: flex-start; gap: 2px; color: var(--marigold); transform: rotate(-4deg); white-space: nowrap; pointer-events: none; }
.lp-research__arrow { width: 64px; margin-top: 14px; flex-shrink: 0; }
@media (max-width: 1380px) {
  .lp-research__note { left: 50%; top: calc(100% + 4px); transform: translateX(-50%) rotate(-3deg); }
  .lp-research__arrow { display: none; }
}
.lp-step__art { position: relative; flex-direction: column; align-items: center; }
.lp-step__note { display: inline-flex; align-items: center; gap: 4px; margin-top: 8px; transform: rotate(-3deg); }
.lp-film__cap { position: absolute; left: 10px; bottom: 6px; color: var(--paper); text-shadow: 0 1px 6px rgba(0,0,0,0.75); font-size: 22px; }
.lp-priv-note { display: inline-flex; align-items: center; gap: 4px; transform: rotate(-4deg); padding-bottom: 6px; }
.lp-hero { min-height: max(860px, 100svh); padding-top: 168px; overflow: visible; z-index: 2; background: var(--night); }
.lp-hero .scene__art { overflow: hidden; }
.lp-hero__inner { text-align: center; display: grid; justify-items: center; gap: 22px; }
.lp-hero__title { max-width: 12ch; color: var(--paper); text-shadow: 0 2px 0 rgba(0,0,0,0.25), 0 10px 40px rgba(0,0,0,0.35); }
.lp-hero__lead { max-width: 560px; color: var(--paper); text-shadow: 0 1px 12px rgba(0,0,0,0.6); }
.lp-hero__phone { position: relative; display: flex; justify-content: center; align-items: flex-start; margin: 56px auto -280px; width: fit-content; }
.lp-hero__sticker { position: absolute; z-index: 1; }
.lp-hero__sticker--l { left: -150px; bottom: 120px; }
.lp-hero__sticker--r { right: -130px; top: 40px; }
@media (max-width: 760px) {
  .lp-hero { padding-top: 140px; }
  .lp-hero__sticker, .lp-hero__note { display: none !important; }
  .lp-hero__phone { transform: scale(0.92); transform-origin: top center; margin-bottom: -300px; }
}

/* How it works */
.lp-how { background: var(--sky-2); padding: 360px 0 120px; position: relative; z-index: 1;
  background-image: radial-gradient(ellipse 60% 40% at 20% 30%, rgba(255,253,247,0.35), transparent 70%), radial-gradient(ellipse 50% 35% at 85% 70%, rgba(255,253,247,0.25), transparent 70%); }
.lp-steps { display: grid; gap: clamp(40px, 6vw, 72px); margin-top: 64px !important; }
.lp-step { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr); align-items: center; gap: clamp(24px, 5vw, 80px); }
.lp-step[data-side="right"] .lp-step__art { order: 2; }
.lp-step__art { display: flex; justify-content: center; }
.lp-step__text { display: grid; gap: 14px; justify-items: start; max-width: 520px; }
@media (max-width: 760px) {
  .lp-step { grid-template-columns: 1fr; }
  .lp-step[data-side="right"] .lp-step__art { order: 0; }
  .lp-step__art .sticker { width: 140px !important; }
  .lp-step__art > span { width: 140px !important; }
}

/* Night: stats on film */
.lp-night { background: var(--night); color: var(--on-dark); padding: 110px 0 120px; }
.lp-split { display: flex; justify-content: space-between; align-items: flex-end; gap: 32px; flex-wrap: wrap; }
.lp-film { position: relative; margin-top: 56px; }
.lp-stats { display: flex; gap: clamp(12px, 3vw, 36px); justify-content: center; flex-wrap: wrap; margin-top: -48px !important; position: relative; z-index: 1; }
.lp-stats li { min-width: 190px; }

/* Kokoro */
.lp-kokoro { background: linear-gradient(180deg, var(--night), var(--dusk)); color: var(--on-dark); padding: 40px 0 130px; }
.lp-kokoro__cols { margin-top: 64px !important; gap: clamp(28px, 4vw, 56px) !important; }

/* Compare */
.lp-compare { color: var(--on-dark); padding: 120px 0 130px; background: var(--dusk); }
.lp-compare__grid { display: grid; grid-template-columns: 1fr 1fr; gap: clamp(24px, 4vw, 56px); margin-top: 64px; align-items: center; max-width: 980px; margin-inline: auto; }
.lp-compare__calm { padding: 28px; transform: rotate(-1.5deg); }
.lp-feed { display: grid; gap: 10px; margin-top: 16px !important; }
.lp-feed li { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 14px; background: #ECEEEC; border-radius: 10px; font-size: 15px; }
.lp-feed__badge { min-width: 30px; height: 24px; padding: 0 8px; border-radius: 12px; background: var(--rose); color: var(--tape); font-size: 13px; font-weight: 700; display: grid; place-items: center; }
.lp-scribble { position: absolute; left: 8%; right: 8%; top: 46%; width: 84%; opacity: 0.85; pointer-events: none; }
@media (max-width: 760px) { .lp-compare__grid { grid-template-columns: 1fr; } }

/* Privacy */
.lp-privacy { background: var(--fog); padding: 110px 0 120px; }
.lp-privacy__cols { margin-top: 56px !important; gap: clamp(28px, 4vw, 48px) !important; }
.lp-privacy__cols > li { display: grid; gap: 12px; align-content: start; }
.lp-lines { display: grid; gap: 6px; }
.lp-consent { display: flex; gap: 22px; align-items: center; margin-top: 56px; max-width: 820px; }
@media (max-width: 560px) { .lp-consent { flex-direction: column; align-items: flex-start; } }

/* FAQ */
.lp-faq { color: var(--on-dark); background: var(--night); }
.lp-faq__inner { padding-top: 110px; padding-bottom: 120px; display: grid; grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr); gap: clamp(28px, 5vw, 72px); align-items: start; }
.lp-faq__panel { padding: 8px 26px; }
.lp-faq .acc { border-color: var(--line-dark); }
@media (max-width: 899px) { .lp-faq__inner { grid-template-columns: 1fr; } }

/* Schools */
.lp-schools { background: var(--marigold-2); padding: 100px 0; }
.lp-schools__inner { display: grid; grid-template-columns: 1.3fr 1fr; gap: 40px; align-items: center; }
.lp-schools__art { display: flex; justify-content: center; align-items: flex-start; }
@media (max-width: 760px) { .lp-schools__inner { grid-template-columns: 1fr; } .lp-schools__art { display: none; } }

/* End + footer */
.lp-end { color: var(--on-dark); padding: 150px 0 clamp(300px, 34vw, 480px); background: var(--night); }
.lp-foot { background: #060B12; color: var(--on-dark); }
.lp-footer { display: grid; grid-template-columns: 1.4fr 1fr 1fr; gap: 32px; padding-top: 64px; padding-bottom: 36px; }
.lp-footer nav { display: grid; justify-items: start; }
.lp-footer__legal { grid-column: 1 / -1; color: var(--on-dark-2); border-top: 1px solid var(--line-dark); padding-top: 20px; }
@media (max-width: 760px) { .lp-footer { grid-template-columns: 1fr; } }
`
