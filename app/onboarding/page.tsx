'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { MeshGradient } from '@/components/MeshGradient'
import { useTranslation } from 'react-i18next'
import { 
  ArrowRight, 
  ArrowLeft, 
  Sparkles,
  User,
  Calendar,
  Users,
  GraduationCap,
  Heart,
  Palette,
  Globe,
  Brain,
  CheckCircle2,
  Shield,
  FileText,
  Mail,
  MapPin,
  School,
  Book,
  TrendingUp,
  Smile,
  Frown,
  Meh,
  Trophy,
  Target,
  Coffee
} from 'lucide-react'
import '@/lib/i18n'

// Onboarding Steps
const ONBOARDING_STEPS = [
  { id: 'welcome', icon: Sparkles },
  { id: 'privacy', icon: Shield },
  { id: 'research', icon: FileText },
  { id: 'name', icon: User },
  { id: 'age', icon: Calendar },
  { id: 'religion', icon: Heart },
  { id: 'city', icon: MapPin },
  { id: 'school-type', icon: School },
  { id: 'school-name', icon: School },
  { id: 'education-level', icon: GraduationCap },
  { id: 'hobbies', icon: Heart },
  { id: 'personality', icon: Palette },
  { id: 'recent-mood', icon: Smile },
  { id: 'academic-stress', icon: TrendingUp },
  { id: 'fav-subject', icon: Book },
  { id: 'fav-why', icon: Book },
  { id: 'worst-subject', icon: Book },
  { id: 'worst-why', icon: Book },
  { id: 'report-card', icon: Trophy },
  { id: 'tutoring', icon: Target },
  { id: 'cheating', icon: FileText },
  { id: 'research-participation', icon: Users },
  { id: 'intermission', icon: Coffee },
  { id: 'kokoro', icon: Brain },
  { id: 'success', icon: CheckCircle2 },
]

const PAGE_TRANSITION = {
  initial: { opacity: 0, scale: 0.95, rotateX: -10 },
  animate: { opacity: 1, scale: 1, rotateX: 0 },
  exit: { opacity: 0, scale: 1.05, rotateX: 10 },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
}

