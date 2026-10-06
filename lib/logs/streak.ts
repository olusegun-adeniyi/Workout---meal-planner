import { addDaysToIso } from '@/lib/time/london'

/** A day counts once this many meals are logged as eaten — one per planned slot. */
export const MEALS_PER_STREAK_DAY = 4

export type DayMealCounts = { eaten: number; skipped: number }

function qualifies(counts: DayMealCounts | undefined) {
  return !!counts && counts.skipped === 0 && counts.eaten >= MEALS_PER_STREAK_DAY
}

/**
 * "N days no skipped meals". Today extends the streak once it qualifies, but an
 * unfinished today doesn't break it — only a skip today resets to zero.
 */
export function calculateStreak(countsByDate: Map<string, DayMealCounts>, todayIso: string) {
  const today = countsByDate.get(todayIso)
  if (today && today.skipped > 0) return 0

  let streak = qualifies(today) ? 1 : 0
  let cursor = addDaysToIso(todayIso, -1)
  while (qualifies(countsByDate.get(cursor))) {
    streak += 1
    cursor = addDaysToIso(cursor, -1)
  }
  return streak
}
