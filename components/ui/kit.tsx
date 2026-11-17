import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'
import type { CSSProperties, ReactNode } from 'react'

/* ── Logo ──────────────────────────────────────────────────────────── */

/** Wordmark: a small kite over a horizon line, then "satori" in the display face. */
export function Logo({ tone = 'ink', size = 26 }: { tone?: 'ink' | 'paper'; size?: number }) {
  const c = tone === 'paper' ? '#FFFDF7' : '#111111'
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: c }}>
      <svg width={size + 4} height={size + 4} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
        <path d="M16 3 L25 13 L16 25 L7 13z" fill="#F5C542" stroke={c} strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M16 3 V25 M7 13 H25" stroke={c} strokeWidth="1.2" />
        <path d="M16 25 q-3 3 0 5" fill="none" stroke={c} strokeWidth="1.4" strokeLinecap="round" />
      </svg>
      <span style={{ font: `400 ${size}px/1 var(--font-display)`, letterSpacing: '-0.02em' }}>satori</span>
    </span>
  )
}

/* ── Label tape heading ────────────────────────────────────────────── */

type HeadingTag = 'h1' | 'h2' | 'h3'

/**
 * A real heading whose lines sit on strips of black label tape.
 * `accent` names one word that is printed in marigold.
 */
export function TapeHeading({
  as: Tag = 'h2', lines, accent, tone = 'tape', size = 't-h2', align = 'start',
  tilts = [-1.2, 0.8, -0.6], id, className = '', style,
}: {
  as?: HeadingTag
  lines: string[]
  accent?: string
  tone?: 'tape' | 'paper' | 'marigold' | 'rose'
  size?: string
  align?: 'start' | 'center'
  tilts?: number[]
  id?: string
  className?: string
  style?: CSSProperties
}) {
  return (
    <Tag id={id} className={`tape-stack ${align === 'center' ? 'tape-stack--center' : ''} ${size} ${className}`} style={style}>
      {lines.map((line, i) => (
        <span
          key={i}
          className={`tape ${tone !== 'tape' ? `tape--${tone}` : ''}`}
          style={{ ['--tilt' as string]: `${tilts[i % tilts.length]}deg` }}
        >
          {accent && line.includes(accent) ? (
            <>
              {line.slice(0, line.indexOf(accent))}
              <span className="accent">{accent}</span>
              {line.slice(line.indexOf(accent) + accent.length)}
            </>
          ) : line}
          {i < lines.length - 1 && <span className="sr-only"> </span>}
        </span>
      ))}
    </Tag>
  )
}

/* ── Pill button / link ────────────────────────────────────────────── */

type PillVariant = 'white' | 'tape' | 'marigold' | 'glass' | 'ghost' | 'danger' | 'danger-ghost'

