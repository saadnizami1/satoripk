import type { ReactNode } from 'react'

/*
 * Cut-out stickers, drawn in Satori's palette. Every sticker gets a white
 * die-cut border from an SVG morphology filter, so shapes stay simple and the
 * outline always follows the silhouette. All stickers are decorative: they
 * render aria-hidden and carry no meaning of their own.
 */

const INK = '#111111'
// Round trig results so server and browser render identical SVG attributes.
const rnd = (n: number) => Math.round(n * 100) / 100
const PAPER = '#FFFDF7'
const MARIGOLD = '#F5C542'
const ROSE = '#EC4E8B'
const MINT = '#9ED9C3'
const SKY = '#7FA3A0'
const DUSK = '#2E4A6B'
const NIGHT = '#0F1E2E'

/** Die-cut outline filter, rendered once in the root layout (app/layout.tsx). */
export function StickerDefs() {
  return (
    <svg width="0" height="0" aria-hidden="true" focusable="false" style={{ position: 'absolute' }}>
      <defs>
        <filter id="sticker-cut" x="-20%" y="-20%" width="140%" height="140%">
          <feMorphology in="SourceAlpha" operator="dilate" radius="5" result="grow" />
          <feFlood floodColor={PAPER} />
          <feComposite in2="grow" operator="in" result="edge" />
          <feMerge>
            <feMergeNode in="edge" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
    </svg>
  )
}

function Cut({ children, size = 120 }: { children: ReactNode; size?: number }) {
  return (
    <svg viewBox={`-10 -10 ${size + 20} ${size + 20}`} aria-hidden="true" focusable="false">
      <g filter="url(#sticker-cut)" strokeLinecap="round" strokeLinejoin="round">{children}</g>
    </svg>
  )
}

const s = { stroke: INK, strokeWidth: 2.6 }

export function KeypadPhone({ bubble = 'sun' }: { bubble?: 'sun' | 'heart' | 'none' }) {
  return (
    <Cut>
      <rect x="30" y="18" width="50" height="94" rx="14" fill={DUSK} {...s} />
      <rect x="38" y="30" width="34" height="26" rx="4" fill={MINT} {...s} />
      <path d="M43 47 q6 -7 12 0 t12 0" fill="none" stroke={INK} strokeWidth="2" />
      {[0, 1, 2].map(r => [0, 1, 2].map(c => (
        <rect key={`${r}${c}`} x={39 + c * 11} y={64 + r * 11} width="8" height="7" rx="2.5" fill={PAPER} stroke={INK} strokeWidth="1.6" />
      )))}
      <rect x="49" y="12" width="12" height="8" rx="2" fill={DUSK} {...s} />
      {bubble !== 'none' && (
        <g>
          <path d="M74 6 h38 a8 8 0 0 1 8 8 v18 a8 8 0 0 1 -8 8 h-24 l-10 9 v-9 h-4 a8 8 0 0 1 -8 -8 v-18 a8 8 0 0 1 8 -8z" fill={bubble === 'heart' ? ROSE : MARIGOLD} {...s} />
          {bubble === 'sun' ? (
            <g>
              <circle cx="93" cy="23" r="6" fill={PAPER} stroke={INK} strokeWidth="2" />
              {[0, 60, 120, 180, 240, 300].map(a => (
                <line key={a} x1={rnd(93 + Math.cos(a * Math.PI / 180) * 9)} y1={rnd(23 + Math.sin(a * Math.PI / 180) * 9)}
                  x2={rnd(93 + Math.cos(a * Math.PI / 180) * 12)} y2={rnd(23 + Math.sin(a * Math.PI / 180) * 12)} stroke={INK} strokeWidth="2" />
              ))}
            </g>
          ) : (
            <path d="M93 31 l-8 -8 a5 5 0 0 1 8 -6 a5 5 0 0 1 8 6z" fill={PAPER} stroke={INK} strokeWidth="2" />
          )}
        </g>
      )}
    </Cut>
  )
}

