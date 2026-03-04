import { createClient } from '@/lib/server';
import { redirect } from 'next/navigation';
import OnboardingFlow from '@/components/onboarding/onboarding-flow';

export const metadata = {
  title: 'Onboarding | SaaSFollo',
  description: 'Set up your workspace',
};

interface OnboardingPageProps {
  searchParams: Promise<{ redirectTo?: string }>;
}

function getSafeRedirectTarget(value?: string): string {
  if (!value) return '/projects';
  if (value.startsWith('/projects/')) return value;
  return '/projects';
}

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const supabase = await createClient();
  const resolvedSearchParams = await searchParams;
  const redirectTo = getSafeRedirectTarget(resolvedSearchParams?.redirectTo);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Not authenticated — send to login
  if (!user) {
    redirect('/auth/login');
  }

  // Already completed onboarding — send to projects
  const { data: onboarding } = await supabase
    .from('user_onboarding')
    .select('completed_at')
    .eq('user_id', user.id)
    .single();

  if (onboarding?.completed_at) {
    redirect(redirectTo);
  }

  return <OnboardingFlow redirectTo={redirectTo} />;
}
