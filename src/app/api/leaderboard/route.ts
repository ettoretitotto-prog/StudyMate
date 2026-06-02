import { NextResponse } from "next/server";

import { getLevelInfo } from "@/lib/gamification";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  if (!hasSupabaseConfig()) {
    return NextResponse.json({ error: "Supabase non configurato." }, { status: 503 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("users")
    .select("id,name,total_xp")
    .order("total_xp", { ascending: false })
    .limit(20);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    leaderboard:
      data?.map((entry, index) => ({
        rank: index + 1,
        id: entry.id,
        name: entry.name,
        level: getLevelInfo(entry.total_xp).level,
        totalXp: entry.total_xp
      })) ?? []
  });
}
