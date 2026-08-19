import { loadDemoStore } from '../demo/demoStore';
import type { DemoStore } from '../demo/demoTypes';
import { getTruckProfiles } from '../demo/dispatchActions';
import { searchPublishedLoads } from './freightSearchService';
import {
  deleteSavedSearch as demoDeleteSavedSearch,
  getPublication as demoGetPublication,
  holdLoadOnBoard as demoHoldLoad,
  publishLoadToBoard as demoPublish,
  recordRecentSearch as demoRecordRecent,
  saveLoadSearch as demoSaveSearch,
  submitCarrierLoadBoardOffer as demoSubmitOffer,
} from './loadBoardActions';
import type {
  CarrierLoadBoardOffer,
  LoadBoardPublication,
  LoadBoardSearchFilters,
  LoadBoardSearchResponse,
  RecentLoadSearch,
  SavedLoadSearch,
} from './freightTypes';
import type { FreightRepository, FreightResult } from './freightRepositoryTypes';
import { evaluateSavedSearchAlertsDemo } from './freightSavedSearchAlerts';
import { buildLoadMapDataFromDemo } from './freightGeocoding';
import { setActiveLoadBoardFilters } from './loadBoardSessionFilters';

function ok<T>(data: T): FreightResult<T> {
  return { ok: true, data };
}

function fail(code: 'UNAVAILABLE' | 'QUERY_FAILED' | 'FORBIDDEN', message: string): FreightResult<never> {
  return { ok: false, error: { code, message } };
}

export class DemoFreightRepository implements FreightRepository {
  readonly mode = 'demo' as const;

  private store(): DemoStore {
    return loadDemoStore();
  }

  getDemoStoreSnapshot(): DemoStore | null {
    return this.store();
  }

  async searchPublishedLoads(
    carrierOrgId: string,
    filters: LoadBoardSearchFilters,
  ): Promise<FreightResult<LoadBoardSearchResponse>> {
    try {
      const data = searchPublishedLoads(this.store(), carrierOrgId, filters);
      return ok(data);
    } catch {
      return fail('QUERY_FAILED', 'Demo load search failed.');
    }
  }

  async getPublication(loadId: string): Promise<FreightResult<LoadBoardPublication | null>> {
    const pub = demoGetPublication(loadId, this.store());
    return ok(pub ?? null);
  }

  async publishLoad(loadId: string, staffId: string, partial?: Partial<LoadBoardPublication>): Promise<FreightResult<void>> {
    demoPublish(loadId, staffId, partial);
    return ok(undefined);
  }

  async holdLoad(loadId: string): Promise<FreightResult<void>> {
    demoHoldLoad(loadId);
    return ok(undefined);
  }

  async saveSearch(
    orgId: string,
    _userId: string,
    label: string,
    filters: LoadBoardSearchFilters,
    alertEnabled = false,
  ): Promise<FreightResult<SavedLoadSearch>> {
    return ok(demoSaveSearch(orgId, label, filters, alertEnabled));
  }

  async deleteSavedSearch(searchId: string): Promise<FreightResult<void>> {
    demoDeleteSavedSearch(searchId);
    return ok(undefined);
  }

  async listSavedSearches(orgId: string, _userId: string): Promise<FreightResult<SavedLoadSearch[]>> {
    const saved = (this.store().loadBoardSavedSearches ?? []).filter((s) => s.organizationId === orgId);
    return ok(saved);
  }

  async listRecentSearches(orgId: string, _userId: string): Promise<FreightResult<RecentLoadSearch[]>> {
    const recent = (this.store().loadBoardRecentSearches ?? []).filter((r) => r.organizationId === orgId);
    return ok(recent);
  }

  async recordRecentSearch(orgId: string, _userId: string, filters: LoadBoardSearchFilters): Promise<FreightResult<void>> {
    setActiveLoadBoardFilters(filters);
    demoRecordRecent(orgId, filters);
    return ok(undefined);
  }

  async submitCarrierOffer(
    loadId: string,
    carrierOrgId: string,
    offerAmountMinor: number,
    note?: string,
  ): Promise<FreightResult<CarrierLoadBoardOffer>> {
    const created = demoSubmitOffer(loadId, carrierOrgId, offerAmountMinor, note);
    if (!created) return fail('FORBIDDEN', 'This load is not accepting offers.');
    return ok(created);
  }

  async listCarrierOffers(carrierOrgId: string): Promise<FreightResult<CarrierLoadBoardOffer[]>> {
    const offers = (this.store().carrierLoadBoardOffers ?? []).filter((o) => o.carrierOrganizationId === carrierOrgId);
    return ok(offers);
  }

  async listPublishedLoadsForMap(carrierOrgId: string): Promise<FreightResult<LoadBoardSearchResponse>> {
    return this.searchPublishedLoads(carrierOrgId, { originDeadheadMiles: 500 });
  }

  async getLoadMapData(carrierOrgId: string, truckProfileId?: string) {
    const response = await this.searchPublishedLoads(carrierOrgId, { originDeadheadMiles: 500, truckProfileId });
    if (!response.ok) return response;
    const store = this.store();
    const trucks = getTruckProfiles(carrierOrgId, store);
    return ok(buildLoadMapDataFromDemo(response.data.results, trucks, truckProfileId));
  }

  async evaluateSavedSearchAlerts(loadId: string): Promise<FreightResult<number>> {
    const count = await evaluateSavedSearchAlertsDemo(loadId, this.store());
    return ok(count);
  }
}

export const demoFreightRepository = new DemoFreightRepository();
