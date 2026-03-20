"use client"

import { useState, useEffect, useRef, type CSSProperties } from "react"
import { cn } from "@/lib/utils"

interface SegmentedProgressProps {
  value?: number
  segments?: number
  label?: string
  showPercentage?: boolean
  showDemo?: boolean
  color?: string
  className?: string
  innerClassName?: string
}

export function SegmentedProgress({
  value: initialValue = 80,
  segments = 20,
  label,
  showPercentage = true,
  showDemo = true,
  color,
  className,
  innerClassName,
}: SegmentedProgressProps) {
  const [progress, setProgress] = useState(initialValue)
  const value = showDemo ? progress : initialValue

  const [displayValue, setDisplayValue] = useState(0)
  const [hoveredSegment, setHoveredSegment] = useState<number | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [resolvedColor, setResolvedColor] = useState<string | null>(null)
  const animationRef = useRef<number | null>(null)
  const colorProbeRef = useRef<HTMLSpanElement | null>(null)
  const startValueRef = useRef(0)
  const startTimeRef = useRef(0)

  const filledSegments = Math.round((displayValue / 100) * segments)
  const hasTailwindBgColorClass = Boolean(color && /(^|\s)(hover:|focus:|dark:|data-\[[^\]]+\]:)*bg-[^\s]+/.test(color))
  const isDirectCssColor = Boolean(color && !hasTailwindBgColorClass)
  const usesCustomColor = Boolean(resolvedColor)

  const customColorVars = usesCustomColor
    ? ({ "--segmented-progress-color": resolvedColor } as CSSProperties)
    : undefined

  useEffect(() => {
    if (!isInitialized) {
      const initTimeout = setTimeout(() => setIsInitialized(true), 50)
      return () => clearTimeout(initTimeout)
    }

    const duration = 800
    startValueRef.current = displayValue
    startTimeRef.current = performance.now()

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTimeRef.current
      const progress = Math.min(elapsed / duration, 1)

      const eased = 1 - Math.pow(1 - progress, 3)

      const newValue = startValueRef.current + (value - startValueRef.current) * eased
      setDisplayValue(newValue)

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      }
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [value, isInitialized])

  useEffect(() => {
    if (!color) {
      setResolvedColor(null)
      return
    }

    if (isDirectCssColor) {
      setResolvedColor(color.trim())
      return
    }

    const probe = colorProbeRef.current
    if (!probe) return

    const computed = getComputedStyle(probe).backgroundColor
    if (computed && computed !== "rgba(0, 0, 0, 0)" && computed !== "transparent") {
      setResolvedColor(computed)
      return
    }

    setResolvedColor(null)
  }, [color, isDirectCssColor])

  const getSegmentStyle = (index: number, isFilled: boolean) => {
    let scale = 1
    const opacity = 1
    let translateY = 0

    if (hoveredSegment !== null) {
      const distance = Math.abs(hoveredSegment - index)
      if (distance === 0) {
        scale = 1.3
        translateY = -1
      } else if (distance <= 3) {
        const falloff = Math.cos((distance / 3) * (Math.PI / 2))
        scale = 1 + 0.2 * falloff
        translateY = -0.5 * falloff
      }
    }

    const delay = isInitialized ? index * 20 : 0

    return {
      transform: `scaleY(${scale}) translateY(${translateY}px)`,
      transitionDelay: `${delay}ms`,
      opacity,
    }
  }

  return (
    <div className={cn("flex flex-col gap-8", className)} style={customColorVars}>
      {color && hasTailwindBgColorClass && (
        <span
          ref={colorProbeRef}
          aria-hidden
          className={cn("pointer-events-none fixed -top-10 -left-10 h-2 w-2 opacity-0", color)}
        />
      )}
      <div className={cn("flex flex-col gap-3", innerClassName)}>
        {/* Header with label and percentage */}
        <div className="flex items-center justify-between">
          {label && <span className="text-sm font-medium text-muted-foreground tracking-wide">{label}</span>}
          {showPercentage && (
            <span
              className="text-sm font-semibold text-foreground tabular-nums tracking-tight transition-all duration-300"
              style={{
                filter: hoveredSegment !== null ? "brightness(1.2)" : "brightness(1)",
              }}
            >
              {Math.round(displayValue)}%
            </span>
          )}
        </div>

        {/* Segmented bar */}
        <div
          className="flex gap-0.75 py-1"
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          {Array.from({ length: segments }).map((_, index) => {
            const isFilled = index < filledSegments
            const isHovered = hoveredSegment === index

            return (
              <div
                key={index}
                onMouseEnter={() => setHoveredSegment(index)}
                onMouseLeave={() => setHoveredSegment(null)}
                className={cn(
                  "h-3 flex-1 rounded-lg cursor-pointer origin-center",
                  "transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
                  isFilled
                    ? usesCustomColor
                      ? "bg-(--segmented-progress-color)"
                      : hasTailwindBgColorClass
                        ? color
                        : "bg-primary"
                    : "bg-muted/60",
                  isHovered &&
                    isFilled &&
                    (usesCustomColor
                      ? "brightness-110 shadow-[0_0_16px_var(--segmented-progress-color)]"
                      : "brightness-110 shadow-[0_0_16px_hsl(var(--primary)/0.5)]"),
                  isHovered && !isFilled && "bg-muted",
                  hoveredSegment !== null && !isFilled && !isHovered && "bg-muted/40",
                )}
                style={getSegmentStyle(index, isFilled)}
              />
            )
          })}
        </div>
      </div>

      {showDemo && (
        <div className="flex flex-col gap-4">
          <input
            type="range"
            min={0}
            max={100}
            value={progress}
            onChange={(e) => setProgress(Number(e.target.value))}
            className={cn(
              `w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer
              transition-all duration-300
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-4
              [&::-webkit-slider-thumb]:h-4
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-primary
              [&::-webkit-slider-thumb]:shadow-[0_0_10px_hsl(var(--primary)/0.4)]
              [&::-webkit-slider-thumb]:cursor-pointer
              [&::-webkit-slider-thumb]:transition-all
              [&::-webkit-slider-thumb]:duration-300
              [&::-webkit-slider-thumb]:ease-out
              [&::-webkit-slider-thumb]:hover:scale-125
              [&::-webkit-slider-thumb]:hover:shadow-[0_0_16px_hsl(var(--primary)/0.6)]
              [&::-moz-range-thumb]:w-4
              [&::-moz-range-thumb]:h-4
              [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:bg-primary
              [&::-moz-range-thumb]:border-0
              [&::-moz-range-thumb]:cursor-pointer`,
              usesCustomColor &&
                "[&::-webkit-slider-thumb]:bg-(--segmented-progress-color) [&::-webkit-slider-thumb]:shadow-[0_0_10px_var(--segmented-progress-color)] [&::-webkit-slider-thumb]:hover:shadow-[0_0_16px_var(--segmented-progress-color)] [&::-moz-range-thumb]:bg-(--segmented-progress-color)",
            )}
          />
          <p className="text-center text-xs text-muted-foreground tracking-wide">Drag to adjust value</p>
        </div>
      )}
    </div>
  )
}
