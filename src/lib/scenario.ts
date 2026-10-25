import type { DepotId, Scenario, ScenarioEdits, SupplyValues, WardId } from '../types'

/** Deep copy of every mutable input so strategies cannot share state. */
export function cloneScenario(scenario: Scenario): Scenario {
  return {
    ...scenario,
    weather: { ...scenario.weather },
    wards: scenario.wards.map((ward) => ({
      ...ward,
      location: { ...ward.location },
      vulnerability: { ...ward.vulnerability },
      demand: { ...ward.demand },
    })),
    depots: scenario.depots.map((depot) => ({
      ...depot,
      location: { ...depot.location },
      stock: { ...depot.stock },
    })),
    vehicles: scenario.vehicles.map((vehicle) => ({ ...vehicle })),
    roads: scenario.roads.map((road) => ({
      ...road,
      geometry: road.geometry.map((point) => ({ ...point })),
    })),
    assumptions: [...scenario.assumptions],
    supplyNotes: { ...scenario.supplyNotes },
  }
}

export function editsFromScenario(scenario: Scenario): ScenarioEdits {
  const demand = {} as Record<WardId, SupplyValues>
  const urgency = {} as Record<WardId, number>
  const stock = {} as Record<DepotId, SupplyValues>

  for (const ward of scenario.wards) {
    demand[ward.id] = { ...ward.demand }
    urgency[ward.id] = ward.urgency
  }
  for (const depot of scenario.depots) {
    stock[depot.id] = { ...depot.stock }
  }

  return { demand, urgency, stock }
}

export function applyEdits(scenario: Scenario, edits: ScenarioEdits): Scenario {
  return {
    ...scenario,
    wards: scenario.wards.map((ward) => ({
      ...ward,
      demand: { ...edits.demand[ward.id] },
      urgency: edits.urgency[ward.id] ?? ward.urgency,
    })),
    depots: scenario.depots.map((depot) => ({
      ...depot,
      stock: { ...edits.stock[depot.id] },
    })),
  }
}

export function editsAreEqual(a: ScenarioEdits, b: ScenarioEdits): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}
