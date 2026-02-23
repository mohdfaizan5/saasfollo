// NumberInput — a controlled number input with plus/minus stepper buttons.
// Styled to match the project's shadcn input/button visual system.

'use client';

import * as React from 'react';
import { Minus, Plus } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

interface NumberInputProps {
    value: number | '';
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}

function NumberInput({
    value,
    onChange,
    min,
    max,
    step = 1,
    placeholder,
    disabled = false,
    className,
}: NumberInputProps) {
    const numericValue = typeof value === 'number' ? value : 0;

    const handleDecrement = () => {
        const next = numericValue - step;
        if (min !== undefined && next < min) return;
        onChange(next);
    };

    const handleIncrement = () => {
        const next = numericValue + step;
        if (max !== undefined && next > max) return;
        onChange(next);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;
        if (raw === '') {
            onChange(0);
            return;
        }
        const parsed = parseInt(raw, 10);
        if (isNaN(parsed)) return;
        if (min !== undefined && parsed < min) return;
        if (max !== undefined && parsed > max) return;
        onChange(parsed);
    };

    const isAtMin = min !== undefined && numericValue <= min;
    const isAtMax = max !== undefined && numericValue >= max;

    return (
        <div
            className={cn(
                'inline-flex h-8 w-full items-center overflow-hidden rounded-lg border border-muted-foreground/50 bg-transparent text-sm transition-colors focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50',
                disabled && 'opacity-50 pointer-events-none',
                className,
            )}
        >
            {/* Decrement button */}
            <button
                type="button"
                onClick={handleDecrement}
                disabled={disabled || isAtMin}
                className="flex aspect-square h-full items-center justify-center border-r border-muted-foreground/50 bg-background text-muted-foreground/80 transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
            >
                <Minus size={14} weight="bold" />
            </button>

            {/* Number input */}
            <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={value === 0 ? '' : value}
                onChange={handleInputChange}
                placeholder={placeholder}
                disabled={disabled}
                className="w-full grow bg-background px-3 py-1 text-center text-foreground tabular-nums outline-none placeholder:text-muted-foreground"
            />

            {/* Increment button */}
            <button
                type="button"
                onClick={handleIncrement}
                disabled={disabled || isAtMax}
                className="flex aspect-square h-full items-center justify-center border-l border-muted-foreground/50 bg-background text-muted-foreground/80 transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
            >
                <Plus size={14} weight="bold" />
            </button>
        </div>
    );
}

export { NumberInput };
