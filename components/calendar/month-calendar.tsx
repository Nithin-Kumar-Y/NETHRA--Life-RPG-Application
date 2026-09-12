"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { formatDisplayDate, localDateKey, monthGrid, monthTitle } from "@/lib/dates"

export function MonthCalendar({
  month,
  onMonthChange,
  selectedDate,
  onSelectDate,
  fireDates,
  today = localDateKey(),
  compact = false,
}: {
  month: Date
  onMonthChange: (next: Date) => void
  selectedDate: string
  onSelectDate: (date: string) => void
  fireDates: Set<string>
  today?: string
  compact?: boolean
}) {
  const cells = monthGrid(month)

  return (
    <section className={`glass ${compact ? "rounded-2xl p-4" : "rounded-3xl p-5 sm:p-6"}`}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <button
          type="button"
          aria-label="Previous month"
          className="press glass inline-flex size-9 items-center justify-center rounded-full"
          onClick={() => onMonthChange(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
        >
          <ChevronLeft className="size-4" />
        </button>
        <h2 className="font-display text-lg font-semibold tracking-[0.2em] sm:text-xl">
          {monthTitle(month)}
        </h2>
        <button
          type="button"
          aria-label="Next month"
          className="press glass inline-flex size-9 items-center justify-center rounded-full"
          onClick={() => onMonthChange(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        {["S", "M", "T", "W", "T", "F", "S"].map((label, index) => (
          <span key={`${label}-${index}`}>{label}</span>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-7 gap-1">
        {cells.map((cell) => {
          const isToday = cell.key === today
          const selected = cell.key === selectedDate
          const fire = fireDates.has(cell.key)
          const dayNumber = Number(cell.key.slice(-2))
          return (
            <button
              key={cell.key}
              type="button"
              disabled={!cell.inMonth}
              onClick={() => onSelectDate(cell.key)}
              className={`press min-h-10 rounded-xl text-sm ${
                !cell.inMonth
                  ? "opacity-0"
                  : selected
                    ? "bg-primary/30 ring-1 ring-primary/50"
                    : isToday
                      ? "bg-background/40 ring-1 ring-gold/40"
                      : "bg-background/20 ring-1 ring-border/70"
              }`}
            >
              {cell.inMonth ? (fire ? "🔥" : dayNumber) : ""}
            </button>
          )
        })}
      </div>

      {!compact ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Selected {formatDisplayDate(selectedDate)}
        </p>
      ) : null}
    </section>
  )
}
