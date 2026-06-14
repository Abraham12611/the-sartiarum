import { and, count as dbCount, eq, gte } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { DashboardSidebar } from '@/components/sidebar/Sidebar'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { db } from '@/lib/db'
import { aiUsage, boards, profiles, spaces, subscriptions } from '@/lib/db/schema'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  const [spacesData, boardsData, profileData, subData, usageCount] = await Promise.all([
    db.select().from(spaces).where(eq(spaces.ownerId, user.id)).orderBy(spaces.sortOrder),
    db.select().from(boards).where(eq(boards.ownerId, user.id)).orderBy(boards.sortOrder),
    db.select().from(profiles).where(eq(profiles.id, user.id)).limit(1),
    db.select().from(subscriptions).where(eq(subscriptions.ownerId, user.id)).limit(1),
    db
      .select({ value: dbCount() })
      .from(aiUsage)
      .where(and(eq(aiUsage.ownerId, user.id), gte(aiUsage.createdAt, thirtyDaysAgo))),
  ])

  const safeAiUsageCount = Number(usageCount[0]?.value ?? 0)
  const subscription = subData[0]
    ? {
        ...subData[0],
        trialEndsAt: subData[0].trialEndsAt
          ? new Date(subData[0].trialEndsAt).toISOString()
          : null,
      }
    : null

  return (
    <SidebarProvider defaultOpen>
      <DashboardSidebar
        spaces={spacesData}
        boards={boardsData}
        profile={profileData[0] ?? null}
        subscription={subscription}
        aiUsageCount={safeAiUsageCount}
      />
      <SidebarInset className="h-screen overflow-hidden bg-[#FBF8F2]">
        <div className="pointer-events-none absolute left-3 top-3 z-30 hidden md:peer-data-[state=collapsed]:block">
          <SidebarTrigger className="pointer-events-auto size-8 rounded-lg border border-[#E5DED4] bg-white/90 text-[#4D5650] shadow-sm hover:bg-white" />
        </div>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
