'use client' // photo preparation and the estimate request

import { useCallback, useRef, useState } from 'react'
import { z } from 'zod'
import { type MacroEstimate, MacroEstimateSchema } from '@/lib/ai/schemas'
import { type PreparedPhoto, preparePhoto } from './prepare-photo'

export type PhotoLogState =
  | { phase: 'idle' }
  | { phase: 'preparing' }
  | { phase: 'estimating'; photo: PreparedPhoto }
  /** `draft` holds the user's edits when a failed save reopens the sheet. */
  | { phase: 'ready'; photo: PreparedPhoto; estimate: MacroEstimate; draft?: PhotoLogDraft }
  | { phase: 'not-food'; photo: PreparedPhoto }
  | { phase: 'error'; photo: PreparedPhoto | null; message: string }

export type PhotoLogDraft = { name: string; calories: number; protein: number; note: string }

const EstimateResponseSchema = z.object({ estimate: MacroEstimateSchema })
const ErrorResponseSchema = z.object({ error: z.string() })

export function usePhotoLog() {
  const [state, setState] = useState<PhotoLogState>({ phase: 'idle' })
  const requestRef = useRef(0)

  const estimate = useCallback(async (photo: PreparedPhoto, note?: string) => {
    const requestId = ++requestRef.current
    setState({ phase: 'estimating', photo })
    try {
      const response = await fetch('/api/meal-log/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: photo.base64, mediaType: photo.mediaType, note: note?.trim() || undefined }),
      })
      const body: unknown = await response.json().catch(() => null)
      if (requestId !== requestRef.current) return
      if (!response.ok) {
        const parsed = ErrorResponseSchema.safeParse(body)
        setState({ phase: 'error', photo, message: parsed.success ? parsed.data.error : "Couldn't estimate this photo." })
        return
      }
      const { estimate: result } = EstimateResponseSchema.parse(body)
      setState(result.isFood ? { phase: 'ready', photo, estimate: result } : { phase: 'not-food', photo })
    } catch {
      if (requestId === requestRef.current) {
        setState({ phase: 'error', photo, message: 'Check your connection and try again.' })
      }
    }
  }, [])

  const start = useCallback(async (file: File) => {
    const requestId = ++requestRef.current
    setState({ phase: 'preparing' })
    try {
      const photo = await preparePhoto(file)
      if (requestId !== requestRef.current) return
      await estimate(photo)
    } catch {
      if (requestId === requestRef.current) {
        setState({ phase: 'error', photo: null, message: "That photo couldn't be opened. Try another." })
      }
    }
  }, [estimate])

  const reset = useCallback(() => {
    requestRef.current += 1
    setState({ phase: 'idle' })
  }, [])

  /** Puts a previous state back, with the user's edits — used when saving a confirmed estimate fails. */
  const restore = useCallback((previous: PhotoLogState, draft: PhotoLogDraft) => {
    requestRef.current += 1
    setState(previous.phase === 'ready' ? { ...previous, draft } : previous)
  }, [])

  return { state, start, estimate, reset, restore }
}
