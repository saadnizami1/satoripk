import { createHash, timingSafeEqual } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const VIEWS = {
  mood:   { view: 'research_mood_complete',   file: 'satori_mood_data.csv' },
  stress: { view: 'research_stress_complete', file: 'satori_stress_data.csv' },
} as const

// Compare fixed-length digests so neither content nor length leaks via timing.
function passwordMatches(given: string, expected: string) {
  const a = createHash('sha256').update(given).digest()
  const b = createHash('sha256').update(expected).digest()
  return timingSafeEqual(a, b)
}

function toCsv(rows: Record<string, unknown>[]) {
  const headers = Object.keys(rows[0])
  const cell = (val: unknown) => {
    if (val === null || val === undefined) return ''
    const s = typeof val === 'object' ? JSON.stringify(val) : String(val)
    // Quote anything with separators, and neutralise spreadsheet formulas.
    const safe = /^[=+\-@]/.test(s) ? `'${s}` : s
    return /[",\n\r]/.test(safe) || safe !== s ? `"${safe.replace(/"/g, '""')}"` : safe
  }
  return [headers.join(','), ...rows.map(r => headers.map(h => cell(r[h])).join(','))].join('\n')
}

export async function POST(request: NextRequest) {
  const expected = process.env.RESEARCH_DATA_PASSWORD
  if (!expected) return NextResponse.json({ error: 'Export is not configured' }, { status: 500 })

  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getClaims()
  if (!auth?.claims?.sub) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // type 'verify' only checks the password (used to unlock the page).
  const body = await request.json().catch(() => null)
  const type = body?.type as keyof typeof VIEWS | 'verify'
  if ((type !== 'verify' && !VIEWS[type]) || typeof body?.password !== 'string') {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  if (!passwordMatches(body.password, expected)) {
    // Slow down guessing.
    await new Promise(r => setTimeout(r, 1000))
    return NextResponse.json({ error: 'Incorrect password' }, { status: 403 })
  }
  if (type === 'verify') return new Response(null, { status: 204 })

  // The research views are only readable by the service role.
  const { data, error } = await createAdminClient()
    .from(VIEWS[type].view).select('*').order('date_logged', { ascending: false })
  if (error) {
    console.error('Research export failed:', error.message)
    return NextResponse.json({ error: 'Export failed' }, { status: 500 })
  }
  if (!data?.length) return NextResponse.json({ error: 'No data available yet.' }, { status: 404 })

  return new Response(toCsv(data), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${VIEWS[type].file}"`,
      'Cache-Control': 'no-store',
    },
  })
}
