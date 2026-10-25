import type { LatLng, NodeId, Road, RoadId, Vehicle } from '../types'

/** Congested segments carry a fixed travel-cost multiplier in this prototype. */
export const CONGESTION_FACTOR = 1.55
/** Fixed loading/handling time per planned run. */
export const HANDLING_HOURS_PER_RUN = 0.25

export type RouteStatus = 'ok' | 'same-node' | 'no-open-route'

export interface RouteResult {
  reachable: boolean
  distanceKm: number
  /** Distance weighted by congestion; used as the Dijkstra edge cost. */
  costKm: number
  /** costKm − distanceKm: the congestion penalty on this route. */
  delayKm: number
  path: RoadId[]
  geometry: LatLng[]
  reason: RouteStatus
}

export interface GraphEdge {
  road: Road
  to: NodeId
  distanceKm: number
  costKm: number
}

export interface RoadGraph {
  nodes: NodeId[]
  adjacency: Map<NodeId, GraphEdge[]>
}

function unreachable(): RouteResult {
  return {
    reachable: false,
    distanceKm: Number.POSITIVE_INFINITY,
    costKm: Number.POSITIVE_INFINITY,
    delayKm: Number.POSITIVE_INFINITY,
    path: [],
    geometry: [],
    reason: 'no-open-route',
  }
}

/** Cost multiplier for a segment. Blocked roads are removed from the graph entirely. */
export function roadCostFactor(road: Pick<Road, 'state'>): number {
  return road.state === 'congested' ? CONGESTION_FACTOR : 1
}

/**
 * Build an undirected weighted graph from the road list. Blocked segments are
 * skipped, so they can never appear in a computed route. Edges and adjacency
 * lists are sorted deterministically to keep equal-cost paths stable.
 */
export function buildGraph(roads: Road[]): RoadGraph {
  const adjacency = new Map<NodeId, GraphEdge[]>()
  const nodes = new Set<NodeId>()

  const addEdge = (from: NodeId, edge: GraphEdge) => {
    const list = adjacency.get(from)
    if (list) list.push(edge)
    else adjacency.set(from, [edge])
    nodes.add(from)
  }

  for (const road of roads) {
    if (road.state === 'blocked') continue
    if (!(road.distanceKm > 0)) continue
    const costKm = road.distanceKm * roadCostFactor(road)
    addEdge(road.from, { road, to: road.to, distanceKm: road.distanceKm, costKm })
    addEdge(road.to, { road, to: road.from, distanceKm: road.distanceKm, costKm })
  }

  for (const list of adjacency.values()) {
    list.sort((a, b) => (a.to === b.to ? a.road.id.localeCompare(b.road.id) : a.to.localeCompare(b.to)))
  }

  return { nodes: [...nodes].sort(), adjacency }
}

interface HeapEntry {
  node: NodeId
  distance: number
}

/** Minimal binary min-heap so Dijkstra does not scan every unvisited node. */
class MinHeap {
  private items: HeapEntry[] = []

  private less(a: HeapEntry, b: HeapEntry): boolean {
    if (a.distance !== b.distance) return a.distance < b.distance
    return a.node.localeCompare(b.node) < 0
  }

  get size(): number {
    return this.items.length
  }

  push(entry: HeapEntry): void {
    this.items.push(entry)
    let index = this.items.length - 1
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2)
      if (!this.less(this.items[index], this.items[parent])) break
      ;[this.items[index], this.items[parent]] = [this.items[parent], this.items[index]]
      index = parent
    }
  }

  pop(): HeapEntry | undefined {
    if (this.items.length === 0) return undefined
    const top = this.items[0]
    const last = this.items.pop()
    if (this.items.length > 0 && last) {
      this.items[0] = last
      let index = 0
      for (;;) {
        const left = index * 2 + 1
        const right = left + 1
        let smallest = index
        if (left < this.items.length && this.less(this.items[left], this.items[smallest])) smallest = left
        if (right < this.items.length && this.less(this.items[right], this.items[smallest])) smallest = right
        if (smallest === index) break
        ;[this.items[index], this.items[smallest]] = [this.items[smallest], this.items[index]]
        index = smallest
      }
    }
    return top
  }
}

