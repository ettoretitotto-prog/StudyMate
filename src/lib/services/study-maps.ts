import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, StudyMapRow } from "@/types/database";

export async function getStudyMaps(supabase: SupabaseClient<Database, "public", any>, userId: string) {
  const { data, error } = await supabase
    .from("study_maps")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as StudyMapRow[];
}

export async function getStudyMap(supabase: SupabaseClient<Database, "public", any>, mapId: string) {
  const { data, error } = await supabase.from("study_maps").select("*").eq("id", mapId).single();

  if (error) throw error;
  return data as StudyMapRow;
}

export async function createStudyMap(
  supabase: SupabaseClient<Database, "public", any>,
  userId: string,
  title: string,
  content: string = ""
) {
  const { data, error } = await supabase
    .from("study_maps")
    .insert({ user_id: userId, title, content })
    .select()
    .single();

  if (error) throw error;
  return data as StudyMapRow;
}

export async function updateStudyMap(
  supabase: SupabaseClient<Database, "public", any>,
  mapId: string,
  updates: { title?: string; content?: string }
) {
  const { data, error } = await supabase
    .from("study_maps")
    .update(updates)
    .eq("id", mapId)
    .select()
    .single();

  if (error) throw error;
  return data as StudyMapRow;
}

export async function deleteStudyMap(supabase: SupabaseClient<Database, "public", any>, mapId: string) {
  const { error } = await supabase.from("study_maps").delete().eq("id", mapId);

  if (error) throw error;
}
