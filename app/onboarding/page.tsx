'use client'

import { useState, useEffect, type CSSProperties, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import type { AuthChangeEvent } from '@supabase/supabase-js'

const ONBOARDING_STEPS = [
  'welcome', 'privacy', 'research', 'name', 'age', 'religion', 'city',
  'school-type', 'school-name', 'education-level', 'hobbies', 'personality',
  'recent-mood', 'academic-stress', 'fav-subject', 'fav-why',
  'worst-subject', 'worst-why', 'report-card', 'tutoring', 'cheating',
  'research-participation', 'intermission', 'kokoro', 'success',
]

// ── Shared style helpers ──────────────────────────────────────────
const H: CSSProperties = {
  fontFamily: 'var(--font-display)', fontWeight: 800,
  fontSize: 'clamp(22px,3.5vw,32px)', color: 'var(--ink)',
  letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 8,
}
const SUB: CSSProperties = {
  fontFamily: 'var(--font-body)', fontSize: 14,
  color: 'var(--ink-3)', marginBottom: 24, lineHeight: 1.5,
}
const optStyle = (selected: boolean): CSSProperties => ({
  padding: '11px 8px',
  textAlign: 'center',
  background: selected ? 'var(--bg-invert)' : 'var(--bg)',
  color: selected ? 'var(--ink-invert)' : 'var(--ink)',
  border: '1.5px solid var(--border)',
  fontFamily: 'var(--font-display)',
  fontWeight: 700,
  fontSize: 11,
  letterSpacing: '0.04em',
  cursor: 'pointer',
  transition: 'background 80ms, color 80ms',
  lineHeight: 1.3,
})
const INPUT_STYLE: CSSProperties = {
  width: '100%', padding: '13px 14px',
  fontSize: 15, boxSizing: 'border-box', marginBottom: 20,
}
const MONO_LABEL: CSSProperties = {
  display: 'block', fontFamily: 'var(--font-mono)',
  fontSize: 10, letterSpacing: '0.12em', color: 'var(--ink-3)', marginBottom: 8,
}

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [userData, setUserData] = useState({
    name: '',
    age: '',
    religion: '',
    city: '',
    school_type: '',
    school_name: '',
    education_board: '',
    education_level: '',
    hobbies: [] as string[],
    personality_traits: [] as string[],
    recent_mood: 0,
    academic_stress: 0,
    stress_is_academic: '',
    favorite_subject: '',
    favorite_subject_why: '',
    worst_subject: '',
    worst_subject_why: '',
    report_card_average: '',
    has_tutoring: '',
    has_cheated: '',
    previous_research: '',
    agreedToPolicies: false,
    agreedToResearch: false,
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        await new Promise(resolve => setTimeout(resolve, 500))
        const { data: { session: retry } } = await supabase.auth.getSession()
        if (!retry) router.push('/auth')
      }
    }
    checkAuth()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session) => {
      if (!session) router.push('/auth')
    })
    return () => subscription.unsubscribe()
  }, [router])

  const nextStep = () => {
    if (ONBOARDING_STEPS[currentStep] === 'academic-stress' && userData.recent_mood > 3) {
      setCurrentStep(s => s + 2)
    } else if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(s => s + 1)
    }
  }
  const prevStep = () => { if (currentStep > 0) setCurrentStep(s => s - 1) }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        name: userData.name,
        age: parseInt(userData.age),
        religion: userData.religion,
        city: userData.city,
        location: userData.city,
        school_type: userData.school_type,
        school_name: userData.school_name,
        education_board: userData.education_board,
        education_level: userData.education_level,
        hobbies: userData.hobbies,
        personality_traits: userData.personality_traits,
        recent_mood: userData.recent_mood,
        academic_stress: userData.academic_stress,
        stress_is_academic: userData.stress_is_academic,
        favorite_subject: userData.favorite_subject,
        favorite_subject_why: userData.favorite_subject_why,
        worst_subject: userData.worst_subject,
        worst_subject_why: userData.worst_subject_why,
        report_card_average: userData.report_card_average,
        has_tutoring: userData.has_tutoring,
        has_cheated: userData.has_cheated,
        previous_research: userData.previous_research,
        onboarding_completed: true,
        language: 'en',
        updated_at: new Date().toISOString(),
      })
      if (error) throw error

      // Link onboarding mood to the moods tracking table
      if (userData.recent_mood > 0) {
        await supabase.from('moods').insert({
          user_id: user.id,
          mood_score: userData.recent_mood,
          note: 'Onboarding baseline',
        })
      }

      // Link onboarding stress to the academic_stress tracking table
      if (userData.academic_stress > 0) {
        const perfMap: Record<string, number> = {
          'excellent': 5, 'very-good': 4, 'good': 3,
          'satisfactory': 2, 'needs-improvement': 1, 'varies': 3,
        }
        await supabase.from('academic_stress').insert({
          user_id: user.id,
          stress_level: userData.academic_stress,
          performance_rating: perfMap[userData.report_card_average] ?? 3,
        })
      }

      nextStep()
    } catch (err) {
      console.error('Error saving profile:', err)
      alert('Error saving your information. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const update = (key: string, value: any) => setUserData(prev => ({ ...prev, [key]: value }))
  const step = ONBOARDING_STEPS[currentStep]
  const total = ONBOARDING_STEPS.length

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ── Fixed progress header ── */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: 'var(--bg)', borderBottom: '1.5px solid var(--border)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 clamp(16px,4vw,32px)', height: 52,
        }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 14, color: 'var(--ink)', letterSpacing: '-0.01em' }}>
            SATORI
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.12em' }}>
            {String(currentStep + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </span>
        </div>
        <div style={{ height: 2, background: 'var(--border-2)' }}>
          <div style={{
            height: '100%', background: 'var(--ink)',
            width: `${((currentStep + 1) / total) * 100}%`,
            transition: 'width 300ms ease',
          }} />
        </div>
      </header>

      {/* ── Content ── */}
      <div style={{
        minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 'clamp(80px,10vw,96px) clamp(16px,4vw,32px) 40px',
      }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.2, ease: [0.25, 0, 0, 1] }}
            style={{ width: '100%', maxWidth: 600 }}
          >
            {step === 'welcome' && <WelcomeStep nextStep={nextStep} />}
            {step === 'privacy' && <PrivacyStep agreed={userData.agreedToPolicies} onAgree={v => update('agreedToPolicies', v)} nextStep={nextStep} prevStep={prevStep} />}
            {step === 'research' && <ResearchStep agreed={userData.agreedToResearch} onAgree={v => update('agreedToResearch', v)} nextStep={nextStep} prevStep={prevStep} />}
            {step === 'name' && <NameStep value={userData.name} onChange={v => update('name', v)} nextStep={nextStep} prevStep={prevStep} />}
            {step === 'age' && <AgeStep value={userData.age} onChange={v => update('age', v)} nextStep={nextStep} prevStep={prevStep} />}
            {step === 'religion' && <ReligionStep value={userData.religion} onChange={v => update('religion', v)} nextStep={nextStep} prevStep={prevStep} />}
            {step === 'city' && <CityStep value={userData.city} onChange={v => update('city', v)} nextStep={nextStep} prevStep={prevStep} />}
            {step === 'school-type' && <SchoolTypeStep value={userData.school_type} onChange={v => update('school_type', v)} nextStep={nextStep} prevStep={prevStep} />}
            {step === 'school-name' && <SchoolNameStep value={userData.school_name} onChange={v => update('school_name', v)} nextStep={nextStep} prevStep={prevStep} />}
            {step === 'education-level' && <EducationLevelStep boardValue={userData.education_board} levelValue={userData.education_level} onBoardChange={v => update('education_board', v)} onLevelChange={v => update('education_level', v)} nextStep={nextStep} prevStep={prevStep} />}
            {step === 'hobbies' && <HobbiesStep value={userData.hobbies} onChange={v => update('hobbies', v)} nextStep={nextStep} prevStep={prevStep} />}
            {step === 'personality' && <PersonalityStep value={userData.personality_traits} onChange={v => update('personality_traits', v)} nextStep={nextStep} prevStep={prevStep} />}
            {step === 'recent-mood' && <RecentMoodStep value={userData.recent_mood} onChange={v => update('recent_mood', v)} nextStep={nextStep} prevStep={prevStep} />}
            {step === 'academic-stress' && <AcademicStressStep value={userData.academic_stress} moodValue={userData.recent_mood} stressIsAcademic={userData.stress_is_academic} onChange={v => update('academic_stress', v)} onStressChange={v => update('stress_is_academic', v)} nextStep={nextStep} prevStep={prevStep} />}
            {step === 'fav-subject' && <FavoriteSubjectStep value={userData.favorite_subject} onChange={v => update('favorite_subject', v)} nextStep={nextStep} prevStep={prevStep} />}
            {step === 'fav-why' && <SubjectWhyStep type="favorite" subject={userData.favorite_subject} value={userData.favorite_subject_why} onChange={v => update('favorite_subject_why', v)} nextStep={nextStep} prevStep={prevStep} />}
            {step === 'worst-subject' && <WorstSubjectStep value={userData.worst_subject} onChange={v => update('worst_subject', v)} nextStep={nextStep} prevStep={prevStep} />}
            {step === 'worst-why' && <SubjectWhyStep type="worst" subject={userData.worst_subject} value={userData.worst_subject_why} onChange={v => update('worst_subject_why', v)} nextStep={nextStep} prevStep={prevStep} />}
            {step === 'report-card' && <ReportCardStep value={userData.report_card_average} onChange={v => update('report_card_average', v)} nextStep={nextStep} prevStep={prevStep} />}
            {step === 'tutoring' && <TutoringStep value={userData.has_tutoring} onChange={v => update('has_tutoring', v)} nextStep={nextStep} prevStep={prevStep} />}
            {step === 'cheating' && <CheatingStep value={userData.has_cheated} onChange={v => update('has_cheated', v)} nextStep={nextStep} prevStep={prevStep} />}
            {step === 'research-participation' && <ResearchParticipationStep value={userData.previous_research} onChange={v => update('previous_research', v)} nextStep={nextStep} prevStep={prevStep} />}
            {step === 'intermission' && <IntermissionStep nextStep={nextStep} prevStep={prevStep} />}
            {step === 'kokoro' && <KokoroStep onFinish={handleSubmit} prevStep={prevStep} loading={loading} />}
            {step === 'success' && <SuccessStep router={router} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

// ── Reusable shell components ─────────────────────────────────────

function BCard({ children }: { children: ReactNode }) {
  return (
    <div style={{ border: '1.5px solid var(--border)', padding: 'clamp(24px,5vw,40px)', background: 'var(--bg)' }}>
      {children}
    </div>
  )
}

function NavBtns({ onNext, onBack, nextDisabled }: { onNext: () => void; onBack: () => void; nextDisabled: boolean }) {
  return (
    <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
      <button
        onClick={onBack}
        className="br-btn"
        style={{ padding: '12px 20px', color: 'var(--ink-2)', fontSize: 12, letterSpacing: '0.06em' }}
      >
        ← BACK
      </button>
      <button
        onClick={onNext}
        disabled={nextDisabled}
        className="br-btn br-btn-inv"
        style={{ flex: 1, padding: '12px 20px', fontSize: 12, letterSpacing: '0.06em', opacity: nextDisabled ? 0.38 : 1, cursor: nextDisabled ? 'not-allowed' : 'pointer' }}
      >
        NEXT →
      </button>
    </div>
  )
}

// ── Step components ───────────────────────────────────────────────

function WelcomeStep({ nextStep }: { nextStep: () => void }) {
  return (
    <BCard>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.14em', marginBottom: 16 }}>
          MENTAL WELLNESS RESEARCH PLATFORM
        </div>
        <h1 style={{ ...H, fontSize: 'clamp(28px,5vw,44px)', marginBottom: 20 }}>
          Welcome to Satori.
        </h1>
        <p style={{ ...SUB, marginBottom: 12 }}>
          We&apos;re honored to have you here. This questionnaire will help us understand you better and provide personalized mental wellness support.
        </p>
        <p style={{ ...SUB, marginBottom: 12 }}>
          Your responses are confidential and used solely for research purposes to improve mental health services for students in Pakistan.
        </p>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-2)', letterSpacing: '0.08em' }}>
          TAKES 10–15 MINUTES TO COMPLETE.
        </p>
      </div>
      <button
        onClick={nextStep}
        className="br-btn br-btn-inv"
        style={{ padding: '14px 28px', fontSize: 13, letterSpacing: '0.06em' }}
      >
        BEGIN ONBOARDING →
      </button>
    </BCard>
  )
}

function PrivacyStep({ agreed, onAgree, nextStep, prevStep }: any) {
  return (
    <BCard>
      <h2 style={H}>Privacy Policy &amp; Terms</h2>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.1em', marginBottom: 20 }}>
        READ BEFORE CONTINUING
      </div>

      <div style={{ maxHeight: 300, overflowY: 'auto', marginBottom: 20, paddingRight: 8 }}>
        {[
          { title: '1. Data Collection & Usage', body: 'We collect personal information including your name, age, educational background, hobbies, personality traits, mood patterns, and academic performance data. This information is used exclusively to provide personalized mental wellness support, analyze patterns in student mental health, and improve our services.' },
          { title: '2. Data Security & Confidentiality', body: 'All data is encrypted using industry-standard AES-256 encryption. Your conversations with Kokoro are completely private and confidential. We never share your personal information with third parties without explicit consent.' },
          { title: '3. Your Rights', body: 'You have the right to access all your personal data at any time. You can request deletion of your account and all associated data, and opt out of research participation while continuing to use the service.' },
          { title: '4. Age Restrictions', body: 'Users must be between 3 and 99 years old to use this service. For users under 18, we recommend parental guidance when using mental health services.' },
          { title: '5. Limitation of Services', body: 'Satori is designed to provide support and guidance for mental wellness. It is not a substitute for professional mental health care. In emergencies, please contact a licensed mental health professional or emergency services immediately.' },
        ].map(s => (
          <div key={s.title} style={{ marginBottom: 16 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12, color: 'var(--ink)', letterSpacing: '0.04em', marginBottom: 6 }}>{s.title}</div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.6 }}>{s.body}</p>
          </div>
        ))}
      </div>

      <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 4, cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={agreed}
          onChange={e => onAgree(e.target.checked)}
          style={{ marginTop: 3, width: 16, height: 16, cursor: 'pointer', flexShrink: 0, accentColor: 'var(--ink)' }}
        />
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.5 }}>
          I have read and agree to the privacy policy and terms of service.
        </span>
      </label>

      <NavBtns onNext={nextStep} onBack={prevStep} nextDisabled={!agreed} />
    </BCard>
  )
}

