import { DISTRICT_DISCLAIMER, DISTRICT_NAME } from '../lib/constants'
import type {
  Depot,
  DepotId,
  Road,
  RoadId,
  RoadState,
  Scenario,
  ScenarioId,
  ScenarioPreset,
  Severity,
  SimEvent,
  SimEventKind,
  SupplyValues,
  Vehicle,
  VehicleId,
  VehicleStatus,
  Ward,
  WardId,
} from '../types'

const supply = (water: number, medical: number, food: number): SupplyValues => ({ water, medical, food })
const point = (lat: number, lng: number) => ({ lat, lng })

const WARD_LOCATIONS: Record<WardId, { lat: number; lng: number }> = {
  'ward-harbour': point(14.447, 80.035),
  'ward-old-town': point(14.461, 80.005),
  'ward-riverside': point(14.487, 79.982),
  'ward-coastal-colony': point(14.418, 80.033),
  'ward-hillview': point(14.499, 80.012),
  'ward-east-market': point(14.473, 80.03),
}

const DEPOT_LOCATIONS: Record<DepotId, { lat: number; lng: number }> = {
  'depot-a': point(14.466, 79.972),
  'depot-b': point(14.426, 80.026),
  'depot-c': point(14.504, 79.944),
}

export const BASE_WARDS: Ward[] = [
  {
    id: 'ward-harbour',
    code: 'W1',
    name: 'Ward 1 — Harbour',
    shortName: 'Harbour',
    population: 14200,
    households: 3100,
    location: WARD_LOCATIONS['ward-harbour'],
    urgency: 5,
    vulnerability: {
      elderlyPct: 12,
      childrenPct: 19,
      disabilityPct: 6.5,
      informalHousingPct: 47,
      score: 82,
    },
    demand: supply(3200, 900, 2800),
    note: 'Fishing settlements and jetties; tidal overwash on the southern lanes.',
  },
  {
    id: 'ward-old-town',
    code: 'W2',
    name: 'Ward 2 — Old Town',
    shortName: 'Old Town',
    population: 18600,
    households: 4050,
    location: WARD_LOCATIONS['ward-old-town'],
    urgency: 4,
    vulnerability: {
      elderlyPct: 16,
      childrenPct: 22,
      disabilityPct: 7.5,
      informalHousingPct: 38,
      score: 61,
    },
    demand: supply(4100, 1400, 3900),
    note: 'Dense older housing with narrow lanes and limited vehicle access.',
  },
  {
    id: 'ward-riverside',
    code: 'W3',
    name: 'Ward 3 — Riverside',
    shortName: 'Riverside',
    population: 11800,
    households: 2600,
    location: WARD_LOCATIONS['ward-riverside'],
    urgency: 3,
    vulnerability: {
      elderlyPct: 11,
      childrenPct: 18,
      disabilityPct: 5,
      informalHousingPct: 26,
      score: 48,
    },
    demand: supply(2600, 700, 2300),
    note: 'Riverbank tenements upstream of the causeway.',
  },
  {
    id: 'ward-coastal-colony',
    code: 'W4',
    name: 'Ward 4 — Coastal Colony',
    shortName: 'Coastal Colony',
    population: 9400,
    households: 2050,
    location: WARD_LOCATIONS['ward-coastal-colony'],
    urgency: 5,
    vulnerability: {
      elderlyPct: 17,
      childrenPct: 24,
      disabilityPct: 8.5,
      informalHousingPct: 56,
      score: 88,
    },
    demand: supply(2900, 1100, 2400),
    note: 'Low-lying settlement behind the dunes; one road in and out.',
  },
  {
    id: 'ward-hillview',
    code: 'W5',
    name: 'Ward 5 — Hillview',
    shortName: 'Hillview',
    population: 7200,
    households: 1650,
    location: WARD_LOCATIONS['ward-hillview'],
    urgency: 2,
    vulnerability: {
      elderlyPct: 9,
      childrenPct: 16,
      disabilityPct: 4,
      informalHousingPct: 18,
      score: 34,
    },
    demand: supply(1400, 500, 1200),
    note: 'Elevated ridge settlement; steep single-lane access.',
  },
  {
    id: 'ward-east-market',
    code: 'W6',
    name: 'Ward 6 — East Market',
    shortName: 'East Market',
    population: 16300,
    households: 3600,
    location: WARD_LOCATIONS['ward-east-market'],
    urgency: 4,
    vulnerability: {
      elderlyPct: 13,
      childrenPct: 20,
      disabilityPct: 6,
      informalHousingPct: 41,
      score: 57,
    },
    demand: supply(3500, 1800, 3300),
    note: 'Wholesale market district; large transient daytime population.',
  },
]

