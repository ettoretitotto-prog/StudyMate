import type { SupabaseClient } from "@supabase/supabase-js";

import { addDaysToDateKey, getTodayDateKey } from "@/lib/date";
import type { Database } from "@/types/database";

export async function updateUserStreak(
  supabase: SupabaseClient<Database, "public", any>,
  userId: string,
  todayKey = getTodayDateKey()
) {
  const { data: streak } = await supabase.from("streaks").select("*").eq("user_id", userId).maybeSingle();

  if (!streak) {
    const { data, error } = await supabase
      .from("streaks")
      .insert({
        user_id: userId,
        current_streak: 1,
        longest_streak: 1,
        last_completed_date: todayKey
      })
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  if (streak.last_completed_date === todayKey) {
    return streak;
  }

  const yesterdayKey = addDaysToDateKey(todayKey, -1);
  const currentStreak =
    streak.last_completed_date === yesterdayKey ? streak.current_streak + 1 : 1;
  const longestStreak = Math.max(streak.longest_streak, currentStreak);

  const { data, error } = await supabase
    .from("streaks")
    .update({
      current_streak: currentStreak,
      longest_streak: longestStreak,
      last_completed_date: todayKey
    })
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
