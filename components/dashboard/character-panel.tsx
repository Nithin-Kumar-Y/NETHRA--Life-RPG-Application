import { character, streakDays } from "@/lib/data"
import { XpBar } from "./xp-bar"
import { StreakBadge } from "./streak-badge"

export function CharacterPanel() {
  return (
    <section
      aria-labelledby="character-heading"
      className="glass glass-hover relative overflow-hidden rounded-3xl p-6 sm:p-8"
    >
      <h2 id="character-heading" className="sr-only">
        Character overview
      </h2>

      <div className="flex flex-col gap-6 sm:flex-row sm:gap-8">
        {/* Portrait */}
        <div className="relative mx-auto w-40 shrink-0 sm:mx-0 sm:w-48">
          <div className="absolute -inset-3 rounded-3xl bg-primary/20 blur-2xl" aria-hidden="true" />
          <div className="relative aspect-[3/4] overflow-hidden rounded-2xl ring-1 ring-border">
            <img
              src="/character/ronin.png"
              alt={`${character.name}, a ${character.path} class hero`}
              className="size-full object-cover"
            />
            <span className="glass absolute left-2 top-2 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-gold">
              Lv {String(character.level).padStart(2, "0")}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-1 flex-col justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Level {String(character.level).padStart(2, "0")}
            </p>
            <h3 className="font-display text-4xl font-bold tracking-wide sm:text-5xl">
              {character.name}
            </h3>
            <p className="mt-1 text-sm text-primary">{character.path} · Path of Focus</p>
          </div>

          <dl className="grid gap-2">
            {character.attributes.map((attr) => (
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

          <XpBar xp={character.xp} xpToNext={character.xpToNext} />
        </div>
      </div>

      <div className="mt-6 flex justify-start">
        <StreakBadge days={streakDays} />
      </div>
    </section>
  )
}
