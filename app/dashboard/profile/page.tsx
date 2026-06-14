'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Mail, MapPin, Calendar, LogOut, Shield, Award,
  Heart, BookOpen, TrendingUp, Sparkles, Users, Home,
  GraduationCap, Camera, Cake, ArrowUp, Check
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ProfileData {
  id: string
  name: string
  email: string
  age: number
  gender: string
  education_level: string
  location: string
  religion: string
  family_status: string
  created_at: string
}

interface Stats {
  totalMoods: number
  totalJournals: number
  totalStressLogs: number
  totalPomodoros: number
  memberSince: string
}

const educationLevels = [
  { value: 'primary-1', label: 'Primary Year 1' },
  { value: 'primary-2', label: 'Primary Year 2' },
  { value: 'primary-3', label: 'Primary Year 3' },
  { value: 'primary-4', label: 'Primary Year 4' },
  { value: 'primary-5', label: 'Primary Year 5' },
  { value: 'middle-6', label: 'Middle Year 6' },
  { value: 'middle-7', label: 'Middle Year 7' },
  { value: 'middle-8', label: 'Middle Year 8' },
  { value: 'matric-9', label: 'Matric Year 9' },
  { value: 'matric-10', label: 'Matric Year 10' },
  { value: 'olevel-1', label: 'O-Levels Year 1' },
  { value: 'olevel-2', label: 'O-Levels Year 2' },
  { value: 'alevel-1', label: 'A-Levels Year 1' },
  { value: 'alevel-2', label: 'A-Levels Year 2' },
  { value: 'undergraduate-1', label: 'Undergraduate Year 1' },
  { value: 'undergraduate-2', label: 'Undergraduate Year 2' },
  { value: 'undergraduate-3', label: 'Undergraduate Year 3' },
  { value: 'undergraduate-4', label: 'Undergraduate Year 4' },
  { value: 'graduate', label: 'Graduate' },
  { value: 'postgraduate', label: 'Postgraduate' },
]

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [stats, setStats] = useState<Stats>({ totalMoods: 0, totalJournals: 0, totalStressLogs: 0, totalPomodoros: 0, memberSince: '' })
  const [loading, setLoading] = useState(true)
  const [showBirthdayModal, setShowBirthdayModal] = useState(false)
  const [showEducationModal, setShowEducationModal] = useState(false)
  const [selectedEducation, setSelectedEducation] = useState('')
  const [profilePicture, setProfilePicture] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchProfile()
    fetchStats()
    loadProfilePicture()
  }, [])

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) { setProfile(data); setSelectedEducation(data.education_level) }
    }
    setLoading(false)
  }

  const fetchStats = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { count: moodsCount } = await supabase.from('moods').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
      const { count: stressCount } = await supabase.from('academic_stress').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
      const journals = localStorage.getItem('journal_entries')
      const pomodoros = localStorage.getItem('pomodoro_total') || '0'
      const { data: profileData } = await supabase.from('profiles').select('created_at').eq('id', user.id).single()
      setStats({
        totalMoods: moodsCount || 0,
        totalJournals: journals ? JSON.parse(journals).length : 0,
        totalStressLogs: stressCount || 0,
        totalPomodoros: parseInt(pomodoros),
        memberSince: profileData?.created_at || '',
      })
    }
  }

  const loadProfilePicture = () => {
    const saved = localStorage.getItem('profile_picture')
    if (saved) setProfilePicture(saved)
  }

  const handleProfilePictureUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string
      setProfilePicture(imageUrl)
      localStorage.setItem('profile_picture', imageUrl)
      showSuccessMessage()
    }
    reader.readAsDataURL(file)
  }

  const handleBirthday = async () => {
    if (!profile) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const newAge = profile.age + 1
    const { error } = await supabase.from('profiles').update({ age: newAge }).eq('id', user.id)
    if (!error) { setProfile({ ...profile, age: newAge }); setShowBirthdayModal(false); showSuccessMessage() }
  }

  const handleEducationUpdate = async () => {
    if (!profile || !selectedEducation) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase.from('profiles').update({ education_level: selectedEducation }).eq('id', user.id)
    if (!error) { setProfile({ ...profile, education_level: selectedEducation }); setShowEducationModal(false); showSuccessMessage() }
  }

  const showSuccessMessage = () => {
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      await supabase.auth.signOut()
      router.push('/')
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Recently'
    return new Date(dateString).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  const formatFieldValue = (value: string | undefined) => {
    if (!value) return 'Not set'
    return value.replace(/-/g, ' ')
  }

  const getEducationLabel = (value: string) => {
    const level = educationLevels.find(l => l.value === value)
    return level ? level.label : formatFieldValue(value)
  }

  if (loading || !profile) {
    return (
      <div className="max-w-5xl mx-auto min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 rounded-full border-2 border-t-transparent"
          style={{ borderColor: '#2DD4BF', borderTopColor: 'transparent' }}
        />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Success toast */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className="fixed top-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl"
            style={{ background: '#13161F', border: '1px solid rgba(45,212,191,0.3)', color: '#F1F5F9' }}
          >
            <Check className="w-4 h-4" style={{ color: '#2DD4BF' }} />
            <span className="text-sm font-semibold">Updated successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleProfilePictureUpload} className="hidden" />

      {/* Page header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(45,212,191,0.12)' }}>
          <User className="w-5 h-5" style={{ color: '#2DD4BF' }} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-instrument), Georgia, serif', color: '#F1F5F9' }}>
            Profile
          </h1>
          <p className="text-xs" style={{ color: '#475569' }}>View your information and manage updates</p>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Left column */}
        <div className="space-y-4">
          {/* Avatar card */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl p-5 text-center"
            style={{ background: '#13161F', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="relative inline-block mb-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' as const }}
                className="w-24 h-24 rounded-2xl flex items-center justify-center overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #2DD4BF, #818CF8)' }}
              >
                {profilePicture ? (
                  <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold text-white">
                    {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
                  </span>
                )}
              </motion.div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-xl flex items-center justify-center transition-opacity hover:opacity-80"
                style={{ background: '#2DD4BF', color: '#0B0D14' }}
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            <h2 className="text-lg font-bold mb-0.5" style={{ color: '#F1F5F9' }}>{profile.name || 'User'}</h2>
            <p className="text-xs truncate mb-3 px-2" style={{ color: '#475569' }}>{profile.email}</p>
            <div className="flex items-center justify-center gap-1.5 text-xs" style={{ color: '#475569' }}>
              <Calendar className="w-3 h-3" />
              <span>Since {formatDate(stats.memberSince)}</span>
            </div>
          </motion.div>

          {/* Quick updates */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl p-4"
            style={{ background: '#13161F', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <p className="text-xs font-semibold mb-3 flex items-center gap-2" style={{ color: '#94A3B8' }}>
              <Sparkles className="w-3.5 h-3.5" style={{ color: '#2DD4BF' }} />
              Quick Updates
            </p>
            <div className="space-y-2">
              <button
                onClick={() => setShowBirthdayModal(true)}
                className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-80"
                style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.25)', color: '#F97316' }}
              >
                <Cake className="w-4 h-4" />
                It&apos;s My Birthday!
              </button>
              <button
                onClick={() => setShowEducationModal(true)}
                className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-80"
                style={{ background: 'rgba(45,212,191,0.08)', border: '1px solid rgba(45,212,191,0.2)', color: '#2DD4BF' }}
              >
                <ArrowUp className="w-4 h-4" />
                Update Class/Grade
              </button>
            </div>
          </motion.div>

          {/* Activity stats */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl p-4"
            style={{ background: '#13161F', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <p className="text-xs font-semibold mb-4 flex items-center gap-2" style={{ color: '#94A3B8' }}>
              <Award className="w-3.5 h-3.5" style={{ color: '#818CF8' }} />
              Your Activity
            </p>
            <div className="space-y-3">
              {[
                { icon: Heart,      label: 'Moods Logged',   value: stats.totalMoods,      color: '#F97316' },
                { icon: BookOpen,   label: 'Journal Entries', value: stats.totalJournals,   color: '#818CF8' },
                { icon: TrendingUp, label: 'Stress Logs',     value: stats.totalStressLogs, color: '#EF4444' },
                { icon: Sparkles,   label: 'Pomodoros Done',  value: stats.totalPomodoros,  color: '#2DD4BF' },
              ].map(stat => (
                <div key={stat.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${stat.color}15` }}>
                      <stat.icon className="w-3.5 h-3.5" style={{ color: stat.color }} />
                    </div>
                    <span className="text-xs" style={{ color: '#94A3B8' }}>{stat.label}</span>
                  </div>
                  <span className="text-base font-bold" style={{ color: '#F1F5F9', fontFamily: 'var(--font-jetbrains), monospace' }}>
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Logout */}
          <motion.button
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleLogout}
            className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-80"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444' }}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </motion.button>
        </div>

        {/* Right column — personal info */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl p-6"
            style={{ background: '#13161F', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <h3
              className="text-lg font-semibold mb-6"
              style={{ fontFamily: 'var(--font-instrument), Georgia, serif', color: '#F1F5F9' }}
            >
              Personal Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { icon: User,          label: 'Full Name',       value: profile.name || 'Not set' },
                { icon: Mail,          label: 'Email Address',   value: profile.email },
                { icon: Calendar,      label: 'Age',             value: profile.age ? `${profile.age} years` : 'Not set' },
                { icon: Users,         label: 'Gender',          value: formatFieldValue(profile.gender) },
                { icon: GraduationCap, label: 'Education Level', value: getEducationLabel(profile.education_level) },
                { icon: MapPin,        label: 'Location',        value: profile.location || 'Not set' },
                { icon: Heart,         label: 'Religion',        value: profile.religion || 'Not set' },
                { icon: Home,          label: 'Family Status',   value: formatFieldValue(profile.family_status) },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label}>
                  <label className="flex items-center gap-1.5 text-xs font-medium mb-1.5" style={{ color: '#475569' }}>
                    <Icon className="w-3 h-3" />
                    {label}
                  </label>
                  <div
                    className="px-3.5 py-2.5 rounded-xl text-sm font-medium capitalize truncate"
                    style={{ background: '#1C2030', border: '1px solid rgba(255,255,255,0.06)', color: '#F1F5F9' }}
                  >
                    {value}
                  </div>
                </div>
              ))}
            </div>

            {/* Privacy notice */}
            <div className="mt-6 p-4 rounded-xl flex items-start gap-3" style={{ background: 'rgba(45,212,191,0.06)', border: '1px solid rgba(45,212,191,0.15)' }}>
              <Shield className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#2DD4BF' }} />
              <div>
                <p className="text-xs font-semibold mb-0.5" style={{ color: '#F1F5F9' }}>Your Privacy Matters</p>
                <p className="text-xs leading-relaxed" style={{ color: '#475569' }}>
                  Your personal information is kept confidential and used only for research purposes. Most details were set during onboarding. You can update your age and education level as needed.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Birthday modal */}
      <AnimatePresence>
        {showBirthdayModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)' }}
            onClick={() => setShowBirthdayModal(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="rounded-2xl p-7 max-w-sm w-full shadow-2xl text-center"
              style={{ background: '#13161F', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(249,115,22,0.12)' }}>
                <Cake className="w-7 h-7" style={{ color: '#F97316' }} />
              </div>
              <h2 className="text-xl font-bold mb-2" style={{ color: '#F1F5F9' }}>Happy Birthday! 🎉</h2>
              <p className="text-sm mb-1" style={{ color: '#94A3B8' }}>
                Congratulations on turning <strong style={{ color: '#F1F5F9' }}>{profile.age + 1}</strong>!
              </p>
              <p className="text-xs mb-6" style={{ color: '#475569' }}>This will update your age in the system.</p>
              <div className="flex gap-2">
                <button
                  onClick={handleBirthday}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-80"
                  style={{ background: '#F97316' }}
                >
                  Update Age
                </button>
                <button
                  onClick={() => setShowBirthdayModal(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80"
                  style={{ background: '#1C2030', border: '1px solid rgba(255,255,255,0.06)', color: '#94A3B8' }}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Education modal */}
      <AnimatePresence>
        {showEducationModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)' }}
            onClick={() => setShowEducationModal(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="rounded-2xl p-7 max-w-sm w-full shadow-2xl max-h-[80vh] overflow-y-auto"
              style={{ background: '#13161F', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(45,212,191,0.12)' }}>
                <GraduationCap className="w-7 h-7" style={{ color: '#2DD4BF' }} />
              </div>
              <h2 className="text-xl font-bold mb-1 text-center" style={{ color: '#F1F5F9' }}>Update Education Level</h2>
              <p className="text-xs mb-5 text-center" style={{ color: '#475569' }}>Select your current class or grade</p>

              <label className="block text-xs font-medium mb-2" style={{ color: '#94A3B8' }}>
                Current: <span style={{ color: '#F1F5F9' }}>{getEducationLabel(profile.education_level)}</span>
              </label>
              <select
                value={selectedEducation}
                onChange={e => setSelectedEducation(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm mb-5 focus:outline-none"
                style={{ background: '#222638', border: '1px solid rgba(255,255,255,0.08)', color: '#F1F5F9' }}
              >
                {educationLevels.map(level => (
                  <option key={level.value} value={level.value}>{level.label}</option>
                ))}
              </select>

              <div className="flex gap-2">
                <button
                  onClick={handleEducationUpdate}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-80"
                  style={{ background: '#14B8A6' }}
                >
                  Update
                </button>
                <button
                  onClick={() => setShowEducationModal(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80"
                  style={{ background: '#1C2030', border: '1px solid rgba(255,255,255,0.06)', color: '#94A3B8' }}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
