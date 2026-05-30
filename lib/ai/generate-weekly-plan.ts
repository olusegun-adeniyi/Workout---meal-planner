import Anthropic from '@anthropic-ai/sdk'
import { AiWeeklyPlanSchema, type AiWeeklyPlan } from './schemas'
import { buildWeeklyPlanPrompt } from './prompts'
import { getTargets, type ProfileInputs } from '@/lib/recommendations'

const illustratedMealNames = [
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

const weeklyPlanTool = {
  name: 'create_weekly_plan',
  description: 'Return a validated seven-day nutrition and training plan.',
  input_schema: {
    type: 'object',
    properties: {
      days: {
        type: 'array',
        minItems: 7,
        maxItems: 7,
        items: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'ISO date in YYYY-MM-DD format' },
            label: { type: 'string', description: 'Three-letter weekday, such as Mon' },
            date: { type: 'string', description: 'Two-digit day of month' },
            meals: {
              type: 'array',
              minItems: 4,
              maxItems: 4,
              items: {
                type: 'object',
                properties: {
                  slot: { type: 'string', enum: ['Breakfast', 'Brunch', 'Lunch', 'Dinner'] },
                  time: { type: 'string', description: '24-hour time in HH:mm format' },
                  name: { type: 'string', enum: illustratedMealNames },
                  calories: { type: 'number' },
                  protein: { type: 'number' },
                  cookTime: { type: 'number' },
                  cuisine: { type: 'string' },
                },
                required: ['slot', 'time', 'name', 'calories', 'protein', 'cookTime', 'cuisine'],
              },
            },
            workout: {
              type: 'object',
              properties: {
                split: { type: 'string', enum: ['Push', 'Pull', 'Legs', 'Upper', 'Rest'] },
                name: { type: 'string' },
                duration: { type: 'number' },
              },
              required: ['split', 'name', 'duration'],
            },
          },
          required: ['id', 'label', 'date', 'meals', 'workout'],
        },
      },
    },
    required: ['days'],
  },
} as const

export async function generateWeeklyPlanWithAi({
  profile,
  weekStarting,
}: {
  profile: ProfileInputs
  weekStarting: string
}): Promise<AiWeeklyPlan> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('Missing ANTHROPIC_API_KEY')

  const client = new Anthropic({ apiKey })
  const targets = getTargets(profile)
  const response = await client.messages.create({
    model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',
    max_tokens: 5000,
    tools: [weeklyPlanTool],
    tool_choice: { type: 'tool', name: weeklyPlanTool.name },
    messages: [{
      role: 'user',
      content: buildWeeklyPlanPrompt({
        profile,
        weekStarting,
        calorieTarget: targets.calorieTarget,
        proteinTarget: targets.proteinTarget,
      }),
    }],
  })

  const toolUse = response.content.find((block) => block.type === 'tool_use')
  if (!toolUse || toolUse.name !== weeklyPlanTool.name) {
    throw new Error('AI did not return a weekly plan')
  }

  return AiWeeklyPlanSchema.parse(toolUse.input)
}
