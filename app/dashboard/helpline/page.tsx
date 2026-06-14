'use client'

import { motion } from 'framer-motion'
import { Phone, Heart, Shield, Globe, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

const EMERGENCY = [
  { name: 'Rescue / Ambulance',  number: '1122',          note: '24/7 emergency services',        color: '#EF4444' },
  { name: 'Umang Mental Health', number: '0317-4288665',  note: 'Free counselling helpline',       color: '#F97316' },
  { name: 'Umang WhatsApp',      number: '0311-7786264',  note: 'Mental health on WhatsApp',       color: '#4ADE80' },
  { name: 'Rozan Counselling',   number: '051-2890505',   note: 'Islamabad counselling',           color: '#2DD4BF' },
  { name: 'Edhi Foundation',     number: '115',           note: 'Social welfare & crisis support', color: '#818CF8' },
]

const RESOURCES = [
  {
    icon: Heart,
    title: 'You are not alone',
    body: 'Mental health struggles are common, especially among students. Reaching out is a sign of strength, not weakness.',
    color: '#F97316',
  },
  {
    icon: Shield,
    title: "It's okay to ask for help",
    body: "If you're feeling overwhelmed, anxious, or depressed — please talk to someone. A professional, a friend, or Kokoro right here in the app.",
    color: '#2DD4BF',
  },
  {
    icon: Globe,
    title: 'Online resources',
    body: 'Umang Pakistan and Rozan offer free, confidential mental health support available via call and WhatsApp.',
    color: '#818CF8',
  },
]

export default function HelplinePage() {
  return (
    <div className="max-w-2xl mx-auto space-y-5">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.12)' }}>
          <Phone className="w-5 h-5" style={{ color: '#EF4444' }} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-instrument), Georgia, serif', color: '#F1F5F9' }}>
            Get Help
          </h1>
          <p className="text-xs" style={{ color: '#475569' }}>You are never alone</p>
        </div>
      </motion.div>

      {/* Crisis banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.05 }}
        className="flex items-start gap-3 px-4 py-3.5 rounded-2xl"
        style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
      >
        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#EF4444' }} />
        <div>
          <p className="text-sm font-semibold" style={{ color: '#F1F5F9' }}>In immediate danger?</p>
          <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>
            Call <strong style={{ color: '#EF4444' }}>1122</strong> for emergency services right now.
          </p>
        </div>
      </motion.div>

      {/* Helplines */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl p-5"
        style={{ background: '#13161F', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <h2 className="text-sm font-semibold mb-4" style={{ color: '#F1F5F9' }}>Pakistan helplines</h2>
        <div className="space-y-1">
          {EMERGENCY.map(({ name, number, note, color }, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.12 + i * 0.05 }}
              className="flex items-center justify-between py-3"
              style={{ borderBottom: i < EMERGENCY.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
            >
              <div>
                <p className="text-sm font-medium" style={{ color: '#F1F5F9' }}>{name}</p>
                <p className="text-[11px] mt-0.5" style={{ color: '#475569' }}>{note}</p>
              </div>
              <a
                href={`tel:${number}`}
                className="flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-xl transition-all hover:scale-105"
                style={{ color, background: `${color}12`, border: `1px solid ${color}25` }}
              >
                <Phone className="w-3.5 h-3.5" />
                {number}
              </a>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Support cards */}
      <div className="space-y-3">
        {RESOURCES.map(({ icon: Icon, title, body, color }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 + i * 0.07 }}
            className="flex gap-3 p-4 rounded-2xl"
            style={{ background: '#13161F', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}12` }}>
              <Icon className="w-4 h-4" style={{ color }} />
            </div>
            <div>
              <p className="text-sm font-semibold mb-1" style={{ color: '#F1F5F9' }}>{title}</p>
              <p className="text-xs leading-relaxed" style={{ color: '#94A3B8' }}>{body}</p>
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
        <p className="text-xs" style={{ color: '#475569' }}>
          You can also talk to{' '}
          <Link href="/dashboard/kokoro" className="font-medium hover:underline" style={{ color: '#2DD4BF' }}>
            Kokoro
          </Link>{' '}
          anytime in the app
        </p>
      </motion.div>
    </div>
  )
}
