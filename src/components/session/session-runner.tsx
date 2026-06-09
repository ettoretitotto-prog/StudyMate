"use client";

import { useEffect, useState, useTransition, useRef } from "react";
import { Check, Clock, Flag, Trophy, X, Play, Pause, Plus, Volume2, VolumeX, AlertTriangle } from "lucide-react";

import { completeSessionAction } from "@/lib/actions/missions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

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
  const [isPending, startTransition] = useTransition();

  // Local Storage Keys
  const remainingKey = `study_session_${sessionId}_remaining`;
  const pausedKey = `study_session_${sessionId}_paused`;
  const xpModifierKey = `study_session_${sessionId}_xp_modifier`;

  // Initialize state from local storage or defaults
  const [remainingSeconds, setRemainingSeconds] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(remainingKey);
      if (saved !== null) {
        return parseInt(saved, 10);
      }
    }
    // Default initial calculation based on startedAt
    const totalSeconds = mission.durationMinutes * 60;
    const elapsedSeconds = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
    return Math.max(0, totalSeconds - elapsedSeconds);
  });

  const [isPaused, setIsPaused] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(pausedKey);
      return saved === "true";
    }
    return false;
  });

  const [xpModifier, setXpModifier] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(xpModifierKey);
      if (saved !== null) {
        return parseInt(saved, 10);
      }
    }
    return 0;
  });

  const [notification, setNotification] = useState<{ message: string; type: "success" | "penalty" } | null>(null);
  const [alarmPlaying, setAlarmPlaying] = useState(false);
  
  // Audio Context and refs to prevent background tab throttling issues
  const audioContextRef = useRef<AudioContext | null>(null);
  const alarmIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Precise Background Timer Refs
  const resumeTimeRef = useRef<number>(Date.now());
  const secondsAtResumeRef = useRef<number>(remainingSeconds);

  // Sync state changes to Local Storage
  useEffect(() => {
    localStorage.setItem(remainingKey, remainingSeconds.toString());
  }, [remainingSeconds, remainingKey]);

  useEffect(() => {
    localStorage.setItem(pausedKey, isPaused.toString());
  }, [isPaused, pausedKey]);

  useEffect(() => {
    localStorage.setItem(xpModifierKey, xpModifier.toString());
  }, [xpModifier, xpModifierKey]);

  // Sync refs when timer is unpaused or paused
  useEffect(() => {
    resumeTimeRef.current = Date.now();
    secondsAtResumeRef.current = remainingSeconds;
  }, [isPaused]);

  // Cleanup local storage keys on completion / failure
  const clearSessionStorage = () => {
    localStorage.removeItem(remainingKey);
    localStorage.removeItem(pausedKey);
    localStorage.removeItem(xpModifierKey);
  };

  // Alarm Player using Web Audio API
  const startAlarm = () => {
    if (alarmPlaying) return;
    setAlarmPlaying(true);

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const playBeep = () => {
        if (audioCtx.state === "closed") return;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.type = "sine";
        osc.frequency.value = 880; // High A pitch
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);

        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
      };

      playBeep();
      const interval = setInterval(playBeep, 1000);
      alarmIntervalRef.current = interval;
    } catch (e) {
      console.error("AudioContext failed to start", e);
    }
  };

  const stopAlarm = () => {
    if (alarmIntervalRef.current) {
      clearInterval(alarmIntervalRef.current);
      alarmIntervalRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch((e) => console.log("Audio close err:", e));
      audioContextRef.current = null;
    }
    setAlarmPlaying(false);
  };

  // Effect to handle count down ticking using accurate system time (ignores background throttling!)
  useEffect(() => {
    if (remainingSeconds <= 0) {
      startAlarm();
      return;
    }

    const timer = setInterval(() => {
      if (!isPaused) {
        const elapsedSinceResume = Math.floor((Date.now() - resumeTimeRef.current) / 1000);
        const nextRemaining = Math.max(0, secondsAtResumeRef.current - elapsedSinceResume);
        
        if (nextRemaining !== remainingSeconds) {
          setRemainingSeconds(nextRemaining);
          if (nextRemaining === 0) {
            startAlarm();
          }
        }
      }
    }, 250); // Tick faster (250ms) to ensure UI is instantly responsive even if throttled

    return () => clearInterval(timer);
  }, [isPaused, remainingSeconds]);

  // Clean up alarm on unmount
  useEffect(() => {
    return () => {
      stopAlarm();
    };
  }, []);

  // Action handers
  function handlePauseToggle() {
    if (remainingSeconds <= 0) return;

    if (!isPaused) {
      // Transitioning to PAUSED: apply point penalty (-10 XP)
      setIsPaused(true);
      setXpModifier((prev) => prev - 10);
      setNotification({
        message: "Sessione in pausa! Hai perso 10 XP.",
        type: "penalty"
      });
    } else {
      // Resuming study
      resumeTimeRef.current = Date.now();
      secondsAtResumeRef.current = remainingSeconds;
      setIsPaused(false);
      setNotification({
        message: "Studio ripreso! Buon lavoro.",
        type: "success"
      });
    }
  }

  function handleAddTime(minutes: number) {
    stopAlarm();
    const newRemaining = remainingSeconds + minutes * 60;
    
    // Update refs to synchronize the precise timestamp timer
    secondsAtResumeRef.current = newRemaining;
    resumeTimeRef.current = Date.now();
    
    setRemainingSeconds(newRemaining);
    setIsPaused(false);
    setNotification({
      message: `Aggiunti ${minutes} minuti alla sessione.`,
      type: "success"
    });
  }

  function handleEarlyFinish() {
    stopAlarm();
    // Add bonus XP (+15 XP)
    const finalBonus = xpModifier + 15;
    setXpModifier(finalBonus);
    setNotification({
      message: "Finito in anticipo! Ricevi un bonus di +15 XP!",
      type: "success"
    });

    clearSessionStorage();
    startTransition(() => {
      const finalXp = Math.max(0, mission.xp + finalBonus);
      completeSessionAction(sessionId, true, finalXp);
    });
  }

  function complete(completed: boolean) {
    stopAlarm();
    clearSessionStorage();
    startTransition(() => {
      if (completed) {
        const finalXp = Math.max(0, mission.xp + xpModifier);
        completeSessionAction(sessionId, true, finalXp);
      } else {
        completeSessionAction(sessionId, false);
      }
    });
  }

  // Formatting helper
  const minutesLabel = Math.floor(remainingSeconds / 60)
    .toString()
    .padStart(2, "0");
  const secondsLabel = (remainingSeconds % 60).toString().padStart(2, "0");
  const timerLabel = `${minutesLabel}:${secondsLabel}`;

  const totalSeconds = mission.durationMinutes * 60;
  const progressPercent = totalSeconds > 0 ? ((totalSeconds - remainingSeconds) / totalSeconds) * 100 : 100;

  const currentEstimatedXp = Math.max(0, mission.xp + xpModifier);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl items-center px-5 py-10">
      <Card className={`w-full border transition-all duration-300 bg-card/95 shadow-glow ${isPaused ? "border-amber-500/35" : "border-primary/35"}`}>
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 rounded-md border border-border bg-background/60 px-3 py-2 text-sm text-muted-foreground">
              <Flag className="h-4 w-4 text-secondary" aria-hidden="true" />
              {mission.subject}
            </div>
            <div className="inline-flex flex-col items-end">
              <div className="inline-flex items-center gap-2 rounded-md border border-accent/40 bg-accent/10 px-3 py-2 text-sm font-semibold text-accent">
                <Trophy className="h-4 w-4" aria-hidden="true" />
                {currentEstimatedXp} XP {xpModifier !== 0 ? `(${xpModifier > 0 ? "+" : ""}${xpModifier})` : ""}
              </div>
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl sm:text-3xl">{mission.title}</CardTitle>
            <p className="mt-2 text-sm text-muted-foreground">{mission.description}</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          {notification && (
            <div className={`p-4 rounded-md border text-sm flex items-center gap-2 transition-all duration-300 ${
              notification.type === "penalty" 
                ? "bg-destructive/10 border-destructive/20 text-destructive-foreground dark:text-red-400" 
                : "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
            }`}>
              {notification.type === "penalty" ? <AlertTriangle className="h-4 w-4 shrink-0" /> : <Clock className="h-4 w-4 shrink-0" />}
              <span>{notification.message}</span>
            </div>
          )}

          <div className={`rounded-lg border p-6 text-center transition-all ${isPaused ? "bg-amber-500/5 border-amber-500/20" : "bg-background/55 border-border"}`}>
            <div className="mb-4 flex items-center justify-center gap-2 text-muted-foreground">
              <Clock className={`h-5 w-5 ${isPaused ? "text-amber-500 animate-pulse" : "text-primary"}`} aria-hidden="true" />
              {remainingSeconds <= 0 
                ? "Tempo Scaduto!" 
                : isPaused 
                  ? "Timer in Pausa" 
                  : "Sessione attiva"}
            </div>
            <div className={`font-mono text-6xl font-bold tracking-normal sm:text-7xl ${isPaused ? "text-amber-500" : remainingSeconds <= 0 ? "text-red-500" : ""}`}>
              {timerLabel}
            </div>
            <div className="mt-6">
              <Progress value={progressPercent} className={isPaused ? "[&>div]:bg-amber-500" : ""} />
            </div>

            {/* Timer controls */}
            {remainingSeconds > 0 && (
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button 
                  onClick={handlePauseToggle}
                  variant={isPaused ? "default" : "outline"} 
                  className={isPaused ? "bg-amber-600 hover:bg-amber-700 text-white" : "border-amber-500/50 text-amber-500 hover:bg-amber-500/10"}
                >
                  {isPaused ? (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Riprendi lo Studio
                    </>
                  ) : (
                    <>
                      <Pause className="mr-2 h-4 w-4" />
                      Metti in Pausa (-10 XP)
                    </>
                  )}
                </Button>

                {!isPaused && (
                  <Button 
                    onClick={handleEarlyFinish}
                    variant="secondary"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white border-none"
                  >
                    Ho finito in anticipo! (+15 XP)
                  </Button>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between items-center bg-background/30 p-4 rounded-lg border border-border/40">
            <span className="text-sm font-medium text-muted-foreground">
              {remainingSeconds > 0 
                ? "Resta concentrato per massimizzare la ricompensa." 
                : "La sessione è completata o richiede più tempo?"}
            </span>
            {remainingSeconds > 0 && (
              <Button variant="ghost" className="text-muted-foreground hover:text-destructive" onClick={() => complete(false)}>
                Annulla Missione
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Finished / Time Up Modal or Alarm Screen */}
      {(remainingSeconds <= 0 || alarmPlaying) ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 px-5 backdrop-blur-sm">
          <Card className="w-full max-w-md border-primary/35 bg-card shadow-2xl animate-in fade-in-50 zoom-in-95">
            <CardHeader className="text-center space-y-2">
              <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-2">
                <Volume2 className="h-8 w-8 text-primary animate-bounce" />
              </div>
              <CardTitle className="text-2xl text-primary font-bold">Tempo Scaduto!</CardTitle>
              <p className="text-sm text-muted-foreground">La sveglia sta suonando. Hai completato la tua missione con successo?</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Button 
                  disabled={isPending} 
                  onClick={() => complete(true)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
                >
                  <Check className="h-4 w-4 mr-2" aria-hidden="true" />
                  Sì, ho finito!
                </Button>
                <Button 
                  variant="outline" 
                  disabled={isPending} 
                  onClick={() => complete(false)}
                  className="border-destructive text-destructive hover:bg-destructive/10"
                >
                  <X className="h-4 w-4 mr-2" aria-hidden="true" />
                  No, rinuncia
                </Button>
              </div>

              <div className="pt-2 border-t border-border">
                <p className="text-xs text-center text-muted-foreground mb-3 font-semibold">Vuoi aggiungere più tempo per finire il compito?</p>
                <div className="grid gap-2 grid-cols-2">
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={() => handleAddTime(5)}
                    className="flex items-center gap-1 justify-center"
                  >
                    <Plus className="h-3 w-3" />
                    +5 Minuti
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={() => handleAddTime(10)}
                    className="flex items-center gap-1 justify-center"
                  >
                    <Plus className="h-3 w-3" />
                    +10 Minuti
                  </Button>
                </div>
              </div>
              
              <div className="text-center">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={stopAlarm} 
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  <VolumeX className="h-3 w-3 mr-1" />
                  Spegni solo sveglia
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </main>
  );
}
