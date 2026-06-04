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
    let mounted = true;

    const updateRemaining = () => {
      const elapsedSeconds = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
      const remaining = Math.max(0, totalSeconds - elapsedSeconds);
      if (mounted) setRemainingSeconds(remaining);
      return remaining;
    };

    updateRemaining();

    const interval = window.setInterval(() => {
      const rem = updateRemaining();
      if (rem <= 0) {
        window.clearInterval(interval);
      }
    }, 1000);

    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, [startedAt, totalSeconds]);

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
