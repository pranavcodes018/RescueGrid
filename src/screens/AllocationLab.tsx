import { ArrowDownRight, ArrowUpRight, Check, RotateCcw, Save, SlidersHorizontal, TriangleAlert } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { EngineMetrics } from '../components/analysis/EngineMetrics'
import { PlanChangeSummary } from '../components/analysis/PlanChangeSummary'
import { StrategyCards } from '../components/analysis/StrategyCards'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { EmptyState } from '../components/ui/EmptyState'
import { InfoNote } from '../components/ui/InfoNote'
import { Panel } from '../components/ui/Panel'
import { ProgressBar } from '../components/ui/ProgressBar'
import { RangeSlider } from '../components/ui/RangeSlider'
import { ScreenHeader } from '../components/ui/ScreenHeader'
import { Segmented } from '../components/ui/Segmented'
import { SCENARIO_PRESETS } from '../data/sagarika'
import {
  DEMAND_MAX,
  DEMAND_MIN,
  STRATEGY_META,
  STRATEGY_ORDER,
  SUPPLY_META,
  SUPPLY_TYPES,
  URGENCY_META,
} from '../lib/constants'
import { formatDecimal, formatNumber, formatPct } from '../lib/format'
import { cn } from '../lib/cn'
import { computeComparisons, computePlan } from '../lib/plan'
import { applyEdits, editsAreEqual, editsFromScenario } from '../lib/scenario'
import { useSimulation } from '../state/SimulationContext'
import type { ScenarioEdits, SupplyType, WardId } from '../types'

function countChangedValues(base: ScenarioEdits, draft: ScenarioEdits): number {
  let count = 0
  for (const wardId of Object.keys(base.demand) as WardId[]) {
    for (const supply of SUPPLY_TYPES) {
      if (base.demand[wardId][supply] !== draft.demand[wardId][supply]) count += 1
    }
    if (base.urgency[wardId] !== draft.urgency[wardId]) count += 1
  }
  for (const depotId of Object.keys(base.stock) as Array<keyof ScenarioEdits['stock']>) {
    for (const supply of SUPPLY_TYPES) {
      if (base.stock[depotId][supply] !== draft.stock[depotId][supply]) count += 1
    }
  }
  return count
}

function signed(value: number, digits = 1, suffix = ''): string {
  if (!Number.isFinite(value) || Math.abs(value) < 0.0001) return `—${suffix ? ` ${suffix}` : ''}`
  return `${value > 0 ? '+' : ''}${value.toFixed(digits)}${suffix ? ` ${suffix}` : ''}`
}

