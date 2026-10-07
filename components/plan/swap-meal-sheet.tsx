import { BottomSheet } from '@/components/component-library'
import { FoodArtwork } from '@/components/today/food-artwork'
import { illustratedMealNames } from '@/lib/ai/schemas'
import type { MealSlotLabel } from '@/lib/plans/plan-day'
import { type MealSlotId, getUsualSlotForMeal } from '@/lib/recommendations'
import { NeutralChip } from './swipe-meal-row'

export type SwapTarget = {
  date: string
  slot: MealSlotLabel
  name: string
  calories: number
  protein: number
  /** Meals already planned that day — not offered again. */
  dayMealNames: string[]
}

const MAX_OPTIONS = 3

/** Same-slot meals first (a breakfast for a breakfast), then the rest, skipping the day's meals. */
export function getSwapOptions(target: SwapTarget) {
  const slotId = target.slot.toLowerCase() as MealSlotId
  return illustratedMealNames
    .filter((name) => !target.dayMealNames.includes(name))
    .map((name) => ({ name, sameSlot: getUsualSlotForMeal(name) === slotId }))
    .sort((a, b) => Number(b.sameSlot) - Number(a.sameSlot))
    .slice(0, MAX_OPTIONS)
    .map(({ name }) => name)
}

export function SwapMealSheet({
  target,
  onClose,
  onChoose,
}: {
  target: SwapTarget | null
  onClose: () => void
  onChoose: (name: string) => void
}) {
  const options = target ? getSwapOptions(target) : []
  const slotId = target ? (target.slot.toLowerCase() as MealSlotId) : 'breakfast'

  return (
    <BottomSheet open={target !== null} onClose={onClose} title={target ? `Swap ${target.slot.toLowerCase()}` : ''}>
      {target && (
        <div className="flex flex-col gap-3 pb-4">
          <p className="text-[13px] leading-[18px] text-[var(--color-text-secondary)]">
            Portions adjust to keep {target.calories} cal and {target.protein}g protein.
          </p>
          <ul className="flex flex-col gap-2">
            {options.map((name) => (
              <li key={name}>
                <button
                  type="button"
                  onClick={() => onChoose(name)}
                  className="flex w-full items-center gap-3 rounded-[12px] border border-[var(--today-border)] bg-[var(--today-surface)] p-2 text-left transition-colors duration-150 active:bg-[var(--today-cell)]"
                >
                  <span className="relative h-12 w-14 flex-none overflow-hidden rounded-[8px] bg-[var(--today-food-tile)]">
                    <FoodArtwork meal={{ id: slotId, name }} className="absolute inset-0 h-full w-full" />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="truncate text-[14px] font-medium leading-5 text-[var(--today-text-primary)]">{name}</span>
                    <span className="flex gap-1">
                      <NeutralChip>{`${target.calories} cal`}</NeutralChip>
                      <NeutralChip>{`${target.protein}g protein`}</NeutralChip>
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </BottomSheet>
  )
}
