import { localDateKey } from "./dates"
import type { GameState } from "./types"

export const GAME_STORAGE_KEY = "nethra.game.v1"

export function createInitialState(now = new Date()): GameState {
  return {
    version: 1,
    profile: null,
    totalXp: 0,
    gold: 25,
    intellectXp: 0,
    strengthXp: 0,
    disciplineXp: 0,
    quests: [],
    goldTransactions: [],
    inventory: [],
    unlockedAchievementIds: [],
    settledDates: [],
    lastSeenDate: localDateKey(now),
    cooldowns: {},
  }
}

export function loadGameState(): GameState {
  if (typeof window === "undefined") return createInitialState()
  try {
    const raw = window.localStorage.getItem(GAME_STORAGE_KEY)
    if (!raw) return createInitialState()
    const parsed = JSON.parse(raw) as GameState
    if (!parsed || parsed.version !== 1) return createInitialState()
    return {
      ...createInitialState(),
      ...parsed,
      quests: parsed.quests ?? [],
      goldTransactions: parsed.goldTransactions ?? [],
      inventory: parsed.inventory ?? [],
      unlockedAchievementIds: parsed.unlockedAchievementIds ?? [],
      settledDates: parsed.settledDates ?? [],
      cooldowns: parsed.cooldowns ?? {},
    }
  } catch {
    return createInitialState()
  }
}

export function saveGameState(state: GameState) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify(state))
}
