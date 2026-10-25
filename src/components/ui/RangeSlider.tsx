import { useId, type CSSProperties } from 'react'
import { cn } from '../../lib/cn'

interface RangeSliderProps {
  label: string
  value: number
  min: number
  max: number
  step?: number
  onChange: (value: number) => void
  onCommit?: () => void
  formatValue?: (value: number) => string
  hint?: string
  leftLabel?: string
  rightLabel?: string
  disabled?: boolean
  className?: string
}

export function RangeSlider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  onCommit,
  formatValue = (next) => String(next),
  hint,
  leftLabel,
  rightLabel,
  disabled = false,
  className,
}: RangeSliderProps) {
  const id = useId()
  const hintId = hint ? `${id}-hint` : undefined
  const percent = max > min ? ((value - min) / (max - min)) * 100 : 0
  const style = { '--fill': `${percent}%` } as CSSProperties

  return (
    <div className={cn('select-none', className)}>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <label htmlFor={id} className="text-[11px] font-medium text-mist-200">
          {label}
        </label>
        <span className="num rounded border border-line/80 bg-night-950/60 px-1.5 py-0.5 text-[10.5px] text-signal-bright">
          {formatValue(value)}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        aria-describedby={hintId}
        aria-valuetext={formatValue(value)}
        onChange={(event) => onChange(Number(event.target.value))}
        onPointerUp={onCommit}
        onKeyUp={onCommit}
        onBlur={onCommit}
        className="range-slider"
        style={style}
      />
      {leftLabel || rightLabel ? (
        <div className="mt-0.5 flex justify-between font-mono text-[8.5px] uppercase tracking-[0.1em] text-mist-600">
          <span>{leftLabel}</span>
          <span>{rightLabel}</span>
        </div>
      ) : null}
      {hint ? (
        <p id={hintId} className="mt-1 text-[10px] leading-snug text-mist-500">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
