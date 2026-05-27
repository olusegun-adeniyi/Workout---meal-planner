import { NextRequest, NextResponse } from 'next/server'
import type { PushSubscription } from 'web-push'
import { sendMealReminder } from '@/lib/push'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const cronSecret = process.env.REMINDER_CRON_SECRET
  const authHeader = request.headers.get('authorization')

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from('push_subscriptions')
    .select('id, subscription')
    .eq('enabled', true)

  if (error) {
    console.error('Failed to load due reminder subscriptions', error)
    return NextResponse.json(
      { error: 'Could not load push subscriptions.' },
      { status: 500 },
    )
  }

  const results = await Promise.allSettled(
    (data ?? []).map((row) => sendMealReminder(
      row.subscription as unknown as PushSubscription,
      {
        title: 'Time to eat',
        body: 'Your next meal is due. Open Forge and log it.',
        tag: 'meal-reminder-due',
      },
    )),
  )

  return NextResponse.json({
    ok: true,
    sent: results.filter((result) => result.status === 'fulfilled').length,
    failed: results.filter((result) => result.status === 'rejected').length,
  })
}
