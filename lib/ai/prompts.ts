import type { ProfileInputs } from '@/lib/recommendations'

export function buildWeeklyPlanPrompt({
  profile,
  weekStarting,
  calorieTarget,
  proteinTarget,
}: {
  profile: ProfileInputs
  weekStarting: string
  calorieTarget: number
  proteinTarget: number
}) {
  return `Create a practical 7-day meal and training plan for Forge, a personal muscle-gain app.

Profile:
- Height: ${profile.heightCm ?? 'not provided'} cm
- Current weight: ${profile.currentWeightKg ?? 'not provided'} kg
- Target weight: ${profile.targetWeightKg ?? 'not provided'} kg
- Daily calorie target: approximately ${calorieTarget} cal
- Daily protein target: at least ${proteinTarget} g
- Goal: gain weight and build muscle consistently

Plan requirements:
- Start on ${weekStarting} and return exactly 7 consecutive days.
- Return exactly 4 meals per day: Breakfast at 09:00, Brunch at 11:30, Lunch at 14:00, Dinner at 18:30.
- Keep each day's total calories close to ${calorieTarget} and protein at or above ${proteinTarget}.
- Use a balanced mix of Nigerian and British meals plus quick options.
- Select meals only from the illustrated meal-name options provided by the tool schema.
- Vary meals through the week and avoid repeating the same meal name on consecutive days.
- Use a practical Push, Pull, Legs, Upper and Rest training rhythm.
- Workout names should describe the muscle groups, such as "Chest · Shoulders · Triceps".
- Use the create_weekly_plan tool and return only the tool input.`
}
