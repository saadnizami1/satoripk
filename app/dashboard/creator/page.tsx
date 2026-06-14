'use client'

import { motion } from 'framer-motion'
import {
  Mail, Instagram, Linkedin, Twitter, Github,
  Heart, BookOpen, Sparkles, ExternalLink, Award,
  Target, Users, TrendingUp
} from 'lucide-react'

const socialLinks = [
  { name: 'Email',      username: 'saadnizami114@gmail.com',                   url: 'mailto:saadnizami114@gmail.com',                    icon: Mail,      color: '#F97316', label: 'Get in touch'          },
  { name: 'Instagram',  username: '@saadnizami__',                             url: 'https://www.instagram.com/saadnizami__/',            icon: Instagram, color: '#E1306C', label: 'Follow on Instagram'   },
  { name: 'LinkedIn',   username: 'Saad Nizami',                               url: 'https://www.linkedin.com/in/saad-nizami-250ab0374/', icon: Linkedin,  color: '#0A84FF', label: 'Connect on LinkedIn'    },
  { name: 'X (Twitter)',username: '@nizamisaad1',                              url: 'https://x.com/nizamisaad1',                         icon: Twitter,   color: '#94A3B8', label: 'Follow on X'            },
  { name: 'GitHub',     username: 'saadnizami1',                               url: 'https://github.com/saadnizami1',                    icon: Github,    color: '#94A3B8', label: 'View on GitHub'         },
]

const focuses = [
  { icon: BookOpen,   title: 'Psychological Awareness', desc: 'Championing mental well-being in student communities.',            color: '#2DD4BF' },
  { icon: Target,     title: 'Research Focus',          desc: 'Student mental wellness & academic stress in Pakistan.',           color: '#818CF8' },
  { icon: Users,      title: 'Community Impact',        desc: 'Building tools that genuinely support students day to day.',      color: '#F97316' },
  { icon: TrendingUp, title: 'Innovation',              desc: 'Combining psychology with technology for better outcomes.',       color: '#4ADE80' },
]

