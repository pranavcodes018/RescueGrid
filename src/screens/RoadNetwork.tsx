import { ArrowRight, CornerDownRight, RefreshCw, RotateCcw, Route, TriangleAlert } from 'lucide-react'
import { EventList } from '../components/events/EventList'
import { CommandMap } from '../components/map/CommandMap'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { InfoNote } from '../components/ui/InfoNote'
import { Panel } from '../components/ui/Panel'
import { ScreenHeader } from '../components/ui/ScreenHeader'
import { Segmented } from '../components/ui/Segmented'
import { ROAD_STATE_META } from '../lib/constants'
import { formatDecimal, formatNumber } from '../lib/format'
import { cn } from '../lib/cn'
import { useSimulation } from '../state/SimulationContext'
import type { RoadId, RoadState, Scenario } from '../types'

function nodeLabel(scenario: Scenario, id: string): string {
  const ward = scenario.wards.find((entry) => entry.id === id)
  if (ward) return ward.shortName
  const depot = scenario.depots.find((entry) => entry.id === id)
  if (depot) return `Depot ${depot.code}`
  return id
}

function StateControl({
  value,
  onChange,
  label,
  fullWidth = false,
}: {
  value: RoadState
  onChange: (state: RoadState) => void
  label: string
  fullWidth?: boolean
}) {
  return (
    <Segmented<RoadState>
      ariaLabel={`Set state for ${label}`}
      size="xs"
      fullWidth={fullWidth}
      value={value}
      onChange={onChange}
      options={[
        { value: 'open', label: 'Open' },
        { value: 'congested', label: 'Cong.' },
        { value: 'blocked', label: 'Blocked' },
      ]}
    />
  )
}

