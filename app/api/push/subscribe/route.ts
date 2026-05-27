import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

const pushSubscriptionSchema = z.object({
  endpoint: z.string().url(),
  expirationTime: z.number().nullable().optional(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
})

function isMissingPushTable(error: { code?: string; message?: string }) {
  return error.code === 'PGRST205'
    || error.message?.includes("Could not find the table 'public.push_subscriptions'")
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const parsed = pushSubscriptionSchema.safeParse(body?.subscription)

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid push subscription.' },
      { status: 400 },
    )
  }

  const supabase = createSupabaseServerClient()
  const { error } = await supabase
    .from('push_subscriptions')
    .upsert(
      {
        endpoint: parsed.data.endpoint,
        subscription: parsed.data,
        user_agent: request.headers.get('user-agent'),
        enabled: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'endpoint' },
    )

  if (error) {
    console.error('Failed to save push subscription', error)
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
      { error: 'Could not save push subscription.' },
      { status: 500 },
    )
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const endpoint = typeof body?.endpoint === 'string' ? body.endpoint : null

  if (!endpoint) {
    return NextResponse.json(
      { error: 'Missing push endpoint.' },
      { status: 400 },
    )
  }

  const supabase = createSupabaseServerClient()
  const { error } = await supabase
    .from('push_subscriptions')
    .update({ enabled: false, updated_at: new Date().toISOString() })
    .eq('endpoint', endpoint)

  if (error) {
    console.error('Failed to disable push subscription', error)
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
      { error: 'Could not disable push subscription.' },
      { status: 500 },
    )
  }

  return NextResponse.json({ ok: true })
}
