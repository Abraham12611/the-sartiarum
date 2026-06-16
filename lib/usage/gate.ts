import type { AiAction } from '@/lib/ai/router'
import { estimateInputTokens } from '@/lib/ai/router'
import { assertBudget } from '@/lib/usage/budget'
import { assertRateLimit } from '@/lib/usage/ratelimit'
import { deriveTier, getUserSubscription } from '@/lib/usage/tier'
import type { Tier } from '@/lib/usage/tier'

export type GateResult =
  | { ok: true; tier: Tier; nearBudget: boolean }
  | { ok: false; status: number; reason: string }

export async function assertCanGenerate(options: {
  userId: string
  action: AiAction
  inputChars: number
}): Promise<GateResult> {
  const subscription = await getUserSubscription(options.userId)
  const tier = deriveTier(subscription)

  if (!tier) {
    return {
      ok: false,
      status: 402,
      reason: 'Your trial has ended or billing is inactive. Please subscribe to continue.',
    }
  }

  const rate = await assertRateLimit({
    userId: options.userId,
    tier,
    action: options.action,
  })

  if (!rate.ok) {
    return { ok: false, status: 429, reason: rate.reason }
  }

  const budget = await assertBudget({
    userId: options.userId,
    tier,
    projectedTokens: estimateInputTokens(options.inputChars),
  })

  if (!budget.ok) {
    return { ok: false, status: 402, reason: budget.reason ?? 'AI budget exceeded.' }
  }

  return { ok: true, tier, nearBudget: budget.nearBudget }
}
