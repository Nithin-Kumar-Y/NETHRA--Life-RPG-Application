"use client"
import { TimeOfDayProvider, useTimeOfDay } from "@/components/time-of-day-provider"
function Inner() {
  try {
    const { timeOfDay } = useTimeOfDay()
    return <div className="p-8 text-center">diag-time ok — {timeOfDay}</div>
  } catch (e: any) {
    return <div className="p-8 text-center text-destructive">diag-time error: {String(e?.message || e)}</div>
  }
}
export default function DiagTimePage() {
  return (
    <TimeOfDayProvider>
      <Inner />
    </TimeOfDayProvider>
  )
}
