"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { localDateKey } from "@/lib/dates"
import { reduceGame, type GameAction } from "@/lib/game-reducer"
import { createInitialState, loadGameState, saveGameState } from "@/lib/game-state"
import { deriveStats, remainingMs } from "@/lib/rpg"
import type { DerivedStats, GameState } from "@/lib/types"

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
}

const GameContext = createContext<GameContextValue | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GameState>(createInitialState)
  const [ready, setReady] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [now, setNow] = useState(0)

  useEffect(() => {
    const loaded = loadGameState()
    const result = reduceGame(loaded, { type: "SYNC_DAY" })
    setState(result.state)
    saveGameState(result.state)
    setReady(true)
    setNow(Date.now())
  }, [])

  useEffect(() => {
    if (!ready) return
    saveGameState(state)
  }, [ready, state])

  useEffect(() => {
    const tick = () => {
      setNow(Date.now())
      setState((current) => reduceGame(current, { type: "SYNC_DAY" }).state)
    }
    const interval = window.setInterval(tick, 30_000)
    const onVisibility = () => {
      if (document.visibilityState === "visible") tick()
    }
    document.addEventListener("visibilitychange", onVisibility)
    return () => {
      window.clearInterval(interval)
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [])

  const dispatch = useCallback((action: GameAction) => {
    setState((current) => {
      const result = reduceGame(current, action)
      setError(result.error ?? null)
      setNotice(result.message ?? null)
      return result.state
    })
  }, [])

  const today = localDateKey()
  const stats = useMemo(() => deriveStats(state, today), [state, today])

  const cooldownRemaining = useCallback(
    (key: string) => remainingMs(state.cooldowns[key] ?? 0, now || Date.now()),
    [state.cooldowns, now],
  )

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
    }),
    [ready, state, stats, today, notice, error, dispatch, cooldownRemaining],
  )

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export function useGame() {
  const context = useContext(GameContext)
  if (!context) throw new Error("useGame must be used within GameProvider")
  return context
}
