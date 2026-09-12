import type { Profile } from "@/lib/types"

export function getBrowserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
  } catch {
    return "UTC"
  }
}

// Map local Profile + GameState stats to Supabase profiles row
// Supabase profiles: id, username, level, xp, strength, intellect, discipline, gold, timezone, created_at
export function profileToDbRow(profile: Profile, stats: { totalXp: number; level: number; intellectXp: number; strengthXp: number; disciplineXp: number; gold: number }, userId: string, timezone?: string) {
  return {
    id: userId,
    username: profile.name,
    level: stats.level,
    xp: stats.totalXp,
    intellect: stats.intellectXp,
    strength: stats.strengthXp,
    discipline: stats.disciplineXp,
    gold: stats.gold,
    timezone: timezone ?? getBrowserTimezone(),
    // villageName, gender, title, avatarId are kept in localStorage Profile only for now
    // If profiles table is extended to store them, add here
  }
}
