'use client' // owns app state: logs, plan, push subscription, tab and sheet state

import { type ChangeEvent, type FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { Inter } from 'next/font/google'
import { useRouter } from 'next/navigation'
import {
  BottomSheet,
  Button,
  Card,
  ScreenContainer,
  TextareaField,
  TextInput,
  ToastProvider,
  useToast,
} from '@/components/component-library'
import { PhotoLogSheet, type PhotoLogValues } from '@/components/log/photo-log-sheet'
import { usePhotoLog } from '@/components/log/use-photo-log'
import { PlanDesktop } from '@/components/plan/plan-desktop'
import { PlanScreen } from '@/components/plan/plan-screen'
import { SwapMealSheet, type SwapTarget } from '@/components/plan/swap-meal-sheet'
import { usePlanWeek } from '@/components/plan/use-plan-week'
import type { ShellTab } from '@/components/shell/tab-bar'
import { TabStage } from '@/components/shell/tab-stage'
import { TodayCalendarShell } from '@/components/today/calendar-sheet'
import { DailyTotalsCard } from '@/components/today/daily-totals-card'
import { TodayDesktop } from '@/components/today/today-desktop'
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
import {
  type MealListItem,
  MealListCard,
  RemindersCard,
  SelectedDayBar,
  WorkoutTodayCard,
} from '@/components/today/today-sections'
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

export type DesktopView = 'today' | 'plan'

function TodayContent({ initialTab, desktopView }: { initialTab: ShellTab; desktopView: DesktopView }) {
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
  const [activeTab, setActiveTab] = useState<ShellTab>(initialTab)
  const [logMenuOpen, setLogMenuOpen] = useState(false)
  const [swapTarget, setSwapTarget] = useState<SwapTarget | null>(null)
  const photoLog = usePhotoLog()
  const photoInputRef = useRef<HTMLInputElement>(null)
  const isViewingToday = selectedIso === today.iso

  const todayLogs = useDayLogs(today.iso)
  const selectedLogs = useDayLogs(isViewingToday ? null : selectedIso)
  const todayPlan = usePlanDay(today.iso)
  const planWeek = usePlanWeek(today.iso)
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

  function selectTab(tab: ShellTab) {
    if (tab === 'progress') {
      toast({ message: 'Progress is next', type: 'neutral' })
      return
    }
    setActiveTab(tab)
    setLogMenuOpen(false)
    // Keep the URL shareable and refresh-safe without remounting the shell.
    window.history.replaceState(null, '', tab === 'plan' ? '/plan' : '/today')
  }

  // Must run inside the tap handler: mobile browsers only open the camera from a user gesture.
  function openCamera() {
    setLogMenuOpen(false)
    photoInputRef.current?.click()
  }

  function onPhotoSelected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = '' // so choosing the same photo again still fires
    if (file) void photoLog.start(file)
  }

  function reestimatePhoto(note: string) {
    const { state } = photoLog
    if ('photo' in state && state.photo) void photoLog.estimate(state.photo, note)
  }

  async function logPhotoMeal(values: PhotoLogValues) {
    const previous = photoLog.state
    photoLog.reset()
    toast({ message: 'Meal logged', type: 'success' })
    const result = await todayLogs.logMeal({
      source: 'custom_photo',
      date: today.iso,
      name: values.name,
      calories: values.calories,
      protein: values.protein,
      notes: values.note || undefined,
    })
    if (!result.ok) {
      // Reopen with the photo and estimate so nothing has to be redone.
      photoLog.restore(previous, values)
      toast({ message: saveFailureMessage(result.message, 'Meal not saved. Try again.'), type: 'error' })
    }
  }

  async function chooseSwap(name: string) {
    const target = swapTarget
    if (!target) return
    setSwapTarget(null)
    toast({ message: `${target.slot} swapped`, type: 'success' })
    const result = await planWeek.swapMeal({ date: target.date, slot: target.slot, name })
    if (!result.ok) {
      toast({ message: result.message, type: 'error' })
      return
    }
    // Today, the calendar view and reminders read the same stored plan.
    if (target.date === today.iso) todayPlan.reload({ silent: true })
    if (target.date === selectedIso) selectedPlan.reload({ silent: true })
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
    <div className="flex flex-col gap-4 p-4">
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
      <div className={`${inter.className} fixed inset-0 bg-[var(--today-shell-bg)] lg:hidden`}>
        <TabStage
          activeTab={activeTab}
          onSelectTab={selectTab}
          logOpen={logMenuOpen}
          onLogOpenChange={setLogMenuOpen}
          onTakePicture={openCamera}
          onLogManually={() => {
            setLogMenuOpen(false)
            setManualOpen(true)
          }}
          pages={[
            <TodayCalendarShell
              key="today"
              today={today}
              selectedIso={selectedIso}
              onSelectDate={setSelectedIso}
              streakDays={todayLogs.status === 'ready' ? todayLogs.streak : null}
            >
              {mobileContent}
            </TodayCalendarShell>,
            <PlanScreen
              key="plan"
              today={today}
              week={planWeek.week}
              status={planWeek.status}
              onRetry={planWeek.reload}
              onRequestSwap={setSwapTarget}
            />,
          ]}
        />
      </div>

      <div className="hidden lg:block">
        {desktopView === 'plan' ? (
          <PlanDesktop />
        ) : (
          <ScreenContainer className="lg:bg-[var(--color-surface-default)] lg:px-0">
            <TodayDesktop
              recommendation={recommendation}
              nextMeal={nextMeal}
              activeRecommendedMeals={activeRecommendedMeals}
              loggedMeals={loggedMeals}
              eatenTotals={eatenTotals}
              reminderPreviews={reminderPreviews}
              pushSubscribed={pushSubscribed}
              pushBusy={pushBusy}
              pushDescription={pushDescription}
              notificationOpen={notificationOpen}
              onToggleNotifications={() => setNotificationOpen((open) => !open)}
              onTogglePush={togglePushReminders}
              sendTestPush={sendTestPush}
              logMeal={logMeal}
              onSkip={() => setSkipConfirmOpen(true)}
              onSwap={() => setSwapOpen(true)}
              onLogManually={() => setManualOpen(true)}
              onOpenPlan={() => router.push('/plan')}
              onOpenProgress={() => toast({ message: 'Progress is next', type: 'neutral' })}
            />
          </ScreenContainer>
        )}
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

      <SwapMealSheet target={swapTarget} onClose={() => setSwapTarget(null)} onChoose={chooseSwap} />

      <input
        ref={photoInputRef}
        type="file"
        // No `capture`: phones then offer both the camera and the photo library.
        accept="image/*"
        className="hidden"
        aria-hidden
        tabIndex={-1}
        onChange={onPhotoSelected}
      />
      <PhotoLogSheet
        state={photoLog.state}
        onClose={photoLog.reset}
        onRetake={() => {
          photoLog.reset()
          photoInputRef.current?.click()
        }}
        onReestimate={reestimatePhoto}
        onLog={logPhotoMeal}
        onLogManually={() => {
          photoLog.reset()
          setManualOpen(true)
        }}
      />
    </>
  )
}

/** The whole app: mobile shell (Today + Plan tabs) and the desktop layouts. */
export function TodayApp({ initialTab, desktopView }: { initialTab: ShellTab; desktopView: DesktopView }) {
  return (
    <ToastProvider>
      <TodayContent initialTab={initialTab} desktopView={desktopView} />
    </ToastProvider>
  )
}
