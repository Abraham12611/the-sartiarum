import { streamText } from 'ai'
import { openrouter, MODELS } from '@/lib/ai/openrouter'
import { composePrompt } from '@/lib/ai/prompts'
import { getActionMaxOutputTokens, selectModel } from '@/lib/ai/router'
import { resolveWriterAiSettings } from '@/lib/ai/settings'
import { createClient } from '@/lib/supabase/server'
import { assertCanGenerate } from '@/lib/usage/gate'
import { logAiUsage } from '@/lib/usage/logging'
import { recordBudgetUsage } from '@/lib/usage/budget'

export const maxDuration = 60

export async function POST(req: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const body = await req.json()
  const { text } = body
  if (!text?.trim()) return new Response('No text provided', { status: 400 })

  const action = 'summarize' as const
  const inputChars = String(text).length
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
  const settings = await resolveWriterAiSettings({
    userId: user.id,
    documentId: body.documentId,
    fallbackTone: body.tone,
    fallbackLength: body.length,
    fallbackAudience: body.audience,
  })
  const { system, promptVersion } = composePrompt(action, settings)
  const maxOutputTokens = getActionMaxOutputTokens(action, { inputChars, length: settings.length })

  const result = streamText({
    model: openrouter(modelId),
    system,
    prompt: text,
    maxOutputTokens,
    onFinish: async ({ usage }) => {
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
    },
  })

  return result.toTextStreamResponse()
}
