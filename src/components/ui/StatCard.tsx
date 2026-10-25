import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { ProgressBar, type ProgressTone } from './ProgressBar'

interface StatCardProps {
  label: string
  value: ReactNode
  unit?: string
  caption?: ReactNode
  icon?: ReactNode
  tone?: 'default' | 'teal' | 'amber' | 'red' | 'sky' | 'violet'
  progress?: number
  progressTone?: ProgressTone
  className?: string
}

const valueTone: Record<NonNullable<StatCardProps['tone']>, string> = {
  default: 'text-mist-50',
  teal: 'text-signal-bright',
  amber: 'text-[#f6c97f]',
  red: 'text-[#fca5a5]',
  sky: 'text-[#a5e2ff]',
  violet: 'text-[#d8ccff]',
}

export function StatCard({
  label,
  value,
  unit,
  caption,
  icon,
  tone = 'default',
  progress,
  progressTone = 'teal',
  className,
}: StatCardProps) {
  return (
    <article
      className={cn(
        'panel group relative flex min-h-[88px] min-w-0 flex-col justify-between overflow-hidden p-3',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="label-tiny pr-1 leading-[1.25] text-mist-500">{label}</span>
        {icon ? <span className="mt-px shrink-0 text-mist-500 transition-colors group-hover:text-mist-300">{icon}</span> : null}
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className={cn('num text-[21px] font-medium leading-none', valueTone[tone])}>{value}</span>
        {unit ? <span className="text-[9.5px] font-medium text-mist-500">{unit}</span> : null}
      </div>
      <div className="mt-2">
        {typeof progress === 'number' ? (
          <ProgressBar
            value={progress}
            label={`${label} progress`}
            tone={progressTone}
            heightClass="h-[3px]"
            className="mb-1.5"
          />
        ) : null}
        {caption ? <div className="text-[9.5px] leading-snug text-mist-500">{caption}</div> : null}
      </div>
    </article>
  )
}
