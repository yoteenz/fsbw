import { describe, it, expect, beforeEach } from 'vitest';
import type { Load } from '../../dispatch/dispatchTypes';
import { evaluateDocumentCompleteness } from './documentCompleteness';
import { processFreightAutopilotEvent, ensureBillingPackage } from './freightAutopilotService';
import { billingPackageIdempotencyKey } from './billingPackageTypes';
import { createDemoSeed } from '../../demo/demoSeed';
import type { DemoStore } from '../../demo/demoTypes';
import { calculateDriverSettlement, settlementIdempotencyKey } from '../../settlements/driverSettlementEngine';
import { assessIftaReadiness, milesFromLoadFields } from '../../fleet/ifta/iftaReadiness';
import { submitPretripInspection } from '../../fleet/pretrip/pretripService';
import { promoteApplicantToDriverProfile } from '../../demo/driverlinkActions';
import { buildStaffLoadWorkspace, filterFinancialsByRole } from '../freightRoleViews';
import { resolveCarrierRateMinor } from '../carrierLoadProjection';

import type { BrokerageLoadFinancials } from '../../brokerage/brokerageTypes';

function mockFin(loadId: string, shipper: number, carrier: number): BrokerageLoadFinancials {
  return {
    loadId,
    shipperChargeMinor: shipper,
    carrierLinehaulMinor: carrier,
    carrierFuelSurchargeMinor: 0,
    carrierAccessorialMinor: 0,
    totalCarrierPayMinor: carrier,
    confirmedShipperChargeMinor: shipper,
    confirmedCarrierPayMinor: carrier,
    currency: 'USD',
    version: 1,
    updatedAt: new Date().toISOString(),
  };
}

function baseLoad(overrides: Partial<Load> = {}): Load {
  return {
    id: 'load-test-1',
    loadNumber: 'AIO-TEST-001',
    organizationId: 'client-a',
    sourceType: 'manual',
    brokerName: 'AIO Brokerage Desk',
    equipmentType: 'Dry Van',
    originCity: 'Dallas',
    originState: 'TX',
    destinationCity: 'Atlanta',
    destinationState: 'GA',
    pickupDate: '2026-08-01',
    deliveryDate: '2026-08-02',
    loadedMiles: 780,
    deadheadMiles: 40,
    linehaulMinor: 200_000,
    fuelSurchargeMinor: 0,
    accessorialMinor: 0,
    grossMinor: 200_000,
    confirmedGrossMinor: 200_000,
    currency: 'USD',
    offerStatus: 'accepted',
    operationalStatus: 'complete',
    rateConfirmationStatus: 'uploaded',
    rateConfirmationDocumentId: 'doc-rc',
    bolDocumentId: 'doc-bol',
    podDocumentId: 'doc-pod',
    rateDetailsReviewed: true,
    factoringHandoffStatus: 'ready',
    accessorials: [],
    rateRevisions: [],
    timeline: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: 1,
    ...overrides,
  };
}

