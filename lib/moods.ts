// The five-step mood scale (moods.mood_score 1–5), shown as weather.
// 1 is the heaviest day, 5 the brightest. Labels never shout and the
// replies never guilt; each suggests one small next step.

export type MoodScore = 1 | 2 | 3 | 4 | 5

export interface Mood {
  score: MoodScore
  label: string
  weather: string
  color: string
  reply: string
  next: { label: string; href: string }
}

export const MOODS: Mood[] = [
  { score: 1, label: 'Heavy',  weather: 'rain',        color: 'var(--mood-1)', reply: "That's okay. Kokoro is here whenever you want to talk.",           next: { label: 'Talk to Kokoro',     href: '/dashboard/kokoro' } },
  { score: 2, label: 'Low',    weather: 'overcast',    color: 'var(--mood-2)', reply: 'Thanks for being honest. A two-minute breathing break might help.', next: { label: 'Breathe for 2 min',  href: '/dashboard/breathing' } },
  { score: 3, label: 'Okay',   weather: 'some sun',    color: 'var(--mood-3)', reply: 'Okay is a fine place to start. Want to plan a focus block?',        next: { label: 'Start a focus block', href: '/dashboard/pomodoro' } },
  { score: 4, label: 'Calm',   weather: 'clear dusk',  color: 'var(--mood-4)', reply: "Nice. Jot down what's helping, so you can find it again.",          next: { label: 'Open my journal',    href: '/dashboard/journal' } },
  { score: 5, label: 'Bright', weather: 'full sun',    color: 'var(--mood-5)', reply: 'Love that. Save the feeling in your journal.',                      next: { label: 'Open my journal',    href: '/dashboard/journal' } },
]

export const moodFor = (score: number | null | undefined): Mood | undefined =>
  MOODS.find(m => m.score === Math.round(Number(score)))

/** Key used to carry a mood picked on the landing page through sign-up. */
export const PENDING_MOOD_KEY = 'satori:pending-mood'

/** Time-of-day greeting in the user's local clock. Render on the client only. */
export function greetingFor(date = new Date()): { line: string; scene: 'dawn' | 'day' | 'dusk' | 'night' } {
  const h = date.getHours()
  if (h >= 5 && h < 12) return { line: 'good morning', scene: h < 8 ? 'dawn' : 'day' }
  if (h >= 12 && h < 17) return { line: 'good afternoon', scene: 'day' }
  if (h >= 17 && h < 22) return { line: 'good evening', scene: h < 20 ? 'dusk' : 'night' }
  return { line: 'still up', scene: 'night' }
}

/** First name, or "friend" — never a placeholder like WELCOME. */
export function firstName(name: string | null | undefined): string {
  const n = (name ?? '').trim().split(/\s+/)[0]
  return n || 'friend'
}
