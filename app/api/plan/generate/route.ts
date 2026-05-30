import { NextResponse } from 'next/server'
import { z } from 'zod'
import { generateWeeklyPlanWithAi } from '@/lib/ai/generate-weekly-plan'
import { getWeeklyRecommendation, type ProfileInputs } from '@/lib/recommendations'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { Json } from '@/lib/supabase/types'

const requestSchema = z.object({
  profileId: z.string().uuid().optional(),
  heightCm: z.number().positive().optional(),
  currentWeightKg: z.number().positive().optional(),
  targetWeightKg: z.number().positive().optional(),
})

function mondayIsoDate(now = new Date()) {
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7))
  const year = monday.getFullYear()
  const month = String(monday.getMonth() + 1).padStart(2, '0')
  const day = String(monday.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function buildFallbackPlan(profile: ProfileInputs) {
  return getWeeklyRecommendation(profile).map((day) => ({
    id: day.id,
    label: day.label,
    date: day.date,
    meals: day.meals.map((meal) => ({
      slot: meal.slot,
      time: meal.time,
      name: meal.name,
      calories: meal.calories,
      protein: meal.protein,
      cookTime: meal.cookTime,
      cuisine: meal.cuisine,
    })),
    workout: {
      split: day.workout.splitLabel.replace(' day', ''),
      name: day.workout.muscleGroups,
      duration: day.workout.estimatedMinutes,
    },
  }))
}

async function saveWeeklyPlan({
  profileId,
  weekStarting,
  source,
  days,
}: {
  profileId?: string
  weekStarting: string
  source: 'ai' | 'fallback'
  days: unknown
}) {
  try {
    const supabase = createSupabaseServerClient()
    const { error } = await supabase
      .from('weekly_plans')
      .upsert({
        profile_id: profileId ?? null,
        week_starting_date: weekStarting,
        source,
        plan: days as Json,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'week_starting_date' })

    return error ? 'Run the latest Supabase schema to save weekly plans.' : null
  } catch {
    return 'Weekly plan returned without database storage.'
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const parsed = requestSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid profile details.' }, { status: 400 })
  }

  const weekStarting = mondayIsoDate()
  let source: 'ai' | 'fallback' = 'fallback'
  let days = buildFallbackPlan(parsed.data)
  let aiMessage: string | null = null

  try {
    const aiPlan = await generateWeeklyPlanWithAi({
      profile: parsed.data,
      weekStarting,
    })
    days = aiPlan.days
    source = 'ai'
  } catch (error) {
    console.error('Weekly AI plan generation fell back to local plan', error)
    aiMessage = process.env.ANTHROPIC_API_KEY
      ? 'AI plan generation failed, so Forge used the local planner.'
      : 'Add ANTHROPIC_API_KEY in Vercel to enable AI-generated plans.'
  }

  const storageMessage = await saveWeeklyPlan({
    profileId: parsed.data.profileId,
    weekStarting,
    source,
    days,
  })

  return NextResponse.json({
    plan: days,
    source,
    message: aiMessage ?? storageMessage,
  })
}