function ResearchStep({ agreed, onAgree, nextStep, prevStep }: any) {
  return (
    <BCard>
      <h2 style={H}>Research Participation</h2>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.1em', marginBottom: 20 }}>
        VOLUNTARY CONSENT
      </div>

      <div style={{ maxHeight: 300, overflowY: 'auto', marginBottom: 20, paddingRight: 8 }}>
        {[
          { title: 'Purpose of Research', body: 'This research aims to understand the relationship between academic stress and mental wellness among students in Pakistan. Your participation will contribute to developing better support systems for student mental health.' },
          { title: 'How Your Data Will Be Used', body: 'Your personal data will be anonymized before being used in research studies. We will analyze trends in mood, academic stress, and study habits. Research findings will directly improve Kokoro\'s ability to provide personalized mental health support.' },
          { title: 'Your Rights as a Research Participant', body: 'Participation is completely voluntary. You can withdraw from the research at any time without affecting your access to Satori. You can request that your data be excluded from research while still using the service.' },
          { title: 'Questions or Concerns?', body: 'If you have any questions about the research or wish to exercise any of your rights, please contact us at saadnizami114@gmail.com' },
        ].map(s => (
          <div key={s.title} style={{ marginBottom: 16 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12, color: 'var(--ink)', letterSpacing: '0.04em', marginBottom: 6 }}>{s.title}</div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.6 }}>{s.body}</p>
          </div>
        ))}
      </div>

      <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 4, cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={agreed}
          onChange={e => onAgree(e.target.checked)}
          style={{ marginTop: 3, width: 16, height: 16, cursor: 'pointer', flexShrink: 0, accentColor: 'var(--ink)' }}
        />
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.5 }}>
          I voluntarily consent to participate in this research study and understand I can withdraw at any time.
        </span>
      </label>

      <NavBtns onNext={nextStep} onBack={prevStep} nextDisabled={!agreed} />
    </BCard>
  )
}

