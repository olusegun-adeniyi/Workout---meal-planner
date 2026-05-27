'use client'

import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, Clock3 } from 'lucide-react'
import {
  BottomNav,
  BottomSheet,
  Button,
  Card,
  FloatingActionButton,
  MacroRings,
  MealTimelineRow,
  NextActionCard,
  ScreenContainer,
  SectionHeader,
  StreakCounter,
  TextareaField,
  TextInput,
  Toggle,
  ToastProvider,
  WorkoutCard,
  useToast,
} from '@/components/component-library'
import { iconSize } from '@/lib/tokens'
import {
  type ProfileInputs,
  type RecommendedMeal,
  getDailyRecommendation,
  getReminderPreviews,
} from '@/lib/recommendations'

type NavTab = 'today' | 'plan' | 'progress' | 'log'
type ManualLogField = 'name' | 'calories' | 'protein' | 'notes'

type Meal = Omit<RecommendedMeal, 'id'> & { id: string }
type LoggedMeal = {
  id: string
  time: string
  slot: string
  name: string
  calories: number
  protein: number
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

function TodayContent() {
  const router = useRouter()
  const { toast } = useToast()
  const [recommendation, setRecommendation] = useState(() => getDailyRecommendation())
  const [recommendedMeals, setRecommendedMeals] = useState<Meal[]>(() => getDailyRecommendation().meals)
  const [loggedMeals, setLoggedMeals] = useState<LoggedMeal[]>([])
  const [streak] = useState(0)
  const [skipConfirmOpen, setSkipConfirmOpen] = useState(false)
  const [swapOpen, setSwapOpen] = useState(false)
  const [manualOpen, setManualOpen] = useState(false)
  const [manualLog, setManualLog] = useState<ManualLog>(emptyManualLog)
  const [manualErrors, setManualErrors] = useState<Partial<Record<ManualLogField, string>>>({})
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default')
  const [pushSubscribed, setPushSubscribed] = useState(false)
  const [pushSavedToSupabase, setPushSavedToSupabase] = useState(false)
  const [pushBusy, setPushBusy] = useState(false)

  useEffect(() => {
    const nextRecommendation = getDailyRecommendation(readStoredProfile())
    setRecommendation(nextRecommendation)
    setRecommendedMeals(nextRecommendation.meals)

    if (!('Notification' in window)) return

    setNotificationPermission(Notification.permission)

    if (!('serviceWorker' in navigator)) return

    navigator.serviceWorker.getRegistration('/sw.js').then(async (registration) => {
      const subscription = await registration?.pushManager.getSubscription()
      setPushSubscribed(!!subscription)
      setPushSavedToSupabase(false)
    }).catch(() => {
      setPushSubscribed(false)
      setPushSavedToSupabase(false)
    })
  }, [])

  const reminderPreviews = useMemo(() => {
    return getReminderPreviews(readStoredProfile())
  }, [])

  const nextMeal = useMemo(() => {
    return recommendedMeals.find((meal) => meal.status === 'due-soon')
      ?? recommendedMeals.find((meal) => meal.status === 'upcoming')
  }, [recommendedMeals])

  const eatenTotals = useMemo(() => {
    return loggedMeals.reduce(
      (totals, meal) => {
        return {
          calories: totals.calories + meal.calories,
          protein: totals.protein + meal.protein,
        }
      },
      { calories: 0, protein: 0 },
    )
  }, [loggedMeals])

  function logMeal() {
    if (!nextMeal) return

    setRecommendedMeals((currentMeals) => {
      let promotedNext = false
      return currentMeals.map((meal) => {
        if (meal.id === nextMeal.id) {
          return { ...meal, status: 'eaten' }
        }
        if (!promotedNext && meal.status === 'upcoming') {
          promotedNext = true
          return { ...meal, status: 'due-soon' }
        }
        return meal
      })
    })
    setLoggedMeals((currentMeals) => [
      ...currentMeals,
      {
        id: `log-${nextMeal.id}-${Date.now()}`,
        time: nextMeal.time,
        slot: nextMeal.slot,
        name: nextMeal.name,
        calories: nextMeal.calories,
        protein: nextMeal.protein,
      },
    ])
    toast({ message: `${nextMeal.slot} logged`, type: 'success' })
  }

  function skipMeal() {
    if (!nextMeal) return

    setRecommendedMeals((currentMeals) => {
      let promotedNext = false
      return currentMeals.map((meal) => {
        if (meal.id === nextMeal.id) {
          return { ...meal, status: 'skipped' }
        }
        if (!promotedNext && meal.status === 'upcoming') {
          promotedNext = true
          return { ...meal, status: 'due-soon' }
        }
        return meal
      })
    })
    setSkipConfirmOpen(false)
    toast({ message: `${nextMeal.slot} skipped`, type: 'neutral' })
  }

  function swapMeal(replacement: (typeof swaps)[number]) {
    if (!nextMeal) return

    setRecommendedMeals((currentMeals) => currentMeals.map((meal) => (
      meal.id === nextMeal.id
        ? {
            ...meal,
            name: replacement.name,
            calories: replacement.calories,
            protein: replacement.protein,
          }
        : meal
    )))
    setSwapOpen(false)
    toast({ message: 'Meal swapped', type: 'success' })
  }

  function updateManualLog(field: ManualLogField, value: string) {
    setManualLog((current) => ({ ...current, [field]: value }))
    setManualErrors((current) => ({ ...current, [field]: undefined }))
  }

  function submitManualLog(event: FormEvent<HTMLFormElement>) {
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

    const customMeal: LoggedMeal = {
      id: `custom-${Date.now()}`,
      time: 'Now',
      slot: 'Manual log',
      name,
      calories: Math.round(calories),
      protein: Math.round(protein),
    }

    setLoggedMeals((currentMeals) => [...currentMeals, customMeal])
    setManualLog(emptyManualLog)
    setManualErrors({})
    setManualOpen(false)
    toast({ message: 'Meal logged', type: 'success' })
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

  function handleNav(tab: NavTab) {
    if (tab === 'today') return
    if (tab === 'plan') {
      router.push('/plan')
      return
    }
    if (tab === 'log') {
      setManualOpen(true)
      return
    }
    toast({ message: `${tab[0].toUpperCase()}${tab.slice(1)} is next`, type: 'neutral' })
  }

  return (
    <ScreenContainer>
      <div className="mx-auto flex w-full max-w-[430px] flex-1 flex-col gap-6 pb-8 pt-5">
        <header className="flex items-end justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.6px] text-[var(--color-text-tertiary)]">
              {recommendation.dateLabel}
            </p>
            <h1 className="text-[32px] font-bold leading-[36px] text-[var(--color-text-primary)]">
              Today
            </h1>
          </div>
          <StreakCounter days={streak} />
        </header>

        <section>
          {skipConfirmOpen && nextMeal ? (
            <Card className="p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.6px] text-[var(--color-text-secondary)]">
                Skip this meal?
              </p>
              <h2 className="mt-1 text-[24px] font-semibold leading-[28px] text-[var(--color-text-primary)]">
                {nextMeal.name}
              </h2>
              <p className="mt-1 font-mono text-[15px] text-[var(--color-text-secondary)]">
                {nextMeal.calories} cal · {nextMeal.protein}g protein
              </p>
              <div className="mt-4 flex gap-2">
                <Button variant="destructive" onClick={skipMeal}>Confirm skip</Button>
                <Button variant="secondary" onClick={() => setSkipConfirmOpen(false)}>Keep it</Button>
              </div>
            </Card>
          ) : nextMeal ? (
            <NextActionCard
              mealName={nextMeal.name}
              timeLabel={nextMeal.status === 'due-soon' ? 'EAT IN 23 MIN' : `EAT AT ${nextMeal.time}`}
              calories={nextMeal.calories}
              protein={nextMeal.protein}
              state={nextMeal.status === 'due-soon' ? 'due-soon' : 'upcoming'}
              onAte={logMeal}
              onSwap={() => setSwapOpen(true)}
              onSkip={() => setSkipConfirmOpen(true)}
            />
          ) : (
            <NextActionCard state="logged" mealName="Today" calories={eatenTotals.calories} protein={eatenTotals.protein} />
          )}
          <button
            type="button"
            onClick={() => setManualOpen(true)}
            className="mt-3 flex min-h-11 w-full items-center justify-center rounded-[var(--radius-md)] text-[15px] font-semibold text-[var(--color-text-accent)] transition-colors hover:bg-[var(--color-action-primary-subtle)]"
          >
            Ate something else
          </button>
        </section>

        <section className="flex flex-col gap-2">
          <SectionHeader title="Nutrition" />
          <MacroRings
            calories={eatenTotals.calories}
            calorieTarget={recommendation.calorieTarget}
            protein={eatenTotals.protein}
            proteinTarget={recommendation.proteinTarget}
          />
        </section>

        <section className="flex flex-col gap-2">
          <SectionHeader title="Meal recommendations" />
          <Card variant="list">
            {recommendedMeals.map((meal, index) => (
              <MealTimelineRow
                key={meal.id}
                time={meal.time}
                slot={meal.slot}
                mealName={meal.name}
                calories={meal.calories}
                protein={meal.protein}
                status={meal.status}
                isLast={index === recommendedMeals.length - 1}
              />
            ))}
          </Card>
        </section>

        {loggedMeals.length > 0 && (
          <section className="flex flex-col gap-2">
            <SectionHeader title="Meals logged" />
            <Card variant="list">
              {loggedMeals.map((meal, index) => (
                <MealTimelineRow
                  key={meal.id}
                  time={meal.time}
                  slot={meal.slot}
                  mealName={meal.name}
                  calories={meal.calories}
                  protein={meal.protein}
                  status="eaten"
                  isLast={index === loggedMeals.length - 1}
                />
              ))}
            </Card>
          </section>
        )}

        <section className="flex flex-col gap-2">
          <SectionHeader title="Training" />
          <WorkoutCard
            splitLabel={recommendation.workout.splitLabel}
            muscleGroups={recommendation.workout.muscleGroups}
            exerciseCount={recommendation.workout.exerciseCount}
            estimatedMinutes={recommendation.workout.estimatedMinutes}
            exercises={recommendation.workout.exercises}
            status={recommendation.workout.status}
            onComplete={() => toast({ message: 'Workout logged', type: 'success' })}
          />
        </section>

        <section className="flex flex-col gap-2">
          <SectionHeader title="Push reminders" />
          <Card className="flex flex-col gap-4 p-4">
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
        </section>

        <section className="flex flex-col gap-2">
          <SectionHeader title="Reminder previews" />
          <Card variant="list">
            {reminderPreviews.map((reminder, index) => {
              const Icon = reminder.tone === 'due' ? Bell : Clock3

              return (
                <div
                  key={reminder.id}
                  className={`flex gap-3 px-4 py-3 ${
                    index !== reminderPreviews.length - 1 ? 'border-b border-[var(--color-border-divider)]' : ''
                  }`}
                >
                  <div className={`flex h-9 w-9 flex-none items-center justify-center rounded-[var(--radius-full)] ${reminderAccent(reminder.tone)}`}>
                    <Icon size={iconSize.sm} aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-[13px] font-medium text-[var(--color-text-secondary)]">
                        {reminder.label}
                      </p>
                      <p className="font-mono text-[13px] text-[var(--color-text-tertiary)]">
                        {reminder.time}
                      </p>
                    </div>
                    <p className="mt-1 text-[17px] font-semibold leading-[22px] text-[var(--color-text-primary)]">
                      {reminder.title}
                    </p>
                    <p className="mt-1 text-[13px] leading-[18px] text-[var(--color-text-secondary)]">
                      {reminder.body}
                    </p>
                  </div>
                </div>
              )
            })}
          </Card>
        </section>
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
              <p className="font-mono text-[13px] text-[var(--color-text-secondary)]">
                {meal.calories} cal · {meal.protein}g protein
              </p>
            </Card>
          ))}
        </div>
      </BottomSheet>

      <FloatingActionButton
        label="Log something"
        onClick={() => setManualOpen(true)}
      />
      <BottomNav active="today" onChange={handleNav} />
    </ScreenContainer>
  )
}

export default function TodayPage() {
  return (
    <ToastProvider>
      <TodayContent />
    </ToastProvider>
  )
}
