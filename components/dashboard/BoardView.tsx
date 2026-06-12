'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { createDocument } from '@/lib/actions/documents'
import { DocCard } from './DocCard'
import { SectionTabs } from './SectionTabs'

type Section = { id: string; name: string; sortOrder: number }
type Document = { id: string; title: string; content: unknown; wordCount: number; sectionId: string | null; updatedAt: Date; createdAt: Date }
type Board = { id: string; name: string; icon: string | null }

export function BoardView({ board, sections, documents, userId }: { board: Board; sections: Section[]; documents: Document[]; userId: string }) {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  const filtered = activeSection ? documents.filter(d => d.sectionId === activeSection) : documents
  const featured  = filtered[0]
  const grid      = filtered.slice(1)

  async function handleNew() {
    setCreating(true)
    try { const doc = await createDocument(board.id, sections[1]?.id); router.push(`/app/doc/${doc.id}`) } finally { setCreating(false) }
  }

  return (
    <div style={{ flex: 1, minWidth: 0, overflowY: 'auto', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 28px 0', paddingBottom: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><span style={{ fontSize: 18 }}>{board.icon ?? '📝'}</span><h1 style={{ fontSize: 16, fontWeight: 700, color: '#141516', margin: 0 }}>{board.name}</h1></div>
        <button onClick={handleNew} disabled={creating} style={{ display: 'flex', alignItems: 'center', gap: 6, height: 34, padding: '0 14px', borderRadius: 9, background: '#4F6F3D', color: '#fff', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', boxShadow: '0 2px 8px rgba(79,111,61,0.25)' }}><Plus size={14} />{creating ? 'Creating…' : 'New'}</button>
      </div>
      <div style={{ padding: '0 28px', borderBottom: '1px solid #ede8e1' }}>
        <SectionTabs sections={sections} activeSection={activeSection} onSelect={setActiveSection} totalCount={documents.length} />
      </div>
      <div style={{ padding: '24px 28px' }}>
        {filtered.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: 16 }}>
            <div style={{ fontSize: 36 }}>✍️</div>
            <p style={{ fontSize: 15, fontWeight: 600, color: '#141516', margin: 0 }}>No documents here yet</p>
            <p style={{ fontSize: 13.5, color: '#9AA4A0', margin: 0 }}>Create your first document to get started.</p>
            <button onClick={handleNew} disabled={creating} style={{ display: 'flex', alignItems: 'center', gap: 6, height: 38, padding: '0 18px', borderRadius: 10, background: '#4F6F3D', color: '#fff', fontSize: 13.5, fontWeight: 600, border: 'none', cursor: 'pointer', marginTop: 4 }}><Plus size={14} />Create document</button>
          </div>
        ) : (
          <>
            {featured && (
              <div onClick={() => router.push(`/app/doc/${featured.id}`)} style={{ background: '#FAF7F0', borderRadius: 16, padding: '24px 28px', marginBottom: 20, cursor: 'pointer', border: '1px solid #ede8e1' }} onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.07)' }} onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}><span style={{ fontSize: 11, fontWeight: 600, background: '#eef2e9', color: '#4F6F3D', padding: '3px 9px', borderRadius: 20 }}>CURRENT DRAFT</span></div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: '#141516', margin: '0 0 8px', letterSpacing: '-0.02em', lineHeight: 1.3 }}>{featured.title || 'Untitled'}</h2>
                <p style={{ fontSize: 13.5, color: '#4F5963', margin: '0 0 14px', lineHeight: 1.6 }}>{extractSnippet(featured.content, 160)}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12, color: '#9AA4A0' }}>
                  <span>{getSectionName(featured.sectionId, sections)}</span><span>·</span>
                  <span>{featured.wordCount.toLocaleString()} words</span><span>·</span>
                  <span>{timeAgo(featured.updatedAt)}</span>
                </div>
              </div>
            )}
            {grid.length > 0 && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>{grid.map(d => <DocCard key={d.id} doc={d} sections={sections} boardId={board.id} />)}</div>}
          </>
        )}
      </div>
    </div>
  )
}

function extractSnippet(content: unknown, max: number) { try { const t = extractText(content as Record<string, unknown>); return t.slice(0, max) + (t.length > max ? '…' : '') } catch { return '' } }
function extractText(node: Record<string, unknown>): string { if (!node) return ''; if (typeof node.text === 'string') return node.text; if (Array.isArray(node.content)) return (node.content as Record<string, unknown>[]).map(extractText).join(' '); return '' }
function getSectionName(id: string | null, sections: { id: string; name: string }[]) { return id ? (sections.find(s => s.id === id)?.name ?? 'Unsorted') : 'Unsorted' }
function timeAgo(date: Date) { const d = Date.now() - new Date(date).getTime(), m = Math.floor(d / 60000); if (m < 1) return 'just now'; if (m < 60) return `${m}m ago`; const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`; const dy = Math.floor(h / 24); if (dy < 7) return `${dy}d ago`; return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }
