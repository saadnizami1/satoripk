'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { AnimatePresence, motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

function SettingsRow({
  label, desc, onClick, danger = false, rightEl,
}: {
  label: string; desc?: string; onClick?: () => void; danger?: boolean; rightEl?: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        width: '100%', padding: '14px 16px', textAlign: 'left',
        background: 'var(--bg)', border: 'none', borderBottom: '1px solid var(--border-2)',
        cursor: 'pointer', transition: 'background 80ms',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-card)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = danger ? 'var(--accent-bg)' : 'var(--bg)' }}
    >
      <div style={{ flex: 1, textAlign: 'left' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: danger ? 'var(--accent)' : 'var(--ink)', letterSpacing: '0.04em', marginBottom: desc ? 2 : 0 }}>
          {label}
        </div>
        {desc && (
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--ink-3)' }}>{desc}</div>
        )}
      </div>
      {rightEl ?? (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: danger ? 'var(--accent)' : 'var(--ink-3)', flexShrink: 0 }}>→</span>
      )}
    </button>
  )
}

function AngularToggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      onClick={e => { e.stopPropagation(); onChange() }}
      style={{
        position: 'relative', width: 40, height: 20, flexShrink: 0,
        background: on ? 'var(--bg-invert)' : 'var(--bg)', border: '1.5px solid var(--border)',
        cursor: 'pointer', transition: 'background 80ms',
      }}
    >
      <motion.div
        animate={{ x: on ? 18 : 2 }}
        transition={{ duration: 0.08 }}
        style={{
          position: 'absolute', top: 2, width: 12, height: 12,
          background: on ? 'var(--ink-invert)' : 'var(--ink)',
        }}
      />
    </button>
  )
}

