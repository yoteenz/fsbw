import type { DemoStore } from '../demo/demoTypes';
import type {
  CarrierLoadBoardOffer,
  LoadBoardPublication,
  LoadBoardSearchFilters,
  LoadBoardSearchResponse,
  RecentLoadSearch,
  SavedLoadSearch,
} from './freightTypes';

export type FreightRepositoryMode = 'demo' | 'supabase';

export interface FreightRepositoryError {
  code: 'UNAVAILABLE' | 'QUERY_FAILED' | 'FORBIDDEN';
  message: string;
}

export type FreightResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: FreightRepositoryError };

export interface FreightRepository {
  readonly mode: FreightRepositoryMode;

  searchPublishedLoads(
    carrierOrgId: string,
    filters: LoadBoardSearchFilters,
  ): Promise<FreightResult<LoadBoardSearchResponse>>;

  getPublication(loadId: string): Promise<FreightResult<LoadBoardPublication | null>>;

  publishLoad(loadId: string, staffId: string, partial?: Partial<LoadBoardPublication>): Promise<FreightResult<void>>;
  holdLoad(loadId: string): Promise<FreightResult<void>>;

  saveSearch(
    orgId: string,
    userId: string,
    label: string,
    filters: LoadBoardSearchFilters,
    alertEnabled?: boolean,
  ): Promise<FreightResult<SavedLoadSearch>>;

  deleteSavedSearch(searchId: string): Promise<FreightResult<void>>;

  listSavedSearches(orgId: string, userId: string): Promise<FreightResult<SavedLoadSearch[]>>;
  listRecentSearches(orgId: string, userId: string): Promise<FreightResult<RecentLoadSearch[]>>;

  recordRecentSearch(orgId: string, userId: string, filters: LoadBoardSearchFilters): Promise<FreightResult<void>>;

  submitCarrierOffer(
    loadId: string,
    carrierOrgId: string,
    offerAmountMinor: number,
    note?: string,
  ): Promise<FreightResult<CarrierLoadBoardOffer>>;

  listCarrierOffers(carrierOrgId: string): Promise<FreightResult<CarrierLoadBoardOffer[]>>;

  listPublishedLoadsForMap(carrierOrgId: string): Promise<FreightResult<LoadBoardSearchResponse>>;

  getLoadMapData?(
    carrierOrgId: string,
    truckProfileId?: string,
  ): Promise<FreightResult<LoadMapData>>;

  getDemoStoreSnapshot?(): DemoStore | null;

  evaluateSavedSearchAlerts?(loadId: string): Promise<FreightResult<number>>;
}

export interface MapLoadMarker {
  loadId: string;
  loadNumber: string;
  lat: number;
  lng: number;
  kind: 'pickup' | 'delivery';
  city: string;
  state: string;
}

export interface TruckLocationMarker {
  truckId: string;
  nickname: string;
  lat: number;
  lng: number;
  label: 'LAST KNOWN LOCATION';
  updatedAt?: string;
}

export interface LoadMapData {
  loads: MapLoadMarker[];
  trucks: TruckLocationMarker[];
}
