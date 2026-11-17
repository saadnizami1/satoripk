'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { Camera } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { avatarUrl, migrateLegacyAvatar, uploadAvatar } from '@/lib/avatar'
import type { Database } from '@/lib/database.types'
import { BOARDS, CITIES, RELIGIONS } from '@/lib/profile-options'
import { PageHeader } from '@/components/app/PageHeader'
import { Pill, Skeleton, TornPaper } from '@/components/ui/kit'

type ProfileData = Database['public']['Tables']['profiles']['Row'] & { email: string }

interface Stats { totalMoods: number; totalJournals: number; totalStressLogs: number; totalPomodoros: number }

interface EditData {
  name: string; age: string; gender: string; location: string; religion: string
  family_status: string; education_board: string; education_level: string
}

const GENDERS = ['Male', 'Female', 'Non-binary', 'Other', 'Prefer not to say']
const FAMILY_STATUSES = ['Living with Parents', 'Independent', 'Married', 'Other']

function Select({ id, label, value, onChange, options, placeholder = 'Choose one' }: {
  id: string; label: string; value: string; onChange: (v: string) => void
  options: { value: string; label: string }[]; placeholder?: string
}) {
  return (
    <div className="field">
      <label htmlFor={id} className="field__label">{label}</label>
      <select id={id} className="input" value={value} onChange={e => onChange(e.target.value)}>
        <option value="">{placeholder}</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

const asOptions = (xs: string[]) => xs.map(x => ({ value: x, label: x }))

export default function ProfilePage() {
  const [profile, setProfile]     = useState<ProfileData | null>(null)
  const [stats, setStats]         = useState<Stats>({ totalMoods: 0, totalJournals: 0, totalStressLogs: 0, totalPomodoros: 0 })
  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState(false)
  const [editMode, setEditMode]   = useState(false)
  const [editData, setEditData]   = useState<EditData>({ name: '', age: '', gender: '', location: '', religion: '', family_status: '', education_board: '', education_level: '' })
  const [profilePicture, setPicture] = useState<string | null>(null)
  const [notice, setNotice]       = useState('')
  const [saveError, setSaveError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { load() }, [])

  const fetchProfile = async (userId: string) => {
    const [{ data }, { data: { session } }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.auth.getSession(),
    ])
    // Email lives on the auth user, not the profile row.
    if (data) setProfile({ ...data, email: session?.user.email ?? '' })
    return data
  }

  const load = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setLoading(false); return }
    const userId = session.user.id
    const head = { count: 'exact' as const, head: true }
    const [prof, { count: moodsCount }, { count: stressCount }, { count: journalCount }] = await Promise.all([
      fetchProfile(userId),
      supabase.from('moods').select('id', head).eq('user_id', userId),
      supabase.from('academic_stress').select('id', head).eq('user_id', userId),
      supabase.from('journal_entries').select('id', head).eq('user_id', userId),
    ])
    let pomodoros = 0
    try { pomodoros = parseInt(localStorage.getItem('pomodoro_total') || '0') || 0 } catch { /* storage blocked */ }
    setStats({ totalMoods: moodsCount || 0, totalJournals: journalCount || 0, totalStressLogs: stressCount || 0, totalPomodoros: pomodoros })
    setLoading(false)

    const path = prof?.avatar_path ?? await migrateLegacyAvatar(userId)
    if (path) setPicture(await avatarUrl(path))
  }

  const handlePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !file.type.startsWith('image/')) return
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const preview = URL.createObjectURL(file)
    setPicture(preview)
    try {
      const path = await uploadAvatar(session.user.id, file)
      setPicture(await avatarUrl(path))
    } catch (err) {
      console.error('Avatar upload failed:', err)
      setSaveError("Your picture didn't upload. Try a smaller image, or try again in a moment.")
      setPicture(null)
    } finally {
      URL.revokeObjectURL(preview)
    }
  }

  const enterEditMode = () => {
    if (!profile) return
    setEditData({
      name:            profile.name || '',
      age:             profile.age ? String(profile.age) : '',
      gender:          profile.gender || '',
      location:        profile.location || profile.city || '',
      religion:        profile.religion || '',
      family_status:   profile.family_status || '',
      education_board: profile.education_board || '',
      education_level: profile.education_level || '',
    })
    setSaveError('')
    setEditMode(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile || !editData.name.trim()) { setSaveError('Add a name so Satori knows what to call you.'); return }
    const ageNum = parseInt(editData.age)
    if (editData.age && (isNaN(ageNum) || ageNum < 3 || ageNum > 99)) { setSaveError('Age needs to be a number between 3 and 99.'); return }
    setSaving(true)
    setSaveError('')
    const { data: { session } } = await supabase.auth.getSession()
    const user = session?.user
    if (!user) { setSaving(false); return }
    const { error } = await supabase.from('profiles').update({
      name:            editData.name.trim(),
      age:             editData.age ? ageNum : null,
      gender:          editData.gender || null,
      location:        editData.location || null,
      city:            editData.location || null,
      religion:        editData.religion || null,
      family_status:   editData.family_status || null,
      education_board: editData.education_board || null,
      education_level: editData.education_level || null,
    }).eq('id', user.id)
    if (error) {
      setSaveError("Your changes didn't save. Check your connection and try again.")
    } else {
      await fetchProfile(user.id)
      setEditMode(false)
      setNotice('Profile saved.')
      setTimeout(() => setNotice(''), 4000)
    }
    setSaving(false)
  }

  const set = (key: keyof EditData) => (v: string) => setEditData(prev => ({ ...prev, [key]: v }))

  if (loading || !profile) return <div><PageHeader lines={['you']} art="dusk" /><Skeleton /></div>

  const initials = profile.name ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?'
  const memberSince = profile.created_at ? new Date(profile.created_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) : ''
  const board = BOARDS.find(b => b.id === (editMode ? editData.education_board : profile.education_board))
  const studying = [BOARDS.find(b => b.id === profile.education_board)?.name, profile.education_level].filter(Boolean).join(', ')

  const details: [string, string | null | undefined][] = [
    ['Age', profile.age ? `${profile.age}` : null],
    ['Studying', studying],
    ['City', profile.location || profile.city],
    ['Gender', profile.gender],
    ['Religion', profile.religion],
    ['Living situation', profile.family_status],
  ]

  return (
    <div>
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePictureUpload} className="sr-only" tabIndex={-1} aria-hidden="true" />

      <PageHeader lines={['you']} accent="you" art="dusk" sticker="bag" />

      <div aria-live="polite">
        {notice && <div className="notice notice--ok" style={{ marginBottom: 16 }}>{notice}</div>}
        {saveError && <div className="notice notice--error" role="alert" style={{ marginBottom: 16 }}>{saveError}</div>}
      </div>

      <div className="pf-grid">
        <section aria-labelledby="pf-me" className="sheet sheet--pad stack-lg">
          <div className="row" style={{ gap: 18, flexWrap: 'nowrap' }}>
            <button type="button" className="pf-avatar" onClick={() => fileInputRef.current?.click()} aria-label="Change profile picture">
              {profilePicture ? <img src={profilePicture} alt="" /> : <span>{initials}</span>}
              <span className="pf-avatar__cam" aria-hidden="true"><Camera size={14} /></span>
            </button>
            <div style={{ minWidth: 0 }}>
              <h2 id="pf-me" className="t-h3" style={{ overflowWrap: 'anywhere' }}>{profile.name || 'No name yet'}</h2>
              <p className="t-small muted" style={{ overflowWrap: 'anywhere' }}>{profile.email}</p>
              {memberSince && <p className="t-small faint">Here since {memberSince}</p>}
            </div>
          </div>

          {editMode ? (
            <form className="stack" onSubmit={handleSave}>
              <div className="field">
                <label htmlFor="pf-name" className="field__label">Name</label>
                <input id="pf-name" className="input" value={editData.name} onChange={e => set('name')(e.target.value)} maxLength={80} required />
              </div>
              <div className="pf-two">
                <div className="field">
                  <label htmlFor="pf-age" className="field__label">Age</label>
                  <input id="pf-age" className="input" type="number" inputMode="numeric" min={3} max={99} value={editData.age} onChange={e => set('age')(e.target.value)} />
                </div>
                <Select id="pf-gender" label="Gender" value={editData.gender} onChange={set('gender')} options={asOptions(GENDERS)} />
              </div>
              <div className="pf-two">
                <Select id="pf-board" label="Stage" value={editData.education_board}
                  onChange={v => setEditData(p => ({ ...p, education_board: v, education_level: '' }))}
                  options={BOARDS.map(b => ({ value: b.id, label: b.name }))} />
                <Select id="pf-level" label="Year" value={editData.education_level} onChange={set('education_level')}
                  options={asOptions(board?.levels ?? [])} placeholder={board ? 'Choose one' : 'Pick a stage first'} />
              </div>
              <div className="pf-two">
                <Select id="pf-city" label="City" value={editData.location} onChange={set('location')} options={asOptions(CITIES)} />
                <Select id="pf-religion" label="Religion" value={editData.religion} onChange={set('religion')} options={asOptions(RELIGIONS)} />
              </div>
              <Select id="pf-family" label="Living situation" value={editData.family_status} onChange={set('family_status')} options={asOptions(FAMILY_STATUSES)} />
              <div className="row">
                <Pill type="submit" variant="tape" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</Pill>
                <button type="button" className="text-btn" onClick={() => { setEditMode(false); setSaveError('') }}>Cancel</button>
              </div>
            </form>
          ) : (
            <>
              <dl className="pf-dl">
                {details.map(([k, v]) => (
                  <div key={k}><dt>{k}</dt><dd className={v ? '' : 'faint'}>{v || 'Not added'}</dd></div>
                ))}
              </dl>
              <div><Pill variant="tape" onClick={enterEditMode}>Edit profile</Pill></div>
            </>
          )}
        </section>

        <aside className="stack">
          <ul className="pf-stats" aria-label="Your activity">
            {[
              { n: stats.totalMoods, l: 'mood check-ins', c: 'var(--marigold)' },
              { n: stats.totalJournals, l: 'journal entries', c: 'var(--mint)' },
              { n: stats.totalStressLogs, l: 'stress check-ins', c: 'var(--paper)' },
              { n: stats.totalPomodoros, l: 'focus blocks on this device', c: 'var(--sky-2)' },
            ].map((s, i) => (
              <li key={s.l}><TornPaper color={s.c} tilt={[-1.4, 1.1, 0.8, -1][i]} seed={i * 4 + 2}><p className="t-num">{s.n}</p><p className="t-small" style={{ marginTop: 4 }}>{s.l}</p></TornPaper></li>
            ))}
          </ul>
          <section className="sheet sheet--pad stack-sm" aria-labelledby="pf-priv">
            <h2 id="pf-priv" className="section-title" style={{ margin: 0 }}>Who sees this</h2>
            <p className="t-body muted">
              {profile.research_consent
                ? 'You said yes to research, so these answers and your check-ins are shared with the Lahore Garrison University study team. Nobody else sees them.'
                : "You haven't joined the research study, so this stays between you and Satori."}
            </p>
            <Link href="/dashboard/settings" className="link t-small">Change this in Settings</Link>
          </section>
        </aside>
      </div>

      <style>{`
        .pf-grid { display: grid; grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr); gap: 20px; align-items: start; }
        .pf-avatar { position: relative; flex-shrink: 0; width: 84px; height: 84px; border-radius: 50%; border: 0; padding: 0; cursor: pointer; background: var(--marigold); color: var(--ink); font: 400 30px/1 var(--font-display); display: grid; place-items: center; }
        .pf-avatar img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
        .pf-avatar__cam { position: absolute; right: -2px; bottom: -2px; width: 30px; height: 30px; border-radius: 50%; background: var(--tape); color: var(--paper); display: grid; place-items: center; box-shadow: 0 0 0 3px var(--paper); }
        .pf-dl { margin: 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px 24px; }
        .pf-dl dt { font-size: 14px; color: var(--ink-3); }
        .pf-dl dd { margin: 2px 0 0; font-weight: 600; overflow-wrap: anywhere; }
        .pf-two { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .pf-stats { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        @media (max-width: 900px) { .pf-grid { grid-template-columns: 1fr; } }
        @media (max-width: 520px) { .pf-two, .pf-dl { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  )
}
