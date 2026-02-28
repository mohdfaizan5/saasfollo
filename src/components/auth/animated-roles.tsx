'use client'

import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { CowboyHatIcon } from '@phosphor-icons/react/dist/ssr'

const roles = [
    'Developer',
    'Designer',
    'Marketer',
    'Product Manager',
    'Janitor',
    'Sales Reps',
    'Copywriters',
    'SEO guy',
    'Tester',
    'Content guy',
]

// --- Configuration Variables ---
const ITEM_HEIGHT = 40 // Height of each role item in pixels
const GAP = 5 // Gap between items in pixels
const VISIBLE_ITEMS_HALF = 2 // Number of items to show above and below the active one
// -------------------------------

const TOTAL_HEIGHT = ITEM_HEIGHT + GAP

export function AnimatedRoles({
    outerClassName,
}: {
    outerClassName?: string,
}) {
    const [currentIndex, setCurrentIndex] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => prev + 1)
        }, 2000)
        return () => clearInterval(interval)
    }, [])

    // We render a window of items around the currentIndex to create an infinite loop effect.
    // VISIBLE_ITEMS_HALF * 2 + 3 ensures we have enough items rendered to animate smoothly in and out.
    const renderWindow = VISIBLE_ITEMS_HALF * 2 + 3
    const startIndex = currentIndex - (VISIBLE_ITEMS_HALF + 1)

    return (
        <div className={`hidden lg:flex h-full w-full items-center justify-center bg-[#2C4839] dark:bg-zinc-950 p-10 pr-0 overflow-hidden border-r border-zinc-200 dark:border-zinc-800 ${outerClassName}`}>
            <div className="flex items-center gap-4 text-4xl  tracking-tight  ">
                <p   className="text-[#F6F1EA] dark:text-zinc-100 font-serif-instrumental text-5xl whitespace-nowrap relative">Solo Founder === <CowboyHatIcon className='absolute -rotate-12 -left-3 -top-5' size={32} weight="duotone" /> </p>

                <div className="relative h-[300px] w-[400px] overflow-hidden">
                    <motion.div
                        animate={{ y: -currentIndex * TOTAL_HEIGHT }}
                        transition={{ duration: 0.5, ease: 'easeInOut' }}
                        className="absolute w-full"
                        style={{ top: `calc(50% - ${ITEM_HEIGHT / 2}px)` }}
                    >
                        {Array.from({ length: renderWindow }).map((_, i) => {
                            const absoluteIndex = startIndex + i
                            // Handle negative modulo correctly for infinite looping backwards/forwards
                            const roleIndex = ((absoluteIndex % roles.length) + roles.length) % roles.length
                            const role = roles[roleIndex]

                            const distance = Math.abs(currentIndex - absoluteIndex)
                            
                            let opacity = 0
                            if (distance === 0) {
                                opacity = 1
                            } else if (distance <= VISIBLE_ITEMS_HALF) {
                                const opacities = [1, 0.3, 0.1, 0.05]
                                opacity = opacities[distance] || 0.05
                            }

                            const scale = distance === 0 ? 1 : 0.9

                            return (
                                <motion.div
                                    key={absoluteIndex}
                                    animate={{ opacity, scale }}
                                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                                    className="absolute left-0 font-sans flex items-center text-[#F6F1EA] dark:text-zinc-100 whitespace-nowrap origin-left"
                                    style={{ 
                                        top: absoluteIndex * TOTAL_HEIGHT,
                                        height: ITEM_HEIGHT 
                                    }}
                                >
                                    {role}
                                </motion.div>
                            )
                        })}
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
