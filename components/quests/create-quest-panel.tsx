"use client"

import { useEffect, useMemo, useState } from "react"
import { Clock, Coins, Sparkles } from "lucide-react"
import { useGame } from "@/components/game-provider"
import {
  CUSTOM_QUEST_GOLD,
  CUSTOM_QUEST_XP,
  QUEST_LIBRARY,
  cooldownKey,
  genreLabel,
  getQuestTemplate,
  projectLibraryReward,
} from "@/lib/quest-library"
import { formatCountdown } from "@/lib/rpg"
import type { QuestGenre } from "@/lib/types"

const GENRES: QuestGenre[] = ["INTELLECT", "STRENGTH", "DISCIPLINE"]

const genreStyles: Record<QuestGenre, string> = {
  INTELLECT: "bg-primary/20 text-primary ring-primary/30",
  STRENGTH: "bg-lantern/20 text-lantern ring-lantern/30",
  DISCIPLINE: "bg-gold/20 text-gold ring-gold/30",
}

export function CreateQuestPanel({
  scheduledDate,
  onCreated,
}: {
  scheduledDate: string
  onCreated?: () => void
}) {
  const { dispatch, error, cooldownRemaining, clearNotice } = useGame()
  const [mode, setMode] = useState<"library" | "custom">("library")
  const [templateId, setTemplateId] = useState(QUEST_LIBRARY[0]?.id ?? "read")
  const [genre, setGenre] = useState<QuestGenre>("INTELLECT")
  const [quantity, setQuantity] = useState(30)
  const [customName, setCustomName] = useState("")
  const [customDescription, setCustomDescription] = useState("")
  const [customQuantity, setCustomQuantity] = useState("")
  const [localError, setLocalError] = useState<string | null>(null)
  const [, setTick] = useState(0)

  useEffect(() => {
    let interval: number | null = null
    try {
      interval = window.setInterval(() => setTick((value) => value + 1), 1000)
    } catch {}
    return () => {
      try {
        if (interval) window.clearInterval(interval)
      } catch {}
    }
  }, [])

  const template = getQuestTemplate(templateId)
  const projected = template ? projectLibraryReward(template, quantity) : { xp: 0, gold: 0 }
  const libraryCooldown = template ? cooldownRemaining(cooldownKey(template.id, template.name)) : 0
  const customCooldown = cooldownRemaining(cooldownKey(null, customName))

  useEffect(() => {
    if (template) setGenre(template.genre)
  }, [templateId, template])

  const sortedLibrary = useMemo(() => QUEST_LIBRARY, [])

  return (
    <section className="glass rounded-3xl p-5 sm:p-6">
      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Create quest</p>
      <h2 className="mt-1 font-display text-2xl font-semibold">Add to the board</h2>
      <p className="mt-1 text-xs text-muted-foreground">Pick a library quest or craft your own — reward is shown before you commit.</p>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => setMode("library")}
          className={`press rounded-xl px-3 py-2 text-xs font-medium ring-1 ${
            mode === "library" ? "bg-primary/25 ring-primary/40" : "bg-background/30 ring-border text-muted-foreground"
          }`}
        >
          Quest Library
        </button>
        <button
          type="button"
          onClick={() => setMode("custom")}
          className={`press rounded-xl px-3 py-2 text-xs font-medium ring-1 ${
            mode === "custom" ? "bg-primary/25 ring-primary/40" : "bg-background/30 ring-border text-muted-foreground"
          }`}
        >
          Custom Quest
        </button>
      </div>

      {mode === "library" && template ? (
        <div className="mt-4 grid gap-4">
          <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Choose quest
            <select
              value={templateId}
              onChange={(event) => setTemplateId(event.target.value)}
              className="mt-2 w-full rounded-xl bg-background/40 px-3 py-2.5 text-sm ring-1 ring-border outline-none focus:ring-primary/30"
            >
              {sortedLibrary.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} · {genreLabel(item.genre)}
                </option>
              ))}
            </select>
          </label>

          <fieldset>
            <legend className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Category</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {GENRES.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setGenre(item)}
                  className={`press rounded-full px-3 py-1.5 text-xs font-medium ring-1 ${
                    genre === item ? genreStyles[item] : "bg-background/30 ring-border text-muted-foreground"
                  }`}
                >
                  {genreLabel(item)}
                </button>
              ))}
            </div>
          </fieldset>

          <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Quantity — {template.unit} <span className="normal-case text-muted-foreground/70">({template.minValue}–{template.maxValue})</span>
            <input
              type="number"
              min={template.minValue}
              max={template.maxValue}
              value={quantity}
              onChange={(event) => setQuantity(Number(event.target.value))}
              className="mt-2 w-full rounded-xl bg-background/40 px-3 py-2.5 text-sm ring-1 ring-border outline-none focus:ring-primary/30"
              placeholder={`${template.minValue}`}
              aria-describedby="quantity-help"
            />
            <span id="quantity-help" className="mt-1 block text-[11px] normal-case tracking-normal text-muted-foreground">
              {quantity < template.minValue || quantity > template.maxValue
                ? `Must be between ${template.minValue} and ${template.maxValue} ${template.unit}`
                : `${template.name} — ${template.xpPerUnit} XP per ${template.unit}`}
            </span>
          </label>

          <div className="rounded-2xl bg-gradient-to-br from-primary/15 via-background/20 to-gold/10 p-4 ring-1 ring-border">
            <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              <Sparkles className="size-3.5 text-primary" aria-hidden="true" /> Reward Preview
            </p>
            <p className="mt-2 flex items-center gap-2 font-display text-xl font-bold text-gold">
              <span className="inline-flex items-center gap-1">
                <Sparkles className="size-4" aria-hidden="true" /> +{projected.xp} XP
              </span>
              <span className="text-muted-foreground">·</span>
              <span className="inline-flex items-center gap-1">
                <Coins className="size-4" aria-hidden="true" /> +{projected.gold} GOLD
              </span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {template.xpPerUnit} XP + {template.goldPerUnit} gold per {template.unit} · cooldown {template.cooldownMinutes}m
            </p>
          </div>

          {libraryCooldown > 0 ? (
            <p className="flex items-center justify-center gap-1.5 rounded-xl bg-lantern/10 px-3 py-2 text-sm font-medium text-lantern ring-1 ring-lantern/20">
              <Clock className="size-4" aria-hidden="true" />
              COOLDOWN {formatCountdown(libraryCooldown)} remaining
            </p>
          ) : null}

          <button
            type="button"
            disabled={libraryCooldown > 0}
            onClick={() => {
              clearNotice()
              setLocalError(null)
              if (quantity < template.minValue) {
                setLocalError(`Minimum allowed value is ${template.minValue} ${template.unit}.`)
                return
              }
              if (quantity > template.maxValue) {
                setLocalError(`Maximum allowed value is ${template.maxValue} ${template.unit}.`)
                return
              }
              dispatch({
                type: "CREATE_LIBRARY_QUEST",
                templateId: template.id,
                genre,
                quantity,
                scheduledDate,
              })
              onCreated?.()
            }}
            className="press inline-flex items-center justify-center rounded-xl bg-gradient-to-b from-primary/90 to-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 ring-1 ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Quest
          </button>
        </div>
      ) : (
        <div className="mt-4 grid gap-4">
          <fieldset>
            <legend className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Category</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {GENRES.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setGenre(item)}
                  className={`press rounded-full px-3 py-1.5 text-xs font-medium ring-1 ${
                    genre === item ? genreStyles[item] : "bg-background/30 ring-border text-muted-foreground"
                  }`}
                >
                  {genreLabel(item)}
                </button>
              ))}
            </div>
          </fieldset>
          <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Quest name
            <input
              value={customName}
              onChange={(event) => setCustomName(event.target.value)}
              className="mt-2 w-full rounded-xl bg-background/40 px-3 py-2.5 text-sm ring-1 ring-border outline-none focus:ring-primary/30"
              placeholder="Tea ceremony practice"
              maxLength={40}
            />
          </label>
          <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Description <span className="normal-case text-muted-foreground/60">(optional)</span>
            <textarea
              value={customDescription}
              onChange={(event) => setCustomDescription(event.target.value)}
              className="mt-2 min-h-20 w-full rounded-xl bg-background/40 px-3 py-2.5 text-sm ring-1 ring-border outline-none focus:ring-primary/30"
              placeholder="A quiet moment to practice..."
              maxLength={120}
            />
          </label>
          <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Value / quantity <span className="normal-case text-muted-foreground/60">(optional)</span>
            <input
              value={customQuantity}
              onChange={(event) => setCustomQuantity(event.target.value)}
              className="mt-2 w-full rounded-xl bg-background/40 px-3 py-2.5 text-sm ring-1 ring-border outline-none focus:ring-primary/30"
              placeholder="30 minutes"
            />
          </label>
          <div className="rounded-2xl bg-gradient-to-br from-gold/10 via-background/20 to-primary/10 p-4 ring-1 ring-border">
            <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              <Sparkles className="size-3.5 text-gold" aria-hidden="true" /> Custom Reward
            </p>
            <p className="mt-2 flex items-center gap-2 font-display text-lg font-bold text-gold">
              <span className="inline-flex items-center gap-1">+{CUSTOM_QUEST_XP} XP</span>
              <span className="text-muted-foreground">·</span>
              <span className="inline-flex items-center gap-1">
                <Coins className="size-4" aria-hidden="true" /> +{CUSTOM_QUEST_GOLD} GOLD
              </span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Fixed medium reward to keep the economy honest · cooldown {45}m
            </p>
          </div>
          {customCooldown > 0 ? (
            <p className="flex items-center justify-center gap-1.5 rounded-xl bg-lantern/10 px-3 py-2 text-sm font-medium text-lantern ring-1 ring-lantern/20">
              <Clock className="size-4" aria-hidden="true" />
              COOLDOWN {formatCountdown(customCooldown)} remaining
            </p>
          ) : null}
          <button
            type="button"
            disabled={customCooldown > 0 || !customName.trim()}
            onClick={() => {
              if (!customName.trim()) {
                setLocalError("Give the quest a name.")
                return
              }
              setLocalError(null)
              dispatch({
                type: "CREATE_CUSTOM_QUEST",
                name: customName,
                description: customDescription,
                genre,
                quantity: customQuantity ? Number.parseInt(customQuantity, 10) || null : null,
                unit: null,
                scheduledDate,
              })
              onCreated?.()
            }}
            className="press inline-flex items-center justify-center rounded-xl bg-gradient-to-b from-primary/90 to-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 ring-1 ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Custom Quest
          </button>
        </div>
      )}

      {(localError || error) && (
        <p className="mt-3 rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive ring-1 ring-destructive/20">
          {localError || error}
        </p>
      )}
    </section>
  )
}