function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(12,12,12,0.6)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.97, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.97, opacity: 0 }}
            onClick={e => e.stopPropagation()}
            style={{ width: '100%', maxWidth: 440, background: 'var(--bg)', border: '1.5px solid var(--border)', padding: 28 }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function SettingsPage() {
  const router = useRouter()
  const [toast, setToast]                   = useState('')
  const [showDeleteModal, setShowDelete]     = useState(false)
  const [showResetModal, setShowReset]       = useState(false)
  const [showPasswordModal, setShowPassword] = useState(false)
  const [resetType, setResetType]            = useState<'all' | 'journals' | 'pomodoros'>('all')
  const [email, setEmail]                    = useState('')
  const [currentPw, setCurrentPw]           = useState('')
  const [newPw, setNewPw]                   = useState('')
  const [confirmPw, setConfirmPw]           = useState('')
  const [anonData, setAnonData]             = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setEmail(session.user.email || '')
    })
  }, [])

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  async function handlePasswordChange() {
    if (!currentPw || !newPw || !confirmPw) return alert('Fill in all fields')
    if (newPw !== confirmPw) return alert('Passwords do not match')
    if (newPw.length < 6) return alert('Password must be at least 6 characters')
    const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password: currentPw })
    if (signInErr) return alert('Current password is incorrect')
    const { error } = await supabase.auth.updateUser({ password: newPw })
    if (error) return alert('Failed to update: ' + error.message)
    setShowPassword(false); setCurrentPw(''); setNewPw(''); setConfirmPw('')
    showToast('PASSWORD UPDATED')
  }

  async function handleDeleteAccount() {
    const { error } = await supabase.rpc('delete_user')
    if (error) return alert('Failed to delete account: ' + error.message)
    localStorage.clear(); sessionStorage.clear()
    window.location.href = '/'
  }

  function handleReset() {
    if (resetType === 'all') {
      const tok = localStorage.getItem('supabase.auth.token')
      localStorage.clear()
      if (tok) localStorage.setItem('supabase.auth.token', tok)
    } else if (resetType === 'journals') {
      localStorage.removeItem('journal_entries')
    } else {
      localStorage.removeItem('pomodoro_total')
    }
    setShowReset(false)
    showToast('DATA CLEARED')
  }

  async function handleExport() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const [{ data: profile }, { data: moods }, { data: stress }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', session.user.id).single(),
      supabase.from('moods').select('*').eq('user_id', session.user.id),
      supabase.from('academic_stress').select('*').eq('user_id', session.user.id),
    ])
    const blob = new Blob([JSON.stringify({ exported_at: new Date().toISOString(), profile, moods, academic_stress: stress, journals: JSON.parse(localStorage.getItem('journal_entries') || '[]') }, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `satori-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    showToast('DATA EXPORTED')
  }

  function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.12em', marginBottom: 6 }}>
          {title}
        </div>
        <div style={{ border: '1.5px solid var(--border)' }}>{children}</div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 560 }}>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{
              position: 'fixed', top: 20, right: 20, zIndex: 60,
              background: 'var(--bg-invert)', color: 'var(--ink-invert)',
              fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.08em',
              padding: '10px 16px', border: '1.5px solid var(--border)',
            }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(36px, 5vw, 56px)', color: 'var(--ink)', letterSpacing: '-0.03em', lineHeight: 1 }}>
          SETTINGS
        </h1>
        <div style={{ borderTop: '1.5px solid var(--border)', marginTop: 12 }} />
      </div>

      {/* Account */}
      <Section title="ACCOUNT">
        <SettingsRow label="CHANGE PASSWORD" desc="Update your account password" onClick={() => setShowPassword(true)} />
        <SettingsRow
          label="DELETE ACCOUNT"
          desc="Permanently delete account and all data"
          onClick={() => setShowDelete(true)}
          danger
        />
      </Section>

      {/* Privacy */}
      <Section title="PRIVACY & DATA">
        <SettingsRow
          label="ANONYMOUS DATA SHARING"
          desc="Share anonymised insights to improve the platform"
          onClick={() => { setAnonData(a => !a); showToast('PRIVACY SETTINGS UPDATED') }}
          rightEl={<AngularToggle on={anonData} onChange={() => { setAnonData(a => !a); showToast('PRIVACY SETTINGS UPDATED') }} />}
        />
        <div style={{ padding: '12px 16px', background: 'var(--bg-card)', borderTop: '1px solid var(--border-2)' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--ink-3)', lineHeight: 1.6 }}>
            Your data contributes to mental health research in Pakistan. All data is anonymised and used ethically.
          </p>
        </div>
      </Section>

      {/* Data management */}
      <Section title="DATA MANAGEMENT">
        <SettingsRow label="EXPORT MY DATA" desc="Download all your data as JSON" onClick={handleExport} />
        <SettingsRow label="CLEAR ALL LOCAL DATA" desc="Remove locally stored data" onClick={() => { setResetType('all'); setShowReset(true) }} danger />
        <SettingsRow label="CLEAR JOURNALS" desc="Remove journal entries" onClick={() => { setResetType('journals'); setShowReset(true) }} />
      </Section>

      {/* Appearance */}
      <Section title="APPEARANCE">
        <div style={{ display: 'flex', padding: 0 }}>
          {['LIGHT', 'DARK', 'SYSTEM'].map((m, i) => (
            <button
              key={m}
              style={{
                flex: 1, padding: '14px 0', textAlign: 'center',
                background: m === 'LIGHT' ? 'var(--bg-invert)' : 'var(--bg)',
                color: m === 'LIGHT' ? 'var(--ink-invert)' : 'var(--ink-2)',
                border: 'none', borderRight: i < 2 ? '1.5px solid var(--border)' : 'none',
                fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12,
                letterSpacing: '0.06em', cursor: 'pointer',
                transition: 'background 80ms, color 80ms',
              }}
            >
              {m}
            </button>
          ))}
        </div>
      </Section>

      {/* App info */}
      <Section title="APP INFO">
        {[{ label: 'VERSION', value: '2.0.0' }, { label: 'DEVELOPER', value: 'SAAD NIZAMI' }].map(r => (
          <div
            key={r.label}
            style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--border-2)' }}
          >
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)' }}>{r.label}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink)' }}>{r.value}</span>
          </div>
        ))}
        <button
          onClick={() => router.push('/dashboard/creator')}
          style={{
            display: 'block', width: '100%', padding: '14px 16px', textAlign: 'left',
            background: 'var(--bg)', border: 'none',
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12,
            color: 'var(--ink)', letterSpacing: '0.04em', cursor: 'pointer',
          }}
        >
          ABOUT THE RESEARCH →
        </button>
      </Section>

      {/* Password Modal */}
      <Modal open={showPasswordModal} onClose={() => setShowPassword(false)}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, color: 'var(--ink)', marginBottom: 20, letterSpacing: '-0.01em' }}>CHANGE PASSWORD</h2>
        <div style={{ borderTop: '1.5px solid var(--border)', marginBottom: 20 }} />
        <div style={{ marginBottom: 14, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)', padding: '8px 12px', background: 'var(--bg-card)', border: '1.5px solid var(--border)' }}>
          {email}
        </div>
        {[
          { label: 'CURRENT PASSWORD', val: currentPw, set: setCurrentPw },
          { label: 'NEW PASSWORD',     val: newPw,     set: setNewPw },
          { label: 'CONFIRM NEW',      val: confirmPw, set: setConfirmPw },
        ].map(f => (
          <div key={f.label} style={{ marginBottom: 12 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.1em', marginBottom: 6 }}>{f.label}</div>
            <input
              type="password" value={f.val} onChange={e => f.set(e.target.value)}
              className="br-input"
              style={{ width: '100%', padding: '10px 12px', fontFamily: 'var(--font-body)', fontSize: 14, boxSizing: 'border-box' }}
            />
          </div>
        ))}
        <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
          <button onClick={handlePasswordChange} className="br-btn br-btn-inv" style={{ flex: 1, padding: '12px' }}>UPDATE PASSWORD</button>
          <button onClick={() => setShowPassword(false)} className="br-btn" style={{ padding: '12px 16px' }}>CANCEL</button>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal open={showDeleteModal} onClose={() => setShowDelete(false)}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, color: 'var(--accent)', marginBottom: 16, letterSpacing: '-0.01em' }}>DELETE ACCOUNT?</h2>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink)', marginBottom: 8, fontWeight: 600 }}>This action is permanent and cannot be undone.</p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink-2)', marginBottom: 20 }}>
          Everything — profile, moods, stress logs, chat sessions — will be deleted from the database.
        </p>
        <div style={{ padding: '10px 14px', background: 'var(--accent-bg)', border: '1.5px solid var(--accent)', marginBottom: 20 }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent)', letterSpacing: '0.04em' }}>YOU WILL BE IMMEDIATELY LOGGED OUT AND CANNOT RECOVER THIS ACCOUNT.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleDeleteAccount} style={{ flex: 1, padding: '12px', background: 'var(--accent)', color: 'var(--ink-invert)', border: '1.5px solid var(--accent)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12, letterSpacing: '0.06em', cursor: 'pointer' }}>
            YES, DELETE EVERYTHING
          </button>
          <button onClick={() => setShowDelete(false)} className="br-btn" style={{ padding: '12px 16px' }}>CANCEL</button>
        </div>
      </Modal>

      {/* Reset Modal */}
      <Modal open={showResetModal} onClose={() => setShowReset(false)}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, color: 'var(--ink)', marginBottom: 16, letterSpacing: '-0.01em' }}>CLEAR DATA?</h2>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink-2)', marginBottom: 20 }}>
          {resetType === 'all'
            ? 'This will clear all locally stored data including journal entries and pomodoro stats.'
            : `This will clear your ${resetType} data from local storage.`}
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleReset} className="br-btn br-btn-inv" style={{ flex: 1, padding: '12px' }}>YES, CLEAR DATA</button>
          <button onClick={() => setShowReset(false)} className="br-btn" style={{ padding: '12px 16px' }}>CANCEL</button>
        </div>
      </Modal>
    </div>
  )
}
