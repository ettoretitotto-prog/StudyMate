import type { User } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

import { getDateRangeForKey, getTodayDateKey } from "@/lib/date";
import { ACHIEVEMENT_RULES, getLevelInfo } from "@/lib/gamification";
import { ensureUserProfile } from "@/lib/services/users";
import type { AchievementKey, AchievementRow, Database, MissionRow } from "@/types/database";

export type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;

export async function getDashboardData(supabase: SupabaseClient<Database, "public", any>, authUser: User) {
  const profile = await ensureUserProfile(supabase, authUser);
  const todayKey = getTodayDateKey();
  const { startIso, endIso } = getDateRangeForKey(todayKey);

  const [
    missionsResult,
    todayCompletedResult,
    streakResult,
    achievementsResult,
    userAchievementsResult,
    leaderboardResult
  ] = await Promise.all([
    supabase
      .from("missions")
      .select("*")
      .eq("user_id", authUser.id)
      .neq("status", "archived")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("study_sessions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", authUser.id)
      .eq("status", "completed")
      .gte("completed_at", startIso)
      .lt("completed_at", endIso),
    supabase.from("streaks").select("*").eq("user_id", authUser.id).maybeSingle(),
    supabase.from("achievements").select("*").order("requirement_value", { ascending: true }),
    supabase
      .from("user_achievements")
      .select("achievements(*)")
      .eq("user_id", authUser.id),
    supabase.from("users").select("id,name,total_xp").order("total_xp", { ascending: false }).limit(20)
  ]);

  if (missionsResult.error) throw new Error(missionsResult.error.message);
  if (todayCompletedResult.error) throw new Error(todayCompletedResult.error.message);
  if (streakResult.error) throw new Error(streakResult.error.message);
  if (achievementsResult.error) throw new Error(achievementsResult.error.message);
  if (userAchievementsResult.error) throw new Error(userAchievementsResult.error.message);
  if (leaderboardResult.error) throw new Error(leaderboardResult.error.message);

  const unlockedAchievementRows =
    (userAchievementsResult.data ?? []) as Array<{ achievements: AchievementRow | null }>;
  const unlockedAchievements = unlockedAchievementRows
    .map((row) => row.achievements)
    .filter((achievement): achievement is AchievementRow => Boolean(achievement));
  const unlockedKeys = unlockedAchievements.map((achievement) => achievement.key);

  const achievements =
    achievementsResult.data && achievementsResult.data.length > 0
      ? achievementsResult.data
      : ACHIEVEMENT_RULES.map((rule) => ({
          id: rule.key,
          key: rule.key,
          name: rule.name,
          description: rule.description,
          icon: rule.icon,
          requirement_type: rule.requirementType,
          requirement_value: rule.requirementValue,
          created_at: "",
          updated_at: ""
        }));

  return {
    profile,
    levelInfo: getLevelInfo(profile.total_xp),
    streak: streakResult.data,
    missions: (missionsResult.data ?? []) as MissionRow[],
    missionsCompletedToday: todayCompletedResult.count ?? 0,
    achievements: achievements.map((achievement) => ({
      ...achievement,
      unlocked: unlockedKeys.includes(achievement.key as AchievementKey)
    })),
    leaderboard:
      leaderboardResult.data?.map((entry, index) => ({
        rank: index + 1,
        id: entry.id,
        name: entry.name,
        totalXp: entry.total_xp,
        level: getLevelInfo(entry.total_xp).level
      })) ?? []
  };
}
