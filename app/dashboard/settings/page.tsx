'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Settings as SettingsIcon,
  User,
  Shield,
  Database,
  Info,
  Lock,
  Trash2,
  Download,
  RotateCcw,
  Eye,
  EyeOff,
  Check,
  AlertTriangle,
  FileText,
  Mail
} from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const router = useRouter()
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [resetType, setResetType] = useState<'all' | 'journals' | 'pomodoros'>('all')
  
  // Password change states
  const [email, setEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  
  // Settings states
  const [anonymousData, setAnonymousData] = useState(true)

  useEffect(() => {
    fetchUserEmail()
  }, [])

  const fetchUserEmail = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setEmail(user.email || '')
    }
  }

  const showSuccessToast = (message: string = 'Settings updated successfully!') => {
    setSuccessMessage(message)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert('Please fill in all password fields')
      return
    }

    if (newPassword !== confirmPassword) {
      alert('New passwords do not match')
      return
    }

    if (newPassword.length < 6) {
      alert('New password must be at least 6 characters')
      return
    }

    try {
      // Re-authenticate user with current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: currentPassword
      })

      if (signInError) {
        alert('Current password is incorrect')
        return
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (updateError) {
        alert('Failed to update password: ' + updateError.message)
      } else {
        setShowPasswordModal(false)
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        showSuccessToast('Password updated successfully!')
      }
    } catch (err) {
      console.error('Password update error:', err)
      alert('An error occurred while updating password')
    }
  }

  const handleDeleteAccount = async () => {
    try {
      // Call the database function to delete everything
      const { error: rpcError } = await supabase.rpc('delete_user')
      
      if (rpcError) {
        console.error('Error deleting account:', rpcError)
        alert('Failed to delete account: ' + rpcError.message)
        return
      }
      
      // Clear ALL local storage
      localStorage.clear()
      
      // Clear ALL session storage
      sessionStorage.clear()
      
      // Clear ALL cookies (best effort)
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
      })
      
      // Redirect to home
      window.location.href = '/'
    } catch (err) {
      console.error('Error:', err)
      alert('An error occurred. Please try again.')
    }
  }

  const handleResetData = () => {
    switch (resetType) {
      case 'all':
        // Clear all except auth tokens
        const authTokens = localStorage.getItem('supabase.auth.token')
        localStorage.clear()
        if (authTokens) localStorage.setItem('supabase.auth.token', authTokens)
        showSuccessToast('All local data cleared!')
        break
      case 'journals':
        localStorage.removeItem('journal_entries')
        showSuccessToast('Journal entries cleared!')
        break
      case 'pomodoros':
        localStorage.removeItem('pomodoro_total')
        localStorage.removeItem('pomodoro_today')
        localStorage.removeItem('pomodoro_date')
        showSuccessToast('Pomodoro data cleared!')
        break
    }
    setShowResetModal(false)
  }

  const handleExportData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    try {
      // Fetch all user data from Supabase
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      const { data: moods } = await supabase
        .from('moods')
        .select('*')
        .eq('user_id', user.id)

      const { data: stress } = await supabase
        .from('academic_stress')
        .select('*')
        .eq('user_id', user.id)

      // Get local storage data
      const journals = localStorage.getItem('journal_entries')
      const pomodoros = localStorage.getItem('pomodoro_total')
      const profilePicture = localStorage.getItem('profile_picture')

      const exportData = {
        export_info: {
          exported_at: new Date().toISOString(),
          app_version: '1.0.0 Beta',
          user_id: user.id
        },
        profile,
        moods: moods || [],
        academic_stress: stress || [],
        journals: journals ? JSON.parse(journals) : [],
        pomodoro_stats: {
          total: pomodoros || '0'
        },
        has_profile_picture: !!profilePicture
      }

      // Create and download file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `satori-data-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      showSuccessToast('Data exported successfully!')
    } catch (err) {
      console.error('Export error:', err)
      alert('Failed to export data. Please try again.')
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Success Toast */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-8 right-8 z-50 backdrop-blur-[40px] bg-[#4A6C6F]/90 border border-white/60 rounded-2xl px-6 py-4 shadow-2xl flex items-center gap-3"
          >
            <Check className="w-5 h-5 text-white" />
            <span className="text-white font-semibold">{successMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#6B6B6B]/20 to-[#6B6B6B]/10 backdrop-blur-xl flex items-center justify-center">
            <SettingsIcon className="w-6 h-6 text-[#6B6B6B]" />
          </div>
          <div>
            <h1 className="text-4xl font-serif font-medium text-[#2C2C2C]">
              Settings
            </h1>
            <p className="text-[#5F5F5F]">Manage your preferences and data</p>
          </div>
        </div>
      </motion.div>

      <div className="space-y-6">
        {/* Account Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="backdrop-blur-[40px] bg-white/40 border border-white/60 rounded-2xl p-8 shadow-xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#4A6C6F]/20 flex items-center justify-center">
              <User className="w-5 h-5 text-[#4A6C6F]" />
            </div>
            <h2 className="text-2xl font-semibold text-[#2C2C2C]">Account Settings</h2>
          </div>

          <div className="space-y-4">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setShowPasswordModal(true)}
              className="w-full p-4 rounded-xl bg-white/50 border border-white/60 hover:bg-white/70 transition-all text-left flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-[#6B6B6B]" />
                <div>
                  <p className="font-semibold text-[#2C2C2C]">Change Password</p>
                  <p className="text-sm text-[#5F5F5F]">Update your account password</p>
                </div>
              </div>
              <div className="text-[#6B6B6B] opacity-0 group-hover:opacity-100 transition-opacity">→</div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setShowDeleteModal(true)}
              className="w-full p-4 rounded-xl bg-[#D2691E]/10 border border-[#D2691E]/40 hover:bg-[#D2691E]/20 transition-all text-left flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <Trash2 className="w-5 h-5 text-[#D2691E]" />
                <div>
                  <p className="font-semibold text-[#D2691E]">Delete Account</p>
                  <p className="text-sm text-[#D2691E]/70">Permanently delete your account and all data</p>
                </div>
              </div>
              <div className="text-[#D2691E] opacity-0 group-hover:opacity-100 transition-opacity">→</div>
            </motion.button>
          </div>
        </motion.div>

        {/* Privacy & Data */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="backdrop-blur-[40px] bg-white/40 border border-white/60 rounded-2xl p-8 shadow-xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#6B6B6B]/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#6B6B6B]" />
            </div>
            <h2 className="text-2xl font-semibold text-[#2C2C2C]">Privacy & Data</h2>
          </div>

          <div className="space-y-6">
            {/* Anonymous Data */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-semibold text-[#2C2C2C] mb-1">Anonymous Data Sharing</p>
                <p className="text-sm text-[#5F5F5F]">
                  Share aggregated, anonymous insights to improve the platform
                </p>
              </div>
              <button
                onClick={() => {
                  setAnonymousData(!anonymousData)
                  showSuccessToast('Privacy settings updated')
                }}
                className={`relative w-14 h-8 rounded-full transition-colors ${
                  anonymousData ? 'bg-[#4A6C6F]' : 'bg-[#A8A8A8]'
                }`}
              >
                <motion.div
                  animate={{ x: anonymousData ? 24 : 4 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg"
                />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-[#4A6C6F]/10 border border-[#4A6C6F]/30">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-[#4A6C6F] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-[#2C2C2C] font-medium mb-1">
                    Research Data Notice
                  </p>
                  <p className="text-xs text-[#5F5F5F]">
                    Your data contributes to mental health research in Pakistan. All data is anonymized and used ethically in accordance with research standards.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Data Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="backdrop-blur-[40px] bg-white/40 border border-white/60 rounded-2xl p-8 shadow-xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#6B6B6B]/20 flex items-center justify-center">
              <Database className="w-5 h-5 text-[#6B6B6B]" />
            </div>
            <h2 className="text-2xl font-semibold text-[#2C2C2C]">Data Management</h2>
          </div>

          <div className="space-y-4">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={handleExportData}
              className="w-full p-4 rounded-xl bg-white/50 border border-white/60 hover:bg-white/70 transition-all text-left flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <Download className="w-5 h-5 text-[#4A6C6F]" />
                <div>
                  <p className="font-semibold text-[#2C2C2C]">Export My Data</p>
                  <p className="text-sm text-[#5F5F5F]">Download all your data as JSON (to view JSON file open it in notepad)</p>
                </div>
              </div>
              <div className="text-[#4A6C6F] opacity-0 group-hover:opacity-100 transition-opacity">→</div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => {
                setResetType('all')
                setShowResetModal(true)
              }}
              className="w-full p-4 rounded-xl bg-[#D2691E]/10 border border-[#D2691E]/40 hover:bg-[#D2691E]/20 transition-all text-left flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <RotateCcw className="w-5 h-5 text-[#D2691E]" />
                <div>
                  <p className="font-semibold text-[#D2691E]">Clear All Local Data</p>
                  <p className="text-sm text-[#D2691E]/70">Remove all locally stored data</p>
                </div>
              </div>
              <div className="text-[#D2691E] opacity-0 group-hover:opacity-100 transition-opacity">→</div>
            </motion.button>

            {/* Specific data reset options */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { type: 'journals' as const, label: 'Clear Journals', icon: FileText },
                { type: 'pomodoros' as const, label: 'Clear Pomodoros', icon: RotateCcw },
              ].map((item) => (
                <motion.button
                  key={item.type}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setResetType(item.type)
                    setShowResetModal(true)
                  }}
                  className="p-3 rounded-xl bg-white/50 border border-white/60 hover:bg-white/70 transition-all text-center"
                >
                  <item.icon className="w-5 h-5 text-[#6B6B6B] mx-auto mb-2" />
                  <p className="text-sm font-medium text-[#2C2C2C]">{item.label}</p>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* App Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="backdrop-blur-[40px] bg-white/40 border border-white/60 rounded-2xl p-8 shadow-xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#A8A8A8]/20 flex items-center justify-center">
              <Info className="w-5 h-5 text-[#A8A8A8]" />
            </div>
            <h2 className="text-2xl font-semibold text-[#2C2C2C]">App Info</h2>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/30">
              <span className="text-sm text-[#5F5F5F]">Version</span>
              <span className="text-sm font-semibold text-[#2C2C2C]">1.1.7 </span>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/30">
              <span className="text-sm text-[#5F5F5F]">Developer</span>
              <span className="text-sm font-semibold text-[#2C2C2C]">Saad Nizami</span>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => router.push('/dashboard/creator')}
              className="w-full p-3 rounded-xl bg-white/50 border border-white/60 hover:bg-white/70 transition-all text-sm font-medium text-[#4A6C6F]"
            >
              About the Research
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Password Change Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setShowPasswordModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="backdrop-blur-[40px] bg-white/95 border border-white/60 rounded-[2rem] p-8 shadow-2xl max-w-md w-full"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#4A6C6F]/20 flex items-center justify-center">
                  <Lock className="w-6 h-6 text-[#4A6C6F]" />
                </div>
                <h2 className="text-2xl font-bold text-[#2C2C2C]">Change Password</h2>
              </div>

              <div className="space-y-4 mb-6">
                {/* Email Display */}
                <div>
                  <label className="block text-sm font-medium text-[#5F5F5F] mb-2">
                    Email
                  </label>
                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/30 border border-white/40 text-[#5F5F5F]">
                    <Mail className="w-4 h-4" />
                    <span>{email}</span>
                  </div>
                </div>

                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium text-[#5F5F5F] mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-12 rounded-xl bg-white/60 border border-white/60 text-[#2C2C2C] focus:outline-none focus:ring-2 focus:ring-[#4A6C6F]/50 transition-all"
                      placeholder="Enter current password"
                    />
                    <button
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5F5F5F] hover:text-[#2C2C2C]"
                    >
                      {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-[#5F5F5F] mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-12 rounded-xl bg-white/60 border border-white/60 text-[#2C2C2C] focus:outline-none focus:ring-2 focus:ring-[#4A6C6F]/50 transition-all"
                      placeholder="Enter new password"
                    />
                    <button
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5F5F5F] hover:text-[#2C2C2C]"
                    >
                      {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-[#5F5F5F] mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/60 border border-white/60 text-[#2C2C2C] focus:outline-none focus:ring-2 focus:ring-[#4A6C6F]/50 transition-all"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handlePasswordChange}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#4A6C6F] to-[#4A6C6F]/80 text-white font-semibold shadow-xl"
                >
                  Update Password
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowPasswordModal(false)
                    setCurrentPassword('')
                    setNewPassword('')
                    setConfirmPassword('')
                  }}
                  className="px-6 py-3 rounded-xl bg-white/60 border border-white/60 text-[#2C2C2C] font-semibold"
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Account Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="backdrop-blur-[40px] bg-white/95 border border-white/60 rounded-[2rem] p-8 shadow-2xl max-w-md w-full"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#D2691E]/20 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-[#D2691E]" />
                </div>
                <h2 className="text-2xl font-bold text-[#D2691E]">Delete Account?</h2>
              </div>

              <p className="text-[#2C2C2C] mb-4">
                <strong>This action is PERMANENT and cannot be undone.</strong>
              </p>

              <p className="text-[#2C2C2C] mb-4">
                All your data will be completely deleted from everywhere:
              </p>

              <ul className="space-y-2 mb-6 text-sm text-[#5F5F5F]">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#D2691E]" />
                  Profile and account from Supabase
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#D2691E]" />
                  All mood and stress logs from database
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#D2691E]" />
                  Journal entries from local storage
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#D2691E]" />
                  All activity data and statistics
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#D2691E]" />
                  Profile picture and preferences
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#D2691E]" />
                  All browser cookies and cache
                </li>
              </ul>

              <div className="p-3 rounded-xl bg-[#D2691E]/10 border border-[#D2691E]/30 mb-6">
                <p className="text-xs text-[#D2691E] font-medium">
                  ⚠️ You will be immediately logged out and cannot recover this account.
                </p>
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDeleteAccount}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#D2691E] to-[#D2691E]/80 text-white font-semibold shadow-xl"
                >
                  Yes, Delete Everything
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowDeleteModal(false)}
                  className="px-6 py-3 rounded-xl bg-white/60 border border-white/60 text-[#2C2C2C] font-semibold"
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reset Data Modal */}
      <AnimatePresence>
        {showResetModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setShowResetModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="backdrop-blur-[40px] bg-white/95 border border-white/60 rounded-[2rem] p-8 shadow-2xl max-w-md w-full"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#D2691E]/20 flex items-center justify-center">
                  <RotateCcw className="w-6 h-6 text-[#D2691E]" />
                </div>
                <h2 className="text-2xl font-bold text-[#2C2C2C]">Clear Data?</h2>
              </div>

              <p className="text-[#2C2C2C] mb-4">
                {resetType === 'all' 
                  ? 'This will clear all your locally stored data including journal entries, pomodoro statistics, and preferences.'
                  : `This will clear your ${resetType} data from local storage.`}
              </p>

              <p className="text-sm text-[#5F5F5F] mb-6">
                Note: Data stored in the database (moods, academic stress) will remain for research purposes. Your account will not be affected.
              </p>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleResetData}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#D2691E] to-[#D2691E]/80 text-white font-semibold shadow-xl"
                >
                  Yes, Clear Data
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowResetModal(false)}
                  className="px-6 py-3 rounded-xl bg-white/60 border border-white/60 text-[#2C2C2C] font-semibold"
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