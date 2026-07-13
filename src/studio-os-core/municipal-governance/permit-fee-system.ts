import type { PermitType } from './contract';

export const PERMIT_FEE_VERSION = 'permit-fee-system.v1' as const;

export type PermitFeeCategory =
  | 'building-permit'
  | 'expansion-permit'
  | 'marketplace-certification'
  | 'priority-review'
  | 'emergency-construction'
  | 'infrastructure-upgrade'
  | 'large-asset-import';

export type PermitFeeSchedule = {
  feeVersion: typeof PERMIT_FEE_VERSION;
  currency: 'USD';
  fees: Record<PermitFeeCategory, number>;
};

export const DEFAULT_PERMIT_FEE_SCHEDULE: PermitFeeSchedule = {
  feeVersion: PERMIT_FEE_VERSION,
  currency: 'USD',
  fees: {
    'building-permit': 0,
    'expansion-permit': 0,
    'marketplace-certification': 0,
    'priority-review': 25,
    'emergency-construction': 50,
    'infrastructure-upgrade': 15,
    'large-asset-import': 10,
  },
};

export function resolvePermitFeeCategory(permitType: PermitType, options?: {
  priorityReview?: boolean;
  emergency?: boolean;
}): PermitFeeCategory {
  if (options?.emergency) return 'emergency-construction';
  if (options?.priorityReview) return 'priority-review';
  switch (permitType) {
    case 'building':
    case 'large-world-expansion':
      return 'building-permit';
    case 'department-expansion':
      return 'expansion-permit';
    case 'marketplace-certification':
      return 'marketplace-certification';
    case 'infrastructure':
      return 'infrastructure-upgrade';
    default:
      return 'building-permit';
  }
}

export function calculatePermitFee(
  permitType: PermitType,
  schedule: PermitFeeSchedule = DEFAULT_PERMIT_FEE_SCHEDULE,
  options?: { priorityReview?: boolean; emergency?: boolean }
): { category: PermitFeeCategory; amountUsd: number; currency: 'USD' } {
  const category = resolvePermitFeeCategory(permitType, options);
  return {
    category,
    amountUsd: schedule.fees[category],
    currency: 'USD',
  };
}
