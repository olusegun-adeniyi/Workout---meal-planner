import type { ComponentType, ReactNode } from 'react'
import { CardTitle, TodayCard } from './meal-cards'
import { FireIcon, ProteinIcon } from './icons'

// Semicircle: centre (46.5, 51), r 41.5 → arc length πr.
const ARC_PATH = 'M 5 51 A 41.5 41.5 0 0 1 88 51'
const ARC_LENGTH = Math.PI * 41.5

function Gauge({
  value,
  target,
  colorVar,
  Icon,
}: {
  value: number
  target: number
  colorVar: string
  Icon: ComponentType<{ size?: number; className?: string }>
}) {
  const ratio = target > 0 ? Math.min(1, value / target) : 0

  return (
    <div className="relative h-[58px] w-[93px] flex-none">
      <svg width={93} height={58} viewBox="0 0 93 58" className="absolute inset-0" aria-hidden>
        <path d={ARC_PATH} fill="none" stroke="var(--today-gauge-track)" strokeWidth={9} strokeLinecap="round" />
        {/* A zero-length round-capped dash still paints a dot, so skip it when empty. */}
        {ratio > 0 && (
          <path
            d={ARC_PATH}
            fill="none"
            stroke={colorVar}
            strokeWidth={9}
            strokeLinecap="round"
            strokeDasharray={`${ratio * ARC_LENGTH} ${ARC_LENGTH * 2}`}
            className="transition-[stroke-dasharray] duration-500 ease-out"
          />
        )}
      </svg>
      <Icon size={29} className="absolute left-[32px] top-[22px] text-[var(--today-button-primary)]" />
    </div>
  )
}

function StatTile({
  label,
  value,
  goal,
  gauge,
  loading,
}: {
  label: string
  value: string
  goal: string
  gauge: ReactNode
  loading: boolean
}) {
  return (
    <div className="flex h-[166px] min-w-0 flex-1 flex-col items-center gap-2 rounded-[20px] bg-[var(--today-cell)] p-4">
      <span className="text-[14px] font-medium leading-5 text-[var(--today-text-secondary)]">{label}</span>
      {gauge}
      <div className="flex h-10 flex-col items-center justify-center" aria-label={`${value} of ${goal}`}>
        {loading ? (
          <span className="h-5 w-16 animate-pulse rounded-[6px] bg-[var(--today-gauge-track)]" />
        ) : (
          <span className="whitespace-nowrap text-[20px] font-semibold leading-5 text-[var(--today-text-value)]">{value}</span>
        )}
        <span className="whitespace-nowrap text-[12px] font-medium leading-5 text-[var(--today-text-secondary)]">{goal}</span>
      </div>
    </div>
  )
}

export function DailyTotalsCard({
  calories,
  calorieTarget,
  protein,
  proteinTarget,
  loading = false,
}: {
  calories: number
  calorieTarget: number
  protein: number
  proteinTarget: number
  loading?: boolean
}) {
  return (
    <TodayCard className="gap-5">
      <CardTitle>How you&apos;re doing today</CardTitle>
      <div className="flex gap-4">
        <StatTile
          label="Total calories"
          value={`${calories.toLocaleString('en-GB')} cal`}
          goal={`${calorieTarget.toLocaleString('en-GB')} cal`}
          loading={loading}
          gauge={<Gauge value={calories} target={calorieTarget} colorVar="var(--today-gauge-calories)" Icon={FireIcon} />}
        />
        <StatTile
          label="Total protein"
          value={`${protein}g`}
          goal={`${proteinTarget}g`}
          loading={loading}
          gauge={<Gauge value={protein} target={proteinTarget} colorVar="var(--today-gauge-protein)" Icon={ProteinIcon} />}
        />
      </div>
    </TodayCard>
  )
}
