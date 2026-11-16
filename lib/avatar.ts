import { supabase } from '@/lib/supabase'

const SIZE = 256
const LEGACY_KEY = 'profile_picture'

/** Centre-crops and downsizes an image to a small square JPEG. */
async function toAvatarBlob(src: Blob): Promise<Blob> {
  const bitmap = await createImageBitmap(src)
  const side = Math.min(bitmap.width, bitmap.height)
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = SIZE
  canvas.getContext('2d')!.drawImage(
    bitmap,
    (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side,
    0, 0, SIZE, SIZE,
  )
  bitmap.close()
  return new Promise((resolve, reject) =>
    canvas.toBlob(b => (b ? resolve(b) : reject(new Error('Could not encode image'))), 'image/jpeg', 0.85))
}

/** Uploads to the private avatars bucket and records the path on the profile. */
export async function uploadAvatar(userId: string, image: Blob): Promise<string> {
  const path = `${userId}/avatar.jpg`
  const { error } = await supabase.storage.from('avatars')
    .upload(path, await toAvatarBlob(image), { upsert: true, contentType: 'image/jpeg' })
  if (error) throw error
  const { error: profileError } = await supabase.from('profiles')
    .update({ avatar_path: path }).eq('id', userId)
  if (profileError) throw profileError
  return path
}

/** Short-lived URL for a private avatar. Cache-busted so a new upload shows. */
export async function avatarUrl(path: string): Promise<string | null> {
  const { data } = await supabase.storage.from('avatars').createSignedUrl(path, 60 * 60)
  return data ? `${data.signedUrl}&v=${Date.now()}` : null
}

/** Pictures used to be stored as base64 in localStorage — move one up once. */
export async function migrateLegacyAvatar(userId: string): Promise<string | null> {
  let dataUrl: string | null = null
  try { dataUrl = localStorage.getItem(LEGACY_KEY) } catch { return null }
  if (!dataUrl?.startsWith('data:image/')) return null
  try {
    const blob = await (await fetch(dataUrl)).blob()
    const path = await uploadAvatar(userId, blob)
    localStorage.removeItem(LEGACY_KEY)
    return path
  } catch (err) {
    console.error('Avatar migration failed:', err)
    return null
  }
}
