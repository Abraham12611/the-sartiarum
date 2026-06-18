import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { searchParams } = new URL(req.url)
  const documentId = searchParams.get('documentId')

  let query = supabase
    .from('coaching_sessions')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  if (documentId) {
    query = query.eq('document_id', documentId)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ sessions: data })
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const body = await req.json()
  const { documentId, coachingItems, threadMessages, metrics } = body

  if (!documentId) {
    return new Response('Missing documentId', { status: 400 })
  }

  const { data, error } = await supabase
    .from('coaching_sessions')
    .insert({
      owner_id: user.id,
      document_id: documentId,
      coaching_items: coachingItems || [],
      thread_messages: threadMessages || [],
      metrics: metrics || null,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ session: data })
}
