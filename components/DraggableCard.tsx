'use client'

import { memo, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { LucideIcon, ArrowRight } from 'lucide-react'

interface DraggableCardProps {
  icon: LucideIcon
  title: string
  description: string
  href: string
  color: string
  size: 'small' | 'medium' | 'large'
  initialPosition: { x: number; y: number }
  shouldGlow?: boolean
  isMobile?: boolean
}

export const DraggableCard = memo(function DraggableCard({
  icon: Icon,
  title,
  description,
  href,
  color,
  size,
  initialPosition,
  shouldGlow = false,
  isMobile = false
}: DraggableCardProps) {
  const router = useRouter()

  // Memoized navigation handler
  const handleNavigate = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    router.push(href)
  }, [router, href])

  // Memoized size class
  const desktopSizeClass = useMemo(() => {
    switch (size) {
      case 'small': return 'md:w-[240px] md:h-[230px]' 
      case 'medium': return 'md:w-[280px] md:h-[240px]'
      case 'large': return 'md:w-[340px] md:h-[280px]'
      default: return 'md:w-[280px] md:h-[240px]'
    }
  }, [size])

  // Memoized animation config
  const animateConfig = useMemo(() => ({
    opacity: 1,
    y: isMobile ? 0 : undefined,
    scale: shouldGlow ? [1, 1.02, 1] : 1,
    boxShadow: shouldGlow
      ? [
          '0 0 20px rgba(210, 105, 30, 0.3)',
          '0 0 40px rgba(210, 105, 30, 0.6)',
          '0 0 20px rgba(210, 105, 30, 0.3)'
        ]
      : '0 10px 30px rgba(0, 0, 0, 0.1)'
  }), [isMobile, shouldGlow])

  // Memoized transition config
  const transitionConfig = useMemo(() => ({
    delay: 0.1,
    type: 'spring' as const,
    scale: shouldGlow ? { repeat: Infinity, duration: 2, ease: "easeInOut" as const } : {},
    boxShadow: shouldGlow ? { repeat: Infinity, duration: 2, ease: "easeInOut" as const } : {}
  }), [shouldGlow])

  // Memoized initial config
  const initialConfig = useMemo(() => 
    isMobile 
      ? { opacity: 0, y: 10 } 
      : { ...initialPosition, opacity: 0, scale: 0.8 }
  , [isMobile, initialPosition])

  return (
    <motion.div
      drag={!isMobile}
      dragMomentum={!isMobile}
      dragElastic={0.1}
      initial={initialConfig}
      animate={animateConfig}
      transition={transitionConfig}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      onClick={isMobile ? handleNavigate : undefined}
      className={`
        backdrop-blur-2xl bg-white/40 border-2
        ${shouldGlow ? 'border-[#D2691E] border-opacity-60' : 'border-white/60'}
        rounded-xl sm:rounded-2xl md:rounded-4xl
        p-4 sm:p-5 md:p-6
        shadow-xl md:shadow-2xl hover:shadow-2xl md:hover:shadow-3xl
        transition-all
        group overflow-hidden relative
        
        ${isMobile 
          ? 'w-full h-full min-h-[160px] cursor-pointer' 
          : `${desktopSizeClass} md:absolute cursor-default md:cursor-move active:cursor-grabbing` 
        }
      `}
      style={!isMobile ? { touchAction: 'none' } : {}}
    >
      {shouldGlow && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-[#D2691E]/10 to-transparent pointer-events-none"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        />
      )}

      {shouldGlow && (
        <motion.div
          className="absolute top-3 right-3 md:top-4 md:right-4 w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 bg-[#D2691E] rounded-full pointer-events-none"
          animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        />
      )}

      <div className="relative z-10 h-full flex flex-col">
        <div
          className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg sm:rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg md:shadow-xl group-hover:scale-110 transition-transform mb-2.5 sm:mb-3 md:mb-4 shrink-0"
          style={{ backgroundColor: color }}
        >
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" />
        </div>

        <h3 className="text-base sm:text-lg md:text-xl font-semibold text-[#2C2C2C] mb-1 sm:mb-1.5 md:mb-2 group-hover:text-[#4A6C6F] transition-colors">
          {title}
        </h3>

        <p className="text-xs sm:text-sm md:text-base text-[#5F5F5F] leading-relaxed flex-1 line-clamp-2 md:line-clamp-3">
          {description}
        </p>

        {/* Arrow Button Container */}
        <div className="flex justify-end mt-2 md:mt-3 shrink-0">
          
          {/* Desktop Arrow: Animated motion button */}
          <motion.button
            onClick={handleNavigate}
            whileHover={{ scale: 1.2, rotate: -45 }}
            whileTap={{ scale: 0.9 }}
            className="cursor-pointer z-50 p-1 hidden md:block"
          >
            <ArrowRight className="w-5 h-5 text-[#5F5F5F] hover:text-[#2C2C2C] transition-colors drop-shadow-lg" />
          </motion.button>
          
          {/* Mobile Arrow: Static icon (visual only) */}
          <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#5F5F5F] md:hidden" />
        </div>
      </div>
    </motion.div>
  )
})