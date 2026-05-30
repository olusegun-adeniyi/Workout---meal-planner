import { z } from 'zod'

const MealSlotSchema = z.enum(['Breakfast', 'Brunch', 'Lunch', 'Dinner'])
const WorkoutSplitSchema = z.enum(['Push', 'Pull', 'Legs', 'Upper', 'Rest'])

export const AiPlannedMealSchema = z.object({
  slot: MealSlotSchema,
  time: z.string().regex(/^\d{2}:\d{2}$/),
  name: z.string().trim().min(3),
  calories: z.number().int().min(150).max(1400),
  protein: z.number().int().min(10).max(120),
  cookTime: z.number().int().min(0).max(90),
  cuisine: z.string().trim().min(2),
})

export const AiPlanDaySchema = z.object({
  id: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  label: z.string().trim().min(3).max(3),
  date: z.string().regex(/^\d{2}$/),
  meals: z.array(AiPlannedMealSchema).length(4),
  workout: z.object({
    split: WorkoutSplitSchema,
    name: z.string().trim().min(3),
    duration: z.number().int().min(0).max(120),
  }),
})

export const AiWeeklyPlanSchema = z.object({
  days: z.array(AiPlanDaySchema).length(7),
})

export type AiWeeklyPlan = z.infer<typeof AiWeeklyPlanSchema>