export const BASE_DEPOTS: Depot[] = [
  {
    id: 'depot-a',
    code: 'A',
    name: 'Depot A — Central Relief Hub',
    shortName: 'Central Relief Hub',
    location: DEPOT_LOCATIONS['depot-a'],
    stock: supply(5200, 1600, 4800),
    accessNote: 'Rail siding, two loading bays, 24-hour power.',
  },
  {
    id: 'depot-b',
    code: 'B',
    name: 'Depot B — Coastal Supply Point',
    shortName: 'Coastal Supply Point',
    location: DEPOT_LOCATIONS['depot-b'],
    stock: supply(4600, 900, 3900),
    accessNote: 'Coastal warehouse; tidal access via Colony Link.',
  },
  {
    id: 'depot-c',
    code: 'C',
    name: 'Depot C — Inland Medical Hub',
    shortName: 'Inland Medical Hub',
    location: DEPOT_LOCATIONS['depot-c'],
    stock: supply(2900, 2300, 2700),
    accessNote: 'Hospital annex with cold storage; ridge-road access.',
  },
]

export const BASE_VEHICLES: Vehicle[] = [
  {
    id: 'veh-godavari',
    name: 'Godavari 6T',
    vehicleClass: 'Heavy truck',
    depotId: 'depot-a',
    capacityUnits: 1800,
    speedKph: 42,
    status: 'available',
    note: 'Two loading bays at Central Relief Hub.',
  },
  {
    id: 'veh-krishna',
    name: 'Krishna 3T',
    vehicleClass: 'Medium truck',
    depotId: 'depot-b',
    capacityUnits: 900,
    speedKph: 38,
    status: 'available',
    note: 'Staged at the coastal warehouse.',
  },
  {
    id: 'veh-pennar',
    name: 'Pennar Rapid',
    vehicleClass: 'Light van',
    depotId: 'depot-c',
    capacityUnits: 450,
    speedKph: 46,
    status: 'available',
    note: 'Fast last-mile runs on the ridge road.',
  },
  {
    id: 'veh-pulicat',
    name: 'Pulicat 4x4',
    vehicleClass: 'Medical utility',
    depotId: 'depot-b',
    capacityUnits: 300,
    speedKph: 50,
    status: 'maintenance',
    note: 'Cold-chain capable; scheduled brake service.',
  },
]

