"use client"

import { usePathname } from "next/navigation"
import { GameProvider } from "@/components/game-provider"
import { TimeOfDayProvider } from "@/components/time-of-day-provider"
import { WorldBackground } from "@/components/WorldBackground"
import { Petals } from "@/components/environment/petals"
import { TopNav } from "@/components/dashboard/top-nav"
import { FloatingNav } from "@/components/navigation/floating-nav"
import { VillageGate } from "@/components/onboarding/village-gate"
import { QuestCelebration } from "@/components/quests/quest-celebration"

export function ProvidersWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  // Diagnostic isolation: /blank-naked and /diag-* render without any providers
  // /blank renders WITH providers (the real diagnostic - must survive providers)
  const isNaked = pathname?.startsWith("/blank-naked") || pathname?.startsWith("/diag-")

  if (isNaked) {
    return <>{children}</>
  }

  return (
    <TimeOfDayProvider>
      <GameProvider>
        <WorldBackground />
        <Petals />
        <div className="relative min-h-screen">
          <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 pb-28 pt-4 sm:px-6 lg:pl-24">
            <TopNav />
            {children}
          </div>
          <FloatingNav />
          <VillageGate />
          <QuestCelebration />
        </div>
      </GameProvider>
    </TimeOfDayProvider>
  )
}
