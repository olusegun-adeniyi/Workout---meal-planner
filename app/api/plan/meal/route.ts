import { NextResponse } from 'next/server'
import { queryErrorResponse } from '@/lib/db/queries/errors'
import { SwapMealInputSchema } from '@/lib/plans/plan-day'
import { InvalidSwapError, swapPlannedMeal } from '@/lib/plans/weekly-plan'

export const runtime = 'nodejs'
export const maxDuration = 120

/** Swaps one planned meal for another illustrated meal; macros stay as planned. */
export async function PATCH(request: Request) {
  const parsed = SwapMealInputSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid swap.' }, { status: 400 })
  }

  try {
    const day = await swapPlannedMeal(parsed.data)
    return NextResponse.json({ day })
  } catch (error) {
    if (error instanceof InvalidSwapError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return queryErrorResponse(error, 'Could not swap the meal.')
  }
}
