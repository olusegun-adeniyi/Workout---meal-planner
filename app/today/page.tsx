'use client'

import { type FormEvent, type ReactNode, useEffect, useId, useMemo, useState } from 'react'
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
import { getFoodIllustrationSrc } from '@/lib/food-illustrations'
import {
  type ProfileInputs,
  type RecommendedMeal,
  getDailyRecommendation,
  getReminderPreviews,
} from '@/lib/recommendations'

type NavTab = 'today' | 'plan' | 'progress' | 'log'
type ManualLogField = 'name' | 'calories' | 'protein' | 'notes'

type Meal = RecommendedMeal
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

function MealIllustration({
  slot,
  className = '',
}: {
  slot: string
  className?: string
}) {
  const filterId = `watercolor-${slot}-${useId().replace(/:/g, '')}`
  const palette = {
    breakfast: {
      wash: '#fff4c7',
      accent: '#d97706',
      green: '#83c56b',
      red: '#f97316',
      title: 'Porridge bowl illustration',
    },
    brunch: {
      wash: '#f8e8ff',
      accent: '#7c3aed',
      green: '#a3e635',
      red: '#dc2626',
      title: 'Yoghurt bowl illustration',
    },
    lunch: {
      wash: '#ffe8c7',
      accent: '#dc2626',
      green: '#22c55e',
      red: '#f97316',
      title: 'Rice and chicken illustration',
    },
    dinner: {
      wash: '#fde2c4',
      accent: '#92400e',
      green: '#65a30d',
      red: '#dc2626',
      title: 'Stew rice and plantain illustration',
    },
  }[slot] ?? {
    wash: '#f2f2f0',
    accent: '#9a9a98',
    green: '#16a34a',
    red: '#d97706',
    title: 'Meal illustration',
  }

  return (
    <svg
      viewBox="0 0 220 150"
      role="img"
      aria-label={palette.title}
      className={className}
    >
      <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="8" />
        <feDisplacementMap in="SourceGraphic" scale="1.4" />
      </filter>
      <ellipse cx="106" cy="124" rx="76" ry="13" fill="#dbeafe" opacity="0.45" filter={`url(#${filterId})`} />
      <path
        d="M55 93c22-32 89-37 124-11 13 10 15 24 3 32-32 20-119 21-145 2-10-8-5-17 18-23Z"
        fill={palette.wash}
        opacity="0.75"
        filter={`url(#${filterId})`}
      />
      <path
        d="M51 86c21-25 92-32 126-9 14 9 13 25-2 34-32 19-112 19-142 1-14-8-6-19 18-26Z"
        fill="none"
        stroke="#7c3f18"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.72"
      />
      {slot === 'breakfast' && (
        <>
          <ellipse cx="106" cy="78" rx="58" ry="31" fill="#fff7d6" opacity="0.9" />
          <ellipse cx="106" cy="76" rx="44" ry="20" fill="#f8dca4" opacity="0.75" filter={`url(#${filterId})`} />
          <path d="M78 66c18 8 34 8 57 0" fill="none" stroke={palette.accent} strokeWidth="4" strokeLinecap="round" opacity="0.55" />
          <circle cx="137" cy="82" r="11" fill="#facc15" opacity="0.82" />
          <path d="M131 77c8 3 12 7 14 12" fill="none" stroke="#854d0e" strokeWidth="2" opacity="0.45" />
        </>
      )}
      {slot === 'brunch' && (
        <>
          <path d="M72 65h88l-10 45H82L72 65Z" fill="#f8fafc" stroke="#7c3f18" strokeWidth="3" opacity="0.88" />
          <path d="M84 76c23 10 45 10 66 0l-5 24H88Z" fill="#f5d0fe" opacity="0.8" filter={`url(#${filterId})`} />
          <circle cx="94" cy="77" r="6" fill={palette.red} opacity="0.78" />
          <circle cx="124" cy="83" r="5" fill="#2563eb" opacity="0.7" />
          <path d="M104 68c13 8 27 8 41 0" fill="none" stroke="#b45309" strokeWidth="4" strokeLinecap="round" opacity="0.45" />
        </>
      )}
      {slot === 'lunch' && (
        <>
          <ellipse cx="113" cy="82" rx="57" ry="29" fill="#fff7ed" stroke="#7c3f18" strokeWidth="3" opacity="0.9" />
          <path d="M75 82c22-12 57-14 77-1-20 18-55 21-77 1Z" fill="#f97316" opacity="0.75" filter={`url(#${filterId})`} />
          <path d="M132 62c18 7 28 19 27 34-20 0-33-8-39-22 4-6 8-10 12-12Z" fill="#f8d9b0" stroke="#7c3f18" strokeWidth="2.5" opacity="0.9" />
          <path d="M73 99c12-11 27-14 43-8" fill="none" stroke={palette.green} strokeWidth="7" strokeLinecap="round" opacity="0.58" />
        </>
      )}
      {slot === 'dinner' && (
        <>
          <ellipse cx="105" cy="83" rx="58" ry="29" fill="#fff7ed" stroke="#7c3f18" strokeWidth="3" opacity="0.9" />
          <path d="M72 78c28-15 60-13 90 2-16 23-70 29-90-2Z" fill="#b45309" opacity="0.7" filter={`url(#${filterId})`} />
          <path d="M142 96c13-10 27-10 41-1-9 12-24 16-40 10Z" fill="#facc15" stroke="#92400e" strokeWidth="2.5" opacity="0.85" />
          <circle cx="95" cy="76" r="7" fill={palette.red} opacity="0.65" />
          <path d="M70 99c17 7 36 9 57 4" fill="none" stroke={palette.green} strokeWidth="5" strokeLinecap="round" opacity="0.55" />
        </>
      )}
      <path
        d="M56 91c24-20 86-27 123-8M44 107c33 20 111 22 141 2"
        fill="none"
        stroke="#7c3f18"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.42"
      />
    </svg>
  )
}