export function AllocationLab() {
  const { state, actions } = useSimulation()
  const [draft, setDraft] = useState<ScenarioEdits>(() => editsFromScenario(state.scenario))
  const [priorityDraft, setPriorityDraft] = useState(state.priority)
  const [focusSupply, setFocusSupply] = useState<SupplyType>('water')
  const [confirmReset, setConfirmReset] = useState(false)

  useEffect(() => {
    setDraft(editsFromScenario(state.scenario))
    setPriorityDraft(state.priority)
  }, [state.scenarioEpoch])

  useEffect(() => {
    setPriorityDraft(state.priority)
  }, [state.priority])

  const editingWard = state.scenario.wards.find((ward) => ward.id === state.selectedWardId) ?? state.scenario.wards[0]
  const draftUrgency = draft.urgency[editingWard.id] ?? editingWard.urgency

  const previewScenario = useMemo(() => applyEdits(state.scenario, draft), [state.scenario, draft])
  const previewPlan = useMemo(
    () => computePlan(previewScenario, state.strategy, state.priority),
    [previewScenario, state.strategy, state.priority],
  )
  const previewComparisons = useMemo(
    () => computeComparisons(previewScenario, state.priority),
    [previewScenario, state.priority],
  )

  const baseEdits = useMemo(() => editsFromScenario(state.scenario), [state.scenario])
  const dirty = !editsAreEqual(baseEdits, draft)
  const changedValues = countChangedValues(baseEdits, draft)
  const preset = SCENARIO_PRESETS[state.scenarioId]
  const supplyMeta = SUPPLY_META[focusSupply]
  const stockTotal = state.scenario.depots.reduce((sum, depot) => sum + draft.stock[depot.id][focusSupply], 0)

  const coverageDelta = (previewPlan.totals.coverage - state.plan.totals.coverage) * 100
  const unmetDelta = previewPlan.totals.priorityWeightedUnmet - state.plan.totals.priorityWeightedUnmet
  const hoursDelta = previewPlan.totals.vehicleHours - state.plan.totals.vehicleHours
  const fairnessDelta =
    previewPlan.totals.fairness !== null && state.plan.totals.fairness !== null
      ? previewPlan.totals.fairness - state.plan.totals.fairness
      : null

  const updateDemand = (wardId: WardId, supply: SupplyType, value: number) => {
    setDraft((previous) => ({
      ...previous,
      demand: {
        ...previous.demand,
        [wardId]: { ...previous.demand[wardId], [supply]: value },
      },
    }))
  }

  const updateUrgency = (wardId: WardId, value: number) => {
    setDraft((previous) => ({
      ...previous,
      urgency: { ...previous.urgency, [wardId]: value },
    }))
  }

  const updateStock = (depotId: (typeof state.scenario.depots)[number]['id'], value: number) => {
    setDraft((previous) => ({
      ...previous,
      stock: {
        ...previous.stock,
        [depotId]: { ...previous.stock[depotId], [focusSupply]: value },
      },
    }))
  }

  const applyDraft = () => {
    if (!dirty) return
    actions.applyScenarioEdits(
      draft,
      `${changedValues} input value${changedValues === 1 ? '' : 's'} applied from the Allocation Lab. Computed coverage at apply time: ${formatPct(
        previewPlan.totals.coverage,
        1,
      )}.`,
    )
  }

  const commitPriority = () => {
    if (priorityDraft !== state.priority) actions.setPriority(priorityDraft)
  }

  const previewEmpty = previewPlan.totals.allocated === 0

  return (
    <div className="space-y-3 p-3 sm:p-4">
      <ScreenHeader
        kicker="Allocation lab · deterministic engine"
        title="Tune the inputs, see the trade-offs"
        description={`Adjust demand, depot stock, urgency and plan basis for the fictional ${preset.name} snapshot. Scenario inputs stay in draft until you apply them; strategy and priority apply immediately.`}
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setConfirmReset(true)}
              icon={<RotateCcw size={12} aria-hidden />}
            >
              Reset scenario
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={actions.recalculate}
              loading={state.isRecalculating}
              disabled={state.isRecalculating}
            >
              Recalculate plan
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={applyDraft}
              disabled={!dirty || state.isRecalculating}
              icon={<Save size={12} aria-hidden />}
            >
              Apply changes
            </Button>
          </>
        }
      />

      <div
        role="status"
        className={cn(
          'flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2',
          dirty
            ? 'border-warn/25 bg-warn/[0.045]'
            : 'border-signal/15 bg-signal/[0.03]',
        )}
      >
        <div className="flex min-w-0 items-center gap-2">
          <span
            aria-hidden
            className={cn('h-1.5 w-1.5 shrink-0 rounded-full', dirty ? 'bg-warn' : 'bg-signal')}
          />
          <p className="min-w-0 text-[10px] leading-snug text-mist-300">
            {dirty ? (
              <>
                <span className="font-medium text-[#f0d5a8]">{changedValues} unsaved input value{changedValues === 1 ? '' : 's'}.</span>{' '}
                The console and printable report still show the last applied plan; the draft summary below uses your edits.
              </>
            ) : (
              <>
                <span className="font-medium text-[#a9e9e0]">Draft matches the applied plan.</span>{' '}
                Preview coverage {formatPct(previewPlan.totals.coverage, 1)} · rev {state.planRevision}.
                <span className="mt-0.5 block truncate text-[9px] text-mist-500">
                  Latest event · {state.events[0]?.title ?? 'None recorded'}
                </span>
              </>
            )}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {dirty ? (
            <Button
              variant="ghost"
              size="xs"
              onClick={() => setDraft(editsFromScenario(state.scenario))}
            >
              Discard draft
            </Button>
          ) : null}
          <Badge tone={dirty ? 'amber' : 'teal'}>{dirty ? 'Draft' : 'Applied'}</Badge>
        </div>
      </div>

      <div className="grid gap-3 xl:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
        <div className="space-y-3">
          <Panel
            kicker="Scenario input"
            title="Neighbourhood demand & urgency"
            action={<Badge tone="violet">Draft</Badge>}
            subtitle="Choose a ward, then adjust its requested units by supply type."
            bodyClassName="space-y-3 p-3"
          >
            <div className="grid grid-cols-2 gap-1">
              {state.scenario.wards.map((ward) => {
                const active = ward.id === editingWard.id
                const urgency = URGENCY_META[draft.urgency[ward.id]] ?? URGENCY_META[3]
                return (
                  <button
                    key={ward.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => actions.selectWard(ward.id)}
                    className={cn(
                      'flex min-w-0 items-center gap-1.5 rounded border px-2 py-1.5 text-left transition-colors',
                      active
                        ? 'border-signal/35 bg-signal/[0.06] text-mist-50'
                        : 'border-line/70 bg-night-950/25 text-mist-400 hover:border-line hover:text-mist-200',
                    )}
                  >
                    <span aria-hidden className={cn('h-1.5 w-1.5 shrink-0 rounded-full', urgency.dotClass)} />
                    <span className="min-w-0 flex-1 truncate font-mono text-[8px] uppercase tracking-[0.04em]">
                      {ward.code} {ward.shortName}
                    </span>
                  </button>
                )
              })}
            </div>

            <Segmented<SupplyType>
              ariaLabel="Supply type to edit"
              fullWidth
              size="sm"
              value={focusSupply}
              onChange={setFocusSupply}
              options={SUPPLY_TYPES.map((supply) => ({
                value: supply,
                label: SUPPLY_META[supply].shortLabel,
              }))}
            />

            <RangeSlider
              label={`${editingWard.shortName} · ${supplyMeta.label}`}
              value={draft.demand[editingWard.id][focusSupply]}
              min={DEMAND_MIN}
              max={DEMAND_MAX}
              step={50}
              formatValue={(value) => `${formatNumber(value)} ${supplyMeta.unit}`}
              onChange={(value) => updateDemand(editingWard.id, focusSupply, value)}
              hint={`Requested units for this ward. Current stock total for ${supplyMeta.shortLabel.toLowerCase()}: ${formatNumber(
                stockTotal,
              )} units.`}
            />

            <div className="grid grid-cols-3 gap-1">
              {SUPPLY_TYPES.map((supply) => (
                <div
                  key={supply}
                  className={cn(
                    'rounded border px-1.5 py-1',
                    supply === focusSupply
                      ? 'border-line bg-night-900/60'
                      : 'border-line/50 bg-night-950/20',
                  )}
                >
                  <div className="font-mono text-[7px] uppercase tracking-[0.09em] text-mist-600">
                    {SUPPLY_META[supply].shortLabel}
                  </div>
                  <div className="num mt-0.5 text-[10px] text-mist-200">
                    {formatNumber(draft.demand[editingWard.id][supply])}
                  </div>
                </div>
              ))}
            </div>

            <RangeSlider
              label="Urgency"
              value={draftUrgency}
              min={1}
              max={5}
              step={1}
              formatValue={(value) => `${value}/5 · ${URGENCY_META[value]?.label ?? ''}`}
              onChange={(value) => updateUrgency(editingWard.id, value)}
              hint={`Vulnerability score is fixed at ${editingWard.vulnerability.score}/100 for this prototype. Urgency feeds the optimizer's need weight.`}
              leftLabel="Low"
              rightLabel="Critical"
            />

            <div className="flex flex-wrap gap-1 border-t border-line/60 pt-2">
              <Badge tone="neutral">Pop. {formatNumber(editingWard.population)}</Badge>
              <Badge tone="violet">Vulnerability {editingWard.vulnerability.score}</Badge>
              <Badge tone="amber">{editingWard.vulnerability.informalHousingPct}% informal housing</Badge>
            </div>
          </Panel>

          <Panel
            kicker="Supply availability"
            title="Depot stock"
            action={<Badge tone="violet">Draft</Badge>}
            subtitle={`${supplyMeta.label} held across the three simulated depots.`}
            bodyClassName="space-y-3 p-3"
          >
            {state.scenario.depots.map((depot) => {
              const value = draft.stock[depot.id][focusSupply]
              const share = stockTotal > 0 ? value / stockTotal : 0
              return (
                <div key={depot.id}>
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-mist-300">
                      <span className="font-mono text-[8px] text-mist-500">Depot {depot.code}</span>{' '}
                      {depot.shortName}
                    </span>
                    <span className="num text-[9px] text-mist-400">{formatPct(share, 0)}</span>
                  </div>
                  <RangeSlider
                    label={`${depot.code} stock`}
                    value={value}
                    min={0}
                    max={9000}
                    step={100}
                    formatValue={(next) => `${formatNumber(next)} ${supplyMeta.unit}`}
                    onChange={(next) => updateStock(depot.id, next)}
                  />
                </div>
              )
            })}
            <div className="flex items-center justify-between border-t border-line/60 pt-2 font-mono text-[8px] uppercase tracking-[0.06em] text-mist-500">
              <span>Total {supplyMeta.shortLabel.toLowerCase()}</span>
              <span className="num text-mist-200">{formatNumber(stockTotal)} units</span>
            </div>
            <InfoNote>
              Stock is fictional and held only at these depots. Increasing stock does not add vehicles
              or open roads.
            </InfoNote>
          </Panel>

          <Panel
            kicker="Plan basis"
            title="Strategy & priority"
            action={<Badge tone="teal">Applies live</Badge>}
            subtitle="These controls recompute the committed plan immediately."
            bodyClassName="space-y-3 p-3"
          >
            <div className="space-y-1">
              {STRATEGY_ORDER.map((strategy) => {
                const active = state.strategy === strategy
                return (
                  <button
                    key={strategy}
                    type="button"
                    aria-pressed={active}
                    onClick={() => actions.setStrategy(strategy)}
                    className={cn(
                      'flex w-full items-start gap-2 rounded border px-2 py-1.5 text-left transition-colors',
                      active
                        ? 'border-signal/35 bg-signal/[0.055]'
                        : 'border-line/60 bg-night-950/20 hover:border-line hover:bg-white/[0.03]',
                    )}
                  >
                    <span
                      className={cn(
                        'mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border',
                        active ? 'border-signal/50 bg-signal/15 text-signal-bright' : 'border-line text-transparent',
                      )}
                      aria-hidden
                    >
                      <Check size={8} strokeWidth={3} />
                    </span>
                    <span className="min-w-0">
                      <span className={cn('block text-[10px] font-medium', active ? 'text-mist-50' : 'text-mist-300')}>
                        {STRATEGY_META[strategy].label}
                      </span>
                      <span className="mt-0.5 block text-[8.5px] leading-relaxed text-mist-500">
                        {STRATEGY_META[strategy].description}
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>

            <div className="border-t border-line/60 pt-2">
              <RangeSlider
                label="Coverage ↔ vulnerability priority"
                value={priorityDraft}
                min={0}
                max={100}
                step={5}
                formatValue={(value) => `${value}% vulnerability`}
                onChange={setPriorityDraft}
                onCommit={commitPriority}
                hint="Moves the optimizer's weight from demand share toward urgency and vulnerability. It does not change physical stock."
                leftLabel="Coverage"
                rightLabel="Vulnerability"
              />
              <p className="mt-1 font-mono text-[7.5px] uppercase tracking-[0.06em] text-mist-600">
                Optimizer-only · priority {state.priority}% currently applied
              </p>
            </div>
          </Panel>
        </div>

        <div className="space-y-3">
          <Panel
            kicker="Computed plan"
            title="Draft plan summary"
            action={<Badge tone={dirty ? 'amber' : 'teal'}>{dirty ? 'Unsaved draft' : 'Matches committed'}</Badge>}
            bodyClassName="p-3"
          >
            <InfoNote tone="amber" className="mb-3">
              <span className="font-medium text-[#f0d5a8]">Implemented engine, bounded scope.</span>{' '}
              A deterministic greedy allocator posts units through Dijkstra routes, limited by depot
              stock, remaining ward demand, vehicle capacity and each vehicle’s run budget. It is not a
              solver for an optimal plan and not a validated operational model.
            </InfoNote>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                {
                  label: 'Coverage',
                  value: formatPct(previewPlan.totals.coverage, 1),
                  delta: signed(coverageDelta, 1, 'pp'),
                  deltaLabel: 'vs committed',
                },
                {
                  label: 'Priority-unmet',
                  value: formatNumber(previewPlan.totals.priorityWeightedUnmet),
                  delta: signed(unmetDelta, 0),
                  deltaLabel: 'weighted units',
                },
                {
                  label: 'Vehicle-hours',
                  value: `${formatDecimal(previewPlan.totals.vehicleHours)} h`,
                  delta: signed(hoursDelta, 1, 'h'),
                  deltaLabel: 'vs committed',
                },
                {
                  label: 'Coverage equity',
                  value:
                    previewPlan.totals.fairness === null
                      ? '—'
                      : `${formatDecimal(previewPlan.totals.fairness)}`,
                  delta: fairnessDelta === null ? '—' : signed(fairnessDelta, 1),
                  deltaLabel: 'vs committed',
                },
              ].map((metric) => (
                <div key={metric.label} className="rounded border border-line/70 bg-night-950/35 p-2">
                  <div className="font-mono text-[7px] uppercase tracking-[0.09em] text-mist-600">
                    {metric.label}
                  </div>
                  <div className="num mt-1 text-[16px] font-medium leading-none text-mist-50">
                    {metric.value}
                  </div>
                  <div className="mt-1 flex items-center gap-1 font-mono text-[7.5px] text-mist-500">
                    {metric.delta.startsWith('+') ? (
                      <ArrowUpRight size={9} aria-hidden className="text-mist-500" />
                    ) : metric.delta.startsWith('-') ? (
                      <ArrowDownRight size={9} aria-hidden className="text-mist-500" />
                    ) : null}
                    <span>{metric.delta}</span>
                    <span className="text-mist-600">{metric.deltaLabel}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line/60 pt-2">
              <p className="font-mono text-[8px] uppercase tracking-[0.05em] text-mist-600">
                {formatNumber(previewPlan.totals.allocated)} allocated ·{' '}
                {formatNumber(previewPlan.totals.unmetUnits)} unmet ·{' '}
                {previewPlan.totals.trips} planned runs
              </p>
              <div className="flex gap-1.5">
                <Button
                  variant="secondary"
                  size="xs"
                  onClick={() => setDraft(editsFromScenario(state.scenario))}
                  disabled={!dirty}
                >
                  Discard
                </Button>
                <Button
                  variant="primary"
                  size="xs"
                  onClick={applyDraft}
                  disabled={!dirty || state.isRecalculating}
                >
                  Apply to console
                </Button>
              </div>
            </div>
          </Panel>

          <Panel
            kicker="Change summary"
            title="Draft vs committed plan"
            action={<Badge tone="amber">If applied</Badge>}
            subtitle="Allocation-level differences computed from the applied plan and this draft."
            bodyClassName="p-3"
          >
            <PlanChangeSummary previous={state.plan} current={previewPlan} scenario={state.scenario} />
          </Panel>

          <Panel
            kicker="Engine output"
            title="Routing, fleet & depot metrics"
            action={<Badge tone="teal">Computed</Badge>}
            subtitle="Derived from the deliveries this draft’s allocator actually produced, using the current road graph."
            bodyClassName="p-3"
          >
            <EngineMetrics plan={previewPlan} scenario={previewScenario} />
          </Panel>

          <Panel
            kicker="Strategy comparison"
            title="Computed across allocation bases"
            action={<Badge tone="teal">Measured output</Badge>}
            subtitle="Selecting a card applies that strategy immediately. Each strategy is run on its own copy of your draft inputs."
            bodyClassName="space-y-2.5 p-3"
          >
            <StrategyCards
              comparisons={previewComparisons}
              active={state.strategy}
              onSelect={actions.setStrategy}
            />
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line/60 pt-2">
              <p className="max-w-[75%] text-[9px] leading-relaxed text-mist-500">
                {STRATEGY_META[state.strategy].method}. Fairness is a chosen coverage-equity objective,
                not an objective truth.
              </p>
              <Button
                variant="ghost"
                size="xs"
                onClick={() => actions.setAnalysisTab('compare')}
                trailingIcon={<ArrowUpRight size={10} aria-hidden />}
              >
                Full table
              </Button>
            </div>
          </Panel>

          <Panel
            kicker="Allocation matrix"
            title="Draft allocation by ward"
            action={
              <div className="flex items-center gap-1.5">
                <Badge tone="amber">Draft</Badge>
                <Badge tone="neutral">{formatPct(previewPlan.totals.coverage, 0)}</Badge>
              </div>
            }
            subtitle="Allocated / requested units. Click a ward name to select it across the console."
            bodyClassName="p-0"
          >
            {previewEmpty ? (
              <div className="p-3">
                <EmptyState
                  title="No supplies allocated in this draft"
                  description="Stock is zero in this draft. Raise depot stock or reset the scenario to restore the preset."
                  action={
                    <Button
                      size="xs"
                      variant="secondary"
                      onClick={() => setDraft(editsFromScenario(state.scenario))}
                    >
                      Discard draft
                    </Button>
                  }
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[540px] border-collapse text-left">
                  <caption className="sr-only">
                    Draft allocation by neighbourhood, expressed as allocated units out of requested
                    units for each supply type.
                  </caption>
                  <thead>
                    <tr className="border-b border-line/70">
                      <th scope="col" className="py-2 pl-3 pr-2 text-left">
                        <span className="label-tiny">Neighbourhood</span>
                      </th>
                      {SUPPLY_TYPES.map((supply) => (
                        <th key={supply} scope="col" className="px-2 py-2 text-right">
                          <span className="label-tiny">{SUPPLY_META[supply].shortLabel}</span>
                        </th>
                      ))}
                      <th scope="col" className="py-2 pl-2 pr-3 text-right">
                        <span className="label-tiny">Coverage</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewPlan.wards.map((wardPlan) => {
                      const ward = state.scenario.wards.find((entry) => entry.id === wardPlan.wardId)
                      if (!ward) return null
                      const selected = state.selectedWardId === ward.id
                      return (
                        <tr
                          key={ward.id}
                          className={cn(
                            'border-b border-line/40 transition-colors last:border-b-0',
                            selected ? 'bg-signal/[0.05]' : 'hover:bg-white/[0.025]',
                          )}
                        >
                          <th scope="row" className="py-1.5 pl-3 pr-2 text-left font-normal">
                            <button
                              type="button"
                              onClick={() => actions.selectWard(ward.id)}
                              className="flex items-center gap-1.5 text-left"
                              aria-pressed={selected}
                            >
                              <span
                                aria-hidden
                                className={cn(
                                  'h-1 w-1 shrink-0 rounded-full',
                                  ward.urgency === 5 ? 'bg-critical' : ward.urgency === 4 ? 'bg-warn' : 'bg-signal',
                                )}
                              />
                              <span className="min-w-0">
                                <span className="block truncate text-[9.5px] font-medium text-mist-200">
                                  {ward.shortName}
                                </span>
                                <span className="block font-mono text-[7px] uppercase tracking-[0.06em] text-mist-600">
                                  {ward.code} · U{wardPlan.urgency}
                                </span>
                              </span>
                            </button>
                          </th>
                          {SUPPLY_TYPES.map((supply) => {
                            const entry = wardPlan.bySupply[supply]
                            return (
                              <td key={supply} className="px-2 py-1.5 text-right align-middle">
                                <div className="num text-[9px] text-mist-200">
                                  {formatNumber(entry.allocated)}
                                  <span className="text-mist-600"> / {formatNumber(entry.demand)}</span>
                                </div>
                                <ProgressBar
                                  value={entry.demand > 0 ? entry.allocated / entry.demand : 0}
                                  label={`${SUPPLY_META[supply].shortLabel} for ${ward.shortName}`}
                                  tone={
                                    supply === 'water' ? 'sky' : supply === 'medical' ? 'violet' : 'amber'
                                  }
                                  heightClass="h-[2px]"
                                  className="ml-auto mt-1 w-12"
                                />
                              </td>
                            )
                          })}
                          <td className="py-1.5 pl-2 pr-3 text-right">
                            <span
                              className={cn(
                                'num text-[9.5px]',
                                wardPlan.coverage < 0.6 ? 'text-[#f0c98b]' : 'text-mist-200',
                              )}
                            >
                              {formatPct(wardPlan.coverage, 0)}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line/60 px-3 py-2">
              <span className="font-mono text-[7.5px] uppercase tracking-[0.06em] text-mist-600">
                {dirty ? 'Previewing unsaved inputs' : 'Applied inputs'} · deterministic greedy engine
              </span>
              <span className="font-mono text-[7.5px] uppercase tracking-[0.06em] text-mist-600">
                {formatNumber(previewPlan.totals.unmetUnits)} units unmet
              </span>
            </div>
          </Panel>

          <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-line/70 bg-night-900/35 px-3 py-2">
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={12} aria-hidden className="text-mist-500" />
              <p className="text-[9px] leading-relaxed text-mist-500">
                Reset restores demand, urgency, stock, vehicles and roads from the preset. Strategy and
                priority stay as set.
              </p>
            </div>
            <div className="flex gap-1.5">
              <Button
                variant="secondary"
                size="xs"
                onClick={() => setConfirmReset(true)}
                icon={<RotateCcw size={10} aria-hidden />}
              >
                Reset scenario
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={applyDraft}
                disabled={!dirty || state.isRecalculating}
                icon={<Save size={11} aria-hidden />}
              >
                Apply changes
              </Button>
            </div>
          </div>

          {state.strategy !== 'optimizer' ? (
            <InfoNote>
              <span className="inline-flex items-center gap-1 font-medium text-[#c7efe9]">
                <TriangleAlert size={10} aria-hidden /> Priority slider inactive
              </span>{' '}
              The {STRATEGY_META[state.strategy].label} strategy ignores urgency weights. Switch back to
              the RescueGrid Optimizer to use the coverage ↔ vulnerability slider.
            </InfoNote>
          ) : null}
        </div>
      </div>

      <ConfirmDialog
        open={confirmReset}
        title={`Reset ${preset.name}?`}
        description="Demand, urgency, depot stock, vehicle availability and road states will return to the fictional preset. Your strategy and priority settings are kept."
        confirmLabel="Reset scenario"
        onCancel={() => setConfirmReset(false)}
        onConfirm={() => {
          actions.resetScenario()
          setConfirmReset(false)
        }}
      />      <p className="sr-only" aria-live="polite">
        {state.isRecalculating
          ? 'Recalculating the allocation plan.'
          : `Plan updated. Coverage ${formatPct(previewPlan.totals.coverage, 1)}.`}
      </p>
    </div>
  )
}
