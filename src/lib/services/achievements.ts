import type { SupabaseClient } from "@supabase/supabase-js";

import { ACHIEVEMENT_RULES, getLevelInfo } from "@/lib/gamification";
import type { AchievementKey, Database } from "@/types/database";

type AwardInput = {
  supabase: SupabaseClient<Database, "public", any>;
  userId: string;
  totalXp: number;
  completedMissions: number;
};

export async function awardEligibleAchievements({
  supabase,
  userId,
  totalXp,
  completedMissions
}: AwardInput) {
  const level = getLevelInfo(totalXp).level;
  const eligibleKeys = ACHIEVEMENT_RULES.filter((rule) => {
    if (rule.requirementType === "missions_completed") {
      return completedMissions >= rule.requirementValue;
    }

    if (rule.requirementType === "total_xp") {
      return totalXp >= rule.requirementValue;
    }

    return level >= rule.requirementValue;
  }).map((rule) => rule.key);

  if (eligibleKeys.length === 0) {
    return;
  }

  const { data: achievements, error } = await supabase
    .from("achievements")
    .select("id,key")
    .in("key", eligibleKeys);

  if (error) {
    throw new Error(error.message);
  }

  const rows =
    achievements?.map((achievement) => ({
      user_id: userId,
      achievement_id: achievement.id
    })) ?? [];

  if (rows.length === 0) {
    return;
  }

  const { error: insertError } = await supabase
    .from("user_achievements")
    .upsert(rows, { onConflict: "user_id,achievement_id", ignoreDuplicates: true });

  if (insertError) {
    throw new Error(insertError.message);
  }
}

export function isAchievementUnlocked(key: AchievementKey, unlockedKeys: AchievementKey[]) {
  return unlockedKeys.includes(key);
}
