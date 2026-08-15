import type { CurrencyCode } from '../billing/money';

export type DispatchEnrollmentStatus =
  | 'interested'
  | 'onboarding'
  | 'active'
  | 'paused'
  | 'suspended'
  | 'ended';

export type DispatchAgreementStatus =
  | 'not_required'
  | 'pending'
  | 'sent'
  | 'accepted'
  | 'expired'
  | 'terminated';

export type TruckAvailabilityStatus =
  | 'available'
  | 'available_soon'
  | 'booked'
  | 'in_transit'
  | 'unavailable'
  | 'maintenance'
  | 'home_time'
  | 'paused';

export type LoadSourceType = 'manual' | 'carrier_provided' | 'broker_email_future' | 'load_board_future' | 'brokerage_future';

export type LoadOfferStatus =
  | 'draft'
  | 'awaiting_carrier'
  | 'accepted'
  | 'declined'
  | 'expired'
  | 'withdrawn';

export type LoadOperationalStatus =
  | 'opportunity'
  | 'booking_in_progress'
  | 'booked'
  | 'dispatched'
  | 'en_route_pickup'
  | 'at_pickup'
  | 'loaded'
  | 'in_transit'
  | 'at_delivery'
  | 'delivered'
  | 'pod_needed'
  | 'complete'
  | 'cancelled'
  | 'issue';

export type RateConfirmationStatus = 'missing' | 'requested' | 'uploaded' | 'under_review' | 'verified' | 'details_reviewed';

export type LoadDocumentKind = 'rate_confirmation' | 'bol' | 'pod' | 'other';

export type AccessorialType = 'detention' | 'layover' | 'tonu' | 'lumper' | 'other';

export type AccessorialStatus = 'reported' | 'requested' | 'approved' | 'denied' | 'paid_future';

export type FactoringHandoffStatus = 'not_ready' | 'ready' | 'submitted_future' | 'not_factored';

export type DispatchBillingMode = 'percentage' | 'flat_per_load' | 'weekly' | 'monthly' | 'custom';

export type LoadDeclineReason =
  | 'rate_too_low'
  | 'too_much_deadhead'
  | 'destination'
  | 'schedule'
  | 'home_time'
  | 'equipment_issue'
  | 'other';

export type LoadIssueType =
  | 'pickup_delay'
  | 'delivery_delay'
  | 'detention'
  | 'breakdown'
  | 'broker_issue'
  | 'rate_dispute'
  | 'document_issue'
  | 'cargo_issue'
  | 'other';

export type LoadIssueStatus = 'open' | 'monitoring' | 'resolved';

export type LoadTimelineActor = 'driver' | 'dispatcher' | 'carrier_admin' | 'system';

export interface DispatchOperatingPreferences {
  preferredFreightTypes?: string[];
  preferredRegions?: string[];
  preferredStates?: string[];
  avoidedStates?: string[];
  preferredHomeTime?: string;
  typicalAvailableDays?: string[];
  minTripDistanceMiles?: number;
  maxTripDistanceMiles?: number;
  minPreferredGrossMinor?: number;
  minPreferredRpmMinor?: number;
  minPreferredDailyRevenueMinor?: number;
  trailerType?: string;
  equipmentCapabilities?: string[];
  hazmatSelfReported?: boolean;
  teamOrSolo?: 'team' | 'solo' | 'either';
  driverContactPreference?: string;
  specialRestrictions?: string;
  notes?: string;
  homeCity?: string;
  homeState?: string;
}

