import { type RecommendedMeal } from '@/lib/recommendations'

export const FOOD_RECOMMENDATION_ILLUSTRATION_PROMPT =
  'The illustration style is a loose hand-painted watercolor food sketch with soft transparent washes, organic ink-like outlines, warm natural colors, expressive brush textures, subtle color bleeding, and a light blue-grey shadow on a clean white background.'

const foodIllustrationsByMealId: Partial<Record<RecommendedMeal['id'], string>> = {
  breakfast: '/images/meal-illustrations/whey-porridge-banana-peanut-butter.png',
  brunch: '/images/meal-illustrations/greek-yoghurt-granola-cashews.png',
  lunch: '/images/meal-illustrations/jollof-rice-grilled-chicken-mixed-veg.png',
  dinner: '/images/meal-illustrations/beef-stew-rice-plantain.png',
}

const foodIllustrationsByMealName: Record<string, string> = {
  'whey porridge with banana and peanut butter': '/images/meal-illustrations/whey-porridge-banana-peanut-butter.png',
  'protein oats with berries and almond butter': '/images/meal-illustrations/protein-oats-berries-almond-butter.png',
  'scrambled eggs, toast and avocado': '/images/meal-illustrations/scrambled-eggs-toast-avocado.png',
  'greek yoghurt, granola and cashews': '/images/meal-illustrations/greek-yoghurt-granola-cashews.png',
  'cottage cheese, banana and honey': '/images/meal-illustrations/cottage-cheese-banana-honey.png',
  'tuna melt on sourdough': '/images/meal-illustrations/tuna-melt-sourdough.png',
  'jollof rice, grilled chicken and mixed veg': '/images/meal-illustrations/jollof-rice-grilled-chicken-mixed-veg.png',
  'chicken suya wrap and yoghurt': '/images/meal-illustrations/chicken-suya-wrap-yoghurt.png',
  'turkey chilli with rice': '/images/meal-illustrations/turkey-chilli-rice.png',
  'beef stew, rice and plantain': '/images/meal-illustrations/beef-stew-rice-plantain.png',
  'salmon, potatoes and greens': '/images/meal-illustrations/salmon-potatoes-greens.png',
  'chicken stew, yam and spinach': '/images/meal-illustrations/chicken-stew-yam-spinach.png',
}

export function getFoodIllustrationSrc(meal: Pick<RecommendedMeal, 'id' | 'name'>) {
  return foodIllustrationsByMealName[meal.name.toLowerCase()]
    ?? foodIllustrationsByMealId[meal.id]
}
