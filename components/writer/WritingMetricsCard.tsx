'use client'

import type { WritingMetrics } from '@/lib/writing-metrics'
import { TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'

interface WritingMetricsCardProps {
  metrics: WritingMetrics | null
}

function MetricRow({
  label,
  value,
  status,
  detail,
}: {
  label: string
  value: string | number
  status: 'good' | 'warning' | 'neutral'
  detail?: string
}) {
  const colors = {
    good: { fg: '#4F6F3D', bg: '#eef2e9' },
    warning: { fg: '#b45309', bg: '#fef7ed' },
    neutral: { fg: '#6b7280', bg: '#f3f4f6' },
  }
  const c = colors[status]

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '6px 0',
      }}
    >
      <span style={{ fontSize: 12, color: '#4b5563' }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {detail && (
          <span style={{ fontSize: 10.5, color: '#9ca3af' }}>{detail}</span>
        )}
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: c.fg,
            background: c.bg,
            padding: '2px 8px',
            borderRadius: 6,
          }}
        >
          {value}
        </span>
      </div>
    </div>
  )
}

function ScoreBar({ score, max = 100 }: { score: number; max?: number }) {
  const pct = Math.min(100, Math.max(0, (score / max) * 100))
  const color =
    pct >= 60 ? '#4F6F3D' : pct >= 40 ? '#b45309' : '#dc2626'

  return (
    <div
      style={{
        width: '100%',
        height: 6,
        borderRadius: 3,
        background: '#e5e7eb',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: `${pct}%`,
          height: '100%',
          borderRadius: 3,
          background: color,
          transition: 'width 0.3s ease',
        }}
      />
    </div>
  )
}

export function WritingMetricsCard({ metrics }: WritingMetricsCardProps) {
  if (!metrics || metrics.wordCount < 10) {
    return (
      <div
        style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: 12,
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <TrendingUp size={14} color="#9ca3af" />
        <span style={{ fontSize: 12.5, color: '#9ca3af' }}>
          Writing metrics appear after 10+ words
        </span>
      </div>
    )
  }

  const passiveStatus =
    metrics.passiveVoicePercent <= 10
      ? 'good'
      : metrics.passiveVoicePercent <= 20
      ? 'neutral'
      : 'warning'

  const fillerStatus =
    metrics.fillerWordPercent <= 3
      ? 'good'
      : metrics.fillerWordPercent <= 7
      ? 'neutral'
      : 'warning'

  const varianceStatus =
    metrics.sentenceLengthVariance >= 4
      ? 'good'
      : metrics.sentenceLengthVariance >= 2
      ? 'neutral'
      : 'warning'

  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: 12,
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        <TrendingUp size={13} color="#4F6F3D" />
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: '#4F6F3D',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          Writing Fingerprint
        </span>
        <span
          style={{
            marginLeft: 'auto',
            fontSize: 11,
            color: '#9ca3af',
          }}
        >
          {metrics.wordCount} words
        </span>
      </div>

      {/* Readability score bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: '#4b5563' }}>Readability</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#1f2937' }}>
            {metrics.readabilityGrade}
          </span>
        </div>
        <ScoreBar score={metrics.readabilityScore} />
      </div>

      <div style={{ height: 1, background: '#f3f4f6', margin: '4px 0' }} />

      {/* Metrics */}
      <MetricRow
        label="Passive voice"
        value={`${metrics.passiveVoicePercent}%`}
        status={passiveStatus}
        detail={passiveStatus === 'good' ? '✓' : undefined}
      />
      <MetricRow
        label="Filler words"
        value={`${metrics.fillerWordPercent}%`}
        status={fillerStatus}
        detail={fillerStatus === 'good' ? '✓' : undefined}
      />
      <MetricRow
        label="Sentence variety"
        value={metrics.sentenceLengthVariance.toFixed(1)}
        status={varianceStatus}
        detail={`${metrics.shortestSentence}–${metrics.longestSentence} words`}
      />
      <MetricRow
        label="Avg sentence"
        value={`${metrics.avgSentenceLength} words`}
        status={metrics.avgSentenceLength > 25 ? 'warning' : 'good'}
      />

      {/* Quick assessment */}
      <div style={{ height: 1, background: '#f3f4f6', margin: '4px 0' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {passiveStatus === 'good' && fillerStatus === 'good' && varianceStatus === 'good' ? (
          <>
            <CheckCircle size={13} color="#4F6F3D" />
            <span style={{ fontSize: 12, color: '#4F6F3D', fontWeight: 500 }}>
              Clean, varied prose
            </span>
          </>
        ) : (
          <>
            <AlertTriangle size={13} color="#b45309" />
            <span style={{ fontSize: 12, color: '#b45309', fontWeight: 500 }}>
              {passiveStatus === 'warning' && 'High passive voice • '}
              {fillerStatus === 'warning' && 'Filler-heavy • '}
              {varianceStatus === 'warning' && 'Monotone rhythm'}
            </span>
          </>
        )}
      </div>
    </div>
  )
}
