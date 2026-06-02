import type { ReactNode } from "react";
import { CheckCircle2, Flame, Gauge, Gem, TrendingUp } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { DashboardData } from "@/lib/services/dashboard";

type StatsGridProps = {
  data: DashboardData;
};

export function StatsGrid({ data }: StatsGridProps) {
  const { levelInfo, profile, streak, missionsCompletedToday } = data;

  return (
    <section className="grid gap-4 lg:grid-cols-[1.2fr_repeat(4,1fr)]">
      <Card className="border-primary/30 bg-card/90">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
            <Gauge className="h-4 w-4 text-primary" aria-hidden="true" />
            Livello
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-end justify-between gap-3">
            <span className="text-4xl font-bold">{levelInfo.level}</span>
            <span className="text-sm text-muted-foreground">
              {levelInfo.nextLevel ? `${levelInfo.xpToNextLevel} XP al livello ${levelInfo.nextLevel}` : "Max MVP"}
            </span>
          </div>
          <Progress value={levelInfo.progressToNextLevel} />
        </CardContent>
      </Card>

      <StatCard icon={<Gem className="h-4 w-4 text-secondary" />} label="XP totale" value={profile.total_xp} />
      <StatCard
        icon={<TrendingUp className="h-4 w-4 text-primary" />}
        label="XP necessari"
        value={levelInfo.xpToNextLevel}
      />
      <StatCard
        icon={<Flame className="h-4 w-4 text-accent" />}
        label="Streak"
        value={`🔥 ${streak?.current_streak ?? 0} giorni consecutivi`}
      />
      <StatCard
        icon={<CheckCircle2 className="h-4 w-4 text-secondary" />}
        label="Missioni oggi"
        value={missionsCompletedToday}
      />
    </section>
  );
}

function StatCard({
  icon,
  label,
  value
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <Card className="bg-card/85">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
          {icon}
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="break-words text-2xl font-bold leading-tight">{value}</p>
      </CardContent>
    </Card>
  );
}
