import { RUNS_PER_VEHICLE, SUPPLY_META, SUPPLY_TYPES } from './constants'
import { clamp, formatNumber } from './format'
import { priorityWeight } from './priority'
import { findRoute, roadsWithState, runDistanceKm, runHours, type RouteResult } from './routing'
import type {
  Depot,
  DepotId,
  DepotInventory,
  PlanAllocation,
  ReachabilityEntry,
  Scenario,
  StrategyId,
  SupplyType,
  SupplyValues,
  UnservedDemand,
  UnservedReason,
  Vehicle,
  VehicleUsage,
  Ward,
  WardId,
} from '../types'

export interface AllocationResult {
  strategy: StrategyId
  priority: number
  deliveries: PlanAllocation[]
  unserved: UnservedDemand[]
  depotInventory: DepotInventory[]
  fleet: VehicleUsage[]
  reachability: ReachabilityEntry[]
  routeDistanceKm: number
  routeTimeHours: number
  fleetCapacityOffered: number
  fleetCapacityMoved: number
  priorityWeights: Record<WardId, number>
}

interface FleetUnit {
  vehicle: Vehicle
  runsLeft: number
  runsUsed: number
  unitsMoved: number
}

function emptySupplyValues(): SupplyValues {
  return { water: 0, medical: 0, food: 0 }
}

function wardDemandUnits(ward: Ward): number {
  return SUPPLY_TYPES.reduce((sum, supply) => sum + ward.demand[supply], 0)
}

function roundTripKmFor(distanceKm: number, trips: number): number {
  return runDistanceKm(distanceKm) * trips
}

/**
 * Distribute a supply pool across wards in proportion to their population,
 * capped at each ward's requested units. Whole units are assigned with the
 * largest-remainder method so the result is deterministic and sums to the pool.
 */
export function proportionalTargets(
  wards: Ward[],
  pool: number,
  supply: SupplyType,
): Record<WardId, number> {
  const targets = {} as Record<WardId, number>
  for (const ward of wards) targets[ward.id] = 0
  if (pool <= 0) return targets

  const totalPopulation = wards.reduce((sum, ward) => sum + ward.population, 0)
  if (totalPopulation <= 0) return targets

  const remainders: Array<{ wardId: WardId; remainder: number; population: number }> = []
  let assigned = 0

  for (const ward of wards) {
    const share = (ward.population / totalPopulation) * pool
    const want = Math.min(ward.demand[supply], Math.max(0, share))
    const whole = Math.floor(want)
    targets[ward.id] = whole
    assigned += whole
    remainders.push({ wardId: ward.id, remainder: want - whole, population: ward.population })
  }

  let remaining = Math.max(0, pool - assigned)
  remainders.sort((a, b) => {
    if (Math.abs(b.remainder - a.remainder) > 1e-9) return b.remainder - a.remainder
    if (b.population !== a.population) return b.population - a.population
    return a.wardId.localeCompare(b.wardId)
  })

  let guard = 0
  while (remaining > 0 && guard < pool + wards.length * 4) {
    let progressed = false
    for (const entry of remainders) {
      if (remaining <= 0) break
      const ward = wards.find((candidate) => candidate.id === entry.wardId)
      if (!ward) continue
      if (targets[entry.wardId] >= ward.demand[supply]) continue
      targets[entry.wardId] += 1
      remaining -= 1
      progressed = true
    }
    if (!progressed) break
    guard += 1
  }

  return targets
}

/**
 * Deterministic greedy allocator.
 *
 * Constraints enforced for every delivery:
 *  - depot stock for that supply (never negative),
 *  - ward's remaining requested units (never over-allocated),
 *  - one available vehicle per delivery with finite capacity per run,
 *  - each vehicle's run budget (RUNS_PER_VEHICLE) is consumed by whole trips,
 *  - only routes that exist on the current open graph are used.
 *
 * Delivery order differs by strategy; the feasibility rules do not. Each call
 * works on its own deep copies of demand, stock and vehicles, so running a
 * strategy never consumes inventory from another run.
 */
