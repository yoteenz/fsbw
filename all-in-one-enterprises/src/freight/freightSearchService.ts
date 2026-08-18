import type { DemoStore } from '../demo/demoTypes';
import type { TruckDispatchProfile } from '../dispatch/dispatchTypes';
import { getLoadFinancials } from '../demo/brokerageActions';
import type {
  LoadBoardSearchFilters,
  LoadBoardSearchResponse,
  LoadBoardSortField,
  LoadBoardPublication,
} from './freightTypes';
import { matchesLoadBoardFilters, projectCarrierLoadResult, resolveCarrierRateMinor } from './carrierLoadProjection';

const AVAILABLE_COVERAGE = new Set(['needs_coverage', 'carrier_contacted', 'rate_negotiation']);

function isPublishedForCarrier(pub: LoadBoardPublication, carrierOrgId: string): boolean {
  if (pub.visibility !== 'published') return false;
  if (pub.bookingMode === 'private_invite') {
    return pub.invitedCarrierOrganizationIds?.includes(carrierOrgId) ?? false;
  }
  return true;
}

function resolveTruck(store: DemoStore, orgId: string, truckId?: string): TruckDispatchProfile | undefined {
  if (!truckId) return undefined;
  return store.truckProfiles.find((t) => t.organizationId === orgId && t.id === truckId);
}

export function searchPublishedLoads(
  store: DemoStore,
  carrierOrgId: string,
  filters: LoadBoardSearchFilters,
  sortBy: LoadBoardSortField = 'match_score',
  sortDesc = true,
): LoadBoardSearchResponse {
  const publications = store.loadBoardPublications ?? [];
  const pickupDeadhead = filters.originDeadheadMiles ?? 75;

  const results = store.loads
    .filter((l) => l.sourceType === 'brokerage')
    .filter((l) => l.brokerageCoverageStatus && AVAILABLE_COVERAGE.has(l.brokerageCoverageStatus))
    .map((load) => {
      const pub = publications.find((p) => p.loadId === load.id);
      if (!pub || !isPublishedForCarrier(pub, carrierOrgId)) return null;
      const fin = getLoadFinancials(load.id, store);
      const truck = resolveTruck(store, carrierOrgId, filters.truckProfileId);
      return projectCarrierLoadResult(load, pub, fin, {
        pickupDeadheadMiles: pickupDeadhead,
        truck,
      });
    })
    .filter((r): r is NonNullable<typeof r> => r != null)
    .filter((r) => matchesLoadBoardFilters(r, filters));

  const sorted = [...results].sort((a, b) => {
    let cmp = 0;
    switch (sortBy) {
      case 'carrier_rate':
        cmp = a.carrierRateMinor - b.carrierRateMinor;
        break;
      case 'true_rpm':
        cmp = a.trueRpmMinor - b.trueRpmMinor;
        break;
      case 'pickup_date':
        cmp = a.pickupDate.localeCompare(b.pickupDate);
        break;
      case 'posting_age':
        cmp = (a.postingAgeHours ?? 9999) - (b.postingAgeHours ?? 9999);
        break;
      case 'match_score':
      default:
        cmp = (a.matchScore?.score ?? 0) - (b.matchScore?.score ?? 0);
        break;
    }
    return sortDesc ? -cmp : cmp;
  });

  return { results: sorted, totalCount: sorted.length, appliedFilters: filters };
}

/** Internal staff view — includes margin (never expose to carrier routes). */
export function getInternalLoadEconomics(loadId: string, store: DemoStore) {
  const load = store.loads.find((l) => l.id === loadId);
  if (!load) return null;
  const fin = getLoadFinancials(loadId, store);
  if (!fin) return null;
  const carrierRate = resolveCarrierRateMinor(load, fin);
  const margin = fin.confirmedShipperChargeMinor - carrierRate;
  const marginPct = fin.confirmedShipperChargeMinor > 0 ? (margin / fin.confirmedShipperChargeMinor) * 100 : null;
  return {
    shipperRateMinor: fin.confirmedShipperChargeMinor,
    carrierRateMinor: carrierRate,
    aioGrossMarginMinor: margin,
    aioGrossMarginPercent: marginPct,
  };
}
