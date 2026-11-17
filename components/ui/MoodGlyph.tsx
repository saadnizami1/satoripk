// Weather glyphs for the five moods. Shape and lightness both change
// from 1 to 5, so moods stay distinct without relying on colour.

const INK = '#111111'
// Round trig results so server and browser render identical SVG attributes.
const rnd = (n: number) => Math.round(n * 100) / 100
const cloud = 'M13 35 h23 a8.5 8.5 0 0 0 0 -17 a11.5 11.5 0 0 0 -22 3 a7 7 0 0 0 -1 14z'

export function MoodGlyph({ score, size }: { score: number; size?: number }) {
  const sw = 2.2
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true" focusable="false"
      strokeLinecap="round" strokeLinejoin="round">
      {score === 1 && (
        <g>
          <path d={cloud} fill="#2E4A6B" stroke={INK} strokeWidth={sw} transform="translate(0 -5)" />
          <path d="M17 36 l-2 6 M25 36 l-2 6 M33 36 l-2 6" stroke="#2E4A6B" strokeWidth="2.6" />
        </g>
      )}
      {score === 2 && <path d={cloud} fill="#6F8FA6" stroke={INK} strokeWidth={sw} />}
      {score === 3 && (
        <g>
          <circle cx="31" cy="17" r="8" fill="#F5C542" stroke={INK} strokeWidth={sw} />
          <path d={cloud} fill="#9ED9C3" stroke={INK} strokeWidth={sw} transform="translate(-4 3)" />
        </g>
      )}
      {score === 4 && (
        <g>
          <path d="M11 32 a13 13 0 0 1 26 0z" fill="#F2D68A" stroke={INK} strokeWidth={sw} />
          <path d="M6 32 h36 M12 38 h24" stroke={INK} strokeWidth={sw} />
          <path d="M24 10 v4 M12 15 l2.5 3 M36 15 l-2.5 3" stroke={INK} strokeWidth={sw} />
        </g>
      )}
      {score === 5 && (
        <g>
          <circle cx="24" cy="24" r="9.5" fill="#F5B82E" stroke={INK} strokeWidth={sw} />
          {Array.from({ length: 8 }, (_, i) => {
            const a = (i * Math.PI) / 4
            return <line key={i} x1={rnd(24 + Math.cos(a) * 14)} y1={rnd(24 + Math.sin(a) * 14)}
              x2={rnd(24 + Math.cos(a) * 19)} y2={rnd(24 + Math.sin(a) * 19)} stroke={INK} strokeWidth={sw} />
          })}
        </g>
      )}
    </svg>
  )
}
