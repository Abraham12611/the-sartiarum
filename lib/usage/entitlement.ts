import { db } from '@/lib/db'
import { subscriptions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function assertCanGenerate(
  userId: string,
): Promise<{ ok: boolean; reason?: string }> {
  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.ownerId, userId))
    .limit(1)

  if (!sub) return { ok: false, reason: 'No subscription record found.' }

  const active   = sub.status === 'active'
  const trialing = sub.status === 'trialing' && sub.trialEndsAt != null && sub.trialEndsAt > new Date()

  if (!active && !trialing) {
    return { ok: false, reason: 'Your trial has ended — please subscribe to continue.' }
  }

  // TODO Day 5: add Upstash Ratelimit per tier
  return { ok: true }
}
