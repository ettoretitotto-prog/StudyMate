import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getStudyMap, updateStudyMap, deleteStudyMap } from "@/lib/services/study-maps";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const map = await getStudyMap(supabase, id);

    // Verify ownership
    if (map.user_id !== user.id) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    return Response.json(map);
  } catch (error) {
    return Response.json({ error: "Map not found" }, { status: 404 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const map = await getStudyMap(supabase, id);

    // Verify ownership
    if (map.user_id !== user.id) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const { title, content } = await request.json();
    const updatedMap = await updateStudyMap(supabase, id, { title, content });

    return Response.json(updatedMap);
  } catch (error) {
    return Response.json({ error: "Failed to update map" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const map = await getStudyMap(supabase, id);

    // Verify ownership
    if (map.user_id !== user.id) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    await deleteStudyMap(supabase, id);
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: "Failed to delete map" }, { status: 500 });
  }
}
