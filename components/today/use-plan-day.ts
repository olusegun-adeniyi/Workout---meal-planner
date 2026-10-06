'use client' // fetches the day's plan from the browser

import { useCallback, useEffect, useRef, useState } from 'react'
import { type PlanDay, PlanDaySchema } from '@/lib/plans/plan-day'

export type PlanDayStatus = 'idle' | 'loading' | 'generating' | 'ready' | 'error'

// A cached plan returns in well under a second; past this, the server is generating.
const GENERATING_AFTER_MS = 2500

export function usePlanDay(date: string | null) {
  const [planDay, setPlanDay] = useState<PlanDay | null>(null)
  const [status, setStatus] = useState<PlanDayStatus>(date ? 'loading' : 'idle')
  const requestRef = useRef(0)

  const load = useCallback(async () => {
    if (!date) return
    const requestId = ++requestRef.current
    setStatus('loading')
    const slowTimer = window.setTimeout(() => {
      if (requestId === requestRef.current) setStatus('generating')
    }, GENERATING_AFTER_MS)

    try {
      const response = await fetch(`/api/plan/day?date=${date}`, { cache: 'no-store' })
      if (!response.ok) throw new Error(`Plan request failed: ${response.status}`)
      const parsed = PlanDaySchema.parse(await response.json())
      if (requestId !== requestRef.current) return
      setPlanDay(parsed)
      setStatus('ready')
    } catch {
      if (requestId === requestRef.current) setStatus('error')
    } finally {
      window.clearTimeout(slowTimer)
    }
  }, [date])

  useEffect(() => {
    setPlanDay(null)
    if (!date) {
      setStatus('idle')
      return
    }
    load()
  }, [date, load])

  return { planDay, status, reload: load }
}
