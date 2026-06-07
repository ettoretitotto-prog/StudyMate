import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createStudyMap, getStudyMaps } from "@/lib/services/study-maps";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const maps = await getStudyMaps(supabase, user.id);
    return Response.json(maps);
  } catch (error) {
    return Response.json({ error: "Failed to fetch maps" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, content } = await request.json();

    if (!title || typeof title !== "string") {
      return Response.json({ error: "Invalid title" }, { status: 400 });
    }

    const map = await createStudyMap(supabase, user.id, title, content || "");
    return Response.json(map, { status: 201 });
  } catch (error) {
    return Response.json({ error: "Failed to create map" }, { status: 500 });
  }
}
