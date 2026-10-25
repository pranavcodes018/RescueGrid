import { Route, Truck, Warehouse } from 'lucide-react'
import { SUPPLY_META, SUPPLY_TYPES } from '../../lib/constants'
import { formatDecimal, formatNumber, formatPct } from '../../lib/format'
import { PRIORITY_WEIGHT_FORMULA } from '../../lib/priority'
import { cn } from '../../lib/cn'
import type { Plan, Scenario, UnservedReason } from '../../types'

const REASON_LABEL: Record<UnservedReason, string> = {
  unreachable: 'Unreachable',
  stock: 'Stock short',
  fleet: 'Transport short',
}

export function EngineMetrics({ plan, scenario }: { plan: Plan; scenario: Scenario }) {
  const metrics = plan.metrics
  const unreachable = metrics.reachability.filter((entry) => !entry.reachable)
  const offeredPct = metrics.fleetCapacityOffered > 0 ? metrics.fleetCapacityUsage * 100 : 0

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        {[
          {
            label: 'Route distance',
            value: `${formatDecimal(metrics.routeDistanceKm)} km`,
            hint: 'Loaded out + empty return across every planned run.',
          },
          {
            label: 'Route time',
            value: `${formatDecimal(metrics.routeTimeHours)} h`,
            hint: 'Run time at each vehicle’s speed plus 0.25 h handling per run.',
          },
          {
            label: 'Fleet freight used',
            value: `${formatNumber(metrics.fleetCapacityMoved)} / ${formatNumber(metrics.fleetCapacityOffered)}`,
            hint: `${formatPct(offeredPct / 100, 0)} of available capacity × run budget.`,
          },
          {
            label: 'Reachable wards',
            value: `${metrics.reachableWards} / ${metrics.reachability.length}`,
            hint: 'Wards with at least one open route to a depot.',
          },
        ].map((item) => (
          <div
            key={item.label}
            title={item.hint}
            className="rounded border border-line/70 bg-night-950/35 px-2 py-1.5"
          >
            <div className="font-mono text-[7px] uppercase tracking-[0.08em] text-mist-600">
              {item.label}
            </div>
            <div className="num mt-1 text-[12px] font-medium leading-none text-mist-100">
              {item.value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <div>
          <div className="mb-1 flex items-center gap-1 label-tiny">
            <Warehouse size={9} aria-hidden /> Depot stock remaining
          </div>
          <table className="w-full border-collapse text-left">
            <caption className="sr-only">Remaining stock per depot and supply type.</caption>
            <thead>
              <tr className="border-b border-line/60">
                <th scope="col" className="py-1 pr-1 font-mono text-[7px] uppercase tracking-[0.08em] text-mist-600">
                  Depot
                </th>
                {SUPPLY_TYPES.map((supply) => (
                  <th
                    key={supply}
                    scope="col"
                    className="px-1 py-1 text-right font-mono text-[7px] uppercase tracking-[0.08em] text-mist-600"
                  >
                    {SUPPLY_META[supply].shortLabel}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {metrics.depotInventory.map((entry) => {
                const depot = scenario.depots.find((candidate) => candidate.id === entry.depotId)
                return (
                  <tr key={entry.depotId} className="border-b border-line/35 last:border-b-0">
                    <th scope="row" className="py-1 pr-1 text-left text-[8.5px] font-normal text-mist-300">
                      {depot ? `${depot.code} · ${depot.shortName}` : entry.depotId}
                    </th>
                    {SUPPLY_TYPES.map((supply) => (
                      <td key={supply} className="num px-1 py-1 text-right text-[8.5px] text-mist-300">
                        {formatNumber(entry.remaining[supply])}
                        <span className="text-mist-600"> / {formatNumber(entry.openingStock[supply])}</span>
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-1 label-tiny">
            <Truck size={9} aria-hidden /> Unserved units by cause
          </div>
          <div className="grid grid-cols-3 gap-1">
            {(Object.keys(REASON_LABEL) as UnservedReason[]).map((reason) => (
              <div
                key={reason}
                className={cn(
                  'rounded border px-1.5 py-1',
                  reason === 'unreachable'
                    ? 'border-critical/25 bg-critical/[0.05]'
                    : 'border-line/60 bg-night-950/25',
                )}
              >
                <div className="font-mono text-[6.5px] uppercase tracking-[0.06em] text-mist-600">
                  {REASON_LABEL[reason]}
                </div>
                <div className="num mt-0.5 text-[10px] text-mist-200">
                  {formatNumber(metrics.unservedByReason[reason])}
                </div>
              </div>
            ))}
          </div>
          {unreachable.length > 0 ? (
            <p className="rounded border border-critical/20 bg-critical/[0.045] px-2 py-1 text-[8.5px] leading-relaxed text-[#f3b4b4]">
              No route: {unreachable
                .map((entry) => scenario.wards.find((ward) => ward.id === entry.wardId)?.shortName ?? entry.wardId)
                .join(', ')}
            </p>
          ) : null}
          <p className="flex items-start gap-1 rounded border border-line/60 bg-night-950/25 px-2 py-1 text-[8px] leading-relaxed text-mist-500">
            <Route size={9} aria-hidden className="mt-[2px] shrink-0 text-mist-600" />
            <span>
              Priority-weighted unmet uses <span className="text-mist-300">{PRIORITY_WEIGHT_FORMULA}</span>.
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}
