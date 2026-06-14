'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, CheckCircle2, Clock } from 'lucide-react'

const MOODS = [
  { score: 1, emoji: '😔', label: 'Terrible', color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
  { score: 2, emoji: '😕', label: 'Bad',      color: '#F97316', bg: 'rgba(249,115,22,0.1)' },
  { score: 3, emoji: '😐', label: 'Okay',     color: '#EAB308', bg: 'rgba(234,179,8,0.1)'  },
  { score: 4, emoji: '🙂', label: 'Good',     color: '#34D399', bg: 'rgba(52,211,153,0.1)' },
  { score: 5, emoji: '😊', label: 'Great',    color: '#2DD4BF', bg: 'rgba(45,212,191,0.1)' },
]

const STRESS_OPTIONS = [
  { value: 'yes_heavy', label: 'Yes, heavily' },
  { value: 'yes_some',  label: 'Yes, somewhat' },
  { value: 'no',        label: 'Not really' },
  { value: 'unsure',    label: 'Not sure' },
]

export default function MoodPage() {
  const [selected, setSelected]    = useState<number | null>(null)
  const [stressAnswer, setStress]  = useState('')
  const [note, setNote]            = useState('')
  const [alreadyLogged, setLogged] = useState(false)
  const [todayMood, setTodayMood]  = useState<any>(null)
  const [history, setHistory]      = useState<any[]>([])
  const [saving, setSaving]        = useState(false)
  const [saved, setSaved]          = useState(false)
  const [userId, setUserId]        = useState('')

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)

      const [{ data: today }, { data: hist }] = await Promise.all([
        supabase.from('moods').select('*').eq('user_id', user.id)
          .gte('created_at', todayStart.toISOString()).order('created_at', { ascending: false }).limit(1),
        supabase.from('moods').select('*').eq('user_id', user.id)
          .order('created_at', { ascending: false }).limit(7),
      ])

      if (today?.length) { setLogged(true); setTodayMood(today[0]) }
      setHistory(hist ?? [])
    }
    load()
  }, [])

  const handleSave = async () => {
    if (selected === null || !userId) return
    setSaving(true)
    const { error } = await supabase.from('moods').insert({
      user_id: userId,
      mood_score: selected,
      note: note || (stressAnswer ? `Academic stress: ${stressAnswer}` : null),
    })
    if (!error) {
      setSaved(true)
      setLogged(true)
      const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
      const { data } = await supabase.from('moods').select('*').eq('user_id', userId)
        .gte('created_at', todayStart.toISOString()).limit(1)
      setTodayMood(data?.[0])
    }
    setSaving(false)
  }

  const moodData = MOODS.find(m => m.score === selected)

  return (
    <div className="max-w-lg mx-auto space-y-5">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(249,115,22,0.15)' }}>
            <Heart className="w-5 h-5" style={{ color: '#F97316' }} />
          </div>
          <div>
            <h1 className="text-2xl font-serif" style={{ color: '#F1F5F9', fontFamily: 'var(--font-instrument), Georgia, serif' }}>
              Mood Tracker
            </h1>
            <p className="text-xs" style={{ color: '#475569' }}>How are you feeling today?</p>
          </div>
        </div>
      </motion.div>

      {/* Already logged */}
      {alreadyLogged && todayMood ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl p-6 text-center"
          style={{ background: '#13161F', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="text-5xl mb-3">{MOODS.find(m => m.score === todayMood.mood_score)?.emoji}</div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4" style={{ color: '#4ADE80' }} />
            <p className="font-semibold text-sm" style={{ color: '#F1F5F9' }}>Mood logged for today</p>
          </div>
          <p className="text-sm" style={{ color: '#94A3B8' }}>
            You felt <strong style={{ color: MOODS.find(m => m.score === todayMood.mood_score)?.color }}>
              {MOODS.find(m => m.score === todayMood.mood_score)?.label}
            </strong>
          </p>
          {todayMood.note && (
            <p className="text-xs mt-2 italic" style={{ color: '#475569' }}>"{todayMood.note}"</p>
          )}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl p-5"
          style={{ background: '#13161F', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <p className="text-xs font-medium text-center mb-4" style={{ color: '#94A3B8' }}>Select how you're feeling</p>

          {/* Mood cards */}
          <div className="flex gap-2">
            {MOODS.map(mood => (
              <button
                key={mood.score}
                onClick={() => setSelected(mood.score)}
                className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all duration-200"
                style={{
                  background: selected === mood.score ? mood.bg : 'rgba(28,32,48,0.6)',
                  border: selected === mood.score ? `2px solid ${mood.color}60` : '2px solid transparent',
                  transform: selected === mood.score ? 'scale(1.06)' : 'scale(1)',
                  opacity: selected !== null && selected !== mood.score ? 0.45 : 1,
                }}
              >
                <span className="text-2xl">{mood.emoji}</span>
                <span className="text-[9px] font-semibold" style={{ color: selected === mood.score ? mood.color : '#475569' }}>
                  {mood.label}
                </span>
              </button>
            ))}
          </div>

          <AnimatePresence>
            {selected !== null && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-5 space-y-4 overflow-hidden"
              >
                {/* Stress question */}
                <div>
                  <p className="text-xs font-medium mb-2" style={{ color: '#94A3B8' }}>Is this mood related to academic stress?</p>
                  <div className="grid grid-cols-2 gap-2">
                    {STRESS_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setStress(stressAnswer === opt.value ? '' : opt.value)}
                        className="text-xs py-2 px-3 rounded-xl transition-all font-medium"
                        style={{
                          background: stressAnswer === opt.value ? 'rgba(45,212,191,0.15)' : '#1C2030',
                          border: stressAnswer === opt.value ? '1px solid rgba(45,212,191,0.4)' : '1px solid rgba(255,255,255,0.06)',
                          color: stressAnswer === opt.value ? '#2DD4BF' : '#94A3B8',
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Note */}
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="Add a note (optional)…"
                  rows={2}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl resize-none focus:outline-none transition-all"
                  style={{
                    background: '#222638',
                    border: '1px solid rgba(255,255,255,0.06)',
                    color: '#F1F5F9',
                  }}
                />

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all disabled:opacity-50"
                  style={{
                    background: moodData ? `linear-gradient(135deg, ${moodData.color}, ${moodData.color}cc)` : '#14B8A6',
                    boxShadow: moodData ? `0 0 20px ${moodData.color}30` : undefined,
                  }}
                >
                  {saving ? 'Saving…' : saved ? 'Saved!' : `Log as ${moodData?.label}`}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* History */}
      {history.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl p-5"
          style={{ background: '#13161F', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <h2 className="text-sm font-semibold mb-4" style={{ color: '#F1F5F9' }}>Recent moods</h2>
          <div className="space-y-3">
            {history.map((entry, i) => {
              const mood = MOODS.find(m => m.score === entry.mood_score)
              return (
                <div key={entry.id ?? i} className="flex items-center gap-3 py-2">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-xl shrink-0"
                    style={{ background: mood?.bg ?? '#1C2030' }}
                  >
                    {mood?.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium" style={{ color: mood?.color ?? '#F1F5F9' }}>{mood?.label}</p>
                    {entry.note && <p className="text-[11px] truncate" style={{ color: '#475569' }}>{entry.note}</p>}
                  </div>
                  <div className="flex items-center gap-1 text-[10px]" style={{ color: '#475569' }}>
                    <Clock className="w-3 h-3" />
                    {new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}
    </div>
  )
}
