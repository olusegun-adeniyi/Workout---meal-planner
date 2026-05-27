import { NextRequest, NextResponse } from 'next/server'
import type { PushSubscription } from 'web-push'
import { sendMealReminder } from '@/lib/push'
import { getDueReminder } from '@/lib/recommendations'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function sendDueReminders(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET || process.env.REMINDER_CRON_SECRET
  const authHeader = request.headers.get('authorization')

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  const dueMeal = getDueReminder()

  if (!dueMeal) {
    return NextResponse.json({
      ok: true,
      sent: 0,
      failed: 0,
      reason: 'No meal reminder due in this time window.',
    })
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
        title: `${dueMeal.slot} at ${dueMeal.time}`,
        body: `${dueMeal.name} · ${dueMeal.calories} cal · ${dueMeal.protein}g protein`,
        tag: `meal-reminder-${dueMeal.id}`,
      },
    )),
  )

  return NextResponse.json({
    ok: true,
    meal: {
      slot: dueMeal.slot,
      time: dueMeal.time,
      reminderTime: dueMeal.reminderTime,
      name: dueMeal.name,
    },
    sent: results.filter((result) => result.status === 'fulfilled').length,
    failed: results.filter((result) => result.status === 'rejected').length,
  })
}

export async function GET(request: NextRequest) {
  return sendDueReminders(request)
}

export async function POST(request: NextRequest) {
  return sendDueReminders(request)
}