function FoodArtwork({
  meal,
  className = '',
  imageClassName = '',
}: {
  meal: Pick<Meal, 'id' | 'name'>
  className?: string
  imageClassName?: string
}) {
  const illustrationSrc = getFoodIllustrationSrc(meal)

  if (illustrationSrc) {
    return (
      <img
        src={illustrationSrc}
        alt={`Watercolor illustration of ${meal.name}`}
        className={`object-contain ${className} ${imageClassName}`}
      />
    )
  }

  return <MealIllustration slot={meal.id} className={className} />
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
  const [notificationOpen, setNotificationOpen] = useState(false)

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
    <ScreenContainer className="lg:bg-[var(--color-surface-default)] lg:px-0">
      <div className="mx-auto flex w-full max-w-[430px] flex-1 flex-col gap-6 pb-8 pt-5 lg:hidden">
        <header className="flex items-end justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.6px] text-[var(--color-text-tertiary)]">
              {recommendation.dateLabel}
            </p>
            <h1 className="text-[32px] font-bold leading-[36px] text-[var(--color-text-primary)]">
              Today
            </h1>
          </div>
          <div className="flex items-center gap-2">
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
            <StreakCounter days={streak} />
          </div>
        </header>

        {notificationOpen && (
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
        )}

        <section>
          {skipConfirmOpen && nextMeal ? (
            <Card className="p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.6px] text-[var(--color-text-secondary)]">
                Skip this meal?
              </p>
              <h2 className="mt-1 text-[24px] font-semibold leading-[28px] text-[var(--color-text-primary)]">
                {nextMeal.name}
              </h2>
              <p className="mt-1 text-[15px] text-[var(--color-text-secondary)]">
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
                      <p className="text-[13px] text-[var(--color-text-tertiary)]">
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
                {recommendedMeals.length} meals
              </span>
            </div>
            <div className="mt-6 grid gap-3">
              {recommendedMeals.map((meal) => (
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
              ))}
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

      <div className="lg:hidden">
        <FloatingActionButton
          label="Log something"
          onClick={() => setManualOpen(true)}
        />
        <BottomNav active="today" onChange={handleNav} />
      </div>
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
