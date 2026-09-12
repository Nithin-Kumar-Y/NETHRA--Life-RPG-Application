const WEEKDAY_SHORT = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"] as const

export function localDateKey(date: Date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export function parseLocalDate(key: string): Date {
  const [y, m, d] = key.split("-").map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(key: string, amount: number): string {
  const date = parseLocalDate(key)
  date.setDate(date.getDate() + amount)
  return localDateKey(date)
}

export function yesterday(key: string): string {
  return addDays(key, -1)
}

export function isSameMonth(key: string, monthDate: Date): boolean {
  const date = parseLocalDate(key)
  return date.getFullYear() === monthDate.getFullYear() && date.getMonth() === monthDate.getMonth()
}

export function startOfWeekSunday(date: Date): Date {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  start.setDate(start.getDate() - start.getDay())
  return start
}

export function startOfWeekMonday(date: Date): Date {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const day = start.getDay()
  const diff = day === 0 ? 6 : day - 1
  start.setDate(start.getDate() - diff)
  return start
}

export function weekDateKeys(weekStart: Date): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart)
    date.setDate(weekStart.getDate() + i)
    return localDateKey(date)
  })
}

export function weekdayLabel(key: string): string {
  const date = parseLocalDate(key)
  const day = date.getDay()
  const index = day === 0 ? 6 : day - 1
  return WEEKDAY_SHORT[index]
}

export function monthTitle(date: Date): string {
  return date.toLocaleDateString(undefined, { month: "long", year: "numeric" }).toUpperCase()
}

export function formatDisplayDate(key: string): string {
  return parseLocalDate(key).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  })
}

export function monthGrid(monthDate: Date): Array<{ key: string; inMonth: boolean }> {
  const first = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
  const start = startOfWeekSunday(first)
  return Array.from({ length: 42 }, (_, i) => {
    const date = new Date(start)
    date.setDate(start.getDate() + i)
    return {
      key: localDateKey(date),
      inMonth: date.getMonth() === monthDate.getMonth(),
    }
  })
}

export function compareDateKeys(a: string, b: string): number {
  return a.localeCompare(b)
}
