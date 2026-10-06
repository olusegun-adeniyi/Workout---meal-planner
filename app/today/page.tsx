'use client'

import { type FormEvent, type ReactNode, useEffect, useMemo, useState } from 'react'
import { Inter } from 'next/font/google'
import { useRouter } from 'next/navigation'
import { Bell, Clock3 } from 'lucide-react'
import {
  BottomSheet,
  Button,
  Card,
  MacroRings,
  ScreenContainer,
  TextareaField,
  TextInput,
  Toggle,
  ToastProvider,
  useToast,
} from '@/components/component-library'
import { TodayCalendarShell } from '@/components/today/calendar-sheet'
import { DailyTotalsCard } from '@/components/today/daily-totals-card'
import { FoodArtwork } from '@/components/today/food-artwork'
import {
  AllCaughtUpCard,
  EmptyLogsCard,
  LogsStatusCard,
  NextSuggestionCard,
  SkipConfirmCard,
  SuggestionSkeleton,
} from '@/components/today/meal-cards'
import { SegmentedControl } from '@/components/today/segmented-control'
import { useDayLogs } from '@/components/today/use-day-logs'
import { usePlanDay } from '@/components/today/use-plan-day'
import { type TodayTab, TodayTabBar } from '@/components/today/today-tab-bar'
import {
  type MealListItem,
  MealListCard,
  RemindersCard,
  SelectedDayBar,
  WorkoutTodayCard,
} from '@/components/today/today-sections'
import { iconSize } from '@/lib/tokens'
import {
  type ProfileInputs,
  type MealSlotId,
  type RecommendedMeal,
  getDailyRecommendation,
  getReminderPreviews,
} from '@/lib/recommendations'
import type { MealLog } from '@/lib/logs/schemas'
import { toDailyRecommendation } from '@/lib/plans/plan-day'
import { formatLondonShortDay, formatLondonTime, getLondonToday, toPlanningDate } from '@/lib/time/london'

// The Today handoff is specced in Inter; scoped to the mobile screen only.
const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600'], display: 'swap' })

type ManualLogField = 'name' | 'calories' | 'protein' | 'notes'
type TodaySegment = 'meal' | 'workout'

type Meal = RecommendedMeal
type LoggedMeal = {
  id: string
  time: string
  slot: string
  name: string
  calories: number
  protein: number
  artwork?: MealListItem['artwork']
}

type ManualLog = {
  name: string
  calories: string
  protein: string
  notes: string
}

type ReminderTone = 'upcoming' | 'due' | 'follow-up'

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

const emptyManualLog: ManualLog = {
  name: '',
  calories: '',
  protein: '',
  notes: '',
}

const swaps = [
  { name: 'Chicken suya wrap and yoghurt', calories: 690, protein: 50 },
  { name: 'Turkey chilli with rice', calories: 740, protein: 55 },
  { name: 'Salmon, potatoes and greens', calories: 710, protein: 49 },
]

function readStoredProfile(): ProfileInputs {
  if (typeof window === 'undefined') return {}

  const stored = window.localStorage.getItem('forge:onboarding')
  if (!stored) return {}

  try {
    const parsed = JSON.parse(stored) as {
      heightCm?: number
      currentWeightKg?: number
      targetWeightKg?: number
    }

    return {
      heightCm: parsed.heightCm,
      currentWeightKg: parsed.currentWeightKg,
      targetWeightKg: parsed.targetWeightKg,
    }
  } catch {
    return {}
  }
}

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

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = `${base64String}${padding}`
    .replace(/-/g, '+')
    .replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i)
  }

  return outputArray
}

type MealOverride = Pick<Meal, 'name' | 'calories' | 'protein'>

function toLoggedMeals(logs: MealLog[], plannedMeals: Meal[]): LoggedMeal[] {
  return logs
    .filter((log) => log.status === 'eaten')
    .map((log) => ({
      id: log.id,
      time: formatLondonTime(log.loggedAt),
      slot: plannedMeals.find((meal) => meal.id === log.slot)?.slot ?? 'Manual log',
      name: log.name,
      calories: log.calories,
      protein: log.protein,
      artwork: log.slot ? { id: log.slot, name: log.name } : undefined,
    }))
}

function toMealListItems(logs: MealLog[]): MealListItem[] {
  return logs.map((log) => ({
    key: log.id,
    time: formatLondonTime(log.loggedAt),
    name: log.name,
    calories: log.calories,
    protein: log.protein,
    skipped: log.status === 'skipped',
    artwork: log.slot ? { id: log.slot, name: log.name } : undefined,
  }))
}

