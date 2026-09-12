import { ACHIEVEMENTS } from "./achievements"
import { localDateKey } from "./dates"
import { cooldownKey, CUSTOM_QUEST_COOLDOWN_MINUTES, CUSTOM_QUEST_GOLD, CUSTOM_QUEST_XP, getQuestTemplate, PROFILE_EDIT_XP_COST, projectLibraryReward } from "./quest-library"
import { dailyScore, deriveStats } from "./rpg"
import { GOLD_SHOP } from "./shop"
import type { GameState, Profile, Quest, QuestGenre } from "./types"

function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}-${Date.now().toString(36)}`
}

function applyAchievements(state: GameState, today: string): GameState {
  const stats = deriveStats(state, today)
  const unlocked = new Set(state.unlockedAchievementIds)
  let inventory = state.inventory
  for (const achievement of ACHIEVEMENTS) {
    if (unlocked.has(achievement.id) || !achievement.check(stats)) continue
    unlocked.add(achievement.id)
    if (achievement.rewardItem && !inventory.some((item) => item.id === achievement.rewardItem?.id)) {
      inventory = [
        ...inventory,
        { ...achievement.rewardItem, acquiredAt: new Date().toISOString() },
      ]
    }
  }
  return {
    ...state,
    inventory,
    unlockedAchievementIds: [...unlocked],
  }
}

function settleDate(state: GameState, date: string): GameState {
  if (state.settledDates.includes(date)) return state
  const score = dailyScore(state.quests, date)
  if (score.planned === 0) {
    return { ...state, settledDates: [...state.settledDates, date] }
  }
  const disciplineGain = Math.max(0, Math.round(score.percent / 20) - (score.expired > 0 ? 1 : 0))
  return {
    ...state,
    disciplineXp: state.disciplineXp + disciplineGain,
    settledDates: [...state.settledDates, date],
  }
}

export function expireOverdueQuests(state: GameState, today: string): GameState {
  const now = new Date().toISOString()
  let next: GameState = {
    ...state,
    quests: state.quests.map((quest) => {
      if (quest.status !== "active" || quest.scheduledDate >= today) return quest
      return { ...quest, status: "expired" as const, expiredAt: now }
    }),
  }

  const dates = new Set(next.quests.map((quest) => quest.scheduledDate))
  for (const date of dates) {
    if (date < today) next = settleDate(next, date)
  }

  next.lastSeenDate = today
  return applyAchievements(next, today)
}

export type GameAction =
  | { type: "HYDRATE"; state: GameState }
  | { type: "SYNC_DAY" }
  | { type: "CREATE_PROFILE"; profile: Profile }
  | { type: "UPDATE_PROFILE"; profile: Partial<Profile> }
  | {
      type: "CREATE_LIBRARY_QUEST"
      templateId: string
      genre: QuestGenre
      quantity: number
      scheduledDate: string
    }
  | {
      type: "CREATE_CUSTOM_QUEST"
      name: string
      description: string
      genre: QuestGenre
      quantity: number | null
      unit: string | null
      scheduledDate: string
    }
  | { type: "DELETE_QUEST"; id: string }
  | { type: "COMPLETE_QUEST"; id: string }
  | { type: "BUY_ITEM"; shopId: string }
  | { type: "PLAY_GAME"; gameId: string; goldCost: number; xpReward: number; note: string }

export type ActionResult = { state: GameState; error?: string; message?: string }

export function reduceGame(state: GameState, action: GameAction): ActionResult {
  const today = localDateKey()
  const synced = expireOverdueQuests(state, today)

  switch (action.type) {
    case "HYDRATE":
      return { state: expireOverdueQuests(action.state, today) }
    case "SYNC_DAY":
      return { state: synced }
    case "CREATE_PROFILE": {
      if (synced.profile) return { state: synced, error: "A village profile already exists." }
      const next = applyAchievements({ ...synced, profile: action.profile }, today)
      return { state: next, message: `Welcome to ${action.profile.villageName}.` }
    }
    case "UPDATE_PROFILE": {
      if (!synced.profile) return { state: synced, error: "Create a profile first." }
      if (synced.totalXp < PROFILE_EDIT_XP_COST) {
        return {
          state: synced,
          error: `Updating your dossier costs ${PROFILE_EDIT_XP_COST} XP.`,
        }
      }
      const next = {
        ...synced,
        totalXp: synced.totalXp - PROFILE_EDIT_XP_COST,
        profile: { ...synced.profile, ...action.profile },
      }
      return { state: next, message: `Profile updated (−${PROFILE_EDIT_XP_COST} XP).` }
    }
    case "CREATE_LIBRARY_QUEST": {
      const template = getQuestTemplate(action.templateId)
      if (!template) return { state: synced, error: "That quest is not in the library." }
      if (action.quantity < template.minValue) {
        return { state: synced, error: `Minimum allowed value is ${template.minValue} ${template.unit}.` }
      }
      if (action.quantity > template.maxValue) {
        return { state: synced, error: `Maximum allowed value is ${template.maxValue} ${template.unit}.` }
      }
      if (action.scheduledDate < today) {
        return { state: synced, error: "Quests cannot be scheduled in the past." }
      }
      const monthNow = new Date()
      const scheduled = action.scheduledDate
      if (!scheduled.startsWith(`${monthNow.getFullYear()}-${String(monthNow.getMonth() + 1).padStart(2, "0")}`)) {
        return { state: synced, error: "Scheduling is limited to the current month." }
      }
      const key = cooldownKey(template.id, template.name)
      const until = synced.cooldowns[key] ?? 0
      if (until > Date.now()) {
        return { state: synced, error: "This quest type is still cooling down." }
      }
      const reward = projectLibraryReward(template, action.quantity)
      const quest: Quest = {
        id: uid("quest"),
        templateId: template.id,
        name: template.name,
        description: `${action.quantity} ${template.unit}`,
        genre: action.genre,
        scheduledDate: action.scheduledDate,
        quantity: action.quantity,
        unit: template.unit,
        xpReward: reward.xp,
        goldReward: reward.gold,
        status: "active",
        createdAt: new Date().toISOString(),
        completedAt: null,
        expiredAt: null,
        cooldownMinutes: template.cooldownMinutes,
      }
      return {
        state: { ...synced, quests: [quest, ...synced.quests] },
        message: `${template.name} scheduled.`,
      }
    }
    case "CREATE_CUSTOM_QUEST": {
      const name = action.name.trim()
      if (name.length < 2) return { state: synced, error: "Give the quest a name." }
      if (action.scheduledDate < today) {
        return { state: synced, error: "Quests cannot be scheduled in the past." }
      }
      const monthNow = new Date()
      if (!action.scheduledDate.startsWith(`${monthNow.getFullYear()}-${String(monthNow.getMonth() + 1).padStart(2, "0")}`)) {
        return { state: synced, error: "Scheduling is limited to the current month." }
      }
      const key = cooldownKey(null, name)
      if ((synced.cooldowns[key] ?? 0) > Date.now()) {
        return { state: synced, error: "This custom quest is still cooling down." }
      }
      const quest: Quest = {
        id: uid("quest"),
        templateId: null,
        name,
        description: action.description.trim(),
        genre: action.genre,
        scheduledDate: action.scheduledDate,
        quantity: action.quantity,
        unit: action.unit,
        xpReward: CUSTOM_QUEST_XP,
        goldReward: CUSTOM_QUEST_GOLD,
        status: "active",
        createdAt: new Date().toISOString(),
        completedAt: null,
        expiredAt: null,
        cooldownMinutes: CUSTOM_QUEST_COOLDOWN_MINUTES,
      }
      return {
        state: { ...synced, quests: [quest, ...synced.quests] },
        message: `${name} scheduled.`,
      }
    }
    case "DELETE_QUEST": {
      const quest = synced.quests.find((item) => item.id === action.id)
      if (!quest) return { state: synced, error: "Quest not found." }
      if (quest.status !== "active") {
        return { state: synced, error: "Historical quests cannot be deleted." }
      }
      return {
        state: { ...synced, quests: synced.quests.filter((item) => item.id !== action.id) },
        message: "Quest removed from the board.",
      }
    }
    case "COMPLETE_QUEST": {
      const quest = synced.quests.find((item) => item.id === action.id)
      if (!quest) return { state: synced, error: "Quest not found." }
      if (quest.status !== "active") return { state: synced, error: "That quest is no longer active." }
      if (quest.scheduledDate !== today) {
        return { state: synced, error: "This quest can only be completed on its scheduled day." }
      }
      const key = cooldownKey(quest.templateId, quest.name)
      if ((synced.cooldowns[key] ?? 0) > Date.now()) {
        return { state: synced, error: "QUEST COOLDOWN is still running for this type." }
      }
      const now = Date.now()
      const completed: Quest = {
        ...quest,
        status: "completed",
        completedAt: new Date(now).toISOString(),
      }
      let next: GameState = {
        ...synced,
        quests: synced.quests.map((item) => (item.id === quest.id ? completed : item)),
        totalXp: synced.totalXp + quest.xpReward,
        gold: synced.gold + quest.goldReward,
        intellectXp: synced.intellectXp + (quest.genre === "INTELLECT" ? quest.xpReward : 0),
        strengthXp: synced.strengthXp + (quest.genre === "STRENGTH" ? quest.xpReward : 0),
        disciplineXp: synced.disciplineXp + (quest.genre === "DISCIPLINE" ? quest.xpReward : 0),
        goldTransactions: [
          {
            id: uid("gold"),
            amount: quest.goldReward,
            reason: `Quest: ${quest.name}`,
            createdAt: new Date(now).toISOString(),
          },
          ...synced.goldTransactions,
        ],
        cooldowns: {
          ...synced.cooldowns,
          [key]: now + quest.cooldownMinutes * 60_000,
        },
      }
      next = expireOverdueQuests(next, today)
      return { state: next, message: `+${quest.xpReward} XP · +${quest.goldReward} Gold` }
    }
    case "BUY_ITEM": {
      const item = GOLD_SHOP.find((shop) => shop.id === action.shopId)
      if (!item) return { state: synced, error: "Unknown shop offering." }
      if (synced.gold < item.cost) return { state: synced, error: "Not enough gold." }
      if (synced.inventory.some((owned) => owned.id === item.id)) {
        return { state: synced, error: "You already keep this piece." }
      }
      const next: GameState = {
        ...synced,
        gold: synced.gold - item.cost,
        inventory: [
          {
            id: item.id,
            name: item.name,
            slot: item.slot,
            note: item.note,
            acquiredAt: new Date().toISOString(),
          },
          ...synced.inventory,
        ],
        goldTransactions: [
          {
            id: uid("gold"),
            amount: -item.cost,
            reason: `Shop: ${item.name}`,
            createdAt: new Date().toISOString(),
          },
          ...synced.goldTransactions,
        ],
      }
      return { state: next, message: `${item.name} acquired.` }
    }
    case "PLAY_GAME": {
      if (synced.gold < action.goldCost) return { state: synced, error: "Not enough gold." }
      const next: GameState = {
        ...synced,
        gold: synced.gold - action.goldCost,
        totalXp: synced.totalXp + action.xpReward,
        goldTransactions:
          action.goldCost > 0
            ? [
                {
                  id: uid("gold"),
                  amount: -action.goldCost,
                  reason: action.note,
                  createdAt: new Date().toISOString(),
                },
                ...synced.goldTransactions,
              ]
            : synced.goldTransactions,
      }
      return {
        state: applyAchievements(next, today),
        message: action.xpReward > 0 ? `Played · +${action.xpReward} XP` : "Played.",
      }
    }
    default:
      return { state: synced }
  }
}
