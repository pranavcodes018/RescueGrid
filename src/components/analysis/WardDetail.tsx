import { ArrowUpRight, BriefcaseMedical, Droplets, Package, X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { SUPPLY_META, SUPPLY_TYPES, URGENCY_META } from '../../lib/constants'
import { formatNumber, formatPct } from '../../lib/format'
import { cn } from '../../lib/cn'
import type { Plan, Scenario, SupplyType, Ward, WardPlan } from '../../types'
import { Badge } from '../ui/Badge'
import { ProgressBar, type ProgressTone } from '../ui/ProgressBar'

const SUPPLY_ICON: Record<SupplyType, LucideIcon> = {
  water: Droplets,
  medical: BriefcaseMedical,
  food: Package,
}

const SUPPLY_TONE: Record<SupplyType, ProgressTone> = {
  water: 'sky',
  medical: 'violet',
  food: 'amber',
}

interface WardDetailProps {
  ward: Ward
  wardPlan: WardPlan
  scenario: Scenario
  plan: Plan
  compact?: boolean
  onClose?: () => void
  onExplain?: () => void
  className?: string
}

export function WardDetail({
  ward,
  wardPlan,
  scenario,
  plan,
  compact = false,
  onClose,
  onExplain,
  className,
}: WardDetailProps) {
  const urgency = URGENCY_META[ward.urgency] ?? URGENCY_META[3]
  const vulnerabilityTone =
    ward.vulnerability.score >= 75 ? 'amber' : ward.vulnerability.score >= 50 ? 'sky' : 'teal'

  const primarySource = SUPPLY_TYPES.map((supply) => wardPlan.bySupply[supply].sourceDepotId).find(
    (id): id is NonNullable<typeof id> => Boolean(id),
  )
  const sourceDepot = primarySource ? scenario.depots.find((depot) => depot.id === primarySource) : null
  const primaryDistance = SUPPLY_TYPES.map((supply) => wardPlan.bySupply[supply].route?.distanceKm).find(
    (distance): distance is number => typeof distance === 'number',
  )

  return (
    <div className={cn('min-w-0', compact ? 'p-2.5' : 'p-3', className)}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="label-tiny">
            {ward.code} · Simulated neighbourhood
          </div>
          <h3 className="mt-1 truncate text-[13px] font-medium tracking-[-0.01em] text-mist-50">
            {ward.name}
          </h3>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded border px-1.5 py-0.5 font-mono text-[8.5px] uppercase tracking-[0.08em]',
              urgency.badgeClass,
            )}
            title={`Urgency ${ward.urgency}/5 — ${urgency.label}`}
          >
            <span aria-hidden className={cn('h-1 w-1 rounded-full', urgency.dotClass)} />
            {urgency.label}
          </span>
          {onClose ? (
            <button
              type="button"
              aria-label="Close neighbourhood detail"
              onClick={onClose}
              className="rounded p-0.5 text-mist-500 transition-colors hover:bg-white/5 hover:text-mist-200"
            >
              <X size={13} aria-hidden />
            </button>
          ) : null}
        </div>
      </div>

      <div className={cn('flex items-end justify-between gap-2', compact ? 'mt-2' : 'mt-2.5')}>
        <div>
          <div className="label-tiny mb-1">Plan coverage</div>
          <div className="num text-[24px] font-medium leading-none text-mist-50">
            {formatPct(wardPlan.coverage, 0)}
          </div>
        </div>
        <div className="text-right text-[9px] leading-relaxed text-mist-500">
          <span className="num text-mist-300">
            {formatNumber(wardPlan.allocatedUnits)} / {formatNumber(wardPlan.demandUnits)}
          </span>{' '}
          units
          <br />
          {wardPlan.unmetUnits > 0 ? (
            <span className="num text-[#f6c97f]">{formatNumber(wardPlan.unmetUnits)} unmet</span>
          ) : (
            <span className="text-signal">all requests covered</span>
          )}
        </div>
      </div>
      <ProgressBar
        value={wardPlan.coverage}
        label={`${ward.shortName} plan coverage`}
        tone={wardPlan.coverage < 0.5 ? 'amber' : 'teal'}
        className="mt-1.5"
        heightClass="h-[5px]"
      />

      <div className={cn('mt-2.5 space-y-2 border-t border-line/70 pt-2.5')}>
        {SUPPLY_TYPES.map((supply) => {
          const entry = wardPlan.bySupply[supply]
          const meta = SUPPLY_META[supply]
          const Icon = SUPPLY_ICON[supply]
          const source = scenario.depots.find((depot) => depot.id === entry.sourceDepotId)
          return (
            <div key={supply}>
              <div className="flex items-center gap-1.5">
                <Icon size={11} aria-hidden style={{ color: meta.color }} />
                <span className="text-[9.5px] text-mist-300">{meta.shortLabel}</span>
                <span className="num ml-auto text-[9.5px] text-mist-200">
                  {formatNumber(entry.allocated)}
                  <span className="text-mist-500"> / {formatNumber(entry.demand)}</span>
                </span>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <ProgressBar
                  value={entry.demand > 0 ? entry.allocated / entry.demand : 0}
                  label={`${meta.shortLabel} allocation for ${ward.shortName}`}
                  tone={SUPPLY_TONE[supply]}
                  heightClass="h-[3px]"
                  className="flex-1"
                />
                <span className="w-[58px] shrink-0 truncate text-right font-mono text-[7.5px] leading-none text-mist-500">
                  {source ? `${source.code} · ${entry.route ? `${entry.route.distanceKm.toFixed(1)} km` : 'no route'}` : 'no source'}
                </span>
              </div>
              {entry.unmet > 0 ? (
                <div className="mt-0.5 text-right font-mono text-[8px] text-[#e8bd7a]">
                  {formatNumber(entry.unmet)} unmet
                </div>
              ) : null}
            </div>
          )
        })}
      </div>

      <div className="mt-2.5 flex items-start justify-between gap-2 border-t border-line/70 pt-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="label-tiny">Vulnerability</span>
            <span className="num text-[10px] text-[#e8c98f]">{ward.vulnerability.score}/100</span>
          </div>
          <div className="mt-1 flex flex-wrap gap-1">
            {[
              ['Elderly', ward.vulnerability.elderlyPct],
              ['Children', ward.vulnerability.childrenPct],
              ['Disability', ward.vulnerability.disabilityPct],
              ['Informal housing', ward.vulnerability.informalHousingPct],
            ].map(([label, value]) => (
              <span
                key={String(label)}
                className="inline-flex items-center gap-1 rounded border border-line/80 bg-night-950/50 px-1.5 py-0.5 text-[8px] text-mist-400"
                title={`${label}: ${value}% of residents (simulated indicator)`}
              >
                {label} <b className="num font-normal text-mist-200">{value}%</b>
              </span>
            ))}
          </div>
        </div>
        {!compact ? (
          <Badge tone={vulnerabilityTone} className="mt-0.5 shrink-0">
            score {ward.vulnerability.score}
          </Badge>
        ) : null}
      </div>

      {!compact ? (
        <div className="mt-2 flex items-center justify-between gap-2 text-[9px] text-mist-500">
          <span>
            Pop. <span className="num text-mist-300">{formatNumber(ward.population)}</span> ·{' '}
            {formatNumber(ward.households)} households
          </span>
          {sourceDepot ? (
            <span className="truncate">
              via {sourceDepot.code}
              {primaryDistance ? ` · ${primaryDistance.toFixed(1)} km` : ''}
            </span>
          ) : null}
        </div>
      ) : (
        <div className="mt-1.5 text-[8.5px] text-mist-600">
          {sourceDepot ? `Primary source: ${sourceDepot.name}` : 'No depot currently assigned'}
        </div>
      )}

      {!compact ? <p className="mt-2 text-[9.5px] leading-relaxed text-mist-500">{ward.note}</p> : null}

      {onExplain ? (
        <button
          type="button"
          onClick={onExplain}
          className="mt-2.5 flex w-full items-center justify-between rounded-md border border-signal/20 bg-signal/[0.045] px-2 py-1.5 text-left text-[10px] font-medium text-[#a9e9e0] transition-colors hover:bg-signal/[0.09]"
        >
          Explain this allocation
          <ArrowUpRight size={12} aria-hidden />
        </button>
      ) : null}

      {plan.totals.affectedWards >= plan.wards.length && wardPlan.unmetUnits > 0 ? (
        <p className="mt-2 font-mono text-[8px] uppercase tracking-[0.08em] text-mist-600">
          All wards currently carry unmet demand in this plan
        </p>
      ) : null}
    </div>
  )
}
