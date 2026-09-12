"use client"

import { useTimeOfDay } from "@/components/time-of-day-provider"
import { TIME_OF_DAY_BACKGROUNDS, TIME_OF_DAY_PERIODS } from "@/lib/timeOfDay"
import { cn } from "@/lib/utils"

export function WorldBackground() {
  const { timeOfDay } = useTimeOfDay()

  return (
    <div aria-hidden="true" className="fixed inset-0 -z-10 overflow-hidden">
      <div
        className="parallax-bg absolute inset-0"
        style={{ animation: "drift-parallax 32s ease-in-out infinite" }}
      >
        {TIME_OF_DAY_PERIODS.map((period) => (
          <img
            key={period}
            src={TIME_OF_DAY_BACKGROUNDS[period]}
            alt=""
            className={cn(
              "absolute inset-0 size-full object-cover transition-opacity duration-[1800ms] ease-in-out motion-reduce:transition-none",
              period === timeOfDay ? "opacity-100" : "opacity-0",
            )}
          />
        ))}
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/20 to-background/80" />
      <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_0%,transparent_40%,oklch(0.12_0.03_265/0.65)_100%)]" />
    </div>
  )
}
