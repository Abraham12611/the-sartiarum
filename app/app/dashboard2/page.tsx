import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { and, count as dbCount, desc, eq, gte } from 'drizzle-orm'
import { db } from '@/lib/db'
import {
  boards,
  documentSourceLinks,
  documents,
  notes,
  sections,
  upcomingTasks,
} from '@/lib/db/schema'
import { BoardView2 } from '@/components/dashboard2/BoardView2'
import { StatsPanel2 } from '@/components/dashboard2/StatsPanel2'
import type { DashboardStatus2 } from '@/components/dashboard2/SectionTabs2'

export default async function Dashboard2Page({
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
      <div className="flex flex-1 items-center justify-center text-[15px] text-[#7f887f]">
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
    allSections,
    allBoards,
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
    db.select().from(sections).where(eq(sections.ownerId, user.id)),
    db.select().from(boards).where(eq(boards.ownerId, user.id)).orderBy(boards.sortOrder),
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
  if (!activeBoard) redirect('/app/dashboard2')

  const sectionNameById = new Map(
    allSections.map((section) => [section.id, section.name.toLowerCase()]),
  )

  const normalizedAllDocuments = allDocuments.map((document) => ({
    ...document,
    status: inferStatusFromSectionName(sectionNameById.get(document.sectionId ?? '') ?? ''),
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
    <div className="grid h-full min-h-0 w-full grid-cols-1 xl:grid-cols-[minmax(0,1fr)_272px] xl:gap-x-5 xl:px-3">
      <BoardView2
        board={activeBoard}
        allBoards={allBoards}
        sections={boardSections}
        documents={boardDocuments.map((document) => ({
          ...document,
          status: inferStatusFromSectionName(
            boardSections.find((section) => section.id === document.sectionId)?.name.toLowerCase() ??
              '',
          ),
        }))}
      />
      <StatsPanel2
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

function inferStatusFromSectionName(sectionName: string): Exclude<DashboardStatus2, 'all'> {
  if (sectionName.includes('idea')) return 'ideas'
  if (sectionName.includes('review')) return 'in_review'
  if (sectionName.includes('final')) return 'final'
  return 'draft'
}
