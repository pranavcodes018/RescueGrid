import type { DepotId, ScreenId, StrategyId, SupplyType } from '../types'

export const SUPPLY_TYPES: SupplyType[] = ['water', 'medical', 'food']

export const SUPPLY_META: Record<
  SupplyType,
  { label: string; shortLabel: string; plural: string; unit: string; color: string; description: string }
> = {
  water: {
    label: 'Water kits',
    shortLabel: 'Water',
    plural: 'water kits',
    unit: 'kits',
    color: '#67c7e8',
    description: 'Household purification and storage kits.',
  },
  medical: {
    label: 'Medical packs',
    shortLabel: 'Medical',
    plural: 'medical packs',
    unit: 'packs',
    color: '#c4b5fd',
    description: 'Trauma, hydration and chronic-care packs.',
  },
  food: {
    label: 'Food kits',
    shortLabel: 'Food',
    plural: 'food kits',
    unit: 'kits',
    color: '#f0b45c',
    description: 'Dry ration kits for a household of four.',
  },
}

export const STRATEGY_ORDER: StrategyId[] = ['optimizer', 'nearest', 'proportional']

export const STRATEGY_META: Record<
  StrategyId,
  { label: string; shortLabel: string; microLabel: string; description: string; method: string }
> = {
  optimizer: {
    label: 'RescueGrid Optimizer',
    shortLabel: 'Optimizer',
    microLabel: 'R-GRID',
    description:
      'Blends requested volume with urgency and vulnerability weight. The priority slider shifts the balance.',
    method: 'Blended need weighting · greedy allocation over Dijkstra routes',
  },
  nearest: {
    label: 'Nearest-first',
    shortLabel: 'Nearest-first',
    microLabel: 'NEAREST',
    description:
      'Fills demand ward-by-ward from the closest reachable depot. Fast to explain, but distant wards can be left behind.',
    method: 'Distance-ordered greedy fill · demo road graph',
  },
  proportional: {
    label: 'Population-proportional',
    shortLabel: 'Population',
    microLabel: 'POP-PROP',
    description:
      'Splits available stock in proportion to each ward’s population, ignoring urgency and road distance.',
    method: 'Population-share apportionment · demand-capped',
  },
}

export const ROAD_STATE_META = {
  open: {
    label: 'Open',
    color: '#8fb6c7',
    dotClass: 'bg-[#8fb6c7]',
    description: 'Normal expected travel conditions.',
  },
  congested: {
    label: 'Congested',
    color: '#f0b45c',
    dotClass: 'bg-warn',
    description: 'Fixed 1.55× travel-time penalty in the demo route graph.',
  },
  blocked: {
    label: 'Blocked',
    color: '#f87171',
    dotClass: 'bg-critical',
    description: 'Removed from the demo route graph until reopened.',
  },
} as const

export const URGENCY_META: Record<
  number,
  { label: string; color: string; badgeClass: string; dotClass: string }
> = {
  5: {
    label: 'Critical',
    color: '#f87171',
    badgeClass: 'border-critical/30 bg-critical/10 text-[#fca5a5]',
    dotClass: 'bg-critical',
  },
  4: {
    label: 'High',
    color: '#f0b45c',
    badgeClass: 'border-warn/30 bg-warn/10 text-[#f6c97f]',
    dotClass: 'bg-warn',
  },
  3: {
    label: 'Moderate',
    color: '#2dd4bf',
    badgeClass: 'border-signal/30 bg-signal/10 text-signal-bright',
    dotClass: 'bg-signal',
  },
  2: {
    label: 'Guarded',
    color: '#7dd3fc',
    badgeClass: 'border-info/30 bg-info/10 text-info',
    dotClass: 'bg-info',
  },
  1: {
    label: 'Low',
    color: '#8599ae',
    badgeClass: 'border-mist-500/30 bg-white/5 text-mist-300',
    dotClass: 'bg-mist-400',
  },
}

export const VEHICLE_STATUS_META = {
  available: { label: 'Available', dotClass: 'bg-signal', textClass: 'text-signal-bright' },
  loading: { label: 'Loading', dotClass: 'bg-warn', textClass: 'text-warn' },
  maintenance: { label: 'Maintenance', dotClass: 'bg-critical', textClass: 'text-critical' },
} as const

export interface NavItem {
  id: ScreenId
  label: string
  navLabel: string
  description: string
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Overview', navLabel: 'Overview', description: 'Situation board and map' },
  { id: 'lab', label: 'Allocation Lab', navLabel: 'Allocation', description: 'Tune inputs and preview a plan' },
  { id: 'network', label: 'Road Network', navLabel: 'Roads', description: 'Segment states and events' },
  { id: 'scenarios', label: 'Scenarios', navLabel: 'Scenarios', description: 'Fictional presets' },
  { id: 'reports', label: 'Reports', navLabel: 'Reports', description: 'Printable situation report' },
]

export const DEPOT_STYLE: Record<DepotId, { color: string; shape: 'diamond' | 'circle' | 'hexagon' }> = {
  'depot-a': { color: '#2dd4bf', shape: 'diamond' },
  'depot-b': { color: '#7dd3fc', shape: 'circle' },
  'depot-c': { color: '#c4b5fd', shape: 'hexagon' },
}

export const RUNS_PER_VEHICLE = 8

export const DISTRICT_NAME = 'Sagarika District'

export const DISTRICT_DISCLAIMER =
  'Sagarika District is fictional. All wards, depots, roads, vehicles, quantities and conditions in this prototype are simulated.'

export const SIMULATION_DISCLAIMER = 'Simulation mode — not live dispatch'

export const PRIORITY_DEFAULT = 55

export const DEMAND_MIN = 0
export const DEMAND_MAX = 8000
