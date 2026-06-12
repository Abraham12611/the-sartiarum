import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { subscriptions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export default async function BillingSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [sub] = await db.select().from(subscriptions).where(eq(subscriptions.ownerId, user.id)).limit(1)
  const trialEnds = sub?.trialEndsAt ? new Date(sub.trialEndsAt) : null
  const isTrialing = sub?.status === 'trialing' && trialEnds && trialEnds > new Date()
  const daysLeft = trialEnds ? Math.max(0, Math.ceil((trialEnds.getTime() - Date.now()) / 86400000)) : 0

  return (
    <div style={{ padding: '40px 48px', fontFamily: 'Inter, sans-serif' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#141516', marginBottom: 4 }}>Billing</h1>
      <p style={{ fontSize: 14, color: '#4F5963', marginBottom: 32 }}>Manage your plan and subscription.</p>
      <div style={{ maxWidth: 480, background: '#fff', border: '1px solid #e4ddd5', borderRadius: 14, padding: '28px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div><p style={{ fontSize: 15, fontWeight: 700, color: '#141516', marginBottom: 2 }}>{isTrialing ? 'Free Trial' : sub?.status === 'active' ? 'Pro' : 'Inactive'}</p>{isTrialing && <p style={{ fontSize: 13, color: '#4F5963' }}>{daysLeft} days remaining</p>}</div>
          <span style={{ fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 20, background: isTrialing ? '#eef2e9' : '#f0f0f0', color: isTrialing ? '#4F6F3D' : '#4F5963' }}>{sub?.status ?? 'unknown'}</span>
        </div>
        <p style={{ fontSize: 13, color: '#9AA4A0' }}>Stripe billing integration ships in Day 5.</p>
      </div>
    </div>
  )
}