export function ChaiCup() {
  return (
    <Cut>
      <path d="M46 24 q-5 -7 0 -13 M60 22 q-5 -7 0 -13 M74 24 q-5 -7 0 -13" fill="none" stroke={SKY} strokeWidth="3" />
      <ellipse cx="60" cy="98" rx="46" ry="12" fill={SKY} {...s} />
      <path d="M86 52 h8 a12 12 0 0 1 0 24 h-10" fill="none" stroke={INK} strokeWidth="7" />
      <path d="M86 52 h8 a12 12 0 0 1 0 24 h-10" fill="none" stroke={PAPER} strokeWidth="2.6" />
      <path d="M28 36 h64 l-8 56 a6 6 0 0 1 -6 5 h-36 a6 6 0 0 1 -6 -5z" fill={PAPER} {...s} />
      <path d="M31 48 h58 l-6 42 a5 5 0 0 1 -5 4 h-36 a5 5 0 0 1 -5 -4z" fill="#B9773F" />
      <ellipse cx="60" cy="36" rx="32" ry="6" fill="#D9A06A" {...s} />
      <path d="M36 60 h12 M38 70 h8" stroke={PAPER} strokeWidth="2.4" opacity="0.6" />
    </Cut>
  )
}

export function DeskCalendar() {
  return (
    <Cut>
      <rect x="14" y="20" width="92" height="88" rx="8" fill={PAPER} {...s} />
      <path d="M14 28 a8 8 0 0 1 8 -8 h76 a8 8 0 0 1 8 8 v12 h-92z" fill={ROSE} {...s} />
      {[30, 50, 70, 90].map(x => <rect key={x} x={x - 3} y="10" width="6" height="18" rx="3" fill={INK} />)}
      {[0, 1, 2, 3].map(r => [0, 1, 2, 3, 4].map(c => (
        <circle key={`${r}${c}`} cx={28 + c * 16} cy={54 + r * 14} r="3" fill={r === 2 ? INK : '#9AA59F'} />
      )))}
      <path d="M17 77 c18 -12 70 -12 86 -1 c4 6 -6 11 -40 11 c-34 0 -50 -4 -46 -10" fill="none" stroke={MARIGOLD} strokeWidth="4" />
    </Cut>
  )
}

export function MoonPolaroid() {
  return (
    <Cut>
      <g transform="rotate(-5 60 60)">
        <rect x="14" y="10" width="92" height="104" rx="3" fill={PAPER} {...s} />
        <rect x="22" y="18" width="76" height="70" fill={NIGHT} />
        <circle cx="70" cy="44" r="15" fill="#F4ECD6" />
        <circle cx="77" cy="39" r="13" fill={NIGHT} />
        {[[34, 30], [46, 64], [86, 72], [40, 46], [90, 26]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r="1.6" fill="#F4ECD6" />)}
        <path d="M22 88 l14 -12 l10 6 l14 -14 l18 12 l20 -8 v16z" fill={DUSK} />
        <path d="M34 100 q10 -5 20 0 t20 0" fill="none" stroke={INK} strokeWidth="2" opacity="0.5" />
      </g>
    </Cut>
  )
}

export function ResearchPapers() {
  return (
    <Cut>
      <rect x="28" y="22" width="70" height="88" rx="4" fill="#E6EEE8" {...s} transform="rotate(8 63 66)" />
      <rect x="22" y="16" width="70" height="88" rx="4" fill={PAPER} {...s} transform="rotate(-4 57 60)" />
      <g transform="rotate(-4 57 60)">
        <rect x="32" y="28" width="40" height="7" rx="2" fill={INK} />
        {[44, 54, 64, 74, 84].map(y => <line key={y} x1="32" y1={y} x2={y === 84 ? 62 : 82} y2={y} stroke="#9AA59F" strokeWidth="3" />)}
        <path d="M58 92 l6 -12 l6 8 l8 -16" fill="none" stroke={ROSE} strokeWidth="3" />
      </g>
      <path d="M80 6 v34 a7 7 0 0 1 -14 0 v-26 a4 4 0 0 1 8 0 v22" fill="none" stroke="#6F7C86" strokeWidth="3.2" />
    </Cut>
  )
}

export function Padlock() {
  return (
    <Cut>
      <path d="M36 54 v-14 a24 24 0 0 1 48 0 v14" fill="none" stroke={INK} strokeWidth="12" />
      <path d="M36 54 v-14 a24 24 0 0 1 48 0 v14" fill="none" stroke="#9AA59F" strokeWidth="6" />
      <rect x="22" y="50" width="76" height="62" rx="12" fill={MARIGOLD} {...s} />
      <circle cx="60" cy="76" r="8" fill={INK} />
      <path d="M57 80 h6 l2 16 h-10z" fill={INK} />
      <path d="M30 60 v20" stroke={PAPER} strokeWidth="3" opacity="0.7" />
    </Cut>
  )
}

