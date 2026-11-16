import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Hit daily by the Vercel cron in vercel.json. A real query keeps the
// Supabase project from being paused for inactivity on the free plan.
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const started = Date.now()
  const { error } = await createAdminClient()
    .from('profiles').select('id', { count: 'exact', head: true })
  if (error) {
    console.error('Health check failed:', error.message)
    return NextResponse.json({ ok: false }, { status: 503 })
  }
  return NextResponse.json({ ok: true, dbMs: Date.now() - started })
}
