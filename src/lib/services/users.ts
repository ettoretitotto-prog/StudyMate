import type { SupabaseClient, User } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

export async function ensureUserProfile(supabase: SupabaseClient<Database>, authUser: User) {
  const { data: existing } = await supabase.from("users").select("*").eq("id", authUser.id).maybeSingle();

  if (existing) {
    return existing;
  }

  const fallbackName =
    typeof authUser.user_metadata?.name === "string" && authUser.user_metadata.name.trim().length > 0
      ? authUser.user_metadata.name.trim()
      : authUser.email?.split("@")[0] ?? "Studente";

  const profile: Database["public"]["Tables"]["users"]["Insert"] = {
    id: authUser.id,
    name: fallbackName,
    email: authUser.email ?? "",
    total_xp: 0
  };

  const { data, error } = await supabase.from("users").upsert(profile).select("*").single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
