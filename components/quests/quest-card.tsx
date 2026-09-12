"use client"

import { Check, Clock, Coins, Sparkles, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { useGame } from "@/components/game-provider"
import { cooldownKey, genreLabel } from "@/lib/quest-library"
import { formatCountdown, levelFromTotalXp } from "@/lib/rpg"
import { formatDisplayDate } from "@/lib/dates"
import type { Quest, QuestGenre } from "@/lib/types"

const categoryStyles: Record<QuestGenre, string> = {
  INTELLECT: "text-primary ring-primary/40 bg-primary/15",
  STRENGTH: "text-lantern ring-lantern/40 bg-lantern/15",
  DISCIPLINE: "text-gold ring-gold/40 bg-gold/15",
}

export function QuestCard({ quest }: { quest: Quest }) {
  const { dispatch, today, cooldownRemaining } = useGame()
  const [, setTick] = useState(0)
  const cooldown = cooldownRemaining(cooldownKey(quest.templateId, quest.name))

  useEffect(() => {
    const interval = window.setInterval(() => setTick((value) => value + 1), 1000)
    return () => window.clearInterval(interval)
  }, [])

  const completed = quest.status === "completed"
  const expired = quest.status === "expired"
  const isToday = quest.scheduledDate === today
  const isUpcoming = quest.status === "active" && !isToday && quest.scheduledDate > today
  const canComplete = quest.status === "active" && isToday && cooldown === 0

  return (
    <article
      className={`glass glass-hover rounded-2xl p-4 transition-opacity ${
        completed ? "opacity-65" : expired ? "opacity-55" : ""
      } ${isUpcoming ? "border-dashed" : ""}`}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h4 className="font-display text-base font-semibold leading-tight flex items-center gap-1.5">
            {quest.name}
            {completed ? (
              <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] leading-none text-primary ring-1 ring-primary/20">✓</span>
            ) : null}
            {isUpcoming ? (
              <span className="rounded-full bg-background/40 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground ring-1 ring-border">Scheduled</span>
            ) : null}
          </h4>
          {quest.description ? (
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{quest.description}</p>
          ) : null}
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <span
              className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide ring-1 ${categoryStyles[quest.genre]}`}
            >
              {genreLabel(quest.genre)}
            </span>
            {quest.quantity && quest.unit ? (
              <span className="text-[11px] text-muted-foreground">
                {quest.quantity} {quest.unit}
              </span>
            ) : null}
            {isUpcoming ? (
              <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                <Clock className="size-3" aria-hidden="true" />
                {formatDisplayDate(quest.scheduledDate)}
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1 text-xs">
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-gold ring-1 ring-primary/20">
            <Sparkles className="size-3.5" aria-hidden="true" />+{quest.xpReward} XP
          </span>
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <Coins className="size-3.5" aria-hidden="true" />+{quest.goldReward} Gold
          </span>
        </div>
      </div>

      {quest.status === "active" && cooldown > 0 ? (
        <p className="mb-3 flex items-center justify-center gap-1.5 rounded-xl bg-lantern/10 px-3 py-2 text-xs font-medium uppercase tracking-[0.14em] text-lantern ring-1 ring-lantern/20">
          <Clock className="size-3.5" aria-hidden="true" />
          Cooldown {formatCountdown(cooldown)} remaining
        </p>
      ) : null}

      {isUpcoming ? (
        <div className="flex items-center gap-2">
          <div className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-background/30 px-4 py-2.5 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground ring-1 ring-border">
            <Clock className="size-4" aria-hidden="true" />
            Unlocks on {formatDisplayDate(quest.scheduledDate)}
          </div>
          <button
            type="button"
            aria-label={`Delete ${quest.name}`}
            onClick={() => dispatch({ type: "DELETE_QUEST", id: quest.id })}
            className="press glass inline-flex size-11 items-center justify-center rounded-xl text-muted-foreground hover:text-foreground"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      ) : expired ? (
        <p className="rounded-xl bg-background/20 px-3 py-2 text-center text-xs uppercase tracking-[0.16em] text-muted-foreground ring-1 ring-border">
          Missed · no reward · remains in history
        </p>
      ) : quest.status === "active" ? (
        <div className="flex gap-2">
          <button
            type="button"
            disabled={!canComplete}
            onClick={() => dispatch({ type: "COMPLETE_QUEST", id: quest.id })}
            className="press glass-hover inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-primary/90 to-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 ring-1 ring-primary/50 disabled:cursor-not-allowed disabled:from-secondary disabled:to-secondary disabled:text-muted-foreground disabled:shadow-none"
            aria-label={`Complete ${quest.name} for ${quest.xpReward} XP and ${quest.goldReward} gold`}
          >
            <Check className="size-4" aria-hidden="true" />
            {cooldown > 0 ? `Cooldown ${formatCountdown(cooldown)}` : "Complete"}
          </button>
          <button
            type="button"
            aria-label={`Delete ${quest.name}`}
            onClick={() => dispatch({ type: "DELETE_QUEST", id: quest.id })}
            className="press glass inline-flex size-11 items-center justify-center rounded-xl text-muted-foreground hover:text-foreground"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      ) : completed ? (
        <p className="flex items-center justify-center gap-1.5 rounded-xl bg-primary/10 px-3 py-2 text-xs font-medium uppercase tracking-[0.14em] text-primary ring-1 ring-primary/20">
          <Check className="size-3.5" aria-hidden="true" /> Completed
        </p>
      ) : null}
    </article>
  )
}
