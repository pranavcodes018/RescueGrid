import { SUPPLY_META, SUPPLY_TYPES } from './constants'
import { formatDecimal, formatNumber, formatPct } from './format'
import type { DepotId, Plan, SupplyType, WardId, WardPlan } from '../types'

export type PlanChangeKind = 'added' | 'removed' | 'reduced' | 'increased' | 'rerouted'

export interface PlanChange {
  id: string
  kind: PlanChangeKind
  wardId: WardId
  supply: SupplyType
  beforeUnits: number
  afterUnits: number
  deltaUnits: number
  beforeDepotId: DepotId | null
  afterDepotId: DepotId | null
  reason: string
}

export interface PlanDiff {
  hasPrevious: boolean
  changes: PlanChange[]
  counts: Record<PlanChangeKind, number>
  unitsAdded: number
  unitsRemoved: number
  coverageDelta: number
  weightedUnmetDelta: number
  routeDistanceDelta: number
  blockedRoadsDelta: number
  unreachableDelta: number
  summary: string[]
}

function depotName(plan: Plan, depotId: DepotId | null): string {
  if (!depotId) return 'no depot'
  return plan.metrics.depotInventory.find((entry) => entry.depotId === depotId)
    ? `Depot ${depotId.replace('depot-', '').toUpperCase()}`
    : depotId
}

function compareContext(previous: Plan, current: Plan) {
  return {
    stockIncreased: SUPPLY_TYPES.some(
      (supply) => current.supplies[supply].stock > previous.supplies[supply].stock,
    ),
    capacityIncreased: current.metrics.fleetCapacityOffered > previous.metrics.fleetCapacityOffered,
    roadsReopened: current.totals.blockedRoads < previous.totals.blockedRoads,
    roadsClosed: current.totals.blockedRoads > previous.totals.blockedRoads,
    priorityChanged: current.priority !== previous.priority,
    strategyChanged: current.strategy !== previous.strategy,
  }
}

function reductionReason(
  current: Plan,
  wardPlan: WardPlan,
  supply: SupplyType,
  previous: Plan,
  context: ReturnType<typeof compareContext>,
): string {
  const unserved = current.unserved.find(
    (entry) => entry.wardId === wardPlan.wardId && entry.supply === supply,
  )
  const label = SUPPLY_META[supply].shortLabel.toLowerCase()

  if (unserved?.reason === 'unreachable') {
    return 'No open route connects this ward to a depot after the latest road change.'
  }
  if (context.roadsClosed) {
    return 'Road closures removed or lengthened a route, so less could be delivered here.'
  }
  if (unserved?.reason === 'fleet') {
    return `Vehicle run capacity at reachable depots was exhausted before this ${label} delivery.`
  }
  if (unserved?.reason === 'stock') {
    return `${SUPPLY_META[supply].shortLabel} stock at reachable depots was exhausted or committed to higher-ranked wards.`
  }
  if (current.supplies[supply].remainingStock < previous.supplies[supply].remainingStock) {
    return `Less ${label} stock was available at reachable depots than in the previous plan.`
  }
  if (context.strategyChanged) {
    return `The ${label} delivery order changed with the active strategy.`
  }
  if (context.priorityChanged) {
    return `This ward ranked lower after the priority weight changed from ${previous.priority}% to ${current.priority}%.`
  }
  return `The greedy ${label} allocation ranked other wards ahead of this one under the new inputs.`
}

function increaseReason(
  current: Plan,
  supply: SupplyType,
  previous: Plan,
  context: ReturnType<typeof compareContext>,
): string {
  const label = SUPPLY_META[supply].shortLabel.toLowerCase()
  if (context.roadsReopened) return 'A road reopened, restoring reachable delivery capacity.'
  if (context.capacityIncreased) return 'More available vehicle capacity could reach this ward.'
  if (context.stockIncreased) return `Additional ${label} stock became available at reachable depots.`
  if (context.strategyChanged) return `The ${label} delivery order changed with the active strategy.`
  if (context.priorityChanged) {
    return `This ward ranked higher after the priority weight changed from ${previous.priority}% to ${current.priority}%.`
  }
  return `The greedy ${label} allocation reached this ward earlier under the new inputs.`
}

