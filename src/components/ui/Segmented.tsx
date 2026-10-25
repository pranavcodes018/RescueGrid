import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

export interface SegmentedOption<T extends string> {
  value: T
  label: ReactNode
  icon?: ReactNode
  title?: string
}

interface SegmentedProps<T extends string> {
  options: SegmentedOption<T>[]
  value: T
  onChange: (value: T) => void
  ariaLabel: string
  className?: string
  size?: 'xs' | 'sm'
  fullWidth?: boolean
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  className,
  size = 'sm',
  fullWidth = false,
}: SegmentedProps<T>) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn(
        'inline-flex items-center rounded-md border border-line bg-night-950/70 p-0.5',
        fullWidth && 'flex w-full',
        className,
      )}
    >
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            title={option.title}
            onClick={() => onChange(option.value)}
            className={cn(
              'inline-flex items-center justify-center gap-1.5 rounded-[4px] font-medium transition-colors duration-150',
              size === 'xs' ? 'h-6 px-1.5 text-[9.5px]' : 'h-7 px-2.5 text-[10.5px]',
              fullWidth && 'flex-1',
              active
                ? 'bg-night-700 text-mist-50 shadow-[inset_0_0_0_1px_rgba(120,158,190,0.16)]'
                : 'text-mist-400 hover:bg-white/[0.045] hover:text-mist-200',
            )}
          >
            {option.icon}
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
