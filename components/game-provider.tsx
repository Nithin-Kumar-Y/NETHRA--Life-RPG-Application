"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { localDateKey } from "@/lib/dates"
import { reduceGame, type GameAction } from "@/lib/game-reducer"
import { createInitialState, loadGameState, saveGameState } from "@/lib/game-state"
import { deriveStats, levelFromTotalXp, remainingMs } from "@/lib/rpg"
import type { DerivedStats, GameState, Quest } from "@/lib/types"
import { createClient as createSupabaseBrowserClient } from "@/lib/supabase/client"
import { dbRowToQuest } from "@/lib/supabase/quests"
import { getBrowserTimezone } from "@/lib/supabase/profile"

export type CelebrationData = {
  quest: Quest
  xp: number
  gold: number
  prevLevel: number
  newLevel: number
  leveledUp: boolean
}

type GameContextValue = {
  ready: boolean
  state: GameState
  stats: DerivedStats
  today: string
  notice: string | null
  error: string | null
  dispatch: (action: GameAction) => void
  cooldownRemaining: (key: string) => number
  clearNotice: () => void
  celebration: CelebrationData | null
  dismissCelebration: () => void
}

const GameContext = createContext<GameContextValue | null>(null)

function isSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
}

function getSupabase() {
  if (!isSupabaseConfigured()) return null
  try {
    return createSupabaseBrowserClient()
  } catch {
    return null
  }
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GameState>(createInitialState)
  const [ready, setReady] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [now, setNow] = useState(0)
  const [celebration, setCelebration] = useState<CelebrationData | null>(null)
  const supabaseUserIdRef = useRef<string | null>(null)
  const hasHydratedFromSupabaseRef = useRef(false)

  // Hydration: Supabase authoritative if authenticated, else localStorage fallback
  useEffect(() => {
    let cancelled = false

    const init = async () => {
      const supabase = getSupabase()
      const loadedLocal = loadGameState()
      const localResult = reduceGame(loadedLocal, { type: "SYNC_DAY" })

      if (!supabase) {
        if (!cancelled) {
          setState(localResult.state)
          saveGameState(localResult.state)
          setReady(true)
          setNow(Date.now())
        }
        return
      }

      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          if (!cancelled) {
            setState(localResult.state)
            saveGameState(localResult.state)
            setReady(true)
            setNow(Date.now())
          }
          return
        }

        supabaseUserIdRef.current = user.id

        const tz = getBrowserTimezone()
        try {
          await supabase.from("profiles").upsert({ id: user.id, timezone: tz }, { onConflict: "id" })
        } catch {}

        try {
          await (supabase.rpc("expire_overdue_quests", { p_timezone: tz }) as unknown as Promise<any>)
        } catch {}

        const { data: questRows, error: questError } = await supabase
          .from("quests")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (questError) throw questError

        const quests: Quest[] = (questRows ?? []).map((row) => dbRowToQuest(row as any))

        let cooldowns: Record<string, number> = {}
        try {
          const { data: cdRows } = await supabase.from("quest_cooldowns").select("*").eq("user_id", user.id)
          if (cdRows) {
            for (const row of cdRows as any[]) {
              const ms = new Date(row.available_at).getTime()
              if (ms > Date.now()) {
                cooldowns[row.cooldown_key] = ms
              }
            }
          }
        } catch {}

        let profileStats: Partial<GameState> = {}
        let fetchedProfile: any = null
        try {
          const { data: profileRow } = await supabase.from("profiles").select("*").eq("id", user.id).single()
          if (profileRow) {
            fetchedProfile = profileRow
            profileStats = {
              totalXp: (profileRow as any).xp ?? 0,
              gold: (profileRow as any).gold ?? 25,
              intellectXp: (profileRow as any).intellect ?? 0,
              strengthXp: (profileRow as any).strength ?? 0,
              disciplineXp: (profileRow as any).discipline ?? 0,
            }
          }
        } catch {}

        // Inventory hydration
        let inventory: GameState["inventory"] = []
        try {
          const { data: invRows } = await supabase.from("inventory_items").select("*").eq("user_id", user.id)
          if (invRows) {
            inventory = (invRows as any[]).map((row) => ({
              id: row.id,
              name: row.name,
              slot: row.slot,
              note: row.note,
              acquiredAt: row.acquired_at,
            }))
          }
        } catch {}

        const hydrated: GameState = {
          ...createInitialState(),
          ...localResult.state,
          ...profileStats,
          quests,
          cooldowns: { ...localResult.state.cooldowns, ...cooldowns },
          inventory: inventory.length > 0 ? inventory : localResult.state.inventory,
          // keep local dossier if Supabase username empty, else sync
          profile: (() => {
            const local = localResult.state.profile
            if (!local) return null
            if (fetchedProfile?.username && fetchedProfile.username !== local.name) {
              // Prefer local name unless Supabase has more recent? Keep local for now, but ensure Supabase username sync happens on next edit
              return local
            }
            return local
          })(),
        }

        const synced = reduceGame(hydrated, { type: "SYNC_DAY" })

        if (!cancelled) {
          hasHydratedFromSupabaseRef.current = true
          setState(synced.state)
          saveGameState(synced.state)
          setReady(true)
          setNow(Date.now())
        }
      } catch (e) {
        if (!cancelled) {
          setState(localResult.state)
          saveGameState(localResult.state)
          setReady(true)
          setNow(Date.now())
        }
      }
    }

    init()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!ready) return
    saveGameState(state)
  }, [ready, state])

  useEffect(() => {
    if (!ready) return
    const tick = () => {
      setNow(Date.now())
      setState((current) => reduceGame(current, { type: "SYNC_DAY" }).state)
      const supabase = getSupabase()
      const userId = supabaseUserIdRef.current
      if (supabase && userId) {
        const tz = getBrowserTimezone()
        void (supabase.rpc("expire_overdue_quests", { p_timezone: tz }) as unknown as Promise<any>).then(() => {}).catch(() => {})
      }
    }
    const interval = window.setInterval(tick, 1_000)
    const onVisibility = () => {
      if (document.visibilityState === "visible") tick()
    }
    document.addEventListener("visibilitychange", onVisibility)
    return () => {
      window.clearInterval(interval)
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [ready])

  const dispatch = useCallback((action: GameAction) => {
    const supabase = getSupabase()
    const userId = supabaseUserIdRef.current
    const isAuthenticated = Boolean(supabase && userId && hasHydratedFromSupabaseRef.current)

    // Secure profile edit via RPC when authenticated
    if ((action.type === "UPDATE_PROFILE" || action.type === "CREATE_PROFILE") && isAuthenticated && supabase && userId) {
      // For CREATE_PROFILE, we still use local reducer to set profile, then sync safe fields via upsert (no XP cost yet for new)
      // For UPDATE_PROFILE, use secure RPC edit_profile which checks XP cost server-side
      if (action.type === "UPDATE_PROFILE") {
        const currentProfile = state.profile
        if (!currentProfile) {
          setError("Create a profile first.")
          return
        }
        const nextProfile = { ...currentProfile, ...action.profile }
        const tz = getBrowserTimezone()
        void (async () => {
          try {
            const { data, error: rpcError } = await (supabase.rpc("edit_profile", {
              p_name: nextProfile.name,
              p_village_name: nextProfile.villageName,
              p_gender: nextProfile.gender,
              p_title: nextProfile.title,
              p_avatar_id: nextProfile.avatarId,
              p_timezone: tz,
            }) as unknown as Promise<any>)
            if (rpcError) {
              setError(rpcError.message)
              return
            }
            // Success: refetch profile and update local state
            const { data: profileRow } = await supabase.from("profiles").select("*").eq("id", userId).single()
            const profileStats: Partial<GameState> = profileRow ? {
              totalXp: (profileRow as any).xp ?? 0,
              gold: (profileRow as any).gold ?? 25,
              intellectXp: (profileRow as any).intellect ?? 0,
              strengthXp: (profileRow as any).strength ?? 0,
              disciplineXp: (profileRow as any).discipline ?? 0,
            } : {}
            setState((current) => {
              const next: GameState = {
                ...current,
                ...profileStats,
                profile: nextProfile,
              }
              const synced = reduceGame(next, { type: "SYNC_DAY" })
              saveGameState(synced.state)
              setNotice(`Profile updated (−15 XP).`)
              setError(null)
              return synced.state
            })
          } catch (e: any) {
            setError(e?.message ?? "Profile update failed")
          }
        })()
        return
      }
      // CREATE_PROFILE for authenticated: local + safe upsert (no XP cost)
      // Fall through to normal handling but with safe profile sync (see below)
    }

    // Secure quest creation via RPC when authenticated
    if ((action.type === "CREATE_LIBRARY_QUEST" || action.type === "CREATE_CUSTOM_QUEST") && isAuthenticated && supabase && userId) {
      const tz = getBrowserTimezone()
      void (async () => {
        try {
          let result: any
          if (action.type === "CREATE_LIBRARY_QUEST") {
            const { data, error } = await (supabase.rpc("create_quest", {
              p_template_id: action.templateId,
              p_name: null,
              p_description: null,
              p_genre: action.genre,
              p_quantity: action.quantity,
              p_unit: null,
              p_scheduled_date: action.scheduledDate,
              p_timezone: tz,
            }) as unknown as Promise<any>)
            if (error) throw error
            result = data
          } else {
            const { data, error } = await (supabase.rpc("create_quest", {
              p_template_id: null,
              p_name: action.name,
              p_description: action.description,
              p_genre: action.genre,
              p_quantity: action.quantity,
              p_unit: action.unit,
              p_scheduled_date: action.scheduledDate,
              p_timezone: tz,
            }) as unknown as Promise<any>)
            if (error) throw error
            result = data
          }
          // Refetch quests
          const { data: questRows } = await supabase.from("quests").select("*").eq("user_id", userId).order("created_at", { ascending: false })
          const quests: Quest[] = (questRows ?? []).map((row) => dbRowToQuest(row as any))
          setState((current) => {
            const next: GameState = { ...current, quests }
            const synced = reduceGame(next, { type: "SYNC_DAY" })
            saveGameState(synced.state)
            setNotice(result?.name ? `${result.name} scheduled.` : "Quest scheduled.")
            setError(null)
            return synced.state
          })
        } catch (e: any) {
          setError(e?.message ?? "Quest creation failed")
        }
      })()
      return
    }

    // Secure shop / arcade via RPC when authenticated
    if ((action.type === "BUY_ITEM" || action.type === "PLAY_GAME") && isAuthenticated && supabase && userId) {
      void (async () => {
        try {
          if (action.type === "BUY_ITEM") {
            const { error, data } = await (supabase.rpc("purchase_item", { p_shop_id: action.shopId }) as unknown as Promise<any>)
            if (error) throw error
            // Refetch inventory and profile
            const { data: invRows } = await supabase.from("inventory_items").select("*").eq("user_id", userId)
            const inventory = (invRows as any[] ?? []).map((row) => ({ id: row.id, name: row.name, slot: row.slot, note: row.note, acquiredAt: row.acquired_at }))
            const { data: profileRow } = await supabase.from("profiles").select("*").eq("id", userId).single()
            const profileStats: Partial<GameState> = profileRow ? {
              totalXp: (profileRow as any).xp ?? 0,
              gold: (profileRow as any).gold ?? 25,
              intellectXp: (profileRow as any).intellect ?? 0,
              strengthXp: (profileRow as any).strength ?? 0,
              disciplineXp: (profileRow as any).discipline ?? 0,
            } : {}
            setState((current) => {
              const next: GameState = { ...current, ...profileStats, inventory }
              const synced = reduceGame(next, { type: "SYNC_DAY" })
              saveGameState(synced.state)
              setNotice((data as any)?.item_id ? "Item acquired." : "Purchased.")
              setError(null)
              return synced.state
            })
          } else {
            const { error, data } = await (supabase.rpc("play_game", { p_game_id: action.gameId, p_gold_cost: action.goldCost, p_xp_reward: action.xpReward, p_note: action.note }) as unknown as Promise<any>)
            if (error) throw error
            const { data: profileRow } = await supabase.from("profiles").select("*").eq("id", userId).single()
            const profileStats: Partial<GameState> = profileRow ? {
              totalXp: (profileRow as any).xp ?? 0,
              gold: (profileRow as any).gold ?? 25,
              intellectXp: (profileRow as any).intellect ?? 0,
              strengthXp: (profileRow as any).strength ?? 0,
              disciplineXp: (profileRow as any).discipline ?? 0,
            } : {}
            setState((current) => {
              const next: GameState = { ...current, ...profileStats }
              const synced = reduceGame(next, { type: "SYNC_DAY" })
              saveGameState(synced.state)
              setNotice(`Played · +${action.xpReward} XP`)
              setError(null)
              return synced.state
            })
          }
        } catch (e: any) {
          setError(e?.message ?? "Transaction failed")
        }
      })()
      return
    }

    // Secure completion via RPC when authenticated
    if (action.type === "COMPLETE_QUEST" && isAuthenticated && supabase && userId) {
      const questId = action.id
      const questToCelebrate = state.quests.find((q) => q.id === questId) ?? null
      const prevLevel = levelFromTotalXp(state.totalXp).level
      if (!questToCelebrate) {
        setError("Quest not found.")
        return
      }
      if (questToCelebrate.status !== "active") {
        setError("That quest is no longer active.")
        return
      }

      const tz = getBrowserTimezone()
      void (async () => {
        try {
          const { data, error: rpcError } = await (supabase.rpc("complete_quest", { p_quest_id: questId, p_timezone: tz }) as unknown as Promise<any>)
          if (rpcError) {
            setError(rpcError.message)
            return
          }
          try {
            const { data: questRows } = await supabase.from("quests").select("*").eq("user_id", userId)
            const quests: Quest[] = (questRows ?? []).map((row) => dbRowToQuest(row as any))
            const { data: cdRows } = await supabase.from("quest_cooldowns").select("*").eq("user_id", userId)
            let cooldowns: Record<string, number> = {}
            if (cdRows) {
              for (const row of cdRows as any[]) {
                const ms = new Date(row.available_at).getTime()
                if (ms > Date.now()) cooldowns[row.cooldown_key] = ms
              }
            }
            const { data: invRows } = await supabase.from("inventory_items").select("*").eq("user_id", userId)
            const inventory = (invRows as any[] ?? []).map((row) => ({ id: row.id, name: row.name, slot: row.slot, note: row.note, acquiredAt: row.acquired_at }))
            const { data: profileRow } = await supabase.from("profiles").select("*").eq("id", userId).single()
            const profileStats: Partial<GameState> = profileRow ? {
              totalXp: (profileRow as any).xp ?? 0,
              gold: (profileRow as any).gold ?? 25,
              intellectXp: (profileRow as any).intellect ?? 0,
              strengthXp: (profileRow as any).strength ?? 0,
              disciplineXp: (profileRow as any).discipline ?? 0,
            } : {}

            setState((current) => {
              const next: GameState = {
                ...current,
                ...profileStats,
                quests,
                cooldowns: { ...current.cooldowns, ...cooldowns },
                inventory: inventory.length > 0 ? inventory : current.inventory,
              }
              const synced = reduceGame(next, { type: "SYNC_DAY" })
              saveGameState(synced.state)
              const resultData = data as any
              const xp = resultData?.xp_reward ?? questToCelebrate.xpReward
              const gold = resultData?.gold_reward ?? questToCelebrate.goldReward
              const newLevel = resultData?.new_level ?? levelFromTotalXp(synced.state.totalXp).level
              const celebrationData = {
                quest: questToCelebrate,
                xp,
                gold,
                prevLevel,
                newLevel,
                leveledUp: newLevel > prevLevel,
              }
              queueMicrotask(() => setCelebration(celebrationData))
              setNotice(`+${xp} XP · +${gold} Gold`)
              setError(null)
              return synced.state
            })
          } catch {
            setState((current) => {
              const result = reduceGame(current, action)
              if (!result.error && questToCelebrate) {
                const newLevel = levelFromTotalXp(result.state.totalXp).level
                const data = { quest: questToCelebrate, xp: questToCelebrate.xpReward, gold: questToCelebrate.goldReward, prevLevel, newLevel, leveledUp: newLevel > prevLevel }
                queueMicrotask(() => setCelebration(data))
              }
              setError(result.error ?? null)
              setNotice(result.message ?? null)
              return result.state
            })
          }
        } catch (e: any) {
          setError(e?.message ?? "Completion failed.")
        }
      })()
      return
    }

    // For all other actions: local reducer first (responsive UI), then Supabase persistence for safe fields
    setState((current) => {
      let questToCelebrate: Quest | null = null
      let prevLevel: number | null = null
      if (action.type === "COMPLETE_QUEST") {
        questToCelebrate = current.quests.find((q) => q.id === action.id) ?? null
        prevLevel = levelFromTotalXp(current.totalXp).level
      }
      const result = reduceGame(current, action)
      setError(result.error ?? null)
      setNotice(result.message ?? null)

      if (action.type === "COMPLETE_QUEST" && !result.error && questToCelebrate && !isAuthenticated) {
        const newLevel = levelFromTotalXp(result.state.totalXp).level
        const data: CelebrationData = {
          quest: questToCelebrate,
          xp: questToCelebrate.xpReward,
          gold: questToCelebrate.goldReward,
          prevLevel: prevLevel!,
          newLevel,
          leveledUp: newLevel > prevLevel!,
        }
        queueMicrotask(() => setCelebration(data))
      }

      if (supabase && userId && hasHydratedFromSupabaseRef.current) {
        queueMicrotask(async () => {
          try {
            if (action.type === "CREATE_PROFILE") {
              const tz = getBrowserTimezone()
              // Safe upsert: only username/timezone, not xp/gold
              await supabase.from("profiles").upsert({ id: userId, username: result.state.profile?.name ?? "Traveler", timezone: tz }, { onConflict: "id" })
            } else if (action.type === "DELETE_QUEST") {
              await supabase.from("quests").delete().eq("id", action.id).eq("user_id", userId)
            }
            // Other XP/gold changes for authenticated are handled via RPC above, not direct upsert
          } catch (e: any) {
            console.warn("Supabase persistence failed:", e?.message)
          }
        })
      }

      return result.state
    })
  }, [state.quests, state.totalXp, state.profile])

  const today = localDateKey()
  const stats = useMemo(() => deriveStats(state, today), [state, today])

  const cooldownRemaining = useCallback(
    (key: string) => remainingMs(state.cooldowns[key] ?? 0, now || Date.now()),
    [state.cooldowns, now],
  )

  const dismissCelebration = useCallback(() => setCelebration(null), [])

  const value = useMemo<GameContextValue>(
    () => ({
      ready,
      state,
      stats,
      today,
      notice,
      error,
      dispatch,
      cooldownRemaining,
      clearNotice: () => {
        setNotice(null)
        setError(null)
      },
      celebration,
      dismissCelebration,
    }),
    [ready, state, stats, today, notice, error, dispatch, cooldownRemaining, celebration, dismissCelebration],
  )

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export function useGame() {
  const context = useContext(GameContext)
  if (!context) throw new Error("useGame must be used within GameProvider")
  return context
}
