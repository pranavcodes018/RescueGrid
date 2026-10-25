import { describe, expect, it } from 'vitest'
import { BASE_ROADS } from '../../data/sagarika'
import type { Road, RoadId, RoadState } from '../../types'
import { buildGraph, findRoute } from '../routing'

const allOpen = (): Road[] => BASE_ROADS.map((road) => ({ ...road, state: 'open' as RoadState }))

function withState(base: Road[], roadId: RoadId, state: RoadState): Road[] {
  return base.map((road) => (road.id === roadId ? { ...road, state } : road))
}

describe('Dijkstra routing', () => {
  it('selects the shortest path when several routes exist', () => {
    const route = findRoute(allOpen(), 'depot-b', 'ward-harbour')
    expect(route.reachable).toBe(true)
    expect(route.path).toEqual(['road-beach'])
    expect(route.distanceKm).toBeCloseTo(2.4, 5)
    expect(route.reason).toBe('ok')
  })

  it('chooses the lower-distance chain instead of a longer alternative', () => {
    const route = findRoute(allOpen(), 'depot-a', 'ward-east-market')
    expect(route.reachable).toBe(true)
    expect(route.path).toEqual(['road-old-town-spine', 'road-market-connector'])
    expect(route.distanceKm).toBeCloseTo(6.4, 5)
  })

  it('excludes blocked segments and returns the detour', () => {
    const roads = withState(allOpen(), 'road-beach', 'blocked')
    const graph = buildGraph(roads)
    const beachUsed = (graph.adjacency.get('depot-b') ?? []).some((edge) => edge.road.id === 'road-beach')
    expect(beachUsed).toBe(false)

    const route = findRoute(roads, 'depot-b', 'ward-harbour')
    expect(route.reachable).toBe(true)
    expect(route.path).not.toContain('road-beach')
    expect(route.path).toEqual(['road-colony-link', 'road-south-causeway'])
    expect(route.distanceKm).toBeCloseTo(4.9, 5)
  })

  it('returns an explicit unreachable result instead of inventing a route', () => {
    let roads = withState(allOpen(), 'road-ridge', 'blocked')
    roads = withState(roads, 'road-east-bypass', 'blocked')
    const route = findRoute(roads, 'depot-a', 'ward-hillview')
    expect(route.reachable).toBe(false)
    expect(route.reason).toBe('no-open-route')
    expect(route.path).toEqual([])
    expect(route.geometry).toEqual([])
    expect(Number.isFinite(route.distanceKm)).toBe(false)
  })

  it('charges the fixed congestion multiplier on congested segments', () => {
    const roads = withState(allOpen(), 'road-beach', 'congested')
    const route = findRoute(roads, 'depot-b', 'ward-harbour')
    expect(route.distanceKm).toBeCloseTo(2.4, 5)
    expect(route.costKm).toBeCloseTo(2.4 * 1.55, 5)
    expect(route.delayKm).toBeCloseTo(2.4 * 0.55, 5)
  })

  it('is deterministic across repeated calls', () => {
    const roads = allOpen()
    const first = findRoute(roads, 'depot-a', 'ward-harbour')
    const second = findRoute(roads, 'depot-a', 'ward-harbour')
    expect(second).toEqual(first)
  })
})
