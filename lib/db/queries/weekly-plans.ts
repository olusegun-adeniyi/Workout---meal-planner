import { z } from 'zod'
import { AiPlanDaySchema } from '@/lib/ai/schemas'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { Json } from '@/lib/supabase/types'
import { throwIfMissingTable } from './errors'

export const StoredWeekDaysSchema = z.array(AiPlanDaySchema).length(7)
export type StoredWeek = {
  source: 'ai' | 'fallback'
  days: z.infer<typeof StoredWeekDaysSchema>
  /** Set when read from the database. */
  updatedAt?: string
}

export async function getWeeklyPlan(weekStarting: string): Promise<StoredWeek | null> {
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from('weekly_plans')
    .select('source, plan, updated_at')
    .eq('week_starting_date', weekStarting)
    .maybeSingle()

  if (error) {
    throwIfMissingTable(error, 'weekly_plans')
    throw error
  }
  if (!data) return null

  // An older or hand-edited row that no longer matches the schema is treated as missing.
  const days = StoredWeekDaysSchema.safeParse(data.plan)
  return days.success ? { source: data.source, days: days.data, updatedAt: data.updated_at } : null
}

export async function saveWeeklyPlan(weekStarting: string, week: StoredWeek, profileId?: string) {
  const supabase = createSupabaseServerClient()
  const { error } = await supabase
    .from('weekly_plans')
    .upsert(
      {
        profile_id: profileId ?? null,
        week_starting_date: weekStarting,
        source: week.source,
        plan: week.days as unknown as Json,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'week_starting_date' },
    )

  if (error) {
    throwIfMissingTable(error, 'weekly_plans')
    throw error
  }
}
