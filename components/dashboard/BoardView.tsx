'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  CaretDown,
  FadersHorizontal,
  MagnifyingGlass,
  Plus,
} from '@phosphor-icons/react'
import { createDocument } from '@/lib/actions/documents'
import { DocCard } from './DocCard'
import { SectionTabs } from './SectionTabs'
import styles from './BoardView.module.css'

type Section = { id: string; name: string; sortOrder: number }
type Document = {
  id: string
  title: string
  content: unknown
  wordCount: number
  sectionId: string | null
  updatedAt: Date
  createdAt: Date
}
type Board = { id: string; name: string; icon: string | null }

interface BoardViewProps {
  board: Board
  sections: Section[]
  documents: Document[]
}

export function BoardView({ board, sections, documents }: BoardViewProps) {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [creating, setCreating] = useState(false)

  const filteredBySection = activeSection
    ? documents.filter((doc) => doc.sectionId === activeSection)
    : documents

  const filteredDocs = filteredBySection.filter((doc) => {
    if (!searchQuery.trim()) return true
    const text = `${doc.title} ${extractSnippet(doc.content, 180)}`.toLowerCase()
    return text.includes(searchQuery.trim().toLowerCase())
  })

  const featuredDoc = filteredDocs[0]
  const gridDocs = filteredDocs.slice(1)
  const defaultDraftSectionId = useMemo(
    () =>
      sections.find((section) => section.name.toLowerCase().includes('draft'))?.id ??
      sections[0]?.id,
    [sections],
  )

  async function handleCreateDocument() {
    if (creating) return
    setCreating(true)
    try {
      const document = await createDocument(board.id, defaultDraftSectionId)
      router.push(`/app/doc/${document.id}`)
    } finally {
      setCreating(false)
    }
  }

  return (
    <section className={styles.main}>
      <header className={styles.topRow}>
        <button type="button" className={styles.viewDropdown}>
          <span>{board.name || 'Drafts'}</span>
          <CaretDown size={14} weight="bold" />
        </button>

        <div className={styles.headerActions}>
          <label className={styles.search}>
            <MagnifyingGlass size={16} />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search"
            />
          </label>

          <button type="button" className={styles.iconAction} aria-label="Filter documents">
            <FadersHorizontal size={17} />
          </button>

          <button
            type="button"
            className={styles.newButton}
            onClick={handleCreateDocument}
            disabled={creating}
          >
            <Plus size={16} weight="bold" />
            {creating ? 'Creating...' : 'New'}
            <CaretDown size={14} weight="bold" />
          </button>
        </div>
      </header>

      <div className={styles.titleBlock}>
        <h1 className={styles.pageTitle}>Your writing home</h1>
        <p className={styles.pageSubtitle}>
          Organize drafts, ideas, and projects in one calm space.
        </p>
      </div>

      <SectionTabs
        sections={sections}
        activeSection={activeSection}
        onSelect={setActiveSection}
        totalCount={documents.length}
      />

      <div className={styles.contentStack}>
        {featuredDoc ? (
          <>
            <article
              className={styles.featuredCard}
              onClick={() => router.push(`/app/doc/${featuredDoc.id}`)}
            >
              <div className={styles.featuredBody}>
                <span className={styles.featuredBadge}>Current Draft</span>
                <h2 className={styles.featuredTitle}>{featuredDoc.title || 'Untitled'}</h2>
                <p className={styles.featuredDescription}>
                  {extractSnippet(featuredDoc.content, 220) ||
                    'Open this draft to continue shaping your ideas with focus and clarity.'}
                </p>
                <div className={styles.featuredMeta}>
                  <span>{getSectionLabel(featuredDoc.sectionId, sections)}</span>
                  <span>{featuredDoc.wordCount.toLocaleString()} words</span>
                  <span>{timeAgo(featuredDoc.updatedAt)}</span>
                </div>
              </div>
              <div className={styles.featuredImage} aria-hidden />
            </article>

            {gridDocs.length > 0 && (
              <div className={styles.grid}>
                {gridDocs.map((doc) => (
                  <DocCard key={doc.id} doc={doc} sections={sections} />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className={styles.empty}>
            <p className={styles.emptyTitle}>No documents yet</p>
            <p className={styles.emptySubtitle}>Create your first document to begin writing.</p>
            <button type="button" className={styles.newButton} onClick={handleCreateDocument}>
              <Plus size={16} weight="bold" />
              Create document
            </button>
          </div>
        )}
      </div>
    </section>
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

function getSectionLabel(sectionId: string | null, sections: Section[]) {
  if (!sectionId) return 'Draft'
  return sections.find((section) => section.id === sectionId)?.name ?? 'Draft'
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
