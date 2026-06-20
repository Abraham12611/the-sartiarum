'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useMemo, useState, useTransition } from 'react'
import {
  BookOpenText,
  CalendarBlank,
  CaretDown,
  CaretRight,
  FileText,
  Folders,
  Gear,
  GraduationCap,
  Lightbulb,
  ListBullets,
  MagnifyingGlass,
  Note,
  PushPin,
  PushPinSimple,
  SignOut,
} from '@phosphor-icons/react'
import { signOut } from '@/lib/actions/auth'
import { createBoard } from '@/lib/actions/boards'
import { createDocument } from '@/lib/actions/documents'
import { createSpace } from '@/lib/actions/spaces'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

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

interface DashboardSidebar2Props {
  spaces: Space[]
  boards: Board[]
  profile: Profile
  subscription: Subscription
  aiUsageCount: number
}

const NAV_ITEMS = [
  { href: '/app/learn', label: 'Learn', icon: GraduationCap },
  { href: '/app/plan', label: 'Plan', icon: CalendarBlank },
  { href: '/app/settings/profile', label: 'Settings', icon: Gear },
]

export function DashboardSidebar2({
  spaces,
  boards,
  profile,
  subscription,
  aiUsageCount,
}: DashboardSidebar2Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [searchValue, setSearchValue] = useState('')
  const [searchModalOpen, setSearchModalOpen] = useState(false)
  const [createBoardOpen, setCreateBoardOpen] = useState(false)
  const [createSpaceOpen, setCreateSpaceOpen] = useState(false)
  const [newBoardName, setNewBoardName] = useState('')
  const [newSpaceName, setNewSpaceName] = useState('')
  const [collapsedSpaces, setCollapsedSpaces] = useState<Set<string>>(new Set())
  const [isPending, startTransition] = useTransition()

  const filteredBoards = useMemo(() => {
    if (!searchValue.trim()) return boards
    const q = searchValue.trim().toLowerCase()
    return boards.filter((board) => board.name.toLowerCase().includes(q))
  }, [boards, searchValue])

  const pinnedBoards = filteredBoards.filter((board) => board.isPinned)

  const modalBoards = useMemo(() => {
    if (!searchValue.trim()) return boards
    const q = searchValue.trim().toLowerCase()
    return boards.filter((board) => board.name.toLowerCase().includes(q))
  }, [boards, searchValue])

  const isTrialing = subscription?.status === 'trialing'
  const trialEndsAtMs = subscription?.trialEndsAt ? new Date(subscription.trialEndsAt).getTime() : null
  const trialDaysLeft = trialEndsAtMs
    ? Math.max(0, Math.ceil((trialEndsAtMs - Date.now()) / 86400000))
    : 0

  function getBoardsForSpace(spaceId: string) {
    return filteredBoards.filter((board) => board.spaceId === spaceId)
  }

  function createInitials(name: string | null | undefined) {
    if (!name?.trim()) return 'IH'
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('')
  }

  function iconForBoard(boardName: string) {
    const value = boardName.toLowerCase()
    if (value.includes('draft')) return <FileText size={16} />
    if (value.includes('research')) return <BookOpenText size={16} />
    if (value.includes('blog') || value.includes('pipeline') || value.includes('script'))
      return <ListBullets size={16} />
    if (value.includes('note')) return <Note size={16} />
    if (value.includes('idea')) return <Lightbulb size={16} />
    return <FileText size={16} />
  }

  async function handleSignOut() {
    await signOut()
  }

  function resolveTargetBoard() {
    return boards.find((board) => board.isPinned) ?? boards[0]
  }

  function handleCreateDocumentFromSidebar() {
    const targetBoard = resolveTargetBoard()
    if (!targetBoard) return
    startTransition(async () => {
      const doc = await createDocument(targetBoard.id)
      router.push(`/app/doc/${doc.id}`)
    })
  }

  function handleCreateBoardFromSidebar() {
    setNewBoardName('')
    setCreateBoardOpen(true)
  }

  function handleCreateSpaceFromSidebar() {
    setNewSpaceName('')
    setCreateSpaceOpen(true)
  }

  function submitCreateBoard() {
    const targetSpaceId = resolveTargetBoard()?.spaceId ?? spaces[0]?.id
    if (!targetSpaceId) return
    const name = newBoardName.trim()
    if (!name) return
    startTransition(async () => {
      const board = await createBoard(targetSpaceId, name)
      setCreateBoardOpen(false)
      router.push(`/app?board=${board.id}`)
    })
  }

  function submitCreateSpace() {
    const name = newSpaceName.trim()
    if (!name) return
    startTransition(async () => {
      await createSpace(name)
      setCreateSpaceOpen(false)
      router.refresh()
    })
  }

  function toggleSpace(spaceId: string) {
    setCollapsedSpaces((prev) => {
      const next = new Set(prev)
      if (next.has(spaceId)) next.delete(spaceId)
      else next.add(spaceId)
      return next
    })
  }

  useEffect(() => {
    function onKeydown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setSearchModalOpen(true)
      }
      if (event.key === 'Escape') {
        setSearchModalOpen(false)
      }
    }

    window.addEventListener('keydown', onKeydown)
    return () => window.removeEventListener('keydown', onKeydown)
  }, [])

  return (
    <>
      <aside className="flex h-full w-[272px] shrink-0 flex-col border-r border-[#EDE6DB] bg-[#FCFBF8]">
        {/* Header */}
        <div className="px-4 pt-3 pb-2">
          <div className="mb-3 flex items-center gap-1.5">
            <span className="size-3.5 rounded-full bg-[#FF5F57]" />
            <span className="size-3.5 rounded-full bg-[#FEBB2E]" />
            <span className="size-3.5 rounded-full bg-[#28C840]" />
          </div>
          <Link href="/app">
            <Image
              src="/wordmark-logo.png"
              alt="Sartiarum"
              width={170}
              height={44}
              priority
              className="h-auto w-[148px]"
            />
          </Link>
        </div>

        {/* Search */}
        <div className="px-4 py-2">
          <div className="relative">
            <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A8179]" />
            <Input
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              onFocus={() => setSearchModalOpen(true)}
              placeholder="Search"
              className="h-9 rounded-xl border-[#E8E2D8] bg-white pl-9 pr-16 text-[14px] text-[#1F2422] placeholder:text-[#9A9A9A]"
            />
            <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded-md border border-[#E5E0D6] bg-[#F7F4EC] px-1.5 py-0.5 text-[10px] font-semibold text-[#7A8179]">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Pinned */}
        <div className="px-4 py-2">
          <div className="mb-1.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#8B9189]">
            <PushPinSimple size={12} />
            <span>Pinned</span>
          </div>
          <div className="space-y-0.5">
            {pinnedBoards.length === 0 ? (
              <p className="px-2 py-1 text-[12px] text-[#9CA39A]">No pinned boards yet</p>
            ) : (
              pinnedBoards.slice(0, 5).map((board) => (
                <Link
                  key={board.id}
                  href={`/app?board=${board.id}`}
                  className={[
                    'flex items-center justify-between rounded-lg px-2 py-1.5 text-[14px] font-medium transition-colors',
                    pathname === '/app' && board.id === resolveTargetBoard()?.id
                      ? 'bg-[#E8F1DC] text-[#35582F]'
                      : 'text-[#1F2422] hover:bg-[#F3F0E9]',
                  ].join(' ')}
                >
                  <span className="inline-flex items-center gap-2">
                    <span className="text-[#5F6B5F]">{iconForBoard(board.name)}</span>
                    <span className="truncate">{board.name}</span>
                  </span>
                  <PushPin size={14} weight="fill" className="text-[#4F6F3D]" />
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Spaces */}
        <div className="flex-1 overflow-y-auto px-4 py-2">
          <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#8B9189]">
            Spaces
          </div>
          <div className="space-y-1">
            {spaces.map((space) => {
              const spaceBoards = getBoardsForSpace(space.id)
              const collapsed = collapsedSpaces.has(space.id)
              return (
                <div key={space.id}>
                  <button
                    onClick={() => toggleSpace(space.id)}
                    className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-[14px] font-semibold text-[#1F2422] hover:bg-[#F3F0E9]"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Folders size={16} className="text-[#6B756D]" />
                      <span className="truncate">{space.name}</span>
                    </span>
                    {collapsed ? (
                      <CaretRight size={12} weight="bold" className="text-[#8B9189]" />
                    ) : (
                      <CaretDown size={12} weight="bold" className="text-[#8B9189]" />
                    )}
                  </button>
                  {!collapsed && (
                    <div className="ml-2 space-y-0.5 border-l border-[#E8E2D8] pl-2">
                      {spaceBoards.map((board) => (
                        <Link
                          key={board.id}
                          href={`/app?board=${board.id}`}
                          className={[
                            'flex items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] font-medium transition-colors',
                            pathname === '/app' && board.id === resolveTargetBoard()?.id
                              ? 'bg-[#E8F1DC] text-[#35582F]'
                              : 'text-[#1F2422] hover:bg-[#F3F0E9]',
                          ].join(' ')}
                        >
                          <span className="text-[#5F6B5F]">{iconForBoard(board.name)}</span>
                          <span className="truncate">{board.name}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Bottom nav */}
        <div className="px-4 py-2">
          <div className="space-y-0.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const active = pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    'flex items-center gap-2 rounded-lg px-2 py-1.5 text-[14px] font-semibold transition-colors',
                    active
                      ? 'bg-[#F3F6EC] text-[#35582F]'
                      : 'text-[#1F2422] hover:bg-[#F3F0E9]',
                  ].join(' ')}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Footer profile card */}
        <div className="px-4 pb-3 pt-1">
          <Card className="rounded-xl border-[#E5DED4] bg-white/80 p-2.5 shadow-none">
            <div className="flex items-center gap-2.5">
              <Avatar className="size-9 border border-[#E5DED4]">
                <AvatarFallback className="bg-[#E8F1DC] text-[13px] font-semibold text-[#35582F]">
                  {createInitials(profile?.displayName)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-[#1F2422]">
                  {profile?.displayName || 'Creator'}
                </p>
                <p className="text-[11px] text-[#6B756D]">
                  {isTrialing ? `${trialDaysLeft}d of trial left` : `${aiUsageCount} AI actions used`}
                </p>
              </div>
              <Button
                size="icon-sm"
                variant="ghost"
                onClick={handleSignOut}
                className="size-7 rounded-md text-[#252A27]"
                aria-label="Sign out"
              >
                <SignOut size={14} />
              </Button>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#ECE8DE]">
              <div
                className="h-full rounded-full bg-[#4F6F3D]"
                style={{
                  width: `${Math.min(
                    100,
                    isTrialing ? ((30 - trialDaysLeft) / 30) * 100 : (aiUsageCount / 50) * 100,
                  )}%`,
                }}
              />
            </div>
          </Card>
        </div>
      </aside>

      {/* Search modal */}
      {searchModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/20 px-4 pt-24"
          onClick={() => setSearchModalOpen(false)}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-2xl border border-[#E5DED4] bg-[#FCFBF8] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative border-b border-[#E8E2D8] p-3">
              <MagnifyingGlass size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#7A8179]" />
              <Input
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Search boards..."
                className="h-11 rounded-xl border-0 bg-transparent pl-10 pr-12 text-[16px] shadow-none focus-visible:ring-0"
                autoFocus
              />
              <kbd className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 rounded-md border border-[#E5E0D6] bg-[#F7F4EC] px-1.5 py-0.5 text-[10px] font-semibold text-[#7A8179]">
                ESC
              </kbd>
            </div>
            <div className="max-h-[300px] overflow-y-auto p-2">
              {modalBoards.length === 0 ? (
                <p className="px-3 py-4 text-center text-[13px] text-[#7A8179]">No boards found</p>
              ) : (
                modalBoards.map((board) => (
                  <Link
                    key={board.id}
                    href={`/app?board=${board.id}`}
                    onClick={() => setSearchModalOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-[14px] font-medium text-[#1F2422] hover:bg-[#F3F0E9]"
                  >
                    <span className="text-[#5F6B5F]">{iconForBoard(board.name)}</span>
                    <span className="truncate">{board.name}</span>
                    {board.isPinned && (
                      <PushPin size={12} weight="fill" className="ml-auto text-[#4F6F3D]" />
                    )}
                  </Link>
                ))
              )}
            </div>
            <div className="border-t border-[#E8E2D8] bg-[#F7F4EC] px-3 py-2 text-[11px] text-[#7A8179]">
              <span className="font-semibold">↑↓</span> to navigate · <span className="font-semibold">↵</span>{' '}
              to select · <span className="font-semibold">ESC</span> to close
            </div>
          </div>
        </div>
      )}

      {/* Create board modal */}
      <Dialog open={createBoardOpen} onOpenChange={setCreateBoardOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New board</DialogTitle>
            <DialogDescription>Create a new board in the current space.</DialogDescription>
          </DialogHeader>
          <Input
            value={newBoardName}
            onChange={(event) => setNewBoardName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') submitCreateBoard()
            }}
            placeholder="Board name"
            className="mt-2"
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateBoardOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitCreateBoard} disabled={isPending}>
              {isPending ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create space modal */}
      <Dialog open={createSpaceOpen} onOpenChange={setCreateSpaceOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New space</DialogTitle>
            <DialogDescription>Create a new space to organize boards.</DialogDescription>
          </DialogHeader>
          <Input
            value={newSpaceName}
            onChange={(event) => setNewSpaceName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') submitCreateSpace()
            }}
            placeholder="Space name"
            className="mt-2"
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateSpaceOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitCreateSpace} disabled={isPending}>
              {isPending ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
