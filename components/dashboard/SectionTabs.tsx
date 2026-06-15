'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export type DashboardStatus = 'all' | 'ideas' | 'draft' | 'in_review' | 'final'

const TABS: Array<{ id: DashboardStatus; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'ideas', label: 'Ideas' },
  { id: 'draft', label: 'Drafts' },
  { id: 'in_review', label: 'In Review' },
  { id: 'final', label: 'Final' },
]

interface SectionTabsProps {
  activeStatus: DashboardStatus
  onSelect: (status: DashboardStatus) => void
  totalCount: number
}

export function SectionTabs({ activeStatus, onSelect, totalCount }: SectionTabsProps) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {TABS.map((tab) => (
        <Button
          key={tab.id}
          variant="outline"
          size="sm"
          onClick={() => onSelect(tab.id)}
          className={[
            'h-7.5 rounded-full border-[#E5DED4] bg-white/75 px-3 text-[12px] font-semibold text-[#2D322F]',
            activeStatus === tab.id ? 'border-[#9FBA94] bg-[#F6FAF2] text-[#35582F]' : '',
          ].join(' ')}
        >
          {tab.label}
          {tab.id === 'all' ? (
            <Badge variant="outline" className="rounded-full border-[#D5DCD1] bg-white px-1.5 text-[11px]">
              {totalCount}
            </Badge>
          ) : null}
        </Button>
      ))}
    </div>
  )
}
