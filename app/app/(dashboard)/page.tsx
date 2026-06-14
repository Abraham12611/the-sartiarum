import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { and, desc, eq, gte, count as dbCount } from 'drizzle-orm'
import { db } from '@/lib/db'
import {
  boards,
  documentSourceLinks,
  documents,
  notes,
  sections,
  upcomingTasks,
} from '@/lib/db/schema'
import { BoardView } from '@/components/dashboard/BoardView'
import type { DashboardStatus } from '@/components/dashboard/SectionTabs'
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
    notesCountRows,
    sourcesLinkedCountRows,
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
    (async () => {
      try {
        return await db
          .select({ value: dbCount() })
          .from(notes)
          .where(eq(notes.ownerId, user.id))
      } catch {
        return [{ value: 0 }]
      }
    })(),
    (async () => {
      try {
        return await db
          .select({ value: dbCount() })
          .from(documentSourceLinks)
          .where(eq(documentSourceLinks.ownerId, user.id))
      } catch {
        return [{ value: 0 }]
      }
    })(),
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

  const normalizedAllDocuments = allDocuments.map((document) => ({
    ...document,
    status: normalizeStatus(document.status),
  }))

  const notesCount = Number(notesCountRows[0]?.value ?? 0)
  const sourcesLinkedCount = Number(sourcesLinkedCountRows[0]?.value ?? 0)
  const inReviewCount = normalizedAllDocuments.filter(
    (document) => document.status === 'in_review',
  ).length

  const defaultSectionId =
    boardSections.find((section) => section.name.toLowerCase().includes('draft'))?.id ??
    boardSections[0]?.id

  return (
    <div className="grid h-full min-h-0 w-full grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px]">
      <BoardView
        board={activeBoard}
        sections={boardSections}
        documents={boardDocuments.map((document) => ({
          ...document,
          status: normalizeStatus(document.status),
        }))}
      />
      <StatsPanel
        documentsCount={normalizedAllDocuments.length}
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

function normalizeStatus(status: string | null): Exclude<DashboardStatus, 'all'> {
  if (status === 'ideas') return 'ideas'
  if (status === 'in_review') return 'in_review'
  if (status === 'final') return 'final'
  return 'draft'
}
