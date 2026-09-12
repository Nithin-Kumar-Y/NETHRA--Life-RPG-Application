import type { AchievementDef, DerivedStats } from "./types"

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: "first-quest",
    name: "First Quest",
    description: "Complete your first real-life quest.",
    check: (stats) => stats.totalQuestsCompleted >= 1,
    rewardItem: {
      id: "trophy-first-quest",
      name: "First Flame",
      slot: "Trophy",
      note: "A small lantern lit by your first completed quest.",
    },
  },
  {
    id: "7-day-warrior",
    name: "7 Day Warrior",
    description: "Maintain a 7-day completion streak.",
    check: (stats) => stats.longestStreak >= 7,
    rewardItem: {
      id: "keepsake-seven",
      name: "Seven Petals",
      slot: "Keepsake",
      note: "A charm for a week of unbroken resolve.",
    },
  },
  {
    id: "30-day-discipline",
    name: "30 Day Discipline",
    description: "Hold a 30-day streak.",
    check: (stats) => stats.longestStreak >= 30,
  },
  {
    id: "scholar",
    name: "Scholar",
    description: "Earn 300 Intellect XP from real quests.",
    check: (stats) => stats.intellectXp >= 300,
    rewardItem: {
      id: "relic-scholar",
      name: "Inkstone Seal",
      slot: "Relic",
      note: "Awarded to those who train the mind.",
    },
  },
  {
    id: "iron-will",
    name: "Iron Will",
    description: "Reach a long Discipline path (200 Discipline XP).",
    check: (stats) => stats.disciplineXp >= 200,
  },
  {
    id: "body-tempered",
    name: "Body Tempered",
    description: "Earn 300 Strength XP.",
    check: (stats) => stats.strengthXp >= 300,
  },
  {
    id: "century",
    name: "Century",
    description: "Complete 100 quests.",
    check: (stats) => stats.totalQuestsCompleted >= 100,
  },
  {
    id: "hundred-suns",
    name: "Hundred Suns",
    description: "Log 100 active days.",
    check: (stats) => stats.totalActiveDays >= 100,
  },
  {
    id: "gold-hand",
    name: "Gold Hand",
    description: "Earn 200 gold from quests and honors.",
    check: (stats) => stats.totalGoldEarned >= 200,
  },
]

export const JOURNEY_MILESTONES = [
  { id: "first-quest", name: "First Quest", target: 1, field: "totalQuestsCompleted" as const },
  { id: "7-day", name: "7 Day Warrior", target: 7, field: "longestStreak" as const },
  { id: "30-day", name: "30 Day Discipline", target: 30, field: "longestStreak" as const },
  { id: "100-quests", name: "100 Quests", target: 100, field: "totalQuestsCompleted" as const },
  { id: "100-days", name: "100 Active Days", target: 100, field: "totalActiveDays" as const },
]
