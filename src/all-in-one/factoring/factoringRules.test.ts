import { describe, expect, it } from 'vitest';
import type { Load } from '../dispatch/dispatchTypes';
import type { FactoringSubmission, FreightInvoice } from './factoringTypes';
import {
  canTransitionSubmissionStatus,
  detectAmountMismatch,
  evaluateLoadFactoringReadiness,
  findDuplicateSubmission,
  isPackageComplete,
  isSubmissionFundedLocked,
} from './factoringRules';

function baseLoad(overrides: Partial<Load> = {}): Load {
  return {
    id: 'load-1',
    organizationId: 'org-1',
    loadNumber: 'AIO-LD-001',
    operationalStatus: 'complete',
    offerStatus: 'accepted',
    factoringHandoffStatus: 'ready',
    confirmedGrossMinor: 250_000,
    grossMinor: 250_000,
    rateConfirmationDocumentId: 'doc-rc',
    podDocumentId: 'doc-pod',
    brokerName: 'Demo Broker LLC',
    rateDetailsReviewed: true,
    originCity: 'Dallas',
    originState: 'TX',
    destinationCity: 'Houston',
    destinationState: 'TX',
    timeline: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  } as Load;
}

function baseInvoice(overrides: Partial<FreightInvoice> = {}): FreightInvoice {
  return {
    id: 'fi-1',
    organizationId: 'org-1',
    loadId: 'load-1',
    invoiceNumber: 'HF-2026-0001',
    debtorType: 'broker',
    debtorName: 'Demo Broker LLC',
    amountMinor: 250_000,
    currency: 'USD',
    status: 'open',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('evaluateLoadFactoringReadiness', () => {
  it('returns not_ready when load is incomplete', () => {
    const result = evaluateLoadFactoringReadiness(baseLoad({ operationalStatus: 'in_transit' }));
    expect(result.state).toBe('not_ready');
  });

  it('returns missing_documents when POD is absent', () => {
    const result = evaluateLoadFactoringReadiness(baseLoad({ podDocumentId: undefined }));
    expect(result.state).toBe('missing_documents');
  });

  it('returns ready when handoff requirements are met', () => {
    const result = evaluateLoadFactoringReadiness(baseLoad());
    expect(result.state).toBe('ready');
    expect(result.handoffReady).toBe(true);
  });
});

describe('isPackageComplete', () => {
  it('requires freight invoice for complete package', () => {
    expect(isPackageComplete(baseLoad())).toBe(false);
    expect(isPackageComplete(baseLoad(), baseInvoice())).toBe(true);
  });
});

describe('detectAmountMismatch', () => {
  it('detects invoice vs load gross mismatch', () => {
    expect(detectAmountMismatch(baseLoad(), baseInvoice({ amountMinor: 245_000 }))).toBe(true);
    expect(detectAmountMismatch(baseLoad(), baseInvoice())).toBe(false);
  });
});

describe('findDuplicateSubmission', () => {
  it('finds active duplicate by freight invoice', () => {
    const subs: FactoringSubmission[] = [
      { id: 's1', freightInvoiceId: 'fi-1', status: 'submitted' } as FactoringSubmission,
      { id: 's2', freightInvoiceId: 'fi-2', status: 'declined' } as FactoringSubmission,
    ];
    expect(findDuplicateSubmission('fi-1', subs)?.id).toBe('s1');
    expect(findDuplicateSubmission('fi-2', subs)).toBeUndefined();
  });
});

describe('submission transitions', () => {
  it('blocks funded → draft', () => {
    expect(canTransitionSubmissionStatus('funded', 'draft')).toBe(false);
  });

  it('allows approved → funding_pending', () => {
    expect(canTransitionSubmissionStatus('approved', 'funding_pending')).toBe(true);
  });

  it('locks funded submissions', () => {
    expect(isSubmissionFundedLocked({ status: 'funded' } as FactoringSubmission)).toBe(true);
  });
});
