'use client' // fetches and mutates logs from the browser with optimistic state

import { useCallback, useEffect, useRef, useState } from 'react'
import { z } from 'zod'
import {
  ApiErrorSchema,
  DayLogsSchema,
  type MealLog,
  type MealLogInput,
  MealLogSchema,
  type WorkoutLog,
  type WorkoutLogInput,
  WorkoutLogSchema,
} from '@/lib/logs/schemas'
import { getNowTimestamp } from '@/lib/time/london'

export type DayLogsStatus = 'idle' | 'loading' | 'ready' | 'error' | 'setup-required'

type DayLogsState = {
  status: DayLogsStatus
  mealLogs: MealLog[]
  workoutLog: WorkoutLog | null
  streak: number
}

export type MutationResult = { ok: true } | { ok: false; message: string }

const PENDING_PREFIX = 'pending-'
const SETUP_MESSAGE = 'Logging needs the new Supabase tables. Run supabase/schema.sql.'

const emptyState = (status: DayLogsStatus): DayLogsState => ({ status, mealLogs: [], workoutLog: null, streak: 0 })

async function readError(response: Response) {
  const parsed = ApiErrorSchema.safeParse(await response.json().catch(() => null))
  if (response.status === 424) return SETUP_MESSAGE
  return parsed.success ? parsed.data.error : 'Something failed on the server.'
}

function pendingId() {
  return `${PENDING_PREFIX}${Math.random().toString(36).slice(2)}`
}

/** Same rule as the DB's unique (log_date, slot): a planned slot holds one log. */
function withMealLog(logs: MealLog[], log: MealLog) {
  const rest = log.slot ? logs.filter((existing) => existing.slot !== log.slot) : logs
  return [...rest, log]
}

export function useDayLogs(date: string | null) {
  const [state, setState] = useState<DayLogsState>(() => emptyState(date ? 'loading' : 'idle'))
  const requestRef = useRef(0)

  const load = useCallback(async ({ silent = false } = {}) => {
    if (!date) return
    const requestId = ++requestRef.current
    if (!silent) setState((current) => ({ ...current, status: 'loading' }))

    try {
      const response = await fetch(`/api/today?date=${date}`, { cache: 'no-store' })
      if (requestId !== requestRef.current) return
      if (!response.ok) {
        setState(emptyState(response.status === 424 ? 'setup-required' : 'error'))
        return
      }
      const parsed = DayLogsSchema.parse(await response.json())
      if (requestId !== requestRef.current) return
      setState((current) => ({
        status: 'ready',
        // Keep optimistic rows that the server hasn't confirmed yet.
        mealLogs: current.mealLogs
          .filter((log) => log.id.startsWith(PENDING_PREFIX))
          .reduce(withMealLog, parsed.mealLogs),
        workoutLog: current.workoutLog?.id.startsWith(PENDING_PREFIX) ? current.workoutLog : parsed.workoutLog,
        streak: parsed.streak,
      }))
    } catch {
      if (requestId === requestRef.current) setState(emptyState('error'))
    }
  }, [date])

  useEffect(() => {
    if (!date) {
      setState(emptyState('idle'))
      return
    }
    setState(emptyState('loading'))
    load()

    // A PWA resumes from the background without remounting; pick up logs made elsewhere.
    const onVisible = () => { if (document.visibilityState === 'visible') load({ silent: true }) }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [date, load])

  const logMeal = useCallback(async (input: MealLogInput): Promise<MutationResult> => {
    const optimistic: MealLog = {
      id: pendingId(),
      date: input.date,
      slot: input.source === 'planned' ? input.slot : null,
      status: input.source === 'planned' ? input.status : 'eaten',
      source: input.source,
      name: input.name,
      calories: Math.round(input.calories),
      protein: Math.round(input.protein),
      notes: input.source === 'custom_text' ? input.notes ?? null : null,
      loggedAt: getNowTimestamp(),
    }

    // The log this one displaces (a planned slot re-logged as skipped, say), restored on failure.
    let displaced: MealLog | undefined
    setState((current) => {
      displaced = optimistic.slot ? current.mealLogs.find((log) => log.slot === optimistic.slot) : undefined
      return { ...current, mealLogs: withMealLog(current.mealLogs, optimistic) }
    })

    try {
      const response = await fetch('/api/meal-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      if (!response.ok) throw new Error(await readError(response))
      const { mealLog } = z.object({ mealLog: MealLogSchema }).parse(await response.json())

      setState((current) => ({
        ...current,
        mealLogs: withMealLog(current.mealLogs.filter((log) => log.id !== optimistic.id), mealLog),
      }))
      load({ silent: true }) // streak may have changed
      return { ok: true }
    } catch (error) {
      setState((current) => {
        if (!current.mealLogs.some((log) => log.id === optimistic.id)) return current
        const remaining = current.mealLogs.filter((log) => log.id !== optimistic.id)
        return { ...current, mealLogs: displaced ? withMealLog(remaining, displaced) : remaining }
      })
      return { ok: false, message: error instanceof Error ? error.message : 'Could not save.' }
    }
  }, [load])

  const logWorkout = useCallback(async (input: WorkoutLogInput): Promise<MutationResult> => {
    const optimistic: WorkoutLog = { id: pendingId(), date: input.date, splitLabel: input.splitLabel, completedAt: getNowTimestamp() }
    let previous: WorkoutLog | null = null
    setState((current) => {
      previous = current.workoutLog?.id.startsWith(PENDING_PREFIX) ? null : current.workoutLog
      return { ...current, workoutLog: optimistic }
    })

    try {
      const response = await fetch('/api/workout-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      if (!response.ok) throw new Error(await readError(response))
      const { workoutLog } = z.object({ workoutLog: WorkoutLogSchema }).parse(await response.json())
      setState((current) => ({ ...current, workoutLog }))
      return { ok: true }
    } catch (error) {
      setState((current) => (current.workoutLog?.id === optimistic.id ? { ...current, workoutLog: previous } : current))
      return { ok: false, message: error instanceof Error ? error.message : 'Could not save.' }
    }
  }, [])

  return { ...state, reload: load, logMeal, logWorkout }
}
