"use client"

import { ScrollText, Clock, History, Sparkles } from "lucide-react"
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
      <section className="glass relative overflow-hidden rounded-3xl p-6 sm:p-8">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-sakura/10 opacity-50" aria-hidden="true" />
        <div className="relative">
          <div className="flex items-center gap-2">
            <ScrollText className="size-4 text-primary" aria-hidden="true" />
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Quest board</p>
          </div>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-wide sm:text-4xl">Quests</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Choose from the library or write a custom quest. Nothing appears on today&apos;s board until you create it.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.16em]">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1.5 text-primary ring-1 ring-primary/20">
              <span className="size-2 rounded-full bg-primary" aria-hidden="true" /> Intellect
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-lantern/15 px-3 py-1.5 text-lantern ring-1 ring-lantern/20">
              <span className="size-2 rounded-full bg-lantern" aria-hidden="true" /> Strength
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1.5 text-gold ring-1 ring-gold/20">
              <span className="size-2 rounded-full bg-gold" aria-hidden="true" /> Discipline
            </span>
          </div>
        </div>
      </section>

      <CreateQuestPanel scheduledDate={today} />

      <div className="relative">
        <ActiveQuests quests={active} heading="Active — Today" />
        {active.length > 0 ? (
          <p className="mt-2 px-1 text-xs text-muted-foreground">
            <Sparkles className="mr-1 inline size-3 text-gold" aria-hidden="true" />
            {active.length} {active.length === 1 ? "quest" : "quests"} ready to complete — taps grant XP & gold
          </p>
        ) : null}
      </div>

      <div className="relative">
        <ActiveQuests
          quests={upcoming}
          heading="Upcoming — Scheduled"
          empty="No future quests scheduled this month. Use the calendar to plan ahead."
        />
        {upcoming.length > 0 ? (
          <p className="mt-2 flex items-center gap-1.5 px-1 text-xs text-muted-foreground">
            <Clock className="size-3.5" aria-hidden="true" />
            Scheduled for future — will unlock on its day (cannot complete early)
          </p>
        ) : null}
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="flex items-center gap-2 px-1 font-display text-sm font-semibold uppercase tracking-[0.25em]">
          <History className="size-4 text-primary" aria-hidden="true" />
          History
          <span className="rounded-full bg-background/40 px-2 py-0.5 text-xs font-normal tracking-normal ring-1 ring-border">
            {history.length}
          </span>
        </h2>
        {history.length === 0 ? (
          <p className="glass rounded-2xl p-4 text-sm text-muted-foreground">History is empty. Completed and expired quests remain here permanently.</p>
        ) : (
          <ul className="grid gap-3">
            {history.map((quest) => (
              <li
                key={quest.id}
                className={`glass rounded-2xl p-4 ${quest.status === "expired" ? "opacity-70" : ""}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-display text-lg font-semibold flex items-center gap-2">
                      {quest.name}
                      {quest.status === "completed" ? (
                        <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs text-primary ring-1 ring-primary/20">Completed</span>
                      ) : (
                        <span className="rounded-full bg-background/30 px-2 py-0.5 text-xs text-muted-foreground ring-1 ring-border">Missed</span>
                      )}
                    </p>
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
