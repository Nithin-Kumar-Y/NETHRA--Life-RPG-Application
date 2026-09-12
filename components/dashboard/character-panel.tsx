"use client"

import { AvatarMark } from "@/components/onboarding/village-gate"
import { useGame } from "@/components/game-provider"
import { XpBar } from "./xp-bar"
import { StreakBadge } from "./streak-badge"

export function CharacterPanel({ variant = "full" }: { variant?: "full" | "compact" }) {
  const { state, stats } = useGame()
  const profile = state.profile
  const name = profile?.name ?? "Traveler"
  const path = profile?.title ?? "Wanderer"
  const village = profile?.villageName ?? "Unnamed Village"
  const attributes = [
    { label: "Intellect", value: stats.intellect },
    { label: "Strength", value: stats.strength },
    { label: "Discipline", value: stats.discipline },
  ]

  if (variant === "compact") {
    return (
      <section className="glass glass-hover relative overflow-hidden rounded-3xl p-5 sm:p-6">
        <div className="flex gap-4">
          <div className="relative w-20 shrink-0 sm:w-24">
            <div className="absolute -inset-2 rounded-2xl bg-primary/20 blur-xl" aria-hidden="true" />
            <div className="relative overflow-hidden rounded-2xl ring-1 ring-border">
              <AvatarMark id={profile?.avatarId ?? "ronin"} name={name} />
              <span className="glass absolute left-1 top-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-gold">
                Lv {String(stats.level).padStart(2, "0")}
              </span>
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">{village}</p>
            <h3 className="font-display text-2xl font-bold tracking-wide sm:text-3xl">{name}</h3>
            <p className="text-sm text-primary">
              {path} · Lv {String(stats.level).padStart(2, "0")}
            </p>
            <div className="mt-3">
              <XpBar xp={stats.xpIntoLevel} xpToNext={stats.xpToNext} />
            </div>
          </div>
        </div>
        <dl className="mt-4 grid grid-cols-3 gap-2">
          {attributes.map((attr) => (
            <div key={attr.label} className="rounded-xl bg-background/30 px-2 py-2 text-center ring-1 ring-border">
              <dt className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{attr.label}</dt>
              <dd className="font-display text-lg font-semibold">{attr.value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-4">
          <StreakBadge days={stats.currentStreak} />
        </div>
      </section>
    )
  }

  return (
    <section
      aria-labelledby="character-heading"
      className="glass glass-hover relative overflow-hidden rounded-3xl p-6 sm:p-8"
    >
      <h2 id="character-heading" className="sr-only">
        Character overview
      </h2>

      <div className="flex flex-col gap-6 sm:flex-row sm:gap-8">
        <div className="relative mx-auto w-40 shrink-0 sm:mx-0 sm:w-48">
          <div className="absolute -inset-3 rounded-3xl bg-primary/20 blur-2xl" aria-hidden="true" />
          <div className="relative aspect-[3/4] overflow-hidden rounded-2xl ring-1 ring-border">
            <div className="size-full">
              <AvatarMark id={profile?.avatarId ?? "ronin"} name={name} />
            </div>
            <span className="glass absolute left-2 top-2 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-gold">
              Lv {String(stats.level).padStart(2, "0")}
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              {village} · Level {String(stats.level).padStart(2, "0")}
            </p>
            <h3 className="font-display text-4xl font-bold tracking-wide sm:text-5xl">{name}</h3>
            <p className="mt-1 text-sm text-primary">{path} · Path of Focus</p>
          </div>

          <dl className="grid gap-2">
            {attributes.map((attr) => (
              <div
                key={attr.label}
                className="flex items-center justify-between rounded-xl bg-background/30 px-3 py-2 ring-1 ring-border"
              >
                <dt className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  {attr.label}
                </dt>
                <dd className="font-display text-lg font-semibold">{attr.value}</dd>
              </div>
            ))}
          </dl>

          <XpBar xp={stats.xpIntoLevel} xpToNext={stats.xpToNext} />
        </div>
      </div>

      <div className="mt-6 flex justify-start">
        <StreakBadge days={stats.currentStreak} />
      </div>
    </section>
  )
}
