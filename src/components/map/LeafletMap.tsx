import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Maximize2, Minus, Plus } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { DEPOT_STYLE, URGENCY_META } from '../../lib/constants'
import { formatNumber } from '../../lib/format'
import { LEAFLET_BOUNDS, MAP_CENTER } from '../../lib/map'
import { buildRouteGeometry } from '../../lib/routing'
import type { Road, Scenario, Ward, WardPlan } from '../../types'
import type { MapViewProps } from './mapTypes'

const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'

function wardMarkerHtml(ward: Ward, wardPlan: WardPlan | undefined, selected: boolean): string {
  const tone = URGENCY_META[ward.urgency]?.color ?? '#8599ae'
  const coverage = wardPlan ? `${Math.round(wardPlan.coverage * 100)}%` : '—'
  return `
    <div class="rg-point">
      <div class="rg-ward${selected ? ' is-selected' : ''}" style="--tone:${tone}">
        ${ward.urgency >= 5 ? `<span class="pulse-ring" style="position:absolute;inset:0;border-radius:999px;border:1px solid ${tone};opacity:.35"></span>` : ''}
        <span class="rg-ward-ring"></span>
        <span class="rg-ward-core"></span>
        <span class="rg-ward-label"><b>${ward.code}</b>${ward.shortName}<em>${coverage}</em></span>
      </div>
    </div>
  `
}

function depotShape(code: 'A' | 'B' | 'C', tone: string): string {
  if (code === 'A') {
    return `<path d="M17 1.5 32.5 17 17 32.5 1.5 17Z" fill="${tone}" fill-opacity="0.92" stroke="#eafffb" stroke-opacity="0.4" stroke-width="1.2" />`
  }
  if (code === 'B') {
    return `<circle cx="17" cy="17" r="14.5" fill="${tone}" fill-opacity="0.92" stroke="#eafffb" stroke-opacity="0.4" stroke-width="1.2" />`
  }
  return `<path d="M17 1.5 31 9.2v15.6L17 32.5 3 24.8V9.2Z" fill="${tone}" fill-opacity="0.92" stroke="#eafffb" stroke-opacity="0.4" stroke-width="1.2" />`
}

function depotMarkerHtml(depot: Scenario['depots'][number], runs: number): string {
  const style = DEPOT_STYLE[depot.id]
  return `
    <div class="rg-point">
      <div class="rg-depot" style="--tone:${style.color}">
        <svg class="rg-depot-shape" viewBox="0 0 34 34" aria-hidden="true">${depotShape(depot.code, style.color)}</svg>
        <span class="rg-depot-letter">${depot.code}</span>
        <span class="rg-depot-label">Depot ${depot.code}<em>${depot.shortName} · ${runs} runs</em></span>
      </div>
    </div>
  `
}

