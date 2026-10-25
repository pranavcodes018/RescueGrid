import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface ScreenHeaderProps {
  kicker: string
  title: string
  description: ReactNode
  actions?: ReactNode
  className?: string
}

export function ScreenHeader({ kicker, title, description, actions, className }: ScreenHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div className="min-w-0">
        <div className="label-micro mb-1.5">{kicker}</div>
        <h1 className="text-[19px] font-semibold leading-tight tracking-[-0.025em] text-mist-50 sm:text-[21px]">
          {title}
        </h1>
        <p className="mt-1 max-w-2xl text-[11px] leading-relaxed text-mist-400">{description}</p>
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  )
}
