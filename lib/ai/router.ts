import { MODELS } from '@/lib/ai/openrouter'

export type AiAction =
  | 'write'
  | 'rewrite'
  | 'summarize'
  | 'expand'
  | 'brainstorm'
  | 'autocomplete'
  | 'coach_analyze'
  | 'coach_respond'

export type Tier = 'trial' | 'pro'
export type ModelKey = keyof typeof MODELS

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export function estimateInputTokens(inputChars: number) {
  return Math.max(1, Math.ceil(inputChars / 4))
}

export function getActionMaxOutputTokens(
  action: AiAction,
  options: { inputChars: number; length?: string },
) {
  const inputTokens = estimateInputTokens(options.inputChars)
  const length = options.length ?? 'Medium'

  if (action === 'autocomplete') return 60
  if (action === 'summarize') return 220
  if (action === 'brainstorm') return 280
  if (action === 'rewrite') return clamp(Math.round(inputTokens * 1.25), 256, 1500)
  if (action === 'expand') return clamp(Math.round(inputTokens * 2.0), 384, 2000)

  if (length === 'Short') return 400
  if (length === 'Long') return 1800
  return 900
}

export function selectModel(options: {
  action: AiAction
  inputChars: number
  tier: Tier
  nearBudget: boolean
  retryCount: number
  qualityMode?: boolean
}): ModelKey {
  if (options.action === 'autocomplete') return 'fast'
  if (options.action === 'summarize') return 'fast'
  if (options.action === 'rewrite' && options.inputChars < 1200) return 'fast'
  if (options.retryCount > 0) return 'fallbackFast'
  if (options.nearBudget) return 'fast'
  if (options.tier === 'pro' && options.qualityMode) return 'premium'
  return 'standard'
}
