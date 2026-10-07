'use client' // rAF-driven springs for the tab transition

import { useEffect, useReducer, useRef } from 'react'

type Spring = { x: number; v: number }
type SpringName = 'page' | 'lead' | 'trail'

// [ω, ζ] from the handoff. The page spring is under-damped so it overshoots a
// touch; the indicator's lead edge outruns its trail edge, which reads as a stretch.
const CONFIG: Record<SpringName, [number, number]> = {
  page: [11, 0.62],
  lead: [18, 0.72],
  trail: [9.5, 0.82],
}
const SUBSTEPS = 6

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export type TabMotion = {
  /** Page position in tab-index units (0 = first tab). */
  page: number
  /** Page velocity in tab-index units per second. */
  pageVelocity: number
  lead: number
  trail: number
}

export function useTabSprings(target: number): TabMotion {
  const springs = useRef<Record<SpringName, Spring>>({
    page: { x: target, v: 0 },
    lead: { x: target, v: 0 },
    trail: { x: target, v: 0 },
  })
  const frame = useRef<number | null>(null)
  const [, render] = useReducer((tick: number) => tick + 1, 0)

  useEffect(() => {
    if (prefersReducedMotion()) {
      for (const spring of Object.values(springs.current)) {
        spring.x = target
        spring.v = 0
      }
      render()
      return
    }

    let last = performance.now()
    const step = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const h = dt / SUBSTEPS
      let busy = false

      for (const name of Object.keys(CONFIG) as SpringName[]) {
        const spring = springs.current[name]
        const [omega, zeta] = CONFIG[name]
        for (let i = 0; i < SUBSTEPS; i += 1) {
          const a = -omega * omega * (spring.x - target) - 2 * zeta * omega * spring.v
          spring.v += a * h
          spring.x += spring.v * h
        }
        if (Math.abs(spring.x - target) < 0.0005 && Math.abs(spring.v) < 0.005) {
          spring.x = target
          spring.v = 0
        } else {
          busy = true
        }
      }

      render()
      frame.current = busy ? requestAnimationFrame(step) : null
    }

    // Retargeting mid-flight keeps current position and velocity — no jump.
    if (frame.current !== null) cancelAnimationFrame(frame.current)
    frame.current = requestAnimationFrame(step)
    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current)
      frame.current = null
    }
  }, [target])

  const { page, lead, trail } = springs.current
  return { page: page.x, pageVelocity: page.v, lead: lead.x, trail: trail.x }
}