export default function OnboardingPage() {
  const router = useRouter()
  const { t, i18n } = useTranslation()
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
        const { data: { session: retrySession } } = await supabase.auth.getSession()

        if (!retrySession) {
          router.push('/auth')
        }
      }
    }
    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push('/auth')
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  const nextStep = () => {
    if (ONBOARDING_STEPS[currentStep].id === 'academic-stress' && userData.recent_mood > 3) {
      setCurrentStep(currentStep + 2)
    } else if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          name: userData.name,
          age: parseInt(userData.age),
          religion: userData.religion,
          city: userData.city,
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
      nextStep()
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Error saving your information. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const updateUserData = (key: string, value: any) => {
    setUserData(prev => ({ ...prev, [key]: value }))
  }

  const CurrentStepComponent = ONBOARDING_STEPS[currentStep].id

  return (
    <div className="min-h-screen relative font-sans selection:bg-[#C4661F] selection:text-white overflow-hidden">
      
      <MeshGradient />

      {/* Progress Indicator - MOBILE OPTIMIZED */}
      <div className="absolute top-4 sm:top-8 left-1/2 -translate-x-1/2 z-20">
        <div className="flex items-center gap-1.5 sm:gap-2">
          {ONBOARDING_STEPS.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full transition-all duration-300 ${
                index === currentStep 
                  ? 'bg-[#D2691E] w-4 sm:w-6' 
                  : index < currentStep 
                  ? 'bg-[#4A6C6F]' 
                  : 'bg-white/20'
              }`}
            />
          ))}
        </div>
        <p className="text-[10px] sm:text-xs text-[#5F5F5F] text-center mt-1.5 sm:mt-2">
          Step {currentStep + 1} of {ONBOARDING_STEPS.length}
        </p>
      </div>

      {/* Main Content - MOBILE OPTIMIZED */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-3 sm:px-4 py-16 sm:py-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            {...PAGE_TRANSITION}
            className="w-full max-w-3xl"
          >
            {/* All step components... */}
            {CurrentStepComponent === 'welcome' && <WelcomeStep nextStep={nextStep} />}
            {CurrentStepComponent === 'privacy' && (
              <PrivacyStep 
                agreed={userData.agreedToPolicies}
                onAgree={(value) => updateUserData('agreedToPolicies', value)}
                nextStep={nextStep}
                prevStep={prevStep}
              />
            )}
            {CurrentStepComponent === 'research' && (
              <ResearchStep 
                agreed={userData.agreedToResearch}
                onAgree={(value) => updateUserData('agreedToResearch', value)}
                nextStep={nextStep}
                prevStep={prevStep}
              />
            )}
            {CurrentStepComponent === 'name' && (
              <NameStep 
                value={userData.name}
                onChange={(value) => updateUserData('name', value)}
                nextStep={nextStep}
                prevStep={prevStep}
              />
            )}
            {CurrentStepComponent === 'age' && (
              <AgeStep 
                value={userData.age}
                onChange={(value) => updateUserData('age', value)}
                nextStep={nextStep}
                prevStep={prevStep}
              />
            )}
            {CurrentStepComponent === 'religion' && (
              <ReligionStep 
                value={userData.religion}
                onChange={(value) => updateUserData('religion', value)}
                nextStep={nextStep}
                prevStep={prevStep}
              />
            )}
            {CurrentStepComponent === 'city' && (
              <CityStep 
                value={userData.city}
                onChange={(value) => updateUserData('city', value)}
                nextStep={nextStep}
                prevStep={prevStep}
              />
            )}
            {CurrentStepComponent === 'school-type' && (
              <SchoolTypeStep 
                value={userData.school_type}
                onChange={(value) => updateUserData('school_type', value)}
                nextStep={nextStep}
                prevStep={prevStep}
              />
            )}
            {CurrentStepComponent === 'school-name' && (
              <SchoolNameStep 
                value={userData.school_name}
                onChange={(value) => updateUserData('school_name', value)}
                nextStep={nextStep}
                prevStep={prevStep}
              />
            )}
            {CurrentStepComponent === 'education-level' && (
              <EducationLevelStep 
                boardValue={userData.education_board}
                levelValue={userData.education_level}
                onBoardChange={(value) => updateUserData('education_board', value)}
                onLevelChange={(value) => updateUserData('education_level', value)}
                nextStep={nextStep}
                prevStep={prevStep}
              />
            )}
            {CurrentStepComponent === 'hobbies' && (
              <HobbiesStep 
                value={userData.hobbies}
                onChange={(value) => updateUserData('hobbies', value)}
                nextStep={nextStep}
                prevStep={prevStep}
              />
            )}
            {CurrentStepComponent === 'personality' && (
              <PersonalityStep 
                value={userData.personality_traits}
                onChange={(value) => updateUserData('personality_traits', value)}
                nextStep={nextStep}
                prevStep={prevStep}
              />
            )}
            {CurrentStepComponent === 'recent-mood' && (
              <RecentMoodStep 
                value={userData.recent_mood}
                onChange={(value) => updateUserData('recent_mood', value)}
                nextStep={nextStep}
                prevStep={prevStep}
              />
            )}
            {CurrentStepComponent === 'academic-stress' && (
              <AcademicStressStep 
                value={userData.academic_stress}
                moodValue={userData.recent_mood}
                stressIsAcademic={userData.stress_is_academic}
                onChange={(value) => updateUserData('academic_stress', value)}
                onStressChange={(value) => updateUserData('stress_is_academic', value)}
                nextStep={nextStep}
                prevStep={prevStep}
              />
            )}
            {CurrentStepComponent === 'fav-subject' && (
              <FavoriteSubjectStep 
                value={userData.favorite_subject}
                onChange={(value) => updateUserData('favorite_subject', value)}
                nextStep={nextStep}
                prevStep={prevStep}
              />
            )}
            {CurrentStepComponent === 'fav-why' && (
              <SubjectWhyStep 
                type="favorite"
                subject={userData.favorite_subject}
                value={userData.favorite_subject_why}
                onChange={(value) => updateUserData('favorite_subject_why', value)}
                nextStep={nextStep}
                prevStep={prevStep}
              />
            )}
            {CurrentStepComponent === 'worst-subject' && (
              <WorstSubjectStep 
                value={userData.worst_subject}
                onChange={(value) => updateUserData('worst_subject', value)}
                nextStep={nextStep}
                prevStep={prevStep}
              />
            )}
            {CurrentStepComponent === 'worst-why' && (
              <SubjectWhyStep 
                type="worst"
                subject={userData.worst_subject}
                value={userData.worst_subject_why}
                onChange={(value) => updateUserData('worst_subject_why', value)}
                nextStep={nextStep}
                prevStep={prevStep}
              />
            )}
            {CurrentStepComponent === 'report-card' && (
              <ReportCardStep 
                value={userData.report_card_average}
                onChange={(value) => updateUserData('report_card_average', value)}
                nextStep={nextStep}
                prevStep={prevStep}
              />
            )}
            {CurrentStepComponent === 'tutoring' && (
              <TutoringStep 
                value={userData.has_tutoring}
                onChange={(value) => updateUserData('has_tutoring', value)}
                nextStep={nextStep}
                prevStep={prevStep}
              />
            )}
            {CurrentStepComponent === 'cheating' && (
              <CheatingStep 
                value={userData.has_cheated}
                onChange={(value) => updateUserData('has_cheated', value)}
                nextStep={nextStep}
                prevStep={prevStep}
              />
            )}
            {CurrentStepComponent === 'research-participation' && (
              <ResearchParticipationStep 
                value={userData.previous_research}
                onChange={(value) => updateUserData('previous_research', value)}
                nextStep={nextStep}
                prevStep={prevStep}
              />
            )}
            {CurrentStepComponent === 'intermission' && (
              <IntermissionStep nextStep={nextStep} prevStep={prevStep} />
            )}
            {CurrentStepComponent === 'kokoro' && (
              <KokoroStep 
                onFinish={handleSubmit}
                prevStep={prevStep}
                loading={loading}
              />
            )}
            {CurrentStepComponent === 'success' && (
              <SuccessStep router={router} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

// ============= STEP COMPONENTS - MOBILE OPTIMIZED =============

function WelcomeStep({ nextStep }: { nextStep: () => void }) {
  return (
    <GlassCard>
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="mb-6 sm:mb-8 mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#D2691E]/20 to-[#4A6C6F]/20 rounded-3xl flex items-center justify-center"
        >
          <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-[#D2691E]" />
        </motion.div>
        
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-medium text-[#2C2C2C] mb-3 sm:mb-4">
          Welcome to Satori
        </h1>
        <p className="text-base sm:text-lg text-[#5F5F5F] mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed px-2">
          We're honored to have you here. This comprehensive questionnaire will help us understand you better and provide personalized mental wellness support. 
          
          <br/><br/>

          Your responses are confidential and will be used solely for research purposes to improve mental health services for students in Pakistan.
          
          <br/><br/>
          
          <span className="text-[#2C2C2C]">This should take about 10-15 minutes to complete.</span>
        </p>
        
        <button
          onClick={nextStep}
          className="px-6 sm:px-8 py-3 sm:py-4 bg-[#D2691E] hover:bg-[#D2691E]/90 text-white rounded-xl sm:rounded-2xl font-medium text-sm sm:text-base transition-all duration-300 hover:scale-105 flex items-center gap-2 mx-auto shadow-xl"
        >
          Let's Begin
          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    </GlassCard>
  )
}

function PrivacyStep({ agreed, onAgree, nextStep, prevStep }: any) {
  return (
    <GlassCard>
      <div className="mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
        <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-[#D2691E]" />
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-medium text-[#2C2C2C]">Privacy Policy & Terms</h2>
      </div>
      
      <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8 max-h-64 sm:max-h-96 overflow-y-auto pr-2 sm:pr-4 custom-scrollbar">
        <section className="space-y-2 sm:space-y-3">
          <h3 className="text-lg sm:text-xl font-semibold text-[#2C2C2C]">1. Data Collection & Usage</h3>
          <p className="text-sm sm:text-base text-[#5F5F5F] leading-relaxed">
            We collect personal information including your name, age, educational background, hobbies, personality traits, mood patterns, and academic performance data. This information is used exclusively to:
          </p>
          <ul className="space-y-2 text-sm sm:text-base text-[#5F5F5F] ml-2 sm:ml-4">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#4A6C6F] flex-shrink-0 mt-0.5" />
              <span>Provide personalized mental wellness support through our AI companion, Kokoro</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#4A6C6F] flex-shrink-0 mt-0.5" />
              <span>Analyze patterns in student mental health and academic stress in Pakistan</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#4A6C6F] flex-shrink-0 mt-0.5" />
              <span>Improve our services and develop better mental health interventions</span>
            </li>
          </ul>
        </section>

        <section className="space-y-2 sm:space-y-3">
          <h3 className="text-lg sm:text-xl font-semibold text-[#2C2C2C]">2. Data Security & Confidentiality</h3>
          <ul className="space-y-2 text-sm sm:text-base text-[#5F5F5F] ml-2 sm:ml-4">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#4A6C6F] flex-shrink-0 mt-0.5" />
              <span>All data is encrypted using industry-standard AES-256 encryption</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#4A6C6F] flex-shrink-0 mt-0.5" />
              <span>Your conversations with Kokoro are completely private and confidential</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#4A6C6F] flex-shrink-0 mt-0.5" />
              <span>We never share your personal information with third parties without explicit consent</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#4A6C6F] flex-shrink-0 mt-0.5" />
              <span>Access to your data is strictly limited to authorized research personnel</span>
            </li>
          </ul>
        </section>

        <section className="space-y-2 sm:space-y-3">
          <h3 className="text-lg sm:text-xl font-semibold text-[#2C2C2C]">3. Your Rights</h3>
          <ul className="space-y-2 text-sm sm:text-base text-[#5F5F5F] ml-2 sm:ml-4">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#4A6C6F] flex-shrink-0 mt-0.5" />
              <span>You have the right to access all your personal data at any time</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#4A6C6F] flex-shrink-0 mt-0.5" />
              <span>You can request deletion of your account and all associated data</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#4A6C6F] flex-shrink-0 mt-0.5" />
              <span>You can opt out of research participation while continuing to use the service</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#4A6C6F] flex-shrink-0 mt-0.5" />
              <span>You can withdraw consent at any time without penalty</span>
            </li>
          </ul>
        </section>

        <section className="space-y-2 sm:space-y-3">
          <h3 className="text-lg sm:text-xl font-semibold text-[#2C2C2C]">4. Age Restrictions</h3>
          <p className="text-sm sm:text-base text-[#5F5F5F] leading-relaxed">
            Users must be between 3 and 99 years old to use this service. For users under 18, we recommend parental guidance when using mental health services.
          </p>
        </section>

        <section className="space-y-2 sm:space-y-3">
          <h3 className="text-lg sm:text-xl font-semibold text-[#2C2C2C]">5. Limitation of Services</h3>
          <p className="text-sm sm:text-base text-[#5F5F5F] leading-relaxed">
            Satori is designed to provide support and guidance for mental wellness. However, it is not a substitute for professional mental health care. In case of emergency or severe mental health concerns, please contact a licensed mental health professional or emergency services immediately.
          </p>
        </section>

        <section className="space-y-2 sm:space-y-3">
          <h3 className="text-lg sm:text-xl font-semibold text-[#2C2C2C]">6. Changes to Privacy Policy</h3>
          <p className="text-sm sm:text-base text-[#5F5F5F] leading-relaxed">
            We may update this privacy policy from time to time. We will notify you of any significant changes via email or in-app notification.
          </p>
        </section>
      </div>

      <label className="flex items-start gap-2 sm:gap-3 mb-6 sm:mb-8 cursor-pointer group">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => onAgree(e.target.checked)}
          className="mt-0.5 sm:mt-1 w-4 h-4 sm:w-5 sm:h-5 rounded border-2 border-[#6B6B6B]/30 bg-white/60 checked:bg-[#D2691E] checked:border-[#D2691E] transition-all duration-300 cursor-pointer"
        />
        <span className="text-xs sm:text-sm text-[#5F5F5F] group-hover:text-[#2C2C2C] transition-colors">
          I have read and agree to the privacy policy and terms of service. I understand my rights and how my data will be used.
        </span>
      </label>

      <NavigationButtons 
        onNext={nextStep}
        onBack={prevStep}
        nextDisabled={!agreed}
      />
    </GlassCard>
  )
}
function ResearchStep({ agreed, onAgree, nextStep, prevStep }: any) {
  return (
    <GlassCard>
      <div className="mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
        <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-[#D2691E]" />
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-medium text-[#2C2C2C]">Research Participation</h2>
      </div>
      
      <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
        <section className="space-y-2 sm:space-y-3">
          <h3 className="text-lg sm:text-xl font-semibold text-[#2C2C2C]">Purpose of Research</h3>
          <p className="text-sm sm:text-base text-[#5F5F5F] leading-relaxed">
            This research aims to understand the relationship between academic stress and mental wellness among students in Pakistan. Your participation will contribute to developing better support systems and interventions for student mental health.
          </p>
        </section>

        <section className="space-y-2 sm:space-y-3">
          <h3 className="text-lg sm:text-xl font-semibold text-[#2C2C2C]">How Your Data Will Be Used</h3>
          <ul className="space-y-2 text-sm sm:text-base text-[#5F5F5F]">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#4A6C6F] flex-shrink-0 mt-0.5" />
              <span><strong className="text-[#2C2C2C]">Anonymized Analysis:</strong> Your personal data will be anonymized before being used in research studies. No identifying information will be included in any published research.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#4A6C6F] flex-shrink-0 mt-0.5" />
              <span><strong className="text-[#2C2C2C]">Pattern Recognition:</strong> We'll analyze trends in mood, academic stress, study habits, and their correlations to identify patterns and risk factors.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#4A6C6F] flex-shrink-0 mt-0.5" />
              <span><strong className="text-[#2C2C2C]">Service Improvement:</strong> Research findings will directly improve Kokoro's ability to provide personalized mental health support.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#4A6C6F] flex-shrink-0 mt-0.5" />
              <span><strong className="text-[#2C2C2C]">Academic Publications:</strong> Aggregated, anonymized data may be used in academic papers and conferences to advance mental health research.</span>
            </li>
          </ul>
        </section>

        <section className="space-y-2 sm:space-y-3">
          <h3 className="text-lg sm:text-xl font-semibold text-[#2C2C2C]">Your Rights as a Research Participant</h3>
          <ul className="space-y-2 text-sm sm:text-base text-[#5F5F5F]">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#4A6C6F] flex-shrink-0 mt-0.5" />
              <span>Participation is completely voluntary</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#4A6C6F] flex-shrink-0 mt-0.5" />
              <span>You can withdraw from the research at any time without affecting your access to Satori</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#4A6C6F] flex-shrink-0 mt-0.5" />
              <span>You can request that your data be excluded from research (while still using the service)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#4A6C6F] flex-shrink-0 mt-0.5" />
              <span>You can access a summary of research findings upon request</span>
            </li>
          </ul>
        </section>

        <section className="bg-white/60 border border-white/60 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
          <div className="flex items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
            <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-[#D2691E] flex-shrink-0" />
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-[#2C2C2C] mb-1 sm:mb-2">Questions or Concerns?</h3>
              <p className="text-xs sm:text-sm text-[#5F5F5F] leading-relaxed">
                If you have any questions about the research, how your data will be used, or wish to exercise any of your rights, please contact us at:
              </p>
              <a 
                href="mailto:saadnizami114@gmail.com"
                className="text-[#D2691E] hover:text-[#D2691E]/80 transition-colors inline-flex items-center gap-1 sm:gap-2 mt-1 sm:mt-2 font-medium text-xs sm:text-sm"
              >
                saadnizami114@gmail.com
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </a>
            </div>
          </div>
        </section>
      </div>

      <label className="flex items-start gap-2 sm:gap-3 mb-6 sm:mb-8 cursor-pointer group">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => onAgree(e.target.checked)}
          className="mt-0.5 sm:mt-1 w-4 h-4 sm:w-5 sm:h-5 rounded border-2 border-[#6B6B6B]/30 bg-white/60 checked:bg-[#D2691E] checked:border-[#D2691E] transition-all duration-300 cursor-pointer"
        />
        <span className="text-xs sm:text-sm text-[#5F5F5F] group-hover:text-[#2C2C2C] transition-colors">
          I understand how my data will be used for research purposes. I voluntarily consent to participate in this research study while understanding that I can withdraw at any time.
        </span>
      </label>

      <NavigationButtons 
        onNext={nextStep}
        onBack={prevStep}
        nextDisabled={!agreed}
      />
    </GlassCard>
  )
}

function NameStep({ value, onChange, nextStep, prevStep }: any) {
  return (
    <GlassCard>
      <div className="mb-6 sm:mb-8">
        <User className="w-10 h-10 sm:w-12 sm:h-12 text-[#D2691E] mb-3 sm:mb-4" />
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-medium text-[#2C2C2C] mb-2">What's your name?</h2>
        <p className="text-sm sm:text-base text-[#5F5F5F]">This helps us personalize your experience with Kokoro</p>
      </div>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter your full name"
        className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-white/60 border border-white/60 rounded-xl sm:rounded-2xl text-[#2C2C2C] text-base sm:text-lg placeholder:text-[#5F5F5F]/50 focus:bg-white/80 focus:border-[#D2691E]/50 focus:outline-none transition-all duration-300 mb-6 sm:mb-8 shadow-lg"
        autoFocus
      />

      <NavigationButtons 
        onNext={nextStep}
        onBack={prevStep}
        nextDisabled={!value.trim()}
      />
    </GlassCard>
  )
}

function AgeStep({ value, onChange, nextStep, prevStep }: any) {
  return (
    <GlassCard>
      <div className="mb-6 sm:mb-8">
        <Calendar className="w-10 h-10 sm:w-12 sm:h-12 text-[#D2691E] mb-3 sm:mb-4" />
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-medium text-[#2C2C2C] mb-2">How old are you?</h2>
        <p className="text-sm sm:text-base text-[#5F5F5F]"></p>
      </div>

      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter your age"
        min="3"
        max="99"
        className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-white/60 border border-white/60 rounded-xl sm:rounded-2xl text-[#2C2C2C] text-base sm:text-lg placeholder:text-[#5F5F5F]/50 focus:bg-white/80 focus:border-[#D2691E]/50 focus:outline-none transition-all duration-300 mb-6 sm:mb-8 shadow-lg"
      />

      <NavigationButtons 
        onNext={nextStep}
        onBack={prevStep}
        nextDisabled={!value || parseInt(value) < 3 || parseInt(value) > 99}
      />
    </GlassCard>
  )
}

function ReligionStep({ value, onChange, nextStep, prevStep }: any) {
  const religions = ['Islam', 'Christianity', 'Hinduism', 'Buddhism', 'Sikhism', 'Atheism', 'Other', 'Prefer not to say']

  return (
    <GlassCard>
      <div className="mb-6 sm:mb-8">
        <Heart className="w-10 h-10 sm:w-12 sm:h-12 text-[#D2691E] mb-3 sm:mb-4" />
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-medium text-[#2C2C2C] mb-2">Your Religion</h2>
        <p className="text-sm sm:text-base text-[#5F5F5F]">This helps us provide culturally sensitive support</p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 mb-6 sm:mb-8">
        {religions.map((religion) => (
          <button
            key={religion}
            onClick={() => onChange(religion)}
            className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 shadow-lg ${
              value === religion
                ? 'bg-[#D2691E]/20 border-[#D2691E]'
                : 'bg-white/60 border-white/60 hover:border-[#6B6B6B]/30'
            }`}
          >
            <div className="text-sm sm:text-base font-medium text-[#2C2C2C]">{religion}</div>
          </button>
        ))}
      </div>

      <NavigationButtons 
        onNext={nextStep}
        onBack={prevStep}
        nextDisabled={!value}
      />
    </GlassCard>
  )
}

