'use client'

import { motion } from 'framer-motion'
import { 
  Phone,
  Shield,
  Heart,
  AlertCircle,
  Clock,
  Globe,
  Mail,
  PhoneCall,
  Users,
  MessageCircle,
  AlertTriangle,
  Info,
  ExternalLink
} from 'lucide-react'
import { useState } from 'react'

interface Helpline {
  name: string
  number: string
  description: string
  availability: string
  languages?: string
  email?: string
  is24x7?: boolean
  icon: any
  color: string
}

interface HelplineCategory {
  title: string
  subtitle: string
  icon: any
  color: string
  gradient: string
  helplines: Helpline[]
}

const categories: HelplineCategory[] = [
  {
    title: 'Emergency Services',
    subtitle: 'Immediate danger or life-threatening situations',
    icon: AlertTriangle,
    color: '#D2691E',
    gradient: 'from-[#D2691E]/20 to-[#D2691E]/5',
    helplines: [
      {
        name: 'Rescue 1122',
        number: '1122',
        description: 'Ambulance, Fire, Disaster Response',
        availability: '24/7 Emergency Service',
        is24x7: true,
        icon: AlertCircle,
        color: '#D2691E'
      },
      {
        name: 'Police Emergency',
        number: '15',
        description: 'Police assistance and emergency response',
        availability: '24/7 Emergency Service',
        is24x7: true,
        icon: Shield,
        color: '#D2691E'
      },
      {
        name: 'National Emergency',
        number: '911',
        description: 'Backup emergency service',
        availability: '24/7 Emergency Service',
        is24x7: true,
        icon: PhoneCall,
        color: '#D2691E'
      },
    ]
  },
  {
    title: 'Child Protection & Safety',
    subtitle: 'Report abuse, violence, or seek child protection',
    icon: Shield,
    color: '#4A6C6F',
    gradient: 'from-[#4A6C6F]/20 to-[#4A6C6F]/5',
    helplines: [
      {
        name: 'Madadgaar Child Helpline',
        number: '1098',
        description: 'National helpline for child abuse & violence support',
        availability: '24/7 Toll-Free Service',
        languages: 'Urdu, English',
        is24x7: true,
        icon: Heart,
        color: '#4A6C6F'
      },
      {
        name: 'Ministry of Human Rights',
        number: '1099',
        description: 'Report abuse, violence, and human rights violations',
        availability: '24/7 Helpline',
        is24x7: true,
        icon: Shield,
        color: '#4A6C6F'
      },
      {
        name: 'Child Protection Bureau (Punjab)',
        number: '1121',
        description: 'Child welfare and protection services',
        availability: 'Working Hours',
        icon: Users,
        color: '#4A6C6F'
      },
    ]
  },
  {
    title: 'Mental Health & Counseling',
    subtitle: 'Professional support for stress, anxiety, and emotional wellbeing',
    icon: Heart,
    color: '#6B6B6B',
    gradient: 'from-[#6B6B6B]/20 to-[#6B6B6B]/5',
    helplines: [
      {
        name: 'Umang Mental Health Helpline',
        number: '+92 311 778 6264',
        description: 'Free confidential mental health support and counseling',
        availability: '24/7 Support Available',
        languages: 'Urdu, English',
        is24x7: true,
        icon: Heart,
        color: '#6B6B6B'
      },
      {
        name: 'Taskeen Tele-Mental Health',
        number: '0316 827 5336',
        description: 'Counseling and distress support services',
        availability: 'Check availability',
        languages: 'Urdu, English',
        icon: MessageCircle,
        color: '#6B6B6B'
      },
      {
        name: 'Rozan Counseling Helpline',
        number: '0304 111 1741',
        description: 'Emotional support, violence & abuse counseling',
        availability: 'Weekdays: 09:30 AM - 05:00 PM',
        languages: 'Urdu, English',
        email: 'helpline@rozan.org',
        icon: Phone,
        color: '#6B6B6B'
      },
      {
        name: 'Rozan Toll-Free',
        number: '0800 22444',
        description: 'Alternative toll-free number for Rozan services',
        availability: 'Weekdays: 09:30 AM - 05:00 PM',
        icon: PhoneCall,
        color: '#6B6B6B'
      },
      {
        name: 'National Youth Helpline',
        number: '0800 69457',
        description: 'Psychosocial counseling for youth - stress, relationships, guidance',
        availability: 'Check availability',
        languages: 'Urdu, English',
        icon: Users,
        color: '#6B6B6B'
      },
    ]
  },
  {
    title: 'Additional Support',
    subtitle: 'Other helpful resources and services',
    icon: Users,
    color: '#A8A8A8',
    gradient: 'from-[#A8A8A8]/20 to-[#A8A8A8]/5',
    helplines: [
      {
        name: 'Women & Children Protection',
        number: '1099',
        description: 'Government protective reporting service',
        availability: '24/7 Service',
        is24x7: true,
        icon: Shield,
        color: '#A8A8A8'
      },
      {
        name: 'Mon Therapy',
        number: '0336 099 56286',
        description: 'Mental health counseling services (may be private/low-cost)',
        availability: 'Check availability',
        icon: MessageCircle,
        color: '#A8A8A8'
      },
    ]
  },
]

