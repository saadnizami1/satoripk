'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Plus, Search, Calendar, Trash2, X, Clock, FileText, Check } from 'lucide-react'

interface JournalEntry {
  id: string
  title: string
  content: string
  mood?: string
  createdAt: string
  updatedAt: string
}

const MOODS = [
  { value: 'happy',     label: 'Happy',     emoji: '😊', color: '#2DD4BF' },
  { value: 'calm',      label: 'Calm',      emoji: '😌', color: '#818CF8' },
  { value: 'excited',   label: 'Excited',   emoji: '🤩', color: '#F97316' },
  { value: 'tired',     label: 'Tired',     emoji: '😴', color: '#94A3B8' },
  { value: 'sad',       label: 'Sad',       emoji: '😔', color: '#EF4444' },
  { value: 'anxious',   label: 'Anxious',   emoji: '😰', color: '#F97316' },
  { value: 'grateful',  label: 'Grateful',  emoji: '🙏', color: '#4ADE80' },
  { value: 'motivated', label: 'Motivated', emoji: '💪', color: '#2DD4BF' },
]

function getMoodData(value: string) {
  return MOODS.find(m => m.value === value)
}

function getWordCount(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

export default function JournalPage() {
  const [entries, setEntries]               = useState<JournalEntry[]>([])
  const [filtered, setFiltered]             = useState<JournalEntry[]>([])
  const [query, setQuery]                   = useState('')
  const [showNewModal, setShowNewModal]     = useState(false)
  const [tempTitle, setTempTitle]           = useState('')
  const [tempMood, setTempMood]             = useState('')
  const [showEditor, setShowEditor]         = useState(false)
  const [editingEntry, setEditingEntry]     = useState<JournalEntry | null>(null)
  const [editorTitle, setEditorTitle]       = useState('')
  const [editorContent, setEditorContent]   = useState('')
  const [editorMood, setEditorMood]         = useState('')
  const [lastSaved, setLastSaved]           = useState<Date | null>(null)
  const [isSaving, setIsSaving]             = useState(false)

  useEffect(() => { loadEntries() }, [])

  useEffect(() => {
    if (!query.trim()) { setFiltered(entries); return }
    const q = query.toLowerCase()
    setFiltered(entries.filter(e =>
      e.title.toLowerCase().includes(q) || e.content.toLowerCase().includes(q)
    ))
  }, [entries, query])

  // Auto-save
  useEffect(() => {
    if (!showEditor || !editorTitle.trim()) return
    const t = setTimeout(() => autoSave(), 2000)
    return () => clearTimeout(t)
  }, [editorTitle, editorContent, editorMood, showEditor])

  function loadEntries() {
    const raw = localStorage.getItem('journal_entries')
    if (raw) setEntries(JSON.parse(raw))
  }

  function saveEntries(updated: JournalEntry[]) {
    localStorage.setItem('journal_entries', JSON.stringify(updated))
    setEntries(updated)
  }

  function startNew() {
    setTempTitle(''); setTempMood('')
    setShowNewModal(true)
  }

  function proceedToEditor() {
    if (!tempTitle.trim()) return
    setEditorTitle(tempTitle); setEditorMood(tempMood); setEditorContent('')
    setEditingEntry(null); setShowNewModal(false); setShowEditor(true)
  }

  function openEntry(entry: JournalEntry) {
    setEditingEntry(entry); setEditorTitle(entry.title)
    setEditorContent(entry.content); setEditorMood(entry.mood || '')
    setShowEditor(true)
  }

  function autoSave() {
    if (!editorTitle.trim()) return
    setIsSaving(true)
    if (editingEntry) {
      const updated = entries.map(e =>
        e.id === editingEntry.id
          ? { ...e, title: editorTitle, content: editorContent, mood: editorMood, updatedAt: new Date().toISOString() }
          : e
      )
      saveEntries(updated)
      setEditingEntry(updated.find(e => e.id === editingEntry.id) || null)
    } else {
      const newEntry: JournalEntry = {
        id: Date.now().toString(), title: editorTitle, content: editorContent,
        mood: editorMood, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      }
      saveEntries([newEntry, ...entries])
      setEditingEntry(newEntry)
    }
    setLastSaved(new Date())
    setTimeout(() => setIsSaving(false), 500)
  }

  function closeEditor() {
    if (editorTitle.trim()) autoSave()
    setShowEditor(false); setEditingEntry(null)
    setEditorTitle(''); setEditorContent(''); setEditorMood(''); setLastSaved(null)
  }

  function deleteEntry(id: string, e?: React.MouseEvent) {
    e?.stopPropagation()
    if (!confirm('Delete this entry?')) return
    saveEntries(entries.filter(entry => entry.id !== id))
    if (editingEntry?.id === id) closeEditor()
  }

  const todayCount = entries.filter(e => new Date(e.createdAt).toDateString() === new Date().toDateString()).length

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(129,140,248,0.15)' }}>
              <BookOpen className="w-5 h-5" style={{ color: '#818CF8' }} />
            </div>
            <div>
              <h1 className="text-2xl font-serif" style={{ color: '#F1F5F9', fontFamily: 'var(--font-instrument), Georgia, serif' }}>Journal</h1>
              <p className="text-xs" style={{ color: '#475569' }}>Write your thoughts and reflections</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={startNew}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
            style={{ background: '#818CF8' }}
          >
            <Plus className="w-4 h-4" /> New Entry
          </motion.button>
        </div>
      </motion.div>

      {/* Stats + Search */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="flex gap-3">
        {/* Stats */}
        <div className="flex gap-2 shrink-0">
          {[{ icon: FileText, value: entries.length, label: 'Total' }, { icon: BookOpen, value: todayCount, label: 'Today' }].map(stat => (
            <div key={stat.label} className="flex items-center gap-2.5 px-4 py-3 rounded-xl" style={{ background: '#13161F', border: '1px solid rgba(255,255,255,0.06)' }}>
              <stat.icon className="w-4 h-4 shrink-0" style={{ color: '#818CF8' }} />
              <div>
                <p className="text-xl font-bold leading-none" style={{ color: '#F1F5F9' }}>{stat.value}</p>
                <p className="text-[10px]" style={{ color: '#475569' }}>{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#475569' }} />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search entries..."
            className="w-full h-full pl-10 pr-4 py-3 rounded-xl text-sm focus:outline-none transition-all"
            style={{ background: '#13161F', border: '1px solid rgba(255,255,255,0.06)', color: '#F1F5F9' }}
          />
        </div>
      </motion.div>

      {/* Entry grid / empty state */}
      {filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 rounded-2xl"
          style={{ background: '#13161F', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <BookOpen className="w-14 h-14 mb-4 opacity-20" style={{ color: '#818CF8' }} />
          <h3 className="text-lg font-semibold mb-2" style={{ color: '#F1F5F9' }}>
            {query ? 'No entries found' : 'Your thoughts live here'}
          </h3>
          <p className="text-sm mb-6 text-center max-w-xs" style={{ color: '#475569' }}>
            {query ? 'Try a different search term' : "Write about your day, your stress, your wins — no judgment."}
          </p>
          {!query && (
            <button
              onClick={startNew}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ background: '#818CF8' }}
            >
              Write first entry
            </button>
          )}
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((entry, i) => {
            const mood = entry.mood ? getMoodData(entry.mood) : null
            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => openEntry(entry)}
                className="group rounded-2xl p-5 cursor-pointer transition-all hover:scale-[1.01] hover:shadow-2xl"
                style={{
                  background: '#13161F',
                  border: `1px solid rgba(255,255,255,0.06)`,
                  borderLeft: mood ? `3px solid ${mood.color}` : '3px solid rgba(129,140,248,0.4)',
                }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-base font-semibold line-clamp-2 flex-1 pr-2 transition-colors group-hover:text-[#818CF8]" style={{ color: '#F1F5F9' }}>
                    {entry.title}
                  </h3>
                  {mood && (
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${mood.color}18` }}>
                      <span className="text-base">{mood.emoji}</span>
                    </div>
                  )}
                </div>

                {/* Date */}
                <div className="flex items-center gap-3 mb-3">
                  <span className="flex items-center gap-1 text-[10px]" style={{ color: '#475569' }}>
                    <Calendar className="w-3 h-3" />{formatDate(entry.createdAt)}
                  </span>
                  <span className="flex items-center gap-1 text-[10px]" style={{ color: '#475569' }}>
                    <Clock className="w-3 h-3" />{formatTime(entry.createdAt)}
                  </span>
                </div>

                {/* Preview */}
                <p className="text-xs line-clamp-3 mb-3" style={{ color: '#475569' }}>
                  {entry.content || 'No content yet…'}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: 'rgba(129,140,248,0.1)', color: '#818CF8' }}>
                    {getWordCount(entry.content)} words
                  </span>
                  <button
                    onClick={e => deleteEntry(entry.id, e)}
                    className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-[rgba(239,68,68,0.1)]"
                    style={{ color: '#EF4444' }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* ── New Entry Modal ── */}
      <AnimatePresence>
        {showNewModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
            onClick={() => setShowNewModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl p-6"
              style={{ background: '#13161F', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-semibold" style={{ color: '#F1F5F9', fontFamily: 'var(--font-instrument), Georgia, serif' }}>New Entry</h2>
                <button onClick={() => setShowNewModal(false)} className="p-1.5 rounded-lg hover:bg-[rgba(255,255,255,0.06)]" style={{ color: '#475569' }}>
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Title */}
              <div className="mb-5">
                <label className="block text-xs font-medium mb-2" style={{ color: '#94A3B8' }}>Title</label>
                <input
                  type="text"
                  value={tempTitle}
                  onChange={e => setTempTitle(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') proceedToEditor() }}
                  placeholder="Give your entry a title…"
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl text-base font-medium focus:outline-none transition-all"
                  style={{ background: '#222638', border: '1px solid rgba(255,255,255,0.06)', color: '#F1F5F9' }}
                />
              </div>

              {/* Mood */}
              <div className="mb-5">
                <label className="block text-xs font-medium mb-3" style={{ color: '#94A3B8' }}>How are you feeling?</label>
                <div className="grid grid-cols-4 gap-2">
                  {MOODS.map(mood => (
                    <button
                      key={mood.value}
                      onClick={() => setTempMood(mood.value)}
                      className="flex flex-col items-center gap-1 p-2.5 rounded-xl transition-all"
                      style={{
                        background: tempMood === mood.value ? `${mood.color}18` : '#1C2030',
                        border: tempMood === mood.value ? `1px solid ${mood.color}50` : '1px solid transparent',
                      }}
                    >
                      <span className="text-xl">{mood.emoji}</span>
                      <span className="text-[9px] font-medium" style={{ color: tempMood === mood.value ? mood.color : '#475569' }}>{mood.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={proceedToEditor}
                disabled={!tempTitle.trim()}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40 hover:opacity-90"
                style={{ background: '#818CF8' }}
              >
                Continue writing
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Editor ── */}
      <AnimatePresence>
        {showEditor && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }}
              className="w-full max-w-3xl rounded-2xl overflow-hidden flex flex-col"
              style={{ background: '#13161F', border: '1px solid rgba(255,255,255,0.08)', height: 'min(80vh, 640px)' }}
            >
              {/* Editor Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-3">
                  <button
                    onClick={closeEditor}
                    className="p-2 rounded-xl transition-all hover:bg-[rgba(255,255,255,0.06)]"
                    style={{ color: '#94A3B8' }}
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-2 text-xs" style={{ color: '#475569' }}>
                    {isSaving ? (
                      <><span className="w-1.5 h-1.5 rounded-full bg-[#F97316] animate-pulse" />Saving…</>
                    ) : lastSaved ? (
                      <><Check className="w-3.5 h-3.5" style={{ color: '#4ADE80' }} />Saved {lastSaved.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</>
                    ) : null}
                  </div>
                </div>
                {editorMood && getMoodData(editorMood) && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: `${getMoodData(editorMood)!.color}18` }}>
                    <span className="text-lg">{getMoodData(editorMood)!.emoji}</span>
                    <span className="text-xs font-medium" style={{ color: getMoodData(editorMood)!.color }}>{getMoodData(editorMood)!.label}</span>
                  </div>
                )}
              </div>

              {/* Title */}
              <div className="px-8 pt-6 pb-2 shrink-0">
                <input
                  type="text"
                  value={editorTitle}
                  onChange={e => setEditorTitle(e.target.value)}
                  className="w-full text-3xl font-semibold focus:outline-none bg-transparent"
                  style={{ color: '#F1F5F9', fontFamily: 'var(--font-instrument), Georgia, serif' }}
                  placeholder="Title"
                />
                <p className="text-xs mt-1" style={{ color: '#475569' }}>
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
              </div>

              <div className="h-px mx-8 my-3" style={{ background: 'rgba(255,255,255,0.06)' }} />

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-8 pb-4">
                <textarea
                  value={editorContent}
                  onChange={e => setEditorContent(e.target.value)}
                  placeholder="Start writing your thoughts…"
                  className="w-full h-full bg-transparent focus:outline-none resize-none text-base leading-[1.8]"
                  style={{ color: '#F1F5F9', minHeight: '100%' }}
                />
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-8 py-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)', background: '#0B0D14' }}>
                <span className="text-xs" style={{ color: '#475569' }}>{getWordCount(editorContent)} words</span>
                <button
                  onClick={closeEditor}
                  className="px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                  style={{ background: '#818CF8' }}
                >
                  Done
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
