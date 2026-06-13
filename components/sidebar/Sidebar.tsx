'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import {
  Search, Plus, ChevronDown, ChevronRight, Settings,
  BookOpen, Calendar, LogOut, Star, Pin,
} from 'lucide-react'
import { signOut } from '@/lib/actions/auth'

type Space = { id: string; name: string; sortOrder: number }
type Board = { id: string; name: string; icon: string | null; color: string | null; isPinned: boolean; sortOrder: number; spaceId: string | null }
type Profile = { displayName: string | null; avatarUrl: string | null } | null
type Subscription = { status: string; trialEndsAt: string | null } | null

interface SidebarProps {
  spaces: Space[]
  boards: Board[]
  profile: Profile
  subscription: Subscription
  aiUsageCount: number
  userId: string
}

const BOARD_COLORS: Record<string, string> = {
  blue: '#3b82f6', green: '#4F6F3D', purple: '#8b5cf6',
  orange: '#f97316', red: '#ef4444', yellow: '#eab308',
}

export function Sidebar({ spaces, boards, profile, subscription, aiUsageCount }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsedSpaces, setCollapsedSpaces] = useState<Set<string>>(new Set())
  const [searchValue, setSearchValue] = useState('')

  const pinnedBoards = boards.filter(b => b.isPinned)
  const isTrialing = subscription?.status === 'trialing'
  const trialEndsAtMs = subscription?.trialEndsAt ? new Date(subscription.trialEndsAt).getTime() : null
  const trialDaysLeft = trialEndsAtMs
    ? Math.max(0, Math.ceil((trialEndsAtMs - Date.now()) / 86400000))
    : 0

  function toggleSpace(id: string) {
    setCollapsedSpaces(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function getBoardsForSpace(spaceId: string) {
    return boards.filter(b => b.spaceId === spaceId)
  }

  const navItemStyle = (active: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: 9,
    padding: '7px 12px',
    borderRadius: 9,
    fontSize: 13.5,
    fontWeight: active ? 600 : 400,
    color: active ? '#141516' : '#4F5963',
    background: active ? '#f0ede8' : 'transparent',
    cursor: 'pointer',
    textDecoration: 'none',
    width: '100%',
    border: 'none',
    textAlign: 'left',
    transition: 'background 0.12s',
  })

  async function handleSignOut() {
    await signOut()
  }

  return (
    <aside
      style={{
        width: 228,
        flexShrink: 0,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid #ede8e1',
        background: '#faf7f2',
        overflow: 'hidden',
      }}
    >
      {/* Logo */}
      <div style={{ padding: '16px 16px 8px', borderBottom: '1px solid #ede8e1' }}>
        <Link href="/app" style={{ display: 'flex', alignItems: 'center' }}>
          <Image src="/logo.png" alt="Sartiarum" width={110} height={24} style={{ objectFit: 'contain' }} priority />
        </Link>
      </div>

      {/* Search */}
      <div style={{ padding: '10px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#ede8e1', borderRadius: 9, padding: '6px 10px' }}>
          <Search size={13} color="#9AA4A0" />
          <input
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            placeholder="Search"
            style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: 13, color: '#141516', fontFamily: 'Inter, sans-serif' }}
          />
        </div>
      </div>

      {/* Scrollable nav */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 8px' }}>
        {/* Pinned boards */}
        {pinnedBoards.length > 0 && (
          <div style={{ marginBottom: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', marginBottom: 2 }}>
              <Pin size={11} color="#9AA4A0" />
              <span style={{ fontSize: 11, fontWeight: 600, color: '#9AA4A0', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Pinned</span>
            </div>
            {pinnedBoards.map(board => {
              const isActive = pathname.includes(`board=${board.id}`)
              return (
                <Link
                  key={board.id}
                  href={`/app?board=${board.id}`}
                  style={navItemStyle(isActive)}
                >
                  <span style={{ fontSize: 14 }}>{board.icon ?? '📝'}</span>
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{board.name}</span>
                  {board.isPinned && <Star size={11} color="#4F6F3D" fill="#4F6F3D" />}
                </Link>
              )
            })}
          </div>
        )}

        {/* Spaces & boards */}
        {spaces.map(space => {
          const spaceBoards = getBoardsForSpace(space.id)
          const isCollapsed = collapsedSpaces.has(space.id)
          return (
            <div key={space.id} style={{ marginBottom: 2 }}>
              <button
                onClick={() => toggleSpace(space.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', border: 'none', background: 'none', cursor: 'pointer', padding: '4px 12px', borderRadius: 8, textAlign: 'left' }}
              >
                {isCollapsed ? <ChevronRight size={12} color="#9AA4A0" /> : <ChevronDown size={12} color="#9AA4A0" />}
                <span style={{ fontSize: 12, fontWeight: 600, color: '#4F5963', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{space.name}</span>
              </button>
              {!isCollapsed && spaceBoards.map(board => {
                const isActive = pathname.includes(`board=${board.id}`)
                return (
                  <Link
                    key={board.id}
                    href={`/app?board=${board.id}`}
                    style={{ ...navItemStyle(isActive), paddingLeft: 28, fontSize: 13 }}
                  >
                    <span style={{ fontSize: 13 }}>{board.icon ?? '📝'}</span>
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{board.name}</span>
                  </Link>
                )
              })}
            </div>
          )
        })}

        {/* Divider */}
        <div style={{ height: 1, background: '#ede8e1', margin: '10px 8px' }} />

        {/* Primary nav */}
        <Link
          href="/app/learn"
          style={{ ...navItemStyle(false), opacity: 0.5, pointerEvents: 'none', marginBottom: 2 }}
          aria-disabled
        >
          <BookOpen size={15} />
          Learn
          <span style={{ marginLeft: 'auto', fontSize: 10, background: '#eef2e9', color: '#4F6F3D', borderRadius: 20, padding: '1px 7px', fontWeight: 600 }}>Soon</span>
        </Link>
        <Link
          href="/app/plan"
          style={{ ...navItemStyle(false), opacity: 0.5, pointerEvents: 'none', marginBottom: 2 }}
          aria-disabled
        >
          <Calendar size={15} />
          Plan
          <span style={{ marginLeft: 'auto', fontSize: 10, background: '#eef2e9', color: '#4F6F3D', borderRadius: 20, padding: '1px 7px', fontWeight: 600 }}>Soon</span>
        </Link>
        <Link href="/app/settings/profile" style={{ ...navItemStyle(pathname.startsWith('/app/settings')), marginBottom: 2 }}>
          <Settings size={15} />
          Settings
        </Link>
      </div>

      {/* Account + usage */}
      <div style={{ borderTop: '1px solid #ede8e1', padding: '12px 12px' }}>
        {/* Trial usage bar */}
        {isTrialing && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ fontSize: 11.5, fontWeight: 500, color: '#4F5963' }}>{aiUsageCount} AI actions used</span>
              <span style={{ fontSize: 11.5, color: '#9AA4A0' }}>{trialDaysLeft}d left</span>
            </div>
            <div style={{ height: 4, background: '#ede8e1', borderRadius: 99 }}>
              <div style={{ height: '100%', background: '#4F6F3D', borderRadius: 99, width: `${Math.min(100, (aiUsageCount / 50) * 100)}%`, transition: 'width 0.3s' }} />
            </div>
          </div>
        )}

        {/* User */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#4F6F3D', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>
              {(profile?.displayName ?? 'U')[0].toUpperCase()}
            </span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 12.5, fontWeight: 600, color: '#141516', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>
              {profile?.displayName ?? 'Writer'}
            </p>
            <p style={{ fontSize: 11, color: '#9AA4A0', margin: 0 }}>{isTrialing ? 'Free trial' : 'Pro'}</p>
          </div>
          <button
            onClick={handleSignOut}
            title="Sign out"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9AA4A0', display: 'flex', alignItems: 'center', padding: 4, borderRadius: 6 }}
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  )
}
