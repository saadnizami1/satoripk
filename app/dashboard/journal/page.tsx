'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BookOpen, 
  Plus, 
  Search, 
  Calendar,
  Trash2,
  X,
  Sparkles,
  Clock,
  FileText,
  Check,
  ArrowLeft
} from 'lucide-react'

interface JournalEntry {
  id: string
  title: string
  content: string
  mood?: string
  createdAt: string
  updatedAt: string
}

const moods = [
  { value: 'happy', label: 'Happy', emoji: '😊', color: '#4A6C6F' },
  { value: 'calm', label: 'Calm', emoji: '😌', color: '#6B6B6B' },
  { value: 'excited', label: 'Excited', emoji: '🤩', color: '#D2691E' },
  { value: 'tired', label: 'Tired', emoji: '😴', color: '#A8A8A8' },
  { value: 'sad', label: 'Sad', emoji: '😔', color: '#1F1F1F' },
  { value: 'anxious', label: 'Anxious', emoji: '😰', color: '#D2691E' },
  { value: 'grateful', label: 'Grateful', emoji: '🙏', color: '#4A6C6F' },
  { value: 'motivated', label: 'Motivated', emoji: '💪', color: '#6B6B6B' },
]

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [filteredEntries, setFilteredEntries] = useState<JournalEntry[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isMobile, setIsMobile] = useState(false)
  
  // Two-step modal
  const [showTitleMoodModal, setShowTitleMoodModal] = useState(false)
  const [tempTitle, setTempTitle] = useState('')
  const [tempMood, setTempMood] = useState('')
  
  // Editor
  const [showEditor, setShowEditor] = useState(false)
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null)
  const [editorTitle, setEditorTitle] = useState('')
  const [editorContent, setEditorContent] = useState('')
  const [editorMood, setEditorMood] = useState('')
  
  // Auto-save
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    loadEntries()
  }, [])

  useEffect(() => {
    filterEntries()
  }, [entries, searchQuery])

  // Auto-save effect
  useEffect(() => {
    if (!showEditor || !editorTitle.trim()) return

    const timer = setTimeout(() => {
      autoSave()
    }, 2000) // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(timer)
  }, [editorTitle, editorContent, editorMood, showEditor])

  const loadEntries = () => {
    const saved = localStorage.getItem('journal_entries')
    if (saved) {
      const parsed = JSON.parse(saved)
      setEntries(parsed)
    }
  }

  const saveEntries = (updatedEntries: JournalEntry[]) => {
    localStorage.setItem('journal_entries', JSON.stringify(updatedEntries))
    setEntries(updatedEntries)
  }

  const filterEntries = () => {
    if (!searchQuery.trim()) {
      setFilteredEntries(entries)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = entries.filter(entry => 
      entry.title.toLowerCase().includes(query) ||
      entry.content.toLowerCase().includes(query)
    )
    setFilteredEntries(filtered)
  }

  const startNewEntry = () => {
    setTempTitle('')
    setTempMood('')
    setShowTitleMoodModal(true)
  }

  const proceedToEditor = () => {
    if (!tempTitle.trim()) {
      alert('Please enter a title')
      return
    }

    setEditorTitle(tempTitle)
    setEditorMood(tempMood)
    setEditorContent('')
    setEditingEntry(null)
    setShowTitleMoodModal(false)
    setShowEditor(true)
  }

  const openExistingEntry = (entry: JournalEntry) => {
    setEditingEntry(entry)
    setEditorTitle(entry.title)
    setEditorContent(entry.content)
    setEditorMood(entry.mood || '')
    setShowEditor(true)
  }

  const autoSave = () => {
    if (!editorTitle.trim()) return

    setIsSaving(true)

    if (editingEntry) {
      // Update existing
      const updated = entries.map(entry =>
        entry.id === editingEntry.id
          ? { 
              ...entry, 
              title: editorTitle, 
              content: editorContent, 
              mood: editorMood, 
              updatedAt: new Date().toISOString() 
            }
          : entry
      )
      saveEntries(updated)
      
      // Update editing entry reference
      const updatedEntry = updated.find(e => e.id === editingEntry.id)
      if (updatedEntry) setEditingEntry(updatedEntry)
    } else {
      // Create new
      const newEntry: JournalEntry = {
        id: Date.now().toString(),
        title: editorTitle,
        content: editorContent,
        mood: editorMood,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      saveEntries([newEntry, ...entries])
      setEditingEntry(newEntry)
    }

    setLastSaved(new Date())
    setTimeout(() => setIsSaving(false), 500)
  }

  const closeEditor = () => {
    // Final save before closing
    if (editorTitle.trim()) {
      autoSave()
    }
    
    setShowEditor(false)
    setEditingEntry(null)
    setEditorTitle('')
    setEditorContent('')
    setEditorMood('')
    setLastSaved(null)
  }

  const deleteEntry = (id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return
    
    const updated = entries.filter(entry => entry.id !== id)
    saveEntries(updated)
    
    if (editingEntry?.id === id) {
      closeEditor()
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getWordCount = (text: string) => {
    return text.trim().split(/\s+/).filter(Boolean).length
  }

  const getMoodData = (moodValue: string) => {
    return moods.find(m => m.value === moodValue)
  }

  const handleTitleMoodKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      proceedToEditor()
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 sm:mb-8"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#4A6C6F]/20 to-[#4A6C6F]/10 backdrop-blur-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-[#4A6C6F]" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-serif font-medium text-[#2C2C2C]">
                Journal
              </h1>
              <p className="text-sm sm:text-base text-[#5F5F5F]">Write your thoughts and reflections</p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startNewEntry}
            className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-linear-to-r from-[#4A6C6F] to-[#4A6C6F]/80 text-white font-semibold shadow-xl flex items-center gap-2 text-sm sm:text-base"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            New Entry
          </motion.button>
        </div>
      </motion.div>

      {/* Stats & Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6 sm:mb-8 flex flex-col sm:flex-row gap-3 sm:gap-4"
      >
        {/* Stats */}
        <div className="flex gap-3 sm:gap-4">
          <div className="backdrop-blur-[40px] bg-white/40 border border-white/60 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 shadow-xl flex-1 sm:flex-none">
            <div className="flex items-center gap-2 sm:gap-3">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-[#4A6C6F]" />
              <div>
                <p className="text-xl sm:text-2xl font-bold text-[#2C2C2C]">{entries.length}</p>
                <p className="text-[10px] sm:text-xs text-[#5F5F5F]">Total Entries</p>
              </div>
            </div>
          </div>

          <div className="backdrop-blur-[40px] bg-white/40 border border-white/60 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 shadow-xl flex-1 sm:flex-none">
            <div className="flex items-center gap-2 sm:gap-3">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#D2691E]" />
              <div>
                <p className="text-xl sm:text-2xl font-bold text-[#2C2C2C]">
                  {entries.filter(e => {
                    const date = new Date(e.createdAt)
                    const today = new Date()
                    return date.toDateString() === today.toDateString()
                  }).length}
                </p>
                <p className="text-[10px] sm:text-xs text-[#5F5F5F]">Today</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-[#5F5F5F]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search entries..."
            className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-white/40 border border-white/60 backdrop-blur-xl text-sm sm:text-base text-[#2C2C2C] placeholder-[#5F5F5F] focus:outline-none focus:ring-2 focus:ring-[#4A6C6F]/50 transition-all"
          />
        </div>
      </motion.div>

      {/* Entries Grid */}
      {filteredEntries.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="backdrop-blur-[40px] bg-white/40 border border-white/60 rounded-2xl sm:rounded-[2rem] p-12 sm:p-20 shadow-2xl text-center"
        >
          <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 text-[#5F5F5F] mx-auto mb-4 opacity-50" />
          <h3 className="text-lg sm:text-xl font-semibold text-[#2C2C2C] mb-2">
            {searchQuery ? 'No entries found' : 'No journal entries yet'}
          </h3>
          <p className="text-sm sm:text-base text-[#5F5F5F] mb-6">
            {searchQuery ? 'Try a different search term' : 'Start writing your first entry'}
          </p>
          {!searchQuery && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startNewEntry}
              className="px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-linear-to-r from-[#4A6C6F] to-[#4A6C6F]/80 text-white font-semibold shadow-xl text-sm sm:text-base"
            >
              Create First Entry
            </motion.button>
          )}
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredEntries.map((entry, index) => {
            const moodData = entry.mood ? getMoodData(entry.mood) : null
            
            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => openExistingEntry(entry)}
                className="backdrop-blur-[40px] bg-white/40 border border-white/60 rounded-xl sm:rounded-2xl p-5 sm:p-6 shadow-xl hover:shadow-2xl transition-all cursor-pointer group"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg sm:text-xl font-semibold text-[#2C2C2C] mb-2 line-clamp-2 group-hover:text-[#4A6C6F] transition-colors">
                      {entry.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-[#5F5F5F]">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(entry.createdAt)}</span>
                      <Clock className="w-3 h-3 ml-1" />
                      <span>{formatTime(entry.createdAt)}</span>
                    </div>
                  </div>
                  {moodData && (
                    <div 
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center text-lg sm:text-xl flex-shrink-0 ml-2"
                      style={{ backgroundColor: `${moodData.color}20` }}
                    >
                      {moodData.emoji}
                    </div>
                  )}
                </div>

                {/* Preview */}
                <p className="text-xs sm:text-sm text-[#5F5F5F] line-clamp-3 mb-3 sm:mb-4">
                  {entry.content || 'No content yet...'}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between text-xs text-[#5F5F5F]">
                  <span>{getWordCount(entry.content)} words</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteEntry(entry.id)
                    }}
                    className="p-1.5 rounded-lg hover:bg-white/60 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D2691E]" />
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* STEP 1: Title + Mood Modal */}
      <AnimatePresence>
        {showTitleMoodModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setShowTitleMoodModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="backdrop-blur-[40px] bg-white/95 border border-white/60 rounded-2xl sm:rounded-[2rem] p-6 sm:p-8 shadow-2xl max-w-md w-full"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-[#2C2C2C]">New Entry</h2>
                <button
                  onClick={() => setShowTitleMoodModal(false)}
                  className="p-2 rounded-xl hover:bg-white/60 transition-colors"
                >
                  <X className="w-5 h-5 text-[#5F5F5F]" />
                </button>
              </div>

              {/* Title Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-[#5F5F5F] mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  onKeyPress={handleTitleMoodKeyPress}
                  placeholder="Give your entry a title..."
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl bg-white/60 border border-white/60 text-[#2C2C2C] placeholder-[#5F5F5F] focus:outline-none focus:ring-2 focus:ring-[#4A6C6F]/50 transition-all font-semibold text-base sm:text-lg"
                />
              </div>

              {/* Mood Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-[#5F5F5F] mb-3">
                  How are you feeling?
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {moods.map((mood) => (
                    <button
                      key={mood.value}
                      onClick={() => setTempMood(mood.value)}
                      className={`p-2.5 sm:p-3 rounded-xl transition-all ${
                        tempMood === mood.value
                          ? 'bg-white/80 border-2 shadow-lg'
                          : 'bg-white/40 border-2 border-transparent hover:bg-white/60'
                      }`}
                      style={{
                        borderColor: tempMood === mood.value ? mood.color : 'transparent'
                      }}
                    >
                      <div className="text-xl sm:text-2xl mb-1">{mood.emoji}</div>
                      <div className="text-[10px] sm:text-xs text-[#2C2C2C] font-medium">{mood.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Continue Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={proceedToEditor}
                disabled={!tempTitle.trim()}
                className="w-full py-3 rounded-xl bg-linear-to-r from-[#4A6C6F] to-[#4A6C6F]/80 text-white font-semibold shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Continue
                <ArrowLeft className="w-5 h-5 rotate-180" />
              </motion.button>
              
              <p className="text-xs text-[#5F5F5F] mt-3 text-center">
                Press Enter to continue
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* STEP 2: Apple Notes Editor */}
      <AnimatePresence>
        {showEditor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 z-50 ${isMobile ? 'bg-white' : 'bg-black/40 backdrop-blur-sm flex items-center justify-center p-4'}`}
          >
            {isMobile ? (
              // MOBILE: Full-screen Apple Notes style
              <div className="h-full flex flex-col bg-white">
                {/* Mobile Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <button
                    onClick={closeEditor}
                    className="flex items-center gap-2 text-[#007AFF] font-medium"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Back
                  </button>
                  
                  <div className="flex items-center gap-2">
                    {isSaving && (
                      <span className="text-xs text-gray-500">Saving...</span>
                    )}
                    {lastSaved && !isSaving && (
                      <span className="text-xs text-gray-500">
                        Saved {lastSaved.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                </div>

                {/* Mobile Title + Mood */}
                <div className="p-4 border-b border-gray-100">
                  <input
                    type="text"
                    value={editorTitle}
                    onChange={(e) => setEditorTitle(e.target.value)}
                    className="w-full text-3xl font-bold text-gray-900 placeholder-gray-400 focus:outline-none mb-2"
                    placeholder="Title"
                  />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                    
                    {editorMood && getMoodData(editorMood) && (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100">
                        <span className="text-lg">{getMoodData(editorMood)?.emoji}</span>
                        <span className="text-xs font-medium text-gray-700">{getMoodData(editorMood)?.label}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Mobile Content */}
                <div className="flex-1 overflow-y-auto">
                  <textarea
                    value={editorContent}
                    onChange={(e) => setEditorContent(e.target.value)}
                    placeholder="Start writing..."
                    className="w-full h-full p-4 text-base text-gray-900 placeholder-gray-400 focus:outline-none resize-none"
                    style={{ minHeight: '100%' }}
                  />
                </div>

                {/* Mobile Footer */}
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{getWordCount(editorContent)} words</span>
                    <span>{editorContent.length} characters</span>
                  </div>
                </div>
              </div>
            ) : (
              // DESKTOP: Large centered panel
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="backdrop-blur-[40px] bg-white/98 border border-white/60 rounded-[2rem] shadow-2xl w-[90%] max-w-4xl h-[85vh] flex flex-col overflow-hidden"
              >
                {/* Desktop Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={closeEditor}
                      className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-600" />
                    </button>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      {isSaving && (
                        <>
                          <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                          <span>Saving...</span>
                        </>
                      )}
                      {lastSaved && !isSaving && (
                        <>
                          <Check className="w-4 h-4 text-green-600" />
                          <span>Saved at {lastSaved.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {editorMood && getMoodData(editorMood) && (
                    <div 
                      className="flex items-center gap-2 px-4 py-2 rounded-xl"
                      style={{ backgroundColor: `${getMoodData(editorMood)?.color}15` }}
                    >
                      <span className="text-2xl">{getMoodData(editorMood)?.emoji}</span>
                      <span className="text-sm font-medium text-gray-700">{getMoodData(editorMood)?.label}</span>
                    </div>
                  )}
                </div>

                {/* Desktop Title */}
                <div className="px-12 pt-8 pb-4">
                  <input
                    type="text"
                    value={editorTitle}
                    onChange={(e) => setEditorTitle(e.target.value)}
                    className="w-full text-4xl font-bold text-gray-900 placeholder-gray-400 focus:outline-none"
                    placeholder="Title"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>

                {/* Desktop Content */}
                <div className="flex-1 overflow-y-auto px-12 pb-6">
                  <textarea
                    value={editorContent}
                    onChange={(e) => setEditorContent(e.target.value)}
                    placeholder="Start writing your thoughts..."
                    className="w-full h-full text-lg text-gray-800 placeholder-gray-400 focus:outline-none resize-none leading-relaxed"
                    style={{ minHeight: '100%' }}
                  />
                </div>

                {/* Desktop Footer */}
                <div className="px-12 py-4 border-t border-gray-200 bg-gray-50/50">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{getWordCount(editorContent)} words • {editorContent.length} characters</span>
                    <button
                      onClick={closeEditor}
                      className="px-6 py-2 rounded-xl bg-[#4A6C6F] text-white font-medium hover:bg-[#4A6C6F]/90 transition-colors"
                    >
                      Done
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}