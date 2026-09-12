import { Coins, Sparkles, TrendingUp } from "lucide-react"
import { recentRewards } from "@/lib/data"
import type { Reward } from "@/lib/types"

const icon = {
  xp: Sparkles,
  gold: Coins,
  attribute: TrendingUp,
} as const

export function RecentRewards() {
  return (
    <section
      aria-labelledby="rewards-heading"
      className="glass glass-hover rounded-2xl p-4"
    >
      <h2
        id="rewards-heading"
        className="mb-3 font-display text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground"
      >
        Recent Rewards
      </h2>
      <ul className="flex flex-wrap gap-2">
        {recentRewards.map((reward: Reward) => {
          const Icon = icon[reward.kind]
          return (
            <li
              key={reward.label}
              className="inline-flex items-center gap-1.5 rounded-full bg-background/30 px-3 py-1.5 text-sm ring-1 ring-border"
            >
              <Icon className="size-3.5 text-gold" aria-hidden="true" />
              {reward.label}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