export const BASE_ROADS: Road[] = [
  {
    id: 'road-beach',
    name: 'Beach Road',
    ref: 'CR-01',
    from: 'depot-b',
    to: 'ward-harbour',
    distanceKm: 2.4,
    lanes: 2,
    state: 'open',
    geometry: [
      DEPOT_LOCATIONS['depot-b'],
      point(14.431, 80.03),
      point(14.4375, 80.0332),      point(14.4425, 80.0346),
      WARD_LOCATIONS['ward-harbour'],
    ],
    note: 'Coastal road exposed to tidal overwash.',
  },
  {
    id: 'road-harbour-link',
    name: 'East Harbour Link',
    ref: 'CR-02',
    from: 'ward-harbour',
    to: 'ward-east-market',
    distanceKm: 3.2,
    lanes: 2,
    state: 'congested',
    geometry: [
      WARD_LOCATIONS['ward-harbour'],
      point(14.4525, 80.0356),
      point(14.4615, 80.0342),
      point(14.4685, 80.0322),
      WARD_LOCATIONS['ward-east-market'],
    ],
    note: 'Market traffic and storm debris reduce throughput.',
  },
  {
    id: 'road-old-town-spine',
    name: 'Old Town Spine',
    ref: 'NH-216',
    from: 'depot-a',
    to: 'ward-old-town',
    distanceKm: 3.6,
    lanes: 4,
    state: 'open',
    geometry: [
      DEPOT_LOCATIONS['depot-a'],
      point(14.4625, 79.9862),
      point(14.4598, 79.9952),
      point(14.4607, 80.0004),
      WARD_LOCATIONS['ward-old-town'],
    ],
    note: 'Primary relief corridor into Old Town.',
  },
  {
    id: 'road-market-connector',
    name: 'Market Connector',
    ref: 'CR-04',
    from: 'ward-old-town',
    to: 'ward-east-market',
    distanceKm: 2.8,
    lanes: 2,
    state: 'open',
    geometry: [
      WARD_LOCATIONS['ward-old-town'],
      point(14.4648, 80.0122),
      point(14.4682, 80.0202),
      point(14.4712, 80.0262),
      WARD_LOCATIONS['ward-east-market'],
    ],
    note: 'Narrow connector through the wholesale market.',
  },
  {
    id: 'road-riverside-approach',
    name: 'Riverside Approach',
    ref: 'CR-05',
    from: 'ward-old-town',
    to: 'ward-riverside',
    distanceKm: 3.4,
    lanes: 2,
    state: 'open',
    geometry: [
      WARD_LOCATIONS['ward-old-town'],
      point(14.4682, 79.9962),
      point(14.4762, 79.9884),
      point(14.4832, 79.9842),
      WARD_LOCATIONS['ward-riverside'],
    ],
    note: 'Riverbank road with two low bridges.',
  },
  {
    id: 'road-inland-medical',
    name: 'Inland Medical Road',
    ref: 'SH-09',
    from: 'depot-c',
    to: 'ward-riverside',
    distanceKm: 3.9,
    lanes: 2,
    state: 'open',
    geometry: [
      DEPOT_LOCATIONS['depot-c'],
      point(14.4992, 79.9542),
      point(14.4932, 79.9682),
      point(14.4896, 79.9762),
      WARD_LOCATIONS['ward-riverside'],
    ],
    note: 'Hospital access road; cold-chain priority.',
  },
  {
    id: 'road-ridge',
    name: 'Hillview Ridge Road',
    ref: 'CR-07',
    from: 'ward-riverside',
    to: 'ward-hillview',
    distanceKm: 3.0,
    lanes: 2,
    state: 'open',
    geometry: [
      WARD_LOCATIONS['ward-riverside'],
      point(14.4912, 79.9932),
      point(14.4948, 80.0022),
      point(14.4978, 80.0082),
      WARD_LOCATIONS['ward-hillview'],
    ],
    note: 'Steep grade with a simulated 6-tonne load limit.',
  },
  {
    id: 'road-south-causeway',
    name: 'South Causeway',
    ref: 'CR-08',
    from: 'ward-harbour',
    to: 'ward-coastal-colony',
    distanceKm: 3.6,
    lanes: 2,
    state: 'open',
    geometry: [
      WARD_LOCATIONS['ward-harbour'],
      point(14.4382, 80.0332),
      point(14.428, 80.0326),
      point(14.423, 80.0328),
      WARD_LOCATIONS['ward-coastal-colony'],
    ],
    note: 'Embankment causeway across the southern flats.',
  },
  {
    id: 'road-colony-link',
    name: 'Coastal Colony Link',
    ref: 'CR-09',
    from: 'ward-coastal-colony',
    to: 'depot-b',
    distanceKm: 1.3,
    lanes: 2,
    state: 'congested',
    geometry: [
      WARD_LOCATIONS['ward-coastal-colony'],
      point(14.4232, 80.0302),
      point(14.4246, 80.0282),
      DEPOT_LOCATIONS['depot-b'],
    ],
    note: 'Only direct link between the colony and Coastal Supply Point.',
  },
  {
    id: 'road-east-bypass',
    name: 'East Bypass',
    ref: 'NH-216B',
    from: 'ward-east-market',
    to: 'ward-hillview',
    distanceKm: 3.1,
    lanes: 4,
    state: 'open',
    geometry: [
      WARD_LOCATIONS['ward-east-market'],
      point(14.4802, 80.0252),
      point(14.4882, 80.0202),
      point(14.4952, 80.0152),
      WARD_LOCATIONS['ward-hillview'],
    ],
    note: 'Wide bypass completed in the 2024 simulation baseline.',
  },
  {
    id: 'road-depot-south',
    name: 'Depot South Link',
    ref: 'CR-11',
    from: 'depot-a',
    to: 'ward-coastal-colony',
    distanceKm: 7.8,
    lanes: 2,
    state: 'open',
    geometry: [
      DEPOT_LOCATIONS['depot-a'],
      point(14.45, 79.988),
      point(14.435, 80.004),
      point(14.424, 80.018),
      point(14.421, 80.026),
      WARD_LOCATIONS['ward-coastal-colony'],
    ],
    note: 'Long inland detour through low-lying fields.',
  },
]

