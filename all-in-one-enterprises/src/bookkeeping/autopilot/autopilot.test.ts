import { describe, expect, it } from 'vitest';
import { classifyBookkeepingTransaction } from './classificationEngine';
import { reconcileFactoringSettlement, detectLikelyTransfer } from './reconciliationEngine';
import { matchDocumentToTransaction } from './documentMatching';

describe('classifyBookkeepingTransaction', () => {
  it('classifies known fuel merchant with high confidence', () => {
    const result = classifyBookkeepingTransaction({
      merchantName: "Love's Travel Stop #412",
      amountMinor: 61284,
      organizationId: 'client-b',
    });
    expect(result.category).toBe('Fuel');
    expect(result.confidence).toBe('VERY_HIGH');
    expect(result.reviewState).toBe('AUTO_APPROVABLE');
    expect(result.reason.toLowerCase()).toContain("love's");
  });

  it('requires clarification for unknown merchant', () => {
    const result = classifyBookkeepingTransaction({
      merchantName: 'ABC Supply',
      amountMinor: 94200,
      organizationId: 'client-b',
    });
    expect(result.reviewState).toBe('CUSTOMER_CLARIFICATION');
    expect(result.confidence).toBe('UNCLASSIFIED');
  });

  it('applies customer-specific rules', () => {
    const result = classifyBookkeepingTransaction({
      merchantName: 'Custom Vendor XYZ',
      amountMinor: 5000,
      organizationId: 'client-b',
      customerRules: [
        {
          id: 'cust-rule-1',
          pattern: 'Custom Vendor',
          category: 'Truck Repairs',
          scope: 'organization',
          organizationId: 'client-b',
          confidence: 'HIGH',
        },
      ],
    });
    expect(result.category).toBe('Truck Repairs');
    expect(result.source).toBe('CUSTOMER_RULE');
  });
});

describe('reconcileFactoringSettlement', () => {
  it('balances factoring components without double-counting revenue', () => {
    const result = reconcileFactoringSettlement({
      invoiceAmountMinor: 500000,
      advanceAmountMinor: 475000,
      feeAmountMinor: 15000,
      reserveAmountMinor: 10000,
      netCashReceivedMinor: 450000,
    });
    expect(result.balanced).toBe(true);
  });

  it('flags factoring mismatch for review', () => {
    const result = reconcileFactoringSettlement({
      invoiceAmountMinor: 500000,
      advanceAmountMinor: 475000,
      feeAmountMinor: 15000,
      reserveAmountMinor: 10000,
      netCashReceivedMinor: 400000,
    });
    expect(result.balanced).toBe(false);
    expect(result.explanation).toContain('review');
  });
});

describe('detectLikelyTransfer', () => {
  it('detects opposite-direction same-amount transfers', () => {
    const likely = detectLikelyTransfer(
      { amountMinor: 100000, direction: 'debit', date: '2026-08-01', accountId: 'a1' },
      { amountMinor: 100000, direction: 'credit', date: '2026-08-01', accountId: 'a2' },
    );
    expect(likely).toBe(true);
  });
});

describe('matchDocumentToTransaction', () => {
  it('matches receipt to transaction by amount and date', () => {
    const result = matchDocumentToTransaction(
      { id: 'tx1', merchantName: "Love's Travel Stop", amountMinor: 61284, transactionDate: '2026-08-13' },
      [{ id: 'doc1', merchant: "Love's", amountMinor: 61284, documentDate: '2026-08-13' }],
    );
    expect(result.result).toBe('MATCHED');
  });
});
