import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ProfileSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return (
    <div style={{ padding: '40px 48px', fontFamily: 'Inter, sans-serif' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#141516', marginBottom: 4 }}>Profile</h1>
      <p style={{ fontSize: 14, color: '#4F5963', marginBottom: 32 }}>Manage your display name and avatar.</p>
      <div style={{ maxWidth: 480, background: '#fff', border: '1px solid #e4ddd5', borderRadius: 14, padding: '28px 28px' }}>
        <div style={{ marginBottom: 20 }}><label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4F5963', marginBottom: 6 }}>Email</label><p style={{ fontSize: 14, color: '#141516' }}>{user.email}</p></div>
        <p style={{ fontSize: 13, color: '#9AA4A0' }}>Profile editing coming in the next update.</p>
      </div>
    </div>
  )
}
