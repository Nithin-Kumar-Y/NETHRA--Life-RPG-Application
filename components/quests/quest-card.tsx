"use client"

import { Check, Coins, Sparkles } from "lucide-react"
import type { Quest, QuestCategory } from "@/lib/types"

const categoryStyles: Record<QuestCategory, string> = {
  Intellect: "text-primary ring-primary/40 bg-primary/15",
  Strength: "text-lantern ring-lantern/40 bg-lantern/15",
  Discipline: "text-gold ring-gold/40 bg-gold/15",
}

interface QuestCardProps {
  quest: Quest
  completed: boolean
  onComplete: (id: string) => void
}

export function QuestCard({ quest, completed, onComplete }: QuestCardProps) {
  return (
    <article
      className={`glass glass-hover rounded-2xl p-4 transition-opacity ${
        completed ? "opacity-55" : ""
      }`}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h4 className="font-display text-base font-semibold leading-tight">{quest.title}</h4>
          <span
            className={`mt-1.5 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide ring-1 ${categoryStyles[quest.category]}`}
          >
            {quest.category}
          </span>
        </div>
        <div className="flex flex-col items-end gap-1 text-xs">
          <span className="inline-flex items-center gap-1 text-gold">
            <Sparkles className="size-3.5" aria-hidden="true" />+{quest.xp} XP
          </span>
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <Coins className="size-3.5" aria-hidden="true" />+{quest.gold} Gold
          </span>
        </div>
      </div>

      <button
        type="button"
        disabled={completed}
        onClick={() => onComplete(quest.id)}
        aria-label={completed ? `${quest.title} completed` : `Complete quest ${quest.title}`}
        className="press glass-hover inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-primary/90 to-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 ring-1 ring-primary/50 disabled:cursor-default disabled:from-secondary disabled:to-secondary disabled:text-muted-foreground disabled:shadow-none"
      >
        <Check className="size-4" aria-hidden="true" />
        {completed ? "Completed" : "Complete"}
      </button>
    </article>
  )
}
