import { createInitialEvents, createScenario, SCENARIO_PRESETS } from '../data/sagarika'
import { PRIORITY_DEFAULT, STRATEGY_META } from '../lib/constants'
import { computePlan } from '../lib/plan'
import { applyEdits } from '../lib/scenario'
import type {
  AnalysisTab,
  Plan,
  RoadId,
  RoadState,
  Scenario,
  ScenarioEdits,
  ScenarioId,
  ScreenId,
  SimEvent,
  SimEventKind,
  StrategyId,
  WardId,
} from '../types'

export interface SimulationState {
  screen: ScreenId
  scenarioId: ScenarioId
  scenario: Scenario
  scenarioEpoch: number
  strategy: StrategyId
  priority: number
  plan: Plan
  previousPlan: Plan | null
  selectedWardId: WardId | null
  selectedRoadId: RoadId | null
  events: SimEvent[]
  isRecalculating: boolean
  lastRecalculatedAt: number
  planRevision: number
  analysisTab: AnalysisTab
}

export type SimulationAction =
  | { type: 'navigate'; screen: ScreenId }
  | { type: 'load-scenario'; scenarioId: ScenarioId }
  | { type: 'apply-edits'; edits: ScenarioEdits; summary: string }
  | { type: 'set-road-state'; roadId: RoadId; state: RoadState }
  | { type: 'select-ward'; wardId: WardId | null }
  | { type: 'select-road'; roadId: RoadId | null }
  | { type: 'set-strategy'; strategy: StrategyId }
  | { type: 'set-priority'; priority: number }
  | { type: 'recalculate' }
  | { type: 'reset' }
  | { type: 'settle' }
  | { type: 'analysis-tab'; tab: AnalysisTab }

let eventSequence = 0

function makeEvent(kind: SimEventKind, title: string, detail: string, at = Date.now()): SimEvent {
  eventSequence += 1
  return { id: `event-${at}-${eventSequence}`, at, kind, title, detail }
}

function pushEvent(state: SimulationState, event: SimEvent): SimEvent[] {
  return [event, ...state.events].slice(0, 40)
}

function commit(
  state: SimulationState,
  scenario: Scenario,
  event: SimEvent,
  planOverrides?: { strategy?: StrategyId; priority?: number },
  options?: { previousPlan?: Plan | null },
): SimulationState {
  const strategy = planOverrides?.strategy ?? state.strategy
  const priority = planOverrides?.priority ?? state.priority
  const plan = computePlan(scenario, strategy, priority)
  return {
    ...state,
    scenario,
    strategy,
    priority,
    plan,
    previousPlan: options?.previousPlan === undefined ? state.plan : options.previousPlan,
    events: pushEvent(state, event),
    isRecalculating: true,
    lastRecalculatedAt: Date.now(),
    planRevision: state.planRevision + 1,
  }
}

export function createInitialState(): SimulationState {
  const scenario = createScenario('coastal-cyclone')
  const now = Date.now()
  return {
    screen: 'overview',
    scenarioId: scenario.id,
    scenario,
    scenarioEpoch: 0,
    strategy: 'optimizer',
    priority: PRIORITY_DEFAULT,
    plan: computePlan(scenario, 'optimizer', PRIORITY_DEFAULT),
    previousPlan: null,
    selectedWardId: 'ward-harbour',
    selectedRoadId: null,
    events: createInitialEvents(scenario.id, now),
    isRecalculating: false,
    lastRecalculatedAt: now,
    planRevision: 1,
    analysisTab: 'plan',
  }
}

