import type { ComponentType } from 'react'
import { CalendarIcon, HomeIcon, PlusIcon, ProgressIcon } from '@/components/today/icons'
import type { TabMotion } from './use-tab-springs'

export type ShellTab = 'today' | 'plan' | 'progress'

// labelWidth is the rendered width of the 11px Inter label; it sets how far each
// tab grows when active, so the pill hugs the label exactly as in the handoff.
export const SHELL_TABS: { id: ShellTab; label: string; labelWidth: number; Icon: ComponentType<{ size?: number }> }[] = [
  { id: 'today', label: 'Today', labelWidth: 29, Icon: HomeIcon },
  { id: 'plan', label: 'Plan', labelWidth: 23, Icon: CalendarIcon },
  { id: 'progress', label: 'Progress', labelWidth: 45, Icon: ProgressIcon },
]

const ICON = 24
const GAP = 24
const LABEL_GAP = 3
const PILL_PADDING = 10

const clamp01 = (x: number) => Math.max(0, Math.min(1, x))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
function smoothstep(a: number, b: number, x: number) {
  const t = clamp01((x - a) / (b - a))
  return t * t * (3 - 2 * t)
}

/** Value of a per-tab array at a fractional tab position. */
function at(values: number[], position: number) {
  const q = Math.max(0, Math.min(values.length - 1, position))
  const i = Math.min(values.length - 2, Math.floor(q))
  return lerp(values[i], values[i + 1], q - i)
}

export function TabBar({
  motion,
  activeTab,
  onSelect,
  logOpen,
  onToggleLog,
}: {
  motion: TabMotion
  activeTab: ShellTab
  onSelect: (tab: ShellTab) => void
  logOpen: boolean
  onToggleLog: () => void
}) {
  const xs: number[] = []
  const widths: number[] = []
  let cursor = 0
  const tabs = SHELL_TABS.map((tab, index) => {
    const activation = clamp01(1 - Math.abs(motion.page - index))
    const width = ICON + activation * (LABEL_GAP + PILL_PADDING * 2 + tab.labelWidth)
    xs.push(cursor)
    widths.push(width)
    cursor += width + GAP
    return { ...tab, activation, width }
  })

  const edgeLeft = (q: number) => at(xs, q)
  const edgeRight = (q: number) => at(xs, q) + at(widths, q)
  const indicatorLeft = Math.min(edgeLeft(motion.lead), edgeLeft(motion.trail))
  const indicatorRight = Math.max(edgeRight(motion.lead), edgeRight(motion.trail))

  return (
    <nav
      aria-label="Primary"
      className="flex items-center gap-10 px-8 pt-3"
      style={{ paddingBottom: 'max(28px, env(safe-area-inset-bottom))' }}
    >
      <div className="relative h-8 flex-1">
        <span
          aria-hidden
          className="absolute top-0 h-8 rounded-[80px] bg-[var(--today-tab-active)]"
          style={{ left: indicatorLeft, width: indicatorRight - indicatorLeft }}
        />
        <div className="relative flex h-8 items-center gap-6">
          {tabs.map(({ id, label, Icon, activation, width }) => (
            <button
              key={id}
              type="button"
              onClick={() => onSelect(id)}
              aria-label={label}
              aria-current={id === activeTab ? 'page' : undefined}
              className="flex h-8 flex-none items-center gap-[3px] overflow-hidden"
              style={{ width, paddingLeft: PILL_PADDING * activation }}
            >
              <span className="relative size-6 flex-none">
                <span className="absolute inset-0 text-[var(--today-text-inactive)]" style={{ opacity: 1 - activation }}>
                  <Icon size={ICON} />
                </span>
                <span className="absolute inset-0 text-[var(--today-surface)]" style={{ opacity: activation }}>
                  <Icon size={ICON} />
                </span>
              </span>
              <span
                aria-hidden
                className="whitespace-nowrap py-0.5 text-[11px] font-medium leading-[14px] text-[var(--today-surface)]"
                style={{ opacity: smoothstep(0.4, 1, activation) }}
              >
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={onToggleLog}
        aria-expanded={logOpen}
        aria-haspopup="menu"
        className={`flex h-10 w-[113px] flex-none items-center justify-center gap-1 rounded-[80px] px-4 shadow-[inset_0_0_0_0.5px_var(--today-border),0_0_0_0.5px_var(--today-border)] transition-colors duration-200 active:bg-[var(--today-cell)] ${
          logOpen ? 'bg-[var(--today-segment-track)]' : 'bg-[var(--today-surface)]'
        }`}
      >
        <span className="text-[var(--today-text-primary)]"><PlusIcon size={16} /></span>
        <span className="whitespace-nowrap text-[14px] font-medium leading-5 text-[var(--today-text-primary)]">Log meal</span>
      </button>
    </nav>
  )
}
