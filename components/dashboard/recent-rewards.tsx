"use client"

import { Coins, Sparkles, TrendingUp } from "lucide-react"
import { useGame } from "@/components/game-provider"
import { recentActivity } from "@/lib/rpg"
import type { Reward } from "@/lib/types"

const icon = {
  xp: Sparkles,
  gold: Coins,
  attribute: TrendingUp,
} as const

export function RecentRewards() {
  const { state } = useGame()
  const rewards = recentActivity(state.quests)

  return (
    <section aria-labelledby="rewards-heading" className="glass glass-hover rounded-2xl p-4">
      <h2
        id="rewards-heading"
        className="mb-3 font-display text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground"
      >
        Recent Activity
      </h2>
      {rewards.length === 0 ? (
        <p className="text-sm text-muted-foreground">Completed quests and earned XP will appear here.</p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {rewards.map((reward: Reward) => {
            const Icon = icon[reward.kind]
            return (
              <li
                key={reward.id}
                className="inline-flex items-center gap-1.5 rounded-full bg-background/30 px-3 py-1.5 text-sm ring-1 ring-border"
              >
                <Icon className="size-3.5 text-gold" aria-hidden="true" />
                {reward.label}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
