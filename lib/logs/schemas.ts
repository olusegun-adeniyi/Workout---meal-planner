import { z } from 'zod'
import { isValidIsoDate } from '@/lib/time/london'

// Shared by route handlers (input validation) and the client (response parsing),
// so nothing untyped crosses the network boundary in either direction.

export const IsoDateSchema = z.string().refine(isValidIsoDate, 'Use a YYYY-MM-DD date')

export const MealSlotSchema = z.enum(['breakfast', 'brunch', 'lunch', 'dinner'])

const macro = z.number().finite().min(0).max(10000).transform((value) => Math.round(value))

export const MealLogInputSchema = z.discriminatedUnion('source', [
  z.object({
    source: z.literal('planned'),
    date: IsoDateSchema,
    slot: MealSlotSchema,
    status: z.enum(['eaten', 'skipped']),
    name: z.string().trim().min(1).max(200),
    calories: macro,
    protein: macro,
  }),
  z.object({
    // A typed meal, or one estimated from a photo and confirmed by the user.
    source: z.enum(['custom_text', 'custom_photo']),
    date: IsoDateSchema,
    name: z.string().trim().min(1).max(200),
    calories: macro,
    protein: macro,
    notes: z.string().trim().max(500).optional(),
  }),
])
export type MealLogInput = z.input<typeof MealLogInputSchema>

export const MealLogSchema = z.object({
  id: z.string(),
  date: IsoDateSchema,
  slot: MealSlotSchema.nullable(),
  status: z.enum(['eaten', 'skipped']),
  source: z.enum(['planned', 'custom_text', 'custom_photo']),
  name: z.string(),
  calories: z.number().int(),
  protein: z.number().int(),
  notes: z.string().nullable(),
  loggedAt: z.string(),
})
export type MealLog = z.infer<typeof MealLogSchema>

export const WorkoutLogInputSchema = z.object({
  date: IsoDateSchema,
  splitLabel: z.string().trim().min(1).max(100),
})
export type WorkoutLogInput = z.infer<typeof WorkoutLogInputSchema>

export const WorkoutLogSchema = z.object({
  id: z.string(),
  date: IsoDateSchema,
  splitLabel: z.string(),
  completedAt: z.string(),
})
export type WorkoutLog = z.infer<typeof WorkoutLogSchema>

export const DayLogsSchema = z.object({
  date: IsoDateSchema,
  mealLogs: z.array(MealLogSchema),
  workoutLog: WorkoutLogSchema.nullable(),
  streak: z.number().int().min(0),
})
export type DayLogs = z.infer<typeof DayLogsSchema>

export const ApiErrorSchema = z.object({
  error: z.string(),
  setupRequired: z.string().optional(),
})
