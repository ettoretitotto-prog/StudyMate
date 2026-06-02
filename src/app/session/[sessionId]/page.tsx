import { redirect } from "next/navigation";

import { SessionRunner } from "@/components/session/session-runner";
import { SetupNotice } from "@/components/setup-notice";
import { calculateMissionXp } from "@/lib/gamification";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { MissionRow, StudySessionRow } from "@/types/database";

type SessionPageProps = {
  params: Promise<{
    sessionId: string;
  }>;
};

type SessionWithMission = StudySessionRow & {
  missions: MissionRow | null;
};

export default async function SessionPage({ params }: SessionPageProps) {
  if (!hasSupabaseConfig()) {
    return <SetupNotice />;
  }

  const { sessionId } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

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

  if (!session.missions || session.status !== "active") {
    redirect("/dashboard");
  }

  return (
    <SessionRunner
      sessionId={session.id}
      startedAt={session.started_at}
      mission={{
        subject: session.missions.subject,
        title: session.missions.title,
        description: session.missions.description,
        durationMinutes: session.missions.duration_minutes,
        xp: calculateMissionXp(session.missions.duration_minutes)
      }}
    />
  );
}
