'use client' // remembers the previous selection to pick which edge leads the stretch

import { type CSSProperties, useState } from 'react'

const INSET = 4
const LEAD = 'cubic-bezier(0.2, 0.8, 0.2, 1)'
const TRAIL = 'cubic-bezier(0.6, 0, 0.2, 1)'

function edgeTransitions(direction: 'left' | 'right' | 'none') {
  if (direction === 'none') return undefined
  // The edge in the direction of travel moves first and fast; the trailing edge
  // follows late, so the pill elongates across both segments then settles.
  const leading = direction === 'right' ? 'right' : 'left'
  const trailing = direction === 'right' ? 'left' : 'right'
  return `${leading} 240ms ${LEAD}, ${trailing} 360ms ${TRAIL} 90ms`
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { id: T; label: string }[]
  value: T
  onChange: (value: T) => void
  label: string
}) {
  const count = options.length
  const index = Math.max(0, options.findIndex((option) => option.id === value))
  // Direction is kept until the selection changes again, so an unrelated
  // re-render mid-animation can't drop the transition and snap the pill.
  const [motion, setMotion] = useState<{ index: number; direction: 'left' | 'right' | 'none' }>({ index, direction: 'none' })
  if (motion.index !== index) setMotion({ index, direction: index > motion.index ? 'right' : 'left' })
  const direction = motion.index !== index ? (index > motion.index ? 'right' : 'left') : motion.direction

  const track = `(100% - ${INSET * 2}px)`

  return (
    <div role="tablist" aria-label={label} className="relative flex h-10 items-center rounded-[120px] bg-[var(--today-segment-track)] p-1">
      <span
        aria-hidden
        className="absolute bottom-1 top-1 rounded-[80px] bg-[var(--today-surface)] shadow-[0_1px_1px_rgba(0,0,0,0.08)] [transition:var(--segment-transition,none)] motion-reduce:[transition:none]"
        style={{
          left: `calc(${INSET}px + ${track} * ${index / count})`,
          right: `calc(${INSET}px + ${track} * ${(count - 1 - index) / count})`,
          '--segment-transition': edgeTransitions(direction),
        } as CSSProperties}
      />
      {options.map((option) => {
        const isActive = option.id === value
        return (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(option.id)}
            className={`relative z-[1] flex h-8 flex-1 items-center justify-center rounded-[80px] text-[14px] leading-5 tracking-[0.2px] text-[var(--today-text-segment)] ${
              isActive ? 'font-medium' : 'font-normal'
            }`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