function NameStep({ value, onChange, nextStep, prevStep }: any) {
  return (
    <BCard>
      <h2 style={H}>What&apos;s your name?</h2>
      <p style={SUB}>This helps us personalize your experience with Kokoro.</p>
      <label style={MONO_LABEL}>FULL NAME</label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Enter your full name"
        className="br-input"
        style={INPUT_STYLE}
        autoFocus
      />
      <NavBtns onNext={nextStep} onBack={prevStep} nextDisabled={!value.trim()} />
    </BCard>
  )
}

function AgeStep({ value, onChange, nextStep, prevStep }: any) {
  return (
    <BCard>
      <h2 style={H}>How old are you?</h2>
      <p style={SUB}>Enter your current age.</p>
      <label style={MONO_LABEL}>AGE</label>
      <input
        type="number"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="e.g. 17"
        min="3"
        max="99"
        className="br-input"
        style={INPUT_STYLE}
      />
      <NavBtns onNext={nextStep} onBack={prevStep} nextDisabled={!value || parseInt(value) < 3 || parseInt(value) > 99} />
    </BCard>
  )
}

function ReligionStep({ value, onChange, nextStep, prevStep }: any) {
  const options = ['Islam', 'Christianity', 'Hinduism', 'Buddhism', 'Sikhism', 'Atheism', 'Other', 'Prefer not to say']
  return (
    <BCard>
      <h2 style={H}>Your Religion</h2>
      <p style={SUB}>Helps us provide culturally sensitive support.</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 4 }}>
        {options.map(r => (
          <button key={r} onClick={() => onChange(r)} style={optStyle(value === r)}>{r}</button>
        ))}
      </div>
      <NavBtns onNext={nextStep} onBack={prevStep} nextDisabled={!value} />
    </BCard>
  )
}

