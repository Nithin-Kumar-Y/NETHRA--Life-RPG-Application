import { APP_NAME } from "./brand"
import type { NavItem } from "./types"

export { APP_NAME }

export const navItems: NavItem[] = [
  { id: "dashboard", label: "Dashboard", href: "/dashboard" },
  { id: "quests", label: "Quests", href: "/quests" },
  { id: "calendar", label: "Calendar", href: "/calendar" },
  { id: "inventory", label: "Inventory", href: "/inventory" },
  { id: "character", label: "Character", href: "/character" },
]
