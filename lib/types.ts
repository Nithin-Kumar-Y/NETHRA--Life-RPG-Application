export type QuestCategory = "Intellect" | "Strength" | "Discipline"

export interface Quest {
  id: string
  title: string
  category: QuestCategory
  xp: number
  gold: number
}

export interface Attribute {
  label: string
  value: number
}

export interface Character {
  name: string
  path: string
  level: number
  xp: number
  xpToNext: number
  attributes: Attribute[]
}

export interface Reward {
  label: string
  kind: "xp" | "gold" | "attribute"
}

export interface NavItem {
  id: string
  label: string
}
