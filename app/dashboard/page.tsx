"use client"

import { useMemo, useState } from "react"
import { MonthCalendar } from "@/components/calendar/month-calendar"
import { WeekXpChart } from "@/components/calendar/week-xp-chart"
import { CharacterPanel } from "@/components/dashboard/character-panel"
import { RecentRewards } from "@/components/dashboard/recent-rewards"
import { useGame } from "@/components/game-provider"
import { CreateQuestPanel } from "@/components/quests/create-quest-panel"
import { ActiveQuests } from "@/components/quests/active-quests"
import { startOfWeekMonday } from "@/lib/dates"
import { canShiftWeekForward, completionDates, weeklyXp } from "@/lib/rpg"

export default function DashboardPage() {
  const { state, stats, today } = useGame()
  const [month, setMonth] = useState(() => new Date())
  const [weekStart, setWeekStart] = useState(() => startOfWeekMonday(new Date()))
  const [composerOpen, setComposerOpen] = useState(false)

  const todayQuests = state.quests.filter((quest) => quest.scheduledDate === today && quest.status === "active")
  const fireDates = useMemo(() => completionDates(state.quests), [state.quests])
  const buckets = weeklyXp(state.quests, weekStart, today)

  return (
    <main className="mt-6 grid flex-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div className="flex flex-col gap-6">
        <CharacterPanel variant="compact" />

        <section className="glass rounded-2xl p-4">
          <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Today</p>
          <p className="mt-1 font-display text-2xl font-semibold">
            {stats.todayCompleted} / {stats.todayPlanned || 0} quests completed
          </p>
          <p className="text-gold">{stats.todayScorePercent}% · feeds Discipline</p>
        </section>

        <MonthCalendar
          compact
          month={month}
          onMonthChange={setMonth}
          selectedDate={today}
          onSelectDate={() => undefined}
          fireDates={fireDates}
          today={today}
        />

        <WeekXpChart
          buckets={buckets}
          canGoBack
          canGoForward={canShiftWeekForward(weekStart, today)}
          onPrev={() => {
            const next = new Date(weekStart)
            next.setDate(next.getDate() - 7)
            setWeekStart(next)
          }}
          onNext={() => {
            if (!canShiftWeekForward(weekStart, today)) return
            const next = new Date(weekStart)
            next.setDate(next.getDate() + 7)
            setWeekStart(next)
          }}
        />

        <RecentRewards />
      </div>

      <div className="flex flex-col gap-4">
        <ActiveQuests quests={todayQuests} />
        <button
          type="button"
          onClick={() => setComposerOpen((open) => !open)}
          className="press glass rounded-2xl px-4 py-3 text-sm font-medium"
        >
          {composerOpen ? "Hide quest composer" : "+ Add today's quest"}
        </button>
        {composerOpen ? <CreateQuestPanel scheduledDate={today} /> : null}
      </div>
    </main>
  )
}
