import { NextRequest, NextResponse } from 'next/server'
import type { PushSubscription } from 'web-push'
import { sendMealReminder } from '@/lib/push'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

function isMissingPushTable(error: { code?: string; message?: string }) {
  return error.code === 'PGRST205'
    || error.message?.includes("Could not find the table 'public.push_subscriptions'")
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const directSubscription = body?.subscription as PushSubscription | undefined

  if (directSubscription?.endpoint) {
    await sendMealReminder(
      directSubscription,
      {
        title: 'Time to eat',
        body: 'This is what a Forge meal reminder will feel like.',
        tag: 'meal-reminder-test',
      },
    )

    return NextResponse.json({ ok: true, sent: 1, failed: 0, source: 'browser' })
  }

  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from('push_subscriptions')
    .select('id, subscription')
    .eq('enabled', true)

  if (error) {
    console.error('Failed to load push subscriptions', error)
    if (isMissingPushTable(error)) {
      return NextResponse.json(
        {
          error: 'Push reminders need the Supabase push_subscriptions table first.',
          setupRequired: 'Run supabase/schema.sql in the Supabase SQL Editor.',
        },
        { status: 424 },
      )
    }

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
        body: 'This is what a Forge meal reminder will feel like.',
        tag: 'meal-reminder-test',
      },
    )),
  )

  return NextResponse.json({
    ok: true,
    sent: results.filter((result) => result.status === 'fulfilled').length,
    failed: results.filter((result) => result.status === 'rejected').length,
  })
}
