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
}

interface EditData {
  name: string
  age: string
  gender: string
  location: string
  religion: string
  family_status: string
  education_level: string
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

const GENDERS = ['Male', 'Female', 'Non-binary', 'Other', 'Prefer not to say']

const FAMILY_STATUSES = ['Living with Parents', 'Independent', 'Married', 'Other']

const RELIGIONS = ['Islam', 'Christianity', 'Hinduism', 'Buddhism', 'Sikhism', 'Atheism', 'Other', 'Prefer not to say']

const CITIES = [
  'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad',
  'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala',
  'Hyderabad', 'Abbottabad', 'Bahawalpur', 'Sargodha', 'Sukkur',
  'Larkana', 'Sheikhupura', 'Rahim Yar Khan', 'Jhang', 'Dera Ghazi Khan',
  'Gujrat', 'Sahiwal', 'Wah Cantonment', 'Mardan', 'Kasur', 'Other',
]

const SELECT_STYLE: React.CSSProperties = {
  width: '100%', padding: '7px 8px', boxSizing: 'border-box',
  fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12,
  color: 'var(--ink)', background: 'var(--bg-card)',
  border: '1px solid var(--border-2)', outline: 'none', cursor: 'pointer',
  letterSpacing: '0.02em', appearance: 'auto',
}

const INPUT_STYLE: React.CSSProperties = {
  width: '100%', padding: '7px 8px', boxSizing: 'border-box',
  fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12,
  color: 'var(--ink)', background: 'var(--bg-card)',
  border: '1px solid var(--border-2)', outline: 'none',
  letterSpacing: '0.02em',
}

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

function EditRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border-2)' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.1em', marginBottom: 5 }}>
        {label}
      </div>
      {children}
    </div>
  )
}

