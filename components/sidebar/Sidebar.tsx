'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Search, ChevronDown, ChevronRight, Settings, BookOpen, Calendar, LogOut, Pin, Star } from 'lucide-react'
import { signOut } from '@/lib/actions/auth'

type Space = { id: string; name: string; sortOrder: number }
type Board = { id: string; name: string; icon: string | null; isPinned: boolean; sortOrder: number; spaceId: string | null }
type Profile = { displayName: string | null; avatarUrl: string | null } | null
type Subscription = { status: string; trialEndsAt: Date | null } | null

export function Sidebar({ spaces, boards, profile, subscription, aiUsageCount }: {
  spaces: Space[]; boards: Board[]; profile: Profile; subscription: Subscription; aiUsageCount: number; userId: string
}) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')

  const pinned = boards.filter(b => b.isPinned)
  const isTrialing = subscription?.status === 'trialing'
  const daysLeft = subscription?.trialEndsAt ? Math.max(0, Math.ceil((new Date(subscription.trialEndsAt).getTime() - Date.now()) / 86400000)) : 0

  const nav = (active: boolean): React.CSSProperties => ({ display: 'flex', alignItems: 'center', gap: 9, padding: '7px 12px', borderRadius: 9, fontSize: 13.5, fontWeight: active ? 600 : 400, color: active ? '#141516' : '#4F5963', background: active ? '#f0ede8' : 'transparent', cursor: 'pointer', textDecoration: 'none', width: '100%', border: 'none', textAlign: 'left' })

  function toggle(id: string) { setCollapsed(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n }) }

  return (
    <aside style={{ width: 228, flexShrink: 0, height: '100vh', display: 'flex', flexDirection: 'column', borderRight: '1px solid #ede8e1', background: '#faf7f2', overflow: 'hidden' }}>
      <div style={{ padding: '16px 16px 8px', borderBottom: '1px solid #ede8e1' }}>
        <Link href="/app"><Image src="/logo.png" alt="Sartiarum" width={110} height={24} style={{ objectFit: 'contain' }} priority /></Link>
      </div>
      <div style={{ padding: '10px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#ede8e1', borderRadius: 9, padding: '6px 10px' }}>
          <Search size={13} color="#9AA4A0" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search" style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: 13, color: '#141516', fontFamily: 'Inter, sans-serif' }} />
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 8px' }}>
        {pinned.length > 0 && (
          <div style={{ marginBottom: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', marginBottom: 2 }}>
              <Pin size={11} color="#9AA4A0" />
              <span style={{ fontSize: 11, fontWeight: 600, color: '#9AA4A0', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Pinned</span>
            </div>
            {pinned.map(b => <Link key={b.id} href={`/app?board=${b.id}`} style={nav(pathname.includes(`board=${b.id}`))}><span style={{ fontSize: 14 }}>{b.icon ?? '📝'}</span><span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.name}</span><Star size={11} color="#4F6F3D" fill="#4F6F3D" /></Link>)}
          </div>
        )}
        {spaces.map(s => {
          const sb = boards.filter(b => b.spaceId === s.id)
          const isCol = collapsed.has(s.id)
          return (
            <div key={s.id} style={{ marginBottom: 2 }}>
              <button onClick={() => toggle(s.id)} style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', border: 'none', background: 'none', cursor: 'pointer', padding: '4px 12px', borderRadius: 8 }}>
                {isCol ? <ChevronRight size={12} color="#9AA4A0" /> : <ChevronDown size={12} color="#9AA4A0" />}
                <span style={{ fontSize: 12, fontWeight: 600, color: '#4F5963', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</span>
              </button>
              {!isCol && sb.map(b => <Link key={b.id} href={`/app?board=${b.id}`} style={{ ...nav(pathname.includes(`board=${b.id}`)), paddingLeft: 28, fontSize: 13 }}><span style={{ fontSize: 13 }}>{b.icon ?? '📝'}</span><span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.name}</span></Link>)}
            </div>
          )
        })}
        <div style={{ height: 1, background: '#ede8e1', margin: '10px 8px' }} />
        <Link href="/app/learn" style={{ ...nav(false), opacity: 0.5, pointerEvents: 'none', marginBottom: 2 }} aria-disabled><BookOpen size={15} />Learn<span style={{ marginLeft: 'auto', fontSize: 10, background: '#eef2e9', color: '#4F6F3D', borderRadius: 20, padding: '1px 7px', fontWeight: 600 }}>Soon</span></Link>
        <Link href="/app/plan" style={{ ...nav(false), opacity: 0.5, pointerEvents: 'none', marginBottom: 2 }} aria-disabled><Calendar size={15} />Plan<span style={{ marginLeft: 'auto', fontSize: 10, background: '#eef2e9', color: '#4F6F3D', borderRadius: 20, padding: '1px 7px', fontWeight: 600 }}>Soon</span></Link>
        <Link href="/app/settings/profile" style={{ ...nav(pathname.startsWith('/app/settings')), marginBottom: 2 }}><Settings size={15} />Settings</Link>
      </div>
      <div style={{ borderTop: '1px solid #ede8e1', padding: '12px 12px' }}>
        {isTrialing && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}><span style={{ fontSize: 11.5, fontWeight: 500, color: '#4F5963' }}>{aiUsageCount} AI actions used</span><span style={{ fontSize: 11.5, color: '#9AA4A0' }}>{daysLeft}d left</span></div>
            <div style={{ height: 4, background: '#ede8e1', borderRadius: 99 }}><div style={{ height: '100%', background: '#4F6F3D', borderRadius: 99, width: `${Math.min(100, (aiUsageCount / 50) * 100)}%` }} /></div>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#4F6F3D', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{(profile?.displayName ?? 'U')[0].toUpperCase()}</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 12.5, fontWeight: 600, color: '#141516', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>{profile?.displayName ?? 'Writer'}</p>
            <p style={{ fontSize: 11, color: '#9AA4A0', margin: 0 }}>{isTrialing ? 'Free trial' : 'Pro'}</p>
          </div>
          <button onClick={async () => { await signOut() }} title="Sign out" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9AA4A0', display: 'flex', alignItems: 'center', padding: 4, borderRadius: 6 }}><LogOut size={14} /></button>
        </div>
      </div>
    </aside>
  )
}
