import type { ReconciliationStatus } from './autopilotTypes';

export interface ReconciliationInput {
  openingBalanceMinor: number;
  periodTransactionTotalMinor: number;
  expectedEndingBalanceMinor: number;
  verifiedEndingBalanceMinor?: number;
  unmatchedTransactionIds: string[];
}

export interface ReconciliationResult {
  status: ReconciliationStatus;
  differenceMinor: number;
  explanation: string;
}

export function runAccountReconciliation(input: ReconciliationInput): ReconciliationResult {
  const computed = input.openingBalanceMinor + input.periodTransactionTotalMinor;
  const target = input.verifiedEndingBalanceMinor ?? input.expectedEndingBalanceMinor;
  const differenceMinor = computed - target;

  if (input.unmatchedTransactionIds.length > 0) {
    return {
      status: 'REVIEW_REQUIRED',
      differenceMinor,
      explanation: `${input.unmatchedTransactionIds.length} unmatched transaction(s) require review`,
    };
  }

  if (differenceMinor === 0) {
    return { status: 'MATCHED', differenceMinor: 0, explanation: 'Computed balance matches verified ending balance' };
  }

  return {
    status: 'DIFFERENCE_FOUND',
    differenceMinor,
    explanation: `Difference of ${(differenceMinor / 100).toFixed(2)} requires staff review`,
  };
}

export interface FactoringSettlementInput {
  invoiceAmountMinor: number;
  advanceAmountMinor: number;
  feeAmountMinor: number;
  reserveAmountMinor: number;
  netCashReceivedMinor: number;
}

export function reconcileFactoringSettlement(input: FactoringSettlementInput): { balanced: boolean; explanation: string } {
  const expectedNet = input.advanceAmountMinor - input.feeAmountMinor - input.reserveAmountMinor;
  const balanced = expectedNet === input.netCashReceivedMinor;
  return {
    balanced,
    explanation: balanced
      ? 'Advance, fee, and reserve reconcile to net cash without double-counting invoice revenue'
      : 'Factoring settlement components do not reconcile — review required',
  };
}

export function detectLikelyTransfer(
  txA: { amountMinor: number; direction: string; date: string; accountId: string },
  txB: { amountMinor: number; direction: string; date: string; accountId: string },
): boolean {
  if (txA.accountId === txB.accountId) return false;
  if (Math.abs(txA.amountMinor) !== Math.abs(txB.amountMinor)) return false;
  if (txA.direction === txB.direction) return false;
  const dayA = txA.date.slice(0, 10);
  const dayB = txB.date.slice(0, 10);
  return dayA === dayB || Math.abs(new Date(dayA).getTime() - new Date(dayB).getTime()) <= 86400000;
}
