'use client' // pointer gestures and a rAF spring per row

import { type PointerEvent as ReactPointerEvent, useCallback, useEffect, useReducer, useRef } from 'react'

/** Width of the revealed Swap slot. */
export const SWIPE_OPEN = 52
const SLOP = 6
const PAST_OPEN_RESISTANCE = 0.3
const RIGHTWARD_RESISTANCE = 0.25
const FLICK = 0.25 // px/ms
const REST_RESET_MS = 80
const OMEGA = 22
const ZETA = 0.78

type Row = { x: number; v: number; target: number; dragging: boolean }

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Swipe-to-reveal for a list of rows. Offsets are negative when open. Only one
 * row is open at a time, and a vertical pan is left to the browser to scroll.
 */
export function useRowSwipe(rowCount: number) {
  const rows = useRef<Row[]>([])
  const frame = useRef<number | null>(null)
  const [, render] = useReducer((tick: number) => tick + 1, 0)

  if (rows.current.length !== rowCount) {
    rows.current = Array.from({ length: rowCount }, (_, i) => rows.current[i] ?? { x: 0, v: 0, target: 0, dragging: false })
  }

  const animate = useCallback(() => {
    if (prefersReducedMotion()) {
      for (const row of rows.current) if (!row.dragging) { row.x = row.target; row.v = 0 }
      render()
      return
    }
    if (frame.current !== null) return
    let last = performance.now()
    const step = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      let busy = false
      for (const row of rows.current) {
        if (row.dragging) { busy = true; continue }
        const h = dt / 5
        for (let i = 0; i < 5; i += 1) {
          const a = -OMEGA * OMEGA * (row.x - row.target) - 2 * ZETA * OMEGA * row.v
          row.v += a * h
          row.x += row.v * h
        }
        if (Math.abs(row.x - row.target) < 0.1 && Math.abs(row.v) < 2) {
          row.x = row.target
          row.v = 0
        } else {
          busy = true
        }
      }
      render()
      frame.current = busy ? requestAnimationFrame(step) : null
    }
    frame.current = requestAnimationFrame(step)
  }, [])

  useEffect(() => () => { if (frame.current !== null) cancelAnimationFrame(frame.current) }, [])

  const closeAll = useCallback(() => {
    for (const row of rows.current) row.target = 0
    animate()
  }, [animate])

  /** Opens one row (closing the rest) — used when Swap gets keyboard focus. */
  const openRow = useCallback((index: number) => {
    rows.current.forEach((row, j) => { row.target = j === index ? -SWIPE_OPEN : 0 })
    animate()
  }, [animate])

  const onPointerDown = useCallback((index: number, event: ReactPointerEvent<HTMLElement>) => {
    const row = rows.current[index]
    if (!row) return
    const drag = {
      x0: event.clientX,
      y0: event.clientY,
      start: row.x,
      mode: null as 'h' | 'v' | null,
      lastX: event.clientX,
      lastT: performance.now(),
      velocity: 0,
    }

    const move = (moveEvent: PointerEvent) => {
      const dx = moveEvent.clientX - drag.x0
      const dy = moveEvent.clientY - drag.y0
      if (!drag.mode) {
        if (Math.abs(dx) < SLOP && Math.abs(dy) < SLOP) return
        drag.mode = Math.abs(dx) > Math.abs(dy) ? 'h' : 'v'
        if (drag.mode === 'h') {
          rows.current.forEach((other, j) => { if (j !== index) other.target = 0 })
          row.dragging = true
          animate()
        }
      }
      if (drag.mode !== 'h') return
      moveEvent.preventDefault()

      const now = performance.now()
      const dt = now - drag.lastT
      if (dt > 0) drag.velocity = 0.6 * drag.velocity + 0.4 * ((moveEvent.clientX - drag.lastX) / dt)
      drag.lastX = moveEvent.clientX
      drag.lastT = now

      let x = drag.start + dx
      if (x > 0) x *= RIGHTWARD_RESISTANCE
      if (x < -SWIPE_OPEN) x = -SWIPE_OPEN + (x + SWIPE_OPEN) * PAST_OPEN_RESISTANCE
      row.x = x
      render()
    }

    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)

      if (drag.mode !== 'h') {
        // A plain tap closes whatever is open.
        if (!drag.mode && rows.current.some((other) => other.target !== 0)) closeAll()
        return
      }
      row.dragging = false
      const velocity = performance.now() - drag.lastT > REST_RESET_MS ? 0 : drag.velocity
      row.target = velocity < -FLICK ? -SWIPE_OPEN
        : velocity > FLICK ? 0
          : row.x < -SWIPE_OPEN / 2 ? -SWIPE_OPEN : 0
      row.v = velocity * 1000
      animate()
    }

    window.addEventListener('pointermove', move, { passive: false })
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
  }, [animate, closeAll])

  return {
    offsets: rows.current.map((row) => row.x),
    onPointerDown,
    openRow,
    closeAll,
  }
}