export function simulationReducer(state: SimulationState, action: SimulationAction): SimulationState {
  switch (action.type) {
    case 'navigate':
      return { ...state, screen: action.screen }

    case 'load-scenario': {
      if (action.scenarioId === state.scenarioId) return state
      const scenario = createScenario(action.scenarioId)
      const preset = SCENARIO_PRESETS[action.scenarioId]
      const switchEvent = makeEvent(
        'scenario',
        `Switched to ${preset.name}`,
        'Preset loaded. Demand, urgency, stock, fleet and road states are restored, then all three strategies are recomputed.',
      )
      const next = commit(state, scenario, switchEvent, undefined, { previousPlan: null })
      return {
        ...next,
        scenarioId: scenario.id,
        scenarioEpoch: state.scenarioEpoch + 1,
        selectedRoadId: null,
        events: [switchEvent, ...createInitialEvents(scenario.id, next.lastRecalculatedAt)].slice(0, 40),
      }
    }

    case 'apply-edits': {
      const scenario = applyEdits(state.scenario, action.edits)
      return commit(
        state,
        scenario,
        makeEvent(
          'edit',
          'Scenario inputs applied',
          `${action.summary} Allocations, routes and baselines were recomputed from the new inputs.`,
        ),
      )
    }

    case 'set-road-state': {
      const road = state.scenario.roads.find((entry) => entry.id === action.roadId)
      if (!road || road.state === action.state) return state
      const scenario: Scenario = {
        ...state.scenario,
        roads: state.scenario.roads.map((entry) =>
          entry.id === action.roadId ? { ...entry, state: action.state } : entry,
        ),
      }
      const detail =
        action.state === 'blocked'
          ? 'Segment removed from the weighted road graph. Dijkstra re-routed every delivery and unreachable wards were re-checked.'
          : action.state === 'congested'
            ? 'Fixed 1.55× cost multiplier applied. Dijkstra re-routed deliveries using this segment.'
            : 'Normal travel cost restored. Dijkstra routes and reachability recomputed.'
      const title =
        action.state === 'blocked'
          ? `Road blocked · ${road.name}`
          : action.state === 'congested'
            ? `Congestion applied · ${road.name}`
            : `Road reopened · ${road.name}`
      return commit(state, scenario, makeEvent('road', title, detail))
    }

    case 'select-ward':
      return { ...state, selectedWardId: action.wardId }

    case 'select-road':
      return { ...state, selectedRoadId: action.roadId }

    case 'analysis-tab':
      return { ...state, analysisTab: action.tab }

    case 'set-strategy': {
      if (action.strategy === state.strategy) return state
      return commit(
        state,
        state.scenario,
        makeEvent(
          'plan',
          `Strategy set to ${STRATEGY_META[action.strategy].shortLabel}`,
          `${STRATEGY_META[action.strategy].method}. All three strategies were recomputed from identical starting inputs.`,
        ),
        { strategy: action.strategy },
      )
    }

    case 'set-priority': {
      const priority = Math.max(0, Math.min(100, Math.round(action.priority)))
      if (priority === state.priority) return state
      return commit(
        state,
        state.scenario,
        makeEvent(
          'plan',
          'Priority weight adjusted',
          `Coverage ↔ vulnerability priority set to ${priority}% vulnerability. The optimizer was re-run on the same stock, fleet and roads.`,
        ),
        { priority },
      )
    }

    case 'recalculate':
      return commit(
        state,
        state.scenario,
        makeEvent(
          'plan',
          'Plan recalculated',
          `${STRATEGY_META[state.strategy].shortLabel} recomputed from the current inputs with Dijkstra routing and the deterministic allocator.`,
        ),
        undefined,
        { previousPlan: state.plan },
      )

    case 'reset': {
      const scenario = createScenario(state.scenarioId)
      const resetEvent = makeEvent(
        'reset',
        'Scenario reset to preset',
        `${SCENARIO_PRESETS[state.scenarioId].name} demand, urgency, stock, fleet and road states restored from the preset copy.`,
      )
      const next = commit(state, scenario, resetEvent, undefined, { previousPlan: null })
      return {
        ...next,
        scenarioEpoch: state.scenarioEpoch + 1,
        selectedRoadId: null,
        events: [resetEvent, ...createInitialEvents(scenario.id, next.lastRecalculatedAt)].slice(0, 40),
      }
    }

    case 'settle':
      return { ...state, isRecalculating: false }

    default:
      return state
  }
}
