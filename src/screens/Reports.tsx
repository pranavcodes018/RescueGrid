import { FileText, Printer } from 'lucide-react'
import type { ReactNode } from 'react'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { InfoNote } from '../components/ui/InfoNote'
import { RescueMark } from '../components/ui/Logo'
import { ScreenHeader } from '../components/ui/ScreenHeader'
import { SCENARIO_PRESETS } from '../data/sagarika'
import { RUNS_PER_VEHICLE, STRATEGY_META, STRATEGY_ORDER, SUPPLY_META, SUPPLY_TYPES } from '../lib/constants'
import { formatDateTime, formatDecimal, formatNumber, formatPct } from '../lib/format'
import { cn } from '../lib/cn'
import { useSimulation } from '../state/SimulationContext'
import type { Plan } from '../types'

function ReportSection({
  index,
  title,
  children,
  className,
}: {
  index: number
  title: string
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn('print-avoid-break', className)}>
      <div className="mb-2 flex items-center gap-2 border-b border-[#17232a]/35 pb-1">
        <span className="font-mono text-[8px] font-medium text-[#0f766e]">
          {String(index).padStart(2, '0')}
        </span>
        <h2 className="font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-[#24343a]">
          {title}
        </h2>
      </div>
      {children}
    </section>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-[#17232a]/15 bg-[#fbf8f0] px-2 py-1.5">
      <div className="font-mono text-[7px] uppercase tracking-[0.08em] text-[#69767a]">{label}</div>
      <div className="num mt-0.5 text-[11px] font-medium text-[#17232a]">{value}</div>
    </div>
  )
}

function nodeLabel(state: ReturnType<typeof useSimulation>['state'], id: string): string {
  const ward = state.scenario.wards.find((entry) => entry.id === id)
  if (ward) return ward.shortName
  const depot = state.scenario.depots.find((entry) => entry.id === id)
  if (depot) return `Depot ${depot.code}`
  return id
}