export default function ProfilePage() {
  const [profile, setProfile]     = useState<ProfileData | null>(null)
  const [stats, setStats]         = useState<Stats>({ totalMoods: 0, totalJournals: 0, totalStressLogs: 0, totalPomodoros: 0 })
  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState(false)
  const [editMode, setEditMode]   = useState(false)
  const [editData, setEditData]   = useState<EditData>({ name: '', age: '', gender: '', location: '', religion: '', family_status: '', education_level: '' })
  const [profilePicture, setPicture] = useState<string | null>(null)
  const [showSuccess, setSuccess] = useState(false)
  const [saveError, setSaveError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { fetchProfile(); fetchStats(); loadPicture() }, [])

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) setProfile(data)
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
    setStats({
      totalMoods:      moodsCount || 0,
      totalJournals:   journals ? JSON.parse(journals).length : 0,
      totalStressLogs: stressCount || 0,
      totalPomodoros:  parseInt(pomodoros),
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
    }
    reader.readAsDataURL(file)
  }

  const enterEditMode = () => {
    if (!profile) return
    setEditData({
      name:            profile.name || '',
      age:             profile.age ? String(profile.age) : '',
      gender:          profile.gender || '',
      location:        profile.location || '',
      religion:        profile.religion || '',
      family_status:   profile.family_status || '',
      education_level: profile.education_level || '',
    })
    setSaveError('')
    setEditMode(true)
  }

  const cancelEdit = () => {
    setEditMode(false)
    setSaveError('')
  }

  const handleSave = async () => {
    if (!profile || !editData.name.trim()) { setSaveError('Name is required.'); return }
    const ageNum = parseInt(editData.age)
    if (editData.age && (isNaN(ageNum) || ageNum < 3 || ageNum > 99)) { setSaveError('Age must be between 3 and 99.'); return }
    setSaving(true)
    setSaveError('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }
    const { error } = await supabase.from('profiles').update({
      name:            editData.name.trim(),
      age:             editData.age ? ageNum : null,
      gender:          editData.gender || null,
      location:        editData.location || null,
      religion:        editData.religion || null,
      family_status:   editData.family_status || null,
      education_level: editData.education_level || null,
    }).eq('id', user.id)
    if (error) {
      setSaveError('Failed to save. Please try again.')
    } else {
      await fetchProfile()
      setEditMode(false)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2500)
    }
    setSaving(false)
  }

  const set = (key: keyof EditData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setEditData(prev => ({ ...prev, [key]: e.target.value }))

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
              position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 60,
              background: 'var(--bg-invert)', color: 'var(--ink-invert)',
              fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em',
              padding: '10px 20px', whiteSpace: 'nowrap',
            }}
          >
            PROFILE SAVED.
          </motion.div>
        )}
      </AnimatePresence>

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePictureUpload} style={{ display: 'none' }} />

      {/* Header */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(36px,5vw,56px)', color: 'var(--ink)', letterSpacing: '-0.03em', lineHeight: 1 }}>
            PROFILE.
          </h1>
          {!editMode ? (
            <button
              onClick={enterEditMode}
              className="br-btn"
              style={{ padding: '8px 16px', fontSize: 11, letterSpacing: '0.06em', cursor: 'pointer', marginBottom: 4 }}
            >
              EDIT →
            </button>
          ) : (
            <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
              <button
                onClick={handleSave}
                disabled={saving}
                className="br-btn br-btn-inv"
                style={{ padding: '8px 16px', fontSize: 11, letterSpacing: '0.06em', cursor: 'pointer', opacity: saving ? 0.6 : 1 }}
              >
                {saving ? 'SAVING...' : 'SAVE →'}
              </button>
              <button
                onClick={cancelEdit}
                className="br-btn"
                style={{ padding: '8px 14px', fontSize: 11, letterSpacing: '0.06em', cursor: 'pointer' }}
              >
                CANCEL
              </button>
            </div>
          )}
        </div>
        {saveError && (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--accent)', letterSpacing: '0.06em', marginTop: 6 }}>
            {saveError}
          </div>
        )}
        <div style={{ borderTop: '1.5px solid var(--border)', marginTop: 8 }} />
      </div>

      {/* Identity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '20px 0', borderBottom: '1.5px solid var(--border)', marginBottom: 24, flexWrap: 'wrap' }}>
        <div
          onClick={() => fileInputRef.current?.click()}
          title="Click to change photo"
          style={{
            width: 64, height: 64, flexShrink: 0,
            background: 'var(--bg-invert)', color: 'var(--ink-invert)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20,
            overflow: 'hidden', cursor: 'pointer',
          }}
        >
          {profilePicture
            ? <img src={profilePicture} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : initials
          }
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(16px,3vw,24px)', color: 'var(--ink)', letterSpacing: '-0.01em', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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

      <div className="grid-2col">

        {/* Personal info */}
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.14em', marginBottom: 6 }}>
            PERSONAL INFO
          </div>
          <div style={{ border: '1.5px solid var(--border)' }}>
            {editMode ? (
              <>
                <EditRow label="NAME">
                  <input type="text" value={editData.name} onChange={set('name')} style={INPUT_STYLE} />
                </EditRow>
                <EditRow label="AGE">
                  <input type="number" value={editData.age} onChange={set('age')} min="3" max="99" placeholder="—" style={INPUT_STYLE} />
                </EditRow>
                <EditRow label="GENDER">
                  <select value={editData.gender} onChange={set('gender')} style={SELECT_STYLE}>
                    <option value="">— Select —</option>
                    {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </EditRow>
                <EditRow label="LOCATION">
                  <select value={editData.location} onChange={set('location')} style={SELECT_STYLE}>
                    <option value="">— Select city —</option>
                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </EditRow>
                <EditRow label="RELIGION">
                  <select value={editData.religion} onChange={set('religion')} style={SELECT_STYLE}>
                    <option value="">— Select —</option>
                    {RELIGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </EditRow>
                <EditRow label="FAMILY STATUS">
                  <select value={editData.family_status} onChange={set('family_status')} style={SELECT_STYLE}>
                    <option value="">— Select —</option>
                    {FAMILY_STATUSES.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </EditRow>
                <EditRow label="EDUCATION">
                  <select value={editData.education_level} onChange={set('education_level')} style={SELECT_STYLE}>
                    <option value="">— Select —</option>
                    {EDUCATION_LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                  </select>
                </EditRow>
              </>
            ) : (
              <>
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
              </>
            )}
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

          {/* Privacy notice */}
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.14em', marginBottom: 6 }}>
              YOUR PRIVACY
            </div>
            <div style={{ border: '1.5px solid var(--border)', padding: '14px' }}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.65 }}>
                Your personal information is kept confidential and used only for research purposes. All data is anonymised before use.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
