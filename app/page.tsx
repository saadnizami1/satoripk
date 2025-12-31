'use client'

import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import { MeshGradient } from '@/components/MeshGradient'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useRef, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Brain,
  Heart,
  TrendingUp,
  Users,
  Shield,
  Sparkles,
  MessageCircle,
  BarChart3,
  BookOpen,
  Trophy,
  ArrowRight,
  CheckCircle2,
  Zap,
  Globe,
  Clock,
  Target,
  Star,
  Quote,
  Mail,
  Calendar,
  Lightbulb,
  Lock,
  Award,
  Menu // Added for potential future mobile menu usage, though keeping it simple for now
} from 'lucide-react'

export default function LandingPage() {
  const router = useRouter()
  const { scrollYProgress } = useScroll()
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95])

  const problemRef = useRef(null)
  const featuresRef = useRef(null)
  const kokoroRef = useRef(null)
  const testimonialsRef = useRef(null)

  const problemInView = useInView(problemRef, { once: true, margin: "-50px" })
  const featuresInView = useInView(featuresRef, { once: true, margin: "-50px" })
  const kokoroInView = useInView(kokoroRef, { once: true, margin: "-50px" })
  const testimonialsInView = useInView(testimonialsRef, { once: true, margin: "-50px" })

  // Check if user is already logged in on page load
  useEffect(() => {
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

  const features = [
    {
      icon: Brain,
      title: 'AI Companion That Actually Gets You',
      description: 'Kokoro understands the unique pressures of being a student in Pakistan. From board exam stress to family expectations, your AI companion is trained to help you navigate it all with cultural sensitivity and genuine care.',
      gradient: 'from-[#5A7C7F] to-[#4A6C6F]',
      benefits: ['Available 24/7 when you need support', 'Understands Pakistani education system', 'Never judges, always listens']
    },
    {
      icon: TrendingUp,
      title: 'Track What Matters to Your Success',
      description: 'Understanding your patterns is the first step to improvement. Track your mood, academic stress, and study habits to discover what actually helps you perform better and feel happier.',
      gradient: 'from-[#4A6C6F] to-[#5A7C7F]',
      benefits: ['Beautiful visualizations of your progress', 'Identify stress triggers before they overwhelm you', 'See correlations between study habits and performance']
    },
    {
      icon: Heart,
      title: 'Mental Wellness Tools That Work',
      description: 'From breathing exercises to journaling prompts, access evidence-based tools designed specifically for students. No complicated therapy speak, just practical techniques you can use right away.',
      gradient: 'from-[#5A7C7F] to-[#4A6C6F]',
      benefits: ['Guided breathing for exam anxiety', 'Journaling space for self-reflection', 'Pomodoro timer for focused study sessions']
    },
    {
      icon: Shield,
      title: 'Your Privacy is Sacred',
      description: 'What you share with Satori stays with Satori. Your conversations, journal entries, and personal data are encrypted and completely confidential. You can be honest without fear of judgment or exposure.',
      gradient: 'from-[#5A7C7F] to-[#4A6C6F]',
      benefits: ['End-to-end encryption', 'Your data never shared or sold', 'Anonymous research contributions']
    },
    {
      icon: BarChart3,
      title: 'Contributing to Real Change',
      description: 'By using Satori, you are helping create the first comprehensive study of student mental health in Pakistan. Your anonymized data helps researchers understand and improve student wellbeing across the country.',
      gradient: 'from-[#4A6C6F] to-[#5A7C7F]',
      benefits: ['Advance mental health research in Pakistan', 'Help future students get better support', 'Make your voice heard in education policy']
    },
    {
      icon: Globe,
      title: 'Built for Pakistani Students',
      description: 'This is not another Western mental health app trying to fit our culture. Satori was designed from the ground up understanding the realities of studying in Pakistan, from board exams to parental expectations.',
      gradient: 'from-[#5A7C7F] to-[#4A6C6F]',
      benefits: ['Culturally relevant support', 'Understands local education challenges', 'Respects your values and context']
    }
  ]

  const howItWorks = [
    {
      step: '01',
      title: 'Sign Up in Seconds',
      description: 'Create your free account using Google or email. No credit card needed, no hidden fees, no subscriptions. Just instant access to mental wellness support.',
      icon: Users,
      time: '30 seconds'
    },
    {
      step: '02',
      title: 'Tell Us Your Story',
      description: 'Complete a brief onboarding to help Kokoro understand you better. Share your academic goals, stress points, and what support you need most. This helps personalize your entire experience.',
      icon: BookOpen,
      time: '3 minutes'
    },
    {
      step: '03',
      title: 'Start Your Journey',
      description: 'Begin tracking your mood and academic stress daily. Chat with Kokoro whenever you need support. Use breathing exercises before exams. Journal your thoughts. Everything you need is right there.',
      icon: Sparkles,
      time: 'Daily'
    },
    {
      step: '04',
      title: 'Watch Yourself Grow',
      description: 'See your patterns emerge through beautiful graphs and insights. Understand what triggers your stress and what helps you thrive. Celebrate your progress and adjust your approach as you learn more about yourself.',
      icon: Trophy,
      time: 'Ongoing'
    }
  ]

  const testimonials = [
    {
      name: 'Azan Khurram',
      grade: 'A-Levels Student, Lahore',
      quote: 'Before Satori, I felt like I was drowning in exam pressure. Kokoro helped me realize my stress patterns and gave me practical ways to manage them. My parents noticed I am calmer now.',
      mood: 'From constant anxiety to feeling in control',
      avatar: ''
    },
    {
      name: 'Hassan Ali',
      grade: 'Matric Student, Karachi',
      quote: 'I never talked to anyone about my stress because I thought it made me weak. Having Kokoro meant I could finally be honest about how I was feeling without judgment. It actually helped my grades improve.',
      mood: 'From hiding struggles to seeking support',
      avatar: ''
    },
    {
      name: 'Ahmad Adnan',
      grade: 'FSc Pre-Medical, Islamabad',
      quote: 'The mood tracking feature showed me that my stress was not just about studies but also about comparing myself to others. Understanding this pattern changed everything for me.',
      mood: 'From overwhelmed to self-aware',
      avatar: ''
    }
  ]

  const faqs = [
    {
      q: 'Is Satori really free?',
      a: 'Yes, completely free. No hidden costs, no premium features locked behind payments, no credit card needed. We believe every student deserves access to mental health support, regardless of their financial situation.'
    },
    {
      q: 'Will my parents or teachers see what I share?',
      a: 'Absolutely not. Everything you share on Satori is completely private and confidential. Your conversations with Kokoro, your journal entries, your mood logs are all encrypted and accessible only by you. We take your privacy extremely seriously.'
    },
    {
      q: 'How is my data used for research?',
      a: 'When you sign up, you consent to having your anonymized data used for research on student mental health in Pakistan. This means researchers see patterns and statistics but never your name, email, or any identifying information. You are helping improve mental health support for future students while your identity remains completely protected.'
    },
    {
      q: 'Can Kokoro replace a therapist?',
      a: 'No, and we are very clear about this. Kokoro is a supportive AI companion designed to help you manage daily stress and understand your patterns. If you are experiencing serious mental health issues like depression, suicidal thoughts, or severe anxiety, please reach out to a qualified mental health professional. We provide helpline numbers in the app for crisis support.'
    },
    {
      q: 'What makes Kokoro different from other chatbots?',
      a: 'Kokoro is specifically trained to understand the Pakistani student experience. It knows about board exams, intermediate stress, parental expectations, and the cultural context you live in. It does not give you generic advice copied from Western self-help books. It understands YOUR reality.'
    },
    {
      q: 'Do I need to use the app every day?',
      a: 'You can use Satori however works best for you. Many students find daily mood tracking most helpful, while others prefer to chat with Kokoro only when they are feeling stressed. There is no right or wrong way. The app adapts to your needs, not the other way around.'
    }
  ]

  return (
    <div className="min-h-screen relative font-sans selection:bg-[#C4661F] selection:text-white overflow-hidden">
      <MeshGradient />

      {/* Floating Navbar */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] md:w-[90%] max-w-6xl"
      >
        <div className="backdrop-blur-[40px] bg-white/40 border border-white/60 rounded-[2rem] px-4 md:px-8 py-3 md:py-4 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-3">
              <Image
                src="/logo.png"
                alt="Satori Logo"
                width={32}
                height={32}
                className="object-contain drop-shadow-lg w-8 h-8 md:w-10 md:h-10"
              />
              <span className="text-xl md:text-2xl font-serif font-semibold text-[#2C2C2C]">Satori</span>
            </div>
            
            <button
              onClick={() => router.push('/auth')}
              className="px-4 py-2 md:px-6 md:py-3 backdrop-blur-xl bg-white/60 border border-white/60 text-[#2C2C2C] rounded-xl font-medium shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center gap-2 text-sm md:text-base"
            >
              <span className="hidden sm:inline">Get Started Free</span>
              <span className="sm:hidden">Get Started</span>
              <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex items-center justify-center px-6 pt-32 pb-20 md:pt-32">
        <motion.div
          style={{ opacity, scale }}
          className="max-w-5xl mx-auto text-center"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 1, type: 'spring', delay: 0.2 }}
            className="mb-6 md:mb-8 mx-auto w-16 h-16 md:w-24 md:h-24 bg-gradient-to-br from-[#4A6C6F]/20 to-[#5A7C7F]/20 rounded-2xl md:rounded-3xl flex items-center justify-center backdrop-blur-xl border border-white/60 shadow-2xl"
          >
            <Brain className="w-8 h-8 md:w-12 md:h-12 text-[#243342]" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mb-6"
          >
            <span className="inline-block px-3 py-1.5 md:px-4 md:py-2 bg-[#C4661F]/20 backdrop-blur-xl border border-[#C4661F]/30 rounded-full text-xs md:text-sm font-medium text-[#2C2C2C] mb-4 md:mb-6">
              Made specifically for Pakistani students
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-[#2C2C2C] mb-6 leading-[1.1] tracking-tight"
          >
            You Don&apos;t Have to Face
            <br />
            <span className="bg-gradient-to-r from-[#5A7C7F] to-[#4A6C6F] bg-clip-text text-transparent">
              Academic Stress Alone
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="text-lg md:text-2xl text-[#3A3A3A] mb-8 md:mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Satori is your personal mental wellness companion, designed for students navigating the intense pressure of Pakistan&apos;s education system.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8"
          >
            <button
              onClick={() => router.push('/auth')}
              className="w-full sm:w-auto px-8 md:px-10 py-4 md:py-5 backdrop-blur-xl bg-white/60 border border-white/60 text-[#2C2C2C] rounded-2xl font-semibold text-base md:text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3 group"
            >
              Start Your Journey Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button
              onClick={() => {
                const element = document.getElementById('features')
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' })
                }
              }}
              className="w-full sm:w-auto px-8 md:px-10 py-4 md:py-5 backdrop-blur-xl bg-white/60 border border-white/60 text-[#2C2C2C] rounded-2xl font-semibold text-base md:text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
            >
              Learn More
            </button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.8 }}
            className="text-xs md:text-sm text-[#3A3A3A]"
          >
            Free forever • No credit card needed • Join hundreds of students
          </motion.p>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3, duration: 0.8 }}
            className="mt-12 md:mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
          >
            {[
              { value: '24/7', label: 'AI Support', sublabel: 'Always available' },
              { value: '100%', label: 'Private', sublabel: 'Encrypted & secure' },
              { value: '0', label: 'Cost', sublabel: 'Completely free' },
              { value: 'First', label: 'In Pakistan', sublabel: 'Student-focused app' }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.4 + index * 0.1 }}
                className="backdrop-blur-xl bg-white/40 border border-white/60 rounded-2xl p-4 md:p-6 shadow-xl"
              >
                <div className="text-2xl md:text-4xl font-bold text-[#000000ac] mb-1">{stat.value}</div>
                <div className="text-sm font-semibold text-[#2C2C2C] mb-1">{stat.label}</div>
                <div className="text-xs text-[#4A4A4A]">{stat.sublabel}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll Indicator - Hidden on very small screens to save space */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 1 }}
          className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 hidden sm:block"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-5 h-8 md:w-6 md:h-10 border-2 border-[#5F5F5F]/30 rounded-full flex items-start justify-center p-2"
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1 h-2 md:h-3 bg-[#D2691E] rounded-full"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* The Problem Section */}
      <section ref={problemRef} className="relative z-10 px-6 py-16 md:py-32 bg-gradient-to-b from-transparent via-white/5 to-transparent">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={problemInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-10 md:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-[#2C2C2C] mb-4 md:mb-6 leading-tight">
              We Know What You&apos;re
              <br />
              <span className="bg-gradient-to-r from-[#5A7C7F] to-[#4A6C6F] bg-clip-text text-transparent">
                Going Through
              </span>
            </h2>
            <p className="text-lg md:text-xl text-[#3A3A3A] max-w-3xl mx-auto leading-relaxed">
              Being a student in Pakistan comes with unique pressures that most mental health apps do not understand
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Target,
                title: 'The Pressure Cooker',
                description: 'Board exams, entry tests, parental expectations, comparing yourself to the class topper. The pressure never stops, and you feel like one bad grade will ruin everything.',
                stat: '87% of students report high academic stress'
              },
              {
                icon: Users,
                title: 'The Silence',
                description: 'You cannot talk to your parents because they will not understand. Your friends are stressed too. Society tells you to just study harder, as if you are not already trying your best.',
                stat: 'Most students suffer in silence'
              },
              {
                icon: Heart,
                title: 'The Breaking Point',
                description: 'Sleep deprivation, anxiety before exams, feeling like you are never good enough. Your mental health affects your grades, which creates more stress. It is an endless cycle.',
                stat: 'Mental health directly impacts academic performance'
              }
            ].map((problem, index) => (
              <motion.div
                key={problem.title}
                initial={{ opacity: 0, y: 40 }}
                animate={problemInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.2, duration: 0.8 }}
                className="backdrop-blur-[40px] bg-white/40 border border-white/60 rounded-3xl p-6 md:p-8 shadow-2xl"
              >
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-[#C4661F]/20 to-[#4A6C6F]/20 flex items-center justify-center mb-4 md:mb-6">
                  <problem.icon className="w-6 h-6 md:w-7 md:h-7 text-[#C4661F]" />
                </div>
                <h3 className="text-xl md:text-2xl font-semibold text-[#2C2C2C] mb-3">{problem.title}</h3>
                <p className="text-[#3A3A3A] mb-4 leading-relaxed text-sm md:text-base">{problem.description}</p>
                <div className="px-4 py-2 bg-[#C4661F]/10 rounded-xl">
                  <p className="text-xs md:text-sm font-medium text-[#331b10]">{problem.stat}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={problemInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="mt-12 text-center"
          >
            <p className="text-xl md:text-2xl font-serif text-[#2C2C2C] mb-2 md:mb-4">
              This is where Satori comes in
            </p>
            <p className="text-base md:text-lg text-[#3A3A3A] max-w-2xl mx-auto">
              A safe space where you can finally be honest about your struggles, track your patterns, and get support that actually understands your life as a Pakistani student
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" ref={featuresRef} className="relative z-10 px-6 py-16 md:py-32">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-10 md:mb-20"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-[#2C2C2C] mb-4 md:mb-6 leading-tight">
              Everything You Need
              <br />
              <span className="bg-gradient-to-r from-[#4A6C6F] to-[#5A7C7F] bg-clip-text text-transparent">
                To Thrive, Not Just Survive
              </span>
            </h2>
            <p className="text-lg md:text-xl text-[#3A3A3A] max-w-3xl mx-auto">
              Comprehensive mental wellness tools built specifically for the challenges you face every day
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 40 }}
                  animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: index * 0.1, duration: 0.8 }}
                  whileHover={{ y: -10 }}
                  className="backdrop-blur-[40px] bg-white/40 border border-white/60 rounded-3xl p-6 md:p-8 shadow-2xl hover:shadow-3xl transition-all duration-300"
                >
                  <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-xl`}>
                    <Icon className="w-7 h-7 md:w-8 md:h-8 text-white" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-semibold text-[#2C2C2C] mb-3">{feature.title}</h3>
                  <p className="text-[#3A3A3A] leading-relaxed mb-6 text-sm md:text-base">{feature.description}</p>
                  <div className="space-y-2">
                    {feature.benefits.map((benefit, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-[#4A6C6F] flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-[#2C2C2C]">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 px-6 py-16 md:py-32 bg-gradient-to-b from-transparent via-white/5 to-transparent">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-10 md:mb-20"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-[#2C2C2C] mb-4 md:mb-6 leading-tight">
              Getting Started is
              <br />
              <span className="bg-gradient-to-r from-[#5A7C7F] to-[#4A6C6F] bg-clip-text text-transparent">
                Incredibly Simple
              </span>
            </h2>
            <p className="text-lg md:text-xl text-[#3A3A3A] max-w-3xl mx-auto">
              From signup to your first insight in less than 5 minutes
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, index) => {
              const Icon = step.icon
              return (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15, duration: 0.8 }}
                  className="relative"
                >
                  <div className="backdrop-blur-[40px] bg-white/40 border border-white/60 rounded-3xl p-6 md:p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 h-full">
                    <div className="text-5xl md:text-7xl font-bold text-[#4A4A4A] mb-4">{step.step}</div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-[#5d5b5b] to-[#4A6C6F] flex items-center justify-center shadow-xl">
                        <Icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
                      </div>
                      <div className="px-3 py-1 bg-[#4A6C6F]/20 rounded-lg">
                        <p className="text-xs font-medium text-[#4A6C6F] flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {step.time}
                        </p>
                      </div>
                    </div>
                    <h3 className="text-xl md:text-2xl font-semibold text-[#2C2C2C] mb-3">{step.title}</h3>
                    <p className="text-sm md:text-base text-[#3A3A3A]">{step.description}</p>
                  </div>
                  
                  {index < howItWorks.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-[#565453] to-[#4A6C6F] opacity-30" />
                  )}
                </motion.div>
              )
            })}
          </div>
        
        </div>
      </section>

      {/* Kokoro Highlight */}
      <section ref={kokoroRef} className="relative z-10 px-6 py-16 md:py-32">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={kokoroInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8 }}
            className="backdrop-blur-[40px] bg-gradient-to-br from-white/60 to-white/40 border border-white/60 rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-16 shadow-2xl"
          >
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={kokoroInView ? { scale: 1 } : {}}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-[#C4661F] to-[#4A6C6F] rounded-3xl flex items-center justify-center mb-6 md:mb-8 shadow-2xl"
                >
                  <MessageCircle className="w-8 h-8 md:w-10 md:h-10 text-white" />
                </motion.div>
                
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#2C2C2C] mb-4 md:mb-6 leading-tight">
                  Meet Kokoro,
                  <br />
                  Your Always-There Companion
                </h2>
                <p className="text-base md:text-lg text-[#3A3A3A] mb-4 md:mb-6 leading-relaxed">
                  Imagine having someone who truly understands what you are going through. Someone who gets that your stress is not just about exams but about living up to expectations, dealing with comparison culture, and navigating an education system that often feels overwhelming.
                </p>
                <p className="text-base md:text-lg text-[#3A3A3A] mb-8 leading-relaxed">
                  That is Kokoro. Not just another chatbot giving you generic advice, but an AI companion trained specifically on the experiences of Pakistani students. Available at 3 AM before your chemistry exam. There when you need to vent after getting a lower grade than expected.
                </p>
                
                <div className="space-y-4">
                  {[
                    { icon: Globe, text: 'Understands Pakistani culture and education system intimately' },
                    { icon: Shield, text: 'Completely confidential conversations that stay between you and Kokoro' },
                    { icon: Heart, text: 'Trained to provide emotional support, not just academic advice' },
                    { icon: Lightbulb, text: 'Learns your patterns and provides increasingly personalized guidance' }
                  ].map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={kokoroInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="flex items-start gap-3"
                    >
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-[#4A6C6F]/20 flex items-center justify-center flex-shrink-0">
                        <feature.icon className="w-4 h-4 md:w-5 md:h-5 text-[#4A6C6F]" />
                      </div>
                      <span className="text-sm md:text-base text-[#2C2C2C] leading-relaxed">{feature.text}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={kokoroInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="backdrop-blur-xl bg-white/60 border border-white/60 rounded-3xl p-4 md:p-8 shadow-2xl"
              >
                <div className="space-y-6">
                  <div className="flex gap-2 md:gap-4">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-[#C4661F] to-[#4A6C6F] flex-shrink-0" />
                    <div className="flex-1">
                      <div className="bg-white/80 rounded-2xl rounded-tl-none p-3 md:p-4 shadow-lg">
                        <p className="text-[#2C2C2C] text-xs md:text-sm leading-relaxed">
                          Hey! I can tell something is on your mind. Want to talk about it? I am here to listen, no matter what time it is or what you are feeling.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 md:gap-4 justify-end">
                    <div className="flex-1">
                      <div className="bg-gradient-to-r from-[#5A7C7F] to-[#4A6C6F] rounded-2xl rounded-tr-none p-3 md:p-4 shadow-lg ml-auto max-w-[95%] md:max-w-[85%]">
                        <p className="text-white text-xs md:text-sm leading-relaxed">
                          I have my board exams next month and I feel like I am going to fail. Everyone expects me to get above 90% but I am barely understanding anything...
                        </p>
                      </div>
                    </div>
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#5A7C7F] flex-shrink-0" />
                  </div>

                  <div className="flex gap-2 md:gap-4">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-[#C4661F] to-[#4A6C6F] flex-shrink-0" />
                    <div className="flex-1">
                      <div className="bg-white/80 rounded-2xl rounded-tl-none p-3 md:p-4 shadow-lg">
                        <p className="text-[#2C2C2C] text-xs md:text-sm leading-relaxed">
                          I hear you, and that pressure must feel incredibly heavy. First, let me tell you that feeling overwhelmed before boards is completely normal. Can we break this down together? What subject is stressing you most right now?
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 md:gap-4 justify-end">
                    <div className="flex-1">
                      <div className="bg-gradient-to-r from-[#5A7C7F] to-[#4A6C6F] rounded-2xl rounded-tr-none p-3 md:p-4 shadow-lg ml-auto max-w-[95%] md:max-w-[85%]">
                        <p className="text-white text-xs md:text-sm leading-relaxed">
                          Physics. I just cannot understand the derivations and my teacher moves so fast...
                        </p>
                      </div>
                    </div>
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#5A7C7F] flex-shrink-0" />
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section ref={testimonialsRef} className="relative z-10 px-6 py-16 md:py-32 bg-gradient-to-b from-transparent via-white/5 to-transparent">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={testimonialsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-10 md:mb-20"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-[#2C2C2C] mb-4 md:mb-6 leading-tight">
              Real Students,
              <br />
              <span className="backdrop-blur-xl bg-[#9CB5A0]/30 border border-[#9CB5A0]/40 px-4 py-1 rounded-2xl inline-block mt-2">
                Real Transformations
              </span>
            </h2>
            <p className="text-lg md:text-xl text-[#3A3A3A] max-w-3xl mx-auto">
              Here is what students are saying about their experience with Satori
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 40 }}
                animate={testimonialsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.15, duration: 0.8 }}
                className="backdrop-blur-[40px] bg-white/40 border border-white/60 rounded-3xl p-6 md:p-8 shadow-2xl hover:shadow-3xl transition-all duration-300"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-4xl">{testimonial.avatar}</div>
                  <div>
                    <h4 className="font-semibold text-[#2C2C2C]">{testimonial.name}</h4>
                    <p className="text-sm text-[#4A4A4A]">{testimonial.grade}</p>
                  </div>
                </div>

                <div className="backdrop-blur-xl bg-[#4A6C6F]/20 border border-[#4A6C6F]/30 rounded-xl w-10 h-10 md:w-12 md:h-12 flex items-center justify-center mb-4">
                  <Quote className="w-6 h-6 md:w-8 md:h-8 text-[#4A6C6F]" />
                </div>
                
                <p className="text-[#2C2C2C] leading-relaxed mb-6 italic text-sm md:text-base">
                  &quot;{testimonial.quote}&quot;
                </p>

                <div className="flex items-center gap-2 text-sm">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <div key={star} className="backdrop-blur-xl bg-[#C4661F]/20 border border-[#C4661F]/30 rounded-md p-0.5">
                        <Star className="w-3 h-3 md:w-4 md:h-4 fill-[#C4661F] text-[#C4661F]" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/40">
                  <p className="text-xs font-medium text-[#4A6C6F]">{testimonial.mood}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy & Research */}
      <section className="relative z-10 px-6 py-16 md:py-32">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="backdrop-blur-[40px] bg-gradient-to-br from-[#4A6C6F]/20 to-white/40 border border-white/60 rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-16 shadow-2xl"
          >
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-[#4A6C6F] to-[#5A7C7F] flex items-center justify-center mb-6 shadow-xl">
                  <Lock className="w-7 h-7 md:w-8 md:h-8 text-white" />
                </div>
                <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#2C2C2C] mb-6 leading-tight">
                  Your Privacy is Not
                  <br />
                  Negotiable
                </h2>
                <p className="text-base md:text-lg text-[#3A3A3A] mb-6 leading-relaxed">
                  We understand that for you to be truly honest about your mental health, you need absolute confidence that your information is safe. That is why we have built Satori with privacy as the foundation, not an afterthought.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-[#4A6C6F] flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-[#2C2C2C] mb-1">End-to-end encryption for all conversations</p>
                      <p className="text-xs md:text-sm text-[#3A3A3A]">Your chats with Kokoro are encrypted and only you can access them</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-[#4A6C6F] flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-[#2C2C2C] mb-1">Anonymous research contributions</p>
                      <p className="text-xs md:text-sm text-[#3A3A3A]">Your data helps research but your identity stays completely hidden</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-[#4A6C6F] flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-[#2C2C2C] mb-1">Never sold or shared with third parties</p>
                      <p className="text-xs md:text-sm text-[#3A3A3A]">We will never monetize your personal information, period</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-[#C4661F] to-[#4A6C6F] flex items-center justify-center mb-6 shadow-xl">
                  <Award className="w-7 h-7 md:w-8 md:h-8 text-white" />
                </div>
                <h3 className="text-2xl md:text-3xl font-serif font-bold text-[#2C2C2C] mb-6">
                  Advancing Mental Health Research in Pakistan
                </h3>
                <p className="text-base md:text-lg text-[#3A3A3A] mb-6 leading-relaxed">
                  There is almost no comprehensive data on student mental health in Pakistan. By using Satori, you are not just helping yourself, you are contributing to research that could transform how mental health is understood and supported in our education system.
                </p>
                <p className="text-[#3A3A3A] leading-relaxed mb-6 text-sm md:text-base">
                  Your anonymized data helps researchers understand patterns in student stress, identify what support works best, and advocate for better mental health resources in schools and universities across Pakistan.
                </p>
                <div className="px-4 py-4 md:px-6 md:py-4 bg-white/60 rounded-2xl border border-white/40">
                  <p className="text-xs md:text-sm text-[#2C2C2C]">
                    <span className="font-semibold">Your contribution matters.</span> Every mood log, every conversation, every data point helps build a better future for Pakistani students.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative z-10 px-6 py-16 md:py-32 bg-gradient-to-b from-transparent via-white/5 to-transparent">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-10 md:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-serif font-bold text-[#2C2C2C] mb-4 md:mb-6">
              Questions You Might Have
            </h2>
            <p className="text-lg md:text-xl text-[#3A3A3A]">
              We believe in complete transparency. Here are answers to common questions.
            </p>
          </motion.div>

          <div className="space-y-4 md:space-y-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.8 }}
                className="backdrop-blur-[40px] bg-white/40 border border-white/60 rounded-2xl p-6 md:p-8 shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                <h3 className="text-lg md:text-xl font-semibold text-[#2C2C2C] mb-2 md:mb-3">{faq.q}</h3>
                <p className="text-[#3A3A3A] leading-relaxed text-sm md:text-base">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 px-6 py-16 md:py-32">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="backdrop-blur-[40px] bg-gradient-to-br from-[#C4661F]/20 to-[#4A6C6F]/20 border border-white/60 rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-20 shadow-2xl text-center"
          >
            <Sparkles className="w-12 h-12 md:w-16 md:h-16 text-[#C4661F] mx-auto mb-6 md:mb-8" />
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-serif font-bold text-[#2C2C2C] mb-4 md:mb-6 leading-tight">
              Your Journey to Better
              <br />
              Mental Health Starts Now
            </h2>
            <p className="text-lg md:text-xl text-[#3A3A3A] mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed">
              Join hundreds of Pakistani students who are taking control of their mental wellness. Free forever, private always, supportive every day.
            </p>
            
            <button
              onClick={() => router.push('/auth')}
              className="w-full sm:w-auto px-8 md:px-12 py-4 md:py-6 backdrop-blur-xl bg-white/60 border border-white/60 text-[#2C2C2C] rounded-2xl font-semibold text-lg md:text-xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3 mx-auto group mb-6"
            >
              Start Your Free Journey
              <ArrowRight className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-1 transition-transform" />
            </button>

            <p className="text-xs md:text-sm text-[#3A3A3A] mb-8">
              No credit card • No commitments • Just support when you need it
            </p>

            <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-2xl mx-auto pt-8 border-t border-white/40">
              <div className="backdrop-blur-xl bg-white/30 border border-white/50 rounded-2xl p-3 md:p-4">
                <p className="text-xl md:text-3xl font-bold text-[#2C2C2C] mb-1">Free</p>
                <p className="text-[10px] md:text-xs text-[#4A4A4A]">Forever & Always</p>
              </div>
              <div className="backdrop-blur-xl bg-white/30 border border-white/50 rounded-2xl p-3 md:p-4">
                <p className="text-xl md:text-3xl font-bold text-[#2C2C2C] mb-1">24/7</p>
                <p className="text-[10px] md:text-xs text-[#4A4A4A]">Support Available</p>
              </div>
              <div className="backdrop-blur-xl bg-white/30 border border-white/50 rounded-2xl p-3 md:p-4">
                <p className="text-xl md:text-3xl font-bold text-[#2C2C2C] mb-1">100%</p>
                <p className="text-[10px] md:text-xs text-[#4A4A4A]">Private & Secure</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-12 border-t border-white/20">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Image
                  src="/logo.png"
                  alt="Satori Logo"
                  width={32}
                  height={32}
                  className="object-contain drop-shadow-lg"
                />
                <span className="text-xl font-serif font-semibold text-[#2C2C2C]">Satori</span>
              </div>
              <p className="text-sm text-[#000000] leading-relaxed">
                Empowering Pakistani students to thrive academically and emotionally through AI-powered mental wellness support.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-[#8ba08d] mb-4">Quick Links</h4>
              <div className="space-y-2">
                <button
                  onClick={() => router.push('/auth')}
                  className="block text-sm text-[#938f8f] hover:text-[#C4661F] transition-colors"
                >
                  Get Started
                </button>
                <button
                  onClick={() => {
                    const element = document.getElementById('features')
                    if (element) element.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="block text-sm text-[#938f8f] hover:text-[#C4661F] transition-colors"
                >
                  Features
                </button>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-[#2C2C2C] mb-4">Contact</h4>
              <a
                href="mailto:saadnizami114@gmail.com"
                className="flex items-center gap-2 text-sm text-[#3A3A3A] hover:text-[#C4661F] transition-colors mb-2"
              >
                <Mail className="w-4 h-4" />
                saadnizami114@gmail.com
              </a>
              <p className="text-xs text-[#3A3A3A] leading-relaxed">
                For research collaborations, data inquiries, or general questions about Satori
              </p>
            </div>
          </div>

          <div className="pt-8 border-t border-white/20 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-[#3A3A3A] text-center md:text-left">
              © 2026 Satori. Made with care for Pakistan.
            </p>
            <p className="text-xs text-[#3A3A3A] text-center md:text-left">
              Your mental health matters. You are not alone!
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}