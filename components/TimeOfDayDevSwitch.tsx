"use client"

import { useTimeOfDay } from "@/components/time-of-day-provider"
import { TIME_OF_DAY_PERIODS, getTimeOfDayLabel, type TimeOfDay } from "@/lib/timeOfDay"

export function TimeOfDayDevSwitch() {
  if (process.env.NODE_ENV !== "development") return null

  return <DevSwitchControl />
}

function DevSwitchControl() {
  const { override, setOverride } = useTimeOfDay()

  const options: Array<{ id: TimeOfDay | "auto"; label: string }> = [
    { id: "auto", label: "Auto" },
    ...TIME_OF_DAY_PERIODS.map((period) => ({
      id: period,
      label: getTimeOfDayLabel(period),
    })),
  ]

  return (
    <div className="glass fixed bottom-20 right-3 z-40 rounded-2xl p-2 sm:right-4 lg:bottom-6">
      <p className="px-2 pb-1 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        Dev time
      </p>
      <div className="flex flex-col gap-0.5">
        {options.map((option) => {
          const isActive = option.id === "auto" ? override === null : override === option.id
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setOverride(option.id === "auto" ? null : option.id)}
              className={`press rounded-xl px-3 py-1.5 text-left text-[11px] font-medium transition-colors ${
                isActive
                  ? "bg-primary/25 text-foreground ring-1 ring-primary/40"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