function CityStep({ value, onChange, nextStep, prevStep }: any) {
  const cities = [
    'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad',
    'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala',
    'Hyderabad', 'Abbottabad', 'Bahawalpur', 'Sargodha', 'Sukkur',
    'Larkana', 'Sheikhupura', 'Rahim Yar Khan', 'Jhang', 'Dera Ghazi Khan',
    'Gujrat', 'Sahiwal', 'Wah Cantonment', 'Mardan', 'Kasur', 'Other'
  ]

  return (
    <GlassCard>
      <div className="mb-6 sm:mb-8">
        <MapPin className="w-10 h-10 sm:w-12 sm:h-12 text-[#D2691E] mb-3 sm:mb-4" />
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-medium text-[#2C2C2C] mb-2">Which city do you live in?</h2>
        <p className="text-sm sm:text-base text-[#5F5F5F]">Select your city</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mb-6 sm:mb-8 max-h-64 sm:max-h-96 overflow-y-auto pr-1 sm:pr-2">
        {cities.map((city) => (
          <button
            key={city}
            onClick={() => onChange(city)}
            className={`p-2 sm:p-3 rounded-lg sm:rounded-xl border-2 transition-all duration-300 shadow-lg ${
              value === city
                ? 'bg-[#D2691E]/20 border-[#D2691E]'
                : 'bg-white/60 border-white/60 hover:border-[#6B6B6B]/30'
            }`}
          >
            <div className="text-xs sm:text-sm font-medium text-[#2C2C2C]">{city}</div>
          </button>
        ))}
      </div>

      {value === 'Other' && (
        <input
          type="text"
          placeholder="Please specify your city"
          className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-white/60 border border-white/60 rounded-xl sm:rounded-2xl text-[#2C2C2C] text-sm sm:text-base placeholder:text-[#5F5F5F]/50 focus:bg-white/80 focus:border-[#D2691E]/50 focus:outline-none transition-all duration-300 mb-6 sm:mb-8 shadow-lg"
        />
      )}

      <NavigationButtons 
        onNext={nextStep}
        onBack={prevStep}
        nextDisabled={!value}
      />
    </GlassCard>
  )
}

function SchoolTypeStep({ value, onChange, nextStep, prevStep }: any) {
  const types = [
    { id: 'private', name: 'Private School', icon: <School className="w-6 h-6 sm:w-8 sm:h-8" /> },
    { id: 'public', name: 'Public/Government School', icon: <Book className="w-6 h-6 sm:w-8 sm:h-8" /> },
    { id: 'islamic', name: 'Islamic School/Madrasa', icon: <Heart className="w-6 h-6 sm:w-8 sm:h-8" /> },
    { id: 'homeschool', name: 'Homeschool', icon: <User className="w-6 h-6 sm:w-8 sm:h-8" /> },
  ]

  return (
    <GlassCard>
      <div className="mb-6 sm:mb-8">
        <School className="w-10 h-10 sm:w-12 sm:h-12 text-[#D2691E] mb-3 sm:mb-4" />
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-medium text-[#2C2C2C] mb-2">Type of School</h2>
        <p className="text-sm sm:text-base text-[#5F5F5F]">What type of educational institution do you attend?</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {types.map((type) => (
          <button
            key={type.id}
            onClick={() => onChange(type.id)}
            className={`p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 shadow-lg ${
              value === type.id
                ? 'bg-[#D2691E]/20 border-[#D2691E]'
                : 'bg-white/60 border-white/60 hover:border-[#6B6B6B]/30'
            }`}
          >
            <div className="text-[#D2691E] mb-2 sm:mb-3 flex justify-center">{type.icon}</div>
            <div className="text-sm sm:text-base font-medium text-[#2C2C2C]">{type.name}</div>
          </button>
        ))}
      </div>

      <NavigationButtons 
        onNext={nextStep}
        onBack={prevStep}
        nextDisabled={!value}
      />
    </GlassCard>
  )
}

function SchoolNameStep({ value, onChange, nextStep, prevStep }: any) {
  return (
    <GlassCard>
      <div className="mb-6 sm:mb-8">
        <School className="w-10 h-10 sm:w-12 sm:h-12 text-[#D2691E] mb-3 sm:mb-4" />
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-medium text-[#2C2C2C] mb-2">School Name</h2>
        <p className="text-sm sm:text-base text-[#5F5F5F]">What's the name of your school/institution?</p>
      </div>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter your school name"
        className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-white/60 border border-white/60 rounded-xl sm:rounded-2xl text-[#2C2C2C] text-base sm:text-lg placeholder:text-[#5F5F5F]/50 focus:bg-white/80 focus:border-[#D2691E]/50 focus:outline-none transition-all duration-300 mb-6 sm:mb-8 shadow-lg"
      />

      <NavigationButtons 
        onNext={nextStep}
        onBack={prevStep}
        nextDisabled={!value.trim()}
      />
    </GlassCard>
  )
}
function EducationLevelStep({ boardValue, levelValue, onBoardChange, onLevelChange, nextStep, prevStep }: any) {
  const boards = [
    { id: 'primary-middle', name: 'Primary/Middle School', levels: ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8'] },
    { id: 'matric', name: 'Matric', levels: ['Class 9', 'Class 10'] },
    { id: 'fsc', name: 'FSC/Intermediate', levels: ['Class 11 (1st Year)', 'Class 12 (2nd Year)'] },
    { id: 'olevels', name: 'O-Levels', levels: ['O-Level Year 1', 'O-Level Year 2', 'O-Level Year 3'] },
    { id: 'alevels', name: 'A-Levels', levels: ['A-Level Year 1 (AS)', 'A-Level Year 2 (A2)'] },
    { id: 'bachelors', name: 'Bachelors/University', levels: ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'] },
  ]

  const selectedBoard = boards.find(b => b.id === boardValue)

  return (
    <GlassCard>
      <div className="mb-6 sm:mb-8">
        <GraduationCap className="w-10 h-10 sm:w-12 sm:h-12 text-[#D2691E] mb-3 sm:mb-4" />
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-medium text-[#2C2C2C] mb-2">Education Level</h2>
        <p className="text-sm sm:text-base text-[#5F5F5F]">Select your educational board and current level</p>
      </div>

      <div className="mb-4 sm:mb-6">
        <label className="block text-xs sm:text-sm text-[#2C2C2C] mb-2 sm:mb-3 ml-1">Educational Board/System</label>
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {boards.map((board) => (
            <button
              key={board.id}
              onClick={() => {
                onBoardChange(board.id)
                onLevelChange('')
              }}
              className={`p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all duration-300 shadow-lg ${
                boardValue === board.id
                  ? 'bg-[#D2691E]/20 border-[#D2691E]'
                  : 'bg-white/60 border-white/60 hover:border-[#6B6B6B]/30'
              }`}
            >
              <div className="text-xs sm:text-sm font-medium text-[#2C2C2C]">{board.name}</div>
            </button>
          ))}
        </div>
      </div>

      {selectedBoard && (
        <div className="mb-6 sm:mb-8">
          <label className="block text-xs sm:text-sm text-[#2C2C2C] mb-2 sm:mb-3 ml-1">Current Class/Level</label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3 max-h-48 sm:max-h-64 overflow-y-auto pr-1 sm:pr-2">
            {selectedBoard.levels.map((level) => (
              <button
                key={level}
                onClick={() => onLevelChange(level)}
                className={`p-2 sm:p-3 rounded-lg sm:rounded-xl border-2 transition-all duration-300 shadow-lg ${
                  levelValue === level
                    ? 'bg-[#D2691E]/20 border-[#D2691E]'
                    : 'bg-white/60 border-white/60 hover:border-[#6B6B6B]/30'
                }`}
              >
                <div className="text-[10px] sm:text-xs font-medium text-[#2C2C2C]">{level}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      <NavigationButtons 
        onNext={nextStep}
        onBack={prevStep}
        nextDisabled={!boardValue || !levelValue}
      />
    </GlassCard>
  )
}

function HobbiesStep({ value, onChange, nextStep, prevStep }: any) {
  const hobbies = [
    'Drawing/Painting', 'Writing', 'Photography', 'Calligraphy', 'Crafts',
    'Singing', 'Playing Instrument', 'Music Production', 'Listening to Music',
    'Cricket', 'Football', 'Basketball', 'Badminton', 'Swimming', 'Cycling', 'Running', 'Gym/Fitness', 'Martial Arts', 'Yoga',
    'Video Gaming', 'PC Gaming', 'Mobile Gaming', 'Coding/Programming', 'Web Design', 'Robotics',
    'Reading Books', 'Poetry', 'Debating', 'Science Experiments', 'Chess', 'Puzzles',
    'Watching Movies', 'Watching Drama/Series', 'Social Media', 'YouTube', 'Making Videos', 'Blogging',
    'Cooking', 'Baking', 'Food Blogging',
    'Gardening', 'Bird Watching', 'Pet Care', 'Traveling', 'Hiking',
    'Quran Recitation', 'Islamic Studies', 'Volunteering', 'Community Service',
    'Fashion Design', 'Makeup', 'Styling',
    'Collecting (stamps, coins, etc)', 'Organizing', 'Journaling',
    'Acting', 'Dancing', 'Public Speaking',
    'Other'
  ]

  const toggleHobby = (hobby: string) => {
    if (value.includes(hobby)) {
      onChange(value.filter((h: string) => h !== hobby))
    } else {
      onChange([...value, hobby])
    }
  }

  return (
    <GlassCard>
      <div className="mb-6 sm:mb-8">
        <Heart className="w-10 h-10 sm:w-12 sm:h-12 text-[#D2691E] mb-3 sm:mb-4" />
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-medium text-[#2C2C2C] mb-2">Your Hobbies & Interests</h2>
        <p className="text-sm sm:text-base text-[#5F5F5F]">Select all that apply (minimum 1)</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mb-6 sm:mb-8 max-h-64 sm:max-h-96 overflow-y-auto pr-1 sm:pr-2">
        {hobbies.map((hobby) => (
          <button
            key={hobby}
            onClick={() => toggleHobby(hobby)}
            className={`p-2 sm:p-3 rounded-lg sm:rounded-xl border-2 transition-all duration-300 shadow-lg ${
              value.includes(hobby)
                ? 'bg-[#D2691E]/20 border-[#D2691E]'
                : 'bg-white/60 border-white/60 hover:border-[#6B6B6B]/30'
            }`}
          >
            <div className="text-[10px] sm:text-xs font-medium text-[#2C2C2C]">{hobby}</div>
          </button>
        ))}
      </div>

      {value.length > 0 && (
        <p className="text-xs sm:text-sm text-[#4A6C6F] mb-3 sm:mb-4">Selected: {value.length} {value.length === 1 ? 'hobby' : 'hobbies'}</p>
      )}

      <NavigationButtons 
        onNext={nextStep}
        onBack={prevStep}
        nextDisabled={value.length === 0}
      />
    </GlassCard>
  )
}

function PersonalityStep({ value, onChange, nextStep, prevStep }: any) {
  const traits = [
    'Introverted', 'Extroverted', 'Analytical', 'Creative', 
    'Organized', 'Spontaneous', 'Empathetic', 'Logical',
    'Optimistic', 'Realistic', 'Ambitious', 'Relaxed',
    'Confident', 'Humble', 'Independent', 'Team Player',
    'Adventurous', 'Cautious', 'Outgoing', 'Reserved',
    'Leader', 'Follower', 'Perfectionist', 'Flexible'
  ]

  const toggleTrait = (trait: string) => {
    if (value.includes(trait)) {
      onChange(value.filter((t: string) => t !== trait))
    } else {
      onChange([...value, trait])
    }
  }

  return (
    <GlassCard>
      <div className="mb-6 sm:mb-8">
        <Palette className="w-10 h-10 sm:w-12 sm:h-12 text-[#D2691E] mb-3 sm:mb-4" />
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-medium text-[#2C2C2C] mb-2">Your Personality</h2>
        <p className="text-sm sm:text-base text-[#5F5F5F]">Choose traits that describe you (select at least 3)</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mb-6 sm:mb-8">
        {traits.map((trait) => (
          <button
            key={trait}
            onClick={() => toggleTrait(trait)}
            className={`p-2 sm:p-3 rounded-lg sm:rounded-xl border-2 transition-all duration-300 shadow-lg ${
              value.includes(trait)
                ? 'bg-[#D2691E]/20 border-[#D2691E]'
                : 'bg-white/60 border-white/60 hover:border-[#6B6B6B]/30'
            }`}
          >
            <div className="text-xs sm:text-sm font-medium text-[#2C2C2C]">{trait}</div>
          </button>
        ))}
      </div>

      {value.length > 0 && (
        <p className="text-xs sm:text-sm text-[#4A6C6F] mb-3 sm:mb-4">Selected: {value.length} {value.length === 1 ? 'trait' : 'traits'}</p>
      )}

      <NavigationButtons 
        onNext={nextStep}
        onBack={prevStep}
        nextDisabled={value.length < 3}
      />
    </GlassCard>
  )
}

function RecentMoodStep({ value, onChange, nextStep, prevStep }: any) {
  const moods = [
    { value: 1, label: 'Very Bad', icon: <Frown className="w-8 h-8 sm:w-12 sm:h-12" />, color: 'from-red-500/20 to-red-600/20 border-red-500' },
    { value: 2, label: 'Bad', icon: <Frown className="w-7 h-7 sm:w-10 sm:h-10" />, color: 'from-orange-500/20 to-orange-600/20 border-orange-500' },
    { value: 3, label: 'Neutral', icon: <Meh className="w-7 h-7 sm:w-10 sm:h-10" />, color: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500' },
    { value: 4, label: 'Good', icon: <Smile className="w-7 h-7 sm:w-10 sm:h-10" />, color: 'from-green-500/20 to-green-600/20 border-green-500' },
    { value: 5, label: 'Very Good', icon: <Smile className="w-8 h-8 sm:w-12 sm:h-12" />, color: 'from-blue-500/20 to-blue-600/20 border-blue-500' },
  ]

  return (
    <GlassCard>
      <div className="mb-6 sm:mb-8">
        <Smile className="w-10 h-10 sm:w-12 sm:h-12 text-[#D2691E] mb-3 sm:mb-4" />
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-medium text-[#2C2C2C] mb-2">How have you been feeling lately?</h2>
        <p className="text-sm sm:text-base text-[#5F5F5F]">Rate your mood over the past few days</p>
      </div>

      <div className="grid grid-cols-5 gap-2 sm:gap-3 mb-6 sm:mb-8">
        {moods.map((mood) => (
          <button
            key={mood.value}
            onClick={() => onChange(mood.value)}
            className={`p-3 sm:p-6 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 bg-gradient-to-br shadow-lg ${
              value === mood.value
                ? mood.color
                : 'bg-white/60 border-white/60 hover:border-[#6B6B6B]/30'
            }`}
          >
            <div className="text-[#2C2C2C] mb-1 sm:mb-2 flex justify-center">{mood.icon}</div>
            <div className="text-[10px] sm:text-sm font-medium text-[#2C2C2C]">{mood.label}</div>
          </button>
        ))}
      </div>

      <NavigationButtons 
        onNext={nextStep}
        onBack={prevStep}
        nextDisabled={value === 0}
      />
    </GlassCard>
  )
}

function AcademicStressStep({ value, moodValue, stressIsAcademic, onChange, onStressChange, nextStep, prevStep }: any) {
  const stressLevels = [
    { value: 1, label: 'Very Low', color: 'from-green-500/20 to-green-600/20 border-green-500' },
    { value: 2, label: 'Low', color: 'from-blue-500/20 to-blue-600/20 border-blue-500' },
    { value: 3, label: 'Moderate', color: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500' },
    { value: 4, label: 'High', color: 'from-orange-500/20 to-orange-600/20 border-orange-500' },
    { value: 5, label: 'Very High', color: 'from-red-500/20 to-red-600/20 border-red-500' },
  ]

  const showStressQuestion = moodValue <= 3

  return (
    <GlassCard>
      <div className="mb-6 sm:mb-8">
        <TrendingUp className="w-10 h-10 sm:w-12 sm:h-12 text-[#D2691E] mb-3 sm:mb-4" />
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-medium text-[#2C2C2C] mb-2">Academic Stress Level</h2>
        <p className="text-sm sm:text-base text-[#5F5F5F]">How stressed do you feel about your studies?</p>
      </div>

      <div className="grid grid-cols-5 gap-2 sm:gap-3 mb-6 sm:mb-8">
        {stressLevels.map((level) => (
          <button
            key={level.value}
            onClick={() => onChange(level.value)}
            className={`p-3 sm:p-6 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 bg-gradient-to-br shadow-lg ${
              value === level.value
                ? level.color
                : 'bg-white/60 border-white/60 hover:border-[#6B6B6B]/30'
            }`}
          >
            <div className="text-xl sm:text-2xl font-bold text-[#2C2C2C] mb-1 sm:mb-2">{level.value}</div>
            <div className="text-[9px] sm:text-xs font-medium text-[#2C2C2C]">{level.label}</div>
          </button>
        ))}
      </div>

      {showStressQuestion && value > 0 && (
        <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-white/60 border border-white/60 rounded-xl sm:rounded-2xl shadow-lg">
          <p className="text-sm sm:text-base text-[#2C2C2C] mb-3 sm:mb-4">Is your mood related to academic stress?</p>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <button
              onClick={() => onStressChange('yes')}
              className={`flex-1 p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all duration-300 shadow-lg ${
                stressIsAcademic === 'yes'
                  ? 'bg-[#D2691E]/20 border-[#D2691E]'
                  : 'bg-white/60 border-white/60 hover:border-[#6B6B6B]/30'
              }`}
            >
              <div className="text-sm sm:text-base font-medium text-[#2C2C2C]">Yes</div>
            </button>
            <button
              onClick={() => onStressChange('no')}
              className={`flex-1 p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all duration-300 shadow-lg ${
                stressIsAcademic === 'no'
                  ? 'bg-[#D2691E]/20 border-[#D2691E]'
                  : 'bg-white/60 border-white/60 hover:border-[#6B6B6B]/30'
              }`}
            >
              <div className="text-sm sm:text-base font-medium text-[#2C2C2C]">No</div>
            </button>
            <button
              onClick={() => onStressChange('partially')}
              className={`flex-1 p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all duration-300 shadow-lg ${
                stressIsAcademic === 'partially'
                  ? 'bg-[#D2691E]/20 border-[#D2691E]'
                  : 'bg-white/60 border-white/60 hover:border-[#6B6B6B]/30'
              }`}
            >
              <div className="text-sm sm:text-base font-medium text-[#2C2C2C]">Partially</div>
            </button>
          </div>
        </div>
      )}

      <NavigationButtons 
        onNext={nextStep}
        onBack={prevStep}
        nextDisabled={value === 0 || (showStressQuestion && !stressIsAcademic)}
      />
    </GlassCard>
  )
}

function FavoriteSubjectStep({ value, onChange, nextStep, prevStep }: any) {
  const subjects = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 
    'English', 'Urdu', 'Islamiyat', 'Pakistan Studies',
    'Computer Science', 'Economics', 'Accounting', 'Business Studies',
    'History', 'Geography', 'Psychology', 'Sociology',
    'Art', 'Physical Education', 'Other'
  ]

  return (
    <GlassCard>
      <div className="mb-6 sm:mb-8">
        <Book className="w-10 h-10 sm:w-12 sm:h-12 text-[#D2691E] mb-3 sm:mb-4" />
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-medium text-[#2C2C2C] mb-2">Favorite Subject</h2>
        <p className="text-sm sm:text-base text-[#5F5F5F]">Which subject do you enjoy the most?</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mb-6 sm:mb-8">
        {subjects.map((subject) => (
          <button
            key={subject}
            onClick={() => onChange(subject)}
            className={`p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all duration-300 shadow-lg ${
              value === subject
                ? 'bg-[#D2691E]/20 border-[#D2691E]'
                : 'bg-white/60 border-white/60 hover:border-[#6B6B6B]/30'
            }`}
          >
            <div className="text-xs sm:text-sm font-medium text-[#2C2C2C]">{subject}</div>
          </button>
        ))}
      </div>

      {value === 'Other' && (
        <input
          type="text"
          placeholder="Please specify the subject"
          className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-white/60 border border-white/60 rounded-xl sm:rounded-2xl text-[#2C2C2C] text-sm sm:text-base placeholder:text-[#5F5F5F]/50 focus:bg-white/80 focus:border-[#D2691E]/50 focus:outline-none transition-all duration-300 mb-6 sm:mb-8 shadow-lg"
        />
      )}

      <NavigationButtons 
        onNext={nextStep}
        onBack={prevStep}
        nextDisabled={!value}
      />
    </GlassCard>
  )
}

function WorstSubjectStep({ value, onChange, nextStep, prevStep }: any) {
  const subjects = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 
    'English', 'Urdu', 'Islamiyat', 'Pakistan Studies',
    'Computer Science', 'Economics', 'Accounting', 'Business Studies',
    'History', 'Geography', 'Psychology', 'Sociology',
    'Art', 'Physical Education', 'Other', 'None - I like all subjects'
  ]

  return (
    <GlassCard>
      <div className="mb-6 sm:mb-8">
        <Book className="w-10 h-10 sm:w-12 sm:h-12 text-[#D2691E] mb-3 sm:mb-4" />
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-medium text-[#2C2C2C] mb-2">Least Favorite Subject</h2>
        <p className="text-sm sm:text-base text-[#5F5F5F]">Which subject do you find most challenging?</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mb-6 sm:mb-8">
        {subjects.map((subject) => (
          <button
            key={subject}
            onClick={() => onChange(subject)}
            className={`p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all duration-300 shadow-lg ${
              value === subject
                ? 'bg-[#D2691E]/20 border-[#D2691E]'
                : 'bg-white/60 border-white/60 hover:border-[#6B6B6B]/30'
            }`}
          >
            <div className="text-xs sm:text-sm font-medium text-[#2C2C2C]">{subject}</div>
          </button>
        ))}
      </div>

      {value === 'Other' && (
        <input
          type="text"
          placeholder="Please specify the subject"
          className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-white/60 border border-white/60 rounded-xl sm:rounded-2xl text-[#2C2C2C] text-sm sm:text-base placeholder:text-[#5F5F5F]/50 focus:bg-white/80 focus:border-[#D2691E]/50 focus:outline-none transition-all duration-300 mb-6 sm:mb-8 shadow-lg"
        />
      )}

      <NavigationButtons 
        onNext={nextStep}
        onBack={prevStep}
        nextDisabled={!value}
      />
    </GlassCard>
  )
}

function SubjectWhyStep({ type, subject, value, onChange, nextStep, prevStep }: any) {
  return (
    <GlassCard>
      <div className="mb-6 sm:mb-8">
        <Book className="w-10 h-10 sm:w-12 sm:h-12 text-[#D2691E] mb-3 sm:mb-4" />
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-medium text-[#2C2C2C] mb-2">
          Why {subject}?
        </h2>
        <p className="text-sm sm:text-base text-[#5F5F5F]">
          {type === 'favorite' 
            ? `What makes ${subject} your favorite subject?`
            : `What makes ${subject} challenging for you?`
          }
        </p>
      </div>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Share your thoughts..."
        rows={5}
        className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-white/60 border border-white/60 rounded-xl sm:rounded-2xl text-[#2C2C2C] text-sm sm:text-base placeholder:text-[#5F5F5F]/50 focus:bg-white/80 focus:border-[#D2691E]/50 focus:outline-none transition-all duration-300 mb-6 sm:mb-8 resize-none shadow-lg"
      />

      <NavigationButtons 
        onNext={nextStep}
        onBack={prevStep}
        nextDisabled={!value.trim() || value.trim().length < 10}
      />
    </GlassCard>
  )
}

function ReportCardStep({ value, onChange, nextStep, prevStep }: any) {
  const grades = [
    { id: 'excellent', label: 'Excellent (A+/90-100%)', icon: <Trophy className="w-6 h-6 sm:w-8 sm:h-8" /> },
    { id: 'very-good', label: 'Very Good (A/80-89%)', icon: <Target className="w-6 h-6 sm:w-8 sm:h-8" /> },
    { id: 'good', label: 'Good (B/70-79%)', icon: <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8" /> },
    { id: 'satisfactory', label: 'Satisfactory (C/60-69%)', icon: <Book className="w-6 h-6 sm:w-8 sm:h-8" /> },
    { id: 'needs-improvement', label: 'Needs Improvement (<60%)', icon: <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8" /> },
    { id: 'varies', label: 'Varies by Subject', icon: <Palette className="w-6 h-6 sm:w-8 sm:h-8" /> },
  ]

  return (
    <GlassCard>
      <div className="mb-6 sm:mb-8">
        <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-[#D2691E] mb-3 sm:mb-4" />
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-medium text-[#2C2C2C] mb-2">Report Card Average</h2>
        <p className="text-sm sm:text-base text-[#5F5F5F]">On average, how do you perform academically?</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {grades.map((grade) => (
          <button
            key={grade.id}
            onClick={() => onChange(grade.id)}
            className={`p-4 sm:p-5 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 shadow-lg ${
              value === grade.id
                ? 'bg-[#D2691E]/20 border-[#D2691E]'
                : 'bg-white/60 border-white/60 hover:border-[#6B6B6B]/30'
            }`}
          >
            <div className="text-[#D2691E] mb-2 flex justify-center">{grade.icon}</div>
            <div className="text-xs sm:text-sm font-medium text-[#2C2C2C]">{grade.label}</div>
          </button>
        ))}
      </div>

      <NavigationButtons 
        onNext={nextStep}
        onBack={prevStep}
        nextDisabled={!value}
      />
    </GlassCard>
  )
}

function TutoringStep({ value, onChange, nextStep, prevStep }: any) {
  const options = [
    { id: 'yes-regularly', label: 'Yes, regularly', icon: <Book className="w-6 h-6 sm:w-8 sm:h-8" /> },
    { id: 'yes-occasionally', label: 'Yes, occasionally', icon: <Calendar className="w-6 h-6 sm:w-8 sm:h-8" /> },
    { id: 'no', label: 'No', icon: <School className="w-6 h-6 sm:w-8 sm:h-8" /> },
    { id: 'online-courses', label: 'Online courses/YouTube', icon: <Globe className="w-6 h-6 sm:w-8 sm:h-8" /> },
  ]

  return (
    <GlassCard>
      <div className="mb-6 sm:mb-8">
        <Target className="w-10 h-10 sm:w-12 sm:h-12 text-[#D2691E] mb-3 sm:mb-4" />
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-medium text-[#2C2C2C] mb-2">Private Tutoring</h2>
        <p className="text-sm sm:text-base text-[#5F5F5F]">Do you take any private tutoring or extra classes?</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => onChange(option.id)}
            className={`p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 shadow-lg ${
              value === option.id
                ? 'bg-[#D2691E]/20 border-[#D2691E]'
                : 'bg-white/60 border-white/60 hover:border-[#6B6B6B]/30'
            }`}
          >
            <div className="text-[#D2691E] mb-2 flex justify-center">{option.icon}</div>
            <div className="text-xs sm:text-sm font-medium text-[#2C2C2C]">{option.label}</div>
          </button>
        ))}
      </div>

      <NavigationButtons 
        onNext={nextStep}
        onBack={prevStep}
        nextDisabled={!value}
      />
    </GlassCard>
  )
}

function CheatingStep({ value, onChange, nextStep, prevStep }: any) {
  const options = [
    { id: 'never', label: 'Never', icon: <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8" /> },
    { id: 'once-twice', label: 'Once or twice', icon: <Calendar className="w-6 h-6 sm:w-8 sm:h-8" /> },
    { id: 'occasionally', label: 'Occasionally', icon: <Book className="w-6 h-6 sm:w-8 sm:h-8" /> },
    { id: 'frequently', label: 'Frequently', icon: <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8" /> },
    { id: 'prefer-not-say', label: 'Prefer not to say', icon: <Shield className="w-6 h-6 sm:w-8 sm:h-8" /> },
  ]

  return (
    <GlassCard>
      <div className="mb-6 sm:mb-8">
        <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-[#D2691E] mb-3 sm:mb-4" />
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-medium text-[#2C2C2C] mb-2">Academic Honesty</h2>
        <p className="text-sm sm:text-base text-[#5F5F5F]">
          Have you ever cheated on exams or assignments? 
          <br/>
          <span className="text-xs text-[#5F5F5F]/70">(Your honest answer helps us understand academic pressures)</span>
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 md:gap-4 mb-6 sm:mb-8">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => onChange(option.id)}
            className={`p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 shadow-lg ${
              value === option.id
                ? 'bg-[#D2691E]/20 border-[#D2691E]'
                : 'bg-white/60 border-white/60 hover:border-[#6B6B6B]/30'
            }`}
          >
            <div className="text-[#D2691E] mb-2 flex justify-center">{option.icon}</div>
            <div className="text-xs sm:text-sm font-medium text-[#2C2C2C]">{option.label}</div>
          </button>
        ))}
      </div>

      <NavigationButtons 
        onNext={nextStep}
        onBack={prevStep}
        nextDisabled={!value}
      />
    </GlassCard>
  )
}

function ResearchParticipationStep({ value, onChange, nextStep, prevStep }: any) {
  const options = [
    { id: 'yes', label: 'Yes', description: "I've participated in research studies before" },
    { id: 'no', label: 'No', description: "This is my first time" },
    { id: 'not-sure', label: 'Not Sure', description: "I might have, but I'm not certain" },
  ]

  return (
    <GlassCard>
      <div className="mb-6 sm:mb-8">
        <Users className="w-10 h-10 sm:w-12 sm:h-12 text-[#D2691E] mb-3 sm:mb-4" />
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-medium text-[#2C2C2C] mb-2">Research Experience</h2>
        <p className="text-sm sm:text-base text-[#5F5F5F]">Have you ever participated in a research study before?</p>
      </div>

      <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => onChange(option.id)}
            className={`w-full p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 text-left shadow-lg ${
              value === option.id
                ? 'bg-[#D2691E]/20 border-[#D2691E]'
                : 'bg-white/60 border-white/60 hover:border-[#6B6B6B]/30'
            }`}
          >
            <div className="text-base sm:text-lg font-semibold text-[#2C2C2C] mb-1">{option.label}</div>
            <div className="text-xs sm:text-sm text-[#5F5F5F]">{option.description}</div>
          </button>
        ))}
      </div>

      <NavigationButtons 
        onNext={nextStep}
        onBack={prevStep}
        nextDisabled={!value}
      />
    </GlassCard>
  )
}

function IntermissionStep({ nextStep, prevStep }: any) {
  return (
    <GlassCard>
      <div className="text-center">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mb-6 sm:mb-8 mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#D2691E]/20 to-[#4A6C6F]/20 rounded-full flex items-center justify-center"
        >
          <Coffee className="w-8 h-8 sm:w-10 sm:h-10 text-[#D2691E]" />
        </motion.div>
        
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-medium text-[#2C2C2C] mb-4 sm:mb-6">
          Almost There!
        </h1>
        
        <div className="bg-white/60 border border-white/60 rounded-xl sm:rounded-2xl p-6 sm:p-8 mb-6 sm:mb-8 shadow-lg">
          <p className="text-lg sm:text-xl text-[#2C2C2C] mb-3 sm:mb-4 leading-relaxed">
            We know that form felt like a marathon.
          </p>
          <p className="text-base sm:text-lg text-[#5F5F5F] leading-relaxed">
            Thank you for crossing the finish line with us. We promise the personalized experience will be worth the leg cramps.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 sm:gap-4 mb-6 sm:mb-8 flex-wrap">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-[#4A6C6F]" />
            <span className="text-xs sm:text-sm text-[#5F5F5F]">Data Collected</span>
          </div>
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#5F5F5F]/30" />
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-[#D2691E]" />
            <span className="text-xs sm:text-sm text-[#5F5F5F]">Personalization Ready</span>
          </div>
        </div>
        
        <div className="flex gap-3 sm:gap-4 justify-center">
          <button
            onClick={prevStep}
            className="px-4 sm:px-6 py-2.5 sm:py-3 bg-white/60 hover:bg-white/80 border border-white/60 text-[#2C2C2C] rounded-xl sm:rounded-2xl font-medium text-sm sm:text-base transition-all duration-300 flex items-center gap-2 shadow-lg"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            Back
          </button>
          
          <button
            onClick={nextStep}
            className="px-6 sm:px-8 py-3 sm:py-4 bg-[#D2691E] hover:bg-[#D2691E]/90 text-white rounded-xl sm:rounded-2xl font-medium text-sm sm:text-base transition-all duration-300 hover:scale-105 flex items-center gap-2 shadow-xl"
          >
            Meet Your AI Companion
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </GlassCard>
  )
}

function KokoroStep({ onFinish, prevStep, loading }: any) {
  return (
    <GlassCard>
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="mb-6 sm:mb-8 mx-auto w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-[#D2691E]/30 to-[#4A6C6F]/30 rounded-full flex items-center justify-center shadow-xl"
        >
          <Brain className="w-10 h-10 sm:w-12 sm:h-12 text-[#2C2C2C]" />
        </motion.div>
        
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-medium text-[#2C2C2C] mb-3 sm:mb-4">
          Meet Kokoro
        </h1>
        <p className="text-base sm:text-lg text-[#5F5F5F] mb-6 max-w-2xl mx-auto leading-relaxed px-2">
          Your AI companion, designed to listen, understand, and support you through your mental wellness journey. Kokoro is here for you 24/7, ready to help you process your thoughts and emotions in a safe, judgment-free space.
        </p>

        <div className="bg-white/60 border border-white/60 rounded-xl sm:rounded-2xl p-6 sm:p-8 mb-6 sm:mb-8 shadow-lg">
          <p className="text-[#2C2C2C] italic text-base sm:text-lg leading-relaxed">
            "Hello! I'm Kokoro, and I'm honored to be part of your journey toward mental clarity and academic success. Together, we'll explore your thoughts, celebrate your victories, and navigate challenges with compassion and understanding. Your well-being is my priority."
          </p>
        </div>
        
        <div className="flex gap-3 sm:gap-4 justify-center">
          <button
            onClick={prevStep}
            className="px-4 sm:px-6 py-2.5 sm:py-3 bg-white/60 hover:bg-white/80 border border-white/60 text-[#2C2C2C] rounded-xl sm:rounded-2xl font-medium text-sm sm:text-base transition-all duration-300 flex items-center gap-2 shadow-lg"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            Back
          </button>
          
          <button
            onClick={onFinish}
            disabled={loading}
            className="px-6 sm:px-8 py-3 sm:py-4 bg-[#D2691E] hover:bg-[#D2691E]/90 text-white rounded-xl sm:rounded-2xl font-medium text-sm sm:text-base transition-all duration-300 hover:scale-105 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                Complete Onboarding
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </GlassCard>
  )
}

function SuccessStep({ router }: { router: any }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/dashboard')
    }, 5000)
    return () => clearTimeout(timer)
  }, [router])

  return (
    <GlassCard>
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1] }}
          transition={{ duration: 0.6, times: [0, 0.6, 1] }}
          className="mb-6 sm:mb-8 mx-auto w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-[#4A6C6F]/30 to-[#D2691E]/30 rounded-full flex items-center justify-center shadow-xl"
        >
          <CheckCircle2 className="w-12 h-12 sm:w-16 sm:h-16 text-[#4A6C6F]" />
        </motion.div>
        
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-medium text-[#2C2C2C] mb-3 sm:mb-4">
          All Done!
        </h1>
        
        <p className="text-base sm:text-xl text-[#5F5F5F] mb-6 max-w-2xl mx-auto leading-relaxed px-2">
          Thank you for sharing your responses with us. Your insights are invaluable in helping us understand student mental health and academic wellness in Pakistan.
        </p>

        <div className="bg-white/60 border border-white/60 rounded-xl sm:rounded-2xl p-6 sm:p-8 mb-6 sm:mb-8 space-y-3 sm:space-y-4 shadow-lg">
          <p className="text-[#2C2C2C] text-sm sm:text-base leading-relaxed">
            <strong>What happens next?</strong>
          </p>
          <ul className="text-[#5F5F5F] space-y-2 sm:space-y-3 text-left max-w-xl mx-auto text-xs sm:text-sm">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#4A6C6F] flex-shrink-0 mt-0.5" />
              <span>Your responses have been securely saved and anonymized</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#4A6C6F] flex-shrink-0 mt-0.5" />
              <span>Kokoro is now personalized to support your unique needs</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#4A6C6F] flex-shrink-0 mt-0.5" />
              <span>You'll be redirected to your dashboard momentarily</span>
            </li>
          </ul>
        </div>

        <p className="text-xs sm:text-sm text-[#5F5F5F] mb-6">
          Need help or have questions?<br/>
          Contact us at: <a href="mailto:saadnizami114@gmail.com" className="text-[#D2691E] hover:underline">saadnizami114@gmail.com</a>
        </p>

        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-[#5F5F5F] text-xs sm:text-sm"
        >
          Redirecting in a few seconds...
        </motion.div>
      </div>
    </GlassCard>
  )
}

// Reusable Components
function GlassCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative backdrop-blur-[40px] bg-white/40 border border-white/60 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 md:p-12 shadow-2xl overflow-hidden">
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#D2691E] rounded-full mix-blend-screen filter blur-[80px] opacity-10"></div>
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-[#4A6C6F] rounded-full mix-blend-screen filter blur-[80px] opacity-10"></div>
      <div className="relative z-10">{children}</div>
    </div>
  )
}

function NavigationButtons({ onNext, onBack, nextDisabled }: any) {
  return (
    <div className="flex gap-3 sm:gap-4">
      <button
        onClick={onBack}
        className="px-4 sm:px-6 py-2.5 sm:py-3 bg-white/60 hover:bg-white/80 border border-white/60 text-[#2C2C2C] rounded-xl sm:rounded-2xl font-medium text-sm sm:text-base transition-all duration-300 flex items-center gap-2 shadow-lg"
      >
        <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        Back
      </button>
      
      <button
        onClick={onNext}
        disabled={nextDisabled}
        className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-[#D2691E] hover:bg-[#D2691E]/90 text-white rounded-xl sm:rounded-2xl font-medium text-sm sm:text-base transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-xl"
      >
        Next
        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
    </div>
  )
}
            