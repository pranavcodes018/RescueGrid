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
