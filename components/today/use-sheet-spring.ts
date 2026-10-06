'use client' // drives a rAF spring and pointer-captured drag

import { type PointerEvent, useCallback, useEffect, useRef, useState } from 'react'

const RUBBER_BAND = 0.2
const FLICK_VELOCITY = 0.3 // px/ms
const REST_RESET_MS = 80
const TAP_SLOP = 3

type DragState = {
  pointerId: number
  startY: number
  startHeight: number
  lastY: number
  lastTime: number
  velocity: number
  moved: boolean
}

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function useSheetSpring({ min, max, durationMs = 560 }: { min: number; max: number; durationMs?: number }) {
  const [height, setHeightState] = useState(min)
  const heightRef = useRef(min)
  const frameRef = useRef<number | null>(null)
  const dragRef = useRef<DragState | null>(null)
  const boundsRef = useRef({ min, max })
  boundsRef.current = { min, max }

  const setHeight = useCallback((next: number) => {
    heightRef.current = next
    setHeightState(next)
  }, [])

  const stop = useCallback(() => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
    frameRef.current = null
  }, [])

  // Critically damped spring; v0 is the drag's release velocity in px/s.
  const animateTo = useCallback((target: number, v0 = 0) => {
    stop()
    if (prefersReducedMotion()) {
      setHeight(target)
      return
    }

    const omega = 6.5 / (durationMs / 1000)
    let x = heightRef.current
    let v = v0
    let last = performance.now()

    const step = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const substeps = 4
      const h = dt / substeps
      for (let i = 0; i < substeps; i += 1) {
        const a = -omega * omega * (x - target) - 2 * omega * v
        v += a * h
        x += v * h
      }
      if (Math.abs(x - target) < 0.2 && Math.abs(v) < 4) {
        frameRef.current = null
        setHeight(target)
        return
      }
      setHeight(x)
      frameRef.current = requestAnimationFrame(step)
    }

    frameRef.current = requestAnimationFrame(step)
  }, [durationMs, setHeight, stop])

  useEffect(() => stop, [stop])

  // Month row count can change at midnight on the 1st; keep an open sheet open.
  const previousMax = useRef(max)
  useEffect(() => {
    const wasOpen = heightRef.current > (min + previousMax.current) / 2
    previousMax.current = max
    if (wasOpen && !dragRef.current) animateTo(max)
  }, [animateTo, max, min])

  const expand = useCallback(() => animateTo(boundsRef.current.max), [animateTo])
  const collapse = useCallback(() => animateTo(boundsRef.current.min), [animateTo])
  const toggle = useCallback(() => {
    const { min: lo, max: hi } = boundsRef.current
    animateTo(heightRef.current > (lo + hi) / 2 ? lo : hi)
  }, [animateTo])

  const onPointerDown = useCallback((event: PointerEvent<HTMLElement>) => {
    event.preventDefault()
    stop()
    event.currentTarget.setPointerCapture(event.pointerId)
    dragRef.current = {
      pointerId: event.pointerId,
      startY: event.clientY,
      startHeight: heightRef.current,
      lastY: event.clientY,
      lastTime: performance.now(),
      velocity: 0,
      moved: false,
    }
  }, [stop])

  const onPointerMove = useCallback((event: PointerEvent<HTMLElement>) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return

    const dy = event.clientY - drag.startY
    if (Math.abs(dy) > TAP_SLOP) drag.moved = true

    const now = performance.now()
    const dt = now - drag.lastTime
    if (dt > 0) drag.velocity = 0.6 * drag.velocity + 0.4 * ((event.clientY - drag.lastY) / dt)
    drag.lastY = event.clientY
    drag.lastTime = now

    const { min: lo, max: hi } = boundsRef.current
    let next = drag.startHeight + dy
    if (next > hi) next = hi + (next - hi) * RUBBER_BAND
    if (next < lo) next = lo - (lo - next) * RUBBER_BAND
    setHeight(next)
  }, [setHeight])

  const onPointerUp = useCallback((event: PointerEvent<HTMLElement>) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    dragRef.current = null

    const { min: lo, max: hi } = boundsRef.current
    const mid = (lo + hi) / 2
    // A finger that paused before lifting shouldn't flick.
    const velocity = performance.now() - drag.lastTime > REST_RESET_MS ? 0 : drag.velocity

    if (!drag.moved) {
      animateTo(drag.startHeight > mid ? lo : hi)
      return
    }

    let target: number
    if (velocity > FLICK_VELOCITY) target = hi
    else if (velocity < -FLICK_VELOCITY) target = lo
    else target = heightRef.current > mid ? hi : lo
    animateTo(target, velocity * 1000)
  }, [animateTo])

  return {
    height,
    expand,
    collapse,
    toggle,
    handleProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
    },
  }
}
