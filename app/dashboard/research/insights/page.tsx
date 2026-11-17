'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { supabase } from '@/lib/supabase'
import { localDateKey } from '@/lib/dates'
import { PageHeader } from '@/components/app/PageHeader'
import { TornPaper, Skeleton } from '@/components/ui/kit'

const PERF: Record<number, string> = { 5: 'Excellent', 4: 'Good', 3: 'Average', 2: 'Below average', 1: 'Poor' }
const STRESS: Record<number, string> = { 5: 'Extremely', 4: 'Very', 3: 'Moderately', 2: 'Slightly', 1: 'Not at all' }
const IMPACT: Record<string, string> = { yes: 'Yes', no: 'No', somewhat: 'Somewhat', planning: 'Planning to' }

type Stats = {
  avgPerformance: number; avgStress: number; totalEntries: number; streak: number
  selfStudyCount: number; moodImpactCount: number; lifeImpactCount: number
  highStressDays: number; lowPerformanceDays: number
}
const EMPTY: Stats = { avgPerformance: 0, avgStress: 0, totalEntries: 0, streak: 0, selfStudyCount: 0, moodImpactCount: 0, lifeImpactCount: 0, highStressDays: 0, lowPerformanceDays: 0 }

function parseNotes(notes: string | null) {
  try { return JSON.parse(notes || '{}') ?? {} } catch { return {} }
}

