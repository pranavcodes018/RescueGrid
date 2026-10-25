import { CircleHelp } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface EmptyStateProps {
  title: string
  description: string
  icon?: ReactNode
  action?: ReactNode
  compact?: boolean
  className?: string
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  compact = false,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-lg border border-dashed border-line bg-night-950/30 text-center',
        compact ? 'gap-1.5 px-3 py-4' : 'gap-2 px-5 py-7',
        className,
      )}
    >
      <span className="text-mist-500">{icon ?? <CircleHelp size={compact ? 16 : 20} aria-hidden />}</span>
      <p className="text-[11.5px] font-medium text-mist-200">{title}</p>
      <p className="max-w-sm text-[10.5px] leading-relaxed text-mist-500">{description}</p>
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  )
}
