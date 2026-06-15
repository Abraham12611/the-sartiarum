'use client'

import { useState, useTransition, useCallback } from 'react'
import { saveDocument, getDocumentVersions, restoreVersion } from '@/lib/actions/documents'
import { WriterTopBar } from './WriterTopBar'
import { ComposePanel } from './ComposePanel'
import { AssistantPanel } from './AssistantPanel'
import { Editor } from '@/components/editor/Editor'
import { VersionHistoryPanel } from './VersionHistoryPanel'

type Document = {
  id: string; title: string; content: unknown; tone: string;
  length: string; audience: string; wordCount: number
}

type SaveStatus = 'saved' | 'saving' | 'unsaved'

export function WriterView({ document }: { document: Document }) {
  const [title, setTitle] = useState(document.title)
  const [content, setContent] = useState<unknown>(document.content)
  const [wordCount, setWordCount] = useState(document.wordCount)
  const [tone, setTone] = useState(document.tone)
  const [length, setLength] = useState(document.length)
  const [audience, setAudience] = useState(document.audience)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved')
  const [focusMode, setFocusMode] = useState(false)
  const [assistantOpen, setAssistantOpen] = useState(false)
  const [showVersionHistory, setShowVersionHistory] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [saveError, setSaveError] = useState<string | null>(null)

  const handleSave = useCallback(async () => {
    setSaveStatus('saving')
    startTransition(async () => {
      try {
        await saveDocument(document.id, content, wordCount)
        setSaveStatus('saved')
        setSaveError(null)
      } catch {
        setSaveStatus('unsaved')
        setSaveError('We could not save your changes. Check your connection and retry.')
      }
    })
  }, [document.id, content, wordCount])

  const handleEditorUpdate = useCallback((newContent: unknown, newWordCount: number) => {
    setContent(newContent)
    setWordCount(newWordCount)
    setSaveStatus('unsaved')
    setSaveError(null)
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* Top bar */}
      <WriterTopBar
        documentId={document.id}
        title={title}
        onTitleChange={setTitle}
        saveStatus={saveStatus}
        saveError={saveError}
        onSave={handleSave}
        onRetrySave={handleSave}
        focusMode={focusMode}
        onToggleFocusMode={() => setFocusMode(f => !f)}
        onToggleVersionHistory={() => setShowVersionHistory(v => !v)}
      />

      {/* Three-column body */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* Compose panel */}
        <ComposePanel
          documentId={document.id}
          tone={tone}
          length={length}
          audience={audience}
          onToneChange={setTone}
          onLengthChange={setLength}
          onAudienceChange={setAudience}
        />

        {/* Assistant panel (collapsible) */}
        <AssistantPanel open={assistantOpen} onToggle={() => setAssistantOpen(o => !o)} />

        {/* Editor */}
        <Editor
          content={content}
          focusMode={focusMode}
          onUpdate={handleEditorUpdate}
          onSaveNow={handleSave}
        />
      </div>

      {/* Version history slide-in */}
      {showVersionHistory && (
        <VersionHistoryPanel
          documentId={document.id}
          onClose={() => setShowVersionHistory(false)}
        />
      )}

      {saveError ? (
        <div
          style={{
            position: 'fixed',
            right: 16,
            bottom: 16,
            zIndex: 400,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            border: '1px solid #f3d3cd',
            background: '#fff5f3',
            borderRadius: 12,
            padding: '10px 12px',
            boxShadow: '0 8px 24px rgba(21, 24, 23, 0.08)',
          }}
        >
          <span style={{ fontSize: 12.5, color: '#7a271a', fontWeight: 500 }}>{saveError}</span>
          <button
            onClick={handleSave}
            style={{
              border: 'none',
              background: '#b42318',
              color: '#fff',
              borderRadius: 8,
              height: 28,
              padding: '0 10px',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Retry
          </button>
        </div>
      ) : null}
    </div>
  )
}
