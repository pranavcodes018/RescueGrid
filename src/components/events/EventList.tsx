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
