"use client"

import { useMemo, useState } from "react"
import { Flame, Target } from "lucide-react"
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

        <section className="glass relative overflow-hidden rounded-2xl p-4">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-gold/10 opacity-60" aria-hidden="true" />
          <div className="relative">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
                <Target className="size-3.5 text-primary" aria-hidden="true" /> Today&apos;s Path
              </p>
              <span className="rounded-full bg-primary/15 px-2.5 py-1 text-[11px] font-semibold tracking-[0.14em] text-primary ring-1 ring-primary/20">
                {stats.todayPlanned === 0 ? "No quests yet" : `${stats.todayCompleted}/${stats.todayPlanned} done`}
              </span>
            </div>
            <p className="mt-2 font-display text-2xl font-semibold leading-tight">
              {stats.todayCompleted} <span className="text-muted-foreground">/</span> {stats.todayPlanned || 0}{" "}
              <span className="text-lg font-normal text-muted-foreground">quests</span>
            </p>
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs">
                <span className="uppercase tracking-[0.16em] text-muted-foreground">Daily score</span>
                <span className="font-display font-semibold text-gold">{stats.todayScorePercent}%</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-background/40 ring-1 ring-border">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-gold transition-all duration-700"
                  style={{ width: `${stats.todayScorePercent}%` }}
                  role="progressbar"
                  aria-valuenow={stats.todayScorePercent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Today's completion score"
                />
              </div>
              <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                {stats.todayPlanned === 0 ? (
                  "Create your first quest to begin the path"
                ) : stats.todayScorePercent === 100 ? (
                  <>
                    <Flame className="size-3.5 text-gold" aria-hidden="true" /> Flawless — Discipline +
                  </>
                ) : stats.todayExpired > 0 ? (
                  `${stats.todayExpired} missed · complete remaining to raise score`
                ) : (
                  "Feeds Discipline"
                )}
              </p>
            </div>
          </div>
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
