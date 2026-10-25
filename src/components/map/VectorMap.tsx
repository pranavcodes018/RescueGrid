import { Maximize2, Minus, Plus } from 'lucide-react'
import { useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react'
import { DEPOT_STYLE, ROAD_STATE_META, URGENCY_META } from '../../lib/constants'
import { formatNumber } from '../../lib/format'
import { cn } from '../../lib/cn'
import {
  COASTLINE,
  MAP_BOUNDS,
  RIVER_PATH,
  SVG_VIEW,
  mapPolyline,
  mapSmoothPath,
  projectPointAtFraction,
  projectToMap,
  roadLabelPosition,
} from '../../lib/map'
import { buildRouteGeometry } from '../../lib/routing'
import type { Road } from '../../types'
import type { MapViewProps } from './mapTypes'

const { width: W, height: H } = SVG_VIEW

function pctX(x: number): string {
  return `${(x / W) * 100}%`
}

function pctY(y: number): string {
  return `${(y / H) * 100}%`
}

function DepotShape({ code, tone }: { code: 'A' | 'B' | 'C'; tone: string }) {
  return (
    <svg className="rg-depot-shape" viewBox="0 0 34 34" aria-hidden>
      {code === 'A' ? (
        <path
          d="M17 1.5 32.5 17 17 32.5 1.5 17Z"
          fill={tone}
          fillOpacity="0.92"
          stroke="#eafffb"
          strokeOpacity="0.4"
          strokeWidth="1.2"
        />
      ) : code === 'B' ? (
        <circle
          cx="17"
          cy="17"
          r="14.5"
          fill={tone}
          fillOpacity="0.92"
          stroke="#eafffb"
          strokeOpacity="0.4"
          strokeWidth="1.2"
        />
      ) : (
        <path
          d="M17 1.5 31 9.2v15.6L17 32.5 3 24.8V9.2Z"
          fill={tone}
          fillOpacity="0.92"
          stroke="#eafffb"
          strokeOpacity="0.4"
          strokeWidth="1.2"
        />
      )}
    </svg>
  )
}

const latGrid = [14.42, 14.46, 14.5]
const lngGrid = [79.92, 79.96, 80.0, 80.04]

export function VectorMap({
  scenario,
  plan,
  selectedWardId,
  selectedRoadId,
  showRoutes,
  onSelectWard,
  onSelectRoad,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const dragRef = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null)
  const [dragging, setDragging] = useState(false)
  const [view, setView] = useState({ x: 0, y: 0, scale: 1 })

  const roadById = new Map<string, Road>(scenario.roads.map((road) => [road.id, road]))
  const runsByDepot = new Map<string, number>()
  for (const route of plan.routes) {
    runsByDepot.set(route.depotId, (runsByDepot.get(route.depotId) ?? 0) + route.trips)
  }

  const coastlinePath = `${mapSmoothPath(COASTLINE)} L ${W} ${H} L ${W} 0 Z`
  const riverPath = mapSmoothPath(RIVER_PATH)
  const boundary = mapPolyline(
    [
      { lat: 14.52, lng: 79.905 },
      { lat: 14.514, lng: 80.025 },
      { lat: 14.47, lng: 80.058 },
      { lat: 14.408, lng: 80.05 },
      { lat: 14.403, lng: 79.94 },
      { lat: 14.44, lng: 79.9 },
    ],
    true,
  )

  function zoomBy(delta: number) {
    const rect = containerRef.current?.getBoundingClientRect()
    const cx = rect ? rect.width / 2 : W / 2
    const cy = rect ? rect.height / 2 : H / 2
    setView((previous) => {
      const nextScale = Math.min(2.6, Math.max(0.8, previous.scale + delta))
      if (nextScale === previous.scale) return previous
      const ratio = nextScale / previous.scale
      return {
        scale: nextScale,
        x: cx - (cx - previous.x) * ratio,
        y: cy - (cy - previous.y) * ratio,
      }
    })
  }

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return
    if ((event.target as Element).closest('[data-map-interactive], button')) return
    dragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      originX: view.x,
      originY: view.y,
    }
    setDragging(true)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current
    if (!drag) return
    setView((previous) => ({
      ...previous,
      x: drag.originX + (event.clientX - drag.startX),
      y: drag.originY + (event.clientY - drag.startY),
    }))
  }

  function onPointerUp() {
    dragRef.current = null
    setDragging(false)
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative h-full w-full select-none overflow-hidden bg-[#06111c]',
        dragging ? 'cursor-grabbing' : 'cursor-grab',
      )}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      aria-label="Offline vector map of the fictional Sagarika District"
    >
      <div
        className="absolute inset-0 origin-top-left"
        style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})` }}
      >
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
          aria-hidden
        >
          <defs>
            <linearGradient id="rg-land" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#0a1a29" />
              <stop offset="0.55" stopColor="#081723" />
              <stop offset="1" stopColor="#071320" />
            </linearGradient>
            <linearGradient id="rg-sea" x1="0" y1="0" x2="1" y2="0.6">
              <stop offset="0" stopColor="#0d3143" />
              <stop offset="0.55" stopColor="#092434" />
              <stop offset="1" stopColor="#071824" />
            </linearGradient>
            <linearGradient id="rg-river" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#0a2a3b" />
              <stop offset="1" stopColor="#0c3546" />
            </linearGradient>
            <pattern
              id="rg-fields"
              width="22"
              height="22"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(18)"
            >
              <line x1="0" y1="0" x2="0" y2="22" stroke="rgba(122, 186, 180, 0.2)" strokeWidth="1" />
            </pattern>
            <pattern id="rg-wetland" width="14" height="14" patternUnits="userSpaceOnUse">
              <circle cx="3" cy="5" r="1" fill="rgba(103, 199, 232, 0.18)" />
              <circle cx="10" cy="11" r="0.8" fill="rgba(103, 199, 232, 0.12)" />
            </pattern>
            <filter id="rg-glow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <clipPath id="rg-sea-clip">
              <path d={coastlinePath} />
            </clipPath>
          </defs>

          <rect width={W} height={H} fill="url(#rg-land)" />
          <g opacity="0.75">
            {[60, 120, 180, 240, 300, 360, 420, 480, 540, 600].map((y) => (
              <line key={`grid-y-${y}`} x1="0" x2={W} y1={y} y2={y} stroke="rgba(120, 158, 190, 0.09)" strokeWidth="1" />
            ))}
            {[100, 200, 300, 400, 500, 600, 700, 800, 900].map((x) => (
              <line key={`grid-x-${x}`} x1={x} x2={x} y1="0" y2={H} stroke="rgba(120, 158, 190, 0.08)" strokeWidth="1" />
            ))}
          </g>

          <path d={coastlinePath} fill="url(#rg-sea)" />
          <g clipPath="url(#rg-sea-clip)" opacity="0.45">
            {[70, 150, 230, 310, 390, 470, 550, 620].map((y, index) => (
              <path
                key={`wave-${y}`}
                d={`M ${820 + (index % 3) * 12} ${y} q 45 -8 90 0 t 90 0`}
                fill="none"
                stroke="#1d5268"
                strokeWidth="1"
              />
            ))}
          </g>
          <path
            d={mapSmoothPath(COASTLINE)}
            fill="none"
            stroke="#2a6177"
            strokeWidth="1.4"
            opacity="0.7"
          />

          <path
            d="M 18 430 L 258 386 L 330 492 L 236 610 L 24 590 Z"
            fill="url(#rg-fields)"
            stroke="rgba(122, 178, 173, 0.16)"
            strokeWidth="1"
          />
          <path
            d="M 78 300 L 252 274 L 300 356 L 186 402 L 52 370 Z"
            fill="url(#rg-fields)"
            stroke="rgba(122, 178, 173, 0.12)"
            strokeWidth="1"
          />
          <text x="72" y="576" fill="#3f5c6b" fontSize="8.5" fontFamily="monospace" letterSpacing="0.16em">
            INLAND AGRICULTURAL BELT
          </text>

          <g opacity="0.5">
            {[0, 1, 2, 3].map((index) => (
              <ellipse
                key={`contour-${index}`}
                cx={705}
                cy={143}
                rx={52 + index * 26}
                ry={20 + index * 15}
                transform={`rotate(-20 705 143)`}
                fill="none"
                stroke="#2a5060"
                strokeWidth="0.8"
                opacity={0.42 - index * 0.06}
              />
            ))}
            <text x="665" y="112" fill="#486979" fontSize="7.5" fontFamily="monospace" letterSpacing="0.12em">
              HILLVIEW RIDGE
            </text>
          </g>

          <path d={riverPath} fill="none" stroke="#06121d" strokeWidth="16" strokeLinecap="round" />
          <path d={riverPath} fill="none" stroke="url(#rg-river)" strokeWidth="10" strokeLinecap="round" />
          <path
            d={riverPath}
            fill="none"
            stroke="#1c4b5d"
            strokeWidth="1"
            strokeDasharray="4 8"
            opacity="0.5"
          />
          <path
            d="M 810 540 Q 856 552 892 584 Q 906 596 918 606 L 906 626 Q 862 600 826 568 Z"
            fill="url(#rg-wetland)"
            opacity="0.8"
          />

          <g opacity="0.62">
            {[
              [648, 302, 48, 20],
              [714, 288, 34, 16],
              [762, 322, 54, 22],
              [700, 346, 30, 14],
              [788, 372, 40, 16],
              [634, 340, 34, 18],
              [818, 236, 42, 18],
              [746, 238, 30, 14],
              [488, 318, 38, 18],
              [522, 352, 28, 14],
            ].map(([x, y, width, height], index) => (
              <rect
                key={`block-${index}`}
                x={x}
                y={y}
                width={width}
                height={height}
                rx="2"
                fill="#102738"
                stroke="#1d3b4f"
                strokeWidth="0.7"
              />
            ))}
          </g>

          <path
            d={boundary}
            fill="none"
            stroke="#31566a"
            strokeWidth="1"
            strokeDasharray="8 6"
            opacity="0.4"
          />

          <g opacity="0.28" fontFamily="monospace" fontSize="7" fill="#4c6879">
            {latGrid.map((lat) => {
              const y = projectToMap({ lat, lng: MAP_BOUNDS.west }).y
              return (
                <g key={`lat-${lat}`}>
                  <line x1="0" x2={W} y1={y} y2={y} stroke="#3a5d70" strokeWidth="0.6" strokeDasharray="2 10" />
                  <text x="8" y={y - 4}>{lat.toFixed(2)}°N</text>
                </g>
              )
            })}
            {lngGrid.map((lng) => {
              const x = projectToMap({ lat: MAP_BOUNDS.north, lng }).x
              return (
                <g key={`lng-${lng}`}>
                  <line x1={x} x2={x} y1="0" y2={H} stroke="#3a5d70" strokeWidth="0.6" strokeDasharray="2 10" />
                  <text x={x + 4} y={H - 10}>{lng.toFixed(2)}°E</text>
                </g>
              )
            })}
          </g>

          <text
            x="925"
            y="250"
            fill="#2e6074"
            fontSize="9"
            fontFamily="monospace"
            letterSpacing="0.28em"
            transform="rotate(78 925 250)"
          >
            BAY OF BENGAL
          </text>
          <text
            x="400"
            y="208"
            fill="#2e6074"
            fontSize="7.5"
            fontFamily="monospace"
            letterSpacing="0.18em"
            transform="rotate(-24 400 208)"
          >
            SAGARIKA RIVER
          </text>

          {scenario.roads.map((road) => {
            const path = mapPolyline(road.geometry)
            const selected = selectedRoadId === road.id
            const color = ROAD_STATE_META[road.state].color
            const midpoint = projectPointAtFraction(road.geometry, 0.5)
            return (
              <g key={road.id}>
                {selected ? (
                  <path d={path} fill="none" stroke="#5eead4" strokeWidth="12" opacity="0.16" strokeLinecap="round" />
                ) : null}
                <path
                  d={path}
                  fill="none"
                  stroke="#05101a"
                  strokeWidth={selected ? 10 : 8}
                  strokeLinecap="round"
                />
                <path
                  d={path}
                  fill="none"
                  stroke={selected ? '#d9fffa' : color}
                  strokeWidth={selected ? 4 : road.lanes >= 4 ? 3.4 : 3}
                  strokeLinecap="round"
                  strokeDasharray={road.state === 'blocked' ? '2 4' : road.state === 'congested' ? '6 3' : undefined}
                  opacity={road.state === 'open' ? 0.95 : 1}
                />
                <path
                  d={path}
                  fill="none"
                  stroke="transparent"
                  strokeWidth="16"
                  pointerEvents="stroke"
                  role="button"
                  tabIndex={-1}
                  aria-label={`Inspect ${road.name}, currently ${road.state}`}
                  data-map-interactive
                  style={{ cursor: 'pointer' }}
                  onClick={(event) => {
                    event.stopPropagation()
                    onSelectRoad(road.id)
                  }}
                >
                  <title>{`${road.name} — ${ROAD_STATE_META[road.state].label}`}</title>
                </path>
                {road.state === 'blocked' && midpoint ? (
                  <g transform={`translate(${midpoint.x} ${midpoint.y})`} pointerEvents="none">
                    <circle r="6.5" fill="#2a0d12" stroke="#f87171" strokeWidth="1" opacity="0.95" />
                    <path d="M-2.5 -2.5 2.5 2.5 M2.5 -2.5 -2.5 2.5" stroke="#fca5a5" strokeWidth="1.2" />
                  </g>
                ) : null}
              </g>
            )
          })}

          {showRoutes
            ? plan.routes.map((route) => {
                const pathRoads = route.path
                  .map((id) => roadById.get(id))
                  .filter((road): road is Road => Boolean(road))
                const geometry = buildRouteGeometry(route.depotId, pathRoads)
                if (geometry.length < 2) return null
                const emphasized = selectedWardId === route.wardId
                return (
                  <path
                    key={`${route.depotId}-${route.wardId}`}
                    d={mapPolyline(geometry)}
                    fill="none"
                    stroke="#5eead4"
                    strokeWidth={emphasized ? 2.2 : 1.2}
                    strokeDasharray="3 7"
                    strokeLinecap="round"
                    opacity={emphasized ? 0.9 : selectedWardId ? 0.2 : 0.5}
                    className="route-flow"
                    pointerEvents="none"
                  />
                )
              })
            : null}
        </svg>

        {scenario.roads.map((road) => {
          const label = roadLabelPosition(road.geometry)
          if (!label) return null
          const selected = selectedRoadId === road.id
          const blocked = road.state === 'blocked'
          return (
            <button
              key={`label-${road.id}`}
              type="button"
              data-map-interactive
              onClick={(event) => {
                event.stopPropagation()
                onSelectRoad(road.id)
              }}
              title={`${road.ref} · ${road.name} — ${ROAD_STATE_META[road.state].label}`}
              aria-label={`Inspect ${road.name}, currently ${ROAD_STATE_META[road.state].label}`}
              className={cn(
                'absolute z-[6] inline-flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 whitespace-nowrap rounded border px-1.5 py-[2px] font-mono text-[8.5px] uppercase leading-[1.4] tracking-[0.02em] shadow-[0_2px_8px_rgba(0,0,0,0.45)] backdrop-blur-[2px] transition-colors sm:text-[9px]',
                selected
                  ? 'border-signal/60 bg-night-950/95 text-signal-bright'
                  : blocked
                    ? 'border-critical/40 bg-night-950/90 text-[#fca5a5]'
                    : road.state === 'congested'
                      ? 'border-warn/35 bg-night-950/90 text-[#e5c38b]'
                      : 'border-[#2b455a] bg-night-950/90 text-mist-200 hover:text-mist-50',
              )}
              style={{ left: pctX(label.x), top: pctY(label.y) }}
            >
              <span
                aria-hidden
                className="h-1 w-1 rounded-full"
                style={{ background: ROAD_STATE_META[road.state].color }}
              />
              <span className="hidden sm:inline">{road.name}</span>
              <span className={selected ? 'hidden' : 'sm:hidden'}>{road.ref}</span>
            </button>
          )
        })}

        {scenario.depots.map((depot) => {
          const point = projectToMap(depot.location)
          const style = DEPOT_STYLE[depot.id]
          const runs = runsByDepot.get(depot.id) ?? 0
          const available = scenario.vehicles.filter(
            (vehicle) => vehicle.depotId === depot.id && vehicle.status === 'available',
          ).length
          return (
            <div
              key={depot.id}
              className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
              style={{ left: pctX(point.x), top: pctY(point.y) }}
              title={`${depot.name} · Water ${formatNumber(depot.stock.water)} · Medical ${formatNumber(
                depot.stock.medical,
              )} · Food ${formatNumber(depot.stock.food)} · ${available} available vehicles · ${runs} planned runs`}
              aria-label={`${depot.name}, ${runs} planned delivery runs`}
              role="img"
            >
              <div className="rg-depot" style={{ '--tone': style.color } as CSSProperties}>
                <DepotShape code={depot.code} tone={style.color} />
                <span className="rg-depot-letter">{depot.code}</span>
                <span className="rg-depot-label">
                  Depot {depot.code}
                  <em>{runs} runs</em>
                </span>
              </div>
            </div>
          )
        })}

        {scenario.wards.map((ward) => {
          const point = projectToMap(ward.location)
          const wardPlan = plan.wards.find((entry) => entry.wardId === ward.id)
          const coverage = wardPlan ? Math.round(wardPlan.coverage * 100) : 0
          const tone = URGENCY_META[ward.urgency]?.color ?? '#8599ae'
          const selected = selectedWardId === ward.id
          return (
            <button
              key={ward.id}
              type="button"
              data-map-interactive
              onClick={() => onSelectWard(ward.id)}
              aria-label={`${ward.name}, urgency ${ward.urgency} of 5, ${coverage}% plan coverage`}
              title={`${ward.name} · ${URGENCY_META[ward.urgency]?.label} urgency · ${coverage}% coverage`}
              className="absolute z-20 -translate-x-1/2 -translate-y-1/2 rounded-full p-0 text-left"
              style={{ left: pctX(point.x), top: pctY(point.y) }}
            >
              <span className={cn('rg-ward', selected && 'is-selected')} style={{ '--tone': tone } as CSSProperties}>
                {ward.urgency >= 5 ? (
                  <span
                    className="pulse-ring absolute inset-0 rounded-full border"
                    style={{ borderColor: tone, opacity: 0.35 }}
                    aria-hidden
                  />
                ) : null}
                <span className="rg-ward-ring" aria-hidden />
                <span className="rg-ward-core" aria-hidden />
                <span className="rg-ward-label">
                  <b>{ward.code}</b>
                  {ward.shortName}
                  <em>{coverage}%</em>
                </span>
              </span>
            </button>
          )
        })}
      </div>

      <div className="absolute right-2.5 top-2.5 z-20 flex flex-col overflow-hidden rounded-md border border-line bg-night-950/95 shadow-lg">
        <button
          type="button"
          onClick={() => zoomBy(0.25)}
          aria-label="Zoom in"
          className="flex h-7 w-7 items-center justify-center text-mist-300 transition-colors hover:bg-white/[0.07] hover:text-mist-50"
        >
          <Plus size={13} aria-hidden />
        </button>
        <div className="h-px bg-line/80" aria-hidden />
        <button
          type="button"
          onClick={() => zoomBy(-0.25)}
          aria-label="Zoom out"
          className="flex h-7 w-7 items-center justify-center text-mist-300 transition-colors hover:bg-white/[0.07] hover:text-mist-50"
        >
          <Minus size={13} aria-hidden />
        </button>
        <div className="h-px bg-line/80" aria-hidden />
        <button
          type="button"
          onClick={() => setView({ x: 0, y: 0, scale: 1 })}
          aria-label="Fit the district in view"
          className="flex h-7 w-7 items-center justify-center text-mist-400 transition-colors hover:bg-white/[0.07] hover:text-mist-50"
        >
          <Maximize2 size={12} aria-hidden />
        </button>
      </div>

      <div className="pointer-events-none absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-0.5">
        <div className="h-1.5 w-[74px] border-x border-b border-mist-600/70" aria-hidden />
        <span className="font-mono text-[7.5px] uppercase tracking-[0.12em] text-mist-600">
          approx. 2 km
        </span>
      </div>

      <p className="sr-only">
        Offline vector map with six neighbourhoods, three depots and eleven road segments. Use the
        road network screen for a fully keyboard-accessible road list.
      </p>
    </div>
  )
}
