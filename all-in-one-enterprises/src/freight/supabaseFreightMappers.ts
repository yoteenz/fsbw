import type { Load } from '../dispatch/dispatchTypes';
import type { BrokerageLoadFinancials } from '../brokerage/brokerageTypes';
import type {
  CarrierLoadBoardOffer,
  CarrierLoadBoardResult,
  LoadBoardPublication,
  LoadBoardSearchFilters,
  RecentLoadSearch,
  SavedLoadSearch,
} from './freightTypes';
import { projectCarrierLoadResult } from './carrierLoadProjection';
import type { TruckDispatchProfile } from '../dispatch/dispatchTypes';

export interface CarrierLoadRow {
  load_id: string;
  load_number: string;
  origin_city: string | null;
  origin_state: string | null;
  destination_city: string | null;
  destination_state: string | null;
  origin_lat: number | null;
  origin_lng: number | null;
  destination_lat: number | null;
  destination_lng: number | null;
  pickup_date: string | null;
  delivery_date: string | null;
  equipment_type: string | null;
  loaded_miles: number | null;
  deadhead_miles: number | null;
  currency: string | null;
  carrier_rate_minor: number | null;
  publication_status: string | null;
  trailer_length_ft: number | null;
  full_partial: string | null;
  instant_book_enabled: boolean | null;
  offer_enabled: boolean | null;
  published_at: string | null;
  post_expires_at: string | null;
}

export function mapRowToLoad(row: CarrierLoadRow): Load {
  const now = new Date().toISOString();
  return {
    id: row.load_id,
    loadNumber: row.load_number,
    organizationId: '',
    sourceType: 'brokerage',
    operationalStatus: 'opportunity',
    brokerageCoverageStatus: 'needs_coverage',
    brokerName: 'AIO Brokerage',
    originCity: row.origin_city ?? '',
    originState: row.origin_state ?? '',
    destinationCity: row.destination_city ?? '',
    destinationState: row.destination_state ?? '',
    pickupDate: row.pickup_date ?? now.slice(0, 10),
    deliveryDate: row.delivery_date ?? row.pickup_date ?? now.slice(0, 10),
    equipmentType: row.equipment_type ?? 'Dry Van',
    loadedMiles: row.loaded_miles ?? 0,
    deadheadMiles: row.deadhead_miles ?? 0,
    currency: (row.currency ?? 'USD') as Load['currency'],
    grossMinor: row.carrier_rate_minor ?? 0,
    linehaulMinor: row.carrier_rate_minor ?? 0,
    fuelSurchargeMinor: 0,
    accessorialMinor: 0,
    createdAt: now,
    updatedAt: now,
  } as Load;
}

export function mapRowToPublication(row: CarrierLoadRow): LoadBoardPublication {
  const now = new Date().toISOString();
  return {
    loadId: row.load_id,
    sourceType: 'aio_shipper_freight',
    visibility: row.publication_status === 'published' ? 'published' : 'draft',
    bookingMode: row.instant_book_enabled ? 'instant_book' : row.offer_enabled === false ? 'request_only' : 'submit_offer',
    publishedAt: row.published_at ?? undefined,
    trailerLengthFt: row.trailer_length_ft ?? undefined,
    fullPartial: (row.full_partial as LoadBoardPublication['fullPartial']) ?? 'full',
    createdAt: now,
    updatedAt: now,
  };
}

export function mapRowToFinancials(row: CarrierLoadRow): BrokerageLoadFinancials {
  const rate = row.carrier_rate_minor ?? 0;
  return {
    loadId: row.load_id,
    shipperChargeMinor: 0,
    carrierLinehaulMinor: rate,
    carrierFuelSurchargeMinor: 0,
    carrierAccessorialMinor: 0,
    totalCarrierPayMinor: rate,
    confirmedShipperChargeMinor: 0,
    confirmedCarrierPayMinor: rate,
    currency: (row.currency ?? 'USD') as BrokerageLoadFinancials['currency'],
    version: 1,
    updatedAt: new Date().toISOString(),
  };
}

export function mapCarrierRowToResult(
  row: CarrierLoadRow,
  filters: LoadBoardSearchFilters,
  truck?: TruckDispatchProfile,
): CarrierLoadBoardResult {
  const load = mapRowToLoad(row);
  const pub = mapRowToPublication(row);
  const fin = mapRowToFinancials(row);
  return projectCarrierLoadResult(load, pub, fin, {
    pickupDeadheadMiles: filters.originDeadheadMiles ?? 75,
    truck,
  });
}

export function mapSavedSearchRow(row: {
  id: string;
  organization_id: string;
  name: string;
  filters_json: LoadBoardSearchFilters;
  alerts_enabled: boolean;
  created_at: string;
  updated_at: string;
}): SavedLoadSearch {
  return {
    id: row.id,
    organizationId: row.organization_id,
    label: row.name,
    filters: row.filters_json ?? {},
    alertEnabled: row.alerts_enabled,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapRecentSearchRow(row: {
  id: string;
  organization_id: string;
  filters_json: LoadBoardSearchFilters;
  searched_at: string;
}): RecentLoadSearch {
  return {
    id: row.id,
    organizationId: row.organization_id,
    filters: row.filters_json ?? {},
    searchedAt: row.searched_at,
  };
}

export function mapOfferRow(row: {
  id: string;
  load_id: string;
  carrier_organization_id: string;
  offer_amount_minor: number;
  currency: string;
  message: string | null;
  status: string;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}): CarrierLoadBoardOffer {
  return {
    id: row.id,
    loadId: row.load_id,
    carrierOrganizationId: row.carrier_organization_id,
    offerAmountMinor: row.offer_amount_minor,
    currency: row.currency as CarrierLoadBoardOffer['currency'],
    note: row.message ?? undefined,
    expiresAt: row.expires_at ?? undefined,
    status: row.status as CarrierLoadBoardOffer['status'],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
