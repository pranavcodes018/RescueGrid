export interface LatLng {
  lat: number
  lng: number
}

export type SupplyType = 'water' | 'medical' | 'food'
export type SupplyValues = Record<SupplyType, number>

export type WardId =
  | 'ward-harbour'
  | 'ward-old-town'
  | 'ward-riverside'
  | 'ward-coastal-colony'
  | 'ward-hillview'
  | 'ward-east-market'

export type DepotId = 'depot-a' | 'depot-b' | 'depot-c'

export type VehicleId = 'veh-godavari' | 'veh-krishna' | 'veh-pennar' | 'veh-pulicat'

export type RoadId =
  | 'road-beach'
  | 'road-harbour-link'
  | 'road-old-town-spine'
  | 'road-market-connector'
  | 'road-riverside-approach'
  | 'road-inland-medical'
  | 'road-ridge'
  | 'road-south-causeway'
  | 'road-colony-link'
  | 'road-east-bypass'
  | 'road-depot-south'

export type NodeId = WardId | DepotId

export type RoadState = 'open' | 'congested' | 'blocked'

export type VehicleStatus = 'available' | 'loading' | 'maintenance'

export type ScenarioId = 'coastal-cyclone' | 'flood-escalation' | 'medical-shortage'

export type StrategyId = 'optimizer' | 'nearest' | 'proportional'

export type ScreenId = 'overview' | 'lab' | 'network' | 'scenarios' | 'reports'

export type AnalysisTab = 'plan' | 'compare' | 'explain'

export type Severity = 'Elevated' | 'Severe' | 'Critical'

export type SimEventKind = 'scenario' | 'road' | 'plan' | 'edit' | 'reset' | 'system'

export interface VulnerabilityProfile {
  elderlyPct: number
  childrenPct: number
  disabilityPct: number
  informalHousingPct: number
  /** 0–100 composite used by the declared priority weight. */
  score: number
}

export interface Ward {
  id: WardId
  code: string
  name: string
  shortName: string
  population: number
  households: number
  location: LatLng
  /** 1 (low) to 5 (critical). */
  urgency: number
  vulnerability: VulnerabilityProfile
  demand: SupplyValues
  note: string
}

export interface Depot {
  id: DepotId
  code: 'A' | 'B' | 'C'
  name: string
  shortName: string
  location: LatLng
  stock: SupplyValues
  accessNote: string
}

export interface Vehicle {
  id: VehicleId
  name: string
  vehicleClass: string
  depotId: DepotId
  capacityUnits: number
  speedKph: number
  status: VehicleStatus
  note: string
}

export interface Road {
  id: RoadId
  name: string
  ref: string
  from: NodeId
  to: NodeId
  distanceKm: number
  lanes: number
  state: RoadState
  geometry: LatLng[]
  note: string
}

export interface ScenarioWeather {
  system: string
  windKph: number
  rainfallMm: number
  tideM: number
  advisory: string
}

export interface Scenario {
  id: ScenarioId
  name: string
  tagline: string
  description: string
  severity: Severity
  district: string
  districtNote: string
  snapshotLabel: string
  weather: ScenarioWeather
  wards: Ward[]
  depots: Depot[]
  vehicles: Vehicle[]
  roads: Road[]
  assumptions: string[]
  supplyNotes: Record<SupplyType, string>
}

export interface ScenarioPreset {
  id: ScenarioId
  name: string
  tagline: string
  description: string
  severity: Severity
  focus: string
  highlights: string[]
  initialEvents: Array<{
    offsetMin: number
    kind: SimEventKind
    title: string
    detail: string
  }>
}

export interface SimEvent {
  id: string
  at: number
  kind: SimEventKind
  title: string
  detail: string
}

export interface ScenarioEdits {
  demand: Record<WardId, SupplyValues>
  urgency: Record<WardId, number>
  stock: Record<DepotId, SupplyValues>
}

export interface RouteTrace {
  path: RoadId[]
  distanceKm: number
  costKm: number
  delayKm: number
  detourKm: number
}

export interface SupplyWardPlan {
  demand: number
  allocated: number
  unmet: number
  sourceDepotId: DepotId | null
  route: RouteTrace | null
}

