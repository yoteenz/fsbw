import type { Load } from '../dispatch/dispatchTypes';
import type { CarrierPayable } from '../brokerage/brokerageTypes';
import { computeCarrierPayableTotal } from '../brokerage/brokerageCalculations';
import { isReadyForCarrierPayable } from '../brokerage/brokerageRules';

export type CarrierSettlementLifecycle =
  | 'PENDING_DOCUMENTS'
  | 'READY_FOR_REVIEW'
  | 'APPROVED'
  | 'SCHEDULED'
  | 'PAID'
  | 'DISPUTED';

export interface CarrierSettlementSnapshot {
  loadId: string;
  carrierNetworkProfileId: string;
  agreedCarrierRateMinor: number;
  approvedAccessorialsMinor: number;
  deductionsMinor: number;
  totalPayableMinor: number;
  lifecycle: CarrierSettlementLifecycle;
  requiredPaperworkComplete: boolean;
  aioGrossContributionMinor?: number;
  shipperRevenueMinor?: number;
}

export function carrierPayableIdempotencyKey(loadId: string): string {
  return `carrier-payable:${loadId}`;
}

export function deriveCarrierSettlementLifecycle(
  load: Load,
  payable?: CarrierPayable,
): CarrierSettlementLifecycle {
  if (!load.podDocumentId || load.operationalStatus !== 'complete') return 'PENDING_DOCUMENTS';
  if (!payable) return 'READY_FOR_REVIEW';
  switch (payable.status) {
    case 'pending_documents':
      return 'PENDING_DOCUMENTS';
    case 'pending_approval':
      return 'READY_FOR_REVIEW';
    case 'approved':
      return 'APPROVED';
    case 'scheduled_future':
      return 'SCHEDULED';
    case 'paid_future':
      return 'PAID';
    case 'disputed':
      return 'DISPUTED';
    default:
      return 'READY_FOR_REVIEW';
  }
}

export function buildCarrierSettlementSnapshot(
  load: Load,
  payable: CarrierPayable,
  shipperRevenueMinor?: number,
): CarrierSettlementSnapshot {
  const total = computeCarrierPayableTotal(
    payable.confirmedAmountMinor,
    payable.accessorialAmountMinor,
    payable.deductionsMinor,
  );
  return {
    loadId: load.id,
    carrierNetworkProfileId: payable.carrierNetworkProfileId,
    agreedCarrierRateMinor: payable.confirmedAmountMinor,
    approvedAccessorialsMinor: payable.accessorialAmountMinor,
    deductionsMinor: payable.deductionsMinor,
    totalPayableMinor: total,
    lifecycle: deriveCarrierSettlementLifecycle(load, payable),
    requiredPaperworkComplete: isReadyForCarrierPayable(load, payable),
    shipperRevenueMinor,
    aioGrossContributionMinor:
      shipperRevenueMinor != null ? shipperRevenueMinor - total : undefined,
  };
}
