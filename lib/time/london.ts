const LONDON_TIME_ZONE = 'Europe/London'

export type LondonDate = {
  year: number
  /** 1–12 */
  month: number
  day: number
  /** YYYY-MM-DD */
  iso: string
}

export type CalendarDay = {
  iso: string
  day: number
  inMonth: boolean
}

function toIso(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export function getLondonToday(now: Date = new Date()): LondonDate {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: LONDON_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now)

  const read = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((part) => part.type === type)?.value)
  const year = read('year')
  const month = read('month')
  const day = read('day')

  return { year, month, day, iso: toIso(year, month, day) }
}

export function getMonthName(year: number, month: number) {
  // Noon UTC keeps the label stable regardless of the viewer's offset.
  return new Intl.DateTimeFormat('en-GB', { month: 'long', timeZone: 'UTC' })
    .format(new Date(Date.UTC(year, month - 1, 1, 12)))
}

/**
 * Monday-start weeks covering the whole month, padded with adjacent-month days
 * so every week has 7 cells. Pure calendar arithmetic in UTC — no zone needed.
 */
export function getMonthWeeks(year: number, month: number): CalendarDay[][] {
  const first = new Date(Date.UTC(year, month - 1, 1))
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate()
  const leading = (first.getUTCDay() + 6) % 7
  const weekCount = Math.ceil((leading + daysInMonth) / 7)

  return Array.from({ length: weekCount }, (_, week) => (
    Array.from({ length: 7 }, (_, weekday) => {
      const date = new Date(Date.UTC(year, month - 1, 1 + week * 7 + weekday - leading))
      return {
        iso: toIso(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate()),
        day: date.getUTCDate(),
        inMonth: date.getUTCMonth() === month - 1,
      }
    })
  ))
}

export function formatLondonDayLabel(iso: string) {
  const [year, month, day] = iso.split('-').map(Number)
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, day, 12)))
}

/**
 * The recommendation engine reads local-calendar getters (getDay, getDate), so
 * hand it local noon on the London date — noon keeps DST shifts off the boundary.
 */
export function toPlanningDate(iso: string) {
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(year, month - 1, day, 12)
}

/** Short heading like "Thu 22 Oct". */
export function formatLondonShortDay(iso: string) {
  const [year, month, day] = iso.split('-').map(Number)
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, day, 12)))
}

export function isValidIsoDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
}

export function addDaysToIso(iso: string, days: number) {
  const [year, month, day] = iso.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day + days))
  return toIso(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate())
}

/** "13:05" in London for a stored UTC timestamp. */
export function formatLondonTime(timestamp: string) {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: LONDON_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(timestamp))
}

/** Current instant as an ISO timestamp — for optimistic rows before the server's arrives. */
export function getNowTimestamp() {
  return new Date().toISOString()
}

/** Monday of the week containing this date — plans are stored per Monday-start week. */
export function getWeekStartIso(iso: string) {
  const [year, month, day] = iso.split('-').map(Number)
  const weekday = (new Date(Date.UTC(year, month - 1, day)).getUTCDay() + 6) % 7
  return addDaysToIso(iso, -weekday)
}
