"use client"

import { ScrollText } from "lucide-react"
import { useGame } from "@/components/game-provider"
import { CreateQuestPanel } from "@/components/quests/create-quest-panel"
import { ActiveQuests } from "@/components/quests/active-quests"
import { formatDisplayDate, formatTime } from "@/lib/dates"
import { genreLabel } from "@/lib/quest-library"

export default function QuestsPage() {
  const { state, today } = useGame()
  const active = state.quests.filter((quest) => quest.status === "active" && quest.scheduledDate === today)
  const upcoming = state.quests.filter((quest) => quest.status === "active" && quest.scheduledDate > today)
  const history = state.quests.filter((quest) => quest.status === "completed" || quest.status === "expired")

  return (
    <main className="mt-6 flex flex-1 flex-col gap-6">
      <section className="glass rounded-3xl p-6 sm:p-8">
        <div className="flex items-center gap-2">
          <ScrollText className="size-4 text-primary" aria-hidden="true" />
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Quest board</p>
        </div>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-wide sm:text-4xl">Quests</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Choose from the library or write a custom quest. Nothing appears on today&apos;s board until you create it.
        </p>
      </section>

      <CreateQuestPanel scheduledDate={today} />
      <ActiveQuests quests={active} heading="Active Quests" />
      <ActiveQuests
        quests={upcoming}
        heading="Upcoming Quests"
        empty="No future quests scheduled this month."
      />

      <section className="flex flex-col gap-3">
        <h2 className="px-1 font-display text-sm font-semibold uppercase tracking-[0.25em]">Quest History</h2>
        {history.length === 0 ? (
          <p className="glass rounded-2xl p-4 text-sm text-muted-foreground">History is empty. Completed and expired quests remain here permanently.</p>
        ) : (
          <ul className="grid gap-3">
            {history.map((quest) => (
              <li key={quest.id} className="glass rounded-2xl p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-display text-lg font-semibold">{quest.name}</p>
                    <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      {genreLabel(quest.genre)} · {formatDisplayDate(quest.scheduledDate)}
                    </p>
                  </div>
                  <p className="text-sm text-gold">
                    {quest.status === "completed"
                      ? `+${quest.xpReward} XP · +${quest.goldReward} Gold`
                      : "Expired · no reward"}
                  </p>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {quest.status === "completed" && quest.completedAt
                    ? `Completed ${formatTime(quest.completedAt)}`
                    : "Missed at local midnight"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
