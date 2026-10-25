import {
  AlertTriangle,
  ArrowUpRight,
  BriefcaseMedical,
  Droplets,
  Gauge,
  MapPin,
  Package,
  PackageSearch,
  Truck,
  Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { CoverageChart } from '../components/charts/CoverageChart'
import { EventList } from '../components/events/EventList'
import { CommandMap } from '../components/map/CommandMap'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { InfoNote } from '../components/ui/InfoNote'
import { Panel } from '../components/ui/Panel'
import { ProgressBar, type ProgressTone } from '../components/ui/ProgressBar'
import { ScreenHeader } from '../components/ui/ScreenHeader'
import { StatCard } from '../components/ui/StatCard'
import { SCENARIO_PRESETS } from '../data/sagarika'
import { SUPPLY_META, SUPPLY_TYPES } from '../lib/constants'
import { formatNumber, formatPct } from '../lib/format'
import { cn } from '../lib/cn'
import { useSimulation } from '../state/SimulationContext'
import type { SupplyType } from '../types'

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

export function Overview() {
  const { state, actions } = useSimulation()
  const { plan, scenario } = state
  const preset = SCENARIO_PRESETS[state.scenarioId]
  const wardCount = scenario.wards.length
  const supplyRatio = plan.totals.demand > 0 ? plan.totals.stock / plan.totals.demand : 0
  const urgentWards = plan.wards
    .filter((ward) => ward.urgency >= 4)
    .sort((a, b) => b.priorityWeightedUnmet - a.priorityWeightedUnmet || b.urgency - a.urgency)
  const urgentDemand = urgentWards.reduce((sum, ward) => sum + ward.demandUnits, 0)
  const urgentMet = Math.max(0, urgentDemand - plan.totals.unmetUrgent)
  const urgentCoverage = urgentDemand > 0 ? urgentMet / urgentDemand : 0

  return (
    <div className="space-y-5 p-4 sm:p-5 xl:p-6">
      <ScreenHeader
        kicker="Situation board · fictional district"
        title={`${scenario.district} — ${preset.name}`}
        description={
          <>
            {scenario.tagline}. All wards, routes, stock and conditions are simulated; this board is a
            planning prototype, not a live dispatch system.
          </>
        }
        actions={
          <>
            <Badge tone={scenario.severity === 'Critical' ? 'red' : 'amber'} dot>
              {scenario.severity} conditions
            </Badge>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => actions.navigate('lab')}
              trailingIcon={<ArrowUpRight size={12} aria-hidden />}
            >
              Tune plan
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={actions.recalculate}
              loading={state.isRecalculating}
              disabled={state.isRecalculating}
            >
              Refresh board
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Supplies available"
          value={formatNumber(plan.totals.stock)}
          unit="units"
          caption={`${formatPct(supplyRatio, 0)} of requested demand stocked`}
          icon={<PackageSearch size={13} aria-hidden />}
          progress={supplyRatio}
          progressTone="teal"
        />
        <StatCard
          label="Total demand"
          value={formatNumber(plan.totals.demand)}
          unit="units"
          caption={`${wardCount} wards · ${SUPPLY_TYPES.length} supply types`}
          icon={<Package size={13} aria-hidden />}
          tone="default"
        />
        <StatCard
          label="Estimated coverage"
          value={formatPct(plan.totals.coverage, 1)}
          caption="Deterministic allocation result"
          icon={<Gauge size={13} aria-hidden />}
          tone="teal"
          progress={plan.totals.coverage}
          progressTone="teal"
        />
        <StatCard
          label="Unmet urgent demand"
          value={formatNumber(plan.totals.unmetUrgent)}
          unit="units"
          caption={`${formatPct(1 - urgentCoverage, 0)} of urgency 4–5 requests`}
          icon={<AlertTriangle size={13} aria-hidden />}
          tone="amber"
          progress={1 - urgentCoverage}
          progressTone="amber"
        />
        <StatCard
          label="Vehicles in use"
          value={`${plan.totals.vehiclesUsed} / ${plan.totals.vehiclesAvailable}`}
          caption={`${plan.totals.trips} planned runs · ${plan.totals.runSlots} slots`}
          icon={<Truck size={13} aria-hidden />}
          tone={plan.totals.vehiclesUsed === 0 ? 'amber' : 'sky'}
          progress={plan.totals.fleetUtilisation / 100}
          progressTone="sky"
        />
        <StatCard
          label="Incomplete wards"
          value={`${plan.totals.incompleteWards} / ${wardCount}`}
          caption="Wards below full coverage"
          icon={<MapPin size={13} aria-hidden />}
          tone={plan.totals.incompleteWards > 0 ? 'amber' : 'teal'}
          progress={plan.totals.incompleteWards / Math.max(1, wardCount)}
          progressTone="amber"
        />
      </div>

      <CommandMap heightClass="h-[330px] sm:h-[380px] xl:h-[430px]" />

      <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-[1.22fr_0.78fr]">
        <CoverageChart
          scenario={scenario}
          plan={plan}
          selectedWardId={state.selectedWardId}
          onSelectWard={actions.selectWard}
        />

        <Panel
          kicker="Stock"
          title="Supply inventory"
          action={<Badge tone="neutral">{formatPct(supplyRatio, 0)} stocked</Badge>}
          className="h-full"
          bodyClassName="p-3"
        >
          <div className="space-y-3">
            {SUPPLY_TYPES.map((supply) => {
              const totals = plan.supplies[supply]
              const meta = SUPPLY_META[supply]
              const Icon = SUPPLY_ICON[supply]
              return (
                <div key={supply} aria-label={`${meta.label}: ${formatNumber(totals.stock)} available`}>
                  <div className="mb-1 flex items-center gap-1.5">
                    <Icon size={12} aria-hidden style={{ color: meta.color }} />
                    <span className="text-[10px] font-medium text-mist-200">{meta.label}</span>
                    <span className="num ml-auto text-[10px] text-mist-200">
                      {formatNumber(totals.stock)}
                    </span>
                    <span className="font-mono text-[8px] text-mist-600">available</span>
                  </div>
                  <ProgressBar
                    value={totals.stock > 0 ? totals.coverage : 0}
                    label={`${meta.label} demand coverage`}
                    tone={SUPPLY_TONE[supply]}
                    heightClass="h-[5px]"
                  />
                  <div className="mt-1 flex items-center justify-between font-mono text-[7.5px] text-mist-600">
                    <span>
                      {formatNumber(totals.allocated)} allocated · {formatNumber(totals.unmet)} unmet
                    </span>
                    <span>{totals.remainingStock > 0 ? `${formatNumber(totals.remainingStock)} reserve` : 'fully committed'}</span>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="mt-3 border-t border-line/60 pt-2">
            <p className="text-[9px] leading-relaxed text-mist-500">
              {scenario.supplyNotes.water} {scenario.supplyNotes.medical}
            </p>
            <p className="mt-1 font-mono text-[7.5px] uppercase tracking-[0.06em] text-mist-600">
              Fictional stock · held at three depots
            </p>
          </div>
        </Panel>
      </div>

      <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-[1.22fr_0.78fr]">
        <Panel
          kicker="Priority"
          title="Urgent neighbourhoods"
          action={
            <Badge tone={urgentWards.length > 0 ? 'amber' : 'teal'}>
              {urgentWards.length} urgency 4–5
            </Badge>
          }
          className="h-full"
          bodyClassName="p-2"
        >
          {urgentWards.length === 0 ? (
            <p className="p-3 text-[10px] text-mist-500">No wards currently carry urgency 4 or 5.</p>
          ) : (
            <div className="space-y-1">
              {urgentWards.map((wardPlan) => {
                const ward = scenario.wards.find((entry) => entry.id === wardPlan.wardId)
                if (!ward) return null
                const selected = state.selectedWardId === ward.id
                const urgentRequest = SUPPLY_TYPES.reduce(
                  (sum, supply) => sum + wardPlan.bySupply[supply].demand,
                  0,
                )
                return (
                  <button
                    key={ward.id}
                    type="button"
                    onClick={() => actions.selectWard(ward.id)}
                    aria-pressed={selected}
                    className={cn(
                      'flex w-full items-center gap-2 rounded border px-2 py-1.5 text-left transition-colors',
                      selected
                        ? 'border-signal/30 bg-signal/[0.055]'
                        : 'border-transparent hover:border-line/70 hover:bg-white/[0.03]',
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        'h-1.5 w-1.5 shrink-0 rounded-full',
                        ward.urgency === 5 ? 'bg-critical' : 'bg-warn',
                      )}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className="truncate text-[10px] font-medium text-mist-200">
                          {ward.name}
                        </span>
                        <span className="num shrink-0 text-[9.5px] text-mist-300">
                          {formatPct(wardPlan.coverage, 0)}
                        </span>
                      </span>
                      <span className="mt-0.5 flex items-center justify-between gap-2 font-mono text-[7.5px] uppercase tracking-[0.04em] text-mist-600">
                        <span>
                          {formatNumber(wardPlan.unmetUnits)} unmet · vulnerability {ward.vulnerability.score}
                        </span>
                        <span>
                          U{ward.urgency} · {formatNumber(urgentRequest)} requested
                        </span>
                      </span>
                    </span>
                    <ProgressBar
                      value={wardPlan.coverage}
                      label={`${ward.shortName} coverage`}
                      tone={wardPlan.coverage < 0.65 ? 'amber' : 'teal'}
                      heightClass="h-[3px]"
                      className="w-14 shrink-0"
                    />
                  </button>
                )
              })}
            </div>
          )}
          <div className="mt-1 flex items-center justify-between px-2 pt-1 font-mono text-[7.5px] uppercase tracking-[0.05em] text-mist-600">
            <span className="inline-flex items-center gap-1">
              <Users size={9} aria-hidden />
              {formatNumber(urgentDemand)} units requested by urgent wards
            </span>
            <span>Select to inspect</span>
          </div>
        </Panel>

        <Panel
          kicker="Log"
          title="Recent simulation events"
          action={<Badge tone="neutral">Local</Badge>}
          className="h-full"
          bodyClassName="p-3"
        >
          <EventList
            events={state.events}
            limit={5}
            dense
            emptyTitle="No simulation events"
            emptyDescription="Plan refreshes, road changes and applied inputs appear here."
          />
          <p className="mt-1 border-t border-line/60 pt-1.5 font-mono text-[7.5px] uppercase tracking-[0.05em] text-mist-600">
            Simulated event log · no live feed
          </p>
        </Panel>
      </div>

      <InfoNote tone="amber">
        All values on this board are computed from the fictional preset by the deterministic
        allocator and Dijkstra router. Nothing here is a real report, a live feed or a measured result. Use the Reports
        screen for the printable summary and its assumptions.
      </InfoNote>
    </div>
  )
}
