'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'

interface ProfileData {
  id: string
  name: string
  email: string
  age: number
  gender: string
  education_level: string
  location: string
  religion: string
  family_status: string
  created_at: string
}

interface Stats {
  totalMoods: number
  totalJournals: number
  totalStressLogs: number
  totalPomodoros: number
  memberSince: string
}

const EDUCATION_LEVELS = [
  { value: 'primary-1',       label: 'Primary Year 1' },
  { value: 'primary-2',       label: 'Primary Year 2' },
  { value: 'primary-3',       label: 'Primary Year 3' },
  { value: 'primary-4',       label: 'Primary Year 4' },
  { value: 'primary-5',       label: 'Primary Year 5' },
  { value: 'middle-6',        label: 'Middle Year 6' },
  { value: 'middle-7',        label: 'Middle Year 7' },
  { value: 'middle-8',        label: 'Middle Year 8' },
  { value: 'matric-9',        label: 'Matric Year 9' },
  { value: 'matric-10',       label: 'Matric Year 10' },
  { value: 'olevel-1',        label: 'O-Levels Year 1' },
  { value: 'olevel-2',        label: 'O-Levels Year 2' },
  { value: 'alevel-1',        label: 'A-Levels Year 1' },
  { value: 'alevel-2',        label: 'A-Levels Year 2' },
  { value: 'undergraduate-1', label: 'Undergraduate Year 1' },
  { value: 'undergraduate-2', label: 'Undergraduate Year 2' },
  { value: 'undergraduate-3', label: 'Undergraduate Year 3' },
  { value: 'undergraduate-4', label: 'Undergraduate Year 4' },
  { value: 'graduate',        label: 'Graduate' },
  { value: 'postgraduate',    label: 'Postgraduate' },
]

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 14px', borderBottom: '1px solid var(--border-2)' }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.08em', flexShrink: 0 }}>
        {label}
      </span>
      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12, color: 'var(--ink)', letterSpacing: '0.02em', textAlign: 'right', marginLeft: 16 }}>
        {value}
      </span>
    </div>
  )
}

