import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AISettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return (
    <div style={{ padding: '40px 48px', fontFamily: 'Inter, sans-serif' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#141516', marginBottom: 4 }}>AI preferences</h1>
      <p style={{ fontSize: 14, color: '#4F5963', marginBottom: 32 }}>Autocomplete, coaching defaults, and local AI toggles.</p>
      <div style={{ maxWidth: 480, background: '#fff', border: '1px solid #e4ddd5', borderRadius: 14, padding: '28px 28px' }}>
        <p style={{ fontSize: 13, color: '#9AA4A0' }}>AI preference controls ship in Phase 2 (Coaching &amp; Voice).</p>
      </div>
    </div>
  )
}
