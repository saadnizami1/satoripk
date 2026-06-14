'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User,
  Mail,
  MapPin,
  Calendar,
  LogOut,
  Shield,
  Award,
  Heart,
  BookOpen,
  TrendingUp,
  Sparkles,
  Users,
  Home,
  GraduationCap,
  Church,
  Camera,
  Cake,
  ArrowUp,
  Check
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
  const [stats, setStats] = useState<Stats>({
    totalMoods: 0,
    totalJournals: 0,
    totalStressLogs: 0,
    totalPomodoros: 0,
    memberSince: ''
  })
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
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (data) {
        setProfile(data)
        setSelectedEducation(data.education_level)
      }
    }
    setLoading(false)
  }

  const fetchStats = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const { count: moodsCount } = await supabase
        .from('moods')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      const { count: stressCount } = await supabase
        .from('academic_stress')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      const journals = localStorage.getItem('journal_entries')
      const journalCount = journals ? JSON.parse(journals).length : 0

      const pomodoros = localStorage.getItem('pomodoro_total') || '0'

      const { data: profileData } = await supabase
        .from('profiles')
        .select('created_at')
        .eq('id', user.id)
        .single()

      setStats({
        totalMoods: moodsCount || 0,
        totalJournals: journalCount,
        totalStressLogs: stressCount || 0,
        totalPomodoros: parseInt(pomodoros),
        memberSince: profileData?.created_at || ''
      })
    }
  }

  const loadProfilePicture = () => {
    const saved = localStorage.getItem('profile_picture')
    if (saved) {
      setProfilePicture(saved)
    }
  }

  const handleProfilePictureUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file')
      return
    }

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

    const { error } = await supabase
      .from('profiles')
      .update({ age: newAge })
      .eq('id', user.id)

    if (!error) {
      setProfile({ ...profile, age: newAge })
      setShowBirthdayModal(false)
      showSuccessMessage()
    }
  }

  const handleEducationUpdate = async () => {
    if (!profile || !selectedEducation) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('profiles')
      .update({ education_level: selectedEducation })
      .eq('id', user.id)

    if (!error) {
      setProfile({ ...profile, education_level: selectedEducation })
      setShowEducationModal(false)
      showSuccessMessage()
    }
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
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    })
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
      <div className="max-w-6xl mx-auto min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 rounded-full border-4 border-[#4A6C6F] border-t-transparent"
        />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      {/* Success Toast */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 sm:top-8 right-4 sm:right-8 z-50 backdrop-blur-[40px] bg-[#4A6C6F]/90 border border-white/60 rounded-xl sm:rounded-2xl px-4 py-3 sm:px-6 sm:py-4 shadow-2xl flex items-center gap-2 sm:gap-3"
          >
            <Check className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            <span className="text-white text-sm sm:text-base font-semibold">Updated successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleProfilePictureUpload}
        className="hidden"
      />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 sm:mb-8"
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#4A6C6F]/20 to-[#4A6C6F]/10 backdrop-blur-xl flex items-center justify-center">
            <User className="w-5 h-5 sm:w-6 sm:h-6 text-[#4A6C6F]" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-serif font-medium text-[#2C2C2C]">
              Profile
            </h1>
            <p className="text-sm sm:text-base text-[#5F5F5F]">View your information and manage updates</p>
          </div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Column - Stats */}
        <div className="space-y-4 sm:space-y-6">
          {/* Avatar Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="backdrop-blur-[40px] bg-white/40 border border-white/60 rounded-xl sm:rounded-2xl p-5 sm:p-6 shadow-xl text-center"
          >
            {/* Profile Picture */}
            <div className="relative inline-block mb-3 sm:mb-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#4A6C6F] to-[#6B6B6B] flex items-center justify-center shadow-2xl overflow-hidden"
              >
                {profilePicture ? (
                  <img
                    src={profilePicture}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl sm:text-5xl font-bold text-white">
                    {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
                  </span>
                )}
              </motion.div>

              {/* Camera Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-[#4A6C6F] text-white shadow-xl flex items-center justify-center hover:bg-[#6B6B6B] transition-colors"
              >
                <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.button>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-[#2C2C2C] mb-1">
              {profile.name || 'User'}
            </h2>
            <p className="text-xs sm:text-sm text-[#5F5F5F] mb-3 sm:mb-4 truncate px-2">{profile.email}</p>

            <div className="flex items-center justify-center gap-2 text-xs text-[#5F5F5F]">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Member since {formatDate(stats.memberSince)}</span>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="backdrop-blur-[40px] bg-white/40 border border-white/60 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl"
          >
            <h3 className="text-sm sm:text-base font-semibold text-[#2C2C2C] mb-3 sm:mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#4A6C6F]" />
              Quick Updates
            </h3>

            <div className="space-y-2 sm:space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowBirthdayModal(true)}
                className="w-full py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-linear-to-r from-[#D2691E]/20 to-[#D2691E]/10 border border-[#D2691E]/40 text-[#D2691E] text-sm sm:text-base font-semibold flex items-center justify-center gap-2 hover:from-[#D2691E]/30 hover:to-[#D2691E]/20 transition-all"
              >
                <Cake className="w-4 h-4 sm:w-5 sm:h-5" />
                It's My Birthday!
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowEducationModal(true)}
                className="w-full py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-linear-to-r from-[#4A6C6F]/20 to-[#4A6C6F]/10 border border-[#4A6C6F]/40 text-[#4A6C6F] text-sm sm:text-base font-semibold flex items-center justify-center gap-2 hover:from-[#4A6C6F]/30 hover:to-[#4A6C6F]/20 transition-all"
              >
                <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5" />
                Update Class/Grade
              </motion.button>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="backdrop-blur-[40px] bg-white/40 border border-white/60 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl"
          >
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Award className="w-4 h-4 sm:w-5 sm:h-5 text-[#4A6C6F]" />
              <h3 className="text-sm sm:text-base font-semibold text-[#2C2C2C]">Your Activity</h3>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {[
                { icon: Heart, label: 'Moods Logged', value: stats.totalMoods, color: '#D2691E' },
                { icon: BookOpen, label: 'Journal Entries', value: stats.totalJournals, color: '#4A6C6F' },
                { icon: TrendingUp, label: 'Stress Logs', value: stats.totalStressLogs, color: '#6B6B6B' },
                { icon: Sparkles, label: 'Pomodoros', value: stats.totalPomodoros, color: '#A8A8A8' },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${stat.color}20` }}
                    >
                      <stat.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: stat.color }} />
                    </div>
                    <span className="text-xs sm:text-sm text-[#5F5F5F]">{stat.label}</span>
                  </div>
                  <span className="text-lg sm:text-xl font-bold text-[#2C2C2C]">{stat.value}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Logout Button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="w-full py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-[#D2691E]/10 border border-[#D2691E]/40 text-[#D2691E] text-sm sm:text-base font-semibold flex items-center justify-center gap-2 hover:bg-[#D2691E]/20 transition-all"
          >
            <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
            Logout
          </motion.button>
        </div>

        {/* Right Column - Profile Info */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="backdrop-blur-[40px] bg-white/40 border border-white/60 rounded-xl sm:rounded-2xl md:rounded-[2rem] p-5 sm:p-6 md:p-8 shadow-2xl"
          >
            <h3 className="text-xl sm:text-2xl font-serif font-semibold text-[#2C2C2C] mb-5 sm:mb-6 md:mb-8">
              Personal Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
              {/* Name */}
              <div>
                <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-[#5F5F5F] mb-2">
                  <User className="w-3 h-3 sm:w-4 sm:h-4" />
                  Full Name
                </label>
                <div className="px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl bg-white/30 border border-white/40 text-[#2C2C2C] text-sm sm:text-base font-medium">
                  {profile.name || 'Not set'}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-[#5F5F5F] mb-2">
                  <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
                  Email Address
                </label>
                <div className="px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl bg-white/30 border border-white/40 text-[#2C2C2C] text-sm sm:text-base font-medium truncate">
                  {profile.email}
                </div>
              </div>

              {/* Age */}
              <div>
                <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-[#5F5F5F] mb-2">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                  Age
                </label>
                <div className="px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl bg-white/30 border border-white/40 text-[#2C2C2C] text-sm sm:text-base font-medium">
                  {profile.age ? `${profile.age} years` : 'Not set'}
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-[#5F5F5F] mb-2">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                  Gender
                </label>
                <div className="px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl bg-white/30 border border-white/40 text-[#2C2C2C] text-sm sm:text-base font-medium capitalize">
                  {formatFieldValue(profile.gender)}
                </div>
              </div>

              {/* Education Level */}
              <div>
                <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-[#5F5F5F] mb-2">
                  <GraduationCap className="w-3 h-3 sm:w-4 sm:h-4" />
                  Education Level
                </label>
                <div className="px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl bg-white/30 border border-white/40 text-[#2C2C2C] text-sm sm:text-base font-medium">
                  {getEducationLabel(profile.education_level)}
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-[#5F5F5F] mb-2">
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                  Location
                </label>
                <div className="px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl bg-white/30 border border-white/40 text-[#2C2C2C] text-sm sm:text-base font-medium">
                  {profile.location || 'Not set'}
                </div>
              </div>

              {/* Religion */}
              <div>
                <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-[#5F5F5F] mb-2">
                  <Church className="w-3 h-3 sm:w-4 sm:h-4" />
                  Religion
                </label>
                <div className="px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl bg-white/30 border border-white/40 text-[#2C2C2C] text-sm sm:text-base font-medium capitalize">
                  {profile.religion || 'Not set'}
                </div>
              </div>

              {/* Family Status */}
              <div>
                <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-[#5F5F5F] mb-2">
                  <Home className="w-3 h-3 sm:w-4 sm:h-4" />
                  Family Status
                </label>
                <div className="px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl bg-white/30 border border-white/40 text-[#2C2C2C] text-sm sm:text-base font-medium capitalize">
                  {formatFieldValue(profile.family_status)}
                </div>
              </div>
            </div>

            {/* Privacy Notice */}
            <div className="mt-5 sm:mt-6 md:mt-8 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-[#4A6C6F]/10 border border-[#4A6C6F]/30">
              <div className="flex items-start gap-2 sm:gap-3">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-[#4A6C6F] mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs sm:text-sm text-[#2C2C2C] font-medium mb-1">
                    Your Privacy Matters
                  </p>
                  <p className="text-xs text-[#5F5F5F]">
                    Your personal information is kept confidential and used only for research purposes. Most information was set during onboarding. You can update your age and education level as needed.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Birthday Modal */}
      <AnimatePresence>
        {showBirthdayModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setShowBirthdayModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="backdrop-blur-[40px] bg-white/95 border border-white/60 rounded-xl sm:rounded-2xl md:rounded-[2rem] p-6 sm:p-8 shadow-2xl max-w-md w-full"
            >
              <div className="text-center mb-5 sm:mb-6">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#D2691E]/20 to-[#D2691E]/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Cake className="w-7 h-7 sm:w-8 sm:h-8 text-[#D2691E]" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#2C2C2C] mb-2">
                  Happy Birthday! 🎉
                </h2>
                <p className="text-sm sm:text-base text-[#5F5F5F]">
                  Congratulations on turning <strong className="text-[#2C2C2C]">{profile.age + 1}</strong>!
                </p>
                <p className="text-xs sm:text-sm text-[#5F5F5F] mt-2">
                  This will update your age in the system.
                </p>
              </div>

              <div className="flex gap-2 sm:gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleBirthday}
                  className="flex-1 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-linear-to-r from-[#D2691E] to-[#D2691E]/80 text-white text-sm sm:text-base font-semibold shadow-xl"
                >
                  Update Age
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowBirthdayModal(false)}
                  className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-white/60 border border-white/60 text-[#2C2C2C] text-sm sm:text-base font-semibold"
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Education Update Modal */}
      <AnimatePresence>
        {showEducationModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setShowEducationModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="backdrop-blur-[40px] bg-white/95 border border-white/60 rounded-xl sm:rounded-2xl md:rounded-[2rem] p-6 sm:p-8 shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="text-center mb-5 sm:mb-6">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#4A6C6F]/20 to-[#4A6C6F]/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <GraduationCap className="w-7 h-7 sm:w-8 sm:h-8 text-[#4A6C6F]" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#2C2C2C] mb-2">
                  Update Education Level
                </h2>
                <p className="text-xs sm:text-sm text-[#5F5F5F]">
                  Select your current class or grade
                </p>
              </div>

              <div className="mb-5 sm:mb-6">
                <label className="block text-xs sm:text-sm font-medium text-[#5F5F5F] mb-2 sm:mb-3">
                  Current Level: <span className="text-[#2C2C2C] font-semibold">{getEducationLabel(profile.education_level)}</span>
                </label>
                <select
                  value={selectedEducation}
                  onChange={(e) => setSelectedEducation(e.target.value)}
                  className="w-full px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl bg-white/60 border border-white/60 text-[#2C2C2C] text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#4A6C6F]/50 transition-all"
                >
                  {educationLevels.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 sm:gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleEducationUpdate}
                  className="flex-1 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-linear-to-r from-[#4A6C6F] to-[#4A6C6F]/80 text-white text-sm sm:text-base font-semibold shadow-xl"
                >
                  Update
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowEducationModal(false)}
                  className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-white/60 border border-white/60 text-[#2C2C2C] text-sm sm:text-base font-semibold"
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}