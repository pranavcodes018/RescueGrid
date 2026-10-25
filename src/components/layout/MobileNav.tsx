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
