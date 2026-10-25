import { Check } from 'lucide-react'
import { STRATEGY_META, STRATEGY_ORDER } from '../../lib/constants'
import { formatDecimal, formatNumber, formatPct } from '../../lib/format'
import { cn } from '../../lib/cn'
import type { Plan, StrategyId } from '../../types'

interface StrategyCardsProps {
  comparisons: Record<StrategyId, Plan>
  active: StrategyId
  onSelect: (strategy: StrategyId) => void
  className?: string
}

export function StrategyCards({ comparisons, active, onSelect, className }: StrategyCardsProps) {
  return (
    <div className={cn('grid grid-cols-3 gap-1.5', className)}>
      {STRATEGY_ORDER.map((strategy) => {
        const plan = comparisons[strategy]
        const meta = STRATEGY_META[strategy]
        const selected = strategy === active
        const equity = plan.totals.fairness
        return (
          <button
            key={strategy}
            type="button"
            aria-pressed={selected}
            onClick={() => onSelect(strategy)}
            title={`${meta.label} — ${meta.description}`}
            className={cn(
              'group relative min-w-0 rounded-md border p-2 text-left transition-colors duration-150',
              selected
                ? 'border-signal/45 bg-signal/[0.065]'
                : 'border-line/80 bg-night-950/30 hover:border-line hover:bg-white/[0.035]',
            )}
          >
            <div className="flex items-start justify-between gap-1">
              <span
                className={cn(
                  'font-mono text-[7.5px] uppercase leading-tight tracking-[0.09em]',
                  selected ? 'text-signal-bright' : 'text-mist-500',
                )}
              >
                {meta.microLabel}
              </span>
              {selected ? (
                <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-signal/20 text-signal-bright">
                  <Check size={8} strokeWidth={3} aria-hidden />
                </span>
              ) : null}
            </div>
            <div className="mt-1 truncate text-[10px] font-medium text-mist-100">{meta.shortLabel}</div>
            <div className="num mt-1.5 text-[17px] font-medium leading-none text-mist-50">
              {formatPct(plan.totals.coverage, 0)}
            </div>
            <div className="mt-0.5 font-mono text-[7px] uppercase tracking-[0.08em] text-mist-600">
              coverage
            </div>
            <div className="mt-2 space-y-0.5 border-t border-line/60 pt-1.5 font-mono text-[7.5px] leading-tight text-mist-500">
              <div className="flex justify-between gap-1">
                <span>p-unmet</span>
                <span className="text-mist-300">{formatNumber(plan.totals.priorityWeightedUnmet)}</span>
              </div>
              <div className="flex justify-between gap-1">
                <span>equity</span>
                <span className="text-mist-300">
                  {equity === null ? '—' : formatDecimal(equity)}
                </span>
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
