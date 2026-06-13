import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { spaces, boards, profiles, subscriptions, aiUsage } from '@/lib/db/schema'
import { eq, and, gte, count as dbCount } from 'drizzle-orm'
import { Sidebar } from '@/components/sidebar/Sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  const [spacesData, boardsData, profileData, subData, usageCount] = await Promise.all([
    db.select().from(spaces).where(eq(spaces.ownerId, user.id)).orderBy(spaces.sortOrder),
    db.select().from(boards).where(eq(boards.ownerId, user.id)).orderBy(boards.sortOrder),
    db.select().from(profiles).where(eq(profiles.id, user.id)).limit(1),
    db.select().from(subscriptions).where(eq(subscriptions.ownerId, user.id)).limit(1),
    db.select({ value: dbCount() }).from(aiUsage).where(
      and(eq(aiUsage.ownerId, user.id), gte(aiUsage.createdAt, thirtyDaysAgo))
    ),
  ])

  const safeAiUsageCount = Number(usageCount[0]?.value ?? 0)
  const subscription = subData[0]
    ? {
        ...subData[0],
        trialEndsAt: subData[0].trialEndsAt ? new Date(subData[0].trialEndsAt).toISOString() : null,
      }
    : null

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#faf7f0', fontFamily: 'Inter, sans-serif' }}>
      <Sidebar
        spaces={spacesData}
        boards={boardsData}
        profile={profileData[0] ?? null}
        subscription={subscription}
        aiUsageCount={safeAiUsageCount}
      />
      <main style={{ flex: 1, minWidth: 0 }}>{children}</main>
    </div>
  )
}
