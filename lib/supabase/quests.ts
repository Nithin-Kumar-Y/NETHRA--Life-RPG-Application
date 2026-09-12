import type { Quest } from "@/lib/types"

export type QuestRow = {
  id: string
  user_id: string
  template_id: string | null
  name: string
  description: string
  genre: string
  scheduled_date: string // date YYYY-MM-DD
  quantity: number | null
  unit: string | null
  xp_reward: number
  gold_reward: number
  status: string
  created_at: string
  completed_at: string | null
  expired_at: string | null
  cooldown_minutes: number
}

export function dbRowToQuest(row: QuestRow): Quest {
  return {
    id: row.id,
    templateId: row.template_id,
    name: row.name,
    description: row.description ?? "",
    genre: row.genre as Quest["genre"],
    scheduledDate: row.scheduled_date, // already YYYY-MM-DD from date
    quantity: row.quantity,
    unit: row.unit,
    xpReward: row.xp_reward,
    goldReward: row.gold_reward,
    status: row.status as Quest["status"],
    createdAt: row.created_at,
    completedAt: row.completed_at,
    expiredAt: row.expired_at,
    cooldownMinutes: row.cooldown_minutes,
  }
}

export function questToDbRow(quest: Quest, userId: string): QuestRow {
  return {
    id: quest.id,
    user_id: userId,
    template_id: quest.templateId,
    name: quest.name,
    description: quest.description ?? "",
    genre: quest.genre,
    scheduled_date: quest.scheduledDate,
    quantity: quest.quantity,
    unit: quest.unit,
    xp_reward: quest.xpReward,
    gold_reward: quest.goldReward,
    status: quest.status,
    created_at: quest.createdAt,
    completed_at: quest.completedAt,
    expired_at: quest.expiredAt,
    cooldown_minutes: quest.cooldownMinutes,
  }
}
