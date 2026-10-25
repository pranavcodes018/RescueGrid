import type { Ward } from '../types'

/**
 * Declared priority weight used for the priority-weighted unmet metric.
 * It is an explicit modelling choice, not an objective measure of need.
 */
export const PRIORITY_WEIGHT_FORMULA = 'weight = (urgency ÷ 5) × (0.6 + 0.4 × vulnerability ÷ 100)'

export const FAIRNESS_DEFINITION =
  'Coverage equity = 100 − (best ward coverage − worst ward coverage), in percentage points. It is a chosen model objective, not an objective truth.'

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

/** Vulnerability factor between 0.6 and 1.0. */
export function vulnerabilityFactor(score: number): number {
  return 0.6 + 0.4 * (clamp(score, 0, 100) / 100)
}

/** Declared priority weight for a ward, in the range 0.12–1.0. */
export function priorityWeight(ward: Pick<Ward, 'urgency' | 'vulnerability'>): number {
  const urgency = clamp(ward.urgency, 1, 5) / 5
  return urgency * vulnerabilityFactor(ward.vulnerability.score)
}

/** Priority-weighted unmet units for a ward. */
export function weightedUnmet(unmetUnits: number, weight: number): number {
  return Math.max(0, unmetUnits) * Math.max(0, weight)
}
