/**
 * Types for the onboarding flow
 */

// Stage identification options
export type OnboardingStage =
  | 'just_an_idea'
  | 'building_mvp'
  | 'launched_no_revenue'
  | 'making_revenue'
  | 'fulltime';

// Weakest role options
export type WeakestRole = 'cto' | 'marketer' | 'copywriter' | 'strategist' | 'all';

// Branch A answers (Just an idea)
export interface BranchAAnswers {
  stopping_from_shipping?: string;
  defined_first_version?: string;
  monthly_win?: string;
}

// Branch B answers (Building MVP)
export interface BranchBAnswers {
  biggest_bottleneck?: string;
  version_goals_or_backlog?: string;
  next_version_ship_date?: string;
}

// Branch C answers (Launched but no revenue)
export interface BranchCAnswers {
  getting_users_how?: string[];
  whats_happening?: string;
  growth_actions_last_week?: string;
}

// Branch D answers (Making revenue)
export interface BranchDAnswers {
  mrr_range?: string;
  growth_bottleneck?: string;
  shipping_monthly?: string;
}

// Branch E answers (Full-time on it)
export interface BranchEAnswers {
  energy_drain?: string;
  tools_juggling?: string;
}

export type BranchAnswers =
  | BranchAAnswers
  | BranchBAnswers
  | BranchCAnswers
  | BranchDAnswers
  | BranchEAnswers;

// Full onboarding data shape
export interface OnboardingData {
  stage: OnboardingStage | null;
  branch_answers: BranchAnswers;
  weakest_role: WeakestRole | null;
  next_version_goal: string;
  ship_date: string; // ISO date
  if_nothing_changes: string;
}

// Database row
export interface UserOnboarding {
  id: number;
  user_id: string;
  stage: OnboardingStage;
  branch_answers: BranchAnswers;
  weakest_role: WeakestRole | null;
  next_version_goal: string | null;
  ship_date: string | null;
  if_nothing_changes: string | null;
  ai_persona: string[];
  focus_areas: string[];
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

// Step definitions
export const ONBOARDING_STEPS = [
  { step: 1, title: 'Your Stage' },
  { step: 2, title: 'Deep Dive' },
  { step: 3, title: 'Your Role' },
  { step: 4, title: 'Commitment' },
] as const;

// Stage options with display info
export const STAGE_OPTIONS: { value: OnboardingStage; label: string; description: string }[] = [
  { value: 'just_an_idea', label: 'Just an idea', description: 'Haven\'t started building yet' },
  { value: 'building_mvp', label: 'Building MVP', description: 'Actively developing first version' },
  { value: 'launched_no_revenue', label: 'Launched, no revenue', description: 'Product is live but not earning' },
  { value: 'making_revenue', label: 'Making revenue', description: 'Paying customers exist' },
  { value: 'fulltime', label: 'Full-time on it', description: 'This is your main gig' },
];

// Role options
export const ROLE_OPTIONS: { value: WeakestRole; label: string; description: string }[] = [
  { value: 'cto', label: 'CTO', description: 'Technical architecture & decisions' },
  { value: 'marketer', label: 'Marketer', description: 'Getting users & distribution' },
  { value: 'copywriter', label: 'Copywriter', description: 'Writing that converts' },
  { value: 'strategist', label: 'Strategist', description: 'Planning & prioritization' },
  { value: 'all', label: 'All of them', description: 'Struggling with everything' },
];

// AI persona mapping per stage
export function getAIPersona(stage: OnboardingStage): string[] {
  switch (stage) {
    case 'just_an_idea':
      return ['CTO', 'Product Strategist'];
    case 'building_mvp':
      return ['CTO'];
    case 'launched_no_revenue':
      return ['SEO Specialist', 'Copywriter'];
    case 'making_revenue':
      return ['Growth Strategist', 'CTO'];
    case 'fulltime':
      return ['Operations Advisor', 'CTO'];
  }
}

// Focus areas mapping per stage
export function getFocusAreas(stage: OnboardingStage): string[] {
  switch (stage) {
    case 'just_an_idea':
      return ['Version Planning', 'MVP Scoping'];
    case 'building_mvp':
      return ['Version Tracking', 'Task Management'];
    case 'launched_no_revenue':
      return ['Growth Tracker', 'SEO', 'Marketing'];
    case 'making_revenue':
      return ['Growth Dashboard', 'Version Management'];
    case 'fulltime':
      return ['Workspace Consolidation', 'AI Context'];
  }
}
