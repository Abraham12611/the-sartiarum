'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DotsThree, FolderOpen, Trash } from '@phosphor-icons/react'
import { deleteDocument } from '@/lib/actions/documents'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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

export function DocCard({ doc }: { doc: Doc }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)
  const snippet = useMemo(() => extractSnippet(doc.content, 105), [doc.content])
  const status = getStatusStyle(doc.status)

  async function handleDelete() {
    if (!confirm(`Delete "${doc.title || 'Untitled'}"? This cannot be undone.`)) return
    setDeleting(true)
    await deleteDocument(doc.id)
    router.refresh()
  }

  const openDocument = () => {
    if (!deleting) router.push(`/app/doc/${doc.id}`)
  }

  return (
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
          className="rounded-2xl border-[#E5DED4] bg-white/80 p-4 shadow-none transition hover:-translate-y-0.5 hover:border-[#CAD6BF] hover:shadow-[0_10px_26px_rgba(44,39,30,0.08)]"
        >
          <div className="mb-2 flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 font-[var(--font-newsreader)] text-[22px] leading-[1.12] font-semibold tracking-[-0.02em] text-[#151917] xl:text-[24px]">
              {doc.title || 'Untitled'}
            </h3>

            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" className="size-7 shrink-0 rounded-md text-[#6C746C]"><DotsThree size={18} weight="bold" /></Button>} />
              <DropdownMenuContent align="end" className="w-36">
                <DropdownMenuItem onSelect={openDocument}>
                  <FolderOpen size={14} />
                  Open
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={handleDelete} className="text-[#b42318] focus:text-[#b42318]">
                  <Trash size={14} />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <p className="mb-5 line-clamp-3 text-[13px] leading-[1.45] text-[#4C554E]">
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
        <ContextMenuItem onSelect={handleDelete} className="text-[#b42318] focus:text-[#b42318]">
          <Trash size={14} />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
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
