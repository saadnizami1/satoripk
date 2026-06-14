'use client'

import { motion } from 'framer-motion'
import { 
  User,
  Mail,
  Instagram,
  Linkedin,
  Twitter,
  Github,
  Heart,
  BookOpen,
  Sparkles,
  ExternalLink,
  Award,
  Target,
  Users,
  TrendingUp
} from 'lucide-react'

const socialLinks = [
  {
    name: 'Email',
    username: 'saadnizami114@gmail.com',
    url: 'mailto:saadnizami114@gmail.com',
    icon: Mail,
    color: '#D2691E',
    label: 'Get in touch'
  },
  {
    name: 'Instagram',
    username: '@saadnizami__',
    url: 'https://www.instagram.com/saadnizami__/',
    icon: Instagram,
    color: '#E1306C',
    label: 'Follow on Instagram'
  },
  {
    name: 'LinkedIn',
    username: 'Saad Nizami',
    url: 'https://www.linkedin.com/in/saad-nizami-250ab0374/',
    icon: Linkedin,
    color: '#0A66C2',
    label: 'Connect on LinkedIn'
  },
  {
    name: 'X (Twitter)',
    username: '@nizamisaad1',
    url: 'https://x.com/nizamisaad1',
    icon: Twitter,
    color: '#000000',
    label: 'Follow on X'
  },
  {
    name: 'GitHub',
    username: 'saadnizami1',
    url: 'https://github.com/saadnizami1',
    icon: Github,
    color: '#333333',
    label: 'View on GitHub'
  },
]

const achievements = [
  {
    icon: BookOpen,
    title: 'Psychological awarness',
    description: 'Championing Mental Well-Being',
    color: '#4A6C6F'
  },
  {
    icon: Target,
    title: 'Research Focus',
    description: 'Student mental wellness & academic stress',
    color: '#6B6B6B'
  },
  {
    icon: Users,
    title: 'Community Impact',
    description: 'Building tools to support students',
    color: '#D2691E'
  },
  {
    icon: TrendingUp,
    title: 'Innovation',
    description: 'Combining psychology with technology',
    color: '#A8A8A8'
  },
]