export default function ProfilePage() {
  const [profile, setProfile]             = useState<ProfileData | null>(null)
  const [stats, setStats]                 = useState<Stats>({ totalMoods: 0, totalJournals: 0, totalStressLogs: 0, totalPomodoros: 0, memberSince: '' })
  const [loading, setLoading]             = useState(true)
  const [showBirthdayModal, setBirthday]  = useState(false)
  const [showEducationModal, setEducation] = useState(false)
  const [selectedEducation, setSelEdu]    = useState('')
  const [profilePicture, setPicture]      = useState<string | null>(null)
  const [showSuccess, setSuccess]         = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { fetchProfile(); fetchStats(); loadPicture() }, [])

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) { setProfile(data); setSelEdu(data.education_level) }
    }
    setLoading(false)
  }

  const fetchStats = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { count: moodsCount }  = await supabase.from('moods').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
    const { count: stressCount } = await supabase.from('academic_stress').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
    const journals  = localStorage.getItem('journal_entries')
    const pomodoros = localStorage.getItem('pomodoro_total') || '0'
    const { data: pd } = await supabase.from('profiles').select('created_at').eq('id', user.id).single()
    setStats({
      totalMoods:      moodsCount || 0,
      totalJournals:   journals ? JSON.parse(journals).length : 0,
      totalStressLogs: stressCount || 0,
      totalPomodoros:  parseInt(pomodoros),
      memberSince:     pd?.created_at || '',
    })
  }

  const loadPicture = () => {
    const saved = localStorage.getItem('profile_picture')
    if (saved) setPicture(saved)
  }

  const handlePictureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const url = ev.target?.result as string
      setPicture(url)
      localStorage.setItem('profile_picture', url)
      flash()
    }
    reader.readAsDataURL(file)
  }

  const handleBirthday = async () => {
    if (!profile) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const newAge = profile.age + 1
    const { error } = await supabase.from('profiles').update({ age: newAge }).eq('id', user.id)
    if (!error) { setProfile({ ...profile, age: newAge }); setBirthday(false); flash() }
  }

  const handleEducationUpdate = async () => {
    if (!profile || !selectedEducation) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase.from('profiles').update({ education_level: selectedEducation }).eq('id', user.id)
    if (!error) { setProfile({ ...profile, education_level: selectedEducation }); setEducation(false); flash() }
  }

  const flash = () => { setSuccess(true); setTimeout(() => setSuccess(false), 2500) }

  const fmt = (v: string | undefined) => {
    if (!v) return 'NOT SET'
    return v.replace(/-/g, ' ').toUpperCase()
  }

  const getEduLabel = (v: string) => {
    const found = EDUCATION_LEVELS.find(l => l.value === v)
    return found ? found.label.toUpperCase() : fmt(v)
  }

  if (loading || !profile) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', justifyContent: 'center' }}>
        {[120, 80, 48].map((w, i) => <div key={i} className="skeleton" style={{ width: w, height: 14 }} />)}
      </div>
    )
  }

  const initials = profile.name
    ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  const memberSince = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }).toUpperCase()
    : 'RECENTLY'

  return (
    <div style={{ maxWidth: 680 }}>

      {/* Success strip */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{
              position: 'fixed', top: 20, right: 20, zIndex: 60,
              background: 'var(--bg-invert)', color: 'var(--ink-invert)',
              fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em',
              padding: '10px 16px',
            }}
          >
            SAVED.
          </motion.div>
        )}
      </AnimatePresence>

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePictureUpload} style={{ display: 'none' }} />

      {/* Header */}
      <div style={{ marginBottom: 8 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(36px,5vw,56px)', color: 'var(--ink)', letterSpacing: '-0.03em', lineHeight: 1 }}>
          PROFILE.
        </h1>
        <div style={{ borderTop: '1.5px solid var(--border)', marginTop: 8 }} />
      </div>

      {/* Identity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '24px 0', borderBottom: '1.5px solid var(--border)', marginBottom: 28 }}>
        <div
          onClick={() => fileInputRef.current?.click()}
          title="Click to change photo"
          style={{
            width: 72, height: 72, flexShrink: 0,
            background: 'var(--bg-invert)', color: 'var(--ink-invert)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22,
            overflow: 'hidden', cursor: 'pointer',
          }}
        >
          {profilePicture
            ? <img src={profilePicture} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : initials
          }
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(18px,3vw,24px)', color: 'var(--ink)', letterSpacing: '-0.01em', marginBottom: 3 }}>
            {profile.name.toUpperCase()}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.06em', marginBottom: 2 }}>
            {profile.email}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.1em' }}>
            MEMBER SINCE {memberSince}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Personal info */}
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.14em', marginBottom: 6 }}>
            PERSONAL INFO
          </div>
          <div style={{ border: '1.5px solid var(--border)' }}>
            <InfoRow label="NAME"       value={profile.name.toUpperCase()} />
            <InfoRow label="AGE"        value={profile.age ? `${profile.age} YEARS` : 'NOT SET'} />
            <InfoRow label="GENDER"     value={fmt(profile.gender)} />
            <InfoRow label="LOCATION"   value={fmt(profile.location)} />
            <InfoRow label="RELIGION"   value={fmt(profile.religion)} />
            <InfoRow label="FAMILY"     value={fmt(profile.family_status)} />
            <div style={{ padding: '11px 14px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.08em', marginBottom: 4 }}>
                EDUCATION
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12, color: 'var(--ink)', letterSpacing: '0.02em' }}>
                {getEduLabel(profile.education_level)}
              </div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Activity */}
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.14em', marginBottom: 6 }}>
              ACTIVITY
            </div>
            <div style={{ border: '1.5px solid var(--border)' }}>
              {[
                { label: 'MOODS LOGGED',    value: stats.totalMoods },
                { label: 'JOURNAL ENTRIES', value: stats.totalJournals },
                { label: 'STRESS LOGS',     value: stats.totalStressLogs },
                { label: 'POMODOROS',       value: stats.totalPomodoros },
              ].map((s, i) => (
                <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 14px', borderBottom: i < 3 ? '1px solid var(--border-2)' : 'none' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.06em' }}>
                    {s.label}
                  </span>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: 'var(--ink)', lineHeight: 1 }}>
                    {s.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Updates */}
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.14em', marginBottom: 6 }}>
              UPDATES
            </div>
            <div style={{ border: '1.5px solid var(--border)' }}>
              {[
                { label: "IT'S MY BIRTHDAY", action: () => setBirthday(true) },
                { label: 'UPDATE CLASS / GRADE', action: () => setEducation(true) },
              ].map((btn, i) => (
                <button
                  key={btn.label}
                  onClick={btn.action}
                  style={{
                    display: 'block', width: '100%', padding: '12px 14px', textAlign: 'left',
                    background: 'var(--bg)', border: 'none',
                    borderBottom: i === 0 ? '1px solid var(--border-2)' : 'none',
                    fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11,
                    color: 'var(--ink)', letterSpacing: '0.04em', cursor: 'pointer',
                    transition: 'background 80ms',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-card)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg)' }}
                >
                  {btn.label} →
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Privacy notice */}
      <div style={{ border: '1.5px solid var(--border)', padding: '14px 16px', marginTop: 20 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.12em', marginBottom: 8 }}>
          YOUR PRIVACY
        </div>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.65 }}>
          Your personal information is kept confidential and used only for research purposes.
          Most details were set during onboarding. You can update your age and education level as needed.
        </p>
      </div>

      {/* Birthday modal */}
      <AnimatePresence>
        {showBirthdayModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(12,12,12,0.6)' }}
            onClick={() => setBirthday(false)}
          >
            <motion.div
              initial={{ scale: 0.97, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.97, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{ width: '100%', maxWidth: 400, background: 'var(--bg)', border: '1.5px solid var(--border)', padding: 28 }}
            >
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, color: 'var(--ink)', marginBottom: 8, letterSpacing: '-0.01em' }}>
                HAPPY BIRTHDAY!
              </h2>
              <div style={{ borderTop: '1.5px solid var(--border)', marginBottom: 16 }} />
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.6, marginBottom: 24 }}>
                Congratulations on turning {profile.age + 1}. This will update your age in the system.
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={handleBirthday} className="br-btn br-btn-inv" style={{ flex: 1, padding: '12px', cursor: 'pointer' }}>
                  UPDATE AGE →
                </button>
                <button onClick={() => setBirthday(false)} className="br-btn" style={{ padding: '12px 16px', cursor: 'pointer' }}>
                  CANCEL
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Education modal */}
      <AnimatePresence>
        {showEducationModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(12,12,12,0.6)' }}
            onClick={() => setEducation(false)}
          >
            <motion.div
              initial={{ scale: 0.97, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.97, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{ width: '100%', maxWidth: 400, background: 'var(--bg)', border: '1.5px solid var(--border)', padding: 28, maxHeight: '80vh', overflowY: 'auto' }}
            >
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, color: 'var(--ink)', marginBottom: 8, letterSpacing: '-0.01em' }}>
                UPDATE GRADE
              </h2>
              <div style={{ borderTop: '1.5px solid var(--border)', marginBottom: 16 }} />
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.08em', marginBottom: 14 }}>
                CURRENT: {getEduLabel(profile.education_level)}
              </div>
              <select
                value={selectedEducation}
                onChange={e => setSelEdu(e.target.value)}
                style={{
                  width: '100%', padding: '11px 12px', marginBottom: 20, boxSizing: 'border-box',
                  fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12,
                  color: 'var(--ink)', background: 'var(--bg)',
                  border: '1.5px solid var(--border)', outline: 'none', cursor: 'pointer',
                }}
              >
                {EDUCATION_LEVELS.map(level => (
                  <option key={level.value} value={level.value}>{level.label}</option>
                ))}
              </select>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={handleEducationUpdate} className="br-btn br-btn-inv" style={{ flex: 1, padding: '12px', cursor: 'pointer' }}>
                  UPDATE →
                </button>
                <button onClick={() => setEducation(false)} className="br-btn" style={{ padding: '12px 16px', cursor: 'pointer' }}>
                  CANCEL
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
