'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DotsThree, FolderOpen, Trash } from '@phosphor-icons/react'
import { deleteDocument } from '@/lib/actions/documents'
import styles from './DocCard.module.css'

type Section = { id: string; name: string }
type Doc = {
  id: string
  title: string
  content: unknown
  wordCount: number
  sectionId: string | null
  updatedAt: Date
}

export function DocCard({ doc, sections }: { doc: Doc; sections: Section[] }) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const sectionName = doc.sectionId ? sections.find((section) => section.id === doc.sectionId)?.name ?? 'Draft' : 'Draft'
  const snippet = useMemo(() => extractSnippet(doc.content, 110), [doc.content])
  const statusStyle = getStatusStyle(sectionName)

  async function handleDelete(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation()
    if (!confirm(`Delete "${doc.title || 'Untitled'}"? This cannot be undone.`)) return
    setDeleting(true)
    await deleteDocument(doc.id)
    router.refresh()
  }

  return (
    <article
      onClick={() => !deleting && router.push(`/app/doc/${doc.id}`)}
      className={`${styles.card} ${deleting ? styles.cardDeleting : ''}`}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          router.push(`/app/doc/${doc.id}`)
        }
      }}
    >
      <div className={styles.menuWrap}>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            setMenuOpen((prev) => !prev)
          }}
          className={styles.menuTrigger}
        >
          <DotsThree size={18} weight="bold" />
        </button>

        {menuOpen && (
          <div className={styles.menuPanel} onMouseLeave={() => setMenuOpen(false)}>
            <button
              type="button"
              className={styles.menuItem}
              onClick={(event) => {
                event.stopPropagation()
                router.push(`/app/doc/${doc.id}`)
              }}
            >
              <FolderOpen size={14} />
              Open
            </button>
            <button type="button" className={`${styles.menuItem} ${styles.menuDanger}`} onClick={handleDelete}>
              <Trash size={14} />
              Delete
            </button>
          </div>
        )}
      </div>

      <h3 className={styles.title}>{doc.title || 'Untitled'}</h3>
      <p className={styles.description}>{snippet || 'Open this draft to continue writing.'}</p>

      <footer className={styles.metaRow}>
        <span className={styles.metaStatus}>
          <span className={styles.statusDot} style={{ background: statusStyle.dot }} />
          {statusStyle.label}
        </span>
        <span>{doc.wordCount.toLocaleString()} words</span>
        <span>{timeAgo(doc.updatedAt)}</span>
      </footer>
    </article>
  )
}

function extractSnippet(content: unknown, maxLen: number): string {
  try {
    const text = extractText(content as Record<string, unknown>).replace(/\s+/g, ' ').trim()
    if (!text) return ''
    return text.length > maxLen ? `${text.slice(0, maxLen)}...` : text
  } catch {
    return ''
  }
}

function extractText(node: Record<string, unknown>): string {
  if (!node) return ''
  if (typeof node.text === 'string') return node.text
  if (Array.isArray(node.content)) {
    return (node.content as Record<string, unknown>[]).map(extractText).join(' ')
  }
  return ''
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
  if (days < 7) return `Edited ${days}d ago`
  return `Edited ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
}

function getStatusStyle(sectionName: string) {
  const text = sectionName.toLowerCase()
  if (text.includes('review')) return { label: 'In Review', dot: '#f4b400' }
  if (text.includes('idea')) return { label: 'Ideas', dot: '#3b82f6' }
  if (text.includes('final')) return { label: 'Final', dot: '#7c3aed' }
  return { label: 'Draft', dot: '#4f6f3d' }
}
