import { Bell, Coins, Moon } from "lucide-react"
import { APP_NAME, goldBalance } from "@/lib/data"

export function TopNav() {
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
          <p className="font-display text-base font-semibold tracking-wide sm:text-lg">
            {APP_NAME}
          </p>
          <p className="hidden text-[11px] text-muted-foreground sm:block">
            Turn your life into a quest
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <span className="glass hidden items-center gap-2 rounded-full px-3 py-1.5 text-xs text-muted-foreground md:inline-flex">
          <Moon className="size-4 text-primary" aria-hidden="true" />
          Night · Sakura Village
        </span>

        <span className="glass inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-gold">
          <Coins className="size-4" aria-hidden="true" />
          {goldBalance.toLocaleString()}
          <span className="sr-only">gold balance</span>
        </span>

        <button
          type="button"
          aria-label="Notifications"
          className="glass press glass-hover relative inline-flex size-9 items-center justify-center rounded-full"
        >
          <Bell className="size-4" aria-hidden="true" />
          <span className="absolute right-2 top-2 size-2 rounded-full bg-lantern ring-2 ring-background/60" />
        </button>

        <button
          type="button"
          aria-label="Open profile"
          className="press size-9 overflow-hidden rounded-full ring-2 ring-primary/50"
        >
          <img
            src="/character/ronin.png"
            alt="Your character avatar"
            className="size-full object-cover"
          />
        </button>
      </div>
    </header>
  )
}
