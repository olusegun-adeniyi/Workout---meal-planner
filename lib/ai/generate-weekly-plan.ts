import Anthropic from '@anthropic-ai/sdk'
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod'
// The SDK's output-format helper takes zod v4 schemas; zod 3.25 ships v4 at this path.
import { z } from 'zod/v4'
import { AiWeeklyPlanSchema, type AiWeeklyPlan, illustratedMealNames } from './schemas'
import { buildWeeklyPlanPrompt, buildRetryInstruction } from './prompts'
import { getTargets, type ProfileInputs } from '@/lib/recommendations'
import { addDaysToIso } from '@/lib/time/london'

const DEFAULT_MODEL = 'claude-opus-5-5'


// What the model is constrained to emit. Range and date checks that JSON-schema
// constraints can't express are enforced afterwards by AiWeeklyPlanSchema.
const WeeklyPlanOutputSchema = z.object({
  days: z.array(z.object({
    id: z.string().describe('ISO date, YYYY-MM-DD'),
    label: z.string().describe('Three-letter weekday, e.g. Mon'),
    date: z.string().describe('Two-digit day of month, e.g. 06'),
    meals: z.array(z.object({
      slot: z.enum(['Breakfast', 'Brunch', 'Lunch', 'Dinner']),
      time: z.string().describe('24-hour HH:mm'),
      name: z.enum(illustratedMealNames),
      calories: z.number().int(),
      protein: z.number().int(),
      cookTime: z.number().int(),
      cuisine: z.string(),
    })),
    workout: z.object({
      split: z.enum(['Push', 'Pull', 'Legs', 'Upper', 'Rest']),
      name: z.string(),
      duration: z.number().int(),
    }),
  })),
})

export class WeeklyPlanGenerationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'WeeklyPlanGenerationError'
  }
}

function validatePlan(candidate: unknown, weekStarting: string): { plan: AiWeeklyPlan } | { problems: string[] } {
  const parsed = AiWeeklyPlanSchema.safeParse(candidate)
  if (!parsed.success) {
    return { problems: parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`) }
  }
  const wrongDates = parsed.data.days
    .map((day, index) => ({ got: day.id, want: addDaysToIso(weekStarting, index) }))
    .filter(({ got, want }) => got !== want)
  if (wrongDates.length > 0) {
    return { problems: wrongDates.map(({ got, want }) => `day id ${got} should be ${want}`) }
  }
  return { plan: parsed.data }
}

/**
 * One retry with the validation problems spelled out (CLAUDE.md rule 10). A
 * second failure throws so malformed data is never written.
 */
export async function generateWeeklyPlanWithAi({
  profile,
  weekStarting,
}: {
  profile: ProfileInputs
  weekStarting: string
}): Promise<AiWeeklyPlan> {
  if (!process.env.ANTHROPIC_API_KEY) throw new WeeklyPlanGenerationError('Missing ANTHROPIC_API_KEY')

  const client = new Anthropic()
  const targets = getTargets(profile)
  const prompt = buildWeeklyPlanPrompt({ profile, weekStarting, ...targets })
  let problems: string[] = []

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const messages: Anthropic.Beta.BetaMessageParam[] = [{ role: 'user', content: prompt }]
    if (attempt > 0) messages.push({ role: 'user', content: buildRetryInstruction(problems) })

    const response = await client.beta.messages.parse({
      model: process.env.ANTHROPIC_MODEL || DEFAULT_MODEL,
      max_tokens: 16000,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      output_config: {
        effort: 'medium',
        format: betaZodOutputFormat(WeeklyPlanOutputSchema),
      },
      messages,
    })

    if (response.stop_reason === 'refusal') {
      throw new WeeklyPlanGenerationError('The model declined to generate a plan.')
    }
    if (response.stop_reason === 'max_tokens') {
      problems = ['The response was cut off. Keep each field short.']
      continue
    }

    const result = validatePlan(response.parsed_output, weekStarting)
    if ('plan' in result) return result.plan
    problems = result.problems
    console.warn(`Weekly plan attempt ${attempt + 1} failed validation`, problems.slice(0, 5))
  }

  throw new WeeklyPlanGenerationError(`Plan failed validation twice: ${problems.slice(0, 3).join('; ')}`)
}
