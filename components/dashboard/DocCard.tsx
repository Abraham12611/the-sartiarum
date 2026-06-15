'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DotsThree, FolderOpen, PencilSimple, Swap, Trash } from '@phosphor-icons/react'
import { deleteDocument, moveDocumentToBoard, renameDocument } from '@/lib/actions/documents'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import type { DashboardStatus } from './SectionTabs'

type Doc = {
  id: string
  title: string
  content: unknown
  wordCount: number
  status: DashboardStatus
  updatedAt: Date
}

type BoardTarget = { id: string; name: string }

export function DocCard({ doc, allBoards }: { doc: Doc; allBoards: BoardTarget[] }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)
  const [busy, setBusy] = useState(false)
  const [renameOpen, setRenameOpen] = useState(false)
  const [renameValue, setRenameValue] = useState(doc.title || 'Untitled')
  const snippet = useMemo(() => extractSnippet(doc.content, 105), [doc.content])
  const status = getStatusStyle(doc.status)

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

  const openDocument = () => {
    if (!deleting && !busy) router.push(`/app/doc/${doc.id}`)
  }

  async function handleRenameSubmit() {
    if (deleting || busy) return
    const value = renameValue.trim()
    if (!value || value === doc.title) {
      setRenameOpen(false)
      return
    }
    setBusy(true)
    try {
      await renameDocument(doc.id, value)
      setRenameOpen(false)
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  async function handleMoveToBoard(boardId: string) {
    if (deleting || busy || boardId === '') return
    setBusy(true)
    try {
      await moveDocumentToBoard(doc.id, boardId)
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
      <ContextMenu>
      <ContextMenuTrigger>
        <Card
          role="button"
          tabIndex={0}
          onClick={openDocument}
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
            <Badge variant="outline" className="h-6 rounded-full border-[#E5DED4] bg-white px-2 text-[11px] font-medium">
              <span className="mr-1 inline-block size-1.5 rounded-full" style={{ backgroundColor: status.dot }} />
              {status.label}
            </Badge>
            <span>{doc.wordCount.toLocaleString()} words</span>
            <span>{timeAgo(doc.updatedAt)}</span>
          </div>
        </Card>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-40">
        <ContextMenuItem onSelect={openDocument}>
          <FolderOpen size={14} />
          Open
        </ContextMenuItem>
        <ContextMenuItem
          onSelect={() => {
            setRenameValue(doc.title || 'Untitled')
            setRenameOpen(true)
          }}
          disabled={busy || deleting}
        >
          <PencilSimple size={14} />
          Rename
        </ContextMenuItem>
        {allBoards.map((board) => (
          <ContextMenuItem
            key={board.id}
            onSelect={() => handleMoveToBoard(board.id)}
            disabled={busy || deleting}
          >
            <Swap size={14} />
            Move: {board.name}
          </ContextMenuItem>
        ))}
        <ContextMenuItem
          onSelect={handleDelete}
          className="text-[#b42318] focus:text-[#b42318]"
          disabled={busy || deleting}
        >
          <Trash size={14} />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
      </ContextMenu>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename document</DialogTitle>
          <DialogDescription>Update the document title shown in your board and writer.</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            void handleRenameSubmit()
          }}
          className="mt-4 space-y-3"
        >
          <Input
            value={renameValue}
            onChange={(event) => setRenameValue(event.target.value)}
            placeholder="Document title"
            autoFocus
          />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setRenameOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy || !renameValue.trim()}>
              {busy ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
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
  return `Edited ${days}d ago`
}

function getStatusStyle(status: DashboardStatus) {
  if (status === 'in_review') return { label: 'In Review', dot: '#F4B400' }
  if (status === 'ideas') return { label: 'Ideas', dot: '#3B82F6' }
  if (status === 'final') return { label: 'Final', dot: '#7C3AED' }
  return { label: 'Draft', dot: '#4F6F3D' }
}
