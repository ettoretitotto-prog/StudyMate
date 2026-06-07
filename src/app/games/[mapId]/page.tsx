"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { DragDropGame } from "@/components/games";
import { generateDragDropGame, saveGameSession, awardGameXP } from "@/lib/services/games";
import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import type { StudyMapRow } from "@/types/database";
import type { DragDropGameData } from "@/lib/services/games";

interface GamePageProps {
  params: Promise<{ mapId: string }>;
}

export default function GamePage({ params }: GamePageProps) {
  const unwrappedParams = React.use(params);
  const { mapId } = unwrappedParams;
  const router = useRouter();
  const { url, anonKey } = getSupabaseConfig();
  const supabase = createBrowserClient(url, anonKey);

  const [gameData, setGameData] = useState<DragDropGameData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const fetchGameData = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: user, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        router.push("/login");
        return;
      }
      setUserId(user.user.id);

      const { data: studyMap, error: mapError } = await supabase
        .from("study_maps")
        .select("id, title, content")
        .eq("id", mapId)
        .single();

      if (mapError || !studyMap) {
        setError("Mappa di studio non trovata o non autorizzata.");
        setLoading(false);
        return;
      }

      const generatedData = generateDragDropGame(
        studyMap.id,
        studyMap.title,
        studyMap.content
      );
      setGameData(generatedData);
    } catch (err) {
      console.error("Error fetching game data:", err);
      setError("Errore durante il caricamento dei dati del gioco.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGameData();
  }, [mapId]);

  const handleGameComplete = async (
    score: number,
    timeSeconds: number,
    xpAwarded: number
  ) => {
    if (!userId || !gameData) return;

    await saveGameSession(supabase, userId, gameData.mapId, score, timeSeconds, xpAwarded);
    await awardGameXP(supabase, userId, xpAwarded);
    // Qui potresti anche aggiornare lo stato utente, achievement, ecc.
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-pulse bg-muted h-[500px] w-[800px] rounded-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center p-4">
        <Card className="flex items-center gap-4 p-6 text-red-600">
          <AlertCircle className="h-6 w-6" />
          <p>{error}</p>
        </Card>
      </div>
    );
  }

  if (!gameData) {
    return (
      <div className="flex h-screen items-center justify-center p-4">
        <Card className="flex items-center gap-4 p-6 text-muted-foreground">
          <AlertCircle className="h-6 w-6" />
          <p>Nessun dato di gioco disponibile.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen">
      <DragDropGame gameData={gameData} onComplete={handleGameComplete} onRestart={fetchGameData} />
    </div>
  );
}
