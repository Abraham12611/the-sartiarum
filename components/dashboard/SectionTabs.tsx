'use client'

import styles from './SectionTabs.module.css'

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
    <div className={styles.tabs}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeSection
        return (
          <button
            key={tab.id ?? 'all'}
            type="button"
            onClick={() => onSelect(tab.id)}
            className={`${styles.pill} ${isActive ? styles.pillActive : ''}`}
          >
            {tab.name}
            {tab.id === null && totalCount > 0 && (
              <span className={styles.badge}>{totalCount}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}
