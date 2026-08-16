import { describe, expect, it } from 'vitest';
import {
  buildLineItems,
  calculateBillingTotals,
  computeBalanceDue,
  computeLineAmount,
} from './billingCalculator';

describe('BillingCalculator', () => {
  it('computes quantity × unit amount in minor units', () => {
    expect(computeLineAmount(12500, 2)).toBe(25000);
    expect(computeLineAmount(999, 3)).toBe(2997);
  });

  it('sums multiple line items without floating point error', () => {
    const items = buildLineItems([
      { description: 'Service A', quantity: 1, unitAmountMinor: 20000, feeCategory: 'service_fee' },
      { description: 'Service B', quantity: 2, unitAmountMinor: 7500, feeCategory: 'service_fee' },
    ]);
    const totals = calculateBillingTotals(items);
    expect(totals.subtotalServiceFeesMinor).toBe(35000);
    expect(totals.totalKnownMinor).toBe(35000);
  });

  it('separates service and external fees', () => {
    const items = buildLineItems([
      { description: 'IRP Assistance', quantity: 1, unitAmountMinor: 17500, feeCategory: 'service_fee' },
      { description: 'State filing fee', quantity: 1, unitAmountMinor: 8500, feeCategory: 'government_fee' },
    ]);
    const totals = calculateBillingTotals(items);
    expect(totals.subtotalServiceFeesMinor).toBe(17500);
    expect(totals.subtotalExternalFeesMinor).toBe(8500);
    expect(totals.totalKnownMinor).toBe(26000);
  });

  it('does not treat pending external fee as zero in total', () => {
    const items = buildLineItems([
      { description: 'Authority assistance', quantity: 1, unitAmountMinor: 20000, feeCategory: 'service_fee' },
      {
        description: 'Government filing fee',
        quantity: 1,
        unitAmountMinor: 0,
        feeCategory: 'government_fee',
        amountStatus: 'pending',
      },
    ]);
    const totals = calculateBillingTotals(items);
    expect(totals.subtotalServiceFeesMinor).toBe(20000);
    expect(totals.subtotalExternalFeesMinor).toBe(0);
    expect(totals.totalKnownMinor).toBe(20000);
    expect(totals.hasPendingExternalFees).toBe(true);
  });

  it('applies discount and tax', () => {
    const items = buildLineItems([
      { description: 'Formation', quantity: 1, unitAmountMinor: 30000, feeCategory: 'service_fee' },
      { description: 'Courtesy credit', quantity: 1, unitAmountMinor: -5000, feeCategory: 'discount' },
      { description: 'Sales tax', quantity: 1, unitAmountMinor: 2000, feeCategory: 'tax' },
    ]);
    const totals = calculateBillingTotals(items);
    expect(totals.discountTotalMinor).toBe(5000);
    expect(totals.taxTotalMinor).toBe(2000);
    expect(totals.totalKnownMinor).toBe(27000);
  });

  it('computes balance after partial payment', () => {
    expect(computeBalanceDue(26000, 10000)).toBe(16000);
    expect(computeBalanceDue(26000, 26000)).toBe(0);
    expect(computeBalanceDue(26000, 30000)).toBe(0);
  });
});
