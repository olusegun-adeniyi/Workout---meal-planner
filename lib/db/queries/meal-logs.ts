import type { MealLog, MealLogInput } from '@/lib/logs/schemas'
import { MealLogInputSchema } from '@/lib/logs/schemas'
import { type DayMealCounts, calculateStreak } from '@/lib/logs/streak'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/types'
import { addDaysToIso } from '@/lib/time/london'
import { SetupRequiredError, throwIfMissingTable } from './errors'

type MealLogRow = Database['public']['Tables']['meal_logs']['Row']

const STREAK_LOOKBACK_DAYS = 400

function toMealLog(row: MealLogRow): MealLog {
  return {
    id: row.id,
    date: row.log_date,
    slot: row.slot,
    status: row.status,
    source: row.source,
    name: row.name,
    calories: row.calories,
    protein: row.protein_g,
    notes: row.notes,
    loggedAt: row.logged_at,
  }
}

export async function getMealLogsForDate(date: string): Promise<MealLog[]> {
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from('meal_logs')
    .select('*')
    .eq('log_date', date)
    .order('logged_at', { ascending: true })

  if (error) {
    throwIfMissingTable(error, 'meal_logs')
    throw error
  }
  return data.map(toMealLog)
}

/**
 * Planned slots upsert on (date, slot) so a double tap — or a later notification
 * action — can't create two logs for the same meal. Custom logs always insert.
 */
export async function saveMealLog(input: MealLogInput): Promise<MealLog> {
  const parsed = MealLogInputSchema.parse(input)
  const supabase = createSupabaseServerClient()
  const now = new Date().toISOString()

  const query = parsed.source === 'planned'
    ? supabase.from('meal_logs').upsert(
        {
          log_date: parsed.date,
          slot: parsed.slot,
          status: parsed.status,
          source: 'planned',
          name: parsed.name,
          calories: parsed.calories,
          protein_g: parsed.protein,
          logged_at: now,
        },
        { onConflict: 'log_date,slot' },
      )
    : supabase.from('meal_logs').insert({
        log_date: parsed.date,
        slot: null,
        status: 'eaten',
        source: parsed.source,
        name: parsed.name,
        calories: parsed.calories,
        protein_g: parsed.protein,
        notes: parsed.notes ?? null,
        logged_at: now,
      })

  const { data, error } = await query.select('*').single()
  if (error) {
    throwIfMissingTable(error, 'meal_logs')
    // The custom_photo source arrives with a schema update; an old constraint rejects it.
    if (error.code === '23514' && error.message.includes('meal_logs_source_check')) {
      throw new SetupRequiredError('meal_logs (photo logging)')
    }
    throw error
  }
  return toMealLog(data)
}

export async function getMealStreak(todayIso: string): Promise<number> {
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from('meal_logs')
    .select('log_date, status')
    .gte('log_date', addDaysToIso(todayIso, -STREAK_LOOKBACK_DAYS))
    .lte('log_date', todayIso)

  if (error) {
    throwIfMissingTable(error, 'meal_logs')
    throw error
  }

  const counts = new Map<string, DayMealCounts>()
  for (const row of data) {
    const day = counts.get(row.log_date) ?? { eaten: 0, skipped: 0 }
    day[row.status] += 1
    counts.set(row.log_date, day)
  }
  return calculateStreak(counts, todayIso)
}