function CityStep({ value, onChange, nextStep, prevStep }: any) {
  const cities = [
    'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad',
    'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala',
    'Hyderabad', 'Abbottabad', 'Bahawalpur', 'Sargodha', 'Sukkur',
    'Larkana', 'Sheikhupura', 'Rahim Yar Khan', 'Jhang', 'Dera Ghazi Khan',
    'Gujrat', 'Sahiwal', 'Wah Cantonment', 'Mardan', 'Kasur', 'Other',
  ]
  return (
    <BCard>
      <h2 style={H}>Which city do you live in?</h2>
      <p style={SUB}>Select your city from the list below.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6, marginBottom: 4, maxHeight: 320, overflowY: 'auto', paddingRight: 4 }}>
        {cities.map(c => (
          <button key={c} onClick={() => onChange(c)} style={optStyle(value === c)}>{c}</button>
        ))}
      </div>
      <NavBtns onNext={nextStep} onBack={prevStep} nextDisabled={!value} />
    </BCard>
  )
}

function SchoolTypeStep({ value, onChange, nextStep, prevStep }: any) {
  const types = [
    { id: 'private', name: 'Private School' },
    { id: 'public', name: 'Government / Public' },
    { id: 'islamic', name: 'Islamic / Madrasa' },
    { id: 'homeschool', name: 'Homeschool' },
  ]
  return (
    <BCard>
      <h2 style={H}>Type of School</h2>
      <p style={SUB}>What type of educational institution do you attend?</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 4 }}>
        {types.map(t => (
          <button key={t.id} onClick={() => onChange(t.id)} style={optStyle(value === t.id)}>{t.name}</button>
        ))}
      </div>
      <NavBtns onNext={nextStep} onBack={prevStep} nextDisabled={!value} />
    </BCard>
  )
}

