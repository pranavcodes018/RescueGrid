import { ArrowRight, ArrowUpRight, Check, Layers, RotateCcw, Truck, Wind } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { InfoNote } from '../components/ui/InfoNote'
import { Panel } from '../components/ui/Panel'
import { ScreenHeader } from '../components/ui/ScreenHeader'
import { SCENARIO_ORDER, SCENARIO_PRESETS, createScenario } from '../data/sagarika'
import { SUPPLY_META, SUPPLY_TYPES, VEHICLE_STATUS_META } from '../lib/constants'
import { formatNumber, formatPct } from '../lib/format'
import { cn } from '../lib/cn'
import { useSimulation } from '../state/SimulationContext'
import type { Scenario, ScenarioId } from '../types'

interface PresetStat {
  scenario: Scenario
  requests: number
  stock: number
  blocked: number
  congested: number
  availableVehicles: number
  highUrgency: number
}

function buildStats(): Record<ScenarioId, PresetStat> {
  return SCENARIO_ORDER.reduce(
    (accumulator, id) => {
      const scenario = createScenario(id)
      const requests = scenario.wards.reduce(
        (sum, ward) => sum + SUPPLY_TYPES.reduce((inner, supply) => inner + ward.demand[supply], 0),
        0,
      )
      const stock = scenario.depots.reduce(
        (sum, depot) => sum + SUPPLY_TYPES.reduce((inner, supply) => inner + depot.stock[supply], 0),
        0,
      )
      accumulator[id] = {
        scenario,
        requests,
        stock,
        blocked: scenario.roads.filter((road) => road.state === 'blocked').length,
        congested: scenario.roads.filter((road) => road.state === 'congested').length,
        availableVehicles: scenario.vehicles.filter((vehicle) => vehicle.status === 'available').length,
        highUrgency: scenario.wards.filter((ward) => ward.urgency >= 4).length,
      }
      return accumulator
    },
    {} as Record<ScenarioId, PresetStat>,
  )
}

