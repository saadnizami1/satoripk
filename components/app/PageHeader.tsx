import type { ReactNode } from 'react'
import { Scene, TapeHeading } from '@/components/ui/kit'
import { Sticker, type StickerName } from '@/components/ui/stickers'

/**
 * Header for inner dashboard pages: a painted band with a label-tape title
 * and one sticker. `calm` pages (Kokoro, Help, Breathing) get a plain,
 * untilted heading with no sticker.
 */
export function PageHeader({
  lines, accent, lead, art = 'day', sticker, calm = false, children,
}: {
  lines: string[]
  accent?: string
  lead?: ReactNode
  art?: 'dawn' | 'day' | 'dusk' | 'night'
  sticker?: StickerName
  calm?: boolean
  children?: ReactNode
}) {
  if (calm) {
    return (
      <header className="ph ph--calm">
        <h1 className="t-h1">{lines.join(' ')}</h1>
        {lead && <p className="t-lead muted" style={{ marginTop: 12, maxWidth: 620 }}>{lead}</p>}
        {children && <div style={{ marginTop: 20 }}>{children}</div>}
        <style>{PH_CSS}</style>
      </header>
    )
  }
  return (
    <header className="ph">
      <Scene src={`/art/${art}.webp`} position="center 80%" className="ph__band" sizes="(max-width: 1240px) 100vw, 1240px"
        scrim="linear-gradient(90deg, rgba(236,241,236,0.9) 0%, rgba(236,241,236,0.55) 45%, rgba(236,241,236,0) 75%)">
        <div className="ph__inner">
          <div>
            <TapeHeading as="h1" lines={lines} accent={accent} size="t-h1" />
            {lead && <p className="t-lead ph__lead">{lead}</p>}
            {children && <div style={{ marginTop: 18 }}>{children}</div>}
          </div>
          {sticker && <Sticker name={sticker} size={150} tilt={8} className="ph__sticker" />}
        </div>
      </Scene>
      <style>{PH_CSS}</style>
    </header>
  )
}

const PH_CSS = `
.ph { margin-bottom: 28px; }
.ph--calm { padding: 20px 0 8px; }
.ph__band { border-radius: var(--r-lg); background: var(--sky-2); }
.ph__inner { position: relative; display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; min-height: 260px; padding: clamp(24px, 3vw, 36px); }
.ph__lead { margin-top: 16px; max-width: 520px; color: var(--ink); }
@media (max-width: 760px) {
  .ph__inner { min-height: 200px; padding: 20px; }
  .ph__sticker { display: none !important; }
}
`