export interface DispatchEnrollment {
  id: string;
  organizationId: string;
  status: DispatchEnrollmentStatus;
  agreementStatus: DispatchAgreementStatus;
  serviceRequestId?: string;
  primaryDispatcherStaffId?: string;
  backupDispatcherStaffId?: string;
  preferences?: DispatchOperatingPreferences;
  onboardingComplete: boolean;
  activatedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TruckDispatchProfile {
  id: string;
  organizationId: string;
  powerUnitId: string;
  nickname: string;
  availability: TruckAvailabilityStatus;
  nextAvailableDate?: string;
  nextAvailableCity?: string;
  nextAvailableState?: string;
  primaryDriverId?: string;
  trailerId?: string;
  trailerType?: string;
  currentLoadId?: string;
  updatedAt: string;
}

export interface LoadRateRevision {
  id: string;
  loadId: string;
  previousGrossMinor: number;
  newGrossMinor: number;
  reason?: string;
  revisedByStaffId?: string;
  carrierAcknowledged?: boolean;
  createdAt: string;
}

export interface LoadAccessorial {
  id: string;
  loadId: string;
  type: AccessorialType;
  amountMinor: number;
  status: AccessorialStatus;
  notes?: string;
  reportedBy?: LoadTimelineActor;
  createdAt: string;
}

export interface LoadIssue {
  id: string;
  loadId: string;
  organizationId: string;
  type: LoadIssueType;
  status: LoadIssueStatus;
  summary: string;
  notes?: string;
  createdByStaffId?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface LoadTimelineEvent {
  id: string;
  loadId: string;
  label: string;
  operationalStatus?: LoadOperationalStatus;
  actor?: LoadTimelineActor;
  actorLabel?: string;
  note?: string;
  createdAt: string;
  visibility: 'customer' | 'internal';
}

export interface BrokerContact {
  id: string;
  companyName: string;
  contactName?: string;
  phone?: string;
  email?: string;
  mcNumber?: string;
  notes?: string;
  preferredContactMethod?: 'phone' | 'email';
  status: 'active' | 'preferred' | 'review' | 'do_not_use';
  createdAt: string;
}

export interface DispatchBillingConfig {
  organizationId: string;
  billingMode: DispatchBillingMode;
  /** Percentage in basis points e.g. 800 = 8% */
  billingRateBasisPoints?: number;
  flatPerLoadMinor?: number;
  commissionableComponents: ('linehaul' | 'fuel_surcharge' | 'accessorial')[];
  active: boolean;
}

export interface DispatchBillingEvent {
  id: string;
  organizationId: string;
  loadId: string;
  loadGrossMinor: number;
  dispatchFeeMinor: number;
  currency: CurrencyCode;
  billingMode: DispatchBillingMode;
  invoiced: boolean;
  createdAt: string;
}

/** Canonical load — shared domain for dispatch, future brokerage/factoring */
export interface Load {
  id: string;
  loadNumber: string;
  organizationId: string;
  dispatchEnrollmentId?: string;
  powerUnitId?: string;
  trailerId?: string;
  primaryDriverId?: string;
  assignedDispatcherStaffId?: string;

  sourceType: LoadSourceType;
  sourceReference?: string;

  brokerContactId?: string;
  brokerName: string;
  brokerContactName?: string;
  brokerPhone?: string;
  brokerEmail?: string;

  commodity?: string;
  weight?: string;
  equipmentType: string;

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

  loadedMiles: number;
  deadheadMiles: number;

  linehaulMinor: number;
  fuelSurchargeMinor: number;
  accessorialMinor: number;
  grossMinor: number;
  confirmedGrossMinor: number;

  currency: CurrencyCode;

  offerStatus: LoadOfferStatus;
  operationalStatus: LoadOperationalStatus;

  rateConfirmationStatus: RateConfirmationStatus;
  rateConfirmationDocumentId?: string;
  bolDocumentId?: string;
  podDocumentId?: string;
  rateDetailsReviewed: boolean;

  declineReason?: LoadDeclineReason;
  declineNotes?: string;

  factoringHandoffStatus: FactoringHandoffStatus;
  factoringNotFactoredReason?: string;

  customerNotes?: string;
  internalNotes?: string;

  accessorials: LoadAccessorial[];
  rateRevisions: LoadRateRevision[];
  timeline: LoadTimelineEvent[];

  createdByStaffId?: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface DispatchCounters {
  load: number;
}