function SchoolNameStep({ value, onChange, nextStep, prevStep }: any) {
  return (
    <BCard>
      <h2 style={H}>School Name</h2>
      <p style={SUB}>What&apos;s the name of your school or institution?</p>
      <label style={MONO_LABEL}>SCHOOL / INSTITUTION</label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="e.g. Lahore Grammar School"
        className="br-input"
        style={INPUT_STYLE}
      />
      <NavBtns onNext={nextStep} onBack={prevStep} nextDisabled={!value.trim()} />
    </BCard>
  )
}

function EducationLevelStep({ boardValue, levelValue, onBoardChange, onLevelChange, nextStep, prevStep }: any) {
  const boards = [
    { id: 'primary-middle', name: 'Primary / Middle', levels: ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8'] },
    { id: 'matric', name: 'Matric', levels: ['Class 9', 'Class 10'] },
    { id: 'fsc', name: 'FSC / Intermediate', levels: ['Class 11 (1st Year)', 'Class 12 (2nd Year)'] },
    { id: 'olevels', name: 'O-Levels', levels: ['O-Level Year 1', 'O-Level Year 2', 'O-Level Year 3'] },
    { id: 'alevels', name: 'A-Levels', levels: ['A-Level Year 1 (AS)', 'A-Level Year 2 (A2)'] },
    { id: 'bachelors', name: 'Bachelors / University', levels: ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'] },
  ]
  const selected = boards.find(b => b.id === boardValue)
  return (
    <BCard>
      <h2 style={H}>Education Level</h2>
      <p style={SUB}>Select your board and current year.</p>
      <label style={MONO_LABEL}>EDUCATIONAL BOARD / SYSTEM</label>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 20 }}>
        {boards.map(b => (
          <button key={b.id} onClick={() => { onBoardChange(b.id); onLevelChange('') }} style={optStyle(boardValue === b.id)}>{b.name}</button>
        ))}
      </div>
      {selected && (
        <>
          <label style={MONO_LABEL}>CURRENT CLASS / LEVEL</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginBottom: 4, maxHeight: 200, overflowY: 'auto', paddingRight: 4 }}>
            {selected.levels.map(l => (
              <button key={l} onClick={() => onLevelChange(l)} style={optStyle(levelValue === l)}>{l}</button>
            ))}
          </div>
        </>
      )}
      <NavBtns onNext={nextStep} onBack={prevStep} nextDisabled={!boardValue || !levelValue} />
    </BCard>
  )
}

function HobbiesStep({ value, onChange, nextStep, prevStep }: any) {
  const hobbies = [
    'Drawing/Painting', 'Writing', 'Photography', 'Calligraphy', 'Crafts',
    'Singing', 'Playing Instrument', 'Music Production', 'Listening to Music',
    'Cricket', 'Football', 'Basketball', 'Badminton', 'Swimming', 'Cycling',
    'Running', 'Gym/Fitness', 'Martial Arts', 'Yoga',
    'Video Gaming', 'PC Gaming', 'Mobile Gaming', 'Coding/Programming',
    'Web Design', 'Robotics', 'Reading Books', 'Poetry', 'Debating',
    'Science Experiments', 'Chess', 'Puzzles', 'Watching Movies',
    'Watching Drama/Series', 'Social Media', 'YouTube', 'Making Videos',
    'Blogging', 'Cooking', 'Baking', 'Food Blogging', 'Gardening',
    'Bird Watching', 'Pet Care', 'Traveling', 'Hiking', 'Quran Recitation',
    'Islamic Studies', 'Volunteering', 'Community Service', 'Fashion Design',
    'Makeup', 'Styling', 'Collecting', 'Organizing', 'Journaling',
    'Acting', 'Dancing', 'Public Speaking', 'Other',
  ]
  const toggle = (h: string) => onChange(value.includes(h) ? value.filter((x: string) => x !== h) : [...value, h])
  return (
    <BCard>
      <h2 style={H}>Your Hobbies &amp; Interests</h2>
      <p style={SUB}>Select all that apply — at least 1.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6, marginBottom: 12, maxHeight: 320, overflowY: 'auto', paddingRight: 4 }}>
        {hobbies.map(h => (
          <button key={h} onClick={() => toggle(h)} style={optStyle(value.includes(h))}>{h}</button>
        ))}
      </div>
      {value.length > 0 && (
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.1em', marginBottom: 4 }}>
          {value.length} SELECTED
        </div>
      )}
      <NavBtns onNext={nextStep} onBack={prevStep} nextDisabled={value.length === 0} />
    </BCard>
  )
}

