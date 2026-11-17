'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { supabase } from '@/lib/supabase'
import { localDateKey } from '@/lib/dates'
import { MOODS, moodFor } from '@/lib/moods'
import { PageHeader } from '@/components/app/PageHeader'
import { TornPaper, Skeleton } from '@/components/ui/kit'
import { MoodGlyph } from '@/components/ui/MoodGlyph'

type Trend = 'up' | 'down' | 'flat'
const TREND_WORD: Record<Trend, string> = { up: 'lifting', down: 'dipping', flat: 'steady' }

function GlyphDot({ cx, cy, payload }: any) {
  if (cx == null || cy == null) return null
  return <g transform={`translate(${cx - 13} ${cy - 13})`}><MoodGlyph score={payload.score} size={26} /></g>
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const m = moodFor(payload[0]?.value)
  return (
    <div className="sheet" style={{ padding: '8px 12px', fontSize: 14 }}>
      <div className="faint">{label}</div>
      <div style={{ fontWeight: 600 }}>{m?.label}</div>
    </div>
  )
}

export default function MoodGraphPage() {
  const [moods, setMoods]     = useState<{ date: string; score: number }[]>([])
  const [range, setRange]     = useState<'7' | '30' | '90'>('30')
  const [loading, setLoading] = useState(true)
  const [stats, setStats]     = useState({ average: 0, trend: 'flat' as Trend, best: '', total: 0, streak: 0 })

  useEffect(() => {
    const fetchMoods = async () => {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setLoading(false); return }
      const from = new Date()
      from.setDate(from.getDate() - parseInt(range))
      const { data } = await supabase
        .from('moods').select('created_at, mood_score').eq('user_id', session.user.id)
        .gte('created_at', from.toISOString())
        .order('created_at', { ascending: true })

      if (data && data.length > 0) {
        const scores = data.map(m => m.mood_score ?? 3)
        const avg    = scores.reduce((a, b) => a + b, 0) / scores.length

        // Consecutive local calendar days with at least one entry, ending today.
        const loggedDays = new Set(data.map(m => localDateKey(m.created_at)))
        let streak = 0
        for (let i = 0; i < 90; i++) {
          const d = new Date(); d.setDate(d.getDate() - i)
          if (loggedDays.has(localDateKey(d))) streak++
          else break
        }
        const half = Math.floor(scores.length / 2)
        const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / Math.max(xs.length, 1)
        const firstAvg = mean(scores.slice(0, half)), secondAvg = mean(scores.slice(half))
        const trend: Trend = half === 0 ? 'flat' : secondAvg > firstAvg + 0.2 ? 'up' : secondAvg < firstAvg - 0.2 ? 'down' : 'flat'

        setStats({ average: parseFloat(avg.toFixed(1)), trend, best: moodFor(Math.max(...scores))?.label ?? '', total: data.length, streak })
        setMoods(data.map(m => ({
          date: new Date(m.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
          score: m.mood_score ?? 3,
        })))
      } else {
        setMoods([])
        setStats({ average: 0, trend: 'flat', best: '', total: 0, streak: 0 })
      }
      setLoading(false)
    }
    fetchMoods()
  }, [range])

  // One plain-language reading of the period.
  const insight = !stats.total ? '' :
    stats.average < 2.5 ? "It's been a heavy stretch. That's worth noticing, and worth talking about, with Kokoro or with someone you trust." :
    stats.trend === 'down' && stats.total > 6 ? 'Your mood has dipped over this period. A few lines in your journal might show what changed.' :
    stats.trend === 'up' ? "Your mood has been lifting. Try to notice what's helping so you can come back to it." :
    stats.average >= 4 ? 'Mostly bright days lately. Good to see.' :
    'Fairly steady so far. The longer you keep checking in, the more this graph will tell you.'

  return (
    <div>
      <PageHeader lines={['your', 'patterns']} accent="patterns" art="day" sticker="chart"
        lead="Your check-ins as weather, day by day." />

      <div role="radiogroup" aria-label="Time range" className="row" style={{ marginBottom: 24 }}>
        {([['7', 'Last 7 days'], ['30', 'Last 30 days'], ['90', 'Last 3 months']] as const).map(([r, l]) => (
          <button key={r} type="button" role="radio" aria-checked={range === r} className="chip" onClick={() => setRange(r)}>{l}</button>
        ))}
      </div>

      {loading ? <Skeleton /> : moods.length === 0 ? (
        <div className="sheet sheet--pad stack-sm">
          <h2 className="section-title" style={{ margin: 0 }}>No check-ins in this period</h2>
          <p className="t-body muted">Log your mood once a day and your patterns will start to show here.</p>
          <div><Link href="/dashboard/mood" className="pill pill--tape pill--sm">Check in now</Link></div>
        </div>
      ) : (
        <div className="stack-lg">
          <ul className="ins-notes" aria-label="Summary">
            <li><TornPaper color="var(--marigold)" tilt={-1.4} seed={3}><p className="t-num">{stats.average}</p><p className="t-small" style={{ marginTop: 6 }}>average mood, out of 5</p></TornPaper></li>
            <li><TornPaper color="var(--mint)" tilt={1.1} seed={5}><p className="t-num" style={{ fontSize: 'clamp(34px, 4vw, 52px)' }}>{TREND_WORD[stats.trend]}</p><p className="t-small" style={{ marginTop: 6 }}>overall direction</p></TornPaper></li>
            <li><TornPaper color="var(--paper)" tilt={-0.8} seed={8}><p className="t-num">{stats.streak}</p><p className="t-small" style={{ marginTop: 6 }}>days in a row</p></TornPaper></li>
            <li><TornPaper color="var(--sky-2)" tilt={1.5} seed={11}><p className="t-num">{stats.total}</p><p className="t-small" style={{ marginTop: 6 }}>check-ins</p></TornPaper></li>
          </ul>

          <section aria-labelledby="g-chart" className="sheet sheet--pad">
            <h2 id="g-chart" className="section-title">Mood over time</h2>
            <div style={{ height: 300 }} role="img" aria-label={`Mood chart: ${stats.total} check-ins, average ${stats.average} out of 5, ${TREND_WORD[stats.trend]}.`}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={moods} margin={{ top: 18, right: 18, left: 0, bottom: 4 }}>
                  <CartesianGrid stroke="#D3DCD6" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 13, fill: '#56626C' }} axisLine={false} tickLine={false} minTickGap={28} />
                  <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tickFormatter={v => moodFor(v)?.label ?? v}
                    tick={{ fontSize: 13, fill: '#56626C' }} axisLine={false} tickLine={false} width={56} />
                  <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#D3DCD6' }} />
                  <Line type="monotone" dataKey="score" stroke="#2E4A6B" strokeWidth={2} dot={<GlyphDot />} activeDot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <ul className="row t-small muted" style={{ listStyle: 'none', padding: 0, margin: '14px 0 0', gap: 14 }} aria-label="Key">
              {MOODS.map(m => <li key={m.score} className="row" style={{ gap: 4 }}><MoodGlyph score={m.score} size={22} />{m.label}</li>)}
            </ul>
          </section>

          {insight && (
            <section aria-labelledby="g-read" className="sheet sheet--pad stack-sm">
              <h2 id="g-read" className="section-title" style={{ margin: 0 }}>Reading the sky</h2>
              <p className="t-lead">{insight}</p>
              {stats.best && <p className="t-small muted">Brightest day in this period: {stats.best.toLowerCase()}.</p>}
            </section>
          )}
        </div>
      )}

      <style>{`
        .ins-notes { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 18px; }
        @media (max-width: 900px) { .ins-notes { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
      `}</style>
    </div>
  )
}
