import type { RecommendedWorkout } from '@/lib/recommendations'
import { Toggle } from '@/components/component-library'
import { FoodArtwork } from './food-artwork'
import { CardTitle, MacroChip, PillButton, TodayCard } from './meal-cards'
import { CheckIcon, FireIcon, ProteinIcon } from './icons'

export type MealListItem = {
  key: string
  time: string
  name: string
  calories: number
  protein: number
  skipped?: boolean
  /** Only recommended meals have artwork; manual logs don't. */
  artwork?: { id: 'breakfast' | 'brunch' | 'lunch' | 'dinner'; name: string }
}

export function MealListCard({ title, subtitle, items }: { title: string; subtitle?: string; items: MealListItem[] }) {
  return (
    <TodayCard className="gap-4">
      <div className="flex items-start justify-between gap-3">
        <CardTitle>{title}</CardTitle>
        {subtitle && (
          <span className="whitespace-nowrap text-[12px] font-medium leading-5 text-[var(--today-text-secondary)]">{subtitle}</span>
        )}
      </div>
      <ul className="flex flex-col gap-3">
        {items.map((item) => (
          <li key={item.key} className="flex items-center gap-3">
            <div className="relative h-12 w-14 flex-none overflow-hidden rounded-[8px] bg-[var(--today-food-tile)]">
              {item.artwork && <FoodArtwork meal={item.artwork} className="absolute inset-0 h-full w-full" />}
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <p className={`truncate text-[14px] font-medium leading-5 ${
                item.skipped ? 'text-[var(--today-text-tertiary)] line-through' : 'text-[var(--today-text-primary)]'
              }`}
              >
                {item.name}
              </p>
              <div className="flex items-center gap-2">
                <MacroChip Icon={FireIcon}>{item.calories} cal</MacroChip>
                <MacroChip Icon={ProteinIcon}>{item.protein}g</MacroChip>
              </div>
            </div>
            <span className="flex-none text-[12px] font-medium leading-4 text-[var(--today-text-tertiary)]">
              {item.skipped ? 'Skipped' : item.time}
            </span>
          </li>
        ))}
      </ul>
    </TodayCard>
  )
}

export function WorkoutTodayCard({
  workout,
  completedTime,
  onComplete,
}: {
  workout: RecommendedWorkout
  /** London HH:mm when logged; null when not done. */
  completedTime: string | null
  onComplete?: () => void
}) {
  return (
    <TodayCard className="gap-6">
      <div className="flex items-start justify-between gap-3">
        <CardTitle>{workout.splitLabel}</CardTitle>
        <span className="whitespace-nowrap text-[12px] font-medium leading-5 text-[var(--today-text-secondary)]">
          {workout.exerciseCount} exercises · {workout.estimatedMinutes} min
        </span>
      </div>
      <p className="-mt-4 text-[16px] font-medium leading-[22px] text-[var(--today-text-primary)]">{workout.muscleGroups}</p>
      <ul className="flex flex-col gap-1">
        {workout.exercises.map((exercise) => (
          <li key={exercise.name} className="flex items-center justify-between gap-3 rounded-[8px] bg-[var(--today-cell)] px-3 py-2.5">
            <span className="truncate text-[14px] font-medium leading-5 text-[var(--today-text-primary)]">{exercise.name}</span>
            <span className="flex-none text-[12px] font-medium leading-4 text-[var(--today-text-secondary)]">{exercise.target}</span>
          </li>
        ))}
      </ul>
      {completedTime ? (
        <p className="flex h-12 items-center justify-center gap-1 rounded-[80px] bg-[var(--today-info-bg)] text-[14px] font-medium leading-5 text-[var(--today-info)]">
          <CheckIcon size={16} />
          Done at {completedTime}
        </p>
      ) : onComplete && (
        <div className="flex">
          <PillButton variant="primary" onClick={onComplete}>
            Mark done
            <CheckIcon size={16} />
          </PillButton>
        </div>
      )}
    </TodayCard>
  )
}

export function RemindersCard({
  enabled,
  busy,
  description,
  onToggle,
  onSendTest,
}: {
  enabled: boolean
  busy: boolean
  description: string
  onToggle: (enabled: boolean) => void
  onSendTest: () => void
}) {
  return (
    <TodayCard className="gap-4">
      <div className="flex flex-col gap-1">
        <Toggle checked={enabled} onChange={onToggle} label="Meal reminders" />
        <p className="text-[12px] font-medium leading-4 text-[var(--today-text-secondary)]">{description}</p>
      </div>
      {enabled && (
        <button
          type="button"
          onClick={onSendTest}
          disabled={busy}
          className="min-h-11 self-start text-[14px] font-medium leading-5 text-[var(--today-info)] disabled:opacity-40"
        >
          {busy ? 'Sending…' : 'Send a test reminder'}
        </button>
      )}
    </TodayCard>
  )
}

export function SelectedDayBar({
  label,
  isPast,
  onBackToToday,
}: {
  label: string
  isPast: boolean
  onBackToToday: () => void
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 flex-col">
        <h2 className="truncate text-[16px] font-medium leading-[22px] text-[var(--today-text-primary)]">{label}</h2>
        <p className="text-[12px] font-medium leading-4 text-[var(--today-text-tertiary)]">
          {isPast ? 'Past day' : 'Planned'}
        </p>
      </div>
      <button
        type="button"
        onClick={onBackToToday}
        className="flex min-h-11 flex-none items-center"
      >
        <span className="flex h-8 items-center rounded-[80px] px-3 text-[14px] font-medium leading-5 text-[var(--today-text-secondary)] shadow-[inset_0_0_0_0.5px_var(--today-border-button),0_0_0_0.5px_var(--today-border-button)] transition-colors duration-150 ease-out active:bg-[var(--today-cell)]">
          Back to today
        </span>
      </button>
    </div>
  )
}
