import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { documents } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'
import { WriterView } from '@/components/writer/WriterView'

export default async function WriterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [doc] = await db
    .select()
    .from(documents)
    .where(and(eq(documents.id, id), eq(documents.ownerId, user.id)))
    .limit(1)

  if (!doc) notFound()

  return <WriterView document={doc} />
}
