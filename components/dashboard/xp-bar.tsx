interface XpBarProps {
  xp: number
  xpToNext: number
}

export function XpBar({ xp, xpToNext }: XpBarProps) {
  const pct = Math.min(100, Math.round((xp / xpToNext) * 100))

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          XP
        </span>
        <span className="font-display text-sm text-gold">
          {xp} <span className="text-muted-foreground">/ {xpToNext}</span>
        </span>
      </div>
      <div
        className="h-2.5 w-full overflow-hidden rounded-full bg-background/50 ring-1 ring-border"
        role="progressbar"
        aria-valuenow={xp}
        aria-valuemin={0}
        aria-valuemax={xpToNext}
        aria-label="Experience points progress"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary via-primary to-gold shadow-[0_0_18px_oklch(0.72_0.15_45/0.6)]"
          style={{ width: `${pct}%`, animation: "xp-fill 1.4s cubic-bezier(0.22,1,0.36,1)" }}
        />
      </div>
    </div>
  )
}
