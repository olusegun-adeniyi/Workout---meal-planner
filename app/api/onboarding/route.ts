import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const onboardingSchema = z.object({
  firstName: z.string().trim().min(1, 'Enter your first name'),
  lastName: z.string().trim().min(1, 'Enter your last name'),
  email: z.string().trim().email('Enter a valid email'),
  phone: z.string().trim().regex(/^\+?[0-9\s()-]{8,}$/, 'Enter a valid phone number'),
  heightCm: z.coerce.number().min(120, 'Enter height between 120 and 230 cm').max(230, 'Enter height between 120 and 230 cm'),
  currentWeightKg: z.coerce.number().min(30, 'Enter weight between 30 and 250 kg').max(250, 'Enter weight between 30 and 250 kg'),
  targetWeightKg: z.coerce.number().min(30, 'Enter target between 30 and 250 kg').max(250, 'Enter target between 30 and 250 kg'),
}).refine((values) => values.targetWeightKg > values.currentWeightKg, {
  message: 'Target should be above current weight',
  path: ['targetWeightKg'],
})

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const parsed = onboardingSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'Invalid onboarding details',
        fields: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    )
  }

  try {
    const supabase = createSupabaseServerClient()
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert(
        {
          first_name: parsed.data.firstName,
          last_name: parsed.data.lastName,
          email: parsed.data.email,
          phone: parsed.data.phone,
          height_cm: parsed.data.heightCm,
          current_weight_kg: parsed.data.currentWeightKg,
          target_weight_kg: parsed.data.targetWeightKg,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'email' },
      )
      .select('id, first_name, last_name, email, phone, height_cm, current_weight_kg, target_weight_kg')
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Could not save profile' },
        { status: 500 },
      )
    }

    return NextResponse.json({
      profile: {
        id: data.id,
        firstName: data.first_name,
        lastName: data.last_name,
        email: data.email,
        phone: data.phone,
        heightCm: data.height_cm,
        currentWeightKg: data.current_weight_kg,
        targetWeightKg: data.target_weight_kg,
      },
    })
  } catch (error) {
    const isMissingEnv = error instanceof Error && error.message.startsWith('Missing required environment variable')

    return NextResponse.json(
      { error: isMissingEnv ? error.message : 'Could not save profile' },
      { status: isMissingEnv ? 500 : 500 },
    )
  }
}
