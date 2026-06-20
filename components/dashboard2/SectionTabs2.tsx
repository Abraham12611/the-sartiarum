'use client'

export type DashboardStatus2 = 'all' | 'ideas' | 'draft' | 'in_review' | 'final'

interface SectionTabs2Props {
  activeStatus: DashboardStatus2
  onSelect: (status: DashboardStatus2) => void
  totalCount: number
}

const TABS: { status: DashboardStatus2; label: string }[] = [
  { status: 'all', label: 'All' },
  { status: 'ideas', label: 'Ideas' },
  { status: 'draft', label: 'Drafts' },
  { status: 'in_review', label: 'In Review' },
  { status: 'final', label: 'Final' },
]

export function SectionTabs2({ activeStatus, onSelect, totalCount }: SectionTabs2Props) {
  return (
    <div className="flex items-center gap-1.5">
      {TABS.map((tab) => {
        const active = activeStatus === tab.status
        return (
          <button
            key={tab.status}
            onClick={() => onSelect(tab.status)}
            className={[
              'h-8 rounded-full px-3.5 text-[13px] font-medium transition-colors',
              active
                ? 'bg-[#E8F1DC] text-[#35582F]'
                : 'bg-transparent text-[#5C665D] hover:bg-[#F0EBE2] hover:text-[#2A312C]',
            ].join(' ')}
          >
            {tab.label}
            {tab.status === 'all' && (
              <span className="ml-1.5 text-[11px] opacity-75">{totalCount}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}
