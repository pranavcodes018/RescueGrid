import { describe, expect, it } from 'vitest'
import { createScenario } from '../../data/sagarika'
import { RUNS_PER_VEHICLE, SUPPLY_TYPES } from '../constants'
import { allocate } from '../allocation'
import { computeComparisons } from '../plan'
import type { RoadState, Scenario } from '../../types'

function scenarioWithRoads(roadIds: string[], state: RoadState): Scenario {
  const scenario = createScenario('coastal-cyclone')
  return {
    ...scenario,
    roads: scenario.roads.map((road) =>
      roadIds.includes(road.id) ? { ...road, state } : road,
    ),
  }
}

describe('deterministic allocator', () => {
  it('never allocates more than a ward requested', () => {
    const scenario = createScenario('coastal-cyclone')
    for (const strategy of ['optimizer', 'nearest', 'proportional'] as const) {
      const result = allocate(scenario, strategy, 55)
      for (const ward of scenario.wards) {
        for (const supply of SUPPLY_TYPES) {
          const delivered = result.deliveries
            .filter((entry) => entry.wardId === ward.id && entry.supply === supply)
            .reduce((sum, entry) => sum + entry.units, 0)
          expect(delivered).toBeLessThanOrEqual(ward.demand[supply])
          expect(delivered).toBeGreaterThanOrEqual(0)
        }
      }
    }
  })

  it('never leaves a depot with negative stock', () => {
    const scenario = createScenario('coastal-cyclone')
    const result = allocate(scenario, 'optimizer', 55)
    for (const depot of result.depotInventory) {
      for (const supply of SUPPLY_TYPES) {
        expect(depot.remaining[supply]).toBeGreaterThanOrEqual(0)
        expect(depot.dispatched[supply]).toBeGreaterThanOrEqual(0)
        expect(depot.dispatched[supply]).toBeLessThanOrEqual(depot.openingStock[supply])
        expect(depot.openingStock[supply] - depot.dispatched[supply]).toBeCloseTo(
          depot.remaining[supply],
          6,
        )
      }
    }
  })

  it('respects vehicle capacity and the run budget', () => {
    const scenario = createScenario('coastal-cyclone')
    const result = allocate(scenario, 'optimizer', 55)
    for (const delivery of result.deliveries) {
      expect(delivery.trips).toBeGreaterThan(0)
      expect(delivery.units).toBeLessThanOrEqual(delivery.vehicleCapacityUnits * delivery.trips)
      expect(delivery.units).toBeGreaterThan(0)
    }
    for (const usage of result.fleet) {
      if (!usage.available) {
        expect(usage.runsUsed).toBe(0)
        continue
      }
      expect(usage.runsUsed).toBeLessThanOrEqual(RUNS_PER_VEHICLE)
      expect(usage.unitsMoved).toBeLessThanOrEqual(usage.capacityUnits * RUNS_PER_VEHICLE)
    }
    const moved = result.fleet.reduce((sum, usage) => sum + usage.unitsMoved, 0)
    expect(moved).toBeLessThanOrEqual(result.fleetCapacityOffered)
    expect(result.fleetCapacityMoved).toBe(moved)
  })

  it('never routes a delivery from an unreachable depot', () => {
    const scenario = scenarioWithRoads(['road-beach', 'road-colony-link'], 'blocked')
    const result = allocate(scenario, 'optimizer', 55)
    const harbourDeliveries = result.deliveries.filter((entry) => entry.wardId === 'ward-harbour')
    expect(harbourDeliveries.length).toBeGreaterThan(0)
    expect(harbourDeliveries.every((entry) => entry.depotId !== 'depot-b')).toBe(true)
    expect(harbourDeliveries.every((entry) => entry.path.length > 0)).toBe(true)
  })

  it('records unreachable demand instead of allocating it', () => {
    const scenario = scenarioWithRoads(['road-ridge', 'road-east-bypass'], 'blocked')
    const result = allocate(scenario, 'optimizer', 55)

    expect(result.deliveries.some((entry) => entry.wardId === 'ward-hillview')).toBe(false)
    const hillview = result.unserved.filter((entry) => entry.wardId === 'ward-hillview')
    expect(hillview.length).toBe(SUPPLY_TYPES.length)
    expect(hillview.every((entry) => entry.reason === 'unreachable')).toBe(true)
    expect(result.reachability.find((entry) => entry.wardId === 'ward-hillview')?.reachable).toBe(false)
  })

  it('is deterministic for repeated runs', () => {
    const scenario = createScenario('coastal-cyclone')
    const first = allocate(scenario, 'optimizer', 55)
    const second = allocate(scenario, 'optimizer', 55)
    expect(second).toEqual(first)
  })

  it('does not mutate the scenario it is given', () => {
    const scenario = createScenario('coastal-cyclone')
    const snapshot = JSON.parse(JSON.stringify(scenario))
    allocate(scenario, 'optimizer', 55)
    expect(scenario).toEqual(snapshot)
  })

  it('gives every strategy identical starting conditions', () => {
    const scenario = createScenario('coastal-cyclone')
    const snapshot = JSON.parse(JSON.stringify(scenario))
    const plans = computeComparisons(scenario, 55)

    for (const strategy of ['optimizer', 'nearest', 'proportional'] as const) {
      const plan = plans[strategy]
      expect(plan.totals.demand).toBe(
        scenario.wards.reduce(
          (sum, ward) => sum + SUPPLY_TYPES.reduce((s, supply) => s + ward.demand[supply], 0),
          0,
        ),
      )
      expect(plan.totals.stock).toBe(
        scenario.depots.reduce(
          (sum, depot) => sum + SUPPLY_TYPES.reduce((s, supply) => s + depot.stock[supply], 0),
          0,
        ),
      )
      for (const supply of SUPPLY_TYPES) {
        expect(plan.supplies[supply].stock).toBe(
          scenario.depots.reduce((sum, depot) => sum + depot.stock[supply], 0),
        )
        expect(plan.supplies[supply].allocated).toBeLessThanOrEqual(plan.supplies[supply].stock)
      }
      expect(plan.totals.fleetCapacityOffered).toBe(
        scenario.vehicles
          .filter((vehicle) => vehicle.status === 'available')
          .reduce((sum, vehicle) => sum + vehicle.capacityUnits * RUNS_PER_VEHICLE, 0),
      )
    }

    expect(scenario).toEqual(snapshot)
  })

  it('holds back deliveries when every vehicle is unavailable', () => {
    const scenario = createScenario('coastal-cyclone')
    const withoutFleet: Scenario = {
      ...scenario,
      vehicles: scenario.vehicles.map((vehicle) => ({ ...vehicle, status: 'maintenance' as const })),
    }
    const result = allocate(withoutFleet, 'optimizer', 55)
    expect(result.deliveries).toEqual([])
    expect(result.unserved.every((entry) => entry.reason === 'fleet' || entry.reason === 'unreachable')).toBe(
      true,
    )
    expect(result.fleetCapacityMoved).toBe(0)
  })
})
