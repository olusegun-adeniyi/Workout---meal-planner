import { NextResponse } from 'next/server'
import { MacroEstimateError, estimateMacrosFromPhoto } from '@/lib/ai/estimate-macros'
import { EstimateMacrosRequestSchema } from '@/lib/ai/schemas'

export const runtime = 'nodejs'
export const maxDuration = 60

/** Estimates calories and protein from a food photo. Nothing is saved here — the user confirms first. */
export async function POST(request: Request) {
  const parsed = EstimateMacrosRequestSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'That photo could not be read. Try another.' }, { status: 400 })
  }

  try {
    const estimate = await estimateMacrosFromPhoto(parsed.data)
    return NextResponse.json({ estimate })
  } catch (error) {
    console.error('Photo macro estimate failed', error)
    const message = error instanceof MacroEstimateError && error.message.startsWith('Missing')
      ? error.message
      : "Couldn't estimate this photo. Try again or log it manually."
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