export function CrossedCoin() {
  return (
    <Cut>
      <circle cx="60" cy="60" r="44" fill={MARIGOLD} {...s} />
      <circle cx="60" cy="60" r="34" fill="none" stroke={INK} strokeWidth="2" strokeDasharray="3 5" />
      <text x="60" y="72" textAnchor="middle" fontFamily="Georgia, serif" fontSize="34" fontWeight="700" fill={INK}>Rs</text>
      <line x1="22" y1="98" x2="98" y2="22" stroke={INK} strokeWidth="12" />
      <line x1="22" y1="98" x2="98" y2="22" stroke={ROSE} strokeWidth="7" />
    </Cut>
  )
}

export function Notebook() {
  return (
    <Cut>
      <rect x="24" y="10" width="78" height="102" rx="6" fill={MINT} {...s} />
      {[22, 36, 50, 64, 78, 92].map(y => (
        <path key={y} d={`M18 ${y} a5 5 0 0 1 12 0`} fill="none" stroke={INK} strokeWidth="2.6" />
      ))}
      <rect x="40" y="26" width="48" height="20" rx="3" fill={PAPER} {...s} />
      <path d="M46 36 h30" stroke={INK} strokeWidth="2.4" />
      <path d="M50 66 l4 9 l10 1 l-8 6 l3 10 l-9 -6 l-9 6 l3 -10 l-8 -6 l10 -1z" fill={MARIGOLD} stroke={INK} strokeWidth="2" />
      <path d="M74 70 q8 -10 14 0 q-14 16 -14 18 q0 -2 -14 -18 q6 -10 14 0" fill={ROSE} stroke={INK} strokeWidth="2" transform="scale(0.8) translate(22 26)" />
      <path d="M44 100 q6 -6 12 0 t12 0 t12 0" fill="none" stroke={INK} strokeWidth="2.2" />
    </Cut>
  )
}

export function SchoolBag() {
  return (
    <Cut>
      <path d="M44 24 a16 16 0 0 1 32 0" fill="none" stroke={INK} strokeWidth="8" />
      <path d="M44 24 a16 16 0 0 1 32 0" fill="none" stroke={DUSK} strokeWidth="4" />
      <rect x="22" y="24" width="76" height="90" rx="22" fill={SKY} {...s} />
      <path d="M22 54 h76" stroke={INK} strokeWidth="2.6" />
      <rect x="36" y="66" width="48" height="34" rx="10" fill={MARIGOLD} {...s} />
      <path d="M40 78 h40" stroke={INK} strokeWidth="2" strokeDasharray="4 3" />
      <rect x="54" y="48" width="12" height="12" rx="3" fill={PAPER} {...s} />
    </Cut>
  )
}

export function Kite({ color = MARIGOLD }: { color?: string }) {
  return (
    <Cut>
      <path d="M60 8 L98 50 L60 104 L22 50z" fill={color} {...s} />
      <path d="M60 8 V104 M22 50 H98" stroke={INK} strokeWidth="2" />
      <path d="M60 8 L98 50 L60 50z" fill={PAPER} opacity="0.35" />
      <path d="M60 104 q-6 6 0 12" fill="none" stroke={INK} strokeWidth="2" />
      <path d="M54 110 l12 6 M54 116 l12 -6" stroke={ROSE} strokeWidth="4" />
    </Cut>
  )
}

export function AlarmClock() {
  return (
    <Cut>
      <path d="M26 30 a14 14 0 0 1 22 -10z M94 30 a14 14 0 0 0 -22 -10z" fill={MARIGOLD} {...s} />
      <path d="M38 104 l-8 10 M82 104 l8 10" stroke={INK} strokeWidth="5" />
      <circle cx="60" cy="66" r="42" fill={ROSE} {...s} />
      <circle cx="60" cy="66" r="32" fill={PAPER} {...s} />
      {[0, 90, 180, 270].map(a => (
        <line key={a} x1={rnd(60 + Math.cos(a * Math.PI / 180) * 25)} y1={rnd(66 + Math.sin(a * Math.PI / 180) * 25)}
          x2={rnd(60 + Math.cos(a * Math.PI / 180) * 29)} y2={rnd(66 + Math.sin(a * Math.PI / 180) * 29)} stroke={INK} strokeWidth="2.6" />
      ))}
      <path d="M60 66 V46 M60 66 L74 74" stroke={INK} strokeWidth="3.4" />
      <circle cx="60" cy="66" r="3.5" fill={INK} />
    </Cut>
  )
}

