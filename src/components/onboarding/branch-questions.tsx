'use client';

import { OnboardingRadioGroup } from './onboarding-cards';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'motion/react';
import {
  LightbulbFilament,
  Code,
  Question,
  Timer,
  MagnifyingGlass,
  Target,
  Clipboard,
  TreeStructure,
  ListChecks,
  ArrowsClockwise,
  ShieldStar,
  Megaphone,
  ChatDots,
  Browsers,
  CurrencyCircleDollar,
  Users,
  Envelope,
  ChartLineUp,
  TrendUp,
  UserCircleGear,
  CalendarBlank,
  Lightning,
  Brain,
  Toolbox,
  HardHat,
} from '@phosphor-icons/react';
import type {
  OnboardingStage,
  BranchAAnswers,
  BranchBAnswers,
  BranchCAnswers,
  BranchDAnswers,
  BranchEAnswers,
} from '@/lib/types/onboarding';

const fadeIn = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 },
};

/* ====================================================================
   BRANCH A — Just an idea
   ==================================================================== */
export function BranchAQuestions({
  answers,
  onChange,
}: {
  answers: BranchAAnswers;
  onChange: (a: BranchAAnswers) => void;
}) {
  return (
    <div className="flex flex-col gap-8">
      <motion.div {...fadeIn}>
        <h3 className="mb-3 text-lg font-semibold text-foreground">
          What&apos;s stopping you from shipping your MVP?
        </h3>
        <OnboardingRadioGroup
          value={answers.stopping_from_shipping ?? null}
          onChange={(v) => onChange({ ...answers, stopping_from_shipping: v })}
          options={[
            { value: 'tech_uncertainty', label: 'Tech uncertainty', description: 'Not sure about the right stack', icon: <Code weight="duotone" size={22} /> },
            { value: 'dont_know_what_first', label: "Don't know what to build first", description: 'Too many features in mind', icon: <Question weight="duotone" size={22} /> },
            { value: 'fear_wrong_thing', label: 'Fear of building the wrong thing', description: 'Analysis paralysis', icon: <LightbulbFilament weight="duotone" size={22} /> },
            { value: 'time_consistency', label: 'Time / consistency', description: 'Hard to maintain momentum', icon: <Timer weight="duotone" size={22} /> },
            { value: 'market_validation', label: 'Market validation confusion', description: "Don't know if people want it", icon: <MagnifyingGlass weight="duotone" size={22} /> },
          ]}
        />
      </motion.div>

      <motion.div {...fadeIn} transition={{ delay: 0.1, duration: 0.3 }}>
        <h3 className="mb-3 text-lg font-semibold text-foreground">
          Have you defined your first version goal yet?
        </h3>
        <OnboardingRadioGroup
          value={answers.defined_first_version ?? null}
          onChange={(v) => onChange({ ...answers, defined_first_version: v })}
          options={[
            { value: 'yes_clearly', label: 'Yes, clearly', description: 'I know exactly what v1 looks like', icon: <Target weight="duotone" size={22} /> },
            { value: 'rough_idea', label: 'Rough idea', description: 'General direction but not fleshed out', icon: <Clipboard weight="duotone" size={22} /> },
            { value: 'no', label: 'No', description: "Haven't defined it yet", icon: <Question weight="duotone" size={22} /> },
          ]}
        />
      </motion.div>

      <motion.div {...fadeIn} transition={{ delay: 0.2, duration: 0.3 }}>
        <Label className="mb-2 text-lg font-semibold text-foreground block" htmlFor="monthly-win">
          What would make this month a win for you?
        </Label>
        <Input
          id="monthly-win"
          placeholder="e.g., Ship a landing page, validate with 5 users..."
          value={answers.monthly_win ?? ''}
          onChange={(e) => onChange({ ...answers, monthly_win: e.target.value })}
          className="h-11"
        />
      </motion.div>
    </div>
  );
}

/* ====================================================================
   BRANCH B — Building MVP
   ==================================================================== */
