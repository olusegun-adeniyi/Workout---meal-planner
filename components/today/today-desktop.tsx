import type { ReactNode } from 'react'
import { Bell, Clock3 } from 'lucide-react'
import { Button, Card, MacroRings, Toggle } from '@/components/component-library'
import { iconSize } from '@/lib/tokens'
import type { DailyRecommendation, RecommendedMeal, getReminderPreviews } from '@/lib/recommendations'
import { FoodArtwork } from './food-artwork'

type ReminderTone = 'upcoming' | 'due' | 'follow-up'

function reminderAccent(tone: ReminderTone) {
  if (tone === 'due') return 'bg-[var(--color-action-primary)] text-white'
  if (tone === 'follow-up') return 'bg-[var(--color-state-warning-bg)] text-[var(--color-state-warning)]'
  return 'bg-[var(--color-action-primary-subtle)] text-[var(--color-text-accent)]'
}

function DesktopPanel({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-surface-default)] p-5 ${className}`}>
      {children}
    </section>
  )
}

export type TodayDesktopProps = {
  recommendation: DailyRecommendation
  nextMeal: RecommendedMeal | undefined
  activeRecommendedMeals: RecommendedMeal[]
  loggedMeals: { id: string }[]
  eatenTotals: { calories: number; protein: number }
  reminderPreviews: ReturnType<typeof getReminderPreviews>
  pushSubscribed: boolean
  pushBusy: boolean
  pushDescription: string
  notificationOpen: boolean
  onToggleNotifications: () => void
  onTogglePush: (checked: boolean) => void
  sendTestPush: () => void
  logMeal: () => void
  onSkip: () => void
  onSwap: () => void
  onLogManually: () => void
  onOpenPlan: () => void
  onOpenProgress: () => void
}

/** The ≥1024px Today layout. Unchanged by the mobile redesign. */
export function TodayDesktop({
  recommendation,
  nextMeal,
  activeRecommendedMeals,
  loggedMeals,
  eatenTotals,
  reminderPreviews,
  pushSubscribed,
  pushBusy,
  pushDescription,
  notificationOpen,
  onToggleNotifications,
  onTogglePush,
  sendTestPush,
  logMeal,
  onSkip,
  onSwap,
  onLogManually,
  onOpenPlan,
  onOpenProgress,
}: TodayDesktopProps) {
  return (
    <div className="hidden min-h-screen w-full bg-[var(--color-surface-default)] px-5 pb-10 pt-5 text-[var(--color-text-primary)] lg:block">
      <header className="relative mb-6 flex items-center justify-between">
        <div className="flex items-center gap-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-action-primary)] text-[20px] font-bold text-[var(--color-text-inverse)]">
            F
          </div>
          <span className="rounded-[var(--radius-full)] border border-[var(--color-border-default)] bg-[var(--color-surface-default)] px-4 py-2 text-[13px] font-medium text-[var(--color-text-secondary)]">
            {recommendation.dateLabel}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Push reminders"
            onClick={() => onToggleNotifications()}
            className="group relative flex h-10 w-10 items-center justify-center rounded-[var(--radius-full)] border border-[var(--color-border-default)] bg-[var(--color-surface-default)] text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-bg-secondary)]"
          >
            <Bell size={iconSize.md} aria-hidden="true" />
            <span className="pointer-events-none absolute right-0 top-12 z-30 w-[220px] rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-surface-default)] px-3 py-2 text-left text-[13px] leading-[18px] text-[var(--color-text-secondary)] opacity-0 shadow-[0_4px_12px_rgba(0,0,0,0.10)] transition-opacity group-hover:opacity-100">
              {pushSubscribed ? 'Meal-time reminders are enabled.' : 'Meal-time reminders are off. Click to manage notifications.'}
            </span>
          </button>
          <button
            type="button"
            onClick={() => onLogManually()}
            className="rounded-[var(--radius-full)] bg-[var(--color-action-primary)] px-5 py-2 text-[14px] font-medium text-[var(--color-text-inverse)] transition-opacity hover:opacity-90"
          >
            Log meal
          </button>
        </div>
        {notificationOpen && (
          <Card className="absolute right-0 top-12 z-20 flex w-[360px] flex-col gap-4 p-4">
            <div>
              <Toggle
                checked={pushSubscribed}
                onChange={onTogglePush}
                label="Meal-time push notifications"
              />
              <p className="mt-1 text-[13px] leading-[18px] text-[var(--color-text-secondary)]">
                {pushDescription}
              </p>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              loading={pushBusy}
              disabled={!pushSubscribed}
              onClick={sendTestPush}
            >
              Send test reminder
            </Button>
          </Card>
        )}
      </header>

      <main className="grid grid-cols-12 gap-5">
        <DesktopPanel className="relative col-span-4 min-h-[320px] overflow-hidden">
          <p className="text-[13px] font-medium uppercase tracking-[0.6px] text-[var(--color-text-tertiary)]">Next up</p>
          {nextMeal ? (
            <>
              <FoodArtwork
                meal={nextMeal}
                className="pointer-events-none absolute -bottom-5 -right-6 h-44 w-60 opacity-95"
              />
              <div className="relative mt-12 max-w-[68%]">
              <p className="text-[15px] text-[var(--color-text-tertiary)]">{nextMeal.time} · {nextMeal.slot}</p>
              <h1 className="mt-4 text-[24px] font-medium leading-[28px] text-[var(--color-text-primary)]">{nextMeal.name}</h1>
              <p className="mt-3 text-[15px] text-[var(--color-text-secondary)]">
                {nextMeal.calories} cal · {nextMeal.protein}g protein
              </p>
              <div className="mt-8 flex gap-3">
                <button
                  type="button"
                  onClick={logMeal}
                  className="min-w-[112px] rounded-[var(--radius-full)] bg-[var(--color-action-primary)] px-8 py-3 text-[14px] font-medium text-[var(--color-text-inverse)] transition-opacity hover:opacity-90"
                >
                  Ate it
                </button>
                <button
                  type="button"
                  onClick={() => onSwap()}
                  className="rounded-[var(--radius-full)] border border-[var(--color-border-default)] bg-[var(--color-action-secondary)] px-5 py-3 text-[14px] font-medium text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-bg-secondary)]"
                >
                  Swap
                </button>
                <button
                  type="button"
                  onClick={() => onSkip()}
                  className="rounded-[var(--radius-full)] border border-[var(--color-border-default)] bg-[var(--color-action-secondary)] px-5 py-3 text-[14px] font-medium text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-bg-secondary)]"
                >
                  Skip
                </button>
              </div>
              </div>
            </>
          ) : (
            <div className="mt-12">
              <h1 className="text-[24px] font-medium leading-[28px] text-[var(--color-text-primary)]">Meals clear</h1>
              <p className="mt-3 text-[15px] text-[var(--color-text-secondary)]">You have no upcoming meal recommendations left for today.</p>
            </div>
          )}
        </DesktopPanel>

        <DesktopPanel className="col-span-4 min-h-[320px] bg-[url('/images/desktop-background.png')] bg-cover bg-center">
          <p className="text-[13px] font-medium uppercase tracking-[0.6px] text-[var(--color-text-tertiary)]">Nutrition</p>
          <div className="mt-10 rounded-[var(--radius-lg)] bg-white/75 p-4 backdrop-blur-[2px]">
            <MacroRings
              calories={eatenTotals.calories}
              calorieTarget={recommendation.calorieTarget}
              protein={eatenTotals.protein}
              proteinTarget={recommendation.proteinTarget}
              className="border-0 bg-transparent p-0"
            />
          </div>
          <p className="mt-8 text-[15px] leading-[22px] text-[var(--color-text-secondary)]">
            Your meals start empty. Log food as you eat so Forge can track today accurately.
          </p>
        </DesktopPanel>

        <DesktopPanel className="col-span-4 min-h-[320px]">
          <p className="text-[13px] font-medium uppercase tracking-[0.6px] text-[var(--color-text-tertiary)]">Training</p>
          <div className="mt-12">
            <p className="text-[15px] font-medium text-[var(--color-text-secondary)]">{recommendation.workout.splitLabel}</p>
            <h2 className="mt-3 text-[24px] font-medium leading-[28px] text-[var(--color-text-primary)]">{recommendation.workout.muscleGroups}</h2>
            <p className="mt-3 text-[15px] text-[var(--color-text-secondary)]">
              {recommendation.workout.exerciseCount} exercises · est. {recommendation.workout.estimatedMinutes} min
            </p>
            <div className="mt-8 grid gap-2">
              {recommendation.workout.exercises.slice(0, 3).map((exercise) => (
                <div key={exercise.name} className="rounded-[var(--radius-md)] bg-[var(--color-bg-secondary)] px-4 py-3">
                  <p className="text-[15px] font-medium text-[var(--color-text-primary)]">{exercise.name}</p>
                  <p className="mt-1 text-[13px] text-[var(--color-text-secondary)]">{exercise.target}</p>
                </div>
              ))}
            </div>
          </div>
        </DesktopPanel>

        <DesktopPanel className="col-span-5 min-h-[360px]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[13px] font-medium uppercase tracking-[0.6px] text-[var(--color-text-tertiary)]">Today&apos;s plan</p>
              <h2 className="mt-2 text-[24px] font-medium leading-[28px] text-[var(--color-text-primary)]">Meal recommendations</h2>
            </div>
            <span className="rounded-[var(--radius-full)] bg-[var(--color-bg-secondary)] px-3 py-1 text-[13px] font-medium text-[var(--color-text-secondary)]">
              {activeRecommendedMeals.length} meals
            </span>
          </div>
          <div className="mt-6 grid gap-3">
            {activeRecommendedMeals.length > 0 ? (
              activeRecommendedMeals.map((meal) => (
                <div key={meal.id} className="grid grid-cols-[70px_72px_1fr_auto] items-center gap-4 rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-surface-default)] p-4">
                  <p className="text-[14px] text-[var(--color-text-tertiary)]">{meal.time}</p>
                  <div className="flex h-16 w-16 items-center justify-center overflow-visible">
                    <FoodArtwork meal={meal} className="h-16 w-20" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[17px] font-medium text-[var(--color-text-primary)]">{meal.name}</p>
                    <p className="mt-1 text-[13px] text-[var(--color-text-secondary)]">{meal.calories} cal · {meal.protein}g protein</p>
                  </div>
                  <span className="rounded-[var(--radius-full)] bg-[var(--color-bg-secondary)] px-3 py-1 text-[12px] font-medium text-[var(--color-text-secondary)]">
                    {meal.status.replace('-', ' ')}
                  </span>
                </div>
              ))
            ) : (
              <div className="rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-surface-default)] p-5">
                <p className="text-[17px] font-medium text-[var(--color-text-primary)]">No remaining meals today</p>
                <p className="mt-1 text-[14px] text-[var(--color-text-secondary)]">Tomorrow&apos;s recommendations will refresh automatically.</p>
                </div>
            )}
          </div>
        </DesktopPanel>

        <div className="col-span-7 grid grid-cols-2 gap-5">
          <DesktopPanel className="col-span-2 min-h-[170px]">
            <p className="text-[13px] font-medium uppercase tracking-[0.6px] text-[var(--color-text-tertiary)]">Logged</p>
            <h2 className="mt-5 text-[24px] font-medium leading-[28px] text-[var(--color-text-primary)]">{loggedMeals.length} meals</h2>
            <p className="mt-2 text-[15px] leading-[22px] text-[var(--color-text-secondary)]">
              {loggedMeals.length > 0 ? `${eatenTotals.calories} calories logged today.` : 'Nothing eaten has been logged yet.'}
            </p>
          </DesktopPanel>

          <DesktopPanel className="col-span-2 min-h-[170px]">
            <div className="grid grid-cols-3 gap-4">
              {reminderPreviews.map((reminder) => {
                const Icon = reminder.tone === 'due' ? Bell : Clock3

                return (
                  <div key={reminder.id} className="rounded-[var(--radius-lg)] bg-[var(--color-bg-secondary)] p-4">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-[var(--radius-full)] ${reminderAccent(reminder.tone)}`}>
                      <Icon size={iconSize.sm} aria-hidden="true" />
                    </div>
                    <p className="mt-4 text-[13px] font-medium text-[var(--color-text-tertiary)]">{reminder.time} · {reminder.label}</p>
                    <p className="mt-1 text-[17px] font-medium text-[var(--color-text-primary)]">{reminder.title}</p>
                    <p className="mt-1 line-clamp-2 text-[14px] leading-[20px] text-[var(--color-text-secondary)]">{reminder.body}</p>
                  </div>
                )
              })}
            </div>
          </DesktopPanel>
        </div>
      </main>

      <nav
        aria-label="Primary"
        className="fixed bottom-6 left-1/2 z-30 flex h-14 -translate-x-1/2 items-center gap-1 rounded-[var(--radius-full)] bg-[var(--color-action-primary)] p-1 text-[15px] font-medium shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
      >
        <span className="flex h-12 items-center justify-center rounded-[var(--radius-full)] bg-[var(--color-surface-default)] px-7 text-[var(--color-text-primary)]">
          Today
        </span>
        <button
          type="button"
          onClick={onOpenPlan}
          className="flex h-12 items-center justify-center rounded-[var(--radius-full)] px-7 text-[var(--color-text-inverse)] transition-colors hover:bg-white/10"
        >
          Plan
        </button>
        <button
          type="button"
          onClick={onOpenProgress}
          className="flex h-12 items-center justify-center rounded-[var(--radius-full)] px-7 text-[var(--color-text-inverse)] transition-colors hover:bg-white/10"
        >
          Progress
        </button>
      </nav>
    </div>

  )
}
