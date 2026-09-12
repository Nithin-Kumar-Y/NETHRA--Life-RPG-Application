"use client"

import { useEffect, useState } from "react"
import { Award, Coins, Flame, MapPinned, Medal, ScrollText, Sparkles, Target, Trophy } from "lucide-react"
import { CharacterPanel } from "@/components/dashboard/character-panel"
import { useGame } from "@/components/game-provider"
import { ACHIEVEMENTS, JOURNEY_MILESTONES } from "@/lib/achievements"
import { AVATARS, GENDERS, PATHS } from "@/components/onboarding/village-gate"
import { PROFILE_EDIT_XP_COST } from "@/lib/quest-library"
import type { AvatarId, GenderPreference } from "@/lib/types"

export default function CharacterPage() {
  const { state, stats, dispatch, error, notice } = useGame()
  const profile = state.profile
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(profile?.name ?? "")
  const [villageName, setVillageName] = useState(profile?.villageName ?? "")
  const [gender, setGender] = useState<GenderPreference>(profile?.gender ?? "unspecified")
  const [title, setTitle] = useState(profile?.title ?? "Ronin")
  const [avatarId, setAvatarId] = useState<AvatarId>(profile?.avatarId ?? "ronin")
  const [journeyOpen, setJourneyOpen] = useState(true)
  const [achievementsOpen, setAchievementsOpen] = useState(true)

  useEffect(() => {
    if (!profile) return
    setName(profile.name)
    setVillageName(profile.villageName)
    setGender(profile.gender)
    setTitle(profile.title)
    setAvatarId(profile.avatarId)
  }, [profile])

  const extraStats: Array<[string, string, React.ReactNode]> = [
    ["Current streak", `${stats.currentStreak} days`, <Flame key="cs" className="size-4 text-lantern" />],
    ["Longest streak", `${stats.longestStreak} days`, <Trophy key="ls" className="size-4 text-gold" />],
    ["Active days", `${stats.totalActiveDays}`, <MapPinned key="ad" className="size-4 text-primary" />],
    ["Quests completed", `${stats.totalQuestsCompleted}`, <ScrollText key="qc" className="size-4 text-primary" />],
    ["Gold", `${stats.gold}`, <Coins key="g" className="size-4 text-gold" />],
    ["Level", `${stats.level}`, <Medal key="lv" className="size-4 text-gold" />],
  ]

  return (
    <main className="mt-6 flex flex-1 flex-col gap-6">
      <CharacterPanel />

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {extraStats.map(([label, value, icon]) => (
          <div key={label} className="glass flex items-center gap-3 rounded-2xl p-4">
            <span className="flex size-9 items-center justify-center rounded-xl bg-background/40 ring-1 ring-border">{icon}</span>
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
              <p className="font-display text-xl">{value}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <div className="glass rounded-2xl p-4">
          <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            <Sparkles className="size-3.5 text-primary" aria-hidden="true" /> Intellect
          </p>
          <p className="mt-1 font-display text-2xl">{stats.intellect}</p>
          <p className="text-xs text-muted-foreground">{stats.intellectXp} XP</p>
        </div>
        <div className="glass rounded-2xl p-4">
          <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            <Award className="size-3.5 text-lantern" aria-hidden="true" /> Strength
          </p>
          <p className="mt-1 font-display text-2xl">{stats.strength}</p>
          <p className="text-xs text-muted-foreground">{stats.strengthXp} XP</p>
        </div>
        <div className="glass rounded-2xl p-4">
          <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            <Target className="size-3.5 text-gold" aria-hidden="true" /> Discipline
          </p>
          <p className="mt-1 font-display text-2xl">{stats.discipline}</p>
          <p className="text-xs text-muted-foreground">{stats.disciplineXp} XP</p>
        </div>
      </section>

      <section className="glass rounded-3xl p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Dossier</p>
            <h2 className="font-display text-2xl font-semibold">Edit profile</h2>
            <p className="text-sm text-muted-foreground">
              Changing your name, village, or avatar costs {PROFILE_EDIT_XP_COST} XP. Current XP: {stats.totalXp}
            </p>
          </div>
          <button type="button" className="press glass rounded-xl px-3 py-2 text-sm" onClick={() => setEditing((open) => !open)}>
            {editing ? "Close" : "Edit"}
          </button>
        </div>
        {editing ? (
          <form
            className="mt-4 grid gap-3"
            onSubmit={(event) => {
              event.preventDefault()
              dispatch({
                type: "UPDATE_PROFILE",
                profile: { name, villageName, gender, title, avatarId },
              })
            }}
          >
            <label className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Character name
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your name"
                className="mt-1 w-full rounded-xl bg-background/40 px-3 py-2.5 text-sm ring-1 ring-border outline-none focus:ring-primary/30"
                maxLength={30}
              />
            </label>
            <label className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Village name
              <input
                value={villageName}
                onChange={(event) => setVillageName(event.target.value)}
                placeholder="Your village"
                className="mt-1 w-full rounded-xl bg-background/40 px-3 py-2.5 text-sm ring-1 ring-border outline-none focus:ring-primary/30"
                maxLength={30}
              />
            </label>
            <fieldset>
              <legend className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Gender</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {GENDERS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setGender(option.id)}
                    className={`press rounded-full px-3 py-1.5 text-xs ring-1 ${gender === option.id ? "bg-primary/25 ring-primary/40" : "bg-background/30 ring-border text-muted-foreground"}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Path</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {PATHS.map((path) => (
                  <button
                    key={path}
                    type="button"
                    onClick={() => setTitle(path)}
                    className={`press rounded-full px-3 py-1.5 text-xs ring-1 ${title === path ? "bg-primary/25 ring-primary/40" : "bg-background/30 ring-border text-muted-foreground"}`}
                  >
                    {path}
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Avatar</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {AVATARS.map((avatar) => (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => setAvatarId(avatar.id)}
                    className={`press rounded-full px-3 py-1.5 text-xs ring-1 ${avatarId === avatar.id ? "bg-primary/25 ring-primary/40" : "bg-background/30 ring-border text-muted-foreground"}`}
                  >
                    {avatar.label}
                  </button>
                ))}
              </div>
            </fieldset>
            <button
              type="submit"
              disabled={stats.totalXp < PROFILE_EDIT_XP_COST}
              className="press rounded-xl bg-gradient-to-b from-primary/90 to-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save (−{PROFILE_EDIT_XP_COST} XP)
            </button>
            {error || notice ? <p className={`text-sm ${error ? "text-destructive" : "text-gold"}`}>{error || notice}</p> : null}
          </form>
        ) : null}
      </section>

      <section className="glass rounded-3xl p-6">
        <button type="button" className="flex w-full items-center justify-between" onClick={() => setJourneyOpen((open) => !open)}>
          <h2 className="font-display flex items-center gap-2 text-2xl font-semibold">
            <MapPinned className="size-5 text-primary" aria-hidden="true" /> Journey
          </h2>
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{journeyOpen ? "Hide" : "Show"}</span>
        </button>
        {journeyOpen ? (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {JOURNEY_MILESTONES.map((milestone) => {
              const current = stats[milestone.field]
              const done = current >= milestone.target
              const pct = Math.min(100, Math.round((current / milestone.target) * 100))
              return (
                <li key={milestone.id} className={`rounded-2xl p-4 ring-1 ${done ? "bg-primary/10 ring-primary/30" : "bg-background/30 ring-border"}`}>
                  <div className="flex items-center justify-between">
                    <p className="font-display text-base">{milestone.name}</p>
                    {done ? <Medal className="size-4 text-gold" aria-hidden="true" /> : null}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {Math.min(current, milestone.target)} / {milestone.target}
                  </p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-background/40 ring-1 ring-border">
                    <div className={`h-full rounded-full ${done ? "bg-gradient-to-r from-primary to-gold" : "bg-primary/40"}`} style={{ width: `${pct}%` }} />
                  </div>
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-gold">{done ? "Reached" : `${pct}%`}</p>
                </li>
              )
            })}
          </ul>
        ) : null}
      </section>

      <section className="glass rounded-3xl p-6">
        <button type="button" className="flex w-full items-center justify-between" onClick={() => setAchievementsOpen((open) => !open)}>
          <h2 className="font-display flex items-center gap-2 text-2xl font-semibold">
            <Award className="size-5 text-gold" aria-hidden="true" /> Achievements
          </h2>
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{achievementsOpen ? "Hide" : "Show"}</span>
        </button>
        {achievementsOpen ? (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {ACHIEVEMENTS.map((achievement) => {
              const unlocked = state.unlockedAchievementIds.includes(achievement.id)
              return (
                <li key={achievement.id} className={`rounded-2xl p-4 ring-1 ${unlocked ? "bg-gold/10 ring-gold/30" : "bg-background/30 ring-border opacity-70"}`}>
                  <div className="flex items-center gap-2">
                    <Trophy className={`size-4 ${unlocked ? "text-gold" : "text-muted-foreground"}`} aria-hidden="true" />
                    <p className="font-display text-base">{achievement.name}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.16em] text-gold">{unlocked ? "Unlocked" : "Locked"}</p>
                </li>
              )
            })}
          </ul>
        ) : null}
      </section>
    </main>
  )
}
