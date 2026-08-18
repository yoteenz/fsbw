import type { Load } from '../dispatch/dispatchTypes';
import type { BrokerageLoadFinancials } from '../brokerage/brokerageTypes';
import type {
  CarrierLoadBoardResult,
  CarrierProfitEstimate,
  LoadBoardPublication,
  LoadBoardSearchFilters,
} from './freightTypes';
import type { TruckDispatchProfile } from '../dispatch/dispatchTypes';
import {
  computeLoadedRpm,
  computePostingAgeHours,
  computeTrueImmediateMiles,
  computeTrueRpm,
  estimateFuelCostMinor,
  estimateOperatingCostMinor,
} from './freightCalculations';
import { computeLoadMatchScore } from './loadScoreEngine';

/** Resolve carrier-facing rate — NEVER shipper charge or margin. */
export function resolveCarrierRateMinor(
  load: Load,
  financials?: BrokerageLoadFinancials | null,
): number {
  if (financials?.confirmedCarrierPayMinor != null && financials.confirmedCarrierPayMinor > 0) {
    return financials.confirmedCarrierPayMinor;
  }
  if (financials?.totalCarrierPayMinor != null && financials.totalCarrierPayMinor > 0) {
    return financials.totalCarrierPayMinor;
  }
  return load.confirmedGrossMinor ?? load.grossMinor ?? load.linehaulMinor;
}

export function projectCarrierLoadResult(
  load: Load,
  publication: LoadBoardPublication,
  financials: BrokerageLoadFinancials | null | undefined,
  options: {
    pickupDeadheadMiles?: number;
    truck?: TruckDispatchProfile;
    minPreferredRpmMinor?: number;
  } = {},
): CarrierLoadBoardResult {
  const carrierRateMinor = resolveCarrierRateMinor(load, financials);
  const pickupDeadhead = options.pickupDeadheadMiles ?? load.deadheadMiles ?? 0;
  const trueImmediateMiles = computeTrueImmediateMiles(pickupDeadhead, load.loadedMiles);
  const loadedRpmMinor = computeLoadedRpm(carrierRateMinor, load.loadedMiles);
  const trueRpmMinor = computeTrueRpm(carrierRateMinor, pickupDeadhead, load.loadedMiles);

  const matchScore = computeLoadMatchScore(load, {
    publication,
    carrierRateMinor,
    pickupDeadheadMiles: pickupDeadhead,
    truck: options.truck,
    preferences: { minPreferredRpmMinor: options.minPreferredRpmMinor },
  });

  let profitEstimate: CarrierProfitEstimate | null = null;
  if (trueImmediateMiles > 0 && carrierRateMinor > 0) {
    const fuel = estimateFuelCostMinor(trueImmediateMiles);
    const operating = estimateOperatingCostMinor(trueImmediateMiles, fuel, 55, 0, 0, carrierRateMinor);
    const profit = carrierRateMinor - operating;
    profitEstimate = {
      estimatedFuelMinor: fuel,
      estimatedOperatingCostMinor: operating,
      estimatedProfitMinor: profit,
      estimatedProfitPerMileMinor: Math.round(profit / trueImmediateMiles),
      isEstimate: true,
      assumptionsNote: 'ESTIMATE — uses default MPG/fuel/driver assumptions; not accounting truth.',
    };
  }

  return {
    loadId: load.id,
    loadNumber: load.loadNumber,
    originCity: load.originCity,
    originState: load.originState,
    destinationCity: load.destinationCity,
    destinationState: load.destinationState,
    pickupDate: load.pickupDate,
    pickupTimeStart: load.pickupTimeStart,
    pickupTimeEnd: load.pickupTimeEnd,
    deliveryDate: load.deliveryDate,
    deliveryTimeStart: load.deliveryTimeStart,
    deliveryTimeEnd: load.deliveryTimeEnd,
    equipmentType: load.equipmentType,
    trailerLengthFt: publication.trailerLengthFt,
    weight: load.weight,
    fullPartial: publication.fullPartial,
    commodity: load.commodity,
    carrierRateMinor,
    currency: load.currency,
    loadedMiles: load.loadedMiles,
    pickupDeadheadMiles: pickupDeadhead,
    loadedRpmMinor,
    trueImmediateMiles,
    trueRpmMinor,
    postingAgeHours: computePostingAgeHours(publication.publishedAt),
    bookingMode: publication.bookingMode,
    matchScore,
    profitEstimate,
    maintenanceWarning: null,
    publishedAt: publication.publishedAt,
  };
}

/** Strip internal fields from load for carrier API — explicit deny list. */
export function stripInternalLoadFields<T extends Record<string, unknown>>(payload: T): Omit<T,
  'internalNotes' | 'shipperOrganizationId' | 'assignedBrokerStaffId'
> {
  const { internalNotes: _a, shipperOrganizationId: _b, assignedBrokerStaffId: _c, ...safe } = payload as T & {
    internalNotes?: unknown;
    shipperOrganizationId?: unknown;
    assignedBrokerStaffId?: unknown;
  };
  return safe;
}

export function matchesLoadBoardFilters(result: CarrierLoadBoardResult, filters: LoadBoardSearchFilters): boolean {
  const norm = (s?: string) => (s ?? '').trim().toLowerCase();
  if (filters.originCity && norm(result.originCity) !== norm(filters.originCity)) return false;
  if (filters.originState && norm(result.originState) !== norm(filters.originState)) return false;
  if (filters.destinationCity && norm(result.destinationCity) !== norm(filters.destinationCity)) return false;
  if (filters.destinationState && norm(result.destinationState) !== norm(filters.destinationState)) return false;
  if (filters.equipmentType && !result.equipmentType.toLowerCase().includes(filters.equipmentType.toLowerCase())) return false;
  if (filters.trailerLengthFt && result.trailerLengthFt && result.trailerLengthFt < filters.trailerLengthFt) return false;
  if (filters.fullPartial && result.fullPartial !== filters.fullPartial) return false;
  if (filters.minCarrierRateMinor && result.carrierRateMinor < filters.minCarrierRateMinor) return false;
  if (filters.minLoadedRpmMinor && result.loadedRpmMinor < filters.minLoadedRpmMinor) return false;
  if (filters.minTrueRpmMinor && result.trueRpmMinor < filters.minTrueRpmMinor) return false;
  if (filters.originDeadheadMiles != null && result.pickupDeadheadMiles > filters.originDeadheadMiles) return false;
  if (filters.maxPostAgeHours != null && result.postingAgeHours != null && result.postingAgeHours > filters.maxPostAgeHours) return false;
  if (filters.pickupOnOrAfter && result.pickupDate < filters.pickupOnOrAfter) return false;
  if (filters.deliveryOnOrBefore && result.deliveryDate > filters.deliveryOnOrBefore) return false;
  return true;
}
