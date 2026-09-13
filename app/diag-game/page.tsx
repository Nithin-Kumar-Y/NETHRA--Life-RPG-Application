"use client"
import { GameProvider, useGame } from "@/components/game-provider"
import { TimeOfDayProvider } from "@/components/time-of-day-provider"
function Inner() {
  try {
    const { ready, state } = useGame()
    return <div className="p-8 text-center">diag-game ok — ready:{String(ready)} quests:{state.quests.length}</div>
  } catch (e: any) {
    return <div className="p-8 text-center text-destructive">diag-game error: {String(e?.message || e)}</div>
  }
}
export default function DiagGamePage() {
  return (
    <TimeOfDayProvider>
      <GameProvider>
        <Inner />
      </GameProvider>
    </TimeOfDayProvider>
  )
}