export function Reports() {
  const { state, comparisons } = useSimulation()
  const { plan, scenario } = state
  const preset = SCENARIO_PRESETS[state.scenarioId]
  const generatedAt = state.lastRecalculatedAt
  const urgentWards = plan.wards
    .filter((ward) => ward.urgency >= 4)
    .sort((a, b) => b.priorityWeightedUnmet - a.priorityWeightedUnmet || b.urgency - a.urgency)
  const disruptedRoads = scenario.roads.filter((road) => road.state !== 'open')
  const blockedRoads = scenario.roads.filter((road) => road.state === 'blocked')
  const urgentUnmetDetail = urgentWards
    .filter((ward) => ward.unmetUnits > 0)
    .flatMap((wardPlan) => {
      const ward = scenario.wards.find((entry) => entry.id === wardPlan.wardId)
      return ward ? [{ ward, wardPlan }] : []
    })

  const summary = `This simulated plan allocates ${formatNumber(plan.totals.allocated)} of ${formatNumber(
    plan.totals.demand,
  )} requested kits and packs (${formatPct(plan.totals.coverage, 1)}) across ${scenario.wards.length} fictional wards using the ${
    STRATEGY_META[state.strategy].label
  } at ${state.priority}% vulnerability priority. ${plan.totals.vehiclesUsed} of ${
    plan.totals.vehiclesAvailable
  } available vehicles are assigned ${plan.totals.trips} planned runs over the demo road graph. ${
    blockedRoads.length
  } segment${blockedRoads.length === 1 ? ' is' : 's are'} blocked; ${plan.totals.incompleteWards} ward${
    plan.totals.incompleteWards === 1 ? '' : 's'
  } remain below full coverage, and ${plan.totals.unreachableWards} ward${
    plan.totals.unreachableWards === 1 ? ' has' : 's have'
  } no open route to a depot.`

  const comparisonRows: Array<{ label: string; value: (candidate: Plan) => string }> = [
    { label: 'Demand coverage', value: (candidate) => formatPct(candidate.totals.coverage, 1) },
    {
      label: 'Priority-weighted unmet',
      value: (candidate) => formatNumber(candidate.totals.priorityWeightedUnmet),
    },
    {
      label: 'Estimated vehicle-hours',
      value: (candidate) => `${formatDecimal(candidate.totals.vehicleHours)} h`,
    },
    {
      label: 'Coverage equity',
      value: (candidate) =>
        candidate.totals.fairness === null ? '—' : `${formatDecimal(candidate.totals.fairness)} / 100`,
    },
  ]

  const totalStock = plan.totals.stock
  const totalAllocated = plan.totals.allocated
  const totalDemand = plan.totals.demand
  const totalUnmet = plan.totals.unmetUnits

  return (
    <div className="space-y-3 p-3 sm:p-4">
      <div className="no-print space-y-3">
        <ScreenHeader
          kicker="Reports · situation summary"
          title="Printable situation report"
          description="A consistent snapshot of the selected scenario, allocations, unmet demand, road states and the three-strategy comparison. Includes its assumptions and limitations."
          actions={
            <>
              <Badge tone="amber" dot>
                Simulation record
              </Badge>
              <Button
                variant="primary"
                size="sm"
                onClick={() => window.print()}
                icon={<Printer size={12} aria-hidden />}
              >
                Print report
              </Button>
            </>
          }
        />
        <InfoNote>
          Printing opens the browser print dialog. To produce a PDF, choose “Save as PDF” there — this
          prototype does not generate or export a PDF file itself. The printed sheet uses the same
          displayed scenario data as the console.
        </InfoNote>
      </div>

      <article className="report-sheet mx-auto w-full max-w-[880px] overflow-hidden rounded-lg shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)]">
        <header className="border-b-[3px] border-[#0f766e] px-4 py-4 sm:px-7 sm:py-5">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
            <div className="flex items-start gap-2.5">
              <RescueMark size={34} />
              <div>
                <div className="font-mono text-[7.5px] uppercase tracking-[0.18em] text-[#617175]">
                  Sagarika District · Fictional simulation
                </div>
                <h1 className="mt-0.5 text-[20px] font-semibold leading-tight tracking-[-0.025em] text-[#14231f]">
                  Situation report
                </h1>
                <p className="mt-0.5 text-[9.5px] text-[#5d6c6d]">
                  Resource allocation plan · {preset.name}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-start gap-1.5 sm:items-end">
              <div className="rotate-[-1.5deg] rounded border-2 border-[#a16207]/70 px-2.5 py-1 text-center">
                <div className="font-mono text-[8px] font-semibold uppercase leading-tight tracking-[0.14em] text-[#8a5608]">
                  Simulation
                </div>
                <div className="font-mono text-[6.5px] uppercase tracking-[0.1em] text-[#9c762d]">
                  Not a real dispatch record
                </div>
              </div>
              <div className="font-mono text-[7px] uppercase tracking-[0.08em] text-[#7a8789]">
                Generated {formatDateTime(generatedAt)}
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-[#17232a]/15 pt-3 sm:grid-cols-3">
            {[
              ['Scenario', preset.name],
              ['Snapshot', scenario.snapshotLabel],
              ['Generated locally', formatDateTime(generatedAt)],
              ['Plan revision', `rev ${state.planRevision}`],
              ['Active strategy', STRATEGY_META[state.strategy].label],
              ['Priority basis', `${state.priority}% vulnerability priority`],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="font-mono text-[7px] uppercase tracking-[0.1em] text-[#7a8789]">{label}</dt>
                <dd className="mt-0.5 text-[9px] font-medium text-[#233238]">{value}</dd>
              </div>
            ))}
          </div>
        </header>

        <div className="space-y-5 px-4 py-4 sm:px-7 sm:py-5">
          <section className="rounded border border-[#a16207]/25 bg-[#fdf6e7] px-3 py-2">
            <div className="flex items-start gap-2">
              <FileText size={12} aria-hidden className="mt-px shrink-0 text-[#9c762d]" />
              <p className="text-[8.5px] leading-relaxed text-[#6f5b33]">
                <span className="font-semibold text-[#6a4b12]">Fictional prototype record.</span>{' '}
                Sagarika District does not exist. All wards, depots, roads, vehicles, quantities and
                conditions are invented for demonstration. This is a deterministic planning record, not
                a field report, dispatch order or measured performance result.
              </p>
            </div>
          </section>

          <ReportSection index={1} title="Executive summary">
            <p className="text-[9.5px] leading-relaxed text-[#304044]">{summary}</p>
            <div className="mt-2.5 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
              <MiniStat label="Coverage" value={formatPct(plan.totals.coverage, 1)} />
              <MiniStat label="Unmet urgent" value={`${formatNumber(plan.totals.unmetUrgent)} units`} />
              <MiniStat
                label="Vehicles assigned"
                value={`${plan.totals.vehiclesUsed} / ${plan.totals.vehiclesAvailable}`}
              />
              <MiniStat label="Blocked roads" value={String(blockedRoads.length)} />
            </div>
            <p className="mt-2 text-[8.5px] leading-relaxed text-[#69767a]">
              Coverage is allocated units ÷ requested units. Urgent demand means wards at urgency 4 or 5.
              Routing uses Dijkstra over the demo graph; every delivery respects depot stock, ward demand,
              vehicle capacity and the vehicle run budget. {formatDecimal(plan.totals.routeDistanceKm)} km of
              round-trip route distance and {formatDecimal(plan.totals.routeTimeHours)} vehicle-hours are
              planned; {formatPct(plan.totals.fleetCapacityUsage, 0)} of offered vehicle capacity is used.
            </p>
          </ReportSection>

          <ReportSection index={2} title="Assumptions">
            <ol className="space-y-1">
              {scenario.assumptions.map((assumption, index) => (
                <li key={index} className="flex gap-2 text-[9px] leading-relaxed text-[#35464a]">
                  <span className="num shrink-0 font-mono text-[8px] text-[#8a9698]">
                    A{index + 1}
                  </span>
                  {assumption}
                </li>
              ))}
              <li className="flex gap-2 text-[9px] leading-relaxed text-[#35464a]">
                <span className="num shrink-0 font-mono text-[8px] text-[#8a9698]">A5</span>
                All state is browser-local. No login, backend, live feed, paid API or AI model is used.
              </li>
              <li className="flex gap-2 text-[9px] leading-relaxed text-[#35464a]">
                <span className="num shrink-0 font-mono text-[8px] text-[#8a9698]">A6</span>
                Allocation is greedy and priority-ordered: each delivery is capped by remaining depot
                stock, ward demand, vehicle capacity and a {RUNS_PER_VEHICLE}-run budget per available
                vehicle. It is not a solver for a globally optimal plan.
              </li>
              <li className="flex gap-2 text-[9px] leading-relaxed text-[#35464a]">
                <span className="num shrink-0 font-mono text-[8px] text-[#8a9698]">A7</span>
                Routes are the lowest-cost open path found by Dijkstra; there is no live traffic, tide or
                closure feed, and unreachable wards receive no delivery.
              </li>
            </ol>
          </ReportSection>

          <ReportSection index={3} title="Supply position">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left">
                <caption className="sr-only">Supply availability, allocation and unmet demand by type.</caption>
                <thead>
                  <tr>
                    {['Supply', 'Available stock', 'Requested', 'Allocated', 'Unmet', 'Coverage'].map(
                      (label) => (
                        <th
                          key={label}
                          scope="col"
                          className="pb-1 pr-2 font-mono text-[7px] uppercase tracking-[0.08em] text-[#778589]"
                        >
                          {label}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {SUPPLY_TYPES.map((supply) => {
                    const totals = plan.supplies[supply]
                    return (
                      <tr key={supply}>
                        <th scope="row" className="py-1.5 pr-2 text-left text-[9px] font-medium text-[#233238]">
                          {SUPPLY_META[supply].label}
                        </th>
                        <td className="num py-1.5 pr-2 text-[9px] text-[#3e4e52]">
                          {formatNumber(totals.stock)}
                        </td>
                        <td className="num py-1.5 pr-2 text-[9px] text-[#3e4e52]">
                          {formatNumber(totals.demand)}
                        </td>
                        <td className="num py-1.5 pr-2 text-[9px] text-[#233238]">
                          {formatNumber(totals.allocated)}
                        </td>
                        <td className="num py-1.5 pr-2 text-[9px] text-[#8a5608]">
                          {formatNumber(totals.unmet)}
                        </td>
                        <td className="num py-1.5 pr-2 text-[9px] text-[#233238]">
                          {formatPct(totals.coverage, 0)}
                        </td>
                      </tr>
                    )
                  })}
                  <tr className="border-t border-[#17232a]/30">
                    <th scope="row" className="py-1.5 pr-2 text-left text-[9px] font-semibold text-[#17232a]">
                      Total
                    </th>
                    <td className="num py-1.5 pr-2 text-[9px] font-medium text-[#233238]">
                      {formatNumber(totalStock)}
                    </td>
                    <td className="num py-1.5 pr-2 text-[9px] font-medium text-[#233238]">
                      {formatNumber(totalDemand)}
                    </td>
                    <td className="num py-1.5 pr-2 text-[9px] font-medium text-[#233238]">
                      {formatNumber(totalAllocated)}
                    </td>
                    <td className="num py-1.5 pr-2 text-[9px] font-medium text-[#8a5608]">
                      {formatNumber(totalUnmet)}
                    </td>
                    <td className="num py-1.5 pr-2 text-[9px] font-medium text-[#233238]">
                      {formatPct(plan.totals.coverage, 1)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </ReportSection>

          <ReportSection index={4} title="Allocation by neighbourhood">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-left">
                <caption className="sr-only">
                  Allocated out of requested units for each neighbourhood and supply type.
                </caption>
                <thead>
                  <tr>
                    {['Ward', 'U', 'Vuln.', 'Water', 'Medical', 'Food', 'Coverage', 'Unmet'].map(
                      (label) => (
                        <th
                          key={label}
                          scope="col"
                          className={cn(
                            'pb-1 pr-2 font-mono text-[7px] uppercase tracking-[0.08em] text-[#778589]',
                            ['Water', 'Medical', 'Food', 'Coverage', 'Unmet'].includes(label) && 'text-right',
                          )}
                        >
                          {label}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {plan.wards.map((wardPlan) => {
                    const ward = scenario.wards.find((entry) => entry.id === wardPlan.wardId)
                    if (!ward) return null
                    return (
                      <tr key={ward.id}>
                        <th scope="row" className="py-1.5 pr-2 text-left">
                          <span className="text-[8.5px] font-medium text-[#233238]">{ward.shortName}</span>
                          <span className="ml-1 font-mono text-[6.5px] text-[#8a9698]">{ward.code}</span>
                        </th>
                        <td className="num py-1.5 pr-2 text-[8.5px] text-[#3e4e52]">{wardPlan.urgency}/5</td>
                        <td className="num py-1.5 pr-2 text-[8.5px] text-[#3e4e52]">
                          {wardPlan.vulnerabilityScore}
                        </td>
                        {SUPPLY_TYPES.map((supply) => (
                          <td key={supply} className="num py-1.5 pr-2 text-right text-[8px] text-[#3e4e52]">
                            {formatNumber(wardPlan.bySupply[supply].allocated)}
                            <span className="text-[#8a9698]">
                              {' '}
                              / {formatNumber(wardPlan.bySupply[supply].demand)}
                            </span>
                          </td>
                        ))}
                        <td className="num py-1.5 pr-2 text-right text-[8.5px] font-medium text-[#233238]">
                          {formatPct(wardPlan.coverage, 0)}
                        </td>
                        <td className="num py-1.5 pr-2 text-right text-[8.5px] text-[#8a5608]">
                          {formatNumber(wardPlan.unmetUnits)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <p className="mt-1.5 text-[8px] leading-relaxed text-[#778589]">
              “U” is the urgency level (1 low – 5 critical). “Vuln.” is the simulated vulnerability index
              (0–100). Supply cells show allocated / requested units. Row values follow the active plan
              at revision {state.planRevision}.
            </p>
          </ReportSection>

          <ReportSection index={5} title="Unmet demand & urgent wards">
            <div className="grid gap-2 sm:grid-cols-[1fr_1.4fr]">
              <div className="rounded border border-[#c2410c]/20 bg-[#fdf3e7] px-2.5 py-2">
                <div className="font-mono text-[7px] uppercase tracking-[0.09em] text-[#9a6a3a]">
                  Urgent shortfall
                </div>
                <div className="num mt-1 text-[16px] font-medium leading-none text-[#7c3d0d]">
                  {formatNumber(plan.totals.unmetUrgent)}
                </div>
                <p className="mt-1 text-[8px] leading-relaxed text-[#8a6b4b]">
                  units unmet across wards at urgency 4–5. Priority-weighted unmet including vulnerability
                  is {formatNumber(plan.totals.priorityWeightedUnmet)} weighted units.
                </p>
              </div>
              <div>
                {urgentUnmetDetail.length === 0 ? (
                  <p className="text-[9px] leading-relaxed text-[#5d6c6d]">
                    Every urgency 4–5 ward has full coverage in this plan.
                  </p>
                ) : (
                  <ul className="space-y-1">
                    {urgentUnmetDetail.map(({ ward, wardPlan }) => (
                      <li
                        key={ward.id}
                        className="flex items-baseline justify-between gap-2 border-b border-[#17232a]/10 py-1 text-[8.5px] last:border-b-0"
                      >
                        <span className="text-[#35464a]">
                          {ward.name}{' '}
                          <span className="font-mono text-[7px] text-[#8a9698]">U{ward.urgency}</span>
                        </span>
                        <span className="num text-[#8a5608]">
                          {formatNumber(wardPlan.unmetUnits)} units ·{' '}
                          {formatPct(wardPlan.coverage, 0)} covered
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </ReportSection>

          <ReportSection index={6} title="Road status & routing">
            <div className="mb-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[7.5px] uppercase tracking-[0.06em] text-[#69767a]">
              <span>{blockedRoads.length} blocked</span>
              <span>
                {scenario.roads.filter((road) => road.state === 'congested').length} congested
              </span>
              <span>
                {scenario.roads.filter((road) => road.state === 'open').length} open
              </span>
              <span>Dijkstra demo graph · no live traffic</span>
            </div>
            {disruptedRoads.length === 0 ? (
              <p className="text-[9px] leading-relaxed text-[#5d6c6d]">
                No blocked or congested segments in this preset. All {scenario.roads.length} demo
                segments are open.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[480px] text-left">
                  <caption className="sr-only">Blocked and congested road segments.</caption>
                  <thead>
                    <tr>
                      {['Segment', 'Ref', 'Route', 'Length', 'Status'].map((label) => (
                        <th
                          key={label}
                          scope="col"
                          className="pb-1 pr-2 font-mono text-[7px] uppercase tracking-[0.08em] text-[#778589]"
                        >
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {disruptedRoads.map((road) => (
                      <tr key={road.id}>
                        <th scope="row" className="py-1.5 pr-2 text-left text-[8.5px] font-medium text-[#233238]">
                          {road.name}
                        </th>
                        <td className="py-1.5 pr-2 font-mono text-[8px] text-[#69767a]">{road.ref}</td>
                        <td className="py-1.5 pr-2 text-[8px] text-[#3e4e52]">
                          {nodeLabel(state, road.from)} → {nodeLabel(state, road.to)}
                        </td>
                        <td className="num py-1.5 pr-2 text-[8px] text-[#3e4e52]">
                          {formatDecimal(road.distanceKm)} km
                        </td>
                        <td
                          className={cn(
                            'py-1.5 pr-2 font-mono text-[7.5px] uppercase tracking-[0.06em]',
                            road.state === 'blocked' ? 'text-[#9f1d1d]' : 'text-[#8a5608]',
                          )}
                        >
                          {road.state}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <p className="mt-1.5 text-[8px] leading-relaxed text-[#778589]">
              Blocked segments are removed from the route graph; congested segments carry a fixed 1.55×
              travel penalty. Planned delivery routes are illustrative and are not a field route plan.
            </p>
          </ReportSection>

          <ReportSection index={7} title="Strategy comparison · computed results">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-left">
                <caption className="sr-only">
                  Comparing the three allocation strategies, each run on independent copies of the
                  selected scenario.
                </caption>
                <thead>
                  <tr>
                    <th scope="col" className="pb-1 pr-2 font-mono text-[7px] uppercase tracking-[0.08em] text-[#778589]">
                      Metric
                    </th>
                    {STRATEGY_ORDER.map((strategy) => (
                      <th
                        key={strategy}
                        scope="col"
                        className="pb-1 pr-2 text-right font-mono text-[7px] uppercase tracking-[0.08em] text-[#778589]"
                      >
                        {STRATEGY_META[strategy].shortLabel}
                        {strategy === state.strategy ? ' (active)' : ''}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row) => (
                    <tr key={row.label}>
                      <th scope="row" className="py-1.5 pr-2 text-left text-[8.5px] font-normal text-[#35464a]">
                        {row.label}
                      </th>
                      {STRATEGY_ORDER.map((strategy) => (
                        <td
                          key={strategy}
                          className={cn(
                            'num py-1.5 pr-2 text-right text-[8.5px]',
                            strategy === state.strategy
                              ? 'bg-[#0f766e]/[0.06] font-medium text-[#233238]'
                              : 'text-[#3e4e52]',
                          )}
                        >
                          {row.value(comparisons[strategy])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-1.5 text-[8px] leading-relaxed text-[#69767a]">
              <span className="font-semibold text-[#35464a]">Coverage equity</span> = 100 minus the
              percentage-point gap between the best- and worst-covered ward. It is a chosen model
              objective that rewards even coverage, not an objective measure of real-world fairness. All
              strategy values are computed by the implemented allocator and router on identical starting
              inputs; no validated performance gain is claimed.
            </p>
          </ReportSection>

          <footer className="border-t border-[#17232a]/25 pt-2.5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <p className="max-w-[70%] text-[7.5px] leading-relaxed text-[#778589]">
                Generated locally in the browser from the displayed simulated scenario. Not an official
                emergency document. Printing uses the browser print dialog; choosing “Save as PDF” there
                produces a PDF copy.
              </p>
              <p className="font-mono text-[7px] uppercase tracking-[0.08em] text-[#8a9698]">
                RescueGrid v0.1 · rev {state.planRevision} · {formatDateTime(generatedAt)}
              </p>
            </div>
          </footer>
        </div>
      </article>

      <p className="no-print text-center font-mono text-[7.5px] uppercase tracking-[0.08em] text-mist-600">
        Report content follows the active strategy and priority. Change either in the Allocation Lab or
        analysis panel, then print again.
      </p>
    </div>
  )
}
