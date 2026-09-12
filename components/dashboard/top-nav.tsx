"use client"

import { Bell, Coins, LogOut, LogIn } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { APP_NAME } from "@/lib/data"
import { WorldPeriodChip } from "@/components/world-period-chip"
import { useGame } from "@/components/game-provider"
import { AvatarMark } from "@/components/onboarding/village-gate"
import { createClient } from "@/lib/supabase/client"

export function TopNav() {
  const { stats, state } = useGame()
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsAuthenticated(Boolean(user))
      setAuthLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(Boolean(session?.user))
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <header className="glass sticky top-4 z-20 mx-auto flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 sm:px-6">
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex size-9 items-center justify-center rounded-xl bg-primary/25 text-primary ring-1 ring-primary/40"
        >
          <span className="font-display text-lg font-semibold text-foreground">N</span>
        </span>
        <div className="leading-tight">
          <p className="font-display text-base font-semibold tracking-wide sm:text-lg">{APP_NAME}</p>
          <p className="hidden text-[11px] text-muted-foreground sm:block">Turn your life into a quest</p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <WorldPeriodChip />

        <span className="glass inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-gold">
          <Coins className="size-4" aria-hidden="true" />
          {stats.gold.toLocaleString()}
          <span className="sr-only">gold balance</span>
        </span>

        <button
          type="button"
          aria-label="Notifications"
          className="glass press glass-hover relative hidden size-9 items-center justify-center rounded-full sm:inline-flex"
        >
          <Bell className="size-4" aria-hidden="true" />
        </button>

        {!authLoading &&
          (isAuthenticated ? (
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Logout"
              className="press glass inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ring-1 ring-border hover:bg-background/40"
            >
              <LogOut className="size-3.5" aria-hidden="true" /> Logout
            </button>
          ) : (
            <Link
              href="/login"
              className="press glass inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1.5 text-xs font-medium text-primary ring-1 ring-primary/20"
            >
              <LogIn className="size-3.5" aria-hidden="true" /> Login
            </Link>
          ))}

        <Link
          href="/character"
          aria-label="Open profile"
          className="press size-9 overflow-hidden rounded-full ring-2 ring-primary/50"
        >
          <AvatarMark id={state.profile?.avatarId ?? "ronin"} name={state.profile?.name ?? "N"} />
        </Link>
      </div>
    </header>
  )
}