export default function StressInsightsPage() {
  const [entries, setEntries]     = useState<any[] | null>(null)
  const [timeRange, setTimeRange] = useState<'30' | '90'>('30')
  const [stats, setStats]         = useState<Stats>(EMPTY)

  useEffect(() => {
    const fetchEntries = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const daysAgo = new Date()
      daysAgo.setDate(daysAgo.getDate() - parseInt(timeRange))
      const { data } = await supabase
        .from('academic_stress').select('id, created_at, stress_level, performance_rating, notes').eq('user_id', session.user.id)
        .gte('created_at', daysAgo.toISOString()).order('created_at', { ascending: false })
      const rows = data ?? []
      setEntries(rows)
      setStats(rows.length ? calculateStats(rows) : EMPTY)
    }
    fetchEntries()
  }, [timeRange])

  const chart = (entries ?? []).slice().reverse().map(e => ({
    day: new Date(e.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
    stress: e.stress_level, school: e.performance_rating,
  }))

  const insights: string[] = []
  if (stats.totalEntries) {
    if (stats.avgStress >= 4) insights.push(`Your stress has averaged ${stats.avgStress} out of 5. That's a lot to carry. A two-minute breathing break or a talk with Kokoro can take the edge off.`)
    else if (stats.avgStress <= 2) insights.push(`Your stress has averaged ${stats.avgStress} out of 5. Whatever you're doing, it seems to be working.`)
    if (stats.moodImpactCount > stats.totalEntries / 2) insights.push(`School affected your mood on ${Math.round((stats.moodImpactCount / stats.totalEntries) * 100)}% of the days you checked in.`)
    if (stats.lifeImpactCount > stats.totalEntries / 3) insights.push('School has been spilling into the rest of your day quite often. Protect some time that has nothing to do with studying.')
    if (stats.streak >= 7) insights.push(`You've checked in ${stats.streak} days in a row. Patterns get clearer the longer you keep going.`)
    if (stats.totalEntries < 5) insights.push('A few more check-ins and the patterns here will start to mean something.')
  }

  return (
    <div>
      <Link href="/dashboard/research" className="text-btn" style={{ marginBottom: 12 }}><ArrowLeft size={18} aria-hidden="true" /> Back to stress check-in</Link>
      <PageHeader lines={['your stress,', 'over time']} accent="over time" art="dusk" sticker="chart"
        lead="How school has been feeling, and how much of it spills into the rest of your day." />

      <div role="radiogroup" aria-label="Time range" className="row" style={{ marginBottom: 24 }}>
        {(['30', '90'] as const).map(r => (
          <button key={r} type="button" role="radio" aria-checked={timeRange === r} className="chip" onClick={() => setTimeRange(r)}>
            {r === '30' ? 'Last 30 days' : 'Last 3 months'}
          </button>
        ))}
      </div>

      {entries === null ? <Skeleton /> : entries.length === 0 ? (
        <div className="sheet sheet--pad stack-sm">
          <h2 className="section-title" style={{ margin: 0 }}>Nothing here yet</h2>
          <p className="t-body muted">Check in on your stress a few times and your trends will show up here.</p>
          <div><Link href="/dashboard/research" className="pill pill--tape pill--sm">Check in now</Link></div>
        </div>
      ) : (
        <div className="stack-lg">
          <ul className="ins-notes" aria-label="Summary">
            {[
              { n: stats.avgStress.toFixed(1), l: 'average stress, out of 5', c: 'var(--marigold)', s: 2 },
              { n: stats.avgPerformance.toFixed(1), l: 'how school went, out of 5', c: 'var(--mint)', s: 6 },
              { n: String(stats.highStressDays), l: 'high-stress days (4 or 5)', c: 'var(--rose)', s: 9 },
              { n: `${stats.selfStudyCount}/${stats.totalEntries}`, l: 'days you self-studied', c: 'var(--paper)', s: 13 },
            ].map((x, i) => (
              <li key={x.l}>
                <TornPaper color={x.c} tilt={[-1.5, 1, -0.8, 1.4][i]} seed={x.s}>
                  <p className="t-num">{x.n}</p>
                  <p className="t-small" style={{ marginTop: 6 }}>{x.l}</p>
                </TornPaper>
              </li>
            ))}
          </ul>

          <section aria-labelledby="ins-chart" className="sheet sheet--pad">
            <h2 id="ins-chart" className="section-title">Stress and school, day by day</h2>
            <div style={{ height: 260 }} role="img" aria-label={`Line chart of ${chart.length} check-ins. Average stress ${stats.avgStress} out of 5.`}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chart} margin={{ top: 10, right: 12, bottom: 0, left: -24 }}>
                  <CartesianGrid stroke="#D3DCD6" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 13, fill: '#56626C' }} tickLine={false} axisLine={false} minTickGap={24} />
                  <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 13, fill: '#56626C' }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #D3DCD6', fontSize: 14 }} />
                  <Line type="monotone" dataKey="stress" name="Stress" stroke="#B0225A" strokeWidth={2.5} dot={{ r: 3 }} isAnimationActive={false} />
                  <Line type="monotone" dataKey="school" name="How school went" stroke="#2E4A6B" strokeWidth={2.5} strokeDasharray="5 4" dot={{ r: 3 }} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="t-small muted" style={{ marginTop: 10 }}>Solid line: stress. Dashed line: how school went.</p>
          </section>

          {insights.length > 0 && (
            <section aria-labelledby="ins-what" className="sheet sheet--pad">
              <h2 id="ins-what" className="section-title">What this suggests</h2>
              <ul className="list">{insights.map(t => <li key={t} className="t-body">{t}</li>)}</ul>
            </section>
          )}

          <section aria-labelledby="ins-log">
            <h2 id="ins-log" className="section-title">Every check-in</h2>
            <ul className="list sheet" style={{ padding: '4px 20px' }}>
              {entries.map(entry => {
                const r = parseNotes(entry.notes)
                return (
                  <li key={entry.id} style={{ alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    <span className="t-label" style={{ minWidth: 120 }}>
                      {new Date(entry.created_at).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </span>
                    <span className="t-small" style={{ flex: 1, minWidth: 220 }}>
                      Stress: <strong>{STRESS[entry.stress_level] ?? '–'}</strong> ({entry.stress_level}/5). School: <strong>{PERF[entry.performance_rating] ?? '–'}</strong>.
                      {r.selfStudy && <> Self-study: {IMPACT[r.selfStudy] ?? r.selfStudy}.</>}
                      {r.moodImpact && <> Affected mood: {IMPACT[r.moodImpact] ?? r.moodImpact}.</>}
                      {r.lifeImpact && <> Affected the day: {IMPACT[r.lifeImpact] ?? r.lifeImpact}.</>}
                      {r.lifeImpactExample && <span className="muted"> &ldquo;{r.lifeImpactExample}&rdquo;</span>}
                    </span>
                  </li>
                )
              })}
            </ul>
          </section>
        </div>
      )}

      <style>{`
        .ins-notes { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 18px; }
        @media (max-width: 900px) { .ins-notes { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
      `}</style>
    </div>
  )
}

function calculateStats(data: any[]): Stats {
  const perf   = data.map(e => e.performance_rating)
  const stress = data.map(e => e.stress_level)
  let selfStudyCount = 0, moodImpactCount = 0, lifeImpactCount = 0
  data.forEach(entry => {
    const notes = parseNotes(entry.notes)
    if (notes.selfStudy === 'yes') selfStudyCount++
    if (notes.moodImpact === 'yes') moodImpactCount++
    if (notes.lifeImpact === 'yes') lifeImpactCount++
  })
  const loggedDays = new Set(data.map(e => localDateKey(e.created_at)))
  let streak = 0
  for (let i = 0; i < 90; i++) {
    const d = new Date(); d.setDate(d.getDate() - i)
    if (loggedDays.has(localDateKey(d))) streak++
    else break
  }
  const avg = (xs: number[]) => parseFloat((xs.reduce((a, b) => a + b, 0) / xs.length).toFixed(1))
  return {
    avgPerformance: avg(perf), avgStress: avg(stress), totalEntries: data.length, streak,
    selfStudyCount, moodImpactCount, lifeImpactCount,
    highStressDays: stress.filter(s => s >= 4).length,
    lowPerformanceDays: perf.filter(p => p <= 2).length,
  }
}
