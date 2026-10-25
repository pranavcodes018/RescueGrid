import { BriefcaseMedical, Droplets, Package, Truck } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { STRATEGY_META, SUPPLY_META, SUPPLY_TYPES } from '../../lib/constants'
import { formatNumber, formatPct } from '../../lib/format'
import type { Plan, StrategyId, SupplyType } from '../../types'
import { ProgressBar, type ProgressTone } from '../ui/ProgressBar'
import { Badge } from '../ui/Badge'

const SUPPLY_ICON: Record<SupplyType, LucideIcon> = {
  water: Droplets,
  medical: BriefcaseMedical,
  food: Package,
}

const SUPPLY_TONE: Record<SupplyType, ProgressTone> = {
  water: 'sky',
  medical: 'violet',
  food: 'amber',
}

export function AllocationSummary({
  plan,
  strategy,
  priority,
}: {
  plan: Plan
  strategy: StrategyId
  priority: number
}) {
  return (
    <div>
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="label-tiny mb-1">Estimated coverage</div>
          <div className="num text-[28px] font-medium leading-none text-mist-50">
            {formatPct(plan.totals.coverage, 1)}
          </div>
          <div className="mt-1 text-[9.5px] text-mist-500">
            {formatNumber(plan.totals.allocated)} of {formatNumber(plan.totals.demand)} requested units
          </div>
        </div>
        <div className="text-right">
          <div className="label-tiny mb-1">Priority-unmet</div>
          <div className="num text-[12px] text-[#f6c97f]">
            {formatNumber(plan.totals.priorityWeightedUnmet)}
          </div>
          <div className="mt-1 text-[9px] text-mist-500">weighted units</div>
        </div>
      </div>
      <ProgressBar
        value={plan.totals.coverage}
        label="Overall plan coverage"
        tone="teal"
        className="mt-2.5"
        heightClass="h-[6px]"
        showTicks
      />

      <div className="mt-3 grid grid-cols-3 gap-1.5">
        {[
          ['Demand', formatNumber(plan.totals.demand)],
          ['Allocated', formatNumber(plan.totals.allocated)],
          ['Unmet', formatNumber(plan.totals.unmetUnits)],
        ].map(([label, value]) => (
          <div key={label} className="rounded border border-line/70 bg-night-950/35 px-1.5 py-1">
            <div className="font-mono text-[7.5px] uppercase tracking-[0.1em] text-mist-600">{label}</div>
            <div className="num mt-0.5 text-[10.5px] text-mist-200">{value}</div>
          </div>
        ))}
      </div>

      <div className="mt-3 space-y-2.5">
        {SUPPLY_TYPES.map((supply) => {
          const totals = plan.supplies[supply]
          const meta = SUPPLY_META[supply]
          const Icon = SUPPLY_ICON[supply]
          return (
            <div key={supply}>
              <div className="mb-1 flex items-center gap-1.5">
                <Icon size={11} aria-hidden style={{ color: meta.color }} />
                <span className="text-[9.5px] text-mist-300">{meta.label}</span>
                <span className="num ml-auto text-[9.5px] text-mist-200">
                  {formatPct(totals.coverage, 0)}
                </span>
              </div>
              <ProgressBar
                value={totals.coverage}
                label={`${meta.label} coverage`}
                tone={SUPPLY_TONE[supply]}
                heightClass="h-[4px]"
              />
              <div className="mt-0.5 flex justify-between font-mono text-[7.5px] text-mist-600">
                <span>
                  {formatNumber(totals.allocated)} allocated · {formatNumber(totals.remainingStock)} in reserve
                </span>
                <span>{formatNumber(totals.unmet)} unmet</span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-line/70 pt-2.5">
        <Badge tone="teal">{STRATEGY_META[strategy].shortLabel}</Badge>
        <Badge tone="neutral">{priority}% vulnerability priority</Badge>
        <span className="ml-auto inline-flex items-center gap-1 font-mono text-[8px] uppercase tracking-[0.06em] text-mist-600">
          <Truck size={10} aria-hidden />
          {plan.totals.vehiclesUsed}/{plan.totals.vehiclesAvailable} vehicles
        </span>
      </div>
    </div>
  )
}
