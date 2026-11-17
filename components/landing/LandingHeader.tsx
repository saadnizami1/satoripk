'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Logo, Pill } from '@/components/ui/kit'

const SECTIONS = [
  { label: 'how it works', href: '#how' },
  { label: 'kokoro', href: '#kokoro' },
  { label: 'privacy', href: '#privacy' },
  { label: 'faq', href: '#faq' },
]

/** `home` is false on other public pages, so section links point back to the landing page. */
export function LandingHeader({ home = true }: { home?: boolean }) {
  const LINKS = [
    ...SECTIONS.map(l => ({ ...l, href: home ? l.href : `/${l.href}` })),
    { label: 'the research', href: '/about' },
  ]
  const [solid, setSolid] = useState(false)
  const [signedIn, setSignedIn] = useState(false)
  const [open, setOpen] = useState(false)
  const sentinel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // The header turns solid once the top of the hero scrolls away. An
    // observer avoids re-rendering on every scroll event.
    const el = sentinel.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setSolid(!e.isIntersecting))
    io.observe(el)
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session))
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <div ref={sentinel} style={{ position: 'absolute', top: 0, height: 120, width: 1, pointerEvents: 'none' }} aria-hidden="true" />
      <header
        className="on-dark lp-header"
        data-solid={solid || open}
        style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50 }}
      >
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, height: 72 }}>
          <Link href="/" aria-label="Satori home" style={{ textDecoration: 'none' }}>
            <Logo tone="paper" />
          </Link>
          <nav aria-label="Sections" className="lp-links">
            {LINKS.map(l => <a key={l.href} href={l.href} className="text-btn">{l.label}</a>)}
          </nav>
          <div className="row" style={{ gap: 8, flexWrap: 'nowrap' }}>
            {signedIn ? (
              <Pill href="/dashboard" variant="white" size="sm">Open my space</Pill>
            ) : (
              <>
                <Pill href="/auth" variant="glass" size="sm" className="lp-login">Log in</Pill>
                <Pill href="/auth?mode=signup" variant="white" size="sm">Start free</Pill>
              </>
            )}
            <button
              type="button" className="text-btn lp-menu-btn" aria-expanded={open} aria-controls="lp-menu"
              aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen(o => !o)}
              style={{ width: 44, justifyContent: 'center', padding: 0 }}
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
        {open && (
          <nav id="lp-menu" aria-label="Sections" className="container" style={{ paddingBottom: 18, display: 'grid', gap: 2 }}>
            {LINKS.map(l => (
              <a key={l.href} href={l.href} className="text-btn" style={{ fontSize: 18 }} onClick={() => setOpen(false)}>{l.label}</a>
            ))}
            {!signedIn && <a href="/auth" className="text-btn" style={{ fontSize: 18 }}>log in</a>}
          </nav>
        )}
        {home && <a href="/auth?mode=signup&next=/dashboard/breathing" className="lp-strip">
          exams this week? take a two-minute breathing break <span aria-hidden="true">›</span>
        </a>}
      </header>
      <style>{`
        .lp-header { transition: background 220ms, box-shadow 220ms; }
        .lp-header[data-solid="true"] { background: rgba(15,30,46,0.92); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); box-shadow: 0 1px 0 var(--line-dark); }
        .lp-links { display: flex; gap: 2px; }
        .lp-menu-btn { display: none !important; }
        .lp-strip { display: block; text-align: center; padding: 8px 16px; font-size: 14px; font-weight: 500; color: var(--ink); background: var(--marigold); text-decoration: none; }
        .lp-strip:hover { text-decoration: underline; }
        .lp-header[data-solid="true"] .lp-strip { display: none; }
        @media (max-width: 900px) {
          .lp-links { display: none; }
          .lp-menu-btn { display: inline-flex !important; }
        }
        @media (max-width: 520px) { .lp-login { display: none !important; } }
      `}</style>
    </>
  )
}