interface ScenarioVariant {
  id: ScenarioId
  name: string
  tagline: string
  description: string
  severity: Severity
  snapshotLabel: string
  weather: Scenario['weather']
  assumptions: string[]
  demand: Partial<Record<WardId, Partial<SupplyValues>>>
  urgency: Partial<Record<WardId, number>>
  stock: Partial<Record<DepotId, SupplyValues>>
  vehicleStatus: Partial<Record<VehicleId, VehicleStatus>>
  roadStates: Partial<Record<RoadId, RoadState>>
}

const VARIANTS: Record<ScenarioId, ScenarioVariant> = {
  'coastal-cyclone': {
    id: 'coastal-cyclone',
    name: 'Cyclone Response Simulation',
    tagline: 'Cyclone Megha approaches the Sagarika coast',
    description:
      'A fictional severe cyclone warning with two congested coastal segments. All wards are reachable, but stock is well below requested demand.',
    severity: 'Severe',
    snapshotLabel: 'Snapshot 06:40 IST · Day 2',
    weather: {
      system: 'Cyclone Megha (simulated)',
      windKph: 96,
      rainfallMm: 142,
      tideM: 2.4,
      advisory: 'Red alert along the Sagarika coast. Fishing operations suspended.',
    },
    assumptions: [
      'Demand is expressed in standard kits and packs, not verified field requests.',
      'All stock is held at three fictional depots; no resupply happens inside the planning window.',
      'Routes use a demo graph: congested segments add a fixed 1.55× travel penalty, blocked segments are removed.',
      'Each available vehicle is assumed to complete at most 8 runs in this planning window.',
    ],
    demand: {},
    urgency: {},
    stock: {},
    vehicleStatus: {},
    roadStates: {
      'road-harbour-link': 'congested',
      'road-colony-link': 'congested',
    },
  },
  'flood-escalation': {
    id: 'flood-escalation',
    name: 'Flood Escalation',
    tagline: 'Embankment breaches cut the southern wards',
    description:
      'The simulated flood phase blocks four segments and reduces coastal stock. Detours extend delivery routes while water and food demand rise.',
    severity: 'Critical',
    snapshotLabel: 'Snapshot 04:10 IST · Day 3',
    weather: {
      system: 'Cyclone Megha — inland flood phase (simulated)',
      windKph: 64,
      rainfallMm: 218,
      tideM: 3.1,
      advisory: 'Embankment breaches at the south causeway. Low-lying wards cut off.',
    },
    assumptions: [
      'Demand uplift is a fixed planning assumption, not a field measurement.',
      'Blocked roads are removed from the weighted graph and remaining routes are re-costed by Dijkstra.',
      'Coastal Supply Point stock reflects a simulated partial inundation.',
      'No live traffic, tide or weather feed is connected.',
    ],
    demand: {
      'ward-harbour': supply(3840, 970, 3140),
      'ward-old-town': supply(4920, 1510, 4370),
      'ward-riverside': supply(3120, 760, 2580),
      'ward-coastal-colony': supply(3480, 1190, 2690),
      'ward-hillview': supply(1680, 540, 1340),
      'ward-east-market': supply(4200, 1940, 3700),
    },
    urgency: {
      'ward-harbour': 5,
      'ward-old-town': 4,
      'ward-riverside': 4,
      'ward-coastal-colony': 5,
      'ward-hillview': 3,
      'ward-east-market': 5,
    },
    stock: {
      'depot-b': supply(3600, 900, 3100),
    },
    vehicleStatus: {
      'veh-pennar': 'loading',
    },
    roadStates: {
      'road-south-causeway': 'blocked',
      'road-riverside-approach': 'blocked',
      'road-beach': 'blocked',
      'road-colony-link': 'congested',
      'road-harbour-link': 'congested',
      'road-ridge': 'congested',
    },
  },
  'medical-shortage': {
    id: 'medical-shortage',
    name: 'Medical Shortage',
    tagline: 'Medical stock collapses after the surge',
    description:
      'A simulated post-cyclone health surge with medical demand at 1.5× baseline and only 1,700 medical packs district-wide. Most roads stay open; the constraint is stock and urgency.',
    severity: 'Severe',
    snapshotLabel: 'Snapshot 09:25 IST · Day 4',
    weather: {
      system: 'Post-cyclone health surge (simulated)',
      windKph: 42,
      rainfallMm: 56,
      tideM: 1.6,
      advisory: 'Waterborne illness reports rising in Old Town and East Market.',
    },
    assumptions: [
      'Medical pack demand is a fixed 1.5× planning uplift over the baseline.',
      'Medical stock is deliberately constrained to stress-test prioritisation.',
      'Chronic-care cold chain is assumed intact at Inland Medical Hub.',
      'No patient-level triage data is modelled.',
    ],
    demand: {
      'ward-harbour': supply(3200, 1350, 2800),
      'ward-old-town': supply(4100, 2100, 3900),
      'ward-riverside': supply(2600, 1050, 2300),
      'ward-coastal-colony': supply(2900, 1650, 2400),
      'ward-hillview': supply(1400, 750, 1200),
      'ward-east-market': supply(3500, 2700, 3300),
    },
    urgency: {
      'ward-harbour': 5,
      'ward-old-town': 5,
      'ward-riverside': 4,
      'ward-coastal-colony': 5,
      'ward-hillview': 3,
      'ward-east-market': 5,
    },
    stock: {
      'depot-a': supply(5200, 550, 4800),
      'depot-b': supply(4600, 250, 3900),
      'depot-c': supply(2900, 900, 2700),
    },
    vehicleStatus: {
      'veh-pulicat': 'available',
    },
    roadStates: {
      'road-harbour-link': 'open',
      'road-colony-link': 'congested',
      'road-riverside-approach': 'congested',
    },
  },
}

