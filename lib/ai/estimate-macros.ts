import Anthropic from '@anthropic-ai/sdk'
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod'
// The SDK's output-format helper takes zod v4 schemas; zod 3.25 ships v4 at this path.
import { z } from 'zod/v4'
import { type EstimateMacrosRequest, type MacroEstimate, MacroEstimateSchema } from './schemas'

const DEFAULT_MODEL = 'claude-opus-5-5'

// What the model is constrained to emit; ranges are enforced by MacroEstimateSchema.
const EstimateOutputSchema = z.object({
  isFood: z.boolean().describe('false if the photo does not show food or drink'),
  name: z.string().describe('Short plain name of the meal, e.g. "Jollof rice with grilled chicken"'),
  calories: z.number().int().describe('Estimated total kcal for everything visible'),
  protein: z.number().int().describe('Estimated total protein in grams'),
  confidence: z.enum(['low', 'medium', 'high']),
  portionNote: z.string().describe('One short sentence on the main source of uncertainty'),
})

export class MacroEstimateError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'MacroEstimateError'
  }
}

function buildPrompt(note: string | undefined) {
  return `Estimate the calories and protein in this meal photo for a personal food log.

- Estimate the whole visible portion as one meal: total kcal and total grams of protein.
- Judge portion size from plate, cutlery, hands and packaging. Account for cooking oil and sauces, which are easy to miss — Nigerian stews and jollof often carry a lot of oil.
- Prefer a realistic middle estimate over a cautious low one.
- If the photo shows no food or drink, set isFood to false and use 0 for both numbers.
${note ? `\nThe person added: "${note}". Treat it as more reliable than the photo where they conflict.` : ''}`
}

/**
 * One retry if the output fails validation (CLAUDE.md rule 10); a second
 * failure throws so nothing malformed reaches the log.
 */
export async function estimateMacrosFromPhoto({ image, mediaType, note }: EstimateMacrosRequest): Promise<MacroEstimate> {
  if (!process.env.ANTHROPIC_API_KEY) throw new MacroEstimateError('Missing ANTHROPIC_API_KEY')

  const client = new Anthropic()
  let problem = ''

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const content: Anthropic.Beta.BetaContentBlockParam[] = [
      { type: 'image', source: { type: 'base64', media_type: mediaType, data: image } },
      { type: 'text', text: buildPrompt(note) },
    ]
    if (attempt > 0) content.push({ type: 'text', text: `Your previous answer was invalid (${problem}). Return realistic whole numbers.` })

    const response = await client.beta.messages.parse({
      model: process.env.ANTHROPIC_MODEL || DEFAULT_MODEL,
      max_tokens: 4000,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      output_config: { effort: 'medium', format: betaZodOutputFormat(EstimateOutputSchema) },
      messages: [{ role: 'user', content }],
    })

    if (response.stop_reason === 'refusal') throw new MacroEstimateError('The model declined to estimate this photo.')

    const parsed = MacroEstimateSchema.safeParse(response.parsed_output)
    if (parsed.success) return parsed.data
    problem = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ')
    console.warn(`Macro estimate attempt ${attempt + 1} failed validation`, problem)
  }

  throw new MacroEstimateError('The estimate failed validation twice.')
}