export function RoadNetwork() {
  const { state, actions } = useSimulation()
  const { plan, scenario } = state
  const blocked = scenario.roads.filter((road) => road.state === 'blocked')
  const congested = scenario.roads.filter((road) => road.state === 'congested')
  const detouredRoutes = plan.routes.filter((route) => route.detourKm > 0.15)
  const detourKm = detouredRoutes.reduce((sum, route) => sum + route.detourKm, 0)
  const roadEvents = state.events.filter((event) => event.kind === 'road')

  return (
    <div className="space-y-3 p-3 sm:p-4">
      <ScreenHeader
        kicker="Road network · demo graph"
        title="Inspect and disrupt the route graph"
        description="Mark segments open, congested or blocked. Every delivery route is recomputed immediately by Dijkstra's algorithm over this fictional 11-segment graph — not live traffic."
        actions={
          <>
            <Badge tone="red" dot>
              {blocked.length} blocked
            </Badge>
            <Badge tone="amber" dot>
              {congested.length} congested
            </Badge>
            <Button
              variant="secondary"
              size="sm"
              onClick={actions.recalculate}
              loading={state.isRecalculating}
              disabled={state.isRecalculating}
              icon={<RefreshCw size={12} aria-hidden />}
            >
              Recalculate
            </Button>
          </>
        }
      />

      <CommandMap heightClass="h-[320px] sm:h-[360px] xl:h-[400px]" />

      <div className="grid gap-3 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,0.85fr)]">
        <Panel
          kicker="Segments"
          title="Road state register"
          action={<Badge tone="neutral">{scenario.roads.length} segments</Badge>}
          subtitle="Select a segment name to open its status popover on the map. Status changes recompute the plan immediately."
          bodyClassName="p-0"
        >
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[620px] border-collapse text-left">
              <caption className="sr-only">Road segment states and planned route usage.</caption>
              <thead>
                <tr className="border-b border-line/70">
                  <th scope="col" className="py-2 pl-3.5 pr-2">
                    <span className="label-tiny">Segment</span>
                  </th>
                  <th scope="col" className="px-2 py-2">
                    <span className="label-tiny">Route</span>
                  </th>
                  <th scope="col" className="px-2 py-2 text-right">
                    <span className="label-tiny">Length</span>
                  </th>
                  <th scope="col" className="px-2 py-2 text-right">
                    <span className="label-tiny">Route use</span>
                  </th>
                  <th scope="col" className="py-2 pl-2 pr-3.5 text-right">
                    <span className="label-tiny">State</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {scenario.roads.map((road) => {
                  const selected = state.selectedRoadId === road.id
                  const legs = plan.routes.filter((route) => route.path.includes(road.id))
                  return (
                    <tr
                      key={road.id}
                      className={cn(
                        'border-b border-line/40 transition-colors last:border-b-0',
                        selected ? 'bg-signal/[0.045]' : 'hover:bg-white/[0.025]',
                      )}
                    >
                      <th scope="row" className="py-1.5 pl-3.5 pr-2 text-left font-normal">
                        <button
                          type="button"
                          onClick={() => actions.selectRoad(road.id)}
                          className="block min-w-0 text-left"
                          aria-pressed={selected}
                        >
                          <span className="flex items-center gap-1.5">
                            <span
                              aria-hidden
                              className={cn('h-1 w-1 shrink-0 rounded-full', ROAD_STATE_META[road.state].dotClass)}
                            />
                            <span className="truncate text-[9.5px] font-medium text-mist-200">{road.name}</span>
                          </span>
                          <span className="mt-0.5 block font-mono text-[7px] uppercase tracking-[0.06em] text-mist-600">
                            {road.ref}
                          </span>
                        </button>
                      </th>
                      <td className="px-2 py-1.5">
                        <span className="flex items-center gap-1 text-[8.5px] text-mist-400">
                          <span className="max-w-[74px] truncate">{nodeLabel(scenario, road.from)}</span>
                          <ArrowRight size={9} className="shrink-0 text-mist-600" aria-hidden />
                          <span className="max-w-[74px] truncate">{nodeLabel(scenario, road.to)}</span>
                        </span>
                      </td>
                      <td className="px-2 py-1.5 text-right">
                        <span className="num text-[9px] text-mist-300">{formatDecimal(road.distanceKm)} km</span>
                      </td>
                      <td className="px-2 py-1.5 text-right">
                        {road.state === 'blocked' ? (
                          <span className="font-mono text-[8px] text-[#f0c98b]">detour</span>
                        ) : (
                          <span className="num text-[9px] text-mist-400">
                            {legs.length} leg{legs.length === 1 ? '' : 's'}
                          </span>
                        )}
                      </td>
                      <td className="py-1.5 pl-2 pr-3.5">
                        <div className="flex justify-end">
                          <StateControl
                            value={road.state}
                            label={road.name}
                            onChange={(next) => actions.setRoadState(road.id as RoadId, next)}
                          />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="space-y-1.5 p-2 md:hidden">
            {scenario.roads.map((road) => {
              const selected = state.selectedRoadId === road.id
              const meta = ROAD_STATE_META[road.state]
              return (
                <div
                  key={road.id}
                  className={cn(
                    'rounded-md border p-2',
                    selected ? 'border-signal/30 bg-signal/[0.04]' : 'border-line/60 bg-night-950/25',
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => actions.selectRoad(road.id)}
                      aria-pressed={selected}
                      className="min-w-0 text-left"
                    >
                      <span className="flex items-center gap-1.5">
                        <span aria-hidden className={cn('h-1.5 w-1.5 rounded-full', meta.dotClass)} />
                        <span className="text-[11px] font-medium text-mist-100">{road.name}</span>
                      </span>
                      <span className="mt-0.5 block text-[8.5px] text-mist-500">
                        {nodeLabel(scenario, road.from)} <ArrowRight size={8} className="inline" aria-hidden />{' '}
                        {nodeLabel(scenario, road.to)} · {formatDecimal(road.distanceKm)} km
                      </span>
                    </button>
                    <Badge tone={road.state === 'blocked' ? 'red' : road.state === 'congested' ? 'amber' : 'neutral'}>
                      {meta.label}
                    </Badge>
                  </div>
                  <div className="mt-2">
                    <StateControl
                      value={road.state}
                      label={road.name}
                      fullWidth
                      onChange={(next) => actions.setRoadState(road.id, next)}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-line/60 px-3.5 py-2 font-mono text-[7.5px] uppercase tracking-[0.06em] text-mist-600">
            <span>Blocked segments are excluded from the demo route graph</span>
            <span>{formatNumber(plan.totals.trips)} planned runs</span>
          </div>
        </Panel>

        <div className="space-y-3">
          <Panel
            kicker="Impact"
            title="Network impact"
            action={<Badge tone="teal">Computed</Badge>}
            bodyClassName="space-y-3 p-3"
          >
            <div className="grid grid-cols-3 gap-1.5">
              {[
                {
                  label: 'Blocked',
                  value: String(blocked.length),
                  tone: blocked.length > 0 ? 'red' : 'teal',
                },
                {
                  label: 'Detoured legs',
                  value: String(detouredRoutes.length),
                  tone: detouredRoutes.length > 0 ? 'amber' : 'teal',
                },
                {
                  label: 'Added distance',
                  value: `${formatDecimal(detourKm)} km`,
                  tone: detourKm > 0.1 ? 'amber' : 'teal',
                },
              ].map((item) => (
                <div key={item.label} className="rounded border border-line/70 bg-night-950/35 px-2 py-1.5">
                  <div className="font-mono text-[7px] uppercase tracking-[0.08em] text-mist-600">
                    {item.label}
                  </div>
                  <div
                    className={cn(
                      'num mt-1 text-[14px] font-medium leading-none',
                      item.tone === 'red'
                        ? 'text-[#fca5a5]'
                        : item.tone === 'amber'
                          ? 'text-[#f6c97f]'
                          : 'text-signal-bright',
                    )}
                  >
                    {item.value}
                  </div>
                </div>
              ))}
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between">
                <span className="label-tiny">Blocked segments</span>
                <span className="font-mono text-[7.5px] uppercase tracking-[0.06em] text-mist-600">
                  reopen to remove detour
                </span>
              </div>
              {blocked.length === 0 ? (
                <p className="rounded border border-dashed border-line/70 px-2 py-2 text-[9px] text-mist-500">
                  No blocked segments in this snapshot.
                </p>
              ) : (
                <ul className="space-y-1">
                  {blocked.map((road) => (
                    <li
                      key={road.id}
                      className="flex items-center justify-between gap-2 rounded border border-critical/20 bg-critical/[0.04] px-2 py-1.5"
                    >
                      <span className="min-w-0">
                        <span className="flex items-center gap-1 text-[9.5px] text-mist-200">
                          <TriangleAlert size={9} aria-hidden className="shrink-0 text-critical" />
                          <span className="truncate">{road.name}</span>
                        </span>
                        <span className="mt-0.5 block font-mono text-[7px] uppercase tracking-[0.05em] text-mist-600">
                          {road.ref} · {formatDecimal(road.distanceKm)} km
                        </span>
                      </span>
                      <Button
                        variant="secondary"
                        size="xs"
                        onClick={() => actions.setRoadState(road.id, 'open')}
                        icon={<RotateCcw size={9} aria-hidden />}
                      >
                        Reopen
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {detouredRoutes.length > 0 ? (
              <div>
                <div className="mb-1 label-tiny">Longest detours</div>
                <ul className="space-y-1">
                  {[...detouredRoutes]
                    .sort((a, b) => b.detourKm - a.detourKm)
                    .slice(0, 3)
                    .map((route) => {
                      const ward = scenario.wards.find((entry) => entry.id === route.wardId)
                      const depot = scenario.depots.find((entry) => entry.id === route.depotId)
                      return (
                        <li
                          key={`${route.depotId}-${route.wardId}`}
                          className="flex items-center justify-between gap-2 border-b border-line/40 py-1 text-[8.5px] last:border-b-0"
                        >
                          <span className="flex min-w-0 items-center gap-1 text-mist-400">
                            <CornerDownRight size={9} className="shrink-0 text-mist-600" aria-hidden />
                            <span className="truncate">
                              {depot?.code ?? '?'} → {ward?.shortName ?? route.wardId}
                            </span>
                          </span>
                          <span className="num shrink-0 text-[#f0c98b]">
                            +{formatDecimal(route.detourKm)} km
                          </span>
                        </li>
                      )
                    })}
                </ul>
              </div>
            ) : null}

            <InfoNote>
              Demo router: blocked segments are removed; congested segments add a fixed 1.55× travel
              penalty. There is no live traffic, tide or road-closure feed.
            </InfoNote>
          </Panel>

          <Panel
            kicker="Event log"
            title="Network changes"
            action={<Badge tone="neutral">{roadEvents.length} entries</Badge>}
            bodyClassName="p-3"
          >
            <EventList
              events={roadEvents}
              limit={7}
              dense
              emptyTitle="No road events yet"
              emptyDescription="Open the state control on any segment to create a local simulation event."
            />
            <p className="mt-1 flex items-center gap-1 border-t border-line/60 pt-1.5 font-mono text-[7.5px] uppercase tracking-[0.05em] text-mist-600">
              <Route size={9} aria-hidden />
              Changes recompute the plan and append here
            </p>
          </Panel>
        </div>
      </div>
    </div>
  )
}