export function Leaf() {
  return (
    <Cut>
      <path d="M14 40 q24 -10 44 0 t44 0" fill="none" stroke={INK} strokeWidth="6" />
      <path d="M14 40 q24 -10 44 0 t44 0" fill="none" stroke={SKY} strokeWidth="2.4" />
      <path d="M26 90 C26 56 56 40 98 46 C96 86 70 108 34 100z" fill={MINT} {...s} />
      <path d="M30 98 C48 80 64 70 88 56" fill="none" stroke={INK} strokeWidth="2.4" />
      <path d="M50 82 l-4 -12 M64 72 l-2 -12 M60 78 l12 4" stroke={INK} strokeWidth="2" />
    </Cut>
  )
}

export function Pencil() {
  return (
    <Cut>
      <g transform="rotate(-38 60 60)">
        <rect x="20" y="48" width="70" height="24" fill={MARIGOLD} {...s} />
        <path d="M20 56 h70 M20 64 h70" stroke={INK} strokeWidth="1.4" opacity="0.5" />
        <rect x="8" y="48" width="14" height="24" rx="4" fill={ROSE} {...s} />
        <rect x="20" y="46" width="8" height="28" fill="#9AA59F" {...s} />
        <path d="M90 48 L112 60 L90 72z" fill="#E9C9A0" {...s} />
        <path d="M104 56 L112 60 L104 64z" fill={INK} />
      </g>
    </Cut>
  )
}

export function LineChart() {
  return (
    <Cut>
      <rect x="12" y="16" width="96" height="88" rx="10" fill={PAPER} {...s} transform="rotate(4 60 60)" />
      <g transform="rotate(4 60 60)">
        <path d="M24 90 V30 M24 90 H98" stroke={INK} strokeWidth="2.4" />
        <path d="M30 78 L46 62 L60 70 L76 44 L92 52" fill="none" stroke={DUSK} strokeWidth="4" />
        {[[30, 78, ROSE], [46, 62, SKY], [60, 70, MINT], [76, 44, MARIGOLD], [92, 52, MARIGOLD]].map(([x, y, c]) => (
          <circle key={`${x}`} cx={x as number} cy={y as number} r="5" fill={c as string} stroke={INK} strokeWidth="2" />
        ))}
      </g>
    </Cut>
  )
}

export function MoonSticker() {
  return (
    <Cut>
      <path d="M78 14 A48 48 0 1 0 106 84 A38 38 0 1 1 78 14z" fill="#F4ECD6" {...s} />
      <circle cx="46" cy="70" r="5" fill="#E2D5B4" />
      <circle cx="60" cy="92" r="3.5" fill="#E2D5B4" />
      <path d="M96 22 l3 7 l7 1 l-5 5 l1 7 l-6 -4 l-6 4 l1 -7 l-5 -5 l7 -1z" fill={MARIGOLD} stroke={INK} strokeWidth="2" />
    </Cut>
  )
}

export function Envelope() {
  return (
    <Cut>
      <rect x="12" y="30" width="96" height="66" rx="6" fill={PAPER} {...s} />
      <path d="M12 36 L60 72 L108 36" fill="none" stroke={INK} strokeWidth="2.6" />
      <circle cx="60" cy="74" r="10" fill={ROSE} stroke={INK} strokeWidth="2.4" />
    </Cut>
  )
}

export const STICKERS = {
  phone: KeypadPhone, phoneHeart: () => <KeypadPhone bubble="heart" />, chai: ChaiCup, calendar: DeskCalendar, polaroid: MoonPolaroid,
  papers: ResearchPapers, padlock: Padlock, coin: CrossedCoin, notebook: Notebook,
  bag: SchoolBag, kite: Kite, clock: AlarmClock, leaf: Leaf, pencil: Pencil,
  chart: LineChart, moon: MoonSticker, envelope: Envelope,
} as const

export type StickerName = keyof typeof STICKERS

/** A sticker placed on the page: sized, tilted, optionally floating. */
export function Sticker({
  name, size = 120, tilt = 0, float = false, className = '', style,
}: {
  name: StickerName; size?: number; tilt?: number; float?: boolean; className?: string; style?: React.CSSProperties
}) {
  const Art = STICKERS[name] as () => React.ReactElement
  return (
    <span className={`${float ? 'bob' : ''} ${className}`} style={{ display: 'inline-block', width: size, flexShrink: 0, ...style }} aria-hidden="true">
      <span className="sticker" style={{ width: '100%', ['--tilt' as string]: `${tilt}deg` }}>
        <Art />
      </span>
    </span>
  )
}
