import { updateDemoStore } from '../demo/demoStore';
import type { DemoStore } from '../demo/demoTypes';
import { isoNow } from '../demo/dateHelpers';
import type {
  CarrierLoadBoardOffer,
  LoadBoardPublication,
  LoadBoardSearchFilters,
  RecentLoadSearch,
  SavedLoadSearch,
} from './freightTypes';
import { searchPublishedLoads } from './freightSearchService';

export function getPublication(loadId: string, store: { loadBoardPublications?: LoadBoardPublication[] }): LoadBoardPublication | undefined {
  return store.loadBoardPublications?.find((p) => p.loadId === loadId);
}

export function publishLoadToBoard(
  loadId: string,
  staffId: string,
  partial: Partial<LoadBoardPublication> = {},
): void {
  updateDemoStore((s: DemoStore) => {
    const load = s.loads.find((l) => l.id === loadId && l.sourceType === 'brokerage');
    if (!load) return s;
    const now = isoNow();
    const existing = s.loadBoardPublications?.find((p) => p.loadId === loadId);
    const pub: LoadBoardPublication = {
      loadId,
      sourceType: partial.sourceType ?? 'aio_shipper_freight',
      bookingMode: partial.bookingMode ?? 'submit_offer',
      publishedAt: now,
      publishedByStaffId: staffId,
      trailerLengthFt: partial.trailerLengthFt ?? 53,
      fullPartial: partial.fullPartial ?? 'full',
      maxWeightLbs: partial.maxWeightLbs,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      ...partial,
      visibility: 'published',
    };
    const pubs = (s.loadBoardPublications ?? []).filter((p) => p.loadId !== loadId);
    if (load.brokerageCoverageStatus === 'needs_coverage' || !load.brokerageCoverageStatus) {
      load.brokerageCoverageStatus = 'needs_coverage';
    }
    return { ...s, loadBoardPublications: [...pubs, pub] };
  });
}

export function holdLoadOnBoard(loadId: string): void {
  updateDemoStore((s: DemoStore) => ({
    ...s,
    loadBoardPublications: (s.loadBoardPublications ?? []).map((p) =>
      p.loadId === loadId ? { ...p, visibility: 'hold' as const, updatedAt: isoNow() } : p,
    ),
  }));
}

export function saveLoadSearch(orgId: string, label: string, filters: LoadBoardSearchFilters, alertEnabled = false): SavedLoadSearch {
  const now = isoNow();
  const entry: SavedLoadSearch = {
    id: `saved-search-${Date.now()}`,
    organizationId: orgId,
    label,
    filters,
    alertEnabled,
    createdAt: now,
    updatedAt: now,
  };
  updateDemoStore((s: DemoStore) => ({
    ...s,
    loadBoardSavedSearches: [...(s.loadBoardSavedSearches ?? []), entry],
  }));
  return entry;
}

export function deleteSavedSearch(searchId: string): void {
  updateDemoStore((s: DemoStore) => ({
    ...s,
    loadBoardSavedSearches: (s.loadBoardSavedSearches ?? []).filter((x) => x.id !== searchId),
  }));
}

export function recordRecentSearch(orgId: string, filters: LoadBoardSearchFilters): void {
  const entry: RecentLoadSearch = {
    id: `recent-${Date.now()}`,
    organizationId: orgId,
    filters,
    searchedAt: isoNow(),
  };
  updateDemoStore((s: DemoStore) => {
    const prev = (s.loadBoardRecentSearches ?? []).filter((r) => r.organizationId === orgId);
    return {
      ...s,
      loadBoardRecentSearches: [entry, ...prev].slice(0, 10),
    };
  });
}

export function submitCarrierLoadBoardOffer(
  loadId: string,
  carrierOrgId: string,
  offerAmountMinor: number,
  note?: string,
): CarrierLoadBoardOffer | null {
  let created: CarrierLoadBoardOffer | null = null;
  updateDemoStore((s: DemoStore) => {
    const pub = s.loadBoardPublications?.find((p) => p.loadId === loadId && p.visibility === 'published');
    if (!pub || pub.bookingMode === 'request_only') return s;
    const now = isoNow();
    created = {
      id: `lb-offer-${Date.now()}`,
      loadId,
      carrierOrganizationId: carrierOrgId,
      offerAmountMinor,
      currency: 'USD',
      note,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };
    const load = s.loads.find((l) => l.id === loadId);
    if (load?.brokerageCoverageStatus === 'needs_coverage') {
      load.brokerageCoverageStatus = 'rate_negotiation';
    }
    return {
      ...s,
      carrierLoadBoardOffers: [...(s.carrierLoadBoardOffers ?? []), created],
    };
  });
  return created;
}

export function runLoadBoardSearch(
  orgId: string,
  filters: LoadBoardSearchFilters,
  store: Parameters<typeof searchPublishedLoads>[0],
) {
  recordRecentSearch(orgId, filters);
  return searchPublishedLoads(store, orgId, filters);
}
