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
import { getTimeOfDay, type TimeOfDay } from "@/lib/timeOfDay"

const DEV_OVERRIDE_KEY = "nethra.dev.timeOfDay"

type TimeOfDayContextValue = {
  timeOfDay: TimeOfDay
  override: TimeOfDay | null
  setOverride: (period: TimeOfDay | null) => void
}

const TimeOfDayContext = createContext<TimeOfDayContextValue | null>(null)

export function TimeOfDayProvider({ children }: { children: ReactNode }) {
  const [natural, setNatural] = useState<TimeOfDay>("night")
  const [override, setOverrideState] = useState<TimeOfDay | null>(null)

  useEffect(() => {
    const syncNatural = () => {
      setNatural(getTimeOfDay())
    }

    if (process.env.NODE_ENV === "development") {
      try {
        const stored = window.localStorage.getItem(DEV_OVERRIDE_KEY)
        if (stored === "morning" || stored === "evening" || stored === "night") {
          setOverrideState(stored)
        }
      } catch {}
    }

    syncNatural()
    const interval = window.setInterval(syncNatural, 30_000)
    const onVisibility = () => {
      if (document.visibilityState === "visible") syncNatural()
    }
    document.addEventListener("visibilitychange", onVisibility)

    return () => {
      window.clearInterval(interval)
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [])

  const setOverride = useCallback((period: TimeOfDay | null) => {
    setOverrideState(period)
    if (process.env.NODE_ENV !== "development") return
    try {
      if (period) {
        window.localStorage.setItem(DEV_OVERRIDE_KEY, period)
      } else {
        window.localStorage.removeItem(DEV_OVERRIDE_KEY)
      }
    } catch {}
  }, [])

  const value = useMemo<TimeOfDayContextValue>(
    () => ({
      timeOfDay: override ?? natural,
      override,
      setOverride,
    }),
    [natural, override, setOverride],
  )

  return <TimeOfDayContext.Provider value={value}>{children}</TimeOfDayContext.Provider>
}

export function useTimeOfDay() {
  const context = useContext(TimeOfDayContext)
  if (!context) {
    throw new Error("useTimeOfDay must be used within TimeOfDayProvider")
  }
  return context
}
