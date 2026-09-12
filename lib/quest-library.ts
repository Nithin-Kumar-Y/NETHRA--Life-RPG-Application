import type { QuestGenre, QuestTemplate } from "./types"

export const CUSTOM_QUEST_XP = 50
export const CUSTOM_QUEST_GOLD = 5
export const CUSTOM_QUEST_COOLDOWN_MINUTES = 45
export const PROFILE_EDIT_XP_COST = 15

const templates: QuestTemplate[] = [
  { id: "breathe", name: "Breathe", genre: "DISCIPLINE", unit: "minutes", minValue: 3, maxValue: 30, xpPerUnit: 2, goldPerUnit: 0.4, cooldownMinutes: 30 },
  { id: "clean", name: "Clean", genre: "DISCIPLINE", unit: "rooms", minValue: 1, maxValue: 8, xpPerUnit: 12, goldPerUnit: 3, cooldownMinutes: 45 },
  { id: "code", name: "Code", genre: "INTELLECT", unit: "minutes", minValue: 20, maxValue: 180, xpPerUnit: 1, goldPerUnit: 0.25, cooldownMinutes: 45 },
  { id: "cook", name: "Cook", genre: "DISCIPLINE", unit: "meals", minValue: 1, maxValue: 4, xpPerUnit: 20, goldPerUnit: 5, cooldownMinutes: 40 },
  { id: "cycle", name: "Cycle", genre: "STRENGTH", unit: "kilometers", minValue: 2, maxValue: 40, xpPerUnit: 4, goldPerUnit: 1, cooldownMinutes: 50 },
  { id: "draw", name: "Draw", genre: "INTELLECT", unit: "minutes", minValue: 15, maxValue: 120, xpPerUnit: 1, goldPerUnit: 0.25, cooldownMinutes: 35 },
  { id: "exercise", name: "Exercise", genre: "STRENGTH", unit: "minutes", minValue: 15, maxValue: 90, xpPerUnit: 2, goldPerUnit: 0.5, cooldownMinutes: 50 },
  { id: "hydrate", name: "Hydrate", genre: "DISCIPLINE", unit: "glasses", minValue: 3, maxValue: 12, xpPerUnit: 3, goldPerUnit: 1, cooldownMinutes: 30 },
  { id: "journal", name: "Journal", genre: "DISCIPLINE", unit: "pages", minValue: 1, maxValue: 10, xpPerUnit: 12, goldPerUnit: 3, cooldownMinutes: 30 },
  { id: "language", name: "Language", genre: "INTELLECT", unit: "minutes", minValue: 10, maxValue: 90, xpPerUnit: 2, goldPerUnit: 0.4, cooldownMinutes: 40 },
  { id: "learn", name: "Learn", genre: "INTELLECT", unit: "minutes", minValue: 15, maxValue: 120, xpPerUnit: 2, goldPerUnit: 0.4, cooldownMinutes: 40 },
  { id: "listen", name: "Listen", genre: "INTELLECT", unit: "minutes", minValue: 10, maxValue: 90, xpPerUnit: 1, goldPerUnit: 0.2, cooldownMinutes: 30 },
  { id: "meditate", name: "Meditate", genre: "DISCIPLINE", unit: "minutes", minValue: 5, maxValue: 60, xpPerUnit: 3, goldPerUnit: 0.6, cooldownMinutes: 35 },
  { id: "mobility", name: "Mobility", genre: "STRENGTH", unit: "minutes", minValue: 10, maxValue: 45, xpPerUnit: 2, goldPerUnit: 0.5, cooldownMinutes: 40 },
  { id: "music", name: "Music", genre: "INTELLECT", unit: "minutes", minValue: 15, maxValue: 90, xpPerUnit: 2, goldPerUnit: 0.4, cooldownMinutes: 40 },
  { id: "plan", name: "Plan", genre: "DISCIPLINE", unit: "tasks", minValue: 1, maxValue: 12, xpPerUnit: 6, goldPerUnit: 1.5, cooldownMinutes: 30 },
  { id: "practice", name: "Practice", genre: "DISCIPLINE", unit: "minutes", minValue: 15, maxValue: 120, xpPerUnit: 2, goldPerUnit: 0.4, cooldownMinutes: 40 },
  { id: "pushups", name: "Push-ups", genre: "STRENGTH", unit: "reps", minValue: 10, maxValue: 100, xpPerUnit: 1, goldPerUnit: 0.25, cooldownMinutes: 40 },
  { id: "read", name: "Read", genre: "INTELLECT", unit: "pages", minValue: 10, maxValue: 100, xpPerUnit: 2, goldPerUnit: 0.5, cooldownMinutes: 30 },
  { id: "research", name: "Research", genre: "INTELLECT", unit: "minutes", minValue: 20, maxValue: 150, xpPerUnit: 1, goldPerUnit: 0.25, cooldownMinutes: 45 },
  { id: "review", name: "Review", genre: "INTELLECT", unit: "cards", minValue: 10, maxValue: 80, xpPerUnit: 1, goldPerUnit: 0.25, cooldownMinutes: 30 },
  { id: "run", name: "Run", genre: "STRENGTH", unit: "kilometers", minValue: 1, maxValue: 20, xpPerUnit: 8, goldPerUnit: 2, cooldownMinutes: 50 },
  { id: "sleep", name: "Sleep well", genre: "DISCIPLINE", unit: "hours", minValue: 6, maxValue: 10, xpPerUnit: 8, goldPerUnit: 2, cooldownMinutes: 60 },
  { id: "stretch", name: "Stretch", genre: "STRENGTH", unit: "minutes", minValue: 5, maxValue: 40, xpPerUnit: 2, goldPerUnit: 0.5, cooldownMinutes: 30 },
  { id: "study", name: "Study", genre: "INTELLECT", unit: "minutes", minValue: 20, maxValue: 180, xpPerUnit: 1, goldPerUnit: 0.25, cooldownMinutes: 45 },
  { id: "swim", name: "Swim", genre: "STRENGTH", unit: "laps", minValue: 4, maxValue: 40, xpPerUnit: 3, goldPerUnit: 0.75, cooldownMinutes: 50 },
  { id: "tidy", name: "Tidy", genre: "DISCIPLINE", unit: "minutes", minValue: 10, maxValue: 60, xpPerUnit: 2, goldPerUnit: 0.5, cooldownMinutes: 35 },
  { id: "train", name: "Gym", genre: "STRENGTH", unit: "minutes", minValue: 20, maxValue: 90, xpPerUnit: 2, goldPerUnit: 0.5, cooldownMinutes: 60 },
  { id: "walk", name: "Walk", genre: "STRENGTH", unit: "minutes", minValue: 10, maxValue: 90, xpPerUnit: 1, goldPerUnit: 0.3, cooldownMinutes: 30 },
  { id: "write", name: "Write", genre: "INTELLECT", unit: "words", minValue: 100, maxValue: 1500, xpPerUnit: 0.05, goldPerUnit: 0.012, cooldownMinutes: 40 },
  { id: "yoga", name: "Yoga", genre: "STRENGTH", unit: "minutes", minValue: 10, maxValue: 75, xpPerUnit: 2, goldPerUnit: 0.5, cooldownMinutes: 45 },
  { id: "cold", name: "Cold shower", genre: "DISCIPLINE", unit: "minutes", minValue: 1, maxValue: 10, xpPerUnit: 8, goldPerUnit: 2, cooldownMinutes: 40 },
  { id: "focus", name: "Deep work", genre: "INTELLECT", unit: "minutes", minValue: 25, maxValue: 120, xpPerUnit: 2, goldPerUnit: 0.4, cooldownMinutes: 50 },
  { id: "steps", name: "Steps", genre: "STRENGTH", unit: "steps", minValue: 2000, maxValue: 15000, xpPerUnit: 0.006, goldPerUnit: 0.0015, cooldownMinutes: 40 },
  { id: "call", name: "Call a friend", genre: "DISCIPLINE", unit: "minutes", minValue: 10, maxValue: 60, xpPerUnit: 2, goldPerUnit: 0.4, cooldownMinutes: 45 },
  { id: "garden", name: "Garden", genre: "DISCIPLINE", unit: "minutes", minValue: 10, maxValue: 90, xpPerUnit: 2, goldPerUnit: 0.5, cooldownMinutes: 40 },
]

export const QUEST_LIBRARY: QuestTemplate[] = [...templates].sort((a, b) =>
  a.name.localeCompare(b.name),
)

export function getQuestTemplate(id: string): QuestTemplate | undefined {
  return QUEST_LIBRARY.find((item) => item.id === id)
}

export function genreLabel(genre: QuestGenre): string {
  if (genre === "INTELLECT") return "Intellect"
  if (genre === "STRENGTH") return "Strength"
  return "Discipline"
}

export function projectLibraryReward(template: QuestTemplate, quantity: number): {
  xp: number
  gold: number
} {
  return {
    xp: Math.max(1, Math.round(quantity * template.xpPerUnit)),
    gold: Math.max(1, Math.round(quantity * template.goldPerUnit)),
  }
}

export function cooldownKey(templateId: string | null, name: string): string {
  if (templateId) return `template:${templateId}`
  return `custom:${name.trim().toLowerCase()}`
}
