'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import {
  CaretDown,
  CaretRight,
  Gear,
  GraduationCap,
  ListMagnifyingGlass,
  MagnifyingGlass,
  PushPinSimple,
  SignOut,
} from '@phosphor-icons/react'
import { signOut } from '@/lib/actions/auth'
import styles from './Sidebar.module.css'

type Space = { id: string; name: string; sortOrder: number }
type Board = {
  id: string
  name: string
  icon: string | null
  color: string | null
  isPinned: boolean
  sortOrder: number
  spaceId: string | null
}
type Profile = { displayName: string | null; avatarUrl: string | null } | null
type Subscription = { status: string; trialEndsAt: string | null } | null

interface SidebarProps {
  spaces: Space[]
  boards: Board[]
  profile: Profile
  subscription: Subscription
  aiUsageCount: number
}

export function Sidebar({ spaces, boards, profile, subscription, aiUsageCount }: SidebarProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [searchValue, setSearchValue] = useState('')
  const [collapsedSpaces, setCollapsedSpaces] = useState<Set<string>>(new Set())

  const activeBoardId = searchParams.get('board')
  const pinnedBoards = boards.filter((board) => board.isPinned)
  const boardMatchesSearch = (board: Board) =>
    board.name.toLowerCase().includes(searchValue.trim().toLowerCase())

  const filteredBoards = useMemo(() => {
    if (!searchValue.trim()) return boards
    return boards.filter(boardMatchesSearch)
  }, [boards, searchValue])

  const isTrialing = subscription?.status === 'trialing'
  const trialEndsAtMs = subscription?.trialEndsAt ? new Date(subscription.trialEndsAt).getTime() : null
  const trialDaysLeft = trialEndsAtMs
    ? Math.max(0, Math.ceil((trialEndsAtMs - Date.now()) / 86400000))
    : 0

  function toggleSpace(spaceId: string) {
    setCollapsedSpaces((prev) => {
      const next = new Set(prev)
      if (next.has(spaceId)) next.delete(spaceId)
      else next.add(spaceId)
      return next
    })
  }

  function getBoardsForSpace(spaceId: string) {
    return filteredBoards.filter((board) => board.spaceId === spaceId)
  }

  async function handleSignOut() {
    await signOut()
  }

  function createInitials(name: string | null | undefined) {
    if (!name?.trim()) return 'S'
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('')
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.headerArea}>
        <div className={styles.windowControls} aria-hidden>
          <span className={`${styles.dot} ${styles.dotRed}`} />
          <span className={`${styles.dot} ${styles.dotYellow}`} />
          <span className={`${styles.dot} ${styles.dotGreen}`} />
        </div>
        <Link href="/app" className={styles.logoLink}>
          <Image
            src="/wordmark-logo.png"
            alt="Sartiarum"
            width={168}
            height={42}
            className={styles.wordmark}
            priority
          />
        </Link>
      </div>

      <div className={styles.searchShell}>
        <MagnifyingGlass size={16} className={styles.searchIcon} weight="regular" />
        <input
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          placeholder="Search"
          className={styles.searchInput}
        />
        <kbd className={styles.searchKbd}>Ctrl+K</kbd>
      </div>

      <div className={styles.navScroll}>
        {pinnedBoards.length > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionLabel}>
              <PushPinSimple size={13} weight="light" />
              <span>Pinned</span>
            </div>
            <div className={styles.stack}>
              {pinnedBoards.filter(boardMatchesSearch).map((board) => (
                <Link
                  key={board.id}
                  href={`/app?board=${board.id}`}
                  className={`${styles.navItem} ${activeBoardId === board.id ? styles.navItemActive : ''}`}
                >
                  <span className={styles.navIcon}>{board.icon ?? 'D'}</span>
                  <span className={styles.navText}>{board.name}</span>
                  <PushPinSimple
                    size={14}
                    weight="fill"
                    className={`${styles.trailingIcon} ${styles.trailingAccent}`}
                  />
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className={styles.section}>
          <div className={styles.sectionLabel}>
            <ListMagnifyingGlass size={13} weight="light" />
            <span>Spaces</span>
          </div>

          <div className={styles.stack}>
            {spaces.map((space) => {
              const isCollapsed = collapsedSpaces.has(space.id)
              const spaceBoards = getBoardsForSpace(space.id)
              const hasActiveBoard = spaceBoards.some((board) => board.id === activeBoardId)
              return (
                <div key={space.id} className={styles.spaceGroup}>
                  <button
                    type="button"
                    onClick={() => toggleSpace(space.id)}
                    className={styles.spaceButton}
                  >
                    {isCollapsed ? (
                      <CaretRight size={12} weight="bold" />
                    ) : (
                      <CaretDown size={12} weight="bold" />
                    )}
                    <span className={styles.spaceName}>{space.name}</span>
                    {hasActiveBoard && <span className={styles.activeDot} />}
                  </button>
                  {!isCollapsed && (
                    <div className={styles.stack}>
                      {spaceBoards.map((board) => (
                        <Link
                          key={board.id}
                          href={`/app?board=${board.id}`}
                          className={`${styles.navItem} ${styles.nestedItem} ${activeBoardId === board.id ? styles.navItemActive : ''}`}
                        >
                          <span className={styles.navIcon}>{board.icon ?? 'B'}</span>
                          <span className={styles.navText}>{board.name}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        <div className={styles.divider} />

        <div className={styles.stack}>
          <Link href="/app/learn" className={styles.navItem}>
            <GraduationCap size={16} weight="regular" />
            <span className={styles.navText}>Learn</span>
            <span className={styles.soonBadge}>Soon</span>
          </Link>
          <Link href="/app/plan" className={styles.navItem}>
            <ListMagnifyingGlass size={16} weight="regular" />
            <span className={styles.navText}>Plan</span>
            <span className={styles.soonBadge}>Soon</span>
          </Link>
          <Link
            href="/app/settings/profile"
            className={`${styles.navItem} ${pathname.startsWith('/app/settings') ? styles.navItemActive : ''}`}
          >
            <Gear size={16} weight="regular" />
            <span className={styles.navText}>Settings</span>
          </Link>
        </div>
      </div>

      <div className={styles.accountArea}>
        <div className={styles.planCard}>
          <div className={styles.planTopRow}>
            <div className={styles.avatar}>{createInitials(profile?.displayName)}</div>
            <div className={styles.planText}>
              <p className={styles.planTitle}>{profile?.displayName ?? 'Creator plan'}</p>
              <p className={styles.planSubtitle}>{isTrialing ? 'Creator plan' : 'Pro plan'}</p>
            </div>
            <button
              type="button"
              title="Sign out"
              onClick={handleSignOut}
              className={styles.iconButton}
            >
              <SignOut size={16} weight="regular" />
            </button>
          </div>

          <div className={styles.storageMeta}>
            <span>{aiUsageCount} AI actions used</span>
            <span>{trialDaysLeft}d left</span>
          </div>
          <div className={styles.progressTrack}>
            <div
              className={styles.progressValue}
              style={{ width: `${Math.min(100, (aiUsageCount / 50) * 100)}%` }}
            />
          </div>
        </div>
      </div>
    </aside>
  )
}
