'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowLeft, Search, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { PageHeader } from '@/components/app/PageHeader'
import { Pill, Skeleton } from '@/components/ui/kit'
import { Sticker } from '@/components/ui/stickers'

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
    const { error } = await supabase.from('journal_entries').upsert(
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

// Stored in journal_entries.mood; keep the values stable.
const MOODS = [
  { value: 'great', label: 'Great' },
  { value: 'good', label: 'Good' },
  { value: 'okay', label: 'Okay' },
  { value: 'tired', label: 'Tired' },
  { value: 'sad', label: 'Sad' },
  { value: 'anxious', label: 'Anxious' },
  { value: 'grateful', label: 'Grateful' },
  { value: 'motivated', label: 'Motivated' },
]

function getWordCount(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
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

  const reduce = useReducedMotion()

  useEffect(() => {
    loadEntries()
    // Arriving from the dashboard's journal prompt: open a new entry titled with it.
    const params = new URLSearchParams(window.location.search)
    if (params.get('new') === '1') {
      const prompt = (params.get('prompt') || '').slice(0, 300)
      target.current = { entry: null }
      if (prompt) { setEditorTitle(prompt); setEditorMood(''); setEditorContent(''); setShowEditor(true) }
      else setShowNewModal(true)
      window.history.replaceState(null, '', '/dashboard/journal')
    }
  }, [])

  useEffect(() => {
    if (!showNewModal && !showEditor) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (showEditor) closeEditor(); else setShowNewModal(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

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
    const { data } = await supabase.from('journal_entries').select(COLUMNS).order('created_at', { ascending: false })
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
        ? await supabase.from('journal_entries').update({ ...fields, updated_at: new Date().toISOString() })
            .eq('id', current.id).select(COLUMNS).single()
        : await supabase.from('journal_entries').insert({ ...fields, user_id: userId }).select(COLUMNS).single()
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
    if (!confirm("Delete this entry? This can't be undone.")) return
    const { error } = await supabase.from('journal_entries').delete().eq('id', id)
    if (error) { alert("That entry wasn't deleted. Check your connection and try again."); return }
    setEntries(prev => prev.filter(entry => entry.id !== id))
  }

  return (
    <div>
      <PageHeader lines={['write it', 'down']} accent="down" art="dawn" sticker="notebook"
        lead="Only you can read what you write here. It is never shared with anyone, including the study.">
        <Pill variant="tape" knob onClick={startNew}>New entry</Pill>
      </PageHeader>

      <div className="row" style={{ marginBottom: 24, justifyContent: 'space-between' }}>
        <div className="field" style={{ flex: 1, maxWidth: 420, position: 'relative' }}>
          <label htmlFor="j-search" className="sr-only">Search your journal</label>
          <Search size={18} aria-hidden="true" style={{ position: 'absolute', left: 16, top: 18, color: 'var(--ink-3)' }} />
          <input id="j-search" type="search" className="input" style={{ paddingLeft: 44, borderRadius: 'var(--r-pill)' }}
            value={query} onChange={e => setQuery(e.target.value)} placeholder="Search your entries" />
        </div>
        {!loading && <p className="t-small muted">{entries.length} {entries.length === 1 ? 'entry' : 'entries'}</p>}
      </div>

      {loading ? <Skeleton /> : filtered.length === 0 ? (
        <div className="sheet sheet--pad row" style={{ gap: 24, flexWrap: 'wrap' }}>
          <Sticker name="notebook" size={110} tilt={-6} />
          <div className="stack-sm" style={{ flex: 1, minWidth: 240 }}>
            <h2 className="section-title" style={{ margin: 0 }}>{query ? 'Nothing matches that search' : 'Your first page is blank'}</h2>
            <p className="t-body muted">{query ? 'Try a different word.' : 'Write about today, a worry, a win, anything. Three lines is plenty.'}</p>
            {!query && <div><Pill variant="tape" onClick={startNew}>Write your first entry</Pill></div>}
          </div>
        </div>
      ) : (
        <ul className="j-grid">
          {filtered.map((entry, i) => {
            const mood = MOODS.find(m => m.value === entry.mood)
            return (
              <li key={entry.id} className="j-card" style={{ ['--tilt' as string]: `${[-0.8, 0.6, -0.4, 0.9][i % 4]}deg` }}>
                <button type="button" className="j-card__open" onClick={() => openEntry(entry)}>
                  <span className="t-small faint">{formatDate(entry.createdAt)}{mood ? `, feeling ${mood.label.toLowerCase()}` : ''}</span>
                  <span className="t-h4 j-card__title">{entry.title}</span>
                  <span className="t-small muted j-card__preview">{entry.content || 'Nothing written yet.'}</span>
                  <span className="t-small faint">{getWordCount(entry.content)} words</span>
                </button>
                <button type="button" className="icon-btn j-card__del" aria-label={`Delete "${entry.title}"`} onClick={e => deleteEntry(entry.id, e)}>
                  <Trash2 size={18} />
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {/* New entry dialog */}
      <AnimatePresence>
        {showNewModal && (
          <motion.div className="j-scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowNewModal(false)}>
            <motion.div role="dialog" aria-modal="true" aria-labelledby="j-new-h" className="j-dialog"
              initial={reduce ? false : { y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={reduce ? undefined : { y: 12, opacity: 0 }}
              onClick={e => e.stopPropagation()}>
              <h2 id="j-new-h" className="t-h2">New entry</h2>
              <form className="stack" onSubmit={e => { e.preventDefault(); proceedToEditor() }}>
                <div className="field">
                  <label htmlFor="j-title" className="field__label">Title</label>
                  <input id="j-title" className="input" value={tempTitle} onChange={e => setTempTitle(e.target.value)} maxLength={300}
                    placeholder="e.g. After the chemistry mock" autoFocus />
                </div>
                <div className="stack-sm">
                  <p id="j-mood" className="field__label">How are you feeling? <span className="faint" style={{ fontWeight: 400 }}>(optional)</span></p>
                  <div role="radiogroup" aria-labelledby="j-mood" className="row" style={{ gap: 6 }}>
                    {MOODS.map(mood => (
                      <button key={mood.value} type="button" role="radio" aria-checked={tempMood === mood.value} className="chip"
                        style={{ minHeight: 44 }} onClick={() => setTempMood(tempMood === mood.value ? '' : mood.value)}>{mood.label}</button>
                    ))}
                  </div>
                </div>
                <div className="row">
                  <Pill type="submit" variant="tape" disabled={!tempTitle.trim()}>Start writing</Pill>
                  <button type="button" className="text-btn" onClick={() => setShowNewModal(false)}>Cancel</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editor */}
      <AnimatePresence>
        {showEditor && (
          <motion.div role="dialog" aria-modal="true" aria-label="Journal entry" className="j-editor"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="j-editor__bar">
              <button type="button" className="text-btn" onClick={closeEditor}><ArrowLeft size={18} aria-hidden="true" /> Done</button>
              <p className="t-small" aria-live="polite" style={{ color: saveError ? 'var(--danger)' : 'var(--ink-3)' }}>
                {isSaving ? 'Saving…' : saveError ? 'Not saved. Check your connection.' : lastSaved ? `Saved at ${lastSaved.toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit' })}, only visible to you` : 'Saves as you write'}
              </p>
              <div className="row" style={{ gap: 12, flexWrap: 'nowrap' }}>
                <span className="t-small faint j-hide-sm">{getWordCount(editorContent)} words</span>
                <Pill variant="tape" size="sm" onClick={() => { if (editorTitle.trim()) autoSave() }} disabled={!editorTitle.trim()}>Save</Pill>
              </div>
            </div>
            <div className="j-editor__page">
              <label htmlFor="j-ed-title" className="sr-only">Title</label>
              <input id="j-ed-title" className="j-editor__title" value={editorTitle} onChange={e => setEditorTitle(e.target.value)} placeholder="Give it a title" maxLength={300} />
              <p className="t-small faint" style={{ marginTop: 6 }}>
                {new Date(target.current.entry?.createdAt ?? Date.now()).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                {editorMood && `, feeling ${MOODS.find(m => m.value === editorMood)?.label.toLowerCase()}`}
              </p>
              <label htmlFor="j-ed-body" className="sr-only">Entry</label>
              <textarea id="j-ed-body" className="j-editor__body" value={editorContent} onChange={e => setEditorContent(e.target.value)}
                placeholder="Start anywhere." autoFocus maxLength={100000} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .j-grid { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 280px), 1fr)); gap: 22px; }
        .j-card { position: relative; transform: rotate(var(--tilt)); background: var(--paper); border-radius: 6px; box-shadow: 0 14px 24px -16px rgba(15,30,46,0.45);
          background-image: repeating-linear-gradient(180deg, transparent 0 31px, rgba(127,163,160,0.25) 31px 32px); background-position: 0 14px; }
        .j-card::before { content: ''; position: absolute; top: 0; bottom: 0; left: 30px; width: 1px; background: rgba(236,78,139,0.35); }
        .j-card__open { display: grid; gap: 6px; width: 100%; min-height: 200px; padding: 18px 56px 20px 46px; text-align: left; background: none; border: 0; cursor: pointer; border-radius: 6px; color: var(--ink); }
        .j-card__open:hover .j-card__title { text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: 4px; }
        .j-card__title { overflow-wrap: anywhere; }
        .j-card__preview { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
        .j-card__del { position: absolute; top: 8px; right: 8px; color: var(--ink-3); }
        .j-card__del:hover { color: var(--danger); background: var(--danger-bg); }
        .j-scrim { position: fixed; inset: 0; z-index: 80; display: grid; place-items: center; padding: 16px; background: rgba(15,30,46,0.5); }
        .j-dialog { width: 100%; max-width: 520px; background: var(--paper); border-radius: 24px; padding: 28px; display: grid; gap: 20px; }
        .j-editor { position: fixed; inset: 0; z-index: 80; display: flex; flex-direction: column; background: var(--fog); }
        .j-editor__bar { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px var(--gutter); border-bottom: 1px solid var(--line); background: var(--paper); }
        .j-editor__page { flex: 1; overflow-y: auto; width: 100%; max-width: 760px; margin: 0 auto; padding: 40px var(--gutter) 64px; display: flex; flex-direction: column; }
        .j-editor__title { width: 100%; background: transparent; border: 0; outline: none; font: 400 clamp(30px, 5vw, 48px)/1.1 var(--font-display); color: var(--ink); }
        .j-editor__body { flex: 1; width: 100%; min-height: 50vh; margin-top: 24px; background: transparent; border: 0; outline: none; resize: none; font: 400 18px/1.8 var(--font-body); color: var(--ink); }
        .j-editor__title:focus-visible, .j-editor__body:focus-visible { outline: none; }
        @media (max-width: 560px) { .j-hide-sm { display: none; } }
      `}</style>
    </div>
  )
}
