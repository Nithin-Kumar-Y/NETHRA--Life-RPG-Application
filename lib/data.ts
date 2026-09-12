import type { Character, Quest, Reward, NavItem } from "./types"

export const APP_NAME = "NETHRA: Life-RPG"

export const character: Character = {
  name: "NETHRA",
  path: "Ronin",
  level: 8,
  xp: 780,
  xpToNext: 1000,
  attributes: [
    { label: "Intellect", value: 17 },
    { label: "Strength", value: 12 },
    { label: "Discipline", value: 15 },
  ],
}

export const streakDays = 7

export const goldBalance = 1240

export const quests: Quest[] = [
  { id: "q1", title: "Master React", category: "Intellect", xp: 120, gold: 35 },
  { id: "q2", title: "Morning Run", category: "Strength", xp: 80, gold: 25 },
  { id: "q3", title: "Read 20 Pages", category: "Discipline", xp: 60, gold: 20 },
]

export const recentRewards: Reward[] = [
  { label: "+120 XP", kind: "xp" },
  { label: "+35 Gold", kind: "gold" },
  { label: "+1 Intellect", kind: "attribute" },
]

export const navItems: NavItem[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "quests", label: "Quests" },
  { id: "inventory", label: "Inventory" },
  { id: "character", label: "Character" },
]
