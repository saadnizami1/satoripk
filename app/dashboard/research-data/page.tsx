'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Download, Lock, Shield, FileText } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ResearchDataPage() {
  const [password, setPassword]     = useState('')
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [error, setError]           = useState('')
  const [downloading, setDownloading] = useState<'mood' | 'stress' | null>(null)

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === 'YALEONEDAY') {
      setIsUnlocked(true)
      setError('')
    } else {
      setError('Incorrect password. Access denied.')
      setPassword('')
    }
  }

  const downloadCSV = async (type: 'mood' | 'stress') => {
    setDownloading(type)
    try {
      const viewName = type === 'mood' ? 'research_mood_complete' : 'research_stress_complete'
      const { data, error } = await supabase.from(viewName).select('*').order('date_logged', { ascending: false })

      if (error) throw error
      if (!data || data.length === 0) { alert('No data available yet.'); setDownloading(null); return }

      const headers = Object.keys(data[0])
      const csvContent = [
        headers.join(','),
        ...data.map(row =>
          headers.map(h => {
            const val = row[h]
            if (val === null || val === undefined) return ''
            if (typeof val === 'object') return `"${JSON.stringify(val).replace(/"/g, '""')}"`
            if (typeof val === 'string' && (val.includes(',') || val.includes('"') || val.includes('\n'))) return `"${val.replace(/"/g, '""')}"`
            return val
          }).join(',')
        )
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.setAttribute('href', URL.createObjectURL(blob))
      link.setAttribute('download', type === 'mood' ? 'satori_mood_data_2026.csv' : 'satori_stress_data_2026.csv')
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      console.error('Error downloading data:', err)
      alert('Error downloading data. Please try again.')
    } finally {
      setDownloading(null)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(45,212,191,0.12)' }}>
          <Shield className="w-5 h-5" style={{ color: '#2DD4BF' }} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-instrument), Georgia, serif', color: '#F1F5F9' }}>
            Research Data Repository
          </h1>
          <p className="text-xs" style={{ color: '#475569' }}>Transparency in mental health research</p>
        </div>
      </motion.div>

      {/* Privacy statement — always visible */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="rounded-2xl p-5"
        style={{ background: '#13161F', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <h2 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: '#F1F5F9' }}>
          <FileText className="w-4 h-4 shrink-0" style={{ color: '#2DD4BF' }} />
          Data Privacy and Research Ethics Statement
        </h2>
        <div className="space-y-3 text-sm leading-relaxed" style={{ color: '#94A3B8' }}>
          <p>
            All personally identifiable information collected through this platform is maintained under strict confidentiality protocols in accordance with research ethics guidelines and data protection regulations. Participant data is utilized exclusively for academic research purposes investigating the relationship between academic stress and psychological wellbeing among student populations in Pakistan.
          </p>
          <p>
            The datasets available for download include both qualitative and quantitative measures encompassing demographic variables, psychological assessments, and longitudinal tracking of mood states and stress indicators. All research conducted using this data adheres to principles of informed consent, voluntary participation, and the right to withdrawal as established during the onboarding process.
          </p>
          <p>
            Researchers interested in accessing deidentified quantitative data for secondary analysis or collaborative research initiatives may submit formal requests detailing their research objectives, methodological approach, and institutional review board approval status. For inquiries, please contact the principal investigator at <span style={{ color: '#2DD4BF' }}>saadnizami114@gmail.com</span>.
          </p>
          <p className="text-xs italic" style={{ color: '#475569' }}>
            Note: All data downloads include personally identifiable information and must be handled in accordance with applicable data protection regulations.
          </p>
        </div>
      </motion.div>

      {/* Password gate or download area */}
      {!isUnlocked ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl p-7 max-w-md mx-auto"
          style={{ background: '#13161F', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex justify-center mb-5">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #2DD4BF20, #818CF820)', border: '1px solid rgba(45,212,191,0.2)' }}>
              <Lock className="w-8 h-8" style={{ color: '#2DD4BF' }} />
            </div>
          </div>

          <h3 className="text-xl font-bold text-center mb-2" style={{ fontFamily: 'var(--font-instrument), Georgia, serif', color: '#F1F5F9' }}>
            Authorized Access Required
          </h3>
          <p className="text-sm text-center mb-6" style={{ color: '#475569' }}>
            Data downloads are restricted to authorized research personnel only
          </p>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#94A3B8' }}>Access Password</label>
              <input
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError('') }}
                placeholder="Enter password"
                required
                className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none"
                style={{ background: '#222638', border: '1px solid rgba(255,255,255,0.08)', color: '#F1F5F9' }}
              />
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -8, height: 0 }}
                  className="px-4 py-3 rounded-xl text-sm"
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444' }}
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-80"
              style={{ background: '#14B8A6' }}
            >
              Unlock Data Access
            </button>
          </form>
        </motion.div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { type: 'mood' as const,   title: 'Mood Tracking Data',  color: '#F97316', desc: 'Complete dataset including daily mood assessments, participant demographics, academic context, and baseline psychological measures.',  file: 'satori_mood_data_2026.csv' },
              { type: 'stress' as const, title: 'Academic Stress Data', color: '#2DD4BF', desc: 'Comprehensive dataset containing stress level indicators, study patterns, performance metrics, and associated demographic variables.', file: 'satori_stress_data_2026.csv' },
            ].map(({ type, title, color, desc, file }, i) => (
              <motion.div
                key={type}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.08 }}
                className="rounded-2xl p-5"
                style={{ background: '#13161F', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: `${color}15` }}>
                  <Download className="w-5 h-5" style={{ color }} />
                </div>
                <h3 className="text-base font-semibold mb-2" style={{ color: '#F1F5F9' }}>{title}</h3>
                <p className="text-sm leading-relaxed mb-5" style={{ color: '#94A3B8' }}>{desc}</p>
                <button
                  onClick={() => downloadCSV(type)}
                  disabled={downloading !== null}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-80"
                  style={{ background: color }}
                >
                  {downloading === type ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Downloading…
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Download {type === 'mood' ? 'Mood' : 'Stress'} Data
                    </>
                  )}
                </button>
                <p className="text-[10px] text-center mt-2" style={{ color: '#475569' }}>{file}</p>
              </motion.div>
            ))}
          </div>

          <p className="text-center text-xs" style={{ color: '#475569' }}>
            Data updated in real time · Handle with appropriate confidentiality protocols
          </p>
        </>
      )}
    </div>
  )
}
