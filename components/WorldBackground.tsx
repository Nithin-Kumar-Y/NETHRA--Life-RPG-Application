"use client"

import { useState } from "react"
import { useTimeOfDay } from "@/components/time-of-day-provider"
import { TIME_OF_DAY_BACKGROUNDS, TIME_OF_DAY_PERIODS, type TimeOfDay } from "@/lib/timeOfDay"
import { cn } from "@/lib/utils"

const FALLBACKS: Record<TimeOfDay, string> = {
  morning: "from-sky-100/20 via-background/5 to-background/80",
  evening: "from-orange-400/20 via-amber-500/10 to-background/80",
  night: "from-indigo-900/30 via-violet-900/20 to-background/85",
}

export function WorldBackground() {
  const { timeOfDay } = useTimeOfDay()
  const [failed, setFailed] = useState<Record<string, boolean>>({})

  return (
    <div aria-hidden="true" className="fixed inset-0 -z-10 overflow-hidden bg-background">
      {/* Fallback gradients per period — visible if images missing or loading */}
      <div className={cn("absolute inset-0 bg-gradient-to-b transition-opacity duration-[1800ms]", FALLBACKS[timeOfDay])} />
      {/* Subtle sakura tint overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_0%,transparent_40%,oklch(0.12_0.03_265/0.65)_100%)]" />

      <div
        className="parallax-bg absolute inset-0"
        style={{ animation: "drift-parallax 32s ease-in-out infinite" }}
      >
        {TIME_OF_DAY_PERIODS.map((period) => (
          <img
            key={period}
            src={TIME_OF_DAY_BACKGROUNDS[period]}
            alt=""
            onError={() => setFailed((prev) => ({ ...prev, [period]: true }))}
            className={cn(
              "absolute inset-0 size-full object-cover transition-opacity duration-[1800ms] ease-in-out motion-reduce:transition-none",
              failed[period] ? "hidden" : period === timeOfDay ? "opacity-90" : "opacity-0",
            )}
            loading="eager"
          />
        ))}
      </div>

      {/* Readability overlays — keep text legible over any background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/15 to-background/75" />
      <div className="absolute inset-0 bg-background/10 backdrop-blur-[0.5px]" />
    </div>
  )
}
