'use client'

import { motion } from 'framer-motion'
import { MessageCircle, Heart, BookOpen, Timer, Wind, TrendingUp, Brain, Phone, ArrowRight, Sparkles } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

const FEATURES = [
  { icon: MessageCircle, label: 'AI Companion',     desc: 'Talk to Kokoro — an empathetic AI built for Pakistani students.',    color: '#2DD4BF' },
  { icon: Heart,         label: 'Mood Tracker',     desc: 'Log your feelings daily and spot emotional patterns over time.',       color: '#F97316' },
  { icon: BookOpen,      label: 'Private Journal',  desc: "Write freely in a safe, judgment-free space that's entirely yours.",   color: '#818CF8' },
  { icon: Timer,         label: 'Focus Timer',      desc: 'Stay productive with science-backed Pomodoro work sessions.',           color: '#F97316' },
  { icon: Wind,          label: 'Breathing Guides', desc: 'Four calming techniques to reduce stress in just a few minutes.',       color: '#818CF8' },
  { icon: TrendingUp,    label: 'Mood Insights',    desc: 'Beautiful graphs reveal trends in your emotional wellbeing.',           color: '#2DD4BF' },
  { icon: Brain,         label: 'Academic Stress',  desc: 'Track and manage academic pressure with data-driven insight.',          color: '#EF4444' },
  { icon: Phone,         label: 'Crisis Helplines', desc: 'Instant access to mental health resources 24/7.',                       color: '#4ADE80' },
]

