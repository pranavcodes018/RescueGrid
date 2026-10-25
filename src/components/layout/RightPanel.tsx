import { ArrowUpRight } from 'lucide-react'
import { useMemo } from 'react'
import { STRATEGY_META } from '../../lib/constants'
import { buildExplanation } from '../../lib/explain'
import { useSimulation } from '../../state/SimulationContext'
import { AllocationSummary } from '../analysis/AllocationSummary'
import { AnalysisTabs } from '../analysis/AnalysisTabs'
import { BottleneckList } from '../analysis/BottleneckList'
import { ComparisonTable } from '../analysis/ComparisonTable'
import { PlanExplanation } from '../analysis/PlanExplanation'
import { PlanChangeSummary } from '../analysis/PlanChangeSummary'
import { StrategyCards } from '../analysis/StrategyCards'
import { WardDetail } from '../analysis/WardDetail'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { EmptyState } from '../ui/EmptyState'

export function RightPanel() {
  const { state, comparisons, actions } = useSimulation()
  const ward = state.scenario.wards.find((entry) => entry.id === state.selectedWardId) ?? null
  const wardPlan = state.plan.wards.find((entry) => entry.wardId === state.selectedWardId) ?? null

  const explanation = useMemo(() => {
    if (!ward) return null
    return buildExplanation(state.scenario, state.plan, ward.id, state.previousPlan)
  }, [state.scenario, state.plan, state.previousPlan, ward])

  return (
    <aside className="app-rightpanel hidden w-[338px] shrink-0 flex-col border-l border-line bg-night-925/75 lg:flex xl:w-[360px]">
      <div className="border-b border-line px-3.5 pt-3">
        <div className="flex items-center justify-between">
          <span className="label-micro">Analysis</span>
          <Badge tone="teal" dot>
            Computed
          </Badge>
        </div>
        <div className="mt-1 flex items-baseline justify-between gap-2">
          <h2 className="text-[13px] font-medium tracking-[-0.01em] text-mist-100">Situation readout</h2>
          <span className="num font-mono text-[8px] uppercase tracking-[0.08em] text-mist-600">
            rev {state.planRevision}
          </span>
        </div>
        <AnalysisTabs
          tab={state.analysisTab}
          onChange={actions.setAnalysisTab}
          idPrefix="desktop-analysis"
          className="mt-2.5"
        />
      </div>

      <div
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3.5"
        role="tabpanel"
        id={`desktop-analysis-panel-${state.analysisTab}`}
        aria-labelledby={`desktop-analysis-tab-${state.analysisTab}`}
      >
        {state.analysisTab === 'plan' ? (
          <div className="space-y-3.5">
            <section>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="label-tiny text-mist-400">Allocation summary</h3>
                <span className="font-mono text-[8px] uppercase tracking-[0.08em] text-mist-600">
                  Deterministic
                </span>
              </div>
              <AllocationSummary
                plan={state.plan}
                strategy={state.strategy}
                priority={state.priority}
              />
            </section>

            <div className="hairline" />

            <section>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="label-tiny text-mist-400">Selected neighbourhood</h3>
                {ward ? <span className="num font-mono text-[8px] text-mist-600">{ward.code}</span> : null}
              </div>
              {ward && wardPlan ? (
                <div className="rounded-md border border-line/70 bg-night-950/30">
                  <WardDetail
                    ward={ward}
                    wardPlan={wardPlan}
                    scenario={state.scenario}
                    plan={state.plan}
                    onExplain={() => actions.setAnalysisTab('explain')}
                    compact={false}
                  />
                </div>
              ) : (
                <EmptyState
                  compact
                  title="No neighbourhood selected"
                  description="Click a ward marker or a row in the inventory to inspect demand, allocation and vulnerability."
                />
              )}
            </section>

            <div className="hairline" />

            <section>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="label-tiny text-mist-400">Bottlenecks</h3>
                <Badge tone={state.plan.bottlenecks.some((entry) => entry.severity === 'critical') ? 'red' : 'neutral'}>
                  {state.plan.bottlenecks.length} found
                </Badge>
              </div>
              <BottleneckList bottlenecks={state.plan.bottlenecks} />
            </section>

            <Button
              variant="secondary"
              size="sm"
              className="w-full justify-between"
              onClick={() => actions.navigate('lab')}
              trailingIcon={<ArrowUpRight size={12} aria-hidden />}
            >
              Tune inputs in Allocation Lab
            </Button>
          </div>
        ) : null}

        {state.analysisTab === 'compare' ? (
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="label-tiny text-mist-400">Strategy comparison</h3>
                <Badge tone="teal">Computed</Badge>
              </div>
              <p className="mt-1 text-[9.5px] leading-relaxed text-mist-500">
                Three deterministic allocations of independent copies of the same simulated stock.
                Select a card to make it the active plan; no validated winner is implied.
              </p>
            </div>
            <StrategyCards
              comparisons={comparisons}
              active={state.strategy}
              onSelect={actions.setStrategy}
            />
            <div className="hairline" />
            <ComparisonTable
              comparisons={comparisons}
              active={state.strategy}
              onSelect={actions.setStrategy}
            />
            <div className="rounded-md border border-line/70 bg-night-950/22 p-2">
              <p className="label-tiny mb-1">Active basis</p>
              <p className="text-[10px] leading-relaxed text-mist-300">
                {STRATEGY_META[state.strategy].label} ·{' '}
                <span className="text-mist-200">{state.priority}% vulnerability priority</span>
              </p>
              <p className="mt-1 text-[9px] leading-relaxed text-mist-500">
                {STRATEGY_META[state.strategy].method}
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="w-full justify-between"
              onClick={() => actions.navigate('lab')}
              trailingIcon={<ArrowUpRight size={12} aria-hidden />}
            >
              Open Allocation Lab
            </Button>
          </div>
        ) : null}

        {state.analysisTab === 'explain' ? (
          ward && explanation ? (
            <div className="space-y-3">
              <PlanExplanation
                explanation={explanation}
                wardName={ward.shortName}
                strategyLabel={STRATEGY_META[state.strategy].shortLabel}
                priority={state.priority}
              />
              <section className="border-t border-line/60 pt-2.5">
                <h3 className="label-tiny mb-2 text-mist-400">Allocation-level changes</h3>
                <PlanChangeSummary
                  previous={state.previousPlan}
                  current={state.plan}
                  scenario={state.scenario}
                  limit={4}
                />
              </section>
            </div>
          ) : (
            <EmptyState
              compact
              title="Select a neighbourhood"
              description="Choose a ward on the map or in the allocation table to generate its fixed explanation template."
            />
          )
        ) : null}
      </div>

      <div className="flex items-center justify-between border-t border-line/70 px-3.5 py-2 font-mono text-[8px] uppercase tracking-[0.07em] text-mist-600">
        <span>Computed · deterministic</span>
        <span>Fictional data</span>
      </div>
    </aside>
  )
}
