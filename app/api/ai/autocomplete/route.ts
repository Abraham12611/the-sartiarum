import { generateText } from 'ai'
import { openrouter, MODELS } from '@/lib/ai/openrouter'
import { autocompleteSystem } from '@/lib/ai/prompts'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { aiUsage } from '@/lib/db/schema'

export const maxDuration = 15

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { precedingText } = await req.json()
  if (!precedingText?.trim()) return Response.json({ completion: '' })

  const context = precedingText.slice(-500)

  const { text, usage } = await generateText({
    model: openrouter(MODELS.fast),
    system: autocompleteSystem(),
    prompt: context,
    maxOutputTokens: 60,
  })

  await db.insert(aiUsage).values({
    ownerId:   user.id,
    action:    'autocomplete',
    model:     MODELS.fast,
    tokensIn:  usage?.inputTokens  ?? 0,
    tokensOut: usage?.outputTokens ?? 0,
  })

  return Response.json({ completion: text })
}
