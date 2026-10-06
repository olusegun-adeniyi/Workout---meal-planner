import { NextRequest, NextResponse } from 'next/server'
import { queryErrorResponse } from '@/lib/db/queries/errors'
import { IsoDateSchema } from '@/lib/logs/schemas'
import { getPlanDay } from '@/lib/plans/weekly-plan'
import { getLondonToday } from '@/lib/time/london'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
// First request of a week waits on AI generation (~30s).
export const maxDuration = 120

export async function GET(request: NextRequest) {
  const parsed = IsoDateSchema.safeParse(request.nextUrl.searchParams.get('date') ?? getLondonToday().iso)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Use a YYYY-MM-DD date.' }, { status: 400 })
  }

  try {
    return NextResponse.json(await getPlanDay(parsed.data))
  } catch (error) {
    return queryErrorResponse(error, 'Could not load the plan.')
  }
}
