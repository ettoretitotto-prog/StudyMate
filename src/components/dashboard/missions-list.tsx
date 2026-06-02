import { Play, Timer, Trophy } from "lucide-react";

import { startMissionAction } from "@/lib/actions/missions";
import { calculateMissionXp } from "@/lib/gamification";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MissionRow } from "@/types/database";

type MissionsListProps = {
  missions: MissionRow[];
};

export function MissionsList({ missions }: MissionsListProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Missioni</h2>
        <Badge variant="outline">{missions.length}</Badge>
      </div>

      {missions.length === 0 ? (
        <Card className="bg-card/75">
          <CardContent className="p-5 text-sm text-muted-foreground">Nessuna missione creata.</CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {missions.map((mission) => {
            const xp = calculateMissionXp(mission.duration_minutes);
            const completed = mission.status === "completed";

            return (
              <Card key={mission.id} className="bg-card/85">
                <CardHeader className="pb-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <Badge variant={completed ? "secondary" : "muted"}>{mission.subject}</Badge>
                      <CardTitle className="mt-3">{mission.title}</CardTitle>
                    </div>
                    <Badge variant={completed ? "secondary" : "accent"}>
                      <Trophy className="mr-1 h-3 w-3" aria-hidden="true" />
                      {xp} XP
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{mission.description}</p>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Timer className="h-4 w-4" aria-hidden="true" />
                      {mission.duration_minutes} min
                    </div>
                    {completed ? (
                      <Badge variant="secondary">Completata</Badge>
                    ) : (
                      <form action={startMissionAction}>
                        <input type="hidden" name="mission_id" value={mission.id} />
                        <Button size="sm">
                          <Play className="h-4 w-4" aria-hidden="true" />
                          Avvia
                        </Button>
                      </form>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}
