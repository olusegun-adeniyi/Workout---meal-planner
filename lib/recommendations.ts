export type MealStatus = 'eaten' | 'upcoming' | 'due-soon' | 'skipped' | 'past'

export type MealSlotId = 'breakfast' | 'brunch' | 'lunch' | 'dinner'

export type ProfileInputs = {
  currentWeightKg?: number | null
  targetWeightKg?: number | null
  heightCm?: number | null
}

export type RecommendedMeal = {
  id: MealSlotId
  slot: string
  time: string
  reminderTime: string
  name: string
  description: string
  calories: number
  protein: number
  cookTime: number
  cuisine: string
  status: MealStatus
}

export type RecommendedWorkout = {
  splitLabel: string
  muscleGroups: string
  exerciseCount: number
  estimatedMinutes: number
  status: 'upcoming' | 'in-progress' | 'completed'
  exercises: { name: string; target: string }[]
}

export type DailyRecommendation = {
  dateLabel: string
  calorieTarget: number
  proteinTarget: number
  meals: RecommendedMeal[]
  workout: RecommendedWorkout
}

export const recommendedMealTimes: Record<MealSlotId, string> = {
  breakfast: '09:00',
  brunch: '11:30',
  lunch: '14:00',
  dinner: '18:30',
}

type MealTemplate = Omit<RecommendedMeal, 'calories' | 'protein' | 'status'>

const mealTemplates: Record<MealSlotId, MealTemplate[]> = {
  breakfast: [
    {
      id: 'breakfast',
      slot: 'Breakfast',
      time: recommendedMealTimes.breakfast,
      reminderTime: '09:00',
      name: 'Whey porridge with banana and peanut butter',
      description: 'Early high-protein breakfast to start the eating window.',
      cookTime: 10,
      cuisine: 'British',
    },
    {
      id: 'breakfast',
      slot: 'Breakfast',
      time: recommendedMealTimes.breakfast,
      reminderTime: '09:00',
      name: 'Protein oats with berries and almond butter',
      description: 'A quick high-protein bowl with slow carbs and calorie support.',
      cookTime: 10,
      cuisine: 'Quick',
    },
    {
      id: 'breakfast',
      slot: 'Breakfast',
      time: recommendedMealTimes.breakfast,
      reminderTime: '09:00',
      name: 'Scrambled eggs, toast and avocado',
      description: 'Simple breakfast with protein, fats and easy morning energy.',
      cookTime: 12,
      cuisine: 'British',
    },
  ],
  brunch: [
    {
      id: 'brunch',
      slot: 'Brunch',
      time: recommendedMealTimes.brunch,
      reminderTime: '11:30',
      name: 'Greek yoghurt, granola and cashews',
      description: 'Small calorie-dense meal to keep the surplus on track.',
      cookTime: 5,
      cuisine: 'Quick',
    },
    {
      id: 'brunch',
      slot: 'Brunch',
      time: recommendedMealTimes.brunch,
      reminderTime: '11:30',
      name: 'Cottage cheese, banana and honey',
      description: 'A compact protein snack that is easy to eat between meals.',
      cookTime: 5,
      cuisine: 'Quick',
    },
    {
      id: 'brunch',
      slot: 'Brunch',
      time: recommendedMealTimes.brunch,
      reminderTime: '11:30',
      name: 'Tuna melt on sourdough',
      description: 'Higher-protein brunch for days when breakfast was lighter.',
      cookTime: 15,
      cuisine: 'British',
    },
  ],
  lunch: [
    {
      id: 'lunch',
      slot: 'Lunch',
      time: recommendedMealTimes.lunch,
      reminderTime: '14:00',
      name: 'Jollof rice, grilled chicken and mixed veg',
      description: 'Largest meal while digestion and training energy are still well supported.',
      cookTime: 35,
      cuisine: 'Nigerian',
    },
    {
      id: 'lunch',
      slot: 'Lunch',
      time: recommendedMealTimes.lunch,
      reminderTime: '14:00',
      name: 'Chicken suya wrap and yoghurt',
      description: 'Portable lunch with protein, carbs and a quick calorie lift.',
      cookTime: 20,
      cuisine: 'Nigerian',
    },
    {
      id: 'lunch',
      slot: 'Lunch',
      time: recommendedMealTimes.lunch,
      reminderTime: '14:00',
      name: 'Turkey chilli with rice',
      description: 'Batch-friendly lunch with lean protein and steady carbs.',
      cookTime: 30,
      cuisine: 'Quick',
    },
  ],
  dinner: [
    {
      id: 'dinner',
      slot: 'Dinner',
      time: recommendedMealTimes.dinner,
      reminderTime: '18:30',
      name: 'Beef stew, rice and plantain',
      description: 'Earlier evening meal to avoid pushing most calories close to sleep.',
      cookTime: 45,
      cuisine: 'Nigerian',
    },
    {
      id: 'dinner',
      slot: 'Dinner',
      time: recommendedMealTimes.dinner,
      reminderTime: '18:30',
      name: 'Salmon, potatoes and greens',
      description: 'Protein-rich evening meal with a lighter finish.',
      cookTime: 30,
      cuisine: 'British',
    },
    {
      id: 'dinner',
      slot: 'Dinner',
      time: recommendedMealTimes.dinner,
      reminderTime: '18:30',
      name: 'Chicken stew, yam and spinach',
      description: 'A filling dinner that keeps protein and carbs balanced.',
      cookTime: 40,
      cuisine: 'Nigerian',
    },
  ],
}