function PersonalityStep({ value, onChange, nextStep, prevStep }: any) {
  const traits = [
    'Introverted', 'Extroverted', 'Analytical', 'Creative',
    'Organized', 'Spontaneous', 'Empathetic', 'Logical',
    'Optimistic', 'Realistic', 'Ambitious', 'Relaxed',
    'Confident', 'Humble', 'Independent', 'Team Player',
    'Adventurous', 'Cautious', 'Outgoing', 'Reserved',
    'Leader', 'Follower', 'Perfectionist', 'Flexible',
  ]
  const toggle = (t: string) => onChange(value.includes(t) ? value.filter((x: string) => x !== t) : [...value, t])
  return (
    <BCard>
      <h2 style={H}>Your Personality</h2>
      <p style={SUB}>Choose traits that describe you — select at least 3.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6, marginBottom: 12 }}>
        {traits.map(t => (
          <button key={t} onClick={() => toggle(t)} style={optStyle(value.includes(t))}>{t}</button>
        ))}
      </div>
      {value.length > 0 && (
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.1em', marginBottom: 4 }}>
          {value.length} SELECTED
        </div>
      )}
      <NavBtns onNext={nextStep} onBack={prevStep} nextDisabled={value.length < 3} />
    </BCard>
  )
}

function RecentMoodStep({ value, onChange, nextStep, prevStep }: any) {
  const moods = [
    { value: 1, label: 'VERY BAD' },
    { value: 2, label: 'BAD' },
    { value: 3, label: 'NEUTRAL' },
    { value: 4, label: 'GOOD' },
    { value: 5, label: 'VERY GOOD' },
  ]
  return (
    <BCard>
      <h2 style={H}>How have you been feeling lately?</h2>
      <p style={SUB}>Rate your mood over the past few days.</p>
      <div style={{ display: 'flex', border: '1.5px solid var(--border)', marginBottom: 4 }}>
        {moods.map((m, i) => (
          <button
            key={m.value}
            onClick={() => onChange(m.value)}
            style={{
              flex: 1,
              padding: 'clamp(14px,3vw,20px) clamp(4px,1vw,8px)',
              textAlign: 'center',
              background: value === m.value ? 'var(--bg-invert)' : 'var(--bg)',
              color: value === m.value ? 'var(--ink-invert)' : 'var(--ink)',
              border: 'none',
              borderRight: i < moods.length - 1 ? '1.5px solid var(--border)' : 'none',
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: 'clamp(9px,1.8vw,12px)',
              letterSpacing: '0.04em',
              cursor: 'pointer',
              transition: 'background 80ms, color 80ms',
            }}
          >
            {m.label}
          </button>
        ))}
      </div>
      <NavBtns onNext={nextStep} onBack={prevStep} nextDisabled={value === 0} />
    </BCard>
  )
}

function AcademicStressStep({ value, moodValue, stressIsAcademic, onChange, onStressChange, nextStep, prevStep }: any) {
  const levels = [
    { value: 1, label: 'VERY LOW' },
    { value: 2, label: 'LOW' },
    { value: 3, label: 'MODERATE' },
    { value: 4, label: 'HIGH' },
    { value: 5, label: 'VERY HIGH' },
  ]
  const showQ = moodValue <= 3
  return (
    <BCard>
      <h2 style={H}>Academic Stress Level</h2>
      <p style={SUB}>How stressed do you feel about your studies?</p>
      <div style={{ display: 'flex', border: '1.5px solid var(--border)', marginBottom: 20 }}>
        {levels.map((l, i) => (
          <button
            key={l.value}
            onClick={() => onChange(l.value)}
            style={{
              flex: 1,
              padding: 'clamp(12px,2.5vw,18px) clamp(4px,1vw,6px)',
              textAlign: 'center',
              background: value === l.value ? 'var(--bg-invert)' : 'var(--bg)',
              color: value === l.value ? 'var(--ink-invert)' : 'var(--ink)',
              border: 'none',
              borderRight: i < levels.length - 1 ? '1.5px solid var(--border)' : 'none',
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: 'clamp(9px,1.8vw,12px)',
              letterSpacing: '0.04em',
              cursor: 'pointer',
              transition: 'background 80ms, color 80ms',
            }}
          >
            {l.label}
          </button>
        ))}
      </div>
      {showQ && value > 0 && (
        <div style={{ border: '1.5px solid var(--border-2)', padding: 16, marginBottom: 8 }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.1em', marginBottom: 12 }}>
            IS YOUR MOOD RELATED TO ACADEMIC STRESS?
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            {['yes', 'no', 'partially'].map(opt => (
              <button
                key={opt}
                onClick={() => onStressChange(opt)}
                style={{ ...optStyle(stressIsAcademic === opt), flex: 1, textTransform: 'uppercase' as const }}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}
      <NavBtns onNext={nextStep} onBack={prevStep} nextDisabled={value === 0 || (showQ && !stressIsAcademic)} />
    </BCard>
  )
}

function FavoriteSubjectStep({ value, onChange, nextStep, prevStep }: any) {
  const subjects = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology',
    'English', 'Urdu', 'Islamiyat', 'Pakistan Studies',
    'Computer Science', 'Economics', 'Accounting', 'Business Studies',
    'History', 'Geography', 'Psychology', 'Sociology',
    'Art', 'Physical Education', 'Other',
  ]
  return (
    <BCard>
      <h2 style={H}>Favorite Subject</h2>
      <p style={SUB}>Which subject do you enjoy the most?</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6, marginBottom: 4 }}>
        {subjects.map(s => (
          <button key={s} onClick={() => onChange(s)} style={optStyle(value === s)}>{s}</button>
        ))}
      </div>
      <NavBtns onNext={nextStep} onBack={prevStep} nextDisabled={!value} />
    </BCard>
  )
}

function WorstSubjectStep({ value, onChange, nextStep, prevStep }: any) {
  const subjects = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology',
    'English', 'Urdu', 'Islamiyat', 'Pakistan Studies',
    'Computer Science', 'Economics', 'Accounting', 'Business Studies',
    'History', 'Geography', 'Psychology', 'Sociology',
    'Art', 'Physical Education', 'Other', 'None — I like all',
  ]
  return (
    <BCard>
      <h2 style={H}>Least Favorite Subject</h2>
      <p style={SUB}>Which subject do you find most challenging?</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6, marginBottom: 4 }}>
        {subjects.map(s => (
          <button key={s} onClick={() => onChange(s)} style={optStyle(value === s)}>{s}</button>
        ))}
      </div>
      <NavBtns onNext={nextStep} onBack={prevStep} nextDisabled={!value} />
    </BCard>
  )
}

