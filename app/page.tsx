import { VillageBackground } from "@/components/environment/village-background"
import { Petals } from "@/components/environment/petals"
import { TopNav } from "@/components/dashboard/top-nav"
import { CharacterPanel } from "@/components/dashboard/character-panel"
import { RecentRewards } from "@/components/dashboard/recent-rewards"
import { ActiveQuests } from "@/components/quests/active-quests"
import { FloatingNav } from "@/components/navigation/floating-nav"

export default function Page() {
  return (
    <div className="relative min-h-screen">
      <VillageBackground />
      <Petals />

      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 pb-28 pt-4 sm:px-6 lg:pl-24">
        <TopNav />

        <main className="mt-6 grid flex-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="flex flex-col gap-6">
            <CharacterPanel />
            <RecentRewards />
          </div>

          <div className="lg:pt-0">
            <ActiveQuests />
          </div>
        </main>
      </div>

      <FloatingNav />
    </div>
  )
}
