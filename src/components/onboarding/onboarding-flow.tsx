'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from '@/components/ui/stepper';
import { OnboardingRadioGroup } from './onboarding-cards';
import { BranchQuestions } from './branch-questions';
import { saveOnboarding } from '@/lib/actions/onboarding';
import Logo from '@/components/logo';
import {
  LightbulbFilament,
  Hammer,
  Rocket,
  CurrencyCircleDollar,
  Briefcase,
  UserCircleGear,
  Megaphone,
  PencilSimple,
  Strategy,
  CirclesFour,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  SpinnerGap,
} from '@phosphor-icons/react';
import type {
  OnboardingStage,
  WeakestRole,
  BranchAnswers,
} from '@/lib/types/onboarding';
import {
  STAGE_OPTIONS,
  ROLE_OPTIONS,
  getAIPersona,
  getFocusAreas,
} from '@/lib/types/onboarding';

const STEPS = [
  { step: 1, title: 'Your Stage' },
  { step: 2, title: 'Deep Dive' },
  { step: 3, title: 'Your Role' },
  { step: 4, title: 'Commitment' },
];

const STAGE_ICONS: Record<string, React.ReactNode> = {
  just_an_idea: <LightbulbFilament weight="duotone" size={22} />,
  building_mvp: <Hammer weight="duotone" size={22} />,
  launched_no_revenue: <Rocket weight="duotone" size={22} />,
  making_revenue: <CurrencyCircleDollar weight="duotone" size={22} />,
  fulltime: <Briefcase weight="duotone" size={22} />,
};

const ROLE_ICONS: Record<string, React.ReactNode> = {
  cto: <UserCircleGear weight="duotone" size={22} />,
  marketer: <Megaphone weight="duotone" size={22} />,
  copywriter: <PencilSimple weight="duotone" size={22} />,
  strategist: <Strategy weight="duotone" size={22} />,
  all: <CirclesFour weight="duotone" size={22} />,
};

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction < 0 ? 80 : -80,
    opacity: 0,
  }),
};

interface OnboardingFlowProps {
  redirectTo?: string;
}

