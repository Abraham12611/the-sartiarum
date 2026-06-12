'use client'

import { ChevronRight, ChevronLeft, LayoutGrid } from 'lucide-react'

export function AssistantPanel({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  if (!open) {
    // Collapsed rail
    return (
      <div
        style={{
          width: 48,
          flexShrink: 0,
          borderRight: '1px solid #ede8e1',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: 14,
          gap: 8,
          background: '#faf9f7',
          cursor: 'pointer',
        }}
        onClick={onToggle}
        title="Open assistant panel"
      >
        <button
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9AA4A0', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 8 }}
        >
          <LayoutGrid size={15} />
        </button>
        <ChevronRight size={12} color="#9AA4A0" />
      </div>
    )
  }

  return (
    <div
      style={{
        width: 300,
        flexShrink: 0,
        borderRight: '1px solid #ede8e1',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: '#faf9f7',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px 10px', borderBottom: '1px solid #ede8e1' }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#9AA4A0', textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>◎ Assistant</p>
        <button onClick={onToggle} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9AA4A0', display: 'flex' }}>
          <ChevronLeft size={15} />
        </button>
      </div>

      {/* Idle state — content added in Day 3 (AI) and Phase 3 (Research) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 20px', gap: 12, textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: '#eef2e9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <LayoutGrid size={18} color="#4F6F3D" />
        </div>
        <p style={{ fontSize: 13.5, fontWeight: 600, color: '#141516', margin: 0 }}>Assistant</p>
        <p style={{ fontSize: 12.5, color: '#9AA4A0', margin: 0, lineHeight: 1.55 }}>
          Research results and coaching feedback will appear here. AI actions wire in during Day 3.
        </p>
      </div>
    </div>
  )
}
