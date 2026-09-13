"use client"

import { useState } from "react"
import { Sparkles } from "lucide-react"
import { useGame } from "@/components/game-provider"
import type { AvatarId, GenderPreference } from "@/lib/types"

const AVATARS: Array<{ id: AvatarId; label: string }> = [
  { id: "ronin", label: "Ronin" },
  { id: "seal-indigo", label: "Indigo seal" },
  { id: "seal-gold", label: "Gold seal" },
  { id: "seal-sakura", label: "Sakura seal" },
]

const GENDERS: Array<{ id: GenderPreference; label: string }> = [
  { id: "unspecified", label: "Unspecified" },
  { id: "male", label: "Male" },
  { id: "female", label: "Female" },
  { id: "nonbinary", label: "Non-binary" },
]

const PATHS = ["Wanderer", "Ronin", "Scholar", "Guardian"]

export function VillageGate() {
  const { ready, state, dispatch } = useGame()
  const [name, setName] = useState("")
  const [villageName, setVillageName] = useState("")
  const [gender, setGender] = useState<GenderPreference>("unspecified")
  const [title, setTitle] = useState("Ronin")
  const [avatarId, setAvatarId] = useState<AvatarId>("ronin")

  if (!ready || state.profile) return null

  const canSubmit = name.trim().length >= 2 && villageName.trim().length >= 2

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 p-4 backdrop-blur-md">
      <form
        className="glass relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl p-6 sm:p-8"
        onSubmit={(event) => {
          event.preventDefault()
          if (!canSubmit) return
          dispatch({
            type: "CREATE_PROFILE",
            profile: {
              name: name.trim(),
              villageName: villageName.trim(),
              gender,
              title,
              avatarId,
            },
          })
        }}
      >
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-transparent to-sakura/10 opacity-50" aria-hidden="true" />
        <div className="flex items-center gap-2 text-primary">
          <Sparkles className="size-4" aria-hidden="true" />
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Village founding · Step 1</p>
        </div>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-wide">Enter NETHRA</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Your real life is the RPG. Choose your name and your village — both are <span className="text-foreground">yours to define</span>. Nothing is forced.
        </p>

        <label className="mt-6 block text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Character name <span className="normal-case text-muted-foreground/60">(2+ letters)</span>
          <input
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-2 w-full rounded-xl bg-background/40 px-3 py-2.5 text-sm text-foreground ring-1 ring-border outline-none placeholder:text-muted-foreground/50 focus:ring-primary/50"
            placeholder="Aarav"
            autoComplete="nickname"
            maxLength={24}
          />
        </label>

        <label className="mt-4 block text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Village name <span className="normal-case text-muted-foreground/60">(2+ letters)</span>
          <input
            required
            value={villageName}
            onChange={(event) => setVillageName(event.target.value)}
            className="mt-2 w-full rounded-xl bg-background/40 px-3 py-2.5 text-sm text-foreground ring-1 ring-border outline-none placeholder:text-muted-foreground/50 focus:ring-primary/50"
            placeholder="Hoshikage"
            maxLength={28}
          />
        </label>

        <fieldset className="mt-5">
          <legend className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Gender</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {GENDERS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setGender(option.id)}
                className={`press rounded-full px-3 py-1.5 text-xs ring-1 ${
                  gender === option.id
                    ? "bg-primary/25 ring-primary/40"
                    : "bg-background/30 ring-border text-muted-foreground hover:text-foreground"
                }`}
                aria-pressed={gender === option.id}
              >
                {option.label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-4">
          <legend className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Path</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {PATHS.map((path) => (
              <button
                key={path}
                type="button"
                onClick={() => setTitle(path)}
                className={`press rounded-full px-3 py-1.5 text-xs ring-1 ${
                  title === path
                    ? "bg-primary/25 ring-primary/40"
                    : "bg-background/30 ring-border text-muted-foreground hover:text-foreground"
                }`}
                aria-pressed={title === path}
              >
                {path}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-4">
          <legend className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Avatar</legend>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {AVATARS.map((avatar) => (
              <button
                key={avatar.id}
                type="button"
                onClick={() => setAvatarId(avatar.id)}
                className={`press rounded-xl p-2 text-xs ring-1 ${
                  avatarId === avatar.id ? "bg-primary/25 ring-primary/40" : "bg-background/30 ring-border hover:bg-background/40"
                }`}
                aria-pressed={avatarId === avatar.id}
              >
                <AvatarMark id={avatar.id} name={name || "N"} />
                <span className="mt-2 block text-muted-foreground">{avatar.label}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <div className="mt-6 rounded-xl bg-background/20 p-3 ring-1 ring-border">
          <p className="text-xs text-muted-foreground">
            Preview: <span className="font-medium text-foreground">{name.trim() || "Your name"}</span> of{" "}
            <span className="font-medium text-foreground">{villageName.trim() || "your village"}</span> · {title}
          </p>
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className="press mt-4 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-b from-primary/90 to-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 ring-1 ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Found the village — Enter
        </button>
        <p className="mt-2 text-center text-[11px] text-muted-foreground">You can edit this later for 15 XP in Character.</p>
      </form>
    </div>
  )
}

export function AvatarMark({ id, name }: { id: AvatarId; name: string }) {
  const initial = name.trim().slice(0, 1).toUpperCase() || "N"
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ""
  if (id === "ronin") {
    return (
      <img
        src={`${basePath}/character/ronin.png`}
        alt=""
        className="size-full min-h-16 rounded-lg object-cover"
        loading="lazy"
      />
    )
  }
  const tone =
    id === "seal-gold"
      ? "from-gold/40 to-lantern/30"
      : id === "seal-sakura"
        ? "from-sakura/40 to-primary/20"
        : "from-primary/40 to-background/40"
  return (
    <div
      className={`flex size-full min-h-16 items-center justify-center rounded-lg bg-gradient-to-br ${tone} font-display text-2xl`}
    >
      {initial}
    </div>
  )
}

export { AVATARS, GENDERS, PATHS }