export function Pill({
  href, variant = 'tape', size, knob = false, block = false, children, className = '', ...rest
}: {
  href?: string
  variant?: PillVariant
  size?: 'sm' | 'lg'
  knob?: boolean
  block?: boolean
  children: ReactNode
  className?: string
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const cls = `pill pill--${variant} ${size ? `pill--${size}` : ''} ${block ? 'pill--block' : ''} ${className}`
  const inner = (
    <>
      {children}
      {knob && <span className="knob" aria-hidden="true"><ArrowUpRight size={16} strokeWidth={2} /></span>}
    </>
  )
  if (href) {
    const external = /^(mailto:|tel:|https?:)/.test(href)
    return external
      ? <a href={href} className={cls}>{inner}</a>
      : <Link href={href} className={cls}>{inner}</Link>
  }
  return <button type="button" className={cls} {...rest}>{inner}</button>
}

/* ── Torn paper ────────────────────────────────────────────────────── */

function tornPolygon(seed: number, teeth = 18, depth = 3.2) {
  let x = seed * 9301 + 49297
  const rnd = () => { x = (x * 9301 + 49297) % 233280; return x / 233280 }
  const top: string[] = [], bottom: string[] = []
  for (let i = 0; i <= teeth; i++) {
    const px = (i / teeth) * 100
    top.push(`${px.toFixed(1)}% ${(rnd() * depth).toFixed(1)}%`)
    bottom.push(`${(100 - px).toFixed(1)}% ${(100 - rnd() * depth).toFixed(1)}%`)
  }
  return `polygon(${[...top, ...bottom].join(', ')})`
}

export function TornPaper({
  color = 'var(--paper)', tilt = 0, seed = 1, children, className = '', style, innerStyle,
}: {
  color?: string; tilt?: number; seed?: number; children: ReactNode; className?: string
  style?: CSSProperties; innerStyle?: CSSProperties
}) {
  return (
    <div className={`torn ${className}`} style={{ ['--tilt' as string]: `${tilt}deg`, ...style }}>
      <div className="torn__sheet" style={{ background: color, clipPath: tornPolygon(seed), ...innerStyle }}>
        {children}
      </div>
    </div>
  )
}

/* ── Zig-zag divider ───────────────────────────────────────────────── */

/** A torn zig-zag edge: `top` colour above, `bottom` colour below. */
export function ZigzagDivider({ top, bottom, flip = false }: { top: string; bottom: string; flip?: boolean }) {
  const teeth = 80
  const pts = Array.from({ length: teeth + 1 }, (_, i) => `${(i / teeth) * 1200},${i % 2 ? 14 : 2}`).join(' ')
  return (
    <svg className="zigzag" viewBox="0 0 1200 14" preserveAspectRatio="none" aria-hidden="true"
      style={{ background: flip ? top : bottom, transform: flip ? 'scaleY(-1)' : undefined, marginTop: -1, marginBottom: -1 }}>
      <polygon points={`0,0 ${pts} 1200,0`} fill={flip ? bottom : top} />
    </svg>
  )
}

/* ── Small pieces ──────────────────────────────────────────────────── */

export function NumberBadge({ n, color }: { n: number; color?: string }) {
  return <span className="badge-num" style={color ? { background: color } : undefined} aria-hidden="true">{n}</span>
}

export function Polaroid({
  children, caption, tilt = 0, href, dark = false, className = '', style, frameStyle, ariaLabel,
}: {
  children: ReactNode; caption?: ReactNode; tilt?: number; href?: string; dark?: boolean
  className?: string; style?: CSSProperties; frameStyle?: CSSProperties; ariaLabel?: string
}) {
  const body = (
    <>
      <div className="polaroid__frame" style={frameStyle}>{children}</div>
      {caption && <div style={{ padding: '12px 6px 0' }}>{caption}</div>}
    </>
  )
  const cls = `polaroid ${dark ? 'polaroid--dark' : ''} ${className}`
  const st = { ['--tilt' as string]: `${tilt}deg`, ...style }
  return href
    ? <Link href={href} className={cls} style={st} aria-label={ariaLabel}>{body}</Link>
    : <div className={cls} style={st}>{body}</div>
}

export function ChatBubble({ dir = 'in', children }: { dir?: 'in' | 'out'; children: ReactNode }) {
  return <div className={`bubble bubble--${dir}`}>{children}</div>
}

export function PhoneMockup({ children, className = '', style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <div className={`phone ${className}`} style={style}>
      <div className="phone__notch" aria-hidden="true" />
      <div className="phone__screen">{children}</div>
    </div>
  )
}

/** A painted scene behind content. Art is always decorative. */
export function Scene({
  src, position = 'center', priority = false, scrim, children, className = '', style, sizes = '100vw',
}: {
  src: string; position?: string; priority?: boolean; scrim?: string; children?: ReactNode
  className?: string; style?: CSSProperties; sizes?: string
}) {
  return (
    <div className={`scene ${className}`} style={style}>
      <div className="scene__art">
        <Image src={src} alt="" fill priority={priority} sizes={sizes} style={{ objectFit: 'cover', objectPosition: position }} />
      </div>
      {scrim && <div className="scene__scrim" style={{ background: scrim }} />}
      {children}
    </div>
  )
}

export function FilmStrip({ children, label }: { children: ReactNode; label?: string }) {
  return <div className="film" role="list" aria-label={label} tabIndex={0}>{children}</div>
}

export function Skeleton({ widths = [120, 80, 48] }: { widths?: number[] }) {
  return (
    <div className="stack-sm" aria-busy="true" aria-label="Loading">
      {widths.map((w, i) => <div key={i} className="skeleton" style={{ height: i === 0 ? 28 : 16, width: `${Math.min(w, 100)}%`, maxWidth: w * 4 }} />)}
    </div>
  )
}
