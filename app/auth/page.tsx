'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import { MeshGradient } from '@/components/MeshGradient'
import { Mail, Lock, Eye, EyeOff, Chrome } from 'lucide-react'
import Image from 'next/image'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [redirectUrl, setRedirectUrl] = useState('')
  const router = useRouter()

  useEffect(() => {
    // Set redirect URL on client side only
    setRedirectUrl(`${window.location.origin}/auth/callback`)

    // Check if user is already logged in
    const checkExistingSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (session) {
        // User is already logged in, redirect to dashboard
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', session.user.id)
          .single()

        if (profile?.onboarding_completed) {
          router.push('/dashboard')
        } else {
          router.push('/onboarding')
        }
      }
    }

    checkExistingSession()
  }, [router])

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error

        if (data.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('onboarding_completed')
            .eq('id', data.user.id)
            .single()

          if (profile?.onboarding_completed) {
            router.push('/dashboard')
          } else {
            router.push('/onboarding')
          }
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        })

        if (error) throw error

        if (data.user) {
          router.push('/onboarding')
        }
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    if (!redirectUrl) return
    
    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (error) throw error
    } catch (error: any) {
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      <MeshGradient />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="backdrop-blur-[40px] bg-white/40 border border-white/60 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 shadow-2xl">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-6 sm:mb-8">
            <Image
              src="/logo.png"
              alt="Satori Logo"
              width={40}
              height={40}
              className="sm:w-12 sm:h-12 object-contain drop-shadow-lg"
            />
            <h1 className="text-3xl sm:text-4xl font-serif font-medium text-[#2C2C2C]">Satori</h1>
          </div>

          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-[#2C2C2C] mb-2">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-sm sm:text-base text-[#5F5F5F]">
              {isLogin ? 'Sign in to continue your journey' : 'Start your wellness journey'}
            </p>
          </div>

          {/* Google Sign In */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGoogleSignIn}
            disabled={loading || !redirectUrl}
            className="w-full flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-white/60 border border-white/60 text-[#2C2C2C] font-medium text-sm sm:text-base shadow-lg hover:bg-white/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-5 sm:mb-6"
          >
            <Chrome className="w-5 h-5 text-[#4285F4]" />
            Continue with Google
          </motion.button>

          {/* Divider */}
          <div className="flex items-center gap-3 sm:gap-4 mb-5 sm:mb-6">
            <div className="flex-1 h-px bg-white/40"></div>
            <span className="text-xs sm:text-sm text-[#5F5F5F]">or</span>
            <div className="flex-1 h-px bg-white/40"></div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-3 sm:space-y-4">
            {/* Email Input */}
            <div className="relative">
              <Mail className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5F5F5F]" />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-white/60 border border-white/60 text-[#2C2C2C] text-sm sm:text-base placeholder-[#5F5F5F] focus:outline-none focus:ring-2 focus:ring-[#4A6C6F]/50 transition-all"
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <Lock className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5F5F5F]" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-white/60 border border-white/60 text-[#2C2C2C] text-sm sm:text-base placeholder-[#5F5F5F] focus:outline-none focus:ring-2 focus:ring-[#4A6C6F]/50 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-[#5F5F5F] hover:text-[#2C2C2C] transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-red-50/60 border border-red-200/60 text-red-600 text-xs sm:text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#4A6C6F] to-[#6B6B6B] text-white font-semibold text-sm sm:text-base shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Sign Up'}
            </motion.button>
          </form>

          {/* Toggle Login/Signup */}
          <div className="mt-5 sm:mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin)
                setError('')
              }}
              className="text-[#4A6C6F] hover:text-[#2C2C2C] font-medium text-sm sm:text-base transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}