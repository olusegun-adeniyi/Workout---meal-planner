import { generateWeeklyPlanWithAi } from '@/lib/ai/generate-weekly-plan'
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
import type { PlanDay } from './plan-day'

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

/**
 * The plan for one day. Only the current week is generated on demand — browsing
 * a far-off date in the calendar shouldn't trigger an AI call.
 */
export async function getPlanDay(date: string): Promise<PlanDay> {
  const profile = await getActiveProfile()
  const targets = getTargets(profile)
  const weekStarting = getWeekStartIso(date)
  const isCurrentWeek = weekStarting === getWeekStartIso(getLondonToday().iso)

  const week = (await readStored(weekStarting))
    ?? (isCurrentWeek ? await generateOnce(weekStarting, profile) : buildFallbackWeek(profile, weekStarting))

  const day = week.days.find((candidate) => candidate.id === date)
    ?? buildFallbackWeek(profile, weekStarting).days.find((candidate) => candidate.id === date)
  if (!day) throw new Error(`No plan day for ${date}`)

  return { date, source: week.source, ...targets, day }
}

