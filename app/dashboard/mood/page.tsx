'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, CheckCircle2, Clock, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const MOODS = [
  { score: 1, emoji: '😔', label: 'Terrible', color: '#C75B5B' },
  { score: 2, emoji: '😕', label: 'Bad',      color: '#C4661F' },
  { score: 3, emoji: '😐', label: 'Okay',     color: '#9F8F5F' },
  { score: 4, emoji: '🙂', label: 'Good',     color: '#5A8C6F' },
  { score: 5, emoji: '😊', label: 'Great',    color: '#4A6C6F' },
]

const STRESS_OPTIONS = [
  { value: 'yes_heavy', label: 'Yes, heavily' },
  { value: 'yes_some',  label: 'Yes, somewhat' },
  { value: 'no',        label: 'Not really' },
  { value: 'unsure',    label: 'Not sure' },
]

export default function MoodPage() {
  const [selected, setSelected]     = useState<number | null>(null)
  const [stressAnswer, setStress]   = useState('')
  const [note, setNote]             = useState('')
  const [alreadyLogged, setLogged]  = useState(false)
  const [todayMood, setTodayMood]   = useState<any>(null)
  const [history, setHistory]       = useState<any[]>([])
  const [saving, setSaving]         = useState(false)
  const [saved, setSaved]           = useState(false)
  const [userId, setUserId]         = useState('')

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)

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
      user_id: user_id_ref(),
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

  // closure to get userId in handleSave
  const user_id_ref = () => userId

  const moodData = MOODS.find(m => m.score === selected)

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-[#5F5F5F] hover:text-[#2C2C2C] mb-4 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#C4661F]/12 flex items-center justify-center">
            <Heart className="w-5 h-5 text-[#C4661F]" />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-semibold text-[#2C2C2C]">Mood Tracker</h1>
            <p className="text-xs text-[#9F9F9F]">How are you feeling today?</p>
          </div>
        </div>
      </motion.div>

      {/* Already logged today */}
      {alreadyLogged && todayMood ? (
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="glass rounded-3xl p-6 text-center">
          <div className="text-5xl mb-3">{MOODS.find(m => m.score === todayMood.mood_score)?.emoji}</div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <p className="font-semibold text-[#2C2C2C]">Mood logged for today</p>
          </div>
          <p className="text-sm text-[#5F5F5F]">
            You felt <strong>{MOODS.find(m => m.score === todayMood.mood_score)?.label}</strong>
          </p>
          {todayMood.note && <p className="text-xs text-[#9F9F9F] mt-2 italic">"{todayMood.note}"</p>}
        </motion.div>
      ) : (
        <>
          {/* Mood selector */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-3xl p-6">
            <p className="text-sm font-medium text-[#5F5F5F] mb-4 text-center">Select how you're feeling</p>
            <div className="flex justify-between gap-2">
              {MOODS.map(mood => (
                <button
                  key={mood.score}
                  onClick={() => setSelected(mood.score)}
                  className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-2xl transition-all duration-200 ${
                    selected === mood.score
                      ? 'bg-white shadow-lg scale-105'
                      : 'hover:bg-white/50'
                  }`}
                >
                  <span className="text-3xl">{mood.emoji}</span>
                  <span className="text-[10px] font-medium text-[#5F5F5F]">{mood.label}</span>
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
                  {/* Academic stress question */}
                  <div>
                    <p className="text-xs font-medium text-[#5F5F5F] mb-2">Is this mood related to academic stress?</p>
                    <div className="grid grid-cols-2 gap-2">
                      {STRESS_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => setStress(stressAnswer === opt.value ? '' : opt.value)}
                          className={`text-xs py-2 px-3 rounded-xl border transition-all ${
                            stressAnswer === opt.value
                              ? 'bg-[#4A6C6F] text-white border-[#4A6C6F]'
                              : 'bg-white/50 text-[#5F5F5F] border-white/60 hover:border-[#4A6C6F]/40'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Optional note */}
                  <textarea
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    placeholder="Add a note (optional)…"
                    rows={2}
                    className="w-full bg-white/50 border border-white/60 rounded-xl px-3.5 py-2.5 text-sm text-[#2C2C2C] placeholder-[#C0BAB2] focus:outline-none focus:ring-2 focus:ring-[#4A6C6F]/30 resize-none transition-all"
                  />

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full py-3 rounded-2xl bg-linear-to-r from-[#4A6C6F] to-[#5A8C8F] text-white font-semibold text-sm shadow-lg disabled:opacity-50 transition-all"
                  >
                    {saving ? 'Saving…' : saved ? '✓ Saved!' : `Log as ${moodData?.label}`}
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}

      {/* History */}
      {history.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-3xl p-6">
          <h2 className="text-sm font-semibold text-[#2C2C2C] mb-4">Recent moods</h2>
          <div className="space-y-2.5">
            {history.map((entry, i) => {
              const mood = MOODS.find(m => m.score === entry.mood_score)
              return (
                <div key={entry.id ?? i} className="flex items-center gap-3 py-2">
                  <span className="text-2xl">{mood?.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#2C2C2C]">{mood?.label}</p>
                    {entry.note && <p className="text-[11px] text-[#9F9F9F] truncate">{entry.note}</p>}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-[#C0BAB2]">
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
