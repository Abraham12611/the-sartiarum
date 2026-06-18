'use client'

import { useState, useRef, useEffect } from 'react'
import {
  MessageCircleQuestion,
  Eye,
  BookOpen,
  Send,
  Loader2,
  Sparkles,
  ChevronLeft,
  RefreshCw,
} from 'lucide-react'
import { WritingMetricsCard } from './WritingMetricsCard'
import type { WritingMetrics } from '@/lib/writing-metrics'

export type CoachingItem = {
  type: 'question' | 'observation' | 'principle'
  content: string
  location?: string
}

type ThreadMessage = {
  role: 'coach' | 'user'
  content: string
  parentQuestion?: string
}

interface CoachingPanelProps {
  open: boolean
  onToggle: () => void
  onRequestAnalysis: () => void
  isAnalyzing: boolean
  coachingItems: CoachingItem[]
  onRespond: (originalQuestion: string, userResponse: string) => void
  isResponding: boolean
  threadMessages: ThreadMessage[]
  hasContent: boolean
  metrics: WritingMetrics | null
  autoTriggerReady: boolean
  onDismissAutoTrigger: () => void
}

const typeIcons = {
  question: MessageCircleQuestion,
  observation: Eye,
  principle: BookOpen,
}

const typeColors = {
  question: { bg: '#eef2e9', fg: '#4F6F3D', border: '#d4e0cc' },
  observation: { bg: '#f0f4ff', fg: '#3b5998', border: '#d0daf0' },
  principle: { bg: '#fef7ed', fg: '#b45309', border: '#f5e0c0' },
}

const typeLabels = {
  question: 'Question',
  observation: 'Pattern',
  principle: 'Principle',
}

