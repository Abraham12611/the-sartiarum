'use client'

import { useState } from 'react'
import { RotateCcw, AlignJustify, Layers, Zap } from 'lucide-react'
import { WriterSettings } from './WriterSettings'

type AiActionId = 'rewrite' | 'summarize' | 'expand' | 'brainstorm'

interface ComposePanelProps {
  documentId: string
  tone: string
  length: string
  audience: string
  onToneChange: (v: string) => void
  onLengthChange: (v: string) => void
  onAudienceChange: (v: string) => void
  onWrite: (prompt: string) => Promise<void>
  onAction: (action: AiActionId) => Promise<void>
  onRetryLastAction: () => Promise<void>
  onStopGeneration: () => void
  pendingAction: 'write' | AiActionId | null
  actionError: string | null
  streamPreview: string
}

const AI_ACTIONS: Array<{ icon: React.ReactNode; label: string; id: AiActionId }> = [
  { icon: <Zap size={13} />, label: 'Rewrite', id: 'rewrite' },
  { icon: <AlignJustify size={13} />, label: 'Summarize', id: 'summarize' },
  { icon: <Layers size={13} />, label: 'Expand', id: 'expand' },
  { icon: <RotateCcw size={13} />, label: 'Brainstorm', id: 'brainstorm' },
]

export function ComposePanel({
  documentId,
  tone,
  length,
  audience,
  onToneChange,
  onLengthChange,
  onAudienceChange,
  onWrite,
  onAction,
  onRetryLastAction,
  onStopGeneration,
  pendingAction,
  actionError,
  streamPreview,
}: ComposePanelProps) {
  const [prompt, setPrompt] = useState('')

  const busy = pendingAction !== null

  return (
    <div
      style={{
        width: 280,
        flexShrink: 0,
        borderRight: '1px solid #ede8e1',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: '#faf9f7',
      }}
    >
      <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid #ede8e1' }}>
        <p
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: '#9AA4A0',
            textTransform: 'uppercase',
            letterSpacing: '0.07em',
            margin: 0,
          }}
        >
          ✦ Compose
        </p>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 0' }}>
        <p style={{ fontSize: 12, color: '#9AA4A0', marginBottom: 8 }}>
          What would you like to write about?
        </p>
        <div style={{ position: 'relative' }}>
          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="Describe your topic or paste a brief…"
            rows={4}
            disabled={busy}
            style={{
              width: '100%',
              borderRadius: 11,
              border: '1.5px solid #e1dbd2',
              padding: '10px 36px 10px 12px',
              fontSize: 13,
              color: '#141516',
              resize: 'none',
              outline: 'none',
              fontFamily: 'Inter, sans-serif',
              lineHeight: 1.55,
              background: '#fff',
              boxSizing: 'border-box',
              opacity: busy ? 0.8 : 1,
            }}
            onFocus={(event) => {
              event.currentTarget.style.borderColor = '#4F6F3D'
            }}
            onBlur={(event) => {
              event.currentTarget.style.borderColor = '#e1dbd2'
            }}
          />
          <button
            onClick={async () => {
              if (!prompt.trim() || busy) return
              await onWrite(prompt.trim())
            }}
            title="Generate from prompt"
            disabled={busy || !prompt.trim()}
            style={{
              position: 'absolute',
              bottom: 8,
              right: 8,
              width: 26,
              height: 26,
              borderRadius: 7,
              background: prompt.trim() && !busy ? '#4F6F3D' : '#c8d6be',
              border: 'none',
              cursor: prompt.trim() && !busy ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 14,
              transition: 'background 0.15s',
            }}
          >
            ↑
          </button>
        </div>

        <div style={{ marginTop: 14 }}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: '#9AA4A0',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: 8,
            }}
          >
            Write with AI
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {AI_ACTIONS.map((action) => (
              <button
                key={action.id}
                onClick={async () => {
                  if (busy) return
                  await onAction(action.id)
                }}
                disabled={busy}
                title={action.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  height: 34,
                  padding: '0 10px',
                  borderRadius: 9,
                  border: '1px solid #e1dbd2',
                  background: pendingAction === action.id ? '#eef2e9' : '#fff',
                  fontSize: 12.5,
                  fontWeight: 500,
                  color: '#4F5963',
                  cursor: busy ? 'not-allowed' : 'pointer',
                  fontFamily: 'Inter, sans-serif',
                  transition: 'border-color 0.12s',
                  opacity: busy && pendingAction !== action.id ? 0.7 : 1,
                }}
              >
                <span style={{ color: '#4F6F3D' }}>{action.icon}</span>
                {pendingAction === action.id ? 'Working...' : action.label}
              </button>
            ))}
          </div>
        </div>

        {actionError ? (
          <div style={{ marginTop: 10, border: '1px solid #f3d3cd', background: '#fff5f3', borderRadius: 10, padding: '8px 10px' }}>
            <p style={{ margin: 0, fontSize: 12, color: '#b42318', lineHeight: 1.4 }}>
              {actionError}
            </p>
            <button
              onClick={() => {
                void onRetryLastAction()
              }}
              style={{
                marginTop: 6,
                height: 26,
                borderRadius: 8,
                border: 'none',
                background: '#b42318',
                color: '#fff',
                fontSize: 11.5,
                fontWeight: 600,
                padding: '0 10px',
                cursor: 'pointer',
              }}
            >
              Retry action
            </button>
          </div>
        ) : null}

        {pendingAction ? (
          <div style={{ marginTop: 10, border: '1px solid #dce7d5', background: '#f8fbf5', borderRadius: 10, padding: '8px 10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <span style={{ fontSize: 11.5, fontWeight: 600, color: '#3d5e34' }}>
                Streaming {pendingAction}...
              </span>
              <button
                onClick={onStopGeneration}
                style={{
                  height: 24,
                  borderRadius: 8,
                  border: '1px solid #d2dccb',
                  background: '#fff',
                  color: '#3b443d',
                  fontSize: 11,
                  fontWeight: 600,
                  padding: '0 8px',
                  cursor: 'pointer',
                }}
              >
                Stop
              </button>
            </div>
            <div style={{ marginTop: 6, minHeight: 24, fontSize: 11.5, color: '#4f5963', lineHeight: 1.4 }}>
              {streamPreview || 'Generating...'}
            </div>
          </div>
        ) : null}
      </div>

      <WriterSettings
        tone={tone}
        length={length}
        audience={audience}
        onToneChange={onToneChange}
        onLengthChange={onLengthChange}
        onAudienceChange={onAudienceChange}
        documentId={documentId}
      />
    </div>
  )
}
