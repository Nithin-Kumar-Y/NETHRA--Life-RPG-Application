"use client"

import { useEffect, useState } from "react"
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

  const extraStats = [
    ["Current streak", `${stats.currentStreak} days`],
    ["Longest streak", `${stats.longestStreak} days`],
    ["Total active days", `${stats.totalActiveDays}`],
    ["Quests completed", `${stats.totalQuestsCompleted}`],
    ["Total XP earned", `${stats.totalXp}`],
    ["Total gold earned", `${stats.totalGoldEarned}`],
  ]

  return (
    <main className="mt-6 flex flex-1 flex-col gap-6">
      <CharacterPanel />

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {extraStats.map(([label, value]) => (
          <div key={label} className="glass rounded-2xl p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
            <p className="mt-1 font-display text-2xl">{value}</p>
          </div>
        ))}
      </section>

      <section className="glass rounded-3xl p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Dossier</p>
            <h2 className="font-display text-2xl font-semibold">Edit profile</h2>
            <p className="text-sm text-muted-foreground">Changing your name, village, or avatar costs {PROFILE_EDIT_XP_COST} XP.</p>
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
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="rounded-xl bg-background/40 px-3 py-2.5 text-sm ring-1 ring-border outline-none"
            />
            <input
              value={villageName}
              onChange={(event) => setVillageName(event.target.value)}
              className="rounded-xl bg-background/40 px-3 py-2.5 text-sm ring-1 ring-border outline-none"
            />
            <div className="flex flex-wrap gap-2">
              {GENDERS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setGender(option.id)}
                  className={`press rounded-full px-3 py-1.5 text-xs ring-1 ${gender === option.id ? "bg-primary/25 ring-primary/40" : "ring-border"}`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {PATHS.map((path) => (
                <button
                  key={path}
                  type="button"
                  onClick={() => setTitle(path)}
                  className={`press rounded-full px-3 py-1.5 text-xs ring-1 ${title === path ? "bg-primary/25 ring-primary/40" : "ring-border"}`}
                >
                  {path}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {AVATARS.map((avatar) => (
                <button
                  key={avatar.id}
                  type="button"
                  onClick={() => setAvatarId(avatar.id)}
                  className={`press rounded-full px-3 py-1.5 text-xs ring-1 ${avatarId === avatar.id ? "bg-primary/25 ring-primary/40" : "ring-border"}`}
                >
                  {avatar.label}
                </button>
              ))}
            </div>
            <button
              type="submit"
              className="press rounded-xl bg-gradient-to-b from-primary/90 to-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              Save (−{PROFILE_EDIT_XP_COST} XP)
            </button>
            {error || notice ? <p className="text-sm text-gold">{error || notice}</p> : null}
          </form>
        ) : null}
      </section>

      <section className="glass rounded-3xl p-6">
        <button type="button" className="flex w-full items-center justify-between" onClick={() => setJourneyOpen((open) => !open)}>
          <h2 className="font-display text-2xl font-semibold">Journey</h2>
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{journeyOpen ? "Hide" : "Show"}</span>
        </button>
        {journeyOpen ? (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {JOURNEY_MILESTONES.map((milestone) => {
              const current = stats[milestone.field]
              const done = current >= milestone.target
              return (
                <li key={milestone.id} className="rounded-2xl bg-background/30 p-4 ring-1 ring-border">
                  <p className="font-display text-lg">{milestone.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {Math.min(current, milestone.target)} / {milestone.target}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-gold">{done ? "Reached" : "In progress"}</p>
                </li>
              )
            })}
          </ul>
        ) : null}
      </section>

      <section className="glass rounded-3xl p-6">
        <button type="button" className="flex w-full items-center justify-between" onClick={() => setAchievementsOpen((open) => !open)}>
          <h2 className="font-display text-2xl font-semibold">Achievements</h2>
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{achievementsOpen ? "Hide" : "Show"}</span>
        </button>
        {achievementsOpen ? (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {ACHIEVEMENTS.map((achievement) => {
              const unlocked = state.unlockedAchievementIds.includes(achievement.id)
              return (
                <li key={achievement.id} className={`rounded-2xl p-4 ring-1 ${unlocked ? "bg-primary/15 ring-primary/40" : "bg-background/30 ring-border opacity-70"}`}>
                  <p className="font-display text-lg">{achievement.name}</p>
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
