'use client'

import { useTransition } from 'react'
import { updateDocumentSettings } from '@/lib/actions/documents'

const TONES = ['Balanced', 'Formal', 'Casual', 'Persuasive', 'Academic', 'Conversational']
const LENGTHS = ['Short', 'Medium', 'Long']
const AUDIENCES = ['General', 'Technical', 'Academic', 'Business', 'Creative']

interface WriterSettingsProps {
  documentId: string
  tone: string
  length: string
  audience: string
  onToneChange: (v: string) => void
  onLengthChange: (v: string) => void
  onAudienceChange: (v: string) => void
}

export function WriterSettings({ documentId, tone, length, audience, onToneChange, onLengthChange, onAudienceChange }: WriterSettingsProps) {
  const [, startTransition] = useTransition()

  function handleChange(field: 'tone' | 'length' | 'audience', value: string) {
    if (field === 'tone') onToneChange(value)
    if (field === 'length') onLengthChange(value)
    if (field === 'audience') onAudienceChange(value)
    startTransition(async () => {
      await updateDocumentSettings(documentId, { [field]: value })
    })
  }

  const selectStyle: React.CSSProperties = {
    width: '100%',
    height: 32,
    borderRadius: 8,
    border: '1px solid #e1dbd2',
    padding: '0 8px',
    fontSize: 12.5,
    color: '#141516',
    background: '#fff',
    outline: 'none',
    fontFamily: 'Inter, sans-serif',
    cursor: 'pointer',
  }

  return (
    <div style={{ padding: '14px 14px', borderTop: '1px solid #ede8e1' }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: '#9AA4A0', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Writer settings</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div>
          <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#4F5963', marginBottom: 4 }}>Tone</label>
          <select value={tone} onChange={e => handleChange('tone', e.target.value)} style={selectStyle}>
            {TONES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#4F5963', marginBottom: 4 }}>Length</label>
          <select value={length} onChange={e => handleChange('length', e.target.value)} style={selectStyle}>
            {LENGTHS.map(l => <option key={l}>{l}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#4F5963', marginBottom: 4 }}>Audience</label>
          <select value={audience} onChange={e => handleChange('audience', e.target.value)} style={selectStyle}>
            {AUDIENCES.map(a => <option key={a}>{a}</option>)}
          </select>
        </div>
      </div>
    </div>
  )
}
