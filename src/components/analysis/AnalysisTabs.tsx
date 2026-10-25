import { cn } from '../../lib/cn'
import type { AnalysisTab } from '../../types'

const TABS: Array<{ id: AnalysisTab; label: string }> = [
  { id: 'plan', label: 'Plan' },
  { id: 'compare', label: 'Compare' },
  { id: 'explain', label: 'Explain' },
]

interface AnalysisTabsProps {
  tab: AnalysisTab
  onChange: (tab: AnalysisTab) => void
  idPrefix: string
  className?: string
}

export function AnalysisTabs({ tab, onChange, idPrefix, className }: AnalysisTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Analysis views"
      className={cn('flex border-b border-line/70', className)}
    >
      {TABS.map((entry) => {
        const active = tab === entry.id
        return (
          <button
            key={entry.id}
            id={`${idPrefix}-tab-${entry.id}`}
            role="tab"
            type="button"
            aria-selected={active}
            aria-controls={`${idPrefix}-panel-${entry.id}`}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(entry.id)}
            onKeyDown={(event) => {
              if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return
              event.preventDefault()
              const currentIndex = TABS.findIndex((candidate) => candidate.id === tab)
              const delta = event.key === 'ArrowRight' ? 1 : -1
              const nextIndex = (currentIndex + delta + TABS.length) % TABS.length
              onChange(TABS[nextIndex].id)
              const target = document.getElementById(`${idPrefix}-tab-${TABS[nextIndex].id}`)
              target?.focus()
            }}
            className={cn(
              'relative flex-1 pb-2 pt-1 text-[10.5px] font-medium transition-colors',
              active ? 'text-mist-50' : 'text-mist-500 hover:text-mist-200',
            )}
          >
            {entry.label}
            {active ? (
              <span
                aria-hidden
                className="absolute inset-x-1 -bottom-px h-[2px] rounded-full bg-signal shadow-[0_0_8px_rgba(45,212,191,0.65)]"
              />
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
