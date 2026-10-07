'use client' // editable estimate form

import { type FormEvent, useState } from 'react'
import { BottomSheet, Button, TextInput, TextareaField } from '@/components/component-library'
import type { MacroEstimate } from '@/lib/ai/schemas'
import type { PhotoLogDraft, PhotoLogState } from './use-photo-log'

export type PhotoLogValues = PhotoLogDraft

const CONFIDENCE_LABEL: Record<MacroEstimate['confidence'], string> = {
  low: 'Low confidence',
  medium: 'Medium confidence',
  high: 'High confidence',
}

function EstimateForm({
  estimate,
  draft,
  onReestimate,
  onLog,
  onRetake,
}: {
  estimate: MacroEstimate
  draft?: PhotoLogDraft
  onReestimate: (note: string) => void
  onLog: (values: PhotoLogValues) => void
  onRetake: () => void
}) {
  const [name, setName] = useState(draft?.name ?? estimate.name)
  const [calories, setCalories] = useState(String(draft?.calories ?? estimate.calories))
  const [protein, setProtein] = useState(String(draft?.protein ?? estimate.protein))
  const [note, setNote] = useState(draft?.note ?? '')
  const [errors, setErrors] = useState<{ name?: string; calories?: string; protein?: string }>({})

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const caloriesValue = Number(calories)
    const proteinValue = Number(protein)
    const nextErrors: typeof errors = {}
    if (!name.trim()) nextErrors.name = 'Add a name'
    if (!Number.isFinite(caloriesValue) || caloriesValue <= 0) nextErrors.calories = 'Use a number above 0'
    if (!Number.isFinite(proteinValue) || proteinValue < 0) nextErrors.protein = 'Use 0 or more'
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }
    onLog({ name: name.trim(), calories: Math.round(caloriesValue), protein: Math.round(proteinValue), note: note.trim() })
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={submit}>
      <p className="text-[13px] leading-[18px] text-[var(--color-text-secondary)]">
        <span className="font-medium text-[var(--color-text-primary)]">{CONFIDENCE_LABEL[estimate.confidence]}.</span>{' '}
        {estimate.portionNote}
      </p>
      <TextInput label="Meal" value={name} onChange={(event) => setName(event.target.value)} error={errors.name} />
      <div className="grid grid-cols-2 gap-3">
        <TextInput
          label="Calories"
          value={calories}
          onChange={(event) => setCalories(event.target.value)}
          inputMode="numeric"
          error={errors.calories}
        />
        <TextInput
          label="Protein (g)"
          value={protein}
          onChange={(event) => setProtein(event.target.value)}
          inputMode="numeric"
          error={errors.protein}
        />
      </div>
      <div className="flex flex-col gap-2">
        <TextareaField
          label="Anything the photo misses?"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          maxLength={200}
          placeholder="2 cups of rice, cooked in palm oil"
        />
        <Button type="button" variant="secondary" size="sm" disabled={!note.trim()} onClick={() => onReestimate(note)}>
          Re-estimate with note
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Button type="button" variant="secondary" onClick={onRetake}>Retake</Button>
        <Button type="submit">Log it</Button>
      </div>
    </form>
  )
}

export function PhotoLogSheet({
  state,
  onClose,
  onRetake,
  onReestimate,
  onLog,
  onLogManually,
}: {
  state: PhotoLogState
  onClose: () => void
  onRetake: () => void
  onReestimate: (note: string) => void
  onLog: (values: PhotoLogValues) => void
  onLogManually: () => void
}) {
  const photo = state.phase === 'idle' || state.phase === 'preparing' ? null : state.photo

  return (
    <BottomSheet open={state.phase !== 'idle'} onClose={onClose} title="Log from photo">
      <div className="flex flex-col gap-4 pb-4">
        {photo ? (
          // A data URL preview of the user's own photo; next/image adds nothing here.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo.previewUrl} alt="Your meal" className="h-44 w-full rounded-[12px] object-cover" />
        ) : (
          <div className="h-44 w-full animate-pulse rounded-[12px] bg-[var(--color-bg-secondary)]" />
        )}

        {(state.phase === 'preparing' || state.phase === 'estimating') && (
          <p role="status" className="text-[15px] font-medium text-[var(--color-text-secondary)]">
            Estimating calories and protein…
          </p>
        )}

        {state.phase === 'ready' && (
          // Keyed on the estimate so a re-estimate refills the fields.
          <EstimateForm
            key={`${state.estimate.name}-${state.estimate.calories}-${state.estimate.protein}-${state.draft ? 'draft' : 'fresh'}`}
            estimate={state.estimate}
            draft={state.draft}
            onReestimate={onReestimate}
            onLog={onLog}
            onRetake={onRetake}
          />
        )}

        {state.phase === 'not-food' && (
          <>
            <p className="text-[15px] text-[var(--color-text-primary)]">Couldn&apos;t see any food in that photo.</p>
            <div className="grid grid-cols-2 gap-3">
              <Button type="button" variant="secondary" onClick={onLogManually}>Log manually</Button>
              <Button type="button" onClick={onRetake}>Retake</Button>
            </div>
          </>
        )}

        {state.phase === 'error' && (
          <>
            <p className="text-[15px] text-[var(--color-text-primary)]">{state.message}</p>
            <div className="grid grid-cols-2 gap-3">
              <Button type="button" variant="secondary" onClick={onLogManually}>Log manually</Button>
              {state.photo ? (
                <Button type="button" onClick={() => onReestimate('')}>Try again</Button>
              ) : (
                <Button type="button" onClick={onRetake}>Retake</Button>
              )}
            </div>
          </>
        )}
      </div>
    </BottomSheet>
  )
}
