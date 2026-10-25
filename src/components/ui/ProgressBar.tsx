import { clamp } from '../../lib/format'
import { cn } from '../../lib/cn'

export type ProgressTone = 'teal' | 'amber' | 'red' | 'sky' | 'violet' | 'mist'

const fillClasses: Record<ProgressTone, string> = {
  teal: 'bg-gradient-to-r from-signal-deep via-signal to-signal-bright',
  amber: 'bg-gradient-to-r from-[#a66b1f] via-warn to-warn-bright',
  red: 'bg-gradient-to-r from-[#b33838] via-critical to-[#fca5a5]',
  sky: 'bg-gradient-to-r from-[#2b7ea1] via-info to-[#bae6fd]',
  violet: 'bg-gradient-to-r from-[#6e5bb5] via-plum to-[#ddd1ff]',
  mist: 'bg-gradient-to-r from-mist-600 via-mist-400 to-mist-200',
}

export interface ProgressBarProps {
  value: number
  label: string
  tone?: ProgressTone
  className?: string
  heightClass?: string
  trackClassName?: string
  showTicks?: boolean
}

export function ProgressBar({
  value,
  label,
  tone = 'teal',
  className,
  heightClass = 'h-1.5',
  trackClassName,
  showTicks = false,
}: ProgressBarProps) {
  const percent = clamp(value, 0, 1) * 100
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(percent)}
      className={cn(
        'relative w-full overflow-hidden rounded-full bg-[#16283a]',
        heightClass,
        trackClassName,
        className,
      )}
    >
      <div
        className={cn('h-full rounded-full transition-[width] duration-500 ease-out', fillClasses[tone])}
        style={{ width: `${percent}%` }}
      />
      {showTicks ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              'repeating-linear-gradient(90deg, transparent 0, transparent calc(10% - 1px), rgba(5,11,19,0.7) calc(10% - 1px), rgba(5,11,19,0.7) 10%)',
          }}
        />
      ) : null}
    </div>
  )
}