export default function CreatorOverviewPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 sm:mb-8"
      >
        <div className="flex items-center gap-2 sm:gap-3 mb-2">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#4A6C6F]/20 to-[#4A6C6F]/10 backdrop-blur-xl flex items-center justify-center">
            <Award className="w-5 h-5 sm:w-6 sm:h-6 text-[#4A6C6F]" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-serif font-medium text-[#2C2C2C]">
              Creator Overview
            </h1>
            <p className="text-sm sm:text-base text-[#5F5F5F]">About the researcher behind Satori</p>
          </div>
        </div>
      </motion.div>

      {/* Main Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="backdrop-blur-[40px] bg-white/40 border border-white/60 rounded-2xl sm:rounded-[2rem] md:rounded-[2.5rem] p-6 sm:p-8 md:p-10 shadow-2xl mb-6 sm:mb-8"
      >
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-white/40">
          {/* Avatar */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#4A6C6F] to-[#6B6B6B] flex items-center justify-center shadow-2xl shrink-0"
          >
            <span className="text-4xl sm:text-4xl md:text-5xl font-bold text-white">SN</span>
          </motion.div>

          {/* Profile Info */}
          <div className="flex-1 text-center sm:text-left min-w-0">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="w-full"
            >
              <h2 className="text-3xl sm:text-3xl md:text-4xl font-serif font-bold text-[#2C2C2C] mb-2">
                Saad Nizami
              </h2>
              <p className="text-base sm:text-lg text-[#5F5F5F] mb-3 sm:mb-4">
                A highschool student based in Lahore (and a die heart mci fan)
              </p>
              <div className="flex items-center justify-center sm:justify-start gap-2 text-xs sm:text-sm text-[#5F5F5F]">
                <Mail className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                <a
                  href="mailto:saadnizami114@gmail.com"
                  className="hover:text-[#4A6C6F] transition-colors truncate"
                >
                  saadnizami114@gmail.com
                </a>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Research Vision */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6 sm:mb-8"
        >
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-[#4A6C6F]/20 flex items-center justify-center">
              <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-[#4A6C6F]" />
            </div>
            <h3 className="text-xl sm:text-2xl font-serif font-semibold text-[#2C2C2C]">
              The Vision Behind Satori
            </h3>
          </div>

          <div className="space-y-3 sm:space-y-4 text-[#2C2C2C] leading-relaxed">
            <p className="text-sm sm:text-base md:text-lg">
              As a psychology student, conducting meaningful research has always been more than an academic pursuit. It has been a calling. The intersection of mental health and technology presents an unprecedented opportunity to understand and support the wellbeing of students navigating the complexities of academic life.
            </p>

            <p className="text-sm sm:text-base md:text-lg">
              <span className="font-semibold text-[#4A6C6F]">Satori</span> represents the culmination of this vision: a comprehensive platform designed not only to provide mental wellness support to students but also to gather invaluable insights into the patterns of academic stress, emotional wellbeing, and resilience in Pakistan's student population.
            </p>

            <p className="text-sm sm:text-base md:text-lg">
              This research endeavor aims to bridge the gap between theoretical psychology and practical application. By combining evidence based therapeutic techniques with modern technology, Satori aspires to be both a support system for students in need and a robust research tool that can contribute to the broader understanding of student mental health.
            </p>

            <p className="text-sm sm:text-base md:text-lg">
              It is my sincere hope that this research will be conducted successfully, yielding data that can inform educational policies, mental health interventions, and support systems for students across Pakistan. Every feature, every interaction, and every data point collected through this platform serves the dual purpose of immediate support and long-term understanding.
            </p>

            <div className="p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl bg-linear-to-r from-[#4A6C6F]/10 to-[#6B6B6B]/10 border border-white/60 mt-4 sm:mt-6">
              <p className="text-sm sm:text-base italic text-[#2C2C2C]">
                "The goal is not merely to create an application, but to foster a community of understanding, support, and empirical insight that can transform how we approach student mental health in our educational landscape."
              </p>
              <p className="text-xs sm:text-sm text-[#5F5F5F] mt-2 sm:mt-3 text-right">
                — Saad Nizami
              </p>
            </div>
          </div>
        </motion.div>

        {/* Achievements Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-6 sm:mb-8"
        >
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-[#D2691E]/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#D2691E]" />
            </div>
            <h3 className="text-xl sm:text-2xl font-serif font-semibold text-[#2C2C2C]">
              Research Focus Areas
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-white/50 border border-white/60 hover:bg-white/70 hover:shadow-lg transition-all"
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${achievement.color}20` }}
                  >
                    <achievement.icon className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: achievement.color }} />
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-semibold text-[#2C2C2C] mb-1">
                      {achievement.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-[#5F5F5F]">
                      {achievement.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Social Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-[#6B6B6B]/20 flex items-center justify-center">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-[#6B6B6B]" />
            </div>
            <h3 className="text-xl sm:text-2xl font-serif font-semibold text-[#2C2C2C]">
              Connect With Me
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {socialLinks.map((link, index) => (
              <motion.a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.05 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="group p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-white/50 border border-white/60 hover:bg-white/70 hover:shadow-xl transition-all"
              >
                <div className="flex items-center gap-3 sm:gap-4 mb-2 sm:mb-3">
                  <div
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${link.color}15` }}
                  >
                    <link.icon
                      className="w-5 h-5 sm:w-6 sm:h-6"
                      style={{ color: link.color }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm sm:text-base font-semibold text-[#2C2C2C] group-hover:text-[#4A6C6F] transition-colors">
                      {link.name}
                    </h4>
                    <p className="text-xs text-[#5F5F5F]">{link.label}</p>
                  </div>
                  <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 text-[#5F5F5F] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </div>
                <p className="text-xs sm:text-sm text-[#5F5F5F] font-mono truncate">
                  {link.username}
                </p>
              </motion.a>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Acknowledgment Footer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="backdrop-blur-[40px] bg-white/40 border border-white/60 rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-xl text-center"
      >
        <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-[#D2691E] mx-auto mb-3 sm:mb-4" />
        <p className="text-sm sm:text-base text-[#2C2C2C] leading-relaxed max-w-3xl mx-auto">
          Thank you for being part of this research journey. Your participation in Satori not only supports your own mental wellness but contributes to a greater understanding of student wellbeing in Pakistan. Together, we can make a meaningful difference.
        </p>
        <p className="text-xs sm:text-sm text-[#5F5F5F] mt-3 sm:mt-4">
          Built with {"<3"} from Lahore
        </p>
      </motion.div>
    </div>
  )
}