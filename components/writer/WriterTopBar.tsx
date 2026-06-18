'use client'

import Link from 'next/link'
import { ArrowLeft, Download, Columns, Clock, Mic } from 'lucide-react'
import { updateDocumentTitle } from '@/lib/actions/documents'
import { useTransition, useRef } from 'react'

type SaveStatus = 'saved' | 'saving' | 'unsaved'

interface WriterTopBarProps {
  documentId: string
  title: string
  onTitleChange: (t: string) => void
  saveStatus: SaveStatus
  saveError: string | null
  onSave: () => void
  onRetrySave: () => void
  focusMode: boolean
  editorMode: 'notion' | 'classic'
  coachingMode: boolean
  onToggleFocusMode: () => void
  onToggleVersionHistory: () => void
  onEditorModeChange: (mode: 'notion' | 'classic') => void
  onCoachingModeChange: (mode: boolean) => void
  onOpenVoiceProfile: () => void
}

export function WriterTopBar({
  documentId, title, onTitleChange, saveStatus, focusMode,
  onToggleFocusMode, onToggleVersionHistory, saveError, onRetrySave,
  editorMode, onEditorModeChange, coachingMode, onCoachingModeChange, onOpenVoiceProfile,
}: WriterTopBarProps) {
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
      {/* Assist | Coach toggle */}
      <div style={{ display: 'flex', background: coachingMode ? '#eef2e9' : '#f0ede8', borderRadius: 8, padding: 2, gap: 2, flexShrink: 0, transition: 'background 0.2s' }}>
        <button
          onClick={() => onCoachingModeChange(false)}
          style={{
            height: 26, padding: '0 12px', borderRadius: 6, border: 'none',
            background: !coachingMode ? '#fff' : 'transparent',
            fontSize: 12, fontWeight: 600,
            color: !coachingMode ? '#141516' : '#9AA4A0',
            cursor: 'pointer',
            boxShadow: !coachingMode ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
          }}
        >
          Assist
        </button>
        <button
          onClick={() => onCoachingModeChange(true)}
          style={{
            height: 26, padding: '0 12px', borderRadius: 6, border: 'none',
            background: coachingMode ? '#fff' : 'transparent',
            fontSize: 12, fontWeight: 600,
            color: coachingMode ? '#4F6F3D' : '#9AA4A0',
            cursor: 'pointer',
            boxShadow: coachingMode ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
          }}
        >
          Coach
        </button>
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
      {saveError ? (
        <button
          onClick={onRetrySave}
          style={{
            height: 28,
            padding: '0 10px',
            borderRadius: 8,
            border: '1px solid #f3d3cd',
            background: '#fff5f3',
            color: '#b42318',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
          }}
          title={saveError}
        >
          Save failed - Retry
        </button>
      ) : null}

      <div style={{ display: 'flex', background: '#f0ede8', borderRadius: 8, padding: 2, gap: 2, flexShrink: 0 }}>
        <button
          onClick={() => onEditorModeChange('notion')}
          style={{
            height: 26,
            padding: '0 10px',
            borderRadius: 6,
            border: 'none',
            background: editorMode === 'notion' ? '#fff' : 'transparent',
            fontSize: 11.5,
            fontWeight: 600,
            color: editorMode === 'notion' ? '#141516' : '#9AA4A0',
            cursor: 'pointer',
            boxShadow: editorMode === 'notion' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
          }}
        >
          Neo
        </button>
        <button
          onClick={() => onEditorModeChange('classic')}
          style={{
            height: 26,
            padding: '0 10px',
            borderRadius: 6,
            border: 'none',
            background: editorMode === 'classic' ? '#fff' : 'transparent',
            fontSize: 11.5,
            fontWeight: 600,
            color: editorMode === 'classic' ? '#141516' : '#9AA4A0',
            cursor: 'pointer',
            boxShadow: editorMode === 'classic' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
          }}
        >
          Classic
        </button>
      </div>

      {/* Voice Profile */}
      <button
        onClick={onOpenVoiceProfile}
        title="Voice Profile"
        style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 7, border: '1px solid #d4e0cc', background: '#f5f8f2', fontSize: 12, fontWeight: 500, color: '#4F6F3D', cursor: 'pointer' }}
      >
        <Mic size={13} /> Voice
      </button>

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
