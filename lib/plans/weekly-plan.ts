import { after } from 'next/server'
import { generateWeeklyPlanWithAi } from '@/lib/ai/generate-weekly-plan'
import { illustratedMealNames } from '@/lib/ai/schemas'
import { SetupRequiredError } from '@/lib/db/queries/errors'
import { getActiveProfile } from '@/lib/db/queries/profile'
import { type StoredWeek, getWeeklyPlan, saveWeeklyPlan } from '@/lib/db/queries/weekly-plans'
import {
  type ProfileInputs,
  type WorkoutSplit,
  getTargets,
  getWeeklyRecommendation,
} from '@/lib/recommendations'
import { getLondonToday, getWeekStartIso, toPlanningDate } from '@/lib/time/london'
import type { MealSlotLabel, PlanDay, PlanWeek } from './plan-day'

// Server-only. Generation takes ~30s, so concurrent requests for the same week
// share one promise. If weekly_plans doesn't exist yet, plans live in memory
// for the life of the server process instead of regenerating on every request.
const inFlight = new Map<string, Promise<StoredWeek>>()
const memoryFallback = new Map<string, StoredWeek>()

const splitByLabel: Record<string, WorkoutSplit> = {
  'Push day': 'Push',
  'Pull day': 'Pull',
  'Leg day': 'Legs',
  'Upper day': 'Upper',
  'Rest day': 'Rest',
}

export function buildFallbackWeek(profile: ProfileInputs, weekStarting: string): StoredWeek {
  const days = getWeeklyRecommendation(profile, toPlanningDate(weekStarting)).map((day) => ({
    id: day.id,
    label: day.label,
    date: day.date,
    meals: day.meals.map((meal) => ({
      slot: meal.slot as 'Breakfast' | 'Brunch' | 'Lunch' | 'Dinner',
      time: meal.time,
      name: meal.name,
      calories: meal.calories,
      protein: meal.protein,
      cookTime: meal.cookTime,
      cuisine: meal.cuisine,
    })),
    workout: {
      split: splitByLabel[day.workout.splitLabel] ?? 'Rest',
      name: day.workout.muscleGroups,
      duration: day.workout.estimatedMinutes,
    },
  }))
  return { source: 'fallback', days }
}

async function readStored(weekStarting: string) {
  try {
    return await getWeeklyPlan(weekStarting)
  } catch (error) {
    if (error instanceof SetupRequiredError) return memoryFallback.get(weekStarting) ?? null
    throw error
  }
}

async function store(weekStarting: string, week: StoredWeek) {
  try {
    await saveWeeklyPlan(weekStarting, week)
  } catch (error) {
    if (!(error instanceof SetupRequiredError)) throw error
    memoryFallback.set(weekStarting, week)
  }
}

/** Always generates (AI first, local planner if AI fails) and stores the result. */
export async function generateWeek(weekStarting: string, profile: ProfileInputs) {
  let week: StoredWeek
  let message: string | null = null
  try {
    const plan = await generateWeeklyPlanWithAi({ profile, weekStarting })
    week = { source: 'ai', days: plan.days }
  } catch (error) {
    console.error('Weekly AI plan generation fell back to local plan', error)
    message = 'AI plan generation failed, so Forge used the local planner.'
    week = buildFallbackWeek(profile, weekStarting)
  }
  await store(weekStarting, week)
  return { week, message }
}

function generateOnce(weekStarting: string, profile: ProfileInputs) {
  const pending = inFlight.get(weekStarting)
  if (pending) return pending
  const promise = generateWeek(weekStarting, profile)
    .then(({ week }) => week)
    .finally(() => inFlight.delete(weekStarting))
  inFlight.set(weekStarting, promise)
  return promise
}

const FALLBACK_RETRY_MS = 6 * 60 * 60 * 1000

/**
 * Only the current week is generated on demand — browsing a far-off date
 * shouldn't trigger an AI call. A current week stored as the local fallback
 * (the AI was down) is served as-is and upgraded in the background, at most
 * every few hours.
 */
async function resolveWeek(weekStarting: string, profile: ProfileInputs) {
  const isCurrentWeek = weekStarting === getWeekStartIso(getLondonToday().iso)
  const stored = await readStored(weekStarting)

  if (stored) {
    const age = stored.updatedAt ? Date.now() - new Date(stored.updatedAt).getTime() : 0
    if (isCurrentWeek && stored.source === 'fallback' && age > FALLBACK_RETRY_MS) {
      after(() => generateOnce(weekStarting, profile).catch((error) => console.error('Fallback upgrade failed', error)))
    }
    return stored
  }
  return isCurrentWeek ? generateOnce(weekStarting, profile) : buildFallbackWeek(profile, weekStarting)
}

export async function getPlanDay(date: string): Promise<PlanDay> {
  const profile = await getActiveProfile()
  const weekStarting = getWeekStartIso(date)
  const week = await resolveWeek(weekStarting, profile)

  const day = week.days.find((candidate) => candidate.id === date)
    ?? buildFallbackWeek(profile, weekStarting).days.find((candidate) => candidate.id === date)
  if (!day) throw new Error(`No plan day for ${date}`)

  return { date, source: week.source, ...getTargets(profile), day }
}

export async function getPlanWeek(date: string): Promise<PlanWeek> {
  const profile = await getActiveProfile()
  const weekStarting = getWeekStartIso(date)
  const week = await resolveWeek(weekStarting, profile)
  return { weekStarting, source: week.source, ...getTargets(profile), days: week.days }
}

export class InvalidSwapError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'InvalidSwapError'
  }
}

/**
 * Replaces one planned meal by name. The slot keeps its planned calories and
 * protein — the portion scales — so the day's totals still hit target. A week
 * that only existed as a fallback is stored first so the swap sticks.
 */
export async function swapPlannedMeal({ date, slot, name }: { date: string; slot: MealSlotLabel; name: string }) {
  if (!(illustratedMealNames as readonly string[]).includes(name)) {
    throw new InvalidSwapError('Pick one of the suggested meals.')
  }
  const profile = await getActiveProfile()
  const weekStarting = getWeekStartIso(date)
  const week = await resolveWeek(weekStarting, profile)

  const day = week.days.find((candidate) => candidate.id === date)
  const meal = day?.meals.find((candidate) => candidate.slot === slot)
  if (!day || !meal) throw new InvalidSwapError(`No ${slot.toLowerCase()} planned on ${date}.`)

  const swappedDay = { ...day, meals: day.meals.map((entry) => (entry.slot === slot ? { ...entry, name } : entry)) }
  await store(weekStarting, {
    ...week,
    days: week.days.map((candidate) => (candidate.id === date ? swappedDay : candidate)),
  })
  return swappedDay
}
