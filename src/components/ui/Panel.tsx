import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

export interface PanelProps {
  kicker?: ReactNode
  title?: ReactNode
  subtitle?: ReactNode
  action?: ReactNode
  children: ReactNode
  className?: string
  bodyClassName?: string
  accent?: boolean
  id?: string
}

export function Panel({
  kicker,
  title,
  subtitle,
  action,
  children,
  className,
  bodyClassName,
  accent = false,
  id,
}: PanelProps) {
  const hasHeader = Boolean(kicker || title || action)
  return (
    <section id={id} className={cn('panel min-w-0', accent && 'panel-accent', className)}>
      {hasHeader ? (
        <header className="flex items-start justify-between gap-3 border-b border-line/70 px-3.5 py-2.5">
          <div className="min-w-0">
            {kicker ? <div className="label-micro mb-1">{kicker}</div> : null}
            {title ? (
              <h2 className="text-[13px] font-medium leading-tight tracking-[-0.01em] text-mist-100">{title}</h2>
            ) : null}
            {subtitle ? <p className="mt-1 text-[10.5px] leading-relaxed text-mist-400">{subtitle}</p> : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </header>
      ) : null}
      <div className={cn('min-w-0', bodyClassName ?? 'p-3.5')}>{children}</div>
    </section>
  )
}
