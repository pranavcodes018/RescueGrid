# RescueGrid — complete source bundle

Generated 2026-10-25 08:09 UTC. One section per source file.

---

## `index.html`

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#050b13" />
    <meta
      name="description"
      content="RescueGrid — a simulated disaster resource allocation command centre for the fictional Sagarika District. Prototype, not live dispatch."
    />
    <title>RescueGrid · Sagarika District Simulation</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

---

## `package.json`

```json
{
  "name": "8fb5afb6df8e6701cfec34ab8404f601aa84983161a6ff1943194b09023c1d1f",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "oxlint",
    "preview": "vite preview"
  },
  "dependencies": {
    "@fontsource-variable/inter": "^5.3.0",
    "@fontsource-variable/jetbrains-mono": "^5.3.0",
    "@tailwindcss/vite": "^4.3.3",
    "@types/leaflet": "^1.9.22",
    "leaflet": "^1.9.4",
    "lucide-react": "^1.61.0",
    "react": "^19.3.1",
    "react-dom": "^19.3.1",
    "tailwindcss": "^4.3.3"
  },
  "devDependencies": {
    "@types/node": "^24.19.2",
    "@types/react": "^19.3.0",
    "@types/react-dom": "^19.3.0",
    "@vitejs/plugin-react": "^6.1.2",
    "oxlint": "^1.88.0",
    "typescript": "~6.0.3",
    "vite": "^8.3.4",
    "vitest": "^5.0.5"
  }
}
```

---

## `vite.config.ts`

```tsx
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

---

## `tsconfig.json`

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

---

## `tsconfig.app.json`

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "es2023",
    "lib": ["ES2023", "DOM"],
    "module": "esnext",
    "types": ["vite/client"],
    "allowArbitraryExtensions": true,
    "skipLibCheck": true,
    "strict": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
```

---

## `tsconfig.node.json`

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
    "target": "es2023",
    "lib": ["ES2023"],
    "types": ["node"],
    "skipLibCheck": true,

    /* Bundler mode */
    "module": "nodenext",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,

    /* Linting */
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["vite.config.ts"]
}
```

---

## `deploy.manifest.json`

```json
{
  "entrypoint": "worker.js",
  "compatibilityDate": "2026-10-25",
  "modules": [{ "name": "worker.js", "type": "esm", "path": "./sites/worker.js" }],
  "assetsDirectory": "./dist",
  "spa": true
}
```

---

## `sites/worker.js`

```js
export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request)
    if (response.status === 404 && request.method === 'GET') {
      const url = new URL(request.url)
      if (!url.pathname.includes('.')) {
        return env.ASSETS.fetch(new Request(new URL('/index.html', url), request))
      }
    }
    return response
  },
}
```

---

## `src/App.tsx`

```tsx
import { useEffect, useRef } from 'react'
import { ErrorBoundary } from './components/ErrorBoundary'
import { BottomStrip } from './components/layout/BottomStrip'
import { MobileNav } from './components/layout/MobileNav'
import { MobileSheet } from './components/layout/MobileSheet'
import { RightPanel } from './components/layout/RightPanel'
import { Sidebar } from './components/layout/Sidebar'
import { TopBar } from './components/layout/TopBar'
import { AllocationLab } from './screens/AllocationLab'
import { Overview } from './screens/Overview'
import { Reports } from './screens/Reports'
import { RoadNetwork } from './screens/RoadNetwork'
import { Scenarios } from './screens/Scenarios'
import { SimulationProvider, useSimulation } from './state/SimulationContext'
import type { ScreenId } from './types'

const SCREENS: Record<ScreenId, () => React.JSX.Element> = {
  overview: Overview,
  lab: AllocationLab,
  network: RoadNetwork,
  scenarios: Scenarios,
  reports: Reports,
}

function AppShell() {
  const { state } = useSimulation()
  const mainRef = useRef<HTMLElement | null>(null)
  const Screen = SCREENS[state.screen]

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [state.screen])

  return (
    <div className="app-root app-canvas min-h-[100svh] text-mist-100 lg:h-[100svh] lg:overflow-hidden">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[200] focus:rounded-md focus:border focus:border-signal/50 focus:bg-night-800 focus:px-3 focus:py-2 focus:text-[12px] focus:text-mist-50"
      >
        Skip to main content
      </a>

      <TopBar />

      <div className="app-shell flex min-h-[calc(100svh-78px)] lg:h-[calc(100svh-82px)] lg:min-h-0">
        <Sidebar />
        <div className="app-body flex min-w-0 flex-1 flex-col">
          <div className="app-main flex min-h-0 flex-1">
            <main
              ref={mainRef}
              id="main-content"
              tabIndex={-1}
              className="screen-scroll min-w-0 flex-1 overflow-y-auto overscroll-contain pb-[188px] outline-none lg:pb-0"
            >
              <Screen />
            </main>
            <RightPanel />
          </div>
          <BottomStrip />
        </div>
      </div>

      <MobileNav />
      <MobileSheet />
    </div>
  )
}

