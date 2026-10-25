import type {
  DepotId,
  Plan,
  PlanAllocation,
  PlanBottleneck,
  PlanRoute,
  PlanTotals,
  RouteTrace,
  Scenario,
  StrategyId,
  SupplyTotals,
  SupplyType,
  SupplyValues,
  UnservedReason,
  WardPlan,
} from '../types'
import { RUNS_PER_VEHICLE, SUPPLY_META, SUPPLY_TYPES } from './constants'
import { allocate } from './allocation'
import { clamp, formatDecimal, formatNumber, formatPct } from './format'
import { weightedUnmet } from './priority'
import { cloneScenario } from './scenario'

const emptySupplyValues = (): SupplyValues => ({ water: 0, medical: 0, food: 0 })

function aggregateRoutes(allocations: PlanAllocation[]): PlanRoute[] {
  const routeMap = new Map<string, PlanRoute>()
  for (const allocation of allocations) {
    const key = `${allocation.depotId}|${allocation.wardId}`
    const existing = routeMap.get(key)
    if (existing) {
      existing.units += allocation.units
      existing.trips += allocation.trips
      existing.vehicleHours += allocation.vehicleHours
    } else {
      routeMap.set(key, {
        depotId: allocation.depotId,
        wardId: allocation.wardId,
        units: allocation.units,
        distanceKm: allocation.distanceKm,
        delayKm: allocation.delayKm,
        detourKm: allocation.detourKm,
        path: allocation.path,
        trips: allocation.trips,
        vehicleHours: allocation.vehicleHours,
      })
    }
  }
  return [...routeMap.values()].sort((a, b) => b.units - a.units)
}

/**
 * Compute a plan from the deterministic allocator.
 *
 * Every metric below is derived from the deliveries the allocator actually
 * produced (or explicitly refused), not from a UI-only estimate. The input
 * scenario is copied inside `allocate` and is never mutated.
 */
