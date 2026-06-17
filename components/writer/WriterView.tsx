'use client'

import { useCallback, useRef, useState, useTransition } from 'react'
import { saveDocument, snapshotDocumentVersion } from '@/lib/actions/documents'
import { WriterTopBar } from './WriterTopBar'
import { ComposePanel } from './ComposePanel'
import { AssistantPanel } from './AssistantPanel'
import { Editor, type WriterEditorHandle } from '@/components/editor/Editor'
import { VersionHistoryPanel } from './VersionHistoryPanel'

type Document = {
  id: string
  title: string
  content: unknown
  tone: string
  length: string
  audience: string
  wordCount: number
}

type SaveStatus = 'saved' | 'saving' | 'unsaved'
type AiAction = 'write' | 'rewrite' | 'summarize' | 'expand' | 'brainstorm'

export function WriterView({ document }: { document: Document }) {
  const editorRef = useRef<WriterEditorHandle>(null)
  const streamAbortRef = useRef<AbortController | null>(null)
  const lastActionRef = useRef<{ action: AiAction; payload: Record<string, unknown> } | null>(null)

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
  const [saveError, setSaveError] = useState<string | null>(null)
  const [pendingAction, setPendingAction] = useState<AiAction | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [streamPreview, setStreamPreview] = useState('')

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

  async function parseTextStream(response: Response, onChunk: (chunk: string) => void) {
    if (!response.body) throw new Error('No response stream from AI route.')
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let output = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      const chunk = decoder.decode(value, { stream: true })
      output += chunk
      onChunk(chunk)
    }

    return output.trim()
  }

  async function runAiAction(action: AiAction, payload: Record<string, unknown>) {
    setPendingAction(action)
    setActionError(null)
    setStreamPreview('')
    lastActionRef.current = { action, payload }
    let generatedText = ''

    try {
      await snapshotDocumentVersion(document.id, editorRef.current?.getJSON() ?? content)
      streamAbortRef.current = new AbortController()

      const response = await fetch(`/api/ai/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: streamAbortRef.current.signal,
        body: JSON.stringify({
          ...payload,
          tone,
          length,
          audience,
        }),
      })

      if (!response.ok) {
        const message = await response.text()
        throw new Error(message || `AI ${action} failed`)
      }

      const text = await parseTextStream(response, (chunk) => {
        generatedText += chunk
        setStreamPreview((prev) => (prev + chunk).slice(-500))
      })
      if (!text) throw new Error('AI returned an empty response.')

      if (action === 'rewrite' || action === 'expand') {
        editorRef.current?.replaceLastSelection(text)
      } else if (action === 'summarize') {
        editorRef.current?.insertAtCursor(`\n\nSummary:\n${text}`)
      } else if (action === 'brainstorm') {
        editorRef.current?.insertAtCursor(`\n\n${text}`)
      } else {
        editorRef.current?.insertAtCursor(text)
      }

      editorRef.current?.focus()
    } catch (error) {
      const aborted = error instanceof DOMException && error.name === 'AbortError'
      const message = aborted
        ? 'Generation stopped. Partial output has been preserved.'
        : error instanceof Error
          ? error.message
          : 'AI action failed.'

      if (generatedText.trim()) {
        if (action === 'rewrite' || action === 'expand') {
          editorRef.current?.insertAtCursor(`\n\nPartial ${action}:\n${generatedText}`)
        } else {
          editorRef.current?.insertAtCursor(`\n\n${generatedText}`)
        }
      }

      setActionError(message)
    } finally {
      streamAbortRef.current = null
      setPendingAction(null)
      setStreamPreview('')
    }
  }

  async function handleWrite(prompt: string) {
    await runAiAction('write', { prompt })
  }

  async function handleComposeAction(action: Exclude<AiAction, 'write'>) {
    const selection =
      editorRef.current?.getSelectionText() ||
      editorRef.current?.getLastSelectionText() ||
      ''
    const wholeDoc = editorRef.current?.getPlainText() ?? ''

    if (action === 'brainstorm') {
      const topic = selection || wholeDoc.slice(0, 300)
      if (!topic.trim()) {
        setActionError('Select text or add a topic before brainstorming.')
        return
      }
      await runAiAction(action, { topic })
      return
    }

    if (action === 'summarize') {
      const text = selection || wholeDoc
      if (!text.trim()) {
        setActionError('Add content first so AI can summarize it.')
        return
      }
      await runAiAction(action, { text })
      return
    }

    if (!selection.trim()) {
      setActionError('Select text first before using Rewrite or Expand.')
      return
    }

    await runAiAction(action, { selection })
  }

  async function handleRetryLastAction() {
    const last = lastActionRef.current
    if (!last || pendingAction) return
    await runAiAction(last.action, last.payload)
  }

  function handleStopGeneration() {
    streamAbortRef.current?.abort()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <WriterTopBar
        documentId={document.id}
        title={title}
        onTitleChange={setTitle}
        saveStatus={saveStatus}
        saveError={saveError}
        onSave={handleSave}
        onRetrySave={handleSave}
        focusMode={focusMode}
        onToggleFocusMode={() => setFocusMode((value) => !value)}
        onToggleVersionHistory={() => setShowVersionHistory((value) => !value)}
      />

      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <ComposePanel
          documentId={document.id}
          tone={tone}
          length={length}
          audience={audience}
          onToneChange={setTone}
          onLengthChange={setLength}
          onAudienceChange={setAudience}
          onWrite={handleWrite}
          onAction={handleComposeAction}
          onRetryLastAction={handleRetryLastAction}
          onStopGeneration={handleStopGeneration}
          pendingAction={pendingAction}
          actionError={actionError}
          streamPreview={streamPreview}
        />

        <AssistantPanel open={assistantOpen} onToggle={() => setAssistantOpen((value) => !value)} />

        <Editor
          ref={editorRef}
          content={content}
          focusMode={focusMode}
          onUpdate={handleEditorUpdate}
          onSaveNow={handleSave}
          onAiAction={handleComposeAction}
        />
      </div>

      {showVersionHistory ? (
        <VersionHistoryPanel
          documentId={document.id}
          onClose={() => setShowVersionHistory(false)}
        />
      ) : null}

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
