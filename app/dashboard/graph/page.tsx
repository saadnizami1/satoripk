'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
  ResponsiveContainer, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts'

const MOOD_WORDS = ['', 'TERRIBLE', 'BAD', 'OKAY', 'GOOD', 'GREAT']
const TREND_UP   = '↑'
const TREND_DOWN = '↓'
const TREND_FLAT = '→'

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const score = payload[0]?.value
  return (
    <div style={{
      background: 'var(--bg-invert)', color: 'var(--ink-invert)',
      border: 'none', padding: '8px 12px',
      fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.06em',
    }}>
      <div>{label}</div>
      <div style={{ marginTop: 2 }}>{MOOD_WORDS[score] ?? score}</div>
    </div>
  )
}

export default function MoodGraphPage() {
  const [moods, setMoods]     = useState<any[]>([])
  const [range, setRange]     = useState<'7' | '30' | '90'>('30')
  const [loading, setLoading] = useState(true)
  const [stats, setStats]     = useState({ average: 0, trend: TREND_FLAT, best: '—', total: 0, streak: 0 })

  useEffect(() => { fetchMoods() }, [range])

  const fetchMoods = async () => {
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const from = new Date()
    from.setDate(from.getDate() - parseInt(range))

    const { data } = await supabase
      .from('moods').select('*').eq('user_id', session.user.id)
      .gte('created_at', from.toISOString())
      .order('created_at', { ascending: true })

    if (data && data.length > 0) {
      const scores = data.map(m => m.mood_score ?? 3)
      const avg    = scores.reduce((a, b) => a + b, 0) / scores.length
      const best   = MOOD_WORDS[Math.max(...scores)] ?? '—'

      const today = new Date()
      let streak = 0
      for (let i = 0; i < 90; i++) {
        const d = new Date(today); d.setDate(d.getDate() - i)
        const ds = d.toISOString().split('T')[0]
        if (data.some(m => m.created_at.startsWith(ds))) streak++
        else break
      }

      const halfLen = Math.floor(scores.length / 2)
      const firstHalf  = scores.slice(0, halfLen)
      const secondHalf = scores.slice(halfLen)
      const firstAvg  = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length
      const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length
      const trend = secondAvg > firstAvg + 0.2 ? TREND_UP : secondAvg < firstAvg - 0.2 ? TREND_DOWN : TREND_FLAT

      setStats({ average: parseFloat(avg.toFixed(1)), trend, best, total: data.length, streak })
      setMoods(data.map(m => ({
        date: new Date(m.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }).toUpperCase(),
        score: m.mood_score ?? 3,
      })))
    } else {
      setMoods([])
      setStats({ average: 0, trend: TREND_FLAT, best: '—', total: 0, streak: 0 })
    }
    setLoading(false)
  }

  return (
    <div style={{ maxWidth: 680 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 8 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(36px, 5vw, 56px)', color: 'var(--ink)', letterSpacing: '-0.03em', lineHeight: 1 }}>
          MOOD GRAPH
        </h1>
        <div style={{ display: 'flex', border: '1.5px solid var(--border)', marginBottom: 4 }}>
          {(['7', '30', '90'] as const).map((r, i) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              style={{
                padding: '8px 14px',
                background: range === r ? 'var(--bg-invert)' : 'var(--bg)',
                color: range === r ? 'var(--ink-invert)' : 'var(--ink-2)',
                border: 'none', borderRight: i < 2 ? '1.5px solid var(--border)' : 'none',
                fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11,
                letterSpacing: '0.06em', cursor: 'pointer',
                transition: 'background 80ms, color 80ms',
              }}
            >
              {r === '7' ? '7D' : r === '30' ? '30D' : 'ALL'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ borderTop: '1.5px solid var(--border)', marginBottom: 16 }} />

      {/* Stats strip */}
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.08em', marginBottom: 24 }}>
        AVG: {loading ? '—' : stats.average || '—'}  ·  TREND: {loading ? '—' : stats.trend}  ·  BEST: {loading ? '—' : stats.best}  ·  STREAK: {loading ? '—' : `${stats.streak}D`}
      </div>

      {/* Chart */}
      <div style={{ border: '1.5px solid var(--border)', background: 'var(--bg-card)', padding: '24px 16px 16px', marginBottom: 24 }}>
        {loading ? (
          <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[200, 160, 120].map((w, i) => (
                <div key={i} className="skeleton" style={{ width: w, height: 12 }} />
              ))}
            </div>
          </div>
        ) : moods.length === 0 ? (
          <div style={{ height: 240, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: 'var(--ink-3)', marginBottom: 8 }}>
              NO DATA FOR THIS PERIOD.
            </div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-3)' }}>
              Start logging moods to see your patterns.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={moods} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
              <CartesianGrid stroke="var(--border-2)" horizontal vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontFamily: 'var(--font-mono)', fontSize: 10, fill: 'var(--ink-3)', letterSpacing: 2 }}
                axisLine={false} tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={[1, 5]}
                ticks={[1, 2, 3, 4, 5]}
                tickFormatter={v => MOOD_WORDS[v] ?? v}
                tick={{ fontFamily: 'var(--font-mono)', fontSize: 9, fill: 'var(--ink-3)', letterSpacing: 1 }}
                axisLine={false} tickLine={false} width={60}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--border-2)', strokeWidth: 1 }} />
              <Line
                type="linear"
                dataKey="score"
                stroke="var(--ink)"
                strokeWidth={2}
                dot={{ fill: 'var(--bg)', stroke: 'var(--ink)', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 5, fill: 'var(--ink-invert)', stroke: 'var(--ink)', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Insight rows */}
      {moods.length > 0 && (
        <div style={{ border: '1.5px solid var(--border)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.12em', padding: '10px 16px', borderBottom: '1px solid var(--border-2)' }}>
            INSIGHTS
          </div>
          {[
            stats.streak >= 7 && `${stats.streak}-day logging streak.`,
            stats.average >= 4 && `Average mood ${stats.average}/5 — you're doing well.`,
            stats.trend === TREND_DOWN && stats.total > 7 && 'Mood has trended down this period. Consider journaling or talking to Kokoro.',
            stats.average < 3 && stats.total > 0 && 'Tough stretch. Try a breathing exercise or chat with Kokoro.',
          ].filter(Boolean).map((insight, i, arr) => (
            <div
              key={i}
              style={{
                padding: '12px 16px',
                borderBottom: i < arr.length - 1 ? '1px solid var(--border-2)' : 'none',
                fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.5,
              }}
            >
              {insight as string}
            </div>
          ))}
          {stats.total === 0 && (
            <div style={{ padding: '12px 16px', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink-3)' }}>
              No insights yet. Start logging to see patterns.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
