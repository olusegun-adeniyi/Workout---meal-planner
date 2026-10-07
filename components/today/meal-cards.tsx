import type { ComponentType, ReactNode } from 'react'
import type { RecommendedMeal } from '@/lib/recommendations'
import { FoodArtwork } from './food-artwork'
import { CheckIcon, ClockIcon, CloseIcon, FireIcon, ProteinIcon } from './icons'

export function TodayCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <section className={`flex flex-col rounded-[28px] bg-[var(--today-surface)] p-4 shadow-[inset_0_0_0_1px_var(--today-border)] ${className}`}>
      {children}
    </section>
  )
}

export function CardTitle({ children }: { children: ReactNode }) {
  return <h2 className="flex-1 text-[14px] font-medium leading-5 text-[var(--today-text-primary)]">{children}</h2>
}

export function MacroChip({ Icon, children }: { Icon: ComponentType<{ size?: number }>; children: ReactNode }) {
  return (
    <span className="flex h-5 items-center gap-1 whitespace-nowrap rounded-[6px] bg-[var(--today-info-bg)] py-0.5 pl-1 pr-2 text-[12px] font-medium leading-4 text-[var(--today-info)]">
      <Icon size={16} />
      {children}
    </span>
  )
}

type PillButtonProps = {
  variant: 'primary' | 'secondary'
  onClick: () => void
  children: ReactNode
}

export function PillButton({ variant, onClick, children }: PillButtonProps) {
  const styles = variant === 'primary'
    ? 'bg-[var(--today-button-primary)] text-[var(--today-surface)] active:bg-[var(--today-button-primary-pressed)]'
    : 'bg-[var(--today-surface)] text-[var(--today-text-secondary)] shadow-[inset_0_0_0_0.5px_var(--today-border),0_0_0_0.5px_var(--today-border)] active:bg-[var(--today-cell)]'

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-12 flex-1 items-center justify-center gap-1 whitespace-nowrap rounded-[80px] px-4 text-[14px] font-medium leading-5 transition-colors duration-150 ease-out ${styles}`}
    >
      {children}
    </button>
  )
}

function MealSummary({ meal }: { meal: RecommendedMeal }) {
  return (
    <div className="flex h-[94px] gap-3">
      <div className="relative h-[94px] w-[108px] flex-none overflow-hidden rounded-[12px] bg-[var(--today-food-tile)]">
        <FoodArtwork meal={meal} className="absolute left-[-4px] top-[6px] h-[86px] w-[115px]" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
        <p className="line-clamp-3 text-[16px] font-medium leading-[22px] text-[var(--today-text-primary)]">{meal.name}</p>
        <div className="flex items-center gap-2">
          <MacroChip Icon={FireIcon}>{meal.calories} cal</MacroChip>
          <MacroChip Icon={ProteinIcon}>{meal.protein}g protein</MacroChip>
        </div>
      </div>
    </div>
  )
}

export function NextSuggestionCard({
  meal,
  onAte,
  onSkip,
}: {
  meal: RecommendedMeal
  onAte: () => void
  onSkip: () => void
}) {
  return (
    <TodayCard className="gap-6">
      <div className="flex items-start justify-between">
        <CardTitle>Next suggestion</CardTitle>
        <span className="flex h-[26px] items-center gap-1 rounded-[8px] py-0.5 pl-1 pr-2 shadow-[inset_0_0_0_1px_var(--today-border)]">
          <ClockIcon size={18} className="text-[var(--today-icon-accent)]" />
          <span className="whitespace-nowrap text-[14px] font-medium leading-5 text-[var(--today-text-secondary)]">{meal.time}</span>
        </span>
      </div>
      <MealSummary meal={meal} />
      <div className="flex gap-3">
        <PillButton variant="secondary" onClick={onSkip}>
          Skip meal
          <CloseIcon size={16} />
        </PillButton>
        <PillButton variant="primary" onClick={onAte}>
          Ate it
          <CheckIcon size={16} />
        </PillButton>
      </div>
    </TodayCard>
  )
}

export function SkipConfirmCard({
  meal,
  onConfirm,
  onCancel,
}: {
  meal: RecommendedMeal
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <TodayCard className="gap-6">
      <CardTitle>Skip {meal.slot.toLowerCase()}?</CardTitle>
      <MealSummary meal={meal} />
      <div className="flex gap-3">
        <PillButton variant="secondary" onClick={onConfirm}>Yes, skip it</PillButton>
        <PillButton variant="primary" onClick={onCancel}>Keep it</PillButton>
      </div>
    </TodayCard>
  )
}

export function AllCaughtUpCard({ calories, protein }: { calories: number; protein: number }) {
  return (
    <TodayCard className="gap-2">
      <CardTitle>Next suggestion</CardTitle>
      <p className="text-[16px] font-medium leading-[22px] text-[var(--today-text-primary)]">You&apos;re done for today</p>
      <p className="text-[14px] leading-5 text-[var(--today-text-secondary)]">
        {calories.toLocaleString('en-GB')} cal · {protein}g protein logged
      </p>
    </TodayCard>
  )
}

/** `caption` names a slow step (AI planning) so a long wait doesn't read as broken. */
export function SuggestionSkeleton({ caption }: { caption?: string }) {
  return (
    <TodayCard className="gap-6">
      {caption && (
        <p role="status" className="text-[14px] font-medium leading-5 text-[var(--today-text-secondary)]">{caption}</p>
      )}
      <div aria-busy className="flex animate-pulse flex-col gap-6" aria-label="Loading today's meals">
        <div className="flex items-center justify-between">
          <span className="h-5 w-32 rounded-[6px] bg-[var(--today-cell)]" />
          <span className="h-[26px] w-20 rounded-[8px] bg-[var(--today-cell)]" />
        </div>
        <div className="flex h-[94px] gap-3">
          <span className="h-[94px] w-[108px] flex-none rounded-[12px] bg-[var(--today-cell)]" />
          <div className="flex flex-1 flex-col justify-center gap-2">
            <span className="h-5 w-full rounded-[6px] bg-[var(--today-cell)]" />
            <span className="h-5 w-2/3 rounded-[6px] bg-[var(--today-cell)]" />
          </div>
        </div>
        <div className="flex gap-3">
          <span className="h-12 flex-1 rounded-[80px] bg-[var(--today-cell)]" />
          <span className="h-12 flex-1 rounded-[80px] bg-[var(--today-cell)]" />
        </div>
      </div>
    </TodayCard>
  )
}

export function LogsStatusCard({
  title,
  body,
  onRetry,
}: {
  title: string
  body: string
  onRetry: () => void
}) {
  return (
    <TodayCard className="gap-4">
      <div className="flex flex-col gap-1">
        <CardTitle>{title}</CardTitle>
        <p className="text-[14px] leading-5 text-[var(--today-text-secondary)]">{body}</p>
      </div>
      <div className="flex">
        <PillButton variant="secondary" onClick={onRetry}>Try again</PillButton>
      </div>
    </TodayCard>
  )
}

export function EmptyLogsCard() {
  return (
    <TodayCard className="gap-1">
      <CardTitle>Logged</CardTitle>
      <p className="text-[14px] leading-5 text-[var(--today-text-secondary)]">Nothing was logged this day.</p>
    </TodayCard>
  )
}
