'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarDays } from 'lucide-react'
import {
  BottomNav,
  BottomSheet,
  Button,
  Card,
  EmptyState,
  ScreenContainer,
  SectionHeader,
  ToastProvider,
  useToast,
} from '@/components/component-library'
import { colors, iconSize } from '@/lib/tokens'
import { type ProfileInputs, getWeeklyRecommendation } from '@/lib/recommendations'

type NavTab = 'today' | 'plan' | 'progress' | 'log'
type MealSlot = 'Breakfast' | 'Brunch' | 'Lunch' | 'Dinner' | 'Snack AM' | 'Snack PM'
type SplitDay = 'Push' | 'Pull' | 'Legs' | 'Upper' | 'Rest'

type PlannedMeal = {
  id: string
  slot: MealSlot
  time: string
  name: string
  calories: number
  protein: number
  cookTime: number
  cuisine: string
}

type PlanDay = {
  id: string
  label: string
  date: string
  meals: PlannedMeal[]
  workout: {
    split: SplitDay
    name: string
    duration: number
  }
}

const weekPlan: PlanDay[] = [
  {
    id: 'mon',
    label: 'Mon',
    date: '25',
    workout: { split: 'Push', name: 'Chest · Shoulders · Triceps', duration: 52 },
    meals: [
      { id: 'mon-breakfast', slot: 'Breakfast', time: '08:00', name: 'Oats, banana, peanut butter', calories: 620, protein: 32, cookTime: 10, cuisine: 'British' },
      { id: 'mon-snack-am', slot: 'Snack AM', time: '11:00', name: 'Greek yoghurt and granola', calories: 410, protein: 28, cookTime: 5, cuisine: 'Quick' },
      { id: 'mon-lunch', slot: 'Lunch', time: '14:00', name: 'Jollof rice and grilled chicken', calories: 720, protein: 52, cookTime: 35, cuisine: 'Nigerian' },
      { id: 'mon-snack-pm', slot: 'Snack PM', time: '17:00', name: 'Tuna melt on sourdough', calories: 480, protein: 38, cookTime: 15, cuisine: 'British' },
      { id: 'mon-dinner', slot: 'Dinner', time: '20:00', name: 'Beef stew, rice and plantain', calories: 760, protein: 46, cookTime: 45, cuisine: 'Nigerian' },
    ],
  },
  {
    id: 'tue',
    label: 'Tue',
    date: '26',
    workout: { split: 'Pull', name: 'Back · Biceps', duration: 48 },
    meals: [
      { id: 'tue-breakfast', slot: 'Breakfast', time: '08:00', name: 'Eggs, toast and avocado', calories: 590, protein: 34, cookTime: 12, cuisine: 'British' },
      { id: 'tue-snack-am', slot: 'Snack AM', time: '11:00', name: 'Protein shake and banana', calories: 390, protein: 36, cookTime: 5, cuisine: 'Quick' },
      { id: 'tue-lunch', slot: 'Lunch', time: '14:00', name: 'Turkey chilli with rice', calories: 740, protein: 55, cookTime: 30, cuisine: 'British' },
      { id: 'tue-snack-pm', slot: 'Snack PM', time: '17:00', name: 'Peanut butter bagel', calories: 510, protein: 24, cookTime: 5, cuisine: 'Quick' },
      { id: 'tue-dinner', slot: 'Dinner', time: '20:00', name: 'Chicken suya wrap and yoghurt', calories: 690, protein: 50, cookTime: 20, cuisine: 'Nigerian' },
    ],
  },
  {
    id: 'wed',
    label: 'Wed',
    date: '27',
    workout: { split: 'Legs', name: 'Quads · Hamstrings · Calves', duration: 58 },
    meals: [
      { id: 'wed-breakfast', slot: 'Breakfast', time: '08:00', name: 'Porridge with whey and berries', calories: 640, protein: 44, cookTime: 10, cuisine: 'British' },
      { id: 'wed-snack-am', slot: 'Snack AM', time: '11:00', name: 'Cottage cheese and pineapple', calories: 360, protein: 30, cookTime: 5, cuisine: 'Quick' },
      { id: 'wed-lunch', slot: 'Lunch', time: '14:00', name: 'Rice, beans and grilled beef', calories: 780, protein: 54, cookTime: 40, cuisine: 'Nigerian' },
      { id: 'wed-snack-pm', slot: 'Snack PM', time: '17:00', name: 'Chicken pasta pot', calories: 520, protein: 41, cookTime: 15, cuisine: 'Quick' },
      { id: 'wed-dinner', slot: 'Dinner', time: '20:00', name: 'Salmon, potatoes and greens', calories: 710, protein: 49, cookTime: 30, cuisine: 'British' },
    ],
  },
  {
    id: 'thu',
    label: 'Thu',
    date: '28',
    workout: { split: 'Rest', name: 'Mobility and walk', duration: 25 },
    meals: [
      { id: 'thu-breakfast', slot: 'Breakfast', time: '08:00', name: 'Full breakfast wrap', calories: 660, protein: 39, cookTime: 15, cuisine: 'British' },
      { id: 'thu-snack-am', slot: 'Snack AM', time: '11:00', name: 'Skyr, honey and nuts', calories: 430, protein: 35, cookTime: 5, cuisine: 'Quick' },
      { id: 'thu-lunch', slot: 'Lunch', time: '14:00', name: 'Efo riro with rice and chicken', calories: 760, protein: 56, cookTime: 40, cuisine: 'Nigerian' },
      { id: 'thu-snack-pm', slot: 'Snack PM', time: '17:00', name: 'Mackerel toast', calories: 470, protein: 34, cookTime: 10, cuisine: 'British' },
      { id: 'thu-dinner', slot: 'Dinner', time: '20:00', name: 'Beef burger bowl', calories: 730, protein: 48, cookTime: 25, cuisine: 'British' },
    ],
  },
  {
    id: 'fri',
    label: 'Fri',
    date: '29',
    workout: { split: 'Upper', name: 'Heavy compounds', duration: 55 },
    meals: [
      { id: 'fri-breakfast', slot: 'Breakfast', time: '08:00', name: 'Whey pancakes and berries', calories: 610, protein: 45, cookTime: 20, cuisine: 'British' },
      { id: 'fri-snack-am', slot: 'Snack AM', time: '11:00', name: 'Boiled eggs and malt loaf', calories: 440, protein: 27, cookTime: 8, cuisine: 'Quick' },
      { id: 'fri-lunch', slot: 'Lunch', time: '14:00', name: 'Chicken fried rice', calories: 750, protein: 51, cookTime: 30, cuisine: 'Nigerian' },
      { id: 'fri-snack-pm', slot: 'Snack PM', time: '17:00', name: 'Protein smoothie', calories: 530, protein: 42, cookTime: 5, cuisine: 'Quick' },
      { id: 'fri-dinner', slot: 'Dinner', time: '20:00', name: 'Lamb stew and potatoes', calories: 790, protein: 50, cookTime: 45, cuisine: 'British' },
    ],
  },
  {
    id: 'sat',
    label: 'Sat',
    date: '30',
    workout: { split: 'Push', name: 'Volume push', duration: 45 },
    meals: [
      { id: 'sat-breakfast', slot: 'Breakfast', time: '08:30', name: 'Akara, eggs and toast', calories: 680, protein: 38, cookTime: 25, cuisine: 'Nigerian' },
      { id: 'sat-snack-am', slot: 'Snack AM', time: '11:30', name: 'Greek yoghurt bowl', calories: 420, protein: 31, cookTime: 5, cuisine: 'Quick' },
      { id: 'sat-lunch', slot: 'Lunch', time: '14:30', name: 'Chicken and plantain bowl', calories: 760, protein: 53, cookTime: 30, cuisine: 'Nigerian' },
      { id: 'sat-snack-pm', slot: 'Snack PM', time: '17:30', name: 'Cheese omelette sandwich', calories: 500, protein: 36, cookTime: 12, cuisine: 'British' },
      { id: 'sat-dinner', slot: 'Dinner', time: '20:30', name: 'Prawn pasta', calories: 730, protein: 47, cookTime: 25, cuisine: 'British' },
    ],
  },
  {
    id: 'sun',
    label: 'Sun',
    date: '31',
    workout: { split: 'Rest', name: 'Rest day', duration: 0 },
    meals: [
      { id: 'sun-breakfast', slot: 'Breakfast', time: '08:30', name: 'French toast and yoghurt', calories: 650, protein: 36, cookTime: 18, cuisine: 'British' },
      { id: 'sun-snack-am', slot: 'Snack AM', time: '11:30', name: 'Protein shake and cashews', calories: 450, protein: 36, cookTime: 5, cuisine: 'Quick' },
      { id: 'sun-lunch', slot: 'Lunch', time: '14:30', name: 'Ofada rice and turkey stew', calories: 790, protein: 55, cookTime: 45, cuisine: 'Nigerian' },
      { id: 'sun-snack-pm', slot: 'Snack PM', time: '17:30', name: 'Tuna jacket potato', calories: 520, protein: 42, cookTime: 12, cuisine: 'British' },
      { id: 'sun-dinner', slot: 'Dinner', time: '20:30', name: 'Chicken roast leftovers bowl', calories: 700, protein: 48, cookTime: 20, cuisine: 'British' },
    ],
  },
]

