'use server'

import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { spaces } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

async function requireUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  return user
}

export async function getSpaces() {
  const user = await requireUser()
  return db.select().from(spaces).where(eq(spaces.ownerId, user.id))
}

export async function createSpace(name: string) {
  const user = await requireUser()
  const [space] = await db
    .insert(spaces)
    .values({ ownerId: user.id, name })
    .returning()
  revalidatePath('/app')
  return space
}

export async function updateSpace(id: string, updates: { name?: string; sortOrder?: number }) {
  const user = await requireUser()
  await db
    .update(spaces)
    .set(updates)
    .where(and(eq(spaces.id, id), eq(spaces.ownerId, user.id)))
  revalidatePath('/app')
}

export async function deleteSpace(id: string) {
  const user = await requireUser()
  await db
    .delete(spaces)
    .where(and(eq(spaces.id, id), eq(spaces.ownerId, user.id)))
  revalidatePath('/app')
}
