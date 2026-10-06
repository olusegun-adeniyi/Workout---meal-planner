import { NextResponse } from 'next/server'
import { queryErrorResponse } from '@/lib/db/queries/errors'
import { saveMealLog } from '@/lib/db/queries/meal-logs'
import { MealLogInputSchema } from '@/lib/logs/schemas'
import { getLondonToday } from '@/lib/time/london'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const parsed = MealLogInputSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid meal log.', fields: parsed.error.flatten().fieldErrors }, { status: 400 })
  }
  if (parsed.data.date > getLondonToday().iso) {
    return NextResponse.json({ error: "Can't log a meal for a future day." }, { status: 400 })
  }

  try {
    const mealLog = await saveMealLog(parsed.data)
    return NextResponse.json({ mealLog })
  } catch (error) {
    return queryErrorResponse(error, 'Could not save meal log.')
  }
}
