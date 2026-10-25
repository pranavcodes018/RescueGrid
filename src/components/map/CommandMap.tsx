import { Loader2, Map as MapIcon, Route, TriangleAlert, Wind } from 'lucide-react'
import { useCallback, useState } from 'react'
import { formatNumber } from '../../lib/format'
import { cn } from '../../lib/cn'
import { useSimulation } from '../../state/SimulationContext'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Segmented } from '../ui/Segmented'
import { LeafletMap } from './LeafletMap'
import { MapLegend } from './MapLegend'
import { RoadPopover } from './RoadPopover'
import { VectorMap } from './VectorMap'

type MapMode = 'tiles' | 'vector'

interface CommandMapProps {
  heightClass?: string
  className?: string
}

export function CommandMap({ heightClass = 'h-[380px] xl:h-[460px]', className }: CommandMapProps) {
  const { state, actions } = useSimulation()
  const [mode, setMode] = useState<MapMode>(() =>
    typeof navigator !== 'undefined' && navigator.onLine === false ? 'vector' : 'tiles',
  )
  const [tilesFailed, setTilesFailed] = useState(false)
  const [tileAttempt, setTileAttempt] = useState(0)
  const [showRoutes, setShowRoutes] = useState(true)

  const selectedRoad = state.scenario.roads.find((road) => road.id === state.selectedRoadId) ?? null

  const handleTileFailure = useCallback(() => {
    setTilesFailed(true)
    setMode('vector')
  }, [])

  const handleModeChange = (next: MapMode) => {
    if (next === 'tiles' && mode !== 'tiles') {
      setTilesFailed(false)
      setTileAttempt((attempt) => attempt + 1)
    }
    setMode(next)
  }

  const retryTiles = () => {
    setTilesFailed(false)
    setMode('tiles')
    setTileAttempt((attempt) => attempt + 1)
  }

  return (
    <section className={cn('panel overflow-hidden', className)}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line/70 px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <MapIcon size={13} aria-hidden className="shrink-0 text-mist-500" />
          <span className="label-micro shrink-0">Operational grid</span>
          <span className="hidden truncate text-[10px] text-mist-400 sm:inline">
            Sagarika District · {state.scenario.wards.length} wards · {state.scenario.depots.length} depots
          </span>
          <Badge tone="neutral" className="hidden md:inline-flex">
            Fictional geography
          </Badge>
        </div>

        <div className="flex items-center gap-1.5">
          <Segmented<MapMode>
            ariaLabel="Map layer"
            size="xs"
            value={mode}
            onChange={handleModeChange}
            options={[
              { value: 'tiles', label: 'OSM tiles', title: 'OpenStreetMap-based dark tiles (requires network)' },
              { value: 'vector', label: 'Offline', title: 'Offline vector network view' },
            ]}
          />
          <button
            type="button"
            aria-pressed={showRoutes}
            onClick={() => setShowRoutes((value) => !value)}
            className={cn(
              'inline-flex h-7 items-center gap-1.5 rounded-md border px-2 font-mono text-[9px] uppercase tracking-[0.06em] transition-colors',
              showRoutes
                ? 'border-signal/30 bg-signal/[0.08] text-signal-bright'
                : 'border-line bg-night-950/60 text-mist-500 hover:text-mist-300',
            )}
            title="Toggle planned delivery-route overlay"
          >
            <Route size={11} aria-hidden />
            Routes
          </button>
        </div>
      </div>

      {tilesFailed ? (
        <div
          role="status"
          className="flex flex-wrap items-center justify-between gap-2 border-b border-warn/20 bg-warn/[0.05] px-3 py-1.5"
        >
          <div className="flex min-w-0 items-center gap-1.5">
            <TriangleAlert size={11} aria-hidden className="shrink-0 text-warn" />
            <p className="text-[9px] leading-snug text-[#e6cfac]">
              OpenStreetMap tiles are unavailable here. Showing the labelled offline vector network.
            </p>
          </div>
          <Button size="xs" variant="secondary" onClick={retryTiles}>
            Retry tiles
          </Button>
        </div>
      ) : null}

      <div className={cn('relative w-full overflow-hidden', heightClass)}>
        {mode === 'tiles' ? (
          <LeafletMap
            key={`tiles-${tileAttempt}`}
            scenario={state.scenario}
            plan={state.plan}
            selectedWardId={state.selectedWardId}
            selectedRoadId={state.selectedRoadId}
            showRoutes={showRoutes}
            onSelectWard={actions.selectWard}
            onSelectRoad={actions.selectRoad}
            onTileFailure={handleTileFailure}
          />
        ) : (
          <VectorMap
            scenario={state.scenario}
            plan={state.plan}
            selectedWardId={state.selectedWardId}
            selectedRoadId={state.selectedRoadId}
            showRoutes={showRoutes}
            onSelectWard={actions.selectWard}
            onSelectRoad={actions.selectRoad}
            onTileFailure={handleTileFailure}
          />
        )}

        <div className="pointer-events-none absolute left-2.5 top-2.5 z-10 hidden max-w-[290px] items-center gap-2 rounded-md border border-line/80 bg-night-950/88 px-2 py-1.5 shadow-lg backdrop-blur-sm xl:flex">
          <Wind size={12} aria-hidden className="shrink-0 text-info" />
          <div className="min-w-0 leading-tight">
            <div className="font-mono text-[7px] uppercase tracking-[0.12em] text-mist-600">
              Simulated conditions
            </div>
            <div className="mt-0.5 truncate text-[9px] text-mist-200">
              {state.scenario.weather.system}
            </div>
          </div>
          <div className="shrink-0 border-l border-line/70 pl-2 font-mono text-[7.5px] leading-tight text-mist-400">
            {state.scenario.weather.windKph} km/h
            <br />
            {state.scenario.weather.rainfallMm} mm
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-7 right-3 z-10 hidden items-center gap-1.5 rounded border border-line/70 bg-night-950/80 px-2 py-1 font-mono text-[7.5px] uppercase tracking-[0.08em] text-mist-500 backdrop-blur-sm md:flex">
          <span className="h-1 w-1 rounded-full bg-signal/80" aria-hidden />
          {state.plan.routes.length} route legs · {formatNumber(state.plan.totals.vehiclesUsed)} vehicles
        </div>

        <MapLegend />

        {selectedRoad ? (
          <RoadPopover
            road={selectedRoad}
            scenario={state.scenario}
            plan={state.plan}
            onChangeState={(next) => actions.setRoadState(selectedRoad.id, next)}
            onClose={() => actions.selectRoad(null)}
          />
        ) : null}

        {state.isRecalculating ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-3 z-30 flex justify-center">
            <div className="flex items-center gap-2 rounded-full border border-signal/25 bg-night-950/92 px-3 py-1.5 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.8)] backdrop-blur">
              <Loader2 size={12} aria-hidden className="animate-spin text-signal" />
              <span className="font-mono text-[8px] uppercase tracking-[0.11em] text-[#a9e9e0]">
                Recomputing routes
              </span>
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line/60 px-3 py-1.5">
        <p className="font-mono text-[7.5px] uppercase leading-relaxed tracking-[0.06em] text-mist-600">
          {mode === 'tiles'
            ? 'Tiles © OpenStreetMap contributors'
            : 'Offline vector network · fictional coordinate system'}
        </p>
        <p className="font-mono text-[7.5px] uppercase leading-relaxed tracking-[0.06em] text-mist-600">
          Click a ward or segment to inspect · simulation only
        </p>
      </div>
    </section>
  )
}
