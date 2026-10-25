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
