import { Crown, Lock, ShieldCheck, Sparkles, Trophy } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { DashboardData } from "@/lib/services/dashboard";

type AchievementsGridProps = {
  achievements: DashboardData["achievements"];
};

const iconMap = {
  Sparkles,
  ShieldCheck,
  Trophy,
  Crown
};

export function AchievementsGrid({ achievements }: AchievementsGridProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Achievement</h2>
        <Badge variant="outline">{achievements.filter((achievement) => achievement.unlocked).length}/4</Badge>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {achievements.map((achievement) => {
          const Icon = iconMap[achievement.icon as keyof typeof iconMap] ?? Sparkles;

          return (
            <Card
              key={achievement.key}
              className={achievement.unlocked ? "border-accent/40 bg-card/90" : "bg-card/55 opacity-75"}
            >
              <CardContent className="flex gap-3 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted">
                  {achievement.unlocked ? (
                    <Icon className="h-5 w-5 text-accent" aria-hidden="true" />
                  ) : (
                    <Lock className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold">{achievement.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{achievement.description}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
