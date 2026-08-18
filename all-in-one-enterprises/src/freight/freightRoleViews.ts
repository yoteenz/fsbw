import type { DemoStore } from '../demo/demoTypes';
import type { Load } from '../dispatch/dispatchTypes';
import { getLoadFinancials } from '../demo/brokerageActions';
import { computeGrossMarginPercent } from '../brokerage/brokerageCalculations';
import { canViewGrossMargin, canViewShipperCharge, canViewCarrierPay } from '../brokerage/brokerageRules';
import type { BrokerageLoadFinancials } from '../brokerage/brokerageTypes';
import { computeLoadedRpm, computeTrueRpm } from './freightCalculations';
import { projectCarrierLoadResult, resolveCarrierRateMinor } from './carrierLoadProjection';
import { getPublication } from './loadBoardActions';
import { inferLifecycleFromLoad } from './freightLifecycle';
import type { CarrierLoadBoardResult, LoadBoardPublication } from './freightTypes';

export type FreightViewerRole = 'aio_staff' | 'shipper' | 'carrier' | 'driver';

export interface StaffLoadPricingView {
  shipperRateMinor: number;
  carrierOfferMinor: number;
  finalCarrierRateMinor: number;
  aioGrossMarginMinor: number;
  aioGrossMarginPercent: number | null;
  loadedRpmMinor: number;
  trueRpmMinor: number;
  currency: string;
}

export interface StaffLoadWorkspace {
  loadId: string;
  loadNumber: string;
  lifecycleStatus: ReturnType<typeof inferLifecycleFromLoad>;
  route: {
    originCity: string;
    originState: string;
    destinationCity: string;
    destinationState: string;
    pickupDate: string;
    deliveryDate: string;
    loadedMiles: number;
    deadheadMiles: number;
    equipmentType: string;
    weight?: string;
    commodity?: string;
    operationalStatus: string;
    coverageStatus?: string;
  };
  shipper: {
    organizationId?: string;
    legalName?: string;
    contactName?: string;
    email?: string;
    phone?: string;
  } | null;
  pricing: StaffLoadPricingView | null;
  carrier: {
    networkProfileId?: string;
    organizationId?: string;
    legalName?: string;
    mcNumber?: string;
    usdot?: string;
    authorityVerification?: string;
    insuranceVerification?: string;
  } | null;
  equipment: {
    powerUnitId?: string;
    trailerId?: string;
    primaryDriverId?: string;
    assignedDispatcherStaffId?: string;
  };
  documents: {
    rateConfirmationDocumentId?: string;
    bolDocumentId?: string;
    podDocumentId?: string;
    rateConfirmationStatus: string;
  };
  publication: LoadBoardPublication | null;
  timeline: Load['timeline'];
  pendingCarrierOffers: number;
  pendingBoardOffers: number;
}

export interface ShipperLoadView {
  loadId: string;
  loadNumber: string;
  route: string;
  pickupDate: string;
  deliveryDate: string;
  equipmentType: string;
  status: string;
  shipperRateMinor: number | null;
  currency: string;
}

function resolveCarrierOfferMinor(loadId: string, store: DemoStore): number {
  const pending = store.carrierOffers.find(
    (o) => o.loadId === loadId && ['sent', 'viewed', 'draft'].includes(o.status),
  );
  return pending?.carrierPayMinor ?? 0;
}

/** Full internal workspace — AIO Office staff only. */
export function buildStaffLoadWorkspace(load: Load, store: DemoStore): StaffLoadWorkspace {
  const fin = getLoadFinancials(load.id, store);
  const shipperProfile = store.shipperProfiles.find((p) => p.organizationId === load.shipperOrganizationId);
  const carrierProfile = store.carrierNetworkProfiles.find(
    (p) => p.id === load.brokerageCarrierNetworkProfileId || p.organizationId === load.brokerageCarrierOrganizationId,
  );
  const pub = getPublication(load.id, store) ?? null;
  const carrierRate = fin ? resolveCarrierRateMinor(load, fin) : load.confirmedGrossMinor;
  const marginMinor = fin
    ? fin.confirmedShipperChargeMinor - carrierRate
    : 0;

  let pricing: StaffLoadPricingView | null = null;
  if (fin) {
    pricing = {
      shipperRateMinor: fin.confirmedShipperChargeMinor,
      carrierOfferMinor: resolveCarrierOfferMinor(load.id, store) || fin.totalCarrierPayMinor,
      finalCarrierRateMinor: carrierRate,
      aioGrossMarginMinor: marginMinor,
      aioGrossMarginPercent: computeGrossMarginPercent(fin.confirmedShipperChargeMinor, marginMinor),
      loadedRpmMinor: computeLoadedRpm(carrierRate, load.loadedMiles),
      trueRpmMinor: computeTrueRpm(carrierRate, load.deadheadMiles, load.loadedMiles),
      currency: fin.currency,
    };
  }

  return {
    loadId: load.id,
    loadNumber: load.loadNumber,
    lifecycleStatus: inferLifecycleFromLoad(load.brokerageCoverageStatus, load.operationalStatus),
    route: {
      originCity: load.originCity,
      originState: load.originState,
      destinationCity: load.destinationCity,
      destinationState: load.destinationState,
      pickupDate: load.pickupDate,
      deliveryDate: load.deliveryDate,
      loadedMiles: load.loadedMiles,
      deadheadMiles: load.deadheadMiles,
      equipmentType: load.equipmentType,
      weight: load.weight,
      commodity: load.commodity,
      operationalStatus: load.operationalStatus,
      coverageStatus: load.brokerageCoverageStatus,
    },
    shipper: shipperProfile
      ? {
          organizationId: shipperProfile.organizationId,
          legalName: shipperProfile.legalName,
          contactName: shipperProfile.primaryContactName,
          email: shipperProfile.primaryEmail,
          phone: shipperProfile.primaryPhone,
        }
      : load.shipperOrganizationId
        ? { organizationId: load.shipperOrganizationId }
        : null,
    pricing,
    carrier: carrierProfile
      ? {
          networkProfileId: carrierProfile.id,
          organizationId: carrierProfile.organizationId,
          legalName: carrierProfile.legalName,
          mcNumber: carrierProfile.mcNumber,
          usdot: carrierProfile.usdot,
          authorityVerification: carrierProfile.authorityVerification,
          insuranceVerification: carrierProfile.insuranceVerification,
        }
      : null,
    equipment: {
      powerUnitId: load.powerUnitId,
      trailerId: load.trailerId,
      primaryDriverId: load.primaryDriverId,
      assignedDispatcherStaffId: load.assignedDispatcherStaffId,
    },
    documents: {
      rateConfirmationDocumentId: load.rateConfirmationDocumentId,
      bolDocumentId: load.bolDocumentId,
      podDocumentId: load.podDocumentId,
      rateConfirmationStatus: load.rateConfirmationStatus,
    },
    publication: pub,
    timeline: load.timeline,
    pendingCarrierOffers: store.carrierOffers.filter(
      (o) => o.loadId === load.id && ['sent', 'viewed'].includes(o.status),
    ).length,
    pendingBoardOffers: (store.carrierLoadBoardOffers ?? []).filter(
      (o) => o.loadId === load.id && o.status === 'pending',
    ).length,
  };
}