function SubjectWhyStep({ type, subject, value, onChange, nextStep, prevStep }: any) {
  return (
    <BCard>
      <h2 style={H}>Why {subject}?</h2>
      <p style={SUB}>
        {type === 'favorite'
          ? `What makes ${subject} your favorite subject?`
          : `What makes ${subject} challenging for you?`}
      </p>
      <label style={MONO_LABEL}>YOUR ANSWER</label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Share your thoughts..."
        rows={5}
        className="br-input"
        style={{ width: '100%', padding: '13px 14px', fontSize: 14, boxSizing: 'border-box', resize: 'none', marginBottom: 4 }}
      />
      <NavBtns onNext={nextStep} onBack={prevStep} nextDisabled={!value.trim() || value.trim().length < 10} />
    </BCard>
  )
}

function ReportCardStep({ value, onChange, nextStep, prevStep }: any) {
  const grades = [
    { id: 'excellent', label: 'EXCELLENT — A+ / 90–100%' },
    { id: 'very-good', label: 'VERY GOOD — A / 80–89%' },
    { id: 'good', label: 'GOOD — B / 70–79%' },
    { id: 'satisfactory', label: 'SATISFACTORY — C / 60–69%' },
    { id: 'needs-improvement', label: 'NEEDS IMPROVEMENT — < 60%' },
    { id: 'varies', label: 'VARIES BY SUBJECT' },
  ]
  return (
    <BCard>
      <h2 style={H}>Report Card Average</h2>
      <p style={SUB}>On average, how do you perform academically?</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 4 }}>
        {grades.map(g => (
          <button key={g.id} onClick={() => onChange(g.id)} style={{ ...optStyle(value === g.id), textAlign: 'left' as const, padding: '13px 12px' }}>
            {g.label}
          </button>
        ))}
      </div>
      <NavBtns onNext={nextStep} onBack={prevStep} nextDisabled={!value} />
    </BCard>
  )
}

function TutoringStep({ value, onChange, nextStep, prevStep }: any) {
  const options = [
    { id: 'yes-regularly', label: 'YES — REGULARLY' },
    { id: 'yes-occasionally', label: 'YES — OCCASIONALLY' },
    { id: 'no', label: 'NO' },
    { id: 'online-courses', label: 'ONLINE COURSES / YOUTUBE' },
  ]
  return (
    <BCard>
      <h2 style={H}>Private Tutoring</h2>
      <p style={SUB}>Do you take any private tutoring or extra classes?</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 4 }}>
        {options.map(o => (
          <button key={o.id} onClick={() => onChange(o.id)} style={optStyle(value === o.id)}>{o.label}</button>
        ))}
      </div>
      <NavBtns onNext={nextStep} onBack={prevStep} nextDisabled={!value} />
    </BCard>
  )
}

function CheatingStep({ value, onChange, nextStep, prevStep }: any) {
  const options = [
    { id: 'never', label: 'NEVER' },
    { id: 'once-twice', label: 'ONCE OR TWICE' },
    { id: 'occasionally', label: 'OCCASIONALLY' },
    { id: 'frequently', label: 'FREQUENTLY' },
    { id: 'prefer-not-say', label: 'PREFER NOT TO SAY' },
  ]
  return (
    <BCard>
      <h2 style={H}>Academic Honesty</h2>
      <p style={SUB}>Have you ever cheated on exams or assignments? Your honest answer helps us understand academic pressures.</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 4 }}>
        {options.map(o => (
          <button key={o.id} onClick={() => onChange(o.id)} style={optStyle(value === o.id)}>{o.label}</button>
        ))}
      </div>
      <NavBtns onNext={nextStep} onBack={prevStep} nextDisabled={!value} />
    </BCard>
  )
}

