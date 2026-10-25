import { STRATEGY_META, STRATEGY_ORDER } from '../../lib/constants'
import { formatDecimal, formatNumber, formatPct } from '../../lib/format'
import { cn } from '../../lib/cn'
import type { Plan, StrategyId } from '../../types'
import { InfoNote } from '../ui/InfoNote'

interface ComparisonTableProps {
  comparisons: Record<StrategyId, Plan>
  active: StrategyId
  onSelect?: (strategy: StrategyId) => void
}

export function ComparisonTable({ comparisons, active, onSelect }: ComparisonTableProps) {
  const rows: Array<{
    label: string
    hint: string
    value: (plan: Plan) => string
    emphasis?: boolean
  }> = [
    {
      label: 'Demand coverage',
      hint: 'Allocated units ÷ requested units.',
      value: (plan) => formatPct(plan.totals.coverage, 1),
    },
    {
      label: 'Priority-weighted unmet',
      hint: 'Unmet units × urgency (1–5) × vulnerability factor (0.6–1.0).',
      value: (plan) => formatNumber(plan.totals.priorityWeightedUnmet),
    },
    {
      label: 'Route distance',
      hint: 'Loaded out + empty return kilometres across every planned run on the current road graph.',
      value: (plan) => `${formatDecimal(plan.totals.routeDistanceKm)} km`,
    },
    {
      label: 'Vehicle-hours',
      hint: 'Route distance at each vehicle speed + 0.25 h handling per run.',
      value: (plan) => `${formatDecimal(plan.totals.vehicleHours)} h`,
    },
    {
      label: 'Reachable wards',
      hint: 'Wards with at least one open route to a depot in the current graph.',
      value: (plan) => `${plan.totals.reachableWards} / ${plan.totals.reachableWards + plan.totals.unreachableWards}`,
    },
    {
      label: 'Coverage equity',
      hint: '100 minus the percentage-point gap between the best- and worst-covered ward.',
      value: (plan) =>
        plan.totals.fairness === null ? '—' : `${formatDecimal(plan.totals.fairness)} / 100`,
      emphasis: true,
    },
  ]

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">
            Strategy comparison. All values are computed by the implemented allocator and router from
            the currently displayed simulated scenario.
          </caption>
          <thead>
            <tr>
              <th scope="col" className="w-[34%] pb-1.5 pr-1 text-left font-normal">
                <span className="font-mono text-[7.5px] uppercase tracking-[0.1em] text-mist-600">
                  Metric
                </span>
              </th>
              {STRATEGY_ORDER.map((strategy) => (
                <th
                  key={strategy}
                  scope="col"
                  className={cn(
                    'px-1 pb-1.5 text-right font-normal',
                    strategy === active ? 'text-mist-100' : 'text-mist-400',
                  )}
                >
                  <span className="block truncate font-mono text-[7.5px] uppercase tracking-[0.06em]">
                    {STRATEGY_META[strategy].shortLabel === 'Population'
                      ? 'Pop.'
                      : STRATEGY_META[strategy].shortLabel === 'Nearest-first'
                        ? 'Nearest'
                        : 'Optimizer'}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-t border-line/60">
                <th scope="row" className="py-1.5 pr-1 text-left font-normal">
                  <span
                    className="text-[9px] leading-tight text-mist-400"
                    title={row.hint}
                  >
                    {row.label}
                  </span>
                </th>
                {STRATEGY_ORDER.map((strategy) => (
                  <td
                    key={strategy}
                    title={row.hint}
                    onClick={onSelect ? () => onSelect(strategy) : undefined}
                    className={cn(
                      'px-1 py-1.5 text-right align-top',
                      onSelect ? 'cursor-pointer' : '',
                      strategy === active && 'bg-signal/[0.045]',
                    )}
                  >
                    <span
                      className={cn(
                        'num text-[9.5px] leading-tight',
                        row.emphasis ? 'text-[#f6c97f]' : 'text-mist-200',
                      )}
                    >
                      {row.value(comparisons[strategy])}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <InfoNote className="mt-2" tone="teal">
        <span className="font-medium text-[#c7efe9]">Coverage equity</span> is 100 minus the
        percentage-point gap between the best- and worst-covered ward. It is a chosen model objective
        that rewards even coverage — not an objective measure of real-world fairness.
      </InfoNote>

      <p className="mt-1.5 font-mono text-[8px] uppercase leading-relaxed tracking-[0.06em] text-mist-600">
        Computed by the implemented allocator · deterministic · not validated performance
      </p>
    </div>
  )
}
