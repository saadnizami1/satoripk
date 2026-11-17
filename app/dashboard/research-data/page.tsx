'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Download } from 'lucide-react'
import { PageHeader } from '@/components/app/PageHeader'
import { Pill } from '@/components/ui/kit'

// The password is checked and the data exported entirely server-side
// (/api/research-export); nothing sensitive ships in this bundle.
async function exportRequest(password: string, type: 'verify' | 'mood' | 'stress') {
  return fetch('/api/research-export', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password, type }),
  })
}

const SETS = [
  { type: 'mood' as const, title: 'Mood check-ins', file: 'satori_mood_data.csv',
    desc: 'Every mood check-in with its note, plus the participant’s age, gender, class, school, subjects, grades, tutoring and city.' },
  { type: 'stress' as const, title: 'Academic stress check-ins', file: 'satori_stress_data.csv',
    desc: 'Stress and performance ratings, study hours and the follow-up answers, with the same participant details.' },
]

export default function ResearchDataPage() {
  const [password, setPassword]       = useState('')
  const [isUnlocked, setIsUnlocked]   = useState(false)
  const [checking, setChecking]       = useState(false)
  const [error, setError]             = useState('')
  const [downloading, setDownloading] = useState<'mood' | 'stress' | null>(null)
  const [dlError, setDlError]         = useState('')

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setChecking(true)
    const res = await exportRequest(password, 'verify').catch(() => null)
    setChecking(false)
    if (res?.ok) {
      setIsUnlocked(true)
      setError('')
    } else {
      setError(res?.status === 403 ? "That password isn't right." : 'Something went wrong on our side. Try again in a moment.')
      setPassword('')
    }
  }

  const downloadCSV = async (type: 'mood' | 'stress') => {
    setDownloading(type); setDlError('')
    try {
      const res = await exportRequest(password, type)
      if (res.status === 404) { setDlError('There is no consented data in this set yet.'); return }
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
      setDlError("The download didn't start. Try again.")
    } finally {
      setDownloading(null)
    }
  }

  return (
    <div>
      <PageHeader lines={['for the', 'study team']} accent="study team" art="day" sticker="papers"
        lead="This page is for the researchers running the Satori study. Students don't need anything here." />

      <div className="page-narrow stack-lg">
        <section aria-labelledby="rd-what" className="sheet sheet--pad stack-sm">
          <h2 id="rd-what" className="section-title" style={{ margin: 0 }}>What these files contain</h2>
          <p className="t-body">
            Only students who said yes to research are included. The files identify them by name and email, so
            treat them as confidential: store them securely, share them with no one outside the approved study
            team, and remove names before publishing anything.
          </p>
          <p className="t-body muted">
            Journals and Kokoro chats are never part of the export. Students can leave the study at any time in
            Settings, and are then left out of every future export.
          </p>
          <p className="t-small muted">Principal investigator: Saad Nizami, <a className="link" href="mailto:saadnizami114@gmail.com">saadnizami114@gmail.com</a></p>
        </section>

        {!isUnlocked ? (
          <section aria-labelledby="rd-lock" className="sheet sheet--pad">
            <h2 id="rd-lock" className="section-title">Unlock the export</h2>
            <form className="stack" onSubmit={handlePasswordSubmit}>
              <div className="field">
                <label htmlFor="rd-pw" className="field__label">Study team password</label>
                <input id="rd-pw" type="password" className="input" autoComplete="off" required value={password}
                  onChange={e => { setPassword(e.target.value); setError('') }} aria-describedby={error ? 'rd-err' : undefined} />
                {error && <p id="rd-err" className="field__error" role="alert">{error}</p>}
              </div>
              <div><Pill type="submit" variant="tape" disabled={checking}>{checking ? 'Checking…' : 'Unlock'}</Pill></div>
            </form>
          </section>
        ) : (
          <section aria-label="Downloads" className="stack">
            {dlError && <div className="notice notice--error" role="alert">{dlError}</div>}
            <div className="grid-2">
              {SETS.map(({ type, title, desc, file }) => (
                <div key={type} className="sheet sheet--pad stack-sm">
                  <h2 className="t-h4">{title}</h2>
                  <p className="t-small muted">{desc}</p>
                  <div style={{ marginTop: 8 }}>
                    <Pill variant="tape" onClick={() => downloadCSV(type)} disabled={downloading !== null}>
                      <Download size={18} aria-hidden="true" /> {downloading === type ? 'Downloading…' : 'Download CSV'}
                    </Pill>
                  </div>
                  <p className="t-small faint">{file}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <p className="t-small muted">Looking for your own data? <Link href="/dashboard/settings" className="link">Download it from Settings</Link>.</p>
      </div>
    </div>
  )
}