const stagger = {
  container: { hidden: {}, show: { transition: { staggerChildren: 0.07 } } },
  item: { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 280, damping: 24 } } },
}

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: '#0B0D14', color: '#F1F5F9' }}>

      {/* ── Nav ── */}
      <header className="flex items-center justify-between px-6 sm:px-10 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="Satori" width={32} height={32} className="object-contain" />
          <span
            className="text-[22px]"
            style={{ fontFamily: 'var(--font-instrument), Georgia, serif', color: '#F1F5F9' }}
          >
            Satori
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/auth"
            className="text-sm font-medium px-4 py-2 rounded-xl transition-all hover:bg-[rgba(255,255,255,0.04)]"
            style={{ color: '#94A3B8' }}
          >
            Sign in
          </Link>
          <Link
            href="/auth"
            className="text-sm font-semibold px-5 py-2.5 rounded-xl transition-all hover:opacity-90"
            style={{ background: '#14B8A6', color: '#fff' }}
          >
            Get started
          </Link>
        </div>
      </header>

      {/* ── Hero ── */}
      <section
        className="flex flex-col items-center text-center px-6 pt-20 pb-28 sm:pt-28"
        style={{ background: 'radial-gradient(ellipse at 30% 40%, rgba(45,212,191,0.06) 0%, transparent 60%)' }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl"
        >
          <span
            className="inline-flex items-center gap-1.5 text-xs font-medium px-4 py-1.5 rounded-full mb-6"
            style={{ background: 'rgba(45,212,191,0.08)', border: '1px solid rgba(45,212,191,0.2)', color: '#2DD4BF' }}
          >
            <Sparkles className="w-3 h-3" />
            Mental Wellness for Pakistani Students
          </span>

          <h1
            className="text-5xl sm:text-6xl md:text-7xl leading-tight mb-6"
            style={{ fontFamily: 'var(--font-instrument), Georgia, serif', color: '#F1F5F9' }}
          >
            Find your inner{' '}
            <span className="italic text-gradient">calm</span>
          </h1>

          <p className="text-lg sm:text-xl max-w-xl mx-auto mb-10 leading-relaxed" style={{ color: '#94A3B8' }}>
            Satori is your private companion for mental wellness — mood tracking, AI support,
            journaling, and breathwork, all in one dark, focused space.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
            <Link
              href="/auth"
              className="group inline-flex items-center gap-2 font-semibold px-8 py-4 rounded-2xl shadow-xl transition-all duration-300 hover:-translate-y-0.5"
              style={{ background: '#14B8A6', color: '#fff', boxShadow: '0 0 30px rgba(45,212,191,0.2)' }}
            >
              Start your journey
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <div className="flex items-center gap-2 text-xs" style={{ color: '#475569' }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#4ADE80' }} />
              Free · Private · No ads
            </div>
          </div>
        </motion.div>

        {/* Hero chat preview */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mt-16 w-full max-w-sm rounded-3xl p-6 text-left shadow-2xl"
          style={{ background: '#13161F', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 0 0 1px rgba(255,255,255,0.06), 0 24px 48px rgba(0,0,0,0.5)' }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(45,212,191,0.15)' }}>
              <MessageCircle className="w-4 h-4" style={{ color: '#2DD4BF' }} />
            </div>
            <div>
              <p className="text-xs font-semibold" style={{ color: '#F1F5F9' }}>Kokoro AI</p>
              <p className="text-[10px]" style={{ color: '#475569' }}>Your wellness companion</p>
            </div>
            <span className="ml-auto flex items-center gap-1 text-[10px] font-medium" style={{ color: '#4ADE80' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80]" />
              Online
            </span>
          </div>
          <div className="space-y-2.5">
            <div className="px-3.5 py-2.5 max-w-[82%] rounded-2xl rounded-tl-sm" style={{ background: '#1C2030' }}>
              <p className="text-xs leading-relaxed" style={{ color: '#94A3B8' }}>How are you feeling today? I'm here to listen without judgment.</p>
            </div>
            <div className="px-3.5 py-2.5 max-w-[80%] ml-auto rounded-2xl rounded-tr-sm" style={{ background: '#14B8A6' }}>
              <p className="text-xs leading-relaxed text-white">A little anxious about exams…</p>
            </div>
            <div className="px-3.5 py-2.5 max-w-[85%] rounded-2xl rounded-tl-sm" style={{ background: '#1C2030' }}>
              <p className="text-xs leading-relaxed" style={{ color: '#94A3B8' }}>That's completely valid. Let's try a breathing exercise together.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Features grid ── */}
      <section className="px-6 sm:px-10 pb-24 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2
            className="text-3xl sm:text-4xl mb-3"
            style={{ fontFamily: 'var(--font-instrument), Georgia, serif', color: '#F1F5F9' }}
          >
            Everything you need to thrive
          </h2>
          <p className="max-w-md mx-auto" style={{ color: '#475569' }}>
            Eight tools, designed around the real needs of students navigating academic pressure.
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
            <motion.div
              key={label}
              variants={stagger.item}
              className="rounded-2xl p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl cursor-default"
              style={{ background: '#13161F', border: '1px solid rgba(255,255,255,0.06)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${color}30` }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)' }}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3" style={{ background: `${color}15` }}>
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
              <p className="text-sm font-semibold mb-1" style={{ color: '#F1F5F9' }}>{label}</p>
              <p className="text-[11px] leading-relaxed" style={{ color: '#475569' }}>{desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── CTA ── */}
      <section className="px-6 pb-24 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-lg mx-auto rounded-3xl p-10 shadow-2xl"
          style={{
            background: '#13161F',
            border: '1px solid rgba(45,212,191,0.15)',
            boxShadow: '0 0 0 1px rgba(255,255,255,0.06), 0 0 60px rgba(45,212,191,0.06)',
          }}
        >
          <h2
            className="text-3xl mb-3"
            style={{ fontFamily: 'var(--font-instrument), Georgia, serif', color: '#F1F5F9' }}
          >
            Ready to begin?
          </h2>
          <p className="text-sm mb-6" style={{ color: '#475569' }}>
            Join Satori and take your first step toward better mental wellbeing.
          </p>
          <Link
            href="/auth"
            className="group inline-flex items-center gap-2 font-semibold px-8 py-3.5 rounded-2xl transition-all duration-300 hover:-translate-y-0.5"
            style={{ background: '#14B8A6', color: '#fff', boxShadow: '0 0 20px rgba(45,212,191,0.2)' }}
          >
            Create your free account
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <p className="mt-4 text-[11px]" style={{ color: '#475569' }}>Your data stays private. Always.</p>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="text-center pb-8 text-xs border-t pt-6" style={{ color: '#475569', borderColor: 'rgba(255,255,255,0.06)' }}>
        2026 Satori · Built with care for student mental health
      </footer>
    </div>
  )
}
