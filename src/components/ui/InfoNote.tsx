import { Info } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface InfoNoteProps {
  children: ReactNode
  icon?: ReactNode
  tone?: 'neutral' | 'teal' | 'amber'
  className?: string
}

export function InfoNote({ children, icon, tone = 'neutral', className }: InfoNoteProps) {
  const toneClass =
    tone === 'teal'
      ? 'border-signal/20 bg-signal/[0.045] text-[#bfe9e3]'
      : tone === 'amber'
        ? 'border-warn/20 bg-warn/[0.05] text-[#ead8b7]'
        : 'border-line/80 bg-night-950/40 text-mist-400'
  return (
    <div className={cn('flex gap-2 rounded-md border p-2.5 text-[10px] leading-relaxed', toneClass, className)}>
      <span className="mt-px shrink-0 opacity-70">{icon ?? <Info size={12} aria-hidden />}</span>
      <div className="min-w-0">{children}</div>
    </div>
  )
}
