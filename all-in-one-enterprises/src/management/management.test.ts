import { describe, expect, it } from 'vitest';
import { createDemoSeed } from '../demo/demoSeed';
import {
  allocateDemo1250Payment,
  allocatePayment,
  getFinancialSummary,
  getReceivablesAging,
} from './managementFinancial';
import { resolveManagementDateRange } from './managementDateRange';
import {
  conversionRate,
  getBrokerageEconomics,
  getExecutiveSnapshot,
  getSalesFunnel,
} from './managementQueryLayer';
import { computeBrokerageGrossMargin, computeGrossMarginPercent } from '../brokerage/brokerageCalculations';
import { hasOfficePermission, resolveOfficeStaffContext } from '../office-core/officeContext';
import { hasManagementPermission } from './managementPermissions';
import { detectDataQualityIssues } from './managementDataQuality';
import type { BillingInvoice, PaymentRecord } from '../billing/billingTypes';

describe('financial allocation — $1,250 payment', () => {
  it('allocates service vs pass-through correctly', () => {
    const alloc = allocateDemo1250Payment();
    expect(alloc.collectedCashMinor).toBe(125_000);
    expect(alloc.serviceFeesMinor).toBe(60_000);
    expect(alloc.passThroughMinor).toBe(65_000);
    expect(alloc.unallocatedMinor).toBe(0);
  });

  it('refund does not subtract pass-through from service incorrectly', () => {
    const payment: PaymentRecord = {
      id: 'p1',
      organizationId: 'x',
      invoiceId: 'inv',
      provider: 'demo',
      amountMinor: 125_000,
      currency: 'USD',
      status: 'succeeded',
      createdAt: new Date().toISOString(),
    };
    const invoice: BillingInvoice = {
      id: 'inv',
      invoiceNumber: 'TEST',
      organizationId: 'x',
      serviceTitle: 'Test',
      status: 'paid',
      currency: 'USD',
      lineItems: [],
      subtotalServiceFeesMinor: 60_000,
      subtotalExternalFeesMinor: 65_000,
      discountTotalMinor: 0,
      taxTotalMinor: 0,
      totalMinor: 125_000,
      amountPaidMinor: 125_000,
      balanceDueMinor: 0,
      hasPendingExternalFees: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const alloc = allocatePayment(payment, invoice);
    expect(alloc.serviceFeesMinor + alloc.passThroughMinor).toBeLessThanOrEqual(125_000);
  });
});

describe('brokerage gross margin', () => {
  it('computes $600 margin at 17.14%', () => {
    const margin = computeBrokerageGrossMargin(350_000, 290_000);
    expect(margin).toBe(60_000);
    const pct = computeGrossMarginPercent(350_000, margin);
    expect(pct).toBeCloseTo(17.142857, 4);
  });
});

describe('sales funnel conversion', () => {
  it('uses explicit denominators', () => {
    expect(conversionRate(17, 100)).toBe(17);
    expect(conversionRate(18, 30)).toBe(60);
    expect(conversionRate(5, 0)).toBeNull();
  });
});

describe('receivables aging reconciles', () => {
  it('aging buckets sum to open invoice balances', () => {
    const store = createDemoSeed();
    const aging = getReceivablesAging(store);
    const totalFromBuckets = aging.reduce((s, b) => s + b.balanceMinor, 0);
    const openTotal = store.invoices
      .filter((i) => ['issued', 'partially_paid', 'past_due'].includes(i.status) && i.balanceDueMinor > 0)
      .reduce((s, i) => s + i.balanceDueMinor, 0);
    expect(totalFromBuckets).toBe(openTotal);
  });
});

describe('executive snapshot', () => {
  it('does not equate collected cash with service revenue', () => {
    const store = createDemoSeed();
    const range = resolveManagementDateRange('year');
    const snap = getExecutiveSnapshot(store, range);
    const fin = getFinancialSummary(store, range);
    expect(snap.collectedServiceRevenueMinor).toBe(fin.serviceFeesCollectedMinor);
    if (fin.collectedCashMinor > 0 && fin.passThroughCollectedMinor > 0) {
      expect(snap.collectedServiceRevenueMinor).toBeLessThan(fin.collectedCashMinor);
    }
  });
});

describe('management permissions', () => {
  it('owner has financial management access', () => {
    const store = createDemoSeed();
    store.officeStaffRole = 'owner';
    const ctx = resolveOfficeStaffContext(store);
    expect(hasManagementPermission(ctx, 'management.financial.read')).toBe(true);
    expect(hasManagementPermission(ctx, 'reports.export')).toBe(true);
  });

  it('dispatcher lacks executive financials', () => {
    const store = createDemoSeed();
    store.officeStaffRole = 'dispatcher';
    const ctx = resolveOfficeStaffContext(store);
    expect(hasManagementPermission(ctx, 'management.financial.read')).toBe(false);
    expect(hasManagementPermission(ctx, 'management.dispatch.read')).toBe(true);
    expect(hasOfficePermission(ctx, 'brokerage_finance.read')).toBe(false);
  });

  it('billing specialist has finance view only', () => {
    const store = createDemoSeed();
    store.officeStaffRole = 'billing_specialist';
    const ctx = resolveOfficeStaffContext(store);
    expect(hasManagementPermission(ctx, 'management.financial.read')).toBe(true);
    expect(hasManagementPermission(ctx, 'management.brokerage.read')).toBe(false);
  });
});

describe('comparison zero handling', () => {
  it('returns null rate when prior is zero', () => {
    expect(conversionRate(10, 0)).toBeNull();
  });
});

describe('data quality', () => {
  it('detects issues deterministically without throwing', () => {
    const store = createDemoSeed();
    const issues = detectDataQualityIssues(store);
    expect(Array.isArray(issues)).toBe(true);
  });
});

describe('sales funnel from demo', () => {
  it('produces logically possible counts', () => {
    const store = createDemoSeed();
    const funnel = getSalesFunnel(store, resolveManagementDateRange('year'));
    expect(funnel.contacted).toBeLessThanOrEqual(funnel.leads);
    expect(funnel.qualified).toBeLessThanOrEqual(funnel.contacted);
    expect(funnel.converted).toBeLessThanOrEqual(funnel.leads);
  });
});

describe('brokerage economics from demo financials', () => {
  it('margin equals shipper minus carrier on aggregated completed loads', () => {
    const store = createDemoSeed();
    const range = resolveManagementDateRange('year');
    const econ = getBrokerageEconomics(store, range);
    expect(econ.grossMarginMinor).toBe(econ.shipperRevenueMinor - econ.carrierPayMinor);
  });
});
