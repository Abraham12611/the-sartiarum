import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { boards, sections, documents } from '@/lib/db/schema'
import { eq, and, desc, count as dbCount } from 'drizzle-orm'
import { BoardView } from '@/components/dashboard/BoardView'
import { StatsPanel } from '@/components/dashboard/StatsPanel'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ board?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const params = await searchParams

  // Resolve active board
  let activeBoardId = params.board
  if (!activeBoardId) {
    const [pinned] = await db
      .select()
      .from(boards)
      .where(and(eq(boards.ownerId, user.id), eq(boards.isPinned, true)))
      .orderBy(boards.sortOrder)
      .limit(1)
    activeBoardId = pinned?.id
  }
  if (!activeBoardId) {
    const [first] = await db.select().from(boards).where(eq(boards.ownerId, user.id)).limit(1)
    activeBoardId = first?.id
  }

  if (!activeBoardId) {
    // Seed hasn't fired yet — show empty state
    return (
      <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9AA4A0', fontSize: 15 }}>
        Setting up your workspace…
      </div>
    )
  }

  const [activeBoard, boardSections, boardDocs, totalCount, recentDocs] = await Promise.all([
    db.select().from(boards).where(and(eq(boards.id, activeBoardId), eq(boards.ownerId, user.id))).limit(1),
    db.select().from(sections).where(and(eq(sections.boardId, activeBoardId), eq(sections.ownerId, user.id))).orderBy(sections.sortOrder),
    db.select().from(documents).where(and(eq(documents.boardId, activeBoardId), eq(documents.ownerId, user.id))).orderBy(desc(documents.updatedAt)),
    db.select({ value: dbCount() }).from(documents).where(eq(documents.ownerId, user.id)),
    db.select().from(documents).where(eq(documents.ownerId, user.id)).orderBy(desc(documents.updatedAt)).limit(6),
  ])

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <BoardView
        board={activeBoard[0]}
        sections={boardSections}
        documents={boardDocs}
        userId={user.id}
      />
      <StatsPanel
        totalDocuments={totalCount[0]?.value ?? 0}
        recentDocuments={recentDocs}
      />
    </div>
  )
}
