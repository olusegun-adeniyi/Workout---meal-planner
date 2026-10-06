'use client' // pointer drag, rAF spring and ResizeObserver

import { type MouseEvent, type ReactNode, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
  type LondonDate,
  formatLondonDayLabel,
  getMonthName,
  getMonthWeeks,
} from '@/lib/time/london'
import { REGION_TOP, getCalendarMorph, getSheetBounds } from './calendar-morph'
import { CalendarIcon, ChevronDownIcon, CloseIcon, StreakIcon } from './icons'
import { useSheetSpring } from './use-sheet-spring'

const SHORT_DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const LONG_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const DESIGN_WIDTH = 393
const SAFE_TOP = 'env(safe-area-inset-top)'

const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

type TodayCalendarShellProps = {
  today: LondonDate
  selectedIso: string
  onSelectDate: (iso: string) => void
  /** null while logs load — the badge shouldn't flash a wrong "0". */
  streakDays: number | null
  footer: ReactNode
  children: ReactNode
}

/**
 * Owns the sheet height so the spring re-renders only the sheet; `children`
 * keeps its element identity and React skips it on every frame.
 */
export function TodayCalendarShell({
  today,
  selectedIso,
  onSelectDate,
  streakDays,
  footer,
  children,
}: TodayCalendarShellProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(DESIGN_WIDTH)

  useIsomorphicLayoutEffect(() => {
    const node = rootRef.current
    if (!node) return
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    observer.observe(node)
    setWidth(node.clientWidth)
    return () => observer.disconnect()
  }, [])

  const weeks = useMemo(() => getMonthWeeks(today.year, today.month), [today.year, today.month])
  const monthName = useMemo(() => getMonthName(today.year, today.month), [today.year, today.month])
  const { min, max } = getSheetBounds(weeks.length)
  const sheet = useSheetSpring({ min, max })

  const selectedRow = weeks.findIndex((week) => week.some((day) => day.iso === selectedIso))
  const todayRow = weeks.findIndex((week) => week.some((day) => day.iso === today.iso))
  const activeRow = Math.max(0, selectedRow >= 0 ? selectedRow : todayRow)

  const morph = getCalendarMorph({ height: sheet.height, width, rowCount: weeks.length, activeRow })

  function onHandleClick(event: MouseEvent<HTMLButtonElement>) {
    // Pointer taps are resolved in the drag handler; this path is keyboard only.
    if (event.detail === 0) sheet.toggle()
  }

  return (
    <div ref={rootRef} className="relative h-full w-full overflow-hidden bg-[var(--today-surface)]">
      <section
        aria-label="Calendar"
        className="absolute inset-x-0 top-0 z-[2] overflow-hidden rounded-[24px] bg-[var(--today-surface)] shadow-[inset_0_0_0_1px_var(--today-border-sheet)]"
        style={{ height: `calc(${SAFE_TOP} + ${sheet.height}px)` }}
      >
        <div className="absolute inset-x-0 bottom-0" style={{ top: SAFE_TOP }}>
          <div className="absolute right-4 top-[9px] flex h-5 items-center gap-1 rounded-[8px] bg-[var(--today-brand)] py-0.5 pl-1 pr-2 text-[var(--today-surface)]">
            <StreakIcon size={16} />
            <span className="whitespace-nowrap text-[12px] font-medium leading-4">
              {streakDays === null ? 'Streak' : `${streakDays} ${streakDays === 1 ? 'day' : 'days'} streak`}
            </span>
          </div>

          <div
            className="absolute inset-x-0 overflow-hidden"
            style={{ top: REGION_TOP, height: morph.regionHeight }}
          >
            {weeks.map((week, row) => week.map((day, column) => {
              const frame = morph.rows[row][column]
              const selected = day.iso === selectedIso
              const isToday = day.iso === today.iso

              return (
                <button
                  key={day.iso}
                  type="button"
                  onClick={() => onSelectDate(day.iso)}
                  aria-label={formatLondonDayLabel(day.iso)}
                  aria-pressed={selected}
                  aria-current={isToday ? 'date' : undefined}
                  aria-hidden={!frame.interactive}
                  tabIndex={frame.interactive ? 0 : -1}
                  className="absolute left-0 top-0 h-12 origin-center overflow-hidden rounded-[8px] bg-[var(--today-cell)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--today-date-selected)]"
                  style={{
                    width: frame.width,
                    opacity: frame.opacity,
                    zIndex: frame.zIndex,
                    pointerEvents: frame.interactive ? 'auto' : 'none',
                    transform: `translate3d(${frame.x}px, ${frame.y}px, 0) scale(${frame.scale})`,
                  }}
                >
                  {selected ? (
                    <span
                      className="absolute inset-x-2.5 flex h-4 items-center justify-center rounded-[12px] bg-[var(--today-date-selected)] text-[12px] font-medium leading-4 text-[var(--today-surface)]"
                      style={{ top: morph.numberY }}
                    >
                      {day.day}
                    </span>
                  ) : (
                    <span
                      className={`absolute inset-x-0 text-center text-[12px] font-medium leading-4 ${
                        day.inMonth ? 'text-[var(--today-text-secondary)]' : 'text-[var(--today-text-tertiary)]'
                      }`}
                      style={{ top: morph.numberY }}
                    >
                      {day.day}
                    </span>
                  )}
                  {isToday && (
                    <span className="absolute left-[31px] top-[5px] size-1 rounded-full bg-[var(--today-date-selected)]" />
                  )}
                </button>
              )
            }))}

            {morph.headers.map((header, column) => (
              <div
                key={LONG_DAYS[column]}
                aria-hidden
                className="pointer-events-none absolute left-0 top-0 z-20 rounded-[12px]"
                style={{
                  width: header.width,
                  height: header.height,
                  transform: `translate3d(${header.x}px, ${header.y}px, 0)`,
                  backgroundColor: `color-mix(in srgb, var(--today-border) ${header.bgAlpha * 100}%, transparent)`,
                }}
              >
                <span
                  className="absolute inset-0 flex items-center justify-center text-[12px] font-medium leading-4"
                  style={{
                    opacity: header.shortOpacity,
                    color: `color-mix(in srgb, var(--today-text-secondary) ${header.colorMix * 100}%, var(--today-text-tertiary))`,
                  }}
                >
                  {SHORT_DAYS[column]}
                </span>
                <span
                  className="absolute inset-0 flex items-center justify-center text-[12px] font-medium leading-4 text-[var(--today-text-secondary)]"
                  style={{ opacity: header.longOpacity }}
                >
                  {LONG_DAYS[column]}
                </span>
              </div>
            ))}

            <button
              type="button"
              onClick={() => { if (!morph.isOpen) sheet.expand() }}
              aria-label={morph.isOpen ? `${monthName} ${today.year}` : 'Open calendar'}
              aria-expanded={morph.isOpen}
              className="absolute left-4 top-0 z-30 overflow-hidden rounded-[120px] bg-[var(--today-surface)] shadow-[inset_0_0_0_0.5px_var(--today-border-button),0_0_0_0.5px_var(--today-border-button)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--today-date-selected)]"
              style={{
                width: morph.monthPill.width,
                height: morph.monthPill.height,
                transform: `translateY(${morph.monthPill.y}px)`,
              }}
            >
              <CalendarIcon size={20} className="absolute left-2.5 top-1/2 -mt-2.5 text-[var(--today-icon-accent)]" />
              <span
                className="absolute left-10 top-1/2 -mt-2.5 whitespace-nowrap text-[14px] font-medium leading-5 text-[var(--today-text-secondary)]"
                style={{ opacity: morph.monthPill.labelOpacity, transform: `translateX(${morph.monthPill.labelX}px)` }}
              >
                {monthName}
              </span>
              <ChevronDownIcon
                size={16}
                className="absolute left-[105px] top-1/2 -mt-2 text-[var(--today-text-secondary)]"
                style={{ opacity: morph.monthPill.labelOpacity, transform: `translateX(${morph.monthPill.labelX}px)` }}
              />
            </button>

            <button
              type="button"
              onClick={sheet.collapse}
              aria-label="Close calendar"
              aria-hidden={!morph.isOpen}
              tabIndex={morph.isOpen ? 0 : -1}
              className="absolute right-4 top-0.5 z-30 flex size-8 items-center justify-center rounded-[120px] bg-[var(--today-surface)] text-[var(--today-text-secondary)] shadow-[inset_0_0_0_0.5px_var(--today-border-button),0_0_0_0.5px_var(--today-border-button)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--today-date-selected)]"
              style={{
                opacity: morph.close.opacity,
                transform: `scale(${morph.close.scale})`,
                pointerEvents: morph.isOpen ? 'auto' : 'none',
              }}
            >
              <CloseIcon size={16} />
            </button>
          </div>

          <button
            type="button"
            aria-label={morph.isOpen ? 'Collapse calendar' : 'Expand calendar'}
            aria-expanded={morph.isOpen}
            onClick={onHandleClick}
            {...sheet.handleProps}
            className="absolute bottom-0 left-1/2 z-40 -ml-[60px] flex h-7 w-[120px] cursor-grab touch-none items-end justify-center pb-1.5 outline-none active:cursor-grabbing"
          >
            <span className="h-1 w-6 rounded-[12px] bg-[var(--today-handle)]" />
          </button>
        </div>
      </section>

      <div
        className="absolute inset-x-0 bottom-0 z-[1] overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ top: `calc(${SAFE_TOP} + ${sheet.height + 16}px)` }}
      >
        {children}
      </div>

      {footer}
    </div>
  )
}
