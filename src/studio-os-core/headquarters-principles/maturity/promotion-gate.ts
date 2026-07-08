import { PLATFORM_EXPANSION_READINESS_THRESHOLD } from '../constants';
import { getStageIndex } from './stages';
import type { SubsystemMaturityRecord } from '../types';

/** Constitutional gate — no public platform promotion without proof. */
export function assertPlatformExpansionAllowed(record: SubsystemMaturityRecord): void {
  if (!record.expansionEligible) {
    throw new Error(
      `${record.title} cannot expand externally: ${record.expansionBlockers.join(' ')}`
    );
  }
}

export function canPromoteToPlatformProduct(record: SubsystemMaturityRecord): {
  allowed: boolean;
  reasons: string[];
} {
  if (record.expansionEligible) {
    return { allowed: true, reasons: [] };
  }
  return { allowed: false, reasons: record.expansionBlockers };
}

export function listBlockedExpansions(records: SubsystemMaturityRecord[]): SubsystemMaturityRecord[] {
  return records.filter(
    (r) =>
      getStageIndex(r.currentStage) >= 2 &&
      !r.expansionEligible &&
      r.currentStage !== 'platform-product'
  );
}

export function constitutionalExpansionSummary(records: SubsystemMaturityRecord[]) {
  const eligible = records.filter((r) => r.expansionEligible);
  const blocked = listBlockedExpansions(records);
  const platformProducts = records.filter((r) => r.currentStage === 'platform-product');

  return {
    threshold: PLATFORM_EXPANSION_READINESS_THRESHOLD,
    eligibleCount: eligible.length,
    blockedCount: blocked.length,
    platformProductCount: platformProducts.length,
    eligible,
    blocked,
  };
}
