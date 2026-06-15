'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState, useTransition } from 'react'
import {
  BookOpenText,
  CalendarBlank,
  CaretDown,
  CaretRight,
  FileText,
  Gear,
  GraduationCap,
  Lightbulb,
  ListBullets,
  MagnifyingGlass,
  Note,
  PushPinSimple,
  SidebarSimple,
  SignOut,
  Folders,
  Plus,
} from '@phosphor-icons/react'
import { signOut } from '@/lib/actions/auth'
import { createBoard } from '@/lib/actions/boards'
import { createDocument } from '@/lib/actions/documents'
import { createSpace } from '@/lib/actions/spaces'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

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

interface DashboardSidebarProps {
  spaces: Space[]
  boards: Board[]
  profile: Profile
  subscription: Subscription
  aiUsageCount: number
}

const NAV_ITEMS = [
  { href: '/app/learn', label: 'Learn', icon: GraduationCap, soon: true },
  { href: '/app/plan', label: 'Plan', icon: CalendarBlank, soon: true },
  { href: '/app/settings/profile', label: 'Settings', icon: Gear, soon: false },
]

export function DashboardSidebar({
  spaces,
  boards,
  profile,
  subscription,
  aiUsageCount,
}: DashboardSidebarProps) {
  const router = useRouter()
  const { toggleSidebar } = useSidebar()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const activeBoardId = searchParams.get('board')
  const [searchValue, setSearchValue] = useState('')
  const [modalQuery, setModalQuery] = useState('')
  const [searchModalOpen, setSearchModalOpen] = useState(false)
  const [collapsedSpaces, setCollapsedSpaces] = useState<Set<string>>(new Set())
  const [isPending, startTransition] = useTransition()

  const filteredBoards = useMemo(() => {
    if (!searchValue.trim()) return boards
    const q = searchValue.trim().toLowerCase()
    return boards.filter((board) => board.name.toLowerCase().includes(q))
  }, [boards, searchValue])

  const pinnedBoards = filteredBoards.filter((board) => board.isPinned)

  const modalBoards = useMemo(() => {
    if (!modalQuery.trim()) return boards
    const q = modalQuery.trim().toLowerCase()
    return boards.filter((board) => board.name.toLowerCase().includes(q))
  }, [boards, modalQuery])

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
    if (value.includes('blog') || value.includes('pipeline') || value.includes('script')) return <ListBullets size={16} />
    if (value.includes('note')) return <Note size={16} />
    if (value.includes('idea')) return <Lightbulb size={16} />
    return <FileText size={16} />
  }

  async function handleSignOut() {
    await signOut()
  }

  function resolveTargetBoard() {
    if (activeBoardId) return boards.find((board) => board.id === activeBoardId) ?? boards[0]
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
    const targetSpaceId = resolveTargetBoard()?.spaceId ?? spaces[0]?.id
    if (!targetSpaceId) return
    const name = window.prompt('New board name', 'Untitled Board')
    if (!name || !name.trim()) return
    startTransition(async () => {
      const board = await createBoard(targetSpaceId, name.trim())
      router.push(`/app?board=${board.id}`)
    })
  }

  function handleCreateSpaceFromSidebar() {
    const name = window.prompt('New space name', 'New Space')
    if (!name || !name.trim()) return
    startTransition(async () => {
      await createSpace(name.trim())
      router.refresh()
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
    <Sidebar
      collapsible="icon"
      className="border-r border-[#EDE6DB] bg-[#FCFBF8]"
      style={{ '--sidebar-width': '17.25rem' } as React.CSSProperties}
    >
      <SidebarHeader className="gap-3 px-3.5 pt-3 pb-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
            <span className="size-3.5 rounded-full bg-[#FF5F57]" />
            <span className="size-3.5 rounded-full bg-[#FEBB2E]" />
            <span className="size-3.5 rounded-full bg-[#28C840]" />
          </div>
          <div className="hidden group-data-[collapsible=icon]:block">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={toggleSidebar}
              className="size-7 rounded-md text-[#6A726C] hover:bg-[#F3F0E9]"
              aria-label="Expand sidebar"
            >
              <SidebarSimple size={15} />
            </Button>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={toggleSidebar}
            className="size-7 rounded-md text-[#6A726C] hover:bg-[#F3F0E9] group-data-[collapsible=icon]:hidden"
            aria-label="Collapse sidebar"
          >
            <SidebarSimple size={15} />
          </Button>
        </div>

        <Link href="/app" className="group-data-[collapsible=icon]:hidden">
          <Image
            src="/wordmark-logo.png"
            alt="Sartiarum"
            width={170}
            height={44}
            priority
            className="h-auto w-[148px]"
          />
        </Link>

        <div className="relative group-data-[collapsible=icon]:hidden">
          <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A8179]" />
          <Input
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            onFocus={() => setSearchModalOpen(true)}
            placeholder="Search"
            className="h-9 rounded-xl border-[#E8E1D7] bg-white pl-9 pr-14 text-sm font-medium text-[#2A2E2B] shadow-none placeholder:text-[#7A8179]"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium tracking-tight text-[#7C827B]">
            Ctrl+K
          </span>
        </div>

        <div className="group-data-[collapsible=icon]:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  className="h-9 w-full rounded-xl bg-[#2f6e1f] text-sm font-semibold text-white hover:bg-[#285e1b]"
                  disabled={isPending}
                >
                  <Plus size={15} weight="bold" />
                  {isPending ? 'Working...' : 'New'}
                </Button>
              }
            />
            <DropdownMenuContent align="start" className="w-44">
              <DropdownMenuItem onSelect={handleCreateDocumentFromSidebar}>New document</DropdownMenuItem>
              <DropdownMenuItem onSelect={handleCreateBoardFromSidebar}>New board</DropdownMenuItem>
              <DropdownMenuItem onSelect={handleCreateSpaceFromSidebar}>New space</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarHeader>

      <SidebarContent className="overflow-hidden px-2 pt-0.5">
        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="px-3 text-xs font-medium uppercase tracking-[0.08em] text-[#71776F]">
            Pinned
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {pinnedBoards.map((board) => (
                <SidebarMenuItem key={board.id}>
                  <SidebarMenuButton
                    isActive={activeBoardId === board.id}
                    className="h-9 rounded-lg px-3 text-[14px] font-semibold text-[#1D2120] data-[active=true]:bg-[#F3F6EC] data-[active=true]:text-[#1D2120]"
                    render={<Link href={`/app?board=${board.id}`} />}
                  >
                    {iconForBoard(board.name)}
                    <span>{board.name}</span>
                    <PushPinSimple
                      size={15}
                      className={activeBoardId === board.id ? 'ml-auto text-[#41712F]' : 'ml-auto text-[#838A83]'}
                      weight={activeBoardId === board.id ? 'fill' : 'regular'}
                    />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-1 p-0">
          <SidebarGroupLabel className="px-3 text-xs font-medium uppercase tracking-[0.08em] text-[#71776F]">
            Spaces
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {spaces.map((space) => {
                const isCollapsed = collapsedSpaces.has(space.id)
                const spaceBoards = getBoardsForSpace(space.id)
                return (
                  <div key={space.id} className="mb-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setCollapsedSpaces((prev) => {
                          const next = new Set(prev)
                          if (next.has(space.id)) next.delete(space.id)
                          else next.add(space.id)
                          return next
                        })
                      }}
                      className="group-data-[collapsible=icon]:hidden h-8.5 w-full justify-start gap-1.5 px-3 text-[14px] font-semibold text-[#242927]"
                    >
                      {isCollapsed ? <CaretRight size={12} weight="bold" /> : <CaretDown size={12} weight="bold" />}
                      <Folders size={15} />
                      {space.name}
                    </Button>

                    {!isCollapsed && (
                      <SidebarMenu className="group-data-[collapsible=icon]:hidden pl-3.5">
                        {spaceBoards.map((board) => (
                          <SidebarMenuItem key={board.id}>
                            <SidebarMenuButton
                              isActive={activeBoardId === board.id}
                              className="h-8.5 rounded-lg px-3 text-[13px] font-medium text-[#2B2F2D] data-[active=true]:bg-[#F3F6EC] data-[active=true]:text-[#2F6E1F] data-[active=true]:font-semibold"
                              render={<Link href={`/app?board=${board.id}`} />}
                            >
                              {iconForBoard(board.name)}
                              <span>{board.name}</span>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}
                      </SidebarMenu>
                    )}
                  </div>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mx-3 mt-1 mb-2 h-px bg-[#ECE5DC] group-data-[collapsible=icon]:hidden" />

        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon
                const active = pathname.startsWith(item.href)
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={active}
                      className="h-9 rounded-lg px-3 text-[14px] font-semibold text-[#1F2422] data-[active=true]:bg-[#F3F6EC] data-[active=true]:text-[#35582F]"
                      render={<Link href={item.href} />}
                    >
                      <Icon size={16} />
                      <span>{item.label}</span>
                      {item.soon ? (
                        <Badge
                          variant="outline"
                          className="ml-auto h-6 rounded-full border-[#E8E2D8] bg-white px-2.5 text-[10px] font-semibold text-[#3B413C]"
                        >
                          Soon
                        </Badge>
                      ) : null}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-2.5 pb-2.5 pt-0">
        <Card className="rounded-xl border-[#E8E1D7] bg-white px-3 py-2.5 shadow-none group-data-[collapsible=icon]:hidden">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2.5">
              <Avatar className="size-8 border border-[#D6DCCF]">
                <AvatarFallback className="bg-[#35582F] text-xs font-semibold text-white">
                  {createInitials(profile?.displayName)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-[15px] font-semibold text-[#161A18]">
                  {profile?.displayName ?? 'Creator plan'}
                </p>
                <p className="text-xs text-[#6B726B]">{isTrialing ? 'Creator plan' : 'Pro plan'}</p>
              </div>
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

          <div className="flex items-center justify-between text-[11px] text-[#666D66]">
            <span>{aiUsageCount} AI actions used</span>
            <span>{trialDaysLeft}d left</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#ECE8DE]">
            <div
              className="h-full rounded-full bg-[#4F6F3D]"
              style={{ width: `${Math.min(100, (aiUsageCount / 50) * 100)}%` }}
            />
          </div>
        </Card>
      </SidebarFooter>

      {searchModalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/20 px-4 pt-24"
          onClick={() => setSearchModalOpen(false)}
        >
          <div
            className="w-full max-w-xl rounded-2xl border border-[#e5ded4] bg-white p-3 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative">
              <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A8179]" />
              <Input
                autoFocus
                value={modalQuery}
                onChange={(event) => setModalQuery(event.target.value)}
                placeholder="Search boards..."
                className="h-10 rounded-xl border-[#E8E1D7] bg-white pl-9 text-sm font-medium text-[#2A2E2B]"
              />
            </div>

            <div className="mt-3 max-h-72 overflow-y-auto">
              {modalBoards.length === 0 ? (
                <div className="rounded-lg px-3 py-6 text-center text-sm text-[#6a726c]">
                  No matching boards found.
                </div>
              ) : (
                modalBoards.map((board) => (
                  <button
                    key={board.id}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-[#212624] hover:bg-[#f5f2eb]"
                    onClick={() => {
                      setSearchModalOpen(false)
                      setModalQuery('')
                      router.push(`/app?board=${board.id}`)
                    }}
                  >
                    <span>{board.name}</span>
                    <span className="text-xs text-[#7b837c]">Open</span>
                  </button>
                ))
              )}
            </div>

            <div className="mt-2 flex items-center justify-between px-1 text-xs text-[#7c837c]">
              <span>Use Ctrl/Cmd + K to open</span>
              <span>Esc to close</span>
            </div>
          </div>
        </div>
      ) : null}
    </Sidebar>
  )
}