/**
 * Compare two plans allocation by allocation. Every reason is derived from
 * computed plan values (remaining stock, unserved reasons, route changes),
 * not from a hard-coded narrative.
 */
export function diffPlans(previous: Plan | null, current: Plan): PlanDiff {
  const counts: Record<PlanChangeKind, number> = {
    added: 0,
    removed: 0,
    reduced: 0,
    increased: 0,
    rerouted: 0,
  }

  if (!previous) {
    return {
      hasPrevious: false,
      changes: [],
      counts,
      unitsAdded: 0,
      unitsRemoved: 0,
      coverageDelta: 0,
      weightedUnmetDelta: 0,
      routeDistanceDelta: 0,
      blockedRoadsDelta: 0,
      unreachableDelta: 0,
      summary: ['No earlier plan revision is stored yet. Change an input to generate a diff.'],
    }
  }

  const context = compareContext(previous, current)
  const changes: PlanChange[] = []

  for (const wardPlan of current.wards) {
    const previousWard = previous.wards.find((entry) => entry.wardId === wardPlan.wardId)
    if (!previousWard) continue
    for (const supply of SUPPLY_TYPES) {
      const before = previousWard.bySupply[supply]
      const after = wardPlan.bySupply[supply]
      const delta = after.allocated - before.allocated
      const sourceChanged =
        before.sourceDepotId !== after.sourceDepotId && (before.allocated > 0 || after.allocated > 0)

      if (before.allocated === 0 && after.allocated > 0) {
        counts.added += 1
        changes.push({
          id: `${wardPlan.wardId}-${supply}-added`,
          kind: 'added',
          wardId: wardPlan.wardId,
          supply,
          beforeUnits: 0,
          afterUnits: after.allocated,
          deltaUnits: after.allocated,
          beforeDepotId: before.sourceDepotId,
          afterDepotId: after.sourceDepotId,
          reason: increaseReason(current, supply, previous, context),
        })
        continue
      }

      if (before.allocated > 0 && after.allocated === 0) {
        counts.removed += 1
        changes.push({
          id: `${wardPlan.wardId}-${supply}-removed`,
          kind: 'removed',
          wardId: wardPlan.wardId,
          supply,
          beforeUnits: before.allocated,
          afterUnits: 0,
          deltaUnits: -before.allocated,
          beforeDepotId: before.sourceDepotId,
          afterDepotId: after.sourceDepotId,
          reason: reductionReason(current, wardPlan, supply, previous, context),
        })
        continue
      }

      if (delta < 0) {
        counts.reduced += 1
        changes.push({
          id: `${wardPlan.wardId}-${supply}-reduced`,
          kind: 'reduced',
          wardId: wardPlan.wardId,
          supply,
          beforeUnits: before.allocated,
          afterUnits: after.allocated,
          deltaUnits: delta,
          beforeDepotId: before.sourceDepotId,
          afterDepotId: after.sourceDepotId,
          reason: reductionReason(current, wardPlan, supply, previous, context),
        })
      } else if (delta > 0) {
        counts.increased += 1
        changes.push({
          id: `${wardPlan.wardId}-${supply}-increased`,
          kind: 'increased',
          wardId: wardPlan.wardId,
          supply,
          beforeUnits: before.allocated,
          afterUnits: after.allocated,
          deltaUnits: delta,
          beforeDepotId: before.sourceDepotId,
          afterDepotId: after.sourceDepotId,
          reason: increaseReason(current, supply, previous, context),
        })
      }

      if (sourceChanged && after.allocated > 0) {
        counts.rerouted += 1
        const beforeRoute = before.route
        const afterRoute = after.route
        const deltaKm =
          beforeRoute && afterRoute ? afterRoute.distanceKm - beforeRoute.distanceKm : null
        changes.push({
          id: `${wardPlan.wardId}-${supply}-rerouted`,
          kind: 'rerouted',
          wardId: wardPlan.wardId,
          supply,
          beforeUnits: before.allocated,
          afterUnits: after.allocated,
          deltaUnits: 0,
          beforeDepotId: before.sourceDepotId,
          afterDepotId: after.sourceDepotId,
          reason: `Route moved from ${depotName(previous, before.sourceDepotId)} to ${depotName(current, after.sourceDepotId)}${
            deltaKm === null
              ? '.'
              : ` (${deltaKm >= 0 ? '+' : '−'}${formatDecimal(Math.abs(deltaKm))} km one way).`
          }`,
        })
      }
    }
  }

  changes.sort((a, b) => {
    if (a.deltaUnits === 0 && b.deltaUnits !== 0) return 1
    if (b.deltaUnits === 0 && a.deltaUnits !== 0) return -1
    return Math.abs(b.deltaUnits) - Math.abs(a.deltaUnits) || a.id.localeCompare(b.id)
  })

  const unitsAdded = changes.reduce((sum, change) => sum + Math.max(0, change.deltaUnits), 0)
  const unitsRemoved = changes.reduce((sum, change) => sum + Math.max(0, -change.deltaUnits), 0)
  const coverageDelta = (current.totals.coverage - previous.totals.coverage) * 100
  const weightedUnmetDelta =
    current.totals.priorityWeightedUnmet - previous.totals.priorityWeightedUnmet
  const routeDistanceDelta = current.totals.routeDistanceKm - previous.totals.routeDistanceKm
  const blockedRoadsDelta = current.totals.blockedRoads - previous.totals.blockedRoads
  const unreachableDelta = current.totals.unreachableWards - previous.totals.unreachableWards

  const summary: string[] = []
  if (coverageDelta !== 0) {
    summary.push(
      `Coverage ${formatPct(previous.totals.coverage, 1)} → ${formatPct(current.totals.coverage, 1)} (${coverageDelta > 0 ? '+' : '−'}${formatDecimal(Math.abs(coverageDelta))} pp).`,
    )
  } else {
    summary.push(`Coverage unchanged at ${formatPct(current.totals.coverage, 1)}.`)
  }
  if (weightedUnmetDelta !== 0) {
    summary.push(
      `Priority-weighted unmet ${weightedUnmetDelta > 0 ? 'rose' : 'fell'} by ${formatNumber(Math.abs(weightedUnmetDelta))} weighted units.`,
    )
  }
  if (Math.abs(routeDistanceDelta) >= 0.05) {
    summary.push(
      `Planned route distance ${routeDistanceDelta > 0 ? 'increased' : 'decreased'} by ${formatDecimal(Math.abs(routeDistanceDelta))} km.`,
    )
  }
  if (blockedRoadsDelta !== 0) {
    summary.push(
      `Blocked segments ${blockedRoadsDelta > 0 ? 'increased' : 'decreased'} by ${Math.abs(blockedRoadsDelta)}.`,
    )
  }
  if (unreachableDelta !== 0) {
    summary.push(
      unreachableDelta > 0
        ? `${unreachableDelta} more ward${unreachableDelta === 1 ? '' : 's'} became unreachable (${current.totals.unreachableWards} total).`
        : `${Math.abs(unreachableDelta)} ward${Math.abs(unreachableDelta) === 1 ? ' is' : 's are'} reachable again (${current.totals.unreachableWards} still unreachable).`,
    )
  }

  return {
    hasPrevious: true,
    changes,
    counts,
    unitsAdded,
    unitsRemoved,
    coverageDelta,
    weightedUnmetDelta,
    routeDistanceDelta,
    blockedRoadsDelta,
    unreachableDelta,
    summary,
  }
}
