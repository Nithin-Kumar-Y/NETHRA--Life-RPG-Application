"use client"

import { Check, Coins, Sparkles, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { useGame } from "@/components/game-provider"
import { cooldownKey, genreLabel } from "@/lib/quest-library"
import { formatCountdown } from "@/lib/rpg"
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
  const canComplete = quest.status === "active" && quest.scheduledDate === today && cooldown === 0

  return (
    <article
      className={`glass glass-hover rounded-2xl p-4 transition-opacity ${
        completed || expired ? "opacity-55" : ""
      }`}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h4 className="font-display text-base font-semibold leading-tight">{quest.name}</h4>
          {quest.description ? (
            <p className="mt-1 text-xs text-muted-foreground">{quest.description}</p>
          ) : null}
          <span
            className={`mt-1.5 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide ring-1 ${categoryStyles[quest.genre]}`}
          >
            {genreLabel(quest.genre)}
          </span>
        </div>
        <div className="flex flex-col items-end gap-1 text-xs">
          <span className="inline-flex items-center gap-1 text-gold">
            <Sparkles className="size-3.5" aria-hidden="true" />+{quest.xpReward} XP
          </span>
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <Coins className="size-3.5" aria-hidden="true" />+{quest.goldReward} Gold
          </span>
        </div>
      </div>

      {quest.status === "active" && cooldown > 0 ? (
        <p className="mb-3 text-center text-xs uppercase tracking-[0.16em] text-lantern">
          Quest cooldown {formatCountdown(cooldown)} remaining
        </p>
      ) : null}

      {expired ? (
        <p className="text-center text-xs uppercase tracking-[0.16em] text-muted-foreground">Missed / expired</p>
      ) : null}

      {quest.status === "active" ? (
        <div className="flex gap-2">
          <button
            type="button"
            disabled={!canComplete}
            onClick={() => dispatch({ type: "COMPLETE_QUEST", id: quest.id })}
            className="press glass-hover inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-primary/90 to-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 ring-1 ring-primary/50 disabled:cursor-default disabled:from-secondary disabled:to-secondary disabled:text-muted-foreground disabled:shadow-none"
          >
            <Check className="size-4" aria-hidden="true" />
            Complete
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
        <p className="text-center text-xs uppercase tracking-[0.16em] text-muted-foreground">Completed</p>
      ) : null}
    </article>
  )
}
