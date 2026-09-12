export const TIME_OF_DAY_PERIODS = ["morning", "evening", "night"] as const

export type TimeOfDay = (typeof TIME_OF_DAY_PERIODS)[number]

export const TIME_OF_DAY_BACKGROUNDS: Record<TimeOfDay, string> = {
  morning: "/backgrounds/morning.png",
  evening: "/backgrounds/evening.png",
  night: "/backgrounds/night.png",
}

const MORNING_START_MINUTES = 6 * 60
const EVENING_START_MINUTES = 17 * 60 + 30
const NIGHT_START_MINUTES = 19 * 60

export function getTimeOfDay(date: Date = new Date()): TimeOfDay {
  const minutes = date.getHours() * 60 + date.getMinutes()

  if (minutes >= MORNING_START_MINUTES && minutes < EVENING_START_MINUTES) {
    return "morning"
  }

  if (minutes >= EVENING_START_MINUTES && minutes < NIGHT_START_MINUTES) {
    return "evening"
  }

  return "night"
}

export function getTimeOfDayLabel(period: TimeOfDay): string {
  if (period === "morning") return "Morning"
  if (period === "evening") return "Evening"
  return "Night"
}
