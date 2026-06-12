'use client'

import { useState } from 'react'
import { Zap, AlignJustify, Layers, RotateCcw } from 'lucide-react'
import { WriterSettings } from './WriterSettings'

const AI_ACTIONS = [
  { icon: <Zap size={13} />, label: 'Rewrite', id: 'rewrite' },
  { icon: <AlignJustify size={13} />, label: 'Summarize', id: 'summarize' },
  { icon: <Layers size={13} />, label: 'Expand', id: 'expand' },
  { icon: <RotateCcw size={13} />, label: 'Brainstorm', id: 'brainstorm' },
]

export function ComposePanel({ documentId, tone, length, audience, onToneChange, onLengthChange, onAudienceChange }: { documentId: string; tone: string; length: string; audience: string; onToneChange: (v: string) => void; onLengthChange: (v: string) => void; onAudienceChange: (v: string) => void }) {
  const [prompt, setPrompt] = useState('')
  return (
    <div style={{ width: 280, flexShrink: 0, borderRight: '1px solid #ede8e1', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#faf9f7' }}>
      <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid #ede8e1' }}><p style={{ fontSize: 11, fontWeight: 700, color: '#9AA4A0', textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>✦ Compose</p></div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 0' }}>
        <p style={{ fontSize: 12, color: '#9AA4A0', marginBottom: 8 }}>What would you like to write about?</p>
        <div style={{ position: 'relative' }}>
          <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Describe your topic or paste a brief…" rows={4} style={{ width: '100%', borderRadius: 11, border: '1.5px solid #e1dbd2', padding: '10px 36px 10px 12px', fontSize: 13, color: '#141516', resize: 'none', outline: 'none', fontFamily: 'Inter, sans-serif', lineHeight: 1.55, background: '#fff', boxSizing: 'border-box' }} onFocus={e => { e.currentTarget.style.borderColor = '#4F6F3D' }} onBlur={e => { e.currentTarget.style.borderColor = '#e1dbd2' }} />
          <button onClick={() => {}} title="Generate (wired Day 3)" style={{ position: 'absolute', bottom: 8, right: 8, width: 26, height: 26, borderRadius: 7, background: prompt.trim() ? '#4F6F3D' : '#c8d6be', border: 'none', cursor: prompt.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14 }}>↑</button>
        </div>
        <div style={{ marginTop: 14 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: '#9AA4A0', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Write with AI</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {AI_ACTIONS.map(a => <button key={a.id} onClick={() => {}} title={`${a.label} — wired Day 3`} style={{ display: 'flex', alignItems: 'center', gap: 6, height: 34, padding: '0 10px', borderRadius: 9, border: '1px solid #e1dbd2', background: '#fff', fontSize: 12.5, fontWeight: 500, color: '#4F5963', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}><span style={{ color: '#4F6F3D' }}>{a.icon}</span>{a.label}</button>)}
          </div>
        </div>
      </div>
      <WriterSettings documentId={documentId} tone={tone} length={length} audience={audience} onToneChange={onToneChange} onLengthChange={onLengthChange} onAudienceChange={onAudienceChange} />
    </div>
  )
}
