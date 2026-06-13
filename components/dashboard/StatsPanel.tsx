'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import {
  CalendarBlank,
  ClockCountdown,
  FileDoc,
  LinkSimpleHorizontal,
  NotePencil,
  Plus,
  Pulse,
} from '@phosphor-icons/react'
import { createDocument } from '@/lib/actions/documents'
import styles from './StatsPanel.module.css'

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
    <aside className={styles.panel}>
      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <h2>At a glance</h2>
          <Pulse size={16} />
        </div>
        <div className={styles.statsGrid}>
          <Stat
            value={documentsCount}
            label="Documents"
            icon={<FileDoc size={16} />}
          />
          <Stat
            value={notesCount}
            label="Notes"
            icon={<NotePencil size={16} />}
          />
          <Stat
            value={sourcesLinkedCount}
            label="Sources linked"
            icon={<LinkSimpleHorizontal size={16} />}
          />
          <Stat
            value={inReviewCount}
            label="In review"
            icon={<ClockCountdown size={16} />}
          />
        </div>
      </section>

      <section className={styles.card}>
        <h3>Recent activity</h3>
        <div className={styles.list}>
          {recentDocuments.length === 0 ? (
            <p className={styles.empty}>No recent edits yet.</p>
          ) : (
            recentDocuments.slice(0, 5).map((doc) => (
              <Link key={doc.id} href={`/app/doc/${doc.id}`} className={styles.listItem}>
                <span className={styles.fileIcon}>
                  <FileDoc size={13} />
                </span>
                <span className={styles.itemBody}>
                  <strong>{doc.title || 'Untitled'}</strong>
                  <small>{timeAgo(doc.updatedAt)}</small>
                </span>
              </Link>
            ))
          )}
        </div>
      </section>

      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <h3>Upcoming</h3>
          <CalendarBlank size={16} />
        </div>
        <div className={styles.list}>
          {upcomingTasks.length === 0 ? (
            <p className={styles.empty}>No upcoming items yet.</p>
          ) : (
            upcomingTasks.slice(0, 4).map((task) => (
              <div key={task.id} className={styles.listItem}>
                <span className={styles.fileIcon}>
                  <CalendarBlank size={13} />
                </span>
                <span className={styles.itemBody}>
                  <strong>{task.title}</strong>
                  <small>{formatUpcoming(task.scheduledFor)}</small>
                </span>
              </div>
            ))
          )}
        </div>
      </section>

      <button type="button" className={styles.createButton} onClick={handleCreateDocument} disabled={isPending}>
        <Plus size={16} weight="bold" />
        {isPending ? 'Creating document...' : 'Create document'}
      </button>
    </aside>
  )
}

function Stat({
  value,
  label,
  icon,
}: {
  value: number
  label: string
  icon: React.ReactNode
}) {
  return (
    <div className={styles.statItem}>
      <div className={styles.statTop}>
        <p>{value}</p>
        <span className={styles.statIcon}>{icon}</span>
      </div>
      <span className={styles.statLabel}>{label}</span>
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
