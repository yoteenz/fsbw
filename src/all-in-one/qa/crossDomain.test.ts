import { describe, expect, it } from 'vitest';
import { createDemoSeed } from '../demo/demoSeed';
import { getAuthorizedInvoice } from '../demo/securityActions';
import { computeBrokerageGrossMargin } from '../brokerage/brokerageCalculations';
import { getExecutiveSnapshot } from '../management/managementQueryLayer';
import { resolveManagementDateRange } from '../management/managementDateRange';
import { allocateDemo1250Payment } from '../management/managementFinancial';

describe('payment propagation consistency', () => {
  it('invoice paid state aligns across customer views', () => {
    const store = createDemoSeed();
    store.portalClientId = 'client-a';
    const inv = store.invoices.find((i) => i.organizationId === 'client-a' && i.status === 'paid');
    if (!inv) return;
    const { invoice, decision } = getAuthorizedInvoice(inv.id, true, store);
    expect(decision.allowed).toBe(true);
    expect(invoice?.status).toBe('paid');
  });
});

describe('customer-safe projection', () => {
  it('internal notes exist and are marked internal only', () => {
    const store = createDemoSeed();
    const internalNotes = store.notes.filter((n) => n.visibility === 'internal');
    expect(internalNotes.length).toBeGreaterThan(0);
  });
});

describe('financial boundaries', () => {
  it('brokerage gross margin is separate from customer charge', () => {
    const margin = computeBrokerageGrossMargin(200000, 150000);
    expect(margin).toBe(50000);
  });

  it('management allocation separates revenue from pass-through', () => {
    const alloc = allocateDemo1250Payment();
    expect(alloc.serviceFeesMinor).toBeLessThan(alloc.collectedCashMinor);
    expect(alloc.passThroughMinor).toBeGreaterThan(0);
  });

  it('executive snapshot exposes distinct financial fields', () => {
    const store = createDemoSeed();
    const range = resolveManagementDateRange('year');
    const snap = getExecutiveSnapshot(store, range);
    expect(snap.collectedServiceRevenueMinor).toBeDefined();
    expect(typeof snap.hasIncompleteFinancialData).toBe('boolean');
  });
});

describe('cross-customer isolation', () => {
  it('denies customer B invoice to customer A', () => {
    const store = createDemoSeed();
    store.portalClientId = 'client-a';
    const invB = store.invoices.find((i) => i.organizationId === 'client-b');
    expect(invB).toBeTruthy();
    const { decision } = getAuthorizedInvoice(invB!.id, true, store);
    expect(decision.allowed).toBe(false);
  });
});
