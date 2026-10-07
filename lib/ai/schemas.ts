import { z } from 'zod'

// Meals are limited to these so every suggestion has a matching illustration.
export const illustratedMealNames = [
  'Whey porridge with banana and peanut butter',
  'Protein oats with berries and almond butter',
  'Scrambled eggs, toast and avocado',
  'Greek yoghurt, granola and cashews',
  'Cottage cheese, banana and honey',
  'Tuna melt on sourdough',
  'Jollof rice, grilled chicken and mixed veg',
  'Chicken suya wrap and yoghurt',
  'Turkey chilli with rice',
  'Beef stew, rice and plantain',
  'Salmon, potatoes and greens',
  'Chicken stew, yam and spinach',
] as const

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


// Photo logging — shared by POST /api/meal-log/estimate and the confirm sheet.
export const PhotoMediaTypeSchema = z.enum(['image/jpeg', 'image/png', 'image/webp'])

// The API accepts images up to 5MB; base64 is ~4/3 the size of the bytes.
const MAX_IMAGE_BASE64_LENGTH = Math.floor((5 * 1024 * 1024 * 4) / 3)

export const EstimateMacrosRequestSchema = z.object({
  /** Raw base64, no data: prefix. */
  image: z.string().min(100).max(MAX_IMAGE_BASE64_LENGTH).regex(/^[A-Za-z0-9+/]+=*$/, 'Image must be base64'),
  mediaType: PhotoMediaTypeSchema,
  note: z.string().trim().max(200).optional(),
})
export type EstimateMacrosRequest = z.infer<typeof EstimateMacrosRequestSchema>

export const MacroEstimateSchema = z.object({
  isFood: z.boolean(),
  name: z.string().trim().min(1).max(120),
  calories: z.number().int().min(0).max(5000),
  protein: z.number().int().min(0).max(400),
  confidence: z.enum(['low', 'medium', 'high']),
  /** One short line on what drives the uncertainty, e.g. portion size or oil. */
  portionNote: z.string().trim().max(200),
})
export type MacroEstimate = z.infer<typeof MacroEstimateSchema>