function buildScenario(variant: ScenarioVariant): Scenario {
  const wards = BASE_WARDS.map((ward) => {
    const override = variant.demand[ward.id]
    return {
      ...ward,
      urgency: variant.urgency[ward.id] ?? ward.urgency,
      demand: { ...ward.demand, ...override },
      vulnerability: { ...ward.vulnerability },
      location: { ...ward.location },
    }
  })

  const depots = BASE_DEPOTS.map((depot) => ({
    ...depot,
    stock: variant.stock[depot.id] ? { ...variant.stock[depot.id]! } : { ...depot.stock },
    location: { ...depot.location },
  }))

  const vehicles = BASE_VEHICLES.map((vehicle) => ({
    ...vehicle,
    status: variant.vehicleStatus[vehicle.id] ?? vehicle.status,
  }))

  const roads = BASE_ROADS.map((road) => ({
    ...road,
    state: variant.roadStates[road.id] ?? road.state,
    geometry: road.geometry.map((p) => ({ ...p })),
  }))

  return {
    id: variant.id,
    name: variant.name,
    tagline: variant.tagline,
    description: variant.description,
    severity: variant.severity,
    district: DISTRICT_NAME,
    districtNote: DISTRICT_DISCLAIMER,
    snapshotLabel: variant.snapshotLabel,
    weather: { ...variant.weather },
    wards,
    depots,
    vehicles,
    roads,
    assumptions: [...variant.assumptions],
    supplyNotes: {
      water: '2 L purification + storage kit for one household for three days.',
      medical: 'Trauma and hydration pack; cold-chain items are held only at Depot C.',
      food: 'Dry ration kit for a household of four for two days.',
    },
  }
}

export const SCENARIO_ORDER: ScenarioId[] = [
  'coastal-cyclone',
  'flood-escalation',
  'medical-shortage',
]

