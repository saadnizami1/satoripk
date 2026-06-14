'use client'

import { motion } from 'framer-motion'
import { Phone, Heart, Shield, Globe, ArrowLeft, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

const EMERGENCY = [
  { name: 'Rescue / Ambulance',      number: '1122', note: '24/7 emergency services',           color: '#C75B5B' },
  { name: 'Umang Mental Health',     number: '0317-4288665', note: 'Free counselling helpline',  color: '#C4661F' },
  { name: 'Umang WhatsApp',          number: '0311-7786264', note: 'Mental health WhatsApp',     color: '#4A6C6F' },
  { name: 'Rozan Counselling',       number: '051-2890505',  note: 'Islamabad counselling',      color: '#5A7F82' },
  { name: 'Edhi Foundation',         number: '115',          note: 'Social welfare & crisis',    color: '#6A8C6F' },
]

const RESOURCES = [
  {
    icon: Heart,
    title: 'You are not alone',
    body: 'Mental health struggles are common, especially among students. Reaching out is a sign of strength, not weakness.',
    color: '#C4661F',
    bg: '#C4661F10',
  },
  {
    icon: Shield,
    title: 'It\'s okay to ask for help',
    body: 'If you are feeling overwhelmed, anxious, or depressed — please talk to someone. A professional, a friend, or Kokoro here in the app.',
    color: '#4A6C6F',
    bg: '#4A6C6F10',
  },
  {
    icon: Globe,
    title: 'Online resources',
    body: 'Umang Pakistan and Rozan offer free, confidential mental health support available via call and WhatsApp.',
    color: '#6A8C6F',
    bg: '#6A8C6F10',
  },
]

export default function HelplinePage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-[#5F5F5F] hover:text-[#2C2C2C] mb-4 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-red-100/60 flex items-center justify-center">
            <Phone className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-semibold text-[#2C2C2C]">Get Help</h1>
            <p className="text-xs text-[#9F9F9F]">You are never alone</p>
          </div>
        </div>
      </motion.div>

      {/* Crisis banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.05 }}
        className="flex items-start gap-3 px-4 py-3.5 rounded-2xl bg-red-50/70 border border-red-200/60"
      >
        <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-red-600">In immediate danger?</p>
          <p className="text-xs text-red-500 mt-0.5">Call <strong>1122</strong> for emergency services right now.</p>
        </div>
      </motion.div>

      {/* Helplines */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-3xl p-5">
        <h2 className="text-sm font-semibold text-[#2C2C2C] mb-4">Pakistan helplines</h2>
        <div className="space-y-3">
          {EMERGENCY.map(({ name, number, note, color }, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="flex items-center justify-between py-2.5 border-b border-black/4 last:border-0"
            >
              <div>
                <p className="text-sm font-medium text-[#2C2C2C]">{name}</p>
                <p className="text-[11px] text-[#9F9F9F]">{note}</p>
              </div>
              <a
                href={`tel:${number}`}
                className="flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-xl transition-all hover:scale-105"
                style={{ color, backgroundColor: `${color}15` }}
              >
                <Phone className="w-3.5 h-3.5" />
                {number}
              </a>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Support cards */}
      <div className="grid gap-3">
        {RESOURCES.map(({ icon: Icon, title, body, color, bg }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.07 }}
            className="glass rounded-2xl p-4 flex gap-3"
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: bg }}>
              <Icon className="w-4.5 h-4.5" style={{ color }} />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#2C2C2C] mb-1">{title}</p>
              <p className="text-xs text-[#5F5F5F] leading-relaxed">{body}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Reminder */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center pb-4"
      >
        <p className="text-xs text-[#C0BAB2]">
          You can also talk to <Link href="/dashboard/kokoro" className="text-[#4A6C6F] font-medium hover:underline">Kokoro</Link> anytime in the app 💙
        </p>
      </motion.div>
    </div>
  )
}
