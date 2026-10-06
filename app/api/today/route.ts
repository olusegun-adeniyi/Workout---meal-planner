import { NextRequest, NextResponse } from 'next/server'
import { queryErrorResponse } from '@/lib/db/queries/errors'
import { getMealLogsForDate, getMealStreak } from '@/lib/db/queries/meal-logs'
import { getWorkoutLogForDate } from '@/lib/db/queries/workout-logs'
import { type DayLogs, IsoDateSchema } from '@/lib/logs/schemas'
import { getLondonToday } from '@/lib/time/london'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const today = getLondonToday()
  const parsed = IsoDateSchema.safeParse(request.nextUrl.searchParams.get('date') ?? today.iso)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Use a YYYY-MM-DD date.' }, { status: 400 })
  }

  try {
    const [mealLogs, workoutLog, streak] = await Promise.all([
      getMealLogsForDate(parsed.data),
      getWorkoutLogForDate(parsed.data),
      getMealStreak(today.iso),
    ])
    const body: DayLogs = { date: parsed.data, mealLogs, workoutLog, streak }
    return NextResponse.json(body)
  } catch (error) {
    return queryErrorResponse(error, 'Could not load logs.')
  }
}
