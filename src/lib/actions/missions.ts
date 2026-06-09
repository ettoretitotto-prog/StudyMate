"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { awardEligibleAchievements } from "@/lib/services/achievements";
import { updateUserStreak } from "@/lib/services/streaks";
import { ensureUserProfile } from "@/lib/services/users";
import { calculateMissionXp } from "@/lib/gamification";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { MissionRow, StudySessionRow } from "@/types/database";

export type MissionFormState = {
  error?: string;
  success?: string;
};

function getString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

async function getAuthenticatedUser() {
  if (!hasSupabaseConfig()) {
    redirect("/login");
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  return { supabase, user };
}

export async function createMissionAction(
  _previousState: MissionFormState,
  formData: FormData
): Promise<MissionFormState> {
  const subject = getString(formData, "subject");
  const title = getString(formData, "title");
  const description = getString(formData, "description");
  const durationMinutes = Number(getString(formData, "duration_minutes"));

  if (!subject || !title || !description || !Number.isInteger(durationMinutes) || durationMinutes <= 0) {
    return { error: "Compila tutti i campi e usa una durata valida." };
  }

  if (durationMinutes > 180) {
    return { error: "Per l'MVP ogni missione puo' durare al massimo 180 minuti." };
  }

  const { supabase, user } = await getAuthenticatedUser();
  await ensureUserProfile(supabase, user);

  const { error } = await supabase.from("missions").insert({
    user_id: user.id,
    subject,
    title,
    description,
    duration_minutes: durationMinutes,
    status: "ready"
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { success: "Missione creata." };
}

export async function startMissionAction(formData: FormData) {
  const missionId = getString(formData, "mission_id");

  if (!missionId) {
    redirect("/dashboard");
  }

  const { supabase, user } = await getAuthenticatedUser();

  const { data: mission, error: missionError } = await supabase
    .from("missions")
    .select("*")
    .eq("id", missionId)
    .eq("user_id", user.id)
    .single();

  if (missionError || !mission || mission.status !== "ready") {
    redirect("/dashboard");
  }

  const { data: activeSession } = await supabase
    .from("study_sessions")
    .select("id")
    .eq("mission_id", mission.id)
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  if (activeSession) {
    redirect(`/session/${activeSession.id}`);
  }

  const { data: session, error } = await supabase
    .from("study_sessions")
    .insert({
      user_id: user.id,
      mission_id: mission.id,
      status: "active",
      xp_awarded: 0
    })
    .select("id")
    .single();

  if (error || !session) {
    redirect("/dashboard");
  }

  redirect(`/session/${session.id}`);
}

type SessionWithMission = StudySessionRow & {
  missions: MissionRow | null;
};

export async function completeSessionAction(sessionId: string, completed: boolean, customXp?: number) {
  const { supabase, user } = await getAuthenticatedUser();

  const { data, error } = await supabase
    .from("study_sessions")
    .select("*, missions(*)")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .single();

  if (error || !data) {
    redirect("/dashboard");
  }

  const session = data as SessionWithMission;
  const mission = session.missions;

  if (!mission || session.status !== "active") {
    redirect("/dashboard");
  }

  if (!completed) {
    await supabase
      .from("study_sessions")
      .update({
        status: "failed",
        completed_at: new Date().toISOString(),
        xp_awarded: 0
      })
      .eq("id", session.id)
      .eq("user_id", user.id);

    revalidatePath("/dashboard");
    redirect("/dashboard");
  }

  const baseXp = calculateMissionXp(mission.duration_minutes);
  const xpAwarded = typeof customXp === "number" ? Math.max(0, customXp) : baseXp;
  const profile = await ensureUserProfile(supabase, user);
  const newTotalXp = profile.total_xp + xpAwarded;

  const { error: sessionError } = await supabase
    .from("study_sessions")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
      xp_awarded: xpAwarded
    })
    .eq("id", session.id)
    .eq("user_id", user.id);

  if (sessionError) {
    throw new Error(sessionError.message);
  }

  const { error: missionError } = await supabase
    .from("missions")
    .update({ status: "completed" })
    .eq("id", mission.id)
    .eq("user_id", user.id);

  if (missionError) {
    throw new Error(missionError.message);
  }

  const { error: profileError } = await supabase
    .from("users")
    .update({ total_xp: newTotalXp })
    .eq("id", user.id);

  if (profileError) {
    throw new Error(profileError.message);
  }

  const { count, error: countError } = await supabase
    .from("study_sessions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "completed");

  if (countError) {
    throw new Error(countError.message);
  }

  await updateUserStreak(supabase, user.id);
  await awardEligibleAchievements({
    supabase,
    userId: user.id,
    totalXp: newTotalXp,
    completedMissions: count ?? 1
  });

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