export function computePlan(scenario: Scenario, strategy: StrategyId, priority: number): Plan {
  const generatedAt = Date.now()
  const priorityValue = clamp(priority, 0, 100)
  const result = allocate(scenario, strategy, priorityValue)
  const allocations = result.deliveries
  const routes = aggregateRoutes(allocations)

  const reachabilityById = new Map(result.reachability.map((entry) => [entry.wardId, entry]))

  const wardPlans: WardPlan[] = scenario.wards.map((ward) => {
    const wardAllocations = allocations.filter((allocation) => allocation.wardId === ward.id)
    const allocated = emptySupplyValues()
    const unmet = emptySupplyValues()
    const bySupply = {} as Record<
      SupplyType,
      {
        demand: number
        allocated: number
        unmet: number
        sourceDepotId: DepotId | null
        route: RouteTrace | null
      }
    >

    for (const supply of SUPPLY_TYPES) {
      const relevant = wardAllocations.filter((allocation) => allocation.supply === supply)
      const total = relevant.reduce((sum, allocation) => sum + allocation.units, 0)
      const source = [...relevant].sort((a, b) => b.units - a.units)[0] ?? null
      const remaining = Math.max(0, ward.demand[supply] - total)
      allocated[supply] = total
      unmet[supply] = remaining
      bySupply[supply] = {
        demand: ward.demand[supply],
        allocated: total,
        unmet: remaining,
        sourceDepotId: source?.depotId ?? null,
        route: source
          ? {
              path: source.path,
              distanceKm: source.distanceKm,
              costKm: source.distanceKm + source.delayKm,
              delayKm: source.delayKm,
              detourKm: source.detourKm,
            }
          : null,
      }
    }

    const demandUnits = SUPPLY_TYPES.reduce((sum, supply) => sum + ward.demand[supply], 0)
    const allocatedUnits = SUPPLY_TYPES.reduce((sum, supply) => sum + allocated[supply], 0)
    const unmetUnits = Math.max(0, demandUnits - allocatedUnits)
    const weight = result.priorityWeights[ward.id] ?? 0
    const reachability = reachabilityById.get(ward.id)

    return {
      wardId: ward.id,
      urgency: ward.urgency,
      vulnerabilityScore: ward.vulnerability.score,
      priorityWeight: weight,
      reachable: reachability?.reachable ?? false,
      demand: { ...ward.demand },
      allocated,
      unmet,
      bySupply,
      coverage: demandUnits > 0 ? allocatedUnits / demandUnits : 0,
      demandUnits,
      allocatedUnits,
      unmetUnits,
      priorityWeightedUnmet: weightedUnmet(unmetUnits, weight),
      nearestDepotDistanceKm: reachability?.distanceKm ?? null,
      allocationShare: 0,
    }
  })

  const totalAllocated = wardPlans.reduce((sum, ward) => sum + ward.allocatedUnits, 0)
  for (const ward of wardPlans) {
    ward.allocationShare = totalAllocated > 0 ? ward.allocatedUnits / totalAllocated : 0
  }

  const supplies = {} as Record<SupplyType, SupplyTotals>
  for (const supply of SUPPLY_TYPES) {
    const demand = scenario.wards.reduce((sum, ward) => sum + ward.demand[supply], 0)
    const stock = scenario.depots.reduce((sum, depot) => sum + depot.stock[supply], 0)
    const allocated = wardPlans.reduce((sum, ward) => sum + ward.allocated[supply], 0)
    const remainingStock = result.depotInventory.reduce(
      (sum, depot) => sum + depot.remaining[supply],
      0,
    )
    supplies[supply] = {
      demand,
      stock,
      allocated,
      unmet: Math.max(0, demand - allocated),
      coverage: demand > 0 ? Math.min(1, allocated / demand) : 0,
      remainingStock,
    }
  }

  const demand = supplies.water.demand + supplies.medical.demand + supplies.food.demand
  const stock = supplies.water.stock + supplies.medical.stock + supplies.food.stock
  const unmetUnits = Math.max(0, demand - totalAllocated)
  const coverage = demand > 0 ? Math.min(1, totalAllocated / demand) : 0
  const unmetUrgent = wardPlans
    .filter((ward) => ward.urgency >= 4)
    .reduce((sum, ward) => sum + ward.unmetUnits, 0)
  const priorityWeightedUnmet = wardPlans.reduce((sum, ward) => sum + ward.priorityWeightedUnmet, 0)

  const coverages = wardPlans.map((ward) => ward.coverage)
  const spread = coverages.length > 0 ? Math.max(...coverages) - Math.min(...coverages) : 0
  const fairness = totalAllocated > 0 ? Math.round(clamp(100 - spread * 100, 0, 100) * 10) / 10 : null

  const usedVehicles = new Set(
    allocations
      .map((allocation) => allocation.vehicleId)
      .filter((id): id is NonNullable<typeof id> => Boolean(id)),
  )
  const trips = allocations.reduce((sum, allocation) => sum + allocation.trips, 0)
  const availableVehicles = scenario.vehicles.filter((vehicle) => vehicle.status === 'available')
  const runSlots = availableVehicles.length * RUNS_PER_VEHICLE
  const fleetUtilisation = runSlots > 0 ? Math.min(100, (trips / runSlots) * 100) : 0
  const vehicleHours = allocations.reduce((sum, allocation) => sum + allocation.vehicleHours, 0)
  const blockedRoads = scenario.roads.filter((road) => road.state === 'blocked')
  const congestedRoads = scenario.roads.filter((road) => road.state === 'congested')
  const incompleteWards = wardPlans.filter((ward) => ward.coverage < 0.995).length
  const affectedWards = wardPlans.filter((ward) => ward.unmetUnits > 0).length

  const reachableWards = result.reachability.filter((entry) => entry.reachable).length
  const unreachableWards = result.reachability.length - reachableWards
  const fleetCapacityOffered = result.fleetCapacityOffered
  const fleetCapacityMoved = result.fleetCapacityMoved
  const fleetCapacityUsage =
    fleetCapacityOffered > 0 ? fleetCapacityMoved / fleetCapacityOffered : 0

  const unservedByReason: Record<UnservedReason, number> = { unreachable: 0, stock: 0, fleet: 0 }
  for (const entry of result.unserved) {
    unservedByReason[entry.reason] += entry.units
  }

  const bottlenecks: PlanBottleneck[] = []
  const unreachable = wardPlans.filter((ward) => !ward.reachable && ward.demandUnits > 0)
  if (unreachable.length > 0) {
    bottlenecks.push({
      id: 'unreachable-wards',
      severity: 'critical',
      title: `${unreachable.length} ward${unreachable.length === 1 ? '' : 's'} unreachable`,
      detail: `No open route connects ${unreachable
        .map((ward) => scenario.wards.find((entry) => entry.id === ward.wardId)?.shortName ?? ward.wardId)
        .join(', ')} to a depot, so no delivery was invented for them.`,
      value: 'no route',
    })
  }

  if (availableVehicles.length === 0) {
    bottlenecks.push({
      id: 'no-fleet',
      severity: 'critical',
      title: 'No vehicles available',
      detail: 'Every fleet unit is loading or under maintenance in this scenario. Deliveries cannot be dispatched.',
      value: '0 run slots',
    })
  }

  for (const supply of SUPPLY_TYPES) {
    const totals = supplies[supply]
    if (totals.unmet <= 0) continue
    const severity: PlanBottleneck['severity'] =
      totals.coverage < 0.5 ? 'critical' : totals.coverage < 0.85 ? 'warning' : 'info'
    const topUnmet = [...wardPlans]
      .map((ward) => ({ ward, unmet: ward.unmet[supply] }))
      .sort((a, b) => b.unmet - a.unmet)[0]
    const topName = topUnmet
      ? scenario.wards.find((ward) => ward.id === topUnmet.ward.wardId)?.shortName
      : null
    bottlenecks.push({
      id: `supply-${supply}`,
      severity,
      title: `${SUPPLY_META[supply].shortLabel} shortfall`,
      detail: `${formatNumber(totals.unmet)} ${SUPPLY_META[supply].unit} unmet district-wide.${
        topName ? ` ${topName} carries the largest gap.` : ''
      }`,
      value: `${formatPct(totals.coverage, 0)} covered`,
    })
  }

  const fleetBoundDeliveries = result.unserved.filter((entry) => entry.reason === 'fleet')
  if (fleetBoundDeliveries.length > 0) {
    bottlenecks.push({
      id: 'fleet-capacity',
      severity: fleetCapacityUsage >= 0.995 ? 'warning' : 'info',
      title: 'Fleet capacity limits deliveries',
      detail: `${formatNumber(unservedByReason.fleet)} units are unserved because the ${availableVehicles.length} available vehicle${availableVehicles.length === 1 ? '' : 's'} exhausted their ${RUNS_PER_VEHICLE}-run budget. ${
        fleetCapacityOffered > 0
          ? `${formatPct(fleetCapacityUsage, 0)} of offered vehicle capacity was used.`
          : ''
      }`,
      value: `${formatNumber(fleetCapacityMoved)} / ${formatNumber(fleetCapacityOffered)} units`,
    })
  }

  if (blockedRoads.length > 0) {
    const detoured = routes.filter((route) => route.detourKm > 0.15)
    const extraKm = detoured.reduce((sum, route) => sum + route.detourKm, 0)
    bottlenecks.push({
      id: 'blocked-roads',
      severity: 'warning',
      title: `${blockedRoads.length} road segment${blockedRoads.length === 1 ? '' : 's'} blocked`,
      detail:
        detoured.length > 0
          ? `${blockedRoads
              .slice(0, 2)
              .map((road) => road.name)
              .join(' and ')}${blockedRoads.length > 2 ? ' and others' : ''} force ${detoured.length} route detours (+${formatDecimal(extraKm)} km per one-way leg on affected deliveries).`
          : `${blockedRoads.map((road) => road.name).join(', ')} removed from the route graph; reachable deliveries were re-routed.`,
      value: detoured.length > 0 ? `+${formatDecimal(extraKm)} km` : 'removed',
    })
  }

  if (congestedRoads.length > 0) {
    const delay = allocations.reduce((sum, allocation) => sum + allocation.delayKm, 0)
    bottlenecks.push({
      id: 'congestion',
      severity: 'info',
      title: `${congestedRoads.length} congested segment${congestedRoads.length === 1 ? '' : 's'}`,
      detail: `The fixed ${'1.55'}× cost factor adds ${formatDecimal(delay)} km-equivalent delay across planned delivery routes.`,
      value: `${formatDecimal(delay)} km delay`,
    })
  }

  const unavailable = scenario.vehicles.filter((vehicle) => vehicle.status !== 'available')
  if (unavailable.length > 0) {
    bottlenecks.push({
      id: 'vehicles-unavailable',
      severity: 'info',
      title: `${unavailable.length} vehicle${unavailable.length === 1 ? '' : 's'} unavailable`,
      detail: unavailable.map((vehicle) => `${vehicle.name} (${vehicle.status})`).join(' · '),
      value: 'fleet note',
    })
  }

  const severityOrder: Record<PlanBottleneck['severity'], number> = {
    critical: 0,
    warning: 1,
    info: 2,
  }
  bottlenecks.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])

  const totals: PlanTotals = {
    demand,
    allocated: totalAllocated,
    stock,
    coverage,
    unmetUnits,
    unmetUrgent,
    priorityWeightedUnmet,
    fairness,
    vehiclesUsed: usedVehicles.size,
    vehiclesAvailable: availableVehicles.length,
    fleetSize: scenario.vehicles.length,
    trips,
    runSlots,
    fleetUtilisation,
    vehicleHours,
    incompleteWards,
    affectedWards,
    blockedRoads: blockedRoads.length,
    congestedRoads: congestedRoads.length,
    reachableWards,
    unreachableWards,
    routeDistanceKm: result.routeDistanceKm,
    routeTimeHours: result.routeTimeHours,
    fleetCapacityOffered,
    fleetCapacityMoved,
    fleetCapacityUsage,
  }

  return {
    scenarioId: scenario.id,
    strategy,
    priority: priorityValue,
    generatedAt,
    wards: wardPlans,
    allocations,
    routes,
    supplies,
    totals,
    bottlenecks,
    unserved: result.unserved,
    fleet: result.fleet,
    metrics: {
      reachability: result.reachability,
      reachableWards,
      unreachableWards,
      routeDistanceKm: result.routeDistanceKm,
      routeTimeHours: result.routeTimeHours,
      fleetCapacityOffered,
      fleetCapacityMoved,
      fleetCapacityUsage,
      depotInventory: result.depotInventory,
      priorityWeights: result.priorityWeights,
      unservedByReason,
    },
  }
}

/**
 * Run all three strategies on independent deep copies of the same input.
 * No strategy can consume stock, fleet runs or road state from another.
 */
export function computeComparisons(
  scenario: Scenario,
  priority: number,
): Record<StrategyId, Plan> {
  return {
    optimizer: computePlan(cloneScenario(scenario), 'optimizer', priority),
    nearest: computePlan(cloneScenario(scenario), 'nearest', priority),
    proportional: computePlan(cloneScenario(scenario), 'proportional', priority),
  }
}
