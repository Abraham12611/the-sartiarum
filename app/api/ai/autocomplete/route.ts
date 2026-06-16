import { generateText } from 'ai'
import { openrouter, MODELS } from '@/lib/ai/openrouter'
import { composePrompt } from '@/lib/ai/prompts'
import { getActionMaxOutputTokens, selectModel } from '@/lib/ai/router'
import { createClient } from '@/lib/supabase/server'
import { assertCanGenerate } from '@/lib/usage/gate'
import { logAiUsage } from '@/lib/usage/logging'
import { recordBudgetUsage } from '@/lib/usage/budget'

export const maxDuration = 15

export async function POST(req: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { precedingText } = await req.json()
  if (!precedingText?.trim()) return Response.json({ completion: '' })

  const action = 'autocomplete' as const
  const context = String(precedingText).slice(-500)
  const inputChars = context.length

  const gate = await assertCanGenerate({ userId: user.id, action, inputChars })
  if (!gate.ok) return new Response(gate.reason, { status: gate.status })

  const modelKey = selectModel({
    action,
    inputChars,
    tier: gate.tier,
    nearBudget: gate.nearBudget,
    retryCount: 0,
  })
  const modelId = MODELS[modelKey]
  const { system, promptVersion } = composePrompt(action, {})
  const maxOutputTokens = getActionMaxOutputTokens(action, { inputChars })

  const { text, usage } = await generateText({
    model: openrouter(modelId),
    system,
    prompt: context,
    maxOutputTokens,
  })

  const tokensIn = usage?.inputTokens ?? 0
  const tokensOut = usage?.outputTokens ?? 0

  await logAiUsage({
    userId: user.id,
    action,
    modelKey,
    modelId,
    tokensIn,
    tokensOut,
    promptVersion,
    tier: gate.tier,
  })

  await recordBudgetUsage({
    userId: user.id,
    tier: gate.tier,
    tokensUsed: tokensIn + tokensOut,
  })

  return Response.json({ completion: text })
}