export interface WardPlan {
  wardId: WardId
  urgency: number
  vulnerabilityScore: number
  /** Unmet units × declared priority weight. */
  priorityWeight: number
  reachable: boolean
  demand: SupplyValues
  allocated: SupplyValues
  unmet: SupplyValues
  bySupply: Record<SupplyType, SupplyWardPlan>
  coverage: number
  demandUnits: number
  allocatedUnits: number
  unmetUnits: number
  priorityWeightedUnmet: number
  nearestDepotDistanceKm: number | null
  allocationShare: number
}

export interface PlanAllocation {
  wardId: WardId
  depotId: DepotId
  supply: SupplyType
  units: number
  distanceKm: number
  delayKm: number
  detourKm: number
  path: RoadId[]
  trips: number
  vehicleId: VehicleId | null
  vehicleHours: number
  /** Capacity of the vehicle assigned to this delivery, per trip. */
  vehicleCapacityUnits: number
  /** Loaded + empty return kilometres across every trip in this delivery. */
  roundTripKm: number
}

export interface PlanRoute {
  depotId: DepotId
  wardId: WardId
  units: number
  distanceKm: number
  delayKm: number
  detourKm: number
  path: RoadId[]
  trips: number
  vehicleHours: number
}

export interface SupplyTotals {
  demand: number
  stock: number
  allocated: number
  unmet: number
  coverage: number
  remainingStock: number
}

export type UnservedReason = 'unreachable' | 'stock' | 'fleet'

export interface UnservedDemand {
  wardId: WardId
  supply: SupplyType
  units: number
  reason: UnservedReason
  detail: string
}

export interface VehicleUsage {
  vehicleId: VehicleId
  depotId: DepotId
  capacityUnits: number
  runBudget: number
  runsUsed: number
  unitsMoved: number
  capacityOffered: number
  available: boolean
}

export interface ReachabilityEntry {
  wardId: WardId
  reachable: boolean
  nearestDepotId: DepotId | null
  distanceKm: number | null
  costKm: number | null
}

export interface DepotInventory {
  depotId: DepotId
  openingStock: SupplyValues
  remaining: SupplyValues
  dispatched: SupplyValues
}

export interface PlanMetrics {
  reachability: ReachabilityEntry[]
  reachableWards: number
  unreachableWards: number
  /** Loaded out + empty return kilometres across every planned run. */
  routeDistanceKm: number
  routeTimeHours: number
  fleetCapacityOffered: number
  fleetCapacityMoved: number
  fleetCapacityUsage: number
  depotInventory: DepotInventory[]
  /** Declared priority weight per ward, applied to unmet units. */
  priorityWeights: Record<WardId, number>
  unservedByReason: Record<UnservedReason, number>
}

export interface PlanTotals {
  demand: number
  allocated: number
  stock: number
  coverage: number
  unmetUnits: number
  unmetUrgent: number
  priorityWeightedUnmet: number
  fairness: number | null
  vehiclesUsed: number
  vehiclesAvailable: number
  fleetSize: number
  trips: number
  runSlots: number
  fleetUtilisation: number
  vehicleHours: number
  incompleteWards: number
  affectedWards: number
  blockedRoads: number
  congestedRoads: number
  reachableWards: number
  unreachableWards: number
  routeDistanceKm: number
  routeTimeHours: number
  fleetCapacityOffered: number
  fleetCapacityMoved: number
  fleetCapacityUsage: number
}

export interface PlanBottleneck {
  id: string
  severity: 'critical' | 'warning' | 'info'
  title: string
  detail: string
  value?: string
}

export interface Plan {
  scenarioId: ScenarioId
  strategy: StrategyId
  priority: number
  generatedAt: number
  wards: WardPlan[]
  allocations: PlanAllocation[]
  routes: PlanRoute[]
  supplies: Record<SupplyType, SupplyTotals>
  totals: PlanTotals
  bottlenecks: PlanBottleneck[]
  /** Every unit that could not be delivered, with the computed reason. */
  unserved: UnservedDemand[]
  fleet: VehicleUsage[]
  metrics: PlanMetrics
}
