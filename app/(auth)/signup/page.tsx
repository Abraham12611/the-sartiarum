'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff } from 'lucide-react'

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  )
}

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    setError(null)
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      })
      if (error) { setError(error.message); return }
      router.push('/app')
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleSignup() {
    setGoogleLoading(true)
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden" style={{ background: '#F9F6EE', fontFamily: 'Inter, sans-serif' }}>
      {/* Right-side decorative component */}
      <Image
        src="/signup-component.png"
        alt=""
        width={980}
        height={1080}
        priority
        className="hidden lg:block"
        aria-hidden
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          height: '100%',
          width: '48%',
          objectFit: 'contain',
          objectPosition: 'right center',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Top nav */}
      <nav className="relative z-10 flex items-center justify-between px-10 py-5">
        <Link href="/" className="flex items-center">
          <Image src="/logo.png" alt="Sartiarum" width={130} height={28} style={{ objectFit: 'contain' }} priority />
        </Link>
        <div className="flex items-center gap-7" style={{ fontSize: 14, fontWeight: 500, color: '#4F5963' }}>
          <Link href="/pricing" className="hover:text-[#141516] transition-colors" style={{ color: '#4F5963', textDecoration: 'none' }}>Pricing</Link>
          <Link href="/" className="hover:text-[#141516] transition-colors" style={{ color: '#4F5963', textDecoration: 'none' }}>Back to home</Link>
          <span
            className="flex items-center gap-1.5 px-3 py-1 rounded-full"
            style={{ background: '#fff', border: '1px solid #e4ddd5', fontSize: 12, fontWeight: 600, color: '#4F6F3D' }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4F6F3D', display: 'inline-block' }} />
            Coming soon
          </span>
        </div>
      </nav>

      {/* Card */}
      <div className="relative z-10 flex flex-1 items-center justify-center px-6 pb-12">
        <div
          className="w-full"
          style={{
            maxWidth: 400,
            background: '#fff',
            borderRadius: 20,
            boxShadow: '0 8px 48px rgba(0,0,0,0.10)',
            padding: '32px 32px',
          }}
        >
          <div className="flex justify-center mb-4">
            <Image src="/logo.png" alt="" width={30} height={30} style={{ objectFit: 'contain' }} />
          </div>

          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#141516', textAlign: 'center', marginBottom: 6, letterSpacing: '-0.03em' }}>
            Create your account
          </h1>
          <p style={{ fontSize: 13.5, color: '#4F5963', textAlign: 'center', lineHeight: 1.55, marginBottom: 22 }}>
            Start writing, researching, and improving with Sartiarum.
          </p>

          {/* Google */}
          <button
            onClick={handleGoogleSignup}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 transition-colors"
            style={{
              height: 44,
              borderRadius: 12,
              border: '1.5px solid #e1dbd2',
              background: '#fff',
              fontSize: 14,
              fontWeight: 600,
              color: '#141516',
              cursor: 'pointer',
              marginBottom: 18,
              opacity: googleLoading ? 0.6 : 1,
            }}
          >
            <GoogleIcon />
            {googleLoading ? 'Redirecting…' : 'Continue with Google'}
          </button>

          <div className="flex items-center gap-3" style={{ marginBottom: 18 }}>
            <div style={{ flex: 1, height: 1, background: '#e8e2d9' }} />
            <span style={{ fontSize: 12, color: '#9AA4A0', fontWeight: 500 }}>or</span>
            <div style={{ flex: 1, height: 1, background: '#e8e2d9' }} />
          </div>

          <form onSubmit={handleSignup}>
            {error && (
              <div style={{ fontSize: 13, color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px', marginBottom: 12 }}>
                {error}
              </div>
            )}

            <div style={{ marginBottom: 10 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#4F5963', marginBottom: 5 }}>Full name</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Enter your full name"
                style={{ width: '100%', height: 44, borderRadius: 12, border: '1.5px solid #e1dbd2', padding: '0 16px', fontSize: 14, color: '#141516', outline: 'none', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif' }}
                onFocus={e => { e.currentTarget.style.borderColor = '#4F6F3D' }}
                onBlur={e => { e.currentTarget.style.borderColor = '#e1dbd2' }}
              />
            </div>

            <div style={{ marginBottom: 10 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#4F5963', marginBottom: 5 }}>Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email"
                style={{ width: '100%', height: 44, borderRadius: 12, border: '1.5px solid #e1dbd2', padding: '0 16px', fontSize: 14, color: '#141516', outline: 'none', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif' }}
                onFocus={e => { e.currentTarget.style.borderColor = '#4F6F3D' }}
                onBlur={e => { e.currentTarget.style.borderColor = '#e1dbd2' }}
              />
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#4F5963', marginBottom: 5 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Create a password"
                  style={{ width: '100%', height: 44, borderRadius: 12, border: '1.5px solid #e1dbd2', padding: '0 44px 0 16px', fontSize: 14, color: '#141516', outline: 'none', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif' }}
                  onFocus={e => { e.currentTarget.style.borderColor = '#4F6F3D' }}
                  onBlur={e => { e.currentTarget.style.borderColor = '#e1dbd2' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9AA4A0', display: 'flex', alignItems: 'center' }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', height: 44, borderRadius: 12, background: loading ? '#7a9e6a' : '#4F6F3D', color: '#fff', fontSize: 15, fontWeight: 600, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 14px rgba(79,111,61,0.28)', fontFamily: 'Inter, sans-serif' }}
            >
              {loading ? 'Creating account…' : 'Create account'}
            </button>

            <p style={{ fontSize: 12, color: '#9AA4A0', textAlign: 'center', marginTop: 12, lineHeight: 1.5 }}>
              By continuing, you agree to our{' '}
              <Link href="/terms" style={{ color: '#4F6F3D', textDecoration: 'none' }}>Terms</Link>
              {' '}and{' '}
              <Link href="/privacy" style={{ color: '#4F6F3D', textDecoration: 'none' }}>Privacy Policy</Link>.
            </p>
          </form>

          <div style={{ textAlign: 'center', marginTop: 14 }}>
            <span style={{ fontSize: 14, color: '#4F5963' }}>Already have an account? </span>
            <Link href="/login" style={{ fontSize: 14, fontWeight: 700, color: '#4F6F3D', textDecoration: 'none' }}>Log in</Link>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-center gap-6 pb-6" style={{ fontSize: 12, color: '#9AA4A0' }}>
        <span>🍎 Mac-first. Also coming to Web, Windows, and Linux.</span>
        <span>🔒 Your drafts stay yours.</span>
      </div>
    </div>
  )
}
