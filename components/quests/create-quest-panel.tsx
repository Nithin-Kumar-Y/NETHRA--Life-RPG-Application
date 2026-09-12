"use client"

import { useEffect, useMemo, useState } from "react"
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
    const interval = window.setInterval(() => setTick((value) => value + 1), 1000)
    return () => window.clearInterval(interval)
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
              className="mt-2 w-full rounded-xl bg-background/40 px-3 py-2.5 text-sm ring-1 ring-border outline-none"
            >
              {sortedLibrary.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>

          <fieldset>
            <legend className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Genre</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {GENRES.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setGenre(item)}
                  className={`press rounded-full px-3 py-1.5 text-xs ring-1 ${
                    genre === item ? "bg-primary/25 ring-primary/40" : "bg-background/30 ring-border text-muted-foreground"
                  }`}
                >
                  {genreLabel(item)}
                </button>
              ))}
            </div>
          </fieldset>

          <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            {template.unit} ({template.minValue}–{template.maxValue})
            <input
              type="number"
              min={template.minValue}
              max={template.maxValue}
              value={quantity}
              onChange={(event) => setQuantity(Number(event.target.value))}
              className="mt-2 w-full rounded-xl bg-background/40 px-3 py-2.5 text-sm ring-1 ring-border outline-none"
            />
          </label>

          <div className="rounded-2xl bg-background/30 p-4 ring-1 ring-border">
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Projected reward</p>
            <p className="mt-1 font-display text-lg text-gold">
              +{projected.xp} XP · +{projected.gold} Gold
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {template.xpPerUnit} XP per {template.unit} · cooldown {template.cooldownMinutes}m
            </p>
          </div>

          {libraryCooldown > 0 ? (
            <p className="text-sm text-lantern">
              QUEST COOLDOWN {formatCountdown(libraryCooldown)} remaining
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
            className="press inline-flex items-center justify-center rounded-xl bg-gradient-to-b from-primary/90 to-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 ring-1 ring-primary/50 disabled:opacity-50"
          >
            Create Quest
          </button>
        </div>
      ) : (
        <div className="mt-4 grid gap-4">
          <fieldset>
            <legend className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Genre</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {GENRES.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setGenre(item)}
                  className={`press rounded-full px-3 py-1.5 text-xs ring-1 ${
                    genre === item ? "bg-primary/25 ring-primary/40" : "bg-background/30 ring-border text-muted-foreground"
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
              className="mt-2 w-full rounded-xl bg-background/40 px-3 py-2.5 text-sm ring-1 ring-border outline-none"
              placeholder="Tea ceremony practice"
            />
          </label>
          <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Description
            <textarea
              value={customDescription}
              onChange={(event) => setCustomDescription(event.target.value)}
              className="mt-2 min-h-20 w-full rounded-xl bg-background/40 px-3 py-2.5 text-sm ring-1 ring-border outline-none"
            />
          </label>
          <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Value / quantity (optional)
            <input
              value={customQuantity}
              onChange={(event) => setCustomQuantity(event.target.value)}
              className="mt-2 w-full rounded-xl bg-background/40 px-3 py-2.5 text-sm ring-1 ring-border outline-none"
              placeholder="30 minutes"
            />
          </label>
          <div className="rounded-2xl bg-background/30 p-4 ring-1 ring-border">
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Custom quest reward</p>
            <p className="mt-1 font-display text-lg text-gold">
              +{CUSTOM_QUEST_XP} XP · +{CUSTOM_QUEST_GOLD} Gold
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Custom quests grant a medium XP reward and low gold to keep the economy honest.
            </p>
          </div>
          {customCooldown > 0 ? (
            <p className="text-sm text-lantern">QUEST COOLDOWN {formatCountdown(customCooldown)} remaining</p>
          ) : null}
          <button
            type="button"
            disabled={customCooldown > 0}
            onClick={() => {
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
            className="press inline-flex items-center justify-center rounded-xl bg-gradient-to-b from-primary/90 to-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 ring-1 ring-primary/50 disabled:opacity-50"
          >
            Create Quest
          </button>
        </div>
      )}

      {(localError || error) && <p className="mt-3 text-sm text-destructive">{localError || error}</p>}
    </section>
  )
}
