import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getStudyMaps } from "@/lib/services/study-maps";
import { StudyMapPage } from "@/components/study-maps/StudyMapPage";

export const dynamic = "force-dynamic";

export default async function StudyMapsPageHandler() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  const maps = await getStudyMaps(supabase, user.id);

  return <StudyMapPage initialMaps={maps} />;
}
