import { describe, expect, it } from 'vitest';
import { computeTrueImmediateMiles, computeTrueRpm } from './freightCalculations';
import { projectCarrierLoadResult, resolveCarrierRateMinor } from './carrierLoadProjection';
import { computeLoadMatchScore } from './loadScoreEngine';
import { getInternalLoadEconomics } from './freightSearchService';
import { buildStaffLoadWorkspace, buildCarrierFreightView, filterFinancialsByRole } from './freightRoleViews';
import { getLoadFinancials } from '../demo/brokerageActions';
import type { Load } from '../dispatch/dispatchTypes';
import type { BrokerageLoadFinancials } from '../brokerage/brokerageTypes';
import type { LoadBoardPublication } from './freightTypes';
import { createDemoSeed } from '../demo/demoSeed';

function mkTestLoad(overrides: Partial<Load> = {}): Load {
  const seed = createDemoSeed();
  const template = seed.loads.find((l) => l.id === 'br-load-a')!;
  return { ...template, ...overrides };
}

const publication: LoadBoardPublication = {
  loadId: 'test-load',
  sourceType: 'aio_direct',
  visibility: 'published',
  bookingMode: 'submit_offer',
  publishedAt: new Date(Date.now() - 2 * 3_600_000).toISOString(),
  trailerLengthFt: 53,
  fullPartial: 'full',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const financials: BrokerageLoadFinancials = {
  loadId: 'test-load',
  shipperChargeMinor: 300000,
  carrierLinehaulMinor: 180000,
  carrierFuelSurchargeMinor: 0,
  carrierAccessorialMinor: 0,
  totalCarrierPayMinor: 180000,
  confirmedShipperChargeMinor: 300000,
  confirmedCarrierPayMinor: 180000,
  currency: 'USD',
  version: 1,
  updatedAt: new Date().toISOString(),
};

describe('freightCalculations', () => {
  it('computes true immediate miles as deadhead + loaded', () => {
    expect(computeTrueImmediateMiles(50, 250)).toBe(300);
  });

  it('computes true RPM separately from loaded RPM', () => {
    const carrierRate = 180000;
    const loadedRpm = Math.round(carrierRate / 250);
    const trueRpm = computeTrueRpm(carrierRate, 50, 250);
    expect(loadedRpm).toBe(720);
    expect(trueRpm).toBe(600);
    expect(trueRpm).toBeLessThan(loadedRpm);
  });

  it('handles zero mileage safely', () => {
    expect(computeTrueRpm(180000, 0, 0)).toBe(0);
  });
});

describe('carrierLoadProjection', () => {
  it('uses carrier pay — never shipper charge — for carrier rate', () => {
    const load = mkTestLoad({ loadedMiles: 250, deadheadMiles: 50 });
    expect(resolveCarrierRateMinor(load, financials)).toBe(180000);
    expect(resolveCarrierRateMinor(load, financials)).not.toBe(financials.confirmedShipperChargeMinor);
  });

  it('does not expose shipper rate or margin in carrier projection', () => {
    const load = mkTestLoad({ id: 'test-load', loadedMiles: 250, deadheadMiles: 50 });
    const result = projectCarrierLoadResult(load, publication, financials, { pickupDeadheadMiles: 50 });
    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain('300000');
    expect(serialized).not.toContain('shipper');
    expect(serialized).not.toContain('margin');
    expect(result.carrierRateMinor).toBe(180000);
    expect(result.loadedRpmMinor).toBe(720);
    expect(result.trueRpmMinor).toBe(600);
  });
});

describe('loadScoreEngine', () => {
  it('returns insufficient data when rate or miles missing', () => {
    const load = mkTestLoad({ loadedMiles: 0 });
    const score = computeLoadMatchScore(load, {
      publication,
      carrierRateMinor: 0,
      pickupDeadheadMiles: 50,
    });
    expect(score.label).toBe('INSUFFICIENT DATA');
  });

  it('returns explainable score with reasons when data exists', () => {
    const load = mkTestLoad({ loadedMiles: 250, deadheadMiles: 50 });
    const score = computeLoadMatchScore(load, {
      publication,
      carrierRateMinor: 180000,
      pickupDeadheadMiles: 50,
    });
    expect(score.score).toBeGreaterThan(0);
    expect(score.reasons.length).toBeGreaterThan(0);
    expect(score.label).not.toBe('INSUFFICIENT DATA');
  });
});

describe('freightRoleViews', () => {
  it('staff workspace includes shipper rate and margin', () => {
    const store = createDemoSeed();
    const load = store.loads.find((l) => l.id === 'br-load-a')!;
    const ws = buildStaffLoadWorkspace(load, store);
    expect(ws.pricing).not.toBeNull();
    expect(ws.pricing!.shipperRateMinor).toBeGreaterThan(ws.pricing!.finalCarrierRateMinor);
    expect(ws.pricing!.aioGrossMarginMinor).toBe(ws.pricing!.shipperRateMinor - ws.pricing!.finalCarrierRateMinor);
  });

  it('carrier view excludes shipper rate', () => {
    const store = createDemoSeed();
    const load = store.loads.find((l) => l.id === 'br-load-b')!;
    const view = buildCarrierFreightView(load, store, 'client-b');
    expect(view).not.toBeNull();
    const serialized = JSON.stringify(view);
    expect(serialized).not.toContain('shipper');
    expect(serialized).not.toContain('margin');
  });

  it('filterFinancialsByRole hides margin from carrier', () => {
    const store = createDemoSeed();
    const fin = getLoadFinancials('br-load-a', store)!;
    const carrierFin = filterFinancialsByRole(fin, 'carrier');
    expect(carrierFin.confirmedShipperChargeMinor).toBeUndefined();
    expect(carrierFin.grossMarginMinor).toBeUndefined();
    expect(carrierFin.confirmedCarrierPayMinor).toBeDefined();
  });
});

describe('internal economics', () => {
  it('computes AIO margin for staff only', () => {
    const store = createDemoSeed();
    const econ = getInternalLoadEconomics('br-load-a', store);
    expect(econ).not.toBeNull();
    expect(econ!.shipperRateMinor).toBeGreaterThan(econ!.carrierRateMinor);
    expect(econ!.aioGrossMarginMinor).toBe(econ!.shipperRateMinor - econ!.carrierRateMinor);
  });
});
