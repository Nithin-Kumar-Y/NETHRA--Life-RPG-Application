"use client"

import { useState } from "react"
import { LayoutDashboard, ScrollText, Package, User } from "lucide-react"
import { navItems } from "@/lib/data"

const icons = {
  dashboard: LayoutDashboard,
  quests: ScrollText,
  inventory: Package,
  character: User,
} as const

export function FloatingNav() {
  const [active, setActive] = useState("dashboard")

  return (
    <nav
      aria-label="Primary"
      className="glass fixed bottom-4 left-1/2 z-30 -translate-x-1/2 rounded-2xl p-1.5 sm:bottom-6 lg:bottom-1/2 lg:left-4 lg:translate-x-0 lg:translate-y-1/2"
    >
      <ul className="flex items-center gap-1 lg:flex-col">
        {navItems.map((item) => {
          const Icon = icons[item.id as keyof typeof icons]
          const isActive = active === item.id
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => setActive(item.id)}
                aria-current={isActive ? "page" : undefined}
                className={`press group flex flex-col items-center gap-1 rounded-xl px-3 py-2 text-[11px] font-medium transition-colors sm:px-4 ${
                  isActive
                    ? "bg-primary/25 text-foreground ring-1 ring-primary/40"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="size-5" aria-hidden="true" />
                <span className="sr-only sm:not-sr-only">{item.label}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