describe('Freight Autopilot', () => {
  let store: DemoStore;

  beforeEach(() => {
    store = createDemoSeed();
  });

  it('document completeness blocks billing when POD missing', () => {
    const load = baseLoad({ podDocumentId: undefined, operationalStatus: 'complete' });
    const result = evaluateDocumentCompleteness(load);
    expect(result.readyForBilling).toBe(false);
    expect(result.missingLabels).toContain('POD');
  });

  it('billing package is idempotent', () => {
    const load = baseLoad();
    store.loads = [load];
    const first = ensureBillingPackage(store, load);
    const second = ensureBillingPackage(store, load);
    expect(first).toBeDefined();
    expect(second?.id).toBe(first?.id);
    expect(store.billingPackages?.filter((b) => b.idempotencyKey === billingPackageIdempotencyKey(load.id))).toHaveLength(1);
  });

  it('autopilot creates billing blocked exception without POD', () => {
    const load = baseLoad({ podDocumentId: undefined, operationalStatus: 'complete' });
    store.loads = [load];
    const result = processFreightAutopilotEvent(store, { load, event: 'DELIVERY_CONFIRMED' });
    expect(result.blocked).toBe(true);
    expect(result.exceptionsCreated.length).toBeGreaterThan(0);
  });

  it('duplicate driver settlement prevented by idempotency key', () => {
    const a = calculateDriverSettlement({
      loadId: 'load-1',
      organizationId: 'client-a',
      driverId: 'driver-1',
      compensationModel: 'PER_MILE',
      loadedMiles: 500,
      emptyMiles: 50,
      ratePerMileMinor: 5500,
    });
    const b = calculateDriverSettlement({
      loadId: 'load-1',
      organizationId: 'client-a',
      driverId: 'driver-1',
      compensationModel: 'PER_MILE',
      loadedMiles: 500,
      emptyMiles: 50,
      ratePerMileMinor: 5500,
    });
    expect(a.idempotencyKey).toBe(b.idempotencyKey);
    expect(a.idempotencyKey).toBe(settlementIdempotencyKey('load-1', 'driver-1'));
  });

  it('IFTA readiness rejects estimated-only mileage for authoritative filing', () => {
    const entries = milesFromLoadFields(500, 50, 'TX');
    const assessment = assessIftaReadiness(entries);
    expect(assessment.canGenerateAuthoritativeReturn).toBe(false);
    expect(['ESTIMATED', 'MANUAL_VERIFICATION_REQUIRED']).toContain(assessment.status);
  });

  it('pre-trip defect escalates to FleetCare', () => {
    const inspection = submitPretripInspection(store, {
      organizationId: 'client-a',
      driverId: 'driver-1',
      powerUnitId: 'pu-1',
      result: 'OUT_OF_SERVICE',
      defectSummary: 'Brake air leak',
    });
    expect(inspection.escalatedToFleetCare).toBe(true);
    expect(store.fleetcareTickets?.length).toBeGreaterThan(0);
  });

  it('carrier projection hides shipper rate and margin', () => {
    const load = baseLoad({ sourceType: 'brokerage', shipperOrganizationId: 'shipper-a' });
    store.loads = [load];
    store.brokerageLoadFinancials = [mockFin(load.id, 300_000, 220_000)];
    const fin = store.brokerageLoadFinancials[0];
    const carrierRate = resolveCarrierRateMinor(load, fin);
    expect(carrierRate).toBe(220_000);
    const filtered = filterFinancialsByRole(fin, 'carrier');
    expect(filtered?.confirmedShipperChargeMinor).toBeUndefined();
  });

  it('freight role views enforce shipper vs carrier financial separation', () => {
    const load = baseLoad({ sourceType: 'brokerage', shipperOrganizationId: 'shipper-a' });
    store.loads = [load];
    store.brokerageLoadFinancials = [mockFin(load.id, 300_000, 220_000)];
    const workspace = buildStaffLoadWorkspace(load, store);
    expect(workspace.pricing?.shipperRateMinor).toBe(300_000);
    const carrierFin = filterFinancialsByRole(mockFin(load.id, 300_000, 220_000), 'carrier');
    expect(carrierFin?.confirmedShipperChargeMinor).toBeUndefined();
    expect(carrierFin?.confirmedCarrierPayMinor).toBe(220_000);
  });
});

describe('DriverLink promotion', () => {
  it('promotes hired applicant to driver placeholder', () => {
    const store = createDemoSeed();
    const app = store.driverlinkApplications?.[0];
    if (!app) return;
    store.driverlinkApplications = [{ ...app, status: 'hired' }];
    const driver = promoteApplicantToDriverProfile(app.id, 'staff-1', store);
    expect(driver).toBeDefined();
    expect(driver?.organizationId).toBe(app.organizationId);
  });
});
