'use client'

import { useState } from 'react'
import { X, Plus, Trash2, Loader2, Sparkles, CheckCircle } from 'lucide-react'

interface VoiceProfile {
  name: string
  description: string
  tone_keywords: string[]
  sentence_structure: {
    avg_length: string
    complexity: string
    fragments: boolean
    patterns: string[]
  }
  vocabulary_level: string
  signature_patterns: string[]
  rhythm: string
  perspective: string
  figurative_language: string
}

interface VoiceIngestionModalProps {
  open: boolean
  onClose: () => void
}

export function VoiceIngestionModal({ open, onClose }: VoiceIngestionModalProps) {
  const [samples, setSamples] = useState<string[]>([''])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [profile, setProfile] = useState<VoiceProfile | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!open) return null

  function addSample() {
    setSamples((prev) => [...prev, ''])
  }

  function removeSample(index: number) {
    setSamples((prev) => prev.filter((_, i) => i !== index))
  }

  function updateSample(index: number, value: string) {
    setSamples((prev) => prev.map((s, i) => (i === index ? value : s)))
  }

  async function handleAnalyze() {
    const validSamples = samples.filter((s) => s.trim().length > 0)
    if (validSamples.length === 0) {
      setError('Add at least one writing sample')
      return
    }

    setIsAnalyzing(true)
    setError(null)
    setProfile(null)

    try {
      const res = await fetch('/api/ai/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ samples: validSamples }),
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

      // Parse JSON
      let cleaned = fullText.trim()
      if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```[\w]*\n?/, '').replace(/\n?```$/, '').trim()
      }
      const parsed = JSON.parse(cleaned) as VoiceProfile
      setProfile(parsed)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed')
    } finally {
      setIsAnalyzing(false)
    }
  }

  async function handleSave() {
    if (!profile) return
    setIsSaving(true)

    try {
      const res = await fetch('/api/ai/voice/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile,
          sampleExcerpts: samples
            .filter((s) => s.trim().length > 0)
            .map((s) => s.slice(0, 200)),
        }),
      })
      if (!res.ok) throw new Error(await res.text())
      setSaved(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 16,
          width: '90%',
          maxWidth: 640,
          maxHeight: '85vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px 16px',
            borderBottom: '1px solid #e5e7eb',
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#141516' }}>
              Voice Profile
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280' }}>
              Paste your writing samples — the AI will extract your unique voice fingerprint.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#6b7280',
              display: 'flex',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {!profile && !saved && (
            <>
              {/* Sample inputs */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {samples.map((sample, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <textarea
                      value={sample}
                      onChange={(e) => updateSample(i, e.target.value)}
                      placeholder={`Paste writing sample ${i + 1}... (blog post, essay, email — anything you've written)`}
                      style={{
                        width: '100%',
                        minHeight: 120,
                        padding: '12px 14px',
                        borderRadius: 10,
                        border: '1px solid #e5e7eb',
                        fontSize: 13,
                        lineHeight: 1.6,
                        resize: 'vertical',
                        fontFamily: 'inherit',
                        outline: 'none',
                      }}
                    />
                    {samples.length > 1 && (
                      <button
                        onClick={() => removeSample(i)}
                        style={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#9ca3af',
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Add sample button */}
              <button
                onClick={addSample}
                style={{
                  marginTop: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 14px',
                  borderRadius: 8,
                  border: '1px dashed #d1d5db',
                  background: 'transparent',
                  color: '#6b7280',
                  fontSize: 12.5,
                  cursor: 'pointer',
                }}
              >
                <Plus size={14} />
                Add another sample
              </button>

              {error && (
                <p style={{ margin: '12px 0 0', fontSize: 13, color: '#dc2626' }}>{error}</p>
              )}
            </>
          )}

          {/* Analysis result */}
          {profile && !saved && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div
                style={{
                  background: '#f5f8f2',
                  border: '1px solid #d4e0cc',
                  borderRadius: 12,
                  padding: '16px 20px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <Sparkles size={16} color="#4F6F3D" />
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#141516' }}>
                    {profile.name}
                  </h3>
                </div>
                <p style={{ margin: 0, fontSize: 13.5, color: '#4b5563', lineHeight: 1.6 }}>
                  {profile.description}
                </p>
              </div>

              {/* Tone */}
              <div>
                <h4 style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Tone
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {profile.tone_keywords.map((t, i) => (
                    <span
                      key={i}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 6,
                        background: '#eef2e9',
                        color: '#4F6F3D',
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Signature Patterns */}
              <div>
                <h4 style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Signature Patterns
                </h4>
                <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {profile.signature_patterns.map((p, i) => (
                    <li key={i} style={{ fontSize: 13, color: '#374151', lineHeight: 1.5 }}>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Structure & Vocabulary */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ background: '#f9fafb', borderRadius: 8, padding: '10px 14px' }}>
                  <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600 }}>Vocabulary</span>
                  <p style={{ margin: '4px 0 0', fontSize: 13, fontWeight: 600, color: '#1f2937' }}>
                    {profile.vocabulary_level}
                  </p>
                </div>
                <div style={{ background: '#f9fafb', borderRadius: 8, padding: '10px 14px' }}>
                  <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600 }}>Perspective</span>
                  <p style={{ margin: '4px 0 0', fontSize: 13, fontWeight: 600, color: '#1f2937' }}>
                    {profile.perspective}
                  </p>
                </div>
              </div>

              {/* Rhythm */}
              <div style={{ background: '#f9fafb', borderRadius: 8, padding: '10px 14px' }}>
                <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600 }}>Rhythm & Pacing</span>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#374151', lineHeight: 1.5 }}>
                  {profile.rhythm}
                </p>
              </div>
            </div>
          )}

          {/* Saved state */}
          {saved && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px 20px',
                gap: 12,
                textAlign: 'center',
              }}
            >
              <CheckCircle size={40} color="#4F6F3D" />
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#141516' }}>
                Voice Profile Saved
              </h3>
              <p style={{ margin: 0, fontSize: 13.5, color: '#6b7280', maxWidth: 300 }}>
                Your writing voice &ldquo;{profile?.name}&rdquo; has been captured. The AI will use this to match your style in future generations.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 10,
            padding: '16px 24px',
            borderTop: '1px solid #e5e7eb',
          }}
        >
          {!profile && !saved && (
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || samples.every((s) => s.trim().length === 0)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                height: 38,
                padding: '0 20px',
                borderRadius: 10,
                border: 'none',
                background: '#4F6F3D',
                color: '#fff',
                fontSize: 13.5,
                fontWeight: 600,
                cursor: isAnalyzing ? 'not-allowed' : 'pointer',
                opacity: isAnalyzing || samples.every((s) => s.trim().length === 0) ? 0.5 : 1,
              }}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                  Analyzing…
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  Analyze My Voice
                </>
              )}
            </button>
          )}

          {profile && !saved && (
            <>
              <button
                onClick={() => {
                  setProfile(null)
                  setError(null)
                }}
                style={{
                  height: 38,
                  padding: '0 16px',
                  borderRadius: 10,
                  border: '1px solid #e5e7eb',
                  background: '#fff',
                  color: '#6b7280',
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                Re-analyze
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  height: 38,
                  padding: '0 20px',
                  borderRadius: 10,
                  border: 'none',
                  background: '#4F6F3D',
                  color: '#fff',
                  fontSize: 13.5,
                  fontWeight: 600,
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  opacity: isSaving ? 0.5 : 1,
                }}
              >
                {isSaving ? (
                  <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                ) : (
                  <CheckCircle size={14} />
                )}
                Save Voice Profile
              </button>
            </>
          )}

          {saved && (
            <button
              onClick={onClose}
              style={{
                height: 38,
                padding: '0 20px',
                borderRadius: 10,
                border: 'none',
                background: '#4F6F3D',
                color: '#fff',
                fontSize: 13.5,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Done
            </button>
          )}
        </div>

        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    </div>
  )
}