const calorieSplit: Record<MealSlotId, number> = {
  breakfast: 0.25,
  brunch: 0.18,
  lunch: 0.32,
  dinner: 0.25,
}

const proteinSplit: Record<MealSlotId, number> = {
  breakfast: 0.24,
  brunch: 0.2,
  lunch: 0.31,
  dinner: 0.25,
}

const workoutsByDay: RecommendedWorkout[] = [
  {
    splitLabel: 'Rest day',
    muscleGroups: 'Mobility and recovery',
    exerciseCount: 3,
    estimatedMinutes: 25,
    status: 'upcoming',
    exercises: [
      { name: 'Incline walk', target: '20 min easy pace' },
      { name: 'Hip mobility', target: '2 rounds' },
      { name: 'Shoulder mobility', target: '2 rounds' },
    ],
  },
  {
    splitLabel: 'Push day',
    muscleGroups: 'Chest · Shoulders · Triceps',
    exerciseCount: 5,
    estimatedMinutes: 52,
    status: 'upcoming',
    exercises: [
      { name: 'Bench press', target: '4 x 8 @ 80kg' },
      { name: 'Overhead press', target: '3 x 8 @ 50kg' },
      { name: 'Incline dumbbell press', target: '3 x 10 @ 28kg' },
      { name: 'Cable fly', target: '3 x 12 @ 17.5kg' },
      { name: 'Tricep pushdown', target: '3 x 12 @ 32.5kg' },
    ],
  },
  {
    splitLabel: 'Pull day',
    muscleGroups: 'Back · Biceps',
    exerciseCount: 5,
    estimatedMinutes: 48,
    status: 'upcoming',
    exercises: [
      { name: 'Deadlift', target: '3 x 5 @ 120kg' },
      { name: 'Pull-up', target: '4 x 6 bodyweight' },
      { name: 'Barbell row', target: '3 x 8 @ 70kg' },
      { name: 'Lat pulldown', target: '3 x 10 @ 65kg' },
      { name: 'Dumbbell curl', target: '3 x 12 @ 16kg' },
    ],
  },
  {
    splitLabel: 'Leg day',
    muscleGroups: 'Quads · Hamstrings · Calves',
    exerciseCount: 5,
    estimatedMinutes: 58,
    status: 'upcoming',
    exercises: [
      { name: 'Back squat', target: '4 x 6 @ 100kg' },
      { name: 'Romanian deadlift', target: '3 x 8 @ 90kg' },
      { name: 'Leg press', target: '3 x 10 @ 180kg' },
      { name: 'Walking lunge', target: '3 x 12 each leg' },
      { name: 'Standing calf raise', target: '4 x 12 @ 60kg' },
    ],
  },
  {
    splitLabel: 'Upper day',
    muscleGroups: 'Chest · Back · Shoulders',
    exerciseCount: 5,
    estimatedMinutes: 55,
    status: 'upcoming',
    exercises: [
      { name: 'Incline bench press', target: '4 x 8 @ 70kg' },
      { name: 'Chest-supported row', target: '4 x 10 @ 55kg' },
      { name: 'Dumbbell shoulder press', target: '3 x 10 @ 24kg' },
      { name: 'Lateral raise', target: '3 x 15 @ 10kg' },
      { name: 'Face pull', target: '3 x 15 @ 22.5kg' },
    ],
  },
]

