export type QuestGenre = "INTELLECT" | "STRENGTH" | "DISCIPLINE"

export type QuestStatus = "active" | "completed" | "expired"

export type GenderPreference = "male" | "female" | "nonbinary" | "unspecified"

export type AvatarId = "ronin" | "seal-indigo" | "seal-gold" | "seal-sakura"

export interface Profile {
  name: string
  villageName: string
  gender: GenderPreference
  title: string
  avatarId: AvatarId
}

export interface QuestTemplate {
  id: string
  name: string
  genre: QuestGenre
  unit: string
  minValue: number
  maxValue: number
  xpPerUnit: number
  goldPerUnit: number
  cooldownMinutes: number
}

export interface Quest {
  id: string
  templateId: string | null
  name: string
  description: string
  genre: QuestGenre
  scheduledDate: string
  quantity: number | null
  unit: string | null
  xpReward: number
  goldReward: number
  status: QuestStatus
  createdAt: string
  completedAt: string | null
  expiredAt: string | null
  cooldownMinutes: number
}

export interface GoldTransaction {
  id: string
  amount: number
  reason: string
  createdAt: string
}

export interface InventoryItem {
  id: string
  name: string
  slot: "Relic" | "Keepsake" | "Cosmetic" | "Trophy"
  note: string
  acquiredAt: string
}

export interface AchievementDef {
  id: string
  name: string
  description: string
  check: (stats: DerivedStats) => boolean
  rewardItem?: Omit<InventoryItem, "acquiredAt">
}

export interface DerivedStats {
  level: number
  xpIntoLevel: number
  xpToNext: number
  totalXp: number
  gold: number
  intellect: number
  strength: number
  discipline: number
  intellectXp: number
  strengthXp: number
  disciplineXp: number
  currentStreak: number
  longestStreak: number
  totalActiveDays: number
  totalQuestsCompleted: number
  totalGoldEarned: number
  todayPlanned: number
  todayCompleted: number
  todayExpired: number
  todayScorePercent: number
  todayXp: number
}

export interface WeeklyBucket {
  date: string
  label: string
  xp: number
  isFuture: boolean
}

export type NavId = "dashboard" | "quests" | "calendar" | "inventory" | "character"

export interface NavItem {
  id: NavId
  label: string
  href: "/dashboard" | "/quests" | "/calendar" | "/inventory" | "/character"
}

export interface GameState {
  version: 1
  profile: Profile | null
  totalXp: number
  gold: number
  intellectXp: number
  strengthXp: number
  disciplineXp: number
  quests: Quest[]
  goldTransactions: GoldTransaction[]
  inventory: InventoryItem[]
  unlockedAchievementIds: string[]
  settledDates: string[]
  lastSeenDate: string
  cooldowns: Record<string, number>
}

export type RewardKind = "xp" | "gold" | "attribute"

export interface Reward {
  id: string
  label: string
  kind: RewardKind
  at: string
}
