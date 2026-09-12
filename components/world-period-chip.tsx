"use client"

import { Moon, Sun, Sunset } from "lucide-react"
import { useGame } from "@/components/game-provider"
import { useTimeOfDay } from "@/components/time-of-day-provider"
import { getTimeOfDayLabel } from "@/lib/timeOfDay"

export function WorldPeriodChip() {
  const { timeOfDay } = useTimeOfDay()
  const { state } = useGame()
  const PeriodIcon = timeOfDay === "morning" ? Sun : timeOfDay === "evening" ? Sunset : Moon
  const village = state.profile?.villageName ?? "Village"

  return (
    <span
      className="glass hidden items-center gap-2 rounded-full px-3 py-1.5 text-xs text-muted-foreground md:inline-flex"
      suppressHydrationWarning
    >
      <PeriodIcon className="size-4 text-primary" aria-hidden="true" />
      {getTimeOfDayLabel(timeOfDay)} · {village}
    </span>
  )
}
