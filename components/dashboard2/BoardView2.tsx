'use client'

import Image from 'next/image'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  CaretDown,
  DotsThree,
  FadersHorizontal,
  MagnifyingGlass,
  Plus,
  ArrowSquareOut,
  Copy,
  Trash,
} from '@phosphor-icons/react'
import { createDocument, deleteDocument, duplicateDocument } from '@/lib/actions/documents'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DocCard2 } from './DocCard2'
import { DashboardStatus2, SectionTabs2 } from './SectionTabs2'

type Section = { id: string; name: string; sortOrder: number }
type Document = {
  id: string
  title: string
  content: unknown
  wordCount: number
  sectionId: string | null
  status: DashboardStatus2
  updatedAt: Date
  createdAt: Date
}
type Board = { id: string; name: string; icon: string | null }

const STATUS_BY_SECTION_NAME: Array<{ key: string; status: DashboardStatus2 }> = [
  { key: 'idea', status: 'ideas' },
  { key: 'review', status: 'in_review' },
  { key: 'final', status: 'final' },
  { key: 'draft', status: 'draft' },
]

export function BoardView2({ board, allBoards, sections, documents }: BoardView2Props) {
  const router = useRouter()
  const [activeStatus, setActiveStatus] = useState<DashboardStatus2>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [creating, setCreating] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)

  const defaultDraftSectionId = useMemo(
    () =>
      sections.find((section) => section.name.toLowerCase().includes('draft'))?.id ??
      sections[0]?.id,
    [sections],
  )

  const filteredDocs = documents
    .map((doc) => ({
      ...doc,
      status: doc.status ?? inferStatusFromSectionId(doc.sectionId, sections),
    }))
    .filter((doc) => {
      if (activeStatus === 'all') return true
      return doc.status === activeStatus
    })
    .filter((doc) => {
      if (!searchQuery.trim()) return true
      const text = `${doc.title} ${extractSnippet(doc.content, 180)}`.toLowerCase()
      return text.includes(searchQuery.trim().toLowerCase())
    })

  const featuredDoc = filteredDocs[0]
  const gridDocs = filteredDocs.slice(1)

  async function handleCreateDocument() {
    if (creating) return
    setCreating(true)
    try {
      const document = await createDocument(board.id, defaultDraftSectionId)
      router.push(`/app/doc/${document.id}`)
    } finally {
      setCreating(false)
    }
  }

  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden px-4 pb-3 pt-3 xl:px-5 2xl:px-6">
      <header className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="outline"
                  className="h-9 rounded-xl border-[#E5DED4] bg-white/80 px-4 text-[14px] font-semibold text-[#1F2422]"
                >
                  {board.name || 'Drafts'}
                  <CaretDown size={14} weight="bold" />
                </Button>
              }
            />
            <DropdownMenuContent align="start" className="w-48">
              {allBoards.map((b) => (
                <DropdownMenuItem
                  key={b.id}
                  onSelect={() => router.push(`/app/dashboard2?board=${b.id}`)}
                  className={b.id === board.id ? 'font-semibold text-[#2F6E1F]' : ''}
                >
                  {b.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-[210px] xl:w-[260px]">
            <MagnifyingGlass size={15} className="text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search"
              className="h-9 rounded-xl border-[#E5DED4] bg-white/80 pl-9 text-sm"
            />
          </div>
          <DropdownMenu open={filterOpen} onOpenChange={setFilterOpen}>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="outline"
                  size="icon-sm"
                  className={[
                    'size-9 rounded-xl border-[#E5DED4] bg-white/80 text-[#4D5650]',
                    activeStatus !== 'all' ? 'border-[#9FBA94] bg-[#F6FAF2] text-[#2F6E1F]' : '',
                  ].join(' ')}
                >
                  <FadersHorizontal size={16} />
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-40">
              {(['all', 'ideas', 'draft', 'in_review', 'final'] as DashboardStatus2[]).map((s) => (
                <DropdownMenuItem
                  key={s}
                  onSelect={() => {
                    setActiveStatus(s)
                    setFilterOpen(false)
                  }}
                  className={activeStatus === s ? 'font-semibold text-[#2F6E1F]' : ''}
                >
                  {s === 'all' ? 'All statuses' : statusLabel(s)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  disabled={creating}
                  className="h-9 rounded-xl bg-[#2F6E1F] px-4 text-sm font-semibold text-white hover:bg-[#285E1B]"
                >
                  <Plus size={16} weight="bold" />
                  {creating ? 'Creating...' : 'New'}
                  <CaretDown size={14} weight="bold" />
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onSelect={handleCreateDocument}>New document</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="mb-2">
        <h1 className="font-[var(--font-newsreader)] text-[32px] leading-[1.06] font-semibold tracking-[-0.03em] text-[#151817] xl:text-[34px]">
          Your writing home
        </h1>
        <p className="mt-1 text-[15px] text-[#4F5963]">
          Organize drafts, ideas, and projects in one calm space.
        </p>
      </div>

      <SectionTabs2
        activeStatus={activeStatus}
        onSelect={setActiveStatus}
        totalCount={documents.length}
      />

      <div className="mt-3 min-h-0 flex-1 overflow-y-auto pr-1">
        {featuredDoc ? (
          <>
            <Card
              onClick={() => router.push(`/app/doc/${featuredDoc.id}`)}
              className="relative cursor-pointer overflow-hidden rounded-2xl border-[#E5DED4] bg-white/80 p-0 shadow-none"
            >
              <Image
                src="/view-bg.png"
                alt=""
                fill
                priority={false}
                aria-hidden
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-white/60 via-white/30 to-transparent" />

              <div className="relative z-10 flex min-h-[200px] flex-col p-5">
                <Badge className="mb-3 w-fit rounded-full bg-[#E8F1DC]/95 px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#35582F]">
                  Current Draft
                </Badge>
                <h2 className="mb-1.5 font-[var(--font-newsreader)] text-[24px] leading-[1.08] font-semibold tracking-[-0.02em] text-[#151917] xl:text-[26px]">
                  {featuredDoc.title || 'Untitled'}
                </h2>
                <p className="mb-3 max-w-[480px] text-[14px] leading-[1.45] text-[#2F3732]">
                  {extractSnippet(featuredDoc.content, 280) ||
                    'Open this draft to continue shaping your ideas with focus and clarity.'}
                </p>
                <div className="mt-auto flex flex-wrap items-center gap-4 text-[12px] text-[#465048]">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="inline-block size-1.5 rounded-full bg-[#4F6F3D]" />
                    {featuredDoc.status === 'draft' ? 'Draft' : statusLabel(featuredDoc.status)}
                  </span>
                  <span>{featuredDoc.wordCount.toLocaleString()} words</span>
                  <span>{timeAgo(featuredDoc.updatedAt)}</span>
                </div>
              </div>
              <div className="absolute right-3 top-3 z-20" onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        variant="outline"
                        size="icon-sm"
                        className="size-7 rounded-md border-[#E5DED4] bg-white/80 text-[#5D665E]"
                      >
                        <DotsThree size={15} weight="bold" />
                      </Button>
                    }
                  />
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem onSelect={() => router.push(`/app/doc/${featuredDoc.id}`)}>
                      <ArrowSquareOut size={14} className="mr-2" />
                      Open
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={async () => {
                        await duplicateDocument(featuredDoc.id)
                        router.refresh()
                      }}
                    >
                      <Copy size={14} className="mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onSelect={async () => {
                        if (!confirm(`Delete "${featuredDoc.title || 'Untitled'}"? This cannot be undone.`)) return
                        await deleteDocument(featuredDoc.id)
                        router.refresh()
                      }}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash size={14} className="mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </Card>

            {gridDocs.length > 0 ? (
              <div className="mt-3 grid grid-cols-1 gap-2.5 xl:grid-cols-3">
                {gridDocs.map((doc) => (
                  <DocCard2 key={doc.id} doc={doc} allBoards={allBoards} />
                ))}
              </div>
            ) : null}
          </>
        ) : (
          <Card className="rounded-2xl border-dashed border-[#D4DCCC] bg-white/60 p-10 text-center shadow-none">
            <p className="text-[18px] font-semibold text-[#1A1E1C]">No documents yet</p>
            <p className="mt-2 text-sm text-[#6C756D]">Create your first document to begin writing.</p>
            <Button
              onClick={handleCreateDocument}
              className="mt-4 rounded-xl bg-[#2F6E1F] text-white hover:bg-[#285E1B]"
            >
              <Plus size={16} weight="bold" />
              Create document
            </Button>
          </Card>
        )}
      </div>
    </section>
  )
}

interface BoardView2Props {
  board: Board
  allBoards: Board[]
  sections: Section[]
  documents: Document[]
}

function extractSnippet(content: unknown, maxLen: number): string {
  try {
    const text = extractText(content as Record<string, unknown>).replace(/\s+/g, ' ').trim()
    if (!text) return ''
    return text.length > maxLen ? `${text.slice(0, maxLen)}...` : text
  } catch {
    return ''
  }
}

function extractText(node: Record<string, unknown>): string {
  if (!node) return ''
  if (typeof node.text === 'string') return node.text
  if (Array.isArray(node.content)) {
    return (node.content as Record<string, unknown>[]).map(extractText).join(' ')
  }
  return ''
}

function timeAgo(value: Date): string {
  const date = new Date(value)
  const diff = Date.now() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Edited just now'
  if (minutes < 60) return `Edited ${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `Edited ${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `Edited ${days}d ago`
  return `Edited ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
}

function inferStatusFromSectionId(sectionId: string | null, sections: Section[]): DashboardStatus2 {
  if (!sectionId) return 'draft'
  const sectionName = sections.find((section) => section.id === sectionId)?.name.toLowerCase() ?? ''
  const matched = STATUS_BY_SECTION_NAME.find((item) => sectionName.includes(item.key))
  return matched?.status ?? 'draft'
}

function statusLabel(status: DashboardStatus2) {
  if (status === 'in_review') return 'In Review'
  if (status === 'ideas') return 'Ideas'
  if (status === 'final') return 'Final'
  return 'Draft'
}
