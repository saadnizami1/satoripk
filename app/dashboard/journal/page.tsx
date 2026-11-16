'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'

interface JournalEntry {
  id: string
  title: string
  content: string
  mood?: string
  createdAt: string
  updatedAt: string
}

const COLUMNS = 'id, title, content, mood, created_at, updated_at'
const LEGACY_KEY = 'journal_entries'

type JournalRow = {
  id: string; title: string; content: string | null; mood: string | null
  created_at: string; updated_at: string
}

const fromRow = (r: JournalRow): JournalEntry => ({
  id: r.id, title: r.title, content: r.content ?? '', mood: r.mood ?? undefined,
  createdAt: r.created_at, updatedAt: r.updated_at,
})

// Journals used to live only in localStorage. Upload any found on this
// device once; legacy_id makes the upload idempotent if it is retried.
let migration: Promise<void> | null = null
function migrateLocalEntries(userId: string) {
  migration ??= (async () => {
    let local: any[] = []
    try { local = JSON.parse(localStorage.getItem(LEGACY_KEY) || '[]') } catch { return }
    if (!Array.isArray(local) || local.length === 0) return
    const { error } = await supabase.from('journals').upsert(
      local.map(e => ({
        user_id: userId,
        legacy_id: String(e.id),
        title: String(e.title || 'Untitled'),
        content: String(e.content || ''),
        mood: e.mood || null,
        created_at: e.createdAt,
        updated_at: e.updatedAt || e.createdAt,
      })),
      { onConflict: 'user_id,legacy_id', ignoreDuplicates: true },
    )
    if (error) { console.error('Journal migration failed:', error.message); migration = null; return }
    localStorage.removeItem(LEGACY_KEY)
  })()
  return migration
}

const MOODS = [
  { value: 'great',     label: 'GREAT' },
  { value: 'good',      label: 'GOOD' },
  { value: 'okay',      label: 'OKAY' },
  { value: 'tired',     label: 'TIRED' },
  { value: 'sad',       label: 'SAD' },
  { value: 'anxious',   label: 'ANXIOUS' },
  { value: 'grateful',  label: 'GRATEFUL' },
  { value: 'motivated', label: 'MOTIVATED' },
]

