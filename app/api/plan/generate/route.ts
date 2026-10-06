import { NextResponse } from 'next/server'
import { z } from 'zod'
import { queryErrorResponse } from '@/lib/db/queries/errors'
import { getActiveProfile } from '@/lib/db/queries/profile'
import { generateWeek } from '@/lib/plans/weekly-plan'
import { getLondonToday, getWeekStartIso } from '@/lib/time/london'

export const runtime = 'nodejs'
export const maxDuration = 120

const requestSchema = z.object({
  heightCm: z.number().positive().optional(),
  currentWeightKg: z.number().positive().optional(),
  targetWeightKg: z.number().positive().optional(),
})

/** Regenerates the current week, replacing whatever is stored. */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const parsed = requestSchema.safeParse(body ?? {})

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid profile details.' }, { status: 400 })
  }

  try {
    // Explicit values from the request win; the stored profile fills the gaps.
    const profile = { ...(await getActiveProfile()), ...parsed.data }
    const { week, message } = await generateWeek(getWeekStartIso(getLondonToday().iso), profile)
    return NextResponse.json({ plan: week.days, source: week.source, message })
  } catch (error) {
    return queryErrorResponse(error, 'Could not generate a plan.')
  }
}
