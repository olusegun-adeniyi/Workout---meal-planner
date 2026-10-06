import { z } from 'zod'
import { AiPlanDaySchema } from '@/lib/ai/schemas'
import { IsoDateSchema } from '@/lib/logs/schemas'
import {
  type DailyRecommendation,
  type MealSlotId,
  getMealStatus,
  getWorkoutForSplit,
} from '@/lib/recommendations'
import { formatLondonShortDay } from '@/lib/time/london'

// Client-safe: shared by GET /api/plan/day and the Today screen.

export const PlanDaySchema = z.object({
  date: IsoDateSchema,
  source: z.enum(['ai', 'fallback']),
  calorieTarget: z.number().int(),
  proteinTarget: z.number().int(),
  day: AiPlanDaySchema,
})
export type PlanDay = z.infer<typeof PlanDaySchema>

/** Turns a stored plan day into the shape the Today UI renders; status is time-based. */
export function toDailyRecommendation(planDay: PlanDay, now?: Date): DailyRecommendation {
  return {
    dateLabel: formatLondonShortDay(planDay.date),
    calorieTarget: planDay.calorieTarget,
    proteinTarget: planDay.proteinTarget,
    meals: planDay.day.meals.map((meal) => ({
      id: meal.slot.toLowerCase() as MealSlotId,
      slot: meal.slot,
      time: meal.time,
      reminderTime: meal.time,
      name: meal.name,
      description: '',
      calories: meal.calories,
      protein: meal.protein,
      cookTime: meal.cookTime,
      cuisine: meal.cuisine,
      status: getMealStatus(meal.time, now),
    })),
    workout: getWorkoutForSplit(planDay.day.workout.split, planDay.day.workout.name, planDay.day.workout.duration),
  }
}
