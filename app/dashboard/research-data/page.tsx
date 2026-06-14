'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Download, Lock, Shield, FileText } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ResearchDataPage() {
  const [password, setPassword] = useState('')
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [error, setError] = useState('')
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
      const { data, error } = await supabase
        .from(viewName)
        .select('*')
        .order('date_logged', { ascending: false })

      if (error) throw error

      if (!data || data.length === 0) {
        alert('No data available yet.')
        setDownloading(null)
        return
      }

      // Convert to CSV
      const headers = Object.keys(data[0])
      const csvContent = [
        headers.join(','),
        ...data.map(row => 
          headers.map(header => {
            const value = row[header]
            // Handle arrays, objects, and special characters
            if (value === null || value === undefined) return ''
            if (typeof value === 'object') return `"${JSON.stringify(value).replace(/"/g, '""')}"`
            if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
              return `"${value.replace(/"/g, '""')}"`
            }
            return value
          }).join(',')
        )
      ].join('\n')

      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
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
    <div className="min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto px-4 sm:px-6"
      >
        {/* Header */}
        <div className="backdrop-blur-[40px] bg-white/60 border border-white/60 rounded-xl sm:rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl mb-4 sm:mb-6">
          <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#D2691E] to-[#4A6C6F] flex items-center justify-center shadow-xl shrink-0">
              <Shield className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-[#2C2C2C]">
                Research Data Repository
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-[#5F5F5F]">
                Transparency in mental health research
              </p>
            </div>
          </div>
        </div>

        {/* Privacy Notice - ALWAYS VISIBLE */}
        <div className="backdrop-blur-[40px] bg-gradient-to-br from-[#4A6C6F]/20 to-white/40 border border-white/60 rounded-xl sm:rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-[#2C2C2C] mb-3 sm:mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-[#4A6C6F]" />
            Data Privacy and Research Ethics Statement
          </h2>
          <div className="space-y-3 sm:space-y-4 text-[#000000] text-sm sm:text-base leading-relaxed">
            <p>
              All personally identifiable information collected through this platform is maintained under strict confidentiality protocols in accordance with research ethics guidelines and data protection regulations. Participant data is utilized exclusively for academic research purposes investigating the relationship between academic stress and psychological wellbeing among student populations in Pakistan.
            </p>
            <p>
              The datasets available for download include both qualitative and quantitative measures encompassing demographic variables, psychological assessments, and longitudinal tracking of mood states and stress indicators. All research conducted using this data adheres to principles of informed consent, voluntary participation, and the right to withdrawal as established during the onboarding process.
            </p>
            <p>
              Researchers interested in accessing deidentified quantitative data for secondary analysis or collaborative research initiatives may submit formal requests detailing their research objectives, methodological approach, and institutional review board approval status. For inquiries regarding data access, research collaborations, or questions about study methodology, please contact the principal investigator at saadnizami114@gmail.com.
            </p>
            <p className="text-xs sm:text-sm text-[#5F5F5F]/80 italic">
              Note: All data downloads include personally identifiable information and must be handled in accordance with applicable data protection regulations and institutional research ethics policies.
            </p>
          </div>
        </div>

        {/* Password Protected Area */}
        {!isUnlocked ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="backdrop-blur-[40px] bg-white/60 border border-white/60 rounded-xl sm:rounded-2xl md:rounded-3xl p-6 sm:p-8 shadow-2xl"
          >
            <div className="flex justify-center mb-4 sm:mb-6">
              <div className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#D2691E] to-[#4A6C6F] flex items-center justify-center shadow-xl">
                <Lock className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 text-white" />
              </div>
            </div>

            <h3 className="text-2xl sm:text-2xl md:text-3xl font-serif font-bold text-[#2C2C2C] text-center mb-2">
              Authorized Access Required
            </h3>
            <p className="text-sm sm:text-base text-[#5F5F5F] text-center mb-6 sm:mb-8">
              Data downloads are restricted to authorized research personnel only
            </p>

            <form onSubmit={handlePasswordSubmit} className="space-y-4 sm:space-y-6 max-w-md mx-auto">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-[#5F5F5F] mb-2">
                  Access Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError('')
                  }}
                  className="w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-white/60 border border-white/60 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D2691E] focus:border-transparent text-sm sm:text-base text-[#2C2C2C] placeholder-[#5F5F5F]/50"
                  placeholder="Enter password"
                  required
                />
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-xl text-sm"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                className="w-full px-4 py-2.5 sm:px-6 sm:py-3 bg-linear-to-r from-[#D2691E] to-[#4A6C6F] text-white rounded-lg sm:rounded-xl text-sm sm:text-base font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
              >
                Unlock Data Access
              </button>
            </form>
          </motion.div>
        ) : (
          <>
            {/* Download Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
              {/* Mood Data */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="backdrop-blur-[40px] bg-white/60 border border-white/60 rounded-xl sm:rounded-2xl md:rounded-3xl p-5 sm:p-6 md:p-8 shadow-2xl"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-gradient-to-br from-[#D2691E] to-[#D2691E]/80 flex items-center justify-center mb-4 sm:mb-6 shadow-lg">
                  <Download className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-[#2C2C2C] mb-2 sm:mb-3">
                  Mood Tracking Data
                </h3>
                <p className="text-xs sm:text-sm md:text-base text-[#5F5F5F] mb-4 sm:mb-6 leading-relaxed">
                  Complete dataset including daily mood assessments, participant demographics, academic context, and baseline psychological measures.
                </p>
                <button
                  onClick={() => downloadCSV('mood')}
                  disabled={downloading !== null}
                  className="w-full px-4 py-2.5 sm:px-6 sm:py-3 bg-linear-to-r from-[#D2691E] to-[#D2691E]/80 text-white rounded-lg sm:rounded-xl text-sm sm:text-base font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {downloading === 'mood' ? (
                    <>
                      <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                      Download Mood Data
                    </>
                  )}
                </button>
                <p className="text-[10px] sm:text-xs text-[#5F5F5F] mt-2 sm:mt-3 text-center">
                  satori_mood_data_2026.csv
                </p>
              </motion.div>

              {/* Academic Stress Data */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.02 }}
                className="backdrop-blur-[40px] bg-white/60 border border-white/60 rounded-xl sm:rounded-2xl md:rounded-3xl p-5 sm:p-6 md:p-8 shadow-2xl"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-gradient-to-br from-[#4A6C6F] to-[#4A6C6F]/80 flex items-center justify-center mb-4 sm:mb-6 shadow-lg">
                  <Download className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-[#2C2C2C] mb-2 sm:mb-3">
                  Academic Stress Data
                </h3>
                <p className="text-xs sm:text-sm md:text-base text-[#5F5F5F] mb-4 sm:mb-6 leading-relaxed">
                  Comprehensive dataset containing stress level indicators, study patterns, performance metrics, and associated demographic variables.
                </p>
                <button
                  onClick={() => downloadCSV('stress')}
                  disabled={downloading !== null}
                  className="w-full px-4 py-2.5 sm:px-6 sm:py-3 bg-linear-to-r from-[#4A6C6F] to-[#4A6C6F]/80 text-white rounded-lg sm:rounded-xl text-sm sm:text-base font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {downloading === 'stress' ? (
                    <>
                      <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                      Download Stress Data
                    </>
                  )}
                </button>
                <p className="text-[10px] sm:text-xs text-[#5F5F5F] mt-2 sm:mt-3 text-center">
                  satori_stress_data_2026.csv
                </p>
              </motion.div>
            </div>

            {/* Footer Note */}
            <div className="text-center text-xs sm:text-sm text-[#5F5F5F]">
              <p>Data updated in real time • Handle with appropriate confidentiality protocols</p>
            </div>
          </>
        )}
      </motion.div>
    </div>
  )
}