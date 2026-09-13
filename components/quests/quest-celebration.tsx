"use client"

import { useEffect, useState } from "react"
import { Sparkles, Coins, Crown, X } from "lucide-react"
import { useGame } from "@/components/game-provider"
import { genreLabel } from "@/lib/quest-library"

export function QuestCelebration() {
  const { celebration, dismissCelebration } = useGame()
  const [showLevelUp, setShowLevelUp] = useState(false)

  useEffect(() => {
    if (!celebration) {
      setShowLevelUp(false)
      return
    }
    if (celebration.leveledUp) {
      let t: number | null = null
      try {
        t = window.setTimeout(() => setShowLevelUp(true), 900)
      } catch {}
      return () => {
        try {
          if (t) window.clearTimeout(t)
        } catch {}
      }
    }
  }, [celebration])

  useEffect(() => {
    if (!celebration) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismissCelebration()
    }
    try {
      document.addEventListener("keydown", onKey)
    } catch {}
    return () => {
      try {
        document.removeEventListener("keydown", onKey)
      } catch {}
    }
  }, [celebration, dismissCelebration])

  if (!celebration) return null

  const { quest, xp, gold, prevLevel, newLevel, leveledUp } = celebration

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Quest complete celebration"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close celebration"
        onClick={dismissCelebration}
        className="absolute inset-0 bg-background/60 backdrop-blur-md"
      />

      {/* Petal particles - lightweight, 10 petals */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 12 }).map((_, i) => (
          <span
            key={i}
            className="absolute top-0 rounded-full"
            style={
              {
                left: `${6 + i * 8}%`,
                width: 6 + (i % 3) * 4,
                height: 4 + (i % 3) * 3,
                background:
                  "radial-gradient(circle at 30% 30%, oklch(0.92 0.06 350 / 0.95), oklch(0.78 0.09 350 / 0.45))",
                borderRadius: "60% 0 60% 0",
                filter: "blur(0.2px)",
                animation: `petal-fall ${9 + (i % 4) * 2}s linear ${-(i * 0.7)}s infinite`,
                "--drift": `${(i % 2 === 0 ? -1 : 1) * (2 + i % 3)}vw`,
              } as unknown as React.CSSProperties
            }
          />
        ))}
      </div>

      {/* Card */}
      <div className="glass relative w-full max-w-md overflow-hidden rounded-3xl p-6 sm:p-8 shadow-2xl shadow-primary/20 ring-1 ring-white/10 animate-in fade-in zoom-in-95 duration-300">
        {/* subtle sakura glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-sakura/15 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-10 -bottom-10 size-40 rounded-full bg-primary/10 blur-3xl"
        />

        <button
          type="button"
          onClick={dismissCelebration}
          aria-label="Dismiss"
          className="press absolute right-3 top-3 inline-flex size-8 items-center justify-center rounded-full bg-background/30 ring-1 ring-border text-muted-foreground hover:text-foreground"
        >
          <X className="size-4" />
        </button>

        {!showLevelUp ? (
          <div className="relative flex flex-col items-center text-center">
            <p className="text-[11px] uppercase tracking-[0.32em] text-primary animate-pulse">
              Quest Complete
            </p>
            {/* Sakura icon */}
            <div className="mt-3 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/30 to-sakura/30 ring-1 ring-primary/20">
              <Sparkles className="size-7 text-gold" />
            </div>

            <h2 className="mt-4 font-display text-2xl font-bold tracking-wide sm:text-3xl">
              QUEST COMPLETE
            </h2>
            <p className="mt-2 font-display text-lg text-foreground/90">
              {quest.name}
            </p>
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              {genreLabel(quest.genre)} · {quest.description || `${quest.quantity ?? ""} ${quest.unit ?? ""}`.trim()}
            </p>

            <div className="mt-6 grid w-full grid-cols-2 gap-3">
              <div className="rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 p-4 ring-1 ring-primary/20">
                <p className="flex items-center justify-center gap-1.5 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  <Sparkles className="size-3.5 text-primary" /> XP
                </p>
                <p className="mt-1 font-display text-2xl font-bold text-gold">+{xp}</p>
              </div>
              <div className="rounded-2xl bg-gradient-to-br from-lantern/15 to-gold/10 p-4 ring-1 ring-gold/20">
                <p className="flex items-center justify-center gap-1.5 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  <Coins className="size-3.5 text-gold" /> Gold
                </p>
                <p className="mt-1 font-display text-2xl font-bold text-gold">+{gold}</p>
              </div>
            </div>

            {leveledUp ? (
              <p className="mt-5 text-xs uppercase tracking-[0.2em] text-primary animate-pulse">
                Level up incoming...
              </p>
            ) : (
              <button
                type="button"
                onClick={dismissCelebration}
                className="press mt-6 w-full rounded-xl bg-gradient-to-b from-primary/90 to-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 ring-1 ring-primary/50"
              >
                Continue
              </button>
            )}
            <p className="mt-3 text-[11px] text-muted-foreground">
              {leveledUp ? `Lv ${String(prevLevel).padStart(2, "0")} → Lv ${String(newLevel).padStart(2, "0")}` : "Rewards added to your journey"}
            </p>
          </div>
        ) : (
          <div className="relative flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-2 duration-500">
            <p className="text-[11px] uppercase tracking-[0.32em] text-gold">Level Up</p>
            <div className="mt-3 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-gold/30 to-lantern/30 ring-1 ring-gold/30 shadow-[0_0_30px_oklch(0.72_0.15_45/0.4)]">
              <Crown className="size-8 text-gold" />
            </div>
            <h2 className="mt-4 font-display text-3xl font-bold tracking-wide text-gold">
              LEVEL {String(newLevel).padStart(2, "0")}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {String(prevLevel).padStart(2, "0")} → {String(newLevel).padStart(2, "0")} · Path strengthened
            </p>
            <div className="mt-6 w-full rounded-2xl bg-background/30 p-4 ring-1 ring-gold/20">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                {quest.name} · +{xp} XP carried you forward
              </p>
            </div>
            <button
              type="button"
              onClick={dismissCelebration}
              className="press mt-6 w-full rounded-xl bg-gradient-to-b from-gold to-lantern px-4 py-3 text-sm font-semibold text-background shadow-lg shadow-gold/20 ring-1 ring-gold/50"
            >
              Embrace the ascent
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
