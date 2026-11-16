import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const USER_TABLES = ['journal_entries', 'chat_sessions', 'moods', 'academic_stress'] as const

// Permanently deletes the signed-in user's account and all their data.
export async function DELETE() {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getClaims()
  const userId = auth?.claims?.sub
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()

  // Storage objects are not removed by FK cascades.
  const { data: files } = await admin.storage.from('avatars').list(userId)
  if (files?.length) {
    await admin.storage.from('avatars').remove(files.map(f => `${userId}/${f.name}`))
  }

  // Rows cascade from auth.users, but delete explicitly in case a table lacks the FK.
  for (const table of USER_TABLES) {
    const { error } = await admin.from(table).delete().eq('user_id', userId)
    if (error) console.error(`Account delete: ${table}:`, error.message)
  }
  await admin.from('profiles').delete().eq('id', userId)

  const { error } = await admin.auth.admin.deleteUser(userId)
  if (error) {
    console.error('Account delete failed:', error.message)
    return NextResponse.json({ error: 'Could not delete account' }, { status: 500 })
  }
  return new Response(null, { status: 204 })
}
