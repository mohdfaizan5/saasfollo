'use client';

import { useId } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Check } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'motion/react';
import type { ReactNode } from 'react';

/* ------------------------------------------------------------------ */
/*  Single-select radio card list (comp-161 style)                    */
/* ------------------------------------------------------------------ */
interface OptionCardProps {
  value: string;
  label: string;
  description?: string;
  icon?: ReactNode;
}

export function OnboardingRadioGroup({
  options,
  value,
  onChange,
  onOptionSelect,
}: {
  options: OptionCardProps[];
  value: string | null;
  onChange: (v: string) => void;
  onOptionSelect?: () => void;
}) {
  const id = useId();

  return (
    <RadioGroup
      className="gap-3"
      value={value ?? ''}
      onValueChange={(nextValue) => {
        onOptionSelect?.();
        onChange(nextValue);
      }}
    >
      <AnimatePresence mode="popLayout">
        {options.map((opt, i) => (
          <motion.div
            key={opt.value}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.25 }}
          >
            <div
              className={cn(
                'relative flex w-full items-center gap-3 rounded-xl border border-input p-4 shadow-xs outline-none transition-all duration-200',
                'has-data-[state=checked]:border-primary has-data-[state=checked]:bg-primary/3 has-data-[state=checked]:shadow-sm',
                'hover:border-primary/40 cursor-pointer'
              )}
            >
              <RadioGroupItem
                className="order-1 after:absolute after:inset-0"
                id={`${id}-${opt.value}`}
                value={opt.value}
              />
              <div className="flex grow items-center gap-3">
                {opt.icon && (
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-primary">
                    {opt.icon}
                  </span>
                )}
                <div className="grid gap-0.5">
                  <Label
                    htmlFor={`${id}-${opt.value}`}
                    className="cursor-pointer text-sm font-medium"
                  >
                    {opt.label}
                  </Label>
                  {opt.description && (
                    <p className="text-xs text-muted-foreground">
                      {opt.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </RadioGroup>
  );
}

/* ------------------------------------------------------------------ */
/*  Multi-select checkbox card list                                   */
/* ------------------------------------------------------------------ */
export function OnboardingCheckboxGroup({
  options,
  values,
  onChange,
  onOptionSelect,
}: {
  options: OptionCardProps[];
  values: string[];
  onChange: (v: string[]) => void;
  onOptionSelect?: () => void;
}) {
  const id = useId();

  const toggle = (val: string) => {
    onOptionSelect?.();
    if (values.includes(val)) {
      onChange(values.filter((v) => v !== val));
    } else {
      onChange([...values, val]);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <AnimatePresence mode="popLayout">
        {options.map((opt, i) => (
          <motion.div
            key={opt.value}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.25 }}
          >
            <label
              htmlFor={`${id}-${opt.value}`}
              onClick={() => toggle(opt.value)}
              className={cn(
                'relative flex w-full items-center gap-3 rounded-xl border border-input p-4 shadow-xs outline-none transition-all duration-200 cursor-pointer',
                values.includes(opt.value) &&
                  'border-primary bg-primary/3 shadow-sm'
              )}
            >
              <div className="flex grow items-center gap-3">
                {opt.icon && (
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-primary">
                    {opt.icon}
                  </span>
                )}
                <div className="grid gap-0.5">
                  <span className="text-sm font-medium">{opt.label}</span>
                  {opt.description && (
                    <p className="text-xs text-muted-foreground">
                      {opt.description}
                    </p>
                  )}
                </div>
              </div>
              <span
                className={cn(
                  'order-1 flex size-5 shrink-0 items-center justify-center rounded border transition-colors',
                  values.includes(opt.value)
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-input bg-background'
                )}
              >
                {values.includes(opt.value) && (
                  <Check weight="bold" size={12} />
                )}
              </span>
            </label>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
