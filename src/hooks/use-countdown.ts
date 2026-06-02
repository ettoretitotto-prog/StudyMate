"use client";

import { useEffect, useMemo, useState } from "react";

type UseCountdownInput = {
  totalSeconds: number;
  startedAt: string;
};

export function useCountdown({ totalSeconds, startedAt }: UseCountdownInput) {
  const initialRemaining = useMemo(() => {
    const elapsedSeconds = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
    return Math.max(0, totalSeconds - elapsedSeconds);
  }, [startedAt, totalSeconds]);

  const [remainingSeconds, setRemainingSeconds] = useState(initialRemaining);

  useEffect(() => {
    if (remainingSeconds <= 0) {
      return;
    }

    const interval = window.setInterval(() => {
      setRemainingSeconds((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [remainingSeconds]);

  const minutes = Math.floor(remainingSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (remainingSeconds % 60).toString().padStart(2, "0");
  const progress = totalSeconds > 0 ? ((totalSeconds - remainingSeconds) / totalSeconds) * 100 : 100;

  return {
    remainingSeconds,
    isFinished: remainingSeconds <= 0,
    label: `${minutes}:${seconds}`,
    progress
  };
}
