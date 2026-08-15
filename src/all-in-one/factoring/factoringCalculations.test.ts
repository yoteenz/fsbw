import { describe, expect, it } from 'vitest';
import {
  computeEstimatedAdvanceMinor,
  computeEstimatedFeeMinor,
  computeEstimatedReserveMinor,
} from './factoringCalculations';
import {
  canTransitionSubmissionStatus,
  detectAmountMismatch,
  findDuplicateSubmission,
  isSubmissionFundedLocked,
} from './factoringRules';
import type { FactoringSubmission, FreightInvoice } from './factoringTypes';
import type { Load } from '../dispatch/dispatchTypes';

const baseLoad = (): Load =>
  ({
    id: 'load-1',
    loadNumber: 'AIO-LD-2026-000001',
    organizationId: 'client-b',
    operationalStatus: 'complete',
    confirmedGrossMinor: 250000,
    grossMinor: 250000,
    podDocumentId: 'pod-1',
    rateDetailsReviewed: true,
    brokerName: 'Demo Broker',
    factoringHandoffStatus: 'ready',
  }) as Load;

describe('factoringCalculations', () => {
  it('computes estimated advance', () => {
    expect(computeEstimatedAdvanceMinor(250000, 9500)).toBe(237500);
  });

  it('computes estimated reserve and fee', () => {
    expect(computeEstimatedReserveMinor(250000, 500)).toBe(12500);
    expect(computeEstimatedFeeMinor(250000, 250)).toBe(6250);
  });
});

describe('factoringRules', () => {
  it('detects amount mismatch', () => {
    const inv = { amountMinor: 245000 } as FreightInvoice;
    expect(detectAmountMismatch(baseLoad(), inv)).toBe(true);
  });

  it('finds duplicate active submission', () => {
    const subs: FactoringSubmission[] = [
      { id: 's1', freightInvoiceId: 'fi-1', status: 'submitted' } as FactoringSubmission,
    ];
    expect(findDuplicateSubmission('fi-1', subs)?.id).toBe('s1');
  });

  it('blocks funded submission edits', () => {
    expect(isSubmissionFundedLocked({ status: 'funded' } as FactoringSubmission)).toBe(true);
  });

  it('enforces approved vs funded transitions', () => {
    expect(canTransitionSubmissionStatus('approved', 'funding_pending')).toBe(true);
    expect(canTransitionSubmissionStatus('approved', 'funded')).toBe(false);
    expect(canTransitionSubmissionStatus('funding_pending', 'funded')).toBe(true);
  });
});
