import { BookOpenCheck, LogOut } from "lucide-react";
import { redirect } from "next/navigation";

import { logoutAction } from "@/lib/actions/auth";
import { getDashboardData } from "@/lib/services/dashboard";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AchievementsGrid } from "@/components/dashboard/achievements-grid";
import { Leaderboard } from "@/components/dashboard/leaderboard";
import { MissionForm } from "@/components/dashboard/mission-form";
import { MissionsList } from "@/components/dashboard/missions-list";
import { StatsGrid } from "@/components/dashboard/stats-grid";
import { SetupNotice } from "@/components/setup-notice";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  if (!hasSupabaseConfig()) {
    return <SetupNotice />;
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  const data = await getDashboardData(supabase, user);

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-5 py-6 sm:py-8">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-glow">
            <BookOpenCheck className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Study Quest</p>
            <h1 className="text-2xl font-bold tracking-normal">Ciao, {data.profile.name}</h1>
          </div>
        </div>
        <form action={logoutAction}>
          <Button variant="outline" size="sm">
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Logout
          </Button>
        </form>
      </header>

      <div className="space-y-6">
        <StatsGrid data={data} />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_390px]">
          <div className="space-y-6">
            <MissionForm />
            <MissionsList missions={data.missions} />
          </div>
          <aside className="space-y-6">
            <AchievementsGrid achievements={data.achievements} />
            <Leaderboard entries={data.leaderboard} currentUserId={user.id} />
          </aside>
        </div>
      </div>
    </main>
  );
}
