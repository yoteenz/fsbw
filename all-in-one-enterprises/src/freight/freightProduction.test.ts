import { describe, expect, it } from 'vitest';
import { createDemoSeed } from '../demo/demoSeed';
import { getLoadFinancials } from '../demo/brokerageActions';
import { getTruckProfiles } from '../demo/dispatchActions';
import { projectCarrierLoadResult } from './carrierLoadProjection';
import { evaluateFleetCareLoadWarning, maintenanceScoreAdjustment } from './fleetcareLoadIntelligence';
import { resolveCityCoordinates, buildLoadMapDataFromDemo } from './freightGeocoding';
import { buildNotification, shouldCreateNotification } from '../notifications/notificationEngine';
import { searchPublishedLoads } from './freightSearchService';
import { demoFreightRepository } from './demoFreightRepository';
import type { LoadBoardPublication } from './freightTypes';

describe('freightProduction', () => {
  it('resolves city coordinates from cache without fabricating GPS', () => {
    const coords = resolveCityCoordinates('Detroit', 'MI');
    expect(coords).toEqual({ lat: 42.3314, lng: -83.0458 });
    expect(resolveCityCoordinates('Unknown City', 'ZZ')).toBeNull();
  });

  it('prefers stored lat/lng over cache', () => {
    expect(resolveCityCoordinates('Detroit', 'MI', 1, 2)).toEqual({ lat: 1, lng: 2 });
  });

  it('warns when trip crosses maintenance threshold with real odometer data', () => {
    const store = createDemoSeed();
    const truck = getTruckProfiles('client-a', store).find((t) => t.id === 'tdp-a1');
    expect(truck?.currentOdometerMiles).toBe(428000);
    expect(truck?.nextPmOdometerMiles).toBe(429000);

    const warning = evaluateFleetCareLoadWarning(store, truck, 1250);
    expect(warning?.severity).toBe('warning');
    expect(warning?.message).toContain('maintenance interval');
    expect(maintenanceScoreAdjustment(warning)).toBeLessThan(0);
  });

  it('does not expose shipper rate in carrier search results', () => {
    const store = createDemoSeed();
    const response = searchPublishedLoads(store, 'client-a', { originDeadheadMiles: 75 });
    expect(response.results.length).toBeGreaterThan(0);
    const fin = getLoadFinancials(response.results[0].loadId, store);
    const serialized = JSON.stringify(response.results);
    expect(serialized).not.toContain(String(fin?.confirmedShipperChargeMinor ?? ''));
    expect(serialized).not.toContain('margin');
  });

  it('builds map markers from published loads without live GPS label', () => {
    const store = createDemoSeed();
    const response = searchPublishedLoads(store, 'client-a', { originDeadheadMiles: 75 });
    const trucks = getTruckProfiles('client-a', store);
    const map = buildLoadMapDataFromDemo(response.results, trucks);
    expect(map.loads.length).toBeGreaterThan(0);
    expect(map.trucks.some((t) => t.label === 'LAST KNOWN LOCATION')).toBe(true);
  });

  it('deduplicates freight notifications by dedupe key', () => {
    const existing = [
      buildNotification({
        recipientType: 'customer',
        eventType: 'NEW_MATCHING_LOAD',
        category: 'brokerage',
        title: 'Test',
        body: 'Test',
        dedupeKey: 'test-dedupe-1',
      }),
    ];
    expect(shouldCreateNotification(existing, 'test-dedupe-1')).toBe(false);
    expect(shouldCreateNotification(existing, 'test-dedupe-2')).toBe(true);
  });

  it('demo repository returns carrier-safe search results', async () => {
    const r = await demoFreightRepository.searchPublishedLoads('client-a', { originDeadheadMiles: 75 });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.data.totalCount).toBeGreaterThan(0);
      expect(r.data.results[0].carrierRateMinor).toBeGreaterThan(0);
    }
  });

  it('carrier projection strips internal economics', () => {
    const store = createDemoSeed();
    const load = store.loads.find((l) => l.id === 'br-load-a')!;
    const pub: LoadBoardPublication = {
      loadId: load.id,
      sourceType: 'aio_shipper_freight',
      visibility: 'published',
      bookingMode: 'submit_offer',
      fullPartial: 'full',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const fin = getLoadFinancials(load.id, store)!;
    const result = projectCarrierLoadResult(load, pub, fin);
    expect(result.carrierRateMinor).not.toBe(fin.confirmedShipperChargeMinor);
  });
});
