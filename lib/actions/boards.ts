'use server'

import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { boards, sections } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

async function requireUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  return user
}

export async function getBoards() {
  const user = await requireUser()
  return db.select().from(boards).where(eq(boards.ownerId, user.id))
}

export async function createBoard(spaceId: string, name: string) {
  const user = await requireUser()
  const [board] = await db
    .insert(boards)
    .values({ ownerId: user.id, spaceId, name })
    .returning()
  revalidatePath('/app')
  return board
}

export async function updateBoard(
  id: string,
  updates: { name?: string; icon?: string; color?: string; isPinned?: boolean; sortOrder?: number },
) {
  const user = await requireUser()
  await db
    .update(boards)
    .set(updates)
    .where(and(eq(boards.id, id), eq(boards.ownerId, user.id)))
  revalidatePath('/app')
}

export async function deleteBoard(id: string) {
  const user = await requireUser()
  await db
    .delete(boards)
    .where(and(eq(boards.id, id), eq(boards.ownerId, user.id)))
  revalidatePath('/app')
}

export async function getSections(boardId: string) {
  const user = await requireUser()
  return db
    .select()
    .from(sections)
    .where(and(eq(sections.boardId, boardId), eq(sections.ownerId, user.id)))
}
