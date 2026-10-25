import { cn } from '../../lib/cn'

export function RescueMark({ size = 30, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      role="img"
      aria-label="RescueGrid mark"
      className={cn('shrink-0', className)}
    >
      <defs>
        <linearGradient id="rg-logo-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5eead4" />
          <stop offset="1" stopColor="#0d9488" />
        </linearGradient>
      </defs>
      <rect x="0.75" y="0.75" width="30.5" height="30.5" rx="8" fill="#081624" />
      <rect x="0.75" y="0.75" width="30.5" height="30.5" rx="8" fill="none" stroke="#1d3a49" strokeWidth="1" />
      <circle cx="16" cy="16" r="8" fill="none" stroke="url(#rg-logo-gradient)" strokeOpacity="0.45" />
      <circle cx="16" cy="16" r="4.2" fill="none" stroke="url(#rg-logo-gradient)" strokeOpacity="0.8" />
      <path
        d="M16 7v4.2M16 20.8V25M7 16h4.2M20.8 16H25"
        stroke="#5eead4"
        strokeWidth="1.35"
        strokeLinecap="round"
      />
      <circle cx="16" cy="16" r="1.7" fill="#5eead4" />
      <path d="M22.2 9.8A8 8 0 0 1 24.4 16" stroke="#5eead4" strokeWidth="1.35" strokeLinecap="round" />
    </svg>
  )
}

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <RescueMark size={compact ? 29 : 31} />
      <div className="leading-none">
        <div className="flex items-baseline gap-1.5">
          <span className="text-[15.5px] font-semibold tracking-[-0.02em] text-mist-50">RescueGrid</span>
          <span className="rounded border border-signal/25 bg-signal/[0.07] px-1 py-px font-mono text-[7.5px] uppercase tracking-[0.14em] text-signal-bright">
            v0.1
          </span>
        </div>
        {compact ? null : (
          <div className="mt-1 font-mono text-[8.5px] uppercase tracking-[0.17em] text-mist-500">
            Sagarika District · Command
          </div>
        )}
      </div>
    </div>
  )
}
