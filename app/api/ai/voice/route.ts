import { streamText } from 'ai'
import { openrouter, MODELS } from '@/lib/ai/openrouter'
import { composeVoiceAnalysisPrompt } from '@/lib/ai/voice-prompts'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const maxDuration = 60

export async function POST(req: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const body = await req.json()
  const { samples } = body as { samples: string[] }

  if (!samples || !Array.isArray(samples) || samples.length === 0) {
    return new Response('Provide at least one writing sample', { status: 400 })
  }

  const totalChars = samples.reduce((sum, s) => sum + s.length, 0)
  if (totalChars < 100) {
    return new Response('Samples too short — provide at least 100 characters total', { status: 400 })
  }

  const { system, prompt } = composeVoiceAnalysisPrompt(samples)
  const modelId = MODELS.standard

  const result = streamText({
    model: openrouter(modelId),
    system,
    prompt,
    maxOutputTokens: 1500,
  })

  return result.toTextStreamResponse()
}

export async function GET(req: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { data, error } = await supabase
    .from('voice_profiles')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ profiles: data })
}
