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
