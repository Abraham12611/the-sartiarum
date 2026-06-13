import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { and, desc, eq, gte } from 'drizzle-orm'
import { db } from '@/lib/db'
import { boards, documents, sections, upcomingTasks } from '@/lib/db/schema'
import { BoardView } from '@/components/dashboard/BoardView'
import { StatsPanel } from '@/components/dashboard/StatsPanel'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ board?: string }>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const params = await searchParams
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
    const [first] = await db
      .select()
      .from(boards)
      .where(eq(boards.ownerId, user.id))
      .orderBy(boards.sortOrder)
      .limit(1)
    activeBoardId = first?.id
  }

  if (!activeBoardId) {
    return (
      <div
        style={{
          display: 'flex',
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          color: '#7f887f',
          fontSize: 15,
        }}
      >
        Setting up your workspace...
      </div>
    )
  }

  const now = new Date()

  const [
    activeBoardRows,
    boardSections,
    boardDocuments,
    allDocuments,
    allBoards,
    allSections,
    recentDocuments,
    taskItems,
  ] = await Promise.all([
    db
      .select()
      .from(boards)
      .where(and(eq(boards.id, activeBoardId), eq(boards.ownerId, user.id)))
      .limit(1),
    db
      .select()
      .from(sections)
      .where(and(eq(sections.boardId, activeBoardId), eq(sections.ownerId, user.id)))
      .orderBy(sections.sortOrder),
    db
      .select()
      .from(documents)
      .where(and(eq(documents.boardId, activeBoardId), eq(documents.ownerId, user.id)))
      .orderBy(desc(documents.updatedAt)),
    db
      .select()
      .from(documents)
      .where(eq(documents.ownerId, user.id))
      .orderBy(desc(documents.updatedAt)),
    db.select().from(boards).where(eq(boards.ownerId, user.id)),
    db.select().from(sections).where(eq(sections.ownerId, user.id)),
    db
      .select()
      .from(documents)
      .where(eq(documents.ownerId, user.id))
      .orderBy(desc(documents.updatedAt))
      .limit(7),
    db
      .select()
      .from(upcomingTasks)
      .where(and(eq(upcomingTasks.ownerId, user.id), gte(upcomingTasks.scheduledFor, now)))
      .orderBy(upcomingTasks.scheduledFor)
      .limit(5),
  ])

  const activeBoard = activeBoardRows[0]
  if (!activeBoard) redirect('/app')

  const boardNameById = new Map(allBoards.map((board) => [board.id, board.name.toLowerCase()]))
  const sectionNameById = new Map(
    allSections.map((section) => [section.id, section.name.toLowerCase()]),
  )

  let notesCount = 0
  let sourcesLinkedCount = 0
  let inReviewCount = 0

  for (const document of allDocuments) {
    const boardContext = boardNameById.get(document.boardId ?? '') ?? ''
    const sectionContext = sectionNameById.get(document.sectionId ?? '') ?? ''
    const context = `${boardContext} ${sectionContext}`

    if (context.includes('note')) notesCount += 1
    if (context.includes('source')) sourcesLinkedCount += 1
    if (context.includes('review')) inReviewCount += 1
  }

  const defaultSectionId =
    boardSections.find((section) => section.name.toLowerCase().includes('draft'))?.id ??
    boardSections[0]?.id

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', minHeight: '100vh', width: '100%' }}>
      <BoardView board={activeBoard} sections={boardSections} documents={boardDocuments} />
      <StatsPanel
        documentsCount={allDocuments.length}
        notesCount={notesCount}
        sourcesLinkedCount={sourcesLinkedCount}
        inReviewCount={inReviewCount}
        recentDocuments={recentDocuments}
        upcomingTasks={taskItems.map((task) => ({
          id: task.id,
          title: task.title,
          scheduledFor: task.scheduledFor,
        }))}
        boardId={activeBoardId}
        defaultSectionId={defaultSectionId}
      />
    </div>
  )
}