export function LeafletMap({
  scenario,
  plan,
  selectedWardId,
  selectedRoadId,
  showRoutes,
  onSelectWard,
  onSelectRoad,
  onTileFailure,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<L.Map | null>(null)
  const layersRef = useRef<L.LayerGroup | null>(null)
  const callbacksRef = useRef({ onSelectWard, onSelectRoad, onTileFailure })
  const [status, setStatus] = useState<'loading' | 'ready'>('loading')

  useEffect(() => {
    callbacksRef.current = { onSelectWard, onSelectRoad, onTileFailure }
  }, [onSelectWard, onSelectRoad, onTileFailure])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    setStatus('loading')
    const map = L.map(container, {
      center: MAP_CENTER,
      zoom: 13,
      minZoom: 11,
      maxZoom: 17,
      zoomControl: false,
      zoomSnap: 0.5,
      scrollWheelZoom: true,
      preferCanvas: true,
      attributionControl: true,
    })
    map.attributionControl.setPrefix(false)
    mapRef.current = map

    let loaded = false
    let failures = 0
    let failed = false

    const triggerFailure = () => {
      if (failed || loaded) return
      failed = true
      callbacksRef.current.onTileFailure()
    }

    const tiles = L.tileLayer(TILE_URL, {
      subdomains: 'abc',
      maxZoom: 19,
      attribution: TILE_ATTRIBUTION,
      detectRetina: false,
    })
    tiles.on('tileload', () => {
      loaded = true
      setStatus('ready')
    })
    tiles.on('tileerror', () => {
      failures += 1
      if (failures >= 3) triggerFailure()
    })
    tiles.addTo(map)

    const fallbackTimer = window.setTimeout(() => {
      if (!loaded) triggerFailure()
    }, 4600)

    const layers = L.layerGroup().addTo(map)
    layersRef.current = layers

    map.fitBounds(LEAFLET_BOUNDS, { padding: [34, 34], maxZoom: 14.5 })

    map.on('click', () => {
      callbacksRef.current.onSelectRoad(null)
    })

    const observer = new ResizeObserver(() => {
      map.invalidateSize()
    })
    observer.observe(container)

    return () => {
      window.clearTimeout(fallbackTimer)
      observer.disconnect()
      map.remove()
      mapRef.current = null
      layersRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    const layers = layersRef.current
    if (!map || !layers) return
    layers.clearLayers()

    const roadById = new Map<string, Road>(scenario.roads.map((road) => [road.id, road]))
    const runsByDepot = new Map<string, number>()
    for (const route of plan.routes) {
      runsByDepot.set(route.depotId, (runsByDepot.get(route.depotId) ?? 0) + route.trips)
    }

    for (const road of scenario.roads) {
      const selected = selectedRoadId === road.id
      const color =
        road.state === 'blocked' ? '#f87171' : road.state === 'congested' ? '#f0b45c' : '#7397ab'
      const geometry = road.geometry.map((point) => [point.lat, point.lng] as [number, number])

      if (selected) {
        L.polyline(geometry, {
          color: '#5eead4',
          weight: 12,
          opacity: 0.14,
          interactive: false,
        }).addTo(layers)
      }

      L.polyline(geometry, {
        color: '#07131f',
        weight: 7,
        opacity: 0.72,
        lineCap: 'round',
        interactive: false,
      }).addTo(layers)

      L.polyline(geometry, {
        color: selected ? '#d9fffa' : color,
        weight: selected ? 4 : road.state === 'open' ? 2.6 : 3.4,
        opacity: road.state === 'open' ? 0.9 : 1,
        dashArray: road.state === 'blocked' ? '2 5' : road.state === 'congested' ? '7 4' : undefined,
        lineCap: 'round',
        interactive: false,
      }).addTo(layers)

      const hit = L.polyline(geometry, {
        color: '#5eead4',
        weight: 18,
        opacity: 0.001,
        lineCap: 'round',
      }).addTo(layers)
      hit.bindTooltip(`${road.ref} · ${road.name} — ${road.state}`, {
        className: 'rg-tooltip',
        sticky: true,
        direction: 'top',
      })
      hit.on('click', (event) => {
        if (event.originalEvent) L.DomEvent.stopPropagation(event.originalEvent)
        callbacksRef.current.onSelectRoad(road.id)
      })

      if (road.state === 'blocked') {
        const midpoint = road.geometry[Math.floor(road.geometry.length / 2)]
        const icon = L.divIcon({
          className: 'rg-marker',
          html: '<div class="rg-point"><div class="rg-road-x">×</div></div>',
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        })
        L.marker([midpoint.lat, midpoint.lng], { icon, interactive: false, keyboard: false }).addTo(layers)
      }
    }

    if (showRoutes) {
      for (const route of plan.routes) {
        const pathRoads = route.path.map((id) => roadById.get(id)).filter((road): road is Road => Boolean(road))
        const geometry = buildRouteGeometry(route.depotId, pathRoads)
        if (geometry.length < 2) continue
        const emphasized = selectedWardId === route.wardId
        L.polyline(
          geometry.map((point) => [point.lat, point.lng] as [number, number]),
          {
            color: '#5eead4',
            weight: emphasized ? 2.8 : 1.4,
            opacity: emphasized ? 0.9 : selectedWardId ? 0.2 : 0.48,
            dashArray: '3 8',
            className: 'rg-route-line',
            interactive: false,
          },
        ).addTo(layers)
      }
    }

    for (const depot of scenario.depots) {
      const runs = runsByDepot.get(depot.id) ?? 0
      const icon = L.divIcon({
        className: 'rg-marker',
        html: depotMarkerHtml(depot, runs),
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      })
      const marker = L.marker([depot.location.lat, depot.location.lng], {
        icon,
        title: depot.name,
        alt: depot.name,
        keyboard: false,
        interactive: false,
      }).addTo(layers)
      const available = scenario.vehicles.filter(
        (vehicle) => vehicle.depotId === depot.id && vehicle.status === 'available',
      ).length
      marker.bindTooltip(
        `<strong>${depot.name}</strong><br/>Water ${formatNumber(depot.stock.water)} · Medical ${formatNumber(
          depot.stock.medical,
        )} · Food ${formatNumber(depot.stock.food)}<br/>${available} available vehicle${available === 1 ? '' : 's'} · ${runs} planned runs`,
        { className: 'rg-tooltip', direction: 'top', offset: [0, -16] },
      )
    }

    for (const ward of scenario.wards) {
      const wardPlan = plan.wards.find((entry) => entry.wardId === ward.id)
      const selected = selectedWardId === ward.id
      const icon = L.divIcon({
        className: 'rg-marker',
        html: wardMarkerHtml(ward, wardPlan, selected),
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      })
      const marker = L.marker([ward.location.lat, ward.location.lng], {
        icon,
        title: `${ward.name} — ${wardPlan ? Math.round(wardPlan.coverage * 100) : 0}% plan coverage`,
        alt: `${ward.name}, urgency ${ward.urgency} of 5`,
        keyboard: true,
      }).addTo(layers)
      marker.on('click', (event) => {
        if (event.originalEvent) L.DomEvent.stopPropagation(event.originalEvent)
        callbacksRef.current.onSelectWard(ward.id)
      })
      const element = marker.getElement()
      element?.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          callbacksRef.current.onSelectWard(ward.id)
        }
      })
    }
  }, [scenario, plan, selectedWardId, selectedRoadId, showRoutes])

  return (
    <div className="relative h-full w-full">
      <div
        ref={containerRef}
        className="absolute inset-0 z-0"
        aria-label="Interactive map of the fictional Sagarika District"
      />

      <div className="absolute right-2.5 top-2.5 z-10 flex flex-col overflow-hidden rounded-md border border-line bg-night-950/95 shadow-lg">
        <button
          type="button"
          onClick={() => mapRef.current?.zoomIn()}
          aria-label="Zoom in"
          className="flex h-7 w-7 items-center justify-center text-mist-300 transition-colors hover:bg-white/[0.07] hover:text-mist-50"
        >
          <Plus size={13} aria-hidden />
        </button>
        <div className="h-px bg-line/80" aria-hidden />
        <button
          type="button"
          onClick={() => mapRef.current?.zoomOut()}
          aria-label="Zoom out"
          className="flex h-7 w-7 items-center justify-center text-mist-300 transition-colors hover:bg-white/[0.07] hover:text-mist-50"
        >
          <Minus size={13} aria-hidden />
        </button>
        <div className="h-px bg-line/80" aria-hidden />
        <button
          type="button"
          onClick={() => mapRef.current?.fitBounds(LEAFLET_BOUNDS, { padding: [34, 34], maxZoom: 14.5 })}
          aria-label="Fit the district in view"
          className="flex h-7 w-7 items-center justify-center text-mist-400 transition-colors hover:bg-white/[0.07] hover:text-mist-50"
        >
          <Maximize2 size={12} aria-hidden />
        </button>
      </div>

      {status === 'loading' ? (
        <div className="pointer-events-none absolute inset-0 z-[5] flex items-center justify-center bg-night-950/35">
          <div className="flex items-center gap-2 rounded-md border border-line bg-night-950/90 px-3 py-2 shadow-lg">
            <span className="h-3 w-3 animate-spin rounded-full border border-mist-600 border-t-signal" aria-hidden />
            <span className="font-mono text-[8.5px] uppercase tracking-[0.1em] text-mist-300">
              Aligning OSM tiles
            </span>
          </div>
        </div>
      ) : null}
    </div>
  )
}
