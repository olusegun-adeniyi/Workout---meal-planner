'use client' // day selection and swipe rows

import { type ReactNode, useEffect, useState } from 'react'
import { CalendarIcon, ClockIcon } from '@/components/today/icons'
import { LogsStatusCard, SuggestionSkeleton } from '@/components/today/meal-cards'
import type { PlannedDay, PlanWeek } from '@/lib/plans/plan-day'
import type { LondonDate } from '@/lib/time/london'
import type { SwapTarget } from './swap-meal-sheet'
import { SwipeMealRow } from './swipe-meal-row'
import type { PlanWeekStatus } from './use-plan-week'
import { useRowSwipe } from './use-row-swipe'

const WEEKDAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

function DayCell({
  letter,
  date,
  selected,
  isToday,
  onSelect,
  label,
}: {
  letter: string
  date: string
  selected: boolean
  isToday: boolean
  onSelect: () => void
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={label}
      aria-pressed={selected}
      aria-current={isToday ? 'date' : undefined}
      className="relative flex h-12 min-w-10 flex-1 flex-col items-center overflow-hidden rounded-[8px] bg-[var(--today-cell)] px-2.5 py-2 outline-none focus-visible:ring-2 focus-visible:ring-[var(--today-date-selected)]"
    >
      <span className="self-stretch text-center text-[12px] font-medium leading-4 text-[var(--today-text-tertiary)]">{letter}</span>
      {selected ? (
        <span className="flex h-4 items-center justify-center self-stretch rounded-[12px] bg-[var(--today-date-selected)] px-1 text-[12px] font-medium leading-4 text-[var(--today-surface)]">
          {Number(date)}
        </span>
      ) : (
        <span className="self-stretch text-center text-[12px] font-medium leading-4 text-[var(--today-text-secondary)]">{Number(date)}</span>
      )}
      {isToday && <span className="absolute left-[31px] top-[5px] size-1 rounded-full bg-[var(--today-date-selected)]" />}
    </button>
  )
}

function WeekCells({
  days,
  selectedIso,
  todayIso,
  onSelect,
  compact = false,
}: {
  days: PlannedDay[]
  selectedIso: string
  todayIso: string
  onSelect: (iso: string) => void
  /** Workout card row: 48 tall, gap 8. Header row: 56 tall, gap 4. */
  compact?: boolean
}) {
  return (
    <div className={`flex flex-1 items-center ${compact ? 'h-12 gap-2' : 'h-14 gap-1 py-1'}`}>
      {days.map((day, index) => (
        <DayCell
          key={day.id}
          letter={WEEKDAY_LETTERS[index]}
          date={day.date}
          label={`${day.label} ${Number(day.date)}`}
          selected={day.id === selectedIso}
          isToday={day.id === todayIso}
          onSelect={() => onSelect(day.id)}
        />
      ))}
    </div>
  )
}

function PlanCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3 overflow-hidden rounded-[20px] p-2 shadow-[inset_0_0_0_1px_var(--today-border)]">
      <h2 className="flex h-5 px-1 text-[14px] font-medium leading-5 text-[var(--today-text-primary)]">{title}</h2>
      {children}
    </section>
  )
}