function formatMacroSummary(totals: { calories: number; protein: number }) {
  return `${totals.calories.toLocaleString('en-GB')} cal · ${totals.protein}g protein`
}

function sumMacros(meals: { calories: number; protein: number }[]) {
  return meals.reduce(
    (totals, meal) => ({ calories: totals.calories + meal.calories, protein: totals.protein + meal.protein }),
    { calories: 0, protein: 0 },
  )
}

/** Setup problems get the actionable server message; everything else stays short. */
function saveFailureMessage(serverMessage: string, fallback: string) {
  return serverMessage.includes('schema.sql') ? serverMessage : fallback
}

function TodayContent() {
  const router = useRouter()
  const { toast } = useToast()
  // Bumped every minute so time-based meal status (due soon, past) stays current.
  const [clockTick, setClockTick] = useState(0)
  // Desktop swap only re-labels the planned meal; the log captures whatever was eaten.
  const [mealOverrides, setMealOverrides] = useState<Partial<Record<MealSlotId, MealOverride>>>({})
  const [skipConfirmOpen, setSkipConfirmOpen] = useState(false)
  const [swapOpen, setSwapOpen] = useState(false)
  const [manualOpen, setManualOpen] = useState(false)
  const [manualLog, setManualLog] = useState<ManualLog>(emptyManualLog)
  const [manualErrors, setManualErrors] = useState<Partial<Record<ManualLogField, string>>>({})
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default')
  const [pushSubscribed, setPushSubscribed] = useState(false)
  const [pushSavedToSupabase, setPushSavedToSupabase] = useState(false)
  const [pushBusy, setPushBusy] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [today, setToday] = useState(() => getLondonToday())
  const [segment, setSegment] = useState<TodaySegment>('meal')
  const [selectedIso, setSelectedIso] = useState(today.iso)
  const isViewingToday = selectedIso === today.iso

  const todayLogs = useDayLogs(today.iso)
  const selectedLogs = useDayLogs(isViewingToday ? null : selectedIso)
  const todayPlan = usePlanDay(today.iso)
  const selectedPlan = usePlanDay(isViewingToday ? null : selectedIso)

  // The stored (AI) plan drives everything; the local planner only covers a failed fetch.
  const recommendation = useMemo(() => {
    void clockTick
    return todayPlan.planDay
      ? toDailyRecommendation(todayPlan.planDay)
      : getDailyRecommendation(readStoredProfile())
  }, [todayPlan.planDay, clockTick])
  const isPlanPending = todayPlan.status === 'loading' || todayPlan.status === 'generating'

  // Midnight rollover: follow the new day rather than stranding the user on yesterday.
  useEffect(() => setSelectedIso(today.iso), [today.iso])

  useEffect(() => {
    function refreshRecommendations() {
      setClockTick((tick) => tick + 1)
      setToday((current) => {
        const fresh = getLondonToday()
        return fresh.iso === current.iso ? current : fresh
      })
    }

    refreshRecommendations()
    const refreshInterval = window.setInterval(refreshRecommendations, 60000)

    if ('Notification' in window) {
      setNotificationPermission(Notification.permission)
    }

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration('/sw.js').then(async (registration) => {
        const subscription = await registration?.pushManager.getSubscription()
        setPushSubscribed(!!subscription)
        setPushSavedToSupabase(false)
      }).catch(() => {
        setPushSubscribed(false)
        setPushSavedToSupabase(false)
      })
    }

    return () => window.clearInterval(refreshInterval)
  }, [])

  const reminderPreviews = useMemo(() => {
    return getReminderPreviews(readStoredProfile())
  }, [])

  // Plan + logs → status. A logged slot is eaten/skipped regardless of the clock.
  const recommendedMeals = useMemo<Meal[]>(() => recommendation.meals.map((meal) => {
    const log = todayLogs.mealLogs.find((entry) => entry.slot === meal.id)
    return { ...meal, ...mealOverrides[meal.id], status: log ? log.status : meal.status }
  }), [recommendation.meals, todayLogs.mealLogs, mealOverrides])

  const loggedMeals = useMemo<LoggedMeal[]>(() => toLoggedMeals(todayLogs.mealLogs, recommendation.meals), [todayLogs.mealLogs, recommendation.meals])

  const activeRecommendedMeals = useMemo(() => {
    return recommendedMeals.filter((meal) => meal.status === 'due-soon' || meal.status === 'upcoming')
  }, [recommendedMeals])

  const nextMeal = useMemo(() => {
    return activeRecommendedMeals.find((meal) => meal.status === 'due-soon')
      ?? activeRecommendedMeals.find((meal) => meal.status === 'upcoming')
  }, [activeRecommendedMeals])

  const eatenTotals = useMemo(() => sumMacros(loggedMeals), [loggedMeals])

  async function recordPlannedMeal(meal: Meal, status: 'eaten' | 'skipped') {
    const result = await todayLogs.logMeal({
      source: 'planned',
      date: today.iso,
      slot: meal.id,
      status,
      name: meal.name,
      calories: meal.calories,
      protein: meal.protein,
    })
    if (!result.ok) toast({ message: saveFailureMessage(result.message, `${meal.slot} not saved. Try again.`), type: 'error' })
  }

  function logMeal() {
    if (!nextMeal) return
    toast({ message: `${nextMeal.slot} logged`, type: 'success' })
    void recordPlannedMeal(nextMeal, 'eaten')
  }

  function skipMeal() {
    if (!nextMeal) return
    setSkipConfirmOpen(false)
    toast({ message: `${nextMeal.slot} skipped`, type: 'neutral' })
    void recordPlannedMeal(nextMeal, 'skipped')
  }

  async function completeWorkout() {
    toast({ message: 'Workout logged', type: 'success' })
    const result = await todayLogs.logWorkout({ date: today.iso, splitLabel: recommendation.workout.splitLabel })
    if (!result.ok) toast({ message: saveFailureMessage(result.message, 'Workout not saved. Try again.'), type: 'error' })
  }

  function swapMeal(replacement: (typeof swaps)[number]) {
    if (!nextMeal) return
    setMealOverrides((current) => ({ ...current, [nextMeal.id]: replacement }))
    setSwapOpen(false)
    toast({ message: 'Meal swapped', type: 'success' })
  }

  function updateManualLog(field: ManualLogField, value: string) {
    setManualLog((current) => ({ ...current, [field]: value }))
    setManualErrors((current) => ({ ...current, [field]: undefined }))
  }

  async function submitManualLog(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const name = manualLog.name.trim()
    const calories = Number(manualLog.calories)
    const protein = Number(manualLog.protein)
    const nextErrors: Partial<Record<ManualLogField, string>> = {}

    if (!name) nextErrors.name = 'Add what you ate'
    if (!Number.isFinite(calories) || calories <= 0) nextErrors.calories = 'Use a number above 0'
    if (!Number.isFinite(protein) || protein < 0) nextErrors.protein = 'Use 0 or more'

    if (Object.keys(nextErrors).length > 0) {
      setManualErrors(nextErrors)
      return
    }

    const notes = manualLog.notes.trim()
    setManualErrors({})
    setManualOpen(false)
    toast({ message: 'Meal logged', type: 'success' })

    const result = await todayLogs.logMeal({
      source: 'custom_text',
      date: today.iso,
      name,
      calories,
      protein,
      notes: notes || undefined,
    })

    if (result.ok) {
      setManualLog(emptyManualLog)
    } else {
      // Reopen with what they typed so nothing is lost.
      setManualOpen(true)
      toast({ message: saveFailureMessage(result.message, 'Meal not saved. Try again.'), type: 'error' })
    }
  }

  async function enablePushReminders() {
    if (!vapidPublicKey) {
      toast({ message: 'Push keys are missing', type: 'error' })
      return
    }

    if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      toast({ message: 'Push notifications are not available here', type: 'error' })
      return
    }

    setPushBusy(true)

    try {
      const permission = await Notification.requestPermission()
      setNotificationPermission(permission)

      if (permission !== 'granted') {
        toast({ message: 'Notifications are off', type: 'neutral' })
        return
      }

      const registration = await navigator.serviceWorker.register('/sw.js')
      let subscription = await registration.pushManager.getSubscription()

      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        })
      }

      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: subscription.toJSON() }),
      })

      if (!response.ok) {
        const result = await response.json().catch(() => null)
        if (response.status === 424) {
          setPushSubscribed(true)
          setPushSavedToSupabase(false)
          toast({ message: 'Browser reminders enabled', type: 'success' })
          return
        }

        throw new Error(result?.error || 'Failed to save subscription')
      }

      setPushSubscribed(true)
      setPushSavedToSupabase(true)
      toast({ message: 'Meal reminders enabled', type: 'success' })
    } catch (error) {
      console.error(error)
      toast({ message: 'Could not enable reminders', type: 'error' })
    } finally {
      setPushBusy(false)
    }
  }

  async function disablePushReminders() {
    if (!('serviceWorker' in navigator)) return

    setPushBusy(true)

    try {
      const registration = await navigator.serviceWorker.getRegistration('/sw.js')
      const subscription = await registration?.pushManager.getSubscription()
      const endpoint = subscription?.endpoint

      await subscription?.unsubscribe()

      if (endpoint) {
        await fetch('/api/push/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint }),
        })
      }

      setPushSubscribed(false)
      setPushSavedToSupabase(false)
      toast({ message: 'Meal reminders off', type: 'neutral' })
    } catch (error) {
      console.error(error)
      toast({ message: 'Could not turn reminders off', type: 'error' })
    } finally {
      setPushBusy(false)
    }
  }

  async function sendTestPush() {
    setPushBusy(true)

    try {
      const registration = await navigator.serviceWorker.getRegistration('/sw.js')
      const subscription = await registration?.pushManager.getSubscription()

      if (!subscription) throw new Error('Missing browser push subscription')

      const response = await fetch('/api/push/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: subscription.toJSON() }),
      })

      if (!response.ok) throw new Error('Failed to send test push')
      toast({ message: 'Test reminder sent', type: 'success' })
    } catch (error) {
      console.error(error)
      toast({ message: 'Could not send test reminder', type: 'error' })
    } finally {
      setPushBusy(false)
    }
  }

  function handleNav(tab: TodayTab) {
    if (tab === 'today') return
    if (tab === 'plan') {
      router.push('/plan')
      return
    }
    toast({ message: 'Progress is next', type: 'neutral' })
  }

  function togglePushReminders(checked: boolean) {
    if (pushBusy) return
    if (checked) {
      enablePushReminders()
    } else {
      disablePushReminders()
    }
  }

  const pushDescription = notificationPermission === 'granted'
    ? pushSavedToSupabase
      ? 'Forge can remind you when a meal is due.'
      : 'This browser can receive test reminders. Supabase is still needed for automatic reminders.'
    : 'Your browser will ask for permission before reminders are enabled.'

  const laterMeals: MealListItem[] = activeRecommendedMeals
    .filter((meal) => meal.id !== nextMeal?.id)
    .map((meal) => ({
      key: meal.id,
      time: meal.time,
      name: meal.name,
      calories: meal.calories,
      protein: meal.protein,
      artwork: { id: meal.id, name: meal.name },
    }))

  const selectedDay = useMemo(() => {
    if (isViewingToday) return null
    return selectedPlan.planDay
      ? toDailyRecommendation(selectedPlan.planDay)
      : getDailyRecommendation(readStoredProfile(), toPlanningDate(selectedIso))
  }, [isViewingToday, selectedIso, selectedPlan.planDay])
  const isSelectedPlanPending = selectedPlan.status === 'loading' || selectedPlan.status === 'generating'

  const selectedDayMeals: MealListItem[] = (selectedDay?.meals ?? []).map((meal) => ({
    key: meal.id,
    time: meal.time,
    name: meal.name,
    calories: meal.calories,
    protein: meal.protein,
    artwork: { id: meal.id, name: meal.name },
  }))
  const selectedDayTotals = sumMacros(selectedDayMeals)
  const isPastSelection = selectedIso < today.iso

  const visibleLogs = isViewingToday ? todayLogs : selectedLogs
  const workoutCompletedTime = visibleLogs.workoutLog ? formatLondonTime(visibleLogs.workoutLog.completedAt) : null

  function renderLogsProblem(logs: typeof todayLogs) {
    if (logs.status === 'setup-required') {
      return (
        <LogsStatusCard
          title="Logging isn't connected yet"
          body="Run supabase/schema.sql in the Supabase SQL editor, then try again."
          onRetry={() => logs.reload()}
        />
      )
    }
    return (
      <LogsStatusCard
        title="Couldn't load your logs"
        body="Check your connection and try again."
        onRetry={() => logs.reload()}
      />
    )
  }

  const todayMealContent = (
    <>
      {(todayLogs.status === 'error' || todayLogs.status === 'setup-required') && renderLogsProblem(todayLogs)}

      {isPlanPending ? (
        <SuggestionSkeleton caption={todayPlan.status === 'generating' ? "Planning this week's meals…" : undefined} />
      ) : todayLogs.status === 'loading' ? (
        <SuggestionSkeleton />
      ) : skipConfirmOpen && nextMeal ? (
        <SkipConfirmCard meal={nextMeal} onConfirm={skipMeal} onCancel={() => setSkipConfirmOpen(false)} />
      ) : nextMeal ? (
        <NextSuggestionCard meal={nextMeal} onAte={logMeal} onSkip={() => setSkipConfirmOpen(true)} />
      ) : (
        <AllCaughtUpCard calories={eatenTotals.calories} protein={eatenTotals.protein} />
      )}

      {/* Unknown isn't zero: hide totals when logs couldn't load. */}
      {(todayLogs.status === 'loading' || todayLogs.status === 'ready') && (
        <DailyTotalsCard
          calories={eatenTotals.calories}
          calorieTarget={recommendation.calorieTarget}
          protein={eatenTotals.protein}
          proteinTarget={recommendation.proteinTarget}
          loading={todayLogs.status === 'loading' || isPlanPending}
        />
      )}

      <button
        type="button"
        onClick={() => setManualOpen(true)}
        className="flex min-h-11 items-center justify-center text-[14px] font-medium leading-5 text-[var(--today-info)]"
      >
        Ate something else
      </button>

      {!isPlanPending && laterMeals.length > 0 && <MealListCard title="Later today" items={laterMeals} />}
      {todayLogs.mealLogs.length > 0 && (
        <MealListCard title="Logged" items={toMealListItems(todayLogs.mealLogs)} />
      )}

      <RemindersCard
        enabled={pushSubscribed}
        busy={pushBusy}
        description={pushDescription}
        onToggle={togglePushReminders}
        onSendTest={sendTestPush}
      />
    </>
  )

  const otherDayMealContent = (
    <>
      {isPastSelection && (
        selectedLogs.status === 'loading' ? (
          <SuggestionSkeleton />
        ) : selectedLogs.status === 'error' || selectedLogs.status === 'setup-required' ? (
          renderLogsProblem(selectedLogs)
        ) : selectedLogs.mealLogs.length > 0 ? (
          <MealListCard
            title="Logged"
            subtitle={formatMacroSummary(sumMacros(selectedLogs.mealLogs.filter((log) => log.status === 'eaten')))}
            items={toMealListItems(selectedLogs.mealLogs)}
          />
        ) : (
          <EmptyLogsCard />
        )
      )}
      {isSelectedPlanPending ? (
        <SuggestionSkeleton caption={selectedPlan.status === 'generating' ? "Planning this week's meals…" : undefined} />
      ) : (
        <MealListCard
          title={isPastSelection ? 'Planned' : 'Meals'}
          subtitle={formatMacroSummary(selectedDayTotals)}
          items={selectedDayMeals}
        />
      )}
    </>
  )

  const mobileContent = (
    <div className="flex flex-col gap-4 pl-[18px] pr-[17px] pt-1.5" style={{ paddingBottom: 'calc(130px + env(safe-area-inset-bottom))' }}>
      <SegmentedControl
        label="Today view"
        options={[{ id: 'meal', label: 'Meal' }, { id: 'workout', label: 'Workout' }]}
        value={segment}
        onChange={setSegment}
      />

      {selectedDay && (
        <SelectedDayBar
          label={formatLondonShortDay(selectedIso)}
          isPast={isPastSelection}
          onBackToToday={() => setSelectedIso(today.iso)}
        />
      )}

      {segment === 'workout' ? (
        <WorkoutTodayCard
          workout={selectedDay?.workout ?? recommendation.workout}
          completedTime={workoutCompletedTime}
          onComplete={isViewingToday ? completeWorkout : undefined}
        />
      ) : selectedDay ? (
        otherDayMealContent
      ) : (
        todayMealContent
      )}
    </div>
  )

  return (
    <>
      <div className={`${inter.className} fixed inset-0 bg-[var(--today-surface)] lg:hidden`}>
        <div className="mx-auto h-full max-w-[430px]">
          <TodayCalendarShell
            today={today}
            selectedIso={selectedIso}
            onSelectDate={setSelectedIso}
            streakDays={todayLogs.status === 'ready' ? todayLogs.streak : null}
            footer={<TodayTabBar active="today" onChange={handleNav} />}
          >
            {mobileContent}
          </TodayCalendarShell>
        </div>
      </div>

      <div className="hidden lg:block">
      <ScreenContainer className="lg:bg-[var(--color-surface-default)] lg:px-0">
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
              onClick={() => setNotificationOpen((open) => !open)}
              className="group relative flex h-10 w-10 items-center justify-center rounded-[var(--radius-full)] border border-[var(--color-border-default)] bg-[var(--color-surface-default)] text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-bg-secondary)]"
            >
              <Bell size={iconSize.md} aria-hidden="true" />
              <span className="pointer-events-none absolute right-0 top-12 z-30 w-[220px] rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-surface-default)] px-3 py-2 text-left text-[13px] leading-[18px] text-[var(--color-text-secondary)] opacity-0 shadow-[0_4px_12px_rgba(0,0,0,0.10)] transition-opacity group-hover:opacity-100">
                {pushSubscribed ? 'Meal-time reminders are enabled.' : 'Meal-time reminders are off. Click to manage notifications.'}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setManualOpen(true)}
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
                  onChange={(checked) => {
                    if (pushBusy) return
                    if (checked) {
                      enablePushReminders()
                    } else {
                      disablePushReminders()
                    }
                  }}
                  label="Meal-time push notifications"
                />
                <p className="mt-1 text-[13px] leading-[18px] text-[var(--color-text-secondary)]">
                  {notificationPermission === 'granted'
                    ? pushSavedToSupabase
                      ? 'Forge can remind you when a meal is due.'
                      : 'This browser can receive test reminders. Supabase is still needed for automatic reminders.'
                    : 'Your browser will ask for permission before reminders are enabled.'}
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
                    onClick={() => setSwapOpen(true)}
                    className="rounded-[var(--radius-full)] border border-[var(--color-border-default)] bg-[var(--color-action-secondary)] px-5 py-3 text-[14px] font-medium text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-bg-secondary)]"
                  >
                    Swap
                  </button>
                  <button
                    type="button"
                    onClick={() => setSkipConfirmOpen(true)}
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
            onClick={() => router.push('/plan')}
            className="flex h-12 items-center justify-center rounded-[var(--radius-full)] px-7 text-[var(--color-text-inverse)] transition-colors hover:bg-white/10"
          >
            Plan
          </button>
          <button
            type="button"
            onClick={() => toast({ message: 'Progress is next', type: 'neutral' })}
            className="flex h-12 items-center justify-center rounded-[var(--radius-full)] px-7 text-[var(--color-text-inverse)] transition-colors hover:bg-white/10"
          >
            Progress
          </button>
        </nav>
      </div>

      </ScreenContainer>
      </div>

      <BottomSheet open={manualOpen} onClose={() => setManualOpen(false)} title="Log what you ate">
        <form className="flex flex-col gap-4 pb-4" onSubmit={submitManualLog}>
          <TextInput
            label="Meal or food"
            value={manualLog.name}
            onChange={(event) => updateManualLog('name', event.target.value)}
            placeholder="Rice, eggs, protein shake"
            error={manualErrors.name}
          />
          <div className="grid grid-cols-2 gap-3">
            <TextInput
              label="Calories"
              value={manualLog.calories}
              onChange={(event) => updateManualLog('calories', event.target.value)}
              inputMode="numeric"
              placeholder="650"
              error={manualErrors.calories}
            />
            <TextInput
              label="Protein"
              value={manualLog.protein}
              onChange={(event) => updateManualLog('protein', event.target.value)}
              inputMode="numeric"
              placeholder="42"
              error={manualErrors.protein}
            />
          </div>
          <TextareaField
            label="Notes"
            value={manualLog.notes}
            onChange={(event) => updateManualLog('notes', event.target.value)}
            maxLength={120}
            placeholder="Optional"
          />
          <Button type="submit">Log meal</Button>
        </form>
      </BottomSheet>

      <BottomSheet open={swapOpen} onClose={() => setSwapOpen(false)} title="Swap lunch">
        <div className="flex flex-col gap-3 pb-4">
          {swaps.map((meal) => (
            <Card key={meal.name} className="p-4" onClick={() => swapMeal(meal)}>
              <p className="text-[15px] font-semibold text-[var(--color-text-primary)]">{meal.name}</p>
              <p className="text-[13px] text-[var(--color-text-secondary)]">
                {meal.calories} cal · {meal.protein}g protein
              </p>
            </Card>
          ))}
        </div>
      </BottomSheet>

    </>
  )
}

export default function TodayPage() {
  return (
    <ToastProvider>
      <TodayContent />
    </ToastProvider>
  )
}