export function CoachingPanel({
  open,
  onToggle,
  onRequestAnalysis,
  isAnalyzing,
  coachingItems,
  onRespond,
  isResponding,
  threadMessages,
  hasContent,
  metrics,
  autoTriggerReady,
  onDismissAutoTrigger,
}: CoachingPanelProps) {
  const [respondingTo, setRespondingTo] = useState<string | null>(null)
  const [responseText, setResponseText] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [threadMessages, coachingItems])

  function handleSubmitResponse() {
    if (!respondingTo || !responseText.trim() || isResponding) return
    onRespond(respondingTo, responseText.trim())
    setResponseText('')
    setRespondingTo(null)
  }

  if (!open) {
    return (
      <div
        style={{
          width: 48,
          flexShrink: 0,
          borderRight: '1px solid #d4e0cc',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: 14,
          gap: 8,
          background: '#f5f8f2',
          cursor: 'pointer',
        }}
        onClick={onToggle}
        title="Open coaching panel"
      >
        <button
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#4F6F3D',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 32,
            height: 32,
            borderRadius: 8,
          }}
        >
          <Sparkles size={15} />
        </button>
      </div>
    )
  }

  return (
    <div
      style={{
        width: 340,
        flexShrink: 0,
        borderRight: '1px solid #d4e0cc',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: '#f5f8f2',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 16px 10px',
          borderBottom: '1px solid #d4e0cc',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Sparkles size={13} color="#4F6F3D" />
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: '#4F6F3D',
              textTransform: 'uppercase',
              letterSpacing: '0.07em',
              margin: 0,
            }}
          >
            Coach
          </p>
        </div>
        <button
          onClick={onToggle}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#4F6F3D',
            display: 'flex',
          }}
        >
          <ChevronLeft size={15} />
        </button>
      </div>

      {/* Content area */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        {/* Auto-trigger nudge */}
        {autoTriggerReady && coachingItems.length === 0 && !isAnalyzing && (
          <div
            style={{
              background: '#eef2e9',
              border: '1px solid #d4e0cc',
              borderRadius: 10,
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              animation: 'fadeIn 0.3s ease',
            }}
          >
            <Sparkles size={14} color="#4F6F3D" />
            <span style={{ fontSize: 12.5, color: '#1f2937', flex: 1 }}>
              New writing detected.
            </span>
            <button
              onClick={onRequestAnalysis}
              style={{
                padding: '4px 12px',
                borderRadius: 7,
                border: 'none',
                background: '#4F6F3D',
                color: '#fff',
                fontSize: 11.5,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Get Feedback
            </button>
            <button
              onClick={onDismissAutoTrigger}
              style={{
                background: 'none',
                border: 'none',
                color: '#9ca3af',
                fontSize: 11,
                cursor: 'pointer',
              }}
            >
              ✕
            </button>
            <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(-4px) } to { opacity:1; transform:translateY(0) } }`}</style>
          </div>
        )}

        {/* Writing Metrics */}
        <WritingMetricsCard metrics={metrics} />

        {/* Empty state */}
        {coachingItems.length === 0 && threadMessages.length === 0 && !isAnalyzing && (
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '32px 16px',
              gap: 14,
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: '#eef2e9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={22} color="#4F6F3D" />
            </div>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#141516', margin: 0 }}>
              Writing Coach
            </p>
            <p
              style={{
                fontSize: 12.5,
                color: '#6b7280',
                margin: 0,
                lineHeight: 1.6,
                maxWidth: 240,
              }}
            >
              {hasContent
                ? "Your coach analyzes your writing and asks Socratic questions — helping you think, not writing for you."
                : "Start writing, then ask your coach for feedback. The coach works best after you have a first draft."}
            </p>
            {hasContent && (
              <button
                onClick={onRequestAnalysis}
                disabled={isAnalyzing}
                style={{
                  marginTop: 8,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  height: 36,
                  padding: '0 18px',
                  borderRadius: 10,
                  border: 'none',
                  background: '#4F6F3D',
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <MessageCircleQuestion size={14} />
                Get Feedback
              </button>
            )}
          </div>
        )}

        {/* Loading state */}
        {isAnalyzing && coachingItems.length === 0 && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 10,
              padding: '40px 16px',
            }}
          >
            <Loader2
              size={22}
              color="#4F6F3D"
              style={{ animation: 'spin 1s linear infinite' }}
            />
            <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>
              Reading your draft…
            </p>
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </div>
        )}

        {/* Coaching items */}
        {coachingItems.map((item, i) => {
          const Icon = typeIcons[item.type]
          const colors = typeColors[item.type]
          const isActive = respondingTo === item.content

          return (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div
                style={{
                  background: '#fff',
                  border: `1px solid ${colors.border}`,
                  borderRadius: 12,
                  padding: '12px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 6,
                      background: colors.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={12} color={colors.fg} />
                  </div>
                  <span
                    style={{
                      fontSize: 10.5,
                      fontWeight: 700,
                      color: colors.fg,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}
                  >
                    {typeLabels[item.type]}
                  </span>
                  {item.location && (
                    <span
                      style={{
                        fontSize: 10.5,
                        color: '#9ca3af',
                        marginLeft: 'auto',
                      }}
                    >
                      {item.location}
                    </span>
                  )}
                </div>
                <p
                  style={{
                    fontSize: 13,
                    lineHeight: 1.6,
                    color: '#1f2937',
                    margin: 0,
                  }}
                >
                  {item.content}
                </p>
                {item.type === 'question' && !isActive && (
                  <button
                    onClick={() => {
                      setRespondingTo(item.content)
                      setTimeout(() => inputRef.current?.focus(), 50)
                    }}
                    style={{
                      alignSelf: 'flex-start',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      padding: '4px 10px',
                      borderRadius: 7,
                      border: `1px solid ${colors.border}`,
                      background: colors.bg,
                      color: colors.fg,
                      fontSize: 11.5,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Reply
                  </button>
                )}
              </div>

              {/* Inline reply area */}
              {isActive && (
                <div
                  style={{
                    background: '#fff',
                    border: '1px solid #d4e0cc',
                    borderRadius: 10,
                    padding: '10px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                  }}
                >
                  <textarea
                    ref={inputRef}
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="Your thoughts…"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSubmitResponse()
                      }
                    }}
                    style={{
                      width: '100%',
                      minHeight: 60,
                      border: 'none',
                      outline: 'none',
                      resize: 'vertical',
                      fontSize: 13,
                      lineHeight: 1.5,
                      color: '#1f2937',
                      background: 'transparent',
                      fontFamily: 'inherit',
                    }}
                  />
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      gap: 6,
                    }}
                  >
                    <button
                      onClick={() => {
                        setRespondingTo(null)
                        setResponseText('')
                      }}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 7,
                        border: '1px solid #e5e7eb',
                        background: '#fff',
                        fontSize: 11.5,
                        color: '#6b7280',
                        cursor: 'pointer',
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmitResponse}
                      disabled={!responseText.trim() || isResponding}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        padding: '4px 12px',
                        borderRadius: 7,
                        border: 'none',
                        background: '#4F6F3D',
                        color: '#fff',
                        fontSize: 11.5,
                        fontWeight: 600,
                        cursor: responseText.trim() && !isResponding ? 'pointer' : 'not-allowed',
                        opacity: responseText.trim() && !isResponding ? 1 : 0.5,
                      }}
                    >
                      {isResponding ? (
                        <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />
                      ) : (
                        <Send size={12} />
                      )}
                      Send
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {/* Thread messages (coaching conversation) */}
        {threadMessages.map((msg, i) => (
          <div
            key={`thread-${i}`}
            style={{
              background: msg.role === 'coach' ? '#fff' : '#eef2e9',
              border: `1px solid ${msg.role === 'coach' ? '#e5e7eb' : '#d4e0cc'}`,
              borderRadius: 10,
              padding: '10px 14px',
            }}
          >
            <span
              style={{
                fontSize: 10.5,
                fontWeight: 700,
                color: msg.role === 'coach' ? '#4F6F3D' : '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              {msg.role === 'coach' ? '↳ Coach' : 'You'}
            </span>
            <p
              style={{
                fontSize: 13,
                lineHeight: 1.6,
                color: '#1f2937',
                margin: '4px 0 0',
              }}
            >
              {msg.content}
            </p>
          </div>
        ))}

        {/* Responding indicator */}
        {isResponding && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 0',
            }}
          >
            <Loader2
              size={13}
              color="#4F6F3D"
              style={{ animation: 'spin 1s linear infinite' }}
            />
            <span style={{ fontSize: 12, color: '#6b7280' }}>Coach is thinking…</span>
          </div>
        )}
      </div>

      {/* Footer — refresh button */}
      {coachingItems.length > 0 && (
        <div
          style={{
            borderTop: '1px solid #d4e0cc',
            padding: '10px 16px',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <button
            onClick={onRequestAnalysis}
            disabled={isAnalyzing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 14px',
              borderRadius: 8,
              border: '1px solid #d4e0cc',
              background: '#fff',
              color: '#4F6F3D',
              fontSize: 12,
              fontWeight: 600,
              cursor: isAnalyzing ? 'not-allowed' : 'pointer',
              opacity: isAnalyzing ? 0.5 : 1,
            }}
          >
            <RefreshCw size={12} />
            Re-analyze Draft
          </button>
        </div>
      )}
    </div>
  )
}
