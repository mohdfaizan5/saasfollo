import { createClient } from '@/lib/server';
import { redirect } from 'next/navigation';
import OnboardingFlow from '@/components/onboarding/onboarding-flow';

export const metadata = {
  title: 'Onboarding | SaaSFollo',
  description: 'Set up your workspace',
};

export default async function OnboardingPage() {
  const supabase = await createClient();
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
    redirect('/projects');
  }

  return <OnboardingFlow />;
}
