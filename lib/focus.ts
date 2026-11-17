// Focus minutes are a per-device convenience kept in localStorage, like
// `pomodoro_total` (the count of finished focus blocks). Nothing here is
// sent to the server.
import { localDateKey } from './dates'

const KEY = 'satori:focus-today'

export function readFocusToday(): number {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || 'null')
    return v && v.day === localDateKey(new Date()) ? Number(v.minutes) || 0 : 0
  } catch { return 0 }
}

/** Call when a focus block finishes. */
export function recordFocus(minutes: number) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ day: localDateKey(new Date()), minutes: readFocusToday() + minutes }))
    localStorage.setItem('pomodoro_total', String((parseInt(localStorage.getItem('pomodoro_total') || '0') || 0) + 1))
  } catch { /* storage unavailable */ }
}