function ResearchParticipationStep({ value, onChange, nextStep, prevStep }: any) {
  const options = [
    { id: 'yes', label: 'YES', desc: "I've participated in research studies before" },
    { id: 'no', label: 'NO', desc: 'This is my first time' },
    { id: 'not-sure', label: 'NOT SURE', desc: "I might have but I'm not certain" },
  ]
  return (
    <BCard>
      <h2 style={H}>Research Experience</h2>
      <p style={SUB}>Have you ever participated in a research study before?</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 4 }}>
        {options.map(o => (
          <button
            key={o.id}
            onClick={() => onChange(o.id)}
            style={{
              ...optStyle(value === o.id),
              textAlign: 'left' as const,
              padding: '14px 16px',
            }}
          >
            <div style={{ fontWeight: 800, marginBottom: 2 }}>{o.label}</div>
            <div style={{ fontSize: 11, opacity: 0.7, fontFamily: 'var(--font-body)', fontWeight: 400, letterSpacing: 0 }}>{o.desc}</div>
          </button>
        ))}
      </div>
      <NavBtns onNext={nextStep} onBack={prevStep} nextDisabled={!value} />
    </BCard>
  )
}

function IntermissionStep({ nextStep, prevStep }: any) {
  return (
    <BCard>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.14em', marginBottom: 16 }}>
          ALMOST THERE
        </div>
        <h1 style={{ ...H, fontSize: 'clamp(28px,5vw,44px)', marginBottom: 20 }}>
          Thank you for your patience.
        </h1>
        <div style={{ border: '1.5px solid var(--border-2)', padding: 20, marginBottom: 20 }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.7, marginBottom: 8 }}>
            We know that form felt like a marathon.
          </p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink-3)', lineHeight: 1.7 }}>
            Thank you for crossing the finish line with us. We promise the personalized experience will be worth it.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 20 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 11, color: 'var(--ink)', letterSpacing: '0.06em', marginBottom: 2 }}>✓ DATA COLLECTED</div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 11, color: 'var(--ink)', letterSpacing: '0.06em', marginBottom: 2 }}>✓ PERSONALIZATION READY</div>
          </div>
        </div>
      </div>
      <NavBtns onNext={nextStep} onBack={prevStep} nextDisabled={false} />
    </BCard>
  )
}

function KokoroStep({ onFinish, prevStep, loading }: any) {
  return (
    <BCard>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.14em', marginBottom: 16 }}>
          YOUR AI COMPANION
        </div>
        <h1 style={{ ...H, fontSize: 'clamp(28px,5vw,44px)', marginBottom: 20 }}>
          Meet Kokoro.
        </h1>
        <div style={{ border: '1.5px solid var(--border-2)', padding: 20, marginBottom: 20 }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.7, fontStyle: 'italic' }}>
            &ldquo;Hello! I&apos;m Kokoro, and I&apos;m honored to be part of your journey toward mental clarity and academic success. Together, we&apos;ll explore your thoughts, celebrate your victories, and navigate challenges with compassion and understanding. Your well-being is my priority.&rdquo;
          </p>
        </div>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink-3)', lineHeight: 1.6 }}>
          Kokoro is available 24/7, ready to help you process your thoughts and emotions in a safe, judgment-free space.
        </p>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button
          onClick={prevStep}
          className="br-btn"
          style={{ padding: '12px 20px', fontSize: 12, letterSpacing: '0.06em', color: 'var(--ink-2)' }}
        >
          ← BACK
        </button>
        <button
          onClick={onFinish}
          disabled={loading}
          className="br-btn br-btn-inv"
          style={{ flex: 1, padding: '14px 20px', fontSize: 12, letterSpacing: '0.06em', opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'SAVING...' : 'COMPLETE ONBOARDING →'}
        </button>
      </div>
    </BCard>
  )
}

function SuccessStep({ router }: { router: any }) {
  useEffect(() => {
    const t = setTimeout(() => router.push('/dashboard'), 4000)
    return () => clearTimeout(t)
  }, [router])

  return (
    <BCard>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.14em', marginBottom: 16 }}>
          ONBOARDING COMPLETE
        </div>
        <h1 style={{ ...H, fontSize: 'clamp(28px,5vw,44px)', marginBottom: 20 }}>
          All Done.
        </h1>
        <div style={{ border: '1.5px solid var(--border-2)', padding: 20, marginBottom: 20 }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.7, marginBottom: 12 }}>
            Thank you for sharing your responses with us. Your insights are invaluable in helping us understand student mental health and academic wellness in Pakistan.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              'Your responses have been securely saved and anonymized',
              'Kokoro is now personalized to support your unique needs',
              'You\'ll be redirected to your dashboard momentarily',
            ].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--ink)', flexShrink: 0 }}>✓</span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.5 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.1em' }}>
          Questions? Contact us at{' '}
          <a href="mailto:saadnizami114@gmail.com" style={{ color: 'var(--ink-2)' }}>saadnizami114@gmail.com</a>
        </p>
      </div>
      <motion.div
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.12em' }}
      >
        REDIRECTING TO DASHBOARD...
      </motion.div>
    </BCard>
  )
}
