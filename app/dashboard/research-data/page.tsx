'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// The password is checked and the data exported entirely server-side
// (/api/research-export); nothing sensitive ships in this bundle.
async function exportRequest(password: string, type: 'verify' | 'mood' | 'stress') {
  return fetch('/api/research-export', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password, type }),
  })
}

export default function ResearchDataPage() {
  const [password, setPassword]       = useState('')
  const [isUnlocked, setIsUnlocked]   = useState(false)
  const [checking, setChecking]       = useState(false)
  const [error, setError]             = useState('')
  const [downloading, setDownloading] = useState<'mood' | 'stress' | null>(null)

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setChecking(true)
    const res = await exportRequest(password, 'verify').catch(() => null)
    setChecking(false)
    if (res?.ok) {
      setIsUnlocked(true)
      setError('')
    } else {
      setError(res?.status === 403 ? 'INCORRECT PASSWORD. ACCESS DENIED.' : 'SOMETHING WENT WRONG. TRY AGAIN.')
      setPassword('')
    }
  }

  const downloadCSV = async (type: 'mood' | 'stress') => {
    setDownloading(type)
    try {
      const res = await exportRequest(password, type)
      if (res.status === 404) { alert('No data available yet.'); return }
      if (!res.ok) throw new Error(`Export failed (${res.status})`)
      const blob = await res.blob()
      const link = document.createElement('a')
      link.setAttribute('href', URL.createObjectURL(blob))
      link.setAttribute('download', type === 'mood' ? 'satori_mood_data.csv' : 'satori_stress_data.csv')
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
    <div style={{ maxWidth: 720 }}>

      {/* Header */}
      <div style={{ marginBottom: 8 }}>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: 'clamp(36px,5vw,56px)', color: 'var(--ink)',
          letterSpacing: '-0.03em', lineHeight: 1,
        }}>
          RESEARCH DATA
        </h1>
        <div style={{ borderTop: '1.5px solid var(--border)', marginTop: 8, marginBottom: 32 }} />
      </div>

      {/* Privacy statement */}
      <div style={{ border: '1.5px solid var(--border)', marginBottom: 32 }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.12em',
          padding: '9px 14px', borderBottom: '1px solid var(--border-2)',
        }}>
          DATA PRIVACY & RESEARCH ETHICS
        </div>
        <div style={{ padding: '18px 14px' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.72, marginBottom: 12 }}>
            All personally identifiable information is maintained under strict confidentiality protocols in
            accordance with research ethics guidelines. Participant data is used exclusively for academic
            research investigating academic stress and psychological wellbeing among student populations
            in Pakistan.
          </p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.72, marginBottom: 14 }}>
            Datasets include qualitative and quantitative measures: demographics, psychological assessments,
            and longitudinal mood and stress tracking. All research follows informed consent, voluntary
            participation, and right to withdrawal principles established during onboarding.
          </p>
          <div style={{ borderTop: '1px solid var(--border-2)', paddingTop: 12 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.08em' }}>
              PRINCIPAL INVESTIGATOR  ·  SAAD NIZAMI  ·  saadnizami114@gmail.com
            </span>
          </div>
        </div>
      </div>

      {/* Lock / Download */}
      {!isUnlocked ? (
        <div style={{ border: '1.5px solid var(--border)', padding: '32px 28px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.14em', marginBottom: 20 }}>
            AUTHORIZED ACCESS REQUIRED
          </div>
          <form onSubmit={handlePasswordSubmit}>
            <input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError('') }}
              placeholder="ACCESS PASSWORD"
              required
              style={{
                display: 'block', width: '100%', padding: '11px 14px', boxSizing: 'border-box',
                fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.08em',
                color: 'var(--ink)', background: 'var(--bg)',
                border: '1.5px solid var(--border)', outline: 'none', marginBottom: 10,
              }}
            />
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  style={{
                    fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.08em',
                    color: 'var(--accent)', padding: '6px 0', marginBottom: 10,
                  }}
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>
            <button
              type="submit"
              disabled={checking}
              className="br-btn br-btn-inv"
              style={{ width: '100%', padding: '12px', fontSize: 12, letterSpacing: '0.08em', cursor: checking ? 'wait' : 'pointer', opacity: checking ? 0.6 : 1 }}
            >
              {checking ? 'CHECKING…' : 'UNLOCK ACCESS →'}
            </button>
          </form>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {[
            {
              type: 'mood' as const,
              title: 'MOOD TRACKING DATA',
              desc: 'Daily mood assessments, participant demographics, academic context, and baseline psychological measures.',
              file: 'satori_mood_data.csv',
            },
            {
              type: 'stress' as const,
              title: 'ACADEMIC STRESS DATA',
              desc: 'Stress level indicators, study patterns, performance metrics, and associated demographic variables.',
              file: 'satori_stress_data.csv',
            },
          ].map(({ type, title, desc, file }) => (
            <div key={type} style={{ border: '1.5px solid var(--border)', padding: '20px' }}>
              <div style={{
                fontFamily: 'var(--font-display)', fontWeight: 800,
                fontSize: 14, color: 'var(--ink)', letterSpacing: '0.02em', marginBottom: 8,
              }}>
                {title}
              </div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.6, marginBottom: 18 }}>
                {desc}
              </p>
              <button
                onClick={() => downloadCSV(type)}
                disabled={downloading !== null}
                className="br-btn br-btn-inv"
                style={{
                  width: '100%', padding: '11px', fontSize: 11, letterSpacing: '0.08em',
                  opacity: downloading !== null ? 0.5 : 1,
                  cursor: downloading !== null ? 'not-allowed' : 'pointer',
                }}
              >
                {downloading === type ? 'DOWNLOADING…' : 'DOWNLOAD CSV →'}
              </button>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.04em', marginTop: 8 }}>
                {file}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
