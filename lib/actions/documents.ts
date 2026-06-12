'use server'

import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { documents, documentVersions } from '@/lib/db/schema'
import { and, eq, desc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

async function requireUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  return user
}

export async function createDocument(boardId: string, sectionId?: string) {
  const user = await requireUser()
  const [doc] = await db
    .insert(documents)
    .values({ ownerId: user.id, boardId, sectionId, title: 'Untitled' })
    .returning()
  revalidatePath('/app')
  return doc
}

export async function saveDocument(id: string, content: unknown, wordCount: number) {
  const user = await requireUser()
  await db
    .update(documents)
    .set({ content: content as any, wordCount, updatedAt: new Date() })
    .where(and(eq(documents.id, id), eq(documents.ownerId, user.id)))

  await db.insert(documentVersions).values({
    documentId: id, ownerId: user.id, content: content as any,
  })
}

export async function getDocument(id: string) {
  const user = await requireUser()
  const [doc] = await db
    .select()
    .from(documents)
    .where(and(eq(documents.id, id), eq(documents.ownerId, user.id)))
    .limit(1)
  return doc ?? null
}

export async function getDocumentVersions(documentId: string) {
  const user = await requireUser()
  return db
    .select()
    .from(documentVersions)
    .where(and(
      eq(documentVersions.documentId, documentId),
      eq(documentVersions.ownerId, user.id),
    ))
    .orderBy(desc(documentVersions.createdAt))
    .limit(50)
}

export async function restoreVersion(versionId: string, documentId: string) {
  const user = await requireUser()
  const [v] = await db
    .select()
    .from(documentVersions)
    .where(and(
      eq(documentVersions.id, versionId),
      eq(documentVersions.ownerId, user.id),
    ))
    .limit(1)
  if (!v) throw new Error('Version not found')

  await db
    .update(documents)
    .set({ content: v.content as any, updatedAt: new Date() })
    .where(and(eq(documents.id, documentId), eq(documents.ownerId, user.id)))

  await db.insert(documentVersions).values({
    documentId, ownerId: user.id, content: v.content as any,
  })

  revalidatePath(`/app/doc/${documentId}`)
}

export async function updateDocumentTitle(id: string, title: string) {
  const user = await requireUser()
  await db
    .update(documents)
    .set({ title, updatedAt: new Date() })
    .where(and(eq(documents.id, id), eq(documents.ownerId, user.id)))
  revalidatePath(`/app/doc/${id}`)
}

export async function updateDocumentSettings(
  id: string,
  settings: { tone?: string; length?: string; audience?: string },
) {
  const user = await requireUser()
  await db
    .update(documents)
    .set({ ...settings, updatedAt: new Date() })
    .where(and(eq(documents.id, id), eq(documents.ownerId, user.id)))
}

export async function deleteDocument(id: string) {
  const user = await requireUser()
  await db
    .delete(documents)
    .where(and(eq(documents.id, id), eq(documents.ownerId, user.id)))
  revalidatePath('/app')
}
