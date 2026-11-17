// Four small illustrated frames of school life in Pakistan, for the film
// strip. Places, never people.

const INK = '#111111'

function Fan({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <line x1={x} y1="0" x2={x} y2={y} stroke={INK} strokeWidth="2" />
      <ellipse cx={x} cy={y} rx="44" ry="4" fill="#3B4650" />
      <circle cx={x} cy={y} r="6" fill="#56626C" />
    </g>
  )
}

export function Classroom() {
  return (
    <svg viewBox="0 0 280 210" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="280" height="210" fill="#C9D9CF" />
      <rect y="150" width="280" height="60" fill="#A88B6A" />
      <rect x="196" y="40" width="64" height="62" fill="#F2D68A" stroke={INK} strokeWidth="3" />
      <path d="M228 40 v62 M196 71 h64" stroke={INK} strokeWidth="2.4" />
      <rect x="22" y="38" width="150" height="84" rx="3" fill="#23403A" stroke="#6E5444" strokeWidth="6" />
      <text x="40" y="70" fontFamily="Georgia, serif" fontSize="18" fill="#FFFDF7" opacity="0.9">a² + b² = c²</text>
      <path d="M40 92 q20 -14 40 0 t40 0" fill="none" stroke="#F5C542" strokeWidth="2.4" />
      <circle cx="146" cy="96" r="8" fill="none" stroke="#FFFDF7" strokeWidth="2" opacity="0.8" />
      <Fan x={140} y={22} />
      {[0, 1, 2].map(i => (
        <g key={i}>
          <rect x={20 + i * 88} y="158" width="70" height="10" fill="#6E5444" stroke={INK} strokeWidth="2" />
          <path d={`M${28 + i * 88} 168 v34 M${82 + i * 88} 168 v34`} stroke={INK} strokeWidth="3" />
          <rect x={34 + i * 88} y="150" width="22" height="8" fill="#FFFDF7" stroke={INK} strokeWidth="1.6" />
        </g>
      ))}
    </svg>
  )
}

export function Library() {
  const books = ['#EC4E8B', '#F5C542', '#2E4A6B', '#9ED9C3', '#7FA3A0', '#FFFDF7', '#B0225A', '#6F8FA6']
  return (
    <svg viewBox="0 0 280 210" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="280" height="210" fill="#2E4A6B" />
      <rect x="14" y="14" width="190" height="190" fill="#6E5444" stroke={INK} strokeWidth="3" />
      {[0, 1, 2, 3].map(r => (
        <g key={r}>
          <rect x="20" y={58 + r * 46} width="178" height="6" fill="#3D3029" />
          {Array.from({ length: 13 }, (_, i) => {
            const h = 28 + ((i * 7 + r * 5) % 12)
            return <rect key={i} x={24 + i * 13.4} y={58 + r * 46 - h} width="11" height={h}
              fill={books[(i + r * 3) % books.length]} stroke={INK} strokeWidth="1.4" />
          })}
        </g>
      ))}
      <rect x="216" y="30" width="52" height="80" rx="26" fill="#0F1E2E" stroke={INK} strokeWidth="3" />
      <circle cx="244" cy="56" r="9" fill="#F4ECD6" />
      <path d="M226 210 v-58 h36 v58" fill="#56626C" stroke={INK} strokeWidth="2.4" />
      <path d="M236 152 l8 -22 l8 22" fill="#F5C542" stroke={INK} strokeWidth="2" />
      <circle cx="244" cy="152" r="26" fill="#F5C542" opacity="0.18" />
    </svg>
  )
}

export function ExamHall() {
  return (
    <svg viewBox="0 0 280 210" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="280" height="210" fill="#E6EEE8" />
      <polygon points="0,110 280,110 280,210 0,210" fill="#B9C4BE" />
      <circle cx="140" cy="44" r="22" fill="#FFFDF7" stroke={INK} strokeWidth="3" />
      <path d="M140 44 V30 M140 44 l10 6" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
      <rect x="96" y="76" width="88" height="18" rx="3" fill="#111111" />
      <text x="140" y="89" textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight="700" fontSize="10" fill="#F5C542" letterSpacing="1">QUIET PLEASE</text>
      {[0, 1, 2].map(row => {
        const y = 118 + row * 30
        const scale = 0.7 + row * 0.18
        return [0, 1, 2, 3].map(c => {
          const w = 44 * scale
          const gap = (280 - 4 * w) / 5
          const x = gap + c * (w + gap)
          return (
            <g key={`${row}${c}`}>
              <rect x={x} y={y} width={w} height={7 * scale} fill="#6E5444" stroke={INK} strokeWidth="1.6" />
              <rect x={x + w * 0.3} y={y - 4 * scale} width={w * 0.4} height={4 * scale} fill="#FFFDF7" stroke={INK} strokeWidth="1" />
              <path d={`M${x + 4} ${y + 7 * scale} v${18 * scale} M${x + w - 4} ${y + 7 * scale} v${18 * scale}`} stroke={INK} strokeWidth="2" />
            </g>
          )
        })
      })}
    </svg>
  )
}

export function Rooftop() {
  return (
    <svg viewBox="0 0 280 210" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="rt-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#14233A" />
          <stop offset="0.7" stopColor="#2E4A6B" />
          <stop offset="1" stopColor="#8C5A78" />
        </linearGradient>
      </defs>
      <rect width="280" height="210" fill="url(#rt-sky)" />
      <circle cx="220" cy="42" r="14" fill="#F4ECD6" />
      <circle cx="226" cy="37" r="12" fill="#1B2D47" />
      {[[30, 30], [80, 18], [150, 40], [250, 90], [120, 70]].map(([x, y]) => <circle key={`${x}`} cx={x} cy={y} r="1.6" fill="#F4ECD6" />)}
      <path d="M70 46 L86 62 L70 84 L54 62z" fill="#EC4E8B" stroke={INK} strokeWidth="2" />
      <path d="M70 84 Q110 140 150 150" fill="none" stroke="#FFFDF7" strokeWidth="1" opacity="0.6" />
      <rect y="150" width="280" height="60" fill="#141420" />
      <rect x="0" y="142" width="280" height="10" fill="#1E1E2E" />
      <rect x="200" y="96" width="50" height="34" rx="6" fill="#2D2840" stroke={INK} strokeWidth="2" />
      <path d="M206 130 v14 M244 130 v14" stroke="#2D2840" strokeWidth="4" />
      <g transform="translate(40 158)">
        <rect width="110" height="34" fill="#6E5444" stroke={INK} strokeWidth="2.4" />
        <path d="M6 6 L104 28 M6 28 L104 6 M30 4 v26 M55 4 v26 M80 4 v26" stroke="#E9C9A0" strokeWidth="1.6" />
        <path d="M4 34 v12 M106 34 v12" stroke="#6E5444" strokeWidth="5" />
      </g>
      <path d="M170 150 q8 -18 16 0" fill="#9ED9C3" stroke={INK} strokeWidth="1.6" />
      <rect x="168" y="150" width="20" height="16" fill="#B0225A" stroke={INK} strokeWidth="1.6" />
    </svg>
  )
}