export function BranchBQuestions({
  answers,
  onChange,
}: {
  answers: BranchBAnswers;
  onChange: (a: BranchBAnswers) => void;
}) {
  return (
    <div className="flex flex-col gap-8">
      <motion.div {...fadeIn}>
        <h3 className="mb-3 text-lg font-semibold text-foreground">
          What&apos;s your biggest bottleneck right now?
        </h3>
        <OnboardingRadioGroup
          value={answers.biggest_bottleneck ?? null}
          onChange={(v) => onChange({ ...answers, biggest_bottleneck: v })}
          options={[
            { value: 'architecture', label: 'Architecture decisions', description: 'Stuck on technical direction', icon: <TreeStructure weight="duotone" size={22} /> },
            { value: 'feature_prioritization', label: 'Feature prioritization', description: "Can't decide what's most important", icon: <ListChecks weight="duotone" size={22} /> },
            { value: 'staying_consistent', label: 'Staying consistent', description: 'Motivation comes and goes', icon: <ArrowsClockwise weight="duotone" size={22} /> },
            { value: 'scope_creep', label: 'Scope creep', description: 'Keeps growing beyond plan', icon: <ShieldStar weight="duotone" size={22} /> },
            { value: 'marketing_anxiety', label: 'Marketing anxiety', description: 'Worried about launch & growth', icon: <Megaphone weight="duotone" size={22} /> },
          ]}
        />
      </motion.div>

      <motion.div {...fadeIn} transition={{ delay: 0.1, duration: 0.3 }}>
        <h3 className="mb-3 text-lg font-semibold text-foreground">
          Do you work in clear version goals or endless backlog?
        </h3>
        <OnboardingRadioGroup
          value={answers.version_goals_or_backlog ?? null}
          onChange={(v) => onChange({ ...answers, version_goals_or_backlog: v })}
          options={[
            { value: 'clear_versions', label: 'Clear versions', description: 'Defined milestones and scope', icon: <Target weight="duotone" size={22} /> },
            { value: 'backlog_chaos', label: 'Backlog chaos', description: 'Never-ending todo list', icon: <ArrowsClockwise weight="duotone" size={22} /> },
            { value: 'in_between', label: 'Somewhere in between', description: 'Mix of both', icon: <Clipboard weight="duotone" size={22} /> },
          ]}
        />
      </motion.div>

      <motion.div {...fadeIn} transition={{ delay: 0.2, duration: 0.3 }}>
        <h3 className="mb-3 text-lg font-semibold text-foreground">
          When do you plan to ship your next version?
        </h3>
        <OnboardingRadioGroup
          value={answers.next_version_ship_date ?? null}
          onChange={(v) => onChange({ ...answers, next_version_ship_date: v })}
          options={[
            { value: 'this_week', label: 'This week', description: 'Almost ready to go', icon: <Lightning weight="duotone" size={22} /> },
            { value: 'this_month', label: 'This month', description: 'Working toward it', icon: <CalendarBlank weight="duotone" size={22} /> },
            { value: 'no_clear_date', label: 'No clear date', description: "Haven't set a deadline", icon: <Timer weight="duotone" size={22} /> },
          ]}
        />
      </motion.div>
    </div>
  );
}

/* ====================================================================
   BRANCH C — Launched but no revenue
   ==================================================================== */
