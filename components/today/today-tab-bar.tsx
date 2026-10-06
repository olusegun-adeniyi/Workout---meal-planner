import type { ComponentType } from 'react'
import { CalendarIcon, HomeIcon, ProgressIcon } from './icons'

export type TodayTab = 'today' | 'plan' | 'progress'

const TABS: { id: TodayTab; label: string; Icon: ComponentType<{ size?: number }> }[] = [
  { id: 'today', label: 'Today', Icon: HomeIcon },
  { id: 'plan', label: 'Plan', Icon: CalendarIcon },
  { id: 'progress', label: 'Progress', Icon: ProgressIcon },
]

export function TodayTabBar({ active, onChange }: { active: TodayTab; onChange: (tab: TodayTab) => void }) {
  return (
    <nav
      aria-label="Primary"
      className="absolute inset-x-0 bottom-0 z-[3] flex items-center justify-between bg-[linear-gradient(179.523deg,transparent_1.46%,var(--today-surface)_54.9%)] px-8 pt-8"
      style={{ paddingBottom: 'max(32px, env(safe-area-inset-bottom))' }}
    >
      {TABS.map(({ id, label, Icon }) => {
        const isActive = id === active
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            aria-current={isActive ? 'page' : undefined}
            className={`flex min-h-[45px] flex-1 flex-col items-center gap-[3px] ${
              isActive ? 'text-[var(--today-brand)]' : 'text-[var(--today-text-inactive)]'
            }`}
          >
            <Icon size={24} />
            <span
              className={`flex h-[18px] items-center rounded-[40px] px-1.5 py-0.5 text-[11px] leading-[14px] ${
                isActive ? 'bg-[var(--today-brand)] font-medium text-[var(--today-surface)]' : 'font-normal'
              }`}
            >
              {label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
