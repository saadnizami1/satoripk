'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export function MeshGradient() {
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 })
  const [blobs, setBlobs] = useState([
    { id: 1, color: '#4A6C6F', baseX: 20, baseY: 30, scale: 1.2 },
    { id: 2, color: '#5A7C7F', baseX: 70, baseY: 20, scale: 1.5 },
    { id: 3, color: '#D4863F', baseX: 40, baseY: 70, scale: 1.0 },
    { id: 4, color: '#4A6C6F', baseX: 80, baseY: 60, scale: 1.4 },
    { id: 5, color: '#9ABCBF', baseX: 10, baseY: 80, scale: 1.1 },
    { id: 6, color: '#5A7C7F', baseX: 50, baseY: 40, scale: 1.3 },
    { id: 7, color: '#4A6C6F', baseX: 90, baseY: 85, scale: 1.2 },
  ])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Base gradient that follows cursor */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%,
            rgba(90, 124, 127, 0.3) 0%,
            rgba(196, 102, 31, 0.2) 25%,
            rgba(74, 108, 111, 0.35) 50%,
            rgba(90, 124, 127, 0.3) 75%,
            rgba(138, 172, 175, 0.22) 100%
          )`
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      />
      
      {/* Animated blobs */}
      {blobs.map((blob, index) => (
        <motion.div
          key={blob.id}
          className="absolute rounded-full mix-blend-multiply filter blur-[140px] opacity-40"
          style={{
            backgroundColor: blob.color,
            width: '35vw',
            height: '35vw',
          }}
          animate={{
            x: [
              `${blob.baseX + (mousePosition.x - 50) * 0.05}%`,
              `${blob.baseX + (mousePosition.x - 50) * 0.05 + (Math.random() * 10 - 5)}%`,
              `${blob.baseX + (mousePosition.x - 50) * 0.05}%`,
            ],
            y: [
              `${blob.baseY + (mousePosition.y - 50) * 0.05}%`,
              `${blob.baseY + (mousePosition.y - 50) * 0.05 + (Math.random() * 10 - 5)}%`,
              `${blob.baseY + (mousePosition.y - 50) * 0.05}%`,
            ],
            scale: [1, blob.scale, 1],
          }}
          transition={{
            x: { duration: 15 + index * 2, repeat: Infinity, ease: "easeInOut" },
            y: { duration: 18 + index * 2, repeat: Infinity, ease: "easeInOut" },
            scale: { duration: 12 + index, repeat: Infinity, ease: "easeInOut" },
          }}
        />
      ))}
      
      {/* Interactive gradient overlay that follows cursor */}
      <motion.div
        className="absolute inset-0 mix-blend-overlay opacity-25"
        animate={{
          background: `radial-gradient(circle 600px at ${mousePosition.x}% ${mousePosition.y}%,
            rgba(196, 102, 31, 0.15) 0%,
            transparent 100%
          )`
        }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      />
      
      {/* Subtle noise texture */}
      <div className="absolute inset-0 opacity-[0.015] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </div>
  )
}