export function BranchCQuestions({
  answers,
  onChange,
}: {
  answers: BranchCAnswers;
  onChange: (a: BranchCAnswers) => void;
}) {
  return (
    <div className="flex flex-col gap-8">
      <motion.div {...fadeIn}>
        <h3 className="mb-3 text-lg font-semibold text-foreground">
          How are you currently trying to get users?
        </h3>
        <OnboardingRadioGroup
          value={answers.getting_users_how ?? null}
          onChange={(v) => onChange({ ...answers, getting_users_how: v })}
          options={[
            { value: 'seo', label: 'SEO', description: 'Organic search traffic', icon: <MagnifyingGlass weight="duotone" size={22} /> },
            { value: 'cold_dms', label: 'Cold DMs', description: 'Direct outreach', icon: <Envelope weight="duotone" size={22} /> },
            { value: 'communities', label: 'Reddit / Communities', description: 'Engaging in forums', icon: <ChatDots weight="duotone" size={22} /> },
            { value: 'ads', label: 'Ads', description: 'Paid acquisition', icon: <CurrencyCircleDollar weight="duotone" size={22} /> },
            { value: 'not_consistent', label: 'Not consistently marketing', description: 'Sporadic efforts', icon: <ArrowsClockwise weight="duotone" size={22} /> },
          ]}
        />
      </motion.div>

      <motion.div {...fadeIn} transition={{ delay: 0.1, duration: 0.3 }}>
        <h3 className="mb-3 text-lg font-semibold text-foreground">
          What&apos;s happening right now?
        </h3>
        <OnboardingRadioGroup
          value={answers.whats_happening ?? null}
          onChange={(v) => onChange({ ...answers, whats_happening: v })}
          options={[
            { value: 'traffic_no_conversions', label: 'Getting traffic but no conversions', icon: <Browsers weight="duotone" size={22} /> },
            { value: 'no_traffic', label: 'No traffic', icon: <ChartLineUp weight="duotone" size={22} /> },
            { value: 'signup_no_pay', label: "People sign up but don't pay", icon: <Users weight="duotone" size={22} /> },
            { value: 'not_sure', label: 'Not sure', icon: <Question weight="duotone" size={22} /> },
          ]}
        />
      </motion.div>

      <motion.div {...fadeIn} transition={{ delay: 0.2, duration: 0.3 }}>
        <h3 className="mb-3 text-lg font-semibold text-foreground">
          How many growth actions did you take last week?
        </h3>
        <OnboardingRadioGroup
          value={answers.growth_actions_last_week ?? null}
          onChange={(v) =>
            onChange({ ...answers, growth_actions_last_week: v })
          }
          options={[
            { value: '0', label: '0', description: 'No marketing actions', icon: <Timer weight="duotone" size={22} /> },
            { value: '1_3', label: '1–3', description: 'A few efforts', icon: <TrendUp weight="duotone" size={22} /> },
            { value: '4_7', label: '4–7', description: 'Steady rhythm', icon: <ChartLineUp weight="duotone" size={22} /> },
            { value: '7_plus', label: '7+', description: 'Consistent execution', icon: <Lightning weight="duotone" size={22} /> },
          ]}
        />
      </motion.div>
    </div>
  );
}

/* ====================================================================
   BRANCH D — Making revenue
   ==================================================================== */
export function BranchDQuestions({
  answers,
  onChange,
}: {
  answers: BranchDAnswers;
  onChange: (a: BranchDAnswers) => void;
}) {
  return (
    <div className="flex flex-col gap-8">
      <motion.div {...fadeIn}>
        <h3 className="mb-3 text-lg font-semibold text-foreground">
          What&apos;s your current MRR range?
        </h3>
        <OnboardingRadioGroup
          value={answers.mrr_range ?? null}
          onChange={(v) => onChange({ ...answers, mrr_range: v })}
          options={[
            { value: 'under_100', label: '<$100', icon: <CurrencyCircleDollar weight="duotone" size={22} /> },
            { value: '100_500', label: '$100–$500', icon: <CurrencyCircleDollar weight="duotone" size={22} /> },
            { value: '500_2k', label: '$500–$2k', icon: <CurrencyCircleDollar weight="duotone" size={22} /> },
            { value: '2k_plus', label: '$2k+', icon: <CurrencyCircleDollar weight="duotone" size={22} /> },
          ]}
        />
      </motion.div>

      <motion.div {...fadeIn} transition={{ delay: 0.1, duration: 0.3 }}>
        <h3 className="mb-3 text-lg font-semibold text-foreground">
          What&apos;s the real bottleneck to growing?
        </h3>
        <OnboardingRadioGroup
          value={answers.growth_bottleneck ?? null}
          onChange={(v) => onChange({ ...answers, growth_bottleneck: v })}
          options={[
            { value: 'traffic', label: 'Traffic', description: "Not enough eyeballs", icon: <Browsers weight="duotone" size={22} /> },
            { value: 'conversions', label: 'Conversions', description: 'Visitors not converting', icon: <TrendUp weight="duotone" size={22} /> },
            { value: 'retention', label: 'Retention', description: 'Users churning', icon: <Users weight="duotone" size={22} /> },
            { value: 'time_management', label: 'Time management', description: 'Too much to do', icon: <Timer weight="duotone" size={22} /> },
            { value: 'feature_execution', label: 'Feature execution', description: "Can't ship fast enough", icon: <Code weight="duotone" size={22} /> },
          ]}
        />
      </motion.div>

      <motion.div {...fadeIn} transition={{ delay: 0.2, duration: 0.3 }}>
        <h3 className="mb-3 text-lg font-semibold text-foreground">
          Are you shipping monthly versions?
        </h3>
        <OnboardingRadioGroup
          value={answers.shipping_monthly ?? null}
          onChange={(v) => onChange({ ...answers, shipping_monthly: v })}
          options={[
            { value: 'yes', label: 'Yes', description: 'Consistent cadence', icon: <Lightning weight="duotone" size={22} /> },
            { value: 'sometimes', label: 'Sometimes', description: 'When I can', icon: <ArrowsClockwise weight="duotone" size={22} /> },
            { value: 'no', label: 'No', description: 'No shipping rhythm', icon: <Timer weight="duotone" size={22} /> },
          ]}
        />
      </motion.div>
    </div>
  );
}

