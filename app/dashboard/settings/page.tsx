'use client'

import { useState, useEffect, type ReactNode } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { PageHeader } from '@/components/app/PageHeader'
import { Switch } from '@/components/ui/controls'
import { Pill } from '@/components/ui/kit'

function Row({ label, desc, onClick, danger = false }: { label: string; desc?: string; onClick: () => void; danger?: boolean }) {
  return (
    <li>
      <button type="button" className={`st-row ${danger ? 'st-row--danger' : ''}`} onClick={onClick}>
        <span>
          <span className="st-row__label">{label}</span>
          {desc && <span className="st-row__desc">{desc}</span>}
        </span>
        <ChevronRight size={18} aria-hidden="true" />
      </button>
    </li>
  )
}

function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="st-scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div role="dialog" aria-modal="true" aria-label={title} className="st-dialog"
            initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 10, opacity: 0 }} onClick={e => e.stopPropagation()}>
            <h2 className="t-h3">{title}</h2>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function SettingsPage() {
  const [toast, setToast]                   = useState('')
  const [showDeleteModal, setShowDelete]     = useState(false)
  const [showResetModal, setShowReset]       = useState(false)
  const [showPasswordModal, setShowPassword] = useState(false)
  const [resetType, setResetType]            = useState<'all' | 'journals'>('all')
  const [email, setEmail]                    = useState('')
  const [userId, setUserId]                  = useState<string | null>(null)
  const [currentPw, setCurrentPw]           = useState('')
  const [newPw, setNewPw]                   = useState('')
  const [confirmPw, setConfirmPw]           = useState('')
  const [pwError, setPwError]               = useState('')
  const [pwSaving, setPwSaving]             = useState(false)
  const [consent, setConsent]               = useState(false)
  const [deleting, setDeleting]             = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return
      setEmail(session.user.email || '')
      setUserId(session.user.id)
      const { data } = await supabase.from('profiles').select('research_consent').eq('id', session.user.id).single()
      // The research views only include rows where consent is true.
      if (data) setConsent(data.research_consent === true)
    }
    load()
  }, [])

  // Withdrawing consent removes the user's rows from the research views.
  async function setResearchConsent(next: boolean) {
    if (!userId) return
    setConsent(next)
    const { error } = await supabase.from('profiles').update({ research_consent: next }).eq('id', userId)
    if (error) { setConsent(!next); showToast("That didn't save. Try again."); return }
    showToast(next ? "You're part of the study. Thank you." : "You've left the study. Your check-ins are no longer shared.")
  }

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 4000)
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault()
    setPwError('')
    if (!currentPw || !newPw || !confirmPw) return setPwError('Fill in all three fields.')
    if (newPw.length < 8) return setPwError('Your new password needs at least 8 characters.')
    if (newPw !== confirmPw) return setPwError("The two new passwords don't match.")
    setPwSaving(true)
    const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password: currentPw })
    if (signInErr) { setPwSaving(false); return setPwError("Your current password isn't right.") }
    const { error } = await supabase.auth.updateUser({ password: newPw })
    setPwSaving(false)
    if (error) return setPwError(`That didn't work: ${error.message}`)
    setShowPassword(false); setCurrentPw(''); setNewPw(''); setConfirmPw('')
    showToast('Password changed.')
  }

  async function handleDeleteAccount() {
    setDeleting(true)
    const res = await fetch('/api/account', { method: 'DELETE' }).catch(() => null)
    if (!res?.ok) {
      setDeleting(false)
      return alert("Your account wasn't deleted. Check your connection and try again.")
    }
    await supabase.auth.signOut().catch(() => {})
    localStorage.clear(); sessionStorage.clear()
    window.location.href = '/'
  }

  async function handleReset() {
    if (resetType === 'journals') {
      if (!userId) return
      const { error } = await supabase.from('journal_entries').delete().eq('user_id', userId)
      if (error) { showToast("Your journals weren't deleted. Try again."); return }
      showToast('All journal entries deleted.')
    } else {
      // Auth lives in cookies, so clearing browser storage keeps the session.
      localStorage.clear()
      showToast('Cleared this device.')
    }
    setShowReset(false)
  }

  async function handleExport() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const [{ data: profile }, { data: moods }, { data: stress }, { data: journals }, { data: chats }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', session.user.id).single(),
      supabase.from('moods').select('*').eq('user_id', session.user.id),
      supabase.from('academic_stress').select('*').eq('user_id', session.user.id),
      supabase.from('journal_entries').select('title, content, mood, created_at, updated_at').eq('user_id', session.user.id),
      supabase.from('chat_sessions').select('messages, created_at, updated_at').eq('user_id', session.user.id),
    ])
    const blob = new Blob([JSON.stringify({ exported_at: new Date().toISOString(), profile, moods, academic_stress: stress, journals, chat_sessions: chats }, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `satori-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    showToast('Your data is downloading.')
  }

  return (
    <div>
      <PageHeader lines={['settings']} accent="settings" art="day" sticker="padlock" lead="Your account, your data and what you share." />

      <div aria-live="polite" className="st-toast-wrap">{toast && <div className="notice notice--ok st-toast">{toast}</div>}</div>

      <div className="page-narrow stack-lg">
        <section aria-labelledby="st-research" className="sheet sheet--pad stack-sm">
          <h2 id="st-research" className="section-title" style={{ margin: 0 }}>Research</h2>
          <Switch checked={consent} onChange={setResearchConsent}
            label="Share my check-ins with the study"
            description="Your mood and stress check-ins (with any notes on them) and your profile answers, including your name and email, go to the Lahore Garrison University study team. Your journal and Kokoro chats are never shared. Turn this off any time and you'll be left out of every future export." />
        </section>

        <section aria-labelledby="st-data">
          <h2 id="st-data" className="section-title">Your data</h2>
          <ul className="st-list sheet">
            <Row label="Download my data" desc="Everything in your account, as a JSON file" onClick={handleExport} />
            <Row label="Clear this device" desc="Removes focus timer stats and saved preferences from this browser" onClick={() => { setResetType('all'); setShowReset(true) }} />
            <Row label="Delete all journal entries" desc="Permanently removes every entry" onClick={() => { setResetType('journals'); setShowReset(true) }} danger />
          </ul>
        </section>

        <section aria-labelledby="st-account">
          <h2 id="st-account" className="section-title">Account</h2>
          <ul className="st-list sheet">
            <Row label="Change password" desc={email ? `Signed in as ${email}` : undefined} onClick={() => { setPwError(''); setShowPassword(true) }} />
            <Row label="Delete my account" desc="Permanently deletes your account and everything in it" onClick={() => setShowDelete(true)} danger />
          </ul>
        </section>

        <p className="t-small muted">
          Satori is made by Saad Nizami as part of a research study. <Link href="/dashboard/creator" className="link">About Satori</Link>
        </p>
      </div>

      <Modal open={showPasswordModal} onClose={() => setShowPassword(false)} title="Change password">
        <form className="stack" onSubmit={handlePasswordChange}>
          {[
            { id: 'pw-cur', label: 'Current password', val: currentPw, set: setCurrentPw, ac: 'current-password' },
            { id: 'pw-new', label: 'New password', val: newPw, set: setNewPw, ac: 'new-password' },
            { id: 'pw-con', label: 'New password, again', val: confirmPw, set: setConfirmPw, ac: 'new-password' },
          ].map(f => (
            <div key={f.id} className="field">
              <label htmlFor={f.id} className="field__label">{f.label}</label>
              <input id={f.id} type="password" className="input" autoComplete={f.ac} value={f.val} onChange={e => f.set(e.target.value)} aria-describedby={pwError ? 'pw-err' : undefined} />
            </div>
          ))}
          {pwError && <p id="pw-err" className="field__error" role="alert">{pwError}</p>}
          <div className="row">
            <Pill type="submit" variant="tape" disabled={pwSaving}>{pwSaving ? 'Changing…' : 'Change password'}</Pill>
            <button type="button" className="text-btn" onClick={() => setShowPassword(false)}>Cancel</button>
          </div>
        </form>
      </Modal>

      <Modal open={showDeleteModal} onClose={() => setShowDelete(false)} title="Delete your account?">
        <p className="t-body">This permanently deletes your profile, check-ins, journal, Kokoro chats and profile picture. It can&apos;t be undone, and you&apos;ll be signed out straight away.</p>
        <p className="t-small muted">Want a copy first? Close this and use &ldquo;Download my data&rdquo;.</p>
        <div className="row">
          <Pill variant="danger" onClick={handleDeleteAccount} disabled={deleting}>{deleting ? 'Deleting…' : 'Delete my account'}</Pill>
          <button type="button" className="text-btn" onClick={() => setShowDelete(false)}>Keep my account</button>
        </div>
      </Modal>

      <Modal open={showResetModal} onClose={() => setShowReset(false)} title={resetType === 'journals' ? 'Delete every journal entry?' : 'Clear this device?'}>
        <p className="t-body">
          {resetType === 'journals'
            ? "This permanently deletes every journal entry in your account. It can't be undone."
            : 'This clears focus timer stats and saved preferences from this browser. Your account and check-ins are not affected.'}
        </p>
        <div className="row">
          <Pill variant={resetType === 'journals' ? 'danger' : 'tape'} onClick={handleReset}>{resetType === 'journals' ? 'Delete all entries' : 'Clear this device'}</Pill>
          <button type="button" className="text-btn" onClick={() => setShowReset(false)}>Cancel</button>
        </div>
      </Modal>

      <style>{`
        .st-list { list-style: none; margin: 0; padding: 4px 0; }
        .st-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; width: 100%; min-height: 64px; padding: 12px 20px; background: none; border: 0; border-bottom: 1px solid var(--line); cursor: pointer; text-align: left; color: var(--ink); }
        .st-list li:last-child .st-row { border-bottom: 0; }
        .st-row:hover { background: var(--fog); }
        .st-row__label { display: block; font-weight: 600; font-size: 16px; }
        .st-row__desc { display: block; font-size: 14px; color: var(--ink-3); margin-top: 2px; }
        .st-row--danger .st-row__label { color: var(--danger); }
        .st-row--danger:hover { background: var(--danger-bg); }
        .st-scrim { position: fixed; inset: 0; z-index: 80; display: grid; place-items: center; padding: 16px; background: rgba(15,30,46,0.5); }
        .st-dialog { width: 100%; max-width: 460px; display: grid; gap: 16px; padding: 28px; border-radius: 24px; background: var(--paper); }
        .st-toast-wrap { position: fixed; top: 92px; left: 50%; transform: translateX(-50%); z-index: 90; width: min(480px, calc(100vw - 32px)); }
        .st-toast { box-shadow: var(--lift); text-align: center; }
      `}</style>
    </div>
  )
}
