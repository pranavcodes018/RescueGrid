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
