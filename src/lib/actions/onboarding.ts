/**
 * Server actions for Onboarding
 */
"use server";

import { createClient } from "@/lib/server";
import type {
  OnboardingStage,
  WeakestRole,
  BranchAnswers,
} from "@/lib/types/onboarding";
import { getAIPersona, getFocusAreas } from "@/lib/types/onboarding";

export interface SaveOnboardingPayload {
  stage: OnboardingStage;
  branch_answers: BranchAnswers;
  weakest_role: WeakestRole | null;
  next_version_goal: string;
  ship_date: string | null;
  if_nothing_changes: string;
}

/**
 * Save the completed onboarding data
 */
export async function saveOnboarding(payload: SaveOnboardingPayload) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const ai_persona = getAIPersona(payload.stage);
  const focus_areas = getFocusAreas(payload.stage);

  const { error } = await supabase.from("user_onboarding").upsert(
    {
      user_id: user.id,
      stage: payload.stage,
      branch_answers: payload.branch_answers as unknown as Record<
        string,
        unknown
      >,
      weakest_role: payload.weakest_role,
      next_version_goal: payload.next_version_goal || null,
      ship_date: payload.ship_date || null,
      if_nothing_changes: payload.if_nothing_changes || null,
      ai_persona,
      focus_areas,
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  if (error) {
    console.error(
      "[Onboarding DB Error] Failed to save user onboarding:",
      JSON.stringify(error, null, 2),
    );
    return { error: "Failed to save onboarding data. Please try again." };
  }
  return { success: true };
}

/**
 * Check if a user has completed onboarding
 */
export async function hasCompletedOnboarding(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const { data } = await supabase
    .from("user_onboarding")
    .select("completed_at")
    .eq("user_id", user.id)
    .single();

  return !!data?.completed_at;
}
