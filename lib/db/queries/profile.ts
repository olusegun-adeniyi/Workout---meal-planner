import type { ProfileInputs } from '@/lib/recommendations'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { throwIfMissingTable } from './errors'

/**
 * Single-user app. FORGE_PROFILE_EMAIL pins the owner's row — user_profiles also
 * holds test sign-ups, so "most recent" alone can pick the wrong person. Without
 * it, the most recently updated row is used.
 */
export async function getActiveProfile(): Promise<ProfileInputs> {
  const supabase = createSupabaseServerClient()
  const ownerEmail = process.env.FORGE_PROFILE_EMAIL?.trim()
  let query = supabase
    .from('user_profiles')
    .select('height_cm, current_weight_kg, target_weight_kg')
  if (ownerEmail) query = query.eq('email', ownerEmail)
  const { data, error } = await query
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    throwIfMissingTable(error, 'user_profiles')
    throw error
  }
  if (!data) return {}

  const toNumber = (value: number | null) => (value === null ? null : Number(value))
  return {
    heightCm: toNumber(data.height_cm),
    currentWeightKg: toNumber(data.current_weight_kg),
    targetWeightKg: toNumber(data.target_weight_kg),
  }
}
