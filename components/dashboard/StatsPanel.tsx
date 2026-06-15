'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import {
  CalendarBlank,
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
    <aside className="hidden h-full w-[272px] shrink-0 xl:flex xl:flex-col xl:gap-2.5 xl:px-2.5 xl:pb-2.5 xl:pt-[74px]">
      <Card className="rounded-xl border-[#E5DED4] bg-white/85 shadow-none">
        <CardHeader className="flex flex-row items-center justify-between px-4 pt-3 pb-1.5">
          <CardTitle className="text-[17px] font-semibold leading-none tracking-tight text-[#171B19]">
            At a glance
          </CardTitle>
          <Pulse size={13} className="text-[#7A817A]" />
        </CardHeader>
        <CardContent className="space-y-2.5 px-4 pt-0 pb-3">
          <div className="grid grid-cols-2 gap-x-2 gap-y-2">
            <AtGlanceItem label="Documents" value={documentsCount} icon={<FileDoc size={13} />} />
            <AtGlanceItem label="Notes" value={notesCount} icon={<NotePencil size={13} />} />
            <AtGlanceItem label="Sources linked" value={sourcesLinkedCount} icon={<LinkSimpleHorizontal size={13} />} />
            <AtGlanceItem label="In review" value={inReviewCount} icon={<ClockCounterClockwise size={13} />} accent="blue" />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl border-[#E5DED4] bg-white/85 shadow-none">
        <CardHeader className="px-4 pt-3 pb-1">
          <CardTitle className="text-[17px] font-semibold leading-none tracking-tight text-[#171B19]">
            Recent activity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 px-4 pt-0 pb-3">
          {recentDocuments.length === 0 ? (
            <p className="text-xs text-[#788179]">No recent edits yet.</p>
          ) : (
            recentDocuments.slice(0, 5).map((doc) => (
              <Link
                key={doc.id}
                href={`/app/doc/${doc.id}`}
                className="flex items-center justify-between gap-2 rounded-md px-0.5 py-0.5"
              >
                <span className="inline-flex min-w-0 items-center gap-1.5">
                  <FileDoc size={12} className="text-[#616A62]" />
                  <span className="truncate text-[11px] font-medium text-[#202523]">{doc.title || 'Untitled'}</span>
                </span>
                <span className="shrink-0 text-[10px] text-[#737A73]">{timeAgo(doc.updatedAt)}</span>
              </Link>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="rounded-xl border-[#E5DED4] bg-white/85 shadow-none">
        <CardHeader className="flex flex-row items-center justify-between px-4 pt-3 pb-1">
          <CardTitle className="text-[17px] font-semibold leading-none tracking-tight text-[#171B19]">
            Upcoming
          </CardTitle>
          <CalendarBlank size={13} className="text-[#6E756E]" />
        </CardHeader>
        <CardContent className="space-y-1 px-4 pt-0 pb-3">
          {upcomingTasks.length === 0 ? (
            <p className="text-[11px] text-[#788179]">No upcoming items yet.</p>
          ) : (
            upcomingTasks.slice(0, 2).map((task) => (
              <div key={task.id} className="rounded-md px-0.5 py-0.5">
                <p className="truncate text-[11px] font-medium text-[#202523]">{task.title}</p>
                <small className="text-[10px] text-[#747B74]">{formatUpcoming(task.scheduledFor)}</small>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Button
        onClick={handleCreateDocument}
        disabled={isPending}
        variant="outline"
        className="h-8.5 w-full rounded-xl border-[#BFD0B7] bg-white/80 text-[13px] font-semibold text-[#35582F] hover:bg-[#F1F4EB]"
      >
        <Plus size={12} weight="bold" />
        {isPending ? 'Creating...' : 'Create document'}
      </Button>
    </aside>
  )
}

function AtGlanceItem({
  label,
  value,
  icon,
  accent = 'neutral',
}: {
  label: string
  value: number
  icon: React.ReactNode
  accent?: 'neutral' | 'blue'
}) {
  return (
    <div>
      <div className="mb-0.5 flex items-center justify-between">
        <p className="text-[17px] leading-none font-semibold text-[#121614]">{value}</p>
        <span
          className={[
            'inline-flex size-4.5 items-center justify-center rounded-sm',
            accent === 'blue' ? 'bg-[#EDF4FF] text-[#3B82F6]' : 'bg-[#F2EFE9] text-[#5F665F]',
          ].join(' ')}
        >
          {icon}
        </span>
      </div>
      <span className="text-[10px] text-[#5E675F]">{label}</span>
    </div>
  )
}

function timeAgo(value: Date): string {
  const date = new Date(value)
  const diff = Date.now() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Edited now'
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
