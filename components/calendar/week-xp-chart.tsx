"use client"

import { ChevronLeft } from "lucide-react"

export function WeekXpChart({
  buckets,
  canGoBack,
  canGoForward,
  onPrev,
  onNext,
}: {
  buckets: Array<{ date: string; label: string; xp: number; isFuture: boolean }>
  canGoBack: boolean
  canGoForward: boolean
  onPrev: () => void
  onNext: () => void
}) {
  const max = Math.max(1, ...buckets.map((bucket) => bucket.xp))

  return (
    <section className="glass rounded-2xl p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-display text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
          Weekly XP
        </h3>
        <div className="flex gap-1">
          <button
            type="button"
            aria-label="Previous week"
            disabled={!canGoBack}
            onClick={onPrev}
            className="press glass inline-flex size-8 items-center justify-center rounded-full disabled:opacity-40"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Next week"
            disabled={!canGoForward}
            onClick={onNext}
            className="press glass inline-flex size-8 items-center justify-center rounded-full disabled:opacity-40"
          >
            <ChevronLeft className="size-4 rotate-180" />
          </button>
        </div>
      </div>
      <ul className="grid grid-cols-7 gap-2">
        {buckets.map((bucket) => (
          <li key={bucket.date} className="flex flex-col items-center gap-2">
            <div className="flex h-24 w-full items-end rounded-lg bg-background/30 p-1 ring-1 ring-border">
              <div
                className={`w-full rounded-md ${bucket.isFuture ? "bg-muted/40" : "bg-gradient-to-t from-primary to-gold"}`}
                style={{ height: `${Math.round((bucket.xp / max) * 100)}%` }}
              />
            </div>
            <span className="text-[10px] tracking-[0.12em] text-muted-foreground">{bucket.label}</span>
            <span className="text-[10px] text-gold">{bucket.xp} XP</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
