'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Download, MoreHorizontal, Columns, Clock } from 'lucide-react'
import { updateDocumentTitle } from '@/lib/actions/documents'
import { useTransition, useRef } from 'react'

type SaveStatus = 'saved' | 'saving' | 'unsaved'

interface WriterTopBarProps {
  documentId: string
  title: string
  onTitleChange: (t: string) => void
  saveStatus: SaveStatus
  onSave: () => void
  focusMode: boolean
  onToggleFocusMode: () => void
  onToggleVersionHistory: () => void
}

export function WriterTopBar({
  documentId, title, onTitleChange, saveStatus, focusMode,
  onToggleFocusMode, onToggleVersionHistory,
}: WriterTopBarProps) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const titleRef = useRef<HTMLInputElement>(null)

  function handleTitleBlur(e: React.FocusEvent<HTMLInputElement>) {
    const newTitle = e.currentTarget.value.trim() || 'Untitled'
    onTitleChange(newTitle)
    startTransition(async () => {
      await updateDocumentTitle(documentId, newTitle)
    })
  }

  const saveLabel = saveStatus === 'saving' ? 'Saving…' : saveStatus === 'saved' ? '✓ Saved' : 'Unsaved'
  const saveColor = saveStatus === 'saving' ? '#9AA4A0' : saveStatus === 'saved' ? '#4F6F3D' : '#f97316'

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        height: 52,
        borderBottom: '1px solid #ede8e1',
        padding: '0 16px',
        gap: 12,
        flexShrink: 0,
        background: '#fff',
      }}
    >
      {/* Logo */}
      <Link href="/app" style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
        <Image src="/logo.png" alt="Sartiarum" width={96} height={20} style={{ objectFit: 'contain' }} />
      </Link>

      <div style={{ width: 1, height: 20, background: '#ede8e1' }} />

      {/* Assist | Coach toggle (Day 2: Assist only) */}
      <div style={{ display: 'flex', background: '#f0ede8', borderRadius: 8, padding: 2, gap: 2, flexShrink: 0 }}>
        <button style={{ height: 26, padding: '0 12px', borderRadius: 6, border: 'none', background: '#fff', fontSize: 12, fontWeight: 600, color: '#141516', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>Assist</button>
        <button style={{ height: 26, padding: '0 12px', borderRadius: 6, border: 'none', background: 'transparent', fontSize: 12, fontWeight: 500, color: '#9AA4A0', cursor: 'not-allowed', opacity: 0.6 }} disabled title="Coach mode ships in Phase 2">Coach</button>
      </div>

      {/* Doc title */}
      <input
        ref={titleRef}
        defaultValue={title}
        onBlur={handleTitleBlur}
        placeholder="Untitled"
        style={{
          flex: 1,
          border: 'none',
          outline: 'none',
          fontSize: 14,
          fontWeight: 600,
          color: '#141516',
          background: 'transparent',
          fontFamily: 'Inter, sans-serif',
          minWidth: 0,
        }}
      />

      {/* Save status */}
      <span style={{ fontSize: 12, fontWeight: 500, color: saveColor, flexShrink: 0 }}>{saveLabel}</span>

      {/* Actions */}
      <button
        onClick={onToggleFocusMode}
        title={focusMode ? 'Exit focus mode' : 'Focus mode'}
        style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 7, border: '1px solid #ede8e1', background: focusMode ? '#eef2e9' : 'transparent', fontSize: 12, fontWeight: 500, color: focusMode ? '#4F6F3D' : '#4F5963', cursor: 'pointer' }}
      >
        <Columns size={13} /> {focusMode ? 'Exit focus' : 'Focus'}
      </button>
      <button
        onClick={onToggleVersionHistory}
        title="Version history"
        style={{ display: 'flex', alignItems: 'center', padding: 6, borderRadius: 7, border: 'none', background: 'transparent', color: '#4F5963', cursor: 'pointer' }}
      >
        <Clock size={15} />
      </button>
      <button
        title="Export (Day 4)"
        style={{ display: 'flex', alignItems: 'center', gap: 5, height: 32, padding: '0 12px', borderRadius: 8, border: '1px solid #ede8e1', background: 'transparent', fontSize: 12.5, fontWeight: 600, color: '#4F5963', cursor: 'not-allowed', opacity: 0.6 }}
        disabled
      >
        <Download size={13} /> Export
      </button>

      {/* Back */}
      <Link
        href="/app"
        style={{ display: 'flex', alignItems: 'center', gap: 5, height: 32, padding: '0 12px', borderRadius: 8, border: '1px solid #ede8e1', fontSize: 12.5, fontWeight: 600, color: '#4F5963', textDecoration: 'none', flexShrink: 0 }}
      >
        <ArrowLeft size={13} /> Dashboard
      </Link>
    </div>
  )
}
