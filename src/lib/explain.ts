import type { Plan, Scenario, WardId } from '../types'
import { RUNS_PER_VEHICLE, STRATEGY_META, SUPPLY_META, SUPPLY_TYPES } from './constants'
import { formatDecimal, formatNumber, formatPct } from './format'
import { diffPlans } from './planDiff'

export interface PlanExplanation {
  headline: string
  rationale: string[]
  unmet: string[]
  constraints: string[]
  changes: string[]
}

function roadNames(scenario: Scenario, ids: string[], limit = 2): string {
  const names = scenario.roads.filter((road) => ids.includes(road.id)).map((road) => road.name)
  if (names.length <= limit) return names.join(', ')
  return `${names.slice(0, limit).join(', ')} +${names.length - limit}`
}

function sourceDescription(scenario: Scenario, depotId: string): string {
  return scenario.depots.find((depot) => depot.id === depotId)?.shortName ?? depotId
}

export function buildExplanation(
  scenario: Scenario,
  plan: Plan,
  wardId: WardId,
  previousPlan: Plan | null,
): PlanExplanation {
  const ward = scenario.wards.find((entry) => entry.id === wardId)
  const wardPlan = plan.wards.find((entry) => entry.wardId === wardId)

  if (!ward || !wardPlan) {
    return {
      headline: 'No neighbourhood selected',
      rationale: [],
      unmet: [],
      constraints: [],
      changes: [],
    }
  }

  const strategy = STRATEGY_META[plan.strategy]
  const headline = `${ward.name} receives ${formatPct(wardPlan.coverage, 0)} of its requested supplies in the ${strategy.shortLabel} plan.`
  const rationale: string[] = []

  if (plan.strategy === 'optimizer') {
    const rank =
      [...scenario.wards]
        .map((entry) => ({
          id: entry.id,
          need: 0.62 * (entry.urgency / 5) + 0.38 * (entry.vulnerability.score / 100),
        }))
        .sort((a, b) => b.need - a.need)
        .findIndex((entry) => entry.id === wardId) + 1
    rationale.push(
      `The plan is set to ${plan.priority}% vulnerability priority. ${ward.shortName} ranks #${rank} of ${scenario.wards.length} on blended need (urgency ${ward.urgency}/5, vulnerability ${ward.vulnerability.score}/100).`,
    )
  } else if (plan.strategy === 'nearest') {
    const distance =
      wardPlan.nearestDepotDistanceKm === null
        ? 'no reachable depot'
        : `${formatDecimal(wardPlan.nearestDepotDistanceKm)} km from its closest reachable depot`
    const rank =
      [...plan.wards]
        .filter((entry) => entry.nearestDepotDistanceKm !== null)
        .sort((a, b) => (a.nearestDepotDistanceKm ?? 0) - (b.nearestDepotDistanceKm ?? 0))
        .findIndex((entry) => entry.wardId === wardId) + 1
    rationale.push(
      `Nearest-first serves wards in distance order. ${ward.shortName} is ${distance}${rank > 0 ? ` and ranks #${rank} in that order` : ''}.`,
    )
  } else {
    const populationShare = ward.population / scenario.wards.reduce((sum, entry) => sum + entry.population, 0)
    rationale.push(
      `Population-proportional gives ${ward.shortName} a ${formatPct(populationShare, 1)} share based on ${formatNumber(ward.population)} residents. Urgency and road distance are not used by this strategy.`,
    )
  }

  const sourcedSupplies = SUPPLY_TYPES.filter((supply) => wardPlan.bySupply[supply].allocated > 0)
  if (sourcedSupplies.length > 0) {
    const parts = sourcedSupplies.map((supply) => {
      const entry = wardPlan.bySupply[supply]
      const depot = entry.sourceDepotId ? sourceDescription(scenario, entry.sourceDepotId) : 'an unassigned depot'
      const distance = entry.route ? ` at ${formatDecimal(entry.route.distanceKm)} km` : ''
      return `${SUPPLY_META[supply].shortLabel.toLowerCase()} ${formatNumber(entry.allocated)}/${formatNumber(entry.demand)} from ${depot}${distance}`
    })
    rationale.push(`Allocation: ${parts.join('; ')}.`)
  } else {
    rationale.push(
      wardPlan.reachable
        ? 'No units are assigned to this ward in the current plan: reachable stock and vehicle runs were consumed by higher-ranked wards.'
        : 'No units are assigned because no open route connects this ward to a depot.',
    )
  }

  const districtAverage = plan.totals.coverage
  rationale.push(
    `${ward.shortName} coverage is ${formatPct(wardPlan.coverage, 0)} against a district average of ${formatPct(districtAverage, 0)}. Both values come from the current allocation run.`,
  )

  const unmet: string[] = []
  for (const supply of SUPPLY_TYPES) {
    const entry = wardPlan.bySupply[supply]
    if (entry.unmet <= 0) continue
    const requestShare = entry.demand > 0 ? entry.unmet / entry.demand : 0
    unmet.push(
      `${formatNumber(entry.unmet)} ${SUPPLY_META[supply].plural} remain unmet (${formatPct(requestShare, 0)} of this ward’s request).`,
    )
  }
  if (unmet.length === 0) {
    unmet.push('Every requested unit is covered for this ward in the current plan.')
  }

  const constraints: string[] = []
  for (const supply of SUPPLY_TYPES) {
    if (wardPlan.bySupply[supply].unmet > 0 && plan.supplies[supply].coverage < 1) {
      constraints.push(
        `District ${SUPPLY_META[supply].shortLabel.toLowerCase()} stock covers ${formatPct(plan.supplies[supply].coverage, 0)} of requested demand, so the shortfall is shared across the plan.`,
      )
    }
  }

  for (const supply of SUPPLY_TYPES) {
    const entry = wardPlan.bySupply[supply]
    if (!entry.route) continue
    const congested = scenario.roads.filter(
      (road) => entry.route?.path.includes(road.id) && road.state === 'congested',
    )
    if (congested.length > 0) {
      constraints.push(
        `The ${SUPPLY_META[supply].shortLabel.toLowerCase()} leg uses ${congested.map((road) => road.name).join(', ')}, currently congested. The route adds ${formatDecimal(entry.route.delayKm)} km-equivalent delay.`,
      )
    }
    if (entry.route.detourKm > 0.15 && constraints.length < 4) {
      constraints.push(
        `The route from ${entry.sourceDepotId ? sourceDescription(scenario, entry.sourceDepotId) : 'the depot'} is ${formatDecimal(entry.route.detourKm)} km longer than the all-open baseline because of blocked segments.`,
      )
    }
  }

  const fleetBound = plan.unserved.some(
    (entry) => entry.wardId === wardId && entry.reason === 'fleet',
  )
  if (fleetBound) {
    constraints.push(
      `Fleet constraint: ${plan.totals.trips} of ${plan.totals.runSlots} run slots are used. The remaining deficit exists because reachable vehicles exhausted their ${RUNS_PER_VEHICLE}-run budget for the planning window.`,
    )
  }
  if (!wardPlan.reachable) {
    constraints.push(
      `Reachability: every depot is separated from ${ward.shortName} by blocked segments in the current graph, so the allocator recorded the request as unreachable instead of inventing a route.`,
    )
  }

  if (ward.urgency >= 4) {
    constraints.push(
      `Urgency is ${ward.urgency}/5 and vulnerability is ${ward.vulnerability.score}/100 — both feed the optimizer weight but do not change physical stock.`,
    )
  }

  if (constraints.length === 0) {
    constraints.push('No stock, fleet or road constraint is binding for this ward in the current plan.')
  }

  const changes: string[] = []
  if (!previousPlan) {
    changes.push('No earlier revision is stored in this session. Change an input and recalculate to populate the diff.')
  } else {
    const diff = diffPlans(previousPlan, plan)
    const wardChanges = diff.changes.filter((change) => change.wardId === wardId)
    for (const change of wardChanges.slice(0, 3)) {
      const delta =
        change.kind === 'rerouted'
          ? ''
          : ` (${formatNumber(change.beforeUnits)} → ${formatNumber(change.afterUnits)} ${SUPPLY_META[change.supply].plural})`
      changes.push(`${change.kind.toUpperCase()} ${SUPPLY_META[change.supply].shortLabel}${delta}: ${change.reason}`)
    }
    if (previousPlan.strategy !== plan.strategy) {
      changes.push(
        `Strategy changed from ${STRATEGY_META[previousPlan.strategy].shortLabel} to ${strategy.shortLabel}; the same inputs were re-run independently.`,
      )
    }
    for (const line of diff.summary.slice(0, 2)) {
      if (changes.length >= 4) break
      changes.push(line)
    }

    if (changes.length === 0) {
      changes.push('No material change to this ward’s allocation since the previous revision.')
    }
  }

  return { headline, rationale, unmet, constraints: constraints.slice(0, 4), changes: changes.slice(0, 4) }
}

export function describeRoadPath(scenario: Scenario, path: string[]): string {
  return roadNames(scenario, path, 3) || 'direct link'
}

