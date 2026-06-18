import { streamText } from 'ai'
import { openrouter, MODELS } from '@/lib/ai/openrouter'
import { composeCoachingRespondPrompt } from '@/lib/ai/coaching-prompts'
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
  const { originalQuestion, userResponse, draftExcerpt } = body
  if (!originalQuestion || !userResponse?.trim()) {
    return new Response('Missing originalQuestion or userResponse', { status: 400 })
  }

  const action = 'write' as const
  const inputChars = String(userResponse).length
  const gate = await assertCanGenerate({ userId: user.id, action, inputChars })
  if (!gate.ok) return new Response(gate.reason, { status: gate.status })

  const { system, prompt, promptVersion } = composeCoachingRespondPrompt(
    originalQuestion,
    userResponse,
    draftExcerpt,
  )
  const modelId = MODELS.standard

  const result = streamText({
    model: openrouter(modelId),
    system,
    prompt,
    maxOutputTokens: 600,
    onFinish: async ({ usage }) => {
      const tokensIn = usage?.inputTokens ?? 0
      const tokensOut = usage?.outputTokens ?? 0

      await logAiUsage({
        userId: user.id,
        action: 'coach_respond',
        modelKey: 'standard',
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