export default function OnboardingFlow({ redirectTo = '/projects' }: OnboardingFlowProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(0);
  const [saving, setSaving] = useState(false);
  const [showResult, setShowResult] = useState(false);

  // Form state
  const [stage, setStage] = useState<OnboardingStage | null>(null);
  const [branchAnswers, setBranchAnswers] = useState<Record<string, unknown>>(
    {}
  );
  const [weakestRole, setWeakestRole] = useState<WeakestRole | null>(null);
  const [nextVersionGoal, setNextVersionGoal] = useState('');
  const [shipDate, setShipDate] = useState('');
  const [ifNothingChanges, setIfNothingChanges] = useState('');

  const canProceed = useCallback(() => {
    switch (currentStep) {
      case 1:
        return !!stage;
      case 2:
        return Object.keys(branchAnswers).length > 0;
      case 3:
        return !!weakestRole;
      case 4:
        return true; // All step 4 fields optional-ish
      default:
        return false;
    }
  }, [currentStep, stage, branchAnswers, weakestRole]);

  const goNext = () => {
    if (currentStep < 4) {
      setDirection(1);
      setCurrentStep((s) => s + 1);
    }
  };

  const goBack = () => {
    if (currentStep > 1) {
      setDirection(-1);
      setCurrentStep((s) => s - 1);
    }
  };

  const handleSubmit = async () => {
    if (!stage) return;
    setSaving(true);

    const result = await saveOnboarding({
      stage,
      branch_answers: branchAnswers as BranchAnswers,
      weakest_role: weakestRole,
      next_version_goal: nextVersionGoal,
      ship_date: shipDate || null,
      if_nothing_changes: ifNothingChanges,
    });

    if (result.error) {
      console.error('Onboarding save failed:', result.error);
      setSaving(false);
      return;
    }

    // Show personalized result card
    setShowResult(true);
  };

  const getBiggestConstraint = (): string => {
    if (!stage) return '';
    switch (stage) {
      case 'just_an_idea':
        return 'turning your idea into a shippable plan';
      case 'building_mvp':
        return 'shipping consistently with clear scope';
      case 'launched_no_revenue':
        return 'getting distribution & converting users';
      case 'making_revenue':
        return 'scaling growth while maintaining quality';
      case 'fulltime':
        return 'managing context across every role you play';
    }
  };

  // Show result screen after successful save
  if (showResult) {
    const personas = stage ? getAIPersona(stage) : [];
    const focuses = stage ? getFocusAreas(stage) : [];

    return (
      <div className="flex min-h-svh items-center justify-center bg-[#F7F5F3] p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-lg text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground"
          >
            <CheckCircle weight="fill" size={32} />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold text-foreground"
          >
            Based on your answers...
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="mt-3 text-muted-foreground"
          >
            Your biggest constraint is{' '}
            <span className="font-semibold text-foreground">
              {getBiggestConstraint()}
            </span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-6 rounded-xl border border-input bg-white p-5 text-left shadow-sm"
          >
            <p className="text-sm text-muted-foreground mb-2">
              We&apos;ve configured your workspace:
            </p>
            <div className="flex flex-wrap gap-2 mb-3">
              {personas.map((p) => (
                <span
                  key={p}
                  className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                >
                  AI: {p}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {focuses.map((f) => (
                <span
                  key={f}
                  className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
                >
                  {f}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75 }}
          >
            <Button
              className="mt-8 h-11 px-8 gap-2"
              onClick={() => router.push(redirectTo)}
            >
              Let&apos;s fix that
              <ArrowRight weight="bold" size={16} />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh flex-col bg-[#F7F5F3]">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border/50 bg-white/60 backdrop-blur-sm px-6 py-4">
        <Logo height={22} width={22} full textClassName="text-foreground ml-[1px] text-sm font-medium" />
        <span className="text-xs text-muted-foreground">
          Step {currentStep} of {STEPS.length}
        </span>
      </header>

      {/* Stepper bar */}
      <div className="border-b border-border/50 bg-white/40 px-6 py-4 ">
        <div className="mx-auto max-w-lg">
          <Stepper className="items-start gap-0 " value={currentStep}>
            {STEPS.map(({ step, title }) => (
              <StepperItem className="flex-1" key={step} step={step}>
                <StepperTrigger
                  asChild
                  className="w-full flex-col items-start gap-2 rounded"
                >
                  <span>
                    <StepperIndicator
                      asChild
                      className="h-1.5 w-full rounded-full bg-border"
                    >
                      <span className="sr-only">{step}</span>
                    </StepperIndicator>
                    <div className="space-y-0.5">
                      <StepperTitle className="text-xs">{title}</StepperTitle>
                    </div>
                  </span>
                </StepperTrigger>
                {step < STEPS.length && <StepperSeparator className="hidden" />}
              </StepperItem>
            ))}
          </Stepper>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-xl px-6 py-10">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: 'easeInOut' }}
            >
              {/* Step 1: Stage Identification */}
              {currentStep === 1 && (
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    Where are you right now?
                  </h2>
                  <p className="mt-2 mb-6 text-sm text-muted-foreground">
                    This helps us personalize your experience and AI co-founder.
                  </p>
                  <OnboardingRadioGroup
                    value={stage}
                    onChange={(v) => {
                      setStage(v as OnboardingStage);
                      setBranchAnswers({}); // Reset branch on stage change
                    }}
                    options={STAGE_OPTIONS.map((o) => ({
                      ...o,
                      icon: STAGE_ICONS[o.value],
                    }))}
                  />
                </div>
              )}

              {/* Step 2: Branch Questions */}
              {currentStep === 2 && stage && (
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    Let&apos;s go deeper
                  </h2>
                  <p className="mt-2 mb-6 text-sm text-muted-foreground">
                    A few more questions to tailor your workspace.
                  </p>
                  <BranchQuestions
                    stage={stage}
                    answers={branchAnswers}
                    onChange={setBranchAnswers}
                  />
                </div>
              )}

              {/* Step 3: Identity Reinforcement */}
              {currentStep === 3 && (
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    You&apos;re building solo
                  </h2>
                  <p className="mt-2 mb-6 text-sm text-muted-foreground">
                    What role do you struggle with most? We&apos;ll assign an AI
                    persona to help.
                  </p>
                  <OnboardingRadioGroup
                    value={weakestRole}
                    onChange={(v) => setWeakestRole(v as WeakestRole)}
                    options={ROLE_OPTIONS.map((o) => ({
                      ...o,
                      icon: ROLE_ICONS[o.value],
                    }))}
                  />
                </div>
              )}

              {/* Step 4: Commitment Trigger */}
              {currentStep === 4 && (
                <div className="flex flex-col gap-8">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">
                      Lock in your commitment
                    </h2>
                    <p className="mt-2 mb-6 text-sm text-muted-foreground">
                      Set a concrete goal. This activates psychological
                      commitment.
                    </p>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                  >
                    <Label
                      htmlFor="version-goal"
                      className="mb-2 text-sm font-medium block"
                    >
                      What&apos;s your next version goal?
                    </Label>
                    <Input
                      id="version-goal"
                      placeholder="e.g., Launch v1 with auth, dashboard, and payments"
                      value={nextVersionGoal}
                      onChange={(e) => setNextVersionGoal(e.target.value)}
                      className="h-11"
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Label
                      htmlFor="ship-date"
                      className="mb-2 text-sm font-medium block"
                    >
                      When will you ship it?
                    </Label>
                    <Input
                      id="ship-date"
                      type="date"
                      value={shipDate}
                      onChange={(e) => setShipDate(e.target.value)}
                      className="h-11"
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                  >
                    <Label
                      htmlFor="nothing-changes"
                      className="mb-2 text-sm font-medium block"
                    >
                      If nothing changes in 3 months, what happens?
                    </Label>
                    <Textarea
                      id="nothing-changes"
                      placeholder="Be honest with yourself..."
                      value={ifNothingChanges}
                      onChange={(e) => setIfNothingChanges(e.target.value)}
                      rows={3}
                    />
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      This activates loss aversion — a powerful motivator.
                    </p>
                  </motion.div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Footer navigation */}
      <footer className="border-t border-border/50 bg-white/60 backdrop-blur-sm px-6 py-4">
        <div className="mx-auto flex max-w-xl items-center justify-between">
          <Button
            variant="ghost"
            onClick={goBack}
            disabled={currentStep === 1}
            className="gap-2"
          >
            <ArrowLeft size={16} />
            Back
          </Button>

          {currentStep < 4 ? (
            <Button
              onClick={goNext}
              disabled={!canProceed()}
              className="gap-2 h-10 px-6"
            >
              Continue
              <ArrowRight size={16} />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={saving}
              className="gap-2 h-10 px-6"
            >
              {saving ? (
                <>
                  <SpinnerGap size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Complete Setup
                  <CheckCircle weight="fill" size={16} />
                </>
              )}
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}
