'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MoreHorizontal, Trash2, ExternalLink } from 'lucide-react'
import { deleteDocument } from '@/lib/actions/documents'

type Section = { id: string; name: string }
type Doc = {
  id: string; title: string; content: unknown; wordCount: number
  sectionId: string | null; updatedAt: Date
}

export function DocCard({ doc, sections, boardId }: { doc: Doc; sections: Section[]; boardId: string }) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const sectionName = doc.sectionId ? sections.find(s => s.id === doc.sectionId)?.name ?? '' : ''
  const snippet = extractSnippet(doc.content, 100)

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirm(`Delete "${doc.title || 'Untitled'}"? This cannot be undone.`)) return
    setDeleting(true)
    await deleteDocument(doc.id)
    router.refresh()
  }

  return (
    <div
      onClick={() => !deleting && router.push(`/app/doc/${doc.id}`)}
      style={{
        background: '#fff',
        border: '1px solid #ede8e1',
        borderRadius: 14,
        padding: '18px 18px',
        cursor: 'pointer',
        position: 'relative',
        opacity: deleting ? 0.5 : 1,
        transition: 'box-shadow 0.15s',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 14px rgba(0,0,0,0.07)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'none' }}
    >
      {/* Context menu */}
      <div style={{ position: 'absolute', top: 12, right: 12 }}>
        <button
          onClick={e => { e.stopPropagation(); setMenuOpen(m => !m) }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9AA4A0', display: 'flex', alignItems: 'center', padding: 4, borderRadius: 6 }}
        >
          <MoreHorizontal size={15} />
        </button>
        {menuOpen && (
          <div
            style={{ position: 'absolute', top: '100%', right: 0, background: '#fff', border: '1px solid #ede8e1', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.10)', minWidth: 160, zIndex: 100, overflow: 'hidden' }}
            onMouseLeave={() => setMenuOpen(false)}
          >
            <button
              onClick={e => { e.stopPropagation(); router.push(`/app/doc/${doc.id}`) }}
              style={{ display: 'flex', alignItems: 'center', gap: 9, width: '100%', padding: '9px 14px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, color: '#141516', textAlign: 'left' }}
            >
              <ExternalLink size={13} /> Open
            </button>
            <button
              onClick={handleDelete}
              style={{ display: 'flex', alignItems: 'center', gap: 9, width: '100%', padding: '9px 14px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, color: '#dc2626', textAlign: 'left' }}
            >
              <Trash2 size={13} /> Delete
            </button>
          </div>
        )}
      </div>

      <h3 style={{ fontSize: 14.5, fontWeight: 700, color: '#141516', margin: '0 0 6px', paddingRight: 24, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {doc.title || 'Untitled'}
      </h3>
      {snippet && (
        <p style={{ fontSize: 12.5, color: '#4F5963', margin: '0 0 12px', lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {snippet}
        </p>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11.5, color: '#9AA4A0', flexWrap: 'wrap' }}>
        {sectionName && <span style={{ background: '#f0ede8', color: '#4F5963', borderRadius: 20, padding: '2px 8px', fontWeight: 500 }}>{sectionName}</span>}
        <span>{doc.wordCount > 0 ? `${doc.wordCount.toLocaleString()} words` : 'Empty'}</span>
        <span>·</span>
        <span>{timeAgo(doc.updatedAt)}</span>
      </div>
    </div>
  )
}

function extractSnippet(content: unknown, maxLen: number): string {
  try {
    const text = extractText(content as Record<string, unknown>)
    return text.slice(0, maxLen) + (text.length > maxLen ? '…' : '')
  } catch { return '' }
}

function extractText(node: Record<string, unknown>): string {
  if (!node) return ''
  if (typeof node.text === 'string') return node.text
  if (Array.isArray(node.content)) return (node.content as Record<string, unknown>[]).map(extractText).join(' ')
  return ''
}

function timeAgo(date: Date): string {
  const diff = Date.now() - new Date(date).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}d ago`
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
