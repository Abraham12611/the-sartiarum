'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  DotsThree,
  FolderOpen,
  PencilSimple,
  Swap,
  Trash,
} from '@phosphor-icons/react'
import { deleteDocument, moveDocumentToBoard, renameDocument } from '@/lib/actions/documents'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { DashboardStatus2 } from './SectionTabs2'

type Document = {
  id: string
  title: string
  content: unknown
  wordCount: number
  status: DashboardStatus2
  updatedAt: Date
}

type Board = { id: string; name: string; icon: string | null }

const STATUS_META: Record<
  DashboardStatus2,
  { label: string; dot: string; badgeBorder: string }
> = {
  all: { label: 'All', dot: '#4F6F3D', badgeBorder: '#E5DED4' },
  ideas: { label: 'Ideas', dot: '#3B82F6', badgeBorder: '#D4E0FA' },
  draft: { label: 'Draft', dot: '#4F6F3D', badgeBorder: '#D4DCCC' },
  in_review: { label: 'In Review', dot: '#F59E0B', badgeBorder: '#F3E3C4' },
  final: { label: 'Final', dot: '#8B5CF6', badgeBorder: '#E3D9F7' },
}

export function DocCard2({ doc, allBoards }: { doc: Document; allBoards: Board[] }) {
  const router = useRouter()
  const [renameOpen, setRenameOpen] = useState(false)
  const [renameValue, setRenameValue] = useState(doc.title || 'Untitled')
  const [busy, setBusy] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const status = STATUS_META[doc.status] ?? STATUS_META.draft
  const snippet = extractSnippet(doc.content, 130)

  function openDocument() {
    router.push(`/app/doc/${doc.id}`)
  }

  function handleCardClick() {
    openDocument()
  }

  async function handleRename() {
    const trimmed = renameValue.trim()
    if (!trimmed || trimmed === doc.title) {
      setRenameOpen(false)
      return
    }
    setBusy(true)
    try {
      await renameDocument(doc.id, trimmed)
      router.refresh()
      setRenameOpen(false)
    } finally {
      setBusy(false)
    }
  }

  async function handleMoveToBoard(boardId: string) {
    setBusy(true)
    try {
      await moveDocumentToBoard(doc.id, boardId)
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete "${doc.title || 'Untitled'}"? This cannot be undone.`)) return
    setDeleting(true)
    try {
      await deleteDocument(doc.id)
      router.refresh()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
      <Card
        role="button"
        tabIndex={0}
        onClick={handleCardClick}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            openDocument()
          }
        }}
        className="rounded-2xl border-[#E5DED4] bg-white/80 p-3.5 shadow-none transition hover:-translate-y-0.5 hover:border-[#CAD6BF] hover:shadow-[0_10px_26px_rgba(44,39,30,0.08)]"
      >
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 font-[var(--font-newsreader)] text-[18px] leading-[1.12] font-semibold tracking-[-0.02em] text-[#151917] xl:text-[20px]">
            {doc.title || 'Untitled'}
          </h3>

          <div
            data-doc-card-menu="true"
            onClick={(event) => event.stopPropagation()}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="size-7 shrink-0 rounded-md text-[#6C746C]"
                    data-doc-card-menu="true"
                    onClick={(event) => event.stopPropagation()}
                    onMouseDown={(event) => event.stopPropagation()}
                  >
                    <DotsThree size={18} weight="bold" />
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-36">
                <DropdownMenuItem onSelect={openDocument}>
                  <FolderOpen size={14} />
                  Open
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => {
                    setRenameValue(doc.title || 'Untitled')
                    setRenameOpen(true)
                  }}
                  disabled={busy || deleting}
                >
                  <PencilSimple size={14} />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger disabled={busy || deleting}>
                    <Swap size={14} />
                    Move to board
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="w-48">
                    {allBoards.map((board) => (
                      <DropdownMenuItem
                        key={board.id}
                        onSelect={() => handleMoveToBoard(board.id)}
                        disabled={busy || deleting}
                      >
                        {board.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={handleDelete}
                  className="text-[#b42318] focus:text-[#b42318]"
                  disabled={busy || deleting}
                >
                  <Trash size={14} />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <p className="mb-4 line-clamp-3 text-[13px] leading-[1.4] text-[#4C554E]">
          {snippet || 'Open this draft to continue writing.'}
        </p>

        <div className="flex flex-wrap items-center gap-3 text-[12px] text-[#6B756D]">
          <span
            className="inline-flex h-6 items-center gap-1.5 rounded-full border bg-white px-2 text-[11px] font-medium"
            style={{ borderColor: status.badgeBorder }}
          >
            <span className="inline-block size-1.5 rounded-full" style={{ backgroundColor: status.dot }} />
            {status.label}
          </span>
          <span>{doc.wordCount.toLocaleString()} words</span>
          <span>{timeAgo(doc.updatedAt)}</span>
        </div>
      </Card>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename document</DialogTitle>
        </DialogHeader>
        <Input
          value={renameValue}
          onChange={(e) => setRenameValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleRename()
          }}
          className="mt-2"
          autoFocus
        />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setRenameOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleRename} disabled={busy}>
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
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
