'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import {
  CalendarDots,
  ClockCounterClockwise,
  FileDoc,
  LinkSimpleHorizontal,
  NotePencil,
  Plus,
  Pulse,
} from '@phosphor-icons/react'
import { createDocument } from '@/lib/actions/documents'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type RecentDocument = {
  id: string
  title: string
  updatedAt: Date
}

type UpcomingTask = {
  id: string
  title: string
  scheduledFor: Date
}

interface StatsPanelProps {
  documentsCount: number
  notesCount: number
  sourcesLinkedCount: number
  inReviewCount: number
  recentDocuments: RecentDocument[]
  upcomingTasks: UpcomingTask[]
  boardId: string
  defaultSectionId?: string
}

export function StatsPanel({
  documentsCount,
  notesCount,
  sourcesLinkedCount,
  inReviewCount,
  recentDocuments,
  upcomingTasks,
  boardId,
  defaultSectionId,
}: StatsPanelProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleCreateDocument() {
    startTransition(async () => {
      const doc = await createDocument(boardId, defaultSectionId)
      router.push(`/app/doc/${doc.id}`)
    })
  }

  return (
    <aside className="hidden h-full w-[320px] shrink-0 overflow-y-auto px-4 pb-4 pt-[148px] xl:block">
      <div className="space-y-4">
      <Card className="rounded-2xl border-[#E5DED4] bg-white/80 shadow-none">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="font-[var(--font-newsreader)] text-[27px] font-semibold text-[#171B19]">
            At a glance
          </CardTitle>
          <Pulse size={16} className="text-[#6A726B]" />
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2 pt-0">
          <StatTile label="Documents" value={documentsCount} icon={<FileDoc size={14} />} />
          <StatTile label="Notes" value={notesCount} icon={<NotePencil size={14} />} />
          <StatTile label="Sources linked" value={sourcesLinkedCount} icon={<LinkSimpleHorizontal size={14} />} />
          <StatTile label="In review" value={inReviewCount} icon={<ClockCounterClockwise size={14} />} />
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-[#E5DED4] bg-white/80 shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="font-[var(--font-newsreader)] text-[28px] leading-[1.05] font-semibold text-[#171B19]">
            Recent activity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 pt-0">
          {recentDocuments.length === 0 ? (
            <p className="text-sm text-[#788179]">No recent edits yet.</p>
          ) : (
            recentDocuments.slice(0, 5).map((doc) => (
              <Link
                key={doc.id}
                href={`/app/doc/${doc.id}`}
                className="flex items-start gap-2 rounded-xl border border-[#EEE5DB] bg-white/70 p-2.5"
              >
                <FileDoc size={14} className="mt-0.5 text-[#6B756D]" />
                <span className="min-w-0">
                  <strong className="block truncate font-[var(--font-newsreader)] text-[19px] font-semibold leading-[1.1] text-[#1E2321]">
                    {doc.title || 'Untitled'}
                  </strong>
                  <small className="text-[13px] text-[#727A73]">{timeAgo(doc.updatedAt)}</small>
                </span>
              </Link>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-[#E5DED4] bg-white/80 shadow-none">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="font-[var(--font-newsreader)] text-[26px] leading-[1] font-semibold text-[#171B19]">
            Upcoming
          </CardTitle>
          <CalendarDots size={16} className="text-[#6A726B]" />
        </CardHeader>
        <CardContent className="space-y-2 pt-0">
          {upcomingTasks.length === 0 ? (
            <p className="text-sm text-[#788179]">No upcoming items yet.</p>
          ) : (
            upcomingTasks.slice(0, 4).map((task) => (
              <div key={task.id} className="rounded-xl border border-[#EEE5DB] bg-white/70 p-2.5">
                <p className="font-[var(--font-newsreader)] text-[18px] leading-[1.2] text-[#1F2422]">
                  {task.title}
                </p>
                <small className="text-[12px] text-[#727A73]">{formatUpcoming(task.scheduledFor)}</small>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Button
        onClick={handleCreateDocument}
        disabled={isPending}
        variant="outline"
        className="h-11 w-full rounded-xl border-[#BFD0B7] bg-white/70 text-[16px] font-semibold text-[#35582F] hover:bg-[#F1F4EB]"
      >
        <Plus size={16} weight="bold" />
        {isPending ? 'Creating document...' : 'Create document'}
      </Button>
      </div>
    </aside>
  )
}

function StatTile({
  label,
  value,
  icon,
}: {
  label: string
  value: number
  icon: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-[#ECE4DA] bg-white/80 p-2.5">
      <div className="mb-1 flex items-center justify-between">
        <p className="text-[18px] leading-[1] font-bold text-[#121614]">{value}</p>
        <span className="inline-flex size-6 items-center justify-center rounded-md bg-[#F2EFE9] text-[#5F665F]">
          {icon}
        </span>
      </div>
      <span className="text-[12px] text-[#5E675F]">{label}</span>
    </div>
  )
}

function timeAgo(value: Date): string {
  const date = new Date(value)
  const diff = Date.now() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Edited just now'
  if (minutes < 60) return `Edited ${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `Edited ${hours}h ago`
  const days = Math.floor(hours / 24)
  return `Edited ${days}d ago`
}

function formatUpcoming(value: Date): string {
  const date = new Date(value)
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}