const swapOptions = [
  { name: 'Chicken suya wrap and yoghurt', calories: 690, protein: 50, cookTime: 20, cuisine: 'Nigerian' },
  { name: 'Turkey chilli with rice', calories: 740, protein: 55, cookTime: 30, cuisine: 'British' },
  { name: 'Salmon, potatoes and greens', calories: 710, protein: 49, cookTime: 30, cuisine: 'British' },
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

function buildWeekPlan(profile?: ProfileInputs): PlanDay[] {
  return getWeeklyRecommendation(profile).map((day) => ({
    id: day.id,
    label: day.label,
    date: day.date,
    meals: day.meals.map((meal) => ({
      id: `${day.id}-${meal.id}`,
      slot: meal.slot as MealSlot,
      time: meal.time,
      name: meal.name,
      calories: meal.calories,
      protein: meal.protein,
      cookTime: meal.cookTime,
      cuisine: meal.cuisine,
    })),
    workout: {
      split: day.workout.splitLabel.replace(' day', '') as SplitDay,
      name: day.workout.muscleGroups,
      duration: day.workout.estimatedMinutes,
    },
  }))
}

function todayId() {
  return new Date().toISOString().slice(0, 10)
}

function PlanContent() {
  const router = useRouter()
  const { toast } = useToast()
  const [plan, setPlan] = useState<PlanDay[] | null>(() => buildWeekPlan())
  const [selectedDayId, setSelectedDayId] = useState(todayId)
  const [locked, setLocked] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [swappingMeal, setSwappingMeal] = useState<PlannedMeal | null>(null)

  const selectedDay = useMemo(() => {
    return plan?.find((day) => day.id === selectedDayId) ?? plan?.[0]
  }, [plan, selectedDayId])

  const selectedTotals = useMemo(() => {
    return selectedDay?.meals.reduce(
      (totals, meal) => ({
        calories: totals.calories + meal.calories,
        protein: totals.protein + meal.protein,
      }),
      { calories: 0, protein: 0 },
    ) ?? { calories: 0, protein: 0 }
  }, [selectedDay])

  useEffect(() => {
    const nextPlan = buildWeekPlan(readStoredProfile())
    setPlan(nextPlan)
    setSelectedDayId(todayId())
  }, [])

  function generatePlan() {
    setGenerating(true)
    window.setTimeout(() => {
      setPlan(buildWeekPlan(readStoredProfile()))
      setSelectedDayId(todayId())
      setLocked(false)
      setGenerating(false)
      toast({ message: 'Plan generated', type: 'success' })
    }, 900)
  }

  function swapMeal(replacement: (typeof swapOptions)[number]) {
    if (!swappingMeal) return

    setPlan((currentPlan) => currentPlan?.map((day) => ({
      ...day,
      meals: day.meals.map((meal) => (
        meal.id === swappingMeal.id
          ? {
              ...meal,
              name: replacement.name,
              calories: replacement.calories,
              protein: replacement.protein,
              cookTime: replacement.cookTime,
              cuisine: replacement.cuisine,
            }
          : meal
      )),
    })) ?? null)
    setSwappingMeal(null)
    toast({ message: 'Meal swapped', type: 'success' })
  }

  function handleNav(tab: NavTab) {
    if (tab === 'plan') return
    if (tab === 'today') {
      router.push('/today')
      return
    }
    toast({ message: `${tab[0].toUpperCase()}${tab.slice(1)} is next`, type: 'neutral' })
  }

  return (
    <ScreenContainer>
      <div className="mx-auto flex w-full max-w-[430px] flex-1 flex-col gap-5 pb-8 pt-5">
        <header className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.6px] text-[var(--color-text-tertiary)]">
              Weekly review
            </p>
            <div className="flex items-center gap-2">
              <h1 className="text-[32px] font-bold leading-[36px] text-[var(--color-text-primary)]">
                This Week
              </h1>
              {locked && (
                <span className="rounded-[var(--radius-pill)] bg-[var(--color-action-primary-subtle)] px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.6px] text-[var(--color-text-accent)]">
                  Locked
                </span>
              )}
            </div>
          </div>
          {!plan && (
            <button
              type="button"
              onClick={generatePlan}
              className="min-h-11 text-[15px] font-semibold text-[var(--color-text-accent)] active:opacity-60"
            >
              Generate plan
            </button>
          )}
        </header>

        {generating && (
          <Card className="border-[var(--color-border-selected)] bg-[var(--color-action-primary-subtle)] p-4">
            <p className="text-[17px] font-semibold text-[var(--color-text-primary)]">
              Generating your week...
            </p>
            <p className="mt-1 text-[13px] leading-[18px] text-[var(--color-text-secondary)]">
              Building meals around 5 daily slots, high protein, and Nigerian + British preferences.
            </p>
          </Card>
        )}

        {!plan ? (
          <Card>
            <EmptyState
              icon={<CalendarDays size={iconSize.hero} color={colors.text.tertiary} />}
              title="No plan for this week."
              body="Generate this week's plan to review meals and workouts before locking it in."
              action={<Button onClick={generatePlan} loading={generating}>Generate plan</Button>}
            />
          </Card>
        ) : (
          <>
            <section className="flex gap-2 overflow-x-auto pb-1">
              {plan.map((day) => {
                const active = day.id === selectedDay?.id
                return (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => setSelectedDayId(day.id)}
                    className={`flex min-w-[62px] flex-col items-center rounded-[var(--radius-lg)] border px-3 py-2 transition-colors ${
                      active
                        ? 'border-[var(--color-border-selected)] bg-[var(--color-action-primary-subtle)]'
                        : 'border-[var(--color-border-default)] bg-[var(--color-surface-default)]'
                    }`}
                  >
                    <span className="text-[12px] font-medium text-[var(--color-text-secondary)]">{day.label}</span>
                    <span className="font-mono text-[20px] leading-[24px] text-[var(--color-text-primary)]">{day.date}</span>
                  </button>
                )
              })}
            </section>

            {selectedDay && (
              <>
                <section className="flex flex-col gap-2">
                  <SectionHeader title={`${selectedDay.label} ${selectedDay.date} meals`} />
                  <Card variant="list">
                    {selectedDay.meals.map((meal, index) => (
                      <div
                        key={meal.id}
                        className={`flex items-center gap-3 px-4 py-3 ${
                          index !== selectedDay.meals.length - 1 ? 'border-b border-[var(--color-border-divider)]' : ''
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.6px] text-[var(--color-text-tertiary)]">
                              {meal.time} · {meal.slot}
                            </p>
                          </div>
                          <p className="mt-1 truncate text-[17px] font-semibold leading-[22px] text-[var(--color-text-primary)]">
                            {meal.name}
                          </p>
                          <p className="mt-1 font-mono text-[13px] text-[var(--color-text-secondary)]">
                            {meal.calories} cal · {meal.protein}g protein · {meal.cookTime} min
                          </p>
                        </div>
                        {!locked && (
                          <button
                            type="button"
                            onClick={() => setSwappingMeal(meal)}
                            className="min-h-10 rounded-[var(--radius-pill)] px-3 text-[13px] font-semibold text-[var(--color-text-accent)] hover:bg-[var(--color-action-primary-subtle)]"
                          >
                            Swap
                          </button>
                        )}
                      </div>
                    ))}
                  </Card>
                  <p className="px-1 font-mono text-[13px] text-[var(--color-text-secondary)]">
                    {selectedTotals.calories} cal · {selectedTotals.protein}g protein
                  </p>
                </section>

                <section className="flex flex-col gap-2">
                  <SectionHeader title="Workout week" />
                  <Card className="p-3">
                    <div className="grid grid-cols-7 gap-2">
                      {plan.map((day) => {
                        const active = day.id === selectedDay.id
                        const isRest = day.workout.split === 'Rest'

                        return (
                          <button
                            key={day.id}
                            type="button"
                            onClick={() => setSelectedDayId(day.id)}
                            className={`flex min-h-[76px] flex-col items-center justify-between rounded-[var(--radius-md)] border px-1 py-2 ${
                              active
                                ? 'border-[var(--color-border-selected)] bg-[var(--color-action-primary-subtle)]'
                                : 'border-[var(--color-border-default)] bg-[var(--color-surface-default)]'
                            }`}
                          >
                            <span className="text-[11px] font-medium text-[var(--color-text-tertiary)]">{day.label}</span>
                            <span className={`text-[12px] font-semibold ${isRest ? 'text-[var(--color-text-tertiary)]' : 'text-[var(--color-text-primary)]'}`}>
                              {day.workout.split}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                    <div className="mt-3 border-t border-[var(--color-border-divider)] pt-3">
                      <p className="text-[15px] font-semibold text-[var(--color-text-primary)]">
                        {selectedDay.workout.name}
                      </p>
                      <p className="mt-1 font-mono text-[13px] text-[var(--color-text-secondary)]">
                        {selectedDay.workout.duration > 0 ? `est. ${selectedDay.workout.duration} min` : 'recovery day'}
                      </p>
                    </div>
                  </Card>
                </section>

                <Button
                  type="button"
                  variant={locked ? 'secondary' : 'primary'}
                  onClick={() => {
                    setLocked((current) => !current)
                    toast({ message: locked ? 'Plan unlocked' : 'Plan locked in', type: 'success' })
                  }}
                >
                  {locked ? 'Unlock plan' : "Lock in this week's plan"}
                </Button>
              </>
            )}
          </>
        )}
      </div>

      <BottomSheet open={!!swappingMeal} onClose={() => setSwappingMeal(null)} title="Swap meal">
        <div className="flex flex-col gap-3 pb-4">
          {swapOptions.map((meal) => (
            <Card key={meal.name} className="p-4" onClick={() => swapMeal(meal)}>
              <p className="text-[15px] font-semibold text-[var(--color-text-primary)]">{meal.name}</p>
              <p className="mt-1 font-mono text-[13px] text-[var(--color-text-secondary)]">
                {meal.calories} cal · {meal.protein}g protein · {meal.cookTime} min
              </p>
              <p className="mt-1 text-[13px] text-[var(--color-text-tertiary)]">{meal.cuisine}</p>
            </Card>
          ))}
        </div>
      </BottomSheet>

      <BottomNav active="plan" onChange={handleNav} />
    </ScreenContainer>
  )
}

export default function PlanPage() {
  return (
    <ToastProvider>
      <PlanContent />
    </ToastProvider>
  )
}
