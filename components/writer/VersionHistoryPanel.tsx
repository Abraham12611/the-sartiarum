'use client'

import { useEffect, useState, useTransition } from 'react'
import { X, RotateCcw } from 'lucide-react'
import { getDocumentVersions, restoreVersion } from '@/lib/actions/documents'

type Version = { id: string; createdAt: Date; content: unknown }

function groupByDay(versions: Version[]) {
  const groups: Record<string, Version[]> = {}
  for (const v of versions) {
    const day = new Date(v.createdAt).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
    if (!groups[day]) groups[day] = []
    groups[day].push(v)
  }
  return groups
}

export function VersionHistoryPanel({ documentId, onClose }: { documentId: string; onClose: () => void }) {
  const [versions, setVersions] = useState<Version[]>([])
  const [loading, setLoading] = useState(true)
  const [restoring, setRestoring] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  useEffect(() => {
    getDocumentVersions(documentId).then(vs => {
      setVersions(vs as unknown as Version[])
      setLoading(false)
    })
  }, [documentId])

  function handleRestore(versionId: string) {
    if (!confirm('Restore this version? Your current content will be saved as a new version first.')) return
    setRestoring(versionId)
    startTransition(async () => {
      await restoreVersion(versionId, documentId)
      onClose()
      window.location.reload()
    })
  }

  const groups = groupByDay(versions)

  return (
    <div
      style={{
        position: 'fixed',
        top: 52,
        right: 0,
        bottom: 0,
        width: 320,
        background: '#fff',
        borderLeft: '1px solid #ede8e1',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 300,
        boxShadow: '-8px 0 32px rgba(0,0,0,0.08)',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #ede8e1' }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: '#141516', margin: 0 }}>Version history</h2>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9AA4A0', display: 'flex' }}><X size={16} /></button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
        {loading ? (
          <p style={{ fontSize: 13, color: '#9AA4A0', textAlign: 'center', marginTop: 32 }}>Loading…</p>
        ) : versions.length === 0 ? (
          <p style={{ fontSize: 13, color: '#9AA4A0', textAlign: 'center', marginTop: 32 }}>No versions saved yet. Start writing!</p>
        ) : (
          Object.entries(groups).map(([day, dayVersions]) => (
            <div key={day} style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#9AA4A0', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>{day}</p>
              {dayVersions.map((v, i) => (
                <div
                  key={v.id}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', borderRadius: 10, border: '1px solid #ede8e1', marginBottom: 6, background: i === 0 && day === Object.keys(groups)[0] ? '#faf9f7' : '#fff' }}
                >
                  <div>
                    <p style={{ fontSize: 12.5, fontWeight: 600, color: '#141516', margin: 0 }}>
                      {i === 0 && day === Object.keys(groups)[0] ? 'Current version' : `Version ${versions.indexOf(v) + 1}`}
                    </p>
                    <p style={{ fontSize: 11, color: '#9AA4A0', margin: 0 }}>
                      {new Date(v.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {!(i === 0 && day === Object.keys(groups)[0]) && (
                    <button
                      onClick={() => handleRestore(v.id)}
                      disabled={restoring === v.id}
                      style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: '#4F6F3D', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: 7 }}
                    >
                      <RotateCcw size={12} /> Restore
                    </button>
                  )}
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