export function Scenarios() {
  const { state, actions } = useSimulation()
  const [confirmReset, setConfirmReset] = useState(false)
  const stats = useMemo(buildStats, [])
  const active = SCENARIO_PRESETS[state.scenarioId]
  const activeStat = stats[state.scenarioId]

  return (
    <div className="space-y-5 p-4 sm:p-5 xl:p-6">
      <ScreenHeader
        kicker="Scenarios · fictional presets"
        title="Choose the simulated operating picture"
        description="Three deterministic presets for Sagarika District. Switching a preset restores its demand, urgency, stock, fleet and road states consistently across the console."
        actions={
          <>
            <Badge tone={state.scenario.severity === 'Critical' ? 'red' : 'amber'} dot>
              {active.name}
            </Badge>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setConfirmReset(true)}
              icon={<RotateCcw size={12} aria-hidden />}
            >
              Reset current preset
            </Button>
          </>
        }
      />

      <InfoNote tone="amber">
        <span className="font-medium text-[#f0d5a8]">Sagarika District is fictional.</span> All wards,
        depots, roads, vehicles and figures are invented for this hackathon prototype. No live
        emergency, weather or traffic data is connected; loading a preset discards any unsaved Lab edits.
      </InfoNote>

      <div className="grid gap-3 md:grid-cols-3">
        {SCENARIO_ORDER.map((id) => {
          const preset = SCENARIO_PRESETS[id]
          const stat = stats[id]
          const isActive = state.scenarioId === id
          return (
            <article
              key={id}
              className={cn(
                'panel relative flex flex-col overflow-hidden p-3.5',
                isActive && 'border-signal/35',
              )}
            >
              {isActive ? (
                <span
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-signal to-transparent"
                />
              ) : null}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <Badge
                    tone={preset.severity === 'Critical' ? 'red' : preset.severity === 'Severe' ? 'amber' : 'sky'}
                    dot
                  >
                    {preset.severity}
                  </Badge>
                  <Badge tone="dark">Fictional preset</Badge>
                </div>
                {isActive ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-signal/30 bg-signal/10 px-1.5 py-0.5 font-mono text-[7.5px] uppercase tracking-[0.08em] text-signal-bright">
                    <Check size={8} aria-hidden />
                    Active
                  </span>
                ) : null}
              </div>

              <h2 className="mt-2.5 text-[14px] font-semibold leading-tight tracking-[-0.015em] text-mist-50">
                {preset.name}
              </h2>
              <p className="mt-1 text-[10px] leading-relaxed text-[#a9bcd0]">{preset.tagline}</p>
              <p className="mt-2 text-[9.5px] leading-relaxed text-mist-500">{preset.description}</p>

              <div className="mt-3 grid grid-cols-2 gap-1.5">
                {[
                  ['Requests', `${formatNumber(stat.requests)} units`],
                  ['Stock on hand', `${formatNumber(stat.stock)} units`],
                  [
                    'Roads',
                    `${stat.blocked} blocked · ${stat.congested} congested`,
                  ],
                  ['Fleet', `${stat.availableVehicles} of ${stat.scenario.vehicles.length} available`],
                ].map(([label, value]) => (
                  <div key={label} className="rounded border border-line/70 bg-night-950/30 px-2 py-1.5">
                    <div className="font-mono text-[7px] uppercase tracking-[0.08em] text-mist-600">
                      {label}
                    </div>
                    <div className="num mt-0.5 text-[9px] leading-tight text-mist-200">{value}</div>
                  </div>
                ))}
              </div>

              <div className="mb-3 mt-2 flex flex-wrap gap-1">
                <Badge tone="neutral">{stat.highUrgency} wards at U4–5</Badge>
                <Badge tone={stat.blocked > 0 ? 'red' : 'teal'}>
                  {stat.blocked > 0 ? `${stat.blocked} blocked` : 'no blocks'}
                </Badge>
                <Badge tone="violet">{preset.focus}</Badge>
              </div>

              <div className="mt-auto flex items-center gap-1.5 border-t border-line/60 pt-2.5">
                {isActive ? (
                  <>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="flex-1"
                      onClick={() => setConfirmReset(true)}
                      icon={<RotateCcw size={11} aria-hidden />}
                    >
                      Reset preset
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => actions.navigate('lab')}
                      trailingIcon={<ArrowUpRight size={11} aria-hidden />}
                    >
                      Tune
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full"
                    onClick={() => actions.loadScenario(id)}
                    disabled={state.isRecalculating}
                    loading={state.isRecalculating && state.scenarioId === id}
                    trailingIcon={<ArrowRight size={11} aria-hidden />}
                  >
                    Load scenario
                  </Button>
                )}
              </div>
            </article>
          )
        })}
      </div>

      <div className="grid gap-3 xl:grid-cols-2">
        <Panel
          kicker="Current snapshot"
          title={active.name}
          action={<Badge tone="neutral">{state.scenario.snapshotLabel}</Badge>}
          subtitle={state.scenario.weather.advisory}
          bodyClassName="space-y-3 p-3"
        >
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
            <div className="rounded border border-line/70 bg-night-950/30 px-2 py-1.5">
              <div className="label-tiny">Snapshot</div>
              <div className="mt-0.5 text-[9px] text-mist-200">{state.scenario.snapshotLabel}</div>
            </div>
            <div className="rounded border border-line/70 bg-night-950/30 px-2 py-1.5">
              <div className="label-tiny">System</div>
              <div className="mt-0.5 flex items-center gap-1 text-[9px] text-mist-200">
                <Wind size={9} aria-hidden className="text-info" />
                {state.scenario.weather.system.replace(' (simulated)', '')}
              </div>
            </div>
            <div className="rounded border border-line/70 bg-night-950/30 px-2 py-1.5">
              <div className="label-tiny">Rain</div>
              <div className="num mt-0.5 text-[9px] text-mist-200">
                {state.scenario.weather.rainfallMm} mm · {state.scenario.weather.windKph} km/h
              </div>
            </div>
            <div className="rounded border border-line/70 bg-night-950/30 px-2 py-1.5">
              <div className="label-tiny">Stock</div>
              <div className="num mt-0.5 text-[9px] text-mist-200">
                {formatNumber(activeStat.stock)} units
              </div>
            </div>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="label-tiny">Fleet</span>
              <span className="inline-flex items-center gap-1 font-mono text-[7.5px] uppercase tracking-[0.06em] text-mist-600">
                <Truck size={9} aria-hidden /> {activeStat.availableVehicles} available
              </span>
            </div>
            <div className="space-y-1">
              {state.scenario.vehicles.map((vehicle) => {
                const meta = VEHICLE_STATUS_META[vehicle.status]
                return (
                  <div
                    key={vehicle.id}
                    className="flex items-center justify-between gap-2 border-b border-line/40 py-1 text-[9px] last:border-b-0"
                  >
                    <span className="flex min-w-0 items-center gap-1.5">
                      <span aria-hidden className={cn('h-1.5 w-1.5 shrink-0 rounded-full', meta.dotClass)} />
                      <span className="truncate text-mist-200">{vehicle.name}</span>
                      <span className="shrink-0 font-mono text-[7.5px] uppercase tracking-[0.05em] text-mist-600">
                        {vehicle.vehicleClass}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      <span className="num text-mist-500">{formatNumber(vehicle.capacityUnits)} units</span>
                      <span className={cn('font-mono text-[7.5px] uppercase tracking-[0.05em]', meta.textClass)}>
                        {meta.label}
                      </span>
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex gap-1.5">
            {SUPPLY_TYPES.map((supply) => {
              const stock = state.scenario.depots.reduce((sum, depot) => sum + depot.stock[supply], 0)
              return (
                <div
                  key={supply}
                  className="flex-1 rounded border border-line/60 bg-night-950/25 px-1.5 py-1"
                >
                  <div className="font-mono text-[7px] uppercase tracking-[0.06em] text-mist-600">
                    {SUPPLY_META[supply].shortLabel}
                  </div>
                  <div className="num mt-0.5 text-[9px] text-mist-200">{formatNumber(stock)}</div>
                </div>
              )
            })}
          </div>
        </Panel>

        <Panel
          kicker="Assumptions"
          title="What this snapshot assumes"
          action={<Badge tone="amber">Simulated</Badge>}
          bodyClassName="space-y-3 p-3"
        >
          <ul className="space-y-1.5">
            {state.scenario.assumptions.map((assumption, index) => (
              <li key={index} className="flex gap-2 text-[9.5px] leading-relaxed text-mist-300">
                <span
                  aria-hidden
                  className="mt-[5px] h-1 w-1 shrink-0 rounded-full bg-mist-600"
                />
                {assumption}
              </li>
            ))}
            <li className="flex gap-2 text-[9.5px] leading-relaxed text-mist-300">
              <span aria-hidden className="mt-[5px] h-1 w-1 shrink-0 rounded-full bg-mist-600" />
              No backend, login, live API or AI model is used. All scenario state lives in this browser.
            </li>
          </ul>
          <InfoNote>
            The district note: {state.scenario.districtNote}
          </InfoNote>
        </Panel>
      </div>

      <Panel
        kicker="Preset comparison"
        title="What changes between presets"
        action={<Badge tone="neutral">Fictional data</Badge>}
        bodyClassName="p-0"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse text-left">
            <caption className="sr-only">Comparison of the three fictional scenario presets.</caption>
            <thead>
              <tr className="border-b border-line/70">
                <th scope="col" className="py-2 pl-3.5 pr-2">
                  <span className="label-tiny">Condition</span>
                </th>
                {SCENARIO_ORDER.map((id) => (
                  <th key={id} scope="col" className="px-2 py-2 text-right">
                    <span
                      className={cn(
                        'label-tiny',
                        id === state.scenarioId ? 'text-signal-bright' : undefined,
                      )}
                    >
                      {SCENARIO_PRESETS[id].name}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['Severity', (stat: PresetStat) => stat.scenario.severity],
                ['Requests', (stat: PresetStat) => `${formatNumber(stat.requests)} units`],
                ['Total stock', (stat: PresetStat) => `${formatNumber(stat.stock)} units`],
                [
                  'Stock coverage',
                  (stat: PresetStat) => formatPct(stat.requests > 0 ? stat.stock / stat.requests : 0, 0),
                ],
                ['Blocked roads', (stat: PresetStat) => `${stat.blocked}`],
                ['Congested roads', (stat: PresetStat) => `${stat.congested}`],
                ['Available vehicles', (stat: PresetStat) => `${stat.availableVehicles} / 4`],
                ['Wards at urgency 4–5', (stat: PresetStat) => `${stat.highUrgency}`],
              ].map(([label, value], index) => (
                <tr
                  key={String(label)}
                  className={cn(
                    'border-b border-line/40 last:border-b-0',
                    index % 2 === 1 ? 'bg-night-950/20' : '',
                  )}
                >
                  <th scope="row" className="py-1.5 pl-3.5 pr-2 text-left font-normal">
                    <span className="text-[9px] text-mist-400">{String(label)}</span>
                  </th>
                  {SCENARIO_ORDER.map((id) => (
                    <td key={id} className="px-2 py-1.5 text-right">
                      <span
                        className={cn(
                          'num text-[9px]',
                          id === state.scenarioId ? 'text-mist-100' : 'text-mist-400',
                        )}
                      >
                        {(value as (stat: PresetStat) => string)(stats[id])}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center gap-1.5 border-t border-line/60 px-3.5 py-2 font-mono text-[7.5px] uppercase tracking-[0.06em] text-mist-600">
          <Layers size={9} aria-hidden />
          Loading a preset resets its inputs; the current allocation strategy and priority are kept.
        </div>
      </Panel>

      <ConfirmDialog
        open={confirmReset}
        title={`Reset ${active.name}?`}
        description="Demand, urgency, depot stock, fleet status and every road state will return to the fictional preset. Strategy and priority settings are kept."
        confirmLabel="Reset preset"
        onCancel={() => setConfirmReset(false)}
        onConfirm={() => {
          actions.resetScenario()
          setConfirmReset(false)
        }}
      />
    </div>
  )
}
