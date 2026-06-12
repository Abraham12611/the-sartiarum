'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { createDocument } from '@/lib/actions/documents'
import { DocCard } from './DocCard'
import { SectionTabs } from './SectionTabs'

type Section = { id: string; name: string; sortOrder: number }
type Document = {
  id: string; title: string; content: unknown; wordCount: number
  sectionId: string | null; updatedAt: Date; createdAt: Date
}
type Board = { id: string; name: string; icon: string | null }

interface BoardViewProps {
  board: Board
  sections: Section[]
  documents: Document[]
  userId: string
}

export function BoardView({ board, sections, documents, userId }: BoardViewProps) {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  const filteredDocs = activeSection
    ? documents.filter(d => d.sectionId === activeSection)
    : documents

  const featuredDoc = filteredDocs[0]
  const gridDocs = filteredDocs.slice(1)

  async function handleNewDocument() {
    setCreating(true)
    try {
      const doc = await createDocument(board.id, sections[1]?.id)
      router.push(`/app/doc/${doc.id}`)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div style={{ flex: 1, minWidth: 0, overflowY: 'auto', fontFamily: 'Inter, sans-serif' }}>
      {/* Board header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 28px 0', borderBottom: '1px solid #ede8e1', paddingBottom: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18 }}>{board.icon ?? '📝'}</span>
          <h1 style={{ fontSize: 16, fontWeight: 700, color: '#141516', margin: 0 }}>{board.name}</h1>
        </div>
        <button
          onClick={handleNewDocument}
          disabled={creating}
          style={{ display: 'flex', alignItems: 'center', gap: 6, height: 34, padding: '0 14px', borderRadius: 9, background: '#4F6F3D', color: '#fff', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', boxShadow: '0 2px 8px rgba(79,111,61,0.25)' }}
        >
          <Plus size={14} />
          {creating ? 'Creating…' : 'New'}
        </button>
      </div>

      {/* Section tabs */}
      <div style={{ padding: '0 28px', borderBottom: '1px solid #ede8e1' }}>
        <SectionTabs
          sections={sections}
          activeSection={activeSection}
          onSelect={setActiveSection}
          totalCount={documents.length}
        />
      </div>

      {/* Content */}
      <div style={{ padding: '24px 28px' }}>
        {filteredDocs.length === 0 ? (
          // Empty state
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: 16 }}>
            <div style={{ fontSize: 36 }}>✍️</div>
            <p style={{ fontSize: 15, fontWeight: 600, color: '#141516', margin: 0 }}>No documents here yet</p>
            <p style={{ fontSize: 13.5, color: '#9AA4A0', margin: 0 }}>Create your first document to get started.</p>
            <button
              onClick={handleNewDocument}
              disabled={creating}
              style={{ display: 'flex', alignItems: 'center', gap: 6, height: 38, padding: '0 18px', borderRadius: 10, background: '#4F6F3D', color: '#fff', fontSize: 13.5, fontWeight: 600, border: 'none', cursor: 'pointer', marginTop: 4 }}
            >
              <Plus size={14} />
              Create document
            </button>
          </div>
        ) : (
          <>
            {/* Featured doc — hero card */}
            {featuredDoc && (
              <div
                onClick={() => router.push(`/app/doc/${featuredDoc.id}`)}
                style={{ background: '#FAF7F0', borderRadius: 16, padding: '24px 28px', marginBottom: 20, cursor: 'pointer', border: '1px solid #ede8e1', transition: 'box-shadow 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.07)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'none' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, background: '#eef2e9', color: '#4F6F3D', padding: '3px 9px', borderRadius: 20 }}>CURRENT DRAFT</span>
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: '#141516', margin: '0 0 8px', letterSpacing: '-0.02em', lineHeight: 1.3 }}>
                  {featuredDoc.title || 'Untitled'}
                </h2>
                <p style={{ fontSize: 13.5, color: '#4F5963', margin: '0 0 14px', lineHeight: 1.6 }}>
                  {extractSnippet(featuredDoc.content, 160)}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12, color: '#9AA4A0' }}>
                  <span>{getSectionName(featuredDoc.sectionId, sections)}</span>
                  <span>·</span>
                  <span>{featuredDoc.wordCount.toLocaleString()} words</span>
                  <span>·</span>
                  <span>{timeAgo(featuredDoc.updatedAt)}</span>
                </div>
              </div>
            )}

            {/* Document grid */}
            {gridDocs.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
                {gridDocs.map(doc => (
                  <DocCard key={doc.id} doc={doc} sections={sections} boardId={board.id} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function extractSnippet(content: unknown, maxLen: number): string {
  try {
    const text = extractText(content as Record<string, unknown>)
    return text.slice(0, maxLen) + (text.length > maxLen ? '…' : '')
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

function getSectionName(sectionId: string | null, sections: Section[]): string {
  if (!sectionId) return 'Unsorted'
  return sections.find(s => s.id === sectionId)?.name ?? 'Unsorted'
}

function timeAgo(date: Date): string {
  const now = Date.now()
  const diff = now - new Date(date).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
