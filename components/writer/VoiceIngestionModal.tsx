'use client'

import { useState } from 'react'
import { X, Plus, Trash2, Loader2, Sparkles, CheckCircle, Link2, Globe } from 'lucide-react'

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
  const [inputMode, setInputMode] = useState<'paste' | 'url'>('paste')
  const [samples, setSamples] = useState<string[]>([''])
  const [urls, setUrls] = useState<string[]>([''])
  const [isScraping, setIsScraping] = useState(false)
  const [scrapedArticles, setScrapedArticles] = useState<{ url: string; title?: string; status: 'ok' | 'error'; preview?: string }[]>([])
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

  function addUrl() {
    setUrls((prev) => [...prev, ''])
  }

  function removeUrl(index: number) {
    setUrls((prev) => prev.filter((_, i) => i !== index))
  }

  function updateUrl(index: number, value: string) {
    setUrls((prev) => prev.map((s, i) => (i === index ? value : s)))
  }

  async function handleScrapeAndAnalyze() {
    const validUrls = urls.filter((u) => u.trim().length > 0)
    if (validUrls.length === 0) {
      setError('Add at least one URL')
      return
    }

    setIsScraping(true)
    setError(null)
    setScrapedArticles([])

    try {
      const res = await fetch('/api/ai/voice/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: validUrls }),
      })
      if (!res.ok) throw new Error(await res.text())

      const data = await res.json()
      const results = data.results as { url: string; content: string; title?: string; error?: string }[]

      const articles = results.map((r) => ({
        url: r.url,
        title: r.title,
        status: (r.error ? 'error' : 'ok') as 'ok' | 'error',
        preview: r.error || r.content?.slice(0, 150) + '...',
      }))
      setScrapedArticles(articles)

      // Collect successfully scraped content
      const scrapedSamples = results.filter((r) => !r.error && r.content).map((r) => r.content)
      if (scrapedSamples.length === 0) {
        setError('Could not extract content from any of the provided URLs')
        setIsScraping(false)
        return
      }

      setIsScraping(false)
      setIsAnalyzing(true)

      // Now analyze the scraped content
      const analyzeRes = await fetch('/api/ai/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ samples: scrapedSamples }),
      })
      if (!analyzeRes.ok) throw new Error(await analyzeRes.text())

      const reader = analyzeRes.body?.getReader()
      if (!reader) throw new Error('No stream')

      let fullText = ''
      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        fullText += decoder.decode(value, { stream: true })
      }

      let cleaned = fullText.trim()
      if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```[\w]*\n?/, '').replace(/\n?```$/, '').trim()
      }
      const parsed = JSON.parse(cleaned) as VoiceProfile
      setProfile(parsed)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Scrape/analysis failed')
    } finally {
      setIsScraping(false)
      setIsAnalyzing(false)
    }
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
              Paste text or import from URLs — the AI will extract your unique voice fingerprint.
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
              {/* Input mode tabs */}
              <div style={{ display: 'flex', gap: 2, background: '#f0ede8', borderRadius: 8, padding: 2, marginBottom: 16 }}>
                <button
                  onClick={() => setInputMode('paste')}
                  style={{
                    flex: 1, height: 32, borderRadius: 6, border: 'none',
                    background: inputMode === 'paste' ? '#fff' : 'transparent',
                    fontSize: 12.5, fontWeight: 600,
                    color: inputMode === 'paste' ? '#141516' : '#9ca3af',
                    cursor: 'pointer',
                    boxShadow: inputMode === 'paste' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}
                >
                  <Sparkles size={13} /> Paste Text
                </button>
                <button
                  onClick={() => setInputMode('url')}
                  style={{
                    flex: 1, height: 32, borderRadius: 6, border: 'none',
                    background: inputMode === 'url' ? '#fff' : 'transparent',
                    fontSize: 12.5, fontWeight: 600,
                    color: inputMode === 'url' ? '#141516' : '#9ca3af',
                    cursor: 'pointer',
                    boxShadow: inputMode === 'url' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}
                >
                  <Globe size={13} /> Import from URL
                </button>
              </div>

              {/* Paste text inputs */}
              {inputMode === 'paste' && (
                <>
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
                </>
              )}

              {/* URL import inputs */}
              {inputMode === 'url' && (
                <>
                  <p style={{ margin: '0 0 12px', fontSize: 12.5, color: '#6b7280', lineHeight: 1.5 }}>
                    Enter links to your published blog posts, articles, or essays. We will extract the content and analyze your writing style.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {urls.map((url, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, border: '1px solid #e5e7eb', borderRadius: 10, padding: '0 12px', background: '#fff' }}>
                          <Link2 size={14} color="#9ca3af" style={{ flexShrink: 0 }} />
                          <input
                            value={url}
                            onChange={(e) => updateUrl(i, e.target.value)}
                            placeholder="https://yourblog.com/my-article"
                            style={{
                              flex: 1, border: 'none', outline: 'none',
                              height: 40, fontSize: 13, fontFamily: 'inherit',
                              background: 'transparent',
                            }}
                          />
                        </div>
                        {urls.length > 1 && (
                          <button
                            onClick={() => removeUrl(i)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 4 }}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={addUrl}
                    disabled={urls.length >= 5}
                    style={{
                      marginTop: 10,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '8px 14px',
                      borderRadius: 8,
                      border: '1px dashed #d1d5db',
                      background: 'transparent',
                      color: urls.length >= 5 ? '#d1d5db' : '#6b7280',
                      fontSize: 12.5,
                      cursor: urls.length >= 5 ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <Plus size={14} />
                    Add another URL {urls.length >= 5 && '(max 5)'}
                  </button>

                  {/* Scraped article previews */}
                  {scrapedArticles.length > 0 && (
                    <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Extracted Content</span>
                      {scrapedArticles.map((a, i) => (
                        <div
                          key={i}
                          style={{
                            padding: '10px 12px',
                            borderRadius: 8,
                            border: `1px solid ${a.status === 'ok' ? '#d4e0cc' : '#f3d3cd'}`,
                            background: a.status === 'ok' ? '#f5f8f2' : '#fff5f3',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                            {a.status === 'ok' ? <CheckCircle size={12} color="#4F6F3D" /> : <X size={12} color="#dc2626" />}
                            <span style={{ fontSize: 12, fontWeight: 600, color: a.status === 'ok' ? '#1f2937' : '#dc2626' }}>
                              {a.title || a.url}
                            </span>
                          </div>
                          <p style={{ margin: 0, fontSize: 11.5, color: '#6b7280', lineHeight: 1.4 }}>
                            {a.preview}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

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
          {!profile && !saved && inputMode === 'paste' && (
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

          {!profile && !saved && inputMode === 'url' && (
            <button
              onClick={handleScrapeAndAnalyze}
              disabled={isScraping || isAnalyzing || urls.every((u) => u.trim().length === 0)}
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
                cursor: (isScraping || isAnalyzing) ? 'not-allowed' : 'pointer',
                opacity: (isScraping || isAnalyzing || urls.every((u) => u.trim().length === 0)) ? 0.5 : 1,
              }}
            >
              {isScraping ? (
                <>
                  <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                  Extracting articles…
                </>
              ) : isAnalyzing ? (
                <>
                  <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                  Analyzing voice…
                </>
              ) : (
                <>
                  <Globe size={14} />
                  Import &amp; Analyze
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
