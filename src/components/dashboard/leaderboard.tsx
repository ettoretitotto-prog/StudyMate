import { Medal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { DashboardData } from "@/lib/services/dashboard";

type LeaderboardProps = {
  entries: DashboardData["leaderboard"];
  currentUserId: string;
};

export function Leaderboard({ entries, currentUserId }: LeaderboardProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Leaderboard</h2>
        <Badge variant="outline">Top 20</Badge>
      </div>
      <div className="grid gap-2">
        {entries.map((entry) => (
          <Card
            key={entry.id}
            className={entry.id === currentUserId ? "border-primary/45 bg-primary/10" : "bg-card/70"}
          >
            <CardContent className="grid grid-cols-[42px_1fr_auto] items-center gap-3 p-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted text-sm font-bold">
                {entry.rank <= 3 ? <Medal className="h-4 w-4 text-accent" aria-hidden="true" /> : entry.rank}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{entry.name}</p>
                <p className="text-xs text-muted-foreground">Livello {entry.level}</p>
              </div>
              <Badge variant="secondary">{entry.totalXp} XP</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
