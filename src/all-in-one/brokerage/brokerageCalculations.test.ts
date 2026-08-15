import { describe, expect, it } from 'vitest';
import {
  computeBrokerageGrossMargin,
  computeCarrierPayableTotal,
  computeGrossMarginPercent,
  computeShipperInvoiceTotal,
  computeTotalCarrierPay,
} from './brokerageCalculations';

describe('brokerageCalculations', () => {
  it('computes gross margin', () => {
    expect(computeBrokerageGrossMargin(300_000, 250_000)).toBe(50_000);
  });

  it('computes gross margin percent safely', () => {
    expect(computeGrossMarginPercent(300_000, 50_000)).toBeCloseTo(16.666, 2);
    expect(computeGrossMarginPercent(0, 50_000)).toBeNull();
  });

  it('computes total carrier pay components', () => {
    expect(
      computeTotalCarrierPay({
        carrierLinehaulMinor: 240_000,
        carrierFuelSurchargeMinor: 10_000,
        carrierAccessorialMinor: 0,
      }),
    ).toBe(250_000);
  });

  it('computes shipper invoice total', () => {
    expect(computeShipperInvoiceTotal(280_000, 20_000, 0)).toBe(300_000);
  });

  it('computes carrier payable total with deductions', () => {
    expect(computeCarrierPayableTotal(240_000, 10_000, 0)).toBe(250_000);
  });
});
