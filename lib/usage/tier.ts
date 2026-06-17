import { db } from '@/lib/db'
import { subscriptions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export type Tier = 'trial' | 'pro'

export function deriveTier(
  subscription:
    | { status: string; trialEndsAt: Date | null }
    | null
    | undefined,
): Tier | null {
  if (!subscription) return null
  if (subscription.status === 'active') return 'pro'
  if (
    subscription.status === 'trialing' &&
    subscription.trialEndsAt &&
    subscription.trialEndsAt > new Date()
  ) {
    return 'trial'
  }
  return null
}

export async function getUserSubscription(userId: string) {
  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.ownerId, userId))
    .limit(1)

  return subscription ?? null
}
