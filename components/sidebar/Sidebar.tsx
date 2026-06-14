'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import {
  BookOpenText,
  CaretDown,
  CaretRight,
  FileText,
  Gear,
  Lightbulb,
  MagnifyingGlass,
  Note,
  PencilSimpleLine,
  PushPinSimple,
  SidebarSimple,
  SignOut,
  Stack,
} from '@phosphor-icons/react'
import { signOut } from '@/lib/actions/auth'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
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
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar'

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
  { href: '/app/learn', label: 'Learn', icon: BookOpenText },
  { href: '/app/plan', label: 'Plan', icon: Stack },
  { href: '/app/settings/profile', label: 'Settings', icon: Gear },
]

const BOARD_ICON_MAP: Record<string, typeof PencilSimpleLine> = {
  draft: PencilSimpleLine,
  essay: FileText,
  idea: Lightbulb,
  note: Note,
}

export function DashboardSidebar({
  spaces,
  boards,
  profile,
  subscription,
  aiUsageCount,
}: DashboardSidebarProps) {
  const { toggleSidebar } = useSidebar()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const activeBoardId = searchParams.get('board')
  const [searchValue, setSearchValue] = useState('')
  const [collapsedSpaces, setCollapsedSpaces] = useState<Set<string>>(new Set())

  const pinnedBoards = boards.filter((board) => board.isPinned)
  const filteredBoards = useMemo(() => {
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

  function iconForBoard(boardName: string) {
    const key = Object.keys(BOARD_ICON_MAP).find((name) => boardName.toLowerCase().includes(name))
    const Icon = key ? BOARD_ICON_MAP[key] : FileText
    return <Icon size={16} weight="regular" />
  }

  async function handleSignOut() {
    await signOut()
  }

  function createInitials(name: string | null | undefined) {
    if (!name?.trim()) return 'SA'
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('')
  }

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-[#E5DED4]"
      style={{ '--sidebar-width': '18.5rem' } as React.CSSProperties}
    >
      <SidebarHeader className="gap-3 px-4 pt-4 pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="size-3 rounded-full bg-[#FF5F57]" />
            <span className="size-3 rounded-full bg-[#FEBB2E]" />
            <span className="size-3 rounded-full bg-[#28C840]" />
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={toggleSidebar}
            className="size-7 rounded-md text-[#6C746C] group-data-[collapsible=icon]:hidden"
            aria-label="Collapse sidebar"
          >
            <SidebarSimple size={15} />
          </Button>
        </div>

        <Link href="/app" className="group-data-[collapsible=icon]:hidden">
          <Image
            src="/wordmark-logo.png"
            alt="Sartiarum"
            width={134}
            height={34}
            priority
            className="h-auto w-[134px]"
          />
        </Link>

        <Link href="/app" className="hidden group-data-[collapsible=icon]:flex">
          <Image
            src="/sartiatum-logo-icon.png"
            alt="Sartiarum"
            width={24}
            height={24}
            priority
            className="h-6 w-6"
          />
        </Link>

        <div className="relative group-data-[collapsible=icon]:hidden">
          <MagnifyingGlass size={15} className="text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Search"
            className="h-9 rounded-xl border-[#E5DED4] bg-white/75 pl-9 pr-14 text-sm"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground">
            Ctrl+K
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 pb-3">
        {pinnedBoards.length > 0 && (
          <SidebarGroup className="p-0">
            <SidebarGroupLabel className="px-3 text-[11px] uppercase tracking-[0.08em] text-[#6F766F]">
              Pinned
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {pinnedBoards.map((board) => (
                  <SidebarMenuItem key={board.id}>
                    <SidebarMenuButton
                      isActive={activeBoardId === board.id}
                      className="h-8 rounded-lg data-[active=true]:bg-[#F1F4EB] data-[active=true]:text-[#35582F]"
                      render={<Link href={`/app?board=${board.id}`} />}
                    >
                      {iconForBoard(board.name)}
                      <span>{board.name}</span>
                      <PushPinSimple size={14} className="ml-auto text-[#527A3D]" />
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="px-3 text-[11px] uppercase tracking-[0.08em] text-[#6F766F]">
            Spaces
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {spaces.map((space) => {
                const isCollapsed = collapsedSpaces.has(space.id)
                const spaceBoards = getBoardsForSpace(space.id)
                return (
                  <div key={space.id} className="mb-1">
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
                      className="group-data-[collapsible=icon]:hidden h-8 w-full justify-start gap-1 px-3 text-sm font-semibold text-[#4F5963]"
                    >
                      {isCollapsed ? <CaretRight size={12} /> : <CaretDown size={12} />}
                      {space.name}
                    </Button>

                    {!isCollapsed && (
                      <SidebarMenu className="group-data-[collapsible=icon]:hidden pl-2">
                        {spaceBoards.map((board) => (
                          <SidebarMenuItem key={board.id}>
                            <SidebarMenuButton
                              isActive={activeBoardId === board.id}
                              className="h-8 rounded-lg data-[active=true]:bg-[#F1F4EB] data-[active=true]:text-[#35582F]"
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

        <Separator className="my-3 bg-[#ECE5DC]" />

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
                      className="h-8 rounded-lg data-[active=true]:bg-[#F1F4EB] data-[active=true]:text-[#35582F]"
                      render={<Link href={item.href} />}
                    >
                      <Icon size={16} />
                      <span>{item.label}</span>
                      {item.href !== '/app/settings/profile' ? (
                        <Badge variant="outline" className="ml-auto rounded-full px-2 text-[10px]">
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

      <SidebarFooter className="border-t border-[#ECE5DC] p-3">
        <Card className="rounded-xl border-[#E5DED4] bg-white p-3 group-data-[collapsible=icon]:p-2">
          <div className="group-data-[collapsible=icon]:hidden mb-3 flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <Avatar className="size-8 border border-[#D7D9D2]">
                <AvatarFallback className="bg-[#35582F] text-[11px] text-white">
                  {createInitials(profile?.displayName)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#1E2220]">
                  {profile?.displayName ?? 'Creator plan'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isTrialing ? 'Creator plan' : 'Pro plan'}
                </p>
              </div>
            </div>
            <Button size="icon-sm" variant="ghost" onClick={handleSignOut} className="size-7">
              <SignOut size={15} />
            </Button>
          </div>

          <div className="group-data-[collapsible=icon]:hidden space-y-1">
            <div className="flex items-center justify-between text-[11px] text-[#677067]">
              <span>{aiUsageCount} AI actions used</span>
              <span>{trialDaysLeft}d left</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-[#EAE5DA]">
              <div
                className="h-full rounded-full bg-[#4F6F3D]"
                style={{ width: `${Math.min(100, (aiUsageCount / 50) * 100)}%` }}
              />
            </div>
          </div>
        </Card>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
