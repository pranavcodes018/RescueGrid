# RescueGrid

A simulated disaster-response planning command centre for the fictional **Sagarika District**, coastal Andhra Pradesh. RescueGrid shows which neighbourhoods receive which supplies, by which road route, and how the chosen plan compares with two simple baselines.

> **Simulation mode — not live dispatch.** All wards, depots, roads, vehicles, quantities and conditions are invented for this prototype. Nothing here is a real report, live feed or measured operational result.

## Stack

- React 19 + TypeScript, Vite
- Tailwind CSS v4
- Leaflet with OpenStreetMap tiles (with a local SVG fallback map)
- Lucide icons
- No backend, login, paid API or required API key; all state lives in the browser

## Run

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # typecheck + production build into dist/
npm run preview   # serve the production build
npx vitest run    # unit tests (suite is partial — see Testing)
```

Deploy configuration for Freebuff Sites lives in `deploy.manifest.json` and `sites/worker.js`.

## Project structure

```
src/
  data/sagarika.ts        Typed scenario presets, wards, depots, vehicles, roads
  lib/
    routing.ts            Weighted road graph + binary-heap Dijkstra
    allocation.ts         Deterministic greedy allocator and baselines
    plan.ts               Plan assembly, metrics, bottlenecks
    priority.ts           Declared priority weight + fairness definition
    planDiff.ts           Previous-vs-new plan change summary
    scenario.ts           Deep clone, edit application, reset support
    explain.ts            Deterministic explanation templates
  state/
    simulationReducer.ts  Pure reducer: every change recomputes the plan
    SimulationContext.tsx React provider and actions
  screens/                Overview, Allocation Lab, Road Network, Scenarios, Reports
  components/             analysis, charts, events, layout, map, ui primitives
```

## Implemented algorithms

### Routing (`lib/routing.ts`)

`findRoute(roads, from, to)` runs Dijkstra over an undirected weighted graph:

- Edge cost is `distanceKm × 1.55` when a segment is congested, otherwise `distanceKm`.
- Blocked segments are excluded when the graph is built, so they can never appear in a route.
- If no open path exists, it returns `{ reachable: false, reason: 'no-open-route' }` with empty path/geometry — no straight-line or invented fallback.
- Ties and traversal order are deterministic.

### Allocation (`lib/allocation.ts`)

A deterministic, priority-ordered greedy allocator. For every candidate delivery it enforces:

| Constraint | Enforced |
| --- | --- |
| Depot stock per supply | Yes — decremented as units are committed, never below zero |
| Ward remaining demand | Yes — deliveries are capped at `demand − already delivered` |
| Vehicle availability | Yes — only vehicles with status `available` can carry loads |
| Vehicle capacity per run | Yes — each delivery uses one vehicle; trips = ⌈units ÷ capacity⌉ |
| Vehicle run budget | Yes — each vehicle has 8 runs; delivery trips consume that budget |
| Road accessibility | Yes — deliveries only use depots with a reachable open route |
| Travel cost | Yes — depots are considered in ascending route cost; congestion raises cost |
| Priority ordering | Yes — optimizer orders wards by a blend of need and demand share |

Strategies:

1. **RescueGrid Optimizer** — ward order by `(1 − p) × demandShare + p × needShare`, where `p` is the coverage ↔ vulnerability slider (0–100) and need is the declared priority weight.
2. **Nearest-first** — ward order by lowest-cost reachable depot, tie-broken by urgency.
3. **Population-proportional** — available supply distributed by population share with largest-remainder rounding, capped at each ward's demand, then the same feasibility rules apply.

All three run on independent deep copies of the scenario via `computeComparisons`, so no strategy can consume another's stock.

### Metrics (`lib/plan.ts`)

Everything is derived from actual deliveries and refusals:

- Demand, delivered and unmet units per supply type and per ward
- Coverage (allocated ÷ requested)
- Priority-weighted unmet = Σ (unmet units × declared ward weight), with
  `weight = (urgency ÷ 5) × (0.6 + 0.4 × vulnerability ÷ 100)`
- Reachable / unreachable wards (from the current graph)
- Planned route distance (loaded out + empty return) and vehicle-hours
- Vehicle capacity offered vs moved, runs used per vehicle
- Per-depot remaining inventory
- Unserved demand with a computed reason: `unreachable`, `stock` or `fleet`

### What-if behaviour

Every scenario change — applying edits, blocking/reopening a road, changing strategy or priority, loading a preset, resetting — runs the allocator again and stores the previous plan. `diffPlans` compares the two and reports allocations added, increased, reduced, removed or rerouted, each with a reason grounded in computed values (exhausted stock, exhausted run budget, road closure, priority change, and so on).

## Known limitations

- The allocator is greedy, not an optimisation solver. It does not search for a globally optimal or provably fair allocation.
- Deliveries never split across vehicles mid-delivery, and a depot's fleet is assumed interchangeable within its run budget.
- Travel time uses a fixed speed per vehicle and a fixed 25-minute handling time per run; there is no live traffic, tide, weather or closure feed.
- Congestion is a flat 1.55× cost multiplier rather than a speed-flow model.
- Fairness is **coverage equity** = 100 − (best − worst ward coverage in percentage points). It is a chosen model objective, not an objective truth.
- "Unreachable" means no path exists in the plotted 11-segment fictional graph; real road networks are far richer.
- No persistence: a reload restores the selected preset.

## Testing

`src/lib/__tests__/routing.test.ts` and `src/lib/__tests__/allocation.test.ts` cover shortest-path selection, blocked-road avoidance, explicit unreachable results, demand caps, non-negative depot stock, vehicle capacity and run budgets, determinism, scenario immutability, and identical starting conditions for all strategies.

Still to add: plan metric arithmetic (coverage, weighted unmet), reset-restores-preset via the reducer, and a `test` npm script.
