"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Trophy, Award, Clock, RotateCcw } from "lucide-react";

interface GameCompleteProps {
  score: number;
  xpAwarded: number;
  timeSeconds: number;
  correctPlacements: number;
  totalNodes: number;
  onRestart: () => void;
}

export function GameComplete({
  score,
  xpAwarded,
  timeSeconds,
  correctPlacements,
  totalNodes,
  onRestart,
}: GameCompleteProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex h-full items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="pb-4">
          <CardTitle className="flex flex-col items-center gap-2 text-3xl font-bold text-primary">
            <CheckCircle className="h-12 w-12" />
            Partita Completata!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center justify-center rounded-lg bg-muted/30 p-4">
              <Trophy className="mb-2 h-8 w-8 text-yellow-500" />
              <p className="text-sm text-muted-foreground">Punteggio</p>
              <p className="text-2xl font-bold">{score}</p>
            </div>
            <div className="flex flex-col items-center justify-center rounded-lg bg-muted/30 p-4">
              <Award className="mb-2 h-8 w-8 text-green-500" />
              <p className="text-sm text-muted-foreground">XP Guadagnati</p>
              <p className="text-2xl font-bold">{xpAwarded}</p>
            </div>
            <div className="flex flex-col items-center justify-center rounded-lg bg-muted/30 p-4">
              <Clock className="mb-2 h-8 w-8 text-blue-500" />
              <p className="text-sm text-muted-foreground">Tempo</p>
              <p className="text-xl font-bold">{formatTime(timeSeconds)}</p>
            </div>
            <div className="flex flex-col items-center justify-center rounded-lg bg-muted/30 p-4">
              <CheckCircle className="mb-2 h-8 w-8 text-purple-500" />
              <p className="text-sm text-muted-foreground">Nodi Corretti</p>
              <p className="text-xl font-bold">{correctPlacements}/{totalNodes}</p>
            </div>
          </div>

          <Button onClick={onRestart} className="w-full">
            <RotateCcw className="mr-2 h-4 w-4" />
            Ricomincia Partita
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
