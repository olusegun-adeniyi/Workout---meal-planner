import type { WorkoutLog, WorkoutLogInput } from '@/lib/logs/schemas'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/types'
import { throwIfMissingTable } from './errors'

type WorkoutLogRow = Database['public']['Tables']['workout_logs']['Row']

function toWorkoutLog(row: WorkoutLogRow): WorkoutLog {
  return {
    id: row.id,
    date: row.log_date,
    splitLabel: row.split_label,
    completedAt: row.completed_at,
  }
}

export async function getWorkoutLogForDate(date: string): Promise<WorkoutLog | null> {
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from('workout_logs')
    .select('*')
    .eq('log_date', date)
    .maybeSingle()

  if (error) {
    throwIfMissingTable(error, 'workout_logs')
    throw error
  }
  return data ? toWorkoutLog(data) : null
}

export async function saveWorkoutLog(input: WorkoutLogInput): Promise<WorkoutLog> {
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from('workout_logs')
    .upsert(
      { log_date: input.date, split_label: input.splitLabel, completed_at: new Date().toISOString() },
      { onConflict: 'log_date' },
    )
    .select('*')
    .single()

  if (error) {
    throwIfMissingTable(error, 'workout_logs')
    throw error
  }
  return toWorkoutLog(data)
}
