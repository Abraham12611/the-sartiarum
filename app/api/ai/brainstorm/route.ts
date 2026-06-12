import { streamText } from 'ai'
import { openrouter, MODELS } from '@/lib/ai/openrouter'
import { brainstormSystem } from '@/lib/ai/prompts'
import { createClient } from '@/lib/supabase/server'
import { assertCanGenerate } from '@/lib/usage/entitlement'
import { db } from '@/lib/db'
import { aiUsage } from '@/lib/db/schema'

export const maxDuration = 60

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const gate = await assertCanGenerate(user.id)
  if (!gate.ok) return new Response(gate.reason, { status: 402 })

  const { topic, tone, length, audience } = await req.json()
  if (!topic?.trim()) return new Response('No topic provided', { status: 400 })

  const result = streamText({
    model: openrouter(MODELS.standard),
    system: brainstormSystem({ tone, length, audience }),
    prompt: topic,
    onFinish: async ({ usage }) => {
      await db.insert(aiUsage).values({
        ownerId:   user.id,
        action:    'brainstorm',
        model:     MODELS.standard,
        tokensIn:  usage?.inputTokens  ?? 0,
        tokensOut: usage?.outputTokens ?? 0,
      })
    },
  })

  return result.toUIMessageStreamResponse()
}