export function allocate(
  scenario: Scenario,
  strategy: StrategyId,
  priority: number,
): AllocationResult {
  const priorityValue = clamp(priority, 0, 100)

  const wards = scenario.wards.map((ward) => ({ ...ward, demand: { ...ward.demand } }))
  const depots = scenario.depots.map((depot) => ({ ...depot, stock: { ...depot.stock } }))
  const vehicles = scenario.vehicles.map((vehicle) => ({ ...vehicle }))
  const roads = scenario.roads.map((road) => ({ ...road }))

  const stock = new Map<DepotId, SupplyValues>()
  const opening = new Map<DepotId, SupplyValues>()
  for (const depot of depots) {
    stock.set(depot.id, { ...depot.stock })
    opening.set(depot.id, { ...depot.stock })
  }

  const openRoads = roadsWithState(roads, 'open')
  const routeCache = new Map<string, RouteResult>()
  function routeFor(depotId: DepotId, wardId: WardId): RouteResult {
    const key = `${depotId}|${wardId}`
    const cached = routeCache.get(key)
    if (cached) return cached
    const result = findRoute(roads, depotId, wardId)
    routeCache.set(key, result)
    return result
  }
  const baselineCache = new Map<string, RouteResult>()
  function baselineRouteFor(depotId: DepotId, wardId: WardId): RouteResult {
    const key = `${depotId}|${wardId}`
    const cached = baselineCache.get(key)
    if (cached) return cached
    const result = findRoute(openRoads, depotId, wardId)
    baselineCache.set(key, result)
    return result
  }

  const reachability: ReachabilityEntry[] = wards.map((ward) => {
    let best: { depotId: DepotId; distanceKm: number; costKm: number } | null = null
    for (const depot of depots) {
      const route = routeFor(depot.id, ward.id)
      if (!route.reachable) continue
      if (!best || route.costKm < best.costKm - 1e-9) {
        best = { depotId: depot.id, distanceKm: route.distanceKm, costKm: route.costKm }
      }
    }
    return {
      wardId: ward.id,
      reachable: best !== null,
      nearestDepotId: best?.depotId ?? null,
      distanceKm: best ? best.distanceKm : null,
      costKm: best ? best.costKm : null,
    }
  })
  const nearestByWard = new Map(reachability.map((entry) => [entry.wardId, entry]))

  const fleetUnits: FleetUnit[] = vehicles
    .filter((vehicle) => vehicle.status === 'available')
    .map((vehicle) => ({ vehicle, runsLeft: RUNS_PER_VEHICLE, runsUsed: 0, unitsMoved: 0 }))
    .sort((a, b) => {
      if (b.vehicle.capacityUnits !== a.vehicle.capacityUnits) {
        return b.vehicle.capacityUnits - a.vehicle.capacityUnits
      }
      return a.vehicle.id.localeCompare(b.vehicle.id)
    })

  const fleetByDepot = new Map<DepotId, FleetUnit[]>()
  for (const unit of fleetUnits) {
    const list = fleetByDepot.get(unit.vehicle.depotId)
    if (list) list.push(unit)
    else fleetByDepot.set(unit.vehicle.depotId, [unit])
  }

  const delivered = new Map<WardId, SupplyValues>()
  for (const ward of wards) delivered.set(ward.id, emptySupplyValues())
  const deliveries: PlanAllocation[] = []

  function dispatch(
    ward: Ward,
    depotId: DepotId,
    supply: SupplyType,
    wanted: number,
  ): PlanAllocation | null {
    if (!(wanted > 0)) return null
    const depotStock = stock.get(depotId)
    if (!depotStock) return null
    const availableStock = depotStock[supply]
    if (!(availableStock > 0)) return null

    const unit = (fleetByDepot.get(depotId) ?? []).find((candidate) => candidate.runsLeft > 0)
    if (!unit) return null

    const route = routeFor(depotId, ward.id)
    if (!route.reachable) return null

    const capacity = Math.max(1, unit.vehicle.capacityUnits)
    const freightAllowed = unit.runsLeft * capacity
    let units = Math.floor(Math.min(wanted, availableStock, freightAllowed))
    if (units <= 0) return null

    let trips = Math.ceil(units / capacity)
    if (trips > unit.runsLeft) {
      trips = unit.runsLeft
      units = trips * capacity
    }
    if (units <= 0) return null

    const baseline = baselineRouteFor(depotId, ward.id)
    const detourKm = baseline.reachable ? Math.max(0, route.distanceKm - baseline.distanceKm) : 0
    const hours = trips * runHours(unit.vehicle, route.distanceKm, route.delayKm)

    const record: PlanAllocation = {
      wardId: ward.id,
      depotId,
      supply,
      units,
      distanceKm: route.distanceKm,
      delayKm: route.delayKm,
      detourKm,
      path: [...route.path],
      trips,
      vehicleId: unit.vehicle.id,
      vehicleHours: hours,
      vehicleCapacityUnits: capacity,
      roundTripKm: roundTripKmFor(route.distanceKm, trips),
    }

    depotStock[supply] = Math.max(0, availableStock - units)
    unit.runsLeft -= trips
    unit.runsUsed += trips
    unit.unitsMoved += units
    const wardDelivered = delivered.get(ward.id)
    if (wardDelivered) wardDelivered[supply] += units
    deliveries.push(record)

    return record
  }

  const weights = {} as Record<WardId, number>
  for (const ward of wards) weights[ward.id] = priorityWeight(ward)

  const totalDemand = wards.reduce((sum, ward) => sum + wardDemandUnits(ward), 0)
  const maxWeight = Math.max(...wards.map((ward) => weights[ward.id]), 0)
  const p = priorityValue / 100

  const scoreFor = (ward: Ward): number => {
    const demandShare = totalDemand > 0 ? wardDemandUnits(ward) / totalDemand : 0
    const needShare = maxWeight > 0 ? weights[ward.id] / maxWeight : 0
    return (1 - p) * demandShare + p * needShare
  }

  const costFor = (ward: Ward): number => nearestByWard.get(ward.id)?.costKm ?? Number.POSITIVE_INFINITY

  const optimizerOrder = [...wards].sort((a, b) => {
    const diff = scoreFor(b) - scoreFor(a)
    if (Math.abs(diff) > 1e-9) return diff
    if (b.urgency !== a.urgency) return b.urgency - a.urgency
    return a.id.localeCompare(b.id)
  })

  const nearestOrder = [...wards].sort((a, b) => {
    const diff = costFor(a) - costFor(b)
    if (Number.isFinite(diff) && Math.abs(diff) > 1e-9) return diff
    if (Number.isFinite(costFor(a)) !== Number.isFinite(costFor(b))) {
      return Number.isFinite(costFor(a)) ? -1 : 1
    }
    if (b.urgency !== a.urgency) return b.urgency - a.urgency
    return a.id.localeCompare(b.id)
  })

  const proportionalOrder = [...wards].sort((a, b) => {
    if (b.population !== a.population) return b.population - a.population
    return a.id.localeCompare(b.id)
  })

  const proportionalTargetsBySupply = new Map<SupplyType, Record<WardId, number>>()
  if (strategy === 'proportional') {
    for (const supply of SUPPLY_TYPES) {
      const pool = depots.reduce((sum, depot) => sum + depot.stock[supply], 0)
      proportionalTargetsBySupply.set(supply, proportionalTargets(wards, pool, supply))
    }
  }

  const order = strategy === 'nearest' ? nearestOrder : strategy === 'proportional' ? proportionalOrder : optimizerOrder

  const depotOrder = (ward: Ward): Depot[] =>
    [...depots].sort((a, b) => {
      const routeA = routeFor(a.id, ward.id)
      const routeB = routeFor(b.id, ward.id)
      const ca = routeA.reachable ? routeA.costKm : Number.POSITIVE_INFINITY
      const cb = routeB.reachable ? routeB.costKm : Number.POSITIVE_INFINITY
      if (Number.isFinite(ca) !== Number.isFinite(cb)) return Number.isFinite(ca) ? -1 : 1
      if (Number.isFinite(ca) && Math.abs(ca - cb) > 1e-9) return ca - cb
      return a.id.localeCompare(b.id)
    })

  for (const ward of order) {
    const depotList = depotOrder(ward)
    for (const supply of SUPPLY_TYPES) {
      const targets = proportionalTargetsBySupply.get(supply)
      let wanted = ward.demand[supply] - (delivered.get(ward.id)?.[supply] ?? 0)
      if (targets) {
        wanted = Math.min(wanted, targets[ward.id] - (delivered.get(ward.id)?.[supply] ?? 0))
      }
      if (!(wanted > 0)) continue

      for (const depot of depotList) {
        if (wanted <= 0) break
        const route = routeFor(depot.id, ward.id)
        if (!route.reachable) continue
        const record = dispatch(ward, depot.id, supply, wanted)
        if (!record) continue
        wanted -= record.units
      }
    }
  }

  const unserved: UnservedDemand[] = []
  for (const ward of wards) {
    const reachableDepots = depots.filter((depot) => routeFor(depot.id, ward.id).reachable)
    for (const supply of SUPPLY_TYPES) {
      const unmet = ward.demand[supply] - (delivered.get(ward.id)?.[supply] ?? 0)
      if (!(unmet > 0)) continue

      let reason: UnservedReason
      let detail: string
      if (reachableDepots.length === 0) {
        reason = 'unreachable'
        detail = `No open road connects ${ward.shortName} to any depot, so no delivery can be routed.`
      } else {
        const stockLeft = reachableDepots.reduce((sum, depot) => sum + (stock.get(depot.id)?.[supply] ?? 0), 0)
        const fleetLeft = reachableDepots.reduce(
          (sum, depot) =>
            sum +
            (fleetByDepot.get(depot.id) ?? []).reduce(
              (fleetSum, unit) => fleetSum + unit.runsLeft * unit.vehicle.capacityUnits,
              0,
            ),
          0,
        )
        if (stockLeft <= 0) {
          reason = 'stock'
          detail = `${SUPPLY_META[supply].shortLabel} stock at every reachable depot is exhausted.`
        } else if (fleetLeft <= 0) {
          reason = 'fleet'
          detail = `${formatNumber(stockLeft)} units remain at reachable depots, but the available vehicles have no runs left.`
        } else {
          reason = 'stock'
          detail = `Reachable stock was committed to higher-ranked wards before ${ward.shortName} was served.`
        }
      }

      unserved.push({ wardId: ward.id, supply, units: unmet, reason, detail })
    }
  }

  const depotInventory: DepotInventory[] = depots.map((depot) => {
    const openingStock = opening.get(depot.id) ?? emptySupplyValues()
    const remaining = stock.get(depot.id) ?? emptySupplyValues()
    return {
      depotId: depot.id,
      openingStock: { ...openingStock },
      remaining: { ...remaining },
      dispatched: {
        water: openingStock.water - remaining.water,
        medical: openingStock.medical - remaining.medical,
        food: openingStock.food - remaining.food,
      },
    }
  })

  const fleet: VehicleUsage[] = vehicles.map((vehicle) => {
    const unit = fleetUnits.find((candidate) => candidate.vehicle.id === vehicle.id)
    return {
      vehicleId: vehicle.id,
      depotId: vehicle.depotId,
      capacityUnits: vehicle.capacityUnits,
      runBudget: unit ? RUNS_PER_VEHICLE : 0,
      runsUsed: unit?.runsUsed ?? 0,
      unitsMoved: unit?.unitsMoved ?? 0,
      capacityOffered: unit ? unit.vehicle.capacityUnits * RUNS_PER_VEHICLE : 0,
      available: vehicle.status === 'available',
    }
  })

  const routeDistanceKm = deliveries.reduce((sum, delivery) => sum + delivery.roundTripKm, 0)
  const routeTimeHours = deliveries.reduce((sum, delivery) => sum + delivery.vehicleHours, 0)
  const fleetCapacityOffered = fleet.reduce((sum, usage) => sum + usage.capacityOffered, 0)
  const fleetCapacityMoved = fleet.reduce((sum, usage) => sum + usage.unitsMoved, 0)

  return {
    strategy,
    priority: priorityValue,
    deliveries,
    unserved,
    depotInventory,
    fleet,
    reachability,
    routeDistanceKm,
    routeTimeHours,
    fleetCapacityOffered,
    fleetCapacityMoved,
    priorityWeights: weights,
  }
}
