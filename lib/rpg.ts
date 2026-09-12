import { addDays, localDateKey, startOfWeekMonday, weekdayLabel, weekDateKeys, yesterday } from "./dates"
import type { DerivedStats, GameState, Quest, Reward, WeeklyBucket } from "./types"

export const XP_PER_LEVEL = 1000

export function attributeFromXp(genreXp: number): number {
  return 1 + Math.floor(genreXp / 80)
}

export function levelFromTotalXp(totalXp: number): {
  level: number
  xpIntoLevel: number
  xpToNext: number
} {
  const safeXp = Math.max(0, totalXp)
  const level = Math.floor(safeXp / XP_PER_LEVEL) + 1
  const xpIntoLevel = safeXp % XP_PER_LEVEL
  return { level, xpIntoLevel, xpToNext: XP_PER_LEVEL }
}

export function titleForLevel(level: number, fallback: string): string {
  if (fallback.trim()) return fallback
  if (level >= 20) return "Shogun"
  if (level >= 12) return "Samurai"
  if (level >= 6) return "Ronin"
  return "Wanderer"
}

export function completionDates(quests: Quest[]): Set<string> {
  return new Set(quests.filter((quest) => quest.status === "completed").map((quest) => quest.scheduledDate))
}

export function currentStreak(quests: Quest[], today: string): number {
  const dates = completionDates(quests)
  let cursor = today
  if (!dates.has(today)) {
    cursor = yesterday(today)
    if (!dates.has(cursor)) return 0
  }
  let streak = 0
  while (dates.has(cursor)) {
    streak += 1
    cursor = yesterday(cursor)
  }
  return streak
}

export function longestStreak(quests: Quest[]): number {
  const dates = [...completionDates(quests)].sort()
  if (dates.length === 0) return 0
  let best = 1
  let run = 1
  for (let i = 1; i < dates.length; i += 1) {
    if (dates[i] === addDays(dates[i - 1], 1)) {
      run += 1
      best = Math.max(best, run)
    } else {
      run = 1
    }
  }
  return best
}

export function questsOnDate(quests: Quest[], date: string): Quest[] {
  return quests.filter((quest) => quest.scheduledDate === date)
}

export function dailyScore(quests: Quest[], date: string): {
  planned: number
  completed: number
  expired: number
  percent: number
  xp: number
} {
  const dayQuests = questsOnDate(quests, date)
  const planned = dayQuests.length
  const completed = dayQuests.filter((quest) => quest.status === "completed").length
  const expired = dayQuests.filter((quest) => quest.status === "expired").length
  const xp = dayQuests
    .filter((quest) => quest.status === "completed")
    .reduce((sum, quest) => sum + quest.xpReward, 0)
  return {
    planned,
    completed,
    expired,
    percent: planned === 0 ? 0 : Math.round((completed / planned) * 100),
    xp,
  }
}

export function deriveStats(state: GameState, today: string = localDateKey()): DerivedStats {
  const { level, xpIntoLevel, xpToNext } = levelFromTotalXp(state.totalXp)
  const todayScore = dailyScore(state.quests, today)
  const completed = state.quests.filter((quest) => quest.status === "completed")
  return {
    level,
    xpIntoLevel,
    xpToNext,
    totalXp: state.totalXp,
    gold: state.gold,
    intellect: attributeFromXp(state.intellectXp),
    strength: attributeFromXp(state.strengthXp),
    discipline: attributeFromXp(state.disciplineXp),
    intellectXp: state.intellectXp,
    strengthXp: state.strengthXp,
    disciplineXp: state.disciplineXp,
    currentStreak: currentStreak(state.quests, today),
    longestStreak: longestStreak(state.quests),
    totalActiveDays: completionDates(state.quests).size,
    totalQuestsCompleted: completed.length,
    totalGoldEarned: state.goldTransactions
      .filter((tx) => tx.amount > 0)
      .reduce((sum, tx) => sum + tx.amount, 0),
    todayPlanned: todayScore.planned,
    todayCompleted: todayScore.completed,
    todayExpired: todayScore.expired,
    todayScorePercent: todayScore.percent,
    todayXp: todayScore.xp,
  }
}

export function weeklyXp(quests: Quest[], weekStart: Date, today: string): WeeklyBucket[] {
  return weekDateKeys(weekStart).map((date) => ({
    date,
    label: weekdayLabel(date),
    xp: dailyScore(quests, date).xp,
    isFuture: date > today,
  }))
}

export function canShiftWeekForward(weekStart: Date, today: string): boolean {
  const currentWeekStart = startOfWeekMonday(parseDateFromKey(today))
  return localDateKey(weekStart) < localDateKey(currentWeekStart)
}

function parseDateFromKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number)
  return new Date(y, m - 1, d)
}

export function recentActivity(quests: Quest[], limit = 8): Reward[] {
  return quests
    .filter((quest) => quest.status === "completed" && quest.completedAt)
    .sort((a, b) => (b.completedAt ?? "").localeCompare(a.completedAt ?? ""))
    .slice(0, limit)
    .flatMap((quest) => [
      {
        id: `${quest.id}-xp`,
        label: `${quest.name} · +${quest.xpReward} XP`,
        kind: "xp" as const,
        at: quest.completedAt ?? quest.createdAt,
      },
      {
        id: `${quest.id}-gold`,
        label: `+${quest.goldReward} Gold`,
        kind: "gold" as const,
        at: quest.completedAt ?? quest.createdAt,
      },
    ])
}

export function remainingMs(until: number, now = Date.now()): number {
  return Math.max(0, until - now)
}

export function formatCountdown(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
}
