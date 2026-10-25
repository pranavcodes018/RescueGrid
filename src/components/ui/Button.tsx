import { Loader2 } from 'lucide-react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'subtle'
type ButtonSize = 'xs' | 'sm' | 'md'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: ReactNode
  trailingIcon?: ReactNode
  loading?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'border border-signal/60 bg-signal text-[#03211d] font-semibold hover:bg-signal-bright hover:border-signal-bright shadow-[0_10px_26px_-14px_rgba(45,212,191,0.9)]',
  secondary:
    'border border-line bg-white/[0.035] text-mist-200 hover:bg-white/[0.075] hover:text-mist-50',
  ghost: 'border border-transparent text-mist-300 hover:bg-white/[0.06] hover:text-mist-50',
  danger: 'border border-critical/35 bg-critical/10 text-[#fca5a5] hover:bg-critical/20 hover:text-[#fecaca]',
  subtle: 'border border-line/70 bg-night-800/80 text-mist-300 hover:bg-night-750 hover:text-mist-100',
}

const sizeClasses: Record<ButtonSize, string> = {
  xs: 'h-7 gap-1.5 rounded-md px-2 text-[10px]',
  sm: 'h-8 gap-1.5 rounded-md px-2.5 text-[11px]',
  md: 'h-9 gap-2 rounded-[7px] px-3.5 text-[12px]',
}

export function Button({
  variant = 'secondary',
  size = 'md',
  icon,
  trailingIcon,
  loading = false,
  className,
  children,
  disabled,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex select-none items-center justify-center whitespace-nowrap font-medium tracking-[0.01em] transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...rest}
    >
      {loading ? <Loader2 aria-hidden size={14} className="animate-spin" /> : icon}
      {children}
      {!loading && trailingIcon}
    </button>
  )
}
