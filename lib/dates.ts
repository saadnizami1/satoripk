// Date helpers that work in the user's local timezone. Never derive a
// calendar day from toISOString() — that is the UTC day, which for
// Pakistan (UTC+5) is still "yesterday" until 5am.

/** ISO timestamp of local midnight today — use for `created_at >=` filters. */
export function startOfToday(): string {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

/** Local calendar day of a Date or ISO timestamp, as YYYY-MM-DD. */
export function localDateKey(value: Date | string): string {
  const d = typeof value === 'string' ? new Date(value) : value
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Fired after a mood / stress check-in so the nav badge can refresh. */
export const CHECKIN_EVENT = 'satori:checkin'

export function notifyCheckin() {
  window.dispatchEvent(new Event(CHECKIN_EVENT))
}
