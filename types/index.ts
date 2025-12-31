export interface UserProfile {
  id: string
  name: string
  age: number
  gender: string
  school_class: string
  language: 'en' | 'ur'
  hobbies: string[]
  interests: string[]
  personality_traits: string[]
  created_at: string
  updated_at: string
}

export interface Mood {
  id: string
  user_id: string
  mood_level: number
  note: string
  created_at: string
}

export interface JournalEntry {
  id: string
  user_id: string
  title: string
  content: string
  created_at: string
}

export interface AcademicStress {
  id: string
  user_id: string
  study_hours: number
  performance_rating: number
  stress_level: number
  notes: string
  created_at: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface ChatSession {
  id: string
  user_id: string
  messages: ChatMessage[]
  created_at: string
  updated_at: string
}