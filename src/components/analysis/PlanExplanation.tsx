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
