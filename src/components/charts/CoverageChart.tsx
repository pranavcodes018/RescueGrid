import { SUPPLY_META, SUPPLY_TYPES, URGENCY_META } from '../../lib/constants'
import { formatNumber, formatPct } from '../../lib/format'
import { cn } from '../../lib/cn'
import type { Plan, Scenario, SupplyType, WardId } from '../../types'
import { Badge } from '../ui/Badge'
import { Panel } from '../ui/Panel'

interface CoverageChartProps {
  scenario: Scenario
  plan: Plan
  selectedWardId: WardId | null
  onSelectWard: (wardId: WardId) => void
}

const UNMET_STYLE = {
  backgroundImage:
    'repeating-linear-gradient(135deg, rgba(167, 187, 207, 0.2) 0px, rgba(167, 187, 207, 0.2) 2px, transparent 2px, transparent 5px)',
}

export function CoverageChart({ scenario, plan, selectedWardId, onSelectWard }: CoverageChartProps) {
  return (
    <Panel
      kicker="Allocation chart"
      title="Coverage by neighbourhood"
      action={<Badge tone="teal">Computed</Badge>}
      className="h-full"
      bodyClassName="flex h-[calc(100%-46px)] flex-col p-3"
    >
      <div className="flex-1 space-y-0.5">
        {scenario.wards.map((ward) => {
          const wardPlan = plan.wards.find((entry) => entry.wardId === ward.id)
          if (!wardPlan) return null
          const total = Math.max(1, wardPlan.demandUnits)
          const urgency = URGENCY_META[ward.urgency] ?? URGENCY_META[3]
          const selected = selectedWardId === ward.id
          const segments = SUPPLY_TYPES.map((supply) => ({
            supply,
            width: (wardPlan.allocated[supply] / total) * 100,
          }))
          const unmetWidth = (wardPlan.unmetUnits / total) * 100
          return (
            <button
              key={ward.id}
              type="button"
              onClick={() => onSelectWard(ward.id)}
              aria-pressed={selected}
              aria-label={`${ward.name}: ${formatPct(wardPlan.coverage, 0)} coverage, ${formatNumber(
                wardPlan.allocatedUnits,
              )} of ${formatNumber(wardPlan.demandUnits)} units allocated, ${formatNumber(
                wardPlan.unmetUnits,
              )} unmet.`}
              title={`${ward.name} — ${formatNumber(wardPlan.allocatedUnits)} allocated / ${formatNumber(
                wardPlan.demandUnits,
              )} requested · ${urgency.label} urgency`}
              className={cn(
                'group grid w-full grid-cols-[88px_1fr_42px] items-center gap-2 rounded px-1 py-[5px] text-left transition-colors sm:grid-cols-[112px_1fr_48px]',
                selected ? 'bg-signal/[0.055]' : 'hover:bg-white/[0.03]',
              )}
            >
              <span className="flex min-w-0 items-center gap-1.5">
                <span
                  aria-hidden
                  className={cn('h-1 w-1 shrink-0 rounded-full', urgency.dotClass)}
                />
                <span className="truncate text-[9.5px] font-medium text-mist-300">
                  <span className="font-mono text-[8px] text-mist-500">{ward.code}</span>{' '}
                  {ward.shortName}
                </span>
              </span>

              <span
                className="flex h-[11px] w-full overflow-hidden rounded-[2px] border border-night-950/50 bg-[#152a3c]"
                aria-hidden
              >
                {segments.map((segment) => (
                  <span
                    key={segment.supply}
                    style={{
                      width: `${segment.width}%`,
                      background: SUPPLY_META[segment.supply as SupplyType].color,
                      opacity: 0.78,
                    }}
                  />
                ))}
                <span style={{ width: `${unmetWidth}%`, ...UNMET_STYLE, opacity: 0.8 }} />
              </span>

              <span
                className={cn(
                  'num text-right text-[9.5px]',
                  selected ? 'text-signal-bright' : 'text-mist-300',
                )}
              >
                {formatPct(wardPlan.coverage, 0)}
              </span>
            </button>
          )
        })}
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-line/60 pt-2">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
          {SUPPLY_TYPES.map((supply) => (
            <span key={supply} className="inline-flex items-center gap-1 text-[8px] text-mist-500">
              <span
                aria-hidden
                className="h-1.5 w-1.5 rounded-[1px]"
                style={{ background: SUPPLY_META[supply].color, opacity: 0.85 }}
              />
              {SUPPLY_META[supply].shortLabel}
            </span>
          ))}
          <span className="inline-flex items-center gap-1 text-[8px] text-mist-500">
            <span
              aria-hidden
              className="h-1.5 w-1.5 rounded-[1px] border border-mist-600"
              style={UNMET_STYLE}
            />
            Unmet
          </span>
        </div>
        <span className="font-mono text-[7.5px] uppercase tracking-[0.06em] text-mist-600">
          Bar = 100% of ward demand
        </span>
      </div>
    </Panel>
  )
}
