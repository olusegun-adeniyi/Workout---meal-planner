import { NextResponse } from 'next/server'
import { queryErrorResponse } from '@/lib/db/queries/errors'
import { saveWorkoutLog } from '@/lib/db/queries/workout-logs'
import { WorkoutLogInputSchema } from '@/lib/logs/schemas'
import { getLondonToday } from '@/lib/time/london'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const parsed = WorkoutLogInputSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid workout log.' }, { status: 400 })
  }
  if (parsed.data.date > getLondonToday().iso) {
    return NextResponse.json({ error: "Can't log a workout for a future day." }, { status: 400 })
  }

  try {
    const workoutLog = await saveWorkoutLog(parsed.data)
    return NextResponse.json({ workoutLog })
  } catch (error) {
    return queryErrorResponse(error, 'Could not save workout log.')
  }
}
