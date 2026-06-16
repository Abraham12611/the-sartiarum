import { createOpenRouter } from '@openrouter/ai-sdk-provider'

export const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
})

export const MODELS = {
  fast:         'openai/gpt-4o-mini',
  standard:     'anthropic/claude-sonnet-4-6',
  premium:      'anthropic/claude-sonnet-4-6',
  fallbackFast: 'openai/gpt-4o-mini',
} as const
