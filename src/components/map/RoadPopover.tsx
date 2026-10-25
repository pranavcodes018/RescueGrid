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
