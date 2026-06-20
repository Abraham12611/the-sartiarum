'use client'

import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { saveDocument, snapshotDocumentVersion } from '@/lib/actions/documents'
import { WriterTopBar } from './WriterTopBar'
import { ComposePanel } from './ComposePanel'
import { AssistantPanel } from './AssistantPanel'
import { CoachingPanel, type CoachingItem } from './CoachingPanel'
import { Editor, type WriterEditorHandle } from '@/components/editor/Editor'
import { VersionHistoryPanel } from './VersionHistoryPanel'
import { NotionEditor, type NotionEditorHandle } from '@/components/tiptap-templates/notion-like/notion-like-editor'
import { computeWritingMetrics, type WritingMetrics } from '@/lib/writing-metrics'
import { VoiceIngestionModal } from './VoiceIngestionModal'
import { markdownToHtml } from '@/lib/markdown-to-html'

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
  const editorRef = useRef<WriterEditorHandle | NotionEditorHandle>(null)
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
  const [editorMode, setEditorMode] = useState<'notion' | 'classic'>('notion')
  const [coachingMode, setCoachingMode] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isResponding, setIsResponding] = useState(false)
  const [coachingItems, setCoachingItems] = useState<CoachingItem[]>([])
  const [threadMessages, setThreadMessages] = useState<{ role: 'coach' | 'user'; content: string; parentQuestion?: string }[]>([])
  const [writingMetrics, setWritingMetrics] = useState<WritingMetrics | null>(null)
  const [autoTriggerReady, setAutoTriggerReady] = useState(false)
  const [voiceModalOpen, setVoiceModalOpen] = useState(false)
  const lastWordCountForTrigger = useRef(0)
  const typingPauseTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const saved = window.localStorage.getItem('sartiarum-editor-mode')
    if (saved === 'classic' || saved === 'notion') {
      setEditorMode(saved)
    }
  }, [])

  async function handleEditorModeChange(mode: 'notion' | 'classic') {
    await handleSave()
    setEditorMode(mode)
    window.localStorage.setItem('sartiarum-editor-mode', mode)
  }

  function handleCoachingModeChange(mode: boolean) {
    setCoachingMode(mode)
    if (mode) setAssistantOpen(true)
  }

  // Recompute writing metrics on content change + auto-trigger detection
  useEffect(() => {
    const text = getPlainText()
    if (text.length > 20) {
      const m = computeWritingMetrics(text)
      setWritingMetrics(m)

      // Auto-trigger: detect when user has written 50+ new words since last feedback
      if (coachingMode && coachingItems.length === 0) {
        const newWords = m.wordCount - lastWordCountForTrigger.current
        if (newWords >= 50) {
          // Wait for typing pause (5 seconds of no change)
          if (typingPauseTimer.current) clearTimeout(typingPauseTimer.current)
          typingPauseTimer.current = setTimeout(() => {
            setAutoTriggerReady(true)
          }, 5000)
        }
      }
    } else {
      setWritingMetrics(null)
    }

    return () => {
      if (typingPauseTimer.current) clearTimeout(typingPauseTimer.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, coachingMode])

  function getPlainText(): string {
    if (!content) return ''
    if (typeof content === 'string') return content
    try {
      // Tiptap JSON → extract text recursively
      function extract(node: unknown): string {
        if (!node || typeof node !== 'object') return ''
        const n = node as Record<string, unknown>
        let text = ''
        if (typeof n.text === 'string') text += n.text
        if (Array.isArray(n.content)) {
          for (const child of n.content) text += extract(child) + ' '
        }
        return text
      }
      return extract(content).trim()
    } catch {
      return JSON.stringify(content).slice(0, 8000)
    }
  }

  async function handleRequestCoachingAnalysis() {
    const draftText = getPlainText()
    setIsAnalyzing(true)
    setCoachingItems([])
    setThreadMessages([])

    try {
      const res = await fetch('/api/ai/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draftText, documentId: document.id }),
      })
      if (!res.ok) throw new Error(await res.text())

      const reader = res.body?.getReader()
      if (!reader) throw new Error('No stream')

      let fullText = ''
      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        fullText += decoder.decode(value, { stream: true })
      }

      // Parse the JSON array from the response
      try {
        // Strip markdown fences if present
        let cleaned = fullText.trim()
        if (cleaned.startsWith('```')) {
          cleaned = cleaned.replace(/^```[\w]*\n?/, '').replace(/\n?```$/, '').trim()
        }
        const items = JSON.parse(cleaned) as CoachingItem[]
        setCoachingItems(Array.isArray(items) ? items : [])
      } catch {
        // If not valid JSON, show as a single observation
        setCoachingItems([{ type: 'observation', content: fullText.trim() }])
      }
    } catch (err) {
      setCoachingItems([{ type: 'observation', content: `Error getting feedback: ${err instanceof Error ? err.message : 'Unknown error'}` }])
    } finally {
      setIsAnalyzing(false)
    }
  }

  async function handleCoachingRespond(originalQuestion: string, userResponse: string) {
    setIsResponding(true)
    setThreadMessages((prev) => [
      ...prev,
      { role: 'user', content: userResponse, parentQuestion: originalQuestion },
    ])

    try {
      const res = await fetch('/api/ai/coach/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ originalQuestion, userResponse }),
      })
      if (!res.ok) throw new Error(await res.text())

      const reader = res.body?.getReader()
      if (!reader) throw new Error('No stream')

      let fullText = ''
      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        fullText += decoder.decode(value, { stream: true })
      }

      setThreadMessages((prev) => [
        ...prev,
        { role: 'coach', content: fullText.trim() },
      ])
    } catch (err) {
      setThreadMessages((prev) => [
        ...prev,
        { role: 'coach', content: `Error: ${err instanceof Error ? err.message : 'Unknown error'}` },
      ])
    } finally {
      setIsResponding(false)
    }
  }

  // Auto-save coaching session after each interaction
  useEffect(() => {
    if (coachingItems.length === 0) return
    const timer = setTimeout(() => {
      fetch('/api/ai/coach/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: document.id,
          coachingItems,
          threadMessages,
          metrics: writingMetrics,
        }),
      }).catch(() => {}) // silent fail — non-critical
    }, 3000) // debounce 3s
    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coachingItems, threadMessages])

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
          documentId: document.id,
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

      // Convert markdown to HTML so Tiptap renders headings, bold, lists, etc.
      const html = markdownToHtml(text)

      if (action === 'rewrite' || action === 'expand') {
        editorRef.current?.replaceLastSelection(html)
      } else if (action === 'summarize') {
        editorRef.current?.insertAtCursor(markdownToHtml(`**Summary:**\n\n${text}`))
      } else if (action === 'brainstorm') {
        editorRef.current?.insertAtCursor(html)
      } else {
        editorRef.current?.insertAtCursor(html)
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
        const partialHtml = markdownToHtml(generatedText)
        if (action === 'rewrite' || action === 'expand') {
          editorRef.current?.insertAtCursor(markdownToHtml(`**Partial ${action}:**\n\n${generatedText}`))
        } else {
          editorRef.current?.insertAtCursor(partialHtml)
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
        editorMode={editorMode}
        onToggleFocusMode={() => setFocusMode((value) => !value)}
        onToggleVersionHistory={() => setShowVersionHistory((value) => !value)}
        onEditorModeChange={handleEditorModeChange}
        coachingMode={coachingMode}
        onCoachingModeChange={handleCoachingModeChange}
        onOpenVoiceProfile={() => setVoiceModalOpen(true)}
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

        {coachingMode ? (
          <CoachingPanel
            open={assistantOpen}
            onToggle={() => setAssistantOpen((value) => !value)}
            onRequestAnalysis={() => {
              lastWordCountForTrigger.current = writingMetrics?.wordCount ?? 0
              setAutoTriggerReady(false)
              handleRequestCoachingAnalysis()
            }}
            isAnalyzing={isAnalyzing}
            coachingItems={coachingItems}
            onRespond={handleCoachingRespond}
            isResponding={isResponding}
            threadMessages={threadMessages}
            hasContent={getPlainText().length > 20}
            metrics={writingMetrics}
            autoTriggerReady={autoTriggerReady}
            onDismissAutoTrigger={() => {
              setAutoTriggerReady(false)
              lastWordCountForTrigger.current = writingMetrics?.wordCount ?? 0
            }}
          />
        ) : (
          <AssistantPanel open={assistantOpen} onToggle={() => setAssistantOpen((value) => !value)} />
        )}

        {editorMode === 'classic' ? (
          <Editor
            ref={editorRef}
            content={content}
            focusMode={focusMode}
            mode={editorMode}
            onUpdate={handleEditorUpdate}
            onSaveNow={handleSave}
            onAiAction={handleComposeAction}
          />
        ) : (
          <div style={{ flex: 1, minWidth: 0, minHeight: 0, overflow: 'hidden' }}>
            <NotionEditor
              ref={editorRef}
              room={`doc-${document.id}`}
              placeholder="Start writing..."
              initialContent={content}
              onContentUpdate={handleEditorUpdate}
              onSaveNow={handleSave}
            />
          </div>
        )}
      </div>

      {showVersionHistory ? (
        <VersionHistoryPanel
          documentId={document.id}
          onClose={() => setShowVersionHistory(false)}
        />
      ) : null}

      <VoiceIngestionModal open={voiceModalOpen} onClose={() => setVoiceModalOpen(false)} />

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
