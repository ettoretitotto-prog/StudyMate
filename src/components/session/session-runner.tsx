"use client";

import { useEffect, useState, useTransition } from "react";
import { Check, Clock, Flag, Trophy, X } from "lucide-react";

import { completeSessionAction } from "@/lib/actions/missions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useCountdown } from "@/hooks/use-countdown";

type SessionRunnerProps = {
  sessionId: string;
  mission: {
    subject: string;
    title: string;
    description: string;
    durationMinutes: number;
    xp: number;
  };
  startedAt: string;
};

export function SessionRunner({ sessionId, mission, startedAt }: SessionRunnerProps) {
  const totalSeconds = mission.durationMinutes * 60;
  const countdown = useCountdown({ totalSeconds, startedAt });
  const [showModal, setShowModal] = useState(countdown.isFinished);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (countdown.isFinished) {
      setShowModal(true);
    }
  }, [countdown.isFinished]);

  function complete(completed: boolean) {
    startTransition(() => {
      completeSessionAction(sessionId, completed);
    });
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl items-center px-5 py-10">
      <Card className="w-full border-primary/35 bg-card/95 shadow-glow">
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 rounded-md border border-border bg-background/60 px-3 py-2 text-sm text-muted-foreground">
              <Flag className="h-4 w-4 text-secondary" aria-hidden="true" />
              {mission.subject}
            </div>
            <div className="inline-flex items-center gap-2 rounded-md border border-accent/40 bg-accent/10 px-3 py-2 text-sm font-semibold text-accent">
              <Trophy className="h-4 w-4" aria-hidden="true" />
              {mission.xp} XP
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl sm:text-3xl">{mission.title}</CardTitle>
            <p className="mt-2 text-sm text-muted-foreground">{mission.description}</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="rounded-lg border border-border bg-background/55 p-6 text-center">
            <div className="mb-4 flex items-center justify-center gap-2 text-muted-foreground">
              <Clock className="h-5 w-5 text-primary" aria-hidden="true" />
              Sessione attiva
            </div>
            <div className="font-mono text-6xl font-bold tracking-normal sm:text-7xl">
              {countdown.label}
            </div>
            <div className="mt-6">
              <Progress value={countdown.progress} />
            </div>
          </div>

          <p className="text-center text-sm font-medium text-muted-foreground">
            Focus sulla missione. La ricompensa si sblocca solo alla fine.
          </p>
        </CardContent>
      </Card>

      {showModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 px-5 backdrop-blur-sm">
          <Card className="w-full max-w-md border-primary/35 bg-card">
            <CardHeader>
              <CardTitle>Hai completato la missione?</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <Button disabled={isPending} onClick={() => complete(true)}>
                <Check className="h-4 w-4" aria-hidden="true" />
                Sì
              </Button>
              <Button variant="outline" disabled={isPending} onClick={() => complete(false)}>
                <X className="h-4 w-4" aria-hidden="true" />
                No
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </main>
  );
}
