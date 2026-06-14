'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Settings as SettingsIcon, User, Shield, Database, Info,
  Lock, Trash2, Download, RotateCcw, Eye, EyeOff,
  Check, AlertTriangle, FileText, Mail, X, ChevronRight
} from 'lucide-react'
import { useRouter } from 'next/navigation'

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-6"
      style={{ background: '#13161F', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <h2 className="text-base font-semibold mb-4" style={{ color: '#F1F5F9' }}>{title}</h2>
      <div className="space-y-2">{children}</div>
    </motion.div>
  )
}

function SettingsRow({
  icon: Icon, iconColor, label, desc, onClick, danger = false, rightEl
}: {
  icon: any; iconColor: string; label: string; desc?: string;
  onClick?: () => void; danger?: boolean; rightEl?: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3.5 rounded-xl text-left transition-all"
      style={{
        background: danger ? 'rgba(239,68,68,0.06)' : '#1C2030',
        border: danger ? '1px solid rgba(239,68,68,0.2)' : '1px solid transparent',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.85' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
    >
      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${iconColor}18` }}>
        <Icon className="w-4 h-4" style={{ color: iconColor }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium" style={{ color: danger ? '#EF4444' : '#F1F5F9' }}>{label}</p>
        {desc && <p className="text-xs mt-0.5" style={{ color: danger ? '#EF444480' : '#475569' }}>{desc}</p>}
      </div>
      {rightEl ?? <ChevronRight className="w-4 h-4 shrink-0" style={{ color: '#475569' }} />}
    </button>
  )
}

function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl p-6"
            style={{ background: '#13161F', border: '1px solid rgba(255,255,255,0.08)' }}
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
  const [showCurrent, setShowCurrent]        = useState(false)
  const [showNew, setShowNew]                = useState(false)
  const [anonData, setAnonData]             = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => { if (user) setEmail(user.email || '') })
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
    showToast('Password updated successfully')
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
      localStorage.removeItem('pomodoro_today')
      localStorage.removeItem('pomodoro_date')
    }
    setShowReset(false)
    showToast('Data cleared')
  }

  async function handleExport() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const [{ data: profile }, { data: moods }, { data: stress }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('moods').select('*').eq('user_id', user.id),
      supabase.from('academic_stress').select('*').eq('user_id', user.id),
    ])
    const blob = new Blob([JSON.stringify({
      exported_at: new Date().toISOString(), user_id: user.id,
      profile, moods: moods || [], academic_stress: stress || [],
      journals: JSON.parse(localStorage.getItem('journal_entries') || '[]'),
    }, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `satori-data-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    showToast('Data exported')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -40 }}
            className="fixed top-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3.5 rounded-2xl shadow-2xl"
            style={{ background: '#14B8A6', color: '#fff' }}
          >
            <Check className="w-4 h-4" />
            <span className="text-sm font-semibold">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(148,163,184,0.1)' }}>
            <SettingsIcon className="w-5 h-5" style={{ color: '#94A3B8' }} />
          </div>
          <div>
            <h1 className="text-2xl font-serif" style={{ color: '#F1F5F9', fontFamily: 'var(--font-instrument), Georgia, serif' }}>Settings</h1>
            <p className="text-xs" style={{ color: '#475569' }}>Manage your preferences and data</p>
          </div>
        </div>
      </motion.div>

      {/* Account */}
      <SettingsSection title="Account">
        <SettingsRow icon={Lock} iconColor="#2DD4BF" label="Change Password" desc="Update your account password" onClick={() => setShowPassword(true)} />
        <SettingsRow icon={Trash2} iconColor="#EF4444" label="Delete Account" desc="Permanently delete account and all data" onClick={() => setShowDelete(true)} danger />
      </SettingsSection>

      {/* Privacy */}
      <SettingsSection title="Privacy & Data">
        <SettingsRow
          icon={Shield} iconColor="#818CF8" label="Anonymous Data Sharing"
          desc="Share anonymised insights to improve the platform"
          onClick={() => { setAnonData(a => !a); showToast('Privacy settings updated') }}
          rightEl={
            <button
              onClick={e => { e.stopPropagation(); setAnonData(a => !a); showToast('Privacy settings updated') }}
              className="relative w-11 h-6 rounded-full transition-colors shrink-0"
              style={{ background: anonData ? '#14B8A6' : '#1C2030' }}
            >
              <motion.div
                animate={{ x: anonData ? 20 : 2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="absolute top-1 w-4 h-4 rounded-full bg-white shadow"
              />
            </button>
          }
        />
        <div className="flex items-start gap-3 p-3.5 rounded-xl" style={{ background: 'rgba(45,212,191,0.06)', border: '1px solid rgba(45,212,191,0.15)' }}>
          <Shield className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#2DD4BF' }} />
          <p className="text-xs leading-relaxed" style={{ color: '#94A3B8' }}>
            Your data contributes to mental health research in Pakistan. All data is anonymised and used ethically.
          </p>
        </div>
      </SettingsSection>

      {/* Data management */}
      <SettingsSection title="Data Management">
        <SettingsRow icon={Download} iconColor="#4ADE80" label="Export My Data" desc="Download all your data as JSON" onClick={handleExport} />
        <SettingsRow icon={RotateCcw} iconColor="#F97316" label="Clear All Local Data" desc="Remove locally stored data" onClick={() => { setResetType('all'); setShowReset(true) }} danger />
        <div className="grid grid-cols-2 gap-2 mt-1">
          {[{ type: 'journals' as const, label: 'Clear Journals', icon: FileText }, { type: 'pomodoros' as const, label: 'Clear Pomodoros', icon: RotateCcw }].map(item => (
            <button
              key={item.type}
              onClick={() => { setResetType(item.type); setShowReset(true) }}
              className="flex items-center gap-2 p-3 rounded-xl transition-all hover:opacity-80"
              style={{ background: '#1C2030', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <item.icon className="w-4 h-4" style={{ color: '#94A3B8' }} />
              <span className="text-xs font-medium" style={{ color: '#94A3B8' }}>{item.label}</span>
            </button>
          ))}
        </div>
      </SettingsSection>

      {/* App Info */}
      <SettingsSection title="App Info">
        {[{ label: 'Version', value: '1.1.7' }, { label: 'Developer', value: 'Saad Nizami' }].map(r => (
          <div key={r.label} className="flex items-center justify-between p-3 rounded-xl" style={{ background: '#1C2030' }}>
            <span className="text-xs" style={{ color: '#475569' }}>{r.label}</span>
            <span className="text-xs font-semibold" style={{ color: '#F1F5F9' }}>{r.value}</span>
          </div>
        ))}
        <button
          onClick={() => router.push('/dashboard/creator')}
          className="w-full p-3 rounded-xl text-sm font-medium transition-all hover:opacity-80"
          style={{ background: '#1C2030', color: '#2DD4BF' }}
        >
          About the Research
        </button>
      </SettingsSection>

      {/* ── Password Modal ── */}
      <Modal open={showPasswordModal} onClose={() => setShowPassword(false)}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(45,212,191,0.15)' }}>
            <Lock className="w-5 h-5" style={{ color: '#2DD4BF' }} />
          </div>
          <h2 className="text-xl font-semibold" style={{ color: '#F1F5F9', fontFamily: 'var(--font-instrument), Georgia, serif' }}>Change Password</h2>
        </div>
        <div className="space-y-3 mb-5">
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: '#1C2030' }}>
            <Mail className="w-4 h-4 shrink-0" style={{ color: '#475569' }} />
            <span className="text-sm" style={{ color: '#94A3B8' }}>{email}</span>
          </div>
          {[
            { label: 'Current Password', val: currentPw, set: setCurrentPw, show: showCurrent, toggle: () => setShowCurrent(v => !v) },
            { label: 'New Password',     val: newPw,     set: setNewPw,     show: showNew,     toggle: () => setShowNew(v => !v) },
          ].map(f => (
            <div key={f.label}>
              <label className="block text-xs font-medium mb-1" style={{ color: '#94A3B8' }}>{f.label}</label>
              <div className="relative">
                <input
                  type={f.show ? 'text' : 'password'} value={f.val}
                  onChange={e => f.set(e.target.value)}
                  className="w-full px-4 py-2.5 pr-11 rounded-xl text-sm focus:outline-none transition-all"
                  style={{ background: '#222638', border: '1px solid rgba(255,255,255,0.06)', color: '#F1F5F9' }}
                />
                <button onClick={f.toggle} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#475569' }}>
                  {f.show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#94A3B8' }}>Confirm New Password</label>
            <input
              type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none"
              style={{ background: '#222638', border: '1px solid rgba(255,255,255,0.06)', color: '#F1F5F9' }}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={handlePasswordChange} className="flex-1 py-3 rounded-xl text-sm font-semibold text-white" style={{ background: '#14B8A6' }}>
            Update Password
          </button>
          <button onClick={() => setShowPassword(false)} className="px-5 py-3 rounded-xl text-sm font-semibold" style={{ background: '#1C2030', color: '#94A3B8' }}>
            Cancel
          </button>
        </div>
      </Modal>

      {/* ── Delete Modal ── */}
      <Modal open={showDeleteModal} onClose={() => setShowDelete(false)}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.15)' }}>
            <AlertTriangle className="w-5 h-5" style={{ color: '#EF4444' }} />
          </div>
          <h2 className="text-xl font-semibold" style={{ color: '#EF4444', fontFamily: 'var(--font-instrument), Georgia, serif' }}>Delete Account?</h2>
        </div>
        <p className="text-sm mb-3 font-medium" style={{ color: '#F1F5F9' }}>This action is permanent and cannot be undone.</p>
        <p className="text-sm mb-4" style={{ color: '#94A3B8' }}>Everything — profile, moods, stress logs, chat sessions — will be deleted from the database.</p>
        <div className="p-3 rounded-xl mb-5" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <p className="text-xs" style={{ color: '#EF4444' }}>You will be immediately logged out and cannot recover this account.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleDeleteAccount} className="flex-1 py-3 rounded-xl text-sm font-semibold text-white" style={{ background: '#EF4444' }}>
            Yes, Delete Everything
          </button>
          <button onClick={() => setShowDelete(false)} className="px-5 py-3 rounded-xl text-sm font-semibold" style={{ background: '#1C2030', color: '#94A3B8' }}>
            Cancel
          </button>
        </div>
      </Modal>

      {/* ── Reset Modal ── */}
      <Modal open={showResetModal} onClose={() => setShowReset(false)}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(249,115,22,0.15)' }}>
            <RotateCcw className="w-5 h-5" style={{ color: '#F97316' }} />
          </div>
          <h2 className="text-xl font-semibold" style={{ color: '#F1F5F9', fontFamily: 'var(--font-instrument), Georgia, serif' }}>Clear Data?</h2>
        </div>
        <p className="text-sm mb-5" style={{ color: '#94A3B8' }}>
          {resetType === 'all'
            ? 'This will clear all locally stored data including journal entries and pomodoro stats.'
            : `This will clear your ${resetType} data from local storage.`}
        </p>
        <div className="flex gap-2">
          <button onClick={handleReset} className="flex-1 py-3 rounded-xl text-sm font-semibold text-white" style={{ background: '#F97316' }}>
            Yes, Clear Data
          </button>
          <button onClick={() => setShowReset(false)} className="px-5 py-3 rounded-xl text-sm font-semibold" style={{ background: '#1C2030', color: '#94A3B8' }}>
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  )
}