export function PlanScreen({
  today,
  week,
  status,
  onRetry,
  onRequestSwap,
}: {
  today: LondonDate
  week: PlanWeek | null
  status: PlanWeekStatus
  onRetry: () => void
  onRequestSwap: (target: SwapTarget) => void
}) {
  const [selectedIso, setSelectedIso] = useState(today.iso)
  useEffect(() => setSelectedIso(today.iso), [today.iso])

  const selectedDay = week?.days.find((day) => day.id === selectedIso) ?? week?.days[0] ?? null
  const swipe = useRowSwipe(selectedDay?.meals.length ?? 0)

  // A different day means different rows — don't leave one open.
  const { closeAll } = swipe
  useEffect(() => closeAll(), [selectedIso, closeAll])

  return (
    <div className="flex h-full flex-col">
      <header
        className="relative z-[2] flex flex-none flex-col items-center gap-[9px] rounded-[24px] bg-[var(--today-surface)] pb-1.5 shadow-[inset_0_0_0_1px_var(--today-border-sheet)]"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 9px)' }}
      >
        <div className="flex h-8 self-stretch px-4">
          <h1 className="flex-1 text-[20px] font-medium leading-8 text-[var(--today-text-primary)]">This week</h1>
        </div>
        <div className="flex h-14 items-center gap-3 self-stretch px-4">
          <button
            type="button"
            onClick={() => setSelectedIso(today.iso)}
            aria-label="Jump to today"
            className="flex size-10 flex-none items-center justify-center rounded-[120px] bg-[var(--today-surface)] text-[var(--today-icon-accent)] shadow-[inset_0_0_0_0.5px_var(--today-border-button),0_0_0_0.5px_var(--today-border-button)]"
          >
            <CalendarIcon size={20} />
          </button>
          {week ? (
            <WeekCells days={week.days} selectedIso={selectedIso} todayIso={today.iso} onSelect={setSelectedIso} />
          ) : (
            <div aria-hidden className="flex h-14 flex-1 animate-pulse items-center gap-1 py-1">
              {WEEKDAY_LETTERS.map((letter, index) => (
                <span key={index} className="h-12 min-w-10 flex-1 rounded-[8px] bg-[var(--today-cell)]" />
              ))}
            </div>
          )}
        </div>
        <span aria-hidden className="h-1 w-6 flex-none rounded-[12px] bg-[var(--today-handle)]" />
      </header>

      <div className="flex-1 overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex flex-col gap-4 px-4 pb-3.5 pt-[13px]">
          {status === 'error' && !week ? (
            <LogsStatusCard title="Couldn't load this week's plan" body="Check your connection and try again." onRetry={onRetry} />
          ) : !week || !selectedDay ? (
            <SuggestionSkeleton caption={status === 'generating' ? "Planning this week's meals…" : undefined} />
          ) : (
            <>
              <PlanCard title={`${selectedDay.label} ${selectedDay.date} meals`}>
                <ul className="flex flex-col overflow-hidden rounded-[12px] border border-[var(--today-border)]">
                  {selectedDay.meals.map((meal, index) => (
                    <SwipeMealRow
                      key={meal.slot}
                      name={meal.name}
                      calories={meal.calories}
                      protein={meal.protein}
                      time={meal.time}
                      offset={swipe.offsets[index] ?? 0}
                      isLast={index === selectedDay.meals.length - 1}
                      onPointerDown={(event) => swipe.onPointerDown(index, event)}
                      onSwapFocus={() => swipe.openRow(index)}
                      onSwap={() => {
                        swipe.closeAll()
                        onRequestSwap({
                          date: selectedDay.id,
                          slot: meal.slot,
                          name: meal.name,
                          calories: meal.calories,
                          protein: meal.protein,
                          dayMealNames: selectedDay.meals.map((entry) => entry.name),
                        })
                      }}
                    />
                  ))}
                </ul>
              </PlanCard>

              <PlanCard title="Workout week">
                <WeekCells days={week.days} selectedIso={selectedDay.id} todayIso={today.iso} onSelect={setSelectedIso} compact />
                <div className="flex h-[54px] items-center gap-1 rounded-[12px] bg-[var(--today-surface)] px-3 py-4 shadow-[inset_0_0_0_1px_var(--today-border)]">
                  <span className="flex-1 truncate text-[14px] font-medium leading-5 text-[var(--today-text-primary)]">
                    {selectedDay.workout.split === 'Rest' ? 'Rest day' : selectedDay.workout.name.replaceAll('·', '•')}
                  </span>
                  {selectedDay.workout.duration > 0 && (
                    <span className="flex flex-none items-center gap-2">
                      <span className="text-[var(--today-icon-accent)]"><ClockIcon size={18} /></span>
                      <span className="whitespace-nowrap text-[12px] font-normal leading-4 text-[var(--today-text-secondary)]">
                        {selectedDay.workout.duration} min
                      </span>
                    </span>
                  )}
                </div>
              </PlanCard>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
