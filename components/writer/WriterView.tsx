'use client'

import { useState, useTransition, useCallback } from 'react'
import { saveDocument } from '@/lib/actions/documents'
import { WriterTopBar } from './WriterTopBar'
import { ComposePanel } from './ComposePanel'
import { AssistantPanel } from './AssistantPanel'
import { Editor } from '@/components/editor/Editor'
import { VersionHistoryPanel } from './VersionHistoryPanel'

type Document = { id: string; title: string; content: unknown; tone: string; length: string; audience: string; wordCount: number }
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
  const [, startTransition] = useTransition()

  const handleSave = useCallback(async () => {
    setSaveStatus('saving')
    startTransition(async () => { await saveDocument(document.id, content, wordCount); setSaveStatus('saved') })
  }, [document.id, content, wordCount])

  const handleEditorUpdate = useCallback((newContent: unknown, newWordCount: number) => {
    setContent(newContent); setWordCount(newWordCount); setSaveStatus('unsaved')
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <WriterTopBar documentId={document.id} title={title} onTitleChange={setTitle} saveStatus={saveStatus} onSave={handleSave} focusMode={focusMode} onToggleFocusMode={() => setFocusMode(f => !f)} onToggleVersionHistory={() => setShowVersionHistory(v => !v)} />
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <ComposePanel documentId={document.id} tone={tone} length={length} audience={audience} onToneChange={setTone} onLengthChange={setLength} onAudienceChange={setAudience} />
        <AssistantPanel open={assistantOpen} onToggle={() => setAssistantOpen(o => !o)} />
        <Editor content={content} focusMode={focusMode} onUpdate={handleEditorUpdate} onSaveNow={handleSave} />
      </div>
      {showVersionHistory && <VersionHistoryPanel documentId={document.id} onClose={() => setShowVersionHistory(false)} />}
    </div>
  )
}
