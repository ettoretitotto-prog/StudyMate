import type { AchievementKey } from "@/types/database";

export const LEVEL_THRESHOLDS = [
  { level: 1, minXp: 0 },
  { level: 2, minXp: 100 },
  { level: 3, minXp: 250 },
  { level: 4, minXp: 450 },
  { level: 5, minXp: 700 }
] as const;

export const ACHIEVEMENT_RULES: Array<{
  key: AchievementKey;
  name: string;
  description: string;
  icon: string;
  requirementType: "missions_completed" | "total_xp" | "level";
  requirementValue: number;
}> = [
  {
    key: "first_step",
    name: "Primo Passo",
    description: "Completa 1 missione",
    icon: "Sparkles",
    requirementType: "missions_completed",
    requirementValue: 1
  },
  {
    key: "serious_student",
    name: "Studente Serio",
    description: "Completa 10 missioni",
    icon: "ShieldCheck",
    requirementType: "missions_completed",
    requirementValue: 10
  },
  {
    key: "xp_100_club",
    name: "100 XP Club",
    description: "Raggiungi 100 XP",
    icon: "Trophy",
    requirementType: "total_xp",
    requirementValue: 100
  },
  {
    key: "level_up",
    name: "Level Up",
    description: "Raggiungi livello 5",
    icon: "Crown",
    requirementType: "level",
    requirementValue: 5
  }
];

export function calculateMissionXp(durationMinutes: number) {
  return Math.max(0, Math.round(durationMinutes)) * 2;
}

export function getLevelInfo(totalXp: number) {
  const xp = Math.max(0, Math.floor(totalXp));
  const current = [...LEVEL_THRESHOLDS].reverse().find((threshold) => xp >= threshold.minXp);
  const level = current?.level ?? 1;
  const next = LEVEL_THRESHOLDS.find((threshold) => threshold.level === level + 1);
  const currentMinXp = current?.minXp ?? 0;
  const nextMinXp = next?.minXp ?? currentMinXp;
  const xpToNextLevel = next ? Math.max(0, nextMinXp - xp) : 0;
  const levelSpan = Math.max(1, nextMinXp - currentMinXp);
  const progressToNextLevel = next ? Math.min(100, ((xp - currentMinXp) / levelSpan) * 100) : 100;

  return {
    level,
    totalXp: xp,
    nextLevel: next?.level ?? null,
    nextLevelXp: next?.minXp ?? null,
    xpToNextLevel,
    progressToNextLevel
  };
}
