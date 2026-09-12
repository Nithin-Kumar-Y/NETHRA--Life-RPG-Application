import { Flame } from "lucide-react"

export function StreakBadge({ days }: { days: number }) {
  return (
    <div className="glass inline-flex items-center gap-2 rounded-full px-4 py-2">
      <Flame className="size-5 text-lantern drop-shadow-[0_0_8px_oklch(0.68_0.18_40/0.7)]" aria-hidden="true" />
      <span className="font-display text-sm font-semibold tracking-wide">
        {days} DAY STREAK
      </span>
    </div>
  )
}
