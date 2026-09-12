"use client"

import { ScrollText } from "lucide-react"
import { QuestCard } from "./quest-card"
import type { Quest } from "@/lib/types"

export function ActiveQuests({
  quests,
  heading = "Today's Active Quests",
  empty = "No quests on the board. Create one from the library or a custom path.",
}: {
  quests: Quest[]
  heading?: string
  empty?: string
}) {
  return (
    <section aria-labelledby="quests-heading" className="flex flex-col gap-3">
      <div className="flex items-center gap-2 px-1">
        <ScrollText className="size-4 text-primary" aria-hidden="true" />
        <h2
          id="quests-heading"
          className="font-display text-sm font-semibold uppercase tracking-[0.25em]"
        >
          {heading}
        </h2>
      </div>

      {quests.length === 0 ? (
        <p className="glass rounded-2xl p-4 text-sm text-muted-foreground">{empty}</p>
      ) : (
        <div className="grid gap-3">
          {quests.map((quest) => (
            <QuestCard key={quest.id} quest={quest} />
          ))}
        </div>
      )}
    </section>
  )
}