/* ====================================================================
   BRANCH E — Full-time on it
   ==================================================================== */
export function BranchEQuestions({
  answers,
  onChange,
}: {
  answers: BranchEAnswers;
  onChange: (a: BranchEAnswers) => void;
}) {
  return (
    <div className="flex flex-col gap-8">
      <motion.div {...fadeIn}>
        <h3 className="mb-3 text-lg font-semibold text-foreground">
          What drains most of your energy?
        </h3>
        <OnboardingRadioGroup
          value={answers.energy_drain ?? null}
          onChange={(v) => onChange({ ...answers, energy_drain: v })}
          options={[
            { value: 'decision_fatigue', label: 'Decision fatigue', description: 'Too many choices daily', icon: <Brain weight="duotone" size={22} /> },
            { value: 'marketing_consistency', label: 'Marketing consistency', description: 'Hard to keep it up', icon: <Megaphone weight="duotone" size={22} /> },
            { value: 'product_scope', label: 'Product scope', description: 'Always growing, never done', icon: <ShieldStar weight="duotone" size={22} /> },
            { value: 'tool_chaos', label: 'Tool chaos', description: 'Scattered across 10 apps', icon: <Toolbox weight="duotone" size={22} /> },
            { value: 'wearing_many_hats', label: 'Wearing too many hats', description: 'Dev, marketer, designer, support...', icon: <HardHat weight="duotone" size={22} /> },
          ]}
        />
      </motion.div>

      <motion.div {...fadeIn} transition={{ delay: 0.1, duration: 0.3 }}>
        <h3 className="mb-3 text-lg font-semibold text-foreground">
          How many tools are you currently juggling?
        </h3>
        <OnboardingRadioGroup
          value={answers.tools_juggling ?? null}
          onChange={(v) => onChange({ ...answers, tools_juggling: v })}
          options={[
            { value: '1_2', label: '1–2', description: 'Pretty lean setup', icon: <UserCircleGear weight="duotone" size={22} /> },
            { value: '3_5', label: '3–5', description: 'Getting complex', icon: <Toolbox weight="duotone" size={22} /> },
            { value: '5_plus', label: '5+', description: 'Tool chaos territory', icon: <ArrowsClockwise weight="duotone" size={22} /> },
          ]}
        />
      </motion.div>
    </div>
  );
}

/* ====================================================================
   Branch renderer (dispatches based on stage)
   ==================================================================== */
export function BranchQuestions({
  stage,
  answers,
  onChange,
}: {
  stage: OnboardingStage;
  answers: Record<string, unknown>;
  onChange: (a: Record<string, unknown>) => void;
}) {
  switch (stage) {
    case 'just_an_idea':
      return (
        <BranchAQuestions
          answers={answers as BranchAAnswers}
          onChange={(a) => onChange(a as unknown as Record<string, unknown>)}
        />
      );
    case 'building_mvp':
      return (
        <BranchBQuestions
          answers={answers as BranchBAnswers}
          onChange={(a) => onChange(a as unknown as Record<string, unknown>)}
        />
      );
    case 'launched_no_revenue':
      return (
        <BranchCQuestions
          answers={answers as BranchCAnswers}
          onChange={(a) => onChange(a as unknown as Record<string, unknown>)}
        />
      );
    case 'making_revenue':
      return (
        <BranchDQuestions
          answers={answers as BranchDAnswers}
          onChange={(a) => onChange(a as unknown as Record<string, unknown>)}
        />
      );
    case 'fulltime':
      return (
        <BranchEQuestions
          answers={answers as BranchEAnswers}
          onChange={(a) => onChange(a as unknown as Record<string, unknown>)}
        />
      );
    default:
      return null;
  }
}
