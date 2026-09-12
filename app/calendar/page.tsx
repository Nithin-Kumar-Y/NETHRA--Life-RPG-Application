"use client"

import { useMemo, useState } from "react"
import { CalendarDays, Flame, Trophy, Target, MapPinned, Sparkles, Clock } from "lucide-react"
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
      <section className="glass relative overflow-hidden rounded-3xl p-6 sm:p-8">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-gold/10 opacity-50" aria-hidden="true" />
        <div className="relative">
          <div className="flex items-center gap-2">
            <CalendarDays className="size-4 text-primary" aria-hidden="true" />
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Village calendar</p>
          </div>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-wide sm:text-4xl">Calendar</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Days with at least one completed quest burn with <span className="text-gold">🔥 fire</span>. Future days in this month can hold scheduled quests. Tap a day to plan.
          </p>
        </div>
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
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="flex items-center gap-1.5 text-xs uppercase tracking-[0.3em] text-muted-foreground">
              <Clock className="size-3.5 text-primary" aria-hidden="true" />
              {formatDisplayDate(selectedDate)}
            </p>
            <h2 className="mt-1 font-display text-2xl font-semibold">
              {canSchedule ? "+ Add Quest" : "Recorded day"}
            </h2>
            {selectedDate === today ? (
              <p className="mt-1 text-sm text-muted-foreground">
                Today&apos;s score {stats.todayCompleted} / {stats.todayPlanned} · {stats.todayScorePercent}% · 🔥 {fireDates.size} fire days
              </p>
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">
                {score.completed} / {score.planned} completed {score.expired ? `· ${score.expired} missed` : ""} {fireDates.has(selectedDate) ? "· 🔥" : ""}
              </p>
            )}
          </div>
          {fireDates.has(selectedDate) ? (
            <span className="flex size-9 items-center justify-center rounded-full bg-gold/15 text-lg ring-1 ring-gold/20" aria-hidden="true">
              🔥
            </span>
          ) : null}
        </div>
        {!canSchedule && selectedDate !== today ? (
          <p className="mt-3 rounded-xl bg-background/30 px-3 py-2 text-xs text-muted-foreground ring-1 ring-border">
            This day is in the past — history is locked, but 🔥 remains.
          </p>
        ) : null}
      </section>

      {canSchedule ? <CreateQuestPanel scheduledDate={selectedDate} /> : null}
      <ActiveQuests quests={selectedQuests.filter((quest) => quest.status === "active")} heading="Scheduled quests" />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Stat icon={<Trophy className="size-4 text-gold" />} label="Total quests completed" value={`${stats.totalQuestsCompleted}`} />
        <Stat icon={<Flame className="size-4 text-lantern" />} label="Current streak" value={`${stats.currentStreak} days`} />
        <Stat icon={<Trophy className="size-4 text-gold" />} label="Longest streak" value={`${stats.longestStreak} days`} />
        <Stat icon={<MapPinned className="size-4 text-primary" />} label="Total active days" value={`${stats.totalActiveDays} days`} />
        <Stat icon={<Sparkles className="size-4 text-primary" />} label="Today's XP" value={`+${stats.todayXp} XP`} />
        <Stat icon={<Target className="size-4 text-gold" />} label="Today's score" value={`${stats.todayScorePercent}%`} />
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
      <p className="px-1 text-xs text-muted-foreground">
        Weekly XP — future weeks are locked. Browse past weeks to see your path.
      </p>
    </main>
  )
}

function Stat({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="glass flex items-center gap-3 rounded-2xl p-4">
      <span className="flex size-9 items-center justify-center rounded-xl bg-background/40 ring-1 ring-border">{icon}</span>
      <div>
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
        <p className="font-display text-xl text-gold">{value}</p>
      </div>
    </div>
  )
}
