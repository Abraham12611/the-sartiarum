import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const body = await req.json()
  const { profile, sampleExcerpts } = body

  if (!profile || !profile.name) {
    return new Response('Invalid profile data', { status: 400 })
  }

  const { data, error } = await supabase
    .from('voice_profiles')
    .insert({
      owner_id: user.id,
      name: profile.name,
      description: profile.description || null,
      tone_keywords: profile.tone_keywords || [],
      sentence_structure: profile.sentence_structure || {},
      vocabulary_level: profile.vocabulary_level || 'standard',
      signature_patterns: profile.signature_patterns || [],
      sample_excerpts: sampleExcerpts || [],
      raw_analysis: profile,
      is_active: true,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ profile: data })
}