export const SCENARIO_PRESETS: Record<ScenarioId, ScenarioPreset> = {
  'coastal-cyclone': {
    id: 'coastal-cyclone',
    name: 'Cyclone Response Simulation',
    tagline: 'Cyclone Megha approaches the Sagarika coast',
    description:
      'Baseline response plan under a severe cyclone warning. Two coastal segments are congested; every ward remains reachable.',
    severity: 'Severe',
    focus: 'Water and food coverage',
    highlights: ['2 congested segments', '3 of 4 vehicles available', '40,000 units requested'],
    initialEvents: [
      {
        offsetMin: 14,
        kind: 'scenario',
        title: 'Cyclone Response Simulation loaded',
        detail: 'Fictional Sagarika District snapshot: 6 wards · 3 depots · 4 vehicles.',
      },
      {
        offsetMin: 11,
        kind: 'plan',
        title: 'Baseline allocation plan computed',
        detail: 'RescueGrid Optimizer · 55% vulnerability priority · demo road graph.',
      },
      {
        offsetMin: 7,
        kind: 'road',
        title: 'Congestion flagged on East Harbour Link',
        detail: 'Simulated tidal overwash reduces throughput. Dijkstra cost multiplier 1.55× applied.',
      },
      {
        offsetMin: 3,
        kind: 'system',
        title: 'Coastal Supply Point staging updated',
        detail: 'Krishna 3T available; Pulicat 4x4 remains in scheduled maintenance.',
      },
    ],
  },
  'flood-escalation': {
    id: 'flood-escalation',
    name: 'Flood Escalation',
    tagline: 'Embankment breaches cut the southern wards',
    description:
      'Flood-phase snapshot with four blocked segments, a reduced coastal stockpile and water/food demand uplift. Detours dominate the plan.',
    severity: 'Critical',
    focus: 'Access and detours',
    highlights: ['4 blocked segments', '2 of 4 vehicles available', '45,970 units requested'],
    initialEvents: [
      {
        offsetMin: 22,
        kind: 'scenario',
        title: 'Flood Escalation preset loaded',
        detail: 'Simulated embankment breach cuts the south causeway.',
      },
      {
        offsetMin: 18,
        kind: 'road',
        title: 'South Causeway closed',
        detail: 'Embankment breach. Segment removed from the weighted route graph.',
      },
      {
        offsetMin: 15,
        kind: 'road',
        title: 'Beach Road blocked by debris',
        detail: 'Debris field near the harbour. Coastal Colony reroutes via the depot bypass.',
      },
      {
        offsetMin: 9,
        kind: 'plan',
        title: 'Coastal Supply Point stock reduced',
        detail: 'Water 4,600 → 3,600 kits; food 3,900 → 3,100 kits after simulated inundation.',
      },
      {
        offsetMin: 5,
        kind: 'system',
        title: 'Pennar Rapid moved to loading',
        detail: 'Vehicle unavailable for this planning window; one fewer run pool.',
      },
    ],
  },
  'medical-shortage': {
    id: 'medical-shortage',
    name: 'Medical Shortage',
    tagline: 'Medical stock collapses after the surge',
    description:
      'Post-cyclone health surge. Medical demand is 1.5× baseline while only 1,700 medical packs remain district-wide. Roads are mostly open.',
    severity: 'Severe',
    focus: 'Medical prioritisation',
    highlights: ['0 blocked segments', '4 of 4 vehicles available', '9,600 medical packs requested'],
    initialEvents: [
      {
        offsetMin: 19,
        kind: 'scenario',
        title: 'Medical Shortage preset loaded',
        detail: 'Simulated post-cyclone health surge across Sagarika District.',
      },
      {
        offsetMin: 11,
        kind: 'edit',
        title: 'Medical stock re-baselined',
        detail: '1,700 packs district-wide against 9,600 packs requested in this snapshot.',
      },
      {
        offsetMin: 8,
        kind: 'road',
        title: 'Riverside Approach congested',
        detail: 'Ambulance traffic and spot flooding. Fixed 1.55× travel penalty applied.',
      },
      {
        offsetMin: 4,
        kind: 'plan',
        title: 'Medical urgency raised in four wards',
        detail: 'Wards 1, 2, 4 and 6 now carry urgency 5 for this snapshot.',
      },
    ],
  },
}

export function createScenario(id: ScenarioId): Scenario {
  return structuredClone(buildScenario(VARIANTS[id]))
}

export function createInitialEvents(id: ScenarioId, now: number): SimEvent[] {
  return SCENARIO_PRESETS[id].initialEvents.map((event, index) => ({
    id: `seed-${id}-${index}`,
    at: now - event.offsetMin * 60000,
    kind: event.kind as SimEventKind,
    title: event.title,
    detail: event.detail,
  }))
}

export function nodeLocation(scenario: Scenario, nodeId: string): { lat: number; lng: number } | null {
  const ward = scenario.wards.find((w) => w.id === nodeId)
  if (ward) return ward.location
  const depot = scenario.depots.find((d) => d.id === nodeId)
  if (depot) return depot.location
  return null
}

export function nodeName(scenario: Scenario, nodeId: string): string {
  const ward = scenario.wards.find((w) => w.id === nodeId)
  if (ward) return ward.name
  const depot = scenario.depots.find((d) => d.id === nodeId)
  if (depot) return depot.name
  return nodeId
}