export default function GetHelpPage() {
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null)

  const toggleCategory = (index: number) => {
    setExpandedCategory(expandedCategory === index ? null : index)
  }

  const makeCall = (number: string) => {
    // Remove spaces and special characters for calling
    const cleanNumber = number.replace(/\s+/g, '')
    window.location.href = `tel:${cleanNumber}`
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 sm:mb-8"
      >
        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#D2691E]/20 to-[#D2691E]/10 backdrop-blur-xl flex items-center justify-center">
            <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-[#D2691E]" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-serif font-medium text-[#2C2C2C]">
              Get Help
            </h1>
            <p className="text-sm sm:text-base text-[#5F5F5F]">You're not alone. Help is available 24/7</p>
          </div>
        </div>

        {/* Important Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="backdrop-blur-[40px] bg-[#D2691E]/10 border-2 border-[#D2691E]/40 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-xl"
        >
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-[#D2691E]/20 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-[#D2691E]" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-semibold text-[#2C2C2C] mb-2">
                If you're in immediate danger, call emergency services
              </h3>
              <p className="text-xs sm:text-sm text-[#5F5F5F] mb-3 sm:mb-4">
                If you or someone you know is experiencing a life-threatening emergency, please call <strong className="text-[#D2691E]">1122</strong> or <strong className="text-[#D2691E]">15</strong> immediately.
              </p>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => makeCall('1122')}
                  className="px-4 py-2 sm:px-6 sm:py-2.5 rounded-lg sm:rounded-xl bg-[#D2691E] text-white text-sm sm:text-base font-semibold shadow-lg flex items-center gap-2"
                >
                  <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
                  Call 1122
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => makeCall('15')}
                  className="px-4 py-2 sm:px-6 sm:py-2.5 rounded-lg sm:rounded-xl bg-[#D2691E] text-white text-sm sm:text-base font-semibold shadow-lg flex items-center gap-2"
                >
                  <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
                  Call 15
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* How to Get Help Guide */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6 sm:mb-8 backdrop-blur-[40px] bg-white/40 border border-white/60 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-xl"
      >
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <Info className="w-4 h-4 sm:w-5 sm:h-5 text-[#4A6C6F]" />
          <h3 className="text-base sm:text-lg font-semibold text-[#2C2C2C]">How to Get Help</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm text-[#5F5F5F]">
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#4A6C6F]/20 flex items-center justify-center shrink-0 text-[#4A6C6F] text-sm sm:text-base font-bold">
              1
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-[#2C2C2C] mb-1">Choose a helpline</p>
              <p>Select the service that best matches your situation</p>
            </div>
          </div>
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#4A6C6F]/20 flex items-center justify-center shrink-0 text-[#4A6C6F] text-sm sm:text-base font-bold">
              2
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-[#2C2C2C] mb-1">Make the call</p>
              <p>Click the phone number or dial it directly. It's confidential</p>
            </div>
          </div>
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#4A6C6F]/20 flex items-center justify-center shrink-0 text-[#4A6C6F] text-sm sm:text-base font-bold">
              3
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-[#2C2C2C] mb-1">Speak with someone</p>
              <p>Trained professionals are ready to listen and help you</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Helpline Categories */}
      <div className="space-y-4 sm:space-y-5 md:space-y-6">
        {categories.map((category, categoryIndex) => (
          <motion.div
            key={category.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + categoryIndex * 0.1 }}
            className="backdrop-blur-[40px] bg-white/40 border border-white/60 rounded-xl sm:rounded-2xl shadow-xl overflow-hidden"
          >
            {/* Category Header */}
            <div className={`bg-gradient-to-r ${category.gradient} p-4 sm:p-5 md:p-6 border-b border-white/40`}>
              <div className="flex items-center gap-3 sm:gap-4">
                <div
                  className="w-12 h-12 sm:w-13 sm:h-13 md:w-14 md:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${category.color}30` }}
                >
                  <category.icon className="w-6 h-6 sm:w-6.5 sm:h-6.5 md:w-7 md:h-7" style={{ color: category.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl sm:text-2xl font-bold text-[#2C2C2C] mb-1">
                    {category.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#5F5F5F]">{category.subtitle}</p>
                </div>
              </div>
            </div>

            {/* Helplines List */}
            <div className="p-4 sm:p-5 md:p-6 space-y-3 sm:space-y-4">
              {category.helplines.map((helpline, helplineIndex) => (
                <motion.div
                  key={helpline.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + categoryIndex * 0.1 + helplineIndex * 0.05 }}
                  className="p-4 sm:p-5 rounded-lg sm:rounded-xl bg-white/50 border border-white/60 hover:bg-white/70 hover:shadow-lg transition-all group"
                >
                  <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                    {/* Icon */}
                    <div
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${helpline.color}20` }}
                    >
                      <helpline.icon className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: helpline.color }} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 w-full">
                      <div className="flex flex-col gap-3 mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base sm:text-lg font-semibold text-[#2C2C2C] mb-1">
                            {helpline.name}
                          </h3>
                          {helpline.is24x7 && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#4A6C6F]/20 text-xs font-medium text-[#4A6C6F]">
                              <Clock className="w-3 h-3" />
                              24/7 Available
                            </span>
                          )}
                        </div>

                        {/* Call Button - Full width on mobile */}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => makeCall(helpline.number)}
                          className="w-full sm:w-auto px-4 py-2.5 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl font-bold text-white text-sm sm:text-base shadow-lg flex items-center justify-center gap-2 group-hover:shadow-xl transition-all"
                          style={{
                            backgroundColor: helpline.color,
                            boxShadow: `0 4px 20px ${helpline.color}40`
                          }}
                        >
                          <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
                          {helpline.number}
                        </motion.button>
                      </div>

                      <p className="text-xs sm:text-sm text-[#5F5F5F] mb-3">
                        {helpline.description}
                      </p>

                      {/* Details */}
                      <div className="flex flex-wrap gap-3 sm:gap-4 text-xs text-[#5F5F5F]">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{helpline.availability}</span>
                        </div>
                        {helpline.languages && (
                          <div className="flex items-center gap-1">
                            <Globe className="w-3 h-3" />
                            <span>{helpline.languages}</span>
                          </div>
                        )}
                        {helpline.email && (
                          <div className="flex items-center gap-1 min-w-0">
                            <Mail className="w-3 h-3 shrink-0" />
                            <a
                              href={`mailto:${helpline.email}`}
                              className="hover:text-[#4A6C6F] transition-colors truncate"
                            >
                              {helpline.email}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Important Reminders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-6 sm:mt-8 backdrop-blur-[40px] bg-white/40 border border-white/60 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-xl"
      >
        <h3 className="text-base sm:text-lg font-semibold text-[#2C2C2C] mb-3 sm:mb-4 flex items-center gap-2">
          <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-[#D2691E]" />
          Remember
        </h3>
        <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-[#5F5F5F]">
          <li className="flex items-start gap-2">
            <span className="text-[#4A6C6F] mt-0.5 sm:mt-1 shrink-0">•</span>
            <span><strong className="text-[#2C2C2C]">You're not alone.</strong> These services are here to help you.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#4A6C6F] mt-0.5 sm:mt-1 shrink-0">•</span>
            <span><strong className="text-[#2C2C2C]">Your calls are confidential.</strong> Professional counselors will keep your information private.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#4A6C6F] mt-0.5 sm:mt-1 shrink-0">•</span>
            <span><strong className="text-[#2C2C2C]">It's okay to ask for help.</strong> Reaching out is a sign of strength, not weakness.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#4A6C6F] mt-0.5 sm:mt-1 shrink-0">•</span>
            <span><strong className="text-[#2C2C2C]">Call with a trusted adult if possible.</strong> Having support can make the process easier.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#4A6C6F] mt-0.5 sm:mt-1 shrink-0">•</span>
            <span><strong className="text-[#2C2C2C]">If one number doesn't work, try another.</strong> There are multiple resources available to help you.</span>
          </li>
        </ul>
      </motion.div>
    </div>
  )
}