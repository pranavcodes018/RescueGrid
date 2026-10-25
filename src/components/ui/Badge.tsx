import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

export type BadgeTone = 'neutral' | 'teal' | 'amber' | 'red' | 'sky' | 'violet' | 'dark'

const toneClasses: Record<BadgeTone, string> = {
  neutral: 'border-line bg-white/[0.04] text-mist-300',
  teal: 'border-signal/30 bg-signal/10 text-[#7ff0e0]',
  amber: 'border-warn/35 bg-warn/10 text-[#f6c97f]',
  red: 'border-critical/35 bg-critical/10 text-[#fca5a5]',
  sky: 'border-info/30 bg-info/10 text-[#a5e2ff]',
  violet: 'border-plum/30 bg-plum/10 text-[#d8ccff]',
  dark: 'border-line/70 bg-night-950/70 text-mist-400',
}

export interface BadgeProps {
  tone?: BadgeTone
  dot?: boolean
  icon?: ReactNode
  children: ReactNode
  className?: string
  title?: string
}

export function Badge({ tone = 'neutral', dot = false, icon, children, className, title }: BadgeProps) {
  return (
    <span
      title={title}
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded border px-1.5 py-0.5 font-mono text-[9px] font-medium uppercase leading-[1.3] tracking-[0.1em]',
        toneClasses[tone],
        className,
      )}
    >
      {dot ? (
        <span
          aria-hidden
          className={cn(
            'h-1 w-1 rounded-full',
            tone === 'teal'
              ? 'bg-signal'
              : tone === 'amber'
                ? 'bg-warn'
                : tone === 'red'
                  ? 'bg-critical'
                  : tone === 'sky'
                    ? 'bg-info'
                    : tone === 'violet'
                      ? 'bg-plum'
                      : 'bg-mist-400',
          )}
        />
      ) : null}
      {icon}
      {children}
    </span>
  )
}
