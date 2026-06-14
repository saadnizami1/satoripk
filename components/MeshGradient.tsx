'use client'

import { memo, useEffect, useState, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'

// Static blob configuration - defined outside component to prevent recreation
const BLOBS = [
  { id: 1, color: '#4A6C6F', baseX: 20, baseY: 30, scale: 1.2 },
  { id: 2, color: '#5A7C7F', baseX: 70, baseY: 20, scale: 1.5 },
  { id: 3, color: '#D4863F', baseX: 40, baseY: 70, scale: 1.0 },
  { id: 4, color: '#4A6C6F', baseX: 80, baseY: 60, scale: 1.4 },
  { id: 5, color: '#9ABCBF', baseX: 10, baseY: 80, scale: 1.1 },
  { id: 6, color: '#5A7C7F', baseX: 50, baseY: 40, scale: 1.3 },
  { id: 7, color: '#4A6C6F', baseX: 90, baseY: 85, scale: 1.2 },
] as const

// Memoized Blob component to prevent unnecessary re-renders
const Blob = memo(function Blob({ 
  blob, 
  index, 
  mouseOffset 
}: { 
  blob: typeof BLOBS[number]
  index: number
  mouseOffset: { x: number; y: number }
}) {
  return (
    <motion.div
      className="absolute rounded-full mix-blend-multiply filter blur-[140px] opacity-40"
      style={{
        backgroundColor: blob.color,
        width: '35vw',
        height: '35vw',
      }}
      animate={{
        x: [
          `${blob.baseX + mouseOffset.x}%`,
          `${blob.baseX + mouseOffset.x + (Math.random() * 10 - 5)}%`,
          `${blob.baseX + mouseOffset.x}%`,
        ],
        y: [
          `${blob.baseY + mouseOffset.y}%`,
          `${blob.baseY + mouseOffset.y + (Math.random() * 10 - 5)}%`,
          `${blob.baseY + mouseOffset.y}%`,
        ],
        scale: [1, blob.scale, 1],
      }}
      transition={{
        x: { duration: 15 + index * 2, repeat: Infinity, ease: "easeInOut" },
        y: { duration: 18 + index * 2, repeat: Infinity, ease: "easeInOut" },
        scale: { duration: 12 + index, repeat: Infinity, ease: "easeInOut" },
      }}
    />
  )
})

export const MeshGradient = memo(function MeshGradient() {
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 })
  const frameRef = useRef<number | null>(null)
  const lastUpdateRef = useRef<number>(0)

  // Throttled mouse handler - updates at ~30fps max
  const handleMouseMove = useCallback((e: MouseEvent) => {
    const now = performance.now()
    
    // Throttle to ~30fps (33ms between updates)
    if (now - lastUpdateRef.current < 33) return
    
    // Cancel any pending frame
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current)
    }
    
    frameRef.current = requestAnimationFrame(() => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      })
      lastUpdateRef.current = now
    })
  }, [])

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [handleMouseMove])

  // Calculate mouse offset once per render
  const mouseOffset = {
    x: (mousePosition.x - 50) * 0.05,
    y: (mousePosition.y - 50) * 0.05,
  }

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
      {BLOBS.map((blob, index) => (
        <Blob 
          key={blob.id} 
          blob={blob} 
          index={index} 
          mouseOffset={mouseOffset} 
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
})