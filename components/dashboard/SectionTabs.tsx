'use client'

type Section = { id: string; name: string }

interface SectionTabsProps {
  sections: Section[]
  activeSection: string | null
  onSelect: (id: string | null) => void
  totalCount: number
}

export function SectionTabs({ sections, activeSection, onSelect, totalCount }: SectionTabsProps) {
  const tabs = [{ id: null, name: 'All' }, ...sections]

  return (
    <div style={{ display: 'flex', gap: 0, overflowX: 'auto' }}>
      {tabs.map(tab => {
        const active = tab.id === activeSection
        return (
          <button
            key={tab.id ?? 'all'}
            onClick={() => onSelect(tab.id)}
            style={{
              padding: '12px 16px',
              border: 'none',
              borderBottom: active ? '2px solid #4F6F3D' : '2px solid transparent',
              background: 'none',
              cursor: 'pointer',
              fontSize: 13.5,
              fontWeight: active ? 600 : 400,
              color: active ? '#4F6F3D' : '#4F5963',
              whiteSpace: 'nowrap',
              transition: 'color 0.12s',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {tab.name}
            {tab.id === null && totalCount > 0 && (
              <span style={{ marginLeft: 6, fontSize: 11, background: '#f0ede8', color: '#4F5963', borderRadius: 20, padding: '1px 6px', fontWeight: 500 }}>
                {totalCount}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
