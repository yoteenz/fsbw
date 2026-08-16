import { describe, expect, it } from 'vitest';
import type { Load } from '../dispatch/dispatchTypes';
import { canViewCarrierPay, canViewGrossMargin, canViewShipperCharge, isReadyToBill } from './brokerageRules';

function brokerageLoad(overrides: Partial<Load> = {}): Load {
  return {
    sourceType: 'brokerage',
    operationalStatus: 'complete',
    podDocumentId: 'pod-1',
    ...overrides,
  } as Load;
}

describe('financial visibility', () => {
  it('restricts shipper charge to shipper and broker roles', () => {
    expect(canViewShipperCharge('shipper')).toBe(true);
    expect(canViewShipperCharge('carrier')).toBe(false);
    expect(canViewShipperCharge('broker_finance')).toBe(true);
  });

  it('restricts carrier pay to carrier and broker roles', () => {
    expect(canViewCarrierPay('carrier')).toBe(true);
    expect(canViewCarrierPay('shipper')).toBe(false);
  });

  it('restricts gross margin to broker roles', () => {
    expect(canViewGrossMargin('broker_ops')).toBe(true);
    expect(canViewGrossMargin('shipper')).toBe(false);
    expect(canViewGrossMargin('carrier')).toBe(false);
  });
});

describe('isReadyToBill', () => {
  it('requires complete load with POD and booked coverage', () => {
    expect(isReadyToBill(brokerageLoad(), { coverageStatus: 'booked' } as never)).toBe(true);
    expect(isReadyToBill(brokerageLoad({ podDocumentId: undefined }), { coverageStatus: 'booked' } as never)).toBe(false);
    expect(isReadyToBill(brokerageLoad(), { coverageStatus: 'needs_coverage' } as never)).toBe(false);
  });
});
