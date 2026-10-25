import { ChevronDown, Clock3, RefreshCw } from 'lucide-react'
import { SCENARIO_ORDER, SCENARIO_PRESETS } from '../../data/sagarika'
import { formatClock, formatShortTime } from '../../lib/format'
import { useSimulation } from '../../state/SimulationContext'
import type { ScenarioId, Severity } from '../../types'
import { Button } from '../ui/Button'
import { Logo } from '../ui/Logo'

const severityDot: Record<Severity, string> = {
  Elevated: 'bg-info',
  Severe: 'bg-warn',
  Critical: 'bg-critical',
}

function ScenarioSelect({ compact = false }: { compact?: boolean }) {
  const { state, actions } = useSimulation()
  const current = SCENARIO_PRESETS[state.scenarioId]

  return (
    <div
      className={
        compact
          ? 'relative flex h-8 min-w-0 max-w-[150px] items-center gap-1.5 rounded-md border border-line bg-night-900/80 pl-2 pr-6'
          : 'relative flex h-9 items-center gap-2 rounded-[7px] border border-line bg-night-900/70 pl-2.5 pr-7'
      }
    >
      <span
        aria-hidden
        title={`${state.scenario.severity} scenario`}
        className={`h-1.5 w-1.5 shrink-0 rounded-full ${severityDot[state.scenario.severity]}`}
      />
      <label htmlFor={compact ? 'scenario-compact' : 'scenario-select'} className="sr-only">
        Simulation scenario
      </label>
      <select
        id={compact ? 'scenario-compact' : 'scenario-select'}
        value={state.scenarioId}
        onChange={(event) => actions.loadScenario(event.target.value as ScenarioId)}
        className="min-w-0 max-w-[184px] appearance-none truncate bg-transparent text-[11px] font-medium text-mist-100 outline-none focus-visible:outline-none"
        title={current.name}
      >
        {SCENARIO_ORDER.map((id) => (
          <option key={id} value={id} className="bg-night-900 text-mist-100">
            {SCENARIO_PRESETS[id].name}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden
        size={12}
        className={`pointer-events-none absolute ${compact ? 'right-1.5' : 'right-2.5'} text-mist-500`}
      />
    </div>
  )
}

export function TopBar() {
  const { state, actions } = useSimulation()
  const preset = SCENARIO_PRESETS[state.scenarioId]

  return (
    <header className="app-topbar sticky top-0 z-40 border-b border-line bg-night-950/95 backdrop-blur-md">
      <div className="flex h-14 items-center gap-2 px-3 md:h-[60px] md:gap-3 md:px-4">
        <Logo compact className="md:hidden" />
        <Logo className="hidden md:flex" />

        <div className="hidden min-w-0 items-center gap-3 md:flex">
          <div className="h-7 w-px bg-line" />
          <ScenarioSelect />
          <span
            className="hidden items-center gap-2 rounded-md border border-warn/25 bg-warn/[0.055] px-2.5 py-1.5 lg:inline-flex"
            title="Simulation mode — not live dispatch"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="pulse-ring absolute inline-flex h-full w-full rounded-full bg-warn/60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-warn" />
            </span>
            <span className="font-mono text-[8.5px] uppercase tracking-[0.14em] text-[#e8c98f]">
              Simulation mode — not live dispatch
            </span>
          </span>
        </div>

        <div className="ml-auto flex min-w-0 items-center gap-2">
          <div className="hidden flex-col items-end leading-tight xl:flex" aria-live="polite">
            <span className="label-tiny">{state.isRecalculating ? 'Recomputing plan' : 'Last recalculated'}</span>
            <span className="num mt-1 flex items-center gap-1.5 text-[10.5px] text-mist-200">
              <Clock3 size={11} aria-hidden className="text-mist-500" />
              {formatClock(state.lastRecalculatedAt)}
              <span className="text-mist-600">·</span>
              <span className="text-mist-500">rev {state.planRevision}</span>
            </span>
          </div>

          <div className="min-w-0 md:hidden">
            <ScenarioSelect compact />
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={actions.recalculate}
            loading={state.isRecalculating}
            disabled={state.isRecalculating}
            icon={<RefreshCw size={13} aria-hidden />}
            className="hidden sm:inline-flex"
            title="Re-run the deterministic allocator and router with the current inputs"
          >
            Recalculate plan
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={actions.recalculate}
            loading={state.isRecalculating}
            disabled={state.isRecalculating}
            aria-label="Recalculate plan"
            className="px-2.5 sm:hidden"
            icon={state.isRecalculating ? undefined : <RefreshCw size={14} aria-hidden />}
          />
        </div>
      </div>

      <div className="sim-stripes flex h-[22px] items-center justify-between gap-3 border-t border-warn/15 bg-[#100e09]/60 px-3 sm:px-4">
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="h-1 w-1 shrink-0 rounded-full bg-warn pulse-soft" aria-hidden />
          <span className="truncate font-mono text-[8px] uppercase tracking-[0.17em] text-[#d9bf94] sm:text-[8.5px]">
            Simulation mode — not live dispatch
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-3 font-mono text-[8px] uppercase tracking-[0.1em] text-mist-600">
          <span className="hidden sm:inline">Fictional district · deterministic engine</span>
          <span className="num sm:hidden">Recalculated {formatShortTime(state.lastRecalculatedAt)}</span>
          <span className="hidden md:inline">{preset.severity} scenario</span>
        </div>
      </div>
    </header>
  )
}
