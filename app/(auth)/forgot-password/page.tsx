'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { sendPasswordReset } from '@/lib/actions/auth'
import { ArrowLeft } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const result = await sendPasswordReset(email)
      if (result?.error) { setError(result.error); return }
      setSent(true)
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: '#F9F6EE', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 380, background: '#fff', borderRadius: 20, boxShadow: '0 8px 48px rgba(0,0,0,0.10)', padding: '36px 32px' }}>
        <div className="flex justify-center mb-5"><Image src="/logo.png" alt="Sartiarum" width={30} height={30} style={{ objectFit: 'contain' }} /></div>
        {sent ? (
          <>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#141516', textAlign: 'center', marginBottom: 12 }}>Check your inbox</h1>
            <p style={{ fontSize: 14, color: '#4F5963', textAlign: 'center', lineHeight: 1.6 }}>We sent a reset link to <strong>{email}</strong>. Follow the link to reset your password.</p>
            <Link href="/login" className="flex items-center justify-center gap-2" style={{ marginTop: 24, fontSize: 14, fontWeight: 600, color: '#4F6F3D', textDecoration: 'none' }}><ArrowLeft size={15} /> Back to login</Link>
          </>
        ) : (
          <>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#141516', textAlign: 'center', marginBottom: 8 }}>Reset your password</h1>
            <p style={{ fontSize: 14, color: '#4F5963', textAlign: 'center', lineHeight: 1.55, marginBottom: 24 }}>Enter your email and we&apos;ll send you a reset link.</p>
            <form onSubmit={handleSubmit}>
              {error && <div style={{ fontSize: 13, color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px', marginBottom: 14 }}>{error}</div>}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#4F5963', marginBottom: 6 }}>Email</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email" style={{ width: '100%', height: 44, borderRadius: 12, border: '1.5px solid #e1dbd2', padding: '0 16px', fontSize: 14, color: '#141516', outline: 'none', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif' }} onFocus={e => { e.currentTarget.style.borderColor = '#4F6F3D' }} onBlur={e => { e.currentTarget.style.borderColor = '#e1dbd2' }} />
              </div>
              <button type="submit" disabled={loading} style={{ width: '100%', height: 44, borderRadius: 12, background: '#4F6F3D', color: '#fff', fontSize: 15, fontWeight: 600, border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(79,111,61,0.25)', fontFamily: 'Inter, sans-serif' }}>{loading ? 'Sending…' : 'Send reset link'}</button>
            </form>
            <Link href="/login" className="flex items-center justify-center gap-2" style={{ marginTop: 20, fontSize: 14, color: '#4F5963', textDecoration: 'none' }}><ArrowLeft size={15} /> Back to login</Link>
          </>
        )}
      </div>
    </div>
  )
}