function getWordCount(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

export default function JournalPage() {
  const [entries, setEntries]             = useState<JournalEntry[]>([])
  const [filtered, setFiltered]           = useState<JournalEntry[]>([])
  const [query, setQuery]                 = useState('')
  const [showNewModal, setShowNewModal]   = useState(false)
  const [tempTitle, setTempTitle]         = useState('')
  const [tempMood, setTempMood]           = useState('')
  const [showEditor, setShowEditor]       = useState(false)
  const [editorTitle, setEditorTitle]     = useState('')
  const [editorContent, setEditorContent] = useState('')
  const [editorMood, setEditorMood]       = useState('')
  const [lastSaved, setLastSaved]         = useState<Date | null>(null)
  const [isSaving, setIsSaving]           = useState(false)
  const [saveError, setSaveError]         = useState(false)
  const [loading, setLoading]             = useState(true)
  const [userId, setUserId]               = useState<string | null>(null)
  // The entry the open editor writes to. A fresh object per editor session,
  // so a save that finishes after the editor closes can't leak into the next.
  const target    = useRef<{ entry: JournalEntry | null }>({ entry: null })
  const saveChain = useRef<Promise<void>>(Promise.resolve())

  useEffect(() => { loadEntries() }, [])

  useEffect(() => {
    if (!query.trim()) { setFiltered(entries); return }
    const q = query.toLowerCase()
    setFiltered(entries.filter(e => e.title.toLowerCase().includes(q) || e.content.toLowerCase().includes(q)))
  }, [entries, query])

  useEffect(() => {
    if (!showEditor || !editorTitle.trim()) return
    const t = setTimeout(() => autoSave(), 2000)
    return () => clearTimeout(t)
  }, [editorTitle, editorContent, editorMood, showEditor])

  async function loadEntries() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setLoading(false); return }
    setUserId(session.user.id)
    await migrateLocalEntries(session.user.id)
    const { data } = await supabase.from('journals').select(COLUMNS).order('created_at', { ascending: false })
    setEntries((data ?? []).map(fromRow))
    setLoading(false)
  }

  function startNew() {
    setTempTitle(''); setTempMood(''); setShowNewModal(true)
  }

  function proceedToEditor() {
    if (!tempTitle.trim()) return
    target.current = { entry: null }
    setEditorTitle(tempTitle); setEditorMood(tempMood); setEditorContent('')
    setSaveError(false); setShowNewModal(false); setShowEditor(true)
  }

  function openEntry(entry: JournalEntry) {
    target.current = { entry }
    setEditorTitle(entry.title)
    setEditorContent(entry.content); setEditorMood(entry.mood || '')
    setSaveError(false); setShowEditor(true)
  }

  // Saves are queued so an autosave and a close never insert the same
  // new entry twice.
  function autoSave() {
    if (!editorTitle.trim() || !userId) return
    const session = target.current
    const fields = { title: editorTitle, content: editorContent, mood: editorMood || null }
    const existing = session.entry
    if (existing && existing.title === fields.title && existing.content === fields.content
      && (existing.mood ?? null) === fields.mood) return

    setIsSaving(true)
    saveChain.current = saveChain.current.then(async () => {
      const current = session.entry
      const { data, error } = current
        ? await supabase.from('journals').update({ ...fields, updated_at: new Date().toISOString() })
            .eq('id', current.id).select(COLUMNS).single()
        : await supabase.from('journals').insert({ ...fields, user_id: userId }).select(COLUMNS).single()
      if (error || !data) { setSaveError(true); return }
      const saved = fromRow(data)
      session.entry = saved
      setEntries(prev => current
        ? prev.map(e => (e.id === saved.id ? saved : e))
        : [saved, ...prev])
      if (target.current === session) { setLastSaved(new Date()); setSaveError(false) }
    }).catch(() => setSaveError(true)).finally(() => setIsSaving(false))
  }

  function closeEditor() {
    if (editorTitle.trim()) autoSave()
    target.current = { entry: null }
    setShowEditor(false)
    setEditorTitle(''); setEditorContent(''); setEditorMood(''); setLastSaved(null)
  }

  async function deleteEntry(id: string, e?: React.MouseEvent) {
    e?.stopPropagation()
    if (!confirm('Delete this entry?')) return
    const { error } = await supabase.from('journals').delete().eq('id', id)
    if (error) { alert('Could not delete the entry. Please try again.'); return }
    setEntries(prev => prev.filter(entry => entry.id !== id))
  }

  const todayCount = entries.filter(e => new Date(e.createdAt).toDateString() === new Date().toDateString()).length

  return (
    <div style={{ maxWidth: 840 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 8 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(36px, 6vw, 56px)', color: 'var(--ink)', letterSpacing: '-0.03em', lineHeight: 1 }}>
          JOURNAL
        </h1>
        <button
          onClick={startNew}
          className="br-btn"
          style={{ padding: '10px 18px', marginBottom: 6 }}
        >
          + NEW ENTRY
        </button>
      </div>

      <div style={{ borderTop: '1.5px solid var(--border)', marginBottom: 16 }} />

      {/* Stats + Search */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 32, alignItems: 'center' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.08em', flexShrink: 0 }}>
          {entries.length} TOTAL  ·  {todayCount} TODAY
        </span>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="SEARCH..."
          className="br-input"
          style={{ flex: 1, padding: '8px 12px', fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.06em' }}
        />
      </div>

      {/* Entry grid */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', padding: '60px 0' }}>
          {[120, 80, 48].map((w, i) => <div key={i} className="skeleton" style={{ width: w, height: 14 }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ border: '1.5px solid var(--border)', padding: '60px 32px', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, color: 'var(--ink-3)', marginBottom: 12 }}>
            {query ? 'NO ENTRIES FOUND.' : 'YOUR THOUGHTS LIVE HERE.'}
          </div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink-3)', marginBottom: 24 }}>
            {query ? 'Try a different search.' : 'Write about your day. No judgment.'}
          </p>
          {!query && (
            <button onClick={startNew} className="br-btn br-btn-inv" style={{ padding: '12px 24px' }}>
              WRITE FIRST ENTRY →
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 0, border: '1.5px solid var(--border)' }}>
          {filtered.map((entry) => {
            const mood = MOODS.find(m => m.value === entry.mood)
            return (
              <div
                key={entry.id}
                onClick={() => openEntry(entry)}
                className="br-lift"
                style={{
                  padding: 20, cursor: 'pointer', background: 'var(--bg)',
                  borderRight: '1.5px solid var(--border)', borderBottom: '1.5px solid var(--border)',
                }}
              >
                {/* Date + mood */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)' }}>
                    {formatDate(entry.createdAt)}  ·  {formatTime(entry.createdAt)}
                  </span>
                  {mood && (
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-2)' }}>
                      ● {mood.label}
                    </span>
                  )}
                </div>

                {/* Title */}
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: 'var(--ink)', letterSpacing: '-0.01em', marginBottom: 8, lineHeight: 1.2 }}>
                  {entry.title}
                </div>

                {/* Preview */}
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.5, marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {entry.content || 'No content yet.'}
                </p>

                {/* Footer */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)' }}>
                    {getWordCount(entry.content)} WORDS
                  </span>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button
                      onClick={e => deleteEntry(entry.id, e)}
                      style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.06em' }}
                    >
                      DELETE
                    </button>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12, color: 'var(--ink)' }}>→ OPEN</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* New Entry Modal */}
      <AnimatePresence>
        {showNewModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(12,12,12,0.6)' }}
            onClick={() => setShowNewModal(false)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{ width: '100%', maxWidth: 480, background: 'var(--bg)', border: '1.5px solid var(--border)', padding: 32 }}
            >
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, color: 'var(--ink)', marginBottom: 24, letterSpacing: '-0.02em' }}>
                NEW ENTRY
              </h2>
              <div style={{ borderTop: '1.5px solid var(--border)', marginBottom: 24 }} />

              <div style={{ marginBottom: 20 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.12em', marginBottom: 8 }}>TITLE</div>
                <input
                  type="text" value={tempTitle} onChange={e => setTempTitle(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') proceedToEditor() }}
                  placeholder="GIVE YOUR ENTRY A TITLE"
                  autoFocus
                  className="br-input"
                  style={{ width: '100%', padding: '12px', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, letterSpacing: '0.02em', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.12em', marginBottom: 8 }}>MOOD (OPTIONAL)</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {MOODS.map(mood => (
                    <button
                      key={mood.value}
                      onClick={() => setTempMood(tempMood === mood.value ? '' : mood.value)}
                      style={{
                        padding: '6px 12px',
                        background: tempMood === mood.value ? 'var(--bg-invert)' : 'var(--bg)',
                        color: tempMood === mood.value ? 'var(--ink-invert)' : 'var(--ink-2)',
                        border: '1.5px solid var(--border)',
                        fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11,
                        cursor: 'pointer', letterSpacing: '0.04em',
                        transition: 'background 80ms, color 80ms',
                      }}
                    >
                      {mood.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={proceedToEditor}
                  disabled={!tempTitle.trim()}
                  className="br-btn br-btn-inv"
                  style={{ flex: 1, padding: '12px', opacity: !tempTitle.trim() ? 0.4 : 1 }}
                >
                  CONTINUE →
                </button>
                <button onClick={() => setShowNewModal(false)} className="br-btn" style={{ padding: '12px 20px' }}>
                  CANCEL
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editor */}
      <AnimatePresence>
        {showEditor && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}
          >
            {/* Editor top bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px', borderBottom: '1.5px solid var(--border)', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <button
                  onClick={closeEditor}
                  style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12, color: 'var(--ink-2)', background: 'none', border: '1.5px solid var(--border)', padding: '6px 14px', cursor: 'pointer', letterSpacing: '0.06em' }}
                >
                  ← BACK
                </button>
                {isSaving ? (
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.08em' }}>SAVING...</span>
                ) : saveError ? (
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--accent)', letterSpacing: '0.08em' }}>NOT SAVED — CHECK CONNECTION</span>
                ) : lastSaved ? (
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.08em' }}>SAVED {lastSaved.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                ) : null}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)' }}>
                  {getWordCount(editorContent)} WORDS
                </span>
                {editorMood && (
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11, color: 'var(--ink-2)', border: '1.5px solid var(--border-2)', padding: '4px 10px' }}>
                    {MOODS.find(m => m.value === editorMood)?.label}
                  </span>
                )}
                <button onClick={() => { if (editorTitle.trim()) autoSave() }} className="br-btn br-btn-inv" style={{ padding: '8px 16px' }}>
                  SAVE
                </button>
              </div>
            </div>

            {/* Title */}
            <div style={{ padding: '32px 40px 0', flexShrink: 0 }}>
              <input
                type="text" value={editorTitle} onChange={e => setEditorTitle(e.target.value)}
                placeholder="UNTITLED"
                style={{
                  width: '100%', background: 'transparent', border: 'none', outline: 'none',
                  fontFamily: 'var(--font-display)', fontWeight: 800,
                  fontSize: 'clamp(28px, 5vw, 48px)', color: 'var(--ink)',
                  letterSpacing: '-0.02em', boxSizing: 'border-box',
                }}
              />
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)', marginTop: 6, letterSpacing: '0.06em' }}>
                {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase()}
              </div>
            </div>

            <div style={{ borderTop: '1.5px solid var(--border)', margin: '16px 40px' }} />

            {/* Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 40px 32px' }}>
              <textarea
                value={editorContent}
                onChange={e => setEditorContent(e.target.value)}
                placeholder="Start writing..."
                style={{
                  width: '100%', minHeight: '100%', background: 'transparent',
                  border: 'none', outline: 'none', resize: 'none',
                  fontFamily: 'var(--font-body)', fontSize: 16, lineHeight: 1.75,
                  color: 'var(--ink)', boxSizing: 'border-box',
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
