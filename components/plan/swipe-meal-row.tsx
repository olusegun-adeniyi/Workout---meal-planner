import type { PointerEvent } from 'react'
import { SwapIcon } from '@/components/today/icons'
import { SWIPE_OPEN } from './use-row-swipe'

const clamp01 = (x: number) => Math.max(0, Math.min(1, x))
function smoothstep(a: number, b: number, x: number) {
  const t = clamp01((x - a) / (b - a))
  return t * t * (3 - 2 * t)
}

export function NeutralChip({ children }: { children: string }) {
  return (
    <span className="flex h-5 items-center whitespace-nowrap rounded-[6px] bg-[var(--today-chip-neutral)] px-2 py-0.5 text-[12px] font-medium leading-4 text-[var(--today-text-inactive)]">
      {children}
    </span>
  )
}

export function SwipeMealRow({
  name,
  calories,
  protein,
  time,
  offset,
  isLast,
  onPointerDown,
  onSwap,
  onSwapFocus,
}: {
  name: string
  calories: number
  protein: number
  time: string
  /** ≤ 0 when opening (Swap revealed), > 0 for the rightward rubber band. */
  offset: number
  isLast: boolean
  onPointerDown: (event: PointerEvent<HTMLElement>) => void
  onSwap: () => void
  /** Keyboard users can't swipe; focusing Swap reveals it. */
  onSwapFocus: () => void
}) {
  const openFraction = clamp01(-offset / SWIPE_OPEN)
  const radius = 16 * Math.min(1, openFraction * 1.5)
  const slotProgress = smoothstep(0.15, 0.9, openFraction)

  return (
    <li
      onPointerDown={onPointerDown}
      className={`relative h-[81px] overflow-hidden bg-[var(--today-segment-track)] [touch-action:pan-y] ${
        isLast ? '' : 'border-b border-[var(--today-border)]'
      }`}
    >
      <button
        type="button"
        onClick={onSwap}
        onFocus={onSwapFocus}
        aria-label={`Swap ${name}`}
        className="absolute inset-y-0 right-0 flex w-[52px] flex-col items-center justify-center text-[var(--today-text-secondary)] outline-none focus-visible:opacity-100 active:bg-[var(--today-border)]"
        style={{ opacity: slotProgress, transform: `scale(${0.8 + 0.2 * smoothstep(0, 1, openFraction)})` }}
      >
        <SwapIcon size={18} />
        <span className="whitespace-nowrap text-[12px] font-medium leading-4">Swap</span>
      </button>

      {/* The foreground narrows rather than sliding, so its content reflows instead of hiding. */}
      <div
        className="absolute inset-y-0 left-0 flex cursor-grab bg-[var(--today-surface)] px-3 py-4"
        style={{
          width: `calc(100% - ${Math.max(0, -offset)}px)`,
          transform: `translateX(${Math.max(0, offset)}px)`,
          borderRadius: `0 ${radius}px ${radius}px 0`,
          boxShadow: openFraction > 0.01 ? '1px 0 0 0 var(--today-border)' : 'none',
        }}
      >
        <div className="flex h-12 min-w-0 flex-1 flex-col justify-center gap-2">
          <p className="truncate text-[14px] font-medium leading-5 text-[var(--today-text-primary)]">{name}</p>
          <div className="flex h-5 items-center gap-2">
            <div className="flex flex-1 items-center gap-1">
              <NeutralChip>{`${calories} cal`}</NeutralChip>
              <NeutralChip>{`${protein}g protein`}</NeutralChip>
            </div>
            <span className="whitespace-nowrap text-[12px] font-normal leading-4 text-[var(--today-text-secondary)]">{time}</span>
          </div>
        </div>
      </div>
    </li>
  )
}