export default function CreatorPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-5">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(45,212,191,0.12)' }}>
          <Award className="w-5 h-5" style={{ color: '#2DD4BF' }} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-instrument), Georgia, serif', color: '#F1F5F9' }}>
            Creator Overview
          </h1>
          <p className="text-xs" style={{ color: '#475569' }}>About the researcher behind Satori</p>
        </div>
      </motion.div>

      {/* Profile hero */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="rounded-2xl p-6"
        style={{ background: '#13161F', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pb-6 mb-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          {/* Avatar */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.15, type: 'spring' as const }}
            className="w-20 h-20 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, #2DD4BF, #818CF8)' }}
          >
            <span className="text-2xl font-bold text-white">SN</span>
          </motion.div>

          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-2xl font-bold mb-1" style={{ fontFamily: 'var(--font-instrument), Georgia, serif', color: '#F1F5F9' }}>
              Saad Nizami
            </h2>
            <p className="text-sm mb-3" style={{ color: '#94A3B8' }}>
              A high school student based in Lahore (and a die-hard MCI fan)
            </p>
            <a
              href="mailto:saadnizami114@gmail.com"
              className="inline-flex items-center gap-1.5 text-xs hover:opacity-80 transition-opacity"
              style={{ color: '#2DD4BF' }}
            >
              <Mail className="w-3.5 h-3.5" />
              saadnizami114@gmail.com
            </a>
          </div>
        </div>

        {/* Vision */}
        <div className="space-y-4 text-sm leading-relaxed" style={{ color: '#94A3B8' }}>
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-4 h-4 shrink-0" style={{ color: '#F97316' }} />
            <h3 className="text-base font-semibold" style={{ fontFamily: 'var(--font-instrument), Georgia, serif', color: '#F1F5F9' }}>
              The Vision Behind Satori
            </h3>
          </div>

          <p>
            As a psychology student, conducting meaningful research has always been more than an academic pursuit — it has been a calling. The intersection of mental health and technology presents an unprecedented opportunity to understand and support the wellbeing of students navigating the complexities of academic life.
          </p>

          <p>
            <span className="font-semibold" style={{ color: '#2DD4BF' }}>Satori</span> represents the culmination of this vision: a comprehensive platform designed not only to provide mental wellness support to students but also to gather invaluable insights into patterns of academic stress, emotional wellbeing, and resilience in Pakistan&apos;s student population.
          </p>

          <p>
            This research endeavor aims to bridge the gap between theoretical psychology and practical application. By combining evidence-based therapeutic techniques with modern technology, Satori aspires to be both a support system for students in need and a robust research tool that can contribute to the broader understanding of student mental health.
          </p>

          <p>
            It is my sincere hope that this research will yield data that can inform educational policies, mental health interventions, and support systems for students across Pakistan. Every feature, every interaction, and every data point collected through this platform serves the dual purpose of immediate support and long-term understanding.
          </p>

          <div className="p-4 rounded-xl mt-4" style={{ background: 'rgba(45,212,191,0.06)', border: '1px solid rgba(45,212,191,0.15)' }}>
            <p className="text-sm italic" style={{ color: '#F1F5F9' }}>
              &ldquo;The goal is not merely to create an application, but to foster a community of understanding, support, and empirical insight that can transform how we approach student mental health in our educational landscape.&rdquo;
            </p>
            <p className="text-xs mt-2 text-right" style={{ color: '#475569' }}>— Saad Nizami</p>
          </div>
        </div>
      </motion.div>

      {/* Research focus areas */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-2xl p-5"
        style={{ background: '#13161F', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 shrink-0" style={{ color: '#818CF8' }} />
          <h3 className="text-sm font-semibold" style={{ color: '#F1F5F9' }}>Research Focus Areas</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {focuses.map(({ icon: Icon, title, desc, color }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.07 }}
              className="flex gap-3 p-4 rounded-xl"
              style={{ background: '#1C2030', border: '1px solid rgba(255,255,255,0.04)' }}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}15` }}>
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
              <div>
                <p className="text-sm font-semibold mb-0.5" style={{ color: '#F1F5F9' }}>{title}</p>
                <p className="text-xs leading-relaxed" style={{ color: '#475569' }}>{desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Social links */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl p-5"
        style={{ background: '#13161F', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-4 h-4 shrink-0" style={{ color: '#94A3B8' }} />
          <h3 className="text-sm font-semibold" style={{ color: '#F1F5F9' }}>Connect With Me</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {socialLinks.map(({ name, username, url, icon: Icon, color, label }, i) => (
            <motion.a
              key={name}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + i * 0.05 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group flex items-center gap-3 p-3.5 rounded-xl transition-all"
              style={{ background: '#1C2030', border: '1px solid rgba(255,255,255,0.04)' }}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}15` }}>
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold" style={{ color: '#F1F5F9' }}>{name}</p>
                <p className="text-[10px] truncate" style={{ color: '#475569' }}>{username}</p>
              </div>
              <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" style={{ color: '#475569' }} />
            </motion.a>
          ))}
        </div>
      </motion.div>

      {/* Footer card */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="rounded-2xl p-6 text-center"
        style={{ background: '#13161F', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <Heart className="w-6 h-6 mx-auto mb-3" style={{ color: '#F97316' }} />
        <p className="text-sm leading-relaxed max-w-2xl mx-auto" style={{ color: '#94A3B8' }}>
          Thank you for being part of this research journey. Your participation in Satori not only supports your own mental wellness but contributes to a greater understanding of student wellbeing in Pakistan. Together, we can make a meaningful difference.
        </p>
        <p className="text-xs mt-3" style={{ color: '#475569' }}>Built with love from Lahore</p>
      </motion.div>
    </div>
  )
}
