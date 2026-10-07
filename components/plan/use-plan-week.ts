'use client' // fetches the week's plan and applies swaps optimistically

import { useCallback, useEffect, useRef, useState } from 'react'
import { z } from 'zod'
import { AiPlanDaySchema } from '@/lib/ai/schemas'
import { type PlanWeek, PlanWeekSchema, type SwapMealInput } from '@/lib/plans/plan-day'

export type PlanWeekStatus = 'loading' | 'generating' | 'ready' | 'error'

const GENERATING_AFTER_MS = 2500

export function usePlanWeek(date: string) {
  const [week, setWeek] = useState<PlanWeek | null>(null)
  const [status, setStatus] = useState<PlanWeekStatus>('loading')
  const requestRef = useRef(0)

  const load = useCallback(async () => {
    const requestId = ++requestRef.current
    setStatus('loading')
    const slowTimer = window.setTimeout(() => {
      if (requestId === requestRef.current) setStatus('generating')
    }, GENERATING_AFTER_MS)

    try {
      const response = await fetch(`/api/plan/week?date=${date}`, { cache: 'no-store' })
      if (!response.ok) throw new Error(`Plan request failed: ${response.status}`)
      const parsed = PlanWeekSchema.parse(await response.json())
      if (requestId !== requestRef.current) return
      setWeek(parsed)
      setStatus('ready')
    } catch {
      if (requestId === requestRef.current) setStatus('error')
    } finally {
      window.clearTimeout(slowTimer)
    }
  }, [date])

  useEffect(() => { load() }, [load])

  /** Optimistic: the row shows the new meal at once and reverts if the save fails. */
  const swapMeal = useCallback(async (input: SwapMealInput): Promise<{ ok: true } | { ok: false; message: string }> => {
    let previousName: string | undefined
    const rename = (current: PlanWeek | null, name: string) => current && {
      ...current,
      days: current.days.map((day) => (day.id !== input.date ? day : {
        ...day,
        meals: day.meals.map((meal) => {
          if (meal.slot !== input.slot) return meal
          previousName ??= meal.name
          return { ...meal, name }
        }),
      })),
    }

    setWeek((current) => rename(current, input.name))
    try {
      const response = await fetch('/api/plan/meal', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      if (!response.ok) {
        const body = z.object({ error: z.string() }).safeParse(await response.json().catch(() => null))
        throw new Error(body.success ? body.data.error : 'Swap not saved. Try again.')
      }
      const { day } = z.object({ day: AiPlanDaySchema }).parse(await response.json())
      setWeek((current) => current && { ...current, days: current.days.map((entry) => (entry.id === day.id ? day : entry)) })
      return { ok: true }
    } catch (error) {
      if (previousName) {
        const restore = previousName
        setWeek((current) => rename(current, restore))
      }
      return { ok: false, message: error instanceof Error ? error.message : 'Swap not saved. Try again.' }
    }
  }, [])

  return { week, status, reload: load, swapMeal }
}
