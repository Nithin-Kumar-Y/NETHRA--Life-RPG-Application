"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, ScrollText, CalendarDays, Package, User } from "lucide-react"
import { navItems } from "@/lib/data"

const icons = {
  dashboard: LayoutDashboard,
  quests: ScrollText,
  calendar: CalendarDays,
  inventory: Package,
  character: User,
} as const

export function FloatingNav() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Primary"
      className="glass fixed bottom-4 left-1/2 z-30 -translate-x-1/2 rounded-2xl p-1.5 sm:bottom-6 lg:bottom-1/2 lg:left-4 lg:translate-x-0 lg:translate-y-1/2"
    >
      <ul className="flex items-center gap-0.5 sm:gap-1 lg:flex-col">
        {navItems.map((item) => {
          const Icon = icons[item.id]
          const isActive = pathname === item.href
          return (
            <li key={item.id}>
              <Link
                href={item.href}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
                className={`press group flex flex-col items-center gap-1 rounded-xl px-2.5 py-2 text-[10px] font-medium transition-colors sm:px-3 sm:text-[11px] ${
                  isActive
                    ? "bg-primary/25 text-foreground ring-1 ring-primary/40"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="size-5" aria-hidden="true" />
                <span className="hidden lg:inline">{item.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
