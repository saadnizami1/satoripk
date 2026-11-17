import type { CSSProperties } from 'react'

/*
 * Hand-drawn marks: arrows, underlines, sparkles, loops. They inherit
 * `color`, sit around content (never on top of text people need to read)
 * and are always decorative.
 */

type DoodleProps = { width?: number; className?: string; style?: CSSProperties; flip?: boolean }

function Wrap({ width = 80, className = '', style, flip, children, viewBox }: DoodleProps & { children: React.ReactNode; viewBox: string }) {
  return (
    <span className={`doodle ${className}`} style={{ width, transform: flip ? 'scaleX(-1)' : undefined, ...style }} aria-hidden="true">
      <svg viewBox={viewBox} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">{children}</svg>
    </span>
  )
}

/** A loose arrow that curls toward the right. */
export function CurlyArrow(p: DoodleProps) {
  return (
    <Wrap viewBox="0 0 120 70" {...p}>
      <path d="M6 14 C 30 2, 56 8, 54 26 C 52 42, 30 40, 36 28 C 44 12, 82 18, 108 52" strokeWidth="3" />
      <path d="M94 50 L109 54 L106 39" strokeWidth="3" />
    </Wrap>
  )
}

/** A gentle swoop of an arrow, pointing down-right. */
export function SwoopArrow(p: DoodleProps) {
  return (
    <Wrap viewBox="0 0 100 80" {...p}>
      <path d="M8 8 C 40 6, 76 22, 84 66" strokeWidth="3" />
      <path d="M72 58 L85 70 L94 54" strokeWidth="3" />
    </Wrap>
  )
}

/** Double scribble underline. */
export function Scribble(p: DoodleProps) {
  return (
    <Wrap viewBox="0 0 200 24" {...p}>
      <path d="M4 12 C 40 4, 80 18, 120 9 S 180 6, 196 12" strokeWidth="3.2" />
      <path d="M18 19 C 60 13, 120 22, 176 16" strokeWidth="2.2" opacity="0.8" />
    </Wrap>
  )
}

/** Three sparkles. */
export function Sparkles(p: DoodleProps) {
  const star = (x: number, y: number, r: number) => `M${x} ${y - r} Q ${x} ${y} ${x + r} ${y} Q ${x} ${y} ${x} ${y + r} Q ${x} ${y} ${x - r} ${y} Q ${x} ${y} ${x} ${y - r}Z`
  return (
    <Wrap viewBox="0 0 70 60" {...p}>
      <path d={star(22, 26, 16)} strokeWidth="2.4" />
      <path d={star(52, 12, 8)} strokeWidth="2.2" />
      <path d={star(54, 44, 6)} strokeWidth="2.2" />
    </Wrap>
  )
}

/** A wobbly loop, for circling a word. Position it over the word with absolute positioning. */
export function Loop(p: DoodleProps) {
  return (
    <Wrap viewBox="0 0 200 90" {...p}>
      <path d="M150 12 C 100 2, 24 10, 10 40 C -2 70, 80 86, 140 78 C 196 70, 200 34, 160 18 C 132 8, 96 10, 70 16" strokeWidth="3" />
    </Wrap>
  )
}

export function Heart(p: DoodleProps) {
  return (
    <Wrap viewBox="0 0 60 56" {...p}>
      <path d="M30 50 C 8 34, 2 22, 8 12 C 14 2, 26 4, 30 16 C 34 4, 48 2, 53 12 C 58 22, 50 34, 30 50 Z" strokeWidth="3" />
    </Wrap>
  )
}

/** A short wavy line, like a kite string. */
export function KiteString(p: DoodleProps) {
  return (
    <Wrap viewBox="0 0 40 160" {...p}>
      <path d="M20 2 C 4 30, 36 50, 20 78 S 4 126, 20 158" strokeWidth="1.6" strokeDasharray="2 5" />
    </Wrap>
  )
}

/** Washi tape strip. The parent must be position: relative. */
export function Washi({ tone, at = 'tl', tilt }: { tone?: 'rose' | 'mint' | 'sky'; at?: 'tl' | 'tr' | 'tc'; tilt?: number }) {
  return <span aria-hidden="true" className={`washi washi--${at} ${tone ? `washi--${tone}` : ''}`} style={tilt != null ? { ['--tilt' as string]: `${tilt}deg` } : undefined} />
}

/** A handwritten note, optionally with an arrow. Pure decoration unless `say` is set. */
export function HandNote({ children, className = '', style, color = 'var(--ink)', size = 'md' }: {
  children: React.ReactNode; className?: string; style?: CSSProperties; color?: string; size?: 'md' | 'lg'
}) {
  return (
    <span className={`t-hand ${size === 'lg' ? 't-hand--lg' : ''} ${className}`} style={{ color, display: 'inline-block', ...style }}>
      {children}
    </span>
  )
}
