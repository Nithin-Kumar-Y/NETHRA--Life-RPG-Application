"use client"
import { TimeOfDayProvider } from "@/components/time-of-day-provider"
import { WorldBackground } from "@/components/WorldBackground"
export default function DiagWorldPage() {
  return (
    <TimeOfDayProvider>
      <WorldBackground />
      <div className="p-8 text-center relative">diag-world ok — WorldBackground mounted</div>
    </TimeOfDayProvider>
  )
}
