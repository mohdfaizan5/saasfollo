'use client'

import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

interface FolderProps {
  direction?: 'left' | 'right'
  color?: string
  text?: string
  className?: string
  textClassName?: string
  icon?: React.ReactNode
}

export function Folder({
  direction = 'right',
  color = '#D2E4D4', // Default light green
  text = 'SOLO',
  className,
  textClassName,
  icon
}: FolderProps) {
  const isRight = direction === 'right'
  const sign = isRight ? 1 : -1
  const originClass = isRight ? 'origin-bottom-left' : 'origin-bottom-right'

  return (
    <motion.div
      className={cn("relative w-[220px] h-[280px] cursor-pointer group", className)}
      initial="initial"
      whileHover="hover"
    >
      {/* Back Cover */}
      <div className="absolute inset-0 z-0">
        {/* Tab */}
        <div
          className={cn(
            "absolute top-0 h-[32px] w-[45%] border-[1.5px] border-b-0 border-[#2C4839] rounded-t-xl z-10",
            isRight ? "right-4" : "left-4"
          )}
          style={{ backgroundColor: color }}
        />
        {/* Main Body */}
        <div
          className="absolute top-[30px] bottom-0 left-0 right-0 border-[1.5px] border-[#2C4839] rounded-xl z-0"
          style={{ backgroundColor: color }}
        />
      </div>

      {/* Papers */}
      <div className="absolute top-[30px] bottom-0 left-0 right-0 z-10 overflow-visible">
        {/* Paper 1 (Back) */}
        <motion.div
          className={cn("absolute inset-x-3 top-2 bottom-4 bg-white border-[1.5px] border-[#2C4839] rounded-md", originClass)}
          variants={{
            initial: { rotate: 2 * sign, x: 4 * sign, y: -5 },
            hover: { rotate: 4 * sign, x: 10 * sign, y: -15 }
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        />
        {/* Paper 2 (Middle) */}
        <motion.div
          className={cn("absolute inset-x-3 top-2 bottom-4 bg-white border-[1.5px] border-[#2C4839] rounded-md", originClass)}
          variants={{
            initial: { rotate: 5 * sign, x: 8 * sign, y: -10 },
            hover: { rotate: 10 * sign, x: 20 * sign, y: -25 }
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        />
        {/* Paper 3 (Front) */}
        <motion.div
          className={cn("absolute inset-x-3 top-2 bottom-4 bg-white border-[1.5px] border-[#2C4839] rounded-md", originClass)}
          variants={{
            initial: { rotate: 8 * sign, x: 12 * sign, y: -15 },
            hover: { rotate: 16 * sign, x: 30 * sign, y: -35 }
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        />
      </div>

      {/* Front Cover */}
      <motion.div
        className={cn(
          "absolute top-[30px] bottom-0 left-0 right-0 border-[1.5px] border-[#2C4839] rounded-xl z-20 flex items-center justify-center shadow-sm",
          originClass
        )}
        style={{ backgroundColor: color }}
        variants={{
          initial: { rotate: -2 * sign, x: -2 * sign, y: 2 },
          hover: { rotate: -6 * sign, x: -5 * sign, y: 5 }
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <span
          className={cn("text-4xl font-serif font-bold text-[#2C4839] select-none rotate-12", textClassName)}
        //   style={{ transform: `rotate(${-12 * sign}deg)` }}
        >
          {text}
        </span>
        {icon}
      </motion.div>
    </motion.div>
  )
}
