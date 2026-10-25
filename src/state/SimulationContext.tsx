import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react'
import { computeComparisons } from '../lib/plan'
import type {
  AnalysisTab,
  Plan,
  RoadId,
  RoadState,
  ScenarioEdits,
  ScenarioId,
  ScreenId,
  StrategyId,
  WardId,
} from '../types'
import {
  createInitialState,
  simulationReducer,
  type SimulationState,
} from './simulationReducer'

export type { SimulationState } from './simulationReducer'

export interface SimulationActions {
  navigate: (screen: ScreenId) => void
  loadScenario: (scenarioId: ScenarioId) => void
  applyScenarioEdits: (edits: ScenarioEdits, summary: string) => void
  setRoadState: (roadId: RoadId, state: RoadState) => void
  selectWard: (wardId: WardId | null) => void
  selectRoad: (roadId: RoadId | null) => void
  setStrategy: (strategy: StrategyId) => void
  setPriority: (priority: number) => void
  recalculate: () => void
  resetScenario: () => void
  setAnalysisTab: (tab: AnalysisTab) => void
}

interface SimulationContextValue {
  state: SimulationState
  comparisons: Record<StrategyId, Plan>
  actions: SimulationActions
}

const SimulationContext = createContext<SimulationContextValue | null>(null)

export function SimulationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(simulationReducer, undefined, createInitialState)

  useEffect(() => {
    if (!state.isRecalculating) return
    const timer = window.setTimeout(() => dispatch({ type: 'settle' }), 680)
    return () => window.clearTimeout(timer)
  }, [state.isRecalculating, state.planRevision])

  const comparisons = useMemo(
    () => computeComparisons(state.scenario, state.priority),
    [state.scenario, state.priority],
  )

  const navigate = useCallback((screen: ScreenId) => dispatch({ type: 'navigate', screen }), [])
  const loadScenario = useCallback(
    (scenarioId: ScenarioId) => dispatch({ type: 'load-scenario', scenarioId }),
    [],
  )
  const applyScenarioEdits = useCallback(
    (edits: ScenarioEdits, summary: string) => dispatch({ type: 'apply-edits', edits, summary }),
    [],
  )
  const setRoadState = useCallback(
    (roadId: RoadId, roadState: RoadState) =>
      dispatch({ type: 'set-road-state', roadId, state: roadState }),
    [],
  )
  const selectWard = useCallback((wardId: WardId | null) => dispatch({ type: 'select-ward', wardId }), [])
  const selectRoad = useCallback((roadId: RoadId | null) => dispatch({ type: 'select-road', roadId }), [])
  const setStrategy = useCallback(
    (strategy: StrategyId) => dispatch({ type: 'set-strategy', strategy }),
    [],
  )
  const setPriority = useCallback((priority: number) => dispatch({ type: 'set-priority', priority }), [])
  const recalculate = useCallback(() => dispatch({ type: 'recalculate' }), [])
  const resetScenario = useCallback(() => dispatch({ type: 'reset' }), [])
  const setAnalysisTab = useCallback(
    (tab: AnalysisTab) => dispatch({ type: 'analysis-tab', tab }),
    [],
  )

  const value = useMemo<SimulationContextValue>(
    () => ({
      state,
      comparisons,
      actions: {
        navigate,
        loadScenario,
        applyScenarioEdits,
        setRoadState,
        selectWard,
        selectRoad,
        setStrategy,
        setPriority,
        recalculate,
        resetScenario,
        setAnalysisTab,
      },
    }),
    [
      state,
      comparisons,
      navigate,
      loadScenario,
      applyScenarioEdits,
      setRoadState,
      selectWard,
      selectRoad,
      setStrategy,
      setPriority,
      recalculate,
      resetScenario,
      setAnalysisTab,
    ],
  )

  return <SimulationContext.Provider value={value}>{children}</SimulationContext.Provider>
}

export function useSimulation(): SimulationContextValue {
  const context = useContext(SimulationContext)
  if (!context) throw new Error('useSimulation must be used inside SimulationProvider')
  return context
}
