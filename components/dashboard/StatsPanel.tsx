import Link from 'next/link'
import { FileText, Clock } from 'lucide-react'

type Doc = { id: string; title: string; wordCount: number; updatedAt: Date }
export function StatsPanel({ totalDocuments, recentDocuments }: { totalDocuments: number; recentDocuments: Doc[] }) {
  return (
    <aside style={{ width: 260, flexShrink: 0, borderLeft: '1px solid #ede8e1', overflowY: 'auto', padding: '24px 20px', fontFamily: 'Inter, sans-serif', background: '#faf9f7' }}>
      <h2 style={{ fontSize: 11, fontWeight: 700, color: '#9AA4A0', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 14px' }}>At a glance</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
        <div style={{ background: '#fff', border: '1px solid #ede8e1', borderRadius: 12, padding: '14px 14px' }}>
          <p style={{ fontSize: 24, fontWeight: 800, color: '#141516', margin: '0 0 2px', letterSpacing: '-0.04em' }}>{totalDocuments}</p>
          <p style={{ fontSize: 12, color: '#9AA4A0', margin: 0, display: 'flex', alignItems: 'center', gap: 4 }}><FileText size={11} /> Documents</p>
        </div>
        <div style={{ background: '#fff', border: '1px solid #ede8e1', borderRadius: 12, padding: '14px 14px' }}>
          <p style={{ fontSize: 24, fontWeight: 800, color: '#141516', margin: '0 0 2px', letterSpacing: '-0.04em' }}>{recentDocuments.filter(d => Date.now() - new Date(d.updatedAt).getTime() < 7 * 864e5).length}</p>
          <p style={{ fontSize: 12, color: '#9AA4A0', margin: 0, display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={11} /> This week</p>
        </div>
      </div>
      <h2 style={{ fontSize: 11, fontWeight: 700, color: '#9AA4A0', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px' }}>Recent activity</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
        {recentDocuments.length === 0 ? <p style={{ fontSize: 13, color: '#9AA4A0' }}>No documents yet.</p> :
          recentDocuments.slice(0, 5).map(doc => (
            <Link key={doc.id} href={`/app/doc/${doc.id}`} style={{ textDecoration: 'none', display: 'block', padding: '8px 10px', borderRadius: 9, background: '#fff', border: '1px solid #ede8e1' }}>
              <p style={{ fontSize: 12.5, fontWeight: 600, color: '#141516', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.title || 'Untitled'}</p>
              <p style={{ fontSize: 11, color: '#9AA4A0', margin: 0 }}>{doc.wordCount > 0 ? `${doc.wordCount} words · ` : ''}{timeAgo(doc.updatedAt)}</p>
            </Link>
          ))}
      </div>
      <Link href="/app" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 40, borderRadius: 11, border: '1.5px dashed #c8d6be', color: '#4F6F3D', fontSize: 13, fontWeight: 600, textDecoration: 'none', gap: 6 }}>+ Create document</Link>
    </aside>
  )
}
function timeAgo(date: Date) { const d = Date.now() - new Date(date).getTime(), m = Math.floor(d / 60000); if (m < 1) return 'just now'; if (m < 60) return `${m}m ago`; const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`; const dy = Math.floor(h / 24); if (dy < 7) return `${dy}d ago`; return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }
