'use client';

import { useEffect } from 'react';
import { animate, motion, useMotionValue, useTransform, useReducedMotion } from 'motion/react';

interface TaskProgressBarProps {
    totalTasks: number;
    completedTasks: number;
    label?: string;
}

// The bar and the percentage count up together on mount so opening /build feels
// like progress is being "revealed". The count is driven by a MotionValue (not
// React state) so it animates smoothly without re-rendering, and it respects
// reduced-motion. On later changes (e.g. filtering) it tweens from the current
// value rather than snapping.
export function TaskProgressBar({ totalTasks, completedTasks, label }: TaskProgressBarProps) {
    const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const shouldReduceMotion = useReducedMotion();

    const count = useMotionValue(shouldReduceMotion ? percentage : 0);
    const countText = useTransform(count, (value) => `${Math.round(value)}% completed`);

    useEffect(() => {
        if (shouldReduceMotion) {
            count.set(percentage);
            return;
        }
        const isFirstReveal = count.get() === 0;
        const controls = animate(count, percentage, {
            duration: isFirstReveal ? 1.1 : 0.6,
            ease: [0.22, 1, 0.36, 1],
            delay: isFirstReveal ? 0.15 : 0,
        });
        return () => controls.stop();
    }, [percentage, shouldReduceMotion, count]);

    return (
        <div className="space-y-2 relative w-[94%]">
            {label && (
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{label}</span>
                    <motion.span className="text-sm text-muted-foreground tabular-nums">
                        {countText}
                    </motion.span>
                </div>
            )}
            <div className="relative">
                <div className="block h-3 w-full overflow-hidden rounded-full bg-input">
                    <motion.div
                        className="h-full rounded-full bg-primary"
                        initial={{ width: shouldReduceMotion ? `${percentage}%` : 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={
                            shouldReduceMotion
                                ? { duration: 0 }
                                : { duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.15 }
                        }
                    />
                </div>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{completedTasks} of {totalTasks} tasks done</span>
                <span>{totalTasks - completedTasks} remaining</span>
            </div>
        </div>
    );
}
