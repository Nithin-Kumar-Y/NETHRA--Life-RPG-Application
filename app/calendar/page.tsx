"use client"

import { useMemo, useState } from "react"
import { CalendarDays } from "lucide-react"
import { MonthCalendar } from "@/components/calendar/month-calendar"
import { WeekXpChart } from "@/components/calendar/week-xp-chart"
import { useGame } from "@/components/game-provider"
import { CreateQuestPanel } from "@/components/quests/create-quest-panel"
import { ActiveQuests } from "@/components/quests/active-quests"
import { formatDisplayDate, startOfWeekMonday } from "@/lib/dates"
import { canShiftWeekForward, completionDates, dailyScore, weeklyXp } from "@/lib/rpg"

export default function CalendarPage() {
  const { state, stats, today } = useGame()
  const [month, setMonth] = useState(() => new Date())
  const [selectedDate, setSelectedDate] = useState(today)
  const [weekStart, setWeekStart] = useState(() => startOfWeekMonday(new Date()))
  const fireDates = useMemo(() => completionDates(state.quests), [state.quests])
  const selectedQuests = state.quests.filter((quest) => quest.scheduledDate === selectedDate)
  const currentMonth = new Date()
  const canSchedule =
    selectedDate >= today &&
    selectedDate.startsWith(
      `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}`,
    )
  const score = dailyScore(state.quests, selectedDate === today ? today : selectedDate)
  const buckets = weeklyXp(state.quests, weekStart, today)

  return (
    <main className="mt-6 flex flex-1 flex-col gap-6">
      <section className="glass rounded-3xl p-6 sm:p-8">
        <div className="flex items-center gap-2">
          <CalendarDays className="size-4 text-primary" aria-hidden="true" />
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Village calendar</p>
        </div>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-wide sm:text-4xl">Calendar</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Days with at least one completed quest burn with fire. Future days in this month can hold scheduled quests.
        </p>
      </section>

      <MonthCalendar
        month={month}
        onMonthChange={setMonth}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        fireDates={fireDates}
        today={today}
      />

      <section className="glass rounded-3xl p-5 sm:p-6">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{formatDisplayDate(selectedDate)}</p>
        <h2 className="mt-1 font-display text-2xl font-semibold">
          {canSchedule ? "+ Add Quest" : "Recorded day"}
        </h2>
        {selectedDate === today ? (
          <p className="mt-1 text-sm text-muted-foreground">
            Today&apos;s score {stats.todayCompleted} / {stats.todayPlanned} · {stats.todayScorePercent}%
          </p>
        ) : (
          <p className="mt-1 text-sm text-muted-foreground">
            {score.completed} / {score.planned} completed
          </p>
        )}
      </section>

      {canSchedule ? <CreateQuestPanel scheduledDate={selectedDate} /> : null}
      <ActiveQuests quests={selectedQuests.filter((quest) => quest.status === "active")} heading="Scheduled quests" />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Stat label="Total quests completed" value={`${stats.totalQuestsCompleted}`} />
        <Stat label="Current streak" value={`${stats.currentStreak} days`} />
        <Stat label="Longest streak" value={`${stats.longestStreak} days`} />
        <Stat label="Total active days" value={`${stats.totalActiveDays} days`} />
        <Stat label="Today's XP" value={`+${stats.todayXp} XP`} />
        <Stat label="Today's score" value={`${stats.todayScorePercent}%`} />
      </div>

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
    </main>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass rounded-2xl p-4">
      <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl text-gold">{value}</p>
    </div>
  )
}
