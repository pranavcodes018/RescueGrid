import { ChevronDown, ChevronUp } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { STRATEGY_META, SUPPLY_META, SUPPLY_TYPES } from '../../lib/constants'
import { buildExplanation } from '../../lib/explain'
import { formatNumber, formatPct } from '../../lib/format'
import { cn } from '../../lib/cn'
import { useSimulation } from '../../state/SimulationContext'
import { AllocationSummary } from '../analysis/AllocationSummary'
import { AnalysisTabs } from '../analysis/AnalysisTabs'
import { BottleneckList } from '../analysis/BottleneckList'
import { ComparisonTable } from '../analysis/ComparisonTable'
import { PlanExplanation } from '../analysis/PlanExplanation'
import { StrategyCards } from '../analysis/StrategyCards'
import { WardDetail } from '../analysis/WardDetail'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { EmptyState } from '../ui/EmptyState'

export function MobileSheet() {
  const { state, comparisons, actions } = useSimulation()
  const [open, setOpen] = useState(false)
  const ward = state.scenario.wards.find((entry) => entry.id === state.selectedWardId) ?? null
  const wardPlan = state.plan.wards.find((entry) => entry.wardId === state.selectedWardId) ?? null

  const explanation = useMemo(() => {
    if (!ward) return null
    return buildExplanation(state.scenario, state.plan, ward.id, state.previousPlan)
  }, [state.scenario, state.plan, state.previousPlan, ward])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  if (state.screen === 'reports') return null

  return (
    <>
      {open ? (
        <button
          type="button"
          aria-label="Collapse analysis panel"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-20 bg-night-950/55 backdrop-blur-[1px] lg:hidden"
        />
      ) : null}

      <section
        className={cn(
          'app-sheet fixed inset-x-0 bottom-[56px] z-30 lg:hidden',
          'border-t border-line bg-night-925/97 shadow-[0_-18px_40px_-18px_rgba(0,0,0,0.8)] backdrop-blur-md',
          open ? 'rounded-t-xl' : 'rounded-t-lg',
        )}
      >
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="mobile-analysis-content"
          className="w-full px-3.5 pb-2.5 pt-1.5 text-left"
        >
          <span aria-hidden className="mx-auto mb-2 block h-1 w-10 rounded-full bg-night-700" />
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <span className="label-micro">Analysis</span>
              <Badge tone="teal" dot>
                Computed
              </Badge>
              <span className="num font-mono text-[8px] uppercase tracking-[0.07em] text-mist-600">
                rev {state.planRevision}
              </span>
            </div>
            <span className="flex items-center gap-1 text-[9px] text-mist-500">
              {open ? 'Collapse' : 'Expand'}
              {open ? <ChevronDown size={13} aria-hidden /> : <ChevronUp size={13} aria-hidden />}
            </span>
          </div>

          <div className="mt-2 flex items-end justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[11.5px] font-medium text-mist-100">
                {ward ? ward.name : 'Select a neighbourhood'}
              </div>
              <div className="mt-0.5 flex flex-wrap gap-x-2.5 gap-y-0.5 font-mono text-[8px] uppercase tracking-[0.04em] text-mist-500">
                {wardPlan
                  ? SUPPLY_TYPES.map((supply) => (
                      <span key={supply}>
                        {SUPPLY_META[supply].shortLabel}{' '}
                        <span className="text-mist-300">
                          {formatPct(wardPlan.bySupply[supply].demand > 0 ? wardPlan.bySupply[supply].allocated / wardPlan.bySupply[supply].demand : 0, 0)}
                        </span>
                      </span>
                    ))
                  : 'Tap a ward marker on the map'}
              </div>
            </div>
            <div className="shrink-0 text-right">
              <div className="num text-[19px] font-medium leading-none text-mist-50">
                {formatPct(state.plan.totals.coverage, 0)}
              </div>
              <div className="mt-0.5 font-mono text-[7.5px] uppercase tracking-[0.08em] text-mist-600">
                plan coverage
              </div>
            </div>
          </div>

          {!open ? (
            <div className="mt-2 flex items-center justify-between gap-2 border-t border-line/60 pt-1.5">
              <span className="font-mono text-[8px] uppercase tracking-[0.05em] text-mist-600">
                {formatNumber(state.plan.totals.unmetUrgent)} urgent units unmet · {state.plan.bottlenecks.length} constraints
              </span>
              <span className="font-mono text-[8px] uppercase tracking-[0.05em] text-[#a9e9e0]">
                Tap for analysis
              </span>
            </div>
          ) : null}
        </button>

        {open ? (
          <div
            id="mobile-analysis-content"
            className="border-t border-line/70 px-3.5 pb-4"
            style={{ maxHeight: 'calc(72svh - 92px)', overflowY: 'auto' }}
          >
            <AnalysisTabs
              tab={state.analysisTab}
              onChange={actions.setAnalysisTab}
              idPrefix="mobile-analysis"
              className="sticky top-0 z-10 -mx-3.5 mb-3 bg-night-925/97 px-3.5"
            />
            <div
              role="tabpanel"
              id={`mobile-analysis-panel-${state.analysisTab}`}
              aria-labelledby={`mobile-analysis-tab-${state.analysisTab}`}
              className="space-y-3.5"
            >
              {state.analysisTab === 'plan' ? (
                <>
                  <AllocationSummary
                    plan={state.plan}
                    strategy={state.strategy}
                    priority={state.priority}
                  />
                  <div className="hairline" />
                  {ward && wardPlan ? (
                    <div className="rounded-md border border-line/70 bg-night-950/30">
                      <WardDetail
                        ward={ward}
                        wardPlan={wardPlan}
                        scenario={state.scenario}
                        plan={state.plan}
                        onExplain={() => actions.setAnalysisTab('explain')}
                      />
                    </div>
                  ) : (
                    <EmptyState
                      compact
                      title="No neighbourhood selected"
                      description="Tap a ward marker on the map to inspect its allocation."
                    />
                  )}
                  <div>
                    <h3 className="label-tiny mb-2 text-mist-400">Bottlenecks</h3>
                    <BottleneckList bottlenecks={state.plan.bottlenecks} />
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      actions.navigate('lab')
                      setOpen(false)
                    }}
                  >
                    Tune inputs in Allocation Lab
                  </Button>
                </>
              ) : null}

              {state.analysisTab === 'compare' ? (
                <>
                  <div className="flex items-center justify-between">
                    <h3 className="label-tiny text-mist-400">Strategy comparison</h3>
                    <Badge tone="teal">Computed</Badge>
                  </div>
                  <StrategyCards
                    comparisons={comparisons}
                    active={state.strategy}
                    onSelect={actions.setStrategy}
                  />
                  <ComparisonTable
                    comparisons={comparisons}
                    active={state.strategy}
                    onSelect={actions.setStrategy}
                  />
                  <p className="text-[9px] leading-relaxed text-mist-500">
                    Active basis: {STRATEGY_META[state.strategy].label} · {state.priority}%
                    vulnerability priority.
                  </p>
                </>
              ) : null}

              {state.analysisTab === 'explain' ? (
                ward && explanation ? (
                  <PlanExplanation
                    explanation={explanation}
                    wardName={ward.shortName}
                    strategyLabel={STRATEGY_META[state.strategy].shortLabel}
                    priority={state.priority}
                  />
                ) : (
                  <EmptyState
                    compact
                    title="Select a neighbourhood"
                    description="Choose a ward to generate its deterministic explanation."
                  />
                )
              ) : null}
            </div>
          </div>
        ) : null}
      </section>
    </>
  )
}
