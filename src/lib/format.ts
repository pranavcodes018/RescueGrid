const numberFormatter = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 })
const decimalFormatter = new Intl.NumberFormat('en-IN', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

export function formatNumber(value: number): string {
  return numberFormatter.format(Math.round(value))
}

export function formatDecimal(value: number): string {
  return decimalFormatter.format(value)
}

export function formatPct(ratio: number, digits = 0): string {
  if (!Number.isFinite(ratio)) return '—'
  return `${(ratio * 100).toFixed(digits)}%`
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function formatClock(timestamp: number): string {
  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(timestamp)
}

export function formatShortTime(timestamp: number): string {
  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(timestamp)
}

export function formatDateTime(timestamp: number): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(timestamp)
}

export function formatRelative(timestamp: number, now: number): string {
  const minutes = Math.max(0, Math.round((now - timestamp) / 60000))
  if (minutes < 1) return 'just now'
  if (minutes === 1) return '1 min ago'
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} h ago`
  return `${Math.floor(hours / 24)} d ago`
}

export function formatHours(hours: number): string {
  return `${formatDecimal(hours)} h`
}

export function percentOf(value: number, total: number): number {
  if (total <= 0) return 0
  return clamp(value / total, 0, 1)
}
