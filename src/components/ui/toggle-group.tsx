"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ToggleGroupContextValue {
    value: string
    onValueChange: (value: string) => void
    type: "single" | "multiple"
}

const ToggleGroupContext = React.createContext<ToggleGroupContextValue | null>(null)

interface ToggleGroupProps extends React.HTMLAttributes<HTMLDivElement> {
    type: "single" | "multiple"
    value?: string
    onValueChange?: (value: string) => void
    children: React.ReactNode
}

function ToggleGroup({
    className,
    type,
    value = "",
    onValueChange = () => { },
    children,
    ...props
}: ToggleGroupProps) {
    return (
        <ToggleGroupContext.Provider value={{ value, onValueChange, type }}>
            <div
                role="group"
                className={cn("inline-flex items-center gap-1", className)}
                {...props}
            >
                {children}
            </div>
        </ToggleGroupContext.Provider>
    )
}

interface ToggleGroupItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    value: string
}

const ToggleGroupItem = React.forwardRef<HTMLButtonElement, ToggleGroupItemProps>(
    ({ className, value, children, ...props }, ref) => {
        const context = React.useContext(ToggleGroupContext)

        if (!context) {
            throw new Error("ToggleGroupItem must be used within a ToggleGroup")
        }

        const isSelected = context.value === value

        return (
            <button
                ref={ref}
                type="button"
                role="radio"
                aria-checked={isSelected}
                data-state={isSelected ? "on" : "off"}
                onClick={() => context.onValueChange(value)}
                className={cn(
                    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
                    "hover:bg-muted hover:text-muted-foreground",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    "disabled:pointer-events-none disabled:opacity-50",
                    "data-[state=on]:bg-background data-[state=on]:text-foreground",
                    className
                )}
                {...props}
            >
                {children}
            </button>
        )
    }
)
ToggleGroupItem.displayName = "ToggleGroupItem"

export { ToggleGroup, ToggleGroupItem }
