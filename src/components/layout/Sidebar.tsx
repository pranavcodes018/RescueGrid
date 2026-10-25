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
      className="app-sidebar hidden w-[204px] shrink-0 flex-col border-r border-line/80 bg-night-950/75 px-3 py-4 lg:flex"
    >
      <div className="mb-3 px-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-mist-500">Workspace</p>
        <p className="mt-1 text-xs text-mist-600">Relief operations</p>
      </div>
      <div className="flex-1 space-y-1">
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
                'group relative flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all duration-200',
                active
                  ? 'border border-signal/20 bg-signal/[0.09] text-signal-bright shadow-[0_8px_24px_rgba(45,212,191,0.05)]'
                  : 'border border-transparent text-mist-400 hover:bg-white/[0.04] hover:text-mist-100',
              )}
            >
              {active ? (
                <span
                  aria-hidden
                  className="absolute left-0 top-1/2 h-7 w-[3px] -translate-y-1/2 rounded-r-full bg-signal shadow-[0_0_10px_rgba(45,212,191,0.65)]"
                />
              ) : null}
              <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors', active ? 'bg-signal/10' : 'bg-night-800/70 group-hover:bg-night-700/70')}><Icon size={17} strokeWidth={1.8} aria-hidden /></span>
              <span className="min-w-0 flex-1">
                <span className="block text-[12px] font-medium leading-4">{item.label}</span>
                <span className={cn('mt-0.5 block truncate text-[10px] leading-4', active ? 'text-signal/70' : 'text-mist-600')}>{item.description}</span>
              </span>
            </button>
          )
        })}
      </div>

      <div className="mt-4 border-t border-line/80 pt-3">
        <div
          className="flex items-center gap-2.5 rounded-xl border border-line/80 bg-night-850/50 px-3 py-3 text-left"
          title="All simulation state stays in this browser. No live data."
        >
          <ShieldCheck size={16} className="shrink-0 text-signal/80" aria-hidden />
          <div>
            <div className="text-[11px] font-medium text-mist-300">Simulation data</div>
            <div className="mt-0.5 text-[9px] leading-relaxed text-mist-600">Local prototype · not live</div>
          </div>
        </div>
      </div>
    </nav>
  )
}
