"use client"

import { useState } from "react"
import { ScrollText } from "lucide-react"
import { quests } from "@/lib/data"
import { QuestCard } from "./quest-card"

export function ActiveQuests() {
  const [done, setDone] = useState<Set<string>>(new Set())

  function handleComplete(id: string) {
    setDone((prev) => new Set(prev).add(id))
  }

  return (
    <section aria-labelledby="quests-heading" className="flex flex-col gap-3">
      <div className="flex items-center gap-2 px-1">
        <ScrollText className="size-4 text-primary" aria-hidden="true" />
        <h2
          id="quests-heading"
          className="font-display text-sm font-semibold uppercase tracking-[0.25em]"
        >
          Active Quests
        </h2>
      </div>

      <div className="grid gap-3">
        {quests.map((quest) => (
          <QuestCard
            key={quest.id}
            quest={quest}
            completed={done.has(quest.id)}
            onComplete={handleComplete}
          />
        ))}
      </div>
    </section>
  )
}
