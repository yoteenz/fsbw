/**
 * AIO freight / load board domain extensions.
 * Canonical load remains `Load` in dispatchTypes — these types wrap publication, search, and lifecycle.
 */

import type { CurrencyCode } from '../billing/money';

/** AIO-owned freight sources — provider adapter keys (no external DAT/Truckstop in this sprint). */
export type AioFreightSourceType =
  | 'aio_direct'
  | 'aio_shipper_freight'
  | 'aio_contract_freight'
  | 'aio_private_freight';

export type LoadBoardVisibility = 'draft' | 'hold' | 'private' | 'published';

export type LoadBoardBookingMode = 'request_only' | 'submit_offer' | 'instant_book' | 'private_invite';

export type LoadFullPartial = 'full' | 'partial';

/** Extended publication metadata — sidecar on demo store keyed by loadId. */
export interface LoadBoardPublication {
  loadId: string;
  sourceType: AioFreightSourceType;
  visibility: LoadBoardVisibility;
  bookingMode: LoadBoardBookingMode;
  publishedAt?: string;
  publishedByStaffId?: string;
  trailerLengthFt?: number;
  fullPartial: LoadFullPartial;
  maxWeightLbs?: number;
  dropAndHook?: boolean;
  liveLoad?: boolean;
  driverAssist?: boolean;
  noTouch?: boolean;
  hazmat?: boolean;
  teamRequired?: boolean;
  powerOnly?: boolean;
  multiStop?: boolean;
  roundTrip?: boolean;
  backhaul?: boolean;
  homeTimeCompatible?: boolean;
  invitedCarrierOrganizationIds?: string[];
  duplicateCheckKey?: string;
  createdAt: string;
  updatedAt: string;
}

export type AioFreightLifecycleStatus =
  | 'draft'
  | 'quoted'
  | 'shipper_accepted'
  | 'available'
  | 'offer_received'
  | 'carrier_selected'
  | 'booked'
  | 'assigned'
  | 'en_route_to_pickup'
  | 'at_pickup'
  | 'loaded'
  | 'in_transit'
  | 'at_delivery'
  | 'delivered'
  | 'pod_received'
  | 'invoiced'
  | 'payment_pending'
  | 'paid'
  | 'closed'
  | 'cancelled';

export interface LoadBoardSearchFilters {
  originCity?: string;
  originState?: string;
  destinationCity?: string;
  destinationState?: string;
  originDeadheadMiles?: number;
  destinationDeadheadMiles?: number;
  equipmentType?: string;
  trailerLengthFt?: number;
  maxWeightLbs?: number;
  fullPartial?: LoadFullPartial;
  pickupOnOrAfter?: string;
  deliveryOnOrBefore?: string;
  maxPostAgeHours?: number;
  minCarrierRateMinor?: number;
  minLoadedRpmMinor?: number;
  minTrueRpmMinor?: number;
  truckProfileId?: string;
}

export interface SavedLoadSearch {
  id: string;
  organizationId: string;
  label: string;
  filters: LoadBoardSearchFilters;
  alertEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RecentLoadSearch {
  id: string;
  organizationId: string;
  filters: LoadBoardSearchFilters;
  searchedAt: string;
}

export type CarrierLoadBoardOfferStatus = 'pending' | 'accepted' | 'countered' | 'declined' | 'withdrawn' | 'expired';

export interface CarrierLoadBoardOffer {
  id: string;
  loadId: string;
  carrierOrganizationId: string;
  offerAmountMinor: number;
  currency: CurrencyCode;
  note?: string;
  expiresAt?: string;
  status: CarrierLoadBoardOfferStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CarrierLoadBoardResult {
  loadId: string;
  loadNumber: string;
  originCity: string;
  originState: string;
  destinationCity: string;
  destinationState: string;
  pickupDate: string;
  pickupTimeStart?: string;
  pickupTimeEnd?: string;
  deliveryDate: string;
  deliveryTimeStart?: string;
  deliveryTimeEnd?: string;
  equipmentType: string;
  trailerLengthFt?: number;
  weight?: string;
  fullPartial: LoadFullPartial;
  commodity?: string;
  carrierRateMinor: number;
  currency: CurrencyCode;
  loadedMiles: number;
  pickupDeadheadMiles: number;
  loadedRpmMinor: number;
  trueImmediateMiles: number;
  trueRpmMinor: number;
  postingAgeHours: number | null;
  bookingMode: LoadBoardBookingMode;
  matchScore: LoadMatchScore | null;
  profitEstimate: CarrierProfitEstimate | null;
  maintenanceWarning: MaintenanceAttention | null;
  publishedAt?: string;
}

export type LoadMatchScoreBand = 'excellent' | 'strong' | 'good' | 'fair' | 'low' | 'insufficient_data';

export interface LoadMatchScore {
  score: number;
  band: LoadMatchScoreBand;
  label: string;
  reasons: string[];
}

export interface CarrierProfitEstimate {
  estimatedFuelMinor: number;
  estimatedOperatingCostMinor: number;
  estimatedProfitMinor: number;
  estimatedProfitPerMileMinor: number;
  isEstimate: true;
  assumptionsNote: string;
}

export interface MaintenanceAttention {
  truckNickname: string;
  serviceDueInMiles?: number;
  message: string;
}

export type LoadBoardSortField = 'match_score' | 'carrier_rate' | 'true_rpm' | 'pickup_date' | 'posting_age';

export interface LoadBoardSearchRequest {
  organizationId: string;
  filters: LoadBoardSearchFilters;
  sortBy?: LoadBoardSortField;
  sortDesc?: boolean;
}

export interface LoadBoardSearchResponse {
  results: CarrierLoadBoardResult[];
  totalCount: number;
  appliedFilters: LoadBoardSearchFilters;
}