/** Shipper sees only their contracted rate and shipment status. */
export function buildShipperLoadView(load: Load, store: DemoStore, shipperOrgId: string): ShipperLoadView | null {
  if (load.shipperOrganizationId !== shipperOrgId) return null;
  const fin = getLoadFinancials(load.id, store);
  return {
    loadId: load.id,
    loadNumber: load.loadNumber,
    route: `${load.originCity}, ${load.originState} → ${load.destinationCity}, ${load.destinationState}`,
    pickupDate: load.pickupDate,
    deliveryDate: load.deliveryDate,
    equipmentType: load.equipmentType,
    status: load.operationalStatus.replace(/_/g, ' '),
    shipperRateMinor: fin && canViewShipperCharge('shipper') ? fin.confirmedShipperChargeMinor : null,
    currency: load.currency,
  };
}

/** Carrier authorized view — delegates to carrier projection (never shipper rate / margin). */
export function buildCarrierFreightView(
  load: Load,
  store: DemoStore,
  carrierOrgId: string,
  pickupDeadheadMiles = 75,
): CarrierLoadBoardResult | null {
  const pub = getPublication(load.id, store);
  if (!pub || pub.visibility !== 'published') {
    const assigned = load.brokerageCarrierOrganizationId === carrierOrgId;
    if (!assigned) return null;
  }
  const fin = getLoadFinancials(load.id, store);
  if (!fin || !canViewCarrierPay('carrier')) return null;
  const publication = pub ?? {
    loadId: load.id,
    sourceType: 'aio_direct' as const,
    visibility: 'published' as const,
    bookingMode: 'request_only' as const,
    fullPartial: 'full' as const,
    createdAt: load.createdAt,
    updatedAt: load.updatedAt,
  };
  return projectCarrierLoadResult(load, publication, fin, { pickupDeadheadMiles });
}

/** Guard: strip internal fields from arbitrary payload by role. */
export function assertNoInternalFieldsForCarrier(payload: Record<string, unknown>): void {
  const forbidden = ['shipperRateMinor', 'shipper_rate', 'aioGrossMarginMinor', 'aio_margin', 'internalNotes', 'confirmedShipperChargeMinor'];
  for (const key of forbidden) {
    if (key in payload) {
      throw new Error(`Carrier view must not include internal field: ${key}`);
    }
  }
}

export function filterFinancialsByRole(
  fin: BrokerageLoadFinancials & { grossMarginMinor?: number },
  role: FreightViewerRole,
): Partial<BrokerageLoadFinancials & { grossMarginMinor?: number }> {
  const brokerRole = role === 'aio_staff' ? 'broker_ops' : role === 'shipper' ? 'shipper' : 'carrier';
  const out: Partial<BrokerageLoadFinancials & { grossMarginMinor?: number }> = { loadId: fin.loadId, currency: fin.currency };
  if (canViewShipperCharge(brokerRole)) {
    out.confirmedShipperChargeMinor = fin.confirmedShipperChargeMinor;
    out.shipperChargeMinor = fin.shipperChargeMinor;
  }
  if (canViewCarrierPay(brokerRole)) {
    out.confirmedCarrierPayMinor = fin.confirmedCarrierPayMinor;
    out.totalCarrierPayMinor = fin.totalCarrierPayMinor;
  }
  if (canViewGrossMargin(brokerRole) && fin.grossMarginMinor != null) {
    out.grossMarginMinor = fin.grossMarginMinor;
  }
  return out;
}
