import { type RecommendedMeal } from '@/lib/recommendations'

export const FOOD_RECOMMENDATION_ILLUSTRATION_PROMPT =
  'The illustration style is a loose hand-painted watercolor food sketch with soft transparent washes, organic ink-like outlines, warm natural colors, expressive brush textures, subtle color bleeding, and a light blue-grey shadow on a clean white background.'

const foodIllustrationsByMealId: Partial<Record<RecommendedMeal['id'], string>> = {
  breakfast: '/images/meal-illustrations/whey-porridge-banana-peanut-butter.png',
  brunch: '/images/meal-illustrations/greek-yoghurt-granola-cashews.png',
  lunch: '/images/meal-illustrations/jollof-rice-grilled-chicken-mixed-veg.png',
  dinner: '/images/meal-illustrations/beef-stew-rice-plantain.png',
}

export function getFoodIllustrationSrc(meal: Pick<RecommendedMeal, 'id'>) {
  return foodIllustrationsByMealId[meal.id]
}
