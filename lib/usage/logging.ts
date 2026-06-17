import { sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import type { AiAction, ModelKey } from '@/lib/ai/router'
import type { Tier } from '@/lib/usage/tier'

export async function logAiUsage(options: {
  userId: string
  action: AiAction
  modelKey: ModelKey
  modelId: string
  tokensIn: number
  tokensOut: number
  promptVersion: string
  tier: Tier
  latencyMs?: number
  requestId?: string
  fallbackReason?: string | null
}) {
  try {
    await db.execute(sql`
      insert into ai_usage
        (owner_id, action, model, tokens_in, tokens_out, prompt_version, tier, latency_ms, request_id, fallback_reason)
      values
        (${options.userId}, ${options.action}, ${options.modelId}, ${options.tokensIn}, ${options.tokensOut},
         ${options.promptVersion}, ${options.tier}, ${options.latencyMs ?? null}, ${options.requestId ?? null},
         ${options.fallbackReason ?? null})
    `)
    return
  } catch {
    await db.execute(sql`
      insert into ai_usage
        (owner_id, action, model, tokens_in, tokens_out)
      values
        (${options.userId}, ${options.action}, ${options.modelId}, ${options.tokensIn}, ${options.tokensOut})
    `)
  }
}