function roundToNearest(value: number, nearest: number) {
  return Math.round(value / nearest) * nearest
}

export function getTargets(profile?: ProfileInputs) {
  const currentWeight = profile?.currentWeightKg && profile.currentWeightKg > 0
    ? profile.currentWeightKg
    : 80

  return {
    calorieTarget: roundToNearest(currentWeight * 35 + 500, 50),
    proteinTarget: Math.round(currentWeight * 1.8),
  }
}

function getMealStatus(time: string, now = new Date()): MealStatus {
  const [hours, minutes] = time.split(':').map(Number)
  const mealTime = new Date(now)
  mealTime.setHours(hours, minutes, 0, 0)

  const minutesUntil = (mealTime.getTime() - now.getTime()) / 60000

  if (minutesUntil < -45) return 'past'
  if (minutesUntil <= 30) return 'due-soon'
  return 'upcoming'
}

function getDaySeed(date: Date) {
  const startOfYear = new Date(date.getFullYear(), 0, 0)
  return Math.floor((date.getTime() - startOfYear.getTime()) / 86400000)
}

function toLocalIsoDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getMealTemplate(slot: MealSlotId, now: Date) {
  const templates = mealTemplates[slot]
  const slotOffset = (Object.keys(mealTemplates) as MealSlotId[]).indexOf(slot)
  return templates[(getDaySeed(now) + slotOffset) % templates.length]
}

export function getDailyRecommendation(profile?: ProfileInputs, now = new Date()): DailyRecommendation {
  const { calorieTarget, proteinTarget } = getTargets(profile)
  const dateLabel = now.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })

  const meals = (Object.keys(mealTemplates) as MealSlotId[]).map((slot) => {
    const template = getMealTemplate(slot, now)

    return {
      ...template,
      calories: roundToNearest(calorieTarget * calorieSplit[slot], 10),
      protein: Math.max(20, Math.round(proteinTarget * proteinSplit[slot])),
      status: getMealStatus(template.time, now),
    }
  })

  return {
    dateLabel,
    calorieTarget,
    proteinTarget,
    meals,
    workout: workoutsByDay[now.getDay()] ?? workoutsByDay[1],
  }
}

export function getReminderPreviews(profile?: ProfileInputs) {
  const recommendation = getDailyRecommendation(profile)

  return recommendation.meals.map((meal) => ({
    id: meal.id,
    time: meal.reminderTime,
    label: `${meal.slot} reminder`,
    title: `Eat at ${meal.time}`,
    body: `${meal.name} · ${meal.calories} cal · ${meal.protein}g protein`,
    tone: meal.id === 'lunch' ? 'due' as const : 'upcoming' as const,
  }))
}

export function getDueReminder(now = new Date()) {
  const recommendation = getDailyRecommendation(undefined, now)
  const londonTime = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(now)

  const currentHours = Number(londonTime.find((part) => part.type === 'hour')?.value ?? now.getHours())
  const currentClockMinutes = Number(londonTime.find((part) => part.type === 'minute')?.value ?? now.getMinutes())
  const currentMinutes = currentHours * 60 + currentClockMinutes

  return recommendation.meals.find((meal) => {
    const [hours, minutes] = meal.reminderTime.split(':').map(Number)
    const reminderMinutes = hours * 60 + minutes
    return Math.abs(currentMinutes - reminderMinutes) <= 7
  })
}

export function getWeeklyRecommendation(profile?: ProfileInputs, startDate = new Date()) {
  const start = new Date(startDate)
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7))

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start)
    date.setDate(start.getDate() + index)
    const day = getDailyRecommendation(profile, date)

    return {
      id: toLocalIsoDate(date),
      label: date.toLocaleDateString('en-GB', { weekday: 'short' }),
      date: date.toLocaleDateString('en-GB', { day: '2-digit' }),
      meals: day.meals,
      workout: day.workout,
    }
  })
}
