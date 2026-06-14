'use client'

import { motion } from 'framer-motion'
import { MeshGradient } from '@/components/MeshGradient'
import { MessageCircle, Heart, BookOpen, Timer, Wind, TrendingUp, Brain, Phone, ArrowRight, Sparkles } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

const FEATURES = [
  { icon: MessageCircle, label: 'AI Companion',      desc: 'Talk to Kokoro — your empathetic AI wellness guide.',    color: '#4A6C6F' },
  { icon: Heart,         label: 'Mood Tracker',      desc: 'Log your feelings daily and spot emotional patterns.',    color: '#C4661F' },
  { icon: BookOpen,      label: 'Private Journal',   desc: 'Write freely in a safe, judgment-free space.',           color: '#5F7F82' },
  { icon: Timer,         label: 'Focus Timer',       desc: 'Stay productive with science-backed Pomodoro sessions.', color: '#8B6555' },
  { icon: Wind,          label: 'Breathing Guides',  desc: 'Six calming techniques to reduce stress in minutes.',    color: '#6A8C6F' },
  { icon: TrendingUp,    label: 'Mood Insights',     desc: 'Beautiful graphs reveal trends in your well-being.',     color: '#7A6C9F' },
  { icon: Brain,         label: 'Academic Stress',   desc: 'Track and manage academic pressure with data.',          color: '#9F6C5F' },
  { icon: Phone,         label: 'Crisis Helplines',  desc: 'Instant access to mental health resources 24/7.',        color: '#4A7C6F' },
]

const stagger = {
  container: { hidden: {}, show: { transition: { staggerChildren: 0.07 } } },
  item: { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 280, damping: 24 } } },
}

export default function LandingPage() {
  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <MeshGradient />

      {/* ── Nav ── */}
      <header className="relative z-20 flex items-center justify-between px-6 sm:px-10 py-5">
        <div className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="Satori" width={36} height={36} className="object-contain drop-shadow" />
          <span className="text-2xl font-serif font-semibold text-[#2C2C2C]">Satori</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/auth"
            className="text-sm font-medium text-[#5F5F5F] hover:text-[#2C2C2C] transition-colors px-4 py-2 rounded-xl hover:bg-white/40"
          >
            Sign in
          </Link>
          <Link
            href="/auth"
            className="text-sm font-semibold bg-[#4A6C6F] text-white px-5 py-2.5 rounded-xl shadow-lg hover:bg-[#3A5C5F] transition-all"
          >
            Get started
          </Link>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-16 pb-24 sm:pt-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#4A6C6F] bg-[#4A6C6F]/10 border border-[#4A6C6F]/20 px-4 py-1.5 rounded-full mb-6">
            <Sparkles className="w-3 h-3" />
            Mental Wellness for Pakistani Students
          </span>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-serif font-semibold text-[#2C2C2C] leading-tight mb-6 max-w-3xl">
            Find your inner{' '}
            <span className="text-gradient">calm</span>
          </h1>

          <p className="text-lg sm:text-xl text-[#5F5F5F] max-w-xl mx-auto mb-10 leading-relaxed">
            Satori is your private companion for mental wellness — mood tracking, AI support,
            journaling, and breathwork, all in one beautiful space.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
            <Link
              href="/auth"
              className="group inline-flex items-center gap-2 bg-linear-to-r from-[#4A6C6F] to-[#5A8C8F] text-white font-semibold px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300"
            >
              Start your journey
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <span className="text-xs text-[#9F9F9F]">Free · Private · No ads</span>
          </div>
        </motion.div>

        {/* Hero card preview */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mt-16 w-full max-w-sm"
        >
          <div className="glass rounded-3xl p-6 shadow-2xl text-left">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-[#4A6C6F]/15 flex items-center justify-center">
                <MessageCircle className="w-4.5 h-4.5 text-[#4A6C6F]" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#2C2C2C]">Kokoro AI</p>
                <p className="text-[10px] text-[#9F9F9F]">Your wellness companion</p>
              </div>
              <span className="ml-auto flex items-center gap-1 text-[10px] text-green-600 font-medium">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                Online
              </span>
            </div>
            <div className="space-y-2.5">
              <div className="bg-[#4A6C6F]/10 rounded-2xl rounded-tl-sm px-3.5 py-2.5 max-w-[80%]">
                <p className="text-xs text-[#2C2C2C] leading-relaxed">How are you feeling today? I'm here to listen without judgment 💙</p>
              </div>
              <div className="bg-white/70 rounded-2xl rounded-tr-sm px-3.5 py-2.5 max-w-[80%] ml-auto text-right">
                <p className="text-xs text-[#2C2C2C] leading-relaxed">A little anxious about exams…</p>
              </div>
              <div className="bg-[#4A6C6F]/10 rounded-2xl rounded-tl-sm px-3.5 py-2.5 max-w-[85%]">
                <p className="text-xs text-[#2C2C2C] leading-relaxed">That's completely valid. Let's try a 4-7-8 breathing exercise together ✨</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Features grid ── */}
      <section className="relative z-10 px-6 sm:px-10 pb-24 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-serif font-semibold text-[#2C2C2C] mb-3">
            Everything you need to thrive
          </h2>
          <p className="text-[#5F5F5F] max-w-md mx-auto">
            Eight powerful tools, designed around the needs of students navigating academic pressure.
          </p>
        </motion.div>

        <motion.div
          variants={stagger.container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
        >
          {FEATURES.map(({ icon: Icon, label, desc, color }) => (
            <motion.div key={label} variants={stagger.item}>
              <div className="glass rounded-2xl p-4 h-full hover:bg-white/50 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg cursor-default">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                  style={{ backgroundColor: `${color}18` }}
                >
                  <Icon className="w-4.5 h-4.5" style={{ color }} />
                </div>
                <p className="text-sm font-semibold text-[#2C2C2C] mb-1">{label}</p>
                <p className="text-[11px] text-[#9F9F9F] leading-relaxed">{desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── CTA ── */}
      <section className="relative z-10 px-6 pb-24 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass-strong rounded-3xl p-10 max-w-lg mx-auto shadow-2xl"
        >
          <h2 className="text-3xl font-serif font-semibold text-[#2C2C2C] mb-3">Ready to begin?</h2>
          <p className="text-[#5F5F5F] text-sm mb-6">
            Join Satori and take your first step toward better mental well-being.
          </p>
          <Link
            href="/auth"
            className="group inline-flex items-center gap-2 bg-linear-to-r from-[#4A6C6F] to-[#5A8C8F] text-white font-semibold px-8 py-3.5 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
          >
            Create your free account
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <p className="mt-4 text-[11px] text-[#C0BAB2]">
            Your data stays private. Always.
          </p>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 text-center pb-8 text-xs text-[#C0BAB2]">
        © 2025 Satori · Built with care for student mental health
      </footer>
    </div>
  )
}