export default function App() {
  return (
    <SimulationProvider>
      <ErrorBoundary>
        <AppShell />
      </ErrorBoundary>
    </SimulationProvider>
  )
}
```

---

## `src/assets/hero.png`

_(binary or asset file)_

---

## `src/assets/vite.svg`

_(binary or asset file)_

---

## `src/components/ErrorBoundary.tsx`

```tsx
import { Component, type ErrorInfo, type ReactNode } from 'react'
import { TriangleAlert } from 'lucide-react'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('RescueGrid render error', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="app-canvas flex min-h-[100svh] items-center justify-center p-4">
          <div className="panel max-w-md p-5 text-center">
            <TriangleAlert size={22} aria-hidden className="mx-auto text-warn" />
            <h1 className="mt-2 text-[15px] font-medium text-mist-50">The simulation view failed to render</h1>
            <p className="mt-1.5 text-[11px] leading-relaxed text-mist-400">
              This is a local prototype; no data has been sent anywhere. You can try rendering the board
              again or reload the page to restore the baseline scenario.
            </p>
            <div className="mt-4 flex justify-center gap-2">
              <button
                type="button"
                onClick={() => this.setState({ hasError: false })}
                className="rounded-md border border-line bg-white/[0.04] px-3 py-1.5 text-[11px] text-mist-200 hover:bg-white/[0.08]"
              >
                Try again
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="rounded-md border border-signal/50 bg-signal px-3 py-1.5 text-[11px] font-semibold text-[#03211d] hover:bg-signal-bright"
              >
                Reload simulation
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
```

---

## `src/components/analysis/AllocationSummary.tsx`

```tsx
import { BriefcaseMedical, Droplets, Package, Truck } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { STRATEGY_META, SUPPLY_META, SUPPLY_TYPES } from '../../lib/constants'
import { formatNumber, formatPct } from '../../lib/format'
import type { Plan, StrategyId, SupplyType } from '../../types'
import { ProgressBar, type ProgressTone } from '../ui/ProgressBar'
import { Badge } from '../ui/Badge'

const SUPPLY_ICON: Record<SupplyType, LucideIcon> = {
  water: Droplets,
  medical: BriefcaseMedical,
  food: Package,
}

const SUPPLY_TONE: Record<SupplyType, ProgressTone> = {
  water: 'sky',
  medical: 'violet',
  food: 'amber',
}

export function AllocationSummary({
  plan,
  strategy,
  priority,
}: {
  plan: Plan
  strategy: StrategyId
  priority: number
}) {
  return (
    <div>
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="label-tiny mb-1">Estimated coverage</div>
          <div className="num text-[28px] font-medium leading-none text-mist-50">
            {formatPct(plan.totals.coverage, 1)}
          </div>
          <div className="mt-1 text-[9.5px] text-mist-500">
            {formatNumber(plan.totals.allocated)} of {formatNumber(plan.totals.demand)} requested units
          </div>
        </div>
        <div className="text-right">
          <div className="label-tiny mb-1">Priority-unmet</div>
          <div className="num text-[12px] text-[#f6c97f]">
            {formatNumber(plan.totals.priorityWeightedUnmet)}
          </div>
          <div className="mt-1 text-[9px] text-mist-500">weighted units</div>
        </div>
      </div>
      <ProgressBar
        value={plan.totals.coverage}
        label="Overall plan coverage"
        tone="teal"
        className="mt-2.5"
        heightClass="h-[6px]"
        showTicks
      />

      <div className="mt-3 grid grid-cols-3 gap-1.5">
        {[
          ['Demand', formatNumber(plan.totals.demand)],
          ['Allocated', formatNumber(plan.totals.allocated)],
          ['Unmet', formatNumber(plan.totals.unmetUnits)],
        ].map(([label, value]) => (
          <div key={label} className="rounded border border-line/70 bg-night-950/35 px-1.5 py-1">
            <div className="font-mono text-[7.5px] uppercase tracking-[0.1em] text-mist-600">{label}</div>
            <div className="num mt-0.5 text-[10.5px] text-mist-200">{value}</div>
          </div>
        ))}
      </div>

      <div className="mt-3 space-y-2.5">
        {SUPPLY_TYPES.map((supply) => {
          const totals = plan.supplies[supply]
          const meta = SUPPLY_META[supply]
          const Icon = SUPPLY_ICON[supply]
          return (
            <div key={supply}>
              <div className="mb-1 flex items-center gap-1.5">
                <Icon size={11} aria-hidden style={{ color: meta.color }} />
                <span className="text-[9.5px] text-mist-300">{meta.label}</span>
                <span className="num ml-auto text-[9.5px] text-mist-200">
                  {formatPct(totals.coverage, 0)}
                </span>
              </div>
              <ProgressBar
                value={totals.coverage}
                label={`${meta.label} coverage`}
                tone={SUPPLY_TONE[supply]}
                heightClass="h-[4px]"
              />
              <div className="mt-0.5 flex justify-between font-mono text-[7.5px] text-mist-600">
                <span>
                  {formatNumber(totals.allocated)} allocated · {formatNumber(totals.remainingStock)} in reserve
                </span>
                <span>{formatNumber(totals.unmet)} unmet</span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-line/70 pt-2.5">
        <Badge tone="teal">{STRATEGY_META[strategy].shortLabel}</Badge>
        <Badge tone="neutral">{priority}% vulnerability priority</Badge>
        <span className="ml-auto inline-flex items-center gap-1 font-mono text-[8px] uppercase tracking-[0.06em] text-mist-600">
          <Truck size={10} aria-hidden />
          {plan.totals.vehiclesUsed}/{plan.totals.vehiclesAvailable} vehicles
        </span>
      </div>
    </div>
  )
}
```

---

## `src/components/analysis/AnalysisTabs.tsx`

```tsx
import { cn } from '../../lib/cn'
import type { AnalysisTab } from '../../types'

const TABS: Array<{ id: AnalysisTab; label: string }> = [
  { id: 'plan', label: 'Plan' },
  { id: 'compare', label: 'Compare' },
  { id: 'explain', label: 'Explain' },
]

interface AnalysisTabsProps {
  tab: AnalysisTab
  onChange: (tab: AnalysisTab) => void
  idPrefix: string
  className?: string
}

export function AnalysisTabs({ tab, onChange, idPrefix, className }: AnalysisTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Analysis views"
      className={cn('flex border-b border-line/70', className)}
    >
      {TABS.map((entry) => {
        const active = tab === entry.id
        return (
          <button
            key={entry.id}
            id={`${idPrefix}-tab-${entry.id}`}
            role="tab"
            type="button"
            aria-selected={active}
            aria-controls={`${idPrefix}-panel-${entry.id}`}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(entry.id)}
            onKeyDown={(event) => {
              if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return
              event.preventDefault()
              const currentIndex = TABS.findIndex((candidate) => candidate.id === tab)
              const delta = event.key === 'ArrowRight' ? 1 : -1
              const nextIndex = (currentIndex + delta + TABS.length) % TABS.length
              onChange(TABS[nextIndex].id)
              const target = document.getElementById(`${idPrefix}-tab-${TABS[nextIndex].id}`)
              target?.focus()
            }}
            className={cn(
              'relative flex-1 pb-2 pt-1 text-[10.5px] font-medium transition-colors',
              active ? 'text-mist-50' : 'text-mist-500 hover:text-mist-200',
            )}
          >
            {entry.label}
            {active ? (
              <span
                aria-hidden
                className="absolute inset-x-1 -bottom-px h-[2px] rounded-full bg-signal shadow-[0_0_8px_rgba(45,212,191,0.65)]"
              />
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
```

---

## `src/components/analysis/BottleneckList.tsx`

```tsx
import { Info, TriangleAlert, XCircle } from 'lucide-react'
import type { PlanBottleneck } from '../../types'
import { cn } from '../../lib/cn'
import { EmptyState } from '../ui/EmptyState'

const SEVERITY_META = {
  critical: {
    icon: XCircle,
    iconClass: 'text-critical',
    border: 'border-critical/20 bg-critical/[0.045]',
    label: 'Critical',
  },
  warning: {
    icon: TriangleAlert,
    iconClass: 'text-warn',
    border: 'border-warn/15 bg-warn/[0.035]',
    label: 'Constraint',
  },
  info: {
    icon: Info,
    iconClass: 'text-mist-400',
    border: 'border-line/70 bg-night-950/25',
    label: 'Note',
  },
} as const

export function BottleneckList({ bottlenecks }: { bottlenecks: PlanBottleneck[] }) {
  if (bottlenecks.length === 0) {
    return (
      <EmptyState
        compact
        title="No binding constraints"
        description="The allocator found enough stock, routes and fleet capacity for this plan."
      />
    )
  }

  return (
    <div className="space-y-1.5">
      {bottlenecks.map((bottleneck) => {
        const meta = SEVERITY_META[bottleneck.severity]
        const Icon = meta.icon
        return (
          <div
            key={bottleneck.id}
            className={cn('flex gap-2 rounded-md border p-2', meta.border)}
          >
            <Icon size={12} aria-hidden className={cn('mt-px shrink-0', meta.iconClass)} />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className="text-[10px] font-medium leading-tight text-mist-200">{bottleneck.title}</p>
                {bottleneck.value ? (
                  <span className="num shrink-0 font-mono text-[8px] text-mist-500">{bottleneck.value}</span>
                ) : null}
              </div>
              <p className="mt-0.5 text-[9px] leading-relaxed text-mist-500">{bottleneck.detail}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
```

---

## `src/components/analysis/ComparisonTable.tsx`

```tsx
import { STRATEGY_META, STRATEGY_ORDER } from '../../lib/constants'
import { formatDecimal, formatNumber, formatPct } from '../../lib/format'
import { cn } from '../../lib/cn'
import type { Plan, StrategyId } from '../../types'
import { InfoNote } from '../ui/InfoNote'

interface ComparisonTableProps {
  comparisons: Record<StrategyId, Plan>
  active: StrategyId
  onSelect?: (strategy: StrategyId) => void
}

export function ComparisonTable({ comparisons, active, onSelect }: ComparisonTableProps) {
  const rows: Array<{
    label: string
    hint: string
    value: (plan: Plan) => string
    emphasis?: boolean
  }> = [
    {
      label: 'Demand coverage',
      hint: 'Allocated units ÷ requested units.',
      value: (plan) => formatPct(plan.totals.coverage, 1),
    },
    {
      label: 'Priority-weighted unmet',
      hint: 'Unmet units × urgency (1–5) × vulnerability factor (0.6–1.0).',
      value: (plan) => formatNumber(plan.totals.priorityWeightedUnmet),
    },
    {
      label: 'Route distance',
      hint: 'Loaded out + empty return kilometres across every planned run on the current road graph.',
      value: (plan) => `${formatDecimal(plan.totals.routeDistanceKm)} km`,
    },
    {
      label: 'Vehicle-hours',
      hint: 'Route distance at each vehicle speed + 0.25 h handling per run.',
      value: (plan) => `${formatDecimal(plan.totals.vehicleHours)} h`,
    },
    {
      label: 'Reachable wards',
      hint: 'Wards with at least one open route to a depot in the current graph.',
      value: (plan) => `${plan.totals.reachableWards} / ${plan.totals.reachableWards + plan.totals.unreachableWards}`,
    },
    {
      label: 'Coverage equity',
      hint: '100 minus the percentage-point gap between the best- and worst-covered ward.',
      value: (plan) =>
        plan.totals.fairness === null ? '—' : `${formatDecimal(plan.totals.fairness)} / 100`,
      emphasis: true,
    },
  ]

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">
            Strategy comparison. All values are computed by the implemented allocator and router from
            the currently displayed simulated scenario.
          </caption>
          <thead>
            <tr>
              <th scope="col" className="w-[34%] pb-1.5 pr-1 text-left font-normal">
                <span className="font-mono text-[7.5px] uppercase tracking-[0.1em] text-mist-600">
                  Metric
                </span>
              </th>
              {STRATEGY_ORDER.map((strategy) => (
                <th
                  key={strategy}
                  scope="col"
                  className={cn(
                    'px-1 pb-1.5 text-right font-normal',
                    strategy === active ? 'text-mist-100' : 'text-mist-400',
                  )}
                >
                  <span className="block truncate font-mono text-[7.5px] uppercase tracking-[0.06em]">
                    {STRATEGY_META[strategy].shortLabel === 'Population'
                      ? 'Pop.'
                      : STRATEGY_META[strategy].shortLabel === 'Nearest-first'
                        ? 'Nearest'
                        : 'Optimizer'}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-t border-line/60">
                <th scope="row" className="py-1.5 pr-1 text-left font-normal">
                  <span
                    className="text-[9px] leading-tight text-mist-400"
                    title={row.hint}
                  >
                    {row.label}
                  </span>
                </th>
                {STRATEGY_ORDER.map((strategy) => (
                  <td
                    key={strategy}
                    title={row.hint}
                    onClick={onSelect ? () => onSelect(strategy) : undefined}
                    className={cn(
                      'px-1 py-1.5 text-right align-top',
                      onSelect ? 'cursor-pointer' : '',
                      strategy === active && 'bg-signal/[0.045]',
                    )}
                  >
                    <span
                      className={cn(
                        'num text-[9.5px] leading-tight',
                        row.emphasis ? 'text-[#f6c97f]' : 'text-mist-200',
                      )}
                    >
                      {row.value(comparisons[strategy])}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <InfoNote className="mt-2" tone="teal">
        <span className="font-medium text-[#c7efe9]">Coverage equity</span> is 100 minus the
        percentage-point gap between the best- and worst-covered ward. It is a chosen model objective
        that rewards even coverage — not an objective measure of real-world fairness.
      </InfoNote>

      <p className="mt-1.5 font-mono text-[8px] uppercase leading-relaxed tracking-[0.06em] text-mist-600">
        Computed by the implemented allocator · deterministic · not validated performance
      </p>
    </div>
  )
}
```

---

## `src/components/analysis/EngineMetrics.tsx`

```tsx
import { Route, Truck, Warehouse } from 'lucide-react'
import { SUPPLY_META, SUPPLY_TYPES } from '../../lib/constants'
import { formatDecimal, formatNumber, formatPct } from '../../lib/format'
import { PRIORITY_WEIGHT_FORMULA } from '../../lib/priority'
import { cn } from '../../lib/cn'
import type { Plan, Scenario, UnservedReason } from '../../types'

const REASON_LABEL: Record<UnservedReason, string> = {
  unreachable: 'Unreachable',
  stock: 'Stock short',
  fleet: 'Transport short',
}

export function EngineMetrics({ plan, scenario }: { plan: Plan; scenario: Scenario }) {
  const metrics = plan.metrics
  const unreachable = metrics.reachability.filter((entry) => !entry.reachable)
  const offeredPct = metrics.fleetCapacityOffered > 0 ? metrics.fleetCapacityUsage * 100 : 0

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        {[
          {
            label: 'Route distance',
            value: `${formatDecimal(metrics.routeDistanceKm)} km`,
            hint: 'Loaded out + empty return across every planned run.',
          },
          {
            label: 'Route time',
            value: `${formatDecimal(metrics.routeTimeHours)} h`,
            hint: 'Run time at each vehicle’s speed plus 0.25 h handling per run.',
          },
          {
            label: 'Fleet freight used',
            value: `${formatNumber(metrics.fleetCapacityMoved)} / ${formatNumber(metrics.fleetCapacityOffered)}`,
            hint: `${formatPct(offeredPct / 100, 0)} of available capacity × run budget.`,
          },
          {
            label: 'Reachable wards',
            value: `${metrics.reachableWards} / ${metrics.reachability.length}`,
            hint: 'Wards with at least one open route to a depot.',
          },
        ].map((item) => (
          <div
            key={item.label}
            title={item.hint}
            className="rounded border border-line/70 bg-night-950/35 px-2 py-1.5"
          >
            <div className="font-mono text-[7px] uppercase tracking-[0.08em] text-mist-600">
              {item.label}
            </div>
            <div className="num mt-1 text-[12px] font-medium leading-none text-mist-100">
              {item.value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <div>
          <div className="mb-1 flex items-center gap-1 label-tiny">
            <Warehouse size={9} aria-hidden /> Depot stock remaining
          </div>
          <table className="w-full border-collapse text-left">
            <caption className="sr-only">Remaining stock per depot and supply type.</caption>
            <thead>
              <tr className="border-b border-line/60">
                <th scope="col" className="py-1 pr-1 font-mono text-[7px] uppercase tracking-[0.08em] text-mist-600">
                  Depot
                </th>
                {SUPPLY_TYPES.map((supply) => (
                  <th
                    key={supply}
                    scope="col"
                    className="px-1 py-1 text-right font-mono text-[7px] uppercase tracking-[0.08em] text-mist-600"
                  >
                    {SUPPLY_META[supply].shortLabel}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {metrics.depotInventory.map((entry) => {
                const depot = scenario.depots.find((candidate) => candidate.id === entry.depotId)
                return (
                  <tr key={entry.depotId} className="border-b border-line/35 last:border-b-0">
                    <th scope="row" className="py-1 pr-1 text-left text-[8.5px] font-normal text-mist-300">
                      {depot ? `${depot.code} · ${depot.shortName}` : entry.depotId}
                    </th>
                    {SUPPLY_TYPES.map((supply) => (
                      <td key={supply} className="num px-1 py-1 text-right text-[8.5px] text-mist-300">
                        {formatNumber(entry.remaining[supply])}
                        <span className="text-mist-600"> / {formatNumber(entry.openingStock[supply])}</span>
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-1 label-tiny">
            <Truck size={9} aria-hidden /> Unserved units by cause
          </div>
          <div className="grid grid-cols-3 gap-1">
            {(Object.keys(REASON_LABEL) as UnservedReason[]).map((reason) => (
              <div
                key={reason}
                className={cn(
                  'rounded border px-1.5 py-1',
                  reason === 'unreachable'
                    ? 'border-critical/25 bg-critical/[0.05]'
                    : 'border-line/60 bg-night-950/25',
                )}
              >
                <div className="font-mono text-[6.5px] uppercase tracking-[0.06em] text-mist-600">
                  {REASON_LABEL[reason]}
                </div>
                <div className="num mt-0.5 text-[10px] text-mist-200">
                  {formatNumber(metrics.unservedByReason[reason])}
                </div>
              </div>
            ))}
          </div>
          {unreachable.length > 0 ? (
            <p className="rounded border border-critical/20 bg-critical/[0.045] px-2 py-1 text-[8.5px] leading-relaxed text-[#f3b4b4]">
              No route: {unreachable
                .map((entry) => scenario.wards.find((ward) => ward.id === entry.wardId)?.shortName ?? entry.wardId)
                .join(', ')}
            </p>
          ) : null}
          <p className="flex items-start gap-1 rounded border border-line/60 bg-night-950/25 px-2 py-1 text-[8px] leading-relaxed text-mist-500">
            <Route size={9} aria-hidden className="mt-[2px] shrink-0 text-mist-600" />
            <span>
              Priority-weighted unmet uses <span className="text-mist-300">{PRIORITY_WEIGHT_FORMULA}</span>.
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}
```

---

## `src/components/analysis/PlanChangeSummary.tsx`

```tsx
import { ArrowRight, GitCompare, Minus, Plus, Repeat, TriangleAlert } from 'lucide-react'
import type { ReactNode } from 'react'
import { SUPPLY_META } from '../../lib/constants'
import { formatNumber } from '../../lib/format'
import { diffPlans, type PlanChangeKind } from '../../lib/planDiff'
import { cn } from '../../lib/cn'
import type { Plan, Scenario } from '../../types'
import { Badge } from '../ui/Badge'

const KIND_META: Record<
  PlanChangeKind,
  { label: string; tone: 'teal' | 'amber' | 'red' | 'sky'; icon: ReactNode }
> = {
  added: { label: 'Added', tone: 'teal', icon: <Plus size={9} aria-hidden /> },
  increased: { label: 'Increased', tone: 'teal', icon: <Plus size={9} aria-hidden /> },
  reduced: { label: 'Reduced', tone: 'amber', icon: <Minus size={9} aria-hidden /> },
  removed: { label: 'Removed', tone: 'red', icon: <TriangleAlert size={9} aria-hidden /> },
  rerouted: { label: 'Rerouted', tone: 'sky', icon: <Repeat size={9} aria-hidden /> },
}

interface PlanChangeSummaryProps {
  previous: Plan | null
  current: Plan
  scenario: Scenario
  limit?: number
  className?: string
}

export function PlanChangeSummary({
  previous,
  current,
  scenario,
  limit = 6,
  className,
}: PlanChangeSummaryProps) {
  const diff = diffPlans(previous, current)
  const changes = diff.changes.slice(0, limit)

  if (!diff.hasPrevious) {
    return (
      <p className={cn('rounded border border-dashed border-line/70 px-2 py-2 text-[9px] leading-relaxed text-mist-500', className)}>
        No previous plan revision is stored yet. Applying a change stores the current plan so the next
        recalculation can be compared against it.
      </p>
    )
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex flex-wrap items-center gap-1">
        <Badge tone="teal">+{diff.counts.added + diff.counts.increased} up</Badge>
        <Badge tone="amber">{diff.counts.reduced} down</Badge>
        <Badge tone="red">{diff.counts.removed} removed</Badge>
        <Badge tone="sky">{diff.counts.rerouted} rerouted</Badge>
      </div>

      <ul className="space-y-1">
        {diff.summary.slice(0, 3).map((line) => (
          <li key={line} className="flex gap-1.5 text-[9px] leading-relaxed text-mist-400">
            <ArrowRight size={9} aria-hidden className="mt-[3px] shrink-0 text-mist-600" />
            <span>{line}</span>
          </li>
        ))}
      </ul>

      {changes.length === 0 ? (
        <p className="rounded border border-line/60 bg-night-950/25 px-2 py-1.5 text-[9px] text-mist-500">
          No allocation changed between these revisions.
        </p>
      ) : (
        <ul className="divide-y divide-line/40 rounded border border-line/60 bg-night-950/25">
          {changes.map((change) => {
            const ward = scenario.wards.find((entry) => entry.id === change.wardId)
            const meta = KIND_META[change.kind]
            const delta =
              change.kind === 'rerouted'
                ? 'same units'
                : `${change.deltaUnits > 0 ? '+' : '−'}${formatNumber(Math.abs(change.deltaUnits))}`
            return (
              <li key={change.id} className="px-2 py-1.5">
                <div className="flex items-center gap-1.5">
                  <Badge tone={meta.tone} icon={meta.icon}>
                    {meta.label}
                  </Badge>
                  <span className="min-w-0 flex-1 truncate text-[9.5px] text-mist-200">
                    {ward?.shortName ?? change.wardId}
                    <span className="text-mist-500"> · {SUPPLY_META[change.supply].shortLabel}</span>
                  </span>
                  <span className="num shrink-0 text-[9px] text-mist-300">{delta}</span>
                </div>
                <p className="mt-0.5 pl-0.5 text-[8.5px] leading-relaxed text-mist-500">{change.reason}</p>
              </li>
            )
          })}
        </ul>
      )}

      {diff.changes.length > changes.length ? (
        <p className="flex items-center gap-1 font-mono text-[7.5px] uppercase tracking-[0.06em] text-mist-600">
          <GitCompare size={9} aria-hidden /> {diff.changes.length - changes.length} further allocation
          changes not shown
        </p>
      ) : null}
    </div>
  )
}
```

---

## `src/components/analysis/PlanExplanation.tsx`

```tsx
import { Clock3, Target, TriangleAlert } from 'lucide-react'
import type { ReactNode } from 'react'
import type { PlanExplanation as Explanation } from '../../lib/explain'
import { cn } from '../../lib/cn'
import { Badge } from '../ui/Badge'

function Section({
  title,
  items,
  icon,
  tone = 'default',
}: {
  title: string
  items: string[]
  icon: ReactNode
  tone?: 'default' | 'amber'
}) {
  return (
    <section>
      <div className="mb-1.5 flex items-center gap-1.5">
        <span className={tone === 'amber' ? 'text-warn' : 'text-mist-500'}>{icon}</span>
        <h3 className="label-tiny text-mist-400">{title}</h3>
      </div>
      <ul className="space-y-1.5">
        {items.map((item, index) => (
          <li
            key={`${title}-${index}`}
            className={cn(
              'flex gap-1.5 text-[9.5px] leading-relaxed',
              tone === 'amber' ? 'text-[#e5cfae]' : 'text-mist-300',
            )}
          >
            <span
              aria-hidden
              className={cn(
                'mt-[5px] h-1 w-1 shrink-0 rounded-full',
                tone === 'amber' ? 'bg-warn/70' : 'bg-mist-600',
              )}
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

interface PlanExplanationProps {
  explanation: Explanation
  wardName: string
  strategyLabel: string
  priority: number
}

export function PlanExplanation({
  explanation,
  wardName,
  strategyLabel,
  priority,
}: PlanExplanationProps) {
  return (
    <div className="space-y-3">
      <div className="rounded-md border border-signal/20 bg-signal/[0.045] p-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className="label-micro text-[#83ded4]">Explain this plan</span>
          <Badge tone="neutral">Template logic</Badge>
        </div>
        <p className="mt-1.5 text-[11px] font-medium leading-relaxed text-mist-100">
          {explanation.headline}
        </p>
        <p className="mt-1 font-mono text-[8px] uppercase tracking-[0.05em] text-mist-500">
          {wardName} · {strategyLabel} · {priority}% vulnerability priority
        </p>
      </div>

      <Section title="Why this allocation" items={explanation.rationale} icon={<Target size={12} aria-hidden />} />
      <Section
        title="Remaining unmet demand"
        items={explanation.unmet}
        icon={<TriangleAlert size={12} aria-hidden />}
        tone="amber"
      />
      <Section
        title="Constraints considered"
        items={explanation.constraints}
        icon={<TriangleAlert size={12} aria-hidden />}
      />
      <Section
        title="Changes since previous plan"
        items={explanation.changes}
        icon={<Clock3 size={12} aria-hidden />}
      />

      <p className="border-t border-line/60 pt-2 text-[8.5px] leading-relaxed text-mist-600">
        Generated from the displayed plan values using fixed templates. No AI model or external
        service is used.
      </p>
    </div>
  )
}
```

---

## `src/components/analysis/StrategyCards.tsx`

```tsx
import { Check } from 'lucide-react'
import { STRATEGY_META, STRATEGY_ORDER } from '../../lib/constants'
import { formatDecimal, formatNumber, formatPct } from '../../lib/format'
import { cn } from '../../lib/cn'
import type { Plan, StrategyId } from '../../types'

interface StrategyCardsProps {
  comparisons: Record<StrategyId, Plan>
  active: StrategyId
  onSelect: (strategy: StrategyId) => void
  className?: string
}

export function StrategyCards({ comparisons, active, onSelect, className }: StrategyCardsProps) {
  return (
    <div className={cn('grid grid-cols-3 gap-1.5', className)}>
      {STRATEGY_ORDER.map((strategy) => {
        const plan = comparisons[strategy]
        const meta = STRATEGY_META[strategy]
        const selected = strategy === active
        const equity = plan.totals.fairness
        return (
          <button
            key={strategy}
            type="button"
            aria-pressed={selected}
            onClick={() => onSelect(strategy)}
            title={`${meta.label} — ${meta.description}`}
            className={cn(
              'group relative min-w-0 rounded-md border p-2 text-left transition-colors duration-150',
              selected
                ? 'border-signal/45 bg-signal/[0.065]'
                : 'border-line/80 bg-night-950/30 hover:border-line hover:bg-white/[0.035]',
            )}
          >
            <div className="flex items-start justify-between gap-1">
              <span
                className={cn(
                  'font-mono text-[7.5px] uppercase leading-tight tracking-[0.09em]',
                  selected ? 'text-signal-bright' : 'text-mist-500',
                )}
              >
                {meta.microLabel}
              </span>
              {selected ? (
                <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-signal/20 text-signal-bright">
                  <Check size={8} strokeWidth={3} aria-hidden />
                </span>
              ) : null}
            </div>
            <div className="mt-1 truncate text-[10px] font-medium text-mist-100">{meta.shortLabel}</div>
            <div className="num mt-1.5 text-[17px] font-medium leading-none text-mist-50">
              {formatPct(plan.totals.coverage, 0)}
            </div>
            <div className="mt-0.5 font-mono text-[7px] uppercase tracking-[0.08em] text-mist-600">
              coverage
            </div>
            <div className="mt-2 space-y-0.5 border-t border-line/60 pt-1.5 font-mono text-[7.5px] leading-tight text-mist-500">
              <div className="flex justify-between gap-1">
                <span>p-unmet</span>
                <span className="text-mist-300">{formatNumber(plan.totals.priorityWeightedUnmet)}</span>
              </div>
              <div className="flex justify-between gap-1">
                <span>equity</span>
                <span className="text-mist-300">
                  {equity === null ? '—' : formatDecimal(equity)}
                </span>
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
```

---

## `src/components/analysis/WardDetail.tsx`

```tsx
import { ArrowUpRight, BriefcaseMedical, Droplets, Package, X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { SUPPLY_META, SUPPLY_TYPES, URGENCY_META } from '../../lib/constants'
import { formatNumber, formatPct } from '../../lib/format'
import { cn } from '../../lib/cn'
import type { Plan, Scenario, SupplyType, Ward, WardPlan } from '../../types'
import { Badge } from '../ui/Badge'
import { ProgressBar, type ProgressTone } from '../ui/ProgressBar'

const SUPPLY_ICON: Record<SupplyType, LucideIcon> = {
  water: Droplets,
  medical: BriefcaseMedical,
  food: Package,
}

const SUPPLY_TONE: Record<SupplyType, ProgressTone> = {
  water: 'sky',
  medical: 'violet',
  food: 'amber',
}

interface WardDetailProps {
  ward: Ward
  wardPlan: WardPlan
  scenario: Scenario
  plan: Plan
  compact?: boolean
  onClose?: () => void
  onExplain?: () => void
  className?: string
}

export function WardDetail({
  ward,
  wardPlan,
  scenario,
  plan,
  compact = false,
  onClose,
  onExplain,
  className,
}: WardDetailProps) {
  const urgency = URGENCY_META[ward.urgency] ?? URGENCY_META[3]
  const vulnerabilityTone =
    ward.vulnerability.score >= 75 ? 'amber' : ward.vulnerability.score >= 50 ? 'sky' : 'teal'

  const primarySource = SUPPLY_TYPES.map((supply) => wardPlan.bySupply[supply].sourceDepotId).find(
    (id): id is NonNullable<typeof id> => Boolean(id),
  )
  const sourceDepot = primarySource ? scenario.depots.find((depot) => depot.id === primarySource) : null
  const primaryDistance = SUPPLY_TYPES.map((supply) => wardPlan.bySupply[supply].route?.distanceKm).find(
    (distance): distance is number => typeof distance === 'number',
  )

  return (
    <div className={cn('min-w-0', compact ? 'p-2.5' : 'p-3', className)}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="label-tiny">
            {ward.code} · Simulated neighbourhood
          </div>
          <h3 className="mt-1 truncate text-[13px] font-medium tracking-[-0.01em] text-mist-50">
            {ward.name}
          </h3>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded border px-1.5 py-0.5 font-mono text-[8.5px] uppercase tracking-[0.08em]',
              urgency.badgeClass,
            )}
            title={`Urgency ${ward.urgency}/5 — ${urgency.label}`}
          >
            <span aria-hidden className={cn('h-1 w-1 rounded-full', urgency.dotClass)} />
            {urgency.label}
          </span>
          {onClose ? (
            <button
              type="button"
              aria-label="Close neighbourhood detail"
              onClick={onClose}
              className="rounded p-0.5 text-mist-500 transition-colors hover:bg-white/5 hover:text-mist-200"
            >
              <X size={13} aria-hidden />
            </button>
          ) : null}
        </div>
      </div>

      <div className={cn('flex items-end justify-between gap-2', compact ? 'mt-2' : 'mt-2.5')}>
        <div>
          <div className="label-tiny mb-1">Plan coverage</div>
          <div className="num text-[24px] font-medium leading-none text-mist-50">
            {formatPct(wardPlan.coverage, 0)}
          </div>
        </div>
        <div className="text-right text-[9px] leading-relaxed text-mist-500">
          <span className="num text-mist-300">
            {formatNumber(wardPlan.allocatedUnits)} / {formatNumber(wardPlan.demandUnits)}
          </span>{' '}
          units
          <br />
          {wardPlan.unmetUnits > 0 ? (
            <span className="num text-[#f6c97f]">{formatNumber(wardPlan.unmetUnits)} unmet</span>
          ) : (
            <span className="text-signal">all requests covered</span>
          )}
        </div>
      </div>
      <ProgressBar
        value={wardPlan.coverage}
        label={`${ward.shortName} plan coverage`}
        tone={wardPlan.coverage < 0.5 ? 'amber' : 'teal'}
        className="mt-1.5"
        heightClass="h-[5px]"
      />

      <div className={cn('mt-2.5 space-y-2 border-t border-line/70 pt-2.5')}>
        {SUPPLY_TYPES.map((supply) => {
          const entry = wardPlan.bySupply[supply]
          const meta = SUPPLY_META[supply]
          const Icon = SUPPLY_ICON[supply]
          const source = scenario.depots.find((depot) => depot.id === entry.sourceDepotId)
          return (
            <div key={supply}>
              <div className="flex items-center gap-1.5">
                <Icon size={11} aria-hidden style={{ color: meta.color }} />
                <span className="text-[9.5px] text-mist-300">{meta.shortLabel}</span>
                <span className="num ml-auto text-[9.5px] text-mist-200">
                  {formatNumber(entry.allocated)}
                  <span className="text-mist-500"> / {formatNumber(entry.demand)}</span>
                </span>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <ProgressBar
                  value={entry.demand > 0 ? entry.allocated / entry.demand : 0}
                  label={`${meta.shortLabel} allocation for ${ward.shortName}`}
                  tone={SUPPLY_TONE[supply]}
                  heightClass="h-[3px]"
                  className="flex-1"
                />
                <span className="w-[58px] shrink-0 truncate text-right font-mono text-[7.5px] leading-none text-mist-500">
                  {source ? `${source.code} · ${entry.route ? `${entry.route.distanceKm.toFixed(1)} km` : 'no route'}` : 'no source'}
                </span>
              </div>
              {entry.unmet > 0 ? (
                <div className="mt-0.5 text-right font-mono text-[8px] text-[#e8bd7a]">
                  {formatNumber(entry.unmet)} unmet
                </div>
              ) : null}
            </div>
          )
        })}
      </div>

      <div className="mt-2.5 flex items-start justify-between gap-2 border-t border-line/70 pt-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="label-tiny">Vulnerability</span>
            <span className="num text-[10px] text-[#e8c98f]">{ward.vulnerability.score}/100</span>
          </div>
          <div className="mt-1 flex flex-wrap gap-1">
            {[
              ['Elderly', ward.vulnerability.elderlyPct],
              ['Children', ward.vulnerability.childrenPct],
              ['Disability', ward.vulnerability.disabilityPct],
              ['Informal housing', ward.vulnerability.informalHousingPct],
            ].map(([label, value]) => (
              <span
                key={String(label)}
                className="inline-flex items-center gap-1 rounded border border-line/80 bg-night-950/50 px-1.5 py-0.5 text-[8px] text-mist-400"
                title={`${label}: ${value}% of residents (simulated indicator)`}
              >
                {label} <b className="num font-normal text-mist-200">{value}%</b>
              </span>
            ))}
          </div>
        </div>
        {!compact ? (
          <Badge tone={vulnerabilityTone} className="mt-0.5 shrink-0">
            score {ward.vulnerability.score}
          </Badge>
        ) : null}
      </div>

      {!compact ? (
        <div className="mt-2 flex items-center justify-between gap-2 text-[9px] text-mist-500">
          <span>
            Pop. <span className="num text-mist-300">{formatNumber(ward.population)}</span> ·{' '}
            {formatNumber(ward.households)} households
          </span>
          {sourceDepot ? (
            <span className="truncate">
              via {sourceDepot.code}
              {primaryDistance ? ` · ${primaryDistance.toFixed(1)} km` : ''}
            </span>
          ) : null}
        </div>
      ) : (
        <div className="mt-1.5 text-[8.5px] text-mist-600">
          {sourceDepot ? `Primary source: ${sourceDepot.name}` : 'No depot currently assigned'}
        </div>
      )}

      {!compact ? <p className="mt-2 text-[9.5px] leading-relaxed text-mist-500">{ward.note}</p> : null}

      {onExplain ? (
        <button
          type="button"
          onClick={onExplain}
          className="mt-2.5 flex w-full items-center justify-between rounded-md border border-signal/20 bg-signal/[0.045] px-2 py-1.5 text-left text-[10px] font-medium text-[#a9e9e0] transition-colors hover:bg-signal/[0.09]"
        >
          Explain this allocation
          <ArrowUpRight size={12} aria-hidden />
        </button>
      ) : null}

      {plan.totals.affectedWards >= plan.wards.length && wardPlan.unmetUnits > 0 ? (
        <p className="mt-2 font-mono text-[8px] uppercase tracking-[0.08em] text-mist-600">
          All wards currently carry unmet demand in this plan
        </p>
      ) : null}
    </div>
  )
}
```

---

## `src/components/charts/CoverageChart.tsx`

```tsx
import { SUPPLY_META, SUPPLY_TYPES, URGENCY_META } from '../../lib/constants'
import { formatNumber, formatPct } from '../../lib/format'
import { cn } from '../../lib/cn'
import type { Plan, Scenario, SupplyType, WardId } from '../../types'
import { Badge } from '../ui/Badge'
import { Panel } from '../ui/Panel'

interface CoverageChartProps {
  scenario: Scenario
  plan: Plan
  selectedWardId: WardId | null
  onSelectWard: (wardId: WardId) => void
}

const UNMET_STYLE = {
  backgroundImage:
    'repeating-linear-gradient(135deg, rgba(167, 187, 207, 0.2) 0px, rgba(167, 187, 207, 0.2) 2px, transparent 2px, transparent 5px)',
}

export function CoverageChart({ scenario, plan, selectedWardId, onSelectWard }: CoverageChartProps) {
  return (
    <Panel
      kicker="Allocation chart"
      title="Coverage by neighbourhood"
      action={<Badge tone="teal">Computed</Badge>}
      className="h-full"
      bodyClassName="flex h-[calc(100%-46px)] flex-col p-3"
    >
      <div className="flex-1 space-y-0.5">
        {scenario.wards.map((ward) => {
          const wardPlan = plan.wards.find((entry) => entry.wardId === ward.id)
          if (!wardPlan) return null
          const total = Math.max(1, wardPlan.demandUnits)
          const urgency = URGENCY_META[ward.urgency] ?? URGENCY_META[3]
          const selected = selectedWardId === ward.id
          const segments = SUPPLY_TYPES.map((supply) => ({
            supply,
            width: (wardPlan.allocated[supply] / total) * 100,
          }))
          const unmetWidth = (wardPlan.unmetUnits / total) * 100
          return (
            <button
              key={ward.id}
              type="button"
              onClick={() => onSelectWard(ward.id)}
              aria-pressed={selected}
              aria-label={`${ward.name}: ${formatPct(wardPlan.coverage, 0)} coverage, ${formatNumber(
                wardPlan.allocatedUnits,
              )} of ${formatNumber(wardPlan.demandUnits)} units allocated, ${formatNumber(
                wardPlan.unmetUnits,
              )} unmet.`}
              title={`${ward.name} — ${formatNumber(wardPlan.allocatedUnits)} allocated / ${formatNumber(
                wardPlan.demandUnits,
              )} requested · ${urgency.label} urgency`}
              className={cn(
                'group grid w-full grid-cols-[88px_1fr_42px] items-center gap-2 rounded px-1 py-[5px] text-left transition-colors sm:grid-cols-[112px_1fr_48px]',
                selected ? 'bg-signal/[0.055]' : 'hover:bg-white/[0.03]',
              )}
            >
              <span className="flex min-w-0 items-center gap-1.5">
                <span
                  aria-hidden
                  className={cn('h-1 w-1 shrink-0 rounded-full', urgency.dotClass)}
                />
                <span className="truncate text-[9.5px] font-medium text-mist-300">
                  <span className="font-mono text-[8px] text-mist-500">{ward.code}</span>{' '}
                  {ward.shortName}
                </span>
              </span>

              <span
                className="flex h-[11px] w-full overflow-hidden rounded-[2px] border border-night-950/50 bg-[#152a3c]"
                aria-hidden
              >
                {segments.map((segment) => (
                  <span
                    key={segment.supply}
                    style={{
                      width: `${segment.width}%`,
                      background: SUPPLY_META[segment.supply as SupplyType].color,
                      opacity: 0.78,
                    }}
                  />
                ))}
                <span style={{ width: `${unmetWidth}%`, ...UNMET_STYLE, opacity: 0.8 }} />
              </span>

              <span
                className={cn(
                  'num text-right text-[9.5px]',
                  selected ? 'text-signal-bright' : 'text-mist-300',
                )}
              >
                {formatPct(wardPlan.coverage, 0)}
              </span>
            </button>
          )
        })}
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-line/60 pt-2">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
          {SUPPLY_TYPES.map((supply) => (
            <span key={supply} className="inline-flex items-center gap-1 text-[8px] text-mist-500">
              <span
                aria-hidden
                className="h-1.5 w-1.5 rounded-[1px]"
                style={{ background: SUPPLY_META[supply].color, opacity: 0.85 }}
              />
              {SUPPLY_META[supply].shortLabel}
            </span>
          ))}
          <span className="inline-flex items-center gap-1 text-[8px] text-mist-500">
            <span
              aria-hidden
              className="h-1.5 w-1.5 rounded-[1px] border border-mist-600"
              style={UNMET_STYLE}
            />
            Unmet
          </span>
        </div>
        <span className="font-mono text-[7.5px] uppercase tracking-[0.06em] text-mist-600">
          Bar = 100% of ward demand
        </span>
      </div>
    </Panel>
  )
}
```

---

## `src/components/events/EventList.tsx`

```tsx
import {
  Layers,
  Radio,
  RefreshCw,
  RotateCcw,
  Route,
  SlidersHorizontal,
  type LucideIcon,
} from 'lucide-react'
import { formatRelative, formatShortTime } from '../../lib/format'
import { cn } from '../../lib/cn'
import { useNow } from '../../lib/useNow'
import type { SimEvent, SimEventKind } from '../../types'
import { EmptyState } from '../ui/EmptyState'

const KIND_META: Record<SimEventKind, { icon: LucideIcon; className: string; label: string }> = {
  scenario: { icon: Layers, className: 'text-info border-info/25 bg-info/[0.07]', label: 'Scenario' },
  road: { icon: Route, className: 'text-warn border-warn/25 bg-warn/[0.07]', label: 'Road' },
  plan: { icon: RefreshCw, className: 'text-signal border-signal/25 bg-signal/[0.07]', label: 'Plan' },
  edit: {
    icon: SlidersHorizontal,
    className: 'text-plum border-plum/25 bg-plum/[0.07]',
    label: 'Input',
  },
  reset: { icon: RotateCcw, className: 'text-mist-300 border-line bg-white/[0.04]', label: 'Reset' },
  system: { icon: Radio, className: 'text-mist-300 border-line bg-white/[0.04]', label: 'System' },
}

interface EventListProps {
  events: SimEvent[]
  limit?: number
  emptyTitle?: string
  emptyDescription?: string
  dense?: boolean
  className?: string
}

export function EventList({
  events,
  limit = 20,
  emptyTitle = 'No events yet',
  emptyDescription = 'Recalculating the plan or changing a road adds an entry here.',
  dense = false,
  className,
}: EventListProps) {
  const now = useNow(30000)
  const visible = events.slice(0, limit)

  if (visible.length === 0) {
    return <EmptyState compact title={emptyTitle} description={emptyDescription} />
  }

  return (
    <ul className={cn('relative', className)}>
      {visible.map((event, index) => {
        const meta = KIND_META[event.kind]
        const Icon = meta.icon
        return (
          <li key={event.id} className="relative flex gap-2.5">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border',
                  meta.className,
                )}
              >
                <Icon size={10.5} strokeWidth={1.9} aria-hidden />
              </span>
              {index < visible.length - 1 ? (
                <span className="my-0.5 w-px flex-1 bg-line/80" aria-hidden />
              ) : null}
            </div>
            <div className={cn('min-w-0 flex-1', dense ? 'pb-2.5' : 'pb-3')}>
              <div className="flex items-start justify-between gap-2">
                <p className="text-[10.5px] font-medium leading-snug text-mist-200">{event.title}</p>
                <time
                  dateTime={new Date(event.at).toISOString()}
                  title={`${formatShortTime(event.at)} · simulated event`}
                  className="num shrink-0 pt-px text-[8.5px] text-mist-600"
                >
                  {formatRelative(event.at, now)}
                </time>
              </div>
              <p className="mt-0.5 text-[9.5px] leading-relaxed text-mist-500">{event.detail}</p>
              <span className="sr-only">{meta.label} event</span>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
```

---

## `src/components/layout/BottomStrip.tsx`

```tsx
import { AlertTriangle, PackageSearch, Truck, Users, Waves } from 'lucide-react'
import { formatNumber, formatPct } from '../../lib/format'
import { useSimulation } from '../../state/SimulationContext'
import { ProgressBar } from '../ui/ProgressBar'

export function BottomStrip() {
  const { state } = useSimulation()
  const { plan } = state
  const wardCount = state.scenario.wards.length
  const supplyRatio = plan.totals.demand > 0 ? plan.totals.stock / plan.totals.demand : 0
  const urgentWards = plan.wards.filter((ward) => ward.urgency >= 4)
  const urgentDemand = urgentWards.reduce((sum, ward) => sum + ward.demandUnits, 0)
  const urgentMet = Math.max(0, urgentDemand - plan.totals.unmetUrgent)
  const urgentCoverage = urgentDemand > 0 ? urgentMet / urgentDemand : 0

  const items = [
    {
      label: 'Supply availability',
      value: formatPct(supplyRatio, 0),
      caption: `${formatNumber(plan.totals.stock)} of ${formatNumber(plan.totals.demand)} units stocked`,
      progress: supplyRatio,
      tone: 'teal' as const,
      icon: <Waves size={13} aria-hidden />,
    },
    {
      label: 'Vehicles in use',
      value: `${plan.totals.vehiclesUsed} / ${plan.totals.vehiclesAvailable}`,
      caption: `${plan.totals.trips} planned runs · ${plan.totals.runSlots} slots`,
      progress: plan.totals.fleetUtilisation / 100,
      tone: 'sky' as const,
      icon: <Truck size={13} aria-hidden />,
    },
    {
      label: 'Affected neighbourhoods',
      value: `${plan.totals.affectedWards} / ${wardCount}`,
      caption: `${plan.totals.incompleteWards} with incomplete coverage`,
      progress: plan.totals.affectedWards / Math.max(1, wardCount),
      tone: 'amber' as const,
      icon: <Users size={13} aria-hidden />,
    },
    {
      label: 'Unmet urgent demand',
      value: formatNumber(plan.totals.unmetUrgent),
      caption: `${formatPct(1 - urgentCoverage, 0)} of urgency 4–5 requests unmet`,
      progress: 1 - urgentCoverage,
      tone: plan.totals.unmetUrgent > 0 ? ('amber' as const) : ('teal' as const),
      icon: <AlertTriangle size={13} aria-hidden />,
    },
  ]

  return (
    <footer className="app-bottomstrip hidden h-[62px] shrink-0 items-stretch border-t border-line bg-night-925/90 lg:flex">
      <div className="flex w-[150px] shrink-0 items-center gap-2 border-r border-line px-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-md border border-line bg-night-900 text-mist-400">
          <PackageSearch size={14} aria-hidden />
        </span>
        <div className="leading-tight">
          <div className="label-tiny">Plan state</div>
          <div className="num mt-1 text-[10px] text-mist-200">Plan · rev {state.planRevision}</div>
        </div>
      </div>

      <div className="grid min-w-0 flex-1 grid-cols-4 divide-x divide-line/70">
        {items.map((item) => (
          <div key={item.label} className="flex min-w-0 items-center gap-2.5 px-3">
            <span className="shrink-0 text-mist-500">{item.icon}</span>
            <div className="min-w-0 flex-1">
              <div className="label-tiny truncate">{item.label}</div>
              <div className="mt-1 flex items-baseline gap-2">
                <span
                  className={`num text-[13px] font-medium leading-none ${
                    item.tone === 'amber'
                      ? 'text-[#f6c97f]'
                      : item.tone === 'sky'
                        ? 'text-[#a5e2ff]'
                        : 'text-signal-bright'
                  }`}
                >
                  {item.value}
                </span>
                <span className="truncate text-[8.5px] leading-tight text-mist-500">{item.caption}</span>
              </div>
              <ProgressBar
                value={item.progress}
                label={item.label}
                tone={item.tone}
                heightClass="h-[2px]"
                className="mt-1.5"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="hidden max-w-[205px] shrink-0 items-center gap-2 border-l border-line px-3 xl:flex">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-mist-500" aria-hidden />
        <p className="text-[8.5px] leading-relaxed text-mist-600">
          Deterministic demo output. Not a real dispatch recommendation.
        </p>
      </div>
    </footer>
  )
}
```

---

## `src/components/layout/MobileNav.tsx`

```tsx
import { FileText, LayoutDashboard, Layers, Route, SlidersHorizontal } from 'lucide-react'
import { NAV_ITEMS } from '../../lib/constants'
import { cn } from '../../lib/cn'
import { useSimulation } from '../../state/SimulationContext'
import type { ScreenId } from '../../types'

const NAV_ICONS: Record<ScreenId, typeof LayoutDashboard> = {
  overview: LayoutDashboard,
  lab: SlidersHorizontal,
  network: Route,
  scenarios: Layers,
  reports: FileText,
}

export function MobileNav() {
  const { state, actions } = useSimulation()

  return (
    <nav
      aria-label="Primary"
      className="app-mobilenav fixed inset-x-0 bottom-0 z-40 border-t border-line bg-night-950/95 backdrop-blur-md lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="grid h-[56px] grid-cols-5">
        {NAV_ITEMS.map((item) => {
          const Icon = NAV_ICONS[item.id]
          const active = state.screen === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => actions.navigate(item.id)}
              aria-current={active ? 'page' : undefined}
              aria-label={`${item.label} — ${item.description}`}
              className={cn(
                'relative flex flex-col items-center justify-center gap-1 text-[8.5px] font-medium tracking-[0.01em] transition-colors',
                active ? 'text-signal-bright' : 'text-mist-500 hover:text-mist-200',
              )}
            >
              {active ? (
                <span
                  aria-hidden
                  className="absolute inset-x-5 top-0 h-[2px] rounded-b bg-signal shadow-[0_0_10px_rgba(45,212,191,0.8)]"
                />
              ) : null}
              <Icon size={18} strokeWidth={1.8} aria-hidden />
              {item.navLabel}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
```

---

## `src/components/layout/MobileSheet.tsx`

```tsx
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
```

---

## `src/components/layout/RightPanel.tsx`

```tsx
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
```

---

## `src/components/layout/Sidebar.tsx`

```tsx
import { FileText, LayoutDashboard, Route, ShieldCheck, SlidersHorizontal, Layers } from 'lucide-react'
import { NAV_ITEMS } from '../../lib/constants'
import { cn } from '../../lib/cn'
import { useSimulation } from '../../state/SimulationContext'
import type { ScreenId } from '../../types'

const NAV_ICONS: Record<ScreenId, typeof LayoutDashboard> = {
  overview: LayoutDashboard,
  lab: SlidersHorizontal,
  network: Route,
  scenarios: Layers,
  reports: FileText,
}

export function Sidebar() {
  const { state, actions } = useSimulation()

  return (
    <nav
      aria-label="Primary"
      className="app-sidebar hidden w-[78px] shrink-0 flex-col border-r border-line bg-night-925/55 lg:flex"
    >
      <div className="flex-1 space-y-1 px-2 py-3">
        {NAV_ITEMS.map((item) => {
          const Icon = NAV_ICONS[item.id]
          const active = state.screen === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => actions.navigate(item.id)}
              aria-current={active ? 'page' : undefined}
              aria-label={`${item.label} — ${item.description}`}
              title={`${item.label} — ${item.description}`}
              className={cn(
                'group relative flex w-full flex-col items-center gap-1 rounded-lg px-1 py-2.5 transition-colors duration-150',
                active
                  ? 'bg-signal/[0.08] text-signal-bright'
                  : 'text-mist-500 hover:bg-white/[0.045] hover:text-mist-200',
              )}
            >
              {active ? (
                <span
                  aria-hidden
                  className="absolute left-0 top-1/2 h-6 w-[2px] -translate-y-1/2 rounded-r bg-signal shadow-[0_0_10px_rgba(45,212,191,0.8)]"
                />
              ) : null}
              <Icon size={17} strokeWidth={1.8} aria-hidden />
              <span className="text-center text-[8.5px] font-medium leading-[1.15] tracking-[0.01em]">
                {item.navLabel}
              </span>
            </button>
          )
        })}
      </div>

      <div className="border-t border-line/80 p-2">
        <div
          className="rounded-lg border border-line/80 bg-night-850/60 px-1 py-2 text-center"
          title="All simulation state stays in this browser. No live data."
        >
          <ShieldCheck size={13} className="mx-auto text-signal/70" aria-hidden />
          <div className="mt-1 font-mono text-[7px] uppercase leading-[1.45] tracking-[0.13em] text-mist-500">
            Sim data
            <br />
            local only
          </div>
        </div>
      </div>
    </nav>
  )
}
```

---

## `src/components/layout/TopBar.tsx`

```tsx
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
```

---

## `src/components/map/CommandMap.tsx`

```tsx
import { Loader2, Map as MapIcon, Route, TriangleAlert, Wind } from 'lucide-react'
import { useCallback, useState } from 'react'
import { formatNumber } from '../../lib/format'
import { cn } from '../../lib/cn'
import { useSimulation } from '../../state/SimulationContext'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Segmented } from '../ui/Segmented'
import { LeafletMap } from './LeafletMap'
import { MapLegend } from './MapLegend'
import { RoadPopover } from './RoadPopover'
import { VectorMap } from './VectorMap'

type MapMode = 'tiles' | 'vector'

interface CommandMapProps {
  heightClass?: string
  className?: string
}

export function CommandMap({ heightClass = 'h-[380px] xl:h-[460px]', className }: CommandMapProps) {
  const { state, actions } = useSimulation()
  const [mode, setMode] = useState<MapMode>(() =>
    typeof navigator !== 'undefined' && navigator.onLine === false ? 'vector' : 'tiles',
  )
  const [tilesFailed, setTilesFailed] = useState(false)
  const [tileAttempt, setTileAttempt] = useState(0)
  const [showRoutes, setShowRoutes] = useState(true)

  const selectedRoad = state.scenario.roads.find((road) => road.id === state.selectedRoadId) ?? null

  const handleTileFailure = useCallback(() => {
    setTilesFailed(true)
    setMode('vector')
  }, [])

  const handleModeChange = (next: MapMode) => {
    if (next === 'tiles' && mode !== 'tiles') {
      setTilesFailed(false)
      setTileAttempt((attempt) => attempt + 1)
    }
    setMode(next)
  }

  const retryTiles = () => {
    setTilesFailed(false)
    setMode('tiles')
    setTileAttempt((attempt) => attempt + 1)
  }

  return (
    <section className={cn('panel overflow-hidden', className)}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line/70 px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <MapIcon size={13} aria-hidden className="shrink-0 text-mist-500" />
          <span className="label-micro shrink-0">Operational grid</span>
          <span className="hidden truncate text-[10px] text-mist-400 sm:inline">
            Sagarika District · {state.scenario.wards.length} wards · {state.scenario.depots.length} depots
          </span>
          <Badge tone="neutral" className="hidden md:inline-flex">
            Fictional geography
          </Badge>
        </div>

        <div className="flex items-center gap-1.5">
          <Segmented<MapMode>
            ariaLabel="Map layer"
            size="xs"
            value={mode}
            onChange={handleModeChange}
            options={[
              { value: 'tiles', label: 'OSM tiles', title: 'OpenStreetMap-based dark tiles (requires network)' },
              { value: 'vector', label: 'Offline', title: 'Offline vector network view' },
            ]}
          />
          <button
            type="button"
            aria-pressed={showRoutes}
            onClick={() => setShowRoutes((value) => !value)}
            className={cn(
              'inline-flex h-7 items-center gap-1.5 rounded-md border px-2 font-mono text-[9px] uppercase tracking-[0.06em] transition-colors',
              showRoutes
                ? 'border-signal/30 bg-signal/[0.08] text-signal-bright'
                : 'border-line bg-night-950/60 text-mist-500 hover:text-mist-300',
            )}
            title="Toggle planned delivery-route overlay"
          >
            <Route size={11} aria-hidden />
            Routes
          </button>
        </div>
      </div>

      {tilesFailed ? (
        <div
          role="status"
          className="flex flex-wrap items-center justify-between gap-2 border-b border-warn/20 bg-warn/[0.05] px-3 py-1.5"
        >
          <div className="flex min-w-0 items-center gap-1.5">
            <TriangleAlert size={11} aria-hidden className="shrink-0 text-warn" />
            <p className="text-[9px] leading-snug text-[#e6cfac]">
              OpenStreetMap tiles are unavailable here. Showing the labelled offline vector network.
            </p>
          </div>
          <Button size="xs" variant="secondary" onClick={retryTiles}>
            Retry tiles
          </Button>
        </div>
      ) : null}

      <div className={cn('relative w-full overflow-hidden', heightClass)}>
        {mode === 'tiles' ? (
          <LeafletMap
            key={`tiles-${tileAttempt}`}
            scenario={state.scenario}
            plan={state.plan}
            selectedWardId={state.selectedWardId}
            selectedRoadId={state.selectedRoadId}
            showRoutes={showRoutes}
            onSelectWard={actions.selectWard}
            onSelectRoad={actions.selectRoad}
            onTileFailure={handleTileFailure}
          />
        ) : (
          <VectorMap
            scenario={state.scenario}
            plan={state.plan}
            selectedWardId={state.selectedWardId}
            selectedRoadId={state.selectedRoadId}
            showRoutes={showRoutes}
            onSelectWard={actions.selectWard}
            onSelectRoad={actions.selectRoad}
            onTileFailure={handleTileFailure}
          />
        )}

        <div className="pointer-events-none absolute left-2.5 top-2.5 z-10 hidden max-w-[290px] items-center gap-2 rounded-md border border-line/80 bg-night-950/88 px-2 py-1.5 shadow-lg backdrop-blur-sm xl:flex">
          <Wind size={12} aria-hidden className="shrink-0 text-info" />
          <div className="min-w-0 leading-tight">
            <div className="font-mono text-[7px] uppercase tracking-[0.12em] text-mist-600">
              Simulated conditions
            </div>
            <div className="mt-0.5 truncate text-[9px] text-mist-200">
              {state.scenario.weather.system}
            </div>
          </div>
          <div className="shrink-0 border-l border-line/70 pl-2 font-mono text-[7.5px] leading-tight text-mist-400">
            {state.scenario.weather.windKph} km/h
            <br />
            {state.scenario.weather.rainfallMm} mm
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-7 right-3 z-10 hidden items-center gap-1.5 rounded border border-line/70 bg-night-950/80 px-2 py-1 font-mono text-[7.5px] uppercase tracking-[0.08em] text-mist-500 backdrop-blur-sm md:flex">
          <span className="h-1 w-1 rounded-full bg-signal/80" aria-hidden />
          {state.plan.routes.length} route legs · {formatNumber(state.plan.totals.vehiclesUsed)} vehicles
        </div>

        <MapLegend />

        {selectedRoad ? (
          <RoadPopover
            road={selectedRoad}
            scenario={state.scenario}
            plan={state.plan}
            onChangeState={(next) => actions.setRoadState(selectedRoad.id, next)}
            onClose={() => actions.selectRoad(null)}
          />
        ) : null}

        {state.isRecalculating ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-3 z-30 flex justify-center">
            <div className="flex items-center gap-2 rounded-full border border-signal/25 bg-night-950/92 px-3 py-1.5 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.8)] backdrop-blur">
              <Loader2 size={12} aria-hidden className="animate-spin text-signal" />
              <span className="font-mono text-[8px] uppercase tracking-[0.11em] text-[#a9e9e0]">
                Recomputing routes
              </span>
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line/60 px-3 py-1.5">
        <p className="font-mono text-[7.5px] uppercase leading-relaxed tracking-[0.06em] text-mist-600">
          {mode === 'tiles'
            ? 'Tiles © OpenStreetMap contributors'
            : 'Offline vector network · fictional coordinate system'}
        </p>
        <p className="font-mono text-[7.5px] uppercase leading-relaxed tracking-[0.06em] text-mist-600">
          Click a ward or segment to inspect · simulation only
        </p>
      </div>
    </section>
  )
}
```

---

## `src/components/map/LeafletMap.tsx`

```tsx
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Maximize2, Minus, Plus } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { DEPOT_STYLE, URGENCY_META } from '../../lib/constants'
import { formatNumber } from '../../lib/format'
import { LEAFLET_BOUNDS, MAP_CENTER } from '../../lib/map'
import { buildRouteGeometry } from '../../lib/routing'
import type { Road, Scenario, Ward, WardPlan } from '../../types'
import type { MapViewProps } from './mapTypes'

const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'

function wardMarkerHtml(ward: Ward, wardPlan: WardPlan | undefined, selected: boolean): string {
  const tone = URGENCY_META[ward.urgency]?.color ?? '#8599ae'
  const coverage = wardPlan ? `${Math.round(wardPlan.coverage * 100)}%` : '—'
  return `
    <div class="rg-point">
      <div class="rg-ward${selected ? ' is-selected' : ''}" style="--tone:${tone}">
        ${ward.urgency >= 5 ? `<span class="pulse-ring" style="position:absolute;inset:0;border-radius:999px;border:1px solid ${tone};opacity:.35"></span>` : ''}
        <span class="rg-ward-ring"></span>
        <span class="rg-ward-core"></span>
        <span class="rg-ward-label"><b>${ward.code}</b>${ward.shortName}<em>${coverage}</em></span>
      </div>
    </div>
  `
}

function depotShape(code: 'A' | 'B' | 'C', tone: string): string {
  if (code === 'A') {
    return `<path d="M17 1.5 32.5 17 17 32.5 1.5 17Z" fill="${tone}" fill-opacity="0.92" stroke="#eafffb" stroke-opacity="0.4" stroke-width="1.2" />`
  }
  if (code === 'B') {
    return `<circle cx="17" cy="17" r="14.5" fill="${tone}" fill-opacity="0.92" stroke="#eafffb" stroke-opacity="0.4" stroke-width="1.2" />`
  }
  return `<path d="M17 1.5 31 9.2v15.6L17 32.5 3 24.8V9.2Z" fill="${tone}" fill-opacity="0.92" stroke="#eafffb" stroke-opacity="0.4" stroke-width="1.2" />`
}

function depotMarkerHtml(depot: Scenario['depots'][number], runs: number): string {
  const style = DEPOT_STYLE[depot.id]
  return `
    <div class="rg-point">
      <div class="rg-depot" style="--tone:${style.color}">
        <svg class="rg-depot-shape" viewBox="0 0 34 34" aria-hidden="true">${depotShape(depot.code, style.color)}</svg>
        <span class="rg-depot-letter">${depot.code}</span>
        <span class="rg-depot-label">Depot ${depot.code}<em>${depot.shortName} · ${runs} runs</em></span>
      </div>
    </div>
  `
}

export function LeafletMap({
  scenario,
  plan,
  selectedWardId,
  selectedRoadId,
  showRoutes,
  onSelectWard,
  onSelectRoad,
  onTileFailure,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<L.Map | null>(null)
  const layersRef = useRef<L.LayerGroup | null>(null)
  const callbacksRef = useRef({ onSelectWard, onSelectRoad, onTileFailure })
  const [status, setStatus] = useState<'loading' | 'ready'>('loading')

  useEffect(() => {
    callbacksRef.current = { onSelectWard, onSelectRoad, onTileFailure }
  }, [onSelectWard, onSelectRoad, onTileFailure])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    setStatus('loading')
    const map = L.map(container, {
      center: MAP_CENTER,
      zoom: 13,
      minZoom: 11,
      maxZoom: 17,
      zoomControl: false,
      zoomSnap: 0.5,
      scrollWheelZoom: true,
      preferCanvas: true,
      attributionControl: true,
    })
    map.attributionControl.setPrefix(false)
    mapRef.current = map

    let loaded = false
    let failures = 0
    let failed = false

    const triggerFailure = () => {
      if (failed || loaded) return
      failed = true
      callbacksRef.current.onTileFailure()
    }

    const tiles = L.tileLayer(TILE_URL, {
      subdomains: 'abc',
      maxZoom: 19,
      attribution: TILE_ATTRIBUTION,
      detectRetina: false,
    })
    tiles.on('tileload', () => {
      loaded = true
      setStatus('ready')
    })
    tiles.on('tileerror', () => {
      failures += 1
      if (failures >= 3) triggerFailure()
    })
    tiles.addTo(map)

    const fallbackTimer = window.setTimeout(() => {
      if (!loaded) triggerFailure()
    }, 4600)

    const layers = L.layerGroup().addTo(map)
    layersRef.current = layers

    map.fitBounds(LEAFLET_BOUNDS, { padding: [34, 34], maxZoom: 14.5 })

    map.on('click', () => {
      callbacksRef.current.onSelectRoad(null)
    })

    const observer = new ResizeObserver(() => {
      map.invalidateSize()
    })
    observer.observe(container)

    return () => {
      window.clearTimeout(fallbackTimer)
      observer.disconnect()
      map.remove()
      mapRef.current = null
      layersRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    const layers = layersRef.current
    if (!map || !layers) return
    layers.clearLayers()

    const roadById = new Map<string, Road>(scenario.roads.map((road) => [road.id, road]))
    const runsByDepot = new Map<string, number>()
    for (const route of plan.routes) {
      runsByDepot.set(route.depotId, (runsByDepot.get(route.depotId) ?? 0) + route.trips)
    }

    for (const road of scenario.roads) {
      const selected = selectedRoadId === road.id
      const color =
        road.state === 'blocked' ? '#f87171' : road.state === 'congested' ? '#f0b45c' : '#7397ab'
      const geometry = road.geometry.map((point) => [point.lat, point.lng] as [number, number])

      if (selected) {
        L.polyline(geometry, {
          color: '#5eead4',
          weight: 12,
          opacity: 0.14,
          interactive: false,
        }).addTo(layers)
      }

      L.polyline(geometry, {
        color: '#07131f',
        weight: 7,
        opacity: 0.72,
        lineCap: 'round',
        interactive: false,
      }).addTo(layers)

      L.polyline(geometry, {
        color: selected ? '#d9fffa' : color,
        weight: selected ? 4 : road.state === 'open' ? 2.6 : 3.4,
        opacity: road.state === 'open' ? 0.9 : 1,
        dashArray: road.state === 'blocked' ? '2 5' : road.state === 'congested' ? '7 4' : undefined,
        lineCap: 'round',
        interactive: false,
      }).addTo(layers)

      const hit = L.polyline(geometry, {
        color: '#5eead4',
        weight: 18,
        opacity: 0.001,
        lineCap: 'round',
      }).addTo(layers)
      hit.bindTooltip(`${road.ref} · ${road.name} — ${road.state}`, {
        className: 'rg-tooltip',
        sticky: true,
        direction: 'top',
      })
      hit.on('click', (event) => {
        if (event.originalEvent) L.DomEvent.stopPropagation(event.originalEvent)
        callbacksRef.current.onSelectRoad(road.id)
      })

      if (road.state === 'blocked') {
        const midpoint = road.geometry[Math.floor(road.geometry.length / 2)]
        const icon = L.divIcon({
          className: 'rg-marker',
          html: '<div class="rg-point"><div class="rg-road-x">×</div></div>',
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        })
        L.marker([midpoint.lat, midpoint.lng], { icon, interactive: false, keyboard: false }).addTo(layers)
      }
    }

    if (showRoutes) {
      for (const route of plan.routes) {
        const pathRoads = route.path.map((id) => roadById.get(id)).filter((road): road is Road => Boolean(road))
        const geometry = buildRouteGeometry(route.depotId, pathRoads)
        if (geometry.length < 2) continue
        const emphasized = selectedWardId === route.wardId
        L.polyline(
          geometry.map((point) => [point.lat, point.lng] as [number, number]),
          {
            color: '#5eead4',
            weight: emphasized ? 2.8 : 1.4,
            opacity: emphasized ? 0.9 : selectedWardId ? 0.2 : 0.48,
            dashArray: '3 8',
            className: 'rg-route-line',
            interactive: false,
          },
        ).addTo(layers)
      }
    }

    for (const depot of scenario.depots) {
      const runs = runsByDepot.get(depot.id) ?? 0
      const icon = L.divIcon({
        className: 'rg-marker',
        html: depotMarkerHtml(depot, runs),
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      })
      const marker = L.marker([depot.location.lat, depot.location.lng], {
        icon,
        title: depot.name,
        alt: depot.name,
        keyboard: false,
        interactive: false,
      }).addTo(layers)
      const available = scenario.vehicles.filter(
        (vehicle) => vehicle.depotId === depot.id && vehicle.status === 'available',
      ).length
      marker.bindTooltip(
        `<strong>${depot.name}</strong><br/>Water ${formatNumber(depot.stock.water)} · Medical ${formatNumber(
          depot.stock.medical,
        )} · Food ${formatNumber(depot.stock.food)}<br/>${available} available vehicle${available === 1 ? '' : 's'} · ${runs} planned runs`,
        { className: 'rg-tooltip', direction: 'top', offset: [0, -16] },
      )
    }

    for (const ward of scenario.wards) {
      const wardPlan = plan.wards.find((entry) => entry.wardId === ward.id)
      const selected = selectedWardId === ward.id
      const icon = L.divIcon({
        className: 'rg-marker',
        html: wardMarkerHtml(ward, wardPlan, selected),
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      })
      const marker = L.marker([ward.location.lat, ward.location.lng], {
        icon,
        title: `${ward.name} — ${wardPlan ? Math.round(wardPlan.coverage * 100) : 0}% plan coverage`,
        alt: `${ward.name}, urgency ${ward.urgency} of 5`,
        keyboard: true,
      }).addTo(layers)
      marker.on('click', (event) => {
        if (event.originalEvent) L.DomEvent.stopPropagation(event.originalEvent)
        callbacksRef.current.onSelectWard(ward.id)
      })
      const element = marker.getElement()
      element?.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          callbacksRef.current.onSelectWard(ward.id)
        }
      })
    }
  }, [scenario, plan, selectedWardId, selectedRoadId, showRoutes])

  return (
    <div className="relative h-full w-full">
      <div
        ref={containerRef}
        className="absolute inset-0 z-0"
        aria-label="Interactive map of the fictional Sagarika District"
      />

      <div className="absolute right-2.5 top-2.5 z-10 flex flex-col overflow-hidden rounded-md border border-line bg-night-950/95 shadow-lg">
        <button
          type="button"
          onClick={() => mapRef.current?.zoomIn()}
          aria-label="Zoom in"
          className="flex h-7 w-7 items-center justify-center text-mist-300 transition-colors hover:bg-white/[0.07] hover:text-mist-50"
        >
          <Plus size={13} aria-hidden />
        </button>
        <div className="h-px bg-line/80" aria-hidden />
        <button
          type="button"
          onClick={() => mapRef.current?.zoomOut()}
          aria-label="Zoom out"
          className="flex h-7 w-7 items-center justify-center text-mist-300 transition-colors hover:bg-white/[0.07] hover:text-mist-50"
        >
          <Minus size={13} aria-hidden />
        </button>
        <div className="h-px bg-line/80" aria-hidden />
        <button
          type="button"
          onClick={() => mapRef.current?.fitBounds(LEAFLET_BOUNDS, { padding: [34, 34], maxZoom: 14.5 })}
          aria-label="Fit the district in view"
          className="flex h-7 w-7 items-center justify-center text-mist-400 transition-colors hover:bg-white/[0.07] hover:text-mist-50"
        >
          <Maximize2 size={12} aria-hidden />
        </button>
      </div>

      {status === 'loading' ? (
        <div className="pointer-events-none absolute inset-0 z-[5] flex items-center justify-center bg-night-950/35">
          <div className="flex items-center gap-2 rounded-md border border-line bg-night-950/90 px-3 py-2 shadow-lg">
            <span className="h-3 w-3 animate-spin rounded-full border border-mist-600 border-t-signal" aria-hidden />
            <span className="font-mono text-[8.5px] uppercase tracking-[0.1em] text-mist-300">
              Aligning OSM tiles
            </span>
          </div>
        </div>
      ) : null}
    </div>
  )
}
```

---

## `src/components/map/MapLegend.tsx`

```tsx
import { ListFilter, X } from 'lucide-react'
import { useState } from 'react'
import { DEPOT_STYLE, ROAD_STATE_META } from '../../lib/constants'
import { cn } from '../../lib/cn'
import type { DepotId } from '../../types'

function DepotGlyph({ id, size = 10 }: { id: DepotId; size?: number }) {
  const style = DEPOT_STYLE[id]
  return (
    <span
      aria-hidden
      className={cn(
        'inline-block shrink-0',
        style.shape === 'circle' ? 'rounded-full' : style.shape === 'diamond' ? 'rotate-45 rounded-[2px]' : '',
      )}
      style={{
        width: size,
        height: size,
        background: style.color,
        clipPath: style.shape === 'hexagon' ? 'polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)' : undefined,
      }}
    />
  )
}

export function MapLegend() {
  const [open, setOpen] = useState(false)

  return (
    <div className="pointer-events-auto absolute bottom-3 left-3 z-20 max-w-[calc(100%-24px)]">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="mb-1.5 inline-flex items-center gap-1.5 rounded border border-line bg-night-950/90 px-2 py-1 font-mono text-[8.5px] uppercase tracking-[0.1em] text-mist-300 backdrop-blur sm:hidden"
      >
        <ListFilter size={10} aria-hidden />
        Legend
      </button>

      <div
        className={cn(
          'w-[224px] rounded-md border border-line/80 bg-night-950/93 p-2.5 shadow-[0_14px_30px_-18px_rgba(0,0,0,0.9)] backdrop-blur-sm',
          open ? 'block' : 'hidden sm:block',
        )}
      >
        <div className="mb-2 flex items-center justify-between">
          <span className="label-micro">Map legend</span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close legend"
            className="text-mist-500 hover:text-mist-200 sm:hidden"
          >
            <X size={11} aria-hidden />
          </button>
        </div>

        <div className="space-y-2">
          <div>
            <div className="label-tiny mb-1">Ward urgency</div>
            <div className="flex flex-wrap gap-x-2.5 gap-y-1 text-[8.5px] text-mist-400">
              {[
                ['Critical', '#f87171'],
                ['High', '#f0b45c'],
                ['Moderate', '#2dd4bf'],
                ['Guarded', '#7dd3fc'],
              ].map(([label, color]) => (
                <span key={label} className="inline-flex items-center gap-1">
                  <span
                    aria-hidden
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: color, boxShadow: `0 0 6px ${color}` }}
                  />
                  {label}
                </span>
              ))}
            </div>
          </div>

          <div>
            <div className="label-tiny mb-1">Depots</div>
            <div className="flex gap-3 text-[8.5px] text-mist-400">
              {(['depot-a', 'depot-b', 'depot-c'] as DepotId[]).map((id) => (
                <span key={id} className="inline-flex items-center gap-1">
                  <DepotGlyph id={id} />
                  {id === 'depot-a' ? 'A' : id === 'depot-b' ? 'B' : 'C'}
                </span>
              ))}
            </div>
          </div>

          <div>
            <div className="label-tiny mb-1">Road state</div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[8.5px] text-mist-400">
                <span className="h-[2px] w-6 rounded-full bg-[#8fb6c7]" aria-hidden />
                Open
              </div>
              <div className="flex items-center gap-2 text-[8.5px] text-mist-400">
                <span
                  className="h-[2px] w-6"
                  aria-hidden
                  style={{
                    backgroundImage: `repeating-linear-gradient(90deg, ${ROAD_STATE_META.congested.color} 0 4px, transparent 4px 7px)`,
                  }}
                />
                Congested
              </div>
              <div className="flex items-center gap-2 text-[8.5px] text-mist-400">
                <span
                  className="h-[2px] w-6"
                  aria-hidden
                  style={{
                    backgroundImage: `repeating-linear-gradient(90deg, ${ROAD_STATE_META.blocked.color} 0 2px, transparent 2px 5px)`,
                  }}
                />
                Blocked
                <span className="text-critical">×</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 border-t border-line/60 pt-1.5 text-[8.5px] text-mist-400">
            <span
              aria-hidden
              className="h-[2px] w-6"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(90deg, #5eead4 0 2px, transparent 2px 6px)',
              }}
            />
            Planned delivery route
          </div>
        </div>
        <p className="mt-2 border-t border-line/60 pt-1.5 font-mono text-[7.5px] leading-relaxed text-mist-600">
          Fictional geography · simulated quantities
        </p>
      </div>
    </div>
  )
}
```

---

## `src/components/map/RoadPopover.tsx`

```tsx
import { ArrowRight, X } from 'lucide-react'
import { useEffect } from 'react'
import { ROAD_STATE_META } from '../../lib/constants'
import { formatDecimal, formatNumber } from '../../lib/format'
import type { Plan, Road, RoadState, Scenario } from '../../types'
import { Badge } from '../ui/Badge'
import { Segmented } from '../ui/Segmented'

function nodeShortLabel(scenario: Scenario, id: string): string {
  const ward = scenario.wards.find((entry) => entry.id === id)
  if (ward) return ward.shortName
  const depot = scenario.depots.find((entry) => entry.id === id)
  if (depot) return `Depot ${depot.code}`
  return id
}

interface RoadPopoverProps {
  road: Road
  scenario: Scenario
  plan: Plan
  onChangeState: (state: RoadState) => void
  onClose: () => void
}

export function RoadPopover({ road, scenario, plan, onChangeState, onClose }: RoadPopoverProps) {
  const meta = ROAD_STATE_META[road.state]
  const legs = plan.routes.filter((route) => route.path.includes(road.id))
  const units = legs.reduce((sum, route) => sum + route.units, 0)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div
      role="dialog"
      aria-label={`Road status: ${road.name}`}
      className="fade-in absolute left-3 top-3 z-30 w-[292px] max-w-[calc(100%-24px)] rounded-lg border border-line bg-night-925/97 p-3 shadow-[0_22px_50px_-22px_rgba(0,0,0,0.95)] backdrop-blur-md"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[8.5px] uppercase tracking-[0.1em] text-mist-500">
              {road.ref}
            </span>
            <Badge tone={road.state === 'blocked' ? 'red' : road.state === 'congested' ? 'amber' : 'neutral'}>
              {meta.label}
            </Badge>
          </div>
          <h3 className="mt-1 text-[12.5px] font-medium leading-tight text-mist-50">{road.name}</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close road details"
          className="rounded p-1 text-mist-500 transition-colors hover:bg-white/5 hover:text-mist-200"
        >
          <X size={13} aria-hidden />
        </button>
      </div>

      <div className="mt-2 flex items-center gap-1.5 text-[9.5px] text-mist-300">
        <span className="truncate">{nodeShortLabel(scenario, road.from)}</span>
        <ArrowRight size={10} className="shrink-0 text-mist-600" aria-hidden />
        <span className="truncate">{nodeShortLabel(scenario, road.to)}</span>
      </div>

      <div className="mt-2.5 grid grid-cols-3 gap-1">
        {[
          ['Length', `${formatDecimal(road.distanceKm)} km`],
          ['Lanes', String(road.lanes)],
          ['Planned legs', formatNumber(legs.length)],
        ].map(([label, value]) => (
          <div key={label} className="rounded border border-line/70 bg-night-950/40 px-1.5 py-1">
            <div className="font-mono text-[7px] uppercase tracking-[0.09em] text-mist-600">{label}</div>
            <div className="num mt-0.5 text-[9.5px] text-mist-200">{value}</div>
          </div>
        ))}
      </div>

      {units > 0 ? (
        <p className="mt-1.5 font-mono text-[8px] text-mist-500">
          {formatNumber(units)} units currently routed over this segment
        </p>
      ) : null}

      <div className="mt-2.5">
        <div className="mb-1 flex items-center justify-between">
          <span className="label-tiny">Segment state</span>
          <span className="font-mono text-[7.5px] uppercase tracking-[0.08em] text-mist-600">
            demo graph
          </span>
        </div>
        <Segmented<RoadState>
          ariaLabel="Set road state"
          fullWidth
          size="xs"
          value={road.state}
          options={[
            { value: 'open', label: 'Open' },
            { value: 'congested', label: 'Congested' },
            { value: 'blocked', label: 'Blocked' },
          ]}
          onChange={onChangeState}
        />
      </div>

      <p className="mt-2 text-[9px] leading-relaxed text-mist-500">{road.note}</p>
      <p className="mt-1.5 border-t border-line/60 pt-1.5 text-[8.5px] leading-relaxed text-mist-600">
        {meta.description} Changes recompute the plan immediately — not a live
        traffic update.
      </p>
    </div>
  )
}
```

---

## `src/components/map/VectorMap.tsx`

```tsx
import { Maximize2, Minus, Plus } from 'lucide-react'
import { useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react'
import { DEPOT_STYLE, ROAD_STATE_META, URGENCY_META } from '../../lib/constants'
import { formatNumber } from '../../lib/format'
import { cn } from '../../lib/cn'
import {
  COASTLINE,
  MAP_BOUNDS,
  RIVER_PATH,
  SVG_VIEW,
  mapPolyline,
  mapSmoothPath,
  projectPointAtFraction,
  projectToMap,
  roadLabelPosition,
} from '../../lib/map'
import { buildRouteGeometry } from '../../lib/routing'
import type { Road } from '../../types'
import type { MapViewProps } from './mapTypes'

const { width: W, height: H } = SVG_VIEW

function pctX(x: number): string {
  return `${(x / W) * 100}%`
}

function pctY(y: number): string {
  return `${(y / H) * 100}%`
}

function DepotShape({ code, tone }: { code: 'A' | 'B' | 'C'; tone: string }) {
  return (
    <svg className="rg-depot-shape" viewBox="0 0 34 34" aria-hidden>
      {code === 'A' ? (
        <path
          d="M17 1.5 32.5 17 17 32.5 1.5 17Z"
          fill={tone}
          fillOpacity="0.92"
          stroke="#eafffb"
          strokeOpacity="0.4"
          strokeWidth="1.2"
        />
      ) : code === 'B' ? (
        <circle
          cx="17"
          cy="17"
          r="14.5"
          fill={tone}
          fillOpacity="0.92"
          stroke="#eafffb"
          strokeOpacity="0.4"
          strokeWidth="1.2"
        />
      ) : (
        <path
          d="M17 1.5 31 9.2v15.6L17 32.5 3 24.8V9.2Z"
          fill={tone}
          fillOpacity="0.92"
          stroke="#eafffb"
          strokeOpacity="0.4"
          strokeWidth="1.2"
        />
      )}
    </svg>
  )
}

const latGrid = [14.42, 14.46, 14.5]
const lngGrid = [79.92, 79.96, 80.0, 80.04]

export function VectorMap({
  scenario,
  plan,
  selectedWardId,
  selectedRoadId,
  showRoutes,
  onSelectWard,
  onSelectRoad,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const dragRef = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null)
  const [dragging, setDragging] = useState(false)
  const [view, setView] = useState({ x: 0, y: 0, scale: 1 })

  const roadById = new Map<string, Road>(scenario.roads.map((road) => [road.id, road]))
  const runsByDepot = new Map<string, number>()
  for (const route of plan.routes) {
    runsByDepot.set(route.depotId, (runsByDepot.get(route.depotId) ?? 0) + route.trips)
  }

  const coastlinePath = `${mapSmoothPath(COASTLINE)} L ${W} ${H} L ${W} 0 Z`
  const riverPath = mapSmoothPath(RIVER_PATH)
  const boundary = mapPolyline(
    [
      { lat: 14.52, lng: 79.905 },
      { lat: 14.514, lng: 80.025 },
      { lat: 14.47, lng: 80.058 },
      { lat: 14.408, lng: 80.05 },
      { lat: 14.403, lng: 79.94 },
      { lat: 14.44, lng: 79.9 },
    ],
    true,
  )

  function zoomBy(delta: number) {
    const rect = containerRef.current?.getBoundingClientRect()
    const cx = rect ? rect.width / 2 : W / 2
    const cy = rect ? rect.height / 2 : H / 2
    setView((previous) => {
      const nextScale = Math.min(2.6, Math.max(0.8, previous.scale + delta))
      if (nextScale === previous.scale) return previous
      const ratio = nextScale / previous.scale
      return {
        scale: nextScale,
        x: cx - (cx - previous.x) * ratio,
        y: cy - (cy - previous.y) * ratio,
      }
    })
  }

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return
    if ((event.target as Element).closest('[data-map-interactive], button')) return
    dragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      originX: view.x,
      originY: view.y,
    }
    setDragging(true)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current
    if (!drag) return
    setView((previous) => ({
      ...previous,
      x: drag.originX + (event.clientX - drag.startX),
      y: drag.originY + (event.clientY - drag.startY),
    }))
  }

  function onPointerUp() {
    dragRef.current = null
    setDragging(false)
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative h-full w-full select-none overflow-hidden bg-[#06111c]',
        dragging ? 'cursor-grabbing' : 'cursor-grab',
      )}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      aria-label="Offline vector map of the fictional Sagarika District"
    >
      <div
        className="absolute inset-0 origin-top-left"
        style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})` }}
      >
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
          aria-hidden
        >
          <defs>
            <linearGradient id="rg-land" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#0a1a29" />
              <stop offset="0.55" stopColor="#081723" />
              <stop offset="1" stopColor="#071320" />
            </linearGradient>
            <linearGradient id="rg-sea" x1="0" y1="0" x2="1" y2="0.6">
              <stop offset="0" stopColor="#0d3143" />
              <stop offset="0.55" stopColor="#092434" />
              <stop offset="1" stopColor="#071824" />
            </linearGradient>
            <linearGradient id="rg-river" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#0a2a3b" />
              <stop offset="1" stopColor="#0c3546" />
            </linearGradient>
            <pattern
              id="rg-fields"
              width="22"
              height="22"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(18)"
            >
              <line x1="0" y1="0" x2="0" y2="22" stroke="rgba(122, 186, 180, 0.2)" strokeWidth="1" />
            </pattern>
            <pattern id="rg-wetland" width="14" height="14" patternUnits="userSpaceOnUse">
              <circle cx="3" cy="5" r="1" fill="rgba(103, 199, 232, 0.18)" />
              <circle cx="10" cy="11" r="0.8" fill="rgba(103, 199, 232, 0.12)" />
            </pattern>
            <filter id="rg-glow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <clipPath id="rg-sea-clip">
              <path d={coastlinePath} />
            </clipPath>
          </defs>

          <rect width={W} height={H} fill="url(#rg-land)" />
          <g opacity="0.75">
            {[60, 120, 180, 240, 300, 360, 420, 480, 540, 600].map((y) => (
              <line key={`grid-y-${y}`} x1="0" x2={W} y1={y} y2={y} stroke="rgba(120, 158, 190, 0.09)" strokeWidth="1" />
            ))}
            {[100, 200, 300, 400, 500, 600, 700, 800, 900].map((x) => (
              <line key={`grid-x-${x}`} x1={x} x2={x} y1="0" y2={H} stroke="rgba(120, 158, 190, 0.08)" strokeWidth="1" />
            ))}
          </g>

          <path d={coastlinePath} fill="url(#rg-sea)" />
          <g clipPath="url(#rg-sea-clip)" opacity="0.45">
            {[70, 150, 230, 310, 390, 470, 550, 620].map((y, index) => (
              <path
                key={`wave-${y}`}
                d={`M ${820 + (index % 3) * 12} ${y} q 45 -8 90 0 t 90 0`}
                fill="none"
                stroke="#1d5268"
                strokeWidth="1"
              />
            ))}
          </g>
          <path
            d={mapSmoothPath(COASTLINE)}
            fill="none"
            stroke="#2a6177"
            strokeWidth="1.4"
            opacity="0.7"
          />

          <path
            d="M 18 430 L 258 386 L 330 492 L 236 610 L 24 590 Z"
            fill="url(#rg-fields)"
            stroke="rgba(122, 178, 173, 0.16)"
            strokeWidth="1"
          />
          <path
            d="M 78 300 L 252 274 L 300 356 L 186 402 L 52 370 Z"
            fill="url(#rg-fields)"
            stroke="rgba(122, 178, 173, 0.12)"
            strokeWidth="1"
          />
          <text x="72" y="576" fill="#3f5c6b" fontSize="8.5" fontFamily="monospace" letterSpacing="0.16em">
            INLAND AGRICULTURAL BELT
          </text>

          <g opacity="0.5">
            {[0, 1, 2, 3].map((index) => (
              <ellipse
                key={`contour-${index}`}
                cx={705}
                cy={143}
                rx={52 + index * 26}
                ry={20 + index * 15}
                transform={`rotate(-20 705 143)`}
                fill="none"
                stroke="#2a5060"
                strokeWidth="0.8"
                opacity={0.42 - index * 0.06}
              />
            ))}
            <text x="665" y="112" fill="#486979" fontSize="7.5" fontFamily="monospace" letterSpacing="0.12em">
              HILLVIEW RIDGE
            </text>
          </g>

          <path d={riverPath} fill="none" stroke="#06121d" strokeWidth="16" strokeLinecap="round" />
          <path d={riverPath} fill="none" stroke="url(#rg-river)" strokeWidth="10" strokeLinecap="round" />
          <path
            d={riverPath}
            fill="none"
            stroke="#1c4b5d"
            strokeWidth="1"
            strokeDasharray="4 8"
            opacity="0.5"
          />
          <path
            d="M 810 540 Q 856 552 892 584 Q 906 596 918 606 L 906 626 Q 862 600 826 568 Z"
            fill="url(#rg-wetland)"
            opacity="0.8"
          />

          <g opacity="0.62">
            {[
              [648, 302, 48, 20],
              [714, 288, 34, 16],
              [762, 322, 54, 22],
              [700, 346, 30, 14],
              [788, 372, 40, 16],
              [634, 340, 34, 18],
              [818, 236, 42, 18],
              [746, 238, 30, 14],
              [488, 318, 38, 18],
              [522, 352, 28, 14],
            ].map(([x, y, width, height], index) => (
              <rect
                key={`block-${index}`}
                x={x}
                y={y}
                width={width}
                height={height}
                rx="2"
                fill="#102738"
                stroke="#1d3b4f"
                strokeWidth="0.7"
              />
            ))}
          </g>

          <path
            d={boundary}
            fill="none"
            stroke="#31566a"
            strokeWidth="1"
            strokeDasharray="8 6"
            opacity="0.4"
          />

          <g opacity="0.28" fontFamily="monospace" fontSize="7" fill="#4c6879">
            {latGrid.map((lat) => {
              const y = projectToMap({ lat, lng: MAP_BOUNDS.west }).y
              return (
                <g key={`lat-${lat}`}>
                  <line x1="0" x2={W} y1={y} y2={y} stroke="#3a5d70" strokeWidth="0.6" strokeDasharray="2 10" />
                  <text x="8" y={y - 4}>{lat.toFixed(2)}°N</text>
                </g>
              )
            })}
            {lngGrid.map((lng) => {
              const x = projectToMap({ lat: MAP_BOUNDS.north, lng }).x
              return (
                <g key={`lng-${lng}`}>
                  <line x1={x} x2={x} y1="0" y2={H} stroke="#3a5d70" strokeWidth="0.6" strokeDasharray="2 10" />
                  <text x={x + 4} y={H - 10}>{lng.toFixed(2)}°E</text>
                </g>
              )
            })}
          </g>

          <text
            x="925"
            y="250"
            fill="#2e6074"
            fontSize="9"
            fontFamily="monospace"
            letterSpacing="0.28em"
            transform="rotate(78 925 250)"
          >
            BAY OF BENGAL
          </text>
          <text
            x="400"
            y="208"
            fill="#2e6074"
            fontSize="7.5"
            fontFamily="monospace"
            letterSpacing="0.18em"
            transform="rotate(-24 400 208)"
          >
            SAGARIKA RIVER
          </text>

          {scenario.roads.map((road) => {
            const path = mapPolyline(road.geometry)
            const selected = selectedRoadId === road.id
            const color = ROAD_STATE_META[road.state].color
            const midpoint = projectPointAtFraction(road.geometry, 0.5)
            return (
              <g key={road.id}>
                {selected ? (
                  <path d={path} fill="none" stroke="#5eead4" strokeWidth="12" opacity="0.16" strokeLinecap="round" />
                ) : null}
                <path
                  d={path}
                  fill="none"
                  stroke="#05101a"
                  strokeWidth={selected ? 10 : 8}
                  strokeLinecap="round"
                />
                <path
                  d={path}
                  fill="none"
                  stroke={selected ? '#d9fffa' : color}
                  strokeWidth={selected ? 4 : road.lanes >= 4 ? 3.4 : 3}
                  strokeLinecap="round"
                  strokeDasharray={road.state === 'blocked' ? '2 4' : road.state === 'congested' ? '6 3' : undefined}
                  opacity={road.state === 'open' ? 0.95 : 1}
                />
                <path
                  d={path}
                  fill="none"
                  stroke="transparent"
                  strokeWidth="16"
                  pointerEvents="stroke"
                  role="button"
                  tabIndex={-1}
                  aria-label={`Inspect ${road.name}, currently ${road.state}`}
                  data-map-interactive
                  style={{ cursor: 'pointer' }}
                  onClick={(event) => {
                    event.stopPropagation()
                    onSelectRoad(road.id)
                  }}
                >
                  <title>{`${road.name} — ${ROAD_STATE_META[road.state].label}`}</title>
                </path>
                {road.state === 'blocked' && midpoint ? (
                  <g transform={`translate(${midpoint.x} ${midpoint.y})`} pointerEvents="none">
                    <circle r="6.5" fill="#2a0d12" stroke="#f87171" strokeWidth="1" opacity="0.95" />
                    <path d="M-2.5 -2.5 2.5 2.5 M2.5 -2.5 -2.5 2.5" stroke="#fca5a5" strokeWidth="1.2" />
                  </g>
                ) : null}
              </g>
            )
          })}

          {showRoutes
            ? plan.routes.map((route) => {
                const pathRoads = route.path
                  .map((id) => roadById.get(id))
                  .filter((road): road is Road => Boolean(road))
                const geometry = buildRouteGeometry(route.depotId, pathRoads)
                if (geometry.length < 2) return null
                const emphasized = selectedWardId === route.wardId
                return (
                  <path
                    key={`${route.depotId}-${route.wardId}`}
                    d={mapPolyline(geometry)}
                    fill="none"
                    stroke="#5eead4"
                    strokeWidth={emphasized ? 2.2 : 1.2}
                    strokeDasharray="3 7"
                    strokeLinecap="round"
                    opacity={emphasized ? 0.9 : selectedWardId ? 0.2 : 0.5}
                    className="route-flow"
                    pointerEvents="none"
                  />
                )
              })
            : null}
        </svg>

        {scenario.roads.map((road) => {
          const label = roadLabelPosition(road.geometry)
          if (!label) return null
          const selected = selectedRoadId === road.id
          const blocked = road.state === 'blocked'
          return (
            <button
              key={`label-${road.id}`}
              type="button"
              data-map-interactive
              onClick={(event) => {
                event.stopPropagation()
                onSelectRoad(road.id)
              }}
              title={`${road.ref} · ${road.name} — ${ROAD_STATE_META[road.state].label}`}
              aria-label={`Inspect ${road.name}, currently ${ROAD_STATE_META[road.state].label}`}
              className={cn(
                'absolute z-[6] inline-flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 whitespace-nowrap rounded border px-1.5 py-[2px] font-mono text-[8.5px] uppercase leading-[1.4] tracking-[0.02em] shadow-[0_2px_8px_rgba(0,0,0,0.45)] backdrop-blur-[2px] transition-colors sm:text-[9px]',
                selected
                  ? 'border-signal/60 bg-night-950/95 text-signal-bright'
                  : blocked
                    ? 'border-critical/40 bg-night-950/90 text-[#fca5a5]'
                    : road.state === 'congested'
                      ? 'border-warn/35 bg-night-950/90 text-[#e5c38b]'
                      : 'border-[#2b455a] bg-night-950/90 text-mist-200 hover:text-mist-50',
              )}
              style={{ left: pctX(label.x), top: pctY(label.y) }}
            >
              <span
                aria-hidden
                className="h-1 w-1 rounded-full"
                style={{ background: ROAD_STATE_META[road.state].color }}
              />
              <span className="hidden sm:inline">{road.name}</span>
              <span className={selected ? 'hidden' : 'sm:hidden'}>{road.ref}</span>
            </button>
          )
        })}

        {scenario.depots.map((depot) => {
          const point = projectToMap(depot.location)
          const style = DEPOT_STYLE[depot.id]
          const runs = runsByDepot.get(depot.id) ?? 0
          const available = scenario.vehicles.filter(
            (vehicle) => vehicle.depotId === depot.id && vehicle.status === 'available',
          ).length
          return (
            <div
              key={depot.id}
              className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
              style={{ left: pctX(point.x), top: pctY(point.y) }}
              title={`${depot.name} · Water ${formatNumber(depot.stock.water)} · Medical ${formatNumber(
                depot.stock.medical,
              )} · Food ${formatNumber(depot.stock.food)} · ${available} available vehicles · ${runs} planned runs`}
              aria-label={`${depot.name}, ${runs} planned delivery runs`}
              role="img"
            >
              <div className="rg-depot" style={{ '--tone': style.color } as CSSProperties}>
                <DepotShape code={depot.code} tone={style.color} />
                <span className="rg-depot-letter">{depot.code}</span>
                <span className="rg-depot-label">
                  Depot {depot.code}
                  <em>{runs} runs</em>
                </span>
              </div>
            </div>
          )
        })}

        {scenario.wards.map((ward) => {
          const point = projectToMap(ward.location)
          const wardPlan = plan.wards.find((entry) => entry.wardId === ward.id)
          const coverage = wardPlan ? Math.round(wardPlan.coverage * 100) : 0
          const tone = URGENCY_META[ward.urgency]?.color ?? '#8599ae'
          const selected = selectedWardId === ward.id
          return (
            <button
              key={ward.id}
              type="button"
              data-map-interactive
              onClick={() => onSelectWard(ward.id)}
              aria-label={`${ward.name}, urgency ${ward.urgency} of 5, ${coverage}% plan coverage`}
              title={`${ward.name} · ${URGENCY_META[ward.urgency]?.label} urgency · ${coverage}% coverage`}
              className="absolute z-20 -translate-x-1/2 -translate-y-1/2 rounded-full p-0 text-left"
              style={{ left: pctX(point.x), top: pctY(point.y) }}
            >
              <span className={cn('rg-ward', selected && 'is-selected')} style={{ '--tone': tone } as CSSProperties}>
                {ward.urgency >= 5 ? (
                  <span
                    className="pulse-ring absolute inset-0 rounded-full border"
                    style={{ borderColor: tone, opacity: 0.35 }}
                    aria-hidden
                  />
                ) : null}
                <span className="rg-ward-ring" aria-hidden />
                <span className="rg-ward-core" aria-hidden />
                <span className="rg-ward-label">
                  <b>{ward.code}</b>
                  {ward.shortName}
                  <em>{coverage}%</em>
                </span>
              </span>
            </button>
          )
        })}
      </div>

      <div className="absolute right-2.5 top-2.5 z-20 flex flex-col overflow-hidden rounded-md border border-line bg-night-950/95 shadow-lg">
        <button
          type="button"
          onClick={() => zoomBy(0.25)}
          aria-label="Zoom in"
          className="flex h-7 w-7 items-center justify-center text-mist-300 transition-colors hover:bg-white/[0.07] hover:text-mist-50"
        >
          <Plus size={13} aria-hidden />
        </button>
        <div className="h-px bg-line/80" aria-hidden />
        <button
          type="button"
          onClick={() => zoomBy(-0.25)}
          aria-label="Zoom out"
          className="flex h-7 w-7 items-center justify-center text-mist-300 transition-colors hover:bg-white/[0.07] hover:text-mist-50"
        >
          <Minus size={13} aria-hidden />
        </button>
        <div className="h-px bg-line/80" aria-hidden />
        <button
          type="button"
          onClick={() => setView({ x: 0, y: 0, scale: 1 })}
          aria-label="Fit the district in view"
          className="flex h-7 w-7 items-center justify-center text-mist-400 transition-colors hover:bg-white/[0.07] hover:text-mist-50"
        >
          <Maximize2 size={12} aria-hidden />
        </button>
      </div>

      <div className="pointer-events-none absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-0.5">
        <div className="h-1.5 w-[74px] border-x border-b border-mist-600/70" aria-hidden />
        <span className="font-mono text-[7.5px] uppercase tracking-[0.12em] text-mist-600">
          approx. 2 km
        </span>
      </div>

      <p className="sr-only">
        Offline vector map with six neighbourhoods, three depots and eleven road segments. Use the
        road network screen for a fully keyboard-accessible road list.
      </p>
    </div>
  )
}
```

---

## `src/components/map/mapTypes.ts`

```tsx
import type { Plan, RoadId, Scenario, WardId } from '../../types'

export interface MapViewProps {
  scenario: Scenario
  plan: Plan
  selectedWardId: WardId | null
  selectedRoadId: RoadId | null
  showRoutes: boolean
  onSelectWard: (wardId: WardId) => void
  onSelectRoad: (roadId: RoadId | null) => void
  onTileFailure: () => void
}
```

---

## `src/components/ui/Badge.tsx`

```tsx
import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

export type BadgeTone = 'neutral' | 'teal' | 'amber' | 'red' | 'sky' | 'violet' | 'dark'

const toneClasses: Record<BadgeTone, string> = {
  neutral: 'border-line bg-white/[0.04] text-mist-300',
  teal: 'border-signal/30 bg-signal/10 text-[#7ff0e0]',
  amber: 'border-warn/35 bg-warn/10 text-[#f6c97f]',
  red: 'border-critical/35 bg-critical/10 text-[#fca5a5]',
  sky: 'border-info/30 bg-info/10 text-[#a5e2ff]',
  violet: 'border-plum/30 bg-plum/10 text-[#d8ccff]',
  dark: 'border-line/70 bg-night-950/70 text-mist-400',
}

export interface BadgeProps {
  tone?: BadgeTone
  dot?: boolean
  icon?: ReactNode
  children: ReactNode
  className?: string
  title?: string
}

export function Badge({ tone = 'neutral', dot = false, icon, children, className, title }: BadgeProps) {
  return (
    <span
      title={title}
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded border px-1.5 py-0.5 font-mono text-[9px] font-medium uppercase leading-[1.3] tracking-[0.1em]',
        toneClasses[tone],
        className,
      )}
    >
      {dot ? (
        <span
          aria-hidden
          className={cn(
            'h-1 w-1 rounded-full',
            tone === 'teal'
              ? 'bg-signal'
              : tone === 'amber'
                ? 'bg-warn'
                : tone === 'red'
                  ? 'bg-critical'
                  : tone === 'sky'
                    ? 'bg-info'
                    : tone === 'violet'
                      ? 'bg-plum'
                      : 'bg-mist-400',
          )}
        />
      ) : null}
      {icon}
      {children}
    </span>
  )
}
```

---

## `src/components/ui/Button.tsx`

```tsx
import { Loader2 } from 'lucide-react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'subtle'
type ButtonSize = 'xs' | 'sm' | 'md'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: ReactNode
  trailingIcon?: ReactNode
  loading?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'border border-signal/60 bg-signal text-[#03211d] font-semibold hover:bg-signal-bright hover:border-signal-bright shadow-[0_10px_26px_-14px_rgba(45,212,191,0.9)]',
  secondary:
    'border border-line bg-white/[0.035] text-mist-200 hover:bg-white/[0.075] hover:text-mist-50',
  ghost: 'border border-transparent text-mist-300 hover:bg-white/[0.06] hover:text-mist-50',
  danger: 'border border-critical/35 bg-critical/10 text-[#fca5a5] hover:bg-critical/20 hover:text-[#fecaca]',
  subtle: 'border border-line/70 bg-night-800/80 text-mist-300 hover:bg-night-750 hover:text-mist-100',
}

const sizeClasses: Record<ButtonSize, string> = {
  xs: 'h-7 gap-1.5 rounded-md px-2 text-[10px]',
  sm: 'h-8 gap-1.5 rounded-md px-2.5 text-[11px]',
  md: 'h-9 gap-2 rounded-[7px] px-3.5 text-[12px]',
}

export function Button({
  variant = 'secondary',
  size = 'md',
  icon,
  trailingIcon,
  loading = false,
  className,
  children,
  disabled,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex select-none items-center justify-center whitespace-nowrap font-medium tracking-[0.01em] transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...rest}
    >
      {loading ? <Loader2 aria-hidden size={14} className="animate-spin" /> : icon}
      {children}
      {!loading && trailingIcon}
    </button>
  )
}
```

---

## `src/components/ui/ConfirmDialog.tsx`

```tsx
import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Button } from './Button'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return
    const previous = document.activeElement as HTMLElement | null
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      previous?.focus()
    }
  }, [open, onCancel])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-end justify-center p-3 sm:items-center">
      <button
        type="button"
        aria-label="Close confirmation dialog"
        onClick={onCancel}
        className="absolute inset-0 cursor-default bg-night-950/75 backdrop-blur-[2px]"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
        className="panel fade-in relative z-10 w-full max-w-sm p-4"
      >
        <h2 id="confirm-dialog-title" className="text-[14px] font-medium text-mist-50">
          {title}
        </h2>
        <p id="confirm-dialog-description" className="mt-1.5 text-[11px] leading-relaxed text-mist-400">
          {description}
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button autoFocus variant="secondary" size="sm" onClick={onCancel}>
            Keep current plan
          </Button>
          <Button variant="danger" size="sm" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
```

---

## `src/components/ui/EmptyState.tsx`

```tsx
import { CircleHelp } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface EmptyStateProps {
  title: string
  description: string
  icon?: ReactNode
  action?: ReactNode
  compact?: boolean
  className?: string
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  compact = false,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-lg border border-dashed border-line bg-night-950/30 text-center',
        compact ? 'gap-1.5 px-3 py-4' : 'gap-2 px-5 py-7',
        className,
      )}
    >
      <span className="text-mist-500">{icon ?? <CircleHelp size={compact ? 16 : 20} aria-hidden />}</span>
      <p className="text-[11.5px] font-medium text-mist-200">{title}</p>
      <p className="max-w-sm text-[10.5px] leading-relaxed text-mist-500">{description}</p>
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  )
}
```

---

## `src/components/ui/InfoNote.tsx`

```tsx
import { Info } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface InfoNoteProps {
  children: ReactNode
  icon?: ReactNode
  tone?: 'neutral' | 'teal' | 'amber'
  className?: string
}

export function InfoNote({ children, icon, tone = 'neutral', className }: InfoNoteProps) {
  const toneClass =
    tone === 'teal'
      ? 'border-signal/20 bg-signal/[0.045] text-[#bfe9e3]'
      : tone === 'amber'
        ? 'border-warn/20 bg-warn/[0.05] text-[#ead8b7]'
        : 'border-line/80 bg-night-950/40 text-mist-400'
  return (
    <div className={cn('flex gap-2 rounded-md border p-2.5 text-[10px] leading-relaxed', toneClass, className)}>
      <span className="mt-px shrink-0 opacity-70">{icon ?? <Info size={12} aria-hidden />}</span>
      <div className="min-w-0">{children}</div>
    </div>
  )
}
```

---

## `src/components/ui/Logo.tsx`

```tsx
import { cn } from '../../lib/cn'

export function RescueMark({ size = 30, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      role="img"
      aria-label="RescueGrid mark"
      className={cn('shrink-0', className)}
    >
      <defs>
        <linearGradient id="rg-logo-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5eead4" />
          <stop offset="1" stopColor="#0d9488" />
        </linearGradient>
      </defs>
      <rect x="0.75" y="0.75" width="30.5" height="30.5" rx="8" fill="#081624" />
      <rect x="0.75" y="0.75" width="30.5" height="30.5" rx="8" fill="none" stroke="#1d3a49" strokeWidth="1" />
      <circle cx="16" cy="16" r="8" fill="none" stroke="url(#rg-logo-gradient)" strokeOpacity="0.45" />
      <circle cx="16" cy="16" r="4.2" fill="none" stroke="url(#rg-logo-gradient)" strokeOpacity="0.8" />
      <path
        d="M16 7v4.2M16 20.8V25M7 16h4.2M20.8 16H25"
        stroke="#5eead4"
        strokeWidth="1.35"
        strokeLinecap="round"
      />
      <circle cx="16" cy="16" r="1.7" fill="#5eead4" />
      <path d="M22.2 9.8A8 8 0 0 1 24.4 16" stroke="#5eead4" strokeWidth="1.35" strokeLinecap="round" />
    </svg>
  )
}

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <RescueMark size={compact ? 29 : 31} />
      <div className="leading-none">
        <div className="flex items-baseline gap-1.5">
          <span className="text-[15.5px] font-semibold tracking-[-0.02em] text-mist-50">RescueGrid</span>
          <span className="rounded border border-signal/25 bg-signal/[0.07] px-1 py-px font-mono text-[7.5px] uppercase tracking-[0.14em] text-signal-bright">
            v0.1
          </span>
        </div>
        {compact ? null : (
          <div className="mt-1 font-mono text-[8.5px] uppercase tracking-[0.17em] text-mist-500">
            Sagarika District · Command
          </div>
        )}
      </div>
    </div>
  )
}
```

---

## `src/components/ui/Panel.tsx`

```tsx
import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

export interface PanelProps {
  kicker?: ReactNode
  title?: ReactNode
  subtitle?: ReactNode
  action?: ReactNode
  children: ReactNode
  className?: string
  bodyClassName?: string
  accent?: boolean
  id?: string
}

export function Panel({
  kicker,
  title,
  subtitle,
  action,
  children,
  className,
  bodyClassName,
  accent = false,
  id,
}: PanelProps) {
  const hasHeader = Boolean(kicker || title || action)
  return (
    <section id={id} className={cn('panel min-w-0', accent && 'panel-accent', className)}>
      {hasHeader ? (
        <header className="flex items-start justify-between gap-3 border-b border-line/70 px-3.5 py-2.5">
          <div className="min-w-0">
            {kicker ? <div className="label-micro mb-1">{kicker}</div> : null}
            {title ? (
              <h2 className="text-[13px] font-medium leading-tight tracking-[-0.01em] text-mist-100">{title}</h2>
            ) : null}
            {subtitle ? <p className="mt-1 text-[10.5px] leading-relaxed text-mist-400">{subtitle}</p> : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </header>
      ) : null}
      <div className={cn('min-w-0', bodyClassName ?? 'p-3.5')}>{children}</div>
    </section>
  )
}
```

---

## `src/components/ui/ProgressBar.tsx`

```tsx
import { clamp } from '../../lib/format'
import { cn } from '../../lib/cn'

export type ProgressTone = 'teal' | 'amber' | 'red' | 'sky' | 'violet' | 'mist'

const fillClasses: Record<ProgressTone, string> = {
  teal: 'bg-gradient-to-r from-signal-deep via-signal to-signal-bright',
  amber: 'bg-gradient-to-r from-[#a66b1f] via-warn to-warn-bright',
  red: 'bg-gradient-to-r from-[#b33838] via-critical to-[#fca5a5]',
  sky: 'bg-gradient-to-r from-[#2b7ea1] via-info to-[#bae6fd]',
  violet: 'bg-gradient-to-r from-[#6e5bb5] via-plum to-[#ddd1ff]',
  mist: 'bg-gradient-to-r from-mist-600 via-mist-400 to-mist-200',
}

export interface ProgressBarProps {
  value: number
  label: string
  tone?: ProgressTone
  className?: string
  heightClass?: string
  trackClassName?: string
  showTicks?: boolean
}

export function ProgressBar({
  value,
  label,
  tone = 'teal',
  className,
  heightClass = 'h-1.5',
  trackClassName,
  showTicks = false,
}: ProgressBarProps) {
  const percent = clamp(value, 0, 1) * 100
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(percent)}
      className={cn(
        'relative w-full overflow-hidden rounded-full bg-[#16283a]',
        heightClass,
        trackClassName,
        className,
      )}
    >
      <div
        className={cn('h-full rounded-full transition-[width] duration-500 ease-out', fillClasses[tone])}
        style={{ width: `${percent}%` }}
      />
      {showTicks ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              'repeating-linear-gradient(90deg, transparent 0, transparent calc(10% - 1px), rgba(5,11,19,0.7) calc(10% - 1px), rgba(5,11,19,0.7) 10%)',
          }}
        />
      ) : null}
    </div>
  )
}
```

---

## `src/components/ui/RangeSlider.tsx`

```tsx
import { useId, type CSSProperties } from 'react'
import { cn } from '../../lib/cn'

interface RangeSliderProps {
  label: string
  value: number
  min: number
  max: number
  step?: number
  onChange: (value: number) => void
  onCommit?: () => void
  formatValue?: (value: number) => string
  hint?: string
  leftLabel?: string
  rightLabel?: string
  disabled?: boolean
  className?: string
}

export function RangeSlider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  onCommit,
  formatValue = (next) => String(next),
  hint,
  leftLabel,
  rightLabel,
  disabled = false,
  className,
}: RangeSliderProps) {
  const id = useId()
  const hintId = hint ? `${id}-hint` : undefined
  const percent = max > min ? ((value - min) / (max - min)) * 100 : 0
  const style = { '--fill': `${percent}%` } as CSSProperties

  return (
    <div className={cn('select-none', className)}>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <label htmlFor={id} className="text-[11px] font-medium text-mist-200">
          {label}
        </label>
        <span className="num rounded border border-line/80 bg-night-950/60 px-1.5 py-0.5 text-[10.5px] text-signal-bright">
          {formatValue(value)}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        aria-describedby={hintId}
        aria-valuetext={formatValue(value)}
        onChange={(event) => onChange(Number(event.target.value))}
        onPointerUp={onCommit}
        onKeyUp={onCommit}
        onBlur={onCommit}
        className="range-slider"
        style={style}
      />
      {leftLabel || rightLabel ? (
        <div className="mt-0.5 flex justify-between font-mono text-[8.5px] uppercase tracking-[0.1em] text-mist-600">
          <span>{leftLabel}</span>
          <span>{rightLabel}</span>
        </div>
      ) : null}
      {hint ? (
        <p id={hintId} className="mt-1 text-[10px] leading-snug text-mist-500">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
```

---

## `src/components/ui/ScreenHeader.tsx`

```tsx
import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface ScreenHeaderProps {
  kicker: string
  title: string
  description: ReactNode
  actions?: ReactNode
  className?: string
}

export function ScreenHeader({ kicker, title, description, actions, className }: ScreenHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div className="min-w-0">
        <div className="label-micro mb-1.5">{kicker}</div>
        <h1 className="text-[19px] font-semibold leading-tight tracking-[-0.025em] text-mist-50 sm:text-[21px]">
          {title}
        </h1>
        <p className="mt-1 max-w-2xl text-[11px] leading-relaxed text-mist-400">{description}</p>
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  )
}
```

---

## `src/components/ui/Segmented.tsx`

```tsx
import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

export interface SegmentedOption<T extends string> {
  value: T
  label: ReactNode
  icon?: ReactNode
  title?: string
}

interface SegmentedProps<T extends string> {
  options: SegmentedOption<T>[]
  value: T
  onChange: (value: T) => void
  ariaLabel: string
  className?: string
  size?: 'xs' | 'sm'
  fullWidth?: boolean
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  className,
  size = 'sm',
  fullWidth = false,
}: SegmentedProps<T>) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn(
        'inline-flex items-center rounded-md border border-line bg-night-950/70 p-0.5',
        fullWidth && 'flex w-full',
        className,
      )}
    >
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            title={option.title}
            onClick={() => onChange(option.value)}
            className={cn(
              'inline-flex items-center justify-center gap-1.5 rounded-[4px] font-medium transition-colors duration-150',
              size === 'xs' ? 'h-6 px-1.5 text-[9.5px]' : 'h-7 px-2.5 text-[10.5px]',
              fullWidth && 'flex-1',
              active
                ? 'bg-night-700 text-mist-50 shadow-[inset_0_0_0_1px_rgba(120,158,190,0.16)]'
                : 'text-mist-400 hover:bg-white/[0.045] hover:text-mist-200',
            )}
          >
            {option.icon}
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
```

---

## `src/components/ui/StatCard.tsx`

```tsx
import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { ProgressBar, type ProgressTone } from './ProgressBar'

interface StatCardProps {
  label: string
  value: ReactNode
  unit?: string
  caption?: ReactNode
  icon?: ReactNode
  tone?: 'default' | 'teal' | 'amber' | 'red' | 'sky' | 'violet'
  progress?: number
  progressTone?: ProgressTone
  className?: string
}

const valueTone: Record<NonNullable<StatCardProps['tone']>, string> = {
  default: 'text-mist-50',
  teal: 'text-signal-bright',
  amber: 'text-[#f6c97f]',
  red: 'text-[#fca5a5]',
  sky: 'text-[#a5e2ff]',
  violet: 'text-[#d8ccff]',
}

export function StatCard({
  label,
  value,
  unit,
  caption,
  icon,
  tone = 'default',
  progress,
  progressTone = 'teal',
  className,
}: StatCardProps) {
  return (
    <article
      className={cn(
        'panel group relative flex min-h-[88px] min-w-0 flex-col justify-between overflow-hidden p-3',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="label-tiny pr-1 leading-[1.25] text-mist-500">{label}</span>
        {icon ? <span className="mt-px shrink-0 text-mist-500 transition-colors group-hover:text-mist-300">{icon}</span> : null}
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className={cn('num text-[21px] font-medium leading-none', valueTone[tone])}>{value}</span>
        {unit ? <span className="text-[9.5px] font-medium text-mist-500">{unit}</span> : null}
      </div>
      <div className="mt-2">
        {typeof progress === 'number' ? (
          <ProgressBar
            value={progress}
            label={`${label} progress`}
            tone={progressTone}
            heightClass="h-[3px]"
            className="mb-1.5"
          />
        ) : null}
        {caption ? <div className="text-[9.5px] leading-snug text-mist-500">{caption}</div> : null}
      </div>
    </article>
  )
}
```

---

## `src/data/sagarika.ts`

```tsx
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
```

---

## `src/index.css`

_(binary or asset file)_

---

## `src/lib/__tests__/allocation.test.ts`

```tsx
import { describe, expect, it } from 'vitest'
import { createScenario } from '../../data/sagarika'
import { RUNS_PER_VEHICLE, SUPPLY_TYPES } from '../constants'
import { allocate } from '../allocation'
import { computeComparisons } from '../plan'
import type { RoadState, Scenario } from '../../types'

function scenarioWithRoads(roadIds: string[], state: RoadState): Scenario {
  const scenario = createScenario('coastal-cyclone')
  return {
    ...scenario,
    roads: scenario.roads.map((road) =>
      roadIds.includes(road.id) ? { ...road, state } : road,
    ),
  }
}

describe('deterministic allocator', () => {
  it('never allocates more than a ward requested', () => {
    const scenario = createScenario('coastal-cyclone')
    for (const strategy of ['optimizer', 'nearest', 'proportional'] as const) {
      const result = allocate(scenario, strategy, 55)
      for (const ward of scenario.wards) {
        for (const supply of SUPPLY_TYPES) {
          const delivered = result.deliveries
            .filter((entry) => entry.wardId === ward.id && entry.supply === supply)
            .reduce((sum, entry) => sum + entry.units, 0)
          expect(delivered).toBeLessThanOrEqual(ward.demand[supply])
          expect(delivered).toBeGreaterThanOrEqual(0)
        }
      }
    }
  })

  it('never leaves a depot with negative stock', () => {
    const scenario = createScenario('coastal-cyclone')
    const result = allocate(scenario, 'optimizer', 55)
    for (const depot of result.depotInventory) {
      for (const supply of SUPPLY_TYPES) {
        expect(depot.remaining[supply]).toBeGreaterThanOrEqual(0)
        expect(depot.dispatched[supply]).toBeGreaterThanOrEqual(0)
        expect(depot.dispatched[supply]).toBeLessThanOrEqual(depot.openingStock[supply])
        expect(depot.openingStock[supply] - depot.dispatched[supply]).toBeCloseTo(
          depot.remaining[supply],
          6,
        )
      }
    }
  })

  it('respects vehicle capacity and the run budget', () => {
    const scenario = createScenario('coastal-cyclone')
    const result = allocate(scenario, 'optimizer', 55)
    for (const delivery of result.deliveries) {
      expect(delivery.trips).toBeGreaterThan(0)
      expect(delivery.units).toBeLessThanOrEqual(delivery.vehicleCapacityUnits * delivery.trips)
      expect(delivery.units).toBeGreaterThan(0)
    }
    for (const usage of result.fleet) {
      if (!usage.available) {
        expect(usage.runsUsed).toBe(0)
        continue
      }
      expect(usage.runsUsed).toBeLessThanOrEqual(RUNS_PER_VEHICLE)
      expect(usage.unitsMoved).toBeLessThanOrEqual(usage.capacityUnits * RUNS_PER_VEHICLE)
    }
    const moved = result.fleet.reduce((sum, usage) => sum + usage.unitsMoved, 0)
    expect(moved).toBeLessThanOrEqual(result.fleetCapacityOffered)
    expect(result.fleetCapacityMoved).toBe(moved)
  })

  it('never routes a delivery from an unreachable depot', () => {
    const scenario = scenarioWithRoads(['road-beach', 'road-colony-link'], 'blocked')
    const result = allocate(scenario, 'optimizer', 55)
    const harbourDeliveries = result.deliveries.filter((entry) => entry.wardId === 'ward-harbour')
    expect(harbourDeliveries.length).toBeGreaterThan(0)
    expect(harbourDeliveries.every((entry) => entry.depotId !== 'depot-b')).toBe(true)
    expect(harbourDeliveries.every((entry) => entry.path.length > 0)).toBe(true)
  })

  it('records unreachable demand instead of allocating it', () => {
    const scenario = scenarioWithRoads(['road-ridge', 'road-east-bypass'], 'blocked')
    const result = allocate(scenario, 'optimizer', 55)

    expect(result.deliveries.some((entry) => entry.wardId === 'ward-hillview')).toBe(false)
    const hillview = result.unserved.filter((entry) => entry.wardId === 'ward-hillview')
    expect(hillview.length).toBe(SUPPLY_TYPES.length)
    expect(hillview.every((entry) => entry.reason === 'unreachable')).toBe(true)
    expect(result.reachability.find((entry) => entry.wardId === 'ward-hillview')?.reachable).toBe(false)
  })

  it('is deterministic for repeated runs', () => {
    const scenario = createScenario('coastal-cyclone')
    const first = allocate(scenario, 'optimizer', 55)
    const second = allocate(scenario, 'optimizer', 55)
    expect(second).toEqual(first)
  })

  it('does not mutate the scenario it is given', () => {
    const scenario = createScenario('coastal-cyclone')
    const snapshot = JSON.parse(JSON.stringify(scenario))
    allocate(scenario, 'optimizer', 55)
    expect(scenario).toEqual(snapshot)
  })

  it('gives every strategy identical starting conditions', () => {
    const scenario = createScenario('coastal-cyclone')
    const snapshot = JSON.parse(JSON.stringify(scenario))
    const plans = computeComparisons(scenario, 55)

    for (const strategy of ['optimizer', 'nearest', 'proportional'] as const) {
      const plan = plans[strategy]
      expect(plan.totals.demand).toBe(
        scenario.wards.reduce(
          (sum, ward) => sum + SUPPLY_TYPES.reduce((s, supply) => s + ward.demand[supply], 0),
          0,
        ),
      )
      expect(plan.totals.stock).toBe(
        scenario.depots.reduce(
          (sum, depot) => sum + SUPPLY_TYPES.reduce((s, supply) => s + depot.stock[supply], 0),
          0,
        ),
      )
      for (const supply of SUPPLY_TYPES) {
        expect(plan.supplies[supply].stock).toBe(
          scenario.depots.reduce((sum, depot) => sum + depot.stock[supply], 0),
        )
        expect(plan.supplies[supply].allocated).toBeLessThanOrEqual(plan.supplies[supply].stock)
      }
      expect(plan.totals.fleetCapacityOffered).toBe(
        scenario.vehicles
          .filter((vehicle) => vehicle.status === 'available')
          .reduce((sum, vehicle) => sum + vehicle.capacityUnits * RUNS_PER_VEHICLE, 0),
      )
    }

    expect(scenario).toEqual(snapshot)
  })

  it('holds back deliveries when every vehicle is unavailable', () => {
    const scenario = createScenario('coastal-cyclone')
    const withoutFleet: Scenario = {
      ...scenario,
      vehicles: scenario.vehicles.map((vehicle) => ({ ...vehicle, status: 'maintenance' as const })),
    }
    const result = allocate(withoutFleet, 'optimizer', 55)
    expect(result.deliveries).toEqual([])
    expect(result.unserved.every((entry) => entry.reason === 'fleet' || entry.reason === 'unreachable')).toBe(
      true,
    )
    expect(result.fleetCapacityMoved).toBe(0)
  })
})
```

---

## `src/lib/__tests__/routing.test.ts`

```tsx
import { describe, expect, it } from 'vitest'
import { BASE_ROADS } from '../../data/sagarika'
import type { Road, RoadId, RoadState } from '../../types'
import { buildGraph, findRoute } from '../routing'

const allOpen = (): Road[] => BASE_ROADS.map((road) => ({ ...road, state: 'open' as RoadState }))

function withState(base: Road[], roadId: RoadId, state: RoadState): Road[] {
  return base.map((road) => (road.id === roadId ? { ...road, state } : road))
}

describe('Dijkstra routing', () => {
  it('selects the shortest path when several routes exist', () => {
    const route = findRoute(allOpen(), 'depot-b', 'ward-harbour')
    expect(route.reachable).toBe(true)
    expect(route.path).toEqual(['road-beach'])
    expect(route.distanceKm).toBeCloseTo(2.4, 5)
    expect(route.reason).toBe('ok')
  })

  it('chooses the lower-distance chain instead of a longer alternative', () => {
    const route = findRoute(allOpen(), 'depot-a', 'ward-east-market')
    expect(route.reachable).toBe(true)
    expect(route.path).toEqual(['road-old-town-spine', 'road-market-connector'])
    expect(route.distanceKm).toBeCloseTo(6.4, 5)
  })

  it('excludes blocked segments and returns the detour', () => {
    const roads = withState(allOpen(), 'road-beach', 'blocked')
    const graph = buildGraph(roads)
    const beachUsed = (graph.adjacency.get('depot-b') ?? []).some((edge) => edge.road.id === 'road-beach')
    expect(beachUsed).toBe(false)

    const route = findRoute(roads, 'depot-b', 'ward-harbour')
    expect(route.reachable).toBe(true)
    expect(route.path).not.toContain('road-beach')
    expect(route.path).toEqual(['road-colony-link', 'road-south-causeway'])
    expect(route.distanceKm).toBeCloseTo(4.9, 5)
  })

  it('returns an explicit unreachable result instead of inventing a route', () => {
    let roads = withState(allOpen(), 'road-ridge', 'blocked')
    roads = withState(roads, 'road-east-bypass', 'blocked')
    const route = findRoute(roads, 'depot-a', 'ward-hillview')
    expect(route.reachable).toBe(false)
    expect(route.reason).toBe('no-open-route')
    expect(route.path).toEqual([])
    expect(route.geometry).toEqual([])
    expect(Number.isFinite(route.distanceKm)).toBe(false)
  })

  it('charges the fixed congestion multiplier on congested segments', () => {
    const roads = withState(allOpen(), 'road-beach', 'congested')
    const route = findRoute(roads, 'depot-b', 'ward-harbour')
    expect(route.distanceKm).toBeCloseTo(2.4, 5)
    expect(route.costKm).toBeCloseTo(2.4 * 1.55, 5)
    expect(route.delayKm).toBeCloseTo(2.4 * 0.55, 5)
  })

  it('is deterministic across repeated calls', () => {
    const roads = allOpen()
    const first = findRoute(roads, 'depot-a', 'ward-harbour')
    const second = findRoute(roads, 'depot-a', 'ward-harbour')
    expect(second).toEqual(first)
  })
})
```

---

## `src/lib/allocation.ts`

```tsx
import { RUNS_PER_VEHICLE, SUPPLY_META, SUPPLY_TYPES } from './constants'
import { clamp, formatNumber } from './format'
import { priorityWeight } from './priority'
import { findRoute, roadsWithState, runDistanceKm, runHours, type RouteResult } from './routing'
import type {
  Depot,
  DepotId,
  DepotInventory,
  PlanAllocation,
  ReachabilityEntry,
  Scenario,
  StrategyId,
  SupplyType,
  SupplyValues,
  UnservedDemand,
  UnservedReason,
  Vehicle,
  VehicleUsage,
  Ward,
  WardId,
} from '../types'

export interface AllocationResult {
  strategy: StrategyId
  priority: number
  deliveries: PlanAllocation[]
  unserved: UnservedDemand[]
  depotInventory: DepotInventory[]
  fleet: VehicleUsage[]
  reachability: ReachabilityEntry[]
  routeDistanceKm: number
  routeTimeHours: number
  fleetCapacityOffered: number
  fleetCapacityMoved: number
  priorityWeights: Record<WardId, number>
}

interface FleetUnit {
  vehicle: Vehicle
  runsLeft: number
  runsUsed: number
  unitsMoved: number
}

function emptySupplyValues(): SupplyValues {
  return { water: 0, medical: 0, food: 0 }
}

function wardDemandUnits(ward: Ward): number {
  return SUPPLY_TYPES.reduce((sum, supply) => sum + ward.demand[supply], 0)
}

function roundTripKmFor(distanceKm: number, trips: number): number {
  return runDistanceKm(distanceKm) * trips
}

/**
 * Distribute a supply pool across wards in proportion to their population,
 * capped at each ward's requested units. Whole units are assigned with the
 * largest-remainder method so the result is deterministic and sums to the pool.
 */
export function proportionalTargets(
  wards: Ward[],
  pool: number,
  supply: SupplyType,
): Record<WardId, number> {
  const targets = {} as Record<WardId, number>
  for (const ward of wards) targets[ward.id] = 0
  if (pool <= 0) return targets

  const totalPopulation = wards.reduce((sum, ward) => sum + ward.population, 0)
  if (totalPopulation <= 0) return targets

  const remainders: Array<{ wardId: WardId; remainder: number; population: number }> = []
  let assigned = 0

  for (const ward of wards) {
    const share = (ward.population / totalPopulation) * pool
    const want = Math.min(ward.demand[supply], Math.max(0, share))
    const whole = Math.floor(want)
    targets[ward.id] = whole
    assigned += whole
    remainders.push({ wardId: ward.id, remainder: want - whole, population: ward.population })
  }

  let remaining = Math.max(0, pool - assigned)
  remainders.sort((a, b) => {
    if (Math.abs(b.remainder - a.remainder) > 1e-9) return b.remainder - a.remainder
    if (b.population !== a.population) return b.population - a.population
    return a.wardId.localeCompare(b.wardId)
  })

  let guard = 0
  while (remaining > 0 && guard < pool + wards.length * 4) {
    let progressed = false
    for (const entry of remainders) {
      if (remaining <= 0) break
      const ward = wards.find((candidate) => candidate.id === entry.wardId)
      if (!ward) continue
      if (targets[entry.wardId] >= ward.demand[supply]) continue
      targets[entry.wardId] += 1
      remaining -= 1
      progressed = true
    }
    if (!progressed) break
    guard += 1
  }

  return targets
}

/**
 * Deterministic greedy allocator.
 *
 * Constraints enforced for every delivery:
 *  - depot stock for that supply (never negative),
 *  - ward's remaining requested units (never over-allocated),
 *  - one available vehicle per delivery with finite capacity per run,
 *  - each vehicle's run budget (RUNS_PER_VEHICLE) is consumed by whole trips,
 *  - only routes that exist on the current open graph are used.
 *
 * Delivery order differs by strategy; the feasibility rules do not. Each call
 * works on its own deep copies of demand, stock and vehicles, so running a
 * strategy never consumes inventory from another run.
 */
export function allocate(
  scenario: Scenario,
  strategy: StrategyId,
  priority: number,
): AllocationResult {
  const priorityValue = clamp(priority, 0, 100)

  const wards = scenario.wards.map((ward) => ({ ...ward, demand: { ...ward.demand } }))
  const depots = scenario.depots.map((depot) => ({ ...depot, stock: { ...depot.stock } }))
  const vehicles = scenario.vehicles.map((vehicle) => ({ ...vehicle }))
  const roads = scenario.roads.map((road) => ({ ...road }))

  const stock = new Map<DepotId, SupplyValues>()
  const opening = new Map<DepotId, SupplyValues>()
  for (const depot of depots) {
    stock.set(depot.id, { ...depot.stock })
    opening.set(depot.id, { ...depot.stock })
  }

  const openRoads = roadsWithState(roads, 'open')
  const routeCache = new Map<string, RouteResult>()
  function routeFor(depotId: DepotId, wardId: WardId): RouteResult {
    const key = `${depotId}|${wardId}`
    const cached = routeCache.get(key)
    if (cached) return cached
    const result = findRoute(roads, depotId, wardId)
    routeCache.set(key, result)
    return result
  }
  const baselineCache = new Map<string, RouteResult>()
  function baselineRouteFor(depotId: DepotId, wardId: WardId): RouteResult {
    const key = `${depotId}|${wardId}`
    const cached = baselineCache.get(key)
    if (cached) return cached
    const result = findRoute(openRoads, depotId, wardId)
    baselineCache.set(key, result)
    return result
  }

  const reachability: ReachabilityEntry[] = wards.map((ward) => {
    let best: { depotId: DepotId; distanceKm: number; costKm: number } | null = null
    for (const depot of depots) {
      const route = routeFor(depot.id, ward.id)
      if (!route.reachable) continue
      if (!best || route.costKm < best.costKm - 1e-9) {
        best = { depotId: depot.id, distanceKm: route.distanceKm, costKm: route.costKm }
      }
    }
    return {
      wardId: ward.id,
      reachable: best !== null,
      nearestDepotId: best?.depotId ?? null,
      distanceKm: best ? best.distanceKm : null,
      costKm: best ? best.costKm : null,
    }
  })
  const nearestByWard = new Map(reachability.map((entry) => [entry.wardId, entry]))

  const fleetUnits: FleetUnit[] = vehicles
    .filter((vehicle) => vehicle.status === 'available')
    .map((vehicle) => ({ vehicle, runsLeft: RUNS_PER_VEHICLE, runsUsed: 0, unitsMoved: 0 }))
    .sort((a, b) => {
      if (b.vehicle.capacityUnits !== a.vehicle.capacityUnits) {
        return b.vehicle.capacityUnits - a.vehicle.capacityUnits
      }
      return a.vehicle.id.localeCompare(b.vehicle.id)
    })

  const fleetByDepot = new Map<DepotId, FleetUnit[]>()
  for (const unit of fleetUnits) {
    const list = fleetByDepot.get(unit.vehicle.depotId)
    if (list) list.push(unit)
    else fleetByDepot.set(unit.vehicle.depotId, [unit])
  }

  const delivered = new Map<WardId, SupplyValues>()
  for (const ward of wards) delivered.set(ward.id, emptySupplyValues())
  const deliveries: PlanAllocation[] = []

  function dispatch(
    ward: Ward,
    depotId: DepotId,
    supply: SupplyType,
    wanted: number,
  ): PlanAllocation | null {
    if (!(wanted > 0)) return null
    const depotStock = stock.get(depotId)
    if (!depotStock) return null
    const availableStock = depotStock[supply]
    if (!(availableStock > 0)) return null

    const unit = (fleetByDepot.get(depotId) ?? []).find((candidate) => candidate.runsLeft > 0)
    if (!unit) return null

    const route = routeFor(depotId, ward.id)
    if (!route.reachable) return null

    const capacity = Math.max(1, unit.vehicle.capacityUnits)
    const freightAllowed = unit.runsLeft * capacity
    let units = Math.floor(Math.min(wanted, availableStock, freightAllowed))
    if (units <= 0) return null

    let trips = Math.ceil(units / capacity)
    if (trips > unit.runsLeft) {
      trips = unit.runsLeft
      units = trips * capacity
    }
    if (units <= 0) return null

    const baseline = baselineRouteFor(depotId, ward.id)
    const detourKm = baseline.reachable ? Math.max(0, route.distanceKm - baseline.distanceKm) : 0
    const hours = trips * runHours(unit.vehicle, route.distanceKm, route.delayKm)

    const record: PlanAllocation = {
      wardId: ward.id,
      depotId,
      supply,
      units,
      distanceKm: route.distanceKm,
      delayKm: route.delayKm,
      detourKm,
      path: [...route.path],
      trips,
      vehicleId: unit.vehicle.id,
      vehicleHours: hours,
      vehicleCapacityUnits: capacity,
      roundTripKm: roundTripKmFor(route.distanceKm, trips),
    }

    depotStock[supply] = Math.max(0, availableStock - units)
    unit.runsLeft -= trips
    unit.runsUsed += trips
    unit.unitsMoved += units
    const wardDelivered = delivered.get(ward.id)
    if (wardDelivered) wardDelivered[supply] += units
    deliveries.push(record)

    return record
  }

  const weights = {} as Record<WardId, number>
  for (const ward of wards) weights[ward.id] = priorityWeight(ward)

  const totalDemand = wards.reduce((sum, ward) => sum + wardDemandUnits(ward), 0)
  const maxWeight = Math.max(...wards.map((ward) => weights[ward.id]), 0)
  const p = priorityValue / 100

  const scoreFor = (ward: Ward): number => {
    const demandShare = totalDemand > 0 ? wardDemandUnits(ward) / totalDemand : 0
    const needShare = maxWeight > 0 ? weights[ward.id] / maxWeight : 0
    return (1 - p) * demandShare + p * needShare
  }

  const costFor = (ward: Ward): number => nearestByWard.get(ward.id)?.costKm ?? Number.POSITIVE_INFINITY

  const optimizerOrder = [...wards].sort((a, b) => {
    const diff = scoreFor(b) - scoreFor(a)
    if (Math.abs(diff) > 1e-9) return diff
    if (b.urgency !== a.urgency) return b.urgency - a.urgency
    return a.id.localeCompare(b.id)
  })

  const nearestOrder = [...wards].sort((a, b) => {
    const diff = costFor(a) - costFor(b)
    if (Number.isFinite(diff) && Math.abs(diff) > 1e-9) return diff
    if (Number.isFinite(costFor(a)) !== Number.isFinite(costFor(b))) {
      return Number.isFinite(costFor(a)) ? -1 : 1
    }
    if (b.urgency !== a.urgency) return b.urgency - a.urgency
    return a.id.localeCompare(b.id)
  })

  const proportionalOrder = [...wards].sort((a, b) => {
    if (b.population !== a.population) return b.population - a.population
    return a.id.localeCompare(b.id)
  })

  const proportionalTargetsBySupply = new Map<SupplyType, Record<WardId, number>>()
  if (strategy === 'proportional') {
    for (const supply of SUPPLY_TYPES) {
      const pool = depots.reduce((sum, depot) => sum + depot.stock[supply], 0)
      proportionalTargetsBySupply.set(supply, proportionalTargets(wards, pool, supply))
    }
  }

  const order = strategy === 'nearest' ? nearestOrder : strategy === 'proportional' ? proportionalOrder : optimizerOrder

  const depotOrder = (ward: Ward): Depot[] =>
    [...depots].sort((a, b) => {
      const routeA = routeFor(a.id, ward.id)
      const routeB = routeFor(b.id, ward.id)
      const ca = routeA.reachable ? routeA.costKm : Number.POSITIVE_INFINITY
      const cb = routeB.reachable ? routeB.costKm : Number.POSITIVE_INFINITY
      if (Number.isFinite(ca) !== Number.isFinite(cb)) return Number.isFinite(ca) ? -1 : 1
      if (Number.isFinite(ca) && Math.abs(ca - cb) > 1e-9) return ca - cb
      return a.id.localeCompare(b.id)
    })

  for (const ward of order) {
    const depotList = depotOrder(ward)
    for (const supply of SUPPLY_TYPES) {
      const targets = proportionalTargetsBySupply.get(supply)
      let wanted = ward.demand[supply] - (delivered.get(ward.id)?.[supply] ?? 0)
      if (targets) {
        wanted = Math.min(wanted, targets[ward.id] - (delivered.get(ward.id)?.[supply] ?? 0))
      }
      if (!(wanted > 0)) continue

      for (const depot of depotList) {
        if (wanted <= 0) break
        const route = routeFor(depot.id, ward.id)
        if (!route.reachable) continue
        const record = dispatch(ward, depot.id, supply, wanted)
        if (!record) continue
        wanted -= record.units
      }
    }
  }

  const unserved: UnservedDemand[] = []
  for (const ward of wards) {
    const reachableDepots = depots.filter((depot) => routeFor(depot.id, ward.id).reachable)
    for (const supply of SUPPLY_TYPES) {
      const unmet = ward.demand[supply] - (delivered.get(ward.id)?.[supply] ?? 0)
      if (!(unmet > 0)) continue

      let reason: UnservedReason
      let detail: string
      if (reachableDepots.length === 0) {
        reason = 'unreachable'
        detail = `No open road connects ${ward.shortName} to any depot, so no delivery can be routed.`
      } else {
        const stockLeft = reachableDepots.reduce((sum, depot) => sum + (stock.get(depot.id)?.[supply] ?? 0), 0)
        const fleetLeft = reachableDepots.reduce(
          (sum, depot) =>
            sum +
            (fleetByDepot.get(depot.id) ?? []).reduce(
              (fleetSum, unit) => fleetSum + unit.runsLeft * unit.vehicle.capacityUnits,
              0,
            ),
          0,
        )
        if (stockLeft <= 0) {
          reason = 'stock'
          detail = `${SUPPLY_META[supply].shortLabel} stock at every reachable depot is exhausted.`
        } else if (fleetLeft <= 0) {
          reason = 'fleet'
          detail = `${formatNumber(stockLeft)} units remain at reachable depots, but the available vehicles have no runs left.`
        } else {
          reason = 'stock'
          detail = `Reachable stock was committed to higher-ranked wards before ${ward.shortName} was served.`
        }
      }

      unserved.push({ wardId: ward.id, supply, units: unmet, reason, detail })
    }
  }

  const depotInventory: DepotInventory[] = depots.map((depot) => {
    const openingStock = opening.get(depot.id) ?? emptySupplyValues()
    const remaining = stock.get(depot.id) ?? emptySupplyValues()
    return {
      depotId: depot.id,
      openingStock: { ...openingStock },
      remaining: { ...remaining },
      dispatched: {
        water: openingStock.water - remaining.water,
        medical: openingStock.medical - remaining.medical,
        food: openingStock.food - remaining.food,
      },
    }
  })

  const fleet: VehicleUsage[] = vehicles.map((vehicle) => {
    const unit = fleetUnits.find((candidate) => candidate.vehicle.id === vehicle.id)
    return {
      vehicleId: vehicle.id,
      depotId: vehicle.depotId,
      capacityUnits: vehicle.capacityUnits,
      runBudget: unit ? RUNS_PER_VEHICLE : 0,
      runsUsed: unit?.runsUsed ?? 0,
      unitsMoved: unit?.unitsMoved ?? 0,
      capacityOffered: unit ? unit.vehicle.capacityUnits * RUNS_PER_VEHICLE : 0,
      available: vehicle.status === 'available',
    }
  })

  const routeDistanceKm = deliveries.reduce((sum, delivery) => sum + delivery.roundTripKm, 0)
  const routeTimeHours = deliveries.reduce((sum, delivery) => sum + delivery.vehicleHours, 0)
  const fleetCapacityOffered = fleet.reduce((sum, usage) => sum + usage.capacityOffered, 0)
  const fleetCapacityMoved = fleet.reduce((sum, usage) => sum + usage.unitsMoved, 0)

  return {
    strategy,
    priority: priorityValue,
    deliveries,
    unserved,
    depotInventory,
    fleet,
    reachability,
    routeDistanceKm,
    routeTimeHours,
    fleetCapacityOffered,
    fleetCapacityMoved,
    priorityWeights: weights,
  }
}
```

---

## `src/lib/cn.ts`

```tsx
export function cn(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(' ')
}
```

---

## `src/lib/constants.ts`

```tsx
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
```

---

## `src/lib/explain.ts`

```tsx
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

```

---

## `src/lib/format.ts`

```tsx
const numberFormatter = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 })
const decimalFormatter = new Intl.NumberFormat('en-IN', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

export function formatNumber(value: number): string {
  return numberFormatter.format(Math.round(value))
}

export function formatDecimal(value: number): string {
  return decimalFormatter.format(value)
}

export function formatPct(ratio: number, digits = 0): string {
  if (!Number.isFinite(ratio)) return '—'
  return `${(ratio * 100).toFixed(digits)}%`
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function formatClock(timestamp: number): string {
  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(timestamp)
}

export function formatShortTime(timestamp: number): string {
  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(timestamp)
}

export function formatDateTime(timestamp: number): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(timestamp)
}

export function formatRelative(timestamp: number, now: number): string {
  const minutes = Math.max(0, Math.round((now - timestamp) / 60000))
  if (minutes < 1) return 'just now'
  if (minutes === 1) return '1 min ago'
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} h ago`
  return `${Math.floor(hours / 24)} d ago`
}

export function formatHours(hours: number): string {
  return `${formatDecimal(hours)} h`
}

export function percentOf(value: number, total: number): number {
  if (total <= 0) return 0
  return clamp(value / total, 0, 1)
}
```

---

## `src/lib/map.ts`

```tsx
import type { LatLng } from '../types'

export const MAP_BOUNDS = {
  north: 14.528,
  south: 14.398,
  west: 79.892,
  east: 80.062,
} as const

export const SVG_VIEW = { width: 1000, height: 640 } as const

export const LEAFLET_BOUNDS: [[number, number], [number, number]] = [
  [14.407, 79.93],
  [14.515, 80.05],
]

export const MAP_CENTER: [number, number] = [14.461, 79.995]

export interface ProjectedPoint {
  x: number
  y: number
}

export function projectToMap(point: LatLng): ProjectedPoint {
  const x = ((point.lng - MAP_BOUNDS.west) / (MAP_BOUNDS.east - MAP_BOUNDS.west)) * SVG_VIEW.width
  const y = ((MAP_BOUNDS.north - point.lat) / (MAP_BOUNDS.north - MAP_BOUNDS.south)) * SVG_VIEW.height
  return { x, y }
}

export function mapPolyline(points: LatLng[], closed = false): string {
  if (points.length === 0) return ''
  const projected = points.map(projectToMap)
  const commands = projected.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
  return `${commands.join(' ')}${closed ? ' Z' : ''}`
}

export function mapSmoothPath(points: LatLng[], closed = false): string {
  if (points.length < 3) return mapPolyline(points, closed)
  const p = points.map(projectToMap)
  const segments: string[] = [`M ${p[0].x.toFixed(2)} ${p[0].y.toFixed(2)}`]
  const count = closed ? p.length : p.length - 1

  for (let index = 0; index < count; index += 1) {
    const p0 = p[(index - 1 + p.length) % p.length] ?? p[index]
    const p1 = p[index]
    const p2 = p[(index + 1) % p.length]
    const p3 = p[(index + 2) % p.length] ?? p2
    const cp1x = p1.x + (p2.x - p0.x) / 6
    const cp1y = p1.y + (p2.y - p0.y) / 6
    const cp2x = p2.x - (p3.x - p1.x) / 6
    const cp2y = p2.y - (p3.y - p1.y) / 6
    segments.push(
      `C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`,
    )
  }

  if (closed) segments.push('Z')
  return segments.join(' ')
}

export function projectPointAtFraction(points: LatLng[], fraction: number): ProjectedPoint | null {
  if (points.length === 0) return null
  if (points.length === 1) return projectToMap(points[0])

  const projected = points.map(projectToMap)
  const lengths: number[] = []
  let total = 0
  for (let index = 0; index < projected.length - 1; index += 1) {
    const dx = projected[index + 1].x - projected[index].x
    const dy = projected[index + 1].y - projected[index].y
    const length = Math.hypot(dx, dy)
    lengths.push(length)
    total += length
  }

  let target = Math.max(0, Math.min(1, fraction)) * total
  for (let index = 0; index < lengths.length; index += 1) {
    if (target <= lengths[index] || index === lengths.length - 1) {
      const ratio = lengths[index] > 0 ? target / lengths[index] : 0
      const start = projected[index]
      const end = projected[index + 1]
      return {
        x: start.x + (end.x - start.x) * ratio,
        y: start.y + (end.y - start.y) * ratio,
      }
    }
    target -= lengths[index]
  }

  return projected[projected.length - 1]
}

export function roadLabelPosition(geometry: LatLng[], fraction = 0.58, offset = 13): ProjectedPoint | null {
  if (geometry.length < 2) return null
  const projected = geometry.map(projectToMap)
  const anchor = projectPointAtFraction(geometry, fraction)
  if (!anchor) return null

  const total = projected.reduce((sum, point, index) => {
    if (index === 0) return 0
    return sum + Math.hypot(point.x - projected[index - 1].x, point.y - projected[index - 1].y)
  }, 0)
  let target = total * fraction
  for (let index = 0; index < projected.length - 1; index += 1) {
    const start = projected[index]
    const end = projected[index + 1]
    const length = Math.hypot(end.x - start.x, end.y - start.y)
    if (target <= length || index === projected.length - 2) {
      const dx = end.x - start.x
      const dy = end.y - start.y
      const norm = Math.max(1, Math.hypot(dx, dy))
      return {
        x: anchor.x + (-dy / norm) * offset,
        y: anchor.y + (dx / norm) * offset,
      }
    }
    target -= length
  }
  return { x: anchor.x, y: anchor.y + offset }
}

export function midpointOf(points: LatLng[], fraction = 0.5): LatLng {
  if (points.length === 0) return { lat: MAP_CENTER[0], lng: MAP_CENTER[1] }
  if (points.length === 1) return points[0]
  const index = Math.max(0, Math.min(points.length - 1, Math.round((points.length - 1) * fraction)))
  return points[index]
}

/** A decorative coastline for the fictional district, in the same coordinate system as the data. */
export const COASTLINE: LatLng[] = [
  { lat: 14.53, lng: 80.034 },
  { lat: 14.516, lng: 80.041 },
  { lat: 14.505, lng: 80.044 },
  { lat: 14.493, lng: 80.048 },
  { lat: 14.48, lng: 80.051 },
  { lat: 14.468, lng: 80.052 },
  { lat: 14.456, lng: 80.047 },
  { lat: 14.446, lng: 80.05 },
  { lat: 14.434, lng: 80.056 },
  { lat: 14.421, lng: 80.055 },
  { lat: 14.409, lng: 80.051 },
  { lat: 14.394, lng: 80.06 },
]

export const RIVER_PATH: LatLng[] = [
  { lat: 14.525, lng: 79.912 },
  { lat: 14.512, lng: 79.938 },
  { lat: 14.503, lng: 79.957 },
  { lat: 14.494, lng: 79.972 },
  { lat: 14.487, lng: 79.982 },
  { lat: 14.478, lng: 79.993 },
  { lat: 14.464, lng: 80.006 },
  { lat: 14.448, lng: 80.019 },
  { lat: 14.43, lng: 80.03 },
  { lat: 14.415, lng: 80.04 },
  { lat: 14.401, lng: 80.049 },
]
```

---

## `src/lib/plan.ts`

```tsx
import type {
  DepotId,
  Plan,
  PlanAllocation,
  PlanBottleneck,
  PlanRoute,
  PlanTotals,
  RouteTrace,
  Scenario,
  StrategyId,
  SupplyTotals,
  SupplyType,
  SupplyValues,
  UnservedReason,
  WardPlan,
} from '../types'
import { RUNS_PER_VEHICLE, SUPPLY_META, SUPPLY_TYPES } from './constants'
import { allocate } from './allocation'
import { clamp, formatDecimal, formatNumber, formatPct } from './format'
import { weightedUnmet } from './priority'
import { cloneScenario } from './scenario'

const emptySupplyValues = (): SupplyValues => ({ water: 0, medical: 0, food: 0 })

function aggregateRoutes(allocations: PlanAllocation[]): PlanRoute[] {
  const routeMap = new Map<string, PlanRoute>()
  for (const allocation of allocations) {
    const key = `${allocation.depotId}|${allocation.wardId}`
    const existing = routeMap.get(key)
    if (existing) {
      existing.units += allocation.units
      existing.trips += allocation.trips
      existing.vehicleHours += allocation.vehicleHours
    } else {
      routeMap.set(key, {
        depotId: allocation.depotId,
        wardId: allocation.wardId,
        units: allocation.units,
        distanceKm: allocation.distanceKm,
        delayKm: allocation.delayKm,
        detourKm: allocation.detourKm,
        path: allocation.path,
        trips: allocation.trips,
        vehicleHours: allocation.vehicleHours,
      })
    }
  }
  return [...routeMap.values()].sort((a, b) => b.units - a.units)
}

/**
 * Compute a plan from the deterministic allocator.
 *
 * Every metric below is derived from the deliveries the allocator actually
 * produced (or explicitly refused), not from a UI-only estimate. The input
 * scenario is copied inside `allocate` and is never mutated.
 */
export function computePlan(scenario: Scenario, strategy: StrategyId, priority: number): Plan {
  const generatedAt = Date.now()
  const priorityValue = clamp(priority, 0, 100)
  const result = allocate(scenario, strategy, priorityValue)
  const allocations = result.deliveries
  const routes = aggregateRoutes(allocations)

  const reachabilityById = new Map(result.reachability.map((entry) => [entry.wardId, entry]))

  const wardPlans: WardPlan[] = scenario.wards.map((ward) => {
    const wardAllocations = allocations.filter((allocation) => allocation.wardId === ward.id)
    const allocated = emptySupplyValues()
    const unmet = emptySupplyValues()
    const bySupply = {} as Record<
      SupplyType,
      {
        demand: number
        allocated: number
        unmet: number
        sourceDepotId: DepotId | null
        route: RouteTrace | null
      }
    >

    for (const supply of SUPPLY_TYPES) {
      const relevant = wardAllocations.filter((allocation) => allocation.supply === supply)
      const total = relevant.reduce((sum, allocation) => sum + allocation.units, 0)
      const source = [...relevant].sort((a, b) => b.units - a.units)[0] ?? null
      const remaining = Math.max(0, ward.demand[supply] - total)
      allocated[supply] = total
      unmet[supply] = remaining
      bySupply[supply] = {
        demand: ward.demand[supply],
        allocated: total,
        unmet: remaining,
        sourceDepotId: source?.depotId ?? null,
        route: source
          ? {
              path: source.path,
              distanceKm: source.distanceKm,
              costKm: source.distanceKm + source.delayKm,
              delayKm: source.delayKm,
              detourKm: source.detourKm,
            }
          : null,
      }
    }

    const demandUnits = SUPPLY_TYPES.reduce((sum, supply) => sum + ward.demand[supply], 0)
    const allocatedUnits = SUPPLY_TYPES.reduce((sum, supply) => sum + allocated[supply], 0)
    const unmetUnits = Math.max(0, demandUnits - allocatedUnits)
    const weight = result.priorityWeights[ward.id] ?? 0
    const reachability = reachabilityById.get(ward.id)

    return {
      wardId: ward.id,
      urgency: ward.urgency,
      vulnerabilityScore: ward.vulnerability.score,
      priorityWeight: weight,
      reachable: reachability?.reachable ?? false,
      demand: { ...ward.demand },
      allocated,
      unmet,
      bySupply,
      coverage: demandUnits > 0 ? allocatedUnits / demandUnits : 0,
      demandUnits,
      allocatedUnits,
      unmetUnits,
      priorityWeightedUnmet: weightedUnmet(unmetUnits, weight),
      nearestDepotDistanceKm: reachability?.distanceKm ?? null,
      allocationShare: 0,
    }
  })

  const totalAllocated = wardPlans.reduce((sum, ward) => sum + ward.allocatedUnits, 0)
  for (const ward of wardPlans) {
    ward.allocationShare = totalAllocated > 0 ? ward.allocatedUnits / totalAllocated : 0
  }

  const supplies = {} as Record<SupplyType, SupplyTotals>
  for (const supply of SUPPLY_TYPES) {
    const demand = scenario.wards.reduce((sum, ward) => sum + ward.demand[supply], 0)
    const stock = scenario.depots.reduce((sum, depot) => sum + depot.stock[supply], 0)
    const allocated = wardPlans.reduce((sum, ward) => sum + ward.allocated[supply], 0)
    const remainingStock = result.depotInventory.reduce(
      (sum, depot) => sum + depot.remaining[supply],
      0,
    )
    supplies[supply] = {
      demand,
      stock,
      allocated,
      unmet: Math.max(0, demand - allocated),
      coverage: demand > 0 ? Math.min(1, allocated / demand) : 0,
      remainingStock,
    }
  }

  const demand = supplies.water.demand + supplies.medical.demand + supplies.food.demand
  const stock = supplies.water.stock + supplies.medical.stock + supplies.food.stock
  const unmetUnits = Math.max(0, demand - totalAllocated)
  const coverage = demand > 0 ? Math.min(1, totalAllocated / demand) : 0
  const unmetUrgent = wardPlans
    .filter((ward) => ward.urgency >= 4)
    .reduce((sum, ward) => sum + ward.unmetUnits, 0)
  const priorityWeightedUnmet = wardPlans.reduce((sum, ward) => sum + ward.priorityWeightedUnmet, 0)

  const coverages = wardPlans.map((ward) => ward.coverage)
  const spread = coverages.length > 0 ? Math.max(...coverages) - Math.min(...coverages) : 0
  const fairness = totalAllocated > 0 ? Math.round(clamp(100 - spread * 100, 0, 100) * 10) / 10 : null

  const usedVehicles = new Set(
    allocations
      .map((allocation) => allocation.vehicleId)
      .filter((id): id is NonNullable<typeof id> => Boolean(id)),
  )
  const trips = allocations.reduce((sum, allocation) => sum + allocation.trips, 0)
  const availableVehicles = scenario.vehicles.filter((vehicle) => vehicle.status === 'available')
  const runSlots = availableVehicles.length * RUNS_PER_VEHICLE
  const fleetUtilisation = runSlots > 0 ? Math.min(100, (trips / runSlots) * 100) : 0
  const vehicleHours = allocations.reduce((sum, allocation) => sum + allocation.vehicleHours, 0)
  const blockedRoads = scenario.roads.filter((road) => road.state === 'blocked')
  const congestedRoads = scenario.roads.filter((road) => road.state === 'congested')
  const incompleteWards = wardPlans.filter((ward) => ward.coverage < 0.995).length
  const affectedWards = wardPlans.filter((ward) => ward.unmetUnits > 0).length

  const reachableWards = result.reachability.filter((entry) => entry.reachable).length
  const unreachableWards = result.reachability.length - reachableWards
  const fleetCapacityOffered = result.fleetCapacityOffered
  const fleetCapacityMoved = result.fleetCapacityMoved
  const fleetCapacityUsage =
    fleetCapacityOffered > 0 ? fleetCapacityMoved / fleetCapacityOffered : 0

  const unservedByReason: Record<UnservedReason, number> = { unreachable: 0, stock: 0, fleet: 0 }
  for (const entry of result.unserved) {
    unservedByReason[entry.reason] += entry.units
  }

  const bottlenecks: PlanBottleneck[] = []
  const unreachable = wardPlans.filter((ward) => !ward.reachable && ward.demandUnits > 0)
  if (unreachable.length > 0) {
    bottlenecks.push({
      id: 'unreachable-wards',
      severity: 'critical',
      title: `${unreachable.length} ward${unreachable.length === 1 ? '' : 's'} unreachable`,
      detail: `No open route connects ${unreachable
        .map((ward) => scenario.wards.find((entry) => entry.id === ward.wardId)?.shortName ?? ward.wardId)
        .join(', ')} to a depot, so no delivery was invented for them.`,
      value: 'no route',
    })
  }

  if (availableVehicles.length === 0) {
    bottlenecks.push({
      id: 'no-fleet',
      severity: 'critical',
      title: 'No vehicles available',
      detail: 'Every fleet unit is loading or under maintenance in this scenario. Deliveries cannot be dispatched.',
      value: '0 run slots',
    })
  }

  for (const supply of SUPPLY_TYPES) {
    const totals = supplies[supply]
    if (totals.unmet <= 0) continue
    const severity: PlanBottleneck['severity'] =
      totals.coverage < 0.5 ? 'critical' : totals.coverage < 0.85 ? 'warning' : 'info'
    const topUnmet = [...wardPlans]
      .map((ward) => ({ ward, unmet: ward.unmet[supply] }))
      .sort((a, b) => b.unmet - a.unmet)[0]
    const topName = topUnmet
      ? scenario.wards.find((ward) => ward.id === topUnmet.ward.wardId)?.shortName
      : null
    bottlenecks.push({
      id: `supply-${supply}`,
      severity,
      title: `${SUPPLY_META[supply].shortLabel} shortfall`,
      detail: `${formatNumber(totals.unmet)} ${SUPPLY_META[supply].unit} unmet district-wide.${
        topName ? ` ${topName} carries the largest gap.` : ''
      }`,
      value: `${formatPct(totals.coverage, 0)} covered`,
    })
  }

  const fleetBoundDeliveries = result.unserved.filter((entry) => entry.reason === 'fleet')
  if (fleetBoundDeliveries.length > 0) {
    bottlenecks.push({
      id: 'fleet-capacity',
      severity: fleetCapacityUsage >= 0.995 ? 'warning' : 'info',
      title: 'Fleet capacity limits deliveries',
      detail: `${formatNumber(unservedByReason.fleet)} units are unserved because the ${availableVehicles.length} available vehicle${availableVehicles.length === 1 ? '' : 's'} exhausted their ${RUNS_PER_VEHICLE}-run budget. ${
        fleetCapacityOffered > 0
          ? `${formatPct(fleetCapacityUsage, 0)} of offered vehicle capacity was used.`
          : ''
      }`,
      value: `${formatNumber(fleetCapacityMoved)} / ${formatNumber(fleetCapacityOffered)} units`,
    })
  }

  if (blockedRoads.length > 0) {
    const detoured = routes.filter((route) => route.detourKm > 0.15)
    const extraKm = detoured.reduce((sum, route) => sum + route.detourKm, 0)
    bottlenecks.push({
      id: 'blocked-roads',
      severity: 'warning',
      title: `${blockedRoads.length} road segment${blockedRoads.length === 1 ? '' : 's'} blocked`,
      detail:
        detoured.length > 0
          ? `${blockedRoads
              .slice(0, 2)
              .map((road) => road.name)
              .join(' and ')}${blockedRoads.length > 2 ? ' and others' : ''} force ${detoured.length} route detours (+${formatDecimal(extraKm)} km per one-way leg on affected deliveries).`
          : `${blockedRoads.map((road) => road.name).join(', ')} removed from the route graph; reachable deliveries were re-routed.`,
      value: detoured.length > 0 ? `+${formatDecimal(extraKm)} km` : 'removed',
    })
  }

  if (congestedRoads.length > 0) {
    const delay = allocations.reduce((sum, allocation) => sum + allocation.delayKm, 0)
    bottlenecks.push({
      id: 'congestion',
      severity: 'info',
      title: `${congestedRoads.length} congested segment${congestedRoads.length === 1 ? '' : 's'}`,
      detail: `The fixed ${'1.55'}× cost factor adds ${formatDecimal(delay)} km-equivalent delay across planned delivery routes.`,
      value: `${formatDecimal(delay)} km delay`,
    })
  }

  const unavailable = scenario.vehicles.filter((vehicle) => vehicle.status !== 'available')
  if (unavailable.length > 0) {
    bottlenecks.push({
      id: 'vehicles-unavailable',
      severity: 'info',
      title: `${unavailable.length} vehicle${unavailable.length === 1 ? '' : 's'} unavailable`,
      detail: unavailable.map((vehicle) => `${vehicle.name} (${vehicle.status})`).join(' · '),
      value: 'fleet note',
    })
  }

  const severityOrder: Record<PlanBottleneck['severity'], number> = {
    critical: 0,
    warning: 1,
    info: 2,
  }
  bottlenecks.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])

  const totals: PlanTotals = {
    demand,
    allocated: totalAllocated,
    stock,
    coverage,
    unmetUnits,
    unmetUrgent,
    priorityWeightedUnmet,
    fairness,
    vehiclesUsed: usedVehicles.size,
    vehiclesAvailable: availableVehicles.length,
    fleetSize: scenario.vehicles.length,
    trips,
    runSlots,
    fleetUtilisation,
    vehicleHours,
    incompleteWards,
    affectedWards,
    blockedRoads: blockedRoads.length,
    congestedRoads: congestedRoads.length,
    reachableWards,
    unreachableWards,
    routeDistanceKm: result.routeDistanceKm,
    routeTimeHours: result.routeTimeHours,
    fleetCapacityOffered,
    fleetCapacityMoved,
    fleetCapacityUsage,
  }

  return {
    scenarioId: scenario.id,
    strategy,
    priority: priorityValue,
    generatedAt,
    wards: wardPlans,
    allocations,
    routes,
    supplies,
    totals,
    bottlenecks,
    unserved: result.unserved,
    fleet: result.fleet,
    metrics: {
      reachability: result.reachability,
      reachableWards,
      unreachableWards,
      routeDistanceKm: result.routeDistanceKm,
      routeTimeHours: result.routeTimeHours,
      fleetCapacityOffered,
      fleetCapacityMoved,
      fleetCapacityUsage,
      depotInventory: result.depotInventory,
      priorityWeights: result.priorityWeights,
      unservedByReason,
    },
  }
}

/**
 * Run all three strategies on independent deep copies of the same input.
 * No strategy can consume stock, fleet runs or road state from another.
 */
export function computeComparisons(
  scenario: Scenario,
  priority: number,
): Record<StrategyId, Plan> {
  return {
    optimizer: computePlan(cloneScenario(scenario), 'optimizer', priority),
    nearest: computePlan(cloneScenario(scenario), 'nearest', priority),
    proportional: computePlan(cloneScenario(scenario), 'proportional', priority),
  }
}
```

---

## `src/lib/planDiff.ts`

```tsx
import { SUPPLY_META, SUPPLY_TYPES } from './constants'
import { formatDecimal, formatNumber, formatPct } from './format'
import type { DepotId, Plan, SupplyType, WardId, WardPlan } from '../types'

export type PlanChangeKind = 'added' | 'removed' | 'reduced' | 'increased' | 'rerouted'

export interface PlanChange {
  id: string
  kind: PlanChangeKind
  wardId: WardId
  supply: SupplyType
  beforeUnits: number
  afterUnits: number
  deltaUnits: number
  beforeDepotId: DepotId | null
  afterDepotId: DepotId | null
  reason: string
}

export interface PlanDiff {
  hasPrevious: boolean
  changes: PlanChange[]
  counts: Record<PlanChangeKind, number>
  unitsAdded: number
  unitsRemoved: number
  coverageDelta: number
  weightedUnmetDelta: number
  routeDistanceDelta: number
  blockedRoadsDelta: number
  unreachableDelta: number
  summary: string[]
}

function depotName(plan: Plan, depotId: DepotId | null): string {
  if (!depotId) return 'no depot'
  return plan.metrics.depotInventory.find((entry) => entry.depotId === depotId)
    ? `Depot ${depotId.replace('depot-', '').toUpperCase()}`
    : depotId
}

function compareContext(previous: Plan, current: Plan) {
  return {
    stockIncreased: SUPPLY_TYPES.some(
      (supply) => current.supplies[supply].stock > previous.supplies[supply].stock,
    ),
    capacityIncreased: current.metrics.fleetCapacityOffered > previous.metrics.fleetCapacityOffered,
    roadsReopened: current.totals.blockedRoads < previous.totals.blockedRoads,
    roadsClosed: current.totals.blockedRoads > previous.totals.blockedRoads,
    priorityChanged: current.priority !== previous.priority,
    strategyChanged: current.strategy !== previous.strategy,
  }
}

function reductionReason(
  current: Plan,
  wardPlan: WardPlan,
  supply: SupplyType,
  previous: Plan,
  context: ReturnType<typeof compareContext>,
): string {
  const unserved = current.unserved.find(
    (entry) => entry.wardId === wardPlan.wardId && entry.supply === supply,
  )
  const label = SUPPLY_META[supply].shortLabel.toLowerCase()

  if (unserved?.reason === 'unreachable') {
    return 'No open route connects this ward to a depot after the latest road change.'
  }
  if (context.roadsClosed) {
    return 'Road closures removed or lengthened a route, so less could be delivered here.'
  }
  if (unserved?.reason === 'fleet') {
    return `Vehicle run capacity at reachable depots was exhausted before this ${label} delivery.`
  }
  if (unserved?.reason === 'stock') {
    return `${SUPPLY_META[supply].shortLabel} stock at reachable depots was exhausted or committed to higher-ranked wards.`
  }
  if (current.supplies[supply].remainingStock < previous.supplies[supply].remainingStock) {
    return `Less ${label} stock was available at reachable depots than in the previous plan.`
  }
  if (context.strategyChanged) {
    return `The ${label} delivery order changed with the active strategy.`
  }
  if (context.priorityChanged) {
    return `This ward ranked lower after the priority weight changed from ${previous.priority}% to ${current.priority}%.`
  }
  return `The greedy ${label} allocation ranked other wards ahead of this one under the new inputs.`
}

function increaseReason(
  current: Plan,
  supply: SupplyType,
  previous: Plan,
  context: ReturnType<typeof compareContext>,
): string {
  const label = SUPPLY_META[supply].shortLabel.toLowerCase()
  if (context.roadsReopened) return 'A road reopened, restoring reachable delivery capacity.'
  if (context.capacityIncreased) return 'More available vehicle capacity could reach this ward.'
  if (context.stockIncreased) return `Additional ${label} stock became available at reachable depots.`
  if (context.strategyChanged) return `The ${label} delivery order changed with the active strategy.`
  if (context.priorityChanged) {
    return `This ward ranked higher after the priority weight changed from ${previous.priority}% to ${current.priority}%.`
  }
  return `The greedy ${label} allocation reached this ward earlier under the new inputs.`
}

/**
 * Compare two plans allocation by allocation. Every reason is derived from
 * computed plan values (remaining stock, unserved reasons, route changes),
 * not from a hard-coded narrative.
 */
export function diffPlans(previous: Plan | null, current: Plan): PlanDiff {
  const counts: Record<PlanChangeKind, number> = {
    added: 0,
    removed: 0,
    reduced: 0,
    increased: 0,
    rerouted: 0,
  }

  if (!previous) {
    return {
      hasPrevious: false,
      changes: [],
      counts,
      unitsAdded: 0,
      unitsRemoved: 0,
      coverageDelta: 0,
      weightedUnmetDelta: 0,
      routeDistanceDelta: 0,
      blockedRoadsDelta: 0,
      unreachableDelta: 0,
      summary: ['No earlier plan revision is stored yet. Change an input to generate a diff.'],
    }
  }

  const context = compareContext(previous, current)
  const changes: PlanChange[] = []

  for (const wardPlan of current.wards) {
    const previousWard = previous.wards.find((entry) => entry.wardId === wardPlan.wardId)
    if (!previousWard) continue
    for (const supply of SUPPLY_TYPES) {
      const before = previousWard.bySupply[supply]
      const after = wardPlan.bySupply[supply]
      const delta = after.allocated - before.allocated
      const sourceChanged =
        before.sourceDepotId !== after.sourceDepotId && (before.allocated > 0 || after.allocated > 0)

      if (before.allocated === 0 && after.allocated > 0) {
        counts.added += 1
        changes.push({
          id: `${wardPlan.wardId}-${supply}-added`,
          kind: 'added',
          wardId: wardPlan.wardId,
          supply,
          beforeUnits: 0,
          afterUnits: after.allocated,
          deltaUnits: after.allocated,
          beforeDepotId: before.sourceDepotId,
          afterDepotId: after.sourceDepotId,
          reason: increaseReason(current, supply, previous, context),
        })
        continue
      }

      if (before.allocated > 0 && after.allocated === 0) {
        counts.removed += 1
        changes.push({
          id: `${wardPlan.wardId}-${supply}-removed`,
          kind: 'removed',
          wardId: wardPlan.wardId,
          supply,
          beforeUnits: before.allocated,
          afterUnits: 0,
          deltaUnits: -before.allocated,
          beforeDepotId: before.sourceDepotId,
          afterDepotId: after.sourceDepotId,
          reason: reductionReason(current, wardPlan, supply, previous, context),
        })
        continue
      }

      if (delta < 0) {
        counts.reduced += 1
        changes.push({
          id: `${wardPlan.wardId}-${supply}-reduced`,
          kind: 'reduced',
          wardId: wardPlan.wardId,
          supply,
          beforeUnits: before.allocated,
          afterUnits: after.allocated,
          deltaUnits: delta,
          beforeDepotId: before.sourceDepotId,
          afterDepotId: after.sourceDepotId,
          reason: reductionReason(current, wardPlan, supply, previous, context),
        })
      } else if (delta > 0) {
        counts.increased += 1
        changes.push({
          id: `${wardPlan.wardId}-${supply}-increased`,
          kind: 'increased',
          wardId: wardPlan.wardId,
          supply,
          beforeUnits: before.allocated,
          afterUnits: after.allocated,
          deltaUnits: delta,
          beforeDepotId: before.sourceDepotId,
          afterDepotId: after.sourceDepotId,
          reason: increaseReason(current, supply, previous, context),
        })
      }

      if (sourceChanged && after.allocated > 0) {
        counts.rerouted += 1
        const beforeRoute = before.route
        const afterRoute = after.route
        const deltaKm =
          beforeRoute && afterRoute ? afterRoute.distanceKm - beforeRoute.distanceKm : null
        changes.push({
          id: `${wardPlan.wardId}-${supply}-rerouted`,
          kind: 'rerouted',
          wardId: wardPlan.wardId,
          supply,
          beforeUnits: before.allocated,
          afterUnits: after.allocated,
          deltaUnits: 0,
          beforeDepotId: before.sourceDepotId,
          afterDepotId: after.sourceDepotId,
          reason: `Route moved from ${depotName(previous, before.sourceDepotId)} to ${depotName(current, after.sourceDepotId)}${
            deltaKm === null
              ? '.'
              : ` (${deltaKm >= 0 ? '+' : '−'}${formatDecimal(Math.abs(deltaKm))} km one way).`
          }`,
        })
      }
    }
  }

  changes.sort((a, b) => {
    if (a.deltaUnits === 0 && b.deltaUnits !== 0) return 1
    if (b.deltaUnits === 0 && a.deltaUnits !== 0) return -1
    return Math.abs(b.deltaUnits) - Math.abs(a.deltaUnits) || a.id.localeCompare(b.id)
  })

  const unitsAdded = changes.reduce((sum, change) => sum + Math.max(0, change.deltaUnits), 0)
  const unitsRemoved = changes.reduce((sum, change) => sum + Math.max(0, -change.deltaUnits), 0)
  const coverageDelta = (current.totals.coverage - previous.totals.coverage) * 100
  const weightedUnmetDelta =
    current.totals.priorityWeightedUnmet - previous.totals.priorityWeightedUnmet
  const routeDistanceDelta = current.totals.routeDistanceKm - previous.totals.routeDistanceKm
  const blockedRoadsDelta = current.totals.blockedRoads - previous.totals.blockedRoads
  const unreachableDelta = current.totals.unreachableWards - previous.totals.unreachableWards

  const summary: string[] = []
  if (coverageDelta !== 0) {
    summary.push(
      `Coverage ${formatPct(previous.totals.coverage, 1)} → ${formatPct(current.totals.coverage, 1)} (${coverageDelta > 0 ? '+' : '−'}${formatDecimal(Math.abs(coverageDelta))} pp).`,
    )
  } else {
    summary.push(`Coverage unchanged at ${formatPct(current.totals.coverage, 1)}.`)
  }
  if (weightedUnmetDelta !== 0) {
    summary.push(
      `Priority-weighted unmet ${weightedUnmetDelta > 0 ? 'rose' : 'fell'} by ${formatNumber(Math.abs(weightedUnmetDelta))} weighted units.`,
    )
  }
  if (Math.abs(routeDistanceDelta) >= 0.05) {
    summary.push(
      `Planned route distance ${routeDistanceDelta > 0 ? 'increased' : 'decreased'} by ${formatDecimal(Math.abs(routeDistanceDelta))} km.`,
    )
  }
  if (blockedRoadsDelta !== 0) {
    summary.push(
      `Blocked segments ${blockedRoadsDelta > 0 ? 'increased' : 'decreased'} by ${Math.abs(blockedRoadsDelta)}.`,
    )
  }
  if (unreachableDelta !== 0) {
    summary.push(
      unreachableDelta > 0
        ? `${unreachableDelta} more ward${unreachableDelta === 1 ? '' : 's'} became unreachable (${current.totals.unreachableWards} total).`
        : `${Math.abs(unreachableDelta)} ward${Math.abs(unreachableDelta) === 1 ? ' is' : 's are'} reachable again (${current.totals.unreachableWards} still unreachable).`,
    )
  }

  return {
    hasPrevious: true,
    changes,
    counts,
    unitsAdded,
    unitsRemoved,
    coverageDelta,
    weightedUnmetDelta,
    routeDistanceDelta,
    blockedRoadsDelta,
    unreachableDelta,
    summary,
  }
}
```

---

## `src/lib/priority.ts`

```tsx
import type { Ward } from '../types'

/**
 * Declared priority weight used for the priority-weighted unmet metric.
 * It is an explicit modelling choice, not an objective measure of need.
 */
export const PRIORITY_WEIGHT_FORMULA = 'weight = (urgency ÷ 5) × (0.6 + 0.4 × vulnerability ÷ 100)'

export const FAIRNESS_DEFINITION =
  'Coverage equity = 100 − (best ward coverage − worst ward coverage), in percentage points. It is a chosen model objective, not an objective truth.'

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

/** Vulnerability factor between 0.6 and 1.0. */
export function vulnerabilityFactor(score: number): number {
  return 0.6 + 0.4 * (clamp(score, 0, 100) / 100)
}

/** Declared priority weight for a ward, in the range 0.12–1.0. */
export function priorityWeight(ward: Pick<Ward, 'urgency' | 'vulnerability'>): number {
  const urgency = clamp(ward.urgency, 1, 5) / 5
  return urgency * vulnerabilityFactor(ward.vulnerability.score)
}

/** Priority-weighted unmet units for a ward. */
export function weightedUnmet(unmetUnits: number, weight: number): number {
  return Math.max(0, unmetUnits) * Math.max(0, weight)
}
```

---

## `src/lib/routing.ts`

```tsx
import type { LatLng, NodeId, Road, RoadId, Vehicle } from '../types'

/** Congested segments carry a fixed travel-cost multiplier in this prototype. */
export const CONGESTION_FACTOR = 1.55
/** Fixed loading/handling time per planned run. */
export const HANDLING_HOURS_PER_RUN = 0.25

export type RouteStatus = 'ok' | 'same-node' | 'no-open-route'

export interface RouteResult {
  reachable: boolean
  distanceKm: number
  /** Distance weighted by congestion; used as the Dijkstra edge cost. */
  costKm: number
  /** costKm − distanceKm: the congestion penalty on this route. */
  delayKm: number
  path: RoadId[]
  geometry: LatLng[]
  reason: RouteStatus
}

export interface GraphEdge {
  road: Road
  to: NodeId
  distanceKm: number
  costKm: number
}

export interface RoadGraph {
  nodes: NodeId[]
  adjacency: Map<NodeId, GraphEdge[]>
}

function unreachable(): RouteResult {
  return {
    reachable: false,
    distanceKm: Number.POSITIVE_INFINITY,
    costKm: Number.POSITIVE_INFINITY,
    delayKm: Number.POSITIVE_INFINITY,
    path: [],
    geometry: [],
    reason: 'no-open-route',
  }
}

/** Cost multiplier for a segment. Blocked roads are removed from the graph entirely. */
export function roadCostFactor(road: Pick<Road, 'state'>): number {
  return road.state === 'congested' ? CONGESTION_FACTOR : 1
}

/**
 * Build an undirected weighted graph from the road list. Blocked segments are
 * skipped, so they can never appear in a computed route. Edges and adjacency
 * lists are sorted deterministically to keep equal-cost paths stable.
 */
export function buildGraph(roads: Road[]): RoadGraph {
  const adjacency = new Map<NodeId, GraphEdge[]>()
  const nodes = new Set<NodeId>()

  const addEdge = (from: NodeId, edge: GraphEdge) => {
    const list = adjacency.get(from)
    if (list) list.push(edge)
    else adjacency.set(from, [edge])
    nodes.add(from)
  }

  for (const road of roads) {
    if (road.state === 'blocked') continue
    if (!(road.distanceKm > 0)) continue
    const costKm = road.distanceKm * roadCostFactor(road)
    addEdge(road.from, { road, to: road.to, distanceKm: road.distanceKm, costKm })
    addEdge(road.to, { road, to: road.from, distanceKm: road.distanceKm, costKm })
  }

  for (const list of adjacency.values()) {
    list.sort((a, b) => (a.to === b.to ? a.road.id.localeCompare(b.road.id) : a.to.localeCompare(b.to)))
  }

  return { nodes: [...nodes].sort(), adjacency }
}

interface HeapEntry {
  node: NodeId
  distance: number
}

/** Minimal binary min-heap so Dijkstra does not scan every unvisited node. */
class MinHeap {
  private items: HeapEntry[] = []

  private less(a: HeapEntry, b: HeapEntry): boolean {
    if (a.distance !== b.distance) return a.distance < b.distance
    return a.node.localeCompare(b.node) < 0
  }

  get size(): number {
    return this.items.length
  }

  push(entry: HeapEntry): void {
    this.items.push(entry)
    let index = this.items.length - 1
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2)
      if (!this.less(this.items[index], this.items[parent])) break
      ;[this.items[index], this.items[parent]] = [this.items[parent], this.items[index]]
      index = parent
    }
  }

  pop(): HeapEntry | undefined {
    if (this.items.length === 0) return undefined
    const top = this.items[0]
    const last = this.items.pop()
    if (this.items.length > 0 && last) {
      this.items[0] = last
      let index = 0
      for (;;) {
        const left = index * 2 + 1
        const right = left + 1
        let smallest = index
        if (left < this.items.length && this.less(this.items[left], this.items[smallest])) smallest = left
        if (right < this.items.length && this.less(this.items[right], this.items[smallest])) smallest = right
        if (smallest === index) break
        ;[this.items[index], this.items[smallest]] = [this.items[smallest], this.items[index]]
        index = smallest
      }
    }
    return top
  }
}

/**
 * Dijkstra shortest path over the demo road graph, weighted by distance with a
 * fixed congestion multiplier. Returns an explicit unreachable result when no
 * open path exists — it never falls back to a straight line or invented route.
 */
export function findRoute(roads: Road[], from: NodeId, to: NodeId): RouteResult {
  if (from === to) {
    return {
      reachable: true,
      distanceKm: 0,
      costKm: 0,
      delayKm: 0,
      path: [],
      geometry: [],
      reason: 'same-node',
    }
  }

  const graph = buildGraph(roads)
  if (!graph.adjacency.has(from) || !graph.adjacency.has(to)) return unreachable()

  const distances = new Map<NodeId, number>([[from, 0]])
  const previous = new Map<NodeId, { node: NodeId; road: Road }>()
  const visited = new Set<NodeId>()
  const heap = new MinHeap()
  heap.push({ node: from, distance: 0 })

  while (heap.size > 0) {
    const current = heap.pop()
    if (!current) break
    if (visited.has(current.node)) continue
    visited.add(current.node)
    if (current.node === to) break

    for (const edge of graph.adjacency.get(current.node) ?? []) {
      if (visited.has(edge.to)) continue
      const nextDistance = current.distance + edge.costKm
      const known = distances.get(edge.to) ?? Number.POSITIVE_INFINITY
      if (nextDistance < known - 1e-9) {
        distances.set(edge.to, nextDistance)
        previous.set(edge.to, { node: current.node, road: edge.road })
        heap.push({ node: edge.to, distance: nextDistance })
      }
    }
  }

  if (!distances.has(to)) return unreachable()

  const roadPath: Road[] = []
  let cursor: NodeId = to
  let guard = 0
  while (cursor !== from && guard <= graph.nodes.length) {
    const step = previous.get(cursor)
    if (!step) return unreachable()
    roadPath.unshift(step.road)
    cursor = step.node
    guard += 1
  }
  if (cursor !== from) return unreachable()

  const distanceKm = roadPath.reduce((sum, road) => sum + road.distanceKm, 0)
  const costKm = distances.get(to) ?? distanceKm

  return {
    reachable: true,
    distanceKm,
    costKm,
    delayKm: Math.max(0, costKm - distanceKm),
    path: roadPath.map((road) => road.id),
    geometry: buildRouteGeometry(from, roadPath),
    reason: 'ok',
  }
}

export function buildRouteGeometry(start: NodeId, path: Road[]): LatLng[] {
  const points: LatLng[] = []
  let cursor: NodeId = start

  for (const road of path) {
    const forward = road.from === cursor
    const segment = forward ? road.geometry : [...road.geometry].reverse()
    if (points.length === 0) {
      points.push(...segment.map((p) => ({ ...p })))
    } else {
      points.push(...segment.slice(1).map((p) => ({ ...p })))
    }
    cursor = forward ? road.to : road.from
  }

  return points
}

/**
 * Hours for one planned run: loaded out, empty back, plus fixed handling.
 * Congestion delay is charged on both directions.
 */
export function runHours(vehicle: Pick<Vehicle, 'speedKph'>, distanceKm: number, delayKm: number): number {
  const speed = Math.max(1, vehicle.speedKph)
  const roundTripKm = 2 * distanceKm + 2 * Math.max(0, delayKm)
  return roundTripKm / speed + HANDLING_HOURS_PER_RUN
}

/** Round-trip kilometres for a planned run. */
export function runDistanceKm(distanceKm: number): number {
  return 2 * Math.max(0, distanceKm)
}

export function roadsWithState(roads: Road[], state: Road['state']): Road[] {
  return roads.map((road) => ({ ...road, state }))
}
```

---

## `src/lib/scenario.ts`

```tsx
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
```

---

## `src/lib/useNow.ts`

```tsx
import { useEffect, useState } from 'react'

export function useNow(intervalMs = 30000): number {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), intervalMs)
    return () => window.clearInterval(timer)
  }, [intervalMs])

  return now
}
```

---

## `src/main.tsx`

```tsx
import '@fontsource-variable/inter'
import '@fontsource-variable/jetbrains-mono'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

---

## `src/screens/AllocationLab.tsx`

```tsx
import { ArrowDownRight, ArrowUpRight, Check, RotateCcw, Save, SlidersHorizontal, TriangleAlert } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { EngineMetrics } from '../components/analysis/EngineMetrics'
import { PlanChangeSummary } from '../components/analysis/PlanChangeSummary'
import { StrategyCards } from '../components/analysis/StrategyCards'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { EmptyState } from '../components/ui/EmptyState'
import { InfoNote } from '../components/ui/InfoNote'
import { Panel } from '../components/ui/Panel'
import { ProgressBar } from '../components/ui/ProgressBar'
import { RangeSlider } from '../components/ui/RangeSlider'
import { ScreenHeader } from '../components/ui/ScreenHeader'
import { Segmented } from '../components/ui/Segmented'
import { SCENARIO_PRESETS } from '../data/sagarika'
import {
  DEMAND_MAX,
  DEMAND_MIN,
  STRATEGY_META,
  STRATEGY_ORDER,
  SUPPLY_META,
  SUPPLY_TYPES,
  URGENCY_META,
} from '../lib/constants'
import { formatDecimal, formatNumber, formatPct } from '../lib/format'
import { cn } from '../lib/cn'
import { computeComparisons, computePlan } from '../lib/plan'
import { applyEdits, editsAreEqual, editsFromScenario } from '../lib/scenario'
import { useSimulation } from '../state/SimulationContext'
import type { ScenarioEdits, SupplyType, WardId } from '../types'

function countChangedValues(base: ScenarioEdits, draft: ScenarioEdits): number {
  let count = 0
  for (const wardId of Object.keys(base.demand) as WardId[]) {
    for (const supply of SUPPLY_TYPES) {
      if (base.demand[wardId][supply] !== draft.demand[wardId][supply]) count += 1
    }
    if (base.urgency[wardId] !== draft.urgency[wardId]) count += 1
  }
  for (const depotId of Object.keys(base.stock) as Array<keyof ScenarioEdits['stock']>) {
    for (const supply of SUPPLY_TYPES) {
      if (base.stock[depotId][supply] !== draft.stock[depotId][supply]) count += 1
    }
  }
  return count
}

function signed(value: number, digits = 1, suffix = ''): string {
  if (!Number.isFinite(value) || Math.abs(value) < 0.0001) return `—${suffix ? ` ${suffix}` : ''}`
  return `${value > 0 ? '+' : ''}${value.toFixed(digits)}${suffix ? ` ${suffix}` : ''}`
}

export function AllocationLab() {
  const { state, actions } = useSimulation()
  const [draft, setDraft] = useState<ScenarioEdits>(() => editsFromScenario(state.scenario))
  const [priorityDraft, setPriorityDraft] = useState(state.priority)
  const [focusSupply, setFocusSupply] = useState<SupplyType>('water')
  const [confirmReset, setConfirmReset] = useState(false)

  useEffect(() => {
    setDraft(editsFromScenario(state.scenario))
    setPriorityDraft(state.priority)
  }, [state.scenarioEpoch])

  useEffect(() => {
    setPriorityDraft(state.priority)
  }, [state.priority])

  const editingWard = state.scenario.wards.find((ward) => ward.id === state.selectedWardId) ?? state.scenario.wards[0]
  const draftUrgency = draft.urgency[editingWard.id] ?? editingWard.urgency

  const previewScenario = useMemo(() => applyEdits(state.scenario, draft), [state.scenario, draft])
  const previewPlan = useMemo(
    () => computePlan(previewScenario, state.strategy, state.priority),
    [previewScenario, state.strategy, state.priority],
  )
  const previewComparisons = useMemo(
    () => computeComparisons(previewScenario, state.priority),
    [previewScenario, state.priority],
  )

  const baseEdits = useMemo(() => editsFromScenario(state.scenario), [state.scenario])
  const dirty = !editsAreEqual(baseEdits, draft)
  const changedValues = countChangedValues(baseEdits, draft)
  const preset = SCENARIO_PRESETS[state.scenarioId]
  const supplyMeta = SUPPLY_META[focusSupply]
  const stockTotal = state.scenario.depots.reduce((sum, depot) => sum + draft.stock[depot.id][focusSupply], 0)

  const coverageDelta = (previewPlan.totals.coverage - state.plan.totals.coverage) * 100
  const unmetDelta = previewPlan.totals.priorityWeightedUnmet - state.plan.totals.priorityWeightedUnmet
  const hoursDelta = previewPlan.totals.vehicleHours - state.plan.totals.vehicleHours
  const fairnessDelta =
    previewPlan.totals.fairness !== null && state.plan.totals.fairness !== null
      ? previewPlan.totals.fairness - state.plan.totals.fairness
      : null

  const updateDemand = (wardId: WardId, supply: SupplyType, value: number) => {
    setDraft((previous) => ({
      ...previous,
      demand: {
        ...previous.demand,
        [wardId]: { ...previous.demand[wardId], [supply]: value },
      },
    }))
  }

  const updateUrgency = (wardId: WardId, value: number) => {
    setDraft((previous) => ({
      ...previous,
      urgency: { ...previous.urgency, [wardId]: value },
    }))
  }

  const updateStock = (depotId: (typeof state.scenario.depots)[number]['id'], value: number) => {
    setDraft((previous) => ({
      ...previous,
      stock: {
        ...previous.stock,
        [depotId]: { ...previous.stock[depotId], [focusSupply]: value },
      },
    }))
  }

  const applyDraft = () => {
    if (!dirty) return
    actions.applyScenarioEdits(
      draft,
      `${changedValues} input value${changedValues === 1 ? '' : 's'} applied from the Allocation Lab. Computed coverage at apply time: ${formatPct(
        previewPlan.totals.coverage,
        1,
      )}.`,
    )
  }

  const commitPriority = () => {
    if (priorityDraft !== state.priority) actions.setPriority(priorityDraft)
  }

  const previewEmpty = previewPlan.totals.allocated === 0

  return (
    <div className="space-y-3 p-3 sm:p-4">
      <ScreenHeader
        kicker="Allocation lab · deterministic engine"
        title="Tune the inputs, see the trade-offs"
        description={`Adjust demand, depot stock, urgency and plan basis for the fictional ${preset.name} snapshot. Scenario inputs stay in draft until you apply them; strategy and priority apply immediately.`}
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setConfirmReset(true)}
              icon={<RotateCcw size={12} aria-hidden />}
            >
              Reset scenario
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={actions.recalculate}
              loading={state.isRecalculating}
              disabled={state.isRecalculating}
            >
              Recalculate plan
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={applyDraft}
              disabled={!dirty || state.isRecalculating}
              icon={<Save size={12} aria-hidden />}
            >
              Apply changes
            </Button>
          </>
        }
      />

      <div
        role="status"
        className={cn(
          'flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2',
          dirty
            ? 'border-warn/25 bg-warn/[0.045]'
            : 'border-signal/15 bg-signal/[0.03]',
        )}
      >
        <div className="flex min-w-0 items-center gap-2">
          <span
            aria-hidden
            className={cn('h-1.5 w-1.5 shrink-0 rounded-full', dirty ? 'bg-warn' : 'bg-signal')}
          />
          <p className="min-w-0 text-[10px] leading-snug text-mist-300">
            {dirty ? (
              <>
                <span className="font-medium text-[#f0d5a8]">{changedValues} unsaved input value{changedValues === 1 ? '' : 's'}.</span>{' '}
                The console and printable report still show the last applied plan; the draft summary below uses your edits.
              </>
            ) : (
              <>
                <span className="font-medium text-[#a9e9e0]">Draft matches the applied plan.</span>{' '}
                Preview coverage {formatPct(previewPlan.totals.coverage, 1)} · rev {state.planRevision}.
                <span className="mt-0.5 block truncate text-[9px] text-mist-500">
                  Latest event · {state.events[0]?.title ?? 'None recorded'}
                </span>
              </>
            )}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {dirty ? (
            <Button
              variant="ghost"
              size="xs"
              onClick={() => setDraft(editsFromScenario(state.scenario))}
            >
              Discard draft
            </Button>
          ) : null}
          <Badge tone={dirty ? 'amber' : 'teal'}>{dirty ? 'Draft' : 'Applied'}</Badge>
        </div>
      </div>

      <div className="grid gap-3 xl:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
        <div className="space-y-3">
          <Panel
            kicker="Scenario input"
            title="Neighbourhood demand & urgency"
            action={<Badge tone="violet">Draft</Badge>}
            subtitle="Choose a ward, then adjust its requested units by supply type."
            bodyClassName="space-y-3 p-3"
          >
            <div className="grid grid-cols-2 gap-1">
              {state.scenario.wards.map((ward) => {
                const active = ward.id === editingWard.id
                const urgency = URGENCY_META[draft.urgency[ward.id]] ?? URGENCY_META[3]
                return (
                  <button
                    key={ward.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => actions.selectWard(ward.id)}
                    className={cn(
                      'flex min-w-0 items-center gap-1.5 rounded border px-2 py-1.5 text-left transition-colors',
                      active
                        ? 'border-signal/35 bg-signal/[0.06] text-mist-50'
                        : 'border-line/70 bg-night-950/25 text-mist-400 hover:border-line hover:text-mist-200',
                    )}
                  >
                    <span aria-hidden className={cn('h-1.5 w-1.5 shrink-0 rounded-full', urgency.dotClass)} />
                    <span className="min-w-0 flex-1 truncate font-mono text-[8px] uppercase tracking-[0.04em]">
                      {ward.code} {ward.shortName}
                    </span>
                  </button>
                )
              })}
            </div>

            <Segmented<SupplyType>
              ariaLabel="Supply type to edit"
              fullWidth
              size="sm"
              value={focusSupply}
              onChange={setFocusSupply}
              options={SUPPLY_TYPES.map((supply) => ({
                value: supply,
                label: SUPPLY_META[supply].shortLabel,
              }))}
            />

            <RangeSlider
              label={`${editingWard.shortName} · ${supplyMeta.label}`}
              value={draft.demand[editingWard.id][focusSupply]}
              min={DEMAND_MIN}
              max={DEMAND_MAX}
              step={50}
              formatValue={(value) => `${formatNumber(value)} ${supplyMeta.unit}`}
              onChange={(value) => updateDemand(editingWard.id, focusSupply, value)}
              hint={`Requested units for this ward. Current stock total for ${supplyMeta.shortLabel.toLowerCase()}: ${formatNumber(
                stockTotal,
              )} units.`}
            />

            <div className="grid grid-cols-3 gap-1">
              {SUPPLY_TYPES.map((supply) => (
                <div
                  key={supply}
                  className={cn(
                    'rounded border px-1.5 py-1',
                    supply === focusSupply
                      ? 'border-line bg-night-900/60'
                      : 'border-line/50 bg-night-950/20',
                  )}
                >
                  <div className="font-mono text-[7px] uppercase tracking-[0.09em] text-mist-600">
                    {SUPPLY_META[supply].shortLabel}
                  </div>
                  <div className="num mt-0.5 text-[10px] text-mist-200">
                    {formatNumber(draft.demand[editingWard.id][supply])}
                  </div>
                </div>
              ))}
            </div>

            <RangeSlider
              label="Urgency"
              value={draftUrgency}
              min={1}
              max={5}
              step={1}
              formatValue={(value) => `${value}/5 · ${URGENCY_META[value]?.label ?? ''}`}
              onChange={(value) => updateUrgency(editingWard.id, value)}
              hint={`Vulnerability score is fixed at ${editingWard.vulnerability.score}/100 for this prototype. Urgency feeds the optimizer's need weight.`}
              leftLabel="Low"
              rightLabel="Critical"
            />

            <div className="flex flex-wrap gap-1 border-t border-line/60 pt-2">
              <Badge tone="neutral">Pop. {formatNumber(editingWard.population)}</Badge>
              <Badge tone="violet">Vulnerability {editingWard.vulnerability.score}</Badge>
              <Badge tone="amber">{editingWard.vulnerability.informalHousingPct}% informal housing</Badge>
            </div>
          </Panel>

          <Panel
            kicker="Supply availability"
            title="Depot stock"
            action={<Badge tone="violet">Draft</Badge>}
            subtitle={`${supplyMeta.label} held across the three simulated depots.`}
            bodyClassName="space-y-3 p-3"
          >
            {state.scenario.depots.map((depot) => {
              const value = draft.stock[depot.id][focusSupply]
              const share = stockTotal > 0 ? value / stockTotal : 0
              return (
                <div key={depot.id}>
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-mist-300">
                      <span className="font-mono text-[8px] text-mist-500">Depot {depot.code}</span>{' '}
                      {depot.shortName}
                    </span>
                    <span className="num text-[9px] text-mist-400">{formatPct(share, 0)}</span>
                  </div>
                  <RangeSlider
                    label={`${depot.code} stock`}
                    value={value}
                    min={0}
                    max={9000}
                    step={100}
                    formatValue={(next) => `${formatNumber(next)} ${supplyMeta.unit}`}
                    onChange={(next) => updateStock(depot.id, next)}
                  />
                </div>
              )
            })}
            <div className="flex items-center justify-between border-t border-line/60 pt-2 font-mono text-[8px] uppercase tracking-[0.06em] text-mist-500">
              <span>Total {supplyMeta.shortLabel.toLowerCase()}</span>
              <span className="num text-mist-200">{formatNumber(stockTotal)} units</span>
            </div>
            <InfoNote>
              Stock is fictional and held only at these depots. Increasing stock does not add vehicles
              or open roads.
            </InfoNote>
          </Panel>

          <Panel
            kicker="Plan basis"
            title="Strategy & priority"
            action={<Badge tone="teal">Applies live</Badge>}
            subtitle="These controls recompute the committed plan immediately."
            bodyClassName="space-y-3 p-3"
          >
            <div className="space-y-1">
              {STRATEGY_ORDER.map((strategy) => {
                const active = state.strategy === strategy
                return (
                  <button
                    key={strategy}
                    type="button"
                    aria-pressed={active}
                    onClick={() => actions.setStrategy(strategy)}
                    className={cn(
                      'flex w-full items-start gap-2 rounded border px-2 py-1.5 text-left transition-colors',
                      active
                        ? 'border-signal/35 bg-signal/[0.055]'
                        : 'border-line/60 bg-night-950/20 hover:border-line hover:bg-white/[0.03]',
                    )}
                  >
                    <span
                      className={cn(
                        'mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border',
                        active ? 'border-signal/50 bg-signal/15 text-signal-bright' : 'border-line text-transparent',
                      )}
                      aria-hidden
                    >
                      <Check size={8} strokeWidth={3} />
                    </span>
                    <span className="min-w-0">
                      <span className={cn('block text-[10px] font-medium', active ? 'text-mist-50' : 'text-mist-300')}>
                        {STRATEGY_META[strategy].label}
                      </span>
                      <span className="mt-0.5 block text-[8.5px] leading-relaxed text-mist-500">
                        {STRATEGY_META[strategy].description}
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>

            <div className="border-t border-line/60 pt-2">
              <RangeSlider
                label="Coverage ↔ vulnerability priority"
                value={priorityDraft}
                min={0}
                max={100}
                step={5}
                formatValue={(value) => `${value}% vulnerability`}
                onChange={setPriorityDraft}
                onCommit={commitPriority}
                hint="Moves the optimizer's weight from demand share toward urgency and vulnerability. It does not change physical stock."
                leftLabel="Coverage"
                rightLabel="Vulnerability"
              />
              <p className="mt-1 font-mono text-[7.5px] uppercase tracking-[0.06em] text-mist-600">
                Optimizer-only · priority {state.priority}% currently applied
              </p>
            </div>
          </Panel>
        </div>

        <div className="space-y-3">
          <Panel
            kicker="Computed plan"
            title="Draft plan summary"
            action={<Badge tone={dirty ? 'amber' : 'teal'}>{dirty ? 'Unsaved draft' : 'Matches committed'}</Badge>}
            bodyClassName="p-3"
          >
            <InfoNote tone="amber" className="mb-3">
              <span className="font-medium text-[#f0d5a8]">Implemented engine, bounded scope.</span>{' '}
              A deterministic greedy allocator posts units through Dijkstra routes, limited by depot
              stock, remaining ward demand, vehicle capacity and each vehicle’s run budget. It is not a
              solver for an optimal plan and not a validated operational model.
            </InfoNote>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                {
                  label: 'Coverage',
                  value: formatPct(previewPlan.totals.coverage, 1),
                  delta: signed(coverageDelta, 1, 'pp'),
                  deltaLabel: 'vs committed',
                },
                {
                  label: 'Priority-unmet',
                  value: formatNumber(previewPlan.totals.priorityWeightedUnmet),
                  delta: signed(unmetDelta, 0),
                  deltaLabel: 'weighted units',
                },
                {
                  label: 'Vehicle-hours',
                  value: `${formatDecimal(previewPlan.totals.vehicleHours)} h`,
                  delta: signed(hoursDelta, 1, 'h'),
                  deltaLabel: 'vs committed',
                },
                {
                  label: 'Coverage equity',
                  value:
                    previewPlan.totals.fairness === null
                      ? '—'
                      : `${formatDecimal(previewPlan.totals.fairness)}`,
                  delta: fairnessDelta === null ? '—' : signed(fairnessDelta, 1),
                  deltaLabel: 'vs committed',
                },
              ].map((metric) => (
                <div key={metric.label} className="rounded border border-line/70 bg-night-950/35 p-2">
                  <div className="font-mono text-[7px] uppercase tracking-[0.09em] text-mist-600">
                    {metric.label}
                  </div>
                  <div className="num mt-1 text-[16px] font-medium leading-none text-mist-50">
                    {metric.value}
                  </div>
                  <div className="mt-1 flex items-center gap-1 font-mono text-[7.5px] text-mist-500">
                    {metric.delta.startsWith('+') ? (
                      <ArrowUpRight size={9} aria-hidden className="text-mist-500" />
                    ) : metric.delta.startsWith('-') ? (
                      <ArrowDownRight size={9} aria-hidden className="text-mist-500" />
                    ) : null}
                    <span>{metric.delta}</span>
                    <span className="text-mist-600">{metric.deltaLabel}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line/60 pt-2">
              <p className="font-mono text-[8px] uppercase tracking-[0.05em] text-mist-600">
                {formatNumber(previewPlan.totals.allocated)} allocated ·{' '}
                {formatNumber(previewPlan.totals.unmetUnits)} unmet ·{' '}
                {previewPlan.totals.trips} planned runs
              </p>
              <div className="flex gap-1.5">
                <Button
                  variant="secondary"
                  size="xs"
                  onClick={() => setDraft(editsFromScenario(state.scenario))}
                  disabled={!dirty}
                >
                  Discard
                </Button>
                <Button
                  variant="primary"
                  size="xs"
                  onClick={applyDraft}
                  disabled={!dirty || state.isRecalculating}
                >
                  Apply to console
                </Button>
              </div>
            </div>
          </Panel>

          <Panel
            kicker="Change summary"
            title="Draft vs committed plan"
            action={<Badge tone="amber">If applied</Badge>}
            subtitle="Allocation-level differences computed from the applied plan and this draft."
            bodyClassName="p-3"
          >
            <PlanChangeSummary previous={state.plan} current={previewPlan} scenario={state.scenario} />
          </Panel>

          <Panel
            kicker="Engine output"
            title="Routing, fleet & depot metrics"
            action={<Badge tone="teal">Computed</Badge>}
            subtitle="Derived from the deliveries this draft’s allocator actually produced, using the current road graph."
            bodyClassName="p-3"
          >
            <EngineMetrics plan={previewPlan} scenario={previewScenario} />
          </Panel>

          <Panel
            kicker="Strategy comparison"
            title="Computed across allocation bases"
            action={<Badge tone="teal">Measured output</Badge>}
            subtitle="Selecting a card applies that strategy immediately. Each strategy is run on its own copy of your draft inputs."
            bodyClassName="space-y-2.5 p-3"
          >
            <StrategyCards
              comparisons={previewComparisons}
              active={state.strategy}
              onSelect={actions.setStrategy}
            />
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line/60 pt-2">
              <p className="max-w-[75%] text-[9px] leading-relaxed text-mist-500">
                {STRATEGY_META[state.strategy].method}. Fairness is a chosen coverage-equity objective,
                not an objective truth.
              </p>
              <Button
                variant="ghost"
                size="xs"
                onClick={() => actions.setAnalysisTab('compare')}
                trailingIcon={<ArrowUpRight size={10} aria-hidden />}
              >
                Full table
              </Button>
            </div>
          </Panel>

          <Panel
            kicker="Allocation matrix"
            title="Draft allocation by ward"
            action={
              <div className="flex items-center gap-1.5">
                <Badge tone="amber">Draft</Badge>
                <Badge tone="neutral">{formatPct(previewPlan.totals.coverage, 0)}</Badge>
              </div>
            }
            subtitle="Allocated / requested units. Click a ward name to select it across the console."
            bodyClassName="p-0"
          >
            {previewEmpty ? (
              <div className="p-3">
                <EmptyState
                  title="No supplies allocated in this draft"
                  description="Stock is zero in this draft. Raise depot stock or reset the scenario to restore the preset."
                  action={
                    <Button
                      size="xs"
                      variant="secondary"
                      onClick={() => setDraft(editsFromScenario(state.scenario))}
                    >
                      Discard draft
                    </Button>
                  }
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[540px] border-collapse text-left">
                  <caption className="sr-only">
                    Draft allocation by neighbourhood, expressed as allocated units out of requested
                    units for each supply type.
                  </caption>
                  <thead>
                    <tr className="border-b border-line/70">
                      <th scope="col" className="py-2 pl-3 pr-2 text-left">
                        <span className="label-tiny">Neighbourhood</span>
                      </th>
                      {SUPPLY_TYPES.map((supply) => (
                        <th key={supply} scope="col" className="px-2 py-2 text-right">
                          <span className="label-tiny">{SUPPLY_META[supply].shortLabel}</span>
                        </th>
                      ))}
                      <th scope="col" className="py-2 pl-2 pr-3 text-right">
                        <span className="label-tiny">Coverage</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewPlan.wards.map((wardPlan) => {
                      const ward = state.scenario.wards.find((entry) => entry.id === wardPlan.wardId)
                      if (!ward) return null
                      const selected = state.selectedWardId === ward.id
                      return (
                        <tr
                          key={ward.id}
                          className={cn(
                            'border-b border-line/40 transition-colors last:border-b-0',
                            selected ? 'bg-signal/[0.05]' : 'hover:bg-white/[0.025]',
                          )}
                        >
                          <th scope="row" className="py-1.5 pl-3 pr-2 text-left font-normal">
                            <button
                              type="button"
                              onClick={() => actions.selectWard(ward.id)}
                              className="flex items-center gap-1.5 text-left"
                              aria-pressed={selected}
                            >
                              <span
                                aria-hidden
                                className={cn(
                                  'h-1 w-1 shrink-0 rounded-full',
                                  ward.urgency === 5 ? 'bg-critical' : ward.urgency === 4 ? 'bg-warn' : 'bg-signal',
                                )}
                              />
                              <span className="min-w-0">
                                <span className="block truncate text-[9.5px] font-medium text-mist-200">
                                  {ward.shortName}
                                </span>
                                <span className="block font-mono text-[7px] uppercase tracking-[0.06em] text-mist-600">
                                  {ward.code} · U{wardPlan.urgency}
                                </span>
                              </span>
                            </button>
                          </th>
                          {SUPPLY_TYPES.map((supply) => {
                            const entry = wardPlan.bySupply[supply]
                            return (
                              <td key={supply} className="px-2 py-1.5 text-right align-middle">
                                <div className="num text-[9px] text-mist-200">
                                  {formatNumber(entry.allocated)}
                                  <span className="text-mist-600"> / {formatNumber(entry.demand)}</span>
                                </div>
                                <ProgressBar
                                  value={entry.demand > 0 ? entry.allocated / entry.demand : 0}
                                  label={`${SUPPLY_META[supply].shortLabel} for ${ward.shortName}`}
                                  tone={
                                    supply === 'water' ? 'sky' : supply === 'medical' ? 'violet' : 'amber'
                                  }
                                  heightClass="h-[2px]"
                                  className="ml-auto mt-1 w-12"
                                />
                              </td>
                            )
                          })}
                          <td className="py-1.5 pl-2 pr-3 text-right">
                            <span
                              className={cn(
                                'num text-[9.5px]',
                                wardPlan.coverage < 0.6 ? 'text-[#f0c98b]' : 'text-mist-200',
                              )}
                            >
                              {formatPct(wardPlan.coverage, 0)}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line/60 px-3 py-2">
              <span className="font-mono text-[7.5px] uppercase tracking-[0.06em] text-mist-600">
                {dirty ? 'Previewing unsaved inputs' : 'Applied inputs'} · deterministic greedy engine
              </span>
              <span className="font-mono text-[7.5px] uppercase tracking-[0.06em] text-mist-600">
                {formatNumber(previewPlan.totals.unmetUnits)} units unmet
              </span>
            </div>
          </Panel>

          <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-line/70 bg-night-900/35 px-3 py-2">
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={12} aria-hidden className="text-mist-500" />
              <p className="text-[9px] leading-relaxed text-mist-500">
                Reset restores demand, urgency, stock, vehicles and roads from the preset. Strategy and
                priority stay as set.
              </p>
            </div>
            <div className="flex gap-1.5">
              <Button
                variant="secondary"
                size="xs"
                onClick={() => setConfirmReset(true)}
                icon={<RotateCcw size={10} aria-hidden />}
              >
                Reset scenario
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={applyDraft}
                disabled={!dirty || state.isRecalculating}
                icon={<Save size={11} aria-hidden />}
              >
                Apply changes
              </Button>
            </div>
          </div>

          {state.strategy !== 'optimizer' ? (
            <InfoNote>
              <span className="inline-flex items-center gap-1 font-medium text-[#c7efe9]">
                <TriangleAlert size={10} aria-hidden /> Priority slider inactive
              </span>{' '}
              The {STRATEGY_META[state.strategy].label} strategy ignores urgency weights. Switch back to
              the RescueGrid Optimizer to use the coverage ↔ vulnerability slider.
            </InfoNote>
          ) : null}
        </div>
      </div>

      <ConfirmDialog
        open={confirmReset}
        title={`Reset ${preset.name}?`}
        description="Demand, urgency, depot stock, vehicle availability and road states will return to the fictional preset. Your strategy and priority settings are kept."
        confirmLabel="Reset scenario"
        onCancel={() => setConfirmReset(false)}
        onConfirm={() => {
          actions.resetScenario()
          setConfirmReset(false)
        }}
      />      <p className="sr-only" aria-live="polite">
        {state.isRecalculating
          ? 'Recalculating the allocation plan.'
          : `Plan updated. Coverage ${formatPct(previewPlan.totals.coverage, 1)}.`}
      </p>
    </div>
  )
}
```

---

## `src/screens/Overview.tsx`

```tsx
import {
  AlertTriangle,
  ArrowUpRight,
  BriefcaseMedical,
  Droplets,
  Gauge,
  MapPin,
  Package,
  PackageSearch,
  Truck,
  Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { CoverageChart } from '../components/charts/CoverageChart'
import { EventList } from '../components/events/EventList'
import { CommandMap } from '../components/map/CommandMap'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { InfoNote } from '../components/ui/InfoNote'
import { Panel } from '../components/ui/Panel'
import { ProgressBar, type ProgressTone } from '../components/ui/ProgressBar'
import { ScreenHeader } from '../components/ui/ScreenHeader'
import { StatCard } from '../components/ui/StatCard'
import { SCENARIO_PRESETS } from '../data/sagarika'
import { SUPPLY_META, SUPPLY_TYPES } from '../lib/constants'
import { formatNumber, formatPct } from '../lib/format'
import { cn } from '../lib/cn'
import { useSimulation } from '../state/SimulationContext'
import type { SupplyType } from '../types'

const SUPPLY_ICON: Record<SupplyType, LucideIcon> = {
  water: Droplets,
  medical: BriefcaseMedical,
  food: Package,
}

const SUPPLY_TONE: Record<SupplyType, ProgressTone> = {
  water: 'sky',
  medical: 'violet',
  food: 'amber',
}

export function Overview() {
  const { state, actions } = useSimulation()
  const { plan, scenario } = state
  const preset = SCENARIO_PRESETS[state.scenarioId]
  const wardCount = scenario.wards.length
  const supplyRatio = plan.totals.demand > 0 ? plan.totals.stock / plan.totals.demand : 0
  const urgentWards = plan.wards
    .filter((ward) => ward.urgency >= 4)
    .sort((a, b) => b.priorityWeightedUnmet - a.priorityWeightedUnmet || b.urgency - a.urgency)
  const urgentDemand = urgentWards.reduce((sum, ward) => sum + ward.demandUnits, 0)
  const urgentMet = Math.max(0, urgentDemand - plan.totals.unmetUrgent)
  const urgentCoverage = urgentDemand > 0 ? urgentMet / urgentDemand : 0

  return (
    <div className="space-y-3 p-3 sm:p-4">
      <ScreenHeader
        kicker="Situation board · fictional district"
        title={`${scenario.district} — ${preset.name}`}
        description={
          <>
            {scenario.tagline}. All wards, routes, stock and conditions are simulated; this board is a
            planning prototype, not a live dispatch system.
          </>
        }
        actions={
          <>
            <Badge tone={scenario.severity === 'Critical' ? 'red' : 'amber'} dot>
              {scenario.severity} conditions
            </Badge>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => actions.navigate('lab')}
              trailingIcon={<ArrowUpRight size={12} aria-hidden />}
            >
              Tune plan
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={actions.recalculate}
              loading={state.isRecalculating}
              disabled={state.isRecalculating}
            >
              Refresh board
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label="Supplies available"
          value={formatNumber(plan.totals.stock)}
          unit="units"
          caption={`${formatPct(supplyRatio, 0)} of requested demand stocked`}
          icon={<PackageSearch size={13} aria-hidden />}
          progress={supplyRatio}
          progressTone="teal"
        />
        <StatCard
          label="Total demand"
          value={formatNumber(plan.totals.demand)}
          unit="units"
          caption={`${wardCount} wards · ${SUPPLY_TYPES.length} supply types`}
          icon={<Package size={13} aria-hidden />}
          tone="default"
        />
        <StatCard
          label="Estimated coverage"
          value={formatPct(plan.totals.coverage, 1)}
          caption="Deterministic allocation result"
          icon={<Gauge size={13} aria-hidden />}
          tone="teal"
          progress={plan.totals.coverage}
          progressTone="teal"
        />
        <StatCard
          label="Unmet urgent demand"
          value={formatNumber(plan.totals.unmetUrgent)}
          unit="units"
          caption={`${formatPct(1 - urgentCoverage, 0)} of urgency 4–5 requests`}
          icon={<AlertTriangle size={13} aria-hidden />}
          tone="amber"
          progress={1 - urgentCoverage}
          progressTone="amber"
        />
        <StatCard
          label="Vehicles in use"
          value={`${plan.totals.vehiclesUsed} / ${plan.totals.vehiclesAvailable}`}
          caption={`${plan.totals.trips} planned runs · ${plan.totals.runSlots} slots`}
          icon={<Truck size={13} aria-hidden />}
          tone={plan.totals.vehiclesUsed === 0 ? 'amber' : 'sky'}
          progress={plan.totals.fleetUtilisation / 100}
          progressTone="sky"
        />
        <StatCard
          label="Incomplete wards"
          value={`${plan.totals.incompleteWards} / ${wardCount}`}
          caption="Wards below full coverage"
          icon={<MapPin size={13} aria-hidden />}
          tone={plan.totals.incompleteWards > 0 ? 'amber' : 'teal'}
          progress={plan.totals.incompleteWards / Math.max(1, wardCount)}
          progressTone="amber"
        />
      </div>

      <CommandMap heightClass="h-[330px] sm:h-[380px] xl:h-[430px]" />

      <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-[1.22fr_0.78fr]">
        <CoverageChart
          scenario={scenario}
          plan={plan}
          selectedWardId={state.selectedWardId}
          onSelectWard={actions.selectWard}
        />

        <Panel
          kicker="Stock"
          title="Supply inventory"
          action={<Badge tone="neutral">{formatPct(supplyRatio, 0)} stocked</Badge>}
          className="h-full"
          bodyClassName="p-3"
        >
          <div className="space-y-3">
            {SUPPLY_TYPES.map((supply) => {
              const totals = plan.supplies[supply]
              const meta = SUPPLY_META[supply]
              const Icon = SUPPLY_ICON[supply]
              return (
                <div key={supply} aria-label={`${meta.label}: ${formatNumber(totals.stock)} available`}>
                  <div className="mb-1 flex items-center gap-1.5">
                    <Icon size={12} aria-hidden style={{ color: meta.color }} />
                    <span className="text-[10px] font-medium text-mist-200">{meta.label}</span>
                    <span className="num ml-auto text-[10px] text-mist-200">
                      {formatNumber(totals.stock)}
                    </span>
                    <span className="font-mono text-[8px] text-mist-600">available</span>
                  </div>
                  <ProgressBar
                    value={totals.stock > 0 ? totals.coverage : 0}
                    label={`${meta.label} demand coverage`}
                    tone={SUPPLY_TONE[supply]}
                    heightClass="h-[5px]"
                  />
                  <div className="mt-1 flex items-center justify-between font-mono text-[7.5px] text-mist-600">
                    <span>
                      {formatNumber(totals.allocated)} allocated · {formatNumber(totals.unmet)} unmet
                    </span>
                    <span>{totals.remainingStock > 0 ? `${formatNumber(totals.remainingStock)} reserve` : 'fully committed'}</span>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="mt-3 border-t border-line/60 pt-2">
            <p className="text-[9px] leading-relaxed text-mist-500">
              {scenario.supplyNotes.water} {scenario.supplyNotes.medical}
            </p>
            <p className="mt-1 font-mono text-[7.5px] uppercase tracking-[0.06em] text-mist-600">
              Fictional stock · held at three depots
            </p>
          </div>
        </Panel>
      </div>

      <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-[1.22fr_0.78fr]">
        <Panel
          kicker="Priority"
          title="Urgent neighbourhoods"
          action={
            <Badge tone={urgentWards.length > 0 ? 'amber' : 'teal'}>
              {urgentWards.length} urgency 4–5
            </Badge>
          }
          className="h-full"
          bodyClassName="p-2"
        >
          {urgentWards.length === 0 ? (
            <p className="p-3 text-[10px] text-mist-500">No wards currently carry urgency 4 or 5.</p>
          ) : (
            <div className="space-y-1">
              {urgentWards.map((wardPlan) => {
                const ward = scenario.wards.find((entry) => entry.id === wardPlan.wardId)
                if (!ward) return null
                const selected = state.selectedWardId === ward.id
                const urgentRequest = SUPPLY_TYPES.reduce(
                  (sum, supply) => sum + wardPlan.bySupply[supply].demand,
                  0,
                )
                return (
                  <button
                    key={ward.id}
                    type="button"
                    onClick={() => actions.selectWard(ward.id)}
                    aria-pressed={selected}
                    className={cn(
                      'flex w-full items-center gap-2 rounded border px-2 py-1.5 text-left transition-colors',
                      selected
                        ? 'border-signal/30 bg-signal/[0.055]'
                        : 'border-transparent hover:border-line/70 hover:bg-white/[0.03]',
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        'h-1.5 w-1.5 shrink-0 rounded-full',
                        ward.urgency === 5 ? 'bg-critical' : 'bg-warn',
                      )}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className="truncate text-[10px] font-medium text-mist-200">
                          {ward.name}
                        </span>
                        <span className="num shrink-0 text-[9.5px] text-mist-300">
                          {formatPct(wardPlan.coverage, 0)}
                        </span>
                      </span>
                      <span className="mt-0.5 flex items-center justify-between gap-2 font-mono text-[7.5px] uppercase tracking-[0.04em] text-mist-600">
                        <span>
                          {formatNumber(wardPlan.unmetUnits)} unmet · vulnerability {ward.vulnerability.score}
                        </span>
                        <span>
                          U{ward.urgency} · {formatNumber(urgentRequest)} requested
                        </span>
                      </span>
                    </span>
                    <ProgressBar
                      value={wardPlan.coverage}
                      label={`${ward.shortName} coverage`}
                      tone={wardPlan.coverage < 0.65 ? 'amber' : 'teal'}
                      heightClass="h-[3px]"
                      className="w-14 shrink-0"
                    />
                  </button>
                )
              })}
            </div>
          )}
          <div className="mt-1 flex items-center justify-between px-2 pt-1 font-mono text-[7.5px] uppercase tracking-[0.05em] text-mist-600">
            <span className="inline-flex items-center gap-1">
              <Users size={9} aria-hidden />
              {formatNumber(urgentDemand)} units requested by urgent wards
            </span>
            <span>Select to inspect</span>
          </div>
        </Panel>

        <Panel
          kicker="Log"
          title="Recent simulation events"
          action={<Badge tone="neutral">Local</Badge>}
          className="h-full"
          bodyClassName="p-3"
        >
          <EventList
            events={state.events}
            limit={5}
            dense
            emptyTitle="No simulation events"
            emptyDescription="Plan refreshes, road changes and applied inputs appear here."
          />
          <p className="mt-1 border-t border-line/60 pt-1.5 font-mono text-[7.5px] uppercase tracking-[0.05em] text-mist-600">
            Simulated event log · no live feed
          </p>
        </Panel>
      </div>

      <InfoNote tone="amber">
        All values on this board are computed from the fictional preset by the deterministic
        allocator and Dijkstra router. Nothing here is a real report, a live feed or a measured result. Use the Reports
        screen for the printable summary and its assumptions.
      </InfoNote>
    </div>
  )
}
```

---

## `src/screens/Reports.tsx`

```tsx
import { FileText, Printer } from 'lucide-react'
import type { ReactNode } from 'react'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { InfoNote } from '../components/ui/InfoNote'
import { RescueMark } from '../components/ui/Logo'
import { ScreenHeader } from '../components/ui/ScreenHeader'
import { SCENARIO_PRESETS } from '../data/sagarika'
import { RUNS_PER_VEHICLE, STRATEGY_META, STRATEGY_ORDER, SUPPLY_META, SUPPLY_TYPES } from '../lib/constants'
import { formatDateTime, formatDecimal, formatNumber, formatPct } from '../lib/format'
import { cn } from '../lib/cn'
import { useSimulation } from '../state/SimulationContext'
import type { Plan } from '../types'

function ReportSection({
  index,
  title,
  children,
  className,
}: {
  index: number
  title: string
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn('print-avoid-break', className)}>
      <div className="mb-2 flex items-center gap-2 border-b border-[#17232a]/35 pb-1">
        <span className="font-mono text-[8px] font-medium text-[#0f766e]">
          {String(index).padStart(2, '0')}
        </span>
        <h2 className="font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-[#24343a]">
          {title}
        </h2>
      </div>
      {children}
    </section>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-[#17232a]/15 bg-[#fbf8f0] px-2 py-1.5">
      <div className="font-mono text-[7px] uppercase tracking-[0.08em] text-[#69767a]">{label}</div>
      <div className="num mt-0.5 text-[11px] font-medium text-[#17232a]">{value}</div>
    </div>
  )
}

function nodeLabel(state: ReturnType<typeof useSimulation>['state'], id: string): string {
  const ward = state.scenario.wards.find((entry) => entry.id === id)
  if (ward) return ward.shortName
  const depot = state.scenario.depots.find((entry) => entry.id === id)
  if (depot) return `Depot ${depot.code}`
  return id
}

export function Reports() {
  const { state, comparisons } = useSimulation()
  const { plan, scenario } = state
  const preset = SCENARIO_PRESETS[state.scenarioId]
  const generatedAt = state.lastRecalculatedAt
  const urgentWards = plan.wards
    .filter((ward) => ward.urgency >= 4)
    .sort((a, b) => b.priorityWeightedUnmet - a.priorityWeightedUnmet || b.urgency - a.urgency)
  const disruptedRoads = scenario.roads.filter((road) => road.state !== 'open')
  const blockedRoads = scenario.roads.filter((road) => road.state === 'blocked')
  const urgentUnmetDetail = urgentWards
    .filter((ward) => ward.unmetUnits > 0)
    .flatMap((wardPlan) => {
      const ward = scenario.wards.find((entry) => entry.id === wardPlan.wardId)
      return ward ? [{ ward, wardPlan }] : []
    })

  const summary = `This simulated plan allocates ${formatNumber(plan.totals.allocated)} of ${formatNumber(
    plan.totals.demand,
  )} requested kits and packs (${formatPct(plan.totals.coverage, 1)}) across ${scenario.wards.length} fictional wards using the ${
    STRATEGY_META[state.strategy].label
  } at ${state.priority}% vulnerability priority. ${plan.totals.vehiclesUsed} of ${
    plan.totals.vehiclesAvailable
  } available vehicles are assigned ${plan.totals.trips} planned runs over the demo road graph. ${
    blockedRoads.length
  } segment${blockedRoads.length === 1 ? ' is' : 's are'} blocked; ${plan.totals.incompleteWards} ward${
    plan.totals.incompleteWards === 1 ? '' : 's'
  } remain below full coverage, and ${plan.totals.unreachableWards} ward${
    plan.totals.unreachableWards === 1 ? ' has' : 's have'
  } no open route to a depot.`

  const comparisonRows: Array<{ label: string; value: (candidate: Plan) => string }> = [
    { label: 'Demand coverage', value: (candidate) => formatPct(candidate.totals.coverage, 1) },
    {
      label: 'Priority-weighted unmet',
      value: (candidate) => formatNumber(candidate.totals.priorityWeightedUnmet),
    },
    {
      label: 'Estimated vehicle-hours',
      value: (candidate) => `${formatDecimal(candidate.totals.vehicleHours)} h`,
    },
    {
      label: 'Coverage equity',
      value: (candidate) =>
        candidate.totals.fairness === null ? '—' : `${formatDecimal(candidate.totals.fairness)} / 100`,
    },
  ]

  const totalStock = plan.totals.stock
  const totalAllocated = plan.totals.allocated
  const totalDemand = plan.totals.demand
  const totalUnmet = plan.totals.unmetUnits

  return (
    <div className="space-y-3 p-3 sm:p-4">
      <div className="no-print space-y-3">
        <ScreenHeader
          kicker="Reports · situation summary"
          title="Printable situation report"
          description="A consistent snapshot of the selected scenario, allocations, unmet demand, road states and the three-strategy comparison. Includes its assumptions and limitations."
          actions={
            <>
              <Badge tone="amber" dot>
                Simulation record
              </Badge>
              <Button
                variant="primary"
                size="sm"
                onClick={() => window.print()}
                icon={<Printer size={12} aria-hidden />}
              >
                Print report
              </Button>
            </>
          }
        />
        <InfoNote>
          Printing opens the browser print dialog. To produce a PDF, choose “Save as PDF” there — this
          prototype does not generate or export a PDF file itself. The printed sheet uses the same
          displayed scenario data as the console.
        </InfoNote>
      </div>

      <article className="report-sheet mx-auto w-full max-w-[880px] overflow-hidden rounded-lg shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)]">
        <header className="border-b-[3px] border-[#0f766e] px-4 py-4 sm:px-7 sm:py-5">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
            <div className="flex items-start gap-2.5">
              <RescueMark size={34} />
              <div>
                <div className="font-mono text-[7.5px] uppercase tracking-[0.18em] text-[#617175]">
                  Sagarika District · Fictional simulation
                </div>
                <h1 className="mt-0.5 text-[20px] font-semibold leading-tight tracking-[-0.025em] text-[#14231f]">
                  Situation report
                </h1>
                <p className="mt-0.5 text-[9.5px] text-[#5d6c6d]">
                  Resource allocation plan · {preset.name}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-start gap-1.5 sm:items-end">
              <div className="rotate-[-1.5deg] rounded border-2 border-[#a16207]/70 px-2.5 py-1 text-center">
                <div className="font-mono text-[8px] font-semibold uppercase leading-tight tracking-[0.14em] text-[#8a5608]">
                  Simulation
                </div>
                <div className="font-mono text-[6.5px] uppercase tracking-[0.1em] text-[#9c762d]">
                  Not a real dispatch record
                </div>
              </div>
              <div className="font-mono text-[7px] uppercase tracking-[0.08em] text-[#7a8789]">
                Generated {formatDateTime(generatedAt)}
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-[#17232a]/15 pt-3 sm:grid-cols-3">
            {[
              ['Scenario', preset.name],
              ['Snapshot', scenario.snapshotLabel],
              ['Generated locally', formatDateTime(generatedAt)],
              ['Plan revision', `rev ${state.planRevision}`],
              ['Active strategy', STRATEGY_META[state.strategy].label],
              ['Priority basis', `${state.priority}% vulnerability priority`],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="font-mono text-[7px] uppercase tracking-[0.1em] text-[#7a8789]">{label}</dt>
                <dd className="mt-0.5 text-[9px] font-medium text-[#233238]">{value}</dd>
              </div>
            ))}
          </div>
        </header>

        <div className="space-y-5 px-4 py-4 sm:px-7 sm:py-5">
          <section className="rounded border border-[#a16207]/25 bg-[#fdf6e7] px-3 py-2">
            <div className="flex items-start gap-2">
              <FileText size={12} aria-hidden className="mt-px shrink-0 text-[#9c762d]" />
              <p className="text-[8.5px] leading-relaxed text-[#6f5b33]">
                <span className="font-semibold text-[#6a4b12]">Fictional prototype record.</span>{' '}
                Sagarika District does not exist. All wards, depots, roads, vehicles, quantities and
                conditions are invented for demonstration. This is a deterministic planning record, not
                a field report, dispatch order or measured performance result.
              </p>
            </div>
          </section>

          <ReportSection index={1} title="Executive summary">
            <p className="text-[9.5px] leading-relaxed text-[#304044]">{summary}</p>
            <div className="mt-2.5 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
              <MiniStat label="Coverage" value={formatPct(plan.totals.coverage, 1)} />
              <MiniStat label="Unmet urgent" value={`${formatNumber(plan.totals.unmetUrgent)} units`} />
              <MiniStat
                label="Vehicles assigned"
                value={`${plan.totals.vehiclesUsed} / ${plan.totals.vehiclesAvailable}`}
              />
              <MiniStat label="Blocked roads" value={String(blockedRoads.length)} />
            </div>
            <p className="mt-2 text-[8.5px] leading-relaxed text-[#69767a]">
              Coverage is allocated units ÷ requested units. Urgent demand means wards at urgency 4 or 5.
              Routing uses Dijkstra over the demo graph; every delivery respects depot stock, ward demand,
              vehicle capacity and the vehicle run budget. {formatDecimal(plan.totals.routeDistanceKm)} km of
              round-trip route distance and {formatDecimal(plan.totals.routeTimeHours)} vehicle-hours are
              planned; {formatPct(plan.totals.fleetCapacityUsage, 0)} of offered vehicle capacity is used.
            </p>
          </ReportSection>

          <ReportSection index={2} title="Assumptions">
            <ol className="space-y-1">
              {scenario.assumptions.map((assumption, index) => (
                <li key={index} className="flex gap-2 text-[9px] leading-relaxed text-[#35464a]">
                  <span className="num shrink-0 font-mono text-[8px] text-[#8a9698]">
                    A{index + 1}
                  </span>
                  {assumption}
                </li>
              ))}
              <li className="flex gap-2 text-[9px] leading-relaxed text-[#35464a]">
                <span className="num shrink-0 font-mono text-[8px] text-[#8a9698]">A5</span>
                All state is browser-local. No login, backend, live feed, paid API or AI model is used.
              </li>
              <li className="flex gap-2 text-[9px] leading-relaxed text-[#35464a]">
                <span className="num shrink-0 font-mono text-[8px] text-[#8a9698]">A6</span>
                Allocation is greedy and priority-ordered: each delivery is capped by remaining depot
                stock, ward demand, vehicle capacity and a {RUNS_PER_VEHICLE}-run budget per available
                vehicle. It is not a solver for a globally optimal plan.
              </li>
              <li className="flex gap-2 text-[9px] leading-relaxed text-[#35464a]">
                <span className="num shrink-0 font-mono text-[8px] text-[#8a9698]">A7</span>
                Routes are the lowest-cost open path found by Dijkstra; there is no live traffic, tide or
                closure feed, and unreachable wards receive no delivery.
              </li>
            </ol>
          </ReportSection>

          <ReportSection index={3} title="Supply position">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left">
                <caption className="sr-only">Supply availability, allocation and unmet demand by type.</caption>
                <thead>
                  <tr>
                    {['Supply', 'Available stock', 'Requested', 'Allocated', 'Unmet', 'Coverage'].map(
                      (label) => (
                        <th
                          key={label}
                          scope="col"
                          className="pb-1 pr-2 font-mono text-[7px] uppercase tracking-[0.08em] text-[#778589]"
                        >
                          {label}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {SUPPLY_TYPES.map((supply) => {
                    const totals = plan.supplies[supply]
                    return (
                      <tr key={supply}>
                        <th scope="row" className="py-1.5 pr-2 text-left text-[9px] font-medium text-[#233238]">
                          {SUPPLY_META[supply].label}
                        </th>
                        <td className="num py-1.5 pr-2 text-[9px] text-[#3e4e52]">
                          {formatNumber(totals.stock)}
                        </td>
                        <td className="num py-1.5 pr-2 text-[9px] text-[#3e4e52]">
                          {formatNumber(totals.demand)}
                        </td>
                        <td className="num py-1.5 pr-2 text-[9px] text-[#233238]">
                          {formatNumber(totals.allocated)}
                        </td>
                        <td className="num py-1.5 pr-2 text-[9px] text-[#8a5608]">
                          {formatNumber(totals.unmet)}
                        </td>
                        <td className="num py-1.5 pr-2 text-[9px] text-[#233238]">
                          {formatPct(totals.coverage, 0)}
                        </td>
                      </tr>
                    )
                  })}
                  <tr className="border-t border-[#17232a]/30">
                    <th scope="row" className="py-1.5 pr-2 text-left text-[9px] font-semibold text-[#17232a]">
                      Total
                    </th>
                    <td className="num py-1.5 pr-2 text-[9px] font-medium text-[#233238]">
                      {formatNumber(totalStock)}
                    </td>
                    <td className="num py-1.5 pr-2 text-[9px] font-medium text-[#233238]">
                      {formatNumber(totalDemand)}
                    </td>
                    <td className="num py-1.5 pr-2 text-[9px] font-medium text-[#233238]">
                      {formatNumber(totalAllocated)}
                    </td>
                    <td className="num py-1.5 pr-2 text-[9px] font-medium text-[#8a5608]">
                      {formatNumber(totalUnmet)}
                    </td>
                    <td className="num py-1.5 pr-2 text-[9px] font-medium text-[#233238]">
                      {formatPct(plan.totals.coverage, 1)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </ReportSection>

          <ReportSection index={4} title="Allocation by neighbourhood">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-left">
                <caption className="sr-only">
                  Allocated out of requested units for each neighbourhood and supply type.
                </caption>
                <thead>
                  <tr>
                    {['Ward', 'U', 'Vuln.', 'Water', 'Medical', 'Food', 'Coverage', 'Unmet'].map(
                      (label) => (
                        <th
                          key={label}
                          scope="col"
                          className={cn(
                            'pb-1 pr-2 font-mono text-[7px] uppercase tracking-[0.08em] text-[#778589]',
                            ['Water', 'Medical', 'Food', 'Coverage', 'Unmet'].includes(label) && 'text-right',
                          )}
                        >
                          {label}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {plan.wards.map((wardPlan) => {
                    const ward = scenario.wards.find((entry) => entry.id === wardPlan.wardId)
                    if (!ward) return null
                    return (
                      <tr key={ward.id}>
                        <th scope="row" className="py-1.5 pr-2 text-left">
                          <span className="text-[8.5px] font-medium text-[#233238]">{ward.shortName}</span>
                          <span className="ml-1 font-mono text-[6.5px] text-[#8a9698]">{ward.code}</span>
                        </th>
                        <td className="num py-1.5 pr-2 text-[8.5px] text-[#3e4e52]">{wardPlan.urgency}/5</td>
                        <td className="num py-1.5 pr-2 text-[8.5px] text-[#3e4e52]">
                          {wardPlan.vulnerabilityScore}
                        </td>
                        {SUPPLY_TYPES.map((supply) => (
                          <td key={supply} className="num py-1.5 pr-2 text-right text-[8px] text-[#3e4e52]">
                            {formatNumber(wardPlan.bySupply[supply].allocated)}
                            <span className="text-[#8a9698]">
                              {' '}
                              / {formatNumber(wardPlan.bySupply[supply].demand)}
                            </span>
                          </td>
                        ))}
                        <td className="num py-1.5 pr-2 text-right text-[8.5px] font-medium text-[#233238]">
                          {formatPct(wardPlan.coverage, 0)}
                        </td>
                        <td className="num py-1.5 pr-2 text-right text-[8.5px] text-[#8a5608]">
                          {formatNumber(wardPlan.unmetUnits)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <p className="mt-1.5 text-[8px] leading-relaxed text-[#778589]">
              “U” is the urgency level (1 low – 5 critical). “Vuln.” is the simulated vulnerability index
              (0–100). Supply cells show allocated / requested units. Row values follow the active plan
              at revision {state.planRevision}.
            </p>
          </ReportSection>

          <ReportSection index={5} title="Unmet demand & urgent wards">
            <div className="grid gap-2 sm:grid-cols-[1fr_1.4fr]">
              <div className="rounded border border-[#c2410c]/20 bg-[#fdf3e7] px-2.5 py-2">
                <div className="font-mono text-[7px] uppercase tracking-[0.09em] text-[#9a6a3a]">
                  Urgent shortfall
                </div>
                <div className="num mt-1 text-[16px] font-medium leading-none text-[#7c3d0d]">
                  {formatNumber(plan.totals.unmetUrgent)}
                </div>
                <p className="mt-1 text-[8px] leading-relaxed text-[#8a6b4b]">
                  units unmet across wards at urgency 4–5. Priority-weighted unmet including vulnerability
                  is {formatNumber(plan.totals.priorityWeightedUnmet)} weighted units.
                </p>
              </div>
              <div>
                {urgentUnmetDetail.length === 0 ? (
                  <p className="text-[9px] leading-relaxed text-[#5d6c6d]">
                    Every urgency 4–5 ward has full coverage in this plan.
                  </p>
                ) : (
                  <ul className="space-y-1">
                    {urgentUnmetDetail.map(({ ward, wardPlan }) => (
                      <li
                        key={ward.id}
                        className="flex items-baseline justify-between gap-2 border-b border-[#17232a]/10 py-1 text-[8.5px] last:border-b-0"
                      >
                        <span className="text-[#35464a]">
                          {ward.name}{' '}
                          <span className="font-mono text-[7px] text-[#8a9698]">U{ward.urgency}</span>
                        </span>
                        <span className="num text-[#8a5608]">
                          {formatNumber(wardPlan.unmetUnits)} units ·{' '}
                          {formatPct(wardPlan.coverage, 0)} covered
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </ReportSection>

          <ReportSection index={6} title="Road status & routing">
            <div className="mb-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[7.5px] uppercase tracking-[0.06em] text-[#69767a]">
              <span>{blockedRoads.length} blocked</span>
              <span>
                {scenario.roads.filter((road) => road.state === 'congested').length} congested
              </span>
              <span>
                {scenario.roads.filter((road) => road.state === 'open').length} open
              </span>
              <span>Dijkstra demo graph · no live traffic</span>
            </div>
            {disruptedRoads.length === 0 ? (
              <p className="text-[9px] leading-relaxed text-[#5d6c6d]">
                No blocked or congested segments in this preset. All {scenario.roads.length} demo
                segments are open.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[480px] text-left">
                  <caption className="sr-only">Blocked and congested road segments.</caption>
                  <thead>
                    <tr>
                      {['Segment', 'Ref', 'Route', 'Length', 'Status'].map((label) => (
                        <th
                          key={label}
                          scope="col"
                          className="pb-1 pr-2 font-mono text-[7px] uppercase tracking-[0.08em] text-[#778589]"
                        >
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {disruptedRoads.map((road) => (
                      <tr key={road.id}>
                        <th scope="row" className="py-1.5 pr-2 text-left text-[8.5px] font-medium text-[#233238]">
                          {road.name}
                        </th>
                        <td className="py-1.5 pr-2 font-mono text-[8px] text-[#69767a]">{road.ref}</td>
                        <td className="py-1.5 pr-2 text-[8px] text-[#3e4e52]">
                          {nodeLabel(state, road.from)} → {nodeLabel(state, road.to)}
                        </td>
                        <td className="num py-1.5 pr-2 text-[8px] text-[#3e4e52]">
                          {formatDecimal(road.distanceKm)} km
                        </td>
                        <td
                          className={cn(
                            'py-1.5 pr-2 font-mono text-[7.5px] uppercase tracking-[0.06em]',
                            road.state === 'blocked' ? 'text-[#9f1d1d]' : 'text-[#8a5608]',
                          )}
                        >
                          {road.state}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <p className="mt-1.5 text-[8px] leading-relaxed text-[#778589]">
              Blocked segments are removed from the route graph; congested segments carry a fixed 1.55×
              travel penalty. Planned delivery routes are illustrative and are not a field route plan.
            </p>
          </ReportSection>

          <ReportSection index={7} title="Strategy comparison · computed results">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-left">
                <caption className="sr-only">
                  Comparing the three allocation strategies, each run on independent copies of the
                  selected scenario.
                </caption>
                <thead>
                  <tr>
                    <th scope="col" className="pb-1 pr-2 font-mono text-[7px] uppercase tracking-[0.08em] text-[#778589]">
                      Metric
                    </th>
                    {STRATEGY_ORDER.map((strategy) => (
                      <th
                        key={strategy}
                        scope="col"
                        className="pb-1 pr-2 text-right font-mono text-[7px] uppercase tracking-[0.08em] text-[#778589]"
                      >
                        {STRATEGY_META[strategy].shortLabel}
                        {strategy === state.strategy ? ' (active)' : ''}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row) => (
                    <tr key={row.label}>
                      <th scope="row" className="py-1.5 pr-2 text-left text-[8.5px] font-normal text-[#35464a]">
                        {row.label}
                      </th>
                      {STRATEGY_ORDER.map((strategy) => (
                        <td
                          key={strategy}
                          className={cn(
                            'num py-1.5 pr-2 text-right text-[8.5px]',
                            strategy === state.strategy
                              ? 'bg-[#0f766e]/[0.06] font-medium text-[#233238]'
                              : 'text-[#3e4e52]',
                          )}
                        >
                          {row.value(comparisons[strategy])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-1.5 text-[8px] leading-relaxed text-[#69767a]">
              <span className="font-semibold text-[#35464a]">Coverage equity</span> = 100 minus the
              percentage-point gap between the best- and worst-covered ward. It is a chosen model
              objective that rewards even coverage, not an objective measure of real-world fairness. All
              strategy values are computed by the implemented allocator and router on identical starting
              inputs; no validated performance gain is claimed.
            </p>
          </ReportSection>

          <footer className="border-t border-[#17232a]/25 pt-2.5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <p className="max-w-[70%] text-[7.5px] leading-relaxed text-[#778589]">
                Generated locally in the browser from the displayed simulated scenario. Not an official
                emergency document. Printing uses the browser print dialog; choosing “Save as PDF” there
                produces a PDF copy.
              </p>
              <p className="font-mono text-[7px] uppercase tracking-[0.08em] text-[#8a9698]">
                RescueGrid v0.1 · rev {state.planRevision} · {formatDateTime(generatedAt)}
              </p>
            </div>
          </footer>
        </div>
      </article>

      <p className="no-print text-center font-mono text-[7.5px] uppercase tracking-[0.08em] text-mist-600">
        Report content follows the active strategy and priority. Change either in the Allocation Lab or
        analysis panel, then print again.
      </p>
    </div>
  )
}
```

---

## `src/screens/RoadNetwork.tsx`

```tsx
import { ArrowRight, CornerDownRight, RefreshCw, RotateCcw, Route, TriangleAlert } from 'lucide-react'
import { EventList } from '../components/events/EventList'
import { CommandMap } from '../components/map/CommandMap'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { InfoNote } from '../components/ui/InfoNote'
import { Panel } from '../components/ui/Panel'
import { ScreenHeader } from '../components/ui/ScreenHeader'
import { Segmented } from '../components/ui/Segmented'
import { ROAD_STATE_META } from '../lib/constants'
import { formatDecimal, formatNumber } from '../lib/format'
import { cn } from '../lib/cn'
import { useSimulation } from '../state/SimulationContext'
import type { RoadId, RoadState, Scenario } from '../types'

function nodeLabel(scenario: Scenario, id: string): string {
  const ward = scenario.wards.find((entry) => entry.id === id)
  if (ward) return ward.shortName
  const depot = scenario.depots.find((entry) => entry.id === id)
  if (depot) return `Depot ${depot.code}`
  return id
}

function StateControl({
  value,
  onChange,
  label,
  fullWidth = false,
}: {
  value: RoadState
  onChange: (state: RoadState) => void
  label: string
  fullWidth?: boolean
}) {
  return (
    <Segmented<RoadState>
      ariaLabel={`Set state for ${label}`}
      size="xs"
      fullWidth={fullWidth}
      value={value}
      onChange={onChange}
      options={[
        { value: 'open', label: 'Open' },
        { value: 'congested', label: 'Cong.' },
        { value: 'blocked', label: 'Blocked' },
      ]}
    />
  )
}

export function RoadNetwork() {
  const { state, actions } = useSimulation()
  const { plan, scenario } = state
  const blocked = scenario.roads.filter((road) => road.state === 'blocked')
  const congested = scenario.roads.filter((road) => road.state === 'congested')
  const detouredRoutes = plan.routes.filter((route) => route.detourKm > 0.15)
  const detourKm = detouredRoutes.reduce((sum, route) => sum + route.detourKm, 0)
  const roadEvents = state.events.filter((event) => event.kind === 'road')

  return (
    <div className="space-y-3 p-3 sm:p-4">
      <ScreenHeader
        kicker="Road network · demo graph"
        title="Inspect and disrupt the route graph"
        description="Mark segments open, congested or blocked. Every delivery route is recomputed immediately by Dijkstra's algorithm over this fictional 11-segment graph — not live traffic."
        actions={
          <>
            <Badge tone="red" dot>
              {blocked.length} blocked
            </Badge>
            <Badge tone="amber" dot>
              {congested.length} congested
            </Badge>
            <Button
              variant="secondary"
              size="sm"
              onClick={actions.recalculate}
              loading={state.isRecalculating}
              disabled={state.isRecalculating}
              icon={<RefreshCw size={12} aria-hidden />}
            >
              Recalculate
            </Button>
          </>
        }
      />

      <CommandMap heightClass="h-[320px] sm:h-[360px] xl:h-[400px]" />

      <div className="grid gap-3 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,0.85fr)]">
        <Panel
          kicker="Segments"
          title="Road state register"
          action={<Badge tone="neutral">{scenario.roads.length} segments</Badge>}
          subtitle="Select a segment name to open its status popover on the map. Status changes recompute the plan immediately."
          bodyClassName="p-0"
        >
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[620px] border-collapse text-left">
              <caption className="sr-only">Road segment states and planned route usage.</caption>
              <thead>
                <tr className="border-b border-line/70">
                  <th scope="col" className="py-2 pl-3.5 pr-2">
                    <span className="label-tiny">Segment</span>
                  </th>
                  <th scope="col" className="px-2 py-2">
                    <span className="label-tiny">Route</span>
                  </th>
                  <th scope="col" className="px-2 py-2 text-right">
                    <span className="label-tiny">Length</span>
                  </th>
                  <th scope="col" className="px-2 py-2 text-right">
                    <span className="label-tiny">Route use</span>
                  </th>
                  <th scope="col" className="py-2 pl-2 pr-3.5 text-right">
                    <span className="label-tiny">State</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {scenario.roads.map((road) => {
                  const selected = state.selectedRoadId === road.id
                  const legs = plan.routes.filter((route) => route.path.includes(road.id))
                  return (
                    <tr
                      key={road.id}
                      className={cn(
                        'border-b border-line/40 transition-colors last:border-b-0',
                        selected ? 'bg-signal/[0.045]' : 'hover:bg-white/[0.025]',
                      )}
                    >
                      <th scope="row" className="py-1.5 pl-3.5 pr-2 text-left font-normal">
                        <button
                          type="button"
                          onClick={() => actions.selectRoad(road.id)}
                          className="block min-w-0 text-left"
                          aria-pressed={selected}
                        >
                          <span className="flex items-center gap-1.5">
                            <span
                              aria-hidden
                              className={cn('h-1 w-1 shrink-0 rounded-full', ROAD_STATE_META[road.state].dotClass)}
                            />
                            <span className="truncate text-[9.5px] font-medium text-mist-200">{road.name}</span>
                          </span>
                          <span className="mt-0.5 block font-mono text-[7px] uppercase tracking-[0.06em] text-mist-600">
                            {road.ref}
                          </span>
                        </button>
                      </th>
                      <td className="px-2 py-1.5">
                        <span className="flex items-center gap-1 text-[8.5px] text-mist-400">
                          <span className="max-w-[74px] truncate">{nodeLabel(scenario, road.from)}</span>
                          <ArrowRight size={9} className="shrink-0 text-mist-600" aria-hidden />
                          <span className="max-w-[74px] truncate">{nodeLabel(scenario, road.to)}</span>
                        </span>
                      </td>
                      <td className="px-2 py-1.5 text-right">
                        <span className="num text-[9px] text-mist-300">{formatDecimal(road.distanceKm)} km</span>
                      </td>
                      <td className="px-2 py-1.5 text-right">
                        {road.state === 'blocked' ? (
                          <span className="font-mono text-[8px] text-[#f0c98b]">detour</span>
                        ) : (
                          <span className="num text-[9px] text-mist-400">
                            {legs.length} leg{legs.length === 1 ? '' : 's'}
                          </span>
                        )}
                      </td>
                      <td className="py-1.5 pl-2 pr-3.5">
                        <div className="flex justify-end">
                          <StateControl
                            value={road.state}
                            label={road.name}
                            onChange={(next) => actions.setRoadState(road.id as RoadId, next)}
                          />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="space-y-1.5 p-2 md:hidden">
            {scenario.roads.map((road) => {
              const selected = state.selectedRoadId === road.id
              const meta = ROAD_STATE_META[road.state]
              return (
                <div
                  key={road.id}
                  className={cn(
                    'rounded-md border p-2',
                    selected ? 'border-signal/30 bg-signal/[0.04]' : 'border-line/60 bg-night-950/25',
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => actions.selectRoad(road.id)}
                      aria-pressed={selected}
                      className="min-w-0 text-left"
                    >
                      <span className="flex items-center gap-1.5">
                        <span aria-hidden className={cn('h-1.5 w-1.5 rounded-full', meta.dotClass)} />
                        <span className="text-[11px] font-medium text-mist-100">{road.name}</span>
                      </span>
                      <span className="mt-0.5 block text-[8.5px] text-mist-500">
                        {nodeLabel(scenario, road.from)} <ArrowRight size={8} className="inline" aria-hidden />{' '}
                        {nodeLabel(scenario, road.to)} · {formatDecimal(road.distanceKm)} km
                      </span>
                    </button>
                    <Badge tone={road.state === 'blocked' ? 'red' : road.state === 'congested' ? 'amber' : 'neutral'}>
                      {meta.label}
                    </Badge>
                  </div>
                  <div className="mt-2">
                    <StateControl
                      value={road.state}
                      label={road.name}
                      fullWidth
                      onChange={(next) => actions.setRoadState(road.id, next)}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-line/60 px-3.5 py-2 font-mono text-[7.5px] uppercase tracking-[0.06em] text-mist-600">
            <span>Blocked segments are excluded from the demo route graph</span>
            <span>{formatNumber(plan.totals.trips)} planned runs</span>
          </div>
        </Panel>

        <div className="space-y-3">
          <Panel
            kicker="Impact"
            title="Network impact"
            action={<Badge tone="teal">Computed</Badge>}
            bodyClassName="space-y-3 p-3"
          >
            <div className="grid grid-cols-3 gap-1.5">
              {[
                {
                  label: 'Blocked',
                  value: String(blocked.length),
                  tone: blocked.length > 0 ? 'red' : 'teal',
                },
                {
                  label: 'Detoured legs',
                  value: String(detouredRoutes.length),
                  tone: detouredRoutes.length > 0 ? 'amber' : 'teal',
                },
                {
                  label: 'Added distance',
                  value: `${formatDecimal(detourKm)} km`,
                  tone: detourKm > 0.1 ? 'amber' : 'teal',
                },
              ].map((item) => (
                <div key={item.label} className="rounded border border-line/70 bg-night-950/35 px-2 py-1.5">
                  <div className="font-mono text-[7px] uppercase tracking-[0.08em] text-mist-600">
                    {item.label}
                  </div>
                  <div
                    className={cn(
                      'num mt-1 text-[14px] font-medium leading-none',
                      item.tone === 'red'
                        ? 'text-[#fca5a5]'
                        : item.tone === 'amber'
                          ? 'text-[#f6c97f]'
                          : 'text-signal-bright',
                    )}
                  >
                    {item.value}
                  </div>
                </div>
              ))}
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between">
                <span className="label-tiny">Blocked segments</span>
                <span className="font-mono text-[7.5px] uppercase tracking-[0.06em] text-mist-600">
                  reopen to remove detour
                </span>
              </div>
              {blocked.length === 0 ? (
                <p className="rounded border border-dashed border-line/70 px-2 py-2 text-[9px] text-mist-500">
                  No blocked segments in this snapshot.
                </p>
              ) : (
                <ul className="space-y-1">
                  {blocked.map((road) => (
                    <li
                      key={road.id}
                      className="flex items-center justify-between gap-2 rounded border border-critical/20 bg-critical/[0.04] px-2 py-1.5"
                    >
                      <span className="min-w-0">
                        <span className="flex items-center gap-1 text-[9.5px] text-mist-200">
                          <TriangleAlert size={9} aria-hidden className="shrink-0 text-critical" />
                          <span className="truncate">{road.name}</span>
                        </span>
                        <span className="mt-0.5 block font-mono text-[7px] uppercase tracking-[0.05em] text-mist-600">
                          {road.ref} · {formatDecimal(road.distanceKm)} km
                        </span>
                      </span>
                      <Button
                        variant="secondary"
                        size="xs"
                        onClick={() => actions.setRoadState(road.id, 'open')}
                        icon={<RotateCcw size={9} aria-hidden />}
                      >
                        Reopen
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {detouredRoutes.length > 0 ? (
              <div>
                <div className="mb-1 label-tiny">Longest detours</div>
                <ul className="space-y-1">
                  {[...detouredRoutes]
                    .sort((a, b) => b.detourKm - a.detourKm)
                    .slice(0, 3)
                    .map((route) => {
                      const ward = scenario.wards.find((entry) => entry.id === route.wardId)
                      const depot = scenario.depots.find((entry) => entry.id === route.depotId)
                      return (
                        <li
                          key={`${route.depotId}-${route.wardId}`}
                          className="flex items-center justify-between gap-2 border-b border-line/40 py-1 text-[8.5px] last:border-b-0"
                        >
                          <span className="flex min-w-0 items-center gap-1 text-mist-400">
                            <CornerDownRight size={9} className="shrink-0 text-mist-600" aria-hidden />
                            <span className="truncate">
                              {depot?.code ?? '?'} → {ward?.shortName ?? route.wardId}
                            </span>
                          </span>
                          <span className="num shrink-0 text-[#f0c98b]">
                            +{formatDecimal(route.detourKm)} km
                          </span>
                        </li>
                      )
                    })}
                </ul>
              </div>
            ) : null}

            <InfoNote>
              Demo router: blocked segments are removed; congested segments add a fixed 1.55× travel
              penalty. There is no live traffic, tide or road-closure feed.
            </InfoNote>
          </Panel>

          <Panel
            kicker="Event log"
            title="Network changes"
            action={<Badge tone="neutral">{roadEvents.length} entries</Badge>}
            bodyClassName="p-3"
          >
            <EventList
              events={roadEvents}
              limit={7}
              dense
              emptyTitle="No road events yet"
              emptyDescription="Open the state control on any segment to create a local simulation event."
            />
            <p className="mt-1 flex items-center gap-1 border-t border-line/60 pt-1.5 font-mono text-[7.5px] uppercase tracking-[0.05em] text-mist-600">
              <Route size={9} aria-hidden />
              Changes recompute the plan and append here
            </p>
          </Panel>
        </div>
      </div>
    </div>
  )
}
```

---

## `src/screens/Scenarios.tsx`

```tsx
import { ArrowRight, ArrowUpRight, Check, Layers, RotateCcw, Truck, Wind } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { InfoNote } from '../components/ui/InfoNote'
import { Panel } from '../components/ui/Panel'
import { ScreenHeader } from '../components/ui/ScreenHeader'
import { SCENARIO_ORDER, SCENARIO_PRESETS, createScenario } from '../data/sagarika'
import { SUPPLY_META, SUPPLY_TYPES, VEHICLE_STATUS_META } from '../lib/constants'
import { formatNumber, formatPct } from '../lib/format'
import { cn } from '../lib/cn'
import { useSimulation } from '../state/SimulationContext'
import type { Scenario, ScenarioId } from '../types'

interface PresetStat {
  scenario: Scenario
  requests: number
  stock: number
  blocked: number
  congested: number
  availableVehicles: number
  highUrgency: number
}

function buildStats(): Record<ScenarioId, PresetStat> {
  return SCENARIO_ORDER.reduce(
    (accumulator, id) => {
      const scenario = createScenario(id)
      const requests = scenario.wards.reduce(
        (sum, ward) => sum + SUPPLY_TYPES.reduce((inner, supply) => inner + ward.demand[supply], 0),
        0,
      )
      const stock = scenario.depots.reduce(
        (sum, depot) => sum + SUPPLY_TYPES.reduce((inner, supply) => inner + depot.stock[supply], 0),
        0,
      )
      accumulator[id] = {
        scenario,
        requests,
        stock,
        blocked: scenario.roads.filter((road) => road.state === 'blocked').length,
        congested: scenario.roads.filter((road) => road.state === 'congested').length,
        availableVehicles: scenario.vehicles.filter((vehicle) => vehicle.status === 'available').length,
        highUrgency: scenario.wards.filter((ward) => ward.urgency >= 4).length,
      }
      return accumulator
    },
    {} as Record<ScenarioId, PresetStat>,
  )
}

export function Scenarios() {
  const { state, actions } = useSimulation()
  const [confirmReset, setConfirmReset] = useState(false)
  const stats = useMemo(buildStats, [])
  const active = SCENARIO_PRESETS[state.scenarioId]
  const activeStat = stats[state.scenarioId]

  return (
    <div className="space-y-3 p-3 sm:p-4">
      <ScreenHeader
        kicker="Scenarios · fictional presets"
        title="Choose the simulated operating picture"
        description="Three deterministic presets for Sagarika District. Switching a preset restores its demand, urgency, stock, fleet and road states consistently across the console."
        actions={
          <>
            <Badge tone={state.scenario.severity === 'Critical' ? 'red' : 'amber'} dot>
              {active.name}
            </Badge>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setConfirmReset(true)}
              icon={<RotateCcw size={12} aria-hidden />}
            >
              Reset current preset
            </Button>
          </>
        }
      />

      <InfoNote tone="amber">
        <span className="font-medium text-[#f0d5a8]">Sagarika District is fictional.</span> All wards,
        depots, roads, vehicles and figures are invented for this hackathon prototype. No live
        emergency, weather or traffic data is connected; loading a preset discards any unsaved Lab edits.
      </InfoNote>

      <div className="grid gap-3 md:grid-cols-3">
        {SCENARIO_ORDER.map((id) => {
          const preset = SCENARIO_PRESETS[id]
          const stat = stats[id]
          const isActive = state.scenarioId === id
          return (
            <article
              key={id}
              className={cn(
                'panel relative flex flex-col overflow-hidden p-3.5',
                isActive && 'border-signal/35',
              )}
            >
              {isActive ? (
                <span
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-signal to-transparent"
                />
              ) : null}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <Badge
                    tone={preset.severity === 'Critical' ? 'red' : preset.severity === 'Severe' ? 'amber' : 'sky'}
                    dot
                  >
                    {preset.severity}
                  </Badge>
                  <Badge tone="dark">Fictional preset</Badge>
                </div>
                {isActive ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-signal/30 bg-signal/10 px-1.5 py-0.5 font-mono text-[7.5px] uppercase tracking-[0.08em] text-signal-bright">
                    <Check size={8} aria-hidden />
                    Active
                  </span>
                ) : null}
              </div>

              <h2 className="mt-2.5 text-[14px] font-semibold leading-tight tracking-[-0.015em] text-mist-50">
                {preset.name}
              </h2>
              <p className="mt-1 text-[10px] leading-relaxed text-[#a9bcd0]">{preset.tagline}</p>
              <p className="mt-2 text-[9.5px] leading-relaxed text-mist-500">{preset.description}</p>

              <div className="mt-3 grid grid-cols-2 gap-1.5">
                {[
                  ['Requests', `${formatNumber(stat.requests)} units`],
                  ['Stock on hand', `${formatNumber(stat.stock)} units`],
                  [
                    'Roads',
                    `${stat.blocked} blocked · ${stat.congested} congested`,
                  ],
                  ['Fleet', `${stat.availableVehicles} of ${stat.scenario.vehicles.length} available`],
                ].map(([label, value]) => (
                  <div key={label} className="rounded border border-line/70 bg-night-950/30 px-2 py-1.5">
                    <div className="font-mono text-[7px] uppercase tracking-[0.08em] text-mist-600">
                      {label}
                    </div>
                    <div className="num mt-0.5 text-[9px] leading-tight text-mist-200">{value}</div>
                  </div>
                ))}
              </div>

              <div className="mb-3 mt-2 flex flex-wrap gap-1">
                <Badge tone="neutral">{stat.highUrgency} wards at U4–5</Badge>
                <Badge tone={stat.blocked > 0 ? 'red' : 'teal'}>
                  {stat.blocked > 0 ? `${stat.blocked} blocked` : 'no blocks'}
                </Badge>
                <Badge tone="violet">{preset.focus}</Badge>
              </div>

              <div className="mt-auto flex items-center gap-1.5 border-t border-line/60 pt-2.5">
                {isActive ? (
                  <>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="flex-1"
                      onClick={() => setConfirmReset(true)}
                      icon={<RotateCcw size={11} aria-hidden />}
                    >
                      Reset preset
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => actions.navigate('lab')}
                      trailingIcon={<ArrowUpRight size={11} aria-hidden />}
                    >
                      Tune
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full"
                    onClick={() => actions.loadScenario(id)}
                    disabled={state.isRecalculating}
                    loading={state.isRecalculating && state.scenarioId === id}
                    trailingIcon={<ArrowRight size={11} aria-hidden />}
                  >
                    Load scenario
                  </Button>
                )}
              </div>
            </article>
          )
        })}
      </div>

      <div className="grid gap-3 xl:grid-cols-2">
        <Panel
          kicker="Current snapshot"
          title={active.name}
          action={<Badge tone="neutral">{state.scenario.snapshotLabel}</Badge>}
          subtitle={state.scenario.weather.advisory}
          bodyClassName="space-y-3 p-3"
        >
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
            <div className="rounded border border-line/70 bg-night-950/30 px-2 py-1.5">
              <div className="label-tiny">Snapshot</div>
              <div className="mt-0.5 text-[9px] text-mist-200">{state.scenario.snapshotLabel}</div>
            </div>
            <div className="rounded border border-line/70 bg-night-950/30 px-2 py-1.5">
              <div className="label-tiny">System</div>
              <div className="mt-0.5 flex items-center gap-1 text-[9px] text-mist-200">
                <Wind size={9} aria-hidden className="text-info" />
                {state.scenario.weather.system.replace(' (simulated)', '')}
              </div>
            </div>
            <div className="rounded border border-line/70 bg-night-950/30 px-2 py-1.5">
              <div className="label-tiny">Rain</div>
              <div className="num mt-0.5 text-[9px] text-mist-200">
                {state.scenario.weather.rainfallMm} mm · {state.scenario.weather.windKph} km/h
              </div>
            </div>
            <div className="rounded border border-line/70 bg-night-950/30 px-2 py-1.5">
              <div className="label-tiny">Stock</div>
              <div className="num mt-0.5 text-[9px] text-mist-200">
                {formatNumber(activeStat.stock)} units
              </div>
            </div>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="label-tiny">Fleet</span>
              <span className="inline-flex items-center gap-1 font-mono text-[7.5px] uppercase tracking-[0.06em] text-mist-600">
                <Truck size={9} aria-hidden /> {activeStat.availableVehicles} available
              </span>
            </div>
            <div className="space-y-1">
              {state.scenario.vehicles.map((vehicle) => {
                const meta = VEHICLE_STATUS_META[vehicle.status]
                return (
                  <div
                    key={vehicle.id}
                    className="flex items-center justify-between gap-2 border-b border-line/40 py-1 text-[9px] last:border-b-0"
                  >
                    <span className="flex min-w-0 items-center gap-1.5">
                      <span aria-hidden className={cn('h-1.5 w-1.5 shrink-0 rounded-full', meta.dotClass)} />
                      <span className="truncate text-mist-200">{vehicle.name}</span>
                      <span className="shrink-0 font-mono text-[7.5px] uppercase tracking-[0.05em] text-mist-600">
                        {vehicle.vehicleClass}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      <span className="num text-mist-500">{formatNumber(vehicle.capacityUnits)} units</span>
                      <span className={cn('font-mono text-[7.5px] uppercase tracking-[0.05em]', meta.textClass)}>
                        {meta.label}
                      </span>
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex gap-1.5">
            {SUPPLY_TYPES.map((supply) => {
              const stock = state.scenario.depots.reduce((sum, depot) => sum + depot.stock[supply], 0)
              return (
                <div
                  key={supply}
                  className="flex-1 rounded border border-line/60 bg-night-950/25 px-1.5 py-1"
                >
                  <div className="font-mono text-[7px] uppercase tracking-[0.06em] text-mist-600">
                    {SUPPLY_META[supply].shortLabel}
                  </div>
                  <div className="num mt-0.5 text-[9px] text-mist-200">{formatNumber(stock)}</div>
                </div>
              )
            })}
          </div>
        </Panel>

        <Panel
          kicker="Assumptions"
          title="What this snapshot assumes"
          action={<Badge tone="amber">Simulated</Badge>}
          bodyClassName="space-y-3 p-3"
        >
          <ul className="space-y-1.5">
            {state.scenario.assumptions.map((assumption, index) => (
              <li key={index} className="flex gap-2 text-[9.5px] leading-relaxed text-mist-300">
                <span
                  aria-hidden
                  className="mt-[5px] h-1 w-1 shrink-0 rounded-full bg-mist-600"
                />
                {assumption}
              </li>
            ))}
            <li className="flex gap-2 text-[9.5px] leading-relaxed text-mist-300">
              <span aria-hidden className="mt-[5px] h-1 w-1 shrink-0 rounded-full bg-mist-600" />
              No backend, login, live API or AI model is used. All scenario state lives in this browser.
            </li>
          </ul>
          <InfoNote>
            The district note: {state.scenario.districtNote}
          </InfoNote>
        </Panel>
      </div>

      <Panel
        kicker="Preset comparison"
        title="What changes between presets"
        action={<Badge tone="neutral">Fictional data</Badge>}
        bodyClassName="p-0"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse text-left">
            <caption className="sr-only">Comparison of the three fictional scenario presets.</caption>
            <thead>
              <tr className="border-b border-line/70">
                <th scope="col" className="py-2 pl-3.5 pr-2">
                  <span className="label-tiny">Condition</span>
                </th>
                {SCENARIO_ORDER.map((id) => (
                  <th key={id} scope="col" className="px-2 py-2 text-right">
                    <span
                      className={cn(
                        'label-tiny',
                        id === state.scenarioId ? 'text-signal-bright' : undefined,
                      )}
                    >
                      {SCENARIO_PRESETS[id].name}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['Severity', (stat: PresetStat) => stat.scenario.severity],
                ['Requests', (stat: PresetStat) => `${formatNumber(stat.requests)} units`],
                ['Total stock', (stat: PresetStat) => `${formatNumber(stat.stock)} units`],
                [
                  'Stock coverage',
                  (stat: PresetStat) => formatPct(stat.requests > 0 ? stat.stock / stat.requests : 0, 0),
                ],
                ['Blocked roads', (stat: PresetStat) => `${stat.blocked}`],
                ['Congested roads', (stat: PresetStat) => `${stat.congested}`],
                ['Available vehicles', (stat: PresetStat) => `${stat.availableVehicles} / 4`],
                ['Wards at urgency 4–5', (stat: PresetStat) => `${stat.highUrgency}`],
              ].map(([label, value], index) => (
                <tr
                  key={String(label)}
                  className={cn(
                    'border-b border-line/40 last:border-b-0',
                    index % 2 === 1 ? 'bg-night-950/20' : '',
                  )}
                >
                  <th scope="row" className="py-1.5 pl-3.5 pr-2 text-left font-normal">
                    <span className="text-[9px] text-mist-400">{String(label)}</span>
                  </th>
                  {SCENARIO_ORDER.map((id) => (
                    <td key={id} className="px-2 py-1.5 text-right">
                      <span
                        className={cn(
                          'num text-[9px]',
                          id === state.scenarioId ? 'text-mist-100' : 'text-mist-400',
                        )}
                      >
                        {(value as (stat: PresetStat) => string)(stats[id])}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center gap-1.5 border-t border-line/60 px-3.5 py-2 font-mono text-[7.5px] uppercase tracking-[0.06em] text-mist-600">
          <Layers size={9} aria-hidden />
          Loading a preset resets its inputs; the current allocation strategy and priority are kept.
        </div>
      </Panel>

      <ConfirmDialog
        open={confirmReset}
        title={`Reset ${active.name}?`}
        description="Demand, urgency, depot stock, fleet status and every road state will return to the fictional preset. Strategy and priority settings are kept."
        confirmLabel="Reset preset"
        onCancel={() => setConfirmReset(false)}
        onConfirm={() => {
          actions.resetScenario()
          setConfirmReset(false)
        }}
      />
    </div>
  )
}
```

---

## `src/state/SimulationContext.tsx`

```tsx
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
```

---

## `src/state/simulationReducer.ts`

```tsx
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
```

---

## `src/types.ts`

```tsx
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
```