/**
 * Dijkstra shortest path over the demo road graph, weighted by distance with a
 * fixed congestion multiplier. Returns an explicit unreachable result when no
 * open path exists — it never falls back to a straight line or invented route.
 */
export function findRoute(roads: Road[], from: NodeId, to: NodeId): RouteResult {
  if (from === to) {
    return {
      reachable: true,
      distanceKm: 0,
      costKm: 0,
      delayKm: 0,
      path: [],
      geometry: [],
      reason: 'same-node',
    }
  }

  const graph = buildGraph(roads)
  if (!graph.adjacency.has(from) || !graph.adjacency.has(to)) return unreachable()

  const distances = new Map<NodeId, number>([[from, 0]])
  const previous = new Map<NodeId, { node: NodeId; road: Road }>()
  const visited = new Set<NodeId>()
  const heap = new MinHeap()
  heap.push({ node: from, distance: 0 })

  while (heap.size > 0) {
    const current = heap.pop()
    if (!current) break
    if (visited.has(current.node)) continue
    visited.add(current.node)
    if (current.node === to) break

    for (const edge of graph.adjacency.get(current.node) ?? []) {
      if (visited.has(edge.to)) continue
      const nextDistance = current.distance + edge.costKm
      const known = distances.get(edge.to) ?? Number.POSITIVE_INFINITY
      if (nextDistance < known - 1e-9) {
        distances.set(edge.to, nextDistance)
        previous.set(edge.to, { node: current.node, road: edge.road })
        heap.push({ node: edge.to, distance: nextDistance })
      }
    }
  }

  if (!distances.has(to)) return unreachable()

  const roadPath: Road[] = []
  let cursor: NodeId = to
  let guard = 0
  while (cursor !== from && guard <= graph.nodes.length) {
    const step = previous.get(cursor)
    if (!step) return unreachable()
    roadPath.unshift(step.road)
    cursor = step.node
    guard += 1
  }
  if (cursor !== from) return unreachable()

  const distanceKm = roadPath.reduce((sum, road) => sum + road.distanceKm, 0)
  const costKm = distances.get(to) ?? distanceKm

  return {
    reachable: true,
    distanceKm,
    costKm,
    delayKm: Math.max(0, costKm - distanceKm),
    path: roadPath.map((road) => road.id),
    geometry: buildRouteGeometry(from, roadPath),
    reason: 'ok',
  }
}

export function buildRouteGeometry(start: NodeId, path: Road[]): LatLng[] {
  const points: LatLng[] = []
  let cursor: NodeId = start

  for (const road of path) {
    const forward = road.from === cursor
    const segment = forward ? road.geometry : [...road.geometry].reverse()
    if (points.length === 0) {
      points.push(...segment.map((p) => ({ ...p })))
    } else {
      points.push(...segment.slice(1).map((p) => ({ ...p })))
    }
    cursor = forward ? road.to : road.from
  }

  return points
}

/**
 * Hours for one planned run: loaded out, empty back, plus fixed handling.
 * Congestion delay is charged on both directions.
 */
export function runHours(vehicle: Pick<Vehicle, 'speedKph'>, distanceKm: number, delayKm: number): number {
  const speed = Math.max(1, vehicle.speedKph)
  const roundTripKm = 2 * distanceKm + 2 * Math.max(0, delayKm)
  return roundTripKm / speed + HANDLING_HOURS_PER_RUN
}

/** Round-trip kilometres for a planned run. */
export function runDistanceKm(distanceKm: number): number {
  return 2 * Math.max(0, distanceKm)
}

export function roadsWithState(roads: Road[], state: Road['state']): Road[] {
  return roads.map((road) => ({ ...road, state }))
}